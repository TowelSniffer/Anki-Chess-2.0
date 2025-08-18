import { attacks, bishopAttacks, kingAttacks, knightAttacks, queenAttacks, rookAttacks } from './attacks.js';
import { Position } from './chess.js';
import { SquareSet } from './squareSet.js';
import { CastlingSide, FILE_NAMES, isDrop, Move, RANK_NAMES, SquareName } from './types.js';
import { charToRole, defined, makeSquare, opposite, parseSquare, roleToChar, squareFile, squareRank } from './util.js';

const makeSanWithoutSuffix = (pos: Position, move: Move): string => {
  let san = '';
  if (isDrop(move)) {
    if (move.role !== 'pawn') san = roleToChar(move.role).toUpperCase();
    san += '@' + makeSquare(move.to);
  } else {
    const role = pos.board.getRole(move.from);
    if (!role) return '--';
    if (role === 'king' && (pos.board[pos.turn].has(move.to) || Math.abs(move.to - move.from) === 2)) {
      san = move.to > move.from ? 'O-O' : 'O-O-O';
    } else {
      const capture = pos.board.occupied.has(move.to)
        || (role === 'pawn' && squareFile(move.from) !== squareFile(move.to));
      if (role !== 'pawn') {
        san = roleToChar(role).toUpperCase();

        // Disambiguation
        let others;
        if (role === 'king') others = kingAttacks(move.to).intersect(pos.board.king);
        else if (role === 'queen') others = queenAttacks(move.to, pos.board.occupied).intersect(pos.board.queen);
        else if (role === 'rook') others = rookAttacks(move.to, pos.board.occupied).intersect(pos.board.rook);
        else if (role === 'bishop') others = bishopAttacks(move.to, pos.board.occupied).intersect(pos.board.bishop);
        else others = knightAttacks(move.to).intersect(pos.board.knight);
        others = others.intersect(pos.board[pos.turn]).without(move.from);
        if (others.nonEmpty()) {
          const ctx = pos.ctx();
          for (const from of others) {
            if (!pos.dests(from, ctx).has(move.to)) others = others.without(from);
          }
          if (others.nonEmpty()) {
            let row = false;
            let column = others.intersects(SquareSet.fromRank(squareRank(move.from)));
            if (others.intersects(SquareSet.fromFile(squareFile(move.from)))) row = true;
            else column = true;
            if (column) san += FILE_NAMES[squareFile(move.from)];
            if (row) san += RANK_NAMES[squareRank(move.from)];
          }
        }
      } else if (capture) san = FILE_NAMES[squareFile(move.from)];

      if (capture) san += 'x';
      san += makeSquare(move.to);
      if (move.promotion) san += '=' + roleToChar(move.promotion).toUpperCase();
    }
  }
  return san;
};

export const makeSanAndPlay = (pos: Position, move: Move): string => {
  const san = makeSanWithoutSuffix(pos, move);
  pos.play(move);
  if (pos.outcome()?.winner) return san + '#';
  if (pos.isCheck()) return san + '+';
  return san;
};

export const makeSanVariation = (pos: Position, variation: Move[]): string => {
  pos = pos.clone();
  const line = [];
  for (let i = 0; i < variation.length; i++) {
    if (i !== 0) line.push(' ');
    if (pos.turn === 'white') line.push(pos.fullmoves, '. ');
    else if (i === 0) line.push(pos.fullmoves, '... ');
    const san = makeSanWithoutSuffix(pos, variation[i]);
    pos.play(variation[i]);
    line.push(san);
    if (san === '--') return line.join('');
    if (i === variation.length - 1 && pos.outcome()?.winner) line.push('#');
    else if (pos.isCheck()) line.push('+');
  }
  return line.join('');
};

export const makeSan = (pos: Position, move: Move): string => makeSanAndPlay(pos.clone(), move);

export const parseSan = (pos: Position, san: string): Move | undefined => {
  const ctx = pos.ctx();

  // Normal move
  const match = san.match(/^([NBRQK])?([a-h])?([1-8])?[-x]?([a-h][1-8])(?:=?([nbrqkNBRQK]))?[+#]?$/) as
    | [
      string,
      'N' | 'B' | 'R' | 'Q' | 'K' | undefined,
      string | undefined,
      string | undefined,
      SquareName,
      'n' | 'b' | 'r' | 'q' | 'k' | 'N' | 'B' | 'R' | 'Q' | 'K' | undefined,
    ]
    | null;
  if (!match) {
    // Castling
    let castlingSide: CastlingSide | undefined;
    if (san === 'O-O' || san === 'O-O+' || san === 'O-O#') castlingSide = 'h';
    else if (san === 'O-O-O' || san === 'O-O-O+' || san === 'O-O-O#') castlingSide = 'a';
    if (castlingSide) {
      const rook = pos.castles.rook[pos.turn][castlingSide];
      if (!defined(ctx.king) || !defined(rook) || !pos.dests(ctx.king, ctx).has(rook)) return;
      return {
        from: ctx.king,
        to: rook,
      };
    }

    // Drop
    const match = san.match(/^([pnbrqkPNBRQK])?@([a-h][1-8])[+#]?$/) as
      | [string, 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K' | undefined, SquareName]
      | null;
    if (!match) return;
    const move = {
      role: match[1] ? charToRole(match[1]) : 'pawn',
      to: parseSquare(match[2]),
    };
    return pos.isLegal(move, ctx) ? move : undefined;
  }
  const role = match[1] ? charToRole(match[1]) : 'pawn';
  const to = parseSquare(match[4]);

  const promotion = match[5] ? charToRole(match[5]) : undefined;
  if (!!promotion !== (role === 'pawn' && SquareSet.backranks().has(to))) return;
  if (promotion === 'king' && pos.rules !== 'antichess') return;

  let candidates = pos.board.pieces(pos.turn, role);
  if (role === 'pawn' && !match[2]) candidates = candidates.intersect(SquareSet.fromFile(squareFile(to)));
  else if (match[2]) candidates = candidates.intersect(SquareSet.fromFile(match[2].charCodeAt(0) - 'a'.charCodeAt(0)));
  if (match[3]) candidates = candidates.intersect(SquareSet.fromRank(match[3].charCodeAt(0) - '1'.charCodeAt(0)));

  // Optimization: Reduce set of candidates
  const pawnAdvance = role === 'pawn' ? SquareSet.fromFile(squareFile(to)) : SquareSet.empty();
  candidates = candidates.intersect(
    pawnAdvance.union(attacks({ color: opposite(pos.turn), role }, to, pos.board.occupied)),
  );

  // Check uniqueness and legality
  let from;
  for (const candidate of candidates) {
    if (pos.dests(candidate, ctx).has(to)) {
      if (defined(from)) return; // Ambiguous
      from = candidate;
    }
  }
  if (!defined(from)) return; // Illegal

  return {
    from,
    to,
    promotion,
  };
};
