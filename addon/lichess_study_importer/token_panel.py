"""
The Lichess token (a personal API access token), in the import window's Puzzles tab: the
only part of the add-on that needs it, for your puzzle activity. Created on
Lichess with the scopes the add-on uses, pasted, checked and saved in the add-on config.
Studies don't need it; when one is saved, private studies open too and Lichess counts the
study downloads by account (three at a time) instead of by IP (one).
"""

from __future__ import annotations

from aqt.operations import QueryOp
from aqt.qt import (
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QObject,
    QPushButton,
    QToolButton,
    QVBoxLayout,
    QWidget,
    pyqtSignal,
)
from aqt.utils import openLink

from .i18n import tr
from .lichess_api import TOKEN_SCOPES, check_token, token_scopes
from .ui_common import TOKEN_URL, error_text, get_config, lichess_token, save_token


class TokenEvents(QObject):
    changed = pyqtSignal()


# Saving or removing the token: the puzzle sync button and the pages follow it
token_events = TokenEvents()


def token_text(info: dict | None) -> str:
    """What a token check found: the account, or the problem; scopes missing or too many."""
    if info is None:
        return tr("token.invalid")
    missing, extra = token_scopes(info)
    lines = [tr("token.valid", user=info.get("userId", "?"), scopes=", ".join(s for s in TOKEN_SCOPES if s not in missing))]
    if missing:
        lines.append(tr("token.missing_scope", scopes=", ".join(missing)))
    if extra:
        lines.append(tr("token.extra_scopes", scopes=", ".join(extra), needed=", ".join(TOKEN_SCOPES)))
    return "\n".join(lines)


class TokenPanel(QGroupBox):
    """
    Without a token (or while changing it): how to get it, the field, Check and Save.
    With one, the panel hides and `saved_row` (its account, Change and Remove), which the
    page places in a row of its own, shows instead: the window doesn't grow for it.
    """

    def __init__(self, parent=None):
        super().__init__(tr("token.section"), parent)
        self.checked: tuple[str, dict | None] | None = None  # (token, what Lichess said)
        layout = QVBoxLayout(self)

        # Why it was asked for (a private study, the download limit, your puzzles)
        self.reason = QLabel()
        self.reason.setWordWrap(True)
        self.reason.hide()
        layout.addWidget(self.reason)

        # --- Saved: the account, Change and Remove (placed by the page) ---
        self.saved_row = QWidget(self)  # moved into the page's row (a parent from the start: never a window)
        saved = QHBoxLayout(self.saved_row)
        saved.setContentsMargins(0, 0, 0, 0)
        self.saved_label = QLabel()
        change = QPushButton(tr("token.change"))
        change.clicked.connect(lambda: self.show_editor(True))
        remove = QPushButton(tr("token.remove"))
        remove.clicked.connect(self.on_remove)
        saved.addWidget(self.saved_label)
        saved.addWidget(change)
        saved.addWidget(remove)

        # --- Editing: what it is for, Create on Lichess, the field, Check, Save ---
        self.editor = QWidget()
        editor = QVBoxLayout(self.editor)
        editor.setContentsMargins(0, 0, 0, 0)
        intro = QLabel(f"<small>{tr('token.intro')}</small>")
        intro.setToolTip(tr("token.intro_tip"))
        intro.setWordWrap(True)
        intro.setOpenExternalLinks(True)
        editor.addWidget(intro)

        row = QHBoxLayout()
        self.edit = QLineEdit()
        self.edit.setEchoMode(QLineEdit.EchoMode.Password)
        self.edit.setPlaceholderText(tr("token.paste"))
        self.edit.textChanged.connect(self.on_edited)
        self.edit.returnPressed.connect(self.on_save)
        show = QToolButton()
        show.setText(tr("token.show_text"))
        show.setCheckable(True)
        show.toggled.connect(
            lambda on: self.edit.setEchoMode(QLineEdit.EchoMode.Normal if on else QLineEdit.EchoMode.Password)
        )
        verify = QPushButton(tr("token.verify"))
        verify.clicked.connect(lambda: self.check())
        self.save_btn = QPushButton(tr("token.save"))
        self.save_btn.clicked.connect(self.on_save)
        self.cancel_btn = QPushButton(tr("button.cancel"))
        self.cancel_btn.clicked.connect(lambda: self.show_editor(False))
        create = QPushButton(tr("token.create"))
        create.setToolTip(tr("token.create_tip"))
        create.clicked.connect(lambda: openLink(TOKEN_URL))
        row.addWidget(create)
        row.addWidget(QLabel(tr("token.label")))
        row.addWidget(self.edit, 1)
        for widget in (show, verify, self.save_btn, self.cancel_btn):
            row.addWidget(widget)
        editor.addLayout(row)

        self.status = QLabel()
        self.status.setWordWrap(True)
        self.status.hide()
        editor.addWidget(self.status)
        layout.addWidget(self.editor)

        token_events.changed.connect(self.refresh)
        self.refresh()

    # --- State ---

    def refresh(self):
        """After a save or a removal (here or elsewhere): the account line, or the editor."""
        token = lichess_token()
        if token:
            user = get_config().get("lichess_token_user", "")
            self.saved_label.setText(tr("token.status_user", user=user) if user else tr("token.status_saved"))
            self.reason.hide()
        self.show_editor(not token)

    def show_editor(self, on: bool):
        has_token = bool(lichess_token())
        self.saved_row.setVisible(has_token and not on)
        self.setVisible(on)
        self.cancel_btn.setVisible(has_token)  # back to the saved one
        if on:
            self.edit.clear()
            self.set_status("")
            self.save_btn.setText(tr("token.save"))

    def ask(self, reason: str):
        """Asked for by a part that needs it: why, and the field ready to paste into."""
        self.reason.setText(f"<b>{reason}</b>")
        self.reason.show()
        self.show_editor(True)
        self.edit.setFocus()

    def set_status(self, text: str):
        self.status.setText(text)
        self.status.setVisible(bool(text))

    # --- Check and save ---

    def on_edited(self, _text: str):
        self.set_status("")
        self.save_btn.setText(tr("token.save"))

    def check(self, then=None):
        """Ask Lichess about the token; then(info) after its answer (None: unknown token, False: no answer)."""
        token = self.edit.text().strip()
        if not token:
            return
        self.set_status(tr("token.checking"))
        self.save_btn.setEnabled(False)

        def done(info):
            self.save_btn.setEnabled(True)
            self.checked = (token, info)
            self.set_status(token_text(info))
            if then:
                then(info)

        def failed(e: Exception):
            self.save_btn.setEnabled(True)
            self.checked = (token, False)
            self.set_status(tr("token.check_failed", error=error_text(e)))
            if then:
                then(False)

        QueryOp(parent=self, op=lambda col: check_token(token), success=done).failure(
            failed
        ).without_collection().run_in_background()

    def on_save(self):
        token = self.edit.text().strip()
        if not token:
            return
        if self.checked and self.checked[0] == token:
            # Checked, and its status seen: saved as it is (only an unknown token isn't)
            if self.checked[1] is not None:
                self.save(token, self.checked[1])
            return

        def after_check(info):
            if info is None:
                return  # unknown to Lichess: the status says so
            if info is False or any(token_scopes(info)):
                # Not checked (no connection), or scopes missing or too many: seen before
                # saving it anyway
                self.save_btn.setText(tr("token.save_anyway"))
                return
            self.save(token, info)

        self.check(then=after_check)

    def save(self, token: str, info: dict | bool):
        # Without Lichess' answer (no connection) it's saved unchecked, without the account
        save_token(token, info.get("userId", "") if info else "")
        self.checked = None
        token_events.changed.emit()

    def on_remove(self):
        save_token("", "")
        token_events.changed.emit()
