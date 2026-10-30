"""
The AnkiChess import window: Studies, Games and Puzzles pages in tabs, with the update
of the imported studies and the Lichess token a click away. One menu entry instead of
one per source; the pages share the config (token, root deck, note types) and stay open
after importing.
"""

from __future__ import annotations

from aqt import mw
from aqt.operations import CollectionOp, QueryOp
from aqt.qt import QDialog, QHBoxLayout, QLabel, QPushButton, QTabWidget, QVBoxLayout, QWidget
from aqt.utils import showWarning, tooltip

from . import anki_ops, template_install
from .chesscom_dialog import GameImportPage
from .dialog import StudyImportPage
from .i18n import tr
from .puzzle_dialog import PuzzleImportPage
from .study_updater import update_imported_studies
from .token_dialog import TokenStatus
from .ui_common import apply_language, error_text, restore_window, save_window

WINDOW_KEY = "ankiChessImport"  # window size and position, kept in the Anki profile
TAB_STUDIES, TAB_GAMES, TAB_PUZZLES = range(3)
TAB_TITLES = ("window.tab_studies", "window.tab_games", "window.tab_puzzles")


class ImportWindow(QDialog):
    def __init__(self, parent=None, tab: int = TAB_STUDIES, urls: str = ""):
        super().__init__(parent or mw)
        self.setWindowTitle(tr("window.title"))
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
        self.build_pages(tab, urls)
        layout.addWidget(self.tabs, 1)

        bottom = QHBoxLayout()
        update = QPushButton(tr("menu.update_studies"))
        update.setToolTip(tr("window.update_tip"))
        update.clicked.connect(self.on_update_studies)
        close = QPushButton(tr("button.close"))
        close.clicked.connect(self.reject)
        bottom.addWidget(update)
        # The Lichess token of every page: private studies, puzzle activity, download limit
        bottom.addWidget(TokenStatus(self))
        bottom.addStretch(1)
        bottom.addWidget(close)
        layout.addLayout(bottom)
        restore_window(self, WINDOW_KEY, (1250, 760))

    def build_pages(self, tab: int, urls: str = ""):
        """The pages read the note types when built: built again once the template is installed."""
        for page in self.pages:
            page.save_layout()
            page.deleteLater()
        self.tabs.clear()
        self.studies = StudyImportPage(self, urls)
        self.games = GameImportPage(self)
        self.puzzles = PuzzleImportPage(self)
        self.pages = (self.studies, self.games, self.puzzles)
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
            self.build_pages(self.tabs.currentIndex())
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
            self.tabs.setCurrentIndex(TAB_STUDIES)
            self.studies.load_urls(links)

        update_imported_studies(self, open_studies)

    def done(self, result: int):
        save_window(self, WINDOW_KEY)
        for page in self.pages:
            page.save_layout()
        super().done(result)


def show_import_window(tab: int = TAB_STUDIES, urls: str = ""):
    if not mw.col:
        return
    apply_language()
    ImportWindow(mw, tab, urls).exec()
