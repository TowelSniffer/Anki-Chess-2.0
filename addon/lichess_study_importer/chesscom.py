"""
Chess.com games: link parsing, download through the public API, and the
Game Review labels found in PGNs exported from the analysis board.

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

import io
import json
import re
import urllib.error
import urllib.request

from .chess_lib import chess

USER_AGENT = "AnkiChess-StudyImporter (github.com/TowelSniffer/Anki-Chess-2.0)"
GAME_URL_RE = re.compile(
    r"chess\.com/(?:analysis/)?(?:game/(live|daily)|(live|daily)/game)/(\d+)", re.IGNORECASE
)
# Game Review marker exported in comments: [%c_effect a5;square;a5;type;Blunder;...]
EFFECT_TYPE_RE = re.compile(r"\[%c_effect\b[^\]]*?;type;(\w+)")
EMBEDDED_COMMAND_RE = re.compile(r"\[%[^\]]*\]")

# Chess.com labels on a move, and the NAGs they are exported with
LABEL_NAGS = {"Blunder": 4, "Mistake": 2, "Inaccuracy": 6, "Miss": 9}
NAG_LABELS = {nag: label for label, nag in LABEL_NAGS.items()}
ERROR_LABELS = tuple(LABEL_NAGS)


class ChessComError(Exception):
    """Carries an i18n key (see i18n.py) and its parameters; the UI translates it."""

    def __init__(self, key: str, **params):
        super().__init__(key)
        self.key = key
        self.params = params


def parse_game_url(text: str) -> tuple[str, str] | None:
    """Return (live|daily, game id) from a Chess.com game or analysis link."""
    m = GAME_URL_RE.search(text or "")
    if not m:
        return None
    return (m.group(1) or m.group(2)).lower(), m.group(3)


def game_link(kind: str, game_id: str) -> str:
    return f"https://www.chess.com/game/{kind}/{game_id}"


def game_id_from_headers(headers) -> str | None:
    for key in ("Link", "Site"):
        parsed = parse_game_url(headers.get(key, ""))
        if parsed:
            return parsed[1]
    return None


def _get_json(url: str, timeout: int = 30):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 404:
            raise ChessComError("chesscom.not_found") from e
        if e.code == 429:
            raise ChessComError("chesscom.rate_limited") from e
        raise ChessComError("chesscom.http", code=e.code) from e
    except urllib.error.URLError as e:
        raise ChessComError("chesscom.connection", reason=e.reason) from e


def fetch_game_pgn(kind: str, game_id: str) -> str:
    """
    Download a finished game's PGN. The game page data gives the players and the
    date; the PGN itself comes from the official public archive of that month.
    """
    data = _get_json(f"https://www.chess.com/callback/{kind}/game/{game_id}")
    headers = (data.get("game") or {}).get("pgnHeaders") or {}
    date = str(headers.get("Date", ""))
    players = [headers.get("White"), headers.get("Black")]
    if not re.match(r"\d{4}\.\d{2}", date) or not any(players):
        raise ChessComError("chesscom.not_found")

    year, month = int(date[:4]), int(date[5:7])
    # A game may end in the month after it started
    months = [(year, month), (year + (month == 12), month % 12 + 1)]
    for player in filter(None, players):
        for y, m in months:
            try:
                archive = _get_json(
                    f"https://api.chess.com/pub/player/{player.lower()}/games/{y}/{m:02d}"
                )
            except ChessComError as e:
                if e.key == "chesscom.not_found":
                    continue
                raise
            for game in archive.get("games", []):
                if str(game.get("url", "")).rstrip("/").endswith(f"/{game_id}") and game.get("pgn"):
                    return game["pgn"]
    raise ChessComError("chesscom.not_found")


def fetch_recent_games(username: str, max_games: int = 30, months: int = 3) -> list[dict]:
    """A player's latest games (most recent first), from the monthly public archives."""
    archives = _get_json(
        f"https://api.chess.com/pub/player/{username.strip().lower()}/games/archives"
    ).get("archives", [])
    games: list[dict] = []
    for url in reversed(archives[-months:]):
        games += reversed(_get_json(url).get("games", []))
        if len(games) >= max_games:
            break
    return games[:max_games]


def read_game(pgn_text: str) -> chess.pgn.Game:
    game = chess.pgn.read_game(io.StringIO(pgn_text))
    if game is None or game.errors or not game.variations:
        raise ChessComError("chesscom.invalid_pgn")
    return game


def move_label(node: chess.pgn.ChildNode) -> str | None:
    """Chess.com Game Review label of a move (Blunder, Mistake, Miss, Inaccuracy...)."""
    m = EFFECT_TYPE_RE.search(node.comment or "")
    if m:
        return m.group(1)
    for nag in node.nags:
        if nag in NAG_LABELS:
            return NAG_LABELS[nag]
    return None


def has_review_labels(game: chess.pgn.Game) -> bool:
    return any(EFFECT_TYPE_RE.search(node.comment or "") for node in game.mainline())


def clean_comment(comment: str) -> str:
    return " ".join(EMBEDDED_COMMAND_RE.sub(" ", comment or "").split())
