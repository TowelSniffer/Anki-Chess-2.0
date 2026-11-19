"""
Split a Lichess study PGN export into chapters and classify them.

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field

TAG_RE = re.compile(r'^\s*\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]\s*$')
COMMENT_RE = re.compile(r"\{[^}]*\}")
VARIATION_RE = re.compile(r"\([^()]*\)")  # innermost variation
CHAPTER_URL_RE = re.compile(r"/study/([A-Za-z0-9]{8})/([A-Za-z0-9]{8})")
ANNO_RE = re.compile(r"\[%anno\b[^\]]*\]")
EMPTY_COMMENT_RE = re.compile(r"\{\s*\}")
# Embedded comment commands ([%cal ...]); the template parser only accepts "[%name value]"
COMMAND_RE = re.compile(r"\[%[^\]]*\]")
VALID_COMMAND_RE = re.compile(r"\[%\s*[\w.-]+\s+[^\]\s][^\]]*\]")
# A SAN move (or castling), used to decide if a chapter has any moves at all.
SAN_RE = re.compile(r"(?<![\w-])(?:O-O(?:-O)?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?)[+#]?")
# First move of the movetext, with the (optional) leading and trailing comments.
FIRST_MOVE_RE = re.compile(
    r"^\s*(?P<lead>(?:\{[^}]*\}\s*)*)"
    r"(?:\d+\.(?:\.\.)?\s*)?"
    r"(?P<move>\S+)\s*"
    r"(?P<after>\{[^}]*\})?"
)
# "Jogam as brancas", "qual o melhor lance para as pretas?", "White to move"...
SIDE_HINT_RE = re.compile(
    r"(?:jog\w*|jueg\w*|mueve\w*|lance|jugada|play\w*|move)\W+(?:\w+\W+){0,3}?"
    r"(?P<a>brancas|pretas|blancas|negras|white|black)"
    r"|(?P<b>white|black)\s+to\s+(?:play|move)",
    re.IGNORECASE,
)
COLOR_WORDS = {
    "brancas": "w",
    "blancas": "w",
    "white": "w",
    "pretas": "b",
    "negras": "b",
    "black": "b",
}

ORIENTATIONS = {"white": "w", "black": "b"}

KIND_EXERCISE = "exercise"  # starts from a [FEN] position
KIND_LINE = "line"  # from the start, no result: an opening line
KIND_GAME = "game"  # from the start, with a result: an annotated game
KIND_STRUCTURE = "structure"  # a [FEN] and no moves: a pawn structure and its plans
KIND_EMPTY = "empty"
KIND_UNSUPPORTED = "unsupported"  # a chess variant the template can't play (Chess960...)
FINISHED_RESULTS = ("1-0", "0-1", "1/2-1/2")
SUPPORTED_VARIANTS = ("", "standard", "from position")
ID_TAG = "AnkiChessId"  # written in every imported PGN, see Chapter.pgn()

MODE_PUZZLE = "puzzle"
MODE_FLIPPED = "flipped"
MODE_STUDY = "study"


@dataclass
class Chapter:
    tags: dict[str, str] = field(default_factory=dict)
    movetext: str = ""

    @property
    def name(self) -> str:
        return self.tags.get("ChapterName") or self.tags.get("Event") or "?"

    @property
    def study_name(self) -> str:
        return self.tags.get("StudyName", "")

    @property
    def chapter_url(self) -> str:
        return self.tags.get("ChapterURL", "")

    @property
    def study_id(self) -> str | None:
        m = CHAPTER_URL_RE.search(self.chapter_url)
        return m.group(1) if m else None

    @property
    def chapter_id(self) -> str | None:
        m = CHAPTER_URL_RE.search(self.chapter_url)
        return m.group(2) if m else None

    # --- Card interface used by anki_ops (shared with game_analysis.GameCard) ---

    link_label = "Lichess"

    @property
    def from_lichess(self) -> bool:
        return bool(self.study_id) or "lichess.org" in self.tags.get("Site", "")

    @property
    def dedupe_key(self) -> str | None:
        """
        Identifies the chapter's note, written in its PGN as [AnkiChessId]. Other PGNs
        (ChessBase, pasted...) are keyed by the game itself: players, event, start
        position and main line, so editing their comments still updates the same note.
        """
        if self.tags.get(ID_TAG):
            return self.tags[ID_TAG]
        if self.study_id and self.chapter_id:
            return f"study/{self.study_id}/{self.chapter_id}"
        if not has_moves(self.movetext) and not self.fen:
            return None
        parts = [self.tags.get(k, "") for k in ("Event", "Site", "Date", "Round", "White", "Black", "FEN")]
        identity = "\n".join([*parts, mainline_text(self.movetext)])
        return f"pgn/{hashlib.sha1(identity.encode()).hexdigest()[:12]}"

    @property
    def note_tags(self) -> list[str]:
        source = "lichess" if self.from_lichess else "pgn"
        tags = [source, f"{source}::{self.kind}"]
        if self.study_id:
            tags.append(f"lichess::study::{self.study_id}")
        return tags

    @property
    def fen(self) -> str | None:
        return self.tags.get("FEN")

    @property
    def side_to_move(self) -> str:
        parts = (self.fen or "").split()
        return parts[1] if len(parts) > 1 and parts[1] in ("w", "b") else "w"

    @property
    def variant(self) -> str:
        return self.tags.get("Variant", "")

    @property
    def kind(self) -> str:
        if self.variant.lower() not in SUPPORTED_VARIANTS:
            return KIND_UNSUPPORTED
        if not has_moves(self.movetext):
            # A position set up with no moves: a structure to remember (often only
            # pawns, so not a position the board can play), with its plans if commented
            return KIND_STRUCTURE if self.fen else KIND_EMPTY
        if self.fen:
            return KIND_EXERCISE
        return KIND_GAME if self.tags.get("Result") in FINISHED_RESULTS else KIND_LINE

    @property
    def player(self) -> str | None:
        """
        Side the solver plays ("w"/"b"): the chapter orientation set on Lichess (exported
        with orientation=true), else guessed for exercises. None for lines and games
        without it: both sides are played.
        """
        orientation = ORIENTATIONS.get(self.tags.get("Orientation", "").lower())
        if orientation:
            return orientation
        if self.kind == KIND_EXERCISE:
            return guess_solver(self)
        return None

    @property
    def suggested_mode(self) -> str:
        return mode_for(self.player, self.side_to_move)

    @property
    def preview(self) -> str:
        return self.moves_preview(60)

    @property
    def comment_text(self) -> str:
        """
        Text of the chapter's comments (the plans of a structure), without commands or
        annotator markers, keeping its line breaks.
        """
        texts = []
        for comment in COMMENT_RE.findall(self.movetext):
            text = COMMAND_RE.sub("", comment[1:-1])
            lines = [" ".join(line.split()) for line in text.split("\n")]
            text = re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip()
            if text:
                texts.append(text)
        return "\n\n".join(texts)

    @property
    def commands(self) -> list[str]:
        """The comment commands ([%csl Gd5], [%cal Gb7b5]...) of the chapter."""
        return COMMAND_RE.findall(self.movetext)

    def moves_preview(self, limit: int) -> str:
        """Moves without comments, cut at limit characters."""
        text = " ".join(COMMENT_RE.sub(" ", self.movetext).split())
        return text[:limit] + ("…" if len(text) > limit else "")

    def pgn(self, strip_anno: bool = True) -> str:
        tags = dict(self.tags)
        if self.dedupe_key:
            tags.setdefault(ID_TAG, self.dedupe_key)
        header = "\n".join(f'[{k} "{escape_tag_value(v)}"]' for k, v in tags.items())
        body = drop_malformed_commands(self.movetext)
        body = sanitize(body) if strip_anno else body.strip()
        return f"{header}\n\n{body}\n"


# PGN tag values escape quotes and backslashes: [ChapterName "\"Intro\" - Foreword"]
def unescape_tag_value(value: str) -> str:
    return re.sub(r'\\(["\\])', r"\1", value)


def escape_tag_value(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def drop_malformed_commands(movetext: str) -> str:
    """
    Remove comment commands the template's PGN parser rejects (e.g. a "[%t@Shrt]"
    typo in a study), which would otherwise make the whole chapter fail to load.
    """
    return COMMAND_RE.sub(
        lambda m: m.group(0) if VALID_COMMAND_RE.fullmatch(m.group(0)) else "", movetext
    )


def has_moves(movetext: str) -> bool:
    return bool(SAN_RE.search(COMMENT_RE.sub(" ", movetext)))


def mainline_text(movetext: str) -> str:
    """Main line moves only (no comments, variations, NAGs or move numbers)."""
    text = COMMENT_RE.sub(" ", movetext)
    previous = None
    while previous != text:  # nested variations, innermost first
        previous, text = text, VARIATION_RE.sub(" ", text)
    return " ".join(SAN_RE.findall(text))


def sanitize(movetext: str) -> str:
    """Remove Lichess annotator markers ([%anno ...]) and comments left empty."""
    text = ANNO_RE.sub("", movetext)
    text = EMPTY_COMMENT_RE.sub("", text)
    return re.sub(r"[ \t]+", " ", text).strip()


def _hinted_color(comment: str | None) -> str | None:
    if not comment:
        return None
    m = SIDE_HINT_RE.search(comment)
    if not m:
        return None
    return COLOR_WORDS[(m.group("a") or m.group("b")).lower()]


def mode_for(player: str | None, side_to_move: str) -> str:
    """
    Puzzle when the solver makes the first move, Flipped when the first move is the
    opponent's (played automatically), Study when both sides are played.
    """
    if player is None:
        return MODE_STUDY
    return MODE_PUZZLE if player == side_to_move else MODE_FLIPPED


def guess_solver(ch: Chapter) -> str:
    """Side the solver plays in an exercise without orientation (exported files)."""
    m = FIRST_MOVE_RE.match(ch.movetext)
    if m:
        # A hint right after the first move names the solver ("Jogam as brancas"),
        # a hint before it is a question to the side to move.
        hinted = _hinted_color(m.group("after")) or _hinted_color(m.group("lead"))
        if hinted:
            return hinted

    # Otherwise, the winner of a decisive result is usually the solver.
    winner = {"1-0": "w", "0-1": "b"}.get(ch.tags.get("Result", ""))
    return winner or ch.side_to_move


def split_games(text: str) -> list[Chapter]:
    """Split a multi-game PGN into chapters. Duplicate tags keep the first value."""
    chapters: list[Chapter] = []
    current: Chapter | None = None
    in_moves = False
    brace_depth = 0
    move_lines: list[str] = []

    def flush():
        if current is not None:
            current.movetext = "\n".join(move_lines).strip()
            chapters.append(current)

    for line in text.replace("\r\n", "\n").lstrip("﻿").split("\n"):
        tag = TAG_RE.match(line) if brace_depth == 0 else None
        if tag:
            if current is None or in_moves:
                flush()
                current = Chapter()
                move_lines = []
                in_moves = False
            current.tags.setdefault(tag.group(1), unescape_tag_value(tag.group(2)))
            continue

        if current is None:
            if not line.strip():
                continue
            current = Chapter()  # movetext with no header
            move_lines = []
        if line.strip():
            in_moves = True
        if in_moves:
            move_lines.append(line)
            brace_depth = max(0, brace_depth + line.count("{") - line.count("}"))

    flush()
    return chapters
