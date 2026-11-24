"""
Update imported Lichess studies: download again every study already in the collection
(tag lichess::study::<id>) and update the notes whose chapter changed on Lichess, with
their variation and key move cards. Notes keep their note type and deck.

The chapters added to a study on Lichess since you imported it (created after its newest
note) are imported as the import window would check and import them. The other chapters
without notes were left out when importing, or Lichess doesn't date them (games imported
from a PGN): they are only reported, with the import window to open them. Chapters
removed from Lichess are reported too.

When Lichess limits the downloads (429), each one is waited out and tried again; if it
still refuses, the studies left are kept for later, with a button to try them again.
"""

from __future__ import annotations

import textwrap
from typing import Callable

from aqt import mw
from aqt.operations import CollectionOp, QueryOp
from aqt.qt import QMessageBox
from aqt.utils import showWarning, tooltip

from . import anki_ops, chapter_plan, decks, expand
from .i18n import tr
from .lichess_api import LichessError, fetch_study_pgn
from .pgn_split import KIND_EMPTY, KIND_STRUCTURE, KIND_UNSUPPORTED, split_games
from .structures import StructureCard
from .ui_common import apply_language, error_text, get_config, lichess_token, lichess_waiter

# Lichess still refusing after the waits, or the user stopped: the studies left wait
LEFT_FOR_LATER = ("error.rate_limited", "error.cancelled")


def chapter_cards(ch, strip_anno: bool, col=None) -> list:
    """The chapter and the cards that may have been made from it, once each."""
    if ch.kind == KIND_STRUCTURE:
        # Rebuilt from the side it was imported for
        card = StructureCard(ch, ch.player or ch.side_to_move)
        side = anki_ops.structure_side(col, card) if col is not None else None
        return [StructureCard(ch, side) if side else card]
    cards = {}
    for card in [ch, *expand.split_variations(ch, strip_anno), *expand.key_move_cards(ch, strip_anno)]:
        cards.setdefault(card.dedupe_key, card)
    return list(cards.values())


class NewChapters:
    """
    Rows for the chapters added to a study on Lichess since it was imported: imported as
    the import window checks and imports them when it loads the study (chapter_plan), with
    the options of the last import (include_games, split_lines, key_moves), into the
    study's deck.
    """

    def __init__(self, col, config: dict, strip_anno: bool):
        self.col = col
        self.strip_anno = strip_anno
        self.root = decks.root_name(config.get("deck_root"))
        self.study_decks = config.get("study_decks", {})
        self.chapter_decks = config.get("chapter_decks", {})
        self.include_games = bool(config.get("include_games", False))
        self.split_lines = bool(config.get("split_lines", False))
        self.key_moves = bool(config.get("key_moves", False))
        self.base = anki_ops.default_base(config.get("base_note_type", ""))
        self.choices = anki_ops.note_type_choices(self.base) if self.base else []
        self.structures = anki_ops.builds_structures(col, self.base)
        self.models: dict = {}
        self.study_decks_found: dict[str, str] = {}  # study id -> its deck

    def rows(self, study_id: str, ch) -> list | None:
        """
        The chapter's rows; None when the import window wouldn't check it (a full game
        without include_games) or can't import it (a structure the template can't rebuild).
        """
        kind = decks.suggest_kind(ch)
        if not self.base or not chapter_plan.checked_by_default(kind, self.include_games):
            return None
        if kind == KIND_STRUCTURE and not self.structures:
            return None
        if study_id not in self.study_decks_found:
            linked = anki_ops.linked_study_deck(self.col, study_id, self.study_decks)
            self.study_decks_found[study_id] = linked or decks.study_deck(ch, self.root)
        rows = []
        for card, mode, placement in chapter_plan.default_cards(
            ch,
            self.root,
            self.study_decks_found[study_id],
            self.chapter_decks.get(ch.dedupe_key),
            self.split_lines,
            self.key_moves,
            self.strip_anno,
        ):
            model = self.model(mode)
            if model is None:
                return None
            rows.append((card, model, placement))
        return rows

    def model(self, mode: str | None) -> dict | None:
        """The note type of a mode, the one the import window picks: created when missing."""
        if mode is None:
            return self.base
        if mode not in self.models:
            name = next((n for n, m, _ in self.choices if m == mode), "")
            try:
                self.models[mode] = self.col.models.by_name(name) or anki_ops.ensure_mode_note_type(self.base, mode)
            except anki_ops.ChessImportError:  # a template without USER_CONFIG to set up
                self.models[mode] = None
        return self.models[mode]


def update_rows(col, results, strip_anno: bool, report: dict, new: NewChapters | None = None) -> list:
    """
    Rows for import_chapters: the cards of each study that already have notes and, with
    new, the chapters added to it on Lichess since it was imported.
    """
    rows = []
    for study_id, value in results:
        if isinstance(value, LichessError):
            report["errors"].append((study_id, error_text(value)))
            continue
        chapters = split_games(value)
        name = next((c.study_name for c in chapters if c.study_name), study_id)
        report["studies"] += 1
        imported_at = anki_ops.study_imported_at(col, study_id)
        for ch in chapters:
            if ch.kind in (KIND_EMPTY, KIND_UNSUPPORTED):
                continue
            try:
                tags = decks.chapter_tags(ch, decks.suggest_kind(ch))
                found = [(card, anki_ops.find_existing(col, card)) for card in chapter_cards(ch, strip_anno, col)]
                found = [(card, nids) for card, nids in found if nids]
                added = None
                if not found and new is not None and imported_at and (ch.created_ms or 0) > imported_at:
                    added = new.rows(study_id, ch)
            except Exception as e:  # one broken chapter doesn't stop the update of the others
                report["errors"].append((study_id, f"{ch.name}: {e}"))
                continue
            for card, nids in found:
                # Its own note type, so it isn't reported as another one
                rows.append((card, col.get_note(nids[0]).note_type(), decks.Placement("", tags)))
            if added:
                rows += added
                report["added"].setdefault(study_id, (name, []))[1].append(ch.name)
            elif not found:
                report["new"].setdefault(study_id, (name, []))[1].append(ch.name)
        ids = {c.chapter_id for c in chapters}
        report["removed"] += len(anki_ops.removed_chapter_notes(col, study_id, ids))
    return rows


def update_imported_studies(
    parent=None,
    open_studies: Callable[[str], None] | None = None,
    ask_token: Callable[[str, Callable[[], None]], None] | None = None,
    only: list[str] | None = None,
    new_chapters: dict | None = None,
):
    """
    open_studies(links) loads the studies that have new chapters in the import window,
    when the user wants to. ask_token(reason, then) shows the Lichess token's field, then()
    once it is saved. only: the ids of the studies to download (those left for later),
    with the new chapters found before them.
    """
    if not mw.col:
        return
    apply_language()
    parent = parent or mw
    config = get_config()
    names = {study_id: name for study_id, name, _ in anki_ops.imported_studies(mw.col)}
    ids = [i for i in names if only is None or i in only]
    if not ids:
        tooltip(tr("update.none"), parent=parent)
        return
    token = lichess_token()
    strip_anno = bool(config.get("strip_anno", True))
    total = len(ids)

    def progress(done: int, waiting: str = ""):
        label = tr("update.progress", done=done, total=total)
        if waiting:
            label = f"{label}\n{waiting}\n{tr('lichess.esc_cancels')}"
        mw.progress.update(label=label, value=done, max=total)

    def fetch(col):
        results, left = [], []
        for done, study_id in enumerate(ids):
            if mw.progress.want_cancel():
                left = ids[done:]
                break
            mw.taskman.run_on_main(lambda done=done: progress(done))
            wait = lichess_waiter(lambda text, done=done: progress(done, text), mw.progress.want_cancel)
            try:
                results.append((study_id, fetch_study_pgn(study_id, token=token, wait=wait)))
            except LichessError as e:
                if e.key in LEFT_FOR_LATER:
                    left = ids[done:]  # untried: they would only wait again
                    break
                results.append((study_id, e))
        return results, left

    QueryOp(
        parent=parent,
        op=fetch,
        success=lambda fetched: apply_updates(
            *fetched, names, total, strip_anno, parent, open_studies, ask_token, new_chapters or {}
        ),
    ).failure(lambda e: showWarning(error_text(e), parent=parent)).with_progress(
        tr("update.progress", done=0, total=total)
    ).without_collection().run_in_background()


def apply_updates(results, left, names, total, strip_anno, parent, open_studies, ask_token, new_chapters):
    report = {"studies": 0, "errors": [], "added": {}, "new": dict(new_chapters), "removed": 0}
    stats = {}
    config = get_config()

    def op(col):
        # Note types missing for the new chapters are created here, outside the undoable update
        rows = update_rows(col, results, strip_anno, report, NewChapters(col, config, strip_anno))
        return anki_ops.import_chapters(
            col, rows, True, strip_anno, stats, tr("update.undo"), move_cards=False
        )

    def on_success(_changes):
        lines = [
            tr(
                "update.summary",
                studies=report["studies"],
                total=total,
                updated=stats.get("updated", 0),
                unchanged=stats.get("unchanged", 0),
            )
        ]
        if report["added"]:
            listed = "\n".join(
                f"• {name}: {textwrap.shorten(', '.join(chapters), 300, placeholder=' …')}"
                for name, chapters in report["added"].values()
            )
            lines.append(tr("update.added", studies=listed))
        if report["removed"]:
            lines.append(tr("update.removed", count=report["removed"]))
        if report["errors"]:
            errors = "\n".join(f"{names.get(i, i)}: {text}" for i, text in report["errors"])
            lines.append(tr("study.load_errors", errors=errors))
        token = lichess_token()
        if left:
            lines.append(tr("update.pending", studies="\n".join(f"• {names.get(i, i)}" for i in left)))
            if not token:
                lines.append(tr("token.rate_hint"))
        new = report["new"]
        if new:
            listed = "\n".join(f"• {name}: {len(chapters)}" for name, chapters in new.values())
            lines.append(tr("update.new_chapters", studies=listed))
        show_report("\n\n".join(lines), left, new, not token, parent, open_studies, ask_token)

    CollectionOp(parent=parent, op=op).success(on_success).run_in_background()


def show_report(text: str, left: list[str], new: dict, offer_token: bool, parent, open_studies, ask_token=None):
    """The summary, with buttons to try again the studies left, add a token or open the new chapters."""
    box = QMessageBox(parent)
    box.setWindowTitle(tr("menu.update_studies"))
    box.setIcon(QMessageBox.Icon.Warning if left else QMessageBox.Icon.Information)
    box.setText(text)
    retry = box.addButton(tr("update.retry", count=len(left)), QMessageBox.ButtonRole.AcceptRole) if left else None
    add_token = (
        box.addButton(tr("update.add_token"), QMessageBox.ButtonRole.ActionRole)
        if left and offer_token and ask_token
        else None
    )
    open_new = (
        box.addButton(tr("update.open_new_button"), QMessageBox.ButtonRole.ActionRole)
        if new and open_studies
        else None
    )
    close = box.addButton(tr("button.close"), QMessageBox.ButtonRole.RejectRole)
    box.setDefaultButton(retry or open_new or close)
    box.exec()
    clicked = box.clickedButton()
    if clicked is None or clicked == close:
        return
    # The new chapters found now are listed again with the studies tried again
    again = lambda: update_imported_studies(parent, open_studies, ask_token, only=left, new_chapters=new)  # noqa: E731
    if clicked == add_token:
        ask_token(tr("token.reason_rate"), again)  # the update goes on once the token is saved
    elif clicked == retry:
        again()
    elif clicked == open_new:
        open_studies(" ".join(f"https://lichess.org/study/{i}" for i in new))
