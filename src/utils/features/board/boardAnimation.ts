import type { Role, Color } from '@lichess-org/chessground/types';
import type { GameStore } from '$stores/gameStore.svelte';
import { moveAudio, playSound } from '$features/audio/audio';

export function updateBoard(store: GameStore): void {
  /**
   * The Central Controller for custom board updates.
   * This controls non standard board moves. (Single click move, Navigation btns)
   * Determines if we should Animate (Undo/Promotion) or Snap (Jump/Load).
   */

  // New pgnPath
  const move = store.currentMove;
  // Last pgnPath
  const prevMove = store.trackedMove;

  const fen = store.fen;

  if (move && store.animationTimeout) {
    // Fix any previous animation fens
    store.customAnimation({ preFen: move.before, animate: false });
  }

  const undoMoveCheck = prevMove?.before === fen; // Is logged moved before fen equal to new fen

  const forwardMoveCheck =
    prevMove?.after === move?.before || // Is logged moved after fen equal to new moves before
    (!prevMove && move?.before === store.startFen); // Else is it first move?

  if (undoMoveCheck) {
    playSound('move');
    if (prevMove?.promotion) {
      const square = prevMove.to;
      const color = prevMove.turn === 'w' ? 'white' : 'black';
      const pieces = new Map([[square, undefined]]);
      store.cg?.setPieces(pieces);
      store.cg?.newPiece({ role: 'pawn' as Role, color: color as Color }, square);
    }
    store.cg?.set({ fen: prevMove.before });
  } else if (forwardMoveCheck) {
    /**
     * Check if cg.move can be used instead of set({ fen: ... })
     * for smoother animations
     */
    if (move?.promotion) {
      const orig = move.from;
      const dest = move.to;
      const color = move.turn === 'w' ? 'white' : 'black';
      const pieces = new Map([
        [orig, undefined],
        [dest, { role: 'pawn' as Role, color: color as Color }],
      ]);
      store.cg?.setPieces(pieces);
      store.customAnimation({ preFen: null, animate: false, postFen: move.after });

      move && moveAudio(move);
    } else {
      move && store.cg?.move(move.from, move.to);
      // Remove captured pawn
      if (move?.flags.includes('e')) store.customAnimation({ preFen: move.after, animate: false });
    }
  } else {
    store.customAnimation({ preFen: fen, animate: true });
    playSound('castle');
  }
}
