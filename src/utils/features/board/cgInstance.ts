import type { Key, Color as CgColor } from '@lichess-org/chessground/types';
import type { Square } from 'chess.js';
import type { IPgnGameStore } from '$Types/StoreInterfaces';
import type { CustomShape } from '$Types/ChessStructs';
import { getLegalMove, isPromotion } from '$features/chessJs/chessFunctions';
import { shapePriority } from '$features/board/arrows';
import { handleUserMove } from '$features/chessJs/puzzleLogic';

// --- Logic Handlers ---

/**
 * Handles the 'select' event (Clicking a square).
 * Used for:
 * 1. Smart Moves (Clicking an arrow destination)
 * 2. Manual Click-to-Move handling (if needed)
 */
export function handleSelect(key: Key, store: IPgnGameStore) {
  if (!store.cg) return;
  // type assertion as clicked square cannot be 'a0'
  const orig = store.lastSelected; // Logged synchronously in ChessgroundBoard.svelte
  const dest = key as Square; // This will be a delayed asynchronous result (Chessground)

  // prevent out of turn moves in Puzzle mode
  const isNotPuzzleTurn =
    /^Puzzle|AI$/.test(store.boardMode) && store.turn !== store.playerColor[0];

  // A. Check for Promotion via Click-to-Move (Piece already selected -> Click destination)
  const isPromote = orig && dest && isPromotion(orig as Square, dest, store.fen);

  if (isPromote || isNotPuzzleTurn) return;

  const legalMoveCheck =
    orig && dest && getLegalMove({ from: orig as Square, to: dest }, store.fen);
  if (orig && dest && legalMoveCheck) {
    /**
     * Checks if user makes a standard click to move
     * NOTE: we defer to default click to move here as after: event will be called after select event
     * Setting Fen here without animation solves inconsistent animations for certain moves (en passant, promotion)
     */

    if (legalMoveCheck.flags?.includes('e')) {
      // fix broken animation for en passent click to move.
      store.customAnimation = { fen: store.fen, animate: false };
    }
    return;
  }

  // B. Smart Arrow / PGN Moves (Viewer Mode)
  // Check if we clicked a destination square that has a high-priority arrow pointing to it
  let moveCheck = null;
  const tempChess = store.newChess(store.fen);
  let matchingArrow: CustomShape | undefined;
  if (store.boardMode === 'Viewer') {
    for (const brushType of shapePriority) {
      matchingArrow = store.systemShapes.find((s) => s.dest === dest && s.brush === brushType);
      if (matchingArrow) break;
    }

    if (matchingArrow) {
      // Case 1: Clicked an Arrow -> Play that move
      if (matchingArrow.san) {
        moveCheck = tempChess.move(matchingArrow.san);
      }
    }
  }

  if (!moveCheck && store.config.singleClickMove) {
    // Case 2: Clicked a square with only ONE legal move reaching it (Ambiguity check)
    // useful for rapid clicking in viewer
    const allMoves = tempChess.moves({ verbose: true });
    const movesToSquare = allMoves.filter((move) => move.to === key);
    if (movesToSquare.length === 1) {
      moveCheck = movesToSquare[0];
    }
  }

  if (moveCheck) {
    handleUserMove(store, moveCheck.from, moveCheck.to, moveCheck.san);
  }
}

/**
 * Handles the 'after' event (Drag and Drop completion).
 */
export function handleMove(orig: Key, dest: Key, store: IPgnGameStore) {
  if (!store.cg) return;
  const from = orig as Square;
  const to = dest as Square;

  // Check Promotion
  if (isPromotion(from, to, store.fen)) {
    store.cg.move(from, to);
    store.setPendingPromotion(from, to);
    return;
  }

  // Standard Move
  handleUserMove(store, from, to);
}

// --- Configuration ---

const customBrushes = {
  stockfish: {
    key: 'stockfish',
    color: 'black',
    opacity: 0.4,
    lineWidth: 4,
  },
  stockfishAlt: {
    key: 'stockfishAlt',
    color: 'black',
    opacity: 0.3,
    lineWidth: 4,
  },
  mainLine: {
    key: 'mainLine',
    color: '#66AA66',
    opacity: 1,
    lineWidth: 8,
  },
  altLine: {
    key: 'altLine',
    color: '#66AAAA',
    opacity: 1,
    lineWidth: 8,
  },
  goodLine: {
    key: 'goodLine',
    color: 'var(--status-perfect)',
    opacity: 1,
    lineWidth: 8,
  },
  blunderLine: {
    key: 'blunderLine',
    color: 'var(--status-error)',
    opacity: 1,
    lineWidth: 7,
  },
  nagOnly: {
    key: 'nagOnly',
    color: 'transparent',
    opacity: 1,
    lineWidth: 7,
  },
  // default
  green: { key: 'green', color: 'green', opacity: 1, lineWidth: 7 },
  red: { key: 'red', color: 'red', opacity: 1, lineWidth: 7 },
  blue: { key: 'blue', color: 'blue', opacity: 1, lineWidth: 7 },
  yellow: { key: 'yellow', color: 'yellow', opacity: 1, lineWidth: 7 },
};

// track existing custom animations
let isAnimating: ReturnType<typeof setTimeout> | null;
export function getCgConfig(store: IPgnGameStore) {
  /*
   * Here we define a derived config to auto apply board updates with
   * Svelte reactions.
   */

  // For AI and Puzzle movable should be kept as player color
  const fixedMovable = /^(Puzzle|AI)$/.test(store.boardMode);
  const movableColor = fixedMovable ? store.playerColor : store.turn === 'w' ? 'white' : 'black';

  // we will distinguish between Fen changes and other config changes
  let isFenUpdate = true;

  const isCustomAnimation =
    store.customAnimation && store.customAnimation?.fen.split(' ')[0] !== store.cg?.getFen();
  const isStandardFenUpdate = store.fen.split(' ')[0] !== store.cg?.getFen();

  if (isCustomAnimation) {
    const timer = store.customAnimation?.animate;
    const animationTime = store.config.animationTime;
    if (isAnimating) {
      clearTimeout(isAnimating);
      isAnimating = null;
    }
    isAnimating = setTimeout(
      () => {
        isAnimating = null;
        // Setting reactive value in asynchronous function is ok
        if (!!store) store.customAnimation = null;
      },
      timer ? animationTime : 0,
    );
  } else if (isStandardFenUpdate) {
    if (store.customAnimation) {
      requestAnimationFrame(() => {
        // Setting reactive value in asynchronous function is ok
        if (!!store) store.customAnimation = null;
      });
    }
    if (isAnimating) {
      clearTimeout(isAnimating);
      isAnimating = null;
    }
  } else {
    // No Fen change
    // Reacting to other config change
    isFenUpdate = false;
  }
  let newFen;
  if (isFenUpdate) {
    newFen = store.customAnimation?.fen ?? store.fen;
    const shouldAnimate = store.cg?.getFen() !== newFen.split(' ')[0];
    if (!shouldAnimate) isFenUpdate = false;
    // immediately clear shapes for consistent shape rendering with
    // custom animations
    if (isFenUpdate) store.cg?.setAutoShapes([]);
  }


  return {
    ...(isFenUpdate && { fen: newFen }),
    lastMove: store.currentMove ? [store.currentMove.from, store.currentMove.to] : undefined,
    check: store.inCheck,
    orientation: store.orientation,
    viewOnly: store.isPuzzleComplete || store.viewOnly || store.isGameOver,
    turnColor: (store.turn === 'w' ? 'white' : 'black') as CgColor,
    premovable: {
      enabled: true,
    },
    highlight: {
      check: true,
      currentMove: true,
    },
    animation: {
      enabled: store.customAnimation ? store.customAnimation.animate : true,
      duration: store.config.animationTime,
    },
    drawable: {
      enabled: true,
      brushes: customBrushes,
      autoShapes: store.systemShapes,
    },
    events: {
      select: (key: Key) => {
        handleSelect(key, store);
      },
    },
    movable: {
      free: false,
      showDests: store.config.showDests,
      color: movableColor,
      dests: store.dests,
      events: {
        after: (orig: Key, dest: Key) => {
          handleMove(orig, dest, store);
        },
      },
    },
  };
}
