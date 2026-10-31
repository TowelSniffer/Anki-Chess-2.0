export interface UserConfigOpts {
  flipBoard: boolean;
  mirror: boolean;
  showDests: boolean;
  disableArrows: boolean;
  singleClickMove: boolean;
  animationTime: number;
  handicap: number;
  autoAdvance: boolean;
  timerAdvance: boolean;
  storePgnPath: boolean;
  strictScoring: boolean;
  hints: boolean;
  // The answer button suggested on the back from the puzzle's result
  autoGrade: 'off' | 'suggest' | 'answer';
  easyTime: number; // seconds; solved this fast without help suggests Easy (0: never)
  acceptVariations: boolean;
  playBothSides: boolean;
  timer: number;
  increment: number;
  randomOrientation: boolean;
  analysisTime: number;
  analysisLines: number;
  muteAudio: boolean;
  frontText: boolean;
  aiMoveTime: number;
  aiElo: number;
  aiEval: boolean;
  lightMode: boolean;
  pieceTheme: string,
  boardTheme: string
}
