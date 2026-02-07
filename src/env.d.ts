declare global {
  interface Window {
    mountChess?: () => void;
    USER_CONFIG?: Record<string, boolean>;
    CARD_CONFIG?: {
      modelName: string;
      cardName: string;
    };
  }
}

export {};
