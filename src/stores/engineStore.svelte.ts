import type { CustomShape } from '$Types/ChessStructs';
import { untrack } from 'svelte';
import { Chess, type Square } from 'chess.js';
import { userConfig } from './userConfig.svelte';

function convertCpToWinPercentage(cp: number): number {
  const probability = 1 / (1 + Math.pow(10, -cp / 400));
  return probability * 100;
}

export interface AnalysisLine {
  id: number;
  scoreRaw: number;
  scoreNormalized: number;
  isMate: boolean;
  winChance: number;
  pvRaw: string;
  pvSan: string;
  firstMove: { from: Square; to: Square; san: string } | null;
}

// --- Global Worker Cache ---
// This persists across EngineStore instantiations within the same webview
let stockfishWorker: Worker | null = null;
let initPromise: Promise<void> | null = null;
let workerReady = false;

export class EngineStore {
  /*
   * ENGINE STATE
   */

  // --- State variables ---
  enabled = $state(false);
  loading = $state(false);

  // Analysis Data
  evalFen = $state<string>(''); // The FEN that the current analysis belongs to
  analysisLines = $state<AnalysisLine[]>([]);

  // --- Non-reactive variables ---

  isThinking = false;
  multipvOptions = [1, 2, 3, 4, 5];

  // --- Internal State ---

  private _currentFen = ''; // The FEN currently being processed by the engine
  private _pendingFen: string = ''; // A queued FEN waiting for the engine to stop

  private _lineBuffer = new Map<number, AnalysisLine>(); // Buffer for incoming lines
  private _updateTimeout: number | null = null; // UI timeout reference
  private _lastInfoUpdate = 0; // Last UI update performance reference

  // Track if the engine is busy and provide a way to wait for it
  private _idlePromise: Promise<void> = Promise.resolve();
  private _idleResolver: (() => void) | null = null;
  // Tracks if requestMove has been called but hasn't finished
  private _aiRequestPending = false;
  private _aiMoveResolver: ((san: string) => void) | null = null;

  /*
   * DERIVED STATE
   */

  // --- User Config ---
  analysisThinkingTime = $derived(userConfig.opts.analysisTime);
  multipv = $derived(userConfig.opts.analysisLines);

  thinkingTimeOptions = [1, 5, 10, 30, 60, 300];

  private _aiElo = $derived(userConfig.opts.aiElo);
  private _aiMoveTime = $derived(userConfig.opts.aiMoveTime * 1000);

  // --- Computed Arrows ---
  bestMove = $derived.by(() => {
    // We only show the arrow if the analysis actually matches the visual board FEN
    // (Checked loosely via evalFen, but the UI should handle the precise sync)
    const bestLine = this.analysisLines.find((l) => l.id === 1);
    if (!bestLine || !bestLine.firstMove) return null;
    return { ...bestLine.firstMove, fen: this.evalFen };
  });

  shapes = $derived.by((): CustomShape[] => {
    if (!this.enabled) return [];

    const turn = this.evalFen.split(' ')[1]; // 'w' or 'b'

    // Create a copy and reverse it so the Best Move (ID 1) is drawn last (on top)
    const linesToDraw = [...this.analysisLines].reverse();

    return linesToDraw
      .map((line) => {
        if (!line.firstMove) return null;

        // Brush Color
        let brush = 'stockfish';
        let hilite = '#66AA66';

        if (!this.isThinking && line.id === 1) {
          hilite = 'indianred';
        } else {
          // Assign colors for MultiPV
          switch (line.id) {
            case 1:
              brush = 'stockfish';
              hilite = '#66AA66';
              break;
            default:
              brush = 'stockfishAlt';
              hilite = '#66AAAA';
              break;
          }
        }

        // --- arrow Width Logic (Thickness) ---
        // Calculate win percentage from the perspective of the player moving
        let activeWinChance = line.winChance;
        if (turn === 'b') {
          // If Black to move, 0% White-Win is 100% Black-Win
          activeWinChance = 100 - line.winChance;
        }

        const width = 4 + activeWinChance / 10;
        return {
          orig: line.firstMove.from,
          dest: line.firstMove.to,
          san: line.firstMove.san,
          brush: brush,
          modifiers: {
            lineWidth: Math.round(width * 10) / 10,
            hilite: hilite,
          },
        };
      })
      .filter((s) => s !== null) as CustomShape[];
  });

  constructor() {
    $effect(() => {
      // Register userConfig changes
      void this.multipv;
      void this.analysisThinkingTime;
      untrack(() => {
        if (!this.enabled) return; // prevent restarting on initial load
        this.restart();
      });
    });
  }

  /*
   * METHODS
   */

  // --- Public ---

  async requestMove(
    fen: string,
    elo: number = this._aiElo,
    moveTime: number = this._aiMoveTime,
  ): Promise<string> {
    this._aiRequestPending = true;

    if (!stockfishWorker || this.loading) {
      await this._initWorker();
    }
    await this._stopAndWait(); // Ensure previous analysis is dead

    return new Promise((resolve) => {
      // Wrap the resolve to clear the flag when the move is found
      const wrappedResolve = (san: string) => {
        this._aiRequestPending = false;
        resolve(san);
      };

      this._performAiSearch(fen, elo, moveTime, wrappedResolve);
    });
  }

  toggle(fen: string) {
    if (this.enabled) {
      this.enabled = false;
      this.stop();
      return;
    }
    this.enabled = true;

    this._initWorker(fen);
  }

  async analyze(fen: string) {
    if (!this.enabled || !stockfishWorker || this.loading || this._aiRequestPending) return;

    // If we are already thinking about this exact FEN, do nothing
    if (this.isThinking && this._currentFen === fen && !this._pendingFen) return;

    this._pendingFen = fen;
    await this._stopAndWait();

    // If the user moved again while we were waiting to stop, abort this older request
    if (this._pendingFen !== fen || this._aiRequestPending) return;

    this._processPending();
  }

  async init(fen?: string) {
    this.enabled = true;
    await this._delay(200);
    this._initWorker(fen);
  }

  async stop() {
    await this._stopAndWait();
    this._pendingFen = '';
    this.isThinking = false;
  }

  async stopAndClear() {
    this.enabled = false;
    this.loading = false;
    this._pendingFen = '';
    this.analysisLines = [];
    this._currentFen = '';

    // Clear the map
    this._lineBuffer.clear();

    // Clear the timeout to prevent memory leaks across cards
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
      this._updateTimeout = null;
    }

    this._aiRequestPending = false;
    this._aiMoveResolver = null;

    if (this.isThinking && stockfishWorker) {
      stockfishWorker.postMessage('stop');
      // DO NOT manually unlock here. We let the 'bestmove' message
      // hit _handleEngineMessage, which will call _parseBestMove and unlock.
    } else {
      // Fallback: only unlock if we weren't thinking anyway
      this._unlockEngine();
      this.isThinking = false;
    }
  }

  restart() {
    // Restart analysis if active
    if (this.enabled && this._currentFen) {
      // We force a re-analysis by acting like the FEN changed
      const newFen = this._currentFen;
      this._currentFen = '';
      this.analyze(newFen);
    }
  }

  destroy() {
    this.stopAndClear();
    if (this._updateTimeout) clearTimeout(this._updateTimeout);

    // Detach this instance's message listener from the global worker
    if (stockfishWorker) {
      stockfishWorker.onmessage = null;
    }
  }

  // --- Private ---

  private _lockEngine() {
    this._idlePromise = new Promise((resolve) => {
      this._idleResolver = resolve;
    });
  }

  private _unlockEngine() {
    if (this._idleResolver) {
      this._idleResolver();
      this._idleResolver = null;
    }
  }

  private async _stopAndWait() {
    if (this.isThinking) {
      stockfishWorker?.postMessage('stop');
      await this._idlePromise; // Wait until _parseBestMove unlocks it
    }
  }

  private _performAiSearch(
    fen: string,
    elo: number,
    moveTime: number,
    resolve: (san: string) => void,
  ) {
    this._aiMoveResolver = resolve; // Store the resolver for _parseBestMove to use
    /**
     * Keep elo value within default stockfish UCI_Elo min/max values
     * min 1320; max 3190
     */
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
    const clampedElo = clamp(elo, 1320, 3190);

    // Trick the buffer into accepting info lines for this position
    this._currentFen = fen;
    this.evalFen = fen;
    this.isThinking = true;
    this._lockEngine();

    // Configure Engine for "Human" play.
    stockfishWorker?.postMessage(`setoption name MultiPV value 1`);
    stockfishWorker?.postMessage(`setoption name UCI_LimitStrength value true`);
    stockfishWorker?.postMessage(`setoption name UCI_Elo value ${clampedElo}`);

    // Start Search
    stockfishWorker?.postMessage(`position fen ${fen}`);
    stockfishWorker?.postMessage(`go movetime ${moveTime}`);
  }

  private _resetEngineStrength() {
    // IMPORTANT: Turn off limits so normal analysis is accurate again
    stockfishWorker?.postMessage(`setoption name UCI_LimitStrength value false`);
    stockfishWorker?.postMessage(`setoption name MultiPV value ${this.multipv}`);
  }

  private _processPending() {
    if (!stockfishWorker) {
      return;
    }

    if (!this._pendingFen) return;

    const fen = this._pendingFen;
    this._pendingFen = ''; // Clear queue

    this._currentFen = fen;
    this.evalFen = fen;
    this.analysisLines = []; // Clear old lines
    this._lineBuffer.clear(); // Clear buffer
    // Reset the throttle timer.
    this._lastInfoUpdate = 0;

    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
      this._updateTimeout = null;
    }

    this.isThinking = true;
    this._lockEngine();

    // Send commands
    stockfishWorker.postMessage(`position fen ${fen}`);
    stockfishWorker.postMessage(`setoption name MultiPV value ${this.multipv}`);
    stockfishWorker.postMessage(`go movetime ${this.analysisThinkingTime * 1000}`);
  }

  private _delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async _initWorker(fen?: string): Promise<void> {
    // STATE 1: Worker is already fully loaded and ready
    if (stockfishWorker && initPromise) {
      stockfishWorker.onmessage = (event) => this._handleEngineMessage(event);
      this.loading = false;
      if (fen) this.analyze(fen);
      return;
    }

    // STATE 2: Worker is currently loading from a previous card
    if (initPromise && !workerReady) {
      this.loading = true;
      try {
        await initPromise; // Wait for Card A's boot to finish
        // Now that it's ready, hijack the listener for Card B
        if (stockfishWorker) {
          stockfishWorker.onmessage = (event) => this._handleEngineMessage(event);
        }
        this.loading = false;
        if (fen) this.analyze(fen);
      } catch (err) {
        // If the background load failed, let the component handle it
        throw err;
      }
      return;
    }

    // STATE 3: Fresh Boot
    initPromise = new Promise((resolve, reject) => {
      try {
        this.loading = true; // Set loading state immediately
        workerReady = false;

        if (!stockfishWorker) {
          stockfishWorker = new Worker('/_stockfish.js');
        }

        // Handle both initialization errors and runtime crashes
        stockfishWorker.onerror = (err) => {
          console.error('Stockfish Worker Crashed:', err);
          this._handleEngineCrash(); // Trigger recovery

          // If we are still in the init phase, reject the promise
          if (initPromise) {
            initPromise = null;
            reject(new Error('Worker failed: ' + err.message));
          }
        };
        stockfishWorker.onmessage = (e) => {
          const msg = e.data;

          // Catch specific "unreachable" or WASM errors sent via message if any
          if (
            typeof msg === 'string' &&
            (msg.includes('RuntimeError') || msg.includes('unreachable'))
          ) {
            this._handleEngineCrash();
            return;
          }

          if (msg === 'uciok') stockfishWorker?.postMessage('isready');
          else if (msg === 'readyok') {
            // Initial load finished
            // Re-bind the message handler to the CURRENT EngineStore instance
            stockfishWorker!.onmessage = (event) => this._handleEngineMessage(event);
            workerReady = true;
            this.loading = false;
            if (fen) this.analyze(fen);
            resolve();
          }
        };
        stockfishWorker.postMessage('uci');
      } catch (e) {
        initPromise = null;
        reject(e);
      }
    });
    return initPromise;
  }

  private _handleEngineCrash() {
    // Kill the zombie worker
    if (stockfishWorker) {
      stockfishWorker.terminate();
      stockfishWorker = null;
    }

    // Reset internal flags so the store knows it's no longer running
    initPromise = null;
    this.isThinking = false;
    this._unlockEngine(); // Release any promises waiting on _idlePromise

    // If an AI move was pending, reject it or handle it
    if (this._aiMoveResolver) {
      this._aiMoveResolver = null;
      this._aiRequestPending = false;
    }

    // Update UI state
    this.loading = false;

    // Automatically try to restart if the engine was supposed to be enabled
    if (this.enabled && this._currentFen) {
      console.warn('Attempting to restart engine after crash...');
      this.analyze(this._currentFen);
    }
  }

  private _handleEngineMessage(e: MessageEvent) {
    const msg = e.data;
    if (typeof msg !== 'string') return;
    if (msg.startsWith('bestmove')) {
      this._parseBestMove(msg);
      return;
    }

    if (!this.enabled) return;

    if (msg.startsWith('info') && msg.includes('pv')) {
      // Only block 'info' if we are explicitly waiting for a 'bestmove'
      if (this._pendingFen) return;

      // Parse immediately into the buffer (cheap)
      this._parseInfoToBuffer(msg);

      // Schedule the reactive UI update (expensive)
      this._scheduleUpdate();
    }
  }

  private _parseInfoToBuffer(msg: string) {
    // Final safety check: Does this message belong to the FEN
    // the UI is actually displaying right now?
    if (this._currentFen !== this.evalFen) return;

    try {
      const parts = msg.split(' ');

      // Identify MultiPV Line
      let multipvIndex = 1;
      const mpvIdx = parts.indexOf('multipv');
      if (mpvIdx > -1 && parts[mpvIdx + 1]) {
        multipvIndex = parseInt(parts[mpvIdx + 1], 10);
      }

      // Parse Score
      let scoreRaw = 0;
      let isMate = false;
      let winChance = 50;

      const turn = this._currentFen.split(' ')[1]; // 'w' or 'b'
      const mateIdx = parts.indexOf('mate');
      const cpIdx = parts.indexOf('cp');

      if (mateIdx > -1 && parts[mateIdx + 1]) {
        isMate = true;
        scoreRaw = parseInt(parts[mateIdx + 1], 10);
        const sideToMoveWins = scoreRaw > 0;
        if (turn === 'w') {
          winChance = sideToMoveWins ? 100 : 0;
        } else {
          winChance = sideToMoveWins ? 0 : 100;
        }
      } else if (cpIdx > -1 && parts[cpIdx + 1]) {
        scoreRaw = parseInt(parts[cpIdx + 1], 10);
        const rawWin = convertCpToWinPercentage(scoreRaw);
        if (turn === 'w') winChance = rawWin;
        else winChance = 100 - rawWin;
      }
      const scoreNormalized = turn === 'w' ? scoreRaw : -scoreRaw;

      // Parse PV (Moves)
      const pvIdx = parts.indexOf('pv');
      let pvRaw = '';
      let pvSan = '';
      let firstMoveData = null;

      if (pvIdx > -1) {
        const rawMoves = parts.slice(pvIdx + 1);
        pvRaw = rawMoves.join(' ');

        const sanMoves: string[] = [];
        const tempChess = new Chess(this._currentFen);

        for (const uci of rawMoves) {
          if (uci.length < 4) break;
          const from = uci.substring(0, 2) as Square;
          const to = uci.substring(2, 4) as Square;
          const promotion = uci.length > 4 ? uci.substring(4, 5) : undefined;

          try {
            const m = tempChess.move({ from, to, promotion });

            if (m) {
              sanMoves.push(m.san);
              if (!firstMoveData) {
                firstMoveData = { from, to, san: m.san };
              }
            }
          } catch (err) {
            // Stop parsing this line if we hit an illegal move/error.
            break;
          }
        }
        pvSan = sanMoves.join(' ');
      }

      // Update Analysis Line
      const newLine: AnalysisLine = {
        id: multipvIndex,
        scoreRaw,
        scoreNormalized,
        isMate,
        winChance,
        pvRaw,
        pvSan,
        firstMove: firstMoveData,
      };

      // GUARD: mid-parse race conditions
      if (this._currentFen !== this.evalFen) return;

      // STORE IN BUFFER instead of state
      this._lineBuffer.set(multipvIndex, newLine);
    } catch (err) {
      // Silence parsing errors (e.g. from race conditions)
      // console.warn('Engine parse error:', err);
    }
  }

  private _flushBuffer() {
    // clear buffer for Immediate UI update
    untrack(() => {
      // Convert Map values to array and sort by ID
      const lines = Array.from(this._lineBuffer.values()).sort((a, b) => a.id - b.id);
      this.analysisLines = lines;

      // Mark the time and clear the timeout handle
      this._lastInfoUpdate = performance.now();
      this._updateTimeout = null;
    });
  }

  private _scheduleUpdate() {
    // If an update is already queued, we just wait for it to fire.
    if (this._updateTimeout) return;

    // Wait for all MultiPV lines before pushing first update
    if (this.analysisLines.length === 0 && this._lineBuffer.size < this.multipv) {
      return;
    }

    const now = performance.now();
    const timeSinceLast = now - this._lastInfoUpdate;
    const throttleDelay = 200; // ms

    if (timeSinceLast > throttleDelay) {
      // --- LEADING EDGE: Update Immediately ---
      // If it's been a while since the last update (or it's the first one),
      this._flushBuffer();
    } else {
      // --- TRAILING EDGE: Schedule for later ---
      // If we updated recently, wait for the remainder of the cooldown
      // to prevent UI freezing.
      const waitTime = throttleDelay - timeSinceLast;

      this._updateTimeout = window.setTimeout(() => {
        if (!this.enabled) return;
        this._flushBuffer();
      }, waitTime);
    }
  }

  private _parseBestMove(msg?: string) {
    this._flushBuffer();
    this.isThinking = false;
    this._unlockEngine();

    // Intercept for AI Move
    if (this._aiMoveResolver && msg) {
      const parts = msg.split(' ');
      const bestMoveUci = parts[1];
      const resolve = this._aiMoveResolver;

      this._aiMoveResolver = null;
      this._aiRequestPending = false;
      this._resetEngineStrength();

      resolve(bestMoveUci);
      return; // Exit early so we don't trigger pending analysis
    }
  }
}
