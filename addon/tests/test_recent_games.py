import os
import sys
import types

HERE = os.path.dirname(__file__)
ADDON_DIR = os.path.join(HERE, "..", "lichess_study_importer")

# Load the add-on modules as a package without running __init__ (it needs aqt)
if "lsi" not in sys.modules:
    pkg = types.ModuleType("lsi")
    pkg.__path__ = [ADDON_DIR]
    sys.modules["lsi"] = pkg

from lsi import recent_games  # noqa: E402
from lsi.chess_lib import chess  # noqa: E402

# Shapes of the APIs' answers (Lichess /api/games/user with pgnInJson, Chess.com archives)
LICHESS = {
    "id": "5BBrW941",
    "speed": "rapid",
    "createdAt": 1790000000000,
    "status": "resign",
    "winner": "black",
    "players": {"white": {"user": {"name": "Rival"}}, "black": {"user": {"name": "Me"}}},
    "analysis": [{"eval": 18}],
    "pgn": '[Event "x"]\n\n1. e4 { [%eval 0.18] } c5 0-1',
}
CHESSCOM = {
    "url": "https://www.chess.com/game/live/132089496081",
    "pgn": '[Event "Live Chess"]\n\n1. d4 d5 1-0',
    "end_time": 1738351039,
    "time_class": "blitz",
    "rules": "chess",
    "white": {"username": "Me", "result": "win"},
    "black": {"username": "Rival", "result": "resigned"},
}


def test_lichess_game():
    game = recent_games.from_lichess(LICHESS, "me")
    assert game.url == "https://lichess.org/5BBrW941"
    assert (game.white, game.black, game.result) == ("Rival", "Me", "0-1")
    assert game.user_color == chess.BLACK and game.outcome == "win"
    assert game.analysed and game.speed == "rapid"
    assert game.date == "2026-09-21"


def test_chesscom_game():
    game = recent_games.from_chesscom(CHESSCOM, "ME")
    assert (game.result, game.outcome, game.speed) == ("1-0", "win", "blitz")
    assert not game.analysed
    draw = recent_games.from_chesscom(
        {**CHESSCOM, "white": {"username": "Me", "result": "repetition"}, "black": {"username": "R", "result": "repetition"}},
        "me",
    )
    assert draw.result == "1/2-1/2" and draw.outcome == "draw"
    assert recent_games.from_chesscom({**CHESSCOM, "rules": "chess960"}, "me") is None


def test_merge_most_recent_first():
    games = recent_games.merge(
        [recent_games.from_chesscom(CHESSCOM, "me")], [recent_games.from_lichess(LICHESS, "me")]
    )
    assert [g.source for g in games] == ["lichess", "chesscom"]
    # Someone else's game: no side, no outcome
    assert recent_games.from_lichess(LICHESS, "nobody").outcome is None
