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
    assert "lichess::puzzle::mateIn3" in card.note_tags and "lichess::puzzle::failed" in card.note_tags
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
