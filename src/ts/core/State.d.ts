import type { Color } from "chessground/types";
import type { Color as ChessJsColor } from "chess.js";
import type { Api } from "chessground/api";

import type { MirrorState, ErrorTrack } from "./Config";
import type {
  CustomPgnMove,
  CustomPgnGame,
  PgnPath,
} from "../../features/pgn/Pgn";
import type { CustomShape } from "../features/board/CustomChessgroundShapes";

interface Puzzle {
  errorCount: number;
  readonly delayTime: number;
  remainingTime: number;
}

interface AnkiPersist {
  errorTrack: ErrorTrack;
  readonly mirrorState: MirrorState | null;
  puzzleComplete: boolean;
  readonly pgnPath: PgnPath;
}

interface PgnTrack {
  pgnPath: PgnPath;
  pgnPathMap: Map<string, CustomPgnMove>;
  lastMove: CustomPgnMove | null;
  readonly fen: string;
  readonly turn: ChessJsColor;
}

type SolvedColour =
  | null
  | "var(--correct-color)"
  | "var(--incorrect-color)"
  | "var(--perfect-color)";
interface Board {
  solvedColour: SolvedColour;
  boardRotation: Color;
  playerColour: Color;
  opponentColour: Color;
  chessGroundShapes: CustomShape[];
  readonly inCheck: boolean;
  borderPercent: number;
}

export interface State {
  readonly startFen: string;
  parsedPGN: CustomPgnGame;
  puzzle: Puzzle;
  ankiPersist: AnkiPersist;
  pgnTrack: PgnTrack;
  board: Board;
  readonly cgwrap: HTMLDivElement;
  cg: Api;
}
