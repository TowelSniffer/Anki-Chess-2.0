"""
Puzzles page of the import window: import Lichess puzzles, from your puzzle activity
(the ones you failed, by default) or from puzzle links, as cards in a deck of their own
(<root>::Lichess puzzles by default).
"""

from __future__ import annotations

import io
import time

from aqt import mw
from aqt.operations import CollectionOp, QueryOp
from aqt.qt import (
    QCheckBox,
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

from . import anki_ops, decks
from .chess_lib import chess
from .i18n import tr
from .lichess_api import LichessError, fetch_puzzle, fetch_puzzle_activity, parse_puzzle_ids
from .puzzles import PuzzleCard, puzzle_card
from .ui_common import (
    BoardPreview,
    browse,
    error_text,
    get_config,
    paint_status,
    plan_text,
    readonly_item,
    restore_columns,
    lichess_token,
    lichess_waiter,
    save_columns,
    write_config,
)
from .token_dialog import edit_token

COL_CHECK, COL_PUZZLE, COL_RATING, COL_THEMES, COL_RESULT, COL_STATUS = range(6)
COLUMN_WIDTHS = {COL_CHECK: 28, COL_PUZZLE: 90, COL_RATING: 70, COL_THEMES: 300, COL_RESULT: 80}
COLUMNS_KEY = "puzzleImportColumns"
REQUEST_PAUSE = 0.3  # seconds between puzzle requests, to stay under Lichess' rate limit


def load_puzzles(
    entries: list[tuple[str, bool | None, dict | None]], progress, wait=None
) -> list[PuzzleCard]:
    """
    Cards for (puzzle id, your result, activity entry) items. Each puzzle is fetched
    with its game, to start the card before the opponent's last move; an activity
    entry without it still gives a card from the puzzle position. wait: see lichess_api.
    """
    cards = []
    for done, (puzzle_id, win, entry) in enumerate(entries):
        progress(done, len(entries))
        try:
            data = fetch_puzzle(puzzle_id, wait=wait)
        except LichessError as e:
            if entry is None or e.key == "error.cancelled":
                raise
            data = entry
        cards.append(puzzle_card(data, win))
        time.sleep(REQUEST_PAUSE)
    return cards


class NumberItem(QTableWidgetItem):
    """Cell sorted by its number (ratings), not as text."""

    def __lt__(self, other):
        return int(self.text() or 0) < int(other.text() or 0)


class PuzzleImportPage(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.config = get_config()
        self.cards: list[PuzzleCard] = []
        self.statuses: list[str] = []
        self.last_nids: list[int] = []
        self.base = anki_ops.default_base(self.config.get("base_note_type", ""))
        root = decks.root_name(self.config.get("deck_root"))
        self.default_deck = f"{root}::{tr('deck.puzzles')}"

        layout = QVBoxLayout(self)

        # --- Your puzzle activity (with the token of the window's bottom bar) ---
        activity = QHBoxLayout()
        self.max_spin = QSpinBox()
        self.max_spin.setRange(1, 500)
        self.max_spin.setValue(int(self.config.get("puzzle_max", 50)))
        self.failed_only = QCheckBox(tr("puzzle.failed_only"))
        self.failed_only.setChecked(bool(self.config.get("puzzle_failed_only", True)))
        btn_activity = QPushButton(tr("puzzle.load_activity"))
        btn_activity.setToolTip(tr("puzzle.token_tip"))
        btn_activity.clicked.connect(self.on_load_activity)
        for widget in (QLabel(tr("puzzle.last")), self.max_spin, self.failed_only, btn_activity):
            activity.addWidget(widget)
        activity.addStretch(1)
        layout.addLayout(activity)

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

        filters = QHBoxLayout()
        self.filter_edit = QLineEdit()
        self.filter_edit.setPlaceholderText(tr("puzzle.filter_placeholder"))
        self.filter_edit.setClearButtonEnabled(True)
        self.filter_edit.textChanged.connect(self.apply_filter)
        deck_label = QLabel(tr("puzzle.deck_label"))
        self.deck_edit = QLineEdit(self.config.get("puzzle_deck") or self.default_deck)
        self.deck_edit.setToolTip(tr("form.study_deck_tip"))
        filters.addWidget(self.filter_edit, 1)
        filters.addWidget(deck_label)
        filters.addWidget(self.deck_edit, 1)
        layout.addLayout(filters)

        self.table = QTableWidget(0, 6)
        self.table.setHorizontalHeaderLabels(
            [
                "",
                tr("puzzle.table.puzzle"),
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

    # --- Loading ---

    def run_loading(self, entries_op):
        """entries_op() -> [(puzzle id, win, activity entry)], then each puzzle is fetched."""
        shown = {"done": 0, "total": 0}

        def show(waiting: str = ""):
            label = tr("puzzle.loading", done=shown["done"], total=shown["total"])
            if waiting:
                label = f"{label}\n{waiting}\n{tr('lichess.esc_cancels')}"
            mw.progress.update(label=label, value=shown["done"], max=shown["total"])

        def progress(done, total):
            shown.update(done=done, total=total)
            mw.taskman.run_on_main(show)

        # A 429 is waited out in the progress window (Esc gives up)
        wait = lichess_waiter(show, mw.progress.want_cancel)
        QueryOp(
            parent=self,
            op=lambda col: load_puzzles(entries_op(), progress, wait),
            success=self.show_cards,
        ).failure(lambda e: showWarning(error_text(e), parent=self)).with_progress(
            tr("puzzle.loading", done=0, total="?")
        ).without_collection().run_in_background()

    def on_load_activity(self):
        token = lichess_token()
        if not token and edit_token(self, tr("puzzle.token_needed")):
            token = lichess_token()
        if not token:
            return
        failed_only = self.failed_only.isChecked()
        max_entries = self.max_spin.value()

        def entries():
            activity = fetch_puzzle_activity(token, max_entries)
            return [
                (e["puzzle"]["id"], e.get("win"), e)
                for e in activity
                if not (failed_only and e.get("win"))
            ]

        self.run_loading(entries)

    def on_load_links(self):
        ids = parse_puzzle_ids(self.links_edit.text())
        if not ids:
            showWarning(tr("puzzle.invalid_links"), parent=self)
            return
        self.run_loading(lambda: [(i, None, None) for i in ids])

    def show_cards(self, cards: list[PuzzleCard], summary: str = ""):
        self.cards = cards
        self.statuses = [anki_ops.card_status(mw.col, c, True)[0] for c in cards]
        self.table.setSortingEnabled(False)
        self.table.blockSignals(True)
        self.table.setRowCount(len(cards))
        for row, card in enumerate(cards):
            check = QTableWidgetItem()
            check.setFlags(Qt.ItemFlag.ItemIsUserCheckable | Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsSelectable)
            checked = self.statuses[row] != "same"
            check.setCheckState(Qt.CheckState.Checked if checked else Qt.CheckState.Unchecked)
            check.setData(Qt.ItemDataRole.UserRole, row)  # the card, whatever the sort
            self.table.setItem(row, COL_CHECK, check)
            result = {True: tr("puzzle.solved"), False: tr("puzzle.failed")}.get(card.win, "")
            rating = NumberItem(str(card.rating))
            rating.setFlags(Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsSelectable)
            self.table.setItem(row, COL_RATING, rating)
            status = self.statuses[row]
            for col, value, tip in (
                (COL_PUZZLE, card.puzzle_id, card.chapter_url),
                (COL_THEMES, ", ".join(card.themes), ", ".join(card.themes)),
                (COL_RESULT, result, ""),
                (COL_STATUS, tr(f"status.{status}"), tr(f"status.{status}_tip")),
            ):
                self.table.setItem(row, col, readonly_item(value, tip))
            paint_status(self.table.item(row, COL_STATUS), status, self.table)
        self.table.blockSignals(False)
        self.table.setSortingEnabled(True)
        failed = sum(c.win is False for c in cards)
        text = tr("puzzle.summary", count=len(cards), failed=failed)
        self.summary.setText(f"{text}<br>{summary}" if summary else text)
        self.apply_filter()
        self.update_plan()
        if not cards:
            tooltip(tr("puzzle.no_cards"), parent=self)

    def card_at(self, table_row: int) -> PuzzleCard | None:
        item = self.table.item(table_row, COL_CHECK)
        return self.cards[item.data(Qt.ItemDataRole.UserRole)] if item else None

    def apply_filter(self):
        words = self.filter_edit.text().lower().split()
        for i in range(self.table.rowCount()):
            card = self.card_at(i)
            text = " ".join([card.puzzle_id, *card.themes]).lower() if card else ""
            self.table.setRowHidden(i, not all(w in text for w in words))

    def show_preview(self, table_row: int):
        card = self.card_at(table_row) if table_row >= 0 else None
        if card is None:
            self.preview.show_game(None)
            return
        game = chess.pgn.read_game(io.StringIO(card.pgn()))
        white = game.headers.get("Orientation", "white") == "white"
        start = 1 if card.mode == "flipped" else 0  # after the opponent's last move
        caption = f"<b>{card.name}</b><br>" + (", ".join(card.themes) or "")
        self.preview.show_game(game, start, white, caption)

    # --- Import ---

    def checked(self) -> list[tuple[PuzzleCard, str]]:
        items = (self.table.item(i, COL_CHECK) for i in range(self.table.rowCount()))
        rows = [item.data(Qt.ItemDataRole.UserRole) for item in items if item.checkState() == Qt.CheckState.Checked]
        return [(self.cards[r], self.statuses[r]) for r in sorted(rows)]

    def update_plan(self):
        selected = self.checked() if self.cards else []
        if not selected:
            self.import_btn.setText(tr("button.import"))
            self.import_btn.setEnabled(False)
            self.plan_label.setText("")
            return
        self.import_btn.setText(tr("button.import_cards", count=len(selected)))
        self.import_btn.setEnabled(self.base is not None)
        statuses = [status for _, status in selected]
        self.plan_label.setText(f"<small>{plan_text(statuses, self.update_existing.isChecked())}</small>")

    def on_import(self):
        selected = [card for card, _ in self.checked()]
        if not selected or not self.base:
            return
        try:
            models = {
                mode: anki_ops.ensure_mode_note_type(self.base, mode) for mode in {c.mode for c in selected}
            }
        except anki_ops.ChessImportError as e:
            showWarning(str(e), parent=self)
            return
        deck = decks.clean_deck_name(self.deck_edit.text()) or self.default_deck
        self.deck_edit.setText(deck)
        placement = decks.Placement(deck)
        rows = [(card, models[card.mode], placement) for card in selected]
        update_existing = self.update_existing.isChecked()
        self.config.update(
            {
                "puzzle_max": self.max_spin.value(),
                "puzzle_failed_only": self.failed_only.isChecked(),
                "puzzle_deck": "" if deck == self.default_deck else deck,
                "update_existing": update_existing,
            }
        )
        write_config(self.config)
        stats = {}

        def on_success(_changes):
            result = tr("puzzle.result", **stats)
            self.last_nids = stats.get("nids", [])
            tooltip(result, parent=mw)
            browse_link = tr("result.browse") if self.last_nids else ""
            self.show_cards(self.cards, f"<b>{result}</b> {browse_link}")

        CollectionOp(
            parent=self,
            op=lambda col: anki_ops.import_chapters(
                col, rows, update_existing, True, stats, tr("puzzle.undo")
            ),
        ).success(on_success).run_in_background()
