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
