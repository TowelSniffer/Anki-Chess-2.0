"""
Your latest games on Chess.com and Lichess, from their APIs, in one list to pick the
game to import.

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from .chess_lib import chess

# Chess.com results that end the game in a draw
CHESSCOM_DRAWS = {"agreed", "repetition", "stalemate", "insufficient", "50move", "timevsinsufficient"}
OUTCOMES = {"1-0": chess.WHITE, "0-1": chess.BLACK}


@dataclass
class RecentGame:
    source: str  # "chesscom" | "lichess"
    url: str
    white: str
    black: str
    result: str  # 1-0, 0-1, 1/2-1/2 or *
    date: str  # YYYY-MM-DD
    speed: str  # bullet, blitz, rapid...
    analysed: bool  # Lichess server analysis in the PGN
    pgn: str
    user_color: bool | None = None  # chess.WHITE / chess.BLACK: the side the user played

    @property
    def outcome(self) -> str | None:
        """"win", "loss" or "draw" for the user, None when unknown."""
        if self.user_color is None or self.result == "*":
            return None
        if self.result == "1/2-1/2":
            return "draw"
        return "win" if OUTCOMES.get(self.result) == self.user_color else "loss"


def _date(seconds: float) -> str:
    return datetime.fromtimestamp(seconds, tz=timezone.utc).strftime("%Y-%m-%d")


def _user_color(white: str, black: str, username: str) -> bool | None:
    name = username.strip().lower()
    if white.lower() == name:
        return chess.WHITE
    if black.lower() == name:
        return chess.BLACK
    return None


def from_lichess(data: dict, username: str) -> RecentGame:
    """A game from Lichess' /api/games/user (pgnInJson)."""
    players = data.get("players", {})
    white = players.get("white", {}).get("user", {}).get("name", "?")
    black = players.get("black", {}).get("user", {}).get("name", "?")
    winner = data.get("winner")
    if winner:
        result = "1-0" if winner == "white" else "0-1"
    else:
        result = "1/2-1/2" if data.get("status") in ("draw", "stalemate") else "*"
    return RecentGame(
        source="lichess",
        url=f"https://lichess.org/{data['id']}",
        white=white,
        black=black,
        result=result,
        date=_date(data.get("createdAt", 0) / 1000),
        speed=data.get("speed", ""),
        analysed="analysis" in data or "[%eval" in data.get("pgn", ""),
        pgn=data.get("pgn", ""),
        user_color=_user_color(white, black, username),
    )


def from_chesscom(data: dict, username: str) -> RecentGame | None:
    """A game from Chess.com's monthly archive; None for other chess variants."""
    if data.get("rules", "chess") != "chess":
        return None
    white, black = data.get("white", {}), data.get("black", {})
    if white.get("result") == "win":
        result = "1-0"
    elif black.get("result") == "win":
        result = "0-1"
    elif white.get("result") in CHESSCOM_DRAWS:
        result = "1/2-1/2"
    else:
        result = "*"
    return RecentGame(
        source="chesscom",
        url=data.get("url", ""),
        white=white.get("username", "?"),
        black=black.get("username", "?"),
        result=result,
        date=_date(data.get("end_time", 0)),
        speed=data.get("time_class", ""),
        analysed=False,
        pgn=data.get("pgn", ""),
        user_color=_user_color(white.get("username", ""), black.get("username", ""), username),
    )


def merge(*lists: list[RecentGame]) -> list[RecentGame]:
    """Every game, most recent first."""
    return sorted((g for games in lists for g in games), key=lambda g: g.date, reverse=True)
