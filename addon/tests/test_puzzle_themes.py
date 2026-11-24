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

from lsi import i18n, puzzle_themes  # noqa: E402


@pytest.fixture(autouse=True)
def english_after():
    yield
    i18n.set_language(i18n.DEFAULT_LANGUAGE)


def test_theme_names_in_both_languages():
    i18n.set_language("en")
    keys = ["mateIn1", "backRankMate", "middlegame"]
    assert puzzle_themes.theme_names(keys) == "Mate in 1, Back rank mate, Middlegame"
    i18n.set_language("pt-BR")
    assert puzzle_themes.theme_names(keys) == "Mate em 1, Mate do corredor, Meio-jogo"


def test_a_theme_lichess_added_later_reads_as_words():
    assert puzzle_themes.theme_name("doubleRookMate") == "Double rook mate"
    assert puzzle_themes.theme_name("mateIn6") == "Mate in 6"


def test_every_theme_has_both_names():
    for key, names in puzzle_themes.THEMES.items():
        assert len(names) == 2 and all(n.strip() for n in names), key


def test_puzzle_stats_by_theme():
    tags = [
        " lichess lichess::puzzle lichess::puzzle::failed lichess::puzzle::theme::fork lichess::puzzle::theme::short ",
        " lichess lichess::puzzle lichess::puzzle::solved lichess::puzzle::theme::fork my_tag ",
        " lichess lichess::puzzle lichess::puzzle::solved lichess::puzzle::theme::mateIn1 ",
        " lichess lichess::study::abcdefgh ",  # not a puzzle
    ]
    total, failed, themes = puzzle_themes.puzzle_stats(tags)
    assert (total, failed) == (3, 1)
    assert themes == {"fork": [2, 1], "short": [1, 1], "mateIn1": [1, 0]}


def test_theme_search():
    assert puzzle_themes.theme_search("fork", False) == "tag:lichess::puzzle::theme::fork"
    assert puzzle_themes.theme_search("fork", True) == "tag:lichess::puzzle::theme::fork tag:lichess::puzzle::failed"
