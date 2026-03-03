import type { CustomPgnMove, PgnPath } from '$Types/ChessStructs';
import type { GameStore } from '$stores/gameStore.svelte';
import type { Sounds } from '$Types/Audio';
import { moveAudio, playSound } from '$features/audio/audio';
import { navigatePrevMove } from '$features/pgn/pgnNavigate';

export function updateBoard(store: GameStore): void {
  /**
   * The Central Controller for custom board updates.
   * This controls non standard board moves. (Single click move, Navigation btns)
   * Determines if we should Animate (Undo/Promotion) or Snap (Jump/Load).
   */

  const move = store.currentMove;
  const fen = store.fen;
  const prevMove = store.trackedMove;

  if (store.animationTimeout) {
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
      store.cg.setPieces(pieces);
      store.cg.newPiece({ role: 'pawn', color: color }, square);
    }
    store.cg.set({ fen: prevMove.before });
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
        [dest, { role: 'pawn', color: color }],
      ]);
      store.cg.setPieces(pieces);
      store.customAnimation({ preFen: null, animate: false, postFen: move.after });

      move && moveAudio(move);
    } else {
      store.cg.move(move.from, move.to);
      // Remove captured pawn
      if (move?.flags.includes('e')) store.customAnimation({ preFen: move.after, animate: false });
    }
  } else {
    store.customAnimation({ preFen: fen, animate: true });
    playSound('castle');
  }
}
