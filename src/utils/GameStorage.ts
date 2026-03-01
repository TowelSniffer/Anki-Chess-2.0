export type GameStorageKey = 'chess_puzzle_score' | 'chess_flipBoolean' | 'chess_randOrientBool' | 'chess_mirrorState' | 'chess_pgnPath' | 'chess_aiPgn'

export class GameStorage {
  enabled: boolean;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  get(key: GameStorageKey) {
    if (!this.enabled) return null;
    return sessionStorage.getItem(key);
  }

  set(key: string, value: string) {
    if (!this.enabled) return null;
    if (this.enabled) sessionStorage.setItem(key, value);
  }

  remove(key: string) {
    if (!this.enabled) return null;
    if (this.enabled) sessionStorage.removeItem(key);
  }

  clearGame() {
    if (!this.enabled) return null;
    ['chess_puzzle_score', 'chess_randOrientBool', 'chess_flipBoolean', 'chess_mirrorState', 'chess_pgnPath', 'chess_aiPgn'].forEach(
      (k) => this.remove(k)
    );
  }
}
