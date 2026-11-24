"""
Load python-chess, preferring an installed copy and falling back to the vendored one.

python-chess imports itself as the top-level package "chess", so the vendor folder
has to be on sys.path rather than imported relatively.
"""

import os
import sys

VENDOR_DIR = os.path.join(os.path.dirname(__file__), "vendor")

try:
    import chess  # noqa: F401
except ImportError:
    sys.path.append(VENDOR_DIR)
    import chess  # noqa: F401

import chess.engine  # noqa: E402,F401
import chess.pgn  # noqa: E402,F401
import chess.svg  # noqa: E402,F401

import io  # noqa: E402


def read_pgn(text: str):
    """
    The first game of a PGN text, or None. A variation with an illegal move is left out;
    with an installed python-chess (without the vendored copy's patch) the moves read in
    the wrong position after it are dropped too, so the tree only holds legal moves.
    """
    game = chess.pgn.read_game(io.StringIO(text))
    if game is not None and game.errors:
        drop_illegal_moves(game)
    return game


def repaired_movetext(text: str) -> str | None:
    """
    The moves of a PGN written back as python-chess read them, when it had to read them
    loosely (variations as replies) or leave some out (illegal moves): the template's
    parser would reject the whole game. None when the PGN reads as it is.
    """
    try:
        game = read_pgn(text)
    except (ValueError, KeyError, AssertionError):
        return None
    if game is None or not game.errors:
        return None
    return game.accept(chess.pgn.StringExporter(headers=False, variations=True, comments=True)).strip()


def drop_illegal_moves(game) -> int:
    """Remove the moves (and what follows them) that are illegal where they stand; how many."""
    dropped = 0
    stack = [(game, game.board())]
    while stack:
        node, board = stack.pop()
        for child in list(node.variations):
            if board.is_legal(child.move):
                after = board.copy(stack=False)
                after.push(child.move)
                stack.append((child, after))
            else:
                node.remove_variation(child)
                dropped += 1
    return dropped
