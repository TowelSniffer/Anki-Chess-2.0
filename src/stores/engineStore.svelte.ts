import type { CustomShape } from '$Types/ChessStructs';
import type { UserConfigOpts } from '$Types/UserConfig';
import { untrack } from 'svelte';
import { Chess, type Square } from 'chess.js';

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

  // --- Internal State ---

  #config: UserConfigOpts;
  #currentFen = ''; // The FEN currently being processed by the engine
  #currentFenLegalMoves = 1;
  #pendingFen: string = ''; // A queued FEN waiting for the engine to stop

  #lineBuffer = new Map<number, AnalysisLine>(); // Buffer for incoming lines
  #updateTimeout: number | null = null; // UI timeout reference
  #lastInfoUpdate = 0; // Last UI update performance reference

  // Track if the engine is busy and provide a way to wait for it
  #idlePromise: Promise<void> = Promise.resolve();
  #idleResolver: (() => void) | null = null;
  // Tracks if requestMove has been called but hasn't finished
  #aiRequestPending = false;
  #aiMoveResolver: ((san: string) => void) | null = null;

  constructor(getConfig: () => UserConfigOpts) {
    this.stop();
    this.#config = getConfig();

    /*
     * EFFECTS
     */

    // Restart Engine on userConfig changes
    $effect(() => {
      // Arbitrary read of config changes
      void this.multipv;
      void this.analysisThinkingTime;

      untrack(() => {
        if (!this.enabled || !this.evalFen || this.#aiRequestPending) return;

        // Pre-fill _pendingFen to bypass the "already thinking about this FEN"
        // early return inside `analyze()`, keeping `_currentFen` intact for `_flushBuffer`.
        this.#pendingFen = this.evalFen;
        this.analyze(this.evalFen);
      });
    });
  }

  /*
   * Getters
   */

  // --- User Config ---
  get analysisThinkingTime() {
    return this.#config.analysisTime;
  }

  get multipv() {
    return this.#config.analysisLines;
  }

  get #aiElo() {
    return this.#config.aiElo;
  }

  get #aiMoveTime() {
    return this.#config.aiMoveTime * 1000;
  }

  // --- Computed Arrows ---
  get bestMove() {
    const bestLine = this.analysisLines.find((l) => l.id === 1);
    if (!bestLine?.firstMove) return null;
    return { ...bestLine.firstMove, fen: this.evalFen };
  }

  get shapes(): CustomShape[] {
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
  }

  /*
   * METHODS
   */

  // --- Public ---

  async requestMove(
    fen: string,
    elo: number = this.#aiElo,
    moveTime: number = this.#aiMoveTime,
  ): Promise<string> {
    this.#aiRequestPending = true;

    if (!stockfishWorker || this.loading) {
      await this.#initWorker();
    }
    await this.#stopAndWait(); // Ensure previous analysis is dead

    return new Promise((resolve) => {
      // Wrap the resolve to clear the flag when the move is found
      const wrappedResolve = (san: string) => {
        this.#aiRequestPending = false;
        resolve(san);
      };

      this.#performAiSearch(fen, elo, moveTime, wrappedResolve);
    });
  }

  toggle(fen: string) {
    if (this.enabled) {
      this.enabled = false;
      this.stop();
      return;
    }
    this.enabled = true;

    this.#initWorker(fen);
  }

  async analyze(fen: string) {
    if (!this.enabled || !stockfishWorker || this.loading || this.#aiRequestPending) return;

    // If we are already thinking about this exact FEN, do nothing
    if (this.isThinking && this.#currentFen === fen && !this.#pendingFen) return;

    this.#pendingFen = fen;
    await this.#stopAndWait();

    // If the user moved again while we were waiting to stop, abort this older request
    if (this.#pendingFen !== fen || this.#aiRequestPending) return;

    this.#processPending();
  }

  async init(fen?: string) {
    await this.#delay(200);
    this.enabled = true;
    this.#initWorker(fen);
  }

  async stop() {
    await this.#stopAndWait();
    this.#pendingFen = '';
    this.isThinking = false;
  }

  async stopAndClear() {
    this.enabled = false;
    this.loading = false;
    this.#pendingFen = '';
    this.analysisLines = [];
    this.#currentFen = '';

    // Clear the map
    this.#lineBuffer.clear();

    // Clear the timeout to prevent memory leaks across cards
    if (this.#updateTimeout) {
      clearTimeout(this.#updateTimeout);
      this.#updateTimeout = null;
    }

    this.#aiRequestPending = false;
    this.#aiMoveResolver = null;

    if (this.isThinking && stockfishWorker) {
      stockfishWorker.postMessage('stop');
      // DO NOT manually unlock here. We let the 'bestmove' message
      // hit _handleEngineMessage, which will call _parseBestMove and unlock.
    } else {
      // Fallback: only unlock if we weren't thinking anyway
      this.#unlockEngine();
      this.isThinking = false;
    }
  }

  destroy() {
    this.stopAndClear();
    if (this.#updateTimeout) clearTimeout(this.#updateTimeout);

    // Detach this instance's message listener from the global worker
    if (stockfishWorker) {
      stockfishWorker.onmessage = null;
    }
  }

  // --- Private ---

  #lockEngine() {
    this.#idlePromise = new Promise((resolve) => {
      this.#idleResolver = resolve;
    });
  }

  #unlockEngine() {
    if (this.#idleResolver) {
      this.#idleResolver();
      this.#idleResolver = null;
    }
  }

  private async #stopAndWait() {
    if (this.isThinking) {
      stockfishWorker?.postMessage('stop');
      await this.#idlePromise; // Wait until _parseBestMove unlocks it
    }
  }

  #performAiSearch(
    fen: string,
    elo: number,
    moveTime: number,
    resolve: (san: string) => void,
  ) {
    this.#aiMoveResolver = resolve; // Store the resolver for _parseBestMove to use
    /**
     * Keep elo value within default stockfish UCI_Elo min/max values
     * min 1320; max 3190
     */
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
    const clampedElo = clamp(elo, 1320, 3190);

    // Trick the buffer into accepting info lines for this position
    this.#currentFen = fen;
    this.evalFen = fen;
    this.isThinking = true;
    this.#lockEngine();

    // Configure Engine for "Human" play.
    stockfishWorker?.postMessage(`setoption name MultiPV value 1`);
    stockfishWorker?.postMessage(`setoption name UCI_LimitStrength value true`);
    stockfishWorker?.postMessage(`setoption name UCI_Elo value ${clampedElo}`);

    // Start Search
    stockfishWorker?.postMessage(`position fen ${fen}`);
    stockfishWorker?.postMessage(`go movetime ${moveTime}`);
  }

  #resetEngineStrength() {
    // IMPORTANT: Turn off limits so normal analysis is accurate again
    stockfishWorker?.postMessage(`setoption name UCI_LimitStrength value false`);
    stockfishWorker?.postMessage(`setoption name MultiPV value ${this.multipv}`);
  }

  #processPending() {
    if (!stockfishWorker) {
      return;
    }

    if (!this.#pendingFen) return;

    const fen = this.#pendingFen;
    this.#pendingFen = ''; // Clear queue

    this.#currentFen = fen;
    this.evalFen = fen;
    const tempChess = new Chess(fen);
    this.#currentFenLegalMoves = tempChess.moves().length || 1;

    this.analysisLines = []; // Clear old lines
    this.#lineBuffer.clear(); // Clear buffer
    // Reset the throttle timer.
    this.#lastInfoUpdate = 0;

    if (this.#updateTimeout) {
      clearTimeout(this.#updateTimeout);
      this.#updateTimeout = null;
    }

    this.isThinking = true;
    this.#lockEngine();

    // Send commands
    stockfishWorker.postMessage(`position fen ${fen}`);
    stockfishWorker.postMessage(`setoption name MultiPV value ${this.multipv}`);
    stockfishWorker.postMessage(`go movetime ${this.analysisThinkingTime * 1000}`);
  }

  #delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async #initWorker(fen?: string): Promise<void> {
    // STATE 1: Worker is already fully loaded and ready
    if (stockfishWorker && initPromise) {
      stockfishWorker.onmessage = (event) => this.#handleEngineMessage(event);
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
          stockfishWorker.onmessage = (event) => this.#handleEngineMessage(event);
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
          this.#handleEngineCrash(); // Trigger recovery

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
            this.#handleEngineCrash();
            return;
          }

          if (msg === 'uciok') stockfishWorker?.postMessage('isready');
          else if (msg === 'readyok') {
            // Initial load finished
            // Re-bind the message handler to the CURRENT EngineStore instance
            stockfishWorker!.onmessage = (event) => this.#handleEngineMessage(event);
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

  #handleEngineCrash() {
    // Kill the zombie worker
    if (stockfishWorker) {
      stockfishWorker.terminate();
      stockfishWorker = null;
    }

    // Reset internal flags so the store knows it's no longer running
    initPromise = null;
    this.isThinking = false;
    this.#unlockEngine(); // Release any promises waiting on _idlePromise

    // If an AI move was pending, reject it or handle it
    if (this.#aiMoveResolver) {
      this.#aiMoveResolver = null;
      this.#aiRequestPending = false;
    }

    // Update UI state
    this.loading = false;

    // Automatically try to restart if the engine was supposed to be enabled
    if (this.enabled && this.#currentFen) {
      console.warn('Attempting to restart engine after crash...');
      this.analyze(this.#currentFen);
    }
  }

  #handleEngineMessage(e: MessageEvent) {
    const msg = e.data;
    if (typeof msg !== 'string') return;
    if (msg.startsWith('bestmove')) {
      this.#parseBestMove(msg);
      return;
    }

    if (!this.enabled) return;

    if (msg.startsWith('info') && msg.includes('pv')) {
      // Only block 'info' if we are explicitly waiting for a 'bestmove'
      if (this.#pendingFen) return;

      // Parse immediately into the buffer (cheap)
      this.#parseInfoToBuffer(msg);

      // Schedule the reactive UI update (expensive)
      this.#scheduleUpdate();
    }
  }

  #parseInfoToBuffer(msg: string) {
    // Final safety check: Does this message belong to the FEN
    // the UI is actually displaying right now?
    if (this.#currentFen !== this.evalFen) return;

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

      const turn = this.#currentFen.split(' ')[1]; // 'w' or 'b'
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

      if (pvIdx > -1) {
        const rawMoves = parts.slice(pvIdx + 1);
        pvRaw = rawMoves.join(' ');
      }

      // Update Analysis Line
      const newLine: AnalysisLine = {
        id: multipvIndex,
        scoreRaw,
        scoreNormalized,
        isMate,
        winChance,
        pvRaw,
        pvSan: '', // Defer parsing
        firstMove: null, // Defer parsing
      };

      // GUARD: mid-parse race conditions
      if (this.#currentFen !== this.evalFen) return;

      // STORE IN BUFFER instead of state
      this.#lineBuffer.set(multipvIndex, newLine);
    } catch (err) {
      // Silence parsing errors (e.g. from race conditions)
      // console.warn('Engine parse error:', err);
    }
  }

  #flushBuffer() {
    // clear buffer for Immediate UI update
    untrack(() => {
      // Convert Map values to array and sort by ID
      const lines = Array.from(this.#lineBuffer.values()).sort((a, b) => a.id - b.id);

      // --- Perform expensive SAN conversion only on flushed lines ---
      for (const line of lines) {
        if (!line.pvRaw || line.pvSan || !this.#currentFen) continue; // Skip if empty or already parsed
        const sanMoves: string[] = [];
        const tempChess = new Chess(this.#currentFen);
        const rawMoves = line.pvRaw.split(' ');
        let firstMoveData = null;

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
            break;
          }
        }
        line.pvSan = sanMoves.join(' ');
        line.firstMove = firstMoveData;
      }
      // ------------------------------------------------------------------

      this.analysisLines = lines;

      // Mark the time and clear the timeout handle
      this.#lastInfoUpdate = performance.now();
      this.#updateTimeout = null;
    });
  }

  #scheduleUpdate() {
    // If an update is already queued, we just wait for it to fire.
    if (this.#updateTimeout) return;

    const targetLines = Math.min(this.multipv, this.#currentFenLegalMoves);

    // Wait for all expected lines before pushing first update
    if (!this.analysisLines.length && this.#lineBuffer.size < targetLines) {
      return;
    }

    const now = performance.now();
    const timeSinceLast = now - this.#lastInfoUpdate;
    const throttleDelay = 300; // ms

    if (timeSinceLast > throttleDelay) {
      // --- LEADING EDGE: Update Immediately ---
      // If it's been a while since the last update (or it's the first one),
      this.#flushBuffer();
    } else {
      // --- TRAILING EDGE: Schedule for later ---
      // If we updated recently, wait for the remainder of the cooldown
      // to prevent UI freezing.
      const waitTime = throttleDelay - timeSinceLast;

      this.#updateTimeout = window.setTimeout(() => {
        if (!this.enabled) return;
        this.#flushBuffer();
      }, waitTime);
    }
  }

  #parseBestMove(msg?: string) {
    this.#flushBuffer();
    this.isThinking = false;
    this.#unlockEngine();

    // Intercept for AI Move
    if (this.#aiMoveResolver && msg) {
      const parts = msg.split(' ');
      const bestMoveUci = parts[1];
      const resolve = this.#aiMoveResolver;

      this.#aiMoveResolver = null;
      this.#aiRequestPending = false;
      this.#resetEngineStrength();

      resolve(bestMoveUci);
      return; // Exit early so we don't trigger pending analysis
    }
  }
}
