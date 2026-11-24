import io
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

from lsi import decks, expand, i18n  # noqa: E402
from lsi.chess_lib import chess, drop_illegal_moves, read_pgn  # noqa: E402
from lsi.pgn_split import (  # noqa: E402
    KIND_UNSUPPORTED,
    MODE_FLIPPED,
    split_games,
)


@pytest.fixture(autouse=True)
def portuguese():
    i18n.set_language("pt-BR")
    yield
    i18n.set_language(i18n.DEFAULT_LANGUAGE)


def chapter(text: str):
    return split_games(text)[0]


LINE = (
    '[StudyName "Repertório"]\n[ChapterName "Siciliana"]\n'
    '[ChapterURL "https://lichess.org/study/AbCdEfGh/IjKlMnOp"]\n[Result "*"]\n\n'
    "1. e4 c5 2. Nf3 { principal } (2. c3 d5 (2... Nf6 3. e5)) 2... d6 3. d4 *\n"
)


def test_split_variations_one_card_per_branch():
    cards = expand.split_variations(chapter(LINE))
    assert [c.name for c in cards] == [
        "Siciliana (1/3): linha principal",
        "Siciliana (2/3): 2. c3 d5",
        "Siciliana (3/3): 2. c3 Nf6 3. e5",
    ]
    # Each branch has no variations, keeps its comments, and its own id
    assert "(" not in cards[0].movetext and "principal" in cards[0].movetext
    assert cards[2].movetext.startswith("1. e4 c5 2. c3 Nf6 3. e5")
    keys = {c.dedupe_key for c in cards}
    assert len(keys) == 3 and all(k.startswith("study/AbCdEfGh/IjKlMnOp/var/") for k in keys)
    assert all(f'[AnkiChessId "{c.dedupe_key}"]' in c.pgn() for c in cards)


def test_split_keeps_a_single_branch_chapter():
    ch = chapter('[ChapterURL "https://lichess.org/study/AbCdEfGh/IjKlMnOp"]\n\n1. e4 e5 *\n')
    assert expand.split_variations(ch) == [ch]


# A Lichess study exports the replies to a move as its variations, as annotated books
# write them: "20. Qh6!! (20. gxh6 Rg3#) (20. f6 Bh7+ ...) 20... gxh6" means 20... gxh6
# 21. Rg3# and 20... f6 21. Bh7+, and Lichess shows them so. python-chess left them out,
# then read the moves after them in the wrong position (the study update failed on it).
REPLY_VARIATIONS = (
    '[ChapterURL "https://lichess.org/study/AbCdEfGh/RePlIeS1"]\n[ChapterName "Partida"]\n\n'
    "1. e4 e5 2. Nf3 { ataca } (2. Nc6 Bb5) (2. d6 d4) 2... Nc6 3. Bc4 *\n"
)


def test_variations_written_as_replies():
    ch = chapter(REPLY_VARIATIONS)
    game = read_pgn(ch.movetext)
    # The main line keeps its own move; the replies go on after 2. Nf3
    assert [m.uci() for m in game.mainline_moves()] == ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"]
    nf3 = game.next().next().next()
    assert nf3.comment == "ataca"
    assert [(n.move.uci(), n.next().move.uci()) for n in nf3.variations] == [
        ("b8c6", "f1c4"),
        ("b8c6", "f1b5"),
        ("d7d6", "d2d4"),
    ]
    assert drop_illegal_moves(game) == 0
    cards = expand.split_variations(ch)
    assert [c.name for c in cards] == [
        "Partida (1/3): linha principal",
        "Partida (2/3): 2...Nc6 3. Bb5",
        "Partida (3/3): 2...d6 3. d4",
    ]
    # The card gets the moves as read: the template's parser would reject the original
    pgn = ch.pgn()
    assert "(2. Nc6" not in pgn and "( 2... Nc6 3. Bb5 )" in pgn
    again = chess.pgn.read_game(io.StringIO(pgn))
    assert not again.errors and [m.uci() for m in again.mainline_moves()][-2:] == ["b8c6", "f1c4"]


def test_reply_written_as_a_capture():
    # "3. Nxd4" isn't a capture before 3. Nd4 (python-chess would read it as that same
    # move) but it is after it: 3... Nxd4 4. c3
    game = read_pgn("1. e4 Nc6 2. Nf3 e6 3. Nd4 (3. Nxd4 c3) 3... Nf6 *")
    nd4 = game.next().next().next().next().next()
    assert [(n.move.uci(), [c.move.uci() for c in n.variations]) for n in nd4.variations] == [
        ("g8f6", []),
        ("c6d4", ["c2c3"]),
    ]


ILLEGAL_VARIATION = (
    '[ChapterURL "https://lichess.org/study/AbCdEfGh/IlLeGaL1"]\n[ChapterName "Partida"]\n\n'
    "1. e4 e5 2. Nf3 (2. Qxf7) (2. Bc4 Nf6) 2... Nc6 3. Bb5 a6 *\n"
)


def test_illegal_variation_is_left_out():
    ch = chapter(ILLEGAL_VARIATION)
    game = read_pgn(ch.movetext)
    # Illegal as an alternative and as a reply: left out, and the moves after it read in
    # their own position
    assert [m.uci() for m in game.mainline_moves()] == ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6"]
    assert [n.move.uci() for n in game.next().next().variations] == ["g1f3", "f1c4"]
    assert drop_illegal_moves(game) == 0
    cards = expand.split_variations(ch)
    assert [c.name for c in cards] == ["Partida (1/2): linha principal", "Partida (2/2): 2. Bc4 Nf6"]
    assert "Qxf7" not in ch.pgn()


def test_pgn_kept_as_it_is_when_it_reads():
    ch = chapter(LINE)
    assert "{ principal } (2. c3 d5 (2... Nf6 3. e5)) 2... d6" in ch.pgn()


def test_drop_illegal_moves():
    game = chess.pgn.read_game(io.StringIO("1. e4 e5 2. Nf3 *"))
    after_e4 = game.next()
    bad = after_e4.add_variation(chess.Move.from_uci("e2e4"))  # White again, after 1. e4
    bad.add_variation(chess.Move.from_uci("e7e5"))
    assert drop_illegal_moves(game) == 1
    assert [n.move.uci() for n in after_e4.variations] == ["e7e5"]


def test_key_move_cards():
    game = chapter(
        '[StudyName "Partidas"]\n[ChapterName "Tal - X"]\n[Result "1-0"]\n'
        '[ChapterURL "https://lichess.org/study/AbCdEfGh/QrStUvWx"]\n\n'
        "1. e4 e5 2. Nf3 Nc6 3. Bc4 d6 4. Nc3 Bg4 5. Nxe5! { Legal } "
        "(5. h3 { tranquilo }) 5... Bxd1 6. Bxf7+ Ke7 7. Nd5# 1-0\n"
    )
    [card] = expand.key_move_cards(game)
    assert card.name == "Tal - X: 5. Nxe5!"
    assert card.dedupe_key == "study/AbCdEfGh/QrStUvWx/move/9"
    # Starts before the opponent's 4... Bg4, which is played first; White solves it
    assert card.tags["ChapterMode"] == "gamebook"
    assert card.player == "w" and card.suggested_mode == MODE_FLIPPED
    assert card.movetext.startswith("4... Bg4 5. Nxe5 $1 { Legal } ( 5. h3 { tranquilo } )")
    # The key move ends the card
    assert "Bxd1" not in card.movetext


def test_unsupported_variant():
    ch = chapter('[Variant "Chess960"]\n[FEN "bbqnnrkr/pppppppp/8/8/8/8/PPPPPPPP/BBQNNRKR w HFhf - 0 1"]\n\n1. e4 *\n')
    assert ch.kind == KIND_UNSUPPORTED
    assert chapter('[Variant "From Position"]\n[FEN "8/8/8/8/8/8/k7/R6K w - - 0 1"]\n\n1. Ra1+ *\n').kind == "exercise"


def test_pgn_without_chapter_url_gets_a_stable_id():
    text = '[White "Tal"]\n[Black "X"]\n[Result "1-0"]\n\n1. e4 { a } e5 (1... c5) 2. Qh5 1-0\n'
    ch = chapter(text)
    assert ch.dedupe_key.startswith("pgn/")
    assert f'[AnkiChessId "{ch.dedupe_key}"]' in ch.pgn()
    # Editing comments or variations keeps the id; another game gets another one
    assert chapter(text.replace("{ a }", "{ outro }").replace("(1... c5)", "")).dedupe_key == ch.dedupe_key
    assert chapter(text.replace("Qh5", "Nf3")).dedupe_key != ch.dedupe_key
    assert ch.note_tags[:2] == ["pgn", "pgn::game"]


def test_tag_part():
    assert decks.tag_part("#C105 - Siciliana O'Kelly: Outras opções") == "#C105_-_Siciliana_O'Kelly:_Outras_opções"
    assert decks.tag_part('  "Aspas" e * estrela  ') == "Aspas_e_estrela"
    assert decks.tag_part("Nível::Dentro:") == "Nível:Dentro"
    assert decks.tag_part("Capítulo\t1") == "Capítulo_1"  # decomposed accent, tab


def test_chapter_tags_from_lichess_tags():
    ch = chapter(
        '[StudyName "#MT197 - Exercícios"]\n[ChapterName "Exercício - Meio-jogo"]\n'
        '[ECO "B30"]\n[Opening "Sicilian Defense: Nyezhmetdinov-Rossolimo Attack"]\n'
        '[FEN "4k3/8/8/8/8/8/8/R3K3 w - - 0 1"]\n\n1. Ra8# *\n'
    )
    assert decks.chapter_tags(ch, "exercise") == [
        "estudo::#MT197_-_Exercícios::Exercício_-_Meio-jogo",
        "abertura::Sicilian_Defense::Nyezhmetdinov-Rossolimo_Attack",
        "eco::B30",
    ]
    # Unknown opening ("?") gives no tag
    unknown = chapter('[Opening "?"]\n[ECO "?"]\n[FEN "4k3/8/8/8/8/8/8/R3K3 w - - 0 1"]\n\n1. Ra8# *\n')
    assert decks.chapter_tags(unknown, "exercise") == ["estudo::Estudo"]
