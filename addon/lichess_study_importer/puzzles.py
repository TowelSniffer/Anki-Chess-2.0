"""
Lichess puzzles as AnkiChess cards: the opponent's last move is played first
(Flipped), then you play the solution; any mate is accepted on the last move, as on
Lichess.

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from typing import Callable

from .chess_lib import chess
from .decks import tag_part
from .game_analysis import export_pgn, mate_alternatives
from .i18n import tr
from .lichess_api import LichessError, Wait, fetch_puzzle
from .pgn_split import ID_TAG, MODE_FLIPPED, MODE_PUZZLE

KIND_PUZZLE = "puzzle"
KEY_PREFIX = "puzzle/"
# The puzzle id in the [AnkiChessId "puzzle/<id>"] tag of an imported note's PGN
IMPORTED_ID_RE = re.compile(rf'\[{ID_TAG} "{KEY_PREFIX}([A-Za-z0-9]+)"\]')
REQUEST_PAUSE = 0.3  # seconds between puzzle requests, to stay under Lichess' rate limit
# Errors that would hit every next puzzle too: fetching stops and keeps what came
STOPPING_ERRORS = ("error.cancelled", "error.rate_limited", "error.connection")
_pause = time.sleep
TAG_ROOT = "lichess::puzzle"


def puzzle_tags(themes: list[str], win: bool | None) -> list[str]:
    """
    The importer's tags of a puzzle note: lichess::puzzle::theme::<theme> for each of its
    themes, and lichess::puzzle::failed or ::solved for your result (none for a link's).
    """
    tags = ["lichess", TAG_ROOT, *(f"{TAG_ROOT}::theme::{tag_part(t)}" for t in themes)]
    if win is not None:
        tags.append(f"{TAG_ROOT}::{'solved' if win else 'failed'}")
    return tags


@dataclass
class PuzzleCard:
    """Card from a Lichess puzzle; same interface as pgn_split.Chapter for anki_ops."""

    puzzle_id: str
    rating: int
    themes: list[str]
    mode: str
    body: str
    win: bool | None = None  # your result, for puzzles from your activity
    date: int | None = None  # ms, when you first played it (puzzles from your activity)
    kind: str = KIND_PUZZLE
    link_label: str = "Lichess"
    details: list[str] = field(default_factory=list)

    @property
    def name(self) -> str:
        return tr("puzzle.name", id=self.puzzle_id, rating=self.rating)

    @property
    def study_name(self) -> str:
        return tr("deck.puzzles")

    @property
    def chapter_url(self) -> str:
        return f"https://lichess.org/training/{self.puzzle_id}"

    @property
    def dedupe_key(self) -> str:
        return f"{KEY_PREFIX}{self.puzzle_id}"

    @property
    def opponent_move_first(self) -> bool:
        """Built from the puzzle's game: the card plays the opponent's last move first."""
        return self.mode == MODE_FLIPPED

    @property
    def note_tags(self) -> list[str]:
        return puzzle_tags(self.themes, self.win)

    def pgn(self, strip_anno: bool = True) -> str:
        return self.body


def _start(data: dict) -> tuple[chess.Board, chess.Move | None]:
    """
    Position before the opponent's last move, and that move. The puzzle's game ends
    with it (initialPly + 1 moves); without the game, the puzzle starts after it.
    """
    puzzle, game = data["puzzle"], data.get("game") or {}
    sans = (game.get("pgn") or "").split()
    ply = puzzle.get("initialPly")
    if sans and ply is not None and ply < len(sans):
        board = chess.Board()
        for san in sans[:ply]:
            board.push_san(san)
        return board, board.parse_san(sans[ply])
    return chess.Board(puzzle["fen"]), None


def puzzle_card(data: dict, win: bool | None = None, date: int | None = None) -> PuzzleCard:
    """
    Card from the API's {"puzzle": {...}, "game": {...}}. The game is optional: without
    it (an entry of your activity) the card starts at the puzzle position.
    """
    puzzle = data["puzzle"]
    board, last = _start(data)
    game = chess.pgn.Game()
    game.setup(board)
    node = game.add_main_variation(last) if last else game
    solver = node.board().turn
    for uci in puzzle["solution"]:
        node = node.add_main_variation(chess.Move.from_uci(uci))
    if node.board().is_checkmate() and node.parent is not None:
        for alt in mate_alternatives(node.parent.board(), node.move):
            node.parent.add_variation(alt)

    themes = list(puzzle.get("themes", []))
    card = PuzzleCard(
        puzzle_id=puzzle["id"],
        rating=int(puzzle.get("rating", 0)),
        themes=themes,
        mode=MODE_FLIPPED if last else MODE_PUZZLE,
        body="",
        win=win,
        date=date,
    )
    card.details = [tr("puzzle.themes", themes=", ".join(themes))] if themes else []
    card.body = export_pgn(
        game,
        {
            "Event": "Lichess puzzle",
            "Site": card.chapter_url,
            "Result": "*",
            "ChapterName": card.name,
            "StudyName": card.study_name,
            "ChapterURL": card.chapter_url,
            "Orientation": "white" if solver == chess.WHITE else "black",
            "AnkiChessId": card.dedupe_key,
        },
    )
    return card


def activity_card(entry: dict) -> PuzzleCard:
    """Card from an entry of your puzzle activity, without requests (no game)."""
    return puzzle_card(entry, entry.get("win"), entry.get("date"))


def load_puzzles(
    entries: list[tuple[str, bool | None, dict | None]],
    progress: Callable[[int, int], None],
    wait: Wait | None = None,
    cancelled: Callable[[], bool] = lambda: False,
) -> tuple[list[PuzzleCard], LichessError | None]:
    """
    Cards for (puzzle id, your result, activity entry) items, each puzzle fetched with
    its game so the card starts before the opponent's last move. An activity entry the
    puzzle can't be fetched for still gives a card from the puzzle position. Esc
    (cancelled()), or an error that would stop the next ones too, ends it early: returns
    the cards so far and that error (None when every puzzle came). wait: see lichess_api.
    """
    cards: list[PuzzleCard] = []
    for done, (puzzle_id, win, entry) in enumerate(entries):
        progress(done, len(entries))
        if cancelled():
            return cards, LichessError("error.cancelled")
        if done:
            _pause(REQUEST_PAUSE)
        try:
            data = fetch_puzzle(puzzle_id, wait=wait)
        except LichessError as e:
            if e.key in STOPPING_ERRORS:
                return cards, e
            if entry is None:
                raise
            data = entry
        cards.append(puzzle_card(data, win, entry.get("date") if entry else None))
    progress(len(entries), len(entries))
    return cards, None


def sync_plan(entries: list[dict], imported: set[str], failed_only: bool) -> list[dict]:
    """
    The activity entries a sync imports, oldest first: the puzzles not in Anki yet, only
    the failed ones with failed_only.
    """
    wanted = [
        e
        for e in entries
        if e["puzzle"]["id"] not in imported and not (failed_only and e.get("win") is not False)
    ]
    return sorted(wanted, key=lambda e: e.get("date") or 0)


def next_sync_point(entries: list[dict], complete: bool, plan: list[dict], handled: int, previous: int) -> int:
    """
    Where the next sync starts reading the activity (ms; Lichess sends from that time
    on, and the puzzles already in Anki are left out again): unchanged when Lichess
    didn't send all of it (complete=False); at the first puzzle of the plan left when
    importing stopped after `handled` of them; else at the most recent puzzle read.
    """
    if not complete:
        return previous
    if handled < len(plan):
        return max(previous, int(plan[handled].get("date") or previous))
    return max([previous, *(int(e["date"]) for e in entries if e.get("date"))])


def imported_ids(pgn_field: str) -> list[str]:
    """The puzzle ids in the PGN field of an imported note."""
    return IMPORTED_ID_RE.findall(pgn_field)
