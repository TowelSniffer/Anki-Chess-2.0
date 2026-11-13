"""
AnkiChess - Lichess Study Importer.
Creates AnkiChess notes from Lichess studies, from analysed Chess.com and Lichess games,
and from Lichess puzzles, all in one import window (Tools > Import into AnkiChess).
"""

from aqt import gui_hooks, mw
from aqt.qt import QAction

from . import analysis_note, puzzle_sync
from .anki_ops import fix_pgn_line_breaks, show_pgn_line_breaks
from .i18n import tr
from .import_window import show_import_window
from .ui_common import apply_language


def _find_ankichess_menu():
    # Menu created by the AnkiChess Companion add-on, if installed
    for action in mw.form.menubar.actions():
        if action.menu() and action.text().replace("&", "") == "AnkiChess":
            return action.menu()
    return None


def setup_menu():
    apply_language()
    action = QAction(tr("menu.import"), mw)
    action.triggered.connect(lambda: show_import_window())
    mw.form.menuTools.addAction(action)
    chess_menu = _find_ankichess_menu()
    if chess_menu:
        chess_menu.addSeparator()
        chess_menu.addAction(action)


# Runs after all add-ons are loaded, so the Companion menu already exists
gui_hooks.main_window_did_init.append(setup_menu)
# The puzzle sync button at the end of the menu bar, like Anki Restart's
gui_hooks.main_window_did_init.append(puzzle_sync.setup_button)


def on_profile_open():
    fix_pgn_line_breaks(mw.col)
    # The puzzles you played on Lichess since the last sync, a little later and quietly
    puzzle_sync.schedule_on_open()


# PGNs pasted in the editor with wrapped lines: shown with their line breaks right
# away, and fixed in the collection before syncing so AnkiDroid reads them too
gui_hooks.card_will_show.append(show_pgn_line_breaks)
gui_hooks.profile_did_open.append(on_profile_open)
gui_hooks.sync_will_start.append(lambda: fix_pgn_line_breaks(mw.col))
# puzzle_sync_button changed in Tools > Add-ons > Config
mw.addonManager.setConfigUpdatedAction(__name__, puzzle_sync.update_button)

# "New card from this position" on the back of a card: the Add window with that PGN
gui_hooks.webview_will_set_content.append(analysis_note.add_flag)
gui_hooks.webview_did_receive_js_message.append(analysis_note.on_js_message)
