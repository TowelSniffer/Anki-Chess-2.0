"""
Update imported Lichess studies: download again every study already in the collection
(tag lichess::study::<id>) and update the notes whose chapter changed on Lichess, with
their variation and key move cards. Notes keep their note type and deck. New chapters
and chapters removed from Lichess are only reported: some may have been left out on
purpose, so the import window is offered for the new ones.

When Lichess limits the downloads (429), each one is waited out and tried again; if it
still refuses, the studies left are kept for later, with a button to try them again.
"""

from __future__ import annotations

from typing import Callable

from aqt import mw
from aqt.operations import CollectionOp, QueryOp
from aqt.qt import QMessageBox
from aqt.utils import showWarning, tooltip

from . import anki_ops, decks, expand
from .i18n import tr
from .lichess_api import LichessError, fetch_study_pgn
from .pgn_split import KIND_EMPTY, KIND_STRUCTURE, KIND_UNSUPPORTED, split_games
from .structures import StructureCard
from .token_dialog import edit_token
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


def update_rows(col, results, strip_anno: bool, report: dict) -> list:
    """Rows for import_chapters: the cards of each study that already have notes."""
    rows = []
    for study_id, value in results:
        if isinstance(value, LichessError):
            report["errors"].append((study_id, error_text(value)))
            continue
        chapters = split_games(value)
        name = next((c.study_name for c in chapters if c.study_name), study_id)
        report["studies"] += 1
        for ch in chapters:
            if ch.kind in (KIND_EMPTY, KIND_UNSUPPORTED):
                continue
            tags = decks.chapter_tags(ch, decks.suggest_kind(ch))
            imported = False
            for card in chapter_cards(ch, strip_anno, col):
                nids = anki_ops.find_existing(col, card)
                if nids:
                    imported = True
                    # Its own note type, so it isn't reported as another one
                    rows.append((card, col.get_note(nids[0]).note_type(), decks.Placement("", tags)))
            if not imported:
                report["new"].setdefault(study_id, (name, []))[1].append(ch.name)
        ids = {c.chapter_id for c in chapters}
        report["removed"] += len(anki_ops.removed_chapter_notes(col, study_id, ids))
    return rows


def update_imported_studies(
    parent=None,
    open_studies: Callable[[str], None] | None = None,
    only: list[str] | None = None,
    new_chapters: dict | None = None,
):
    """
    open_studies(links) loads the studies that have new chapters in the import window,
    when the user wants to. only: the ids of the studies to download (those left for
    later), with the new chapters found before them.
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
            *fetched, names, total, strip_anno, parent, open_studies, new_chapters or {}
        ),
    ).failure(lambda e: showWarning(error_text(e), parent=parent)).with_progress(
        tr("update.progress", done=0, total=total)
    ).without_collection().run_in_background()


def apply_updates(results, left, names, total, strip_anno, parent, open_studies, new_chapters):
    report = {"studies": 0, "errors": [], "new": dict(new_chapters), "removed": 0}
    stats = {}

    def op(col):
        rows = update_rows(col, results, strip_anno, report)
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
        show_report("\n\n".join(lines), left, new, not token, parent, open_studies)

    CollectionOp(parent=parent, op=op).success(on_success).run_in_background()


def show_report(text: str, left: list[str], new: dict, offer_token: bool, parent, open_studies):
    """The summary, with buttons to try again the studies left, add a token or open the new chapters."""
    box = QMessageBox(parent)
    box.setWindowTitle(tr("menu.update_studies"))
    box.setIcon(QMessageBox.Icon.Warning if left else QMessageBox.Icon.Information)
    box.setText(text)
    retry = box.addButton(tr("update.retry", count=len(left)), QMessageBox.ButtonRole.AcceptRole) if left else None
    add_token = (
        box.addButton(tr("update.add_token"), QMessageBox.ButtonRole.ActionRole) if left and offer_token else None
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
    if clicked == add_token and not edit_token(parent, tr("token.reason_rate")):
        return
    if clicked in (retry, add_token):
        # The new chapters found now are listed again with the studies tried again
        update_imported_studies(parent, open_studies, only=left, new_chapters=new)
    elif clicked == open_new:
        open_studies(" ".join(f"https://lichess.org/study/{i}" for i in new))
