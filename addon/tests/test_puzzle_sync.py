"""The puzzle sync's steps (sync_flow), run with plain calls instead of Anki's operations."""

import json
import os
import sys
import types

import pytest

HERE = os.path.dirname(__file__)
ADDON_DIR = os.path.join(HERE, "..", "lichess_study_importer")

if "lsi" not in sys.modules:
    pkg = types.ModuleType("lsi")
    pkg.__path__ = [ADDON_DIR]
    sys.modules["lsi"] = pkg

from lsi import i18n, lichess_api, puzzles  # noqa: E402

DECK = "Chess::Lichess puzzles"
FEN = "2r2rk1/1pp2p1p/p2p1npq/3Pp2n/4P3/5QN1/PPP2P2/R2NK2R w KQ - 1 1"


def entry(puzzle_id: str, win: bool, date: int) -> dict:
    return {
        "date": date,
        "win": win,
        "puzzle": {
            "id": puzzle_id,
            "rating": 1500,
            "plays": 1,
            "solution": ["f3f6", "h5f6", "h1h6"],
            "themes": ["middlegame", "fork"],
            "fen": FEN,
            "lastMove": "e8f6",
        },
    }


class Progress:
    def __init__(self):
        self.cancel_after = None  # Esc once cancelled() was asked that many times
        self.asked = 0

    def set(self, label, value=None, maximum=None):
        pass

    def wait(self):
        return None

    def cancelled(self):
        self.asked += 1
        return self.cancel_after is not None and self.asked > self.cancel_after


class Host:
    """A sync run with plain calls: the collection is a dict of puzzle id -> (deck, tags, text)."""

    def __init__(self):
        self.progress = Progress()
        self.col = object()
        self.saved = []
        self.finished = []

    def run_background(self, task, success, label):
        try:
            result = task()
        except lichess_api.LichessError as e:
            self.finish(error=e)
            return
        success(result)

    def run_collection(self, op, success):
        success(op(self.col))

    def collection(self):
        return self.col

    def save_state(self, since, at, layout):
        self.saved.append((since, layout))

    def finish(self, message="", error=None, news=False):
        self.finished.append((message, error, news))


class Env:
    """Lichess (activity and puzzles) and the collection, faked, around a SyncFlow."""

    def __init__(self, anki_ops, sync_flow, monkeypatch, tmp_path):
        self.sync_flow = sync_flow
        self.cache = str(tmp_path)
        self.history = []  # activity, most recent first
        self.reads = []
        self.stop_read = ""  # the next activity read stops ("cancelled" / "connection")
        self.fetched = []
        self.notes = {}  # puzzle id -> {"deck", "tags", "text"}
        game = json.load(open(os.path.join(HERE, "fixtures", "lichess_puzzle.json"), encoding="utf-8"))

        def activity(token, max_entries=None, progress=None, cancelled=None, wait=None, since=None, before=None):
            self.reads.append((since, before))
            out = [e for e in self.history if (not since or e["date"] >= since) and (not before or e["date"] < before)]
            stopped, self.stop_read = self.stop_read, ""
            return lichess_api.PuzzleActivity(out[:1] if stopped else out, stopped)

        def fetch_puzzle(puzzle_id, wait=None):
            self.fetched.append(puzzle_id)
            data = json.loads(json.dumps(game))
            played = next(e["puzzle"] for e in self.history if e["puzzle"]["id"] == puzzle_id)
            data["puzzle"].update(id=puzzle_id, themes=played["themes"], rating=played["rating"])
            return data

        def import_chapters(col, rows, update, strip, stats, label, organize=()):
            assert not update
            stats["created"] = 0
            for card, model, placement in rows:
                if card.puzzle_id not in self.notes:
                    text = anki_ops.build_note_fields(card, True)[1]
                    self.notes[card.puzzle_id] = {"deck": placement.deck, "tags": card.note_tags, "text": text}
                    stats["created"] += 1
            stats["organized"] = 0
            by_nid = {n: pid for n, pid in enumerate(self.notes)}
            for nids, deck, tags, text in organize:
                note = self.notes[by_nid[nids[0]]]
                if (note["deck"], note["tags"], note["text"]) != (deck, tags, text):
                    note.update(deck=deck, tags=tags, text=text)
                    stats["organized"] += 1

        monkeypatch.setattr(lichess_api, "fetch_puzzle_activity", activity)
        monkeypatch.setattr(puzzles, "fetch_puzzle", fetch_puzzle)
        monkeypatch.setattr(puzzles, "_pause", lambda seconds: None)
        monkeypatch.setattr(anki_ops, "imported_puzzles", lambda col: {pid: [n] for n, pid in enumerate(self.notes)})
        monkeypatch.setattr(anki_ops, "ensure_mode_note_type", lambda base, mode: {"name": mode, "id": 1})
        monkeypatch.setattr(anki_ops, "import_chapters", import_chapters)

    def play(self, puzzle_id, win, date):
        self.history.insert(0, entry(puzzle_id, win, date))

    def sync(self, since=0, failed_only=False, fetch_games=True, cancel_after=None):
        self.fetched = []
        host = Host()
        host.progress.cancel_after = cancel_after
        settings = self.sync_flow.SyncSettings(
            token="lip_x",
            user="me",
            since=since,
            failed_only=failed_only,
            fetch_games=fetch_games,
            deck=DECK,
            base={"name": "AnkiChess", "id": 1},
            cache_folder=self.cache,
        )
        self.sync_flow.SyncFlow(settings, host).start()
        assert len(host.finished) == 1, host.finished
        return host


@pytest.fixture
def env(anki_ops, monkeypatch, tmp_path):
    from lsi import sync_flow

    i18n.set_language("en")
    yield Env(anki_ops, sync_flow, monkeypatch, tmp_path)
    i18n.set_language(i18n.DEFAULT_LANGUAGE)


def test_first_sync_imports_everything_missing_oldest_first(env):
    for pid, win, date in (("e", True, 50), ("d", False, 40), ("c", True, 30), ("b", False, 20), ("a", True, 10)):
        env.play(pid, win, date)
    env.notes["a"] = {"deck": DECK, "tags": [], "text": "old"}  # imported before, into the single deck
    host = env.sync()
    assert env.fetched == ["b", "c", "d", "e"]  # the games of the new ones, oldest first
    assert env.notes["b"]["deck"] == f"{DECK}::Failed" and env.notes["c"]["deck"] == f"{DECK}::Solved"
    assert env.notes["a"]["deck"] == f"{DECK}::Solved" and "lichess::puzzle::theme::fork" in env.notes["a"]["tags"]
    assert "You solved it on Lichess" in env.notes["a"]["text"]  # the text under the board, from the activity
    assert host.saved == [(50, env.sync_flow.PUZZLE_LAYOUT)]
    message = "Lichess puzzles: 4 new imported. 1 already imported were moved to Failed/Solved or retagged."
    assert host.finished == [(message, None, True)]


def test_nothing_new(env):
    env.play("a", True, 10)
    env.sync()
    host = env.sync(since=10)
    assert env.reads[-1] == (10, None) and env.fetched == []
    assert host.finished == [("Lichess puzzles: nothing new to import.", None, False)]


def test_esc_while_fetching_imports_what_came_and_the_next_sync_starts_at_the_first_left(env):
    for pid, date in (("c", 30), ("b", 20), ("a", 10)):
        env.play(pid, False, date)
    host = env.sync(cancel_after=1)
    assert env.fetched == ["a"] and list(env.notes) == ["a"]
    assert host.saved == [(20, env.sync_flow.PUZZLE_LAYOUT)]
    assert "Stopped after 1 of 3 puzzles. The rest will be imported at the next sync." in host.finished[0][0]
    env.sync(since=20)
    assert env.fetched == ["b", "c"]


def test_only_the_failed_ones(env):
    env.play("solved", True, 20)
    env.play("failed", False, 10)
    env.sync(failed_only=True)
    assert list(env.notes) == ["failed"]


def test_without_the_games_the_activity_makes_the_cards(env):
    env.play("a", False, 10)
    env.sync(fetch_games=False)
    assert env.fetched == [] and env.notes["a"]["deck"] == f"{DECK}::Failed"


def test_a_stopped_read_imports_nothing_and_the_next_one_goes_on(env):
    for date in range(1, 6):
        env.play(f"p{date}", False, date)
    env.stop_read = "connection"
    host = env.sync()
    assert env.notes == {} and host.saved == []
    assert host.finished[0][0].startswith("The connection to Lichess dropped: nothing was imported")
    host = env.sync()
    assert env.reads[-1] == (None, 5)  # the older puzzles, before the one kept
    assert len(env.notes) == 5


def test_offline(env, monkeypatch):
    def offline(*args, **kwargs):
        raise lichess_api.LichessError("error.connection", reason="offline")

    monkeypatch.setattr(lichess_api, "fetch_puzzle_activity", offline)
    host = env.sync()
    assert host.finished[0][1].key == "error.connection" and host.saved == []


def test_a_new_layout_reads_the_cached_history_without_lichess(env):
    for pid, win, date in (("b", False, 20), ("a", True, 10)):
        env.play(pid, win, date)
    env.sync()
    env.notes["a"].update(deck=DECK, tags=[])  # as an older layout left it
    reads = len(env.reads)
    env.sync(since=0)  # a newer layout: the whole history, from the cache
    assert env.reads[reads:] == [(20, None)]  # only the new puzzles were asked for
    assert env.notes["a"]["deck"] == f"{DECK}::Solved" and env.notes["a"]["tags"]
