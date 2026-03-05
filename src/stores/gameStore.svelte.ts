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
import type { MirrorState } from '$features/pgn/mirror';

import type { EngineStore } from './engineStore.svelte';
import type { TimerStore } from '$stores/timerStore.svelte';
import type { UserConfigOpts } from '$Types/UserConfig';

import { Chess, DEFAULT_POSITION } from 'chess.js';
import { Chessground } from '@lichess-org/chessground';
import { untrack } from 'svelte';

import { GameStorage } from '$utils/GameStorage';
import { getCgConfig } from '$features/board/cgInstance';
import { assignMirrorState } from '$features/pgn/mirror';
import { augmentPgnTree, addMoveToPgn } from '$features/pgn/augmentPgn';
import { playAiMove } from '$features/chessJs/puzzleLogic';
import { navigateNextMove, navigatePrevMove } from '$features/pgn/pgnNavigate';
import { getTurnFromFen, toDests } from '$features/chessJs/chessFunctions';
import { getSystemShapes, blunderNags, parseCal, parseCsl } from '$features/board/arrows';
import { playSound } from '$features/audio/audio';
import { parsePGN, mirrorPGN } from '$features/pgn/pgnParsing';

export class GameStore {
  /*
   * GAME STATE
   */

  // --- Stores ---
  engineStore: EngineStore;
  timerStore: TimerStore;
  config: UserConfigOpts;

  // --- Trackers ---
  lastSelected: Key | undefined = undefined;
  errorCount = 0;
  animationTimeout: number | null = null;
  #activeTimeouts = new Set<ReturnType<typeof setTimeout>>();

  // --- Board State ---
  startFen: string = DEFAULT_POSITION;
  cg?: Api;

  // --- State variables ---

  rootGame = $state<CustomPgnGame | undefined>(undefined);
  // Core tracker for board and PGN updates
  pgnPath: PgnPath;
  // Call PromotePopup
  pendingPromotion = $state<{ from: Square; to: Square } | null>(null);
  parseError = $state<string | null>(null);
  hasMadeMistake: boolean = $state(false);

  // --- Private State ---
  #flipBoolean: boolean; // Board orientation
  #storedScore: PuzzleScored | null = null;
  #boardMode: BoardModes;
  #trackedPathKey: string | undefined;
  #moveMap = new Map<string, CustomPgnMove>();
  #moveDebounce = $state<ReturnType<typeof setTimeout> | null>(null);

  #orientBool: boolean; // Track randomOrientation boolean
  #storage: GameStorage;

  constructor(
    getPgn: () => string,
    getBoardMode: () => BoardModes,
    getConfig: () => UserConfigOpts,
    getPersist: () => boolean,
    engineStore: EngineStore,
    timerStore: TimerStore,
  ) {
    this.#storage = new GameStorage(getPersist());
    this.config = getConfig();
    this.engineStore = engineStore;
    this.timerStore = timerStore;
    let storedPath = [];
    if (this.config.storePgnPath) {
      const storedPathStr = this.#storage.get('chess_pgnPath');
      // Map over the string array and convert numeric strings to actual numbers
      storedPath = storedPathStr
        ? (storedPathStr
            .split(',')
            .map((step) => (isNaN(Number(step)) ? step : Number(step))) as PgnPath)
        : [];
    }
    const pgnPath = storedPath ?? [];
    this.pgnPath = $state(pgnPath);

    this.#boardMode = $state(getBoardMode());
    this.#flipBoolean = $state(false);
    this.#orientBool = $state(false);
    this.setBoardMode(getBoardMode());
    this.loadNewGame(getPgn());

    let modeTrack = getBoardMode();
    // $effect(() => {
    //   $inspect(this.hasNext, this.isPuzzleComplete);
    // });

    $effect(() => {
      if (this.boardMode === modeTrack) return;
      modeTrack = this.boardMode;
      this.setBoardMode(modeTrack);
    });

    $effect(() => {
      const path = this.pgnPath;
      this.#trackedPathKey = path.join(',');
    });

    // Set cg config
    $effect(() => {
      const config = this.boardConfig;
      this.cg?.set(config);
    });

    // Handle boardMode and Pgn updates
    $effect(() => {
      const boardMode = this.boardMode;
      const PGN = getPgn();

      const reloadCheck = /^Puzzle|Study$/.test(boardMode) && this.config.mirror;
      untrack(() => {
        reloadCheck && this.loadNewGame(PGN);
      });
    });

    // Store Move History
    $effect(() => {
      const newMove = this.currentMove;
      if (!newMove) return;

      // Log PgnPath
      const logPgnPath = this.boardMode !== 'Viewer' && this.config.storePgnPath;
      logPgnPath && this.#storage.set('chess_pgnPath', `${newMove.pgnPath}`);

      // Log Ai PGN
      const aiPgn = newMove.history;
      const logAiHistory = this.boardMode === 'AI' && aiPgn;
      logAiHistory && this.#storage.set('chess_aiPgn', `${aiPgn}`);
    });

    // --- PUZZLE SCORING ---
    $effect(() => {
      const isPuzzleMode = /^(Puzzle|Study)$/.test(this.boardMode);
      const puzzledScored = this.puzzleScore && isPuzzleMode;
      if (puzzledScored) this.#storage.set('chess_puzzle_score', this.puzzleScore!.toString());
    });
  }

  /*
   * GETTERS
   */

  get boardMode() {
    return this.#boardMode;
  }

  get aiDelayTime() {
    return this.config.animationTime + 100;
  }

  get isPuzzleComplete() {
    return /^(Puzzle|Study)$/.test(this.boardMode) && !this.hasNext;
  }

  get puzzleScore() {
    /*
     * We track mistakes and blunders in puzzle and Study mode and Scores Puzzle.
     * Mistakes: wrong moves played; Timer is 0
     * Fail: if strictScoring, any mistake; Blunder move played in puzzle
     * mode; errorCount > handicap
     * puzzleScores: if strictScoring [ pass, fail ]
     * else  [ perfect, pass, fail ]
     */
    if (this.#storedScore) return this.#storedScore;

    const isPuzzle = /^(Puzzle|Study)$/.test(this.boardMode);
    // We only score once per puzzle
    if (!isPuzzle) return null;

    // We check score on new currentMove
    const currentMove = this.currentMove;

    // We mark blunder lines as fail if played in Puzzle
    const isNagBlunder =
      this.boardMode === 'Puzzle' &&
      currentMove?.nag?.some((n) => blunderNags.includes(n)) &&
      currentMove?.turn === this.playerColor[0];

    // Any mistake is a fail if strictScoring
    const mistakeCheck = this.hasMadeMistake || this.timerStore.isOutOfTime;
    const isStrictMistake = this.config.strictScoring && mistakeCheck;

    const isHandicapFail = this.errorCount > this.config.handicap;

    if (isNagBlunder || isStrictMistake || isHandicapFail) {
      // if Fail
      this.#storedScore = 'fail';
      return 'fail';
    } else if (this.isPuzzleComplete) {
      // Grade on puzzle completion
      const isPerfectScore =
        (this.config.timer || this.config.handicap) && !mistakeCheck && !this.config.strictScoring;
      this.#storedScore = isPerfectScore ? 'perfect' : 'pass';
      return isPerfectScore ? 'perfect' : 'pass';
    }
    this.#storedScore = null;
    return null;
  }

  // caches the string key (prevents repeated .join() calls)
  get currentPathKey() {
    return this.pgnPath.join(',');
  }

  // caches the Map lookup
  get currentMove() {
    return this.#moveMap.get(this.currentPathKey) || null;
  }

  get trackedMove() {
    // We track moves for undo logic
    const path = untrack(() => this.#trackedPathKey);
    return path ? this.#moveMap.get(path) : null;
  }

  // depends on cached currentMove
  get fen() {
    return this.currentMove?.after ?? this.startFen;
  }

  get viewOnly() {
    return this.isPuzzleComplete || this.isGameOver || !!this.#moveDebounce;
  }

  get playerColor(): CgColor {
    let color: CgColor = getTurnFromFen(this.startFen) === 'w' ? 'white' : 'black';
    if (this.#flipBoolean) color = color === 'white' ? 'black' : 'white';
    if (this.#orientBool) {
      if (this.#flipBoolean) {
        color = color === 'white' ? 'white' : 'black';
      } else {
        color = color === 'white' ? 'black' : 'white';
      }
    }

    return color;
  }

  get opponentColor(): CgColor {
    return this.playerColor === 'white' ? 'black' : 'white';
  }

  get orientation(): CgColor {
    const flipPgn = this.#flipBoolean;
    const randFlip = this.#orientBool;

    let orientation: CgColor = getTurnFromFen(this.startFen) === 'w' ? 'white' : 'black';

    if (flipPgn) orientation = orientation === 'white' ? 'black' : 'white';
    if (randFlip) orientation = orientation === 'white' ? 'black' : 'white';

    return orientation;
  }

  // depends on cached currentMove
  get turn(): Color {
    if (!this.currentMove) {
      // Ensure rootGame is loaded before accessing tags
      if (!this.rootGame) return 'w';
      return getTurnFromFen(this.startFen);
    }
    return this.currentMove.turn === 'w' ? 'b' : 'w';
  }

  // The "Raw" Calculation (Always calculates the freshest shapes)
  get systemShapes() {
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
      ...getSystemShapes(pgnPath, this.#moveMap, this.boardMode),
      ...parseCal(puzzleMode ? [] : this.currentMove?.commentDiag?.colorArrows),
      ...parseCsl(puzzleMode ? [] : this.currentMove?.commentDiag?.colorFields),
    ];
  }

  get boardConfig() {
    return getCgConfig(this);
  }

  get hasNext() {
    // generate what the "next" path would be
    const nextPath = navigateNextMove(this.pgnPath);
    // check if that key exists in our map
    return this.#moveMap.has(nextPath.join(','));
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
    return (
      this.currentMove?.isCheckmate || this.currentMove?.isStalemate || this.currentMove?.isDraw
    );
  }

  get prevPath() {
    if (!this.pgnPath.length) return null;
    return navigatePrevMove(this.pgnPath);
  }

  /*
   * METHODS
   */

  setBoardMode(boardMode: BoardModes) {
    this.timerStore.reset();
    if (boardMode !== 'Viewer') this.pgnPath = [];

    if (/^(Puzzle|Study)$/.test(boardMode)) {
      this.#resetGameState();
      this.engineStore.enabled = false;
      this.engineStore.stop();
      this.timerStore.start();
      const playAi = boardMode === 'Puzzle' && this.config.flipBoard;
      if (playAi) {
        this.#flipBoolean = true;
        this.#storage.set('chess_flipBoolean', 'true');
        this.cg &&
          this.setTrackedTimeout(() => {
            playAiMove(this, 0);
          }, 200);
      }
      if (this.config.randomOrientation) {
        this.#orientBool = !Math.round(Math.random());
        this.#storage.set('chess_randOrientBool', this.#orientBool.toString());
      }
    } else if (boardMode === 'AI') {
      this.#orientBool = false;
      this.#flipBoolean = false;
      this.engineStore.init(this.fen);
      this.#storage.clearGame();
    }

    this.#boardMode = boardMode;
  }

  loadNewGame(rawPGN: string) {
    let PGN = rawPGN;
    let mirrorState: MirrorState = 'original';

    // --- State Persistence (Card Flip) ---

    if (this.boardMode === 'Viewer') {
      const storedScore = this.#storage.get('chess_puzzle_score');
      this.#orientBool = this.#storage.get('chess_randOrientBool') === 'true';
      this.#flipBoolean = this.#storage.get('chess_flipBoolean') === 'true';
      this.#storedScore = (storedScore as PuzzleScored) ?? null;

      const aiPgn = this.#storage.get('chess_aiPgn');
      if (aiPgn && this.boardMode === 'Viewer') PGN = aiPgn;

      const storedMirror = this.#storage.get('chess_mirrorState');
      if (storedMirror && this.config.mirror) mirrorState = storedMirror as MirrorState;
      // Clear storage after 'Viewer' load
      this.#storage.clearGame();
    } else if (/^(Puzzle|Study)$/.test(this.boardMode)) {
      if (this.boardMode === 'Puzzle') {
        if (this.config.mirror) {
          mirrorState = assignMirrorState();
          this.#storage.set('chess_mirrorState', `${mirrorState}`);
        }
      }
    }

    this.rootGame = undefined;
    this.#moveMap.clear();

    const parsedData = parsePGN(PGN);
    const parsedPgn = parsedData.parsedPgn;

    // Capture the error (if any)
    this.parseError = parsedData.error || null;

    mirrorPGN(parsedPgn, mirrorState);

    this.rootGame = parsedPgn;
    this.startFen = this.rootGame.tags?.FEN ?? DEFAULT_POSITION;

    // Wrap the tree augmentation in a try/catch to catch Invalid PGN errors
    try {
      augmentPgnTree(this.rootGame.moves, [], this.newChess(this.startFen), this.#moveMap);
    } catch (e) {
      console.warn(e);
      this.parseError =
        e instanceof Error ? e.message : 'An unknown error occurred applying moves.';

      // Clear the corrupted moves so the app doesn't lock up or crash
      this.rootGame.moves = [];
      this.#moveMap.clear();
    }

    this.cg && this.customAnimation({ preFen: this.fen, animate: false });
  }

  customAnimation(animation: { preFen: string | null; animate: boolean; postFen?: string }): void {
    /*
     * --- Control Chessground animations ---
     * Eg. default promotion isn't good so with this we can pass a fen with the pawn
     * moved and animate that, then with postFen we can change the pawn to
     * promotion choice with timeout
     */
    if (this.animationTimeout) {
      this.clearTrackedTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
    if (animation.preFen) {
      this.cg?.set({
        fen: animation.preFen,
        animation: {
          enabled: animation.animate,
        },
      });
    }

    if (animation.postFen) {
      this.animationTimeout = this.setTrackedTimeout(() => {
        const isSamePosition = this.fen === animation.postFen;
        if (isSamePosition) {
          this.cg?.set({ fen: animation.postFen });
        }
        this.animationTimeout = null;
      }, this.config.animationTime);
    }
  }

  clearError() {
    this.parseError = null;
  }

  // --- Internal ---

  #resetGameState() {
    this.errorCount = 0;
    this.lastSelected = undefined;
    this.pendingPromotion = null;
    this.#storedScore = null;
    this.hasMadeMistake = false;
    this.#destroyTimeouts();
  }

  // --- Timeout Management ---

  setTrackedTimeout(callback: () => void, delay: number): ReturnType<typeof setTimeout> {
    const id = setTimeout(() => {
      this.#activeTimeouts.delete(id);
      callback();
    }, delay);
    this.#activeTimeouts.add(id);
    return id; // Return the ID so we can target it specifically
  }

  clearTrackedTimeout(id: ReturnType<typeof setTimeout> | null) {
    if (!id) return;
    clearTimeout(id);
    this.#activeTimeouts.delete(id); // Remove it from the cleanup Set
  }

  #destroyTimeouts() {
    this.#activeTimeouts.forEach(clearTimeout);
    this.#activeTimeouts.clear();
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
    return this.#moveMap.get(pathKey) || null;
  }

  // --- CG Board ---

  loadCgInstance = (node: HTMLDivElement) => {
    if (!node) return;
    this.cg = Chessground(node, { fen: this.fen });
    this.cg.set(this.boardConfig);
    this.setTrackedTimeout(() => {
      playAiMove(this, 0);
    }, 200);

    return {
      destroy: () => {
        this.cg?.destroy();
      },
    };
  };

  // Prevent rapid move attempts
  setMoveDebounce(time = this.config.animationTime) {
    this.timerStore.pause();

    if (this.#moveDebounce) this.clearTrackedTimeout(this.#moveDebounce);
    this.#moveDebounce = this.setTrackedTimeout(() => {
      this.#moveDebounce = null;
      if (!this.isPuzzleComplete) this.timerStore.resume();
    }, time);
  }

  // toggle orientation helper
  toggleOrientation() {
    this.#orientBool = !this.#orientBool;
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
    const newPath = addMoveToPgn(move, this.pgnPath, this.#moveMap, this.rootGame.moves, chess);
    // update local state
    this.pgnPath = newPath;
  }

  setPendingPromotion(from: Square, to: Square) {
    this.pendingPromotion = { from, to };
  }

  //  cancel (e.g. if user clicks away)
  cancelPromotion() {
    this.pendingPromotion = null;
  }

  // --- Chess js ---
  newChess(fen?: string) {
    return new Chess(fen);
  }

  destroy() {
    this.#resetGameState();
    this.rootGame = undefined;
    this.#moveMap.clear();
  }
}
