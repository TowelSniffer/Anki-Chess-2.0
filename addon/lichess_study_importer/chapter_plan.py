"""
How a Lichess chapter is imported: whether the import window checks it when it loads
the study, and the cards made from it, with their note type's mode and their deck. The
import window and the update of the imported studies (study_updater, for the chapters
added on Lichess since the study was imported) share it.

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

from . import decks, expand
from .pgn_split import KIND_EXERCISE, KIND_GAME, KIND_LINE, KIND_STRUCTURE, Chapter, mode_for
from .structures import StructureCard

CHECKED_KINDS = (KIND_EXERCISE, KIND_LINE, KIND_STRUCTURE)  # full games with include_games


def checked_by_default(kind: str, include_games: bool) -> bool:
    """Whether the import window checks a chapter of this kind when it loads it."""
    return kind in CHECKED_KINDS or (kind == KIND_GAME and include_games)


def chapter_cards(
    ch: Chapter,
    kind: str,
    side: str | None,
    split_lines: bool,
    key_moves: bool,
    strip_anno: bool,
    cache: dict | None = None,
) -> list[tuple[object, bool]]:
    """
    (card, is a key move card) imported from a chapter: a structure rebuilt from a side,
    one card per branch of an opening line with split_lines, a full game and its "find the
    move" cards with key_moves, else the chapter itself. cache keeps the branches and key
    moves found (the import window's row cache).
    """
    cache = {} if cache is None else cache
    if kind == KIND_STRUCTURE:
        return [(StructureCard(ch, side or ch.side_to_move), False)]
    if kind == KIND_LINE and split_lines:
        if "split" not in cache:
            cache["split"] = expand.split_variations(ch, strip_anno)
        return [(card, False) for card in cache["split"]]
    cards = [(ch, False)]
    if kind == KIND_GAME and key_moves:
        if "key_moves" not in cache:
            cache["key_moves"] = expand.key_move_cards(ch, strip_anno)
        cards += [(card, True) for card in cache["key_moves"]]
    return cards


def default_cards(
    ch: Chapter,
    root: str,
    study_deck: str,
    subdeck: str | None,
    split_lines: bool,
    key_moves: bool,
    strip_anno: bool,
) -> list[tuple[object, str | None, decks.Placement]]:
    """
    (card, note type mode, placement) of a chapter imported with the import window's
    choices left as it suggests them: its kind and your side from Lichess, the note type
    of their mode, the study deck and the kind's subdeck (subdeck: the one renamed for the
    chapter). Mode None is the base note type: a structure is rebuilt from your side
    whatever the note type.
    """
    kind = decks.suggest_kind(ch)
    side = (ch.player or ch.side_to_move) if kind == KIND_STRUCTURE else ch.player
    mode = None if kind == KIND_STRUCTURE else mode_for(side, ch.side_to_move)
    placement = decks.place_chapter(ch, root, kind=kind, deck=study_deck, subdeck=subdeck)
    # Played from your side of the game: their note type follows the card
    key_placement = decks.Placement(decks.key_move_deck(study_deck), placement.tags)
    return [
        (card, card.suggested_mode, key_placement) if key_move else (card, mode, placement)
        for card, key_move in chapter_cards(ch, kind, side, split_lines, key_moves, strip_anno)
    ]
