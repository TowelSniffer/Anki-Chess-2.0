"""
Structure chapters (a [FEN] with no moves, often only pawns, with the plans of each side
in the comment) as AnkiChess notes: the card shows the opponent's pieces and you rebuild
yours on the board, from a palette (the template's structure card, src/components/
structure). The back shows the whole structure, your mistakes and the plans.

The note's PGN is the chapter's, with the side you rebuild as [Orientation] (shown at
the bottom) and [AnkiChessMode "structure"], which makes the template show it as a
structure. Importing again reads the side back from it, so a side changed in the import
window is kept.

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

import dataclasses
import re
from dataclasses import dataclass

from .note_info import chapter_details
from .pgn_split import MODE_PUZZLE, Chapter

MODE_TAG = "AnkiChessMode"
STRUCTURE_MODE = "structure"
ORIENTATIONS = {"w": "white", "b": "black"}
ORIENTATION_RE = re.compile(r'\[Orientation "(white|black)"\]', re.IGNORECASE)


def stored_side(pgn: str) -> str | None:
    """The side ("w"/"b") a structure note was imported for, from its PGN."""
    m = ORIENTATION_RE.search(pgn)
    return m.group(1)[0].lower() if m else None


@dataclass
class StructureCard:
    """A structure chapter, rebuilt from one side; everything else is the chapter's."""

    chapter: Chapter
    side: str  # "w"/"b": the side you rebuild, at the bottom of the board

    is_structure = True
    mode = MODE_PUZZLE  # the template ignores the side settings of the note type

    def __getattr__(self, name: str):
        # name, study_name, chapter_url, link_label, note_tags, dedupe_key, kind...
        if name == "chapter":
            raise AttributeError(name)
        return getattr(self.chapter, name)

    @property
    def details(self) -> list[str]:
        return chapter_details(self.chapter)

    def pgn(self, strip_anno: bool = True) -> str:
        tags = {
            **self.chapter.tags,
            "Orientation": ORIENTATIONS.get(self.side, "white"),
            MODE_TAG: STRUCTURE_MODE,
        }
        return dataclasses.replace(self.chapter, tags=tags).pgn(strip_anno=strip_anno)
