// config types
type BoardModes = "Viewer" | "Puzzle";

export type ErrorTrack = null | "incorrect" | "correct" | "correctTime";

export type MirrorState =
  | "original"
  | "original_mirror"
  | "invert"
  | "invert_mirror";

// --- sub interfaces ---

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
