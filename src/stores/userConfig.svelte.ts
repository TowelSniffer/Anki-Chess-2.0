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
    disableArrows: getConfig('disableArrows'),
    singleClickMove: getConfig('singleClickMove'),
    animationTime: getConfig('animationTime'),
    handicap: getConfig('handicap'),
    autoAdvance: getConfig('autoAdvance'),
    timerAdvance: getConfig('timerAdvance'),
    strictScoring: getConfig('strictScoring'),
    acceptVariations: getConfig('acceptVariations'),
    timer: getConfig('timer'),
    increment: getConfig('increment'),
    randomOrientation: getConfig('randomOrientation'),
    analysisTime: getConfig('analysisTime'),
    analysisLines: getConfig('analysisLines'),
    muteAudio: getConfig('muteAudio'),
    frontText: getConfig('frontText')
  });




  boardKey = $state<number>(0);
  isAnkiConnect = $state(false);
  hasAddon = $state(false);

  lastSavedState = $state<Record<string, any>>({});

  // --- Derived State ---
  saveDue: boolean = $derived(JSON.stringify(this.opts) !== JSON.stringify(this.lastSavedState));

  constructor() {
    if (typeof window !== 'undefined' && window.USER_CONFIG) {
      // We clone it to break reference
      this.lastSavedState = { ...window.USER_CONFIG };
    } else {
        // If no window config, we "are" the config
        if (typeof window !== 'undefined') {
            window.USER_CONFIG = $state.snapshot(this.opts);
        }
    }
    this._checkConnections();
  }

  async _checkConnections() {
    // Check for specific Add-on Marker
    if (typeof pycmd !== "undefined") {
      pycmd("ankiChess:handshake");

      // Wait a tiny bit for Python to execute the eval
      await new Promise(r => setTimeout(r, 50));

      if ((window as any).ANKI_CHESS_ADDON_INSTALLED === true) {
         this.hasAddon = true;
      }
    }

    // Check for AnkiConnect (Localhost)
    this.isAnkiConnect = await checkAnkiConnection();
  }

  async save() {
    if (typeof window === 'undefined') return;

    Object.assign(this.lastSavedState, { ...this.opts });

    // Update window.USER_CONFIG (for consistency with external scripts)
    window.USER_CONFIG = { ...this.lastSavedState };

    // --- STRATEGY 1: ankiChess companion addon ---
    if (this.hasAddon) {
      // We send just the config. Python can figure out the current model.
      const payload = JSON.stringify(this.lastSavedState);
      pycmd(`ankiChess:saveConfig:${payload}`);
      return;
    }

    // --- STRATEGY 2: AnkiConnect (Fallback) ---
    if (window.CARD_CONFIG && this.isAnkiConnect) {
       updateAnkiChessTemplate(
          window.CARD_CONFIG['modelName'],
          window.CARD_CONFIG['cardName'],
          this.lastSavedState
        );
       return;
    }

    // --- STRATEGY 3: Clipboard (Mobile/Manual) ---
    console.warn("No connection found. Settings copied to clipboard.");
    const clipboardString = `window.USER_CONFIG = ${JSON.stringify({ ...this.lastSavedState }, null, 2)};`;
    copyToClipboard(clipboardString);
  }
}

export const userConfig = new UserConfig();
