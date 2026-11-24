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

from lsi import decks, i18n  # noqa: E402
from lsi.pgn_split import (  # noqa: E402
    ID_TAG,
    KIND_EMPTY,
    KIND_EXERCISE,
    KIND_LINE,
    KIND_STRUCTURE,
    MODE_PUZZLE,
    Chapter,
    split_games,
)
from lsi.structures import StructureCard, stored_side  # noqa: E402

# Chapters of https://lichess.org/study/w7B3QmIi (Siciliana O'Kelly)
with open(os.path.join(HERE, "fixtures", "okelly_structures.pgn"), encoding="utf-8") as f:
    CHAPTERS = {ch.name: ch for ch in split_games(f.read())}

NAJDORF = CHAPTERS["Estrutura I (Najdorf)"]
HEDGEHOG = CHAPTERS["Estrutura IV (Porco-espinho)"]


@pytest.fixture(autouse=True)
def portuguese():
    i18n.set_language("pt-BR")
    yield
    i18n.set_language(i18n.DEFAULT_LANGUAGE)


# --- Classification ---


def test_a_fen_with_no_moves_is_a_structure():
    kinds = {name: ch.kind for name, ch in CHAPTERS.items()}
    assert kinds == {
        "Introdução": KIND_LINE,
        "Estrutura I (Najdorf)": KIND_STRUCTURE,
        "Estrutura III (PDI/Alapin)": KIND_STRUCTURE,  # no comment: no plans, still a structure
        "Estrutura IV (Porco-espinho)": KIND_STRUCTURE,  # pieces too
        "Estrutura V (Botvinnik)": KIND_STRUCTURE,  # a gamebook chapter, with a game's tags
        "Exercício - avanço e5": KIND_EXERCISE,
    }
    assert Chapter(tags={}, movetext="{ Pratique mais nos links }").kind == KIND_EMPTY  # no FEN


def test_structure_side_and_key():
    assert NAJDORF.player == "b"  # [Orientation "black"]
    assert NAJDORF.dedupe_key == "study/w7B3QmIi/3CY8U1bO"
    # From a file, without a chapter URL: keyed by its position
    ch = Chapter(tags={"FEN": "8/1p3ppp/p2p4/4p3/4P3/8/PPP2PPP/8 w - - 0 1"}, movetext="*")
    assert ch.dedupe_key.startswith("pgn/")


def test_comment_text_keeps_the_plans_without_commands():
    text = NAJDORF.comment_text
    assert text.startswith("Nessa estrutura, todos os planos")
    assert "Plano das brancas:\n1. Colocar um cavalo em d5" in text
    assert "\n\nPlano das pretas:\n1. Quebra o centro" in text
    assert CHAPTERS["Estrutura III (PDI/Alapin)"].comment_text == ""

    ch = Chapter(
        tags={"FEN": "8/8/8/8/8/8/8/8 w - - 0 1"},
        movetext='{ [%anno "basso01", basso01] [%csl Gd5][%cal Gb7b5] Plano:\n1. b5 }\n *',
    )
    assert ch.comment_text == "Plano:\n1. b5"


# --- The note: an AnkiChess card that rebuilds your side ---


def test_the_pgn_tells_the_template_it_is_a_structure():
    pgn = StructureCard(NAJDORF, "b").pgn()
    assert '[AnkiChessMode "structure"]' in pgn
    assert '[Orientation "black"]' in pgn and pgn.count("[Orientation ") == 1
    assert f'[{ID_TAG} "study/w7B3QmIi/3CY8U1bO"]' in pgn
    assert '[FEN "8/1p3ppp/p2p4/4p3/4P3/8/PPP2PPP/8 w - - 0 1"]' in pgn
    # The plans stay in the comment, for the back side; the annotator markers don't
    assert "Plano das brancas:" in pgn
    assert "[%anno" not in pgn


def test_your_side_is_written_and_read_back():
    pgn = StructureCard(NAJDORF, "w").pgn()
    assert '[Orientation "white"]' in pgn
    assert stored_side(pgn) == "w"
    assert stored_side(StructureCard(HEDGEHOG, "b").pgn()) == "b"
    assert stored_side("1. e4 e5 *") is None
    # The chapter itself is left as it was
    assert NAJDORF.tags["Orientation"] == "black" and "AnkiChessMode" not in NAJDORF.tags


def test_the_card_is_the_chapter_otherwise():
    card = StructureCard(NAJDORF, "b")
    assert card.is_structure and card.mode == MODE_PUZZLE
    assert card.dedupe_key == NAJDORF.dedupe_key == StructureCard(NAJDORF, "w").dedupe_key
    assert card.name == "Estrutura I (Najdorf)"
    assert card.study_name == "QUICKSTART - Siciliana O'kelly"
    assert card.chapter_url == "https://lichess.org/study/w7B3QmIi/3CY8U1bO"
    assert card.link_label == "Lichess"
    assert any("basso01" in line for line in card.details)  # the annotator


def test_structures_go_to_their_own_subdeck():
    place = decks.place_chapter(NAJDORF, "Xadrez", kind=KIND_STRUCTURE)
    assert place.deck == "Xadrez::QUICKSTART - Siciliana O'kelly::Estruturas"
    assert "estudo::QUICKSTART_-_Siciliana_O'kelly::Estrutura_I_(Najdorf)" in place.tags
    assert StructureCard(NAJDORF, "b").note_tags[:2] == ["lichess", "lichess::structure"]


def load_anki_ops(monkeypatch):
    """anki_ops with stand-ins for anki and aqt, which the tests don't install."""
    stubs = {
        "anki": {},
        "anki.collection": {"AddNoteRequest": object},
        "anki.utils": {"ids2str": str},
        "aqt": {"mw": None},
    }
    for name, attrs in stubs.items():
        if name not in sys.modules:
            monkeypatch.setitem(sys.modules, name, types.SimpleNamespace(**attrs))
    from lsi import anki_ops

    return anki_ops


def test_structures_need_a_template_that_rebuilds_them(tmp_path, monkeypatch):
    anki_ops = load_anki_ops(monkeypatch)
    col = types.SimpleNamespace(media=types.SimpleNamespace(dir=lambda: str(tmp_path)))
    note_type = {"tmpls": [{"qfmt": '<script src="./_ankiChess1.3.00.js"></script>'}]}
    script = tmp_path / "_ankiChess1.3.00.js"

    assert not anki_ops.builds_structures(col, note_type)  # script missing from the media
    script.write_text("mountChess();")
    assert not anki_ops.builds_structures(col, note_type)  # a template without structures
    script.write_text('if (tags.AnkiChessMode?.toLowerCase() === "structure") mountStructure();')
    assert anki_ops.builds_structures(col, note_type)
    assert not anki_ops.builds_structures(col, None)  # no AnkiChess note type
