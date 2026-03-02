import type { CustomPgnMove, PgnPath } from '$Types/ChessStructs';
import type { GameStore } from '$stores/gameStore.svelte';
import type { Sounds } from '$Types/Audio';
import { moveAudio, playSound } from '$features/audio/audio';
import { navigatePrevMove } from '$features/pgn/pgnNavigate';

/**
 * The Central Controller for board updates.
 * Determines if we should Animate (Undo/Promotion) or Snap (Jump/Load).
 */
export function updateBoard(store: GameStore): void {
  const move = store.currentMove;
  const fen = store.fen;
  const prevMove = store.trackedMove;

  const forwardMoveCheck = move?.before.split(' ')[0] === store.cg.getFen();

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
    /*
     * For things like Single click Navigation buttons
     * Here we check if cg.move can be used instead of set({ fen: ... })
     * for smoother animations
     */
    if (move?.promotion) {
      const orig = move.from;
      const dest = move.to;
      const color = move.turn === 'w' ? 'white' : 'black';
      // store.customAnimation({ fen: move.before, animate: true, postAnimateFen: move.after });
      const pieces = new Map([
        [orig, undefined],
        [dest, { role: 'pawn', color: color }],
      ]);
      store.cg.setPieces(pieces);
      store.customAnimation({ fen: store.cg.getFen(), animate: false, postAnimateFen: move.after });

      move && moveAudio(move);
    } else {
      store.cg.move(move.from, move.to);
      if (move?.flags.includes('e')) store.customAnimation({ fen: move.after, animate: false });
    }
  } else {
    store.customAnimation({ fen: fen, animate: true });
    playSound('castle');
  }
}
