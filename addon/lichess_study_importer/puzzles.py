"""
Lichess puzzles as AnkiChess cards: the opponent's last move is played first
(Flipped), then you play the solution; any mate is accepted on the last move, as on
Lichess.

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .chess_lib import chess
from .decks import tag_part
from .game_analysis import export_pgn, mate_alternatives
from .i18n import tr
from .pgn_split import MODE_FLIPPED, MODE_PUZZLE

KIND_PUZZLE = "puzzle"


@dataclass
class PuzzleCard:
    """Card from a Lichess puzzle; same interface as pgn_split.Chapter for anki_ops."""

    puzzle_id: str
    rating: int
    themes: list[str]
    mode: str
    body: str
    win: bool | None = None  # your result, for puzzles from your activity
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
        return f"puzzle/{self.puzzle_id}"

    @property
    def note_tags(self) -> list[str]:
        tags = ["lichess", "lichess::puzzle", *(f"lichess::puzzle::{tag_part(t)}" for t in self.themes)]
        if self.win is False:
            tags.append("lichess::puzzle::failed")
        return tags

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


def puzzle_card(data: dict, win: bool | None = None) -> PuzzleCard:
    """Card from the API's {"puzzle": {...}, "game": {...}} (the game is optional)."""
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
