import type { Square } from "chess.js";

import { isSquare } from "../../types/Chess";

import { config } from "../../core/config";
import { state } from "../../core/state";
import { handleMoveAttempt, wrongMoveDebounce } from "../chessJs/puzzleLogic";
import { getLegalMove, getcurrentTurnColor } from "../chessJs/chessFunctions";
import { filterShapes, shapePriority, ShapeFilter } from "./arrows";

// Custom events for handlinf single click movement;

export function customSelectEvent(selectedSquare: Square): void {
  filterShapes(ShapeFilter.Drawn);
  state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
  if (
    (config.boardMode === "Puzzle" &&
      state.playerColour !== getcurrentTurnColor()) ||
    wrongMoveDebounce
  ) {
    return;
  }
  const orig: Square | undefined =
    state.cg.state.selected && isSquare(state.cg.state.selected)
      ? state.cg.state.selected
      : undefined;

  const dest = selectedSquare;

  if (orig) {
    const moveCheck = getLegalMove({
      from: orig,
      to: dest,
      promotion: "q",
    });
    if (!moveCheck || moveCheck.promotion) return;
    // check if move should be handled by after: event
    const delay = config.boardMode === "Viewer" ? 0 : state.delayTime;

    handleMoveAttempt(delay, orig, dest);
    state.cg.selectSquare(null);
    return;
  }
  const arrowMove = state.chessGroundShapes
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
  if (arrowMove.length > 0 && config.boardMode === "Viewer") {
    if (arrowMove[0].dest) {
      handleMoveAttempt(
        0,
        arrowMove[0].orig,
        arrowMove[0].dest,
        arrowMove[0].san,
      );
    }
  } else if (config.singleClickMove) {
    // No arrow was clicked, check if there's only one legal play to this square.
    const allMoves = state.chess.moves({ verbose: true });
    const movesToSquare = allMoves.filter((move) => move.to === dest);
    if (movesToSquare.length === 1) {
      // If only one piece can move to this square, play that move.
      if (config.boardMode === "Puzzle") {
        handleMoveAttempt(
          state.delayTime,
          movesToSquare[0].from,
          movesToSquare[0].to,
          movesToSquare[0].san,
        );
      } else if (config.boardMode === "Viewer") {
        handleMoveAttempt(
          0,
          movesToSquare[0].from,
          movesToSquare[0].to,
          movesToSquare[0].san,
        );
      }
    }
  }
}

export function customAfterEvent(orig: Square, dest: Square): void {
  const delay = config.boardMode === "Viewer" ? 0 : state.delayTime;
  handleMoveAttempt(delay, orig, dest);
}
