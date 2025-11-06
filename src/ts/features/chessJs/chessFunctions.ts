import type { Color, Key } from "chessground/types";
import type { Move, Square } from "chess.js";
import { Chess, SQUARES } from "chess.js";

import type { CustomPgnMove } from "../pgn/Pgn";
import type { MoveInput } from "./Chess";

import { state } from "../../core/state";

// --- type guards ---

// chess.js Square doesn't include a0
export function isSquare(key: Key): key is Square {
  return key !== "a0";
}

// --- Utility ---

export function getcurrentTurnColor(): Color {
  return state.pgnTrack.turn === "w" ? "white" : "black";
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

function isMoveLegal(moveInput: MoveInput): boolean {
  const tempChess = new Chess(state.pgnTrack.fen);
  const legalMoves = tempChess.moves({ verbose: true });

  if (typeof moveInput === "string") {
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
        (!moveInput.promotion || move.promotion === moveInput.promotion),
    );
  }
}

export function getLegalMove(moveInput: MoveInput): Move | null {
  if (!isMoveLegal(moveInput)) {
    return null;
  }

  const tempChess = new Chess(state.pgnTrack.fen);
  return tempChess.move(moveInput);
}

export function isPromotion(orig: Square, dest: Square): boolean {
  if (SQUARES.includes(orig)) {
    const tempChess = new Chess(state.pgnTrack.fen);
    const piece = tempChess.get(orig);
    if (!piece || piece.type !== "p") {
      return false;
    }

    // check if the dest is back rank
    const rank = dest.charAt(1);
    if (piece.color === "w" && rank === "8") return true;
    if (piece.color === "b" && rank === "1") return true;
  } else {
    console.error("Invalid square passed:", orig, dest);
  }
  return false;
}

export function toDests(): Map<Square, Square[]> {
  function isMoveObject(move: object): move is Move {
    return typeof move === "object" && move !== null;
  }
  // Map valid destinations
  const dests = new Map<Square, Square[]>();
  const tempChess = new Chess(state.pgnTrack.fen);
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
