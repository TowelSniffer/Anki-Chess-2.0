"""
Qt pieces shared by the import pages: config and the saved Lichess token, language,
window and column layout kept in the Anki profile, the wait after a Lichess 429, the
"Paste PGN" dialog, the board preview and the status colours.
"""

from __future__ import annotations

import math
import time
from typing import Callable

import anki.lang
import aqt
from aqt import mw
from aqt.qt import (
    QByteArray,
    QColor,
    QDialog,
    QDialogButtonBox,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QMenu,
    QPalette,
    QPlainTextEdit,
    QStyle,
    Qt,
    QTableWidget,
    QTableWidgetItem,
    QToolButton,
    QVBoxLayout,
    QWidget,
)
from aqt.utils import restoreGeom, restoreHeader, saveGeom, saveHeader

from .chess_lib import chess
from .i18n import resolve_language, set_language, tr
from .lichess_api import Wait

try:  # Anki ships PyQt6 with the SVG module; without it there is no board preview
    from PyQt6.QtSvgWidgets import QSvgWidget
except ImportError:
    QSvgWidget = None

# Token form with the scopes the add-on uses already checked
TOKEN_URL = (
    "https://lichess.org/account/oauth/token/create"
    "?scopes[]=study:read&scopes[]=puzzle:read&description=AnkiChess%20importer"
)
TOKEN_KEYS = ("lichess_token", "lichess_token_user")
# Status colours, readable on light and dark themes
STATUS_COLORS = {
    "new": ("#2e7d32", "#81c784"),
    "changed": ("#b26a00", "#ffb74d"),
}


def get_config() -> dict:
    return mw.addonManager.getConfig(__name__) or {}


def write_config(config: dict) -> None:
    # The token is saved by its dialog alone (save_token): a page's older copy of the
    # config keeps the one saved now
    current = get_config()
    config.update({key: current[key] for key in TOKEN_KEYS if key in current})
    mw.addonManager.writeConfig(__name__, config)


def lichess_token() -> str:
    """The saved Lichess token, read now (pages keep a copy of the config from when they opened)."""
    return str(get_config().get("lichess_token", "")).strip()


def save_token(token: str, user: str) -> None:
    config = get_config()
    config.update(lichess_token=token.strip(), lichess_token_user=user)
    mw.addonManager.writeConfig(__name__, config)


def lichess_waiter(show: Callable[[str], None], cancelled: Callable[[], bool] = lambda: False) -> Wait:
    """
    The wait of a Lichess request after a 429, run in the background: counts the seconds
    down in show(text) on the main thread (show("") when done) and gives up if cancelled().
    """

    def wait(seconds: float, key: str) -> bool:
        end = time.monotonic() + seconds
        while (left := end - time.monotonic()) > 0:
            if cancelled():
                return False
            text = tr(key, seconds=math.ceil(left))
            mw.taskman.run_on_main(lambda text=text: show(text))
            time.sleep(min(1.0, left))
        mw.taskman.run_on_main(lambda: show(""))
        return not cancelled()

    return wait


def apply_language() -> None:
    # "en" (default), "pt-BR", or "auto" to follow Anki's interface language
    setting = get_config().get("language")
    set_language(resolve_language(setting, getattr(anki.lang, "current_lang", None)))


def error_text(e: Exception) -> str:
    """Errors raised with an i18n key (Lichess, Chess.com, Stockfish), translated."""
    key = getattr(e, "key", None)
    if not key:
        return str(e)
    params = dict(getattr(e, "params", {}))
    if "hint" in params:
        params["hint"] = tr(params["hint"])
    return tr(key, **params)


def is_dark(widget: QWidget) -> bool:
    return widget.palette().color(QPalette.ColorRole.Window).lightness() < 128


def status_color(status: str, widget: QWidget) -> QColor | None:
    """Colour of a status (new, changed); imported ones keep the normal text colour."""
    colors = STATUS_COLORS.get(status)
    return QColor(colors[is_dark(widget)]) if colors else None


def paint_status(item: QTableWidgetItem, status: str, widget: QWidget):
    """Colour and weight of a status cell (new and changed stand out)."""
    color = status_color(status, widget)
    if color is not None:
        item.setForeground(color)
        font = item.font()
        font.setBold(True)
        item.setFont(font)


def plan_text(statuses: list[str], update: bool) -> str:
    """What importing these cards does: new, updated, unchanged and skipped notes."""
    new = statuses.count("new")
    existing = len(statuses) - new
    changed = statuses.count("changed")
    return tr(
        "plan.summary_cards",
        new=new,
        update=changed if update else 0,
        same=existing - changed if update else 0,
        skip=0 if update else existing,
    )


def browse(nids: list[int]):
    """Show notes in Anki's Browser."""
    aqt.dialogs.open("Browser", mw, search=(f"nid:{','.join(str(n) for n in nids)}",))


# --- Window and column layout ---


def restore_window(window: QWidget, key: str, size: tuple[int, int]):
    """Maximize button, and the size and position of the last time."""
    window.setWindowFlags(window.windowFlags() | Qt.WindowType.WindowMaximizeButtonHint)
    restoreGeom(window, key, default_size=size)


def save_window(window: QWidget, key: str):
    saveGeom(window, key)


def restore_columns(table: QTableWidget, key: str, hidden: tuple[int, ...] = ()):
    """
    Columns resized by dragging (the last one fills the width) and hidden or shown from
    the header's context menu, kept from the last time; `hidden` ones start hidden.
    """
    table.setWordWrap(False)
    table.verticalHeader().setVisible(False)
    header = table.horizontalHeader()
    header.setSectionResizeMode(QHeaderView.ResizeMode.Interactive)
    header.setStretchLastSection(True)
    header.setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)
    header.customContextMenuRequested.connect(lambda pos: _column_menu(table, pos))
    for col in hidden:
        header.setSectionHidden(col, True)
    restoreHeader(header, key)


def save_columns(table: QTableWidget, key: str):
    saveHeader(table.horizontalHeader(), key)


def _column_menu(table: QTableWidget, pos):
    header = table.horizontalHeader()
    menu = QMenu(table)
    for col in range(1, table.columnCount()):  # the check column always stays
        action = menu.addAction(table.horizontalHeaderItem(col).text())
        action.setCheckable(True)
        action.setChecked(not header.isSectionHidden(col))
        action.toggled.connect(lambda shown, c=col: header.setSectionHidden(c, not shown))
    menu.exec(header.mapToGlobal(pos))


def readonly_item(text: str, tip: str = "") -> QTableWidgetItem:
    item = QTableWidgetItem(text)
    item.setFlags(Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsSelectable)
    if tip:
        item.setToolTip(tip)
    return item


# --- Dialogs and widgets ---


class PasteDialog(QDialog):
    def __init__(self, parent):
        super().__init__(parent)
        self.setWindowTitle(tr("cc.paste_title"))
        self.resize(640, 420)
        layout = QVBoxLayout(self)
        layout.addWidget(QLabel(tr("cc.paste_label")))
        self.edit = QPlainTextEdit()
        layout.addWidget(self.edit, 1)
        buttons = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        buttons.button(QDialogButtonBox.StandardButton.Cancel).setText(tr("button.cancel"))
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)


def ask_pgn(parent) -> str:
    """PGN pasted by the user, or "" if cancelled."""
    dialog = PasteDialog(parent)
    return dialog.edit.toPlainText().strip() if dialog.exec() else ""


class BoardPreview(QWidget):
    """
    The board where you start playing a card, with buttons to step through its main
    line and a caption under it.
    """

    SIZE = 260

    def __init__(self, parent=None):
        super().__init__(parent)
        self.nodes: list = []  # the game and its main line moves
        self.index = 0
        self.white_below = True
        layout = QVBoxLayout(self)
        layout.setContentsMargins(6, 0, 0, 0)
        self.board = QSvgWidget() if QSvgWidget else None
        if self.board:
            self.board.setFixedSize(self.SIZE, self.SIZE)
            layout.addWidget(self.board, 0, Qt.AlignmentFlag.AlignHCenter)

        nav = QHBoxLayout()
        self.buttons = []
        icons = QStyle.StandardPixmap
        for icon, tip, step in (
            (icons.SP_MediaSkipBackward, "preview.first", None),
            (icons.SP_MediaSeekBackward, "preview.back", -1),
            (icons.SP_MediaSeekForward, "preview.forward", 1),
        ):
            button = QToolButton()
            button.setIcon(self.style().standardIcon(icon))  # not glyphs: every font draws them
            button.setToolTip(tr(tip))
            button.clicked.connect(lambda _, s=step: self.step(s))
            nav.addWidget(button)
            self.buttons.append(button)
        self.move_label = QLabel()
        nav.addWidget(self.move_label, 1)
        layout.addLayout(nav)

        self.caption = QLabel(tr("preview.none"))
        self.caption.setWordWrap(True)
        self.caption.setMaximumWidth(self.SIZE + 20)
        self.caption.setAlignment(Qt.AlignmentFlag.AlignTop)
        layout.addWidget(self.caption, 1)
        self.show_game(None)

    def show_game(self, game, start: int = 0, white_below: bool = True, caption: str = ""):
        """game: a chess.pgn.Game (or None); start: the ply shown first."""
        self.nodes = [game, *game.mainline()] if game is not None else []
        self.index = min(start, max(0, len(self.nodes) - 1))
        self.white_below = white_below
        self.caption.setText(caption or tr("preview.none"))
        self.start = self.index
        self.render()

    def step(self, step: int | None):
        if not self.nodes:
            return
        self.index = self.start if step is None else max(0, min(len(self.nodes) - 1, self.index + step))
        self.render()

    def render(self):
        node = self.nodes[self.index] if self.nodes else None
        for button in self.buttons:
            button.setEnabled(bool(self.nodes))
        if node is None:
            self.move_label.setText("")
        elif self.index == 0:
            self.move_label.setText(tr("preview.start", total=len(self.nodes) - 1))
        else:
            board = node.parent.board()
            number = f"{board.fullmove_number}{'.' if board.turn == chess.WHITE else '...'}"
            text = f"{number} {board.san(node.move)}"
            self.move_label.setText(tr("preview.move", move=text, done=self.index, total=len(self.nodes) - 1))
        if self.board:
            svg = chess.svg.board(
                node.board() if node is not None else chess.Board(None),
                orientation=chess.WHITE if self.white_below else chess.BLACK,
                lastmove=node.move if node is not None and self.index > 0 else None,
                size=self.SIZE,
            )
            self.board.load(QByteArray(svg.encode("utf-8")))
