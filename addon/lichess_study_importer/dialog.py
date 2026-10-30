"""
Studies page of the import window: load Lichess studies (links, a user's studies,
.pgn files or pasted PGN), choose each chapter's type, side, note type and deck, and
import them.

The table shows self.rows, one Row per chapter holding what was chosen for it, so
sorting and filtering rebuild the cells without losing the choices. The Type, You play
and Note type cells open a list when clicked (ChoiceDelegate) instead of holding a
combo each.
"""

from __future__ import annotations

import html
import io
import os
import textwrap
from dataclasses import dataclass, field

import aqt
from aqt import mw
from aqt.operations import CollectionOp, QueryOp
from aqt.qt import (
    QAbstractItemView,
    QApplication,
    QCheckBox,
    QComboBox,
    QCompleter,
    QDialog,
    QDialogButtonBox,
    QFileDialog,
    QHBoxLayout,
    QInputDialog,
    QKeySequence,
    QLabel,
    QLineEdit,
    QListWidget,
    QListWidgetItem,
    QMenu,
    QPushButton,
    QShortcut,
    QSplitter,
    QStackedWidget,
    QStringListModel,
    QStyle,
    QStyledItemDelegate,
    QStyleOption,
    Qt,
    QTableWidget,
    QTableWidgetItem,
    QTimer,
    QToolButton,
    QVBoxLayout,
    QWidget,
)
from aqt.studydeck import StudyDeck
from aqt.utils import askUser, openLink, showWarning, tooltip

from . import anki_ops, decks, expand
from .chess_lib import chess
from .i18n import tr
from .lichess_api import LichessError, fetch_study_pgn, fetch_user_studies, parse_study_urls
from .pgn_split import (
    COMMAND_RE,
    KIND_EMPTY,
    KIND_EXERCISE,
    KIND_GAME,
    KIND_LINE,
    KIND_STRUCTURE,
    KIND_UNSUPPORTED,
    MODE_FLIPPED,
    MODE_STUDY,
    Chapter,
    mode_for,
    split_games,
)
from .structures import StructureCard
from .token_dialog import edit_token
from .ui_common import (
    BoardPreview,
    ask_pgn,
    browse,
    error_text,
    get_config,
    lichess_token,
    lichess_waiter,
    readonly_item,
    restore_columns,
    save_columns,
    status_color,
    write_config,
)

KIND_KEYS = {
    KIND_EXERCISE: "kind.exercise",
    KIND_LINE: "kind.line",
    KIND_GAME: "kind.game",
    KIND_STRUCTURE: "kind.structure",
    KIND_EMPTY: "kind.empty",
    KIND_UNSUPPORTED: "kind.unsupported",
}
# The kind decides the subdeck. Structures (no moves) keep theirs: rebuilt on the board
CHAPTER_KINDS = (KIND_EXERCISE, KIND_LINE, KIND_GAME)
NOT_IMPORTABLE = (KIND_EMPTY, KIND_UNSUPPORTED)
SIDES = (("w", "side.white"), ("b", "side.black"), (None, "side.both"))  # None: Study
OTHER_SIDE = {"w": "b", "b": "w"}
STATUS_KEYS = {"new": "status.new", "changed": "status.changed", "same": "status.same"}
(
    COL_CHECK,
    COL_NAME,
    COL_STATUS,
    COL_KIND,
    COL_SIDE,
    COL_NOTE_TYPE,
    COL_DECK,
    COL_PREVIEW,
) = range(8)
CHOICE_COLUMNS = (COL_KIND, COL_SIDE, COL_NOTE_TYPE)
COLUMN_WIDTHS = {
    COL_CHECK: 28,
    COL_NAME: 230,
    COL_STATUS: 90,
    COL_KIND: 130,
    COL_SIDE: 105,
    COL_NOTE_TYPE: 170,
    COL_DECK: 160,
}
COLUMNS_KEY = "lichessStudyColumns"  # widths and hidden columns, kept in the Anki profile
# Quick filters: (label key, attribute, value)
QUICK_FILTERS = (
    ("filter.all", None, None),
    ("filter.new", "status", "new"),
    ("filter.changed", "status", "changed"),
    ("filter.same", "status", "same"),
    ("filter.exercises", "kind", KIND_EXERCISE),
    ("filter.lines", "kind", KIND_LINE),
    ("filter.games", "kind", KIND_GAME),
    ("filter.structures", "kind", KIND_STRUCTURE),
)


@dataclass(eq=False)
class Study:
    key: str | None  # Lichess study id: renamed decks are kept per study
    name: str
    fallback: str  # deck name for PGNs without StudyName (the file name)
    default_deck: str
    deck: str
    complete: bool  # the whole study was loaded: chapters removed from it can be found


@dataclass(eq=False)
class Row:
    chapter: Chapter
    study: Study
    kind: str
    side: str | None
    note_type: str = ""
    subdeck: str | None = None  # renamed in the Deck column (None: the kind's default)
    checked: bool = False
    status: str = ""
    card_statuses: list[str] = field(default_factory=list)  # one per card of the row
    cache: dict = field(default_factory=dict)  # opening name, parsed game, cards
    blocked: str = ""  # tooltip key of why it can't be imported (a template without structures)

    @property
    def importable(self) -> bool:
        return self.kind not in NOT_IMPORTABLE and not self.blocked

    @property
    def structure(self) -> bool:
        return self.kind == KIND_STRUCTURE

    @property
    def editable_columns(self) -> tuple[int, ...]:
        # A structure is an AnkiChess note rebuilt from your side, whatever the note type
        return (COL_SIDE,) if self.structure else CHOICE_COLUMNS


class DeckItem(QTableWidgetItem):
    """Deck cell; an empty subdeck (the chapter goes to the study deck) says so when shown."""

    def data(self, role):
        value = super().data(role)
        editable = self.flags() & Qt.ItemFlag.ItemIsEditable
        if role == Qt.ItemDataRole.DisplayRole and not value and editable:
            return tr("deck.study_itself")
        return value


class ChoiceDelegate(QStyledItemDelegate):
    """A list for the Type, You play and Note type cells, opened when the cell is clicked."""

    def __init__(self, page: "StudyImportPage"):
        super().__init__(page.table)
        self.page = page

    def createEditor(self, parent, option, index):
        row = self.page.rows[index.row()]
        combo = QComboBox(parent)
        for label, value in self.page.choices_for(index.column(), row):
            combo.addItem(label, value)
        values = [combo.itemData(i) for i in range(combo.count())]
        current = self.page.value_of(row, index.column())
        combo.setCurrentIndex(values.index(current) if current in values else 0)
        combo.activated.connect(lambda _: self.commit(combo))
        QTimer.singleShot(0, combo.showPopup)
        return combo

    def setEditorData(self, editor, index):
        pass  # set when created, so the popup isn't reset

    def commit(self, combo):
        self.commitData.emit(combo)
        self.closeEditor.emit(combo)

    def setModelData(self, editor, model, index):
        self.page.set_value(self.page.rows[index.row()], index.column(), editor.currentData())

    def paint(self, painter, option, index):
        super().paint(painter, option, index)
        if index.flags() & Qt.ItemFlag.ItemIsEditable:
            # A small arrow tells the cell opens a list
            arrow = QStyleOption()
            arrow.rect = option.rect.adjusted(option.rect.width() - 14, 0, -4, 0)
            arrow.palette = option.palette
            style = option.widget.style() if option.widget else QApplication.style()
            style.drawPrimitive(QStyle.PrimitiveElement.PE_IndicatorArrowDown, arrow, painter)


class UserStudiesDialog(QDialog):
    """Lists the studies of a Lichess user to pick the ones to load."""

    def __init__(self, parent, username: str, token: str):
        super().__init__(parent)
        self.setWindowTitle(tr("user_studies.title"))
        self.resize(560, 480)
        self.token = token
        layout = QVBoxLayout(self)
        row = QHBoxLayout()
        self.user_edit = QLineEdit(username)
        self.user_edit.setPlaceholderText(tr("user_studies.username"))
        self.user_edit.returnPressed.connect(self.on_list)
        btn = QPushButton(tr("user_studies.list"))
        btn.clicked.connect(self.on_list)
        row.addWidget(QLabel(tr("user_studies.username")))
        row.addWidget(self.user_edit, 1)
        row.addWidget(btn)
        layout.addLayout(row)
        self.status = QLabel(tr("user_studies.private_hint"))
        self.status.setWordWrap(True)
        layout.addWidget(self.status)
        self.list = QListWidget()
        layout.addWidget(self.list, 1)
        buttons = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        buttons.button(QDialogButtonBox.StandardButton.Ok).setText(tr("user_studies.load"))
        buttons.button(QDialogButtonBox.StandardButton.Cancel).setText(tr("button.cancel"))
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)
        if username:
            self.on_list()

    def on_list(self):
        username = self.user_edit.text().strip()
        if not username:
            return
        self.status.setText(tr("user_studies.loading"))
        QueryOp(
            parent=self,
            op=lambda col: fetch_user_studies(username, self.token),
            success=self.show_studies,
        ).failure(lambda e: self.status.setText(error_text(e))).without_collection().run_in_background()

    def show_studies(self, studies: list[dict]):
        self.list.clear()
        for study in studies:
            item = QListWidgetItem(study.get("name", study["id"]))
            item.setFlags(item.flags() | Qt.ItemFlag.ItemIsUserCheckable)
            item.setCheckState(Qt.CheckState.Unchecked)
            item.setData(Qt.ItemDataRole.UserRole, study["id"])
            item.setToolTip(f"https://lichess.org/study/{study['id']}")
            self.list.addItem(item)
        self.status.setText(tr("user_studies.found", count=len(studies)) if studies else tr("user_studies.none"))

    def selected_ids(self) -> list[str]:
        items = (self.list.item(i) for i in range(self.list.count()))
        return [i.data(Qt.ItemDataRole.UserRole) for i in items if i.checkState() == Qt.CheckState.Checked]


class StudyImportPage(QWidget):
    def __init__(self, parent=None, urls: str = ""):
        super().__init__(parent)
        self.config = get_config()
        self.studies: list[Study] = []
        self.rows: list[Row] = []
        self.removed_nids: list[int] = []
        self.last_result = ""
        self.last_nids: list[int] = []
        self._populating = False  # cells being filled by the page, not edited
        self._sort = (None, Qt.SortOrder.AscendingOrder)
        self.setAcceptDrops(True)

        # Flipped/Study note types are cloned from the base one; the root deck and the
        # base are config settings (deck_root, base_note_type), not asked every time
        self.base = anki_ops.default_base(self.config.get("base_note_type", ""))
        self.root = decks.root_name(self.config.get("deck_root"))
        # Note types a chapter can use: (name, mode, exists)
        self.choices = anki_ops.note_type_choices(self.base) if self.base else []
        self.choice_modes = {name: mode for name, mode, _ in self.choices}
        self.choice_exists = {name: exists for name, _, exists in self.choices}
        base_name = self.base["name"] if self.base else "AnkiChess"

        layout = QVBoxLayout(self)

        # --- Sources: a link, or more sources in a menu ---
        src = QHBoxLayout()
        self.url_edit = QLineEdit(urls)
        self.url_edit.setPlaceholderText(tr("source.url_placeholder"))
        self.url_edit.returnPressed.connect(self.on_load_url)
        self.url_btn = QPushButton(tr("source.load_url"))
        self.url_btn.clicked.connect(self.on_load_url)
        more = QToolButton()
        more.setText(tr("source.more"))
        more.setPopupMode(QToolButton.ToolButtonPopupMode.InstantPopup)
        more_menu = QMenu(more)
        for key, slot in (
            ("source.user_studies", self.on_user_studies),
            ("source.open_file", self.on_open_file),
            ("source.paste", self.on_paste),
            # The token, for private studies (also in the window's bottom bar)
            ("source.token", lambda: edit_token(self)),
        ):
            more_menu.addAction(tr(key), slot)
        more.setMenu(more_menu)
        src.addWidget(self.url_edit, 1)
        src.addWidget(self.url_btn)
        src.addWidget(more)
        layout.addLayout(src)

        self.study_label = QLabel(tr("study.none"))
        self.study_label.setWordWrap(True)
        self.study_label.setTextInteractionFlags(Qt.TextInteractionFlag.TextBrowserInteraction)
        self.study_label.linkActivated.connect(self.on_summary_link)
        layout.addWidget(self.study_label)

        # --- Start page (nothing loaded) or the chapters ---
        self.stack = QStackedWidget()
        self.stack.addWidget(self.build_start_page())
        chapters = QWidget()
        chapters_layout = QVBoxLayout(chapters)
        chapters_layout.setContentsMargins(0, 0, 0, 0)
        self.stack.addWidget(chapters)
        layout.addWidget(self.stack, 1)

        # Study deck, editable once a study is loaded (a list picks the study when several)
        deck_row = QHBoxLayout()
        self.study_combo = QComboBox()
        self.study_combo.currentIndexChanged.connect(self.on_study_selected)
        self.deck_edit = QLineEdit()
        self.deck_edit.setToolTip(tr("form.study_deck_tip"))
        self.deck_edit.textEdited.connect(self.on_study_deck_typed)
        self.deck_edit.editingFinished.connect(self.on_study_deck_edited)
        # Typing suggests the collection's decks (any part of the name)
        self.deck_names = QStringListModel(self)
        completer = QCompleter(self.deck_names, self.deck_edit)
        completer.setCaseSensitivity(Qt.CaseSensitivity.CaseInsensitive)
        completer.setFilterMode(Qt.MatchFlag.MatchContains)
        completer.activated[str].connect(self.set_study_deck)
        self.deck_edit.setCompleter(completer)
        self.deck_choose = QPushButton(tr("form.study_deck_choose"))
        self.deck_choose.setToolTip(tr("form.study_deck_choose_tip"))
        self.deck_choose.clicked.connect(self.choose_study_deck)
        deck_reset = QPushButton(tr("form.study_deck_reset"))
        deck_reset.setToolTip(tr("form.study_deck_reset_tip"))
        deck_reset.clicked.connect(self.reset_decks)
        deck_row.addWidget(QLabel(tr("form.study_deck")))
        deck_row.addWidget(self.study_combo)
        deck_row.addWidget(self.deck_edit, 1)
        deck_row.addWidget(self.deck_choose)
        deck_row.addWidget(deck_reset)
        chapters_layout.addLayout(deck_row)

        options = QHBoxLayout()
        self.include_games = QCheckBox(tr("filter.include_games"))
        self.include_games.setChecked(bool(self.config.get("include_games", False)))
        self.include_games.toggled.connect(self.on_toggle_games)
        self.split_lines = QCheckBox(tr("option.split_lines"))
        self.split_lines.setToolTip(tr("option.split_lines_tip"))
        self.split_lines.setChecked(bool(self.config.get("split_lines", False)))
        self.key_moves = QCheckBox(tr("option.key_moves"))
        self.key_moves.setToolTip(tr("option.key_moves_tip"))
        self.key_moves.setChecked(bool(self.config.get("key_moves", False)))
        for check in (self.split_lines, self.key_moves):
            check.toggled.connect(self.on_expand_option)
        for widget in (self.include_games, self.split_lines, self.key_moves):
            options.addWidget(widget)
        options.addStretch(1)
        chapters_layout.addLayout(options)

        selection = QHBoxLayout()
        self.filter_edit = QLineEdit()
        self.filter_edit.setPlaceholderText(tr("filter.placeholder"))
        self.filter_edit.setClearButtonEnabled(True)
        self.filter_edit.textChanged.connect(self.apply_filter)
        self.quick_filter = QComboBox()
        for key, attr, value in QUICK_FILTERS:
            self.quick_filter.addItem(tr(key), (attr, value))
        self.quick_filter.currentIndexChanged.connect(self.apply_filter)
        selection.addWidget(self.filter_edit, 1)
        selection.addWidget(self.quick_filter)
        for key, slot in (
            ("filter.check_new", self.check_new_and_changed),
            ("filter.check_exercises", self.check_exercises_and_lines),
            ("filter.uncheck_all", self.uncheck_all),
        ):
            btn = QPushButton(tr(key))
            btn.clicked.connect(slot)
            selection.addWidget(btn)
        chapters_layout.addLayout(selection)

        # --- Chapter table, with the board of the selected chapter beside it ---
        self.table = QTableWidget(0, 8)
        self.table.setHorizontalHeaderLabels(
            [
                "",
                tr("table.chapter"),
                tr("table.status"),
                tr("table.kind"),
                tr("table.side"),
                tr("table.note_type"),
                tr("table.deck"),
                tr("table.moves"),
            ]
        )
        for col, tip in (
            (COL_STATUS, tr("table.status_tip")),
            (COL_KIND, tr("table.kind_tip")),
            (COL_SIDE, tr("table.side_tip")),
            (COL_NOTE_TYPE, tr("table.note_type_tip", base=base_name)),
            (COL_DECK, tr("table.deck_tip")),
        ):
            self.table.horizontalHeaderItem(col).setToolTip(tip)
        for col, width in COLUMN_WIDTHS.items():
            self.table.setColumnWidth(col, width)
        self.delegate = ChoiceDelegate(self)
        for col in CHOICE_COLUMNS:
            self.table.setItemDelegateForColumn(col, self.delegate)
        # A click opens the lists (see on_cell_clicked); the Deck is renamed with F2 or
        # a double-click. Several rows (Ctrl/Shift+click) are changed together.
        self.table.setEditTriggers(
            QAbstractItemView.EditTrigger.DoubleClicked | QAbstractItemView.EditTrigger.EditKeyPressed
        )
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QTableWidget.SelectionMode.ExtendedSelection)
        self.table.itemChanged.connect(self.on_item_changed)
        self.table.cellClicked.connect(self.on_cell_clicked)
        self.table.cellDoubleClicked.connect(self.on_double_click)
        self.table.currentCellChanged.connect(lambda row, *_: self.show_preview(row))
        self.table.setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)
        self.table.customContextMenuRequested.connect(self.on_context_menu)
        header = self.table.horizontalHeader()
        header.setSectionsClickable(True)
        header.sectionClicked.connect(self.on_sort)
        restore_columns(self.table, COLUMNS_KEY, hidden=(COL_PREVIEW,))

        self.preview = BoardPreview()
        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.addWidget(self.table)
        splitter.addWidget(self.preview)
        splitter.setStretchFactor(0, 1)
        splitter.setCollapsible(0, False)
        chapters_layout.addWidget(splitter, 1)

        hint = QLabel(tr("table.hint"))
        hint.setWordWrap(True)
        chapters_layout.addWidget(hint)

        # --- What the import will do, and the import ---
        bottom = QHBoxLayout()
        self.update_existing = QCheckBox(tr("form.update_existing"))
        self.update_existing.setChecked(bool(self.config.get("update_existing", False)))
        self.update_existing.toggled.connect(lambda _: self.update_plan())
        self.plan_label = QLabel()
        self.plan_label.setWordWrap(True)
        self.import_btn = QPushButton(tr("button.import"))
        self.import_btn.setDefault(True)
        self.import_btn.setEnabled(False)
        self.import_btn.clicked.connect(self.on_import)
        bottom.addWidget(self.update_existing)
        bottom.addWidget(self.plan_label, 1)
        bottom.addWidget(self.import_btn)
        layout.addLayout(bottom)

        for keys, slot in (
            ("Ctrl+F", lambda: (self.filter_edit.setFocus(), self.filter_edit.selectAll())),
            ("Ctrl+Return", self.on_import),
        ):
            shortcut = QShortcut(QKeySequence(keys), self)
            shortcut.setContext(Qt.ShortcutContext.WidgetWithChildrenShortcut)
            shortcut.activated.connect(slot)
        space = QShortcut(QKeySequence("Space"), self.table)
        space.setContext(Qt.ShortcutContext.WidgetShortcut)
        space.activated.connect(self.toggle_selected)

        if not self.base:
            self.study_label.setText(tr("warn.no_note_types"))
        elif urls:
            self.on_load_url()

    def save_layout(self):
        save_columns(self.table, COLUMNS_KEY)

    # --- Start page ---

    def build_start_page(self) -> QWidget:
        page = QWidget()
        layout = QVBoxLayout(page)
        intro = QLabel(tr("start.intro"))
        intro.setWordWrap(True)
        layout.addWidget(intro)
        self.imported_list = QListWidget()
        self.imported_list.itemDoubleClicked.connect(lambda _: self.load_imported())
        layout.addWidget(self.imported_list, 1)
        load = QPushButton(tr("start.load"))
        load.clicked.connect(self.load_imported)
        row = QHBoxLayout()
        row.addStretch(1)
        row.addWidget(load)
        layout.addLayout(row)
        self.refresh_imported_list()
        return page

    def refresh_imported_list(self):
        """The studies already in the collection, to load them again in one click."""
        self.imported_list.clear()
        studies = anki_ops.imported_studies(mw.col)
        for study_id, name, count in studies:
            item = QListWidgetItem(tr("start.study", name=name, count=count))
            item.setData(Qt.ItemDataRole.UserRole, study_id)
            item.setFlags(item.flags() | Qt.ItemFlag.ItemIsUserCheckable)
            item.setCheckState(Qt.CheckState.Unchecked)
            self.imported_list.addItem(item)
        self.imported_list.setVisible(bool(studies))

    def load_imported(self):
        items = [self.imported_list.item(i) for i in range(self.imported_list.count())]
        ids = [i.data(Qt.ItemDataRole.UserRole) for i in items if i.checkState() == Qt.CheckState.Checked]
        if not ids and self.imported_list.currentItem():
            ids = [self.imported_list.currentItem().data(Qt.ItemDataRole.UserRole)]
        if ids:
            self.load_urls(" ".join(f"https://lichess.org/study/{i}" for i in ids))

    # --- Loading ---

    def dragEnterEvent(self, event):
        mime = event.mimeData()
        if mime.hasUrls() or (mime.hasText() and parse_study_urls(mime.text())):
            event.acceptProposedAction()

    def dropEvent(self, event):
        mime = event.mimeData()
        files = [u.toLocalFile() for u in mime.urls() if u.isLocalFile()] if mime.hasUrls() else []
        if files:
            self.load_files(files)
            return
        links = " ".join(u.toString() for u in mime.urls()) if mime.hasUrls() else mime.text()
        if parse_study_urls(links):
            self.load_urls(links)

    def on_open_file(self):
        paths, _ = QFileDialog.getOpenFileNames(
            self,
            tr("source.file_dialog_title"),
            self.config.get("last_dir", ""),
            tr("source.file_filter"),
        )
        if paths:
            self.config["last_dir"] = os.path.dirname(paths[0])
            self.load_files(paths)

    def load_files(self, paths: list[str]):
        sources = []
        for path in paths:
            try:
                with open(path, encoding="utf-8-sig") as f:
                    sources.append((f.read(), os.path.splitext(os.path.basename(path))[0], True))
            except (OSError, UnicodeDecodeError) as e:
                showWarning(tr("warn.read_file", error=e), parent=self)
        if sources:
            self.load_sources(sources)

    def on_paste(self):
        text = ask_pgn(self)
        if text:
            self.load_sources([(text, tr("source.pasted"), True)])

    def on_user_studies(self):
        dialog = UserStudiesDialog(self, self.config.get("lichess_username", ""), lichess_token())
        if not dialog.exec():
            return
        self.config["lichess_username"] = dialog.user_edit.text().strip()
        ids = dialog.selected_ids()
        if ids:
            self.load_urls(" ".join(f"https://lichess.org/study/{i}" for i in ids))

    def load_urls(self, links: str):
        self.url_edit.setText(links)
        self.on_load_url()

    def on_load_url(self):
        studies = parse_study_urls(self.url_edit.text())
        if not studies:
            showWarning(tr("warn.invalid_url"), parent=self)
            return
        token = lichess_token()
        self.study_label.setText(tr("study.downloading"))
        self.url_btn.setEnabled(False)

        def fetch_all():
            results = []
            for i, (study_id, chapter_id) in enumerate(studies, 1):
                downloading = tr("study.downloading_n", done=i, total=len(studies))
                mw.taskman.run_on_main(lambda text=downloading: self.study_label.setText(text))
                # A 429 is waited out, counted down beside the download
                wait = lichess_waiter(lambda text, d=downloading: self.study_label.setText(f"{d} {text}".strip()))
                try:
                    text = fetch_study_pgn(study_id, chapter_id, token=token, wait=wait)
                    results.append((text, f"lichess.org/study/{study_id}", chapter_id is None))
                except LichessError as e:
                    results.append((e, study_id, False))
                    if e.key == "error.rate_limited":
                        # Still refused after the waits: the next ones would only wait again
                        results += [(e, rest, False) for rest, _ in studies[i:]]
                        break
            return results

        def on_done(fut):
            self.url_btn.setEnabled(True)
            sources, errors, needs_token = [], [], False
            for value, source, complete in fut.result():
                if isinstance(value, LichessError):
                    errors.append(f"{source}: {error_text(value)}")
                    # A private study, or the download limit by IP: a token is the way in
                    needs_token |= value.key in ("error.no_access", "error.rate_limited")
                else:
                    sources.append((value, source, complete))
            if errors:
                message = tr("study.load_errors", errors="\n".join(errors))
                if needs_token and not lichess_token():
                    if askUser(f"{message}\n\n{tr('token.offer')}", parent=self) and edit_token(self):
                        self.on_load_url()  # again, with the token
                        return
                else:
                    showWarning(message, parent=self)
            if sources:
                self.load_sources(sources)
            elif errors:
                self.study_label.setText(tr("study.download_failed"))

        mw.taskman.run_in_background(fetch_all, on_done)

    def load_sources(self, sources: list[tuple[str, str, bool]]):
        """(PGN text, source name, whole study?) of each loaded study or file."""
        study_decks = self.config.get("study_decks", {})
        chapter_decks = self.config.get("chapter_decks", {})
        builds_structures = anki_ops.builds_structures(mw.col, self.base)
        self.studies, self.rows = [], []
        for text, source, complete in sources:
            by_study: dict[str, Study] = {}
            for ch in split_games(text):
                group = ch.study_id or ch.study_name or source
                study = by_study.get(group)
                if study is None:
                    default = decks.study_deck(ch, self.root, source)
                    key = ch.study_id
                    study = Study(
                        key=key,
                        name=decks.study_name(ch, source),
                        fallback=source,
                        default_deck=default,
                        deck=self.linked_deck(key, study_decks) or default,
                        complete=complete and bool(key),
                    )
                    by_study[group] = study
                    self.studies.append(study)
                row = Row(chapter=ch, study=study, kind=decks.suggest_kind(ch), side=ch.player)
                if row.structure:
                    # You rebuild one side of it: yours, from the chapter's orientation,
                    # or the side chosen when it was imported
                    row.side = ch.player or ch.side_to_move
                    row.side = anki_ops.structure_side(mw.col, StructureCard(ch, row.side)) or row.side
                    row.note_type = self.structure_type
                    if not builds_structures:
                        row.blocked = "structure.needs_template_tip"
                else:
                    row.note_type = self.note_type_for_mode(mode_for(row.side, ch.side_to_move))
                if ch.dedupe_key in chapter_decks:
                    row.subdeck = chapter_decks[ch.dedupe_key]
                self.rows.append(row)
        if not self.rows:
            showWarning(tr("warn.no_chapters"), parent=self)
            return

        self.refresh_statuses()
        include_games = self.include_games.isChecked()
        for row in self.rows:
            wanted = row.kind in (KIND_EXERCISE, KIND_LINE, KIND_STRUCTURE) or (
                row.kind == KIND_GAME and include_games
            )
            row.checked = row.importable and wanted and row.status != "same"
        self.find_removed_chapters()
        self.last_result, self.last_nids = "", []
        self._sort = (None, Qt.SortOrder.AscendingOrder)
        self.table.horizontalHeader().setSortIndicatorShown(False)

        self.study_combo.blockSignals(True)
        self.study_combo.clear()
        for study in self.studies:
            self.study_combo.addItem(study.name)
        self.study_combo.blockSignals(False)
        self.study_combo.setVisible(len(self.studies) > 1)
        self.refresh_deck_names()
        self.on_study_selected(0)
        self.stack.setCurrentIndex(1)
        self.populate_table()

    @staticmethod
    def linked_deck(key: str | None, study_decks: dict) -> str | None:
        """
        A study's deck: the one chosen for it while it still exists, else the deck its
        notes are in now (decks renamed or moved in Anki are followed), else the one
        chosen (to be created).
        """
        if not key:
            return None
        chosen = study_decks.get(key)
        if chosen and mw.col.decks.by_name(chosen):
            return chosen
        return anki_ops.study_deck_in_collection(mw.col, key) or chosen

    def find_removed_chapters(self):
        """Notes of the loaded studies whose chapter was deleted on Lichess."""
        self.removed_nids = []
        for study in self.studies:
            if study.complete:
                ids = {r.chapter.chapter_id for r in self.rows if r.study is study}
                self.removed_nids += anki_ops.removed_chapter_notes(mw.col, study.key, ids)

    def summary_text(self) -> str:
        counts = {k: sum(r.kind == k for r in self.rows) for k in KIND_KEYS}
        params = dict(
            total=len(self.rows),
            exercises=counts[KIND_EXERCISE],
            lines=counts[KIND_LINE],
            games=counts[KIND_GAME],
            structures=counts[KIND_STRUCTURE],
            empty=counts[KIND_EMPTY] + counts[KIND_UNSUPPORTED],
        )
        if len(self.studies) == 1:
            text = tr("study.summary", study=self.studies[0].name, **params)
        else:
            text = tr("study.summary_many", count=len(self.studies), **params)
        statuses = {s: sum(r.status == s for r in self.rows) for s in STATUS_KEYS}
        text += "<br>" + tr("study.status_counts", **statuses)
        if self.removed_nids:
            text += " " + tr("study.removed", count=len(self.removed_nids))
        blocked = sum(r.structure and bool(r.blocked) for r in self.rows)
        if blocked:
            text += "<br>" + tr("structure.needs_template", count=blocked)
        if self.last_result:
            text += f"<br><b>{self.last_result}</b>"
            if self.last_nids:
                text += " " + tr("result.browse")
        return text

    def on_summary_link(self, link: str):
        nids = {"removed": self.removed_nids, "imported": self.last_nids}.get(link)
        if nids:
            browse(nids)

    # --- Note types and cards ---

    def note_type_for_mode(self, mode: str) -> str:
        """The first note type set up for a mode: the base one's variant, else another."""
        return next((name for name, m, _ in self.choices if m == mode), "")

    @property
    def structure_type(self) -> str:
        """Note type of the structures: the base one (its side settings don't apply)."""
        return self.base["name"] if self.base else ""

    def row_cards(self, row: Row) -> list[tuple[Chapter, bool]]:
        """(card, is a key move card) imported from a row, depending on the options."""
        ch = row.chapter
        if row.structure:
            return [(StructureCard(ch, row.side or ch.side_to_move), False)]
        if row.kind == KIND_LINE and self.split_lines.isChecked():
            if "split" not in row.cache:
                row.cache["split"] = expand.split_variations(ch, self.strip_anno)
            return [(card, False) for card in row.cache["split"]]
        cards = [(ch, False)]
        if row.kind == KIND_GAME and self.key_moves.isChecked():
            if "key_moves" not in row.cache:
                row.cache["key_moves"] = expand.key_move_cards(ch, self.strip_anno)
            cards += [(card, True) for card in row.cache["key_moves"]]
        return cards

    @property
    def strip_anno(self) -> bool:
        return bool(self.config.get("strip_anno", True))

    def refresh_status(self, row: Row):
        if not row.importable:
            row.status, row.card_statuses = "", []
            return
        row.card_statuses = [
            anki_ops.card_status(mw.col, card, self.strip_anno)[0] for card, _ in self.row_cards(row)
        ]
        found = set(row.card_statuses)
        row.status = found.pop() if len(found) == 1 else "changed"

    def refresh_statuses(self):
        for row in self.rows:
            self.refresh_status(row)

    # --- Values of the choice cells ---

    def choices_for(self, col: int, row: Row | None = None) -> list[tuple[str, object]]:
        if col == COL_KIND:
            return [(tr(KIND_KEYS[k]), k) for k in CHAPTER_KINDS]
        if col == COL_SIDE:
            # A structure has your side and the opponent's, not both
            return [(tr(key), side) for side, key in SIDES if side or not (row and row.structure)]
        return [
            (name if exists else f"{name} {tr('note_type.new')}", name) for name, _, exists in self.choices
        ]

    def value_of(self, row: Row, col: int):
        return {COL_KIND: row.kind, COL_SIDE: row.side, COL_NOTE_TYPE: row.note_type}[col]

    def label_of(self, row: Row, col: int) -> str:
        if col == COL_KIND:
            return tr(KIND_KEYS[row.kind])
        if col == COL_SIDE:
            return tr(dict(SIDES)[row.side])
        return row.note_type

    def targets(self, row: Row) -> list[Row]:
        """The selected rows when the row is one of several selected, else the row."""
        selected = self.selected_rows()
        return [r for r in selected if r.importable] if row in selected and len(selected) > 1 else [row]

    def set_value(self, row: Row, col: int, value, rows: list[Row] | None = None):
        """A choice for a row (and the other selected rows): kind, side or note type."""
        for target in rows if rows is not None else self.targets(row):
            if col not in target.editable_columns or (target.structure and value is None):
                continue
            if target.structure:
                # Your side is the one card 1 hides: another image and other masks
                target.side = value
                self.refresh_status(target)
            elif col == COL_KIND:
                target.kind = value
                self.refresh_status(target)
            elif col == COL_SIDE:
                # Puzzle when you make the first move, Flipped when the opponent does, Study for both
                target.side = value
                target.note_type = self.note_type_for_mode(mode_for(value, target.chapter.side_to_move))
            elif col == COL_NOTE_TYPE:
                # The side the note type makes you play
                target.note_type = value
                mode = self.choice_modes.get(value)
                stm = target.chapter.side_to_move
                if mode:
                    target.side = None if mode == MODE_STUDY else OTHER_SIDE[stm] if mode == MODE_FLIPPED else stm
            self.refresh_row(target)
        self.update_plan()
        self.show_preview(self.table.currentRow())

    # --- Table ---

    def populate_table(self):
        self._populating = True
        self.table.setRowCount(0)
        self.table.setRowCount(len(self.rows))
        for i, row in enumerate(self.rows):
            self.fill_row(i, row)
        self._populating = False
        self.apply_filter()
        self.study_label.setText(self.summary_text())
        self.update_plan()

    def fill_row(self, i: int, row: Row):
        ch = row.chapter
        check = QTableWidgetItem()
        flags = Qt.ItemFlag.ItemIsUserCheckable | Qt.ItemFlag.ItemIsEnabled
        check.setFlags((flags if row.importable else Qt.ItemFlag.NoItemFlags) | Qt.ItemFlag.ItemIsSelectable)
        check.setCheckState(Qt.CheckState.Checked if row.checked else Qt.CheckState.Unchecked)
        self.table.setItem(i, COL_CHECK, check)

        study = f"{row.study.name}\n" if len(self.studies) > 1 else ""
        url_tip = "\n".join(filter(None, [ch.chapter_url, ch.chapter_url and tr("table.open_tip")]))
        self.table.setItem(i, COL_NAME, readonly_item(ch.name, f"{study}{ch.name}\n{url_tip}".strip()))
        self.table.setItem(i, COL_STATUS, readonly_item(""))
        deck_item = DeckItem("")
        deck_item.setFlags(Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsSelectable)
        self.table.setItem(i, COL_DECK, deck_item)
        moves = textwrap.fill(ch.moves_preview(600), 80)
        self.table.setItem(i, COL_PREVIEW, readonly_item(ch.moves_preview(200), moves))
        for col in CHOICE_COLUMNS:
            self.table.setItem(i, col, readonly_item(""))
        self.refresh_row(row, i)

    def refresh_row(self, row: Row, i: int | None = None):
        """Show a row's state in its cells."""
        i = self.table_row(row) if i is None else i
        populating, self._populating = self._populating, True
        try:
            status = STATUS_KEYS.get(row.status)
            item = self.table.item(i, COL_STATUS)
            item.setText(tr(status) if status else "")
            tip = tr(f"{status}_tip") if status else ""
            if len(row.card_statuses) > 1:
                tip += "\n" + tr("status.cards", count=len(row.card_statuses))
            item.setToolTip(tip.strip())
            color = status_color(row.status, self.table)
            font = item.font()
            font.setBold(color is not None)
            item.setFont(font)
            if color is not None:
                item.setForeground(color)
            else:
                item.setData(Qt.ItemDataRole.ForegroundRole, None)

            if not row.importable:
                # Nothing to import: plain text, nothing to choose
                if row.kind == KIND_UNSUPPORTED:
                    tip = tr("kind.unsupported_tip", variant=row.chapter.variant)
                else:
                    tip = tr(row.blocked) if row.blocked else ""
                for col, text in ((COL_KIND, tr(KIND_KEYS[row.kind])), (COL_SIDE, "—"), (COL_NOTE_TYPE, "—")):
                    item = self.table.item(i, col)
                    item.setText(text)
                    item.setToolTip(tip)
                    item.setFlags(Qt.ItemFlag.ItemIsSelectable)
                return
            for col in CHOICE_COLUMNS:
                item = self.table.item(i, col)
                item.setText(self.label_of(row, col))
                flags = Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsSelectable
                if col in row.editable_columns:
                    flags |= Qt.ItemFlag.ItemIsEditable
                item.setFlags(flags)
            if row.structure:
                self.table.item(i, COL_SIDE).setToolTip(tr("side.structure_tip"))
                tip = tr("note_type.structure_tip")
                self.table.item(i, COL_NOTE_TYPE).setToolTip(tip)
            else:
                side_tip = tr("side.tooltip", side=tr(f"side.to_move.{row.chapter.side_to_move}"))
                self.table.item(i, COL_SIDE).setToolTip(side_tip)
                exists = self.choice_exists.get(row.note_type, True)
                self.table.item(i, COL_NOTE_TYPE).setToolTip("" if exists else tr("note_type.new_tip"))

            placement = self.placement(row)
            deck = self.table.item(i, COL_DECK)
            deck.setFlags(Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsSelectable | Qt.ItemFlag.ItemIsEditable)
            # The study deck is in the field above: the cell keeps the subdeck, empty when
            # the chapter goes to the study deck itself
            deck.setText(row.subdeck if row.subdeck is not None else decks.section_name(row.kind))
            deck.setToolTip("\n".join([placement.deck, *placement.tags]))
        finally:
            self._populating = populating

    def refresh_rows(self, rows: list[Row] | None = None):
        for row in rows if rows is not None else self.rows:
            self.refresh_row(row)

    def table_row(self, row: Row) -> int:
        return self.rows.index(row)

    def apply_filter(self):
        words = self.filter_edit.text().lower().split()
        attr, value = self.quick_filter.currentData() or (None, None)
        for i, row in enumerate(self.rows):
            text = " ".join([row.chapter.name, row.study.name, row.chapter.moves_preview(200)]).lower()
            shown = all(w in text for w in words) and (attr is None or getattr(row, attr) == value)
            self.table.setRowHidden(i, not shown)

    def on_sort(self, col: int):
        keys = {
            COL_CHECK: lambda r: not r.checked,
            COL_NAME: lambda r: (r.study.name.lower(), r.chapter.name.lower()),
            COL_STATUS: lambda r: list(STATUS_KEYS).index(r.status) if r.status in STATUS_KEYS else 9,
            COL_KIND: lambda r: list(KIND_KEYS).index(r.kind),
            COL_SIDE: lambda r: r.side or "z",
            COL_NOTE_TYPE: lambda r: r.note_type,
            COL_DECK: lambda r: self.placement(r).deck.lower(),
        }
        if col not in keys or not self.rows:
            return
        last_col, order = self._sort
        order = (
            Qt.SortOrder.DescendingOrder
            if last_col == col and order == Qt.SortOrder.AscendingOrder
            else Qt.SortOrder.AscendingOrder
        )
        self._sort = (col, order)
        self.rows.sort(key=keys[col], reverse=order == Qt.SortOrder.DescendingOrder)
        header = self.table.horizontalHeader()
        header.setSortIndicatorShown(True)
        header.setSortIndicator(col, order)
        self.populate_table()

    # --- Editing ---

    def selected_rows(self) -> list[Row]:
        return [self.rows[index.row()] for index in self.table.selectionModel().selectedRows()]

    def on_cell_clicked(self, i: int, col: int):
        """A click on a Type, You play or Note type cell opens its list (not with Ctrl/Shift)."""
        if col in CHOICE_COLUMNS and QApplication.keyboardModifiers() == Qt.KeyboardModifier.NoModifier:
            item = self.table.item(i, col)
            if item and item.flags() & Qt.ItemFlag.ItemIsEditable:
                self.table.editItem(item)

    def on_item_changed(self, item: QTableWidgetItem):
        if self._populating:
            return
        row = self.rows[item.row()]
        if item.column() == COL_CHECK:
            row.checked = item.checkState() == Qt.CheckState.Checked
            self.update_plan()
        elif item.column() == COL_DECK:
            self.rename_subdeck(self.targets(row), item.data(Qt.ItemDataRole.EditRole) or "")

    def rename_subdeck(self, rows: list[Row], text: str):
        """A subdeck typed for rows; their default name puts them back to the default."""
        subdeck = decks.clean_deck_name(text)
        for row in rows:
            if row.importable:
                row.subdeck = None if subdeck == decks.section_name(row.kind) else subdeck
                self.refresh_row(row)

    def on_double_click(self, i: int, col: int):
        url = self.rows[i].chapter.chapter_url if i < len(self.rows) else ""
        if col == COL_NAME and url:
            openLink(url)

    def toggle_selected(self):
        """Space: check or uncheck the selected rows (all like the first one)."""
        rows = [r for r in self.selected_rows() if r.importable]
        if rows:
            self.set_checked_rows(rows, not rows[0].checked)

    def on_context_menu(self, pos):
        index = self.table.indexAt(pos)
        if not index.isValid():
            return
        if not self.table.selectionModel().isRowSelected(index.row(), index.parent()):
            self.table.selectRow(index.row())
        rows = [r for r in self.selected_rows() if r.importable]
        clicked = self.rows[index.row()]
        menu = QMenu(self.table)
        if rows:
            menu.addAction(tr("menu.check"), lambda: self.set_checked_rows(rows, True))
            menu.addAction(tr("menu.uncheck"), lambda: self.set_checked_rows(rows, False))
            menu.addSeparator()
            for col, title in (
                (COL_KIND, tr("table.kind")),
                (COL_SIDE, tr("table.side")),
                (COL_NOTE_TYPE, tr("table.note_type")),
            ):
                targets = [r for r in rows if col in r.editable_columns]
                if not targets:
                    continue
                submenu = menu.addMenu(title)
                only_structures = all(r.structure for r in targets)
                for label, value in self.choices_for(col, targets[0] if only_structures else None):
                    action = submenu.addAction(
                        label, lambda c=col, v=value, t=targets: self.set_value(t[0], c, v, t)
                    )
                    action.setCheckable(True)
                    action.setChecked(all(self.value_of(r, col) == value for r in targets))
            menu.addAction(tr("menu.rename_subdeck"), lambda: self.ask_subdeck(rows))
            menu.addAction(tr("menu.default_subdeck"), lambda: self.reset_subdecks(rows))
            menu.addSeparator()
        if clicked.chapter.chapter_url:
            menu.addAction(tr("menu.open_lichess"), lambda: openLink(clicked.chapter.chapter_url))
        imported = [r for r in rows if r.status in ("same", "changed")]
        if imported:
            menu.addAction(tr("menu.browse_notes"), lambda: browse(self.notes_of(imported)))
        menu.exec(self.table.viewport().mapToGlobal(pos))

    def ask_subdeck(self, rows: list[Row]):
        current = rows[0].subdeck if rows[0].subdeck is not None else decks.section_name(rows[0].kind)
        text, ok = QInputDialog.getText(self, tr("menu.rename_subdeck"), tr("menu.rename_subdeck_label"), text=current)
        if ok:
            self.rename_subdeck(rows, text)

    def reset_subdecks(self, rows: list[Row]):
        for row in rows:
            row.subdeck = None
            self.refresh_row(row)

    def notes_of(self, rows: list[Row]) -> list[int]:
        nids = []
        for row in rows:
            for card, _ in self.row_cards(row):
                nids += anki_ops.find_existing(mw.col, card)
        return nids

    def on_expand_option(self):
        self.refresh_statuses()
        self.populate_table()

    # --- Board preview ---

    def show_preview(self, i: int):
        if not 0 <= i < len(self.rows):
            self.preview.show_game(None)
            return
        row = self.rows[i]
        if "game" not in row.cache:
            try:
                row.cache["game"] = chess.pgn.read_game(io.StringIO(row.chapter.pgn(self.strip_anno)))
            except (ValueError, KeyError):
                row.cache["game"] = None
        game = row.cache["game"]
        caption = f"<b>{html.escape(row.chapter.name)}</b>"
        if game is None:
            self.preview.show_game(None, caption=caption)
            return
        if row.structure:
            # The structure from your side, its plans, and the cards it makes
            plans = textwrap.shorten(row.chapter.comment_text, 600, placeholder=" …")
            if plans:
                caption += "<br>" + html.escape(plans)
            caption += "<br><small>" + tr("structure.cards") + "</small>"
            self.preview.show_game(game, 0, row.side != "b", caption)
            return
        first = game.next()
        # The chapter's intro, without commands such as [%eval] or [%cal]
        intro = " ".join(filter(None, [game.comment, first.comment if first else ""]))
        intro = " ".join(COMMAND_RE.sub(" ", intro).split())
        if intro:
            caption += "<br>" + textwrap.shorten(html.escape(intro), 300, placeholder=" …")
        cards = self.row_cards(row) if row.importable else []
        if len(cards) > 1:
            caption += "<br><small>" + tr("status.cards", count=len(cards)) + "</small>"
            if row.kind == KIND_LINE and self.split_lines.isChecked():
                names = [html.escape(card.name.split(": ", 1)[-1]) for card, _ in cards[:8]]
                caption += "<small><br>• " + "<br>• ".join(names) + ("<br>…" if len(cards) > 8 else "") + "</small>"
        # Flipped: the opponent's first move is played before your turn
        flipped = first is not None and self.choice_modes.get(row.note_type) == MODE_FLIPPED
        self.preview.show_game(game, 1 if flipped else 0, (row.side or "w") == "w", caption)

    # --- Decks ---

    def placement(self, row: Row) -> decks.Placement:
        if row.cache.get("opening_kind") != row.kind:
            row.cache["opening"] = decks.chapter_opening_name(row.chapter, row.kind)
            row.cache["opening_kind"] = row.kind
        return decks.place_chapter(
            row.chapter,
            self.root,
            kind=row.kind,
            opening=row.cache["opening"] or "",
            fallback_study=row.study.fallback,
            deck=row.study.deck,
            subdeck=row.subdeck,
        )

    def current_study(self) -> Study | None:
        i = self.study_combo.currentIndex()
        return self.studies[i] if 0 <= i < len(self.studies) else None

    def on_study_selected(self, _index: int):
        study = self.current_study()
        if study:
            self.deck_edit.setText(study.deck)

    def on_study_deck_typed(self, text: str):
        study = self.current_study()
        if study:
            study.deck = decks.clean_deck_name(text) or study.default_deck
            self.refresh_rows([r for r in self.rows if r.study is study])

    def on_study_deck_edited(self):
        """Show the name as Anki will store it (trimmed levels, no empty ones), and keep it."""
        study = self.current_study()
        if study and self.deck_edit.text() != study.deck:
            self.deck_edit.setText(study.deck)
        self.link_study_deck(study)

    def set_study_deck(self, name: str):
        """A deck picked from the list or the suggestions: the study's deck from now on."""
        study = self.current_study()
        if not study:
            return
        study.deck = decks.clean_deck_name(name) or study.default_deck
        self.deck_edit.setText(study.deck)
        self.refresh_rows([r for r in self.rows if r.study is study])
        self.link_study_deck(study)

    def choose_study_deck(self):
        """Anki's deck list (with its filter and Add button), as in the Add window."""
        study = self.current_study()
        if not study:
            return
        StudyDeck(
            mw,
            current=study.deck,
            accept=tr("form.study_deck_choose_accept"),
            title=tr("form.study_deck_choose_title", study=study.name),
            parent=self,
            geomKey="ankiChessStudyDeck",
            callback=lambda chooser: chooser.name and self.set_study_deck(chooser.name),
        )

    def link_study_deck(self, study: Study | None):
        """
        Keep the study's deck in the config right away, so the next import of the study
        (even an update) uses it; the default name isn't kept.
        """
        if not study or not study.key:
            return
        study_decks = dict(self.config.get("study_decks", {}))
        if study.deck != study.default_deck:
            study_decks[study.key] = study.deck
        else:
            study_decks.pop(study.key, None)
        if study_decks != self.config.get("study_decks", {}):
            self.config["study_decks"] = study_decks
            write_config(self.config)

    def refresh_deck_names(self):
        self.deck_names.setStringList(anki_ops.deck_names(mw.col))

    def reset_decks(self):
        """Back to the names from Lichess: the study deck and its subdecks."""
        study = self.current_study()
        if not study:
            return
        study.deck = study.default_deck
        self.deck_edit.setText(study.deck)
        self.reset_subdecks([r for r in self.rows if r.study is study])
        self.link_study_deck(study)

    # --- Selection ---

    def set_checked_rows(self, rows: list[Row], value: bool):
        self._populating = True
        for row in rows:
            if row.importable:
                row.checked = value
                self.table.item(self.table_row(row), COL_CHECK).setCheckState(
                    Qt.CheckState.Checked if value else Qt.CheckState.Unchecked
                )
        self._populating = False
        self.update_plan()

    def check_new_and_changed(self):
        self.set_checked_rows([r for r in self.rows if r.status in ("new", "changed")], True)

    def check_exercises_and_lines(self):
        self.set_checked_rows([r for r in self.rows if r.kind in (KIND_EXERCISE, KIND_LINE)], True)

    def uncheck_all(self):
        self.set_checked_rows(self.rows, False)

    def on_toggle_games(self, checked: bool):
        self.set_checked_rows([r for r in self.rows if r.kind == KIND_GAME], checked)

    def checked_rows(self) -> list[Row]:
        return [r for r in self.rows if r.importable and r.checked]

    # --- What the import will do ---

    def plan(self) -> tuple[dict, list[str]]:
        """Counts of the cards to import by what happens to them, and note types to create."""
        update = self.update_existing.isChecked()
        counts = {"chapters": 0, "notes": 0, "new": 0, "update": 0, "same": 0, "skip": 0}
        created = set()
        for row in self.checked_rows():
            counts["chapters"] += 1
            for (card, key_move), status in zip(self.row_cards(row), row.card_statuses):
                counts["notes"] += 1
                if status == "new":
                    counts["new"] += 1
                elif not update:
                    counts["skip"] += 1
                else:
                    counts["update" if status == "changed" else "same"] += 1
                name = self.note_type_for_mode(card.suggested_mode) if key_move else row.note_type
                if not self.choice_exists.get(name, True):
                    created.add(name)
        return counts, sorted(created)

    def update_plan(self):
        counts, created = self.plan()
        if not counts["chapters"]:
            self.import_btn.setText(tr("button.import"))
            self.import_btn.setEnabled(False)
            self.plan_label.setText("")
            return
        self.import_btn.setText(tr("button.import_plan", chapters=counts["chapters"], notes=counts["notes"]))
        self.import_btn.setEnabled(self.base is not None)
        text = tr("plan.summary", **counts)
        if created:
            text += "<br>" + tr("plan.new_note_types", names=", ".join(created), base=self.base["name"])
        self.plan_label.setText(f"<small>{text}</small>")

    # --- Import ---

    def import_cards(self, rows: list[Row]) -> list[tuple[Chapter, str, decks.Placement]]:
        """(card, note type name, placement) of every card of the rows."""
        cards = []
        for row in rows:
            placement = self.placement(row)
            for card, key_move in self.row_cards(row):
                if key_move:
                    # Played from your side of the game: its note type follows the card
                    deck = decks.clean_deck_name(f"{row.study.deck}::{decks.section_name(decks.KIND_KEY_MOVE)}")
                    name = self.note_type_for_mode(card.suggested_mode)
                    cards.append((card, name, decks.Placement(deck, placement.tags)))
                else:
                    cards.append((card, row.note_type, placement))
        return cards

    def renamed_decks(self) -> dict:
        """Config entries keeping the deck names edited for these studies (defaults removed)."""
        study_decks = dict(self.config.get("study_decks", {}))
        for study in self.studies:
            if study.key:
                if study.deck != study.default_deck:
                    study_decks[study.key] = study.deck
                else:
                    study_decks.pop(study.key, None)
        chapter_decks = dict(self.config.get("chapter_decks", {}))
        for row in self.rows:
            key = row.chapter.dedupe_key
            if key:
                if row.subdeck is not None:
                    chapter_decks[key] = row.subdeck
                else:
                    chapter_decks.pop(key, None)
        return {"study_decks": study_decks, "chapter_decks": chapter_decks}

    def on_import(self):
        rows = self.checked_rows()
        if not rows or not self.import_btn.isEnabled():
            return
        base = self.base
        selected = self.import_cards(rows)

        # Missing Flipped/Study note types are created up front (outside the undoable import)
        models = {}
        try:
            for name in {name for _, name, _ in selected}:
                models[name] = mw.col.models.by_name(name) or anki_ops.ensure_mode_note_type(
                    base, self.choice_modes[name]
                )
        except anki_ops.ChessImportError as e:
            showWarning(str(e), parent=self)
            return
        cards = [(card, models[name], placement) for card, name, placement in selected]

        update_existing = self.update_existing.isChecked()
        stats = {}
        self.config.update(
            {
                "include_games": self.include_games.isChecked(),
                "split_lines": self.split_lines.isChecked(),
                "key_moves": self.key_moves.isChecked(),
                "update_existing": update_existing,
                **self.renamed_decks(),
            }
        )
        write_config(self.config)

        def on_success(_changes):
            # The page stays open, to import more chapters or another study
            self.last_result = tr("result.summary", **stats)
            self.last_nids = stats.get("nids", [])
            tooltip(self.last_result, parent=mw)
            # Note types created now exist: no more "(new)"
            self.choices = anki_ops.note_type_choices(base) if base else []
            self.choice_exists = {name: exists for name, _, exists in self.choices}
            self.refresh_deck_names()
            for row in rows:
                row.checked = False
            self.refresh_statuses()
            self.find_removed_chapters()
            self.refresh_imported_list()
            self.populate_table()
            offer_note_type_change(stats.get("other_type"), self)

        CollectionOp(
            parent=self,
            op=lambda col: anki_ops.import_chapters(col, cards, update_existing, self.strip_anno, stats),
        ).success(on_success).run_in_background()



def offer_note_type_change(other: dict[str, list[int]] | None, parent=None):
    """
    Chapters imported before in another note type keep it (e.g. AnkiChess for a chapter
    played as Black). Changing it needs a full sync, so the notes are shown in the
    Browser for Notes > Change Note Type.
    """
    if not other:
        return
    count = sum(len(nids) for nids in other.values())
    targets = ", ".join(f"{name} ({len(nids)})" for name, nids in other.items())
    if askUser(tr("result.other_type", count=count, targets=targets), parent=parent or mw):
        nids = ",".join(str(nid) for nids in other.values() for nid in nids)
        aqt.dialogs.open("Browser", mw, search=(f"nid:{nids}",))
