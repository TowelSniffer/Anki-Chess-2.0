import type { Key } from '@lichess-org/chessground/types';
import type { Move, Square, Color } from 'chess.js';
import { Chess, SQUARES } from 'chess.js';
import type { CustomPgnMove } from '$Types/ChessStructs';

export type MoveInput =
  | string
  | { from: Square; to: Square; promotion?: string };

// --- type guards ---

// chess.js Square doesn't include a0
export function isSquare(key: Key): key is Square {
  return key !== 'a0';
}

// --- Utility ---

export function getTurnFromFen(fen: string): Color {
  // Split by space and take the second element (index 1)
  // FEN format: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  return fen.split(' ')[1] as Color;
}

// --- PGN State & Puzzle Logic ---

export function areMovesEqual(
  move1: Move | CustomPgnMove | null,
  move2: Move | CustomPgnMove | null,
): boolean {
  // Check for null or undefined moves
  if (!move1 || !move2) {
    return false;
  }

  return move1.before === move2.before && move1.after === move2.after;
}

export function isMoveLegal(moveInput: MoveInput, fen: string): boolean {
  const tempChess = new Chess(fen);
  const legalMoves = tempChess.moves({ verbose: true });

  if (typeof moveInput === 'string') {
    // lan or san
    return legalMoves.some(
      (move) => move.san === moveInput || move.lan === moveInput,
    );
  } else {
    // chess.js move object
    return legalMoves.some(
      (move) =>
        move.from === moveInput.from &&
        move.to === moveInput.to &&
        (!moveInput.promotion && !move.promotion || move.promotion === moveInput.promotion),
    );
  }
}

export function getLegalMove(moveInput: MoveInput, fen: string): Move | null {
  if (!isMoveLegal(moveInput, fen)) {
    return null;
  }

  const tempChess = new Chess(fen);
  return tempChess.move(moveInput);
}

export function isPromotion(orig: Square, dest: Square, fen: string): boolean {
  if (SQUARES.includes(orig)) {
    const tempChess = new Chess(fen);
    const piece = tempChess.get(orig);
    if (!piece || piece.type !== 'p') {
      return false;
    }

    // check if the dest is back rank
    const rank = dest.charAt(1);
    if (piece.color === 'w' && rank === '8') return true;
    if (piece.color === 'b' && rank === '1') return true;
  } else {
    console.error('Invalid square passed:', orig, dest);
  }
  return false;
}

/**
 * Maps valid legal move destinations
 */
export function toDests(fen: string): Map<Square, Square[]> {
  function isMoveObject(move: object): move is Move {
    return typeof move === 'object' && move !== null;
  }
  const dests = new Map<Square, Square[]>();
  const tempChess = new Chess(fen);
  SQUARES.forEach((s) => {
    const ms = tempChess.moves({ square: s, verbose: true });
    const moveObjects = ms.filter(isMoveObject);
    if (moveObjects.length)
      dests.set(
        s,
        moveObjects.map((m) => m.to),
      );
  });
  return dests;
}
