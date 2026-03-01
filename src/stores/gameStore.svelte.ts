import type { Color as CgColor, Key } from '@lichess-org/chessground/types';
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
import type { UserConfigOpts } from '$Types/UserConfig';

import { Chess, DEFAULT_POSITION } from 'chess.js';
import { Chessground } from '@lichess-org/chessground';
import { untrack } from 'svelte';

import defaultConfig from '$anki/default_config.json';
import { GameStorage } from '$utils/GameStorage';
import { getCgConfig } from '$features/board/cgInstance';
import { augmentPgnTree, addMoveToPgn } from '$features/pgn/augmentPgn';
import { playAiMove, destroyPuzzleTimeouts } from '$features/chessJs/puzzleLogic';
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
  config;

  // --- Trackers ---
  lastSelected: Key | undefined = undefined;

  // --- State variables ---
  cg = $state.raw<Api | null>(null);
  boardMode = $state<BoardModes>('Viewer');
  rootGame = $state<CustomPgnGame | undefined>(undefined);
  // Core tracker for board and PGN updates
  pgnPath = $state<PgnPath>([]);
  errorCount = $state<number>(0);
  pendingPromotion = $state<{ from: Square; to: Square } | null>(null);
  customAnimation = $state(null);
  startFen = $state(DEFAULT_POSITION);

  // --- Internal State ---
  private _puzzleScore: PuzzleScored = $state(null);
  private _hasMadeMistake: boolean = $state(false);
  private _moveMap = new Map<string, CustomPgnMove>();
  private _moveDebounce = $state<ReturnType<typeof setTimeout> | null>(null);

  private _flipBoolean: boolean = $state(false); // Track if Viewer should be flipped
  private _randOrientBool: boolean = $state(false); // Track random orientation
  private _storage: GameStorage;

  /*
   * DERIVED STATE
   */

  aiDelayTime = $derived(this.config.animationTime + 100);
  isPuzzleComplete = $derived(
    this.cg && /^(Puzzle|Study)$/.test(this.boardMode) && !this.hasNext,
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

    if (this._randOrientBool) orientation = orientation === 'white' ? 'black' : 'white';

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
    if (this.boardMode === 'AI' || (puzzleMode && this.config.disableArrows)) return [];
    const prevMovePath = navigatePrevMove(this.pgnPath);
    const flipPgn = this.config.flipBoard && this.boardMode === 'Puzzle';
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
    getConfig: UserConfigOpts,
    engineStore: EngineStore,
    timerStore: TimerStore,
    persist: boolean,
  ) {
    this._storage = new GameStorage(persist);
    this.config = getConfig();
    this.engineStore = engineStore;
    this.timerStore = timerStore;
    this.boardMode = getBoardMode();



    $effect(() => {
      $inspect(this.hasNext, this.isPuzzleComplete)
    })

    // Track the external props so we only update when Anki/App actually changes it
    let externalModeTrack = getBoardMode();
    let pgnTrack = '';

    // Track External BoardMode changes (New Card)
    $effect(() => {
      const externalMode = getBoardMode();
      if (externalModeTrack !== externalMode) {
        this.boardMode = externalMode;
        externalModeTrack = externalMode;
      }
    });

    // Handle boardMode and Pgn updates
    $effect(() => {
      const boardMode = this.boardMode;
      const PGN = getPgn();
      const newPgnCheck = pgnTrack !== PGN;
      if (newPgnCheck) {
        pgnTrack = PGN;
      }
      untrack(() => {
        this._applyBoardState(boardMode, getPgn());
        const reloadCheck =
          newPgnCheck || (/^Puzzle|Study$/.test(boardMode) && this.config.mirror);
        reloadCheck && this.loadNewGame(getPgn());
      });
    });

    // Store Move History
    $effect(() => {
      const newMove = this.currentMove;
      if (!newMove) return;

      // Log PgnPath
      const logPgnPath = this.boardMode !== 'Viewer';
      logPgnPath && this._storage.set('chess_pgnPath', `${newMove.pgnPath}`);

      // Log Ai PGN
      const aiPgn = newMove.history;
      const logAiHistory = this.boardMode === 'AI' && aiPgn;
      logAiHistory && this._storage.set('chess_aiPgn', `${aiPgn}`);
    });

    $effect(() => {
      if (!this._hasMadeMistake && (this.errorCount > 0 || timerStore.isOutOfTime))
        this._hasMadeMistake = true;
    });
    $effect(() => {
      if (this.errorCount > this.config.handicap) {
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
          (this._hasMadeMistake && this.config.strictScoring)
        ) {
          this._puzzleScore = 'incorrect';
        } else if (this.isPuzzleComplete) {
          const isPerfectScore =
            (this.config.timer || this.config.handicap) &&
            !this._hasMadeMistake &&
            !this.config.strictScoring;
          this._puzzleScore = isPerfectScore ? 'perfect' : 'correct';
        }
      });
    });
    $effect(() => {
      const isPuzzleMode = /^(Puzzle|Study)$/.test(this.boardMode);
      const puzzledScored = this._puzzleScore && isPuzzleMode;
      if (puzzledScored) this._storage.set('chess_puzzle_score', this._puzzleScore!.toString());
    });
  }

  loadNewGame(rawPGN: string) {
    this.rootGame = undefined;
    this._moveMap = new Map<string, CustomPgnMove>();

    const parsed = parsePGN(rawPGN);
    mirrorPGN(parsed, this.boardMode, this._storage.get('chess_mirrorState'));

    this.startFen = parsed.tags?.FEN ?? DEFAULT_POSITION;

    this.rootGame = parsed;
    augmentPgnTree(this.rootGame.moves, [], this.newChess(this.startFen), this._moveMap);

    // --- State Persistence (Card Flip) ---
    if (this.boardMode === 'Viewer') {
      const storedScore = this._storage.get('chess_puzzle_score');
      this._randOrientBool = this._storage.get('chess_randOrientBool') === 'true';
      this._flipBoolean = this._storage.get('chess_flipBoolean') === 'true';

      const storedPathStr = this._storage.get('chess_pgnPath');
      const storedPath = storedPathStr ? storedPathStr.split(',') : [];
      // FIXME should add a check to make sure its from the same PGN
      const isValidPath = !!this.getMoveByPath(storedPath);
      if (isValidPath) this.pgnPath = storedPath;

      this._puzzleScore = (storedScore as PuzzleScored) ?? null;
    }
    // Always clear storage after load
    this._storage.clearGame();
  }

  /*
   * METHODS
   */

  // --- Internal ---

  private _applyBoardState(boardMode: BoardModes, pgnStr: string) {
    // FIXME use pgnStr as a guard to make should storage items are valid
    this.timerStore.reset();

    if (boardMode !== 'Viewer') {
      this._resetGameState();
      this._storage.clearGame();
    }

    if (boardMode === 'Viewer') {
      const aiPgn = this._storage.get('chess_aiPgn');
      if (aiPgn && boardMode === 'Viewer') PGN = aiPgn;

    } else if (/^(Puzzle|Study)$/.test(boardMode)) {
      this.engineStore.enabled = false;
      this.engineStore.stop();

      const flipPgn = boardMode === 'Puzzle' && this.config.flipBoard;
      this._flipBoolean = flipPgn;
      this._storage.set('chess_flipBoolean', flipPgn.toString());

      if (flipPgn) {
        playAiMove(this, this.config.animationTime + 100);
      }
      if (this.config.randomOrientation) {
        this._randOrientBool = !Math.round(Math.random());
        this._storage.set('chess_randOrientBool', this._randOrientBool.toString());
      }

      this.timerStore.start();
    } else if (boardMode === 'AI') {
      this._flipBoolean = false;
    }
    boardMode === 'AI' && this.engineStore.init(this.fen);
  }

  private _resetGameState() {
    this.pgnPath = [];
    this.errorCount = 0;
    this.lastSelected = undefined;
    this.pendingPromotion = null;
    this.customAnimation = null;
    this._hasMadeMistake = false;
    this._puzzleScore = null;
    destroyPuzzleTimeouts();
    if (this._moveDebounce) {
      clearTimeout(this._moveDebounce);
      this._moveDebounce = null;
    }
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
  setMoveDebounce(time = this.config.animationTime) {
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
