"""
Your Lichess puzzle activity, kept in user_files so the whole history is read from
Lichess only once (about 20 puzzles a second): then each read asks only for the puzzles
played since, and for older ones when an earlier read of the history was stopped.

The cache holds every puzzle played from `covered_from` to its most recent one, without
gaps: a read of new puzzles that stops halfway is dropped (it would leave a gap), and a
read of older ones that stops is kept (it goes back in time without gaps).

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

import json
import os
import re
import threading
from dataclasses import dataclass, field
from typing import Callable

from . import lichess_api
from .lichess_api import Wait

FOLDER = os.path.join(os.path.dirname(__file__), "user_files")  # kept by Anki on updates
_lock = threading.Lock()  # one refresh at a time (the Puzzles page and the sync)


@dataclass
class ActivityCache:
    path: str
    user: str
    entries: list[dict] = field(default_factory=list)  # most recent first, one per puzzle
    # Every puzzle from this time (ms) to the most recent is here; 0: your whole history,
    # None: nothing read yet
    covered_from: int | None = None

    @classmethod
    def load(cls, folder: str, user: str) -> ActivityCache:
        """The cache of a Lichess account (another account has another file)."""
        name = re.sub(r"[^A-Za-z0-9_-]", "_", user or "me")
        cache = cls(os.path.join(folder, f"puzzle_activity_{name}.json"), user or "me")
        try:
            with open(cache.path, encoding="utf-8") as f:
                data = json.load(f)
        except (OSError, ValueError):
            return cache
        if data.get("user") == cache.user and isinstance(data.get("entries"), list):
            cache.entries = [e for e in data["entries"] if (e.get("puzzle") or {}).get("id")]
            covered = data.get("covered_from")
            cache.covered_from = covered if isinstance(covered, int) else cache.oldest
        return cache

    def save(self):
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        data = {"user": self.user, "covered_from": self.covered_from, "entries": self.entries}
        temp = f"{self.path}.tmp"
        with open(temp, "w", encoding="utf-8") as f:
            json.dump(data, f, separators=(",", ":"))
        os.replace(temp, self.path)  # a crash never leaves half a file

    def clear(self):
        self.entries, self.covered_from = [], None
        try:
            os.remove(self.path)
        except OSError:
            pass

    @property
    def newest(self) -> int | None:
        return self.entries[0].get("date") if self.entries else None

    @property
    def oldest(self) -> int | None:
        return self.entries[-1].get("date") if self.entries else None

    @property
    def complete(self) -> bool:
        return self.covered_from == 0

    def merge(self, entries: list[dict]):
        """Add puzzles read; one read again replaces the older copy (its last result)."""
        by_id = {e["puzzle"]["id"]: e for e in self.entries}
        for entry in entries:
            by_id[entry["puzzle"]["id"]] = entry
        self.entries = sorted(by_id.values(), key=lambda e: e.get("date") or 0, reverse=True)

    def since(self, ms: int) -> list[dict]:
        """The puzzles first played from that time on (0: all of them)."""
        return [e for e in self.entries if (e.get("date") or 0) >= ms] if ms else list(self.entries)

    def covers(self, back_to: int | None, need: int | None) -> bool:
        """
        Whether it has every puzzle back to that time (0: the whole history) and at least
        `need` puzzles (or the whole history).
        """
        if self.complete:
            return True
        if back_to is not None and (self.covered_from is None or back_to == 0 or self.covered_from > back_to):
            return False
        return need is None or len(self.entries) >= need


def refresh(
    cache: ActivityCache,
    token: str,
    back_to: int | None = None,
    need: int | None = None,
    progress: Callable[[int], None] | None = None,
    cancelled: Callable[[], bool] | None = None,
    wait: Wait | None = None,
) -> str:
    """
    Read from Lichess what the cache lacks: the puzzles played since its most recent
    one, then older ones until it goes back_to that time (0: your whole history) and
    has `need` puzzles. progress(count of puzzles known). Returns how a read stopped
    ("cancelled" or "connection"), "" when the cache has all that was asked.
    """
    read = lichess_api.fetch_puzzle_activity
    known = len(cache.entries)

    def counted(count: int):
        if progress:
            progress(known + count)

    if cache.covered_from is not None:
        since = cache.newest or cache.covered_from or None
        newer = read(token, progress=counted, cancelled=cancelled, wait=wait, since=since)
        if newer.stopped:
            return newer.stopped  # only the most recent of them: dropped, it would leave a gap
        cache.merge(newer.entries)
        cache.save()

    if cache.covers(back_to, need):
        return ""
    known = len(cache.entries)
    limit = need - known if need is not None and back_to is None else None
    older = read(token, limit, counted, cancelled, wait, since=back_to or None, before=cache.oldest)
    cache.merge(older.entries)
    if older.stopped:
        cache.covered_from = cache.oldest if cache.entries else cache.covered_from
    elif back_to is not None:
        cache.covered_from = back_to  # read down to it (0: to your first puzzle)
    elif limit is not None and len(older.entries) < limit:
        cache.covered_from = 0  # fewer than asked: your first puzzle was reached
    else:
        cache.covered_from = cache.oldest if cache.entries else 0
    cache.save()
    return older.stopped


def refresh_cached(folder: str, user: str, token: str, **asked) -> tuple[ActivityCache, str]:
    """Load the account's cache, refresh() it (asked: its options) and return it with how it stopped."""
    with _lock:
        cache = ActivityCache.load(folder, user)
        return cache, refresh(cache, token, **asked)


def clear_cache(folder: str, user: str):
    """Forget the account's cache: the next read takes the whole history from Lichess again."""
    with _lock:
        ActivityCache.load(folder, user).clear()
