import type { UserConfigOpts } from '$Types/UserConfig';

declare global {
  interface Window {
    mountChess?: () => void;
    USER_CONFIG?: Partial<UserConfig>;
    CARD_CONFIG?: {
      modelName: string;
      cardName: string;
    };
  }
  const AnkiDroidJS: (command: string) => void | any;
  const pycmd: (command: string) => void | any;
}

export {};
