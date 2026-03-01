// src/Types/StoreInterfaces.ts
import type { Color as CgColor, Key } from '@lichess-org/chessground/types';
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
import type { EngineStore } from '$stores/engineStore.svelte';
  import type { TimerStore } from '$stores/timerStore.svelte';

/*
 * We define a seperate Interface for gamestore to avoid
 * circular dependecy issues with Type imports
*/

export interface IPgnGameStore {
  // --- Stores ---
  engineStore: EngineStore;
  timerStore: TimerStore;

  // TRACKERS
  lastSelected: Key | undefined;

  // --- STATE (Variables) ---
  cg: Api | null;
  boardMode: BoardModes;
  rootGame: CustomPgnGame | undefined;
  pgnPath: PgnPath;
  orientation: CgColor;
  errorCount: number;
  pendingPromotion: { from: Square; to: Square } | null;
  customAnimation: { fen: string; animate: boolean } | null;
  startFen: string;
  playerColor: CgColor;
  opponentColor: CgColor;

  // --- DERIVED (Getters) ---
  readonly aiDelayTime: number;
  readonly isPuzzleComplete: boolean;
  readonly currentPathKey: string;
  readonly currentMove: CustomPgnMove | null;
  readonly fen: string;
  readonly viewOnly: boolean;
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
  readonly prevPath: PgnPath | null;

  // --- METHODS ---
  loadNewGame(rawPGN: string): void;
  setMoveDebounce(): void;
  next(): void;
  prev(): void;
  reset(): void;

  // Note: loadCgInstance depends on an HTML element
  loadCgInstance(boardContainer: HTMLDivElement): void;

  getMoveByPath(path: PgnPath): CustomPgnMove | null;
  toggleOrientation(): void;
  addMove(move: Move): void;

  setPendingPromotion(from: Square, to: Square): void;
  cancelPromotion(): void;
  newChess(fen: string): Chess;
  destroy(): void;
}
