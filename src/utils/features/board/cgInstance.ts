import type { Key } from '@lichess-org/chessground/types';
import type { Square } from 'chess.js';
import type { PgnGameStore } from '$stores/gameStore.svelte';
import type { CustomShape } from '$Types/ChessStructs';
import { userConfig } from '$stores/userConfig.svelte.ts';
import { isMoveLegal, isPromotion } from '$features/chessJs/chessFunctions';
import { shapePriority } from '$features/board/arrows';
import { handleUserMove } from '$features/chessJs/puzzleLogic';

// --- Logic Handlers ---

/**
 * Handles the 'select' event (Clicking a square).
 * Used for:
 * 1. Smart Moves (Clicking an arrow destination)
 * 2. Manual Click-to-Move handling (if needed)
 */
export function handleSelect(key: Key, store: PgnGameStore) {
  if (store.wrongMoveDebounce || !store.cg) return;
  // type assertion as clicked square cannot be 'a0'
  const dest = key as Square;
  // A. Check for Promotion via Click-to-Move (Piece already selected -> Click destination)
  if (
    store.selectedPiece &&
    dest &&
    isMoveLegal(
      { from: store.selectedPiece as Square, to: dest },
      store.fen,
    )
  ) {
    /**
     * Checks if user makes a standard click to move
     * NOTE: we defer to default click to move here as after: event will be called after select event
     * Setting Fen here without animation solves inconsistent animations for certain moves (en passant, promotion)
     */
    store.cg.set({ animation: { enabled: false } });
    store.cg.set({ fen: store.fen });
    store.cg.set({ animation: { enabled: true } });
    return;
  }

  // B. Smart Arrow / PGN Moves (Viewer Mode)
  // Check if we clicked a destination square that has a high-priority arrow pointing to it
  let moveCheck = null;
  const tempChess = store.newChess(store.fen);
  let matchingArrow: CustomShape | undefined;

  for (const brushType of shapePriority) {
    matchingArrow = store.systemShapes.find(
      (s) => s.dest === dest && s.brush === brushType,
    );
    if (matchingArrow) break;
  }

  if (matchingArrow && store.boardMode === 'Viewer') {
    // Case 1: Clicked an Arrow -> Play that move
    if (matchingArrow.san) {
      moveCheck = tempChess.move(matchingArrow.san);
    }
  } else if (userConfig.singleClickMove) {
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
export function handleMove( orig: Key, dest: Key, store: PgnGameStore) {
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

export function getInitialCgConfig(store: PgnGameStore) {
 return {
  fen: store.startFen,
  premovable: {
    enabled: true,
  },
  highlight: {
    check: true,
    currentMove: true,
  },
  animation: {
    duration: userConfig.animationTime,
  },
  drawable: {
    enabled: true,
    brushes: customBrushes,
  },
  events: {
    select: (key: Key) => {
      handleSelect(key, store);
    },
  },
  movable: {
    free: false,
    showDests: userConfig.showDests,
    events: {
      after: (orig: Key, dest: Key) => {
        handleMove(orig, dest, store);
      }
    }
  }
}
};

