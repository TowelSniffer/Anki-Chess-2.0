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
import { Chess, DEFAULT_POSITION } from 'chess.js';
import { Chessground } from '@lichess-org/chessground';
import { untrack } from 'svelte';

import { playAiMove } from '$features/chessJs/puzzleLogic';
import { getCgConfig } from '$features/board/cgInstance';
import { augmentPgnTree, addMoveToPgn } from '$features/pgn/augmentPgn';
import { navigateNextMove, navigatePrevMove } from '$features/pgn/pgnNavigate';
import { getTurnFromFen, toDests } from '$features/chessJs/chessFunctions';
import { getSystemShapes, blunderNags, parseCal, parseCsl } from '$features/board/arrows';
import { playSound } from '$features/audio/audio';
import { parsePGN, mirrorPGN } from '$features/pgn/pgnParsing';

import { engineStore } from './engineStore.svelte';
import { timerStore } from '$stores/timerStore.svelte';
import { userConfig } from '$stores/userConfig.svelte';

export class PgnGameStore {
  /*
   * GAME STATE
   */

  // --- State variables ---
  cg: Api | null = null;
  boardMode = $state<BoardModes>('Viewer');
  rootGame = $state<CustomPgnGame | undefined>(undefined);
  pgnPath = $state<PgnPath>([]);
  orientation = $state<CgColor>('white');
  errorCount = $state<number>(0);
  selectedPiece = $state<Square | undefined>(undefined);
  pendingPromotion = $state<{ from: Square; to: Square } | null>(null);
  customAnimation = $state(null);
  startFen = $state(DEFAULT_POSITION);
  playerColor = $state<CgColor>('white');
  opponentColor = $state<CgColor>('black');

  // --- Internal State ---
  private _puzzleScore: PuzzleScored = $state(null);
  private _hasMadeMistake: boolean = $state(false);
  private _moveMap = new Map<string, CustomPgnMove>();
  private _moveDebounce = $state<ReturnType<typeof setTimeout> | null>(null);

  /*
   * DERIVED STATE
   */

  aiDelayTime = $derived(userConfig.opts.animationTime + 100);
  isPuzzleComplete = $derived(/^(Puzzle|Study)$/.test(this.boardMode) && !this.hasNext);

  // caches the string key (prevents repeated .join() calls)
  currentPathKey = $derived(this.pgnPath.join(','));

  // caches the Map lookup
  currentMove = $derived(this._moveMap.get(this.currentPathKey) || null);

  // depends on cached currentMove
  fen = $derived(this.currentMove?.after ?? this.startFen);
  viewOnly = $derived(this._moveDebounce ? true : false);

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
    return [
      // Only spread engine shapes if the engine's eval matches our visual FEN
      ...(engineStore.enabled && engineStore.evalFen === this.fen ? engineStore.shapes : []),
      ...getSystemShapes(pgnPath, this._moveMap, this.boardMode),
      ...parseCal(puzzleMode ? [] : this.currentMove?.commentDiag?.colorArrows),
      ...parseCsl(puzzleMode ? [] : this.currentMove?.commentDiag?.colorFields),
    ];
  });

  boardConfig = $derived(getCgConfig(this));

  constructor(getPgn: () => string, getBoardMode: () => BoardModes) {
    // Initialize synchronously (BEFORE child components mount)
    const boardMode = () => {
      if (getBoardMode() === 'Puzzle' && userConfig.opts.playBothSides) return 'Study';
      return getBoardMode();
    };
    this.boardMode = boardMode();
    this.loadNewGame(getPgn());
    let isInitialPgnLoad = true;

    $effect(() => {
      this.boardMode = boardMode();
    });

    $effect(() => {
      if (this.boardMode === 'AI') {
        timerStore.reset();
        engineStore.init(this.fen);
      } else if (/^Puzzle|Study$/.test(this.boardMode)) {
        const flipPgn = this.boardMode === 'Puzzle' && userConfig.opts.flipBoard;
        untrack(() => {
          if (!isInitialPgnLoad) this.loadNewGame(getPgn());
          engineStore.stopAndClear();
          timerStore.reset();
          timerStore.start();
        });
        if (flipPgn) {
          requestAnimationFrame(() => {
            playAiMove(this, userConfig.opts.animationTime + 100);
          });
        }
      } else if (this.boardMode === 'Viewer') {
        untrack(() => {
          timerStore.stop();
          if (!isInitialPgnLoad) this.loadNewGame(getPgn());
        });
      }
    });

    // React to entirely new PGNs being loaded without killing the UI
    $effect(() => {
      const rawPGN = getPgn();
      if (isInitialPgnLoad) {
        isInitialPgnLoad = false;
        return;
      }
      untrack(() => {
        this.loadNewGame(rawPGN);
      });
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
      if (
        (this.boardMode === 'Puzzle' &&
          this.currentMove?.nag?.some((n) => blunderNags.includes(n)) &&
          this.currentMove?.turn === this.playerColor[0]) ||
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
    $effect(() => {
      if (this._puzzleScore && /^(Puzzle|Study)$/.test(this.boardMode))
        sessionStorage.setItem('chess_puzzle_score', this._puzzleScore);
    });
  }

  loadNewGame(rawPGN: string) {
    this._resetGameState();
    this._moveMap = new Map<string, CustomPgnMove>();
    const puzzleMode = /^(Puzzle|Study)$/.test(this.boardMode);
    const flipPgn = userConfig.opts.flipBoard && !/^Study|AI$/.test(this.boardMode);
    const storedRandomBoolean = sessionStorage.getItem('chess_randomBoolean') === 'true';
    if (storedRandomBoolean) sessionStorage.removeItem('chess_randomBoolean');

    const randomBoolean = !puzzleMode ? storedRandomBoolean : !Math.round(Math.random());
    if (puzzleMode) sessionStorage.setItem('chess_randomBoolean', `${randomBoolean}`);

    const storedScore = sessionStorage.getItem('chess_puzzle_score');
    if (!puzzleMode) {
      this._puzzleScore = (storedScore as PuzzleScored) ?? null;
    } else {
      this._puzzleScore = null;
    }
    if (storedScore) sessionStorage.removeItem('chess_puzzle_score');

    const parsed = parsePGN(rawPGN);
    mirrorPGN(parsed, this.boardMode);

    this.startFen = parsed.tags?.FEN ?? DEFAULT_POSITION;

    this.orientation =
      getTurnFromFen(this.startFen) === 'w'
        ? flipPgn
          ? 'black'
          : 'white'
        : flipPgn
          ? 'white'
          : 'black';
    this.playerColor = this.orientation;
    this.opponentColor = this.playerColor === 'white' ? 'black' : 'white';

    if (userConfig.opts.randomOrientation && randomBoolean)
      this.orientation = this.orientation === 'white' ? 'black' : 'white';

    this.rootGame = parsed;
    augmentPgnTree(this.rootGame.moves, [], this.newChess(this.startFen), this._moveMap);
  }

  /*
   * METHODS
   */

  // --- Internal ---

  private _resetGameState() {
    this.pgnPath = [];
    this.errorCount = 0;
    this.selectedPiece = undefined;
    this.pendingPromotion = null;
    this.customAnimation = null;
    this._puzzleScore = null;
    this._hasMadeMistake = false;
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
    this.cg = Chessground(boardContainer, { fen: this.fen });
  }

  // Prevent rapid move attempts
  setMoveDebounce(time = userConfig.opts.animationTime) {
    timerStore.pause();
    this._moveDebounce = setTimeout(() => {
      this._moveDebounce = null;
      if (!this.isPuzzleComplete) timerStore.resume();
    }, time);
  }

  // toggle orientation helper
  toggleOrientation() {
    this.orientation = this.orientation === 'white' ? 'black' : 'white';
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
