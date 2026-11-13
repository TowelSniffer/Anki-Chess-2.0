"""
Puzzles page of the import window: import Lichess puzzles, from your puzzle activity
(the latest ones or all of them) or from puzzle links, as cards in a deck of their own
(<root>::Lichess puzzles by default).

Your activity is listed as Lichess sends it, without a request per puzzle; the checked
ones are fetched with their game when imported, so the card starts with the opponent's
last move ("Start with the opponent's move"). "Sync now" imports the puzzles you played
since the last sync (see puzzle_sync.py).
"""

from __future__ import annotations

import io
import math
import time
from typing import Callable

from aqt import mw
from aqt.operations import CollectionOp, QueryOp
from aqt.qt import (
    QCheckBox,
    QComboBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QSpinBox,
    QSplitter,
    Qt,
    QTableWidget,
    QTableWidgetItem,
    QVBoxLayout,
    QWidget,
)
from aqt.utils import showWarning, tooltip

from . import anki_ops, decks, puzzle_sync
from .chess_lib import chess
from .i18n import tr
from .lichess_api import fetch_puzzle_activity, parse_puzzle_ids
from .puzzle_sync import stop_text
from .puzzles import REQUEST_PAUSE, PuzzleCard, activity_card, load_puzzles
from .ui_common import (
    BoardPreview,
    browse,
    error_text,
    get_config,
    lichess_token,
    lichess_waiter,
    paint_status,
    plan_text,
    readonly_item,
    restore_columns,
    save_columns,
    write_config,
)
from .token_dialog import edit_token

COL_CHECK, COL_PUZZLE, COL_DATE, COL_RATING, COL_THEMES, COL_RESULT, COL_STATUS = range(7)
COLUMN_WIDTHS = {COL_CHECK: 28, COL_PUZZLE: 90, COL_DATE: 90, COL_RATING: 70, COL_THEMES: 300, COL_RESULT: 80}
COLUMNS_KEY = "puzzleImportColumns2"  # the Date column changed the layout
MAX_LATEST = 10000
SECONDS_PER_PUZZLE = REQUEST_PAUSE + 0.3  # fetching a puzzle's game, with the pause


class SortKeyItem(QTableWidgetItem):
    """Read-only cell sorted by the number in its UserRole (rating, date), not as text."""

    def __init__(self, text: str, key: float):
        super().__init__(text)
        self.setData(Qt.ItemDataRole.UserRole, key)
        self.setFlags(Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsSelectable)

    def __lt__(self, other):
        return (self.data(Qt.ItemDataRole.UserRole) or 0) < (other.data(Qt.ItemDataRole.UserRole) or 0)


def date_text(ms: int | None) -> str:
    return time.strftime("%Y-%m-%d", time.localtime(ms / 1000)) if ms else ""


def result_text(card: PuzzleCard) -> str:
    return {True: tr("puzzle.solved"), False: tr("puzzle.failed")}.get(card.win, "")


class PuzzleImportPage(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.config = get_config()
        self.cards: list[PuzzleCard] = []
        self.statuses: list[str] = []
        self.entries: dict[str, dict] = {}  # your activity, by puzzle id: the card without the game
        self.last_nids: list[int] = []
        # Loading checks only the failed puzzles (the last of the two buttons clicked)
        self.failed_first = bool(self.config.get("puzzle_failed_only", True))
        self.base = anki_ops.default_base(self.config.get("base_note_type", ""))
        root = decks.root_name(self.config.get("deck_root"))
        self.default_deck = f"{root}::{tr('deck.puzzles')}"

        layout = QVBoxLayout(self)

        # --- Your puzzle activity (with the token of the window's bottom bar) ---
        activity = QHBoxLayout()
        self.max_spin = QSpinBox()
        self.max_spin.setRange(1, MAX_LATEST)
        self.max_spin.setValue(int(self.config.get("puzzle_max", 50)))
        self.all_check = QCheckBox(tr("puzzle.all"))
        self.all_check.setToolTip(tr("puzzle.all_tip"))
        self.all_check.toggled.connect(lambda on: self.max_spin.setEnabled(not on))
        self.all_check.setChecked(bool(self.config.get("puzzle_all", False)))
        self.max_spin.setEnabled(not self.all_check.isChecked())
        btn_activity = QPushButton(tr("puzzle.load_activity"))
        btn_activity.setToolTip(tr("puzzle.token_tip"))
        btn_activity.clicked.connect(self.on_load_activity)
        for widget in (QLabel(tr("puzzle.last")), self.max_spin, self.all_check, btn_activity):
            activity.addWidget(widget)
        activity.addStretch(1)
        layout.addLayout(activity)

        # --- Sync: the puzzles you played since the last sync, imported at once ---
        sync = QHBoxLayout()
        self.sync_mode = QComboBox()
        self.sync_mode.addItem(tr("puzzle.sync_all"), False)
        self.sync_mode.addItem(tr("puzzle.failed_only"), True)
        self.sync_mode.setCurrentIndex(1 if self.config.get("puzzle_sync_failed_only", False) else 0)
        self.sync_mode.setToolTip(tr("puzzle.sync_mode_tip"))
        self.sync_mode.currentIndexChanged.connect(lambda _: self.save_options())
        self.sync_on_open = QCheckBox(tr("puzzle.sync_on_open"))
        self.sync_on_open.setToolTip(tr("puzzle.sync_on_open_tip"))
        self.sync_on_open.setChecked(bool(self.config.get("puzzle_sync_on_open", True)))
        self.sync_on_open.toggled.connect(lambda _: self.save_options())
        self.sync_button = QCheckBox(tr("puzzle.sync_button_check"))
        self.sync_button.setToolTip(tr("puzzle.sync_button_tip"))
        self.sync_button.setChecked(bool(self.config.get("puzzle_sync_button", True)))
        self.sync_button.toggled.connect(lambda _: self.save_options())
        btn_sync = QPushButton(tr("puzzle.sync_now"))
        btn_sync.setToolTip(tr("puzzle.sync_now_tip"))
        btn_sync.clicked.connect(self.on_sync)
        self.sync_status = QLabel()
        sync_widgets = (QLabel(tr("puzzle.sync_label")), self.sync_mode, self.sync_on_open, self.sync_button, btn_sync)
        for widget in sync_widgets:
            sync.addWidget(widget)
        sync.addWidget(self.sync_status, 1)
        layout.addLayout(sync)
        self.update_sync_status()

        # --- Puzzle links ---
        links = QHBoxLayout()
        self.links_edit = QLineEdit()
        self.links_edit.setPlaceholderText(tr("puzzle.links_placeholder"))
        self.links_edit.returnPressed.connect(self.on_load_links)
        btn_links = QPushButton(tr("source.load_url"))
        btn_links.clicked.connect(self.on_load_links)
        links.addWidget(self.links_edit, 1)
        links.addWidget(btn_links)
        layout.addLayout(links)

        self.summary = QLabel(tr("puzzle.none"))
        self.summary.setWordWrap(True)
        self.summary.setTextInteractionFlags(Qt.TextInteractionFlag.TextBrowserInteraction)
        self.summary.linkActivated.connect(lambda _: self.last_nids and browse(self.last_nids))
        layout.addWidget(self.summary)

        # --- Filter, and checking many puzzles at once ---
        selection = QHBoxLayout()
        self.filter_edit = QLineEdit()
        self.filter_edit.setPlaceholderText(tr("puzzle.filter_placeholder"))
        self.filter_edit.setClearButtonEnabled(True)
        self.filter_edit.textChanged.connect(self.apply_filter)
        selection.addWidget(self.filter_edit, 1)
        selection.addWidget(QLabel(tr("puzzle.check")))
        for key, tip, slot in (
            ("puzzle.check_all", "puzzle.check_all_tip", self.check_all),
            ("puzzle.failed_only", "puzzle.check_failed_tip", self.check_failed),
            ("puzzle.check_none", "", self.uncheck_all),
        ):
            btn = QPushButton(tr(key))
            if tip:
                btn.setToolTip(tr(tip))
            btn.clicked.connect(slot)
            selection.addWidget(btn)
        layout.addLayout(selection)

        self.table = QTableWidget(0, 7)
        self.table.setHorizontalHeaderLabels(
            [
                "",
                tr("puzzle.table.puzzle"),
                tr("puzzle.table.date"),
                tr("puzzle.table.rating"),
                tr("puzzle.table.themes"),
                tr("puzzle.table.result"),
                tr("table.status"),
            ]
        )
        for col, width in COLUMN_WIDTHS.items():
            self.table.setColumnWidth(col, width)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.itemChanged.connect(lambda item: self.update_plan())
        self.table.currentCellChanged.connect(lambda row, *_: self.show_preview(row))
        restore_columns(self.table, COLUMNS_KEY)

        self.preview = BoardPreview()
        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.addWidget(self.table)
        splitter.addWidget(self.preview)
        splitter.setStretchFactor(0, 1)
        splitter.setCollapsible(0, False)
        layout.addWidget(splitter, 1)

        options = QHBoxLayout()
        options.addWidget(QLabel(tr("puzzle.deck_label")))
        self.deck_edit = QLineEdit(self.config.get("puzzle_deck") or self.default_deck)
        self.deck_edit.setToolTip(tr("puzzle.deck_tip"))
        options.addWidget(self.deck_edit, 1)
        self.fetch_games = QCheckBox(tr("puzzle.fetch_games"))
        self.fetch_games.setToolTip(tr("puzzle.fetch_games_tip"))
        self.fetch_games.setChecked(bool(self.config.get("puzzle_fetch_games", True)))
        self.fetch_games.toggled.connect(lambda _: self.update_plan())
        options.addWidget(self.fetch_games)
        layout.addLayout(options)

        bottom = QHBoxLayout()
        self.update_existing = QCheckBox(tr("form.update_existing"))
        self.update_existing.setChecked(bool(self.config.get("update_existing", False)))
        self.update_existing.toggled.connect(lambda _: self.update_plan())
        self.plan_label = QLabel()
        self.import_btn = QPushButton(tr("button.import"))
        self.import_btn.setEnabled(False)
        self.import_btn.clicked.connect(self.on_import)
        bottom.addWidget(self.update_existing)
        bottom.addWidget(self.plan_label, 1)
        bottom.addWidget(self.import_btn)
        layout.addLayout(bottom)
        if not self.base:
            self.summary.setText(tr("warn.no_note_types"))

    def save_layout(self):
        save_columns(self.table, COLUMNS_KEY)

    def save_options(self):
        """This page's options, into the config as it is now (the sync reads them)."""
        deck = decks.clean_deck_name(self.deck_edit.text()) or self.default_deck
        config = get_config()
        config.update(
            {
                "puzzle_max": self.max_spin.value(),
                "puzzle_all": self.all_check.isChecked(),
                "puzzle_failed_only": self.failed_first,
                "puzzle_fetch_games": self.fetch_games.isChecked(),
                "puzzle_deck": "" if deck == self.default_deck else deck,
                "puzzle_sync_failed_only": bool(self.sync_mode.currentData()),
                "puzzle_sync_on_open": self.sync_on_open.isChecked(),
                "puzzle_sync_button": self.sync_button.isChecked(),
                "update_existing": self.update_existing.isChecked(),
            }
        )
        write_config(config)
        self.config = config
        puzzle_sync.update_button(config)

    # --- Sync ---

    def update_sync_status(self):
        self.sync_status.setText(f"<small>{puzzle_sync.last_sync_text()}</small>")

    def on_sync(self):
        self.save_options()
        puzzle_sync.sync_puzzles(self, True, self.after_sync)

    def after_sync(self, message: str):
        self.update_sync_status()
        if self.cards:  # the statuses of the puzzles listed
            self.show_cards(self.cards, message)

    # --- Loading ---

    def on_load_activity(self):
        token = lichess_token()
        if not token and edit_token(self, tr("puzzle.token_needed")):
            token = lichess_token()
        if not token:
            return
        max_entries = None if self.all_check.isChecked() else self.max_spin.value()
        self.save_options()
        shown = {"count": 0}

        def show(waiting: str = ""):
            lines = (tr("puzzle.loading_activity", count=shown["count"]), waiting, tr("lichess.esc_cancels"))
            mw.progress.update(label="\n".join(line for line in lines if line))

        def progress(count: int):
            shown["count"] = count
            mw.taskman.run_on_main(show)

        def load(col):
            # A 429 is waited out in the progress window; Esc stops and keeps what came
            activity = fetch_puzzle_activity(
                token, max_entries, progress, mw.progress.want_cancel, lichess_waiter(show, mw.progress.want_cancel)
            )
            cards, unreadable = [], 0
            for entry in activity.entries:
                try:
                    cards.append(activity_card(entry))
                except (KeyError, TypeError, ValueError, AssertionError):  # a position python-chess can't read
                    unreadable += 1
            return activity, cards, unreadable

        QueryOp(parent=self, op=load, success=self.show_activity).failure(
            lambda e: showWarning(error_text(e), parent=self)
        ).with_progress(tr("puzzle.loading_activity", count=0)).without_collection().run_in_background()

    def show_activity(self, loaded):
        activity, cards, unreadable = loaded
        self.entries = {e["puzzle"]["id"]: e for e in activity.entries}
        notes = []
        if activity.stopped:
            notes.append(tr(f"puzzle.activity_{activity.stopped}", count=len(activity.entries)))
        if unreadable:
            notes.append(tr("puzzle.unreadable", count=unreadable))
        self.show_cards(cards, "<br>".join(notes))

    def fetch_puzzles(self, entries: list[tuple[str, bool | None, dict | None]], done: Callable):
        """Fetch each puzzle with its game in the background, then done((cards, error))."""
        shown = {"done": 0, "total": len(entries)}

        def show(waiting: str = ""):
            lines = (tr("puzzle.loading", done=shown["done"], total=shown["total"]), waiting, tr("lichess.esc_cancels"))
            mw.progress.update(label="\n".join(line for line in lines if line), value=shown["done"], max=shown["total"])

        def progress(count: int, total: int):
            shown.update(done=count, total=total)
            mw.taskman.run_on_main(show)

        # A 429 is waited out in the progress window; Esc stops and keeps the ones fetched
        wait = lichess_waiter(show, mw.progress.want_cancel)
        QueryOp(
            parent=self,
            op=lambda col: load_puzzles(entries, progress, wait, mw.progress.want_cancel),
            success=done,
        ).failure(lambda e: showWarning(error_text(e), parent=self)).with_progress(
            tr("puzzle.loading", done=0, total=len(entries))
        ).without_collection().run_in_background()

    def on_load_links(self):
        ids = parse_puzzle_ids(self.links_edit.text())
        if not ids:
            showWarning(tr("puzzle.invalid_links"), parent=self)
            return
        self.fetch_puzzles([(i, None, None) for i in ids], lambda fetched: self.show_links(fetched, len(ids)))

    def show_links(self, fetched, total: int):
        cards, error = fetched
        if error is not None and not cards and error.key != "error.cancelled":
            showWarning(error_text(error), parent=self)
            return
        self.entries = {}
        self.show_cards(cards, stop_text(error, len(cards), total) if error else "")

    def statuses_of(self, cards: list[PuzzleCard]) -> list[str]:
        """card_status of every card, with one search for the imported puzzles."""
        imported = anki_ops.imported_puzzles(mw.col)
        statuses = []
        for card in cards:
            nids = imported.get(card.puzzle_id)
            if not nids:
                statuses.append("new")
            elif card.opponent_move_first:
                statuses.append(anki_ops.card_status(mw.col, card, True, nids)[0])
            else:
                statuses.append("same")  # from your activity: no game to compare it with
        return statuses

    def show_cards(self, cards: list[PuzzleCard], summary: str = "", keep_checked: set[int] | None = None):
        """
        Fill the table. The puzzles not imported yet are checked (only the failed ones
        after "Only the failed ones"), or those in keep_checked (card indexes).
        """
        self.cards = cards
        self.statuses = self.statuses_of(cards)
        self.table.setSortingEnabled(False)
        self.table.setUpdatesEnabled(False)
        self.table.blockSignals(True)
        self.table.setRowCount(len(cards))
        for row, card in enumerate(cards):
            status = self.statuses[row]
            if keep_checked is None:
                checked = status != "same" and not (self.failed_first and card.win is True)
            else:
                checked = row in keep_checked
            check = QTableWidgetItem()
            check.setFlags(Qt.ItemFlag.ItemIsUserCheckable | Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsSelectable)
            check.setCheckState(Qt.CheckState.Checked if checked else Qt.CheckState.Unchecked)
            check.setData(Qt.ItemDataRole.UserRole, row)  # the card, whatever the sort
            self.table.setItem(row, COL_CHECK, check)
            self.table.setItem(row, COL_DATE, SortKeyItem(date_text(card.date), card.date or 0))
            self.table.setItem(row, COL_RATING, SortKeyItem(str(card.rating), card.rating))
            for col, value, tip in (
                (COL_PUZZLE, card.puzzle_id, card.chapter_url),
                (COL_THEMES, ", ".join(card.themes), ", ".join(card.themes)),
                (COL_RESULT, result_text(card), ""),
                (COL_STATUS, tr(f"status.{status}"), tr(f"status.{status}_tip")),
            ):
                self.table.setItem(row, col, readonly_item(value, tip))
            paint_status(self.table.item(row, COL_STATUS), status, self.table)
        self.table.blockSignals(False)
        self.table.setUpdatesEnabled(True)
        self.table.setSortingEnabled(True)
        failed = sum(c.win is False for c in cards)
        text = tr("puzzle.summary", count=len(cards), failed=failed)
        self.summary.setText(f"{text}<br>{summary}" if summary else text)
        self.apply_filter()
        self.update_plan()
        if not cards:
            tooltip(tr("puzzle.no_cards"), parent=self)

    def card_index(self, table_row: int) -> int | None:
        item = self.table.item(table_row, COL_CHECK)
        return item.data(Qt.ItemDataRole.UserRole) if item else None

    def apply_filter(self):
        words = self.filter_edit.text().lower().split()
        for i in range(self.table.rowCount()):
            index = self.card_index(i)
            card = self.cards[index] if index is not None else None
            text = " ".join([card.puzzle_id, *card.themes, result_text(card)]).lower() if card else ""
            self.table.setRowHidden(i, not all(w in text for w in words))

    def show_preview(self, table_row: int):
        index = self.card_index(table_row) if table_row >= 0 else None
        if index is None:
            self.preview.show_game(None)
            return
        card = self.cards[index]
        game = chess.pgn.read_game(io.StringIO(card.pgn()))
        white = game.headers.get("Orientation", "white") == "white"
        start = 1 if card.opponent_move_first else 0  # after the opponent's last move
        caption = f"<b>{card.name}</b><br>" + (", ".join(card.themes) or "")
        self.preview.show_game(game, start, white, caption)

    # --- Checking many at once ---

    def set_checks(self, want: Callable[[PuzzleCard], bool]):
        """
        Check the puzzles shown (the filter applies) that want() picks and importing
        changes (not imported yet, or any with "Update"), and uncheck all the others.
        """
        update = self.update_existing.isChecked()
        self.table.blockSignals(True)
        for i in range(self.table.rowCount()):
            index = self.card_index(i)
            on = (
                not self.table.isRowHidden(i)
                and want(self.cards[index])
                and (update or self.statuses[index] != "same")
            )
            self.table.item(i, COL_CHECK).setCheckState(Qt.CheckState.Checked if on else Qt.CheckState.Unchecked)
        self.table.blockSignals(False)
        self.update_plan()

    def check_all(self):
        self.failed_first = False
        self.set_checks(lambda card: True)

    def check_failed(self):
        self.failed_first = True
        self.set_checks(lambda card: card.win is False)

    def uncheck_all(self):
        self.set_checks(lambda card: False)

    # --- Import ---

    def checked(self) -> list[int]:
        """Indexes of the checked cards, in their loading order."""
        items = (self.table.item(i, COL_CHECK) for i in range(self.table.rowCount()))
        checked = Qt.CheckState.Checked
        return sorted(item.data(Qt.ItemDataRole.UserRole) for item in items if item.checkState() == checked)

    def needs_game(self, index: int, fetch_games: bool, update: bool) -> bool:
        """
        Whether importing a card fetches its puzzle's game first: a new one when "Start
        with the opponent's move" is checked, and every imported one that is updated
        (updating never drops the opponent's move from a note).
        """
        card = self.cards[index]
        if card.opponent_move_first or card.puzzle_id not in self.entries:
            return False
        return fetch_games if self.statuses[index] == "new" else update

    def update_plan(self):
        selected = self.checked() if self.cards else []
        if not selected:
            self.import_btn.setText(tr("button.import"))
            self.import_btn.setEnabled(False)
            self.plan_label.setText("")
            return
        self.import_btn.setText(tr("button.import_cards", count=len(selected)))
        self.import_btn.setEnabled(self.base is not None)
        update, fetch_games = self.update_existing.isChecked(), self.fetch_games.isChecked()
        text = plan_text([self.statuses[i] for i in selected], update)
        fetch = sum(self.needs_game(i, fetch_games, update) for i in selected)
        if fetch:
            minutes = max(1, math.ceil(fetch * SECONDS_PER_PUZZLE / 60))
            text += " · " + tr("puzzle.fetch_estimate", count=fetch, minutes=minutes)
        self.plan_label.setText(f"<small>{text}</small>")

    def on_import(self):
        selected = self.checked()
        if not selected or not self.base:
            return
        update, fetch_games = self.update_existing.isChecked(), self.fetch_games.isChecked()
        self.deck_edit.setText(decks.clean_deck_name(self.deck_edit.text()) or self.default_deck)
        self.save_options()
        to_fetch = [i for i in selected if self.needs_game(i, fetch_games, update)]
        if not to_fetch:
            self.import_cards(selected)
            return

        def fetched(result):
            cards, error = result
            for index, card in zip(to_fetch, cards):
                self.cards[index] = card
            left = set(to_fetch[len(cards) :])  # not fetched: they stay checked for later
            note = f"{stop_text(error, len(cards), len(to_fetch))} {tr('puzzle.rest_checked')}" if error else ""
            self.import_cards([i for i in selected if i not in left], left, note)

        self.fetch_puzzles(
            [(self.cards[i].puzzle_id, self.cards[i].win, self.entries[self.cards[i].puzzle_id]) for i in to_fetch],
            fetched,
        )

    def import_cards(self, indexes: list[int], left: set[int] = frozenset(), note: str = ""):
        update = self.update_existing.isChecked()
        # A card without its game never replaces an imported note: it would lose the opponent's move
        indexes = [
            i for i in indexes if not (update and self.statuses[i] != "new" and not self.cards[i].opponent_move_first)
        ]
        if not indexes:
            self.show_cards(self.cards, note, keep_checked=set(left))
            return
        selected = [self.cards[i] for i in indexes]
        try:
            models = {mode: anki_ops.ensure_mode_note_type(self.base, mode) for mode in {c.mode for c in selected}}
        except anki_ops.ChessImportError as e:
            showWarning(str(e), parent=self)
            return
        deck = self.deck_edit.text()
        rows = [(card, models[card.mode], decks.puzzle_placement(deck, card.win)) for card in selected]
        stats = {}

        def on_success(_changes):
            result = tr("puzzle.result", **stats)
            self.last_nids = stats.get("nids", [])
            tooltip(result, parent=mw)
            browse_link = tr("result.browse") if self.last_nids else ""
            summary = f"<b>{result}</b> {browse_link}" + (f"<br>{note}" if note else "")
            self.show_cards(self.cards, summary, keep_checked=set(left))

        CollectionOp(
            parent=self,
            op=lambda col: anki_ops.import_chapters(col, rows, update, True, stats, tr("puzzle.undo")),
        ).success(on_success).run_in_background()
