"""
Puzzles section of the import window's Lichess tab: the Lichess token on top (your puzzle
activity needs it; puzzle links don't), then three sections:

- Sync: the puzzles you played on Lichess, imported at once (see puzzle_sync.py), when
  Anki opens, every hour and from "Sync now"; how many puzzles are in Anki, and "Themes
  and training" (puzzle_themes_dialog.py).
- Cards: the deck (its Failed and Solved subdecks) and "Start with the opponent's move",
  for the sync and for importing here.
- Pick from your history: your activity (the latest puzzles or all of them, from the
  activity cache: only what is new is read from Lichess) or puzzle links, to check and
  import. The checked ones are fetched with their game when imported, so the card
  starts with the opponent's last move.
"""

from __future__ import annotations

import io
import math
import time
from typing import Callable

import aqt
from aqt import mw
from aqt.operations import CollectionOp, QueryOp
from aqt.qt import (
    QCheckBox,
    QComboBox,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QSpinBox,
    QSplitter,
    QStyle,
    Qt,
    QTableWidget,
    QTableWidgetItem,
    QToolButton,
    QVBoxLayout,
    QWidget,
)
from aqt.utils import askUser, showWarning, tooltip

from . import anki_ops, decks, puzzle_cache, puzzle_sync
from .chess_lib import chess
from .i18n import tr
from .lichess_api import parse_puzzle_ids
from .puzzle_themes import puzzle_stats, theme_names
from .puzzle_themes_dialog import PuzzleThemesDialog
from .puzzles import REQUEST_PAUSE, PuzzleCard, activity_card, load_puzzles
from .sync_flow import stop_text
from .ui_common import (
    BoardPreview,
    LichessProgress,
    SortKeyItem,
    browse,
    error_text,
    get_config,
    lichess_token,
    paint_status,
    plan_text,
    readonly_item,
    restore_columns,
    save_columns,
    write_config,
)
from .token_panel import TokenPanel

COL_CHECK, COL_PUZZLE, COL_DATE, COL_RATING, COL_THEMES, COL_RESULT, COL_STATUS = range(7)
COLUMN_WIDTHS = {COL_CHECK: 28, COL_PUZZLE: 90, COL_DATE: 90, COL_RATING: 70, COL_THEMES: 300, COL_RESULT: 80}
COLUMNS_KEY = "puzzleImportColumns2"  # the Date column changed the layout
MAX_LATEST = 10000
SECONDS_PER_PUZZLE = REQUEST_PAUSE + 0.3  # fetching a puzzle's game, with the pause


def date_text(ms: int | None) -> str:
    return time.strftime("%Y-%m-%d", time.localtime(ms / 1000)) if ms else ""


def result_text(card: PuzzleCard) -> str:
    return {True: tr("puzzle.solved"), False: tr("puzzle.failed")}.get(card.win, "")


def activity_cards(entries: list[dict]) -> tuple[list[PuzzleCard], int]:
    """Cards of activity entries, without requests, and how many couldn't be read."""
    cards, unreadable = [], 0
    for entry in entries:
        try:
            cards.append(activity_card(entry))
        except (KeyError, TypeError, ValueError, AssertionError):  # a position python-chess can't read
            unreadable += 1
    return cards, unreadable


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
        self.token_panel = TokenPanel(self)
        layout.addWidget(self.token_panel)
        layout.addWidget(self.sync_section())
        layout.addWidget(self.cards_section())
        layout.addWidget(self.history_section(), 1)
        if not self.base:
            self.summary.setText(tr("warn.no_note_types"))
        self.update_sync_status()
        self.token_panel.refresh()  # its account line is in the sync section now
        puzzle_sync.add_listener(self.after_sync)

    # --- Sections ---

    def option_check(self, key: str, tip: str, config_key: str, default: bool) -> QCheckBox:
        """A checkbox saved in the config as soon as it changes."""
        check = QCheckBox(tr(key))
        check.setToolTip(tr(tip))
        check.setChecked(bool(self.config.get(config_key, default)))
        check.toggled.connect(lambda _: self.save_options())
        return check

    def sync_section(self) -> QGroupBox:
        box = QGroupBox(tr("puzzle.section_sync"))
        rows = QVBoxLayout(box)
        options = QHBoxLayout()
        self.sync_mode = QComboBox()
        self.sync_mode.addItem(tr("puzzle.sync_all"), False)
        self.sync_mode.addItem(tr("puzzle.failed_only"), True)
        self.sync_mode.setCurrentIndex(1 if self.config.get("puzzle_sync_failed_only", False) else 0)
        self.sync_mode.setToolTip(tr("puzzle.sync_mode_tip"))
        self.sync_mode.currentIndexChanged.connect(lambda _: self.save_options())
        self.sync_on_open = self.option_check(
            "puzzle.sync_on_open", "puzzle.sync_on_open_tip", "puzzle_sync_on_open", True
        )
        self.sync_hourly = self.option_check("puzzle.sync_hourly", "puzzle.sync_hourly_tip", "puzzle_sync_hourly", True)
        self.sync_button = self.option_check(
            "puzzle.sync_button_check", "puzzle.sync_button_tip", "puzzle_sync_button", True
        )
        btn_sync = QPushButton(tr("puzzle.sync_now"))
        btn_sync.setToolTip(tr("puzzle.sync_now_tip"))
        btn_sync.clicked.connect(self.on_sync)
        for widget in (QLabel(tr("puzzle.sync_import")), self.sync_mode, self.sync_on_open, self.sync_hourly):
            options.addWidget(widget)
        options.addWidget(self.sync_button)
        options.addStretch(1)
        options.addWidget(btn_sync)
        rows.addLayout(options)

        status = QHBoxLayout()
        self.sync_status = QLabel()
        btn_themes = QPushButton(tr("puzzle.themes_button"))
        btn_themes.setToolTip(tr("puzzle.themes_button_tip"))
        btn_themes.clicked.connect(self.on_themes)
        status.addWidget(self.sync_status, 1)
        # The saved token's account, Change and Remove (without one, its panel is above)
        status.addWidget(self.token_panel.saved_row)
        status.addSpacing(12)
        status.addWidget(btn_themes)
        rows.addLayout(status)
        return box

    def cards_section(self) -> QGroupBox:
        box = QGroupBox(tr("puzzle.section_cards"))
        row = QHBoxLayout(box)
        self.deck_edit = QLineEdit(self.config.get("puzzle_deck") or self.default_deck)
        self.deck_edit.setToolTip(tr("puzzle.deck_tip"))
        self.deck_edit.editingFinished.connect(self.save_options)
        self.fetch_games = QCheckBox(tr("puzzle.fetch_games"))
        self.fetch_games.setToolTip(tr("puzzle.fetch_games_tip"))
        self.fetch_games.setChecked(bool(self.config.get("puzzle_fetch_games", True)))
        self.fetch_games.toggled.connect(lambda _: (self.update_plan(), self.save_options()))
        row.addWidget(QLabel(tr("puzzle.deck_label")))
        row.addWidget(self.deck_edit, 1)
        row.addWidget(self.fetch_games)
        return box

    def history_section(self) -> QGroupBox:
        box = QGroupBox(tr("puzzle.section_history"))
        rows = QVBoxLayout(box)

        # Your activity (with the token above), or puzzle links
        source = QHBoxLayout()
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
        btn_reload = QToolButton()
        btn_reload.setIcon(self.style().standardIcon(QStyle.StandardPixmap.SP_BrowserReload))
        btn_reload.setToolTip(tr("puzzle.reload_tip"))
        btn_reload.clicked.connect(self.on_reload)
        self.links_edit = QLineEdit()
        self.links_edit.setPlaceholderText(tr("puzzle.links_placeholder"))
        self.links_edit.returnPressed.connect(self.on_load_links)
        btn_links = QPushButton(tr("source.load_url"))
        btn_links.clicked.connect(self.on_load_links)
        for widget in (QLabel(tr("puzzle.last")), self.max_spin, self.all_check, btn_activity, btn_reload):
            source.addWidget(widget)
        source.addSpacing(16)
        source.addWidget(self.links_edit, 1)
        source.addWidget(btn_links)
        rows.addLayout(source)

        self.summary = QLabel(tr("puzzle.none"))
        self.summary.setWordWrap(True)
        self.summary.setTextInteractionFlags(Qt.TextInteractionFlag.TextBrowserInteraction)
        self.summary.linkActivated.connect(lambda _: self.last_nids and browse(self.last_nids))
        rows.addWidget(self.summary)

        # Filter, and checking many puzzles at once
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
        rows.addLayout(selection)

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
        rows.addWidget(splitter, 1)

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
        rows.addLayout(bottom)
        return box

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
                "puzzle_sync_hourly": self.sync_hourly.isChecked(),
                "puzzle_sync_button": self.sync_button.isChecked(),
                "update_existing": self.update_existing.isChecked(),
            }
        )
        write_config(config)
        self.config = config
        puzzle_sync.update_button(config)

    # --- Sync and themes ---

    def update_sync_status(self):
        total, failed, _themes = puzzle_stats(anki_ops.puzzle_tag_strings(mw.col)) if mw.col else (0, 0, {})
        in_anki = tr("puzzle.in_anki", count=total, failed=failed)
        self.sync_status.setText(f"<small>{puzzle_sync.last_sync_text()} · {in_anki}</small>")

    def has_token(self) -> bool:
        """Your puzzle activity needs the token: without one, its field says so."""
        if lichess_token():
            return True
        self.token_panel.ask(tr("puzzle.token_needed"))
        return False

    def on_sync(self):
        self.save_options()
        if self.has_token():
            puzzle_sync.sync_puzzles(self, True)

    def after_sync(self, message: str):
        """A sync ended (from here, the menu bar button or on its own)."""
        self.update_sync_status()
        if self.cards:  # the statuses of the puzzles listed
            self.show_cards(self.cards, message)

    def on_themes(self):
        dialog = PuzzleThemesDialog(self)
        if not dialog.exec() or not dialog.search:
            return
        search = dialog.search
        # This window is modal: Anki's filtered deck window opens once it is closed
        self.window().reject()
        mw.progress.single_shot(
            0, lambda: aqt.dialogs.open("FilteredDeckConfigDialog", mw, search=search), False
        )

    # --- Loading ---

    def on_load_activity(self):
        if not self.has_token():
            return
        token = lichess_token()
        all_history, latest = self.all_check.isChecked(), self.max_spin.value()
        self.save_options()
        user = puzzle_sync.cache_user(self.config)
        progress = LichessProgress()

        def load(col):
            # From the activity cache: only the puzzles it lacks come from Lichess. A 429 is
            # waited out in the progress window; Esc stops and keeps what came
            cache, stopped = puzzle_cache.refresh_cached(
                puzzle_cache.FOLDER,
                user,
                token,
                back_to=0 if all_history else None,
                need=None if all_history else latest,
                progress=lambda count: progress.set(tr("puzzle.loading_activity", count=count)),
                cancelled=progress.cancelled,
                wait=progress.wait(),
            )
            entries = cache.entries if all_history else cache.entries[:latest]
            return stopped, entries, *activity_cards(entries)

        QueryOp(parent=self, op=load, success=self.show_activity).failure(
            lambda e: showWarning(error_text(e), parent=self)
        ).with_progress(tr("puzzle.loading_activity", count=0)).without_collection().run_in_background()

    def on_reload(self):
        """Forget the activity cache and load again: results changed on Lichess come with it."""
        if not askUser(tr("puzzle.reload_ask"), parent=self):
            return
        puzzle_cache.clear_cache(puzzle_cache.FOLDER, puzzle_sync.cache_user(get_config()))
        self.on_load_activity()

    def show_activity(self, loaded):
        stopped, entries, cards, unreadable = loaded
        self.entries = {e["puzzle"]["id"]: e for e in entries}
        notes = []
        if stopped:
            notes.append(tr(f"puzzle.activity_{stopped}", count=len(entries)))
        if unreadable:
            notes.append(tr("puzzle.unreadable", count=unreadable))
        self.show_cards(cards, "<br>".join(notes))

    def fetch_puzzles(self, entries: list[tuple[str, bool | None, dict | None]], done: Callable):
        """Fetch each puzzle with its game in the background, then done((cards, error))."""
        progress = LichessProgress()

        def fetching(count: int, total: int):
            progress.set(tr("puzzle.loading", done=count, total=total), count, total)

        # A 429 is waited out in the progress window; Esc stops and keeps the ones fetched
        QueryOp(
            parent=self,
            op=lambda col: load_puzzles(entries, fetching, progress.wait(), progress.cancelled),
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
            names = theme_names(card.themes)
            for col, value, tip in (
                (COL_PUZZLE, card.puzzle_id, card.chapter_url),
                (COL_THEMES, names, names),
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
        """Puzzles shown: every word of the filter in their id, themes (keys or names) or result."""
        words = self.filter_edit.text().lower().split()
        for i in range(self.table.rowCount()):
            index = self.card_index(i)
            card = self.cards[index] if index is not None else None
            text = ""
            if card:
                text = " ".join([card.puzzle_id, *card.themes, theme_names(card.themes), result_text(card)]).lower()
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
        caption = f"<b>{card.name}</b><br>{theme_names(card.themes)}"
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
            self.update_sync_status()

        CollectionOp(
            parent=self,
            op=lambda col: anki_ops.import_chapters(col, rows, update, True, stats, tr("puzzle.undo")),
        ).success(on_success).run_in_background()
