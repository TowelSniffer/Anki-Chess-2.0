"""How a chapter is imported when its choices are left as the import window suggests them."""

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

from lsi import chapter_plan, decks, i18n  # noqa: E402
from lsi.pgn_split import (  # noqa: E402
    KIND_EXERCISE,
    KIND_GAME,
    KIND_LINE,
    KIND_STRUCTURE,
    MODE_FLIPPED,
    MODE_PUZZLE,
    MODE_STUDY,
    split_games,
)
from lsi.structures import StructureCard  # noqa: E402

ROOT = "Xadrez"
DECK = "Xadrez::Cursos::#PL09"


@pytest.fixture(autouse=True)
def portuguese():
    i18n.set_language("pt-BR")
    yield
    i18n.set_language(i18n.DEFAULT_LANGUAGE)


def chapter(tags: str, movetext: str):
    return split_games(f'[StudyName "#PL09"]\n[ChapterURL "https://lichess.org/study/JuvogA4P/AbCdEfGh"]\n{tags}\n\n{movetext}\n')[0]


EXERCISE = (
    '[ChapterName "Exercício 6"]\n[Orientation "white"]\n'
    '[FEN "r1b1r1k1/bp3ppn/p1pp1qnp/4p3/3PP3/1BP2NNP/PP1B1PP1/R1Q1R1K1 w - - 6 16"]\n[SetUp "1"]'
)


def test_checked_by_default():
    assert all(chapter_plan.checked_by_default(k, False) for k in (KIND_EXERCISE, KIND_LINE, KIND_STRUCTURE))
    assert not chapter_plan.checked_by_default(KIND_GAME, False)
    assert chapter_plan.checked_by_default(KIND_GAME, True)


def test_exercise_in_the_study_deck():
    ch = chapter(EXERCISE, "16. Nh5 Qe7 17. Bxh6 gxh6 *")
    [(card, mode, placement)] = chapter_plan.default_cards(ch, ROOT, DECK, None, True, True, True)
    # You play White and move first: the puzzle note type
    assert card is ch and mode == MODE_PUZZLE
    assert placement.deck == f"{DECK}::Táticas"
    assert placement.tags == ["estudo::#PL09::Exercício_6"]
    # The opponent moves first: Flipped; a subdeck renamed for the chapter is kept
    ch = chapter(EXERCISE.replace(" w - - 6 16", " b - - 6 16"), "16... Qe7 17. Nh5 *")
    [(_, mode, placement)] = chapter_plan.default_cards(ch, ROOT, DECK, "Novos", False, False, True)
    assert mode == MODE_FLIPPED and placement.deck == f"{DECK}::Novos"


def test_line_split_by_the_last_import():
    ch = chapter('[ChapterName "Siciliana"]\n[Result "*"]', "1. e4 c5 2. Nf3 (2. c3 d5) 2... d6 *")
    [(whole, mode, placement)] = chapter_plan.default_cards(ch, ROOT, DECK, None, False, False, True)
    assert whole is ch and mode == MODE_STUDY and placement.deck == f"{DECK}::Linhas de abertura"
    split = chapter_plan.default_cards(ch, ROOT, DECK, None, True, False, True)
    assert [card.name for card, _, _ in split] == ["Siciliana (1/2): linha principal", "Siciliana (2/2): 2. c3 d5"]
    assert {(mode, placement.deck) for _, mode, placement in split} == {(MODE_STUDY, f"{DECK}::Linhas de abertura")}


def test_game_with_its_key_moves():
    ch = chapter(
        '[ChapterName "Tal - X"]\n[Result "1-0"]',
        "1. e4 e5 2. Nf3 Nc6 3. Bc4 d6 4. Nc3 Bg4 5. Nxe5! Bxd1 6. Bxf7+ Ke7 7. Nd5# 1-0",
    )
    assert chapter_plan.default_cards(ch, ROOT, DECK, None, False, False, True) == [
        (ch, MODE_STUDY, decks.Placement(f"{DECK}::Partidas comentadas", ["estudo::#PL09::Tal_-_X"]))
    ]
    game, key = chapter_plan.default_cards(ch, ROOT, DECK, None, False, True, True)
    assert game[0] is ch
    # The key move card: played from your side, in the study's key moves subdeck
    card, mode, placement = key
    assert card.name == "Tal - X: 5. Nxe5!" and mode == MODE_FLIPPED
    assert placement.deck == f"{DECK}::Lances das partidas" and placement.tags == game[2].tags


def test_structure_rebuilt_from_your_side():
    ch = chapter('[ChapterName "Estrutura"]\n[Orientation "black"]\n[FEN "4k3/pp3ppp/8/8/8/8/PP3PPP/4K3 w - - 0 1"]', "*")
    [(card, mode, placement)] = chapter_plan.default_cards(ch, ROOT, DECK, None, False, False, True)
    assert isinstance(card, StructureCard) and card.side == "b"
    assert mode is None and placement.deck == f"{DECK}::Estruturas"


def test_chapter_cards_keep_their_cache():
    ch = chapter('[ChapterName "Siciliana"]\n[Result "*"]', "1. e4 c5 2. Nf3 (2. c3 d5) 2... d6 *")
    cache = {}
    first = chapter_plan.chapter_cards(ch, KIND_LINE, None, True, False, True, cache)
    assert [card for card, _ in first] == cache["split"]
    assert chapter_plan.chapter_cards(ch, KIND_LINE, None, True, False, True, cache)[0][0] is first[0][0]
