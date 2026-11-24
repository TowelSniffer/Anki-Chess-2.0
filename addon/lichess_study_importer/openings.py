"""
Opening book from the Lichess opening catalog (data/openings/*.tsv, CC0).

Positions are keyed by EPD, so transpositions are recognised.
"""

from __future__ import annotations

import csv
import glob
import os
import threading
from collections import Counter
from dataclasses import dataclass, field

from .chess_lib import chess

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "openings")


@dataclass
class BookPosition:
    moves: Counter = field(default_factory=Counter)  # uci -> number of catalog lines
    name: str | None = None  # set when a named line ends exactly here


@dataclass
class CatalogLine:
    eco: str
    name: str
    moves: list[chess.Move]
    epds: list[str]  # position before each move, plus the final one


_book: dict[str, BookPosition] | None = None
_lines: list[CatalogLine] = []
_lock = threading.Lock()


def load_book() -> dict[str, BookPosition]:
    global _book
    with _lock:
        if _book is None:
            book: dict[str, BookPosition] = {}
            for path in sorted(glob.glob(os.path.join(DATA_DIR, "*.tsv"))):
                with open(path, encoding="utf-8", newline="") as f:
                    for row in csv.DictReader(f, delimiter="\t"):
                        _lines.append(_add_line(book, row))
            _book = book
        return _book


def _add_line(book: dict[str, BookPosition], row: dict) -> CatalogLine:
    board = chess.Board()
    line = CatalogLine(row["eco"], row["name"], [], [])
    for token in row["pgn"].split():
        if token.endswith("."):
            continue
        move = board.parse_san(token)
        line.moves.append(move)
        line.epds.append(board.epd())
        book.setdefault(board.epd(), BookPosition()).moves[move.uci()] += 1
        board.push(move)
    line.epds.append(board.epd())
    book.setdefault(board.epd(), BookPosition()).name = row["name"]
    return line


def lines_from(board: chess.Board) -> list[CatalogLine]:
    """
    Named catalog lines that go through this position (by any move order), cut to
    the moves played from it. Lines ending here and repeated continuations are skipped.
    """
    load_book()
    epd = board.epd()
    seen: set[tuple[str, ...]] = set()
    result = []
    for line in _lines:
        if epd not in line.epds[:-1]:
            continue
        start = line.epds.index(epd)
        moves = line.moves[start:]
        key = tuple(m.uci() for m in moves)
        if key in seen:
            continue
        seen.add(key)
        result.append(CatalogLine(line.eco, line.name, moves, line.epds[start:]))
    return result


@dataclass
class BookResult:
    last_book_ply: int  # number of plies played in book (0 = left book immediately)
    opening_name: str | None
    deviation_ply: int | None  # ply index of the first non-book move from a book position
    book_moves: list[str]  # uci book moves at the deviation, most common first


def follow_book(start: chess.Board, moves: list[chess.Move]) -> BookResult:
    """Walk the game moves while they stay in the catalog."""
    book = load_book()
    board = start.copy()
    name = book[board.epd()].name if board.epd() in book else None
    for ply, move in enumerate(moves):
        entry = book.get(board.epd())
        if entry is None or not entry.moves:
            return BookResult(ply, name, None, [])
        if move.uci() not in entry.moves:
            ranked = [uci for uci, _ in entry.moves.most_common()]
            return BookResult(ply, name, ply, ranked)
        board.push(move)
        after = book.get(board.epd())
        if after and after.name:
            name = after.name
    return BookResult(len(moves), name, None, [])
