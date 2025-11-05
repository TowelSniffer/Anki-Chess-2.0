import { Chess } from "chess.js";

import type { CustomPgnMove } from "../pgn/Pgn";

import { config } from "../../core/config";
import { state } from "../../core/state";

import { toDests, getcurrentTurnColor } from "../chessJs/chessFunctions";

// --- animate board ---

export function setBoard(FEN: string): void {
  state.cg.set({
    fen: FEN,
    turnColor: getcurrentTurnColor(),
    movable: {
      color:
        config.boardMode === "Puzzle"
          ? state.board.playerColour
          : getcurrentTurnColor(),
      dests: toDests(),
    },
    drawable: {
      shapes: state.board.chessGroundShapes,
    },
  });
}

export function animateBoard(
  lastMove: CustomPgnMove | null,
  pathMove: CustomPgnMove | null,
): void {
  if (pathMove) {
    console.log(pathMove)
    state.cg.set({ lastMove: [pathMove.from, pathMove.to] });
    state.pgnTrack.lastMove = pathMove;
  }
  // --- Promotion animations ---
  if (
    pathMove?.notation.promotion &&
    (lastMove?.after === pathMove?.before ||
      (state.startFen === pathMove?.before && !lastMove))
  ) {
    // nav forward promote
    const tempChess = new Chess(pathMove.before);
    tempChess.remove(pathMove.to);
    state.cg.set({ fen: tempChess.fen() });
    state.cg.move(pathMove.from, pathMove.to);
    setTimeout(() => {
      state.cg.set({ animation: { enabled: false } });
      state.cg.set({
        fen: state.pgnTrack.fen,
      });
      state.cg.set({ animation: { enabled: true } });
      state.cg.set({ drawable: { shapes: state.board.chessGroundShapes } });
    }, config.animationTime);
  } else if (
    lastMove?.notation.promotion &&
    (lastMove?.before === pathMove?.after ||
      (state.startFen === lastMove?.before && !pathMove))
  ) {
    // nav backwards promote
    const tempChess = new Chess(lastMove.after);
    tempChess.remove(lastMove.to);
    tempChess.put({ type: "p", color: lastMove.turn }, lastMove.to);

    state.cg.set({ animation: { enabled: false } });
    state.cg.set({ fen: tempChess.fen() });
    state.cg.set({ animation: { enabled: true } });

    state.cg.set({
      fen: state.pgnTrack.fen,
    });
  } else {
    state.cg.set({ fen: state.pgnTrack.fen });
  }

  const currentTurnColor = getcurrentTurnColor();
  const movableColor =
    config.boardMode === "Puzzle" ? state.board.playerColour : currentTurnColor;

  state.cg.set({
    check: pathMove?.notation.check ? true : false,
    turnColor: currentTurnColor,
    movable: {
      color: movableColor,
      dests: toDests(),
    },
    drawable: { shapes: state.board.chessGroundShapes },
  });
  setTimeout(() => {
    state.cg.playPremove();
  }, 2);
}
