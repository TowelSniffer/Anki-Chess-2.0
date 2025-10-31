import type { Color } from "chessground/types";
import type { Move, Square } from "chess.js";
import { Chess, SQUARES } from "chess.js";

import type { CustomPgnMove } from "../../types/Pgn";
import type { MoveInput } from "../../types/Chess";
import { isMoveObject } from "../../types/Chess";

import { state } from "../../core/state";

// --- Utility ---

export function getcurrentTurnColor(): Color {
  return state.chess.turn() === "w" ? "white" : "black";
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
  const legalMoves = state.chess.moves({ verbose: true });

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
        (move.promotion || "q") === (moveInput.promotion || "q"), // Default to queen for comparison
    );
  }
}

export function getLegalMove(moveInput: MoveInput): Move | null {
  if (!isMoveLegal(moveInput)) {
    return null;
  }

  const tempChess = new Chess(state.chess.fen());
  return tempChess.move(moveInput);
}

export function isPromotion(orig: Square, dest: Square): boolean {
  if (SQUARES.includes(orig)) {
    const piece = state.chess.get(orig);
    if (!piece || piece.type !== "p") {
      return false;
    }

    // check if the dest is back rank
    const rank = dest.charAt(1);
    if (piece.color === "w" && rank === "8") return true;
    if (piece.color === "b" && rank === "1") return true;
  } else {
    console.error("Invalid square passed:", orig);
  }
  return false;
}

export function toDests(): Map<Square, Square[]> {
  // Map valid destinations
  const dests = new Map<Square, Square[]>();
  SQUARES.forEach((s) => {
    const ms = state.chess.moves({ square: s, verbose: true });
    const moveObjects = ms.filter(isMoveObject);
    if (moveObjects.length)
      dests.set(
        s,
        moveObjects.map((m) => m.to),
      );
  });
  return dests;
}
