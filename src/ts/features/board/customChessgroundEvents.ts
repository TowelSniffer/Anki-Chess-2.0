import type { Square } from "chess.js";

import { Chess } from "chess.js";

import { config } from "../../core/config";
import { state } from "../../core/state";
import { handleMoveAttempt, wrongMoveDebounce } from "../chessJs/puzzleLogic";
import { getcurrentTurnColor } from "../chessJs/chessFunctions";
import { filterShapes, shapePriority, ShapeFilter } from "./arrows";

// Custom events for handlinf single click movement;

let selectHandlerCheck = false;

export function customSelectEvent(selectedSquare: Square): void {
  filterShapes(ShapeFilter.Drawn);
  state.cg.set({ drawable: { shapes: state.board.chessGroundShapes } });

  const dest = selectedSquare;
  if (
    (config.boardMode === "Puzzle" &&
      state.board.playerColour !== getcurrentTurnColor()) ||
    wrongMoveDebounce
  ) {
    return;
  }
  const tempChess = new Chess(state.pgnTrack.fen);
  let moveCheck = null;
  const arrowCheck = state.board.chessGroundShapes
    .filter(
      (shape) =>
        shape.dest === dest &&
        shape.brush &&
        shapePriority.includes(shape.brush),
    )
    .sort(
      (a, b) =>
        shapePriority.indexOf(a.brush!) - shapePriority.indexOf(b.brush!),
    );
  if (arrowCheck.length > 0 && config.boardMode === "Viewer") {
    if (arrowCheck[0].san) {
      moveCheck = tempChess.move(arrowCheck[0].san);
    }
  } else if (config.singleClickMove) {
    // No arrow was clicked, check if there's only one legal play to this square.
    const allMoves = tempChess.moves({ verbose: true });
    const movesToSquare = allMoves.filter((move) => move.to === dest);
    if (movesToSquare.length === 1) {
      // If only one piece can move to this square, play that move.
      moveCheck = movesToSquare[0];
    }
  }
  if (moveCheck) {
    selectHandlerCheck = true;
    state.cg.move(moveCheck.from, moveCheck.to);
    handleMoveAttempt({
      delay: state.puzzle.delayTime,
      orig: moveCheck.from,
      dest: moveCheck.to,
      moveSan: moveCheck.san,
    });
  } else {
    selectHandlerCheck = false;
  }
}

export function customAfterEvent(orig: Square, dest: Square): void {
  if (selectHandlerCheck) return;
  handleMoveAttempt({
    delay: state.puzzle.delayTime,
    orig: orig,
    dest: dest,
    moveSan: null, // Optional
  });
}
