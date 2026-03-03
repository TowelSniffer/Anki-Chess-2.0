import type { Piece, Key, Color as CgColor } from '@lichess-org/chessground/types';
import type { Square } from 'chess.js';
import { untrack } from 'svelte';
import type { GameStore } from '$stores/gameStore.svelte';
import type { CustomShape } from '$Types/ChessStructs';
import { getLegalMove, isPromotion } from '$features/chessJs/chessFunctions';
import { shapePriority } from '$features/board/arrows';
import { moveAudio } from '$features/audio/audio';
import { handleUserMove } from '$features/chessJs/puzzleLogic';

// --- Logic Handlers ---

/**
 * Handles the 'select' event (Clicking a square).
 * Used for:
 * 1. Smart Moves (Clicking an arrow destination)
 * 2. Manual Click-to-Move handling (if needed)
 */
export function handleSelect(key: Key, store: GameStore) {
  // type assertion as clicked square cannot be 'a0'
  const orig = store.lastSelected; // Logged synchronously in ChessgroundBoard.svelte
  const dest = key as Square; // This will be a delayed asynchronous result (Chessground)

  // prevent out of turn moves in Puzzle mode
  const isNotPuzzleTurn =
    /^Puzzle|AI$/.test(store.boardMode) && store.turn !== store.playerColor[0];
  if (isNotPuzzleTurn) return;

  // A. Check for Promotion via Click-to-Move (Piece already selected -> Click destination)
  const isPromote = orig && dest && isPromotion(orig as Square, dest, store.fen);
  if (isPromote) {
    return;
  }

  if (isPromote || isNotPuzzleTurn) return;

  const legalMoveCheck =
    orig && dest && getLegalMove({ from: orig as Square, to: dest }, store.fen);
  if (orig && dest && legalMoveCheck) {
    /**
     * Checks if user makes a standard click to move
     * NOTE: we defer to default click to move here as move: event will be called after select event
     */

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
  if (moveCheck?.promotion) {
    handleUserMove(store, moveCheck.from, moveCheck.to, moveCheck.san);
  } else if (moveCheck) {
    store.cg.move(moveCheck.from, moveCheck.to);
  }
}

/**
 * Called before after: when running cg.move
 */
function handleMove(orig: Key, dest: Key, capturedPiece?: Piece, store: GameStore) {
  const from = orig as Square;
  const to = dest as Square;

  if (isPromotion(from, to, store.fen)) {
    store.setPendingPromotion(from, to);
    return;
  }
  const tempChess = store.newChess(store.fen);
  const moveCheck = from && to && getLegalMove({ from: from as Square, to: to }, store.fen);

  if (moveCheck?.flags.includes('e')) {
    // Fix bad en Passent animation with click to move
    store.customAnimation({ preFen: moveCheck.after, animate: false });
  }
  moveCheck && handleUserMove(store, from, to);
  const move = store.currentMove;
  const isForward = move && move.from === from && move.to === to;

  isForward && moveAudio(move);
  store.cg.playPremove();
}

/**
 * Handles the 'after' event (Drag and Drop or Click to Move completion).
 * Not called when running cg.move
 */
function handleAfter(orig: Key, dest: Key, store: GameStore) {
  console.log(store.cg.state.animation.current)

  const isSpecialMove = store.fen.split(' ')[0] !== store.cg.getFen();
  console.log('after', isSpecialMove);
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
    color: 'var(--status-fail)',
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
export function getCgConfig(store: GameStore) {
  /*
   * --- Reactive CG Config ---
   * Here we define a derived config to auto apply board updates with Svelte reactions.
   */
  // For AI and Puzzle movable should be kept as player color

    /*
   * Here we compare newFen with current cg fen to check if fen need to be set.
   * Ie if we capture a piece with en passent, we need to apply fen after cg.move
   * to make sure the captured piece disappears.
   * Also controlling this is useful for custom Promotion animations
   */
  const fixedMovable = /^(Puzzle|AI)$/.test(store.boardMode);
  const movableColor = fixedMovable ? store.playerColor : store.turn === 'w' ? 'white' : 'black';

  return {
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
      enabled: true,
      duration: store.config.animationTime,
    },
    drawable: {
      enabled: true,
      brushes: customBrushes,
      autoShapes: store.systemShapes,
    },
    events: {
      select: (key: Key) => {
        untrack(() => handleSelect(key, store));
      },
      move: (orig: Key, dest: Key, capturedPiece?: Piece) => {
        untrack(() => handleMove(orig, dest, capturedPiece, store));
      },
      dropNewPiece: (piece, key) => {
        console.log('dropNewPiece');
      },
    },
    movable: {
      free: false,
      showDests: store.config.showDests,
      color: movableColor,
      dests: store.dests,
      events: {
        after: (orig: Key, dest: Key) => {
          untrack(() => handleAfter(orig, dest, store));
        },
      },
    },
  };
}
