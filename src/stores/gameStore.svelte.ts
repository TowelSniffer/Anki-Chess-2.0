import type { Color as CgColor } from '@lichess-org/chessground/types';
import type { Api } from '@lichess-org/chessground/api';
import type { Square, Move, Color } from 'chess.js';
import type {
  CustomPgnGame,
  CustomPgnMove,
  PgnPath,
  BoardModes,
  PuzzleScored,
  CustomShape
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
import { userConfig } from '$stores/userConfig.svelte.ts';

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

  wrongMoveDebounce: ReturnType<typeof setTimeout> | null = null;
  pendingPromotion = $state<{ from: Square; to: Square } | null>(null);

  // --- Internal State ---
  private _puzzleScore: PuzzleScored = null;
  private _hasMadeMistake: boolean = false;
  private _moveMap = new Map<string, CustomPgnMove>();

  // --- DERIVED STATE ---

  isPuzzleComplete = $derived(this.boardMode === 'Puzzle' && !this.hasNext);

  // caches the string key (prevents repeated .join() calls)
  currentPathKey = $derived(this.pgnPath.join(','));

  // caches the Map lookup
  currentMove = $derived(this._moveMap.get(this.currentPathKey) || null);

  // depends on cached currentMove
  fen = $derived(this.currentMove?.after ?? this.startFen);
  customAnimationFen = $state('');
  shouldAnimate = true;
  viewOnly = $state(false);

  // depends on cached currentMove
  turn: Color = $derived.by(() => {
    if (!this.currentMove) {
      // Ensure rootGame is loaded before accessing tags
      if (!this.rootGame) return 'w';
      return getTurnFromFen(this.startFen);
    }
    return this.currentMove.turn === 'w' ? 'b' : 'w';
  });

  // The last cached "Output" (What the board sees)
  _displayedShapes = $state<CustomShape[]>([]);

  // The "Raw" Calculation (Always calculates the freshest shapes)
  private _rawShapes = $derived([
    // Only spread engine shapes if the engine's eval matches our visual FEN
    ...(engineStore.enabled && engineStore.evalFen === this.fen ? engineStore.shapes : []),
    ...getSystemShapes(this.pgnPath, this._moveMap, this.boardMode),
    ...parseCal(this.boardMode === 'Puzzle' ? [] : this.currentMove?.commentDiag?.colorArrows),
    ...parseCsl(this.boardMode === 'Puzzle' ? [] : this.currentMove?.commentDiag?.colorFields)
  ]);

  constructor(rawPGN: string, boardMode: BoardModes) {
    const storedScore = sessionStorage.getItem('chess_puzzle_score');
    if (boardMode !== 'Puzzle') {
      this._puzzleScore = (storedScore as PuzzleScored) ?? null;
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
    this.customAnimationFen = this.startFen;
    this.rootGame = parsed;

    augmentPgnTree(
      this.rootGame.moves,
      [],
      this.newChess(this.startFen),
      this._moveMap,
    );

    $effect(() => {
      const redrawCachedShapes = this.boardMode === 'Puzzle' &&
        (this.turn === this.playerColor[0] || !this.pgnPath.length);

      if (redrawCachedShapes) {
        // FREEZE: Keeps systemShapes unchanged
        return;
      }

      // NORMAL: Sync the shapes
      this._displayedShapes = this._rawShapes;
    });
    $effect(() => {
      if (!this._hasMadeMistake && (this.errorCount > 0 || timerStore.isOutOfTime)) this._hasMadeMistake = true;
    });
  }

  boardConfig = $derived(getCgConfig(this));

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

  replayHistory(): Chess {
    const chess = this.newChess(this.startFen);
    // Get the list of moves to play
    const moves_to_play = this.currentMove?.history; // Can also use the verbose objects

    // Iterate and play each move
    moves_to_play?.forEach((move) => chess.move(move));
    return chess
  }

  // --- Getters ---

  get hasNext() {
    // generate what the "next" path would be
    const nextPath = navigateNextMove(this.pgnPath);
    // check if that key exists in our map
    return this._moveMap.has(nextPath.join(','));
  }

  get systemShapes() {
    return this._displayedShapes;
  }

  get puzzleScore() {
    if (this._puzzleScore || this.boardMode !== 'Puzzle') return this._puzzleScore;
    if (this._hasMadeMistake && userConfig.opts.strictScoring) {
      this._puzzleScore = 'incorrect';
    } else if (this.currentMove?.nag?.some((n) => blunderNags.includes(n)) && this.currentMove?.turn === this.playerColor[0]) {
      this._puzzleScore = 'incorrect';
    } else if (this.errorCount > userConfig.opts.handicap) {
      this._puzzleScore = 'incorrect';
    }
    // seperate if statement to force read when puzzle is finished.
    if (!this._puzzleScore && this.isPuzzleComplete) {
      this._puzzleScore = this._hasMadeMistake
        ? 'correct'
        : userConfig.opts.strictScoring
          ? 'correct'
          : 'perfect';
    }
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
    return this.currentMove.isCheckmate ||
      this.currentMove.isStalemate ||
      this.currentMove.isDraw;
  }


  // --- Methods ---

  // Public methods

  loadCgInstance(boardContainer: HTMLDivElement) {
    this.cg = Chessground(boardContainer, getCgConfig(this));
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
    const chess = this.replayHistory()
    const newPath = addMoveToPgn(
      move,
      this.pgnPath,
      this._moveMap,
      this.rootGame.moves,
      chess
    );

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
    return new Chess(fen)
  }

  // --- Helpers (Private) ---
}
