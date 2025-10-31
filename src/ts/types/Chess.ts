import type { Key } from "chessground/types";
import type { Move, Square } from "chess.js";

export type Promotions = "q" | "r" | "b" | "n";

// chess js moves can be san, lan or object
export type MoveInput =
  | string
  | { from: Square; to: Square; promotion?: Promotions };

// --- type guards ---

// chess.js Square doesn't include a0
export function isSquare(key: Key): key is Square {
  return key !== "a0";
}

// checks if an object is Move
export function isMoveObject(move: object): move is Move {
  return typeof move === "object" && move !== null;
}
