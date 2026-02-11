import type { UserConfigOpts } from '$Types/UserConfig';
import defaultConfig from '$anki/default_config.json';
import { updateAnkiChessTemplate, checkAnkiConnection } from '$anki/ankiConnect';
import { copyToClipboard } from '$utils/toolkit/copyToClipboard';

function getConfig<K extends keyof UserConfigOpts>(key: K): UserConfigOpts[K] {
  const stored = sessionStorage.getItem(key);

  if (stored !== null) {
    // We cast the return values as UserConfigOpts[K] because we trust
    // our logic matches the expected type for that key.
    if (stored === 'true') return true as UserConfigOpts[K];
    if (stored === 'false') return false as UserConfigOpts[K];
    return parseInt(stored, 10) as UserConfigOpts[K];
  }

  // Fallback
  return (window.USER_CONFIG?.[key] ?? defaultConfig[key as keyof typeof defaultConfig]) as UserConfigOpts[K];
}

export class UserConfig {
  opts = $state<UserConfigOpts>({
    flipBoard: getConfig('flipBoard'),
    mirror: getConfig('mirror'),
    showDests: getConfig('showDests'),
    singleClickMove: getConfig('singleClickMove'),
    handicap: getConfig('handicap'),
    autoAdvance: getConfig('autoAdvance'),
    strictScoring: getConfig('strictScoring'),
    timer: getConfig('timer'),
    increment: getConfig('increment'),
    randomOrientation: getConfig('randomOrientation'),
    analysisTime: getConfig('analysisTime'),
    analysisLines: getConfig('analysisLines'),
    muteAudio: getConfig('muteAudio'),
    frontText: getConfig('frontText'),

    // runtime-only flags separate
    animationTime: 200,
    disableArrows: false,
    handicapAdvance: false,
    timerAdvance: false,
    acceptVariations: true,
  });




  boardKey = $state<number>(0);
  isAnkiConnect = $state(false);
  lastSavedState = $state<Record<string, any>>({});

  // --- Derived State ---
  saveDue: boolean = $derived(JSON.stringify(this.opts) !== JSON.stringify(this.lastSavedState));

  constructor() {
    if (!window.USER_CONFIG) window.USER_CONFIG = { ...this.opts };
    // Read directly from window (It's already there!)
    if (typeof window !== 'undefined' && window.USER_CONFIG) {
      this.lastSavedState = { ...window.USER_CONFIG };
      this._ankiConnectStatus();
    }
  }

  async _ankiConnectStatus() {
    this.isAnkiConnect = await checkAnkiConnection();
  }

  async save() {
    if (typeof window === 'undefined') return;

    Object.assign(this.lastSavedState, { ...this.opts });

    // Update window.USER_CONFIG (for consistency with external scripts)
    window.USER_CONFIG = { ...this.lastSavedState };

    // Persist to Anki
    // Ensure window.CARD_CONFIG exists or fallback gracefully
    if (window.CARD_CONFIG) {
      // Check connection before firing
      if (this.isAnkiConnect) {
        updateAnkiChessTemplate(
          window.CARD_CONFIG['modelName'],
          window.CARD_CONFIG['cardName'],
          this.lastSavedState
        );
      } else {
        console.warn("AnkiConnect is offline. Settings saved to clipboard only.");
        const clipboardString = `window.USER_CONFIG = ${JSON.stringify({ ...this.lastSavedState }, null, 2)};`;
        copyToClipboard(clipboardString);
      }
    } else {
      console.warn("Cannot save: window.CARD_CONFIG is missing");
    }
  }
}

export const userConfig = new UserConfig();
