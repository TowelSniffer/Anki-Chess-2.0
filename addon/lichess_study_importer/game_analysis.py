"""
Turn an analysed game (Chess.com export or plain PGN) into AnkiChess cards:

- opening: the book moves of the game, played on both sides (Study)
- book: the position where you left theory; the solution is the book move
- book_line: every named catalog line from where the game left theory, to
  memorise the line's moves on your side (the line name is the prompt)
- blunder / mistake / miss / inaccuracy: the position before your error;
  the solution is a line you explored in the analysis board, or Stockfish's
- missed_mate: a forced mate you did not play, with the whole mating line

Pure Python (no aqt imports); the engine is passed in so tests can use any UCI engine.
"""

from __future__ import annotations

import hashlib
import math
import re
from collections import Counter
from dataclasses import dataclass, field
from typing import Callable

from .chess_lib import chess
from .chesscom import ERROR_LABELS, LABEL_NAGS, game_id_from_headers, game_link, move_label
from .i18n import tr
from .lichess_api import parse_game_url as parse_lichess_game
from .openings import follow_book, lines_from, load_book
from .pgn_split import MODE_FLIPPED, MODE_PUZZLE, MODE_STUDY, escape_tag_value

KIND_OPENING = "opening"
KIND_BOOK = "book"
KIND_BOOK_LINE = "book_line"
KIND_BLUNDER = "blunder"
KIND_MISTAKE = "mistake"
KIND_MISS = "miss"
KIND_INACCURACY = "inaccuracy"
KIND_MISSED_MATE = "missed_mate"
ERROR_KINDS = (KIND_BLUNDER, KIND_MISTAKE, KIND_MISS, KIND_INACCURACY)
ALL_KINDS = (KIND_OPENING, KIND_BOOK, KIND_BOOK_LINE, *ERROR_KINDS, KIND_MISSED_MATE)
ENGINE_KINDS = (*ERROR_KINDS, KIND_MISSED_MATE)
DEFAULT_KINDS = {
    KIND_OPENING,
    KIND_BOOK,
    KIND_BOOK_LINE,
    KIND_BLUNDER,
    KIND_MISTAKE,
    KIND_MISS,
    KIND_MISSED_MATE,
}

KIND_NAGS = {kind: LABEL_NAGS[kind.capitalize()] for kind in ERROR_KINDS}
BAD_NAGS = {2, 4, 5, 6, 9}
# Lichess server analysis: { (0.22 → 1.85) Mistake. cxd4 was best. } (5... cxd4 6. Nxd4 ...)
BEST_RE = re.compile(r"\S+ was best")
EVAL_CHANGE_RE = re.compile(r"\(([^()→]+?) → ([^()→]+?)\)")
# Lichess thresholds on the drop of the win chance, used when the PGN has no labels
WIN_DROP_KINDS = ((30, KIND_BLUNDER), (20, KIND_MISTAKE), (10, KIND_INACCURACY))


@dataclass
class AnalysisOptions:
    user_color: chess.Color
    kinds: set[str] = field(default_factory=lambda: set(DEFAULT_KINDS))
    move_time: float = 0.5  # scan of every user move
    solution_time: float = 1.5  # deeper search for the positions that become cards
    max_mate: int = 6  # longest mate turned into a "missed mate" card
    alt_threshold: float = 3.0  # win-% points: engine moves this close to the best are also accepted


@dataclass
class GameCard:
    """Card generated from a game; same interface as pgn_split.Chapter for anki_ops."""

    kind: str
    ply: int
    mode: str
    name: str
    study_name: str
    chapter_url: str
    dedupe_key: str
    note_tags: list[str]
    move_text: str  # the move played in the game, e.g. "19. bxa5??"
    solution_text: str
    eval_text: str
    body: str
    link_label: str = "Chess.com"
    opening: str | None = None  # catalog opening name, used to file opening cards

    def pgn(self, strip_anno: bool = True) -> str:
        return self.body


def win_percent(score: chess.engine.PovScore | chess.engine.Score) -> float:
    """Lichess win chance (0-100) for a score seen from the side of interest."""
    cp = score.score(mate_score=10000)
    return 50 + 50 * (2 / (1 + math.exp(-0.00368208 * cp)) - 1)


def format_score(score: chess.engine.Score) -> str:
    mate = score.mate()
    if mate is not None:
        return f"#{mate}" if mate > 0 else f"#-{-mate}"
    return f"{score.score() / 100:+.1f}"


def move_number(board: chess.Board) -> str:
    return f"{board.fullmove_number}{'.' if board.turn == chess.WHITE else '...'}"


def _nag_suffix(nags) -> str:
    symbols = {1: "!", 2: "?", 3: "!!", 4: "??", 5: "!?", 6: "?!"}
    return "".join(symbols[n] for n in sorted(nags) if n in symbols)


class _Game:
    """Game metadata shared by all its cards."""

    def __init__(self, game: chess.pgn.Game):
        h = game.headers
        self.white, self.black = h.get("White", "?"), h.get("Black", "?")
        self.date = h.get("Date", "????.??.??")
        lichess_id = parse_lichess_game(h.get("Site", ""))
        if lichess_id:
            self.source, self.link_label = "lichess", "Lichess"
            self.game_id = lichess_id
            self.link = f"https://lichess.org/{lichess_id}"
        else:
            # Chess.com, and other PGNs (keyed as Chess.com games, as before)
            self.source, self.link_label = "chesscom", "Chess.com"
            self.game_id = game_id_from_headers(h)
            self.link = game_link("live", self.game_id) if self.game_id else ""
        if not self.game_id:
            moves = " ".join(n.uci() for n in game.mainline_moves())
            self.game_id = hashlib.sha1(moves.encode()).hexdigest()[:12]
        self.title = f"{self.white} vs {self.black}"
        if not self.date.startswith("?"):
            self.title += f" · {self.date.replace('.??', '')}"

    def headers(self, card_name: str, dedupe_key: str) -> dict[str, str]:
        return {
            "Event": f"{self.link_label} analysis",
            "Site": self.link or "?",
            "Date": self.date,
            "White": self.white,
            "Black": self.black,
            "Result": "*",
            "StudyName": self.title,
            "ChapterName": card_name,
            "ChapterURL": self.link,
            "AnkiChessId": dedupe_key,
        }


def export_pgn(game: chess.pgn.Game, headers: dict[str, str]) -> str:
    for key, value in headers.items():
        game.headers[key] = value
    exporter = chess.pgn.StringExporter(headers=False, variations=True, comments=True)
    moves = game.accept(exporter)
    # python-chess writes tags without escaping quotes, so write them ourselves
    tags = "\n".join(f'[{k} "{escape_tag_value(v)}"]' for k, v in game.headers.items())
    return f"{tags}\n\n{moves}\n"


def _puzzle_start(board_before: chess.Board, prev_move: chess.Move | None):
    """
    Start one ply earlier when possible (Flipped mode): the opponent's last move is
    played automatically, so the card shows what just happened.
    """
    game = chess.pgn.Game()
    if prev_move is None:
        game.setup(board_before)
        return game, game, MODE_PUZZLE
    board = board_before.copy()
    board.pop()
    game.setup(board)
    return game, game.add_main_variation(prev_move), MODE_FLIPPED


def mate_alternatives(board: chess.Board, mate_move: chess.Move) -> list[chess.Move]:
    """Other moves that also mate at once, so any mate is accepted (see issue #115)."""
    others = []
    for move in board.legal_moves:
        if move == mate_move:
            continue
        board.push(move)
        if board.is_checkmate():
            others.append(move)
        board.pop()
    return others


def _explored_alternative(node: chess.pgn.ChildNode) -> chess.Move | None:
    """A move explored in the analysis board instead of the game move, if not marked as bad."""
    for variation in node.parent.variations:
        if variation is node or variation.move == node.move:
            continue
        if BAD_NAGS & set(variation.nags) or move_label(variation) in ERROR_LABELS:
            continue
        return variation.move
    return None


def analyze_game(
    game: chess.pgn.Game,
    options: AnalysisOptions,
    engine=None,
    on_progress: Callable[[int, int], None] | None = None,
) -> list[GameCard]:
    meta = _Game(game)
    nodes = list(game.mainline())
    moves = [n.move for n in nodes]
    start = game.board()
    cards: list[GameCard] = []

    book = follow_book(start, moves)
    if KIND_OPENING in options.kinds and book.last_book_ply >= 4:
        cards.append(_opening_card(meta, start, moves[: book.last_book_ply], book.opening_name))

    boards = [start.copy()]
    for move in moves:
        board = boards[-1].copy()
        board.push(move)
        boards.append(board)

    if (
        KIND_BOOK in options.kinds
        and book.deviation_ply is not None
        and boards[book.deviation_ply].turn == options.user_color
    ):
        cards.append(_book_card(meta, boards, moves, nodes, book))

    if KIND_BOOK_LINE in options.kinds:
        cards.extend(_book_line_cards(meta, boards, moves, book.last_book_ply, options.user_color))

    if not options.kinds & set(ENGINE_KINDS):
        return cards

    labeled = any(move_label(n) in ERROR_LABELS for n in nodes)
    user_plies = [
        i for i in range(book.last_book_ply, len(moves)) if boards[i].turn == options.user_color
    ]
    if engine is None:
        # Lichess games analysed on the server: the errors and best moves are in the PGN
        if has_server_analysis(game):
            for ply in user_plies:
                card = _annotated_error_card(meta, boards, moves, nodes, ply, options)
                if card:
                    cards.append(card)
        return cards
    for done, ply in enumerate(user_plies):
        if on_progress:
            on_progress(done, len(user_plies))
        card = _error_card(meta, boards, moves, nodes, ply, options, engine, labeled)
        if card:
            cards.append(card)
    if on_progress:
        on_progress(len(user_plies), len(user_plies))
    return cards


def _opening_card(meta: _Game, start: chess.Board, moves, opening: str | None) -> GameCard:
    name = tr("card.opening", opening=opening or "?")
    key = f"{meta.source}/{meta.game_id}/0/{KIND_OPENING}"
    game = chess.pgn.Game()
    if start.fen() != chess.STARTING_FEN:
        game.setup(start)
    node = game
    for move in moves:
        node = node.add_main_variation(move)
    if opening:
        node.comment = opening
    return GameCard(
        kind=KIND_OPENING,
        ply=0,
        mode=MODE_STUDY,
        name=name,
        study_name=meta.title,
        chapter_url=meta.link,
        dedupe_key=key,
        note_tags=_tags(meta, KIND_OPENING),
        move_text=tr("card.opening_moves", count=len(moves)),
        solution_text=opening or "",
        eval_text="",
        body=export_pgn(game, meta.headers(name, key)),
        link_label=meta.link_label,
        opening=opening,
    )


def _book_card(meta: _Game, boards, moves, nodes, book) -> GameCard:
    ply = book.deviation_ply
    board = boards[ply]
    played = moves[ply]
    book_moves = [chess.Move.from_uci(uci) for uci in book.book_moves]
    game, node, mode = _puzzle_start(board, moves[ply - 1] if ply else None)
    node.add_main_variation(
        book_moves[0], comment=tr("card.book_comment", opening=book.opening_name or "?")
    )
    for alt in book_moves[1:]:
        node.add_variation(alt)
    node.add_variation(played, nags={6}, comment=tr("card.played_comment", move=board.san(played)))

    number = move_number(board)
    name = tr("card.book", number=number, opening=book.opening_name or "?")
    key = f"{meta.source}/{meta.game_id}/{ply}/{KIND_BOOK}"
    return GameCard(
        kind=KIND_BOOK,
        ply=ply,
        mode=mode,
        name=name,
        study_name=meta.title,
        chapter_url=meta.link,
        dedupe_key=key,
        note_tags=_tags(meta, KIND_BOOK),
        move_text=f"{number} {board.san(played)}",
        solution_text=", ".join(board.san(m) for m in book_moves),
        eval_text="",
        body=export_pgn(game, meta.headers(name, key)),
        link_label=meta.link_label,
        opening=book.opening_name,
    )


def _book_line_cards(meta: _Game, boards, moves, branch_ply: int, user: chess.Color) -> list[GameCard]:
    """One card per named catalog line continuing from where the game left theory."""
    branch = boards[branch_ply]
    book = load_book()
    lines = lines_from(branch)
    name_counts = Counter(line.name for line in lines)
    cards = []
    for line in lines:
        movers = [branch.turn if i % 2 == 0 else not branch.turn for i in range(len(line.moves))]
        if user not in movers:
            continue  # nothing to play on your side

        if branch.turn == user:
            # Your move first: show the game's previous move for context
            game, node, mode = _puzzle_start(branch, moves[branch_ply - 1] if branch_ply else None)
        else:
            # Opponent's move first: it is played automatically (Flipped)
            game = chess.pgn.Game()
            game.setup(branch)
            node, mode = game, MODE_FLIPPED

        last_name = book[branch.epd()].name if branch.epd() in book else None
        board = branch.copy()
        for move in line.moves:
            node = node.add_main_variation(move)
            board.push(move)
            entry = book.get(board.epd())
            if entry and entry.name and entry.name != last_name:
                node.comment = entry.name
                last_name = entry.name
        node.comment = line.name

        if name_counts[line.name] > 1:
            # Same name, different lines: say where this one ends so the prompt is unambiguous
            end = board.copy()
            last = end.pop()
            name = tr("card.book_line_until", opening=line.name, move=f"{move_number(end)} {end.san(last)}")
        else:
            name = tr("card.book_line", opening=line.name)
        digest = hashlib.sha1(
            (branch.epd() + " " + " ".join(m.uci() for m in line.moves)).encode()
        ).hexdigest()[:12]
        # Keyed by the line, not the game: another game in this opening won't duplicate it
        key = f"book/{digest}"
        cards.append(
            GameCard(
                kind=KIND_BOOK_LINE,
                ply=branch_ply,
                mode=mode,
                name=name,
                study_name=meta.title,
                chapter_url=meta.link,
                dedupe_key=key,
                note_tags=[*_tags(meta, KIND_BOOK_LINE), f"eco::{line.eco}"],
                move_text=line.eco,
                solution_text=f"{line.name}: {branch.variation_san(line.moves)}",
                eval_text="",
                body=export_pgn(game, meta.headers(name, key)),
                link_label=meta.link_label,
                opening=line.name,
            )
        )
    return cards


def _score_of(infos, move: chess.Move, color: chess.Color):
    for info in infos:
        pv = info.get("pv")
        if pv and pv[0] == move:
            return info["score"].pov(color)
    return None


def _error_card(meta: _Game, boards, moves, nodes, ply, options, engine, labeled) -> GameCard | None:
    board = boards[ply]
    played = moves[ply]
    user = options.user_color
    label = move_label(nodes[ply])

    scan = engine.analyse(board, chess.engine.Limit(time=options.move_time), multipv=3)
    best_score = scan[0]["score"].pov(user)
    best_mate = best_score.mate()
    mate_chance = best_mate is not None and 0 < best_mate <= options.max_mate
    if labeled and label not in ERROR_LABELS and not mate_chance:
        return None

    played_score = _score_of(scan, played, user)
    if played_score is None:
        info = engine.analyse(board, chess.engine.Limit(time=options.move_time), root_moves=[played])
        played_score = info["score"].pov(user)

    played_mate = played_score.mate()
    if mate_chance and not (played_mate is not None and played_mate > 0):
        kind = KIND_MISSED_MATE
    elif labeled:
        kind = label.lower() if label in ERROR_LABELS else None
    else:
        drop = win_percent(best_score) - win_percent(played_score)
        kind = next((k for threshold, k in WIN_DROP_KINDS if drop >= threshold), None)
    if kind not in options.kinds:
        return None

    deep = engine.analyse(board, chess.engine.Limit(time=options.solution_time), multipv=3)
    deep_best = deep[0]
    deep_score = deep_best["score"].pov(user)
    explored = _explored_alternative(nodes[ply]) if kind != KIND_MISSED_MATE else None

    if kind == KIND_MISSED_MATE:
        line = _mate_line(board, deep_best, options, engine)
    else:
        line = [explored or deep_best["pv"][0]]

    alternatives = []
    for info in deep:
        move = info["pv"][0]
        if move in line[:1] or move == played:
            continue
        close = win_percent(deep_score) - win_percent(info["score"].pov(user)) <= options.alt_threshold
        if close or move == deep_best["pv"][0]:
            alternatives.append(move)

    return _build_error_card(
        meta, boards, moves, ply, kind, label, line, alternatives,
        best_text=format_score(deep_score),
        played_text=format_score(played_score),
        mate=deep_score.mate() or best_mate,
    )


def has_server_analysis(game: chess.pgn.Game) -> bool:
    """Lichess analysis in the PGN: "X was best" comments with the best line as a variation."""
    return any(
        BEST_RE.search(node.comment or "") and len(node.parent.variations) > 1
        for node in game.mainline()
    )


def _pov_eval(text: str, user: chess.Color, mover_is_user: bool, before: bool) -> str:
    """
    A Lichess eval from "(0.22 → 1.85)" seen from the user: numbers are White's,
    "Mate in N" is for the side who had it before the move, against it after.
    """
    mate = re.match(r"Mate in (\d+)", text)
    if mate:
        good = before == mover_is_user  # the mover had the mate, or now gets mated
        return f"#{mate.group(1)}" if good else f"#-{mate.group(1)}"
    try:
        value = float(text)
    except ValueError:
        return text
    return f"{value if user == chess.WHITE else -value:+.1f}"


def _annotated_error_card(meta: _Game, boards, moves, nodes, ply, options) -> GameCard | None:
    """Error card from the server analysis of a Lichess game, without Stockfish."""
    node = nodes[ply]
    comment = node.comment or ""
    label = move_label(node)
    best = next((v for v in node.parent.variations if v is not node), None)
    if label not in ERROR_LABELS or best is None or not BEST_RE.search(comment):
        return None
    missed_mate = "checkmate sequence" in comment.lower()
    kind = KIND_MISSED_MATE if missed_mate else label.lower()
    if kind not in options.kinds:
        return None

    board = boards[ply]
    line = [best.move]
    if missed_mate:
        # The best line, when it goes all the way to the mate
        branch = [best.move, *(n.move for n in best.mainline())]
        test = board.copy()
        for move in branch:
            test.push(move)
        if test.is_checkmate():
            line = branch
    evals = EVAL_CHANGE_RE.search(comment)
    user = options.user_color
    best_text = _pov_eval(evals.group(1), user, True, before=True) if evals else ""
    played_text = _pov_eval(evals.group(2), user, True, before=False) if evals else ""
    mate = re.search(r"Mate in (\d+)", evals.group(1)) if evals else None
    return _build_error_card(
        meta, boards, moves, ply, kind, label, line, [],
        best_text=best_text,
        played_text=played_text,
        mate=int(mate.group(1)) if mate else len(line) // 2 + 1,
    )


def _build_error_card(
    meta: _Game, boards, moves, ply, kind, label, line, alternatives, best_text, played_text, mate
) -> GameCard:
    board = boards[ply]
    played = moves[ply]
    number = move_number(board)
    played_san = board.san(played)
    # The game move stays in the card marked as bad: repeating it fails the puzzle
    nags = {KIND_NAGS[kind]} if kind in KIND_NAGS else {LABEL_NAGS.get(label, 2)}
    game, node, mode = _puzzle_start(board, moves[ply - 1] if ply else None)
    solution_comment = tr("card.solution_comment", move=board.san(line[0]), score=best_text)
    sol = node.add_main_variation(line[0], comment=solution_comment)
    for alt in alternatives:
        node.add_variation(alt)
    node.add_variation(
        played,
        nags=nags,
        comment=tr("card.played_comment_eval", move=played_san, score=played_text),
    )
    cur = sol
    for move in line[1:]:
        cur = cur.add_main_variation(move)
    if kind == KIND_MISSED_MATE and len(line) > 1:
        last_board = cur.parent.board()
        for alt in mate_alternatives(last_board, cur.move):
            cur.parent.add_variation(alt)

    if kind == KIND_MISSED_MATE:
        name = tr("card.missed_mate", number=number, mate=mate)
    else:
        name = tr("card.error", number=number, move=played_san + _nag_suffix(nags), label=tr(f"kind.{kind}"))
    key = f"{meta.source}/{meta.game_id}/{ply}/{kind}"
    return GameCard(
        kind=kind,
        ply=ply,
        mode=mode,
        name=name,
        study_name=meta.title,
        chapter_url=meta.link,
        dedupe_key=key,
        note_tags=_tags(meta, kind),
        move_text=f"{number} {played_san}{_nag_suffix(nags)}",
        solution_text=board.variation_san(line) if len(line) > 1 else board.san(line[0]),
        eval_text=f"{played_text} → {best_text}" if played_text or best_text else "",
        body=export_pgn(game, meta.headers(name, key)),
        link_label=meta.link_label,
    )


def _mate_line(board: chess.Board, info, options, engine) -> list[chess.Move]:
    """Engine mating line; searched again for the exact mate if the PV was cut short."""
    for candidate in (info, None):
        if candidate is None:
            mate = info["score"].pov(board.turn).mate() or options.max_mate
            candidate = engine.analyse(board, chess.engine.Limit(mate=mate, time=options.solution_time * 3))
        pv = candidate.get("pv") or []
        test = board.copy()
        for move in pv:
            test.push(move)
        if pv and test.is_checkmate():
            return list(pv)
    return list(info["pv"][:1])


def _tags(meta: _Game, kind: str) -> list[str]:
    return [meta.source, f"{meta.source}::{kind}", f"{meta.source}::game::{meta.game_id}"]

