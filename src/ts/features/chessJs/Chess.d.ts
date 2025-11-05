import type { Square } from "chess.js";

export type Promotions = "q" | "r" | "b" | "n";
export type SanPromotions = "Q" | "R" | "B" | "N";

// chess js moves can be san, lan or object
export type MoveInput =
  | string
  | { from: Square; to: Square; promotion?: Promotions };
