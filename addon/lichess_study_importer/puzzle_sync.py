"""
Puzzle sync in Anki: import the puzzles you played on Lichess that aren't in Anki yet,
all of them or only the failed ones (puzzle_sync_failed_only), into the Failed and
Solved subdecks of the puzzle deck. The steps are in sync_flow.py; this module runs
them with Anki's operations, progress window and messages.

- "Sync now" on the Puzzles page, and the button at the end of Anki's menu bar
  (puzzle_sync_button, like Anki Restart's), run it with a progress window: Esc stops,
  the puzzles fetched are imported and the rest waits for the next sync.
- After a first sync it also runs on its own, quietly (a tooltip when something
  changed): when the profile opens (puzzle_sync_on_open) and every hour
  (puzzle_sync_hourly), though never while you review: then it waits until you leave
  the reviewer.
- The pages showing the sync (the Puzzles page) are told when it ends (add_listener).
"""

from __future__ import annotations

import os
import time
import weakref
from typing import Callable

from aqt import gui_hooks, mw
from aqt.operations import CollectionOp, QueryOp
from aqt.qt import QAction, QEvent, QIcon, QObject, QToolTip
from aqt.utils import showWarning, tooltip

from . import anki_ops, decks
from .i18n import tr
from .puzzle_cache import FOLDER
from .sync_flow import PUZZLE_LAYOUT, SyncFlow, SyncSettings
from .token_panel import token_events
from .ui_common import (
    LichessProgress,
    apply_language,
    error_text,
    get_config,
    lichess_token,
    save_sync_state,
)

OPEN_DELAY_MS = 5000  # after the profile opens, so Anki is ready first
HOURLY_MS = 60 * 60 * 1000
ICON = os.path.join(os.path.dirname(__file__), "icons", "puzzle_sync.png")  # from puzzle_sync.svg
# Errors not worth a word when the sync runs on its own (offline, Lichess busy)
QUIET_ERRORS = ("error.connection", "error.rate_limited", "error.cancelled")
TOOLTIP_MS = 6000

_running = False
_pending = False  # an hourly sync waiting for you to leave the reviewer
_button: QAction | None = None  # in Anki's menu bar
_listeners: list[weakref.WeakMethod] = []


def puzzle_deck(config: dict) -> str:
    """The deck of the Lichess puzzles: puzzle_deck, or <root>::Lichess puzzles."""
    root = decks.root_name(config.get("deck_root"))
    return config.get("puzzle_deck") or f"{root}::{tr('deck.puzzles')}"


def cache_user(config: dict) -> str:
    """The Lichess account of the saved token: whose activity cache is used."""
    return str(config.get("lichess_token_user") or "")


def last_sync_text(config: dict | None = None) -> str:
    at = (get_config() if config is None else config).get("puzzle_sync_at")
    if not at:
        return tr("puzzle.sync_never")
    return tr("puzzle.sync_last", date=time.strftime("%Y-%m-%d %H:%M", time.localtime(at / 1000)))


def add_listener(method: Callable[[str], None]):
    """A page's method called with the message when a sync ends (kept while the page lives)."""
    _listeners.append(weakref.WeakMethod(method))


def _tell_listeners(message: str):
    for ref in list(_listeners):
        method = ref()
        try:
            if method is None:
                raise RuntimeError
            method(message)
        except RuntimeError:  # the page is gone (its Qt widget deleted)
            _listeners.remove(ref)


# --- Setup: the button, and the syncs on their own ---


class _MenuBarTips(QObject):
    """The menu bar shows no tooltips of its own: the button's, with the last sync."""

    def eventFilter(self, obj, event):
        if event.type() == QEvent.Type.ToolTip and _button is not None and obj.actionAt(event.pos()) is _button:
            QToolTip.showText(event.globalPos(), _button.toolTip(), obj)
            return True
        return False


def setup():
    """main_window_did_init: the button at the end of the menu bar, and the hourly sync."""
    global _button
    apply_language()
    _button = QAction(QIcon(ICON), tr("puzzle.sync_button"), mw)
    _button.triggered.connect(lambda: sync_puzzles(mw))
    menubar = mw.form.menubar
    menubar.addAction(_button)
    menubar._ankichess_tips = _MenuBarTips(menubar)  # kept alive with the menu bar
    menubar.installEventFilter(menubar._ankichess_tips)
    update_button()
    token_events.changed.connect(lambda: update_button())
    mw.progress.timer(HOURLY_MS, sync_hourly, True, requiresCollection=True, parent=mw)
    gui_hooks.state_did_change.append(_after_review)


def update_button(config: dict | None = None):
    """
    Shown (puzzle_sync_button) once a Lichess token is saved, the only way it can sync,
    with the last sync in its tooltip. Without a token it would only ask for one.
    """
    if _button is None:
        return
    config = get_config() if config is None else config
    has_token = bool(str(config.get("lichess_token", "")).strip())
    _button.setVisible(bool(config.get("puzzle_sync_button", True)) and has_token)
    _button.setToolTip(f"{tr('puzzle.sync_button')}\n{last_sync_text(config)}")


def _may_sync_quietly(config: dict) -> bool:
    # The first sync reads the whole history: it runs from "Sync now", with a progress window
    return bool(config.get("puzzle_sync_since")) and bool(lichess_token())


def schedule_on_open():
    """profile_did_open: sync a little later, when it is on and a first sync was made."""
    mw.progress.single_shot(OPEN_DELAY_MS, sync_on_open)


def sync_on_open():
    config = get_config()
    if config.get("puzzle_sync_on_open", True) and _may_sync_quietly(config):
        sync_puzzles(mw, interactive=False)


def sync_hourly(state: str | None = None):
    """The hourly timer: a quiet sync, or a pending one while you review (state: Anki's, now)."""
    global _pending
    config = get_config()
    if not (config.get("puzzle_sync_hourly", True) and _may_sync_quietly(config)):
        return
    if (state or mw.state) == "review":
        _pending = True  # new cards and moved ones would change the session under you
        return
    sync_puzzles(mw, interactive=False)


def _after_review(new_state, old_state):
    global _pending
    if _pending and new_state != "review":
        _pending = False
        sync_hourly(new_state)


# --- Running a sync ---


class _AnkiHost:
    """sync_flow.SyncHost with Anki's operations and messages."""

    def __init__(self, parent, interactive: bool, done: Callable[[str], None] | None):
        self.parent, self.interactive, self.done = parent, interactive, done
        self.progress = LichessProgress(shown=interactive)

    def run_background(self, task: Callable, success: Callable, label: str):
        op = QueryOp(parent=self.parent, op=lambda col: task(), success=success).failure(
            lambda e: self.finish(error=e)
        )
        if self.interactive:
            op = op.with_progress(label)
        op.without_collection().run_in_background()

    def run_collection(self, op: Callable, success: Callable):
        CollectionOp(parent=self.parent, op=op).success(success).failure(
            lambda e: self.finish(error=e)
        ).run_in_background()

    def collection(self):
        return mw.col

    def save_state(self, since: int, at: int, layout: int):
        save_sync_state(since, at, layout)

    def finish(self, message: str = "", error: Exception | None = None, news: bool = False):
        global _running
        _running = False
        update_button()
        if error is not None:
            message = error_text(error)
            if self.interactive:
                showWarning(message, parent=self.parent)
            elif getattr(error, "key", None) not in QUIET_ERRORS:
                tooltip(tr("puzzle.sync_error", error=message), parent=mw, period=TOOLTIP_MS)
        elif message and (self.interactive or news):
            tooltip(message, parent=self.parent if self.interactive else mw, period=TOOLTIP_MS)
        if self.done:
            self.done(message)
        _tell_listeners(message)


def sync_puzzles(parent, interactive: bool = True, done: Callable[[str], None] | None = None):
    """
    Read the activity since the last sync, fetch the new puzzles (with their game when
    "Start with the opponent's move" is on) and import them. interactive: from "Sync
    now" or the button, with a progress window and messages; else quiet. done(message)
    runs at the end.
    """
    global _running
    if _running:
        if interactive:
            tooltip(tr("puzzle.sync_running"), parent=parent)
        return
    apply_language()
    token = lichess_token()
    if not token and interactive and mw.col:
        # The import window, at the token's field (it imports this module)
        from .import_window import show_import_window

        show_import_window(token_reason=tr("puzzle.token_needed"))
    if not token or not mw.col:
        return
    config = get_config()
    base = anki_ops.default_base(config.get("base_note_type", ""))
    if base is None:
        if interactive:
            showWarning(tr("warn.no_note_types"), parent=parent)
        return
    # A newer deck and tag layout: the whole history (from the cache) once, to move every puzzle
    current_layout = int(config.get("puzzle_sync_layout") or 0) >= PUZZLE_LAYOUT
    settings = SyncSettings(
        token=token,
        user=cache_user(config),
        since=int(config.get("puzzle_sync_since") or 0) if current_layout else 0,
        failed_only=bool(config.get("puzzle_sync_failed_only", False)),
        fetch_games=bool(config.get("puzzle_fetch_games", True)),
        deck=puzzle_deck(config),
        base=base,
        cache_folder=FOLDER,
    )
    _running = True
    SyncFlow(settings, _AnkiHost(parent, interactive, done)).start()
