import type { Square } from "chess.js";
import type { DrawShape } from "chessground/draw";

export type CustomShape = Omit<DrawShape, "brush" | "orig" | "dest"> & {
  // Modify chessground DrawShape to include move information
  orig: Square;
  dest: Square;
  san?: string;
  brush?: CustomShapeBrushes;
};

// chessground custom brushes
export type CustomShapeBrushes =
  | "stockfish"
  | "stockfinished"
  | "mainLine"
  | "altLine"
  | "blunderLine"
  | "userDrawn";
