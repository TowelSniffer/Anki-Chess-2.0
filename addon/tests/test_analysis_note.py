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

from lsi import i18n  # noqa: E402
from lsi.note_info import analysis_text  # noqa: E402
from lsi.pgn_field import field_text, pgn_to_field  # noqa: E402
from lsi.pgn_split import split_games  # noqa: E402

# "Copy PGN" / "New card with this PGN" of the template
ANALYSIS_PGN = """[Event "WCh26 m"]
[White "Spassky, Boris V"]
[Black "Petrosian, Tigran V"]
[Result "0-1"]
[ChapterURL "https://lichess.org/study/abcdefgh/ijklmnop"]
[FEN "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"]
[SetUp "1"]
[AnkiChessId "analysis/1a2b3c4d"]

2. Nf3 (2. Nc3 Nc6) 2... d6 0-1"""


@pytest.fixture(autouse=True)
def reset_language():
    yield
    i18n.set_language(i18n.DEFAULT_LANGUAGE)


def test_text_keeps_the_card_text_and_marks_the_analysis():
    i18n.set_language("pt-BR")
    text = analysis_text("<h3>Spassky - Petrosian</h3>")
    assert text == "<h3>Spassky - Petrosian</h3><br><i>Com a sua análise</i>"


def test_text_without_a_card_text():
    assert analysis_text("") == "<i>With your analysis</i>"
    assert analysis_text("  ") == "<i>With your analysis</i>"


def test_field_has_a_space_before_each_line_break():
    field = pgn_to_field(ANALYSIS_PGN + "\n")
    assert '[Event "WCh26 m"] <br>[White' in field
    assert field.endswith("0-1")
    assert field_text(field).replace(" \n", "\n") == ANALYSIS_PGN


def test_importer_keys_the_analysis_by_its_own_id_not_by_the_chapter():
    (chapter,) = split_games(ANALYSIS_PGN)
    assert chapter.dedupe_key == "analysis/1a2b3c4d"
    # Without the id it would be taken for the chapter it comes from
    (without_id,) = split_games(ANALYSIS_PGN.replace('[AnkiChessId "analysis/1a2b3c4d"]\n', ""))
    assert without_id.dedupe_key == "study/abcdefgh/ijklmnop"
