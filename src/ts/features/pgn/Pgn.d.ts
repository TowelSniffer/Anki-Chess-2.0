import type { Square } from "chess.js";
import type { PgnMove, PgnGame, GameComment } from "@mliebelt/pgn-types";

// custom Pgnviewer types. We augment additional move data

export type CustomPgnMove = Omit<
  PgnMove,
  `variations` | "moveNumber" | "drawOffer" | "commentDiag"
> & {
  before: string;
  after: string;
  from: Square;
  to: Square;
  flags: string;
  san: string;
  drawOffer?: boolean;
  moveNumber?: number;
  commentDiag?: GameComment;
  pgnPath: PgnPath;
  variations: CustomPgnMove[][];
};

export type CustomPgnGame = Omit<PgnGame, "moves"> & {
  moves: CustomPgnMove[];
};

export type PgnPath = ("v" | number)[];

// A map for character-to-character substitution.
export type NotationMap = { [key: string]: string };
