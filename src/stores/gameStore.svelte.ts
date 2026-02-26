import type { Color as CgColor } from '@lichess-org/chessground/types';
import type { Api } from '@lichess-org/chessground/api';
import type { Square, Move, Color } from 'chess.js';
import type {
  CustomPgnGame,
  CustomPgnMove,
  PgnPath,
  BoardModes,
  PuzzleScored,
} from '$Types/ChessStructs';

import type { EngineStore } from './engineStore.svelte';
import type { TimerStore } from '$stores/timerStore.svelte';

import { Chess, DEFAULT_POSITION } from 'chess.js';
import { Chessground } from '@lichess-org/chessground';
import { untrack } from 'svelte';

import { userConfig } from '$stores/userConfig.svelte';
import { playAiMove, destroyPuzzleTimeouts } from '$features/chessJs/puzzleLogic';
import { getCgConfig } from '$features/board/cgInstance';
import { augmentPgnTree, addMoveToPgn } from '$features/pgn/augmentPgn';
import { navigateNextMove, navigatePrevMove } from '$features/pgn/pgnNavigate';
import { getTurnFromFen, toDests } from '$features/chessJs/chessFunctions';
import { getSystemShapes, blunderNags, parseCal, parseCsl } from '$features/board/arrows';
import { playSound } from '$features/audio/audio';
import { parsePGN, mirrorPGN } from '$features/pgn/pgnParsing';

export class PgnGameStore {
  /*
   * GAME STATE
   */

  // --- Stores ---
  engineStore: EngineStore;
  timerStore: TimerStore;

  // --- State variables ---
  cg = $state.raw<Api | null>(null);
  boardMode = $state<BoardModes>('Viewer');
  rootGame = $state<CustomPgnGame | undefined>(undefined);
  pgnPath = $state<PgnPath>([]);
  errorCount = $state<number>(0);
  selectedPiece = $state<Square | undefined>(undefined);
  pendingPromotion = $state<{ from: Square; to: Square } | null>(null);
  customAnimation = $state(null);
  startFen = $state(DEFAULT_POSITION);

  // --- Internal State ---
  private _puzzleScore: PuzzleScored = $state(null);
  private _hasMadeMistake: boolean = $state(false);
  private _moveMap = new Map<string, CustomPgnMove>();
  private _moveDebounce = $state<ReturnType<typeof setTimeout> | null>(null);

  private _flipBoolean: boolean = $state(false); // Track if Viewer should be flipped
  private _randomBoolean: boolean = $state(false); // Track random orientation

  /*
   * DERIVED STATE
   */

  aiDelayTime = $derived(userConfig.opts.animationTime + 100);
  isPuzzleComplete = $derived(
    !!this.cg && /^(Puzzle|Study)$/.test(this.boardMode) && !this.hasNext,
  );

  // caches the string key (prevents repeated .join() calls)
  currentPathKey = $derived(this.pgnPath.join(','));

  // caches the Map lookup
  currentMove = $derived(this._moveMap.get(this.currentPathKey) || null);

  // depends on cached currentMove
  fen = $derived(this.currentMove?.after ?? this.startFen);
  viewOnly = $derived(this._moveDebounce ? true : false);

  playerColor: CgColor = $derived.by(() => {
    let color: CgColor = getTurnFromFen(this.startFen) === 'w' ? 'white' : 'black';
    if (this._flipBoolean) color = color === 'white' ? 'black' : 'white';

    return color;
  });

  opponentColor: CgColor = $derived(this.playerColor === 'white' ? 'black' : 'white');

  orientation: CgColor = $derived.by(() => {
    const flipPgn = this._flipBoolean;
    let orientation: CgColor =
      getTurnFromFen(this.startFen) === 'w'
        ? flipPgn
          ? 'black'
          : 'white'
        : flipPgn
          ? 'white'
          : 'black';

    if (this._randomBoolean) orientation = orientation === 'white' ? 'black' : 'white';

    return orientation;
  });

  // depends on cached currentMove
  turn: Color = $derived.by(() => {
    if (!this.currentMove) {
      // Ensure rootGame is loaded before accessing tags
      if (!this.rootGame) return 'w';
      return getTurnFromFen(this.startFen);
    }
    return this.currentMove.turn === 'w' ? 'b' : 'w';
  });

  // The "Raw" Calculation (Always calculates the freshest shapes)
  systemShapes = $derived.by(() => {
    const puzzleMode = /^(Puzzle|Study)$/.test(this.boardMode);
    if (this.boardMode === 'AI' || (puzzleMode && userConfig.opts.disableArrows)) return [];
    const prevMovePath = navigatePrevMove(this.pgnPath);
    const flipPgn = userConfig.opts.flipBoard && this.boardMode === 'Puzzle';
    const isStartOfPuzzle =
      puzzleMode && (!this.pgnPath.length || (flipPgn && !prevMovePath.length));
    if (isStartOfPuzzle) return [];
    const redrawCachedShapes = this.boardMode === 'Puzzle' && this.turn === this.playerColor[0];
    const pgnPath = redrawCachedShapes ? prevMovePath : this.pgnPath;
    const engineStore = this.engineStore;
    return [
      // Only spread engine shapes if the engine's eval matches our visual FEN
      ...(engineStore.enabled && engineStore.evalFen === this.fen ? engineStore.shapes : []),
      ...getSystemShapes(pgnPath, this._moveMap, this.boardMode),
      ...parseCal(puzzleMode ? [] : this.currentMove?.commentDiag?.colorArrows),
      ...parseCsl(puzzleMode ? [] : this.currentMove?.commentDiag?.colorFields),
    ];
  });

  boardConfig = $derived(getCgConfig(this));

  constructor(
    getPgn: () => string,
    getBoardMode: () => BoardModes,
    engineStore: EngineStore,
    timerStore: TimerStore,
  ) {
    this.engineStore = engineStore;
    this.timerStore = timerStore;
    this.boardMode = getBoardMode();

    // We differentiate between initial load and boarMode changes
    let isInitialEffectRun = true;

    // --- SYNCHRONOUS INITIALIZATION ---
    // We perform the initial setup immediately rather than waiting for Svelte's 
    // $effect to trigger after the first render. This prevents a 1-frame flicker 
    // (e.g., border flashing white) before the Svelte effect populates the correct state.
    untrack(() => {
      this._applyBoardModeState(this.boardMode, true, getPgn());
    });

    $effect(() => {
      const boardMode = this.boardMode;

      untrack(() => {
        if (isInitialEffectRun) {
          isInitialEffectRun = false;
          return; // Skip the first reactive run as we handled it synchronously
        }
        this._applyBoardModeState(boardMode, false, getPgn());
      });
    });

    // React to entirely new PGNs being loaded without killing the UI
    let pgnTrack = getPgn();
    $effect(() => {
      const rawPGN = getPgn();
      if (pgnTrack !== rawPGN) {
        this.loadNewGame(rawPGN);
        pgnTrack = rawPGN;
      }
    });

    $effect(() => {
      if (!this._hasMadeMistake && (this.errorCount > 0 || timerStore.isOutOfTime))
        this._hasMadeMistake = true;
    });
    $effect(() => {
      if (this.errorCount > userConfig.opts.handicap) {
        this.errorCount = 0;
        this._puzzleScore = 'incorrect';
      }
    });
    $effect(() => {
      if (this._puzzleScore || this.boardMode === 'Viewer') return;
      const currentMove = this.currentMove;
      untrack(() => {
        if (
          (this.boardMode === 'Puzzle' &&
            currentMove?.nag?.some((n) => blunderNags.includes(n)) &&
            currentMove?.turn === this.playerColor[0]) ||
          (this._hasMadeMistake && userConfig.opts.strictScoring)
        ) {
          this._puzzleScore = 'incorrect';
        } else if (this.isPuzzleComplete) {
          const isPerfectScore =
            (userConfig.opts.timer || userConfig.opts.handicap) &&
            !this._hasMadeMistake &&
            !userConfig.opts.strictScoring;
          this._puzzleScore = isPerfectScore ? 'perfect' : 'correct';
        }
      });
    });
    $effect(() => {
      const isPuzzleMode = /^(Puzzle|Study)$/.test(this.boardMode);
      const puzzledScored = this._puzzleScore && isPuzzleMode;
      if (puzzledScored)
        sessionStorage.setItem('chess_puzzle_score', this._puzzleScore!.toString());
    });

    // Save state on change
    $effect(() => {
      // Helper to normalize PGN string (alphanumeric only for robustness)
      const normalize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '');

      const stateToSave = {
        pgnPath: this.pgnPath,
        orientation: this.orientation,
        pgnRef: normalize(getPgn()).substring(0, 100),
        boardMode: this.boardMode
      };
      sessionStorage.setItem('anki_chess_state', JSON.stringify(stateToSave));
    });
  }

  loadNewGame(rawPGN: string) {
    !!this.rootGame && this._resetGameState();
    this.rootGame = undefined;
    this._moveMap = new Map<string, CustomPgnMove>();

    const parsed = parsePGN(rawPGN);
    mirrorPGN(parsed, this.boardMode);

    this.startFen = parsed.tags?.FEN ?? DEFAULT_POSITION;

    this.rootGame = parsed;
    augmentPgnTree(this.rootGame.moves, [], this.newChess(this.startFen), this._moveMap);

    // --- State Persistence (Anki Card Flip) ---
    if (this.boardMode !== 'Puzzle') {
      try {
        const savedStateJson = sessionStorage.getItem('anki_chess_state');
        const normalize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '');

        if (savedStateJson) {
          const savedState = JSON.parse(savedStateJson);
          const currentRef = normalize(rawPGN).substring(0, 100);

          if (savedState.pgnRef === currentRef) {
            // Restore orientation
            if (savedState.orientation !== this.orientation) {
              this._flipBoolean = !this._flipBoolean;
            }

            // Restore path
            if (savedState.pgnPath) {
              this.pgnPath = savedState.pgnPath;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to restore state:', e);
      }
    }
  }

  /*
   * METHODS
   */

  // --- Internal ---

  private _applyBoardModeState(boardMode: BoardModes, isInitialLoad: boolean, pgnStr: string) {
    this._resetGameState();
    this.timerStore.reset();
    boardMode !== 'Viewer' && this._clearGameStorage();

    if (boardMode === 'Viewer') {
      const storedScore = sessionStorage.getItem('chess_puzzle_score');
      this._randomBoolean = sessionStorage.getItem('chess_randomBoolean') === 'true';
      this._flipBoolean = sessionStorage.getItem('chess_flipBoolean') === 'true';
      this._puzzleScore = (storedScore as PuzzleScored) ?? null;
      // this._mirrorState = sessionStorage.getItem()
    } else if (/^(Puzzle|Study)$/.test(boardMode)) {
      this.engineStore.enabled = false;
      this.engineStore.stop();

      const flipPgn = boardMode === 'Puzzle' && userConfig.opts.flipBoard;
      this._flipBoolean = flipPgn;
      sessionStorage.setItem('chess_flipBoolean', flipPgn.toString());
      if (flipPgn) {
        playAiMove(this, userConfig.opts.animationTime + 100);
      }
      if (userConfig.opts.randomOrientation) {
        this._randomBoolean = !Math.round(Math.random());
        sessionStorage.setItem('chess_randomBoolean', this._randomBoolean.toString());
      }

      this.timerStore.start();
    } else if (boardMode === 'AI') {
      this._flipBoolean = false;
    }

    if (isInitialLoad) {
      this.loadNewGame(pgnStr);
    }

    if (boardMode === 'AI') {
      this.engineStore.init(this.fen);
    }
  }

  private _resetGameState() {
    this.pgnPath = [];
    this.errorCount = 0;
    this.selectedPiece = undefined;
    this.pendingPromotion = null;
    this.customAnimation = null;
    this._puzzleScore = null;
    this._hasMadeMistake = false;
    destroyPuzzleTimeouts();
    if (this._moveDebounce) {
      clearTimeout(this._moveDebounce);
      this._moveDebounce = null;
    }
  }

  private _clearGameStorage(): void {
    let keysToRemove = [
      'chess_puzzle_score',
      'chess_randomBoolean',
      'chess_flipBoolean',
      'chess_mirrorState',
    ];

    keysToRemove.forEach(function (key) {
      sessionStorage.removeItem(key);
    });
  }

  // --- Navigation Helpers ---

  next() {
    if (this.hasNext) {
      this.pgnPath = navigateNextMove(this.pgnPath);
    }
  }

  prev() {
    if (this.pgnPath.length > 0) {
      this.pgnPath = navigatePrevMove(this.pgnPath);
    }
  }

  reset() {
    this.pgnPath = [];
  }

  getMoveByPath(path: PgnPath): CustomPgnMove | null {
    const pathKey = path.join(',');
    return this._moveMap.get(pathKey) || null;
  }

  // --- CG Board ---

  loadCgInstance(boardContainer: HTMLDivElement) {
    if (!boardContainer) return;
    this.cg = Chessground(boardContainer, this.boardConfig);
  }

  // Prevent rapid move attempts
  setMoveDebounce(time = userConfig.opts.animationTime) {
    const timerStore = this.timerStore;
    timerStore.pause();
    this._moveDebounce = setTimeout(() => {
      this._moveDebounce = null;
      if (!this.isPuzzleComplete) timerStore.resume();
    }, time);
  }

  // toggle orientation helper
  toggleOrientation() {
    this._flipBoolean = !this._flipBoolean;
    playSound('castle');
  }

  addMove(move: Move) {
    if (!this.rootGame) return;
    const chess = this.newChess();
    if (this.currentMove?.history) {
      chess.loadPgn(this.currentMove.history);
    } else {
      chess.load(this.startFen);
    }
    const newPath = addMoveToPgn(move, this.pgnPath, this._moveMap, this.rootGame.moves, chess);
    // update local state
    this.pgnPath = newPath;
  }

  setPendingPromotion(from: Square, to: Square) {
    this.pendingPromotion = { from, to };
  }

  //  cancel (e.g. if user clicks away)
  cancelPromotion() {
    this.pendingPromotion = null;
    this.pgnPath = [...this.pgnPath]; // Trigger re-render to snap piece back
  }

  // --- Chess js ---
  newChess(fen?: string) {
    return new Chess(fen);
  }

  destroy() {
    this._resetGameState();
    this.cg = null;
    this.startFen = DEFAULT_POSITION;
    this.rootGame = undefined;
    this._moveMap = new Map<string, CustomPgnMove>();
  }

  /*
   * GETTERS
   */

  get hasNext() {
    // generate what the "next" path would be
    const nextPath = navigateNextMove(this.pgnPath);
    // check if that key exists in our map
    return this._moveMap.has(nextPath.join(','));
  }

  get puzzleScore() {
    return this._puzzleScore;
  }

  get rootMoves() {
    return this.rootGame?.moves;
  }

  get dests() {
    return toDests(this.fen);
  }

  // Chess js
  get inCheck() {
    if (!this.currentMove) return this.newChess(this.startFen).inCheck();
    return this.currentMove.isCheck;
  }

  get isCheckmate() {
    return this.currentMove?.isCheckmate ?? false;
  }

  get isDraw() {
    return this.currentMove?.isDraw ?? false;
  }

  get isThreefoldRepetition() {
    return this.currentMove?.isThreefoldRepetition ?? false;
  }

  get isGameOver() {
    if (!this.currentMove) return false;
    return this.currentMove.isCheckmate || this.currentMove.isStalemate || this.currentMove.isDraw;
  }

  get prevPath() {
    if (!this.pgnPath.length) return null;
    return navigatePrevMove(this.pgnPath);
  }

}
