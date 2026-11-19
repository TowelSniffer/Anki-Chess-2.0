import os
import sys
import types

import pytest

HERE = os.path.dirname(__file__)
ADDON_DIR = os.path.join(HERE, "..", "lichess_study_importer")

# Load the add-on modules as a package without running __init__ (it needs aqt)
if "lsi" not in sys.modules:
    pkg = types.ModuleType("lsi")
    pkg.__path__ = [ADDON_DIR]
    sys.modules["lsi"] = pkg

from lsi import lichess_api, puzzle_cache  # noqa: E402


def entry(puzzle_id: str, win: bool, date: int) -> dict:
    return {"date": date, "win": win, "puzzle": {"id": puzzle_id, "themes": ["fork"]}}


class FakeActivity:
    """Lichess' puzzle activity: since is inclusive, before exclusive, most recent first."""

    def __init__(self, history: list[tuple[str, bool, int]]):
        self.history = [entry(*h) for h in history]
        self.calls = []
        self.stop_after = None  # the next read stops (Esc) after that many puzzles

    def play(self, puzzle_id: str, win: bool, date: int):
        self.history.insert(0, entry(puzzle_id, win, date))

    def __call__(self, token, max_entries=None, progress=None, cancelled=None, wait=None, since=None, before=None):
        self.calls.append({"max": max_entries, "since": since, "before": before})
        out = [e for e in self.history if (not since or e["date"] >= since) and (not before or e["date"] < before)]
        if max_entries:
            out = out[:max_entries]
        stopped = ""
        if self.stop_after is not None:
            out, stopped, self.stop_after = out[: self.stop_after], "cancelled", None
        if progress:
            progress(len(out))
        return lichess_api.PuzzleActivity(list(out), stopped)


@pytest.fixture
def lichess(monkeypatch):
    fake = FakeActivity([(f"p{d:03d}", d % 3 != 0, d) for d in range(100, 0, -1)])  # p100 most recent
    monkeypatch.setattr(lichess_api, "fetch_puzzle_activity", fake)
    return fake


def ids(entries):
    return [e["puzzle"]["id"] for e in entries]


def test_whole_history_once_then_only_the_new_puzzles(tmp_path, lichess):
    cache, stopped = puzzle_cache.refresh_cached(str(tmp_path), "me", "lip_x", back_to=0)
    assert stopped == "" and cache.complete and len(cache.entries) == 100
    assert lichess.calls == [{"max": None, "since": None, "before": None}]
    # Kept in user_files: the next read asks only for the puzzles played since
    lichess.play("new01", False, 101)
    cache, stopped = puzzle_cache.refresh_cached(str(tmp_path), "me", "lip_x", back_to=0)
    assert lichess.calls[-1] == {"max": None, "since": 100, "before": None} and len(lichess.calls) == 2
    assert ids(cache.entries)[:2] == ["new01", "p100"] and len(cache.entries) == 101
    assert cache.since(100) == cache.entries[:2]


def test_a_stopped_read_of_the_history_goes_on_from_there(tmp_path, lichess):
    lichess.stop_after = 30
    cache, stopped = puzzle_cache.refresh_cached(str(tmp_path), "me", "lip_x", back_to=0)
    assert stopped == "cancelled" and not cache.complete
    assert ids(cache.entries) == [f"p{d:03d}" for d in range(100, 70, -1)] and cache.covered_from == 71
    # The next read asks for the new puzzles, then for the older ones before the last one kept
    cache, stopped = puzzle_cache.refresh_cached(str(tmp_path), "me", "lip_x", back_to=0)
    assert lichess.calls[-2:] == [
        {"max": None, "since": 100, "before": None},
        {"max": None, "since": None, "before": 71},
    ]
    assert stopped == "" and cache.complete and len(cache.entries) == 100


def test_a_stopped_read_of_new_puzzles_is_dropped(tmp_path, lichess):
    puzzle_cache.refresh_cached(str(tmp_path), "me", "lip_x", back_to=0)
    for date in (101, 102, 103):
        lichess.play(f"new{date}", True, date)
    lichess.stop_after = 1  # only the most recent: keeping it would leave out the other two
    cache, stopped = puzzle_cache.refresh_cached(str(tmp_path), "me", "lip_x", back_to=0)
    assert stopped == "cancelled" and cache.newest == 100
    cache, stopped = puzzle_cache.refresh_cached(str(tmp_path), "me", "lip_x", back_to=0)
    assert ids(cache.entries)[:4] == ["new103", "new102", "new101", "p100"]


def test_the_latest_puzzles(tmp_path, lichess):
    cache, _ = puzzle_cache.refresh_cached(str(tmp_path), "me", "lip_x", need=20)
    assert lichess.calls == [{"max": 20, "since": None, "before": None}]
    assert len(cache.entries) == 20 and not cache.complete and cache.covered_from == 81
    cache, _ = puzzle_cache.refresh_cached(str(tmp_path), "me", "lip_x", need=50)  # 30 more, older
    assert lichess.calls[-1] == {"max": 30, "since": None, "before": 81} and len(cache.entries) == 50
    cache, _ = puzzle_cache.refresh_cached(str(tmp_path), "me", "lip_x", need=500)  # more than there are
    assert cache.complete and len(cache.entries) == 100


def test_since_a_sync_point(tmp_path, lichess):
    cache, _ = puzzle_cache.refresh_cached(str(tmp_path), "me", "lip_x", back_to=90)
    assert lichess.calls == [{"max": None, "since": 90, "before": None}]
    assert cache.covered_from == 90 and not cache.complete and len(cache.since(90)) == 11
    assert cache.covers(95, None) and not cache.covers(50, None)


def test_one_cache_per_account_and_forgetting_it(tmp_path, lichess):
    puzzle_cache.refresh_cached(str(tmp_path), "alice", "lip_a", back_to=0)
    assert os.path.exists(os.path.join(tmp_path, "puzzle_activity_alice.json"))
    other = puzzle_cache.ActivityCache.load(str(tmp_path), "bob")
    assert other.entries == [] and other.covered_from is None
    puzzle_cache.clear_cache(str(tmp_path), "alice")
    assert puzzle_cache.ActivityCache.load(str(tmp_path), "alice").entries == []


def test_a_puzzle_read_again_keeps_its_last_result(tmp_path):
    cache = puzzle_cache.ActivityCache(str(tmp_path / "c.json"), "me", [entry("a", False, 5)], 0)
    cache.merge([entry("a", True, 5), entry("b", False, 6)])
    assert ids(cache.entries) == ["b", "a"] and cache.entries[1]["win"] is True
