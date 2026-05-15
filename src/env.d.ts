import type { UserConfigOpts } from '$Types/UserConfig';

declare global {
  interface Window {
    mountChess?: () => void;
    USER_CONFIG?: Partial<UserConfig>;
    CARD_CONFIG?: {
      modelName: string;
      cardName: string;
    };
    updateChessMode?: (mode: string) => void;
    updateRawPgn?: (pgn: string) => void;
  }
  const showAnswer: () => void | any;
  const AnkiDroidJS: () => void | any;
  const showAnswer: () => void | any;
  const pycmd: (command: string) => void | any;
}

export {};
