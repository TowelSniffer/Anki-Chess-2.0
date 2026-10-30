"""
"New card with this PGN", in the export menu on the back of an AnkiChess card.

The template sends the game with the analysis made on the back (as "Copy PGN" copies
it); Anki's Add window opens with it, with the note type, deck and tags of the card
being reviewed, to be checked and added like any other note.
"""

from __future__ import annotations

import json

import aqt
from aqt import mw
from aqt.utils import showWarning

from . import anki_ops
from .i18n import tr
from .note_info import analysis_text
from .pgn_field import pgn_to_field
from .ui_common import get_config

MESSAGE = "ankiChessImporter:newNote:"
# Tells the template the add-on is here, so its menu offers "New card with this PGN"
FLAG_SCRIPT = "<script>window.ANKI_CHESS_IMPORTER = 1;</script>"


def add_flag(web_content, context) -> None:
    web_content.head += FLAG_SCRIPT


def on_js_message(handled, message, context):
    if not isinstance(message, str) or not message.startswith(MESSAGE):
        return handled
    try:
        payload = json.loads(message[len(MESSAGE) :])
    except json.JSONDecodeError:
        return (True, None)
    card = getattr(context, "card", None)
    if callable(card):  # the previewers have a card() method, the reviewer an attribute
        card = card()
    open_new_note(payload.get("pgn", ""), card)
    return (True, None)


def _note_type(source: dict | None) -> dict | None:
    """The card's own note type: the PGN starts where it does, so you play the same side."""
    if source and anki_ops.is_chess_note_type(source):
        return source
    return anki_ops.default_base(get_config().get("base_note_type", ""))


def open_new_note(pgn: str, card=None) -> None:
    col = mw.col
    source = card.note() if card else None
    note_type = _note_type(source.note_type() if source else None)
    if not pgn or not note_type:
        showWarning(tr("analysis.no_note_type"))
        return

    note = col.new_note(note_type)
    source_text = source.fields[1] if source and len(source.fields) > 1 else ""
    note.fields[0] = pgn_to_field(pgn)
    if len(note.fields) > 1:
        note.fields[1] = analysis_text(source_text)
    if source:
        note.tags = list(source.tags)

    # A card studied in a filtered deck goes back to its home deck
    deck_id = (card.odid or card.did) if card else None
    add_cards = aqt.dialogs.open("AddCards", mw)
    add_cards.set_note(note, deck_id)
