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

from lsi import chesscom, engine, game_analysis as ga, i18n, openings  # noqa: E402
from lsi.chess_lib import chess  # noqa: E402

FIXTURE = os.path.join(HERE, "fixtures", "chesscom_review.pgn")
STOCKFISH = os.environ.get("STOCKFISH_PATH") or engine.find_stockfish()


@pytest.fixture(scope="module")
def game():
    with open(FIXTURE, encoding="utf-8") as f:
        return chesscom.read_game(f.read())


@pytest.mark.parametrize(
    "url,expected",
    [
        ("https://www.chess.com/analysis/game/live/184431566002/analysis", ("live", "184431566002")),
        ("https://www.chess.com/game/live/184431566002", ("live", "184431566002")),
        ("https://www.chess.com/game/daily/123456789", ("daily", "123456789")),
        ("https://www.chess.com/live/game/987654", ("live", "987654")),
        ("https://lichess.org/abcdefgh", None),
    ],
)
def test_parse_game_url(url, expected):
    assert chesscom.parse_game_url(url) == expected


def test_review_labels(game):
    labels = [chesscom.move_label(n) for n in game.mainline()]
    white = [label for i, label in enumerate(labels) if i % 2 == 0 and label in chesscom.ERROR_LABELS]
    assert chesscom.has_review_labels(game)
    assert white.count("Blunder") == 1  # 19. bxa5
    assert white.count("Mistake") == 1  # 21. f4
    assert white.count("Miss") == 3  # 20. Nd3, 24. Qb4, 26. Rxb1
    assert chesscom.game_id_from_headers(game.headers) == "184431566002"


def test_follow_book(game):
    result = openings.follow_book(game.board(), list(game.mainline_moves()))
    assert result.last_book_ply == 6
    assert result.deviation_ply == 6  # 4. Bf4 leaves the catalog
    assert result.opening_name.startswith("Slav Defense")
    assert "b1c3" in result.book_moves


def test_cards_without_engine(game):
    cards = ga.analyze_game(game, ga.AnalysisOptions(chess.WHITE))
    kinds = {c.kind: c for c in cards}
    assert set(kinds) == {ga.KIND_OPENING, ga.KIND_BOOK, ga.KIND_BOOK_LINE}
    book = chess.pgn.read_game(__import__("io").StringIO(kinds[ga.KIND_BOOK].body))
    assert book.headers["AnkiChessId"] == "chesscom/184431566002/6/book"
    # Flipped card: 3... Nf6 is played automatically, then the book move
    assert book.next().san() == "Nf6"
    first_moves = [v.san() for v in book.next().variations]
    assert first_moves[0] == "Nc3" and "Bf4" in first_moves
    assert 6 in book.next().variations[-1].nags  # the game move is marked as dubious


def test_book_lines(game):
    cards = ga.analyze_game(game, ga.AnalysisOptions(chess.WHITE, kinds={ga.KIND_BOOK_LINE}))
    names = [c.name for c in cards]
    assert len(cards) == 70  # named lines from 1. d4 d5 2. c4 c6 3. Nf3 Nf6, any move order
    assert len(set(names)) == len(names)  # same-name lines say where they end
    assert "Book line: Slav Defense: Bonet Gambit" in names
    assert any("Stoltz Variation (until 8. Bb2)" in n for n in names)  # reached via 2. Nf3

    card = next(c for c in cards if c.name.endswith("Anti-Moscow Gambit"))
    parsed = chess.pgn.read_game(__import__("io").StringIO(card.body))
    moves = [n.san() for n in parsed.mainline()]
    assert moves == ["Nf6", "Nc3", "e6", "Bg5", "h6", "Bh4"]  # 3... Nf6 auto-played first
    assert list(parsed.mainline())[-1].comment == "Semi-Slav Defense: Anti-Moscow Gambit"
    # The key depends on the line only, so another game in this opening won't duplicate it
    assert card.dedupe_key.startswith("book/") and "184431566002" not in card.dedupe_key


def test_book_lines_as_black(game):
    cards = ga.analyze_game(game, ga.AnalysisOptions(chess.BLACK, kinds={ga.KIND_BOOK_LINE}))
    # Black to answer: White's first line move is played automatically from the branch
    assert cards and all(c.mode == "flipped" for c in cards)
    assert "Book line: Slav Defense: Bonet Gambit" not in [c.name for c in cards]  # no Black move


def test_every_kind_has_a_label():
    for lang in i18n.STRINGS:
        for kind in ga.ALL_KINDS:
            assert f"kind.{kind}" in i18n.STRINGS[lang]


@pytest.mark.skipif(not STOCKFISH, reason="Stockfish not available")
def test_error_cards_with_engine(game):
    with engine.open_engine(STOCKFISH) as sf:
        cards = ga.analyze_game(
            game, ga.AnalysisOptions(chess.WHITE, move_time=0.2, solution_time=0.6), sf
        )
    by_ply = {(c.ply, c.kind): c for c in cards}
    blunder = by_ply[(36, ga.KIND_BLUNDER)]  # 19. bxa5??
    assert blunder.move_text == "19. bxa5??"
    parsed = chess.pgn.read_game(__import__("io").StringIO(blunder.body))
    after_prev = parsed.next()  # 18... a5, auto-played
    assert after_prev.san() == "a5"
    played = [v for v in after_prev.variations if v.san() == "bxa5"]
    assert played and 4 in played[0].nags  # repeating the blunder fails the puzzle
    assert after_prev.variations[0].san() == "Nxe6"  # the move explored in the analysis board
    mistake = by_ply[(40, ga.KIND_MISTAKE)]  # 21. f4?, explored 21. Nf4
    assert mistake.solution_text == "Nf4"
    assert not any(c.kind == ga.KIND_INACCURACY for c in cards)  # not selected by default
    assert len({c.dedupe_key for c in cards}) == len(cards)


@pytest.mark.skipif(not STOCKFISH, reason="Stockfish not available")
def test_missed_mate_with_engine():
    game = chesscom.read_game("1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Nc3 Nxh5 *")
    with engine.open_engine(STOCKFISH) as sf:
        cards = ga.analyze_game(
            game, ga.AnalysisOptions(chess.WHITE, move_time=0.2, solution_time=0.6), sf
        )
    mate = next(c for c in cards if c.kind == ga.KIND_MISSED_MATE)
    assert mate.ply == 6 and mate.solution_text == "Qxf7#"
    assert "Missed mate in 1" in mate.name
