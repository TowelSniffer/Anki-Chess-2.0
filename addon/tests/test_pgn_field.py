import html
import os
import re
import sys
import types

HERE = os.path.dirname(__file__)
ADDON_DIR = os.path.join(HERE, "..", "lichess_study_importer")

# Load the add-on modules as a package without running __init__ (it needs aqt)
if "lsi" not in sys.modules:
    pkg = types.ModuleType("lsi")
    pkg.__path__ = [ADDON_DIR]
    sys.modules["lsi"] = pkg

from lsi.pgn_field import (  # noqa: E402
    field_text,
    has_glued_breaks,
    pgn_to_field,
    show_line_breaks,
    space_line_breaks,
)

# Chess.com export wrapped at 80 columns, as the Anki editor stores it when pasted
PASTED = (
    "21. c3 Qxa4 $2 {[%c_effect<br>a4;square;a4;type;Mistake;size;100%25]} 22. Qg3<br>"
    "b5 $2 {[%c_effect<br>b5;square;b5;type;Mistake]} 23. d5<br>cxd5 1-0"
)


def text_filter(field: str) -> str:
    """What Anki's {{text:PGN}} gives the template: tags dropped, entities decoded."""
    return html.unescape(re.sub(r"<[^>]*>", "", field))


def test_text_filter_glues_wrapped_lines():
    assert "Qg3b5" in text_filter(PASTED)
    assert "[%c_effecta4;" in text_filter(PASTED)


def test_spaced_line_breaks_survive_the_text_filter():
    fixed = space_line_breaks(PASTED)
    assert has_glued_breaks(PASTED) and not has_glued_breaks(fixed)
    assert "22. Qg3 b5 $2" in text_filter(fixed)
    assert "[%c_effect a4;" in text_filter(fixed)
    assert "23. d5 cxd5" in text_filter(fixed)
    assert space_line_breaks(fixed) == fixed  # idempotent


def test_editor_blocks_and_importer_fields():
    assert text_filter(space_line_breaks("1. e4<div>e5</div><div>2. Nf3</div>")).split() == [
        "1.", "e4", "e5", "2.", "Nf3",
    ]
    # The importers already write a space before each <br>
    imported = '[Event "x"] <br> <br>1. e4 e5 *'
    assert not has_glued_breaks(imported)
    assert space_line_breaks(imported) == imported


def test_structure_fields_keep_their_lines_through_the_text_filter():
    pgn = '[FEN "8/8/8/8/8/8/8/8 w - - 0 1"]\n\n{ Plano das brancas:\n1. b5 }\n*\n'
    # Other notes: the lines are only <br>, gone in the template
    assert text_filter(pgn_to_field(pgn)) == '[FEN "8/8/8/8/8/8/8/8 w - - 0 1"]  { Plano das brancas: 1. b5 } *'
    # Structures: a newline after each <br>, which {{text:PGN}} keeps (checked in Anki 26.9.3)
    field = pgn_to_field(pgn, keep_lines=True)
    assert "Plano das brancas: <br>\n1. b5" in field
    assert "Plano das brancas: \n1. b5" in text_filter(field)
    assert not has_glued_breaks(field)


def test_field_text_keeps_line_breaks():
    assert field_text("22. Qg3<br>b5 {A &amp; B&nbsp;&lt;!&gt;}") == "22. Qg3\nb5 {A & B <!>}"


def test_show_line_breaks_in_rendered_card():
    card = (
        '<script>x</script><div id="anki-pgn" style="display: none;">'
        + html.escape(text_filter(PASTED), quote=False)
        + '</div><div id="anki-textField">t</div>'
    )
    shown = show_line_breaks(card, PASTED)
    pgn = re.search(r'<div id="anki-pgn"[^>]*>(.*?)</div>', shown, re.S).group(1)
    assert html.unescape(pgn).startswith("21. c3 Qxa4 $2 {[%c_effect\na4;")
    assert "22. Qg3\nb5" in html.unescape(pgn)
    assert shown.endswith('<div id="anki-textField">t</div>')
