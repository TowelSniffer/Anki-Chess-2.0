"""
The add-on's buttons at the end of Anki's menu bar (after Help, like Anki Restart's), icons
(at ICON_SIZE) with their tooltips:

- Sync Lichess puzzles (puzzle_sync.py), once a Lichess token is saved (puzzle_sync_button).
- Import Lichess studies: the import window, at Studies (study_buttons).
- Update imported Lichess studies: downloads them again; the chapters changed on Lichess
  are updated, the new ones offered in the import window (study_buttons).
"""

from __future__ import annotations

import os
from typing import Callable

from anki.utils import is_mac
from aqt import gui_hooks, mw
from aqt.qt import QAction, QEvent, QIcon, QObject, QProxyStyle, QStyle, QToolTip

from .i18n import tr
from .ui_common import apply_language, get_config

ICONS = os.path.join(os.path.dirname(__file__), "icons")  # PNGs made from the SVGs beside them
ICON_SIZE = 22  # the menu bar draws icons at the small icon size, 16 px: too small for these

_buttons: list[QAction] = []  # the add-on's, for their tooltips
_study_buttons: list[tuple[QAction, str]] = []  # (button, its i18n key)


class _MenuBarStyle(QProxyStyle):
    """Anki's widget style for the menu bar, with its icons at ICON_SIZE. Its menus keep theirs."""

    def pixelMetric(self, metric, option=None, widget=None):
        if metric == QStyle.PixelMetric.PM_SmallIconSize:
            return ICON_SIZE
        return super().pixelMetric(metric, option, widget)


def _style_menu_bar():
    """With the first button, and again when Anki's theme or widget style changes."""
    if is_mac:
        return  # the system's menu bar
    from aqt.profiles import WidgetStyle

    menubar = mw.form.menubar
    # Anki's own style is Fusion with its style sheet; the native one, the system's default
    style = _MenuBarStyle("fusion") if mw.pm.get_widget_style() == WidgetStyle.ANKI else _MenuBarStyle()
    menubar.setStyle(style)
    menubar._ankichess_style = style  # setStyle doesn't keep it alive


class _MenuBarTips(QObject):
    """The menu bar shows no tooltips of its own: the add-on's buttons show theirs."""

    def eventFilter(self, obj, event):
        if event.type() == QEvent.Type.ToolTip:
            action = obj.actionAt(event.pos())
            if any(action is button for button in _buttons):
                QToolTip.showText(event.globalPos(), action.toolTip(), obj)
                return True
        return False


def add_button(icon: str, text: str, on_click: Callable[[], None]) -> QAction:
    """A button at the end of the menu bar: icons/<icon>.png, its text as the tooltip."""
    menubar = mw.form.menubar
    if not hasattr(menubar, "_ankichess_tips"):
        menubar._ankichess_tips = _MenuBarTips(menubar)  # kept alive with the menu bar
        menubar.installEventFilter(menubar._ankichess_tips)
        _style_menu_bar()
        gui_hooks.theme_did_change.append(_style_menu_bar)
    button = QAction(QIcon(os.path.join(ICONS, f"{icon}.png")), text, mw)
    button.setToolTip(text)
    button.triggered.connect(lambda _checked=False: on_click())
    menubar.addAction(button)
    _buttons.append(button)
    return button


# --- The studies' buttons ---


def setup_study_buttons():
    """main_window_did_init, after the puzzle button: Import and Update the Lichess studies."""
    apply_language()
    _study_buttons[:] = [
        (add_button("study_import", tr("menu.import_studies"), import_studies), "menu.import_studies"),
        (add_button("study_update", tr("menu.update_studies"), update_studies), "menu.update_studies"),
    ]
    update_study_buttons()


def update_study_buttons(config: dict | None = None):
    """Shown unless study_buttons is off; texts in the add-on's language (it may have changed)."""
    config = get_config() if config is None else config
    apply_language()
    for button, key in _study_buttons:
        button.setText(tr(key))
        button.setToolTip(f"{tr(key)}\n{tr(key + '_tip')}")
        button.setVisible(bool(config.get("study_buttons", True)))


def import_studies():
    # The import window imports this module (through the puzzle sync): imported when used
    from .import_window import TAB_STUDIES, show_import_window

    show_import_window(TAB_STUDIES)


def update_studies():
    """
    The imported studies downloaded again. Their new chapters open in the import window,
    and so does the token's field when Lichess limits the downloads (the update goes on
    once it is saved).
    """
    from .import_window import show_import_window
    from .study_updater import update_imported_studies

    update_imported_studies(
        mw,
        open_studies=lambda links: show_import_window(urls=links),
        ask_token=lambda reason, then: show_import_window(token_reason=reason, then=then),
    )
