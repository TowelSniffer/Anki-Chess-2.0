import io
import json
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

from lsi import chesscom, game_analysis as ga, i18n, lichess_api, note_info, puzzles  # noqa: E402
from lsi.chess_lib import chess  # noqa: E402
from lsi.pgn_split import MODE_FLIPPED, split_games  # noqa: E402


@pytest.fixture(autouse=True)
def portuguese():
    i18n.set_language("pt-BR")
    yield
    i18n.set_language(i18n.DEFAULT_LANGUAGE)


def fixture(name: str) -> str:
    with open(os.path.join(HERE, "fixtures", name), encoding="utf-8") as f:
        return f.read()


def test_parse_several_study_links():
    text = (
        "https://lichess.org/study/s4KZKju4\n"
        "https://lichess.org/study/0QRkVohU/9VHbXCsv, 7lucWTlb https://lichess.org/study/s4KZKju4"
    )
    assert lichess_api.parse_study_urls(text) == [
        ("s4KZKju4", None),
        ("0QRkVohU", "9VHbXCsv"),
        ("7lucWTlb", None),
    ]


@pytest.mark.parametrize(
    "url,game_id",
    [
        ("https://lichess.org/5BBrW941", "5BBrW941"),
        ("lichess.org/5BBrW941/black", "5BBrW941"),
        ("https://lichess.org/5BBrW941abcd", "5BBrW941"),
        ("https://lichess.org/study/s4KZKju4", None),
        ("https://lichess.org/training/tgu12", None),
        ("https://lichess.org/@/basso01", None),
    ],
)
def test_parse_game_url(url, game_id):
    assert lichess_api.parse_game_url(url) == game_id


def test_parse_puzzle_ids():
    assert lichess_api.parse_puzzle_ids("https://lichess.org/training/tgu12 lichess.org/training/DG7B9") == [
        "tgu12",
        "DG7B9",
    ]
    assert lichess_api.parse_puzzle_ids("tgu12, DG7B9") == ["tgu12", "DG7B9"]


def test_puzzle_card():
    data = json.loads(fixture("lichess_puzzle.json"))
    card = puzzles.puzzle_card(data, win=False)
    assert card.dedupe_key == "puzzle/tgu12"
    assert card.mode == MODE_FLIPPED  # the opponent's last move comes first
    game = chess.pgn.read_game(__import__("io").StringIO(card.pgn()))
    moves = [m.uci() for m in game.mainline_moves()]
    assert moves == [data["puzzle"]["lastMove"], *data["puzzle"]["solution"]]
    assert game.headers["Orientation"] == "black"
    assert game.headers["AnkiChessId"] == "puzzle/tgu12"
    assert "lichess::puzzle::theme::mateIn3" in card.note_tags and "lichess::puzzle::failed" in card.note_tags
    assert card.chapter_url == "https://lichess.org/training/tgu12"


def test_puzzle_from_activity_without_game():
    entry = {
        "date": 1789845997743,
        "win": False,
        "puzzle": {
            "id": "DG7B9",
            "rating": 1847,
            "plays": 5722,
            "solution": ["f3f6", "h5f6", "h1h6"],
            "themes": ["middlegame", "short", "advantage"],
            "fen": "2r2rk1/1pp2p1p/p2p1npq/3Pp2n/4P3/5QN1/PPP2P2/R2NK2R w KQ - 1 1",
            "lastMove": "e8f6",
        },
    }
    card = puzzles.puzzle_card(entry, win=False)
    assert card.mode == "puzzle"  # no game: starts at the puzzle position
    assert "1. Qxf6 Nxf6 2. Rxh6" in card.pgn()


def test_lichess_server_analysis_without_stockfish():
    game = chesscom.read_game(fixture("lichess_analysed.pgn"))
    assert ga.has_server_analysis(game)
    cards = [c for c in ga.analyze_game(game, ga.AnalysisOptions(chess.BLACK)) if c.kind in ga.ENGINE_KINDS]
    first = cards[0]
    assert first.name == "5... Melhor que d5? (Erro)"
    assert first.solution_text == "cxd4"  # "cxd4 was best"
    assert first.eval_text == "-1.9 → -0.2"  # (0.22 → 1.85) seen from Black
    assert first.dedupe_key == "lichess/AbCdEfGh/9/mistake"
    assert first.link_label == "Lichess" and first.chapter_url == "https://lichess.org/AbCdEfGh"
    assert first.note_tags == ["lichess", "lichess::mistake", "lichess::game::AbCdEfGh"]
    mates = [c for c in cards if c.kind == ga.KIND_MISSED_MATE]
    assert mates and any(c.solution_text.endswith("#") for c in mates)


def test_chapter_details():
    ch = split_games(
        '[Event "Moscow Open 2009 A"]\n[Date "2009.02.01"]\n[White "Lyubokhiner"]\n[WhiteElo "2400"]\n'
        '[Black "Yarmolenko"]\n[ECO "B28"]\n[Opening "Sicilian Defense: O\'Kelly Variation"]\n'
        '[Annotator "https://lichess.org/@/basso01"]\n[GameId "5BBrW941"]\n[ChapterName "(Bc4) Lyubokhiner"]\n'
        '[Result "0-1"]\n\n1. e4 c5 2. Nf3 a6 0-1\n'
    )[0]
    assert note_info.chapter_details(ch) == [
        "Abertura: B28 Sicilian Defense: O&#x27;Kelly Variation",
        "Lyubokhiner (2400) – Yarmolenko",
        "Moscow Open 2009 A · 2009.02.01",
        'Autor: <a href="https://lichess.org/@/basso01">basso01</a>',
        '<a href="https://lichess.org/5BBrW941">Partida original</a>',
    ]


# --- Lichess' download limit (429) and the token check ---

BUSY = b'{"error":"Please only run 1 request(s) at a time"}'


class FakeLichess:
    """urlopen answering from a list: bytes (a 200 body) or (code, body, headers) errors."""

    def __init__(self, monkeypatch, answers):
        import urllib.error

        self.answers = list(answers)
        self.requests = []
        self.clock = 0.0
        self.sleeps = []

        def urlopen(req, timeout=30):
            self.requests.append((req, self.clock))
            answer = self.answers.pop(0)
            if isinstance(answer, tuple):
                code, body, headers = answer
                raise urllib.error.HTTPError(req.full_url, code, "", headers, io.BytesIO(body))
            return io.BytesIO(answer)

        def pause(seconds):
            self.sleeps.append(round(seconds, 3))
            self.clock += seconds

        monkeypatch.setattr(lichess_api.urllib.request, "urlopen", urlopen)
        monkeypatch.setattr(lichess_api, "_clock", lambda: self.clock)
        monkeypatch.setattr(lichess_api, "_pause", pause)
        monkeypatch.setattr(lichess_api, "_last_study", -100.0)


def waits():
    asked = []

    def wait(seconds, key):
        asked.append((seconds, key))
        return True

    return asked, wait


def test_busy_download_is_waited_out_and_tried_again(monkeypatch):
    fake = FakeLichess(monkeypatch, [(429, BUSY, {}), (429, BUSY, {}), b"[Event \"x\"]"])
    asked, wait = waits()
    assert lichess_api.fetch_study_pgn("abcdefgh", wait=wait) == '[Event "x"]'
    assert asked == [(2, "lichess.busy_wait"), (4, "lichess.busy_wait")]
    assert len(fake.requests) == 3


def test_still_busy_after_every_wait_is_rate_limited(monkeypatch):
    FakeLichess(monkeypatch, [(429, BUSY, {})] * (len(lichess_api.BUSY_WAITS) + 1))
    asked, wait = waits()
    with pytest.raises(lichess_api.LichessError) as e:
        lichess_api.fetch_study_pgn("abcdefgh", wait=wait)
    assert e.value.key == "error.rate_limited"
    assert [s for s, _ in asked] == list(lichess_api.BUSY_WAITS)


def test_giving_up_during_a_wait_cancels(monkeypatch):
    FakeLichess(monkeypatch, [(429, BUSY, {})])
    with pytest.raises(lichess_api.LichessError) as e:
        lichess_api.fetch_study_pgn("abcdefgh", wait=lambda seconds, key: False)
    assert e.value.key == "error.cancelled"


def test_other_429_waits_a_minute_or_retry_after(monkeypatch):
    FakeLichess(monkeypatch, [(429, b"", {}), b"{}"])
    asked, wait = waits()
    lichess_api.fetch_puzzle("abcde", wait=wait)
    assert asked == [(lichess_api.RATE_LIMIT_WAIT, "lichess.rate_wait")]

    FakeLichess(monkeypatch, [(429, b"", {"Retry-After": "7"}), (429, b"", {}), b"{}"])
    asked, wait = waits()
    with pytest.raises(lichess_api.LichessError) as e:
        lichess_api.fetch_puzzle("abcde", wait=wait)
    assert e.value.key == "error.rate_limited"  # only one new try after a rate limit
    assert asked == [(7.0, "lichess.rate_wait")]


def test_without_a_wait_only_the_short_busy_waits(monkeypatch):
    fake = FakeLichess(monkeypatch, [(429, BUSY, {})] * 4)
    with pytest.raises(lichess_api.LichessError) as e:
        lichess_api.fetch_user_studies("someone")
    assert e.value.key == "error.rate_limited"
    assert fake.sleeps == list(lichess_api.QUIET_WAITS)

    FakeLichess(monkeypatch, [(429, b"", {})])
    with pytest.raises(lichess_api.LichessError):
        lichess_api.fetch_game_pgn("abcdefgh")  # no minute-long wait nobody sees


def test_study_downloads_are_a_little_apart_without_a_token(monkeypatch):
    fake = FakeLichess(monkeypatch, [b"a", b"b", b"c", b"d"])
    lichess_api.fetch_study_pgn("aaaaaaaa")
    lichess_api.fetch_study_pgn("bbbbbbbb")
    assert fake.sleeps == [0.0, lichess_api.STUDY_GAP]
    fake.clock += 5  # long after the last one: no pause
    lichess_api.fetch_study_pgn("cccccccc")
    assert fake.sleeps[-1] == 0.0
    # With a token Lichess allows three at a time: no pause at all
    lichess_api.fetch_study_pgn("dddddddd", token="lip_x")
    assert len(fake.sleeps) == 3
    assert fake.requests[-1][0].get_header("Authorization") == "Bearer lip_x"


def test_no_access_is_not_tried_again(monkeypatch):
    fake = FakeLichess(monkeypatch, [(404, b"", {})])
    asked, wait = waits()
    with pytest.raises(lichess_api.LichessError) as e:
        lichess_api.fetch_study_pgn("abcdefgh", wait=wait)
    assert e.value.key == "error.no_access"
    assert asked == [] and len(fake.requests) == 1


def test_check_token(monkeypatch):
    info = {"userId": "someone", "scopes": "study:read,puzzle:read,study:write", "expires": None}
    fake = FakeLichess(monkeypatch, [json.dumps({"lip_good": info}).encode(), b'{"lip_bad": null}'])
    assert lichess_api.check_token(" lip_good ") == info
    req = fake.requests[0][0]
    assert req.get_method() == "POST" and req.data == b"lip_good"
    assert lichess_api.check_token("lip_bad") is None
    assert lichess_api.token_scopes(info) == ([], ["study:write"])
    assert lichess_api.token_scopes({"scopes": "puzzle:read"}) == (["study:read"], [])
    assert lichess_api.token_scopes(None) == (list(lichess_api.TOKEN_SCOPES), [])


# --- Your whole puzzle activity, and fetching the checked puzzles ---


def activity_line(puzzle_id: str, win: bool, date: int) -> bytes:
    entry = {
        "date": date,
        "win": win,
        "puzzle": {
            "id": puzzle_id,
            "rating": 1500,
            "plays": 10,
            "solution": ["f3f6", "h5f6", "h1h6"],
            "themes": ["middlegame"],
            "fen": "2r2rk1/1pp2p1p/p2p1npq/3Pp2n/4P3/5QN1/PPP2P2/R2NK2R w KQ - 1 1",
            "lastMove": "e8f6",
        },
    }
    return json.dumps(entry).encode() + b"\n"


def test_whole_activity_is_read_as_it_comes(monkeypatch):
    body = b"".join(activity_line(f"p{i:04d}", i % 3 != 0, 2000 - i) for i in range(45))
    body += activity_line("p0001", False, 1)  # the same puzzle twice: kept once
    fake = FakeLichess(monkeypatch, [body])
    counts = []
    activity = lichess_api.fetch_puzzle_activity("lip_x", progress=counts.append)
    assert fake.requests[0][0].full_url.endswith("/puzzle/activity")  # no max: all of it
    assert fake.requests[0][0].get_header("Authorization") == "Bearer lip_x"
    assert [e["puzzle"]["id"] for e in activity.entries] == [f"p{i:04d}" for i in range(45)]
    assert activity.entries[1]["win"] is True  # the most recent entry of a puzzle wins
    assert activity.stopped == ""
    assert counts == [20, 40, 45]


def test_latest_activity_asks_for_max(monkeypatch):
    fake = FakeLichess(monkeypatch, [activity_line("abcde", False, 1)])
    lichess_api.fetch_puzzle_activity("lip_x", 50)
    assert fake.requests[0][0].full_url.endswith("/puzzle/activity?max=50")


def test_stopping_the_activity_keeps_the_most_recent(monkeypatch):
    body = b"".join(activity_line(f"p{i:04d}", False, 1000 - i) for i in range(10))
    FakeLichess(monkeypatch, [body])
    read = []
    activity = lichess_api.fetch_puzzle_activity("lip_x", cancelled=lambda: len(read.append(1) or read) >= 3)
    assert [e["puzzle"]["id"] for e in activity.entries] == ["p0000", "p0001", "p0002"]
    assert activity.stopped == "cancelled"


class DroppedStream(io.BytesIO):
    """A response whose connection drops after some lines."""

    def __init__(self, lines: list[bytes]):
        super().__init__(b"")
        self.lines = lines

    def __iter__(self):
        yield from self.lines
        raise ConnectionResetError("reset")


def test_dropped_activity_keeps_what_came(monkeypatch):
    FakeLichess(monkeypatch, [])
    lines = [activity_line("aaaaa", False, 2), activity_line("bbbbb", True, 1)]
    monkeypatch.setattr(lichess_api.urllib.request, "urlopen", lambda req, timeout=30: DroppedStream(lines))
    activity = lichess_api.fetch_puzzle_activity("lip_x")
    assert len(activity.entries) == 2 and activity.stopped == "connection"

    monkeypatch.setattr(lichess_api.urllib.request, "urlopen", lambda req, timeout=30: DroppedStream([]))
    with pytest.raises(lichess_api.LichessError) as e:
        lichess_api.fetch_puzzle_activity("lip_x")  # nothing came: an error
    assert e.value.key == "error.connection"


def test_activity_rate_limit_is_waited_out(monkeypatch):
    FakeLichess(monkeypatch, [(429, b"", {"Retry-After": "5"}), activity_line("abcde", False, 1)])
    asked, wait = waits()
    activity = lichess_api.fetch_puzzle_activity("lip_x", wait=wait)
    assert asked == [(5.0, "lichess.rate_wait")] and len(activity.entries) == 1


def test_activity_card_keeps_the_date_and_needs_the_game():
    entry = json.loads(activity_line("DG7B9", False, 1789845997743))
    card = puzzles.activity_card(entry)
    assert card.date == 1789845997743 and card.win is False
    assert not card.opponent_move_first  # no game: starts at the puzzle position
    assert card.pgn() == puzzles.puzzle_card(entry, False).pgn()  # the note doesn't change with the date
    full = puzzles.puzzle_card(json.loads(fixture("lichess_puzzle.json")), False, 5)
    assert full.opponent_move_first and full.date == 5


@pytest.fixture
def no_pause(monkeypatch):
    pauses = []
    monkeypatch.setattr(puzzles, "_pause", pauses.append)
    return pauses


def test_load_puzzles_fetches_each_game(monkeypatch, no_pause):
    game = json.loads(fixture("lichess_puzzle.json"))
    entry = json.loads(activity_line("DG7B9", False, 7))
    monkeypatch.setattr(puzzles, "fetch_puzzle", lambda puzzle_id, wait=None: game)
    steps = []
    cards, error = puzzles.load_puzzles(
        [("tgu12", False, entry), ("tgu12", None, None)], lambda done, total: steps.append(done)
    )
    assert error is None and len(cards) == 2
    assert cards[0].opponent_move_first and cards[0].date == 7 and cards[0].win is False
    assert steps == [0, 1, 2]
    assert no_pause == [puzzles.REQUEST_PAUSE]  # between requests only


def test_load_puzzles_stops_and_keeps_the_ones_fetched(monkeypatch, no_pause):
    game = json.loads(fixture("lichess_puzzle.json"))
    monkeypatch.setattr(puzzles, "fetch_puzzle", lambda puzzle_id, wait=None: game)
    items = [("tgu12", None, None)] * 5
    done_so_far = []
    cards, error = puzzles.load_puzzles(
        items, lambda done, total: done_so_far.append(done), cancelled=lambda: len(done_so_far) > 2
    )
    assert len(cards) == 2 and error.key == "error.cancelled"

    def rate_limited(puzzle_id, wait=None):
        raise lichess_api.LichessError("error.rate_limited")

    monkeypatch.setattr(puzzles, "fetch_puzzle", rate_limited)
    cards, error = puzzles.load_puzzles(items, lambda done, total: None)
    assert cards == [] and error.key == "error.rate_limited"


def test_load_puzzles_falls_back_on_the_activity(monkeypatch, no_pause):
    def missing(puzzle_id, wait=None):
        raise lichess_api.LichessError("error.no_access", code=404, hint="")

    monkeypatch.setattr(puzzles, "fetch_puzzle", missing)
    entry = json.loads(activity_line("DG7B9", False, 7))
    cards, error = puzzles.load_puzzles([("DG7B9", False, entry)], lambda done, total: None)
    assert error is None and not cards[0].opponent_move_first
    with pytest.raises(lichess_api.LichessError):
        puzzles.load_puzzles([("DG7B9", None, None)], lambda done, total: None)  # a link: no entry


def test_imported_puzzles_with_one_search(anki_ops):
    first = puzzles.activity_card(json.loads(activity_line("DG7B9", False, 7)))
    second = puzzles.puzzle_card(json.loads(fixture("lichess_puzzle.json")))
    notes = {
        1: "\x1f".join(anki_ops.note_fields(first, True)),
        2: "\x1f".join(anki_ops.note_fields(second, True)),
        3: "[AnkiChessId &quot;lichess/AbCdEfGh/9/mistake&quot;]",
    }
    searches = []

    def find_notes(query):
        searches.append(query)
        return list(notes)

    col = types.SimpleNamespace(
        find_notes=find_notes,
        db=types.SimpleNamespace(all=lambda sql: list(notes.items())),
    )
    assert anki_ops.imported_puzzles(col) == {"DG7B9": [1], "tgu12": [2]}
    assert searches == ['"PGN:*AnkiChessId \\"puzzle/*"']


# --- Puzzle sync ---


def test_sync_reads_the_activity_since_the_last_sync(monkeypatch):
    fake = FakeLichess(monkeypatch, [activity_line("abcde", False, 5), activity_line("fghij", True, 6)])
    lichess_api.fetch_puzzle_activity("lip_x", since=1789845997743)
    assert fake.requests[0][0].full_url.endswith("/puzzle/activity?since=1789845997743")
    lichess_api.fetch_puzzle_activity("lip_x", 10, since=5)
    assert fake.requests[1][0].full_url.endswith("/puzzle/activity?max=10&since=5")


def entries(*items):
    return [json.loads(activity_line(puzzle_id, win, date)) for puzzle_id, win, date in items]


def test_sync_plan_imports_what_is_missing_oldest_first():
    activity = entries(("newer", True, 30), ("known", False, 20), ("older", False, 10), ("solved", True, 5))
    plan = puzzles.sync_plan(activity, {"known"}, failed_only=False)
    assert [e["puzzle"]["id"] for e in plan] == ["solved", "older", "newer"]
    plan = puzzles.sync_plan(activity, {"known"}, failed_only=True)
    assert [e["puzzle"]["id"] for e in plan] == ["older"]


def test_next_sync_point():
    activity = entries(("c", True, 30), ("b", False, 20), ("a", False, 10))
    plan = puzzles.sync_plan(activity, set(), failed_only=False)
    # Everything imported: the next sync starts at the most recent puzzle read
    assert puzzles.next_sync_point(activity, True, plan, len(plan), 0) == 30
    # Stopped after the first one: it starts at the first left
    assert puzzles.next_sync_point(activity, True, plan, 1, 0) == 20
    # Lichess didn't send all of it: it reads the same activity again
    assert puzzles.next_sync_point(activity, False, plan, len(plan), 7) == 7
    # Nothing new: the point never goes back
    assert puzzles.next_sync_point([], True, [], 0, 42) == 42


# --- Failed / Solved decks and theme tags ---


def test_puzzle_tags_by_theme_and_result():
    themes = ["mateIn1", "oneMove", "middlegame"]
    assert puzzles.puzzle_tags(themes, False) == [
        "lichess",
        "lichess::puzzle",
        "lichess::puzzle::theme::mateIn1",
        "lichess::puzzle::theme::oneMove",
        "lichess::puzzle::theme::middlegame",
        "lichess::puzzle::failed",
    ]
    assert puzzles.puzzle_tags(themes, True)[-1] == "lichess::puzzle::solved"
    link = puzzles.puzzle_tags(themes, None)  # a puzzle link: no result
    assert not any(t.endswith(("::failed", "::solved")) for t in link)
    entry = json.loads(activity_line("DG7B9", True, 7))
    assert puzzles.activity_card(entry).note_tags == puzzles.puzzle_tags(["middlegame"], True)


class FakeNote:
    def __init__(self, nid, tags, fields):
        self.id, self.tags, self.fields = nid, list(tags), list(fields)


class FakeCollection:
    """Notes and cards (id, note id, deck id, original deck id) for import_chapters."""

    def __init__(self, notes, cards):
        self.notes = {n.id: n for n in notes}
        self.cards = cards
        self.decks_by_name = {}
        self.updated, self.moved = [], {}
        col = self

        class Decks:
            def id(self, name):
                return col.decks_by_name.setdefault(name, 100 + len(col.decks_by_name))

        class Db:
            def list(self, sql, did):
                nids = {int(n) for n in sql.split("(")[1].split(")")[0].split(",")}
                return [cid for cid, nid, deck, odid in col.cards if nid in nids and deck != did and not odid]

        self.decks, self.db = Decks(), Db()

    def add_custom_undo_entry(self, label):
        return 1

    def merge_undo_entries(self, pos):
        return "changes"

    def get_note(self, nid):
        return self.notes[nid]

    def update_notes(self, notes):
        self.updated += notes

    def set_deck(self, cids, did):
        self.moved.setdefault(did, []).extend(cids)


def test_organize_moves_and_retags_without_touching_fields(anki_ops, monkeypatch):
    monkeypatch.setattr(anki_ops, "ids2str", lambda ids: "(" + ",".join(str(i) for i in ids) + ")")
    old = FakeNote(1, ["lichess", "lichess::puzzle", "lichess::puzzle::mateIn1", "my_tag"], ["pgn", "text"])
    done = FakeNote(2, ["lichess", "lichess::puzzle", "lichess::puzzle::solved"], ["pgn2", "text2"])
    # Card 11 is in a filtered deck (original deck 5): it stays there
    col = FakeCollection([old, done], [(10, 1, 5, 0), (11, 1, 7, 5), (20, 2, 101, 0)])
    stats = {}
    organize = [
        ([1], "Xadrez::Puzzles do Lichess::Errados", puzzles.puzzle_tags(["mateIn1"], False)),
        ([2], "Xadrez::Puzzles do Lichess::Acertados", ["lichess", "lichess::puzzle", "lichess::puzzle::solved"]),
    ]
    anki_ops.import_chapters(col, [], False, True, stats, "x", organize=organize)
    failed = col.decks_by_name["Xadrez::Puzzles do Lichess::Errados"]
    assert col.moved == {failed: [10]}  # the filtered card and the one already in place stay
    new_tags = ["lichess", "lichess::puzzle", "lichess::puzzle::theme::mateIn1", "lichess::puzzle::failed"]
    assert old.tags == ["my_tag", *new_tags]  # the user's tag stays
    assert old.fields == ["pgn", "text"] and col.updated == [old]  # note 2 had nothing to change
    assert stats["organized"] == 1 and stats["created"] == 0


def test_puzzle_placement():
    from lsi import decks

    assert decks.puzzle_placement("Xadrez::Puzzles do Lichess", False).deck == "Xadrez::Puzzles do Lichess::Errados"
    assert decks.puzzle_placement("Xadrez::Puzzles do Lichess", True).deck == "Xadrez::Puzzles do Lichess::Acertados"
    assert decks.puzzle_placement("Xadrez::Puzzles do Lichess", None).deck == "Xadrez::Puzzles do Lichess"
    i18n.set_language("en")
    assert decks.puzzle_placement("Chess::Lichess puzzles", False).deck == "Chess::Lichess puzzles::Failed"
    assert decks.puzzle_placement("Chess::Lichess puzzles", True).deck == "Chess::Lichess puzzles::Solved"
