declare global {
  interface Window {
    mountChess?: () => void;
    USER_CONFIG?: Record<string, boolean | number>;
    CARD_CONFIG?: {
      modelName: string;
      cardName: string;
    };
  }
}

export {};
