// src/Types/StoreInterfaces.ts
import type { Color as CgColor } from '@lichess-org/chessground/types';
import type { Api } from '@lichess-org/chessground/api';
import type { Square, Chess, Move, Color } from 'chess.js';
import type {
  CustomPgnGame,
  CustomPgnMove,
  PgnPath,
  BoardModes,
  PuzzleScored,
  CustomShape
} from '$Types/ChessStructs';

export interface IPgnGameStore {
  // --- STATE (Variables) ---
  cg: Api | null;
  boardMode: BoardModes;
  aiDelayTime: number;
  rootGame: CustomPgnGame | undefined;
  pgnPath: PgnPath;
  orientation: CgColor;
  errorCount: number;
  selectedPiece: Square | undefined;
  startFen: string;
  playerColor: CgColor;
  opponentColor: CgColor;
  wrongMoveDebounce: ReturnType<typeof setTimeout> | null;
  pendingPromotion: { from: Square; to: Square } | null;
  customAnimation: { fen: string; animate: boolean } | null;
  viewOnly: boolean;

  // --- DERIVED (Getters) ---
  readonly isPuzzleComplete: boolean;
  readonly currentPathKey: string;
  readonly currentMove: CustomPgnMove | null;
  readonly fen: string;
  readonly turn: Color;
  readonly boardConfig: any;
  readonly hasNext: boolean;
  readonly systemShapes: CustomShape[];
  readonly puzzleScore: PuzzleScored;
  readonly rootMoves: CustomPgnMove[] | undefined;
  readonly dests: Map<Square, Square[]>;

  // Chess.js helpers
  readonly inCheck: boolean;
  readonly isCheckmate: boolean;
  readonly isDraw: boolean;
  readonly isThreefoldRepetition: boolean;
  readonly isGameOver: boolean;

  // --- METHODS ---
  next(): void;
  prev(): void;
  reset(): void;
  replayHistory(): Chess;

  // Note: loadCgInstance depends on an HTML element
  loadCgInstance(boardContainer: HTMLDivElement): void;

  getMoveByPath(path: PgnPath): CustomPgnMove | null;
  toggleOrientation(): void;
  addMove(move: Move): void;

  setPendingPromotion(from: Square, to: Square): void;
  cancelPromotion(): void;
  newChess(fen: string): Chess;
}
