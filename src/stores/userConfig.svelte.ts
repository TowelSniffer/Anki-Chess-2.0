import type { Color } from '@lichess-org/chessground/types';
import { updateAnkiChessTemplate, checkAnkiConnection } from '$utils/ankiConnect';

export class UserConfig {
  flipBoard = $state(false);
  mirror = $state(false);
  showDests = $state(true);
  disableArrows = false;
  singleClickMove = true;
  animationTime = 200;
  handicap = $state(1);
  autoAdvance = false;
  handicapAdvance = false;
  timerAdvance = false;
  strictScoring = false;
  acceptVariations = true;
  timer = $state(5000); // 5 * 1000
  increment = $state(1000); // 1 * 1000
  randomOrientation = false;
  analysisTime = $state(4);
  analysisLines = $state(1);
  muteAudio = $state(false);
  frontText = $state(true);
  boardKey = $state<number>(0);

  lastSavedState = $state<Record<string, any>>({});

  // --- Derived State ---
  saveDue: boolean = $derived.by((): boolean => {
    return Object.keys(this.lastSavedState).some((key) => {
      const k = key as keyof UserConfig; // Cast key to valid class property
      return this[k] !== undefined && this[k] !== this.lastSavedState[key];
    });
  });

  constructor() {
    // Read directly from window (It's already there!)
    if (typeof window !== 'undefined' && window.USER_CONFIG) {
      this.applyConfig(window.USER_CONFIG);
      this.lastSavedState = { ...window.USER_CONFIG };
    }
  }

  applyConfig(config: Partial<UserConfig>) {
    Object.keys(config).forEach((key) => {
      const k = key as keyof UserConfig;
      if (this[k] !== undefined) {
        // @ts-ignore
        this[k] = config[key];
      }
    });
  }

  async save() {
    if (typeof window === 'undefined') return;

    // Prepare the new config object based on current class state
    // We use the keys from the last saved state to know what to save
    const newConfig: Record<string, any> = {};
    Object.keys(this.lastSavedState).forEach(key => {
      const k = key as keyof UserConfig;
      if (this[k] !== undefined) newConfig[key] = this[k];
    });

    // Update window.USER_CONFIG (for consistency with external scripts)
    window.USER_CONFIG = newConfig;

    // Update the internal baseline
    // CRITICAL: This mutation triggers 'saveDue' to re-run and return false
    this.lastSavedState = { ...newConfig };

    // Persist to Anki
    // Ensure window.CARD_CONFIG exists or fallback gracefully
    if (window.CARD_CONFIG) {
      // Check connection before firing
      const isConnected = await checkAnkiConnection();
      if (isConnected) {
        updateAnkiChessTemplate(
          window.CARD_CONFIG['modelName'],
          window.CARD_CONFIG['cardName'],
          newConfig
        );
      } else {
        console.warn("AnkiConnect is offline. Settings saved to session only.");
      }
    } else {
      console.warn("Cannot save: window.CARD_CONFIG is missing (not inside Anki?)");
    }
  }
}

export const userConfig = new UserConfig();
