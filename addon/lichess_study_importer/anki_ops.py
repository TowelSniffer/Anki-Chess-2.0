"""
Anki collection operations: find/clone AnkiChess note types and add notes.
"""

from __future__ import annotations

import html
import json
import os
import re

from anki.collection import AddNoteRequest
from anki.utils import ids2str
from aqt import mw

from . import decks
from .i18n import STRINGS, tr
from .note_info import chapter_details
from .pgn_field import (
    GLUED_BREAK_SEARCH,
    has_glued_breaks,
    pgn_to_field,
    show_line_breaks,
    space_line_breaks,
)
from .pgn_split import CHAPTER_URL_RE, ID_TAG, MODE_FLIPPED, MODE_PUZZLE, MODE_STUDY, Chapter
from .structures import stored_side

# Same markers used by the AnkiChess Companion add-on
NOTE_TYPE_TAG = "ankiChessVersion"
CONFIG_RE = re.compile(r"window\.USER_CONFIG\s*=\s*(\{[\s\S]*?\})\s*;")
CONFIG_PLACEHOLDER = "// __USER_CONFIG__"
# The template's script, and the tag its structure cards are found by: a template
# without them opens a structure as a puzzle with no moves (or fails on a FEN without kings)
TEMPLATE_SCRIPT_RE = re.compile(r"""src=["'](?:\./)?(_ankiChess[^"'/]*\.js)["']""")
STRUCTURE_MARKER = b"AnkiChessMode"

MODE_SUFFIX = {MODE_FLIPPED: "Flipped", MODE_STUDY: "Study"}
MODE_CONFIG = {
    MODE_FLIPPED: {"flipBoard": True, "playBothSides": False},
    MODE_STUDY: {"flipBoard": False, "playBothSides": True},
}


class ChessImportError(Exception):
    pass


def is_chess_note_type(m: dict) -> bool:
    if NOTE_TYPE_TAG in m:
        return True
    flds = [f["name"] for f in m["flds"]]
    if flds and flds[0].strip().upper() == "PGN":
        return True
    return any("window.USER_CONFIG" in t["qfmt"] for t in m["tmpls"])


def find_chess_note_types() -> list[dict]:
    return [m for m in mw.col.models.all() if is_chess_note_type(m)]


def show_pgn_line_breaks(text: str, card, kind: str) -> str:
    """card_will_show: PGNs pasted in the editor read correctly before being fixed."""
    note = card.note()
    if "PGN" not in note or not has_glued_breaks(note["PGN"]):
        return text
    if not is_chess_note_type(note.note_type()):
        return text
    return show_line_breaks(text, note["PGN"])


def fix_pgn_line_breaks(col) -> int:
    """Space the line breaks of PGNs pasted in the editor, so every device reads them."""
    notes = []
    for nid in col.find_notes(GLUED_BREAK_SEARCH):
        note = col.get_note(nid)
        if is_chess_note_type(note.note_type()):
            note["PGN"] = space_line_breaks(note["PGN"])
            notes.append(note)
    if notes:
        col.update_notes(notes)
    return len(notes)


def mode_note_type_name(base_name: str, mode: str) -> str:
    return base_name if mode == MODE_PUZZLE else f"{base_name} {MODE_SUFFIX[mode]}"


def note_type_mode(m: dict) -> str:
    """Mode a chess note type is set up for, from the USER_CONFIG of its template."""
    for tmpl in m["tmpls"]:
        match = CONFIG_RE.search(tmpl["qfmt"])
        if not match:
            continue
        try:
            config = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue
        if config.get("playBothSides"):
            return MODE_STUDY
        return MODE_FLIPPED if config.get("flipBoard") else MODE_PUZZLE
    return MODE_PUZZLE


def default_base(preferred: str = "") -> dict | None:
    """
    Note type the Flipped/Study ones are cloned from: base_note_type from the config,
    else AnkiChess, else the first chess note type set up as a puzzle.
    """
    types = find_chess_note_types()
    by_name = {m["name"]: m for m in types}
    for name in (preferred, "AnkiChess"):
        if name in by_name:
            return by_name[name]
    puzzles = [m for m in types if note_type_mode(m) == MODE_PUZZLE]
    return (puzzles or types or [None])[0]


def note_type_choices(base: dict) -> list[tuple[str, str, bool]]:
    """
    (name, mode, exists) for the note types a chapter can use: the Puzzle/Flipped/Study
    variants of the base one (created on import when missing), then the other chess ones.
    """
    existing = {m["name"]: note_type_mode(m) for m in find_chess_note_types()}
    choices = []
    for mode in (MODE_PUZZLE, MODE_FLIPPED, MODE_STUDY):
        name = mode_note_type_name(base["name"], mode)
        if name in existing:
            choices.append((name, existing.pop(name), True))
        else:
            choices.append((name, mode, False))
    choices += [(name, mode, True) for name, mode in sorted(existing.items())]
    return choices


def _set_template_config(qfmt: str, overrides: dict) -> str:
    match = CONFIG_RE.search(qfmt)
    if match:
        try:
            config = json.loads(match.group(1))
        except json.JSONDecodeError:
            config = {}
        config.update(overrides)
        repl = f"window.USER_CONFIG = {json.dumps(config, indent=2)};"
        return qfmt[: match.start()] + repl + qfmt[match.end() :]
    if CONFIG_PLACEHOLDER in qfmt:
        repl = f"window.USER_CONFIG = {json.dumps(overrides, indent=2)};"
        return qfmt.replace(CONFIG_PLACEHOLDER, repl)
    raise ChessImportError(tr("warn.no_user_config"))


def ensure_mode_note_type(base: dict, mode: str) -> dict:
    """Return the note type for a mode, cloning the base one when missing."""
    if mode == MODE_PUZZLE:
        return base
    mm = mw.col.models
    name = mode_note_type_name(base["name"], mode)
    existing = mm.by_name(name)
    if existing:
        return existing

    clone = mm.copy(base, add=False)
    clone["name"] = name
    for tmpl in clone["tmpls"]:
        tmpl["qfmt"] = _set_template_config(tmpl["qfmt"], MODE_CONFIG[mode])
    # Keep the tag so the Companion add-on keeps updating this note type
    clone[NOTE_TYPE_TAG] = base.get(NOTE_TYPE_TAG, "2.0")
    mm.add(clone)
    return mm.by_name(name)


def install_template(col, template):
    """
    Add the official AnkiChess template (template_install.download) to a collection without
    an AnkiChess note type: its media files, then the AnkiChess note type made as the
    Companion add-on makes it (name, fields, card, version tag), so the Companion finds it.
    """
    # Written into the folder as the Companion writes them: Anki's media API lowercases the
    # names on Windows, and the card loads _ankiChess<version>.js on every device (AnkiDroid
    # tells the cases apart)
    folder = col.media.dir()
    for name, data in template.media.items():
        path = os.path.join(folder, name)
        if os.path.exists(path):
            # An older copy, maybe named in another case: removed, so the file gets this name
            os.remove(path)
        with open(path, "wb") as f:
            f.write(data)
    # Anki looks for changed media files when the folder's time changes
    os.utime(folder)
    mm = col.models
    m = mm.new("AnkiChess")
    for field_name in ("PGN", "textField"):
        mm.add_field(m, mm.new_field(field_name))
    card = mm.new_template("Card 1")
    card["qfmt"], card["afmt"] = template.front, template.back
    mm.add_template(m, card)
    if template.css:
        m["css"] = template.css
    m[NOTE_TYPE_TAG] = "2.0"
    return mm.add_dict(m)


def build_note_fields(ch: Chapter, strip_anno: bool) -> tuple[str, str]:
    # Same format as the Companion example note: escaped text with <br> line breaks.
    # A structure's card shows the plans of its comment line by line.
    pgn_field = pgn_to_field(ch.pgn(strip_anno=strip_anno), keep_lines=getattr(ch, "is_structure", False))

    parts = [f"<h3>{html.escape(ch.name)}</h3>"]
    if ch.study_name:
        parts.append(html.escape(ch.study_name))
    parts += chapter_details(ch) if isinstance(ch, Chapter) else getattr(ch, "details", [])
    if ch.chapter_url:
        parts.append(f'<a href="{html.escape(ch.chapter_url)}">{html.escape(ch.link_label)}</a>')
    return pgn_field, "<br>".join(parts)


def _search_text(text: str) -> str:
    """Text matched literally inside a quoted Anki search ("*", "_" are wildcards)."""
    for char in ("\\", '"', "*", "_"):
        text = text.replace(char, "\\" + char)
    return text


def note_fields(card, strip_anno: bool) -> list[str]:
    """The fields a card fills: PGN and textField."""
    return list(build_note_fields(card, strip_anno))


def builds_structures(col, m: dict | None) -> bool:
    """Whether a note type's template rebuilds structure chapters on the board."""
    for tmpl in m["tmpls"] if m else []:
        match = TEMPLATE_SCRIPT_RE.search(tmpl["qfmt"])
        if match:
            try:
                with open(os.path.join(col.media.dir(), match.group(1)), "rb") as f:
                    return STRUCTURE_MARKER in f.read()
            except OSError:
                return False
    return False


def structure_side(col, card) -> str | None:
    """The side a structure chapter was imported for (it may have been changed then)."""
    for nid in find_existing(col, card):
        side = stored_side(col.get_note(nid).fields[0])
        if side:
            return side
    return None


def find_existing(col, card) -> list[int]:
    """Notes imported from a card, by the [AnkiChessId] written in their PGN."""
    key = card.dedupe_key
    if not key:
        return []
    exact = col.find_notes(f'"PGN:*{ID_TAG} \\"{_search_text(key)}\\"*"')
    if exact:
        return list(exact)
    # Notes imported before the id was written: the key is in the chapter URL. Notes
    # with an id belong to another card (e.g. a variation of this chapter).
    return list(col.find_notes(f'"PGN:*{_search_text(key)}*" -"PGN:*{ID_TAG}*"'))


# Tags the importers write and replace when updating a note; other tags are kept
MANAGED_TAG_ROOTS = {"lichess", "pgn", "chesscom", "eco"} | {
    strings[key].lower() for strings in STRINGS.values() for key in ("tag.opening", "tag.study")
}


def is_managed_tag(tag: str) -> bool:
    return tag.split("::")[0].lower() in MANAGED_TAG_ROOTS


def merged_tags(current: list[str], new: list[str]) -> list[str]:
    """The note's own tags, then the importer's (replacing the ones it wrote before)."""
    tags = [t for t in current if not is_managed_tag(t)]
    seen = {t.lower() for t in tags}  # Anki ignores case in tags
    for tag in new:
        if tag.lower() not in seen:
            seen.add(tag.lower())
            tags.append(tag)
    return tags


def _same_fields(note, fields: list[str]) -> bool:
    return all(i >= len(note.fields) or note.fields[i] == value for i, value in enumerate(fields))


def _same_note(note, fields: list[str], tags: list[str]) -> bool:
    return _same_fields(note, fields) and {t.lower() for t in note.tags} == {t.lower() for t in tags}


def card_status(col, card, strip_anno: bool) -> tuple[str, list[int]]:
    """("new" | "same" | "changed", note ids): how a card compares to its notes."""
    nids = find_existing(col, card)
    if not nids:
        return "new", []
    fields = note_fields(card, strip_anno)
    for nid in nids:
        if not _same_fields(col.get_note(nid), fields):
            return "changed", nids
    return "same", nids


def removed_chapter_notes(col, study_id: str, chapter_ids: set[str]) -> list[int]:
    """Notes of a study whose chapter is no longer in it."""
    removed = []
    for nid in col.find_notes(f'"tag:lichess::study::{_search_text(study_id)}"'):
        m = CHAPTER_URL_RE.search(" ".join(col.get_note(nid).fields))
        if m and m.group(1) == study_id and m.group(2) not in chapter_ids:
            removed.append(nid)
    return removed


def import_chapters(
    col,
    rows,
    update_existing: bool,
    strip_anno: bool,
    stats: dict,
    undo_label: str = "",
    move_cards: bool = True,
):
    """
    rows: list of (card, note type dict, decks.Placement), where a card is a
    pgn_split.Chapter, a game_analysis.GameCard or a puzzles.PuzzleCard. Runs inside a
    CollectionOp; `stats` is filled with created/updated/unchanged/skipped counts, and
    stats["nids"] with the notes created or updated (to show them in the Browser).

    Updating replaces the importer's tags (the note's own tags stay) and, with
    move_cards, moves the note's cards to the card's deck, so re-importing with
    "update" reorganises older imports into the current deck layout. Notes that are
    already up to date aren't rewritten. Notes imported before in another note type
    keep it, and are listed in stats["other_type"].
    """
    undo_pos = col.add_custom_undo_entry(undo_label or tr("undo.import"))
    deck_ids: dict[str, int] = {}

    def deck_id(name: str) -> int:
        if name not in deck_ids:
            deck_ids[name] = col.decks.id(name)
        return deck_ids[name]

    for key in ("created", "updated", "unchanged", "skipped"):
        stats.setdefault(key, 0)
    nids = stats.setdefault("nids", [])
    to_add, to_update = [], []
    moves: dict[int, list[int]] = {}  # deck id -> card ids
    for ch, model, placement in rows:
        fields = note_fields(ch, strip_anno)
        tags = [*ch.note_tags, *placement.tags]

        existing = [col.get_note(nid) for nid in find_existing(col, ch)]
        if existing:
            # Changing the note type needs a full sync, so it is only reported:
            # stats["other_type"] = {chosen note type: [note ids]}
            for note in existing:
                if note.mid != model["id"]:
                    stats.setdefault("other_type", {}).setdefault(model["name"], []).append(note.id)
            if not update_existing:
                stats["skipped"] += 1
                continue
            changed = False
            for note in existing:
                new_tags = merged_tags(note.tags, tags)
                if not _same_note(note, fields, new_tags):
                    for i, value in enumerate(fields[: len(note.fields)]):
                        note.fields[i] = value
                    note.tags = new_tags
                    to_update.append(note)
                    nids.append(note.id)
                    changed = True
                if move_cards:
                    did = deck_id(placement.deck)
                    cids = col.db.list("select id from cards where nid = ? and did != ?", note.id, did)
                    moves.setdefault(did, []).extend(cids)
            stats["updated" if changed else "unchanged"] += 1
            continue

        note = col.new_note(model)
        for i, value in enumerate(fields[: len(note.fields)]):
            note.fields[i] = value
        note.tags = tags
        to_add.append(AddNoteRequest(note=note, deck_id=deck_id(placement.deck)))
        stats["created"] += 1

    # Batched, so the import is a few undo steps: one per note would push the
    # custom entry out of Anki's undo queue on large imports
    if to_update:
        col.update_notes(to_update)
    for did, card_ids in moves.items():
        if card_ids:
            col.set_deck(card_ids, did)
    if to_add:
        col.add_notes(to_add)  # sets the ids of the new notes
        nids += [request.note.id for request in to_add]
    return col.merge_undo_entries(undo_pos)


STUDY_TAG = "lichess::study::"
STUDY_NAME_RE = re.compile(r'\[StudyName "((?:[^"\\]|\\.)*)"\]')


def study_deck_in_collection(col, study_id: str) -> str | None:
    """The deck a study's notes are in now (cards of filtered decks count at home)."""
    cids = col.find_cards(f'"tag:{STUDY_TAG}{_search_text(study_id)}"')
    if not cids:
        return None
    dids = col.db.list(f"select case when odid then odid else did end from cards where id in {ids2str(cids)}")
    return decks.study_deck_of([col.decks.name(did) for did in dids])


def deck_names(col) -> list[str]:
    """The collection's decks, for the study deck list (filtered decks left out)."""
    return [d.name for d in col.decks.all_names_and_ids(include_filtered=False, skip_empty_default=True)]


def imported_studies(col) -> list[tuple[str, str, int]]:
    """(study id, name, note count) of the Lichess studies in the collection, by name."""
    ids = {t[len(STUDY_TAG):] for t in col.tags.all() if t.lower().startswith(STUDY_TAG)}
    studies = []
    for study_id in ids:
        if not re.fullmatch(r"[A-Za-z0-9]{8}", study_id):
            continue
        nids = col.find_notes(f'"tag:{STUDY_TAG}{_search_text(study_id)}"')
        if not nids:
            continue
        names = (STUDY_NAME_RE.search(col.get_note(nid).fields[0]) for nid in nids)
        m = next((m for m in names if m), None)
        name = html.unescape(m.group(1)) if m else study_id
        studies.append((study_id, name, len(nids)))
    return sorted(studies, key=lambda s: s[1].lower())
