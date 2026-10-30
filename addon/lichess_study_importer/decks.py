"""
Where each imported card goes: deck and extra tags.

    <root>::<study>::Opening lines      Lichess opening lines
                                        (+ tag <opening>::<family>::<variation>)
    <root>::<study>::Tactics            Lichess chapters starting from a FEN
    <root>::<study>::Annotated games    Lichess full games
    <root>::<study>::Structures         Lichess structures (a FEN with no moves),
                                        rebuilt on the board
    <root>::Openings::<family>          Chess.com opening, book moves, book lines (+ tag)
    <root>::My games::<error type>      Chess.com errors and missed mates

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

import io
import re
import unicodedata
from dataclasses import dataclass, field

from .chess_lib import chess
from .i18n import STRINGS, tr
from .openings import follow_book, load_book
from .pgn_split import KIND_EXERCISE, KIND_GAME, KIND_LINE, KIND_STRUCTURE, Chapter

OPENING_KINDS = ("opening", "book", "book_line")  # game_analysis kinds filed by opening
KIND_KEY_MOVE = "key_move"  # "find the move" card made from an annotated game (expand.py)
CONTROL_CHARS = re.compile(r"[\x00-\x1f\x7f]")  # dropped by Anki from deck names


@dataclass
class Placement:
    deck: str
    tags: list[str] = field(default_factory=list)


def root_name(configured: str | None) -> str:
    """Configured root deck, or the default for the interface language."""
    return deck_part(configured or "") or tr("deck.root")


def deck_part(text: str) -> str:
    """One level of a deck name: '::' would create an extra level."""
    return re.sub(r"\s*::\s*", ": ", text or "").strip(" :")


def tag_part(text: str | None) -> str:
    """
    One level of a hierarchical tag ("::" separates the levels): spaces become "_",
    as Anki tags can't have them. Quotes and "*" (search wildcards) and control
    characters are dropped, and colons that would make a level ("::" inside the text,
    ":" at its ends) become a single ":". Case is kept, though Anki ignores it.
    """
    text = re.sub(r'["*]', "", unicodedata.normalize("NFC", text or ""))
    text = CONTROL_CHARS.sub("", re.sub(r"\s+", "_", text.strip()))
    return re.sub(r":{2,}", ":", text).strip(":_")


def opening_tags(opening: str | None) -> list[str]:
    """<opening>::<family>::<variation>, e.g. opening::Slav_Defense::Czech_Variation."""
    family, variation = split_opening(opening)
    if not family:
        return []
    tag = f"{tr('tag.opening')}::{tag_part(family)}"
    return [f"{tag}::{tag_part(variation)}" if variation else tag]


def study_tag(study: str, chapter: str) -> str:
    """<study>::<study name>::<chapter name>, e.g. estudo::#C105_-_Siciliana::Capítulo_1."""
    return "::".join(filter(None, [tr("tag.study"), tag_part(study), tag_part(chapter)]))


def lichess_opening(ch: Chapter) -> str | None:
    """Opening name Lichess writes in the chapter ([Opening]), unless unknown ("?")."""
    name = ch.tags.get("Opening", "").strip()
    return name if name and name != "?" else None


def split_opening(name: str | None) -> tuple[str | None, str | None]:
    """'Slav Defense: Czech Variation, Carlsbad Variation' -> ('Slav Defense', 'Czech Variation')."""
    if not name:
        return None, None
    family, _, rest = name.partition(": ")
    variation = rest.split(", ")[0].strip() or None
    return family.strip() or None, variation


def opening_placement(root: str, opening: str | None) -> Placement:
    family, _ = split_opening(opening)
    deck = f"{root}::{tr('deck.openings')}::{deck_part(family) if family else tr('deck.other_openings')}"
    return Placement(deck, opening_tags(opening))


def chapter_opening_name(ch: Chapter, kind: str) -> str | None:
    """
    Opening of a chapter for its tags: the one Lichess wrote, else, for opening lines,
    the catalog name of the deepest book position of the main line.
    """
    return lichess_opening(ch) or (chapter_opening(ch) if kind == KIND_LINE else None)


def chapter_opening(ch: Chapter) -> str | None:
    """Catalog name of the deepest book position reached by a chapter's main line."""
    try:
        game = chess.pgn.read_game(io.StringIO(ch.pgn()))
    except (ValueError, KeyError):
        return None
    if game is None:
        return None
    return follow_book(game.board(), list(game.mainline_moves())).opening_name


def suggest_kind(ch: Chapter) -> str:
    """Chapter kind, with chapters starting from a book position treated as opening lines."""
    if ch.kind == KIND_EXERCISE:
        try:
            board = chess.Board(ch.fen)
        except ValueError:
            return ch.kind
        if board.epd() in load_book():
            return KIND_LINE
    return ch.kind


def clean_deck_name(name: str | None) -> str:
    """
    A deck name as Anki stores it: "::" separates the levels, spaces around each level
    are trimmed and control characters dropped. Empty levels are dropped as well (Anki
    would name them "blank"). Names ignore case, so "chess::x" is the deck "Chess::X".
    """
    parts = (CONTROL_CHARS.sub("", part).strip() for part in (name or "").split("::"))
    return "::".join(part for part in parts if part)


SECTION_KEYS = ("deck.lines", "deck.tactics", "deck.games", "deck.key_moves", "deck.structures")


def study_deck_of(deck_names: list[str]) -> str | None:
    """
    The deck a study's notes are in now, from the decks of its cards: their study deck
    without the kind's subdeck (in any language), the most common one when they were
    moved apart. Follows decks renamed or moved in Anki.
    """
    sections = {strings[key].lower() for strings in STRINGS.values() for key in SECTION_KEYS if key in strings}
    counts: dict[str, int] = {}
    for name in deck_names:
        levels = clean_deck_name(name).split("::")
        if len(levels) > 1 and levels[-1].lower() in sections:
            levels = levels[:-1]
        deck = "::".join(levels)
        if deck:
            counts[deck] = counts.get(deck, 0) + 1
    return max(counts, key=lambda d: counts[d]) if counts else None


def section_name(kind: str) -> str:
    """Default subdeck of a chapter kind inside its study deck."""
    if kind == KIND_LINE:
        return tr("deck.lines")
    if kind == KIND_KEY_MOVE:
        return tr("deck.key_moves")
    if kind == KIND_STRUCTURE:
        return tr("deck.structures")
    return tr("deck.games") if kind == KIND_GAME else tr("deck.tactics")


def place_chapter(
    ch: Chapter,
    root: str,
    kind: str | None = None,
    opening: str | None = None,
    fallback_study: str = "",
    deck: str | None = None,
    subdeck: str | None = None,
) -> Placement:
    """
    One deck per study, split by chapter kind. kind overrides the suggested chapter
    kind; opening avoids parsing the chapter again; fallback_study names the study
    when the PGN has no StudyName (e.g. the file name). deck and subdeck replace the
    study deck and the kind's subdeck (renamed in the dialog); an empty subdeck files
    the chapter in the study deck itself.
    """
    kind = kind or suggest_kind(ch)
    base = clean_deck_name(deck) or study_deck(ch, root, fallback_study)
    section = section_name(kind) if subdeck is None else subdeck
    return Placement(
        clean_deck_name(f"{base}::{section}"),
        chapter_tags(ch, kind, opening, fallback_study),
    )


def chapter_tags(ch: Chapter, kind: str, opening: str | None = None, fallback_study: str = "") -> list[str]:
    """
    Tags of a chapter's notes besides its source: the study and chapter names, the
    opening and its ECO code. opening avoids looking it up again.
    """
    chapter = ch.name if ch.name != "?" else ""  # "?": no ChapterName nor Event
    tags = [study_tag(study_name(ch, fallback_study), chapter)]
    tags += opening_tags(opening if opening is not None else chapter_opening_name(ch, kind))
    eco = ch.tags.get("ECO", "").strip()
    if eco and eco != "?":
        tags.append(f"eco::{tag_part(eco)}")
    return tags


def study_name(ch: Chapter, fallback_study: str = "") -> str:
    return deck_part(ch.study_name) or deck_part(fallback_study) or tr("deck.unnamed_study")


def study_deck(ch: Chapter, root: str, fallback_study: str = "") -> str:
    """<root>::<study>, the deck holding a Lichess study's chapters."""
    return f"{root}::{study_name(ch, fallback_study)}"


def place_game_card(card, root: str) -> Placement:
    """Placement for a game_analysis.GameCard."""
    if card.kind in OPENING_KINDS:
        return opening_placement(root, card.opening)
    return Placement(f"{root}::{tr('deck.my_games')}::{tr(f'deck.kind.{card.kind}')}")
