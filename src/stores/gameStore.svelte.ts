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
  // --- Game State ---
  cg: Api | null = null;
  boardMode: BoardModes = 'Viewer';
  readonly aiDelayTime = userConfig.opts.animationTime + 100;
  rootGame = $state<CustomPgnGame | undefined>(undefined);
  pgnPath = $state<PgnPath>([]);
  orientation = $state<CgColor>('white');
  errorCount = $state<number>(0);
  selectedPiece = $state<Square | undefined>(undefined);

  startFen = DEFAULT_POSITION;

  playerColor: CgColor = 'white';
  opponentColor: CgColor = 'black';

  pendingPromotion = $state<{ from: Square; to: Square } | null>(null);

  // --- Internal State ---
  private _puzzleScore: PuzzleScored = $state(null);
  private _hasMadeMistake: boolean = $state(false);
  private _moveMap = new Map<string, CustomPgnMove>();
  private _moveDebounce = $state<ReturnType<typeof setTimeout> | null>(null);

  // --- DERIVED STATE ---

  isPuzzleComplete = $derived(/^(Puzzle|Study)$/.test(this.boardMode) && !this.hasNext);

  // caches the string key (prevents repeated .join() calls)
  currentPathKey = $derived(this.pgnPath.join(','));

  // caches the Map lookup
  currentMove = $derived(this._moveMap.get(this.currentPathKey) || null);

  // depends on cached currentMove
  fen = $derived(this.currentMove?.after ?? this.startFen);
  customAnimation = $state(null);
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
    const isStartOfPuzzle =
      puzzleMode && (!this.pgnPath.length || (userConfig.opts.flipBoard && !prevMovePath.length));
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

  constructor(rawPGN: string, boardMode: BoardModes) {
    const puzzleMode = /^(Puzzle|Study)$/.test(boardMode);
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
    this.boardMode = boardMode;

    const parsed = parsePGN(rawPGN);
    mirrorPGN(parsed, boardMode);

    this.startFen = parsed.tags?.FEN ?? DEFAULT_POSITION;

    this.orientation =
      parsed?.moves[0]?.turn === 'w'
        ? userConfig.opts.flipBoard
          ? 'black'
          : 'white'
        : userConfig.opts.flipBoard
          ? 'white'
          : 'black';
    this.playerColor = this.orientation;
    this.opponentColor = this.playerColor === 'white' ? 'black' : 'white';

    if (userConfig.opts.randomOrientation && randomBoolean)
      this.orientation = this.orientation === 'white' ? 'black' : 'white';

    this.rootGame = parsed;

    augmentPgnTree(this.rootGame.moves, [], this.newChess(this.startFen), this._moveMap);

    $effect(() => {
      $inspect(this._puzzleScore)
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

  boardConfig = $derived(getCgConfig(this));

  // --- Navigation Helpers ---

  setMoveDebounce(time = userConfig.opts.animationTime) {
    timerStore.pause();
    this._moveDebounce = setTimeout(() => {
      this._moveDebounce = null;
      if (!this.isPuzzleComplete) timerStore.resume();
    }, time);
  }

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

  replayHistory(): Chess {
    const chess = this.newChess(this.startFen);
    // Get the list of moves to play
    const moves_to_play = this.currentMove?.history; // Can also use the verbose objects

    // Iterate and play each move
    moves_to_play?.forEach((move) => chess.move(move));
    return chess;
  }

  // --- Getters ---

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

  // --- Methods ---

  // Public methods

  loadCgInstance(boardContainer: HTMLDivElement) {
    this.cg = Chessground(boardContainer, { fen: this.fen });
  }

  getMoveByPath(path: PgnPath): CustomPgnMove | null {
    const pathKey = path.join(',');
    return this._moveMap.get(pathKey) || null;
  }

  // toggle orientation helper
  toggleOrientation() {
    this.orientation = this.orientation === 'white' ? 'black' : 'white';
    playSound('castle');
  }

  addMove(move: Move) {
    if (!this.rootGame) return;
    const chess = this.replayHistory();
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

  // Chess js
  newChess(fen: string) {
    return new Chess(fen);
  }

  // --- Helpers (Private) ---
}
