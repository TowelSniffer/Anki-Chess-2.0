import type { UserConfigOpts } from '$Types/UserConfig';
import defaultConfig from '$anki/default_config.json';
import { updateAnkiChessTemplate, checkAnkiConnection } from '$anki/ankiConnect';
import { copyToClipboard } from '$utils/toolkit/copyToClipboard';

export class UserConfig {

  opts = $state<UserConfigOpts>(this._readConfigFromWindow());

  isAnkiConnect = $state(false);
  hasAddon = $state(false);

  lastSavedState = $state<Record<string, any>>({});

  // --- Derived State ---
  saveDue: boolean = $derived(JSON.stringify(this.opts) !== JSON.stringify(this.lastSavedState));

  constructor() {
    $effect.root(() => {
      // handle config changes
      $effect(() => {
        // Loop through options and update sessionStorage
        for (const [key, value] of Object.entries(this.opts)) {
          const getPrefixedKey = (key: string) => `${window.CARD_CONFIG?.modelName ?? ''}${key}`;
          sessionStorage.setItem(getPrefixedKey(key), String(value));
        }
      });
    });
  }

  // --- METHODS ---

  refresh() {
    // Force a re-read of window.USER_CONFIG and window.CARD_CONFIG
    this.opts = this._readConfigFromWindow();

    // Update legacy state tracking
    if (typeof window !== 'undefined' && window.USER_CONFIG) {
      this.lastSavedState = { ...window.USER_CONFIG };
    } else if (typeof window !== 'undefined') {
      window.USER_CONFIG = $state.snapshot(this.opts);
    }

    this._checkConnections();
  }

  // --- PRIVATE METHODS ---

  // --- Centralized Config Reader ---
  private _readConfigFromWindow(): UserConfigOpts {
    const newOpts: Partial<UserConfigOpts> = {};

    // We iterate over the default keys to ensure we grab everything
    (Object.keys(defaultConfig) as Array<keyof UserConfigOpts>).forEach((key) => {
      (newOpts as any)[key] = this._getConfigValue(key);
    });

    return newOpts as UserConfigOpts;
  }

  private _getConfigValue<K extends keyof UserConfigOpts>(key: K): UserConfigOpts[K] {

    const prefix = typeof window !== 'undefined' ? (window.CARD_CONFIG?.modelName ?? '') : '';
    const storageKey = `${prefix}${key}`;

    const stored = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(storageKey) : null;

    // Prioritise session storage
    if (stored !== null) {
      if (stored === 'true') return true as UserConfigOpts[K];
      if (stored === 'false') return false as UserConfigOpts[K];
      return parseInt(stored, 10) as UserConfigOpts[K];
    }

    return (window.USER_CONFIG?.[key] ?? defaultConfig[key]) as UserConfigOpts[K];
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
