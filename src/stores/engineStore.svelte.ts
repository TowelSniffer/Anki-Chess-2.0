import { untrack } from 'svelte';
import { Chess, type Square } from 'chess.js';
import { userConfig } from './userConfig';
import { type CustomShape } from './gameStore.svelte';

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
  multipv = $state(1);
  multipvOptions = [1, 2, 3, 4, 5];

  // Data
  evalFen = $state<string>(''); // The FEN that the current analysis belongs to
  analysisLines = $state<AnalysisLine[]>([]);

  analysisThinkingTime = $state(userConfig.analysisTime);
  thinkingTimeOptions = [1, 5, 10, 30, 60, 300];

  private _worker: Worker | null = null;
  private _currentFen = ''; // The FEN currently being processed by the engine
  private _pendingFen: string = ''; // A queued FEN waiting for the engine to stop

  constructor() {
    // get stored settings
    if (typeof window === 'undefined') return;
    const savedPv = sessionStorage.getItem('chess_multipv') ?? null;
    if (savedPv) this.setMultiPv(parseInt(savedPv, 10));

    const savedThinkingTime =
      sessionStorage.getItem('chess_analysisTime') ?? null;
    if (savedThinkingTime)
      this.analysisThinkingTime = parseInt(savedThinkingTime, 10);

    this.analysisThinkingTime = this._getClosestTime(this.analysisThinkingTime);
  }

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

  // --- Public Actions ---

  setMultiPv(count: number) {
    if (count < 1) count = 1;
    if (count > 5) count = 5;
    this.multipv = count;
    userConfig.analysisLines = count;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chess_multipv', count);
    }
    this._restart();
  }

  setThinkingTime(time: number) {
    if (time < 1) time = 1;
    if (time > 300) time = 300;
    userConfig.analysisTime = time;
    this.analysisThinkingTime = time;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chess_analysisTime', time);
    }
    this._restart();
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

  analyze(fen: string) {
    untrack(() => {
      if (!this.enabled || !this._worker || this.loading) return;

      // If we are already thinking about this exact FEN, do nothing
      if (this.isThinking && this._currentFen === fen && !this._pendingFen)
        return;

      this._pendingFen = fen;

      // if the engine is currently thinking, we must stop it first.
      if (this.isThinking) {
        this._worker.postMessage('stop');
      } else {
        // If engine is idle, start immediately
        this._processPending();
      }
    });
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

  // --- Private Engine Logic ---

  private _restart() {
    // Restart analysis if active
    if (this.enabled && this._currentFen) {
      // We force a re-analysis by acting like the FEN changed
      const newFen = this._currentFen;
      this._currentFen = '';
      this.analyze(newFen);
    }
  }

  private _getClosestTime(target: number): number {
    return this.thinkingTimeOptions.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev,
    );
  }

  private _processPending() {
    if (!this._pendingFen || !this._worker) return;

    const fen = this._pendingFen;
    this._pendingFen = ''; // Clear queue

    this._currentFen = fen;
    this.evalFen = fen;
    this.analysisLines = []; // Clear old lines
    this.isThinking = true;

    // Send commands
    this._worker.postMessage(`position fen ${fen}`);
    this._worker.postMessage(`setoption name MultiPV value ${this.multipv}`);
    this._worker.postMessage(`go movetime ${this.analysisThinkingTime * 1000}`);
  }

  private _initWorker(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._worker = new Worker('/_stockfish.js');
      this._worker.onerror = (err) => reject(err);
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
  }

  private _handleEngineMessage(e: MessageEvent) {
    const msg = e.data;
    if (typeof msg !== 'string' || !this.enabled) return;

    if (msg.startsWith('info') && msg.includes('pv')) {
      // Only block 'info' if we are explicitly waiting for a 'bestmove'
      if (this._pendingFen) return;
      this._parseInfo(msg);
    } else if (msg.startsWith('bestmove')) {
      this._parseBestMove(msg);
    }
  }

  private _parseInfo(msg: string) {
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
        if (turn === 'w') winChance = sideToMoveWins ? 100 : 0;
        else winChance = sideToMoveWins ? 0 : 100;
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

      const existing = [...this.analysisLines];
      const others = existing.filter((l) => l.id !== multipvIndex);
      const updated = [...others, newLine].sort((a, b) => a.id - b.id);

      // GUARD: mid-parse race conditions
      if (this._currentFen !== this.evalFen) return;
      this.analysisLines = updated;
    } catch (err) {
      // Silence parsing errors (e.g. from race conditions)
      // console.warn('Engine parse error:', err);
    }
  }

  private _parseBestMove(msg: string) {
    this.isThinking = false;

    // If we have a pending FEN (user moved while engine was thinking),
    // now that the engine has effectively 'stopped' (sent bestmove),
    // we can safely start the new analysis.
    if (this._pendingFen) {
      this._processPending();
    }
  }
}

export const engineStore = new EngineStore();
