"""
Your Lichess puzzles in Anki by theme (the lichess::puzzle::theme:: tags): how many,
how many you failed, and a filtered deck to train one. "Train" closes the dialog with
self.search, the search of Anki's filtered deck window, which the Puzzles page opens.
"""

from __future__ import annotations

from aqt import mw
from aqt.qt import (
    QCheckBox,
    QDialog,
    QDialogButtonBox,
    QHBoxLayout,
    QLabel,
    QPushButton,
    Qt,
    QTableWidget,
    QTableWidgetItem,
    QVBoxLayout,
)

from . import anki_ops
from .i18n import tr
from .puzzle_themes import THEME_TAG, puzzle_stats, theme_name, theme_search
from .ui_common import SortKeyItem, restore_columns, restore_window, save_columns, save_window

WINDOW_KEY = "ankiChessPuzzleThemes"
COLUMNS_KEY = "ankiChessPuzzleThemesColumns"
COL_THEME, COL_PUZZLES, COL_FAILED, COL_RATE = range(4)


class PuzzleThemesDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle(tr("puzzle.themes_title"))
        self.search = ""
        total, failed, themes = puzzle_stats(anki_ops.puzzle_tag_strings(mw.col))
        layout = QVBoxLayout(self)
        intro = QLabel(tr("puzzle.themes_intro", count=total, failed=failed) if total else tr("puzzle.themes_none"))
        intro.setWordWrap(True)
        layout.addWidget(intro)

        self.table = QTableWidget(len(themes), 4)
        self.table.setHorizontalHeaderLabels(
            [
                tr("puzzle.themes_col_theme"),
                tr("puzzle.themes_col_puzzles"),
                tr("puzzle.themes_col_failed"),
                tr("puzzle.themes_col_rate"),
            ]
        )
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QTableWidget.SelectionMode.SingleSelection)
        # Most failed first, then most puzzles (the sort below keeps this order for ties)
        ordered = sorted(themes.items(), key=lambda kv: (-kv[1][1], -kv[1][0], theme_name(kv[0])))
        for row, (key, (count, missed)) in enumerate(ordered):
            name = QTableWidgetItem(theme_name(key))
            name.setData(Qt.ItemDataRole.UserRole, key)
            name.setToolTip(f"{THEME_TAG}{key}")
            name.setFlags(Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsSelectable)
            rate = 100 * missed / count if count else 0
            self.table.setItem(row, COL_THEME, name)
            self.table.setItem(row, COL_PUZZLES, SortKeyItem(str(count), count))
            self.table.setItem(row, COL_FAILED, SortKeyItem(str(missed), missed))
            self.table.setItem(row, COL_RATE, SortKeyItem(f"{rate:.0f}%", rate))
        self.table.setColumnWidth(COL_THEME, 220)
        # The themes you fail most first, unless you sorted otherwise last time (restored
        # with the columns); turning sorting on sorts by it
        self.table.horizontalHeader().setSortIndicator(COL_FAILED, Qt.SortOrder.DescendingOrder)
        restore_columns(self.table, COLUMNS_KEY)
        self.table.setSortingEnabled(True)
        self.table.itemSelectionChanged.connect(self.update_train)
        self.table.itemDoubleClicked.connect(lambda _: self.train())
        layout.addWidget(self.table, 1)

        bottom = QHBoxLayout()
        self.failed_only = QCheckBox(tr("puzzle.failed_only"))
        self.failed_only.setToolTip(tr("puzzle.themes_failed_tip"))
        self.failed_only.setChecked(failed > 0)
        bottom.addWidget(self.failed_only)
        bottom.addStretch(1)
        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Close)
        self.train_btn = QPushButton(tr("puzzle.themes_train"))
        self.train_btn.setToolTip(tr("puzzle.themes_train_tip"))
        self.train_btn.clicked.connect(self.train)
        buttons.addButton(self.train_btn, QDialogButtonBox.ButtonRole.ActionRole)
        buttons.rejected.connect(self.reject)
        bottom.addWidget(buttons)
        layout.addLayout(bottom)
        if themes:
            self.table.selectRow(0)
        self.update_train()
        restore_window(self, WINDOW_KEY, (560, 560))

    def selected_key(self) -> str | None:
        rows = self.table.selectionModel().selectedRows()
        item = self.table.item(rows[0].row(), COL_THEME) if rows else None
        return item.data(Qt.ItemDataRole.UserRole) if item else None

    def update_train(self):
        self.train_btn.setEnabled(self.selected_key() is not None)

    def train(self):
        key = self.selected_key()
        if key is None:
            return
        self.search = theme_search(key, self.failed_only.isChecked())
        self.accept()

    def done(self, result: int):
        save_window(self, WINDOW_KEY)
        save_columns(self.table, COLUMNS_KEY)
        super().done(result)
