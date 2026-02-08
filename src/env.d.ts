interface UserConfig {
  flipBoard: boolean;
  mirror: boolean;
  showDests: boolean;
  disableArrows: boolean;
  singleClickMove: boolean;
  animationTime: number;
  handicap: number;
  autoAdvance: boolean;
  handicapAdvance: boolean;
  timerAdvance: boolean;
  strictScoring: boolean;
  acceptVariations: boolean;
  timer: number;
  increment: number;
  randomOrientation: boolean;
  analysisTime: number;
  analysisLines: number;
  muteAudio: boolean;
  frontText: boolean;
}

declare global {
  interface Window {
    mountChess?: () => void;
    USER_CONFIG?: Partial<UserConfig>;
    CARD_CONFIG?: {
      modelName: string;
      cardName: string;
    };
  }
}

export {};
