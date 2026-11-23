"""
The AnkiChess import window, in two tabs:

- Lichess: Studies and Puzzles, one section at a time. Studies need no token; the Lichess
  token is in the Puzzles section, the only one that needs it (your puzzle activity).
- Games: analysed Chess.com and Lichess games.

The update of the imported studies is a click away. One menu entry instead of one per
source; the pages share the config (root deck, note types) and stay open after importing.
"""

from __future__ import annotations

from typing import Callable

from aqt import mw
from aqt.operations import CollectionOp, QueryOp
from aqt.qt import (
    QButtonGroup,
    QDialog,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QStackedWidget,
    Qt,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)
from aqt.utils import showWarning, tooltip

from . import anki_ops, template_install
from .chesscom_dialog import GameImportPage
from .dialog import StudyImportPage
from .i18n import tr
from .puzzle_dialog import PuzzleImportPage
from .study_updater import update_imported_studies
from .token_panel import token_events
from .ui_common import apply_language, error_text, lichess_token, restore_window, save_window

WINDOW_KEY = "ankiChessImport"  # window size and position, kept in the Anki profile
TAB_LICHESS, TAB_GAMES = range(2)
TAB_TITLES = ("window.tab_lichess", "window.tab_games")
SECTION_STUDIES, SECTION_PUZZLES = range(2)
SECTIONS = (
    ("lichess.section_studies", "lichess.section_studies_tip"),
    ("lichess.section_puzzles", "lichess.section_puzzles_tip"),
)


class CurrentPageStack(QStackedWidget):
    """Only the section shown sets the size: Studies doesn't keep room for Puzzles' panels."""

    def sizeHint(self):
        page = self.currentWidget()
        return page.sizeHint() if page else super().sizeHint()

    def minimumSizeHint(self):
        page = self.currentWidget()
        return page.minimumSizeHint() if page else super().minimumSizeHint()


class LichessPage(QWidget):
    """
    Studies and Puzzles from Lichess, one at a time under a switch. Studies need no token:
    a part of them that can use one (a private study, the download limit by account) asks
    for it in Puzzles, where it lives, and goes on once it is saved.
    """

    def __init__(self, parent=None, urls: str = "", section: int = SECTION_STUDIES):
        super().__init__(parent)
        self._after_token: Callable[[], None] | None = None
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        switch = QHBoxLayout()
        switch.setSpacing(0)
        self.buttons = QButtonGroup(self)
        for index, (key, tip) in enumerate(SECTIONS):
            button = QPushButton(tr(key))
            button.setCheckable(True)
            button.setToolTip(tr(tip))
            button.setMinimumWidth(120)
            self.buttons.addButton(button, index)
            switch.addWidget(button)
        switch.addStretch(1)
        self.buttons.idClicked.connect(self.show_section)
        layout.addLayout(switch)

        self.stack = CurrentPageStack()
        self.stack.currentChanged.connect(lambda _: self.stack.updateGeometry())
        self.studies = StudyImportPage(self, urls, ask_token=self.ask_token)
        self.puzzles = PuzzleImportPage(self)
        self.stack.addWidget(self.studies)
        self.stack.addWidget(self.puzzles)
        layout.addWidget(self.stack, 1)
        self.show_section(section)
        token_events.changed.connect(self.on_token_changed)

    def show_section(self, section: int):
        self.stack.setCurrentIndex(section)
        self.buttons.button(section).setChecked(True)

    def ask_token(self, reason: str, then: Callable[[], None] | None = None):
        """Puzzles, with the token field and why; then() back in Studies once one is saved."""
        self._after_token = then
        self.show_section(SECTION_PUZZLES)
        self.puzzles.token_panel.ask(reason)

    def on_token_changed(self):
        then, self._after_token = self._after_token, None
        if then and lichess_token():
            self.show_section(SECTION_STUDIES)
            then()

    def save_layout(self):
        self.studies.save_layout()
        self.puzzles.save_layout()


class ImportWindow(QDialog):
    def __init__(self, parent=None, tab: int = TAB_LICHESS, urls: str = "", section: int = SECTION_STUDIES):
        super().__init__(parent or mw)
        self.setWindowTitle(tr("window.title"))
        # Gone once closed: its pages stop following the token and the puzzle sync
        self.setAttribute(Qt.WidgetAttribute.WA_DeleteOnClose)
        layout = QVBoxLayout(self)

        # A collection without an AnkiChess note type: the official template is a click away
        self.template_bar = QWidget()
        bar = QHBoxLayout(self.template_bar)
        bar.setContentsMargins(0, 0, 0, 0)
        text = QLabel(tr("template.missing"))
        text.setWordWrap(True)
        install = QPushButton(tr("template.install"))
        install.clicked.connect(self.on_install_template)
        bar.addWidget(text, 1)
        bar.addWidget(install)
        self.template_bar.setVisible(not anki_ops.find_chess_note_types())
        layout.addWidget(self.template_bar)

        self.tabs = QTabWidget()
        self.pages = ()
        self.build_pages(tab, urls, section)
        layout.addWidget(self.tabs, 1)

        bottom = QHBoxLayout()
        update = QPushButton(tr("menu.update_studies"))
        update.setToolTip(tr("window.update_tip"))
        update.clicked.connect(self.on_update_studies)
        close = QPushButton(tr("button.close"))
        close.clicked.connect(self.reject)
        bottom.addWidget(update)
        bottom.addStretch(1)
        bottom.addWidget(close)
        layout.addLayout(bottom)
        restore_window(self, WINDOW_KEY, (1250, 760))

    def build_pages(self, tab: int, urls: str = "", section: int = SECTION_STUDIES):
        """The pages read the note types when built: built again once the template is installed."""
        for page in self.pages:
            page.save_layout()
            page.deleteLater()
        self.tabs.clear()
        self.lichess = LichessPage(self, urls, section)
        self.games = GameImportPage(self)
        self.pages = (self.lichess, self.games)
        for page, title in zip(self.pages, TAB_TITLES):
            self.tabs.addTab(page, tr(title))
        self.tabs.setCurrentIndex(tab)

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
            self.build_pages(self.tabs.currentIndex(), section=self.lichess.stack.currentIndex())
            tooltip(tr("template.installed", version=version), parent=self)

        QueryOp(
            parent=self,
            op=lambda col: template_install.download(progress),
            success=on_downloaded,
        ).failure(lambda e: showWarning(error_text(e), parent=self)).with_progress(
            tr("template.downloading", done=0, total="?")
        ).without_collection().run_in_background()

    def on_update_studies(self):
        def open_studies(links: str):
            self.tabs.setCurrentIndex(TAB_LICHESS)
            self.lichess.show_section(SECTION_STUDIES)
            self.lichess.studies.load_urls(links)

        def ask_token(reason: str, then: Callable[[], None]):
            self.tabs.setCurrentIndex(TAB_LICHESS)
            self.lichess.ask_token(reason, then)

        update_imported_studies(self, open_studies, ask_token)

    def done(self, result: int):
        save_window(self, WINDOW_KEY)
        for page in self.pages:
            page.save_layout()
        super().done(result)


def show_import_window(tab: int = TAB_LICHESS, urls: str = "", section: int = SECTION_STUDIES, token_reason: str = ""):
    """token_reason: opened for the token (Lichess › Puzzles, its field ready), saying why."""
    if not mw.col:
        return
    apply_language()
    window = ImportWindow(mw, tab, urls, SECTION_PUZZLES if token_reason else section)
    if token_reason:
        window.lichess.ask_token(token_reason)
    window.exec()
