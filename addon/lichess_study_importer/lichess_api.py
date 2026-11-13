"""
Lichess API: study PGNs, a user's studies, puzzles, analysed games and personal tokens.

Pure Python (no aqt imports) so it can be unit tested outside Anki.

Lichess sends one study download at a time per IP (three per account, with a token) and
frees the slot only once it has sent the whole study, sometimes after the client already
has it all. A request too close to the last one gets 429 "Please only run 1 request(s) at
a time", answered at once, so the next ones get it too unless there is a pause: requests
go one at a time, study downloads a little apart, and a 429 is waited out and tried again.
"""

from __future__ import annotations

import http.client
import json
import re
import threading
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Any, Callable

STUDY_URL_RE = re.compile(r"lichess\.org/study/([A-Za-z0-9]{8})(?:/([A-Za-z0-9]{8}))?")
BARE_ID_RE = re.compile(r"^\s*([A-Za-z0-9]{8})\s*$")
# A game, not a study, a user page or a puzzle: lichess.org/<8 chars>[<4 chars>][/black]
GAME_URL_RE = re.compile(r"lichess\.org/(?:game/export/)?([A-Za-z0-9]{8})(?:[A-Za-z0-9]{4})?(?![A-Za-z0-9/])|lichess\.org/([A-Za-z0-9]{8})/(?:white|black)")
PUZZLE_URL_RE = re.compile(r"lichess\.org/training/([A-Za-z0-9]{5})\b")
PUZZLE_ID_RE = re.compile(r"(?<![\w/.])([A-Za-z0-9]{5})(?![\w/])")
API = "https://lichess.org/api"
USER_AGENT = "AnkiChess-StudyImporter"
# Scopes the add-on uses: private studies, and your puzzle activity
TOKEN_SCOPES = ("study:read", "puzzle:read")

STUDY_GAP = 1.0  # seconds from the end of a study download to the next one, without a token
BUSY_WAITS = (2, 4, 8, 15, 30)  # before each new try while the last download is still running
QUIET_WAITS = BUSY_WAITS[:3]  # the same, when there is no wait to show them
RATE_LIMIT_WAIT = 60  # any other 429: Lichess asks for a minute
ACTIVITY_PROGRESS_EVERY = 20  # puzzles; Lichess sends the activity about 20 a second

# wait(seconds, key) sleeps before a new try ("lichess.busy_wait" or "lichess.rate_wait"),
# showing it, and returns False to give up
Wait = Callable[[float, str], bool]

_lock = threading.Lock()  # one request to Lichess at a time, from every page of the add-on
_last_study = 0.0  # _clock() at the end of the last study download
_clock = time.monotonic
_pause = time.sleep


class LichessError(Exception):
    """Carries an i18n key (see i18n.py) and its parameters; the UI translates it."""

    def __init__(self, key: str, **params):
        super().__init__(key)
        self.key = key
        self.params = params


def _sleep(seconds: float, key: str) -> bool:
    _pause(seconds)
    return True


def _busy(error: urllib.error.HTTPError) -> bool:
    """A 429 because the last download is still running (not a rate limit)."""
    try:
        return "at a time" in error.read().decode("utf-8", "replace")
    except (OSError, AttributeError):
        return False


def _retry_after(error: urllib.error.HTTPError) -> float:
    try:
        return min(max(float(error.headers.get("Retry-After", "")), 1.0), 600.0)
    except (AttributeError, TypeError, ValueError):
        return RATE_LIMIT_WAIT


def _read_all(resp) -> str:
    return resp.read().decode("utf-8")


def _request(req: urllib.request.Request, timeout: int, gap: float, read: Callable[[Any], Any] = _read_all):
    global _last_study
    with _lock:
        if gap:
            _pause(max(0.0, _last_study + gap - _clock()))
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return read(resp)
        finally:
            if gap:
                _last_study = _clock()


def _get(
    url: str,
    token: str = "",
    accept: str = "",
    timeout: int = 30,
    wait: Wait | None = None,
    gap: float = 0.0,
    data: bytes | None = None,
    read: Callable[[Any], Any] = _read_all,
):
    """
    gap: seconds since the last request made with one (study downloads). A 429 is waited
    out with wait() and tried again; without it, only the short busy waits, quietly.
    read(response) gives the result, the whole body as text by default.
    """
    headers = {"User-Agent": USER_AGENT}
    if accept:
        headers["Accept"] = accept
    if data is not None:
        headers["Content-Type"] = "text/plain"
    if token.strip():
        # Personal token: study:read for private studies, puzzle:read for puzzle activity
        headers["Authorization"] = f"Bearer {token.strip()}"
    req = urllib.request.Request(url, data=data, headers=headers)
    busy_waits = iter(BUSY_WAITS if wait else QUIET_WAITS)
    rate_tries = 1 if wait else 0
    wait = wait or _sleep
    while True:
        try:
            return _request(req, timeout, gap, read)
        except urllib.error.HTTPError as e:
            if e.code in (401, 403, 404):
                hint = "error.no_access.token_hint" if token.strip() else "error.no_access.public_hint"
                raise LichessError("error.no_access", code=e.code, hint=hint) from e
            if e.code != 429:
                raise LichessError("error.http", code=e.code) from e
            if _busy(e):
                seconds, key = next(busy_waits, None), "lichess.busy_wait"
            else:
                seconds, key = (_retry_after(e) if rate_tries else None), "lichess.rate_wait"
                rate_tries -= 1
            if seconds is None:
                raise LichessError("error.rate_limited") from e
            if not wait(seconds, key):
                raise LichessError("error.cancelled") from e
        except urllib.error.URLError as e:
            raise LichessError("error.connection", reason=e.reason) from e


def _ndjson(text: str) -> list[dict]:
    return [json.loads(line) for line in text.splitlines() if line.strip()]


# --- Studies ---


def parse_study_url(text: str) -> tuple[str, str | None] | None:
    """Return (study_id, chapter_id or None) from a study URL or a bare study id."""
    m = STUDY_URL_RE.search(text or "")
    if m:
        return m.group(1), m.group(2)
    m = BARE_ID_RE.match(text or "")
    if m:
        return m.group(1), None
    return None


def parse_study_urls(text: str) -> list[tuple[str, str | None]]:
    """Every study URL or bare study id in a text (several separated by spaces or lines)."""
    found = []
    for word in re.split(r"[\s,;]+", text or ""):
        parsed = parse_study_url(word)
        if parsed and parsed not in found:
            found.append(parsed)
    return found


def fetch_study_pgn(
    study_id: str,
    chapter_id: str | None = None,
    token: str = "",
    timeout: int = 30,
    wait: Wait | None = None,
) -> str:
    path = f"{study_id}/{chapter_id}" if chapter_id else study_id
    # orientation: [Orientation "white"|"black"], the side the chapter is studied from
    return _get(
        f"{API}/study/{path}.pgn?comments=true&variations=true&clocks=false&orientation=true",
        token,
        timeout=timeout,
        wait=wait,
        # With a token the limit is three downloads at a time, by account: no pause needed
        gap=0.0 if token.strip() else STUDY_GAP,
    )


def fetch_user_studies(username: str, token: str = "") -> list[dict]:
    """A user's studies (id, name, updatedAt...); private ones need their token."""
    return _ndjson(_get(f"{API}/study/by/{username.strip()}", token, accept="application/x-ndjson"))


# --- Puzzles ---


def parse_puzzle_ids(text: str) -> list[str]:
    """Puzzle ids from training links (lichess.org/training/abc12) or bare 5-character ids."""
    ids = PUZZLE_URL_RE.findall(text or "") or PUZZLE_ID_RE.findall(text or "")
    return list(dict.fromkeys(ids))


def fetch_puzzle(puzzle_id: str, wait: Wait | None = None) -> dict:
    """{"game": {"pgn": ...}, "puzzle": {"id", "fen", "lastMove", "solution", "initialPly"...}}"""
    return json.loads(_get(f"{API}/puzzle/{puzzle_id}", wait=wait))


@dataclass
class PuzzleActivity:
    """
    Your puzzles, most recent first, each once: {"date" (ms, the first time you played it),
    "win" (your last result), "puzzle": {"id", "fen" (after the opponent's move),
    "lastMove" (that move), "solution", "themes", "rating"...}}. stopped: "" when Lichess
    sent everything asked; "cancelled" or "connection" when only the most recent came.
    """

    entries: list[dict] = field(default_factory=list)
    stopped: str = ""


def fetch_puzzle_activity(
    token: str,
    max_entries: int | None = None,
    progress: Callable[[int], None] | None = None,
    cancelled: Callable[[], bool] | None = None,
    wait: Wait | None = None,
    since: int | None = None,
) -> PuzzleActivity:
    """
    Your puzzle activity (puzzle:read): the latest max_entries puzzles, or all of them
    (since: only the ones first played from that time on, in ms). Lichess sends it about
    20 a second, so it is read as it comes: progress(count) every few puzzles, and
    cancelled() stops it, keeping what came. A dropped connection keeps it too.
    """
    params = [f"max={max_entries}" if max_entries else "", f"since={since}" if since else ""]
    query = "&".join(p for p in params if p)
    query = f"?{query}" if query else ""

    def read(resp) -> PuzzleActivity:
        activity, seen = PuzzleActivity(), set()
        try:
            for raw in resp:
                line = raw.decode("utf-8").strip()
                if not line:
                    continue
                entry = json.loads(line)
                puzzle_id = (entry.get("puzzle") or {}).get("id")
                if not puzzle_id or puzzle_id in seen:
                    continue
                seen.add(puzzle_id)
                activity.entries.append(entry)
                count = len(activity.entries)
                if progress and count % ACTIVITY_PROGRESS_EVERY == 0:
                    progress(count)
                if cancelled and cancelled():
                    activity.stopped = "cancelled"
                    break
        except (OSError, http.client.HTTPException) as e:  # dropped or timed out while sending
            if not activity.entries:
                raise LichessError("error.connection", reason=e) from e
            activity.stopped = "connection"
        if progress:
            progress(len(activity.entries))
        return activity

    return _get(f"{API}/puzzle/activity{query}", token, accept="application/x-ndjson", wait=wait, read=read)


# --- Games ---


def parse_game_url(text: str) -> str | None:
    """Game id from a Lichess game link (any player's view of it)."""
    m = GAME_URL_RE.search(text or "")
    return (m.group(1) or m.group(2)) if m else None


def fetch_user_games(username: str, max_games: int = 30, token: str = "") -> list[dict]:
    """A user's latest games, with their PGN (and server analysis when requested)."""
    return _ndjson(
        _get(
            f"{API}/games/user/{username.strip()}?max={max_games}&pgnInJson=true&evals=true"
            "&literate=true&opening=true&clocks=false",
            token,
            accept="application/x-ndjson",
        )
    )


def fetch_game_pgn(game_id: str, token: str = "") -> str:
    """
    A game's PGN with the server analysis, when it was requested on Lichess: evals,
    ?/??/?! marks with "X was best" comments and the best line as a variation.
    """
    return _get(
        f"https://lichess.org/game/export/{game_id}?evals=true&literate=true&clocks=false&opening=true",
        token,
        accept="application/x-chess-pgn",
    )


# --- Personal token ---


def check_token(token: str) -> dict | None:
    """
    The account and scopes of a personal token: {"userId", "scopes" (comma separated),
    "expires"}, or None when Lichess doesn't know it (mistyped, revoked or expired).
    """
    token = token.strip()
    found = json.loads(_get(f"{API}/token/test", data=token.encode("utf-8")))
    return found.get(token)


def token_scopes(info: dict | None) -> tuple[list[str], list[str]]:
    """(scopes the add-on uses that the token lacks, scopes it has that the add-on doesn't use)."""
    scopes = [s for s in ((info or {}).get("scopes") or "").split(",") if s]
    return [s for s in TOKEN_SCOPES if s not in scopes], [s for s in scopes if s not in TOKEN_SCOPES]
