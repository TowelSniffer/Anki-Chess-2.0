import os
import sys

import pytest

HERE = os.path.dirname(__file__)
# Import the pure modules directly: the package __init__ depends on aqt.
sys.path.insert(0, os.path.join(HERE, "..", "lichess_study_importer"))

import pgn_split as p  # noqa: E402
from lichess_api import parse_study_url  # noqa: E402


@pytest.fixture(scope="module")
def chapters():
    with open(os.path.join(HERE, "fixtures", "pl05a.pgn"), encoding="utf-8") as f:
        return p.split_games(f.read())


def by_id(chapters, chapter_id):
    return next(c for c in chapters if c.chapter_id == chapter_id)


def test_split_counts(chapters):
    kinds = [c.kind for c in chapters]
    assert len(chapters) == 27
    assert kinds.count(p.KIND_EXERCISE) == 16
    assert kinds.count(p.KIND_GAME) == 10
    assert kinds.count(p.KIND_EMPTY) == 1
    assert all(c.study_id == "7lucWTlb" for c in chapters)


def test_duplicate_tags_removed(chapters):
    pgn = chapters[0].pgn()
    assert pgn.count("[FEN ") == 1
    assert chapters[0].fen.startswith("r2qk2r/")


@pytest.mark.parametrize(
    "chapter_id,mode",
    [
        ("kZ9o8FTD", p.MODE_PUZZLE),  # "qual o melhor lance para as pretas?"
        ("9joqOtyZ", p.MODE_PUZZLE),  # 22... Qh5#
        ("Hx6Og5K3", p.MODE_PUZZLE),  # 0-1, black to move
        ("SJh3zsIz", p.MODE_PUZZLE),  # peão passado
        ("NetioIAN", p.MODE_FLIPPED),  # 1-0, black to move
        ("QtPSc5GK", p.MODE_FLIPPED),  # 1-0, black to move
        ("etwN9soc", p.MODE_FLIPPED),  # draw, "Jogam as brancas"
        ("lZ8fB4Ai", p.MODE_FLIPPED),  # "Jogam as pretas", white to move
        ("MRD53qq4", p.MODE_STUDY),  # full game
    ],
)
def test_suggested_mode(chapters, chapter_id, mode):
    assert by_id(chapters, chapter_id).suggested_mode == mode


def chapter(tags: str, moves: str):
    return p.split_games(f"{tags}\n\n{moves}\n")[0]


@pytest.mark.parametrize(
    "orientation,fen,moves,player,mode",
    [
        # Exercises from the #MT197 study: the opponent's move comes first
        ("black", "rnbqkbnr/1p1ppppp/p7/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3", "3. c3 d5 *", "b", p.MODE_FLIPPED),
        ("white", "5k2/5p2/R5pp/p7/r6P/6P1/5PK1/8 b - - 0 39", "39... h5 40. Ra8+ *", "w", p.MODE_FLIPPED),
        # You make the first move
        ("white", "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1", "1. Ra8# *", "w", p.MODE_PUZZLE),
        ("black", "6k1/5ppp/8/8/8/8/r4PPP/6K1 b - - 0 1", "1... Ra1# *", "b", p.MODE_PUZZLE),
        # Opening lines and games follow the orientation too
        ("black", None, "1. e4 c5 2. Nf3 *", "b", p.MODE_FLIPPED),
        ("white", None, "1. d4 d5 2. c4 *", "w", p.MODE_PUZZLE),
    ],
)
def test_orientation_decides_the_side(orientation, fen, moves, player, mode):
    tags = f'[Orientation "{orientation}"]'
    if fen:
        tags += f'\n[FEN "{fen}"]\n[SetUp "1"]'
    ch = chapter(tags, moves)
    assert ch.player == player
    assert ch.suggested_mode == mode


def test_orientation_wins_over_hints():
    fen = "rnbqkbnr/1p1ppppp/p7/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3"
    ch = chapter(f'[Orientation "white"]\n[FEN "{fen}"]', "3. c3 { Jogam as pretas } d5 *")
    assert ch.player == "w" and ch.suggested_mode == p.MODE_PUZZLE
    # Without the orientation (exported file) the hint still decides
    ch = chapter(f'[FEN "{fen}"]', "3. c3 { Jogam as pretas } d5 *")
    assert ch.player == "b" and ch.suggested_mode == p.MODE_FLIPPED


def test_mode_for():
    assert p.mode_for("w", "w") == p.MODE_PUZZLE
    assert p.mode_for("b", "w") == p.MODE_FLIPPED
    assert p.mode_for(None, "w") == p.MODE_STUDY


def test_empty_chapter(chapters):
    assert by_id(chapters, "DxgnzhzB").kind == p.KIND_EMPTY


def test_anno_stripped(chapters):
    pgn = by_id(chapters, "U1jhX7Mv").pgn()
    assert "[%anno" not in pgn
    assert "Adicionando um novo ataque" in pgn
    assert "[%anno" in by_id(chapters, "U1jhX7Mv").pgn(strip_anno=False)


def test_tag_like_line_inside_comment_does_not_split():
    text = '[Event "a"]\n\n1. e4 { comentário\n[Event "falso"]\n} e5 *\n\n[Event "b"]\n\n1. d4 *\n'
    chs = p.split_games(text)
    assert [c.tags["Event"] for c in chs] == ["a", "b"]


def test_crlf_and_single_game_without_tags():
    chs = p.split_games("1. e4 e5 2. Nf3 *\r\n")
    assert len(chs) == 1 and chs[0].kind == p.KIND_LINE  # no result: an opening line


def test_game_vs_line():
    game = p.split_games('[Result "1-0"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0\n')[0]
    line = p.split_games('[Result "*"]\n\n1. e4 c5 2. Nf3 a6 *\n')[0]
    assert game.kind == p.KIND_GAME and line.kind == p.KIND_LINE
    assert line.suggested_mode == p.MODE_STUDY


def test_quotes_in_tag_values_are_kept_escaped():
    # Lichess escapes quotes in chapter names; the rebuilt PGN must keep them escaped
    text = '[ChapterName "\\"Let Me Introduce You\\" - Foreword"]\n[Annotator "a\\\\b"]\n\n1. e4 *\n'
    ch = p.split_games(text)[0]
    assert ch.name == '"Let Me Introduce You" - Foreword'
    assert ch.tags["Annotator"] == "a\\b"
    pgn = ch.pgn()
    assert '[ChapterName "\\"Let Me Introduce You\\" - Foreword"]' in pgn
    assert '[Annotator "a\\\\b"]' in pgn
    assert p.split_games(pgn)[0].tags == {**ch.tags, "AnkiChessId": ch.dedupe_key}  # round trip


def test_malformed_comment_commands_are_dropped():
    text = "1. e4 { [%t@Shrt] Venice [%t Shrt] [%cal Ga1a2] [%eval 0.3] [%x] [%t,v] } *"
    pgn = p.split_games(text)[0].pgn(strip_anno=False)
    assert "[%t@Shrt]" not in pgn and "[%x]" not in pgn and "[%t,v]" not in pgn
    assert "[%t Shrt]" in pgn and "[%cal Ga1a2]" in pgn and "[%eval 0.3]" in pgn
    assert "Venice" in pgn


@pytest.mark.parametrize(
    "url,expected",
    [
        ("https://lichess.org/study/7lucWTlb", ("7lucWTlb", None)),
        ("lichess.org/study/7lucWTlb/kZ9o8FTD", ("7lucWTlb", "kZ9o8FTD")),
        ("https://lichess.org/study/7lucWTlb/kZ9o8FTD#12", ("7lucWTlb", "kZ9o8FTD")),
        ("7lucWTlb", ("7lucWTlb", None)),
        ("https://example.com/x", None),
    ],
)
def test_parse_study_url(url, expected):
    assert parse_study_url(url) == expected
