"""
Text field of the imported notes: the names, then what the PGN tells about the
chapter (opening, players, author, source game), then the link.

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

import html
import re

from .i18n import tr
from .pgn_split import Chapter

LICHESS_GAME_RE = re.compile(r"^https?://lichess\.org/([A-Za-z0-9]{8})(?:[A-Za-z0-9]{4})?/?$")
LICHESS_USER_RE = re.compile(r"^https?://lichess\.org/@/([\w-]+)$")
UNKNOWN = ("", "?", "-", "????.??.??")


def _tag(ch: Chapter, name: str) -> str:
    value = ch.tags.get(name, "").strip()
    return "" if value in UNKNOWN else value


def _link(url: str, text: str) -> str:
    return f'<a href="{html.escape(url)}">{html.escape(text)}</a>'


def _player(ch: Chapter, color: str) -> str:
    name, elo = _tag(ch, color), _tag(ch, f"{color}Elo")
    return f"{name} ({elo})" if name and elo else name


def source_game_url(ch: Chapter) -> str:
    """Lichess game the chapter was made from ([GameId], or a game [Site])."""
    game_id = _tag(ch, "GameId")
    if re.fullmatch(r"[A-Za-z0-9]{8}", game_id):
        return f"https://lichess.org/{game_id}"
    m = LICHESS_GAME_RE.match(_tag(ch, "Site"))
    return f"https://lichess.org/{m.group(1)}" if m else ""


def chapter_details(ch: Chapter) -> list[str]:
    """HTML lines about the chapter, each one only when the PGN has it."""
    lines = []
    opening = " ".join(filter(None, [_tag(ch, "ECO"), _tag(ch, "Opening")]))
    if opening:
        lines.append(f"{tr('info.opening')}: {html.escape(opening)}")
    white, black = _player(ch, "White"), _player(ch, "Black")
    if white and black:
        lines.append(f"{html.escape(white)} – {html.escape(black)}")
    event = " · ".join(filter(None, [_tag(ch, "Event"), _tag(ch, "Date")]))
    if event and white and black and _tag(ch, "Event") != ch.name:
        lines.append(html.escape(event))
    author = LICHESS_USER_RE.match(_tag(ch, "Annotator"))
    if author:
        lines.append(f"{tr('info.author')}: {_link(_tag(ch, 'Annotator'), author.group(1))}")
    game = source_game_url(ch)
    if game:
        lines.append(_link(game, tr("info.game")))
    return lines


def analysis_text(source_text: str) -> str:
    """Text field of a card made from the analysis on the back of another one."""
    caption = f"<i>{tr('analysis.caption')}</i>"
    return f"{source_text}<br>{caption}" if source_text.strip() else caption
