"""
Games page of the import window: load a game (your recent games on Chess.com and
Lichess, a link, a Chess.com analysis export or a PGN), analyse it and import the
resulting cards. Lichess games analysed on the server need no Stockfish: the analysis
in their PGN gives the errors and the best moves.
"""

from __future__ import annotations

import os

from aqt import mw
from aqt.operations import CollectionOp, QueryOp
from aqt.qt import (
    QCheckBox,
    QComboBox,
    QDialog,
    QDialogButtonBox,
    QDoubleSpinBox,
    QFileDialog,
    QFormLayout,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QMenu,
    QPushButton,
    Qt,
    QTableWidget,
    QTableWidgetItem,
    QToolButton,
    QVBoxLayout,
    QWidget,
)
from aqt.utils import askUser, showWarning, tooltip

from . import anki_ops, chesscom, decks, engine, lichess_api, recent_games
from .chess_lib import chess
from .game_analysis import (
    ALL_KINDS,
    DEFAULT_KINDS,
    ENGINE_KINDS,
    AnalysisOptions,
    analyze_game,
    has_server_analysis,
)
from .i18n import tr
from .ui_common import (
    ask_pgn,
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

COL_CHECK, COL_MOVE, COL_KIND, COL_SOLUTION, COL_EVAL, COL_STATUS, COL_DECK = range(7)
COLUMN_WIDTHS = {
    COL_CHECK: 28,
    COL_MOVE: 150,
    COL_KIND: 130,
    COL_SOLUTION: 260,
    COL_EVAL: 110,
    COL_STATUS: 90,
}
COLUMNS_KEY = "gameImportColumns"
RECENT_COLUMNS = ("recent.date", "recent.site", "recent.white", "recent.black", "recent.you", "recent.speed", "recent.analysis")


class RecentGamesDialog(QDialog):
    """Your latest Chess.com and Lichess games, to pick the one to import."""

    def __init__(self, parent, config: dict):
        super().__init__(parent)
        self.setWindowTitle(tr("recent.title"))
        self.resize(820, 520)
        self.config = config
        self.games: list[recent_games.RecentGame] = []
        layout = QVBoxLayout(self)

        users = QHBoxLayout()
        self.chesscom_edit = QLineEdit(config.get("chesscom_user") or next(iter(config.get("chesscom_usernames", [])), ""))
        self.chesscom_edit.setPlaceholderText(tr("recent.chesscom_user"))
        self.lichess_edit = QLineEdit(config.get("lichess_user", ""))
        self.lichess_edit.setPlaceholderText(tr("recent.lichess_user"))
        search = QPushButton(tr("recent.search"))
        search.clicked.connect(self.on_search)
        for widget in (QLabel("Chess.com:"), self.chesscom_edit, QLabel("Lichess:"), self.lichess_edit, search):
            users.addWidget(widget)
        layout.addLayout(users)

        filters = QHBoxLayout()
        self.losses_only = QCheckBox(tr("recent.losses_only"))
        self.analysed_only = QCheckBox(tr("recent.analysed_only"))
        self.analysed_only.setToolTip(tr("recent.analysed_tip"))
        for check in (self.losses_only, self.analysed_only):
            check.toggled.connect(self.apply_filter)
            filters.addWidget(check)
        filters.addStretch(1)
        self.status = QLabel()
        filters.addWidget(self.status)
        layout.addLayout(filters)

        self.table = QTableWidget(0, len(RECENT_COLUMNS))
        self.table.setHorizontalHeaderLabels([tr(k) for k in RECENT_COLUMNS])
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QTableWidget.SelectionMode.SingleSelection)
        self.table.verticalHeader().setVisible(False)
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.cellDoubleClicked.connect(lambda *_: self.accept())
        layout.addWidget(self.table, 1)

        buttons = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        buttons.button(QDialogButtonBox.StandardButton.Ok).setText(tr("recent.load"))
        buttons.button(QDialogButtonBox.StandardButton.Cancel).setText(tr("button.cancel"))
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)
        if self.chesscom_edit.text() or self.lichess_edit.text():
            self.on_search()

    def on_search(self):
        chesscom_user = self.chesscom_edit.text().strip()
        lichess_user = self.lichess_edit.text().strip()
        if not chesscom_user and not lichess_user:
            return
        token = lichess_token()
        self.status.setText(tr("recent.loading"))

        def fetch(col):
            lists, errors = [], []
            if chesscom_user:
                try:
                    games = chesscom.fetch_recent_games(chesscom_user)
                    lists.append([g for g in (recent_games.from_chesscom(d, chesscom_user) for d in games) if g])
                except chesscom.ChessComError as e:
                    errors.append(f"Chess.com: {error_text(e)}")
            if lichess_user:
                try:
                    games = lichess_api.fetch_user_games(lichess_user, token=token)
                    lists.append([recent_games.from_lichess(d, lichess_user) for d in games])
                except lichess_api.LichessError as e:
                    errors.append(f"Lichess: {error_text(e)}")
            return recent_games.merge(*lists), errors

        def on_done(result):
            self.games, errors = result
            self.config.update({"chesscom_user": chesscom_user, "lichess_user": lichess_user})
            self.status.setText("\n".join(errors) or tr("recent.found", count=len(self.games)))
            self.fill()

        QueryOp(parent=self, op=fetch, success=on_done).without_collection().run_in_background()

    def fill(self):
        outcomes = {"win": tr("recent.win"), "loss": tr("recent.loss"), "draw": tr("recent.draw")}
        self.table.setRowCount(len(self.games))
        for i, game in enumerate(self.games):
            site = "Lichess" if game.source == "lichess" else "Chess.com"
            values = (
                game.date,
                site,
                game.white,
                game.black,
                outcomes.get(game.outcome, game.result),
                game.speed,
                "✓" if game.analysed else "",
            )
            for col, value in enumerate(values):
                self.table.setItem(i, col, readonly_item(value, game.url))
        self.table.resizeColumnsToContents()
        self.apply_filter()

    def apply_filter(self):
        for i, game in enumerate(self.games):
            hidden = (self.losses_only.isChecked() and game.outcome != "loss") or (
                self.analysed_only.isChecked() and not game.analysed
            )
            self.table.setRowHidden(i, hidden)

    def selected_game(self) -> recent_games.RecentGame | None:
        rows = self.table.selectionModel().selectedRows()
        return self.games[rows[0].row()] if rows else None


class GameImportPage(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.config = get_config()
        self.game: chess.pgn.Game | None = None
        self.cards = []
        self.statuses: list[str] = []
        self.last_nids: list[int] = []
        self.base = anki_ops.default_base(self.config.get("base_note_type", ""))
        self.root = decks.root_name(self.config.get("deck_root"))

        layout = QVBoxLayout(self)

        # --- Sources ---
        src = QHBoxLayout()
        self.url_edit = QLineEdit()
        self.url_edit.setPlaceholderText(tr("cc.url_placeholder"))
        self.url_edit.returnPressed.connect(self.on_load_link)
        load = QPushButton(tr("cc.load_link"))
        load.clicked.connect(self.on_load_link)
        recent = QPushButton(tr("recent.button"))
        recent.setToolTip(tr("recent.button_tip"))
        recent.clicked.connect(self.on_recent_games)
        more = QToolButton()
        more.setText(tr("source.more"))
        more.setPopupMode(QToolButton.ToolButtonPopupMode.InstantPopup)
        more_menu = QMenu(more)
        more_menu.addAction(tr("cc.open_file"), self.on_open_file)
        more_menu.addAction(tr("cc.paste"), self.on_paste)
        more.setMenu(more_menu)
        for widget, stretch in ((self.url_edit, 1), (load, 0), (recent, 0), (more, 0)):
            src.addWidget(widget, stretch)
        layout.addLayout(src)

        self.summary = QLabel(tr("cc.none"))
        self.summary.setWordWrap(True)
        self.summary.setTextInteractionFlags(Qt.TextInteractionFlag.TextBrowserInteraction)
        self.summary.linkActivated.connect(self.on_summary_link)
        layout.addWidget(self.summary)

        # --- Options ---
        opts = QFormLayout()
        side_row = QHBoxLayout()
        self.side_combo = QComboBox()
        self.analyze_btn = QPushButton(tr("cc.analyze"))
        self.analyze_btn.setEnabled(False)
        self.analyze_btn.clicked.connect(self.on_analyze)
        self.advanced_btn = QPushButton(tr("cc.advanced"))
        self.advanced_btn.setCheckable(True)
        self.advanced_btn.setFlat(True)
        self.advanced_btn.toggled.connect(self.show_advanced)
        side_row.addWidget(self.side_combo, 1)
        side_row.addWidget(self.advanced_btn)
        side_row.addWidget(self.analyze_btn)
        opts.addRow(tr("cc.side"), side_row)

        kinds_box = QGridLayout()
        selected = set(self.config.get("chesscom_kinds") or DEFAULT_KINDS)
        self.kind_checks: dict[str, QCheckBox] = {}
        for i, kind in enumerate(ALL_KINDS):
            check = QCheckBox(tr(f"kind.{kind}"))
            check.setChecked(kind in selected)
            self.kind_checks[kind] = check
            kinds_box.addWidget(check, i // 4, i % 4)
        opts.addRow(tr("cc.cards"), kinds_box)
        layout.addLayout(opts)

        # Stockfish: only for games without an analysis in their PGN
        self.advanced = QWidget()
        advanced = QFormLayout(self.advanced)
        advanced.setContentsMargins(0, 0, 0, 0)
        engine_row = QHBoxLayout()
        self.engine_label = QLabel()
        self.engine_label.setWordWrap(True)
        btn_download = QPushButton(tr("cc.engine_download"))
        btn_download.clicked.connect(lambda: self.download_engine())
        btn_choose = QPushButton(tr("cc.engine_choose"))
        btn_choose.clicked.connect(self.on_choose_engine)
        engine_row.addWidget(self.engine_label, 1)
        engine_row.addWidget(btn_download)
        engine_row.addWidget(btn_choose)
        advanced.addRow("Stockfish:", engine_row)
        self.time_spin = QDoubleSpinBox()
        self.time_spin.setRange(0.1, 10.0)
        self.time_spin.setSingleStep(0.1)
        self.time_spin.setValue(float(self.config.get("analysis_time", 0.5)))
        advanced.addRow(tr("cc.move_time"), self.time_spin)
        layout.addWidget(self.advanced)
        self.advanced.setVisible(False)

        # --- Cards ---
        self.table = QTableWidget(0, 7)
        self.table.setHorizontalHeaderLabels(
            [
                "",
                tr("cc.table.move"),
                tr("table.kind"),
                tr("cc.table.solution"),
                tr("cc.table.eval"),
                tr("table.status"),
                tr("table.deck"),
            ]
        )
        for col, width in COLUMN_WIDTHS.items():
            self.table.setColumnWidth(col, width)
        self.table.itemChanged.connect(lambda item: self.update_plan())
        layout.addWidget(self.table, 1)
        restore_columns(self.table, COLUMNS_KEY)

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
        self.refresh_engine_label()

    def save_layout(self):
        save_columns(self.table, COLUMNS_KEY)

    def show_advanced(self, shown: bool):
        self.advanced.setVisible(shown)
        self.advanced_btn.setText(tr("cc.advanced_open") if shown else tr("cc.advanced"))

    # --- Engine ---

    def engine_path(self) -> str | None:
        return engine.find_stockfish(self.config.get("stockfish_path", ""))

    def refresh_engine_label(self):
        path = self.engine_path()
        self.engine_label.setText(
            tr("cc.engine_found", path=path) if path else tr("cc.engine_missing")
        )

    def on_choose_engine(self):
        path, _ = QFileDialog.getOpenFileName(self, "Stockfish", "", "")
        if path:
            self.config["stockfish_path"] = path
            write_config(self.config)
            self.refresh_engine_label()

    def download_engine(self, then=None):
        def progress(done, total):
            mb = lambda n: f"{n / 1048576:.0f}"  # noqa: E731
            mw.taskman.run_on_main(
                lambda: mw.progress.update(
                    label=tr("cc.engine_downloading", done=mb(done), total=mb(total) if total else "?"),
                    value=done // 1048576,
                    max=total // 1048576 if total else 0,
                )
            )

        def on_success(path):
            self.refresh_engine_label()
            if then:
                then()

        QueryOp(
            parent=self,
            op=lambda col: engine.download_stockfish(progress),
            success=on_success,
        ).failure(lambda e: showWarning(error_text(e), parent=self)).with_progress(
            tr("cc.engine_downloading", done=0, total="?")
        ).without_collection().run_in_background()

    # --- Loading ---

    def on_recent_games(self):
        dialog = RecentGamesDialog(self, self.config)
        if dialog.exec() and dialog.selected_game():
            game = dialog.selected_game()
            write_config(self.config)  # the usernames
            self.url_edit.setText(game.url)
            self.load_pgn(game.pgn, game.user_color)

    def on_open_file(self):
        path, _ = QFileDialog.getOpenFileName(
            self,
            tr("cc.open_file"),
            self.config.get("last_dir", ""),
            tr("source.file_filter"),
        )
        if not path:
            return
        self.config["last_dir"] = os.path.dirname(path)
        try:
            with open(path, encoding="utf-8-sig") as f:
                self.load_pgn(f.read())
        except (OSError, UnicodeDecodeError) as e:
            showWarning(tr("warn.read_file", error=e), parent=self)

    def on_paste(self):
        text = ask_pgn(self)
        if text:
            self.load_pgn(text)

    def on_load_link(self):
        text = self.url_edit.text()
        lichess_id = lichess_api.parse_game_url(text)
        parsed = chesscom.parse_game_url(text)
        token = lichess_token()
        if lichess_id:
            fetch = lambda col: lichess_api.fetch_game_pgn(lichess_id, token)  # noqa: E731
        elif parsed:
            fetch = lambda col: chesscom.fetch_game_pgn(*parsed)  # noqa: E731
        else:
            showWarning(tr("chesscom.invalid_url"), parent=self)
            return
        QueryOp(
            parent=self,
            op=fetch,
            success=self.load_pgn,
        ).failure(lambda e: showWarning(error_text(e), parent=self)).with_progress(
            tr("cc.loading")
        ).without_collection().run_in_background()

    def load_pgn(self, text: str, user_color: bool | None = None):
        try:
            self.game = chesscom.read_game(text)
        except chesscom.ChessComError as e:
            showWarning(error_text(e), parent=self)
            return
        h = self.game.headers
        count = sum(chesscom.move_label(n) in chesscom.ERROR_LABELS for n in self.game.mainline())
        server_analysis = has_server_analysis(self.game)
        if server_analysis:
            labels = tr("cc.server_analysis", count=count)
        else:
            labels = tr("cc.labels_found", count=count) if count else tr("cc.labels_missing")
        self.summary.setText(
            tr(
                "cc.summary",
                white=h.get("White", "?"),
                black=h.get("Black", "?"),
                date=h.get("Date", "?"),
                result=h.get("Result", "*"),
                labels=labels,
            )
        )
        # Stockfish only matters without the Lichess analysis
        self.advanced_btn.setVisible(not server_analysis)
        if server_analysis:
            self.show_advanced(False)
            self.advanced_btn.setChecked(False)

        self.side_combo.clear()
        self.side_combo.addItem(tr("cc.side_white", name=h.get("White", "?")), chess.WHITE)
        self.side_combo.addItem(tr("cc.side_black", name=h.get("Black", "?")), chess.BLACK)
        mine = {u.lower() for u in self.config.get("chesscom_usernames", [])}
        mine |= {self.config.get(k, "").lower() for k in ("chesscom_user", "lichess_user")} - {""}
        if user_color == chess.BLACK or (
            user_color is None and h.get("Black", "").lower() in mine and h.get("White", "").lower() not in mine
        ):
            self.side_combo.setCurrentIndex(1)

        self.cards, self.statuses = [], []
        self.table.setRowCount(0)
        self.analyze_btn.setEnabled(True)
        self.update_plan()

    # --- Analysis ---

    def selected_kinds(self) -> set[str]:
        return {kind for kind, check in self.kind_checks.items() if check.isChecked()}

    def on_analyze(self):
        if not self.game:
            return
        kinds = self.selected_kinds()
        path = self.engine_path()
        # Lichess server analysis: the errors and best moves come from the PGN
        needs_engine = bool(kinds & set(ENGINE_KINDS)) and not has_server_analysis(self.game)
        if needs_engine and not path:
            if askUser(tr("cc.engine_ask_download"), parent=self):
                self.download_engine(then=self.on_analyze)
            return

        options = AnalysisOptions(
            user_color=self.side_combo.currentData(),
            kinds=kinds,
            move_time=self.time_spin.value(),
            solution_time=max(1.0, self.time_spin.value() * 3),
        )
        game = self.game

        def progress(done, total):
            mw.taskman.run_on_main(
                lambda: mw.progress.update(
                    label=tr("cc.analyzing", done=done, total=total), value=done, max=total
                )
            )

        def task(col):
            if not needs_engine:
                return analyze_game(game, options)
            with engine.open_engine(path) as sf:
                return analyze_game(game, options, sf, progress)

        QueryOp(parent=self, op=task, success=self.show_cards).failure(
            lambda e: showWarning(error_text(e), parent=self)
        ).with_progress(tr("cc.analyzing", done=0, total="?")).without_collection().run_in_background()

    def show_cards(self, cards):
        self.cards = sorted(cards, key=lambda c: (c.ply, c.kind))
        self.statuses = [anki_ops.card_status(mw.col, c, False)[0] for c in self.cards]
        self.table.blockSignals(True)
        self.table.setRowCount(len(self.cards))
        for row, card in enumerate(self.cards):
            check = QTableWidgetItem()
            check.setFlags(Qt.ItemFlag.ItemIsUserCheckable | Qt.ItemFlag.ItemIsEnabled)
            checked = self.statuses[row] != "same"
            check.setCheckState(Qt.CheckState.Checked if checked else Qt.CheckState.Unchecked)
            self.table.setItem(row, COL_CHECK, check)
            placement = self.placement(card)
            for col, value, tip in (
                (COL_MOVE, card.move_text, card.name),
                (COL_KIND, tr(f"kind.{card.kind}"), card.name),
                (COL_SOLUTION, card.solution_text, card.solution_text),
                (COL_EVAL, card.eval_text, ""),
                (COL_STATUS, tr(f"status.{self.statuses[row]}"), tr(f"status.{self.statuses[row]}_tip")),
                (COL_DECK, placement.deck.removeprefix(f"{self.root}::"), "\n".join([placement.deck, *placement.tags])),
            ):
                self.table.setItem(row, col, readonly_item(value, tip))
            paint_status(self.table.item(row, COL_STATUS), self.statuses[row], self.table)
        self.table.blockSignals(False)
        self.update_plan()
        if not self.cards:
            tooltip(tr("cc.no_cards"), parent=self)

    def placement(self, card) -> decks.Placement:
        return decks.place_game_card(card, self.root)

    def on_summary_link(self, link: str):
        if link == "imported" and self.last_nids:
            browse(self.last_nids)

    # --- Import ---

    def checked_cards(self) -> list:
        return [
            card
            for row, card in enumerate(self.cards)
            if self.table.item(row, COL_CHECK).checkState() == Qt.CheckState.Checked
        ]

    def update_plan(self):
        selected = self.checked_cards() if self.cards else []
        if not selected:
            self.import_btn.setText(tr("button.import"))
            self.import_btn.setEnabled(False)
            self.plan_label.setText("")
            return
        self.import_btn.setText(tr("button.import_cards", count=len(selected)))
        self.import_btn.setEnabled(self.base is not None)
        statuses = [s for c, s in zip(self.cards, self.statuses) if c in selected]
        self.plan_label.setText(f"<small>{plan_text(statuses, self.update_existing.isChecked())}</small>")

    def on_import(self):
        selected = self.checked_cards()
        if not selected or not self.base:
            return
        try:
            models = {m: anki_ops.ensure_mode_note_type(self.base, m) for m in {c.mode for c in selected}}
        except anki_ops.ChessImportError as e:
            showWarning(str(e), parent=self)
            return
        rows = [(card, models[card.mode], self.placement(card)) for card in selected]

        side = self.side_combo.currentData()
        username = self.game.headers.get("White" if side == chess.WHITE else "Black", "")
        usernames = list(dict.fromkeys([*self.config.get("chesscom_usernames", []), username]))
        update_existing = self.update_existing.isChecked()
        self.config.update(
            {
                "chesscom_usernames": [u for u in usernames if u and u != "?"],
                "chesscom_kinds": sorted(self.selected_kinds()),
                "analysis_time": self.time_spin.value(),
                "update_existing": update_existing,
            }
        )
        write_config(self.config)
        stats = {}

        def on_success(_changes):
            # The page stays open: statuses now show what was imported
            result = tr("cc.result", **stats)
            self.last_nids = stats.get("nids", [])
            tooltip(result, parent=mw)
            text = self.summary.text().split("<br><b>")[0]
            self.summary.setText(f"{text}<br><b>{result}</b> {tr('result.browse') if self.last_nids else ''}")
            self.show_cards(self.cards)

        CollectionOp(
            parent=self,
            op=lambda col: anki_ops.import_chapters(
                col, rows, update_existing, False, stats, tr("cc.undo")
            ),
        ).success(on_success).run_in_background()
