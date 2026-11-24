"""
The AnkiChess import window, in three tabs:

- Studies: Lichess studies, .pgn files and pasted PGN. No token needed.
- Puzzles: your Lichess puzzle history and puzzle links. The Lichess token is here, the
  only part that needs it (your puzzle activity).
- Games: analysed Chess.com and Lichess games.

The update of the imported studies is in Studies. One menu entry instead of one per source;
the pages share the config (root deck, note types) and stay open after importing.
"""

from __future__ import annotations

from typing import Callable

from aqt import mw
from aqt.operations import CollectionOp, QueryOp
from aqt.qt import QDialog, QHBoxLayout, QLabel, QPushButton, QSize, Qt, QTabWidget, QVBoxLayout, QWidget
from aqt.utils import showWarning, tooltip

from . import anki_ops, template_install
from .chesscom_dialog import GameImportPage
from .dialog import StudyImportPage
from .i18n import tr
from .puzzle_dialog import PuzzleImportPage
from .token_panel import token_events
from .ui_common import apply_language, error_text, lichess_token, restore_window, save_window

WINDOW_KEY = "ankiChessImport"  # window size and position, kept in the Anki profile
TAB_STUDIES, TAB_PUZZLES, TAB_GAMES = range(3)
TABS = (
    ("window.tab_studies", "window.tab_studies_tip"),
    ("window.tab_puzzles", "window.tab_puzzles_tip"),
    ("window.tab_games", "window.tab_games_tip"),
)


class CurrentTabWidget(QTabWidget):
    """Only the tab shown sets the window's size: Studies doesn't keep room for Puzzles' panels."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.currentChanged.connect(lambda _: self.updateGeometry())

    def _with_tabs(self, page: QSize) -> QSize:
        bar = self.tabBar().sizeHint()
        return QSize(max(page.width(), bar.width()), page.height() + bar.height() + 8)  # 8: the frame

    def sizeHint(self):
        page = self.currentWidget()
        return self._with_tabs(page.sizeHint()) if page else super().sizeHint()

    def minimumSizeHint(self):
        page = self.currentWidget()
        return self._with_tabs(page.minimumSizeHint()) if page else super().minimumSizeHint()


class ImportWindow(QDialog):
    def __init__(self, parent=None, tab: int = TAB_STUDIES, urls: str = ""):
        super().__init__(parent or mw)
        self.setWindowTitle(tr("window.title"))
        # Gone once closed: its pages stop following the token and the puzzle sync
        self.setAttribute(Qt.WidgetAttribute.WA_DeleteOnClose)
        self._after_token: Callable[[], None] | None = None
        layout = QVBoxLayout(self)

        # A collection without an AnkiChess note type: the official template is a click away
        self.template_bar = QWidget()
        self.template_bar.setObjectName("templateBar")
        self.template_bar.setAttribute(Qt.WidgetAttribute.WA_StyledBackground)
        # Translucent: it reads on light and dark themes
        self.template_bar.setStyleSheet(
            "#templateBar { background: rgba(66, 133, 244, 0.13); border: 1px solid rgba(66, 133, 244, 0.45);"
            " border-radius: 6px; }"
        )
        bar = QHBoxLayout(self.template_bar)
        bar.setContentsMargins(12, 8, 8, 8)
        text = QLabel(tr("template.missing"))
        text.setWordWrap(True)
        install = QPushButton(tr("template.install"))
        install.clicked.connect(self.on_install_template)
        bar.addWidget(text, 1)
        bar.addWidget(install)
        self.template_bar.setVisible(not anki_ops.find_chess_note_types())
        layout.addWidget(self.template_bar)

        self.tabs = CurrentTabWidget()
        self.pages = ()
        self.build_pages(tab, urls)
        layout.addWidget(self.tabs, 1)

        bottom = QHBoxLayout()
        close = QPushButton(tr("button.close"))
        close.clicked.connect(self.reject)
        bottom.addStretch(1)
        bottom.addWidget(close)
        layout.addLayout(bottom)
        restore_window(self, WINDOW_KEY, (1250, 760))
        token_events.changed.connect(self.on_token_changed)

    def build_pages(self, tab: int, urls: str = ""):
        """The pages read the note types when built: built again once the template is installed."""
        for page in self.pages:
            page.save_layout()
            page.deleteLater()
        self.tabs.clear()
        self.studies = StudyImportPage(self, urls, ask_token=self.ask_token)
        self.puzzles = PuzzleImportPage(self)
        self.games = GameImportPage(self)
        self.pages = (self.studies, self.puzzles, self.games)
        for page, (title, tip) in zip(self.pages, TABS):
            index = self.tabs.addTab(page, tr(title))
            self.tabs.setTabToolTip(index, tr(tip))
        self.tabs.setCurrentIndex(tab)

    # --- The token, asked for by Studies (a private study, the download limit) ---

    def ask_token(self, reason: str, then: Callable[[], None] | None = None):
        """Puzzles, with the token field and why; then() back in Studies once one is saved."""
        self._after_token = then
        self.tabs.setCurrentIndex(TAB_PUZZLES)
        self.puzzles.token_panel.ask(reason)

    def on_token_changed(self):
        then, self._after_token = self._after_token, None
        if then and lichess_token():
            self.tabs.setCurrentIndex(TAB_STUDIES)
            then()

    def on_install_template(self):
        def progress(done: int, total: int):
            mb = lambda n: f"{n / 1048576:.0f}"  # noqa: E731
            mw.taskman.run_on_main(
                lambda: mw.progress.update(
                    label=tr("template.downloading", done=mb(done), total=mb(total) if total else "?"),
                    value=done // 1048576,
                    max=total // 1048576 if total else 0,
                )
            )

        def on_downloaded(template):
            CollectionOp(
                parent=self, op=lambda col: anki_ops.install_template(col, template)
            ).success(lambda _: on_installed(template.version)).run_in_background()

        def on_installed(version: str):
            self.template_bar.hide()
            self.build_pages(self.tabs.currentIndex())
            tooltip(tr("template.installed", version=version), parent=self)

        QueryOp(
            parent=self,
            op=lambda col: template_install.download(progress),
            success=on_downloaded,
        ).failure(lambda e: showWarning(error_text(e), parent=self)).with_progress(
            tr("template.downloading", done=0, total="?")
        ).without_collection().run_in_background()

    def done(self, result: int):
        save_window(self, WINDOW_KEY)
        for page in self.pages:
            page.save_layout()
        super().done(result)


def show_import_window(
    tab: int = TAB_STUDIES, urls: str = "", token_reason: str = "", then: Callable[[], None] | None = None
):
    """
    token_reason: opened for the token (Puzzles, its field ready), saying why; then() back
    in Studies once one is saved.
    """
    if not mw.col:
        return
    apply_language()
    window = ImportWindow(mw, TAB_PUZZLES if token_reason else tab, urls)
    if token_reason:
        window.ask_token(token_reason, then)
    window.exec()
