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

from lsi import chesscom, decks, game_analysis as ga, i18n  # noqa: E402
from lsi.chess_lib import chess  # noqa: E402
from lsi.pgn_split import split_games  # noqa: E402


@pytest.fixture(autouse=True)
def portuguese():
    i18n.set_language("pt-BR")
    yield
    i18n.set_language(i18n.DEFAULT_LANGUAGE)


def test_root_name():
    assert decks.root_name("") == "Xadrez"
    assert decks.root_name(None) == "Xadrez"
    assert decks.root_name("  Meu::Xadrez  ") == "Meu: Xadrez"  # one level only
    i18n.set_language("en")
    assert decks.root_name("") == "Chess"


def test_opening_placement():
    p = decks.opening_placement("Xadrez", "Slav Defense: Czech Variation, Carlsbad Variation")
    assert p.deck == "Xadrez::Aberturas::Slav Defense"
    assert p.tags == ["abertura::Slav_Defense::Czech_Variation"]
    p = decks.opening_placement("Xadrez", "Queen's Gambit Declined")
    assert p.deck == "Xadrez::Aberturas::Queen's Gambit Declined"
    assert p.tags == ["abertura::Queen's_Gambit_Declined"]
    assert decks.opening_placement("Xadrez", None).deck == "Xadrez::Aberturas::Outras"


def test_lichess_chapters():
    text = (
        '[StudyName "O\'Kelly: curso"]\n[ChapterName "Linha"]\n[Result "*"]\n\n1. e4 c5 2. Nf3 a6 3. d4 *\n\n'
        '[StudyName "O\'Kelly: curso"]\n[ChapterName "Partida"]\n[Result "1-0"]\n\n1. e4 c5 2. Nf3 a6 1-0\n\n'
        '[StudyName "O\'Kelly: curso"]\n[ChapterName "Exercício"]\n'
        '[FEN "4k3/8/8/8/8/8/8/R3K3 w - - 0 1"]\n[SetUp "1"]\n\n1. Ra8# *\n'
    )
    line, game, exercise = split_games(text)
    # One deck per study, split by chapter kind
    assert decks.place_chapter(line, "Xadrez").deck == "Xadrez::O'Kelly: curso::Linhas de abertura"
    assert decks.place_chapter(line, "Xadrez").tags == [
        "estudo::O'Kelly:_curso::Linha",
        "abertura::Sicilian_Defense::O'Kelly_Variation",
    ]
    assert decks.place_chapter(game, "Xadrez").deck == "Xadrez::O'Kelly: curso::Partidas comentadas"
    assert decks.place_chapter(exercise, "Xadrez").deck == "Xadrez::O'Kelly: curso::Táticas"
    # The kind chosen in the dialog wins over the detected one
    assert decks.place_chapter(game, "Xadrez", kind="line").deck == "Xadrez::O'Kelly: curso::Linhas de abertura"


def test_clean_deck_name():
    # As Anki stores it: trimmed levels, no control characters; empty levels are dropped
    # here (Anki would name them "blank")
    assert decks.clean_deck_name("  Xadrez ::  Cursos  :: Siciliana  ") == "Xadrez::Cursos::Siciliana"
    assert decks.clean_deck_name("Xadrez::::Vazio::") == "Xadrez::Vazio"
    assert decks.clean_deck_name("::Início") == "Início"
    assert decks.clean_deck_name("Tab\taqui") == "Tabaqui"
    assert decks.clean_deck_name("O'Kelly: Outras opções") == "O'Kelly: Outras opções"  # one colon stays
    assert decks.clean_deck_name(" :: ") == ""


def test_renamed_study_deck_and_subdeck():
    ch = split_games('[StudyName "Curso"]\n[Result "1-0"]\n\n1. e4 e5 1-0\n')[0]
    assert decks.place_chapter(ch, "Xadrez", deck="Cursos :: Curso").deck == "Cursos::Curso::Partidas comentadas"
    assert decks.place_chapter(ch, "Xadrez", subdeck="Partidas::Tal").deck == "Xadrez::Curso::Partidas::Tal"
    # Empty subdeck: the study deck itself
    assert decks.place_chapter(ch, "Xadrez", subdeck="").deck == "Xadrez::Curso"
    # An empty study deck falls back to the default
    assert decks.place_chapter(ch, "Xadrez", deck=" :: ").deck == "Xadrez::Curso::Partidas comentadas"


def test_study_name_fallbacks():
    ch = split_games('[FEN "4k3/8/8/8/8/8/8/R3K3 w - - 0 1"]\n[SetUp "1"]\n\n1. Ra8# *\n')[0]
    assert decks.place_chapter(ch, "Xadrez", fallback_study="pl05c").deck == "Xadrez::pl05c::Táticas"
    assert decks.place_chapter(ch, "Xadrez").deck == "Xadrez::Estudo::Táticas"


def test_fen_chapter_from_a_book_position_is_an_opening_line():
    # After 1. e4 c5 2. Nf3 a6: an opening course chapter set up from a FEN
    fen = "rnbqkbnr/1p1ppppp/p7/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3"
    ch = split_games(f'[StudyName "Curso"]\n[FEN "{fen}"]\n[SetUp "1"]\n\n3. c3 d5 *\n')[0]
    assert ch.kind == "exercise"
    assert decks.suggest_kind(ch) == "line"
    assert decks.place_chapter(ch, "Xadrez").deck == "Xadrez::Curso::Linhas de abertura"

    tactic = split_games('[FEN "4k3/8/8/8/8/8/8/R3K3 w - - 0 1"]\n[SetUp "1"]\n\n1. Ra8# *\n')[0]
    assert decks.suggest_kind(tactic) == "exercise"


def test_chesscom_cards():
    with open(os.path.join(HERE, "fixtures", "chesscom_review.pgn"), encoding="utf-8") as f:
        game = chesscom.read_game(f.read())
    cards = ga.analyze_game(game, ga.AnalysisOptions(chess.WHITE))
    placements = {c.name: decks.place_game_card(c, "Xadrez") for c in cards}
    assert placements["Abertura: Slav Defense: Modern Line"].deck == "Xadrez::Aberturas::Slav Defense"
    # Each book line goes to the family of its own name, not of the game
    anti_moscow = placements["Linha de livro: Semi-Slav Defense: Anti-Moscow Gambit"]
    assert anti_moscow.deck == "Xadrez::Aberturas::Semi-Slav Defense"
    assert anti_moscow.tags == ["abertura::Semi-Slav_Defense::Anti-Moscow_Gambit"]

    error = ga.GameCard(ga.KIND_BLUNDER, 36, "flipped", "", "", "", "k", [], "", "", "", "")
    assert decks.place_game_card(error, "Xadrez").deck == "Xadrez::Minhas partidas::Capivaradas"


def test_every_error_kind_has_a_deck_name():
    for lang in i18n.STRINGS:
        for kind in ga.ENGINE_KINDS:
            assert f"deck.kind.{kind}" in i18n.STRINGS[lang]


def test_study_deck_follows_where_its_notes_are():
    study = "Chess::Treinamento Rating Evolution::#C99 - Siciliana O'kelly"
    # Its kinds' subdecks (in either language) are left out
    assert decks.study_deck_of([f"{study}::Táticas", f"{study}::Estruturas", f"{study}::Tactics"]) == study
    # Cards moved apart: the deck most of them are in
    assert decks.study_deck_of([f"{study}::Táticas", f"{study}::Táticas", "Outro::Táticas"]) == study
    # A deck that isn't a kind's subdeck is the study deck itself
    assert decks.study_deck_of(["Chess::Minha pasta"]) == "Chess::Minha pasta"
    assert decks.study_deck_of(["Tactics"]) == "Tactics"  # a top-level deck stays
    assert decks.study_deck_of([]) is None
