"""
The Lichess token (a personal API access token), in one place for every page: created on
Lichess with the scopes the add-on uses, pasted, checked and saved in the add-on config.
With it, private studies and your puzzle activity can be downloaded, and Lichess counts
the study downloads by account (three at a time) instead of by IP (one).
"""

from __future__ import annotations

from aqt.operations import QueryOp
from aqt.qt import (
    QDialog,
    QDialogButtonBox,
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


# Saving or removing the token: the status in the import window follows it
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


class LichessTokenDialog(QDialog):
    def __init__(self, parent=None, reason: str = ""):
        super().__init__(parent)
        self.setWindowTitle(tr("token.dialog_title"))
        self.setMinimumWidth(560)
        self.checked: tuple[str, dict | None] | None = None  # (token, what Lichess said)
        layout = QVBoxLayout(self)
        if reason:
            why = QLabel(f"<b>{reason}</b>")
            why.setWordWrap(True)
            layout.addWidget(why)
        intro = QLabel(tr("token.intro"))
        intro.setWordWrap(True)
        intro.setOpenExternalLinks(True)
        layout.addWidget(intro)

        create = QPushButton(tr("token.create"))
        create.setToolTip(tr("token.create_tip"))
        create.clicked.connect(lambda: openLink(TOKEN_URL))
        create_row = QHBoxLayout()
        create_row.addWidget(create)
        create_row.addStretch(1)
        layout.addLayout(create_row)

        row = QHBoxLayout()
        self.edit = QLineEdit(lichess_token())
        self.edit.setEchoMode(QLineEdit.EchoMode.Password)
        self.edit.setPlaceholderText(tr("token.paste"))
        self.edit.textChanged.connect(self.on_edited)
        show = QToolButton()
        show.setText(tr("token.show_text"))
        show.setCheckable(True)
        show.toggled.connect(
            lambda on: self.edit.setEchoMode(QLineEdit.EchoMode.Normal if on else QLineEdit.EchoMode.Password)
        )
        verify = QPushButton(tr("token.verify"))
        verify.clicked.connect(lambda: self.check())
        row.addWidget(QLabel(tr("token.label")))
        row.addWidget(self.edit, 1)
        row.addWidget(show)
        row.addWidget(verify)
        layout.addLayout(row)

        self.status = QLabel()
        self.status.setWordWrap(True)
        layout.addWidget(self.status)
        user = get_config().get("lichess_token_user", "")
        if self.edit.text() and user:
            self.status.setText(tr("token.saved_user", user=user))

        buttons = QDialogButtonBox()
        self.save_btn = buttons.addButton(tr("token.save"), QDialogButtonBox.ButtonRole.AcceptRole)
        self.save_btn.setDefault(True)
        remove = buttons.addButton(tr("token.remove"), QDialogButtonBox.ButtonRole.DestructiveRole)
        remove.setEnabled(bool(self.edit.text()))
        cancel = buttons.addButton(tr("button.cancel"), QDialogButtonBox.ButtonRole.RejectRole)
        self.save_btn.clicked.connect(self.on_save)
        remove.clicked.connect(self.on_remove)
        cancel.clicked.connect(self.reject)
        layout.addWidget(buttons)
        self.adjustSize()

    def set_status(self, text: str):
        self.status.setText(text)
        self.adjustSize()  # wrapped lines don't make a dialog taller by themselves

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
            self.on_remove()
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
        token_events.changed.emit()
        self.accept()

    def on_remove(self):
        save_token("", "")
        token_events.changed.emit()
        self.accept()


def edit_token(parent=None, reason: str = "") -> bool:
    """Open the token dialog; True when the token was saved or removed."""
    return bool(LichessTokenDialog(parent, reason).exec())


class TokenStatus(QWidget):
    """The account of the saved token (or none), and the button to change it."""

    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        self.label = QLabel()
        self.label.setToolTip(tr("token.status_tip"))
        button = QPushButton(tr("token.button"))
        button.setToolTip(tr("token.status_tip"))
        button.clicked.connect(lambda: edit_token(self.window()))
        layout.addWidget(self.label)
        layout.addWidget(button)
        token_events.changed.connect(self.refresh)
        self.refresh()

    def refresh(self):
        if not lichess_token():
            self.label.setText(tr("token.status_none"))
        else:
            user = get_config().get("lichess_token_user", "")
            self.label.setText(tr("token.status_user", user=user) if user else tr("token.status_saved"))
