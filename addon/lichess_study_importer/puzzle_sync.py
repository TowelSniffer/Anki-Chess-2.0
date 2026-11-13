"""
Puzzle sync: import the puzzles you played on Lichess that aren't in Anki yet, all of
them or only the failed ones (puzzle_sync_failed_only), into the puzzle deck.

The first sync reads your whole puzzle history; then each one reads only the activity
since the last (puzzle_sync_since), so it takes seconds. "Sync now" on the Puzzles page
runs it with a progress window (Esc stops: the puzzles fetched are imported, the rest
waits for the next sync). After a first sync it also runs on its own when the profile
opens (puzzle_sync_on_open), quietly: a tooltip when puzzles were imported.

Puzzles go into the Failed or Solved subdeck of the puzzle deck, by your result. The
puzzles already imported that a sync reads are moved there too, with the current tags;
their content and reviews stay. When the deck and tag layout changes (PUZZLE_LAYOUT),
the next sync reads the whole history once, so every imported puzzle gets it.

The button at the end of Anki's menu bar (puzzle_sync_button), like Anki Restart's,
runs "Sync now" in one click.
"""

from __future__ import annotations

import os
import time
from typing import Callable

from aqt import mw
from aqt.operations import CollectionOp, QueryOp
from aqt.qt import QAction, QEvent, QIcon, QObject, QToolTip
from aqt.utils import showWarning, tooltip

from . import anki_ops, decks
from .i18n import tr
from .lichess_api import LichessError, PuzzleActivity, fetch_puzzle_activity
from .puzzles import PuzzleCard, activity_card, load_puzzles, next_sync_point, puzzle_tags, sync_plan
from .token_dialog import edit_token
from .ui_common import apply_language, error_text, get_config, lichess_token, lichess_waiter, save_sync_state

OPEN_DELAY_MS = 5000  # after the profile opens, so Anki is ready first
PUZZLE_LAYOUT = 1  # 1: Failed / Solved subdecks, lichess::puzzle::theme::<theme> tags
ICON = os.path.join(os.path.dirname(__file__), "icons", "puzzle_sync.png")  # from puzzle_sync.svg
# Errors not worth a word when the sync runs on its own (offline, Lichess busy)
QUIET_ERRORS = ("error.connection", "error.rate_limited", "error.cancelled")
TOOLTIP_MS = 6000

_running = False
_button: QAction | None = None  # in Anki's menu bar


def puzzle_deck(config: dict) -> str:
    """The deck of the Lichess puzzles: puzzle_deck, or <root>::Lichess puzzles."""
    root = decks.root_name(config.get("deck_root"))
    return config.get("puzzle_deck") or f"{root}::{tr('deck.puzzles')}"


def last_sync_text(config: dict | None = None) -> str:
    at = (get_config() if config is None else config).get("puzzle_sync_at")
    if not at:
        return tr("puzzle.sync_never")
    return tr("puzzle.sync_last", date=time.strftime("%Y-%m-%d %H:%M", time.localtime(at / 1000)))


def stop_text(error: LichessError, done: int, total: int) -> str:
    """Why fetching the puzzles stopped early, and how far it got."""
    stopped = tr("puzzle.fetch_stopped", done=done, total=total)
    return stopped if error.key == "error.cancelled" else f"{error_text(error)} {stopped}"


def schedule_on_open():
    """profile_did_open: sync a little later, when it is on and a first sync was made."""
    mw.progress.single_shot(OPEN_DELAY_MS, sync_on_open)


def sync_on_open():
    config = get_config()
    # The first sync reads the whole history: it runs from "Sync now", with a progress window
    if config.get("puzzle_sync_on_open", True) and config.get("puzzle_sync_since") and lichess_token():
        sync_puzzles(mw, interactive=False)


# --- The button in Anki's menu bar ---


class _MenuBarTips(QObject):
    """The menu bar shows no tooltips of its own: the button's, with the last sync."""

    def eventFilter(self, obj, event):
        if event.type() == QEvent.Type.ToolTip and _button is not None and obj.actionAt(event.pos()) is _button:
            QToolTip.showText(event.globalPos(), _button.toolTip(), obj)
            return True
        return False


def setup_button():
    """main_window_did_init: the sync button at the end of the menu bar (after Help)."""
    global _button
    apply_language()
    _button = QAction(QIcon(ICON), tr("puzzle.sync_button"), mw)
    _button.triggered.connect(lambda: sync_puzzles(mw))
    menubar = mw.form.menubar
    menubar.addAction(_button)
    menubar._ankichess_tips = _MenuBarTips(menubar)  # kept alive with the menu bar
    menubar.installEventFilter(menubar._ankichess_tips)
    update_button()


def update_button(config: dict | None = None):
    """Shown or hidden (puzzle_sync_button), with the last sync in its tooltip."""
    if _button is None:
        return
    config = get_config() if config is None else config
    _button.setVisible(bool(config.get("puzzle_sync_button", True)))
    _button.setToolTip(f"{tr('puzzle.sync_button')}\n{last_sync_text(config)}")


# --- Sync ---


class _Progress:
    """The progress window of a sync from "Sync now"; nothing when it runs on its own."""

    def __init__(self, interactive: bool):
        self.interactive = interactive
        self.label, self.value, self.max = "", None, None

    def set(self, label: str, value: int | None = None, maximum: int | None = None):
        self.label, self.value, self.max = label, value, maximum
        if self.interactive:
            mw.taskman.run_on_main(self.show)

    def show(self, waiting: str = ""):
        lines = (self.label, waiting, tr("lichess.esc_cancels"))
        mw.progress.update(label="\n".join(line for line in lines if line), value=self.value, max=self.max)

    def wait(self):
        """A 429 waited out in the progress window (Esc gives up); quiet waits without it."""
        return lichess_waiter(self.show, mw.progress.want_cancel) if self.interactive else None

    def cancelled(self) -> bool:
        return self.interactive and mw.progress.want_cancel()


def _activity_cards(plan: list[dict]) -> list[PuzzleCard]:
    cards = []
    for entry in plan:
        try:
            cards.append(activity_card(entry))
        except (KeyError, TypeError, ValueError, AssertionError):  # a position python-chess can't read
            pass
    return cards


def sync_puzzles(parent, interactive: bool = True, done: Callable[[str], None] | None = None):
    """
    Read the activity since the last sync, fetch the new puzzles (with their game when
    "Start with the opponent's move" is on) and import them. interactive: from "Sync
    now", with a progress window and messages; else quiet. done(message) runs at the end.
    """
    global _running
    if _running:
        if interactive:
            tooltip(tr("puzzle.sync_running"), parent=parent)
        return
    apply_language()
    token = lichess_token()
    if not token and interactive and edit_token(parent, tr("puzzle.token_needed")):
        token = lichess_token()
    if not token or not mw.col:
        return
    config = get_config()
    base = anki_ops.default_base(config.get("base_note_type", ""))
    if base is None:
        if interactive:
            showWarning(tr("warn.no_note_types"), parent=parent)
        return
    # A new deck and tag layout: the whole history is read once, to move every imported puzzle
    current_layout = int(config.get("puzzle_sync_layout") or 0) >= PUZZLE_LAYOUT
    since = int(config.get("puzzle_sync_since") or 0) if current_layout else 0
    failed_only = bool(config.get("puzzle_sync_failed_only", False))
    fetch_games = bool(config.get("puzzle_fetch_games", True))
    deck = puzzle_deck(config)
    progress = _Progress(interactive)
    _running = True

    def finish(message: str = "", error: Exception | None = None, news: bool = False):
        global _running
        _running = False
        update_button()
        if error is not None:
            message = error_text(error)
            if interactive:
                showWarning(message, parent=parent)
            elif getattr(error, "key", None) not in QUIET_ERRORS:
                tooltip(tr("puzzle.sync_error", error=message), parent=mw, period=TOOLTIP_MS)
        elif message and (interactive or news):
            tooltip(message, parent=parent if interactive else mw, period=TOOLTIP_MS)
        if done:
            done(message)

    def run(task: Callable, success: Callable, label: str):
        op = QueryOp(parent=parent, op=lambda col: task(), success=success).failure(lambda e: finish(error=e))
        if interactive:
            op = op.with_progress(label)
        op.without_collection().run_in_background()

    def read() -> PuzzleActivity:
        return fetch_puzzle_activity(
            token,
            progress=lambda count: progress.set(tr("puzzle.loading_activity", count=count)),
            cancelled=progress.cancelled,
            wait=progress.wait(),
            since=since or None,
        )

    def on_read(activity: PuzzleActivity):
        if activity.stopped:
            # Only the most recent part: the next sync reads it all again
            finish(tr(f"puzzle.sync_{activity.stopped}"))
            return
        if not mw.col:
            finish()
            return
        imported = anki_ops.imported_puzzles(mw.col)
        # The puzzles read that are already in Anki: to their result's deck, with the current tags
        organize = [
            (
                imported[e["puzzle"]["id"]],
                decks.puzzle_placement(deck, e.get("win")).deck,
                puzzle_tags(e["puzzle"].get("themes", []), e.get("win")),
            )
            for e in activity.entries
            if e["puzzle"]["id"] in imported
        ]
        plan = sync_plan(activity.entries, set(imported), failed_only)
        if not plan:
            on_cards(activity, plan, organize, [], 0, None)
            return
        label = tr("puzzle.loading", done=0, total=len(plan))
        if fetch_games:

            def fetching(count: int, total: int):
                progress.set(tr("puzzle.loading", done=count, total=total), count, total)

            def fetch():
                items = [(e["puzzle"]["id"], e.get("win"), e) for e in plan]
                cards, error = load_puzzles(items, fetching, progress.wait(), progress.cancelled)
                return cards, len(cards) if error else len(plan), error

            run(fetch, lambda fetched: on_cards(activity, plan, organize, *fetched), label)
        else:
            built = lambda: (_activity_cards(plan), len(plan), None)  # noqa: E731
            run(built, lambda cards: on_cards(activity, plan, organize, *cards), label)

    def on_cards(activity: PuzzleActivity, plan: list[dict], organize: list, cards: list, handled: int, error):
        if not mw.col:
            finish()
            return
        point = next_sync_point(activity.entries, True, plan, handled, since)
        rest = f" {stop_text(error, handled, len(plan))} {tr('puzzle.sync_rest')}" if error else ""

        def saved_message(created: int, organized: int) -> str:
            save_sync_state(point, int(time.time() * 1000), PUZZLE_LAYOUT)
            if not plan and not organized:
                return tr("puzzle.sync_none")
            text = tr("puzzle.sync_done", count=created)
            if organized:
                text += " " + tr("puzzle.sync_organized", count=organized)
            return text + rest

        if not cards and not organize:
            finish(saved_message(0, 0))
            return
        try:
            models = {mode: anki_ops.ensure_mode_note_type(base, mode) for mode in {c.mode for c in cards}}
        except anki_ops.ChessImportError as e:
            finish(error=e)
            return
        rows = [(card, models[card.mode], decks.puzzle_placement(deck, card.win)) for card in cards]
        stats: dict = {}

        def imported(_changes):
            created, organized = stats.get("created", 0), stats.get("organized", 0)
            finish(saved_message(created, organized), news=bool(created or organized))

        CollectionOp(
            parent=parent,
            # New notes are added; the imported ones only change deck and tags
            op=lambda col: anki_ops.import_chapters(
                col, rows, False, True, stats, tr("puzzle.undo"), organize=organize
            ),
        ).success(imported).failure(lambda e: finish(error=e)).run_in_background()

    run(read, on_read, tr("puzzle.loading_activity", count=0))
