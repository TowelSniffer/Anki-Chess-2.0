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

class EngineStore {
  // --- Reactive State ---
  enabled = $state(false);
  isThinking = $state(false);
  loading = $state(false);
  multipvOptions = [1, 2, 3, 4, 5];

  // Data
  evalFen = $state<string>(''); // The FEN that the current analysis belongs to
  analysisLines = $state<AnalysisLine[]>([]);

  analysisThinkingTime = $derived(userConfig.opts.analysisTime);
  multipv = $derived(userConfig.opts.analysisLines);

  thinkingTimeOptions = [1, 5, 10, 30, 60, 300];
  delay = userConfig.opts.animationTime ?? 200;

  private _worker: Worker | null = null;
  private _currentFen = ''; // The FEN currently being processed by the engine
  private _pendingFen: string = ''; // A queued FEN waiting for the engine to stop

  private _lineBuffer = new Map<number, AnalysisLine>(); // Buffer for incoming lines
  private _updateTimeout: number | null = null; // UI timeout reference
  private _lastInfoUpdate = 0; // Last UI update performance reference
  // We use this to check if existing has been made.
  private _initPromise: Promise<void> | null = null;

  // Track if the engine is busy and provide a way to wait for it
  private _idlePromise: Promise<void> = Promise.resolve();
  private _idleResolver: (() => void) | null = null;
  // Tracks if requestMove has been called but hasn't finished
  private _aiRequestPending = false;
  private _aiMoveResolver: ((san: string) => void) | null = null;

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
    $effect.root(() => {
      // FIXME effect.root might make sense for handling new PGN in other stores
      $effect(() => {
        // Register userConfig changes
        void this.multipv;
        void this.analysisThinkingTime;
        untrack(() => {
          if (!this.enabled) return; // prevent restarting on initial load
          this.restart();
        });
      });
    });
  }

  // --- Public Actions ---

  async requestMove(fen: string, elo: number = 3150): Promise<string> {
    this._aiRequestPending = true;

    if (!this._worker || this.loading) {
      await this._initWorker();
    }
    await this._stopAndWait(); // Ensure previous analysis is dead

    return new Promise((resolve) => {
      // Wrap the resolve to clear the flag when the move is found
      const wrappedResolve = (san: string) => {
        this._aiRequestPending = false;
        resolve(san);
      };

      this._performAiSearch(fen, elo, wrappedResolve);
    });
  }

  async toggle(fen: string) {
    if (this.enabled) {
      this.enabled = false;
      this.stop();
      return;
    }

    if (!this._worker) {
      this.loading = true;
      try {
        await this._initWorker();
        this.enabled = true;
        this.loading = false;
        this.analyze(fen);
      } catch (err) {
        console.error('Engine failed to initialize', err);
        this.loading = false;
        this.enabled = false;
      }
    } else {
      this.enabled = true;
      this.analyze(fen);
    }
  }

  async analyze(fen: string) {
    if (!this.enabled || !this._worker || this.loading) return;

    // Double check enabled state in case it changed during the delay
    if (!this.enabled) return;
    // If we are already thinking about this exact FEN, do nothing
    if (this.isThinking && this._currentFen === fen && !this._pendingFen) return;

    this._pendingFen = fen;
    await this._stopAndWait();

    // If the user moved again while we were waiting to stop, abort this older request
    if (this._pendingFen !== fen) return;

    this._processPending();
  }

  async init(fen?: string) {
    if (!this._worker) {
      this.loading = true;
      try {
        await this._initWorker();
        this.loading = false;
        this.enabled = true;
        if (fen && !this._aiRequestPending) {
          this.analyze(fen);
        }
      } catch (err) {
        console.error('Engine failed to initialize', err);
        this.loading = false;
      }
    }
  }

  stop() {
    this._pendingFen = '';
    this._worker?.postMessage('stop');
    this.isThinking = false;
  }

  stopAndClear() {
    this.stop();
    this.enabled = false;
    this.analysisLines = [];
    this._currentFen = '';
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

  // --- Private Engine Logic ---

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
      this._worker?.postMessage('stop');
      await this._idlePromise; // Wait until _parseBestMove unlocks it
    }
  }

  private _performAiSearch(fen: string, elo: number, resolve: (san: string) => void) {
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
    this._worker!.postMessage(`setoption name UCI_LimitStrength value true`);
    this._worker!.postMessage(`setoption name UCI_Elo value ${clampedElo}`);

    // Start Search
    this._worker!.postMessage(`position fen ${fen}`);
    this._worker!.postMessage(`go movetime 1000`);
  }

  private _resetEngineStrength() {
    // IMPORTANT: Turn off limits so normal analysis is accurate again
    this._worker?.postMessage(`setoption name UCI_LimitStrength value false`);
  }

  private _processPending() {
    if (!this._pendingFen || !this._worker) return;

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
    this._worker.postMessage(`position fen ${fen}`);
    this._worker.postMessage(`setoption name MultiPV value ${this.multipv}`);
    this._worker.postMessage(`go movetime ${this.analysisThinkingTime * 1000}`);
  }

  private _initWorker(): Promise<void> {
    // If initialization is already happening (or finished), return that exact promise.
    if (this._initPromise) return this._initPromise;
    this._initPromise = new Promise((resolve, reject) => {
      this._worker = new Worker('/_stockfish.js');
      this._worker.onerror = (err) => {
        this._initPromise = null; // Reset on failure
        reject(err);
      };
      this._worker.onmessage = (e) => {
        const msg = e.data;
        if (msg === 'uciok') this._worker?.postMessage('isready');
        else if (msg === 'readyok') {
          this._worker!.onmessage = (event) => this._handleEngineMessage(event);
          resolve();
        }
      };
      this._worker.postMessage('uci');
    });
    return this._initPromise;
  }

  private _handleEngineMessage(e: MessageEvent) {
    const msg = e.data;
    if (typeof msg !== 'string' || !this.enabled) return;

    if (msg.startsWith('info') && msg.includes('pv')) {
      // Only block 'info' if we are explicitly waiting for a 'bestmove'
      if (this._pendingFen) return;

      // Parse immediately into the buffer (cheap)
      this._parseInfoToBuffer(msg);

      // Schedule the reactive UI update (expensive)
      this._scheduleUpdate();
    } else if (msg.startsWith('bestmove')) {
      // example: bestmove e2e4 ponder e7e5
      this._parseBestMove(msg);
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
      this._aiMoveResolver = null; // Clear it
      this._resetEngineStrength();

      resolve(bestMoveUci);
      return; // Exit early so we don't trigger pending analysis
    }
  }
}

export const engineStore = new EngineStore();
