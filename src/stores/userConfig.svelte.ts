import type { Color } from '@lichess-org/chessground/types';
import defaultConfig from '$anki/default_config.json';
import { updateAnkiChessTemplate, checkAnkiConnection } from '$anki/ankiConnect';
import { copyToClipboard } from '$utils/toolkit/copyToClipboard';

export class UserConfig {
  flipBoard = $state(window.USER_CONFIG?.['flipBoard'] ?? false);
  mirror = $state(window.USER_CONFIG?.['mirror'] ?? false);
  showDests = $state(window.USER_CONFIG?.['showDests'] ?? true);
  disableArrows = false;
  singleClickMove = $state(window.USER_CONFIG?.['singleClickMove'] ?? true);
  animationTime = 200;
  handicap = $state(window.USER_CONFIG?.['handicap'] ?? 1);
  autoAdvance = $state(window.USER_CONFIG?.['autoAdvance'] ?? false);
  handicapAdvance = false;
  timerAdvance = false;
  strictScoring = $state(window.USER_CONFIG?.['strictScoring'] ?? false);
  acceptVariations = true;
  timer = $state(window.USER_CONFIG?.timer ?? 5000); // 5 * 1000
  increment = $state(window.USER_CONFIG?.['increment'] ?? 1000); // 1 * 1000
  randomOrientation = $state(window.USER_CONFIG?.['randomOrientation'] ?? false);
  analysisTime = $state(window.USER_CONFIG?.['analysisTime'] ?? 4);
  analysisLines = $state(window.USER_CONFIG?.['analysisLines'] ?? 1);
  muteAudio = $state(window.USER_CONFIG?.['muteAudio'] ?? false);
  frontText = $state(window.USER_CONFIG?.['frontText'] ?? true);
  boardKey = $state<number>(0);
  isAnkiConnect = $state(false);

  lastSavedState = $state<Record<string, any>>({});

  // --- Derived State ---
  saveDue: boolean = $derived.by((): boolean => {
    return Object.keys(this.lastSavedState).some((key) => {
      const k = key as keyof UserConfig; // Cast key to valid class property
      return this[k] !== undefined && this[k] !== this.lastSavedState[key];
    });
  });

  constructor() {
    if (!window.USER_CONFIG) window.USER_CONFIG = defaultConfig;
    // Read directly from window (It's already there!)
    if (typeof window !== 'undefined' && window.USER_CONFIG) {
      this.lastSavedState = { ...window.USER_CONFIG };
      this._ankiConnectStatus();
    }
  }

  async _ankiConnectStatus() {
    this.isAnkiConnect = await checkAnkiConnection();
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
      if (this.isAnkiConnect) {
        updateAnkiChessTemplate(
          window.CARD_CONFIG['modelName'],
          window.CARD_CONFIG['cardName'],
          newConfig
        );
      } else {
        console.warn("AnkiConnect is offline. Settings saved to clipboard only.");
        // merge userConfig with defaults to ensure no keys are missing
        const finalConfig = { ...defaultConfig, ...newConfig };
        const clipboardString = `window.USER_CONFIG = ${JSON.stringify(finalConfig, null, 2)};`;
        copyToClipboard(clipboardString);
      }
    } else {
      console.warn("Cannot save: window.CARD_CONFIG is missing");
    }
  }
}

export const userConfig = new UserConfig();
