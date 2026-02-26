import type { Square } from 'chess.js';
import type { DrawShape } from '@lichess-org/chessground/draw';
import type { PgnMove, GameComment, PgnGame } from '@mliebelt/pgn-types';

export type PuzzleScored = 'perfect' | 'correct' | 'incorrect' | null;
/**
 * Mlieberts promotion is uppercase. Gotten from san (ie dxc8=N)
 * chess.js promotion is lower case
 */
export type SanPromotions = 'Q' | 'N' | 'R' | 'B';
export type ChessJsPromotions = 'q' | 'n' | 'r' | 'b';

export type BoardModes = 'Viewer' | 'Puzzle' | 'Study' | 'AI';
export type PgnPath = (number | 'v')[];

export type CustomShapeBrushes =
  | 'stockfish'
  | 'stockfishAlt'
  | 'mainLine'
  | 'goodLine'
  | 'altLine'
  | 'blunderLine'
  | 'nagOnly';

export type CustomShape = Omit<DrawShape, 'brush' | 'orig' | 'dest'> & {
  orig: Square;
  dest?: Square;
  san?: string;
  brush?: CustomShapeBrushes | string;
};

export type CustomGameComment = GameComment & {
  EV: string;
};

export type CustomPgnMove = Omit<
  PgnMove,
  'variations' | 'moveNumber' | 'drawOffer' | 'commentDiag'
> & {
  before: string;
  after: string;
  from: Square;
  to: Square;
  flags: string;
  san: string;
  promotion: SanPromotions | undefined;
  drawOffer?: boolean;
  moveNumber?: number;
  commentDiag?: CustomGameComment;
  pgnPath: PgnPath;
  variations: CustomPgnMove[][];
  history: string;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  isThreefoldRepetition: boolean;
};

export type CustomPgnGame = Omit<PgnGame, 'moves'> & {
  moves: CustomPgnMove[];
};
