import type {
  CustomPgnMove,
  PgnPath,
} from '$Types/ChessStructs';
import type { IPgnGameStore } from '$Types/StoreInterfaces';
import { navigatePrevMove } from '$features/pgn/pgnNavigate';
import { moveAudio, playSound } from '$features/audio/audio';

function injectPiece(fen: string, square: string, replacement: string): string {
  const files = 'abcdefgh';
  const ranks = '87654321';
  const [boardStr, ...rest] = fen.split(' ');
  const rows = boardStr.split('/');

  const fileIdx = files.indexOf(square[0]);
  const rankIdx = ranks.indexOf(square[1]);

  let row = rows[rankIdx];
  let col = 0;
  let newRow = '';

  // Reconstruct the row string
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (isNaN(parseInt(char))) {
      // It's a piece
      if (col === fileIdx) newRow += replacement;
      else newRow += char;
      col++;
    } else {
      // It's a number (skips)
      const skip = parseInt(char);
      if (col + skip > fileIdx && col <= fileIdx) {
        // The target is inside this skip
        const pre = fileIdx - col;
        const post = skip - pre - 1;
        if (pre > 0) newRow += pre.toString();
        newRow += replacement;
        if (post > 0) newRow += post.toString();
      } else {
        newRow += char;
      }
      col += skip;
    }
  }

  rows[rankIdx] = newRow;
  return [rows.join('/'), ...rest].join(' ');
}

function animateForwardPromotion(
  gameStore: IPgnGameStore,
  move: CustomPgnMove,

) {
  if (!gameStore.cg) return;
  const pieceCheck = gameStore.cg.state.pieces.get(move.to);
  if (pieceCheck?.role === 'pawn') {
    // If called with promotePopup, move animation is not needed
    return;
  }
  const pawnSymbol = move.turn === 'w' ? 'P' : 'p';
  const pawnMovedFen = injectPiece(move.after, move.to, pawnSymbol)
  gameStore.customAnimationFen = pawnMovedFen;
}

function animateBackwardPromotion(
  gameStore: IPgnGameStore,
  currentMove: CustomPgnMove,
) {
  const pawnSymbol = currentMove.turn === 'w' ? 'P' : 'p';
  const pawnMovedFen = injectPiece(currentMove.after, currentMove.to, pawnSymbol)
  gameStore.shouldAnimate = false;
  gameStore.customAnimationFen = pawnMovedFen;

}

/**
 * The Central Controller for board updates.
 * Determines if we should Animate (Undo/Promotion) or Snap (Jump/Load).
 */
export function updateBoard(
  gameStore: IPgnGameStore,
  previousPath: PgnPath | null,
) {

  const currentPath = gameStore.pgnPath;
  const currentMove = gameStore.currentMove;

  if (previousPath === null) {
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

    const unplayedMove = gameStore.getMoveByPath(previousPath);

    if (unplayedMove?.promotion) {
      animateBackwardPromotion(gameStore, unplayedMove);
    } else {
      gameStore.customAnimationFen = unplayedMove?.before ?? gameStore.startFen;
    }
  } else {
    // --- FORWARD / JUMP LOGIC ---

    // Check if we are making a single Step Forward
    // (The board state before this move matches what is currently on screen)

    const previousMove = gameStore.getMoveByPath(previousPath);
    const previousFen = previousMove?.after ?? gameStore.startFen;

    const isForwardStep = previousFen === currentMove?.before;

    if (isForwardStep) {
      // Play Audio for Forward Moves
      moveAudio(currentMove);

      if (currentMove.promotion) {
        animateForwardPromotion(gameStore, currentMove);
      } else {
        gameStore.customAnimationFen = currentMove?.after;
      }
    } else {
      // JUMP (e.g. clicking a variation, loading a new game, or skipping moves)

      // audio for jumps/loading positions.
      playSound('castle');
      gameStore.customAnimationFen = currentMove?.after ?? gameStore.startFen;
    }
  }
  if (gameStore.cg) gameStore.cg.playPremove();
}
