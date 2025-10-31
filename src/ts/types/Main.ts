import type { Color } from "chessground/types";
import type { Api } from "chessground/api";
import type { Chess } from "chess.js";

import type { CustomPgnMove, CustomPgnGame, PgnPath } from "./Pgn";
import type { CustomShape } from "./CustomChessgroundShapes";

// config types
type BoardModes = "Viewer" | "Puzzle";

export type ErrorTrack = null | "incorrect" | "correct" | "correctTime";

export type MirrorState =
  | "original"
  | "original_mirror"
  | "invert"
  | "invert_mirror";

// --- interfaces ---
export interface Config {
  pgn: string;
  ankiText: string | null;
  frontText: boolean;
  muteAudio: boolean;
  showDests: boolean;
  singleClickMove: boolean;
  handicap: number;
  strictScoring: boolean;
  acceptVariations: boolean;
  disableArrows: boolean;
  flipBoard: boolean;
  boardMode: "Viewer" | "Puzzle";
  background: string | null;
  mirror: boolean;
  randomOrientation: boolean;
  autoAdvance: boolean;
  handicapAdvance: boolean;
  timer: number;
  increment: number;
  timerAdvance: boolean;
  timerScore: boolean;
  analysisTime: number;
  animationTime: number;
}

export interface State {
  startFen: string;
  boardRotation: Color;
  playerColour: Color;
  opponentColour: Color;
  solvedColour:
    | null
    | "var(--correct-color)"
    | "var(--incorrect-color)"
    | "var(--perfect-color)";
  errorTrack: ErrorTrack;
  chessGroundShapes: CustomShape[];
  errorCount: number;
  puzzleTime: number;
  puzzleComplete: boolean;
  navTimeout: number | null;
  isStockfishBusy: boolean;
  stockfishRestart: boolean; // Error guard for stockfish
  analysisToggledOn: boolean;
  pgnPath: PgnPath;
  pgnPathMap: Map<string, CustomPgnMove>;
  lastMove: CustomPgnMove | null;
  mirrorState: MirrorState | null;
  cgwrap: HTMLDivElement;
  cg: Api;
  chess: Chess;
  parsedPGN: CustomPgnGame;
  delayTime: number;
}

// --- Type Guards ---

// mirrorState
export function isMirrorState(
  mirrorState: string | null,
): mirrorState is MirrorState {
  if (!mirrorState) return false;
  const mirrorStates = [
    "original",
    "original_mirror",
    "invert",
    "invert_mirror",
  ];
  const mirrorStateCheck = mirrorStates.includes(mirrorState);
  return mirrorStateCheck;
}

// errorTrack
export function isSolvedMode(
  solvedState: null | string,
): solvedState is ErrorTrack {
  if (!solvedState) return false;
  const solvedModes = ["correct", "correctTime", "incorrect"];
  const modeCheck = solvedModes.includes(solvedState);
  return modeCheck;
}

// boardMode
export function isBoardMode(mode: string): mode is BoardModes {
  const boardModes = ["Viewer", "Puzzle"];
  const modeCheck = boardModes.includes(mode);
  return modeCheck;
}
