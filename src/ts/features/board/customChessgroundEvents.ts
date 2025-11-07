import type { MoveMetadata } from "chessground/types";
import type { Square, Move } from "chess.js";

import { Chess } from "chess.js";
import { callUserFunction } from "chessground/board";

import { config } from "../../core/config";
import { state } from "../../core/state";
import { handleMoveAttempt, wrongMoveDebounce } from "../chessJs/puzzleLogic";
import { getcurrentTurnColor, getLegalMove } from "../chessJs/chessFunctions";
import { filterShapes, shapePriority, ShapeFilter } from "./arrows";

// Custom events for handlinf single click movement;

let selectMove: Move | null = null;

export function customSelectEvent(selectedSquare: Square): void {
  // single click movement and arrow moves
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
    selectMove = moveCheck;
    callUserFunction(
      state.cg.state.movable.events.after,
      moveCheck.from,
      moveCheck.to,
      { premove: false },
    );
  }
}

export function customAfterEvent(
  orig: Square,
  dest: Square,
  metadata: MoveMetadata,
): void {
  // drag an drop/select and move

  if (selectMove && metadata.holdTime) {
    // Let click to move handle move
    selectMove = null;
    return;
  }
  if (!state.cg.state.stats.dragged) {
    const moveCheck = getLegalMove({ from: orig, to: dest });
    if (moveCheck?.flags.includes("e")) {
      state.cg.set({ animation: { enabled: false } });
      state.cg.set({ fen: moveCheck.before });
      state.cg.set({ animation: { enabled: true } });
    }
  }
  handleMoveAttempt({
    delay: state.puzzle.delayTime,
    orig: orig,
    dest: dest,
    moveSan: selectMove?.san ?? null, // Optional
  });
  selectMove = null;
}
