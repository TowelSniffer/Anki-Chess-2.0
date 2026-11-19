"""
Cards made from a chapter besides the chapter itself:

- split_variations: an opening line with several branches becomes one card per
  branch (from the start to the end of the branch), to drill each variation of a
  repertoire on its own
- key_move_cards: the moves an annotated game marks as good (! or !!) become "find
  the move" cards, from the position before them; the other tries the author
  analysed there are wrong answers that show their comment (a gamebook card)

Pure Python (no aqt imports) so it can be unit tested outside Anki.
"""

from __future__ import annotations

import hashlib
import io

from .chess_lib import chess
from .i18n import tr
from .pgn_split import ID_TAG, Chapter

KEY_NAGS = {1: "!", 3: "!!"}
LABEL_PLIES = 6  # moves shown in the name of a branch


def _read(ch: Chapter, strip_anno: bool):
    try:
        return chess.pgn.read_game(io.StringIO(ch.pgn(strip_anno)))
    except (ValueError, KeyError):
        return None


def _movetext(game: chess.pgn.Game) -> str:
    exporter = chess.pgn.StringExporter(headers=False, variations=True, comments=True)
    return game.accept(exporter).strip()


def _branches(node: chess.pgn.GameNode, path: list) -> list[list]:
    """Every path from node to the end of a variation, main line first."""
    if not node.variations:
        return [path]
    return [branch for child in node.variations for branch in _branches(child, [*path, child])]


def _move_number(board: chess.Board) -> str:
    return f"{board.fullmove_number}{'.' if board.turn == chess.WHITE else '...'}"


def _branch_label(path: list) -> str:
    """The moves where a branch leaves the main line, e.g. '3... d5 4. exd5'."""
    start = next((i for i, n in enumerate(path) if n is not n.parent.variations[0]), None)
    if start is None:
        return tr("card.main_line")
    board = path[start].parent.board()
    moves = [n.move for n in path[start:]]
    text = board.variation_san(moves[:LABEL_PLIES])
    return text + (" …" if len(moves) > LABEL_PLIES else "")


def _start(game: chess.pgn.Game, board: chess.Board) -> None:
    if board.fen() != chess.STARTING_FEN:
        game.setup(board)


def split_variations(ch: Chapter, strip_anno: bool = True) -> list[Chapter]:
    """One card per branch of the chapter's moves; the chapter itself if it has one."""
    game = _read(ch, strip_anno)
    if game is None or not ch.dedupe_key:
        return [ch]
    branches = _branches(game, [])
    if len(branches) < 2:
        return [ch]
    cards = []
    for i, path in enumerate(branches, 1):
        branch = chess.pgn.Game()
        _start(branch, game.board())
        branch.comment = game.comment
        node = branch
        for source in path:
            node = node.add_main_variation(source.move, comment=source.comment, nags=set(source.nags))
            node.starting_comment = source.starting_comment
        ucis = " ".join(n.move.uci() for n in path)
        tags = {k: v for k, v in ch.tags.items() if k not in ("FEN", "SetUp")}
        if branch.headers.get("FEN"):
            tags.update(FEN=branch.headers["FEN"], SetUp="1")
        tags["ChapterName"] = f"{ch.name} ({i}/{len(branches)}): {_branch_label(path)}"
        tags[ID_TAG] = f"{ch.dedupe_key}/var/{hashlib.sha1(ucis.encode()).hexdigest()[:10]}"
        cards.append(Chapter(tags=tags, movetext=_movetext(branch)))
    return cards


def _copy_tree(source: chess.pgn.ChildNode, parent: chess.pgn.GameNode) -> None:
    node = parent.add_variation(source.move, comment=source.comment, nags=set(source.nags))
    for child in source.variations:
        _copy_tree(child, node)


def key_move_cards(ch: Chapter, strip_anno: bool = True) -> list[Chapter]:
    """
    "Find the move" cards for the main line moves marked ! or !!. The card starts one
    move earlier, so the opponent's move is played first (Flipped).
    """
    game = _read(ch, strip_anno)
    if game is None or not ch.dedupe_key:
        return []
    cards = []
    for node in game.mainline():
        marks = [KEY_NAGS[n] for n in sorted(node.nags) if n in KEY_NAGS]
        if not marks:
            continue
        before = node.parent  # position before the key move
        board = before.board()
        puzzle = chess.pgn.Game()
        if isinstance(before, chess.pgn.ChildNode):
            _start(puzzle, before.parent.board())
            spot = puzzle.add_main_variation(before.move, comment=before.comment)
        else:
            _start(puzzle, board)
            spot = puzzle
        spot.add_main_variation(node.move, comment=node.comment, nags=set(node.nags))
        # The author's other tries here: wrong answers with their explanation
        for other in before.variations:
            if other is not node:
                _copy_tree(other, spot)

        name = f"{ch.name}: {_move_number(board)} {board.san(node.move)}{marks[-1]}"
        tags = {
            k: v
            for k, v in ch.tags.items()
            if k not in ("FEN", "SetUp", "Result", "Orientation", "ChapterMode")
        }
        if puzzle.headers.get("FEN"):
            tags.update(FEN=puzzle.headers["FEN"], SetUp="1")
        tags.update(
            Result="*",
            ChapterName=name,
            ChapterMode="gamebook",
            Orientation="white" if board.turn == chess.WHITE else "black",
        )
        tags[ID_TAG] = f"{ch.dedupe_key}/move/{node.ply()}"
        cards.append(Chapter(tags=tags, movetext=_movetext(puzzle)))
    return cards
