"""
Line breaks of the PGN field, as read by the AnkiChess template.

The template reads the field with {{text:PGN}}, and Anki's text filter drops <br>
without leaving a space: a PGN pasted in the editor with wrapped lines (as Chess.com
exports it) reaches the board glued together ("22. Qg3<br>b5" -> "Qg3b5",
"[%c_effect<br>a4;..." -> "[%c_effecta4;...") and fails to parse. A space before
each line break keeps the tokens apart, as the importers already write the field.

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

import html
import re

# Line break or block tag right after text: {{text:PGN}} would glue both sides
_GLUED_BREAK = re.compile(r"(?<=\S)(?=<(?:br|/?div|/?p)\b)", re.IGNORECASE)
# The same, as an Anki search (regexes match the raw field HTML)
GLUED_BREAK_SEARCH = r'"PGN:re:\S<(br|/?div|/?p)\b"'

_PGN_ELEMENT = re.compile(r'(<div id="anki-pgn"[^>]*>)(.*?)(</div>)', re.DOTALL)


def has_glued_breaks(field: str) -> bool:
    return bool(_GLUED_BREAK.search(field))


def space_line_breaks(field: str) -> str:
    """Field HTML with a space before each line break that follows text."""
    return _GLUED_BREAK.sub(" ", field)


def field_text(field: str) -> str:
    """Text of the field like {{text:PGN}}, but keeping its line breaks."""
    text = re.sub(r"<(?:br|div|p)\b[^>]*>", "\n", field, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]*>", "", text)
    return html.unescape(text).replace("\xa0", " ")


def show_line_breaks(card_html: str, field: str) -> str:
    """Rendered card whose hidden PGN element holds the field text with its line breaks."""
    return _PGN_ELEMENT.sub(
        lambda m: m.group(1) + html.escape(field_text(field), quote=False) + m.group(3),
        card_html,
        count=1,
    )


def pgn_to_field(pgn: str, keep_lines: bool = False) -> str:
    """
    A PGN as the importers write the field: escaped text with <br> line breaks, each
    after a space so the lines stay apart once {{text:PGN}} drops the <br>. keep_lines
    adds a newline after each <br>: {{text:PGN}} keeps it, so the template reads the
    comment's lines (the plans of a structure).
    """
    escaped = html.escape(pgn, quote=False).rstrip("\n")
    return escaped.replace("\n", " <br>\n" if keep_lines else " <br>")
