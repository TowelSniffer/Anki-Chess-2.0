import type { Api } from '@lichess-org/chessground/api';
import type { Key } from '@lichess-org/chessground/types';
import { Chess } from 'chess.js';
import type { Color, Role, Pieces } from '@lichess-org/chessground/types';
import type { Color as ChessJsColor } from 'chess.js';
import type {
  CustomPgnMove,
  SanPromotions,
  PgnPath,
} from '$stores/gameStore.svelte';
import { userConfig } from '$stores/userConfig.svelte.ts';
import { navigatePrevMove } from '$features/pgn/pgnNavigate';
import { moveAudio, playSound } from '$features/audio/audio';
import type { PgnGameStore } from '$stores/Providers/GameProvider.svelte';

const promotionToRole: Record<SanPromotions, Role> = {
  Q: 'queen',
  R: 'rook',
  B: 'bishop',
  N: 'knight',
};

const chessColorToCg: Record<ChessJsColor, Color> = {
  w: 'white',
  b: 'black',
};

function animateForwardPromotion(
  cg: Api,
  move: CustomPgnMove,
  promotion: SanPromotions,

) {
  const role = promotionToRole[promotion];
  const color = chessColorToCg[move.turn];

  // If called with promotePopup, move animation is not needed
  const pieceCheck = cg.state.pieces.get(move.to);
  if (pieceCheck?.role === 'pawn') {
    cg.set({ animation: { enabled: false } });
    cg.set({ fen: move.after });
    cg.set({ animation: { enabled: true } });
    return;
  }

  // move the Pawn visually (Pawn slides to last rank)
  cg.move(move.from, move.to);

  // schedule the swap (Pawn -> Piece)
  const delay = userConfig.animationTime;

  setTimeout(() => {
    // Disable animation briefly to "snap" the new piece in place
    cg.set({ animation: { enabled: false } });

    const newPieces = new Map<
      Key,
      { role: Role; color: Color; promoted?: boolean }
    >();
    newPieces.set(move.to, { role, color, promoted: true });

    cg.setPieces(newPieces);

    cg.set({ animation: { enabled: true } });
  }, delay);
}

function animateBackwardPromotion(
  gameStore: PgnGameStore,
  cg: Api,
  currentMove: CustomPgnMove,
) {
  const color = chessColorToCg[currentMove.turn];

  // immediately swap Queen/Rook back to a Pawn (No animation yet)
  cg.set({ animation: { enabled: false } });

  const diff = new Map<Key, { role: Role; color: Color; promoted?: boolean }>();
  diff.set(currentMove.to, { role: 'pawn', color, promoted: true });

  cg.setPieces(diff);

  // set FEN (The Pawn slides back to origin automatically via FEN diff)
  cg.set({
    animation: { enabled: true },
    fen: currentMove.before,
  });
}

/**
 * The Central Controller for board updates.
 * Determines if we should Animate (Undo/Promotion) or Snap (Jump/Load).
 */
export function updateBoard(
  gameStore: PgnGameStore,
  cg: Api,
  previousPath: PgnPath | null,
) {

  const currentPath = gameStore.pgnPath;
  const currentMove = gameStore.currentMove;
  const currentFen = gameStore.fen;

  if (previousPath === null) {
    cg.set({ animation: { enabled: false } });
    cg.set({ fen: gameStore.fen });
    cg.set({ animation: { enabled: true } });
    return
  }

  // calculate Expected Undo Path
  // If we just clicked "Back", logic says we should be at this specific path.
  const expectedUndoPath = navigatePrevMove(previousPath);

  // check for Undo
  // We are undoing if we were somewhere (length > 0) AND
  // the current path exactly matches the logical parent of the previous path.
  const isUndo =
    previousPath.length > 0 &&
    currentPath.length === expectedUndoPath.length &&
    currentPath.every((val, i) => val === expectedUndoPath[i]);

  if (isUndo) {
    // --- UNDO LOGIC ---
    // Identify the move we just "unplayed" (it was the tip of the previous path)

    // nav back audio
    playSound('move');

    // We assume access to the map. If _moveMap is private, ensure you have a getter or use public access.
    // @ts-ignore - Assuming internal access or public getter availability
    const unplayedMove = gameStore.getMoveByPath(previousPath);

    if (unplayedMove?.promotion) {
      animateBackwardPromotion(gameStore, cg, unplayedMove);
    } else {
      // Standard Undo: Snap FEN (slide piece back automatically)
      cg.set({ fen: currentFen });
    }
  } else {
    // --- FORWARD / JUMP LOGIC ---

    // Edge case: Initial load or Reset to start
    if (!currentMove) {
      if (previousPath?.length) {
        // Reset audio
        playSound('move');
      }
      cg.set({ fen: currentFen });
      return;
    }

    // Check if we are making a single Step Forward
    // (The board state before this move matches what is currently on screen)

    const previousMove = gameStore.getMoveByPath(previousPath);
    const previousFen = previousMove?.after ?? gameStore.startFen;

    const isForwardStep = previousFen === currentMove.before;

    if (isForwardStep) {
      // Play Audio for Forward Moves
      moveAudio(currentMove);

      if (currentMove.promotion) {
        animateForwardPromotion(cg, currentMove, currentMove.promotion);
      } else {
        // Standard Forward Move
        // We set FEN immediately; Chessground handles the slide animation
        cg.set({ fen: currentFen });
      }
    } else {
      // JUMP (e.g. clicking a variation, loading a new game, or skipping moves)

      // audio for jumps/loading positions.
      playSound('castle');

      cg.set({ fen: currentFen });
    }
  }

  // Always sync arrows and markers at the end and premove
  cg.playPremove();
}
