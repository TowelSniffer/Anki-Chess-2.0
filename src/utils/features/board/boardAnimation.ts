import type { Role, Color } from '@lichess-org/chessground/types';
import type { GameStore } from '$stores/gameStore.svelte';
import { moveAudio, playSound } from '$features/audio/audio';

export function updateBoard(store: GameStore): void {
  /**
   * The Central Controller for custom board updates.
   * This controls non standard board moves. (Single click move, Navigation btns)
   * Determines if we should Animate (Undo/Promotion) or Snap (Jump/Load).
   */

  const move = store.currentMove;

  const fen = store.fen;
  const prevMove = store.trackedMove;

  if (move && store.animationTimeout) {
    // Fix any previous animation fens
    store.customAnimation({ preFen: move.before, animate: false });
  }

  const forwardMoveCheck = [store.trackedMove?.after, store.startFen].includes(move?.before);

  const undoMoveCheck =
    (prevMove && prevMove?.before === move?.after) || (!move && prevMove?.before === fen);

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
