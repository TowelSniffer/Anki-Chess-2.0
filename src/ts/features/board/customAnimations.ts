import type { Role, Color } from "chessground/types";
import type { Color as ChessJsColor } from "chess.js";

import type { CustomPgnMove } from "../pgn/Pgn";
import type { SanPromotions } from "../chessJs/Chess";

import { config } from "../../core/config";
import { state } from "../../core/state";

import { toDests, getcurrentTurnColor } from "../chessJs/chessFunctions";

// --- animate board ---

const promotionAbbreviationMap: Record<SanPromotions, Role> = {
  // compare mlieberts promotion to chessground
  Q: "queen",
  R: "rook",
  B: "bishop",
  N: "knight",
};

const colorAbbreviationMap: Record<ChessJsColor, Color> = {
  // compare mlieberts turn to chessground
  w: "white",
  b: "black",
};

export function setBoard(): void {
  state.cg.set({
    check: state.board.inCheck,
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

function animateForwardPromotion(
  pathMove: CustomPgnMove,
  promotion: SanPromotions,
): void {
  const promotionRole = promotionAbbreviationMap[promotion];
  const color = colorAbbreviationMap[pathMove.turn];
  let delay = config.animationTime;
  if (state.cg.state.turnColor[0] === state.pgnTrack.turn) {
    delay = 0;
  }

  state.cg.move(pathMove.from, pathMove.to);

  const promoteDiff = new Map([
    [pathMove.to, { role: promotionRole, color: color, promoted: true }],
  ]);
  setTimeout(() => {
    state.cg.set({ animation: { enabled: false } });
    state.cg.setPieces(promoteDiff);
    state.cg.set({ animation: { enabled: true } });
  }, delay);
}

function animateBackwardsPromotion(lastMove: CustomPgnMove): void {
  const color = colorAbbreviationMap[lastMove.turn];
  const promoteDiff = new Map([
    [lastMove.to, { role: "pawn" as Role, color: color, promoted: true }],
  ]);

  state.cg.set({ animation: { enabled: false } });
  state.cg.setPieces(promoteDiff);
  state.cg.set({ animation: { enabled: true } });
  state.cg.set({ fen: lastMove.before });
}

export function animateBoard(
  lastMove: CustomPgnMove | null,
  pathMove: CustomPgnMove | null,
): void {
  const forwardPrmotion =
    pathMove?.promotion &&
    (lastMove?.after === pathMove.before ||
      (state.startFen === pathMove.before && !lastMove));
  const backwardsPrmotion =
    (lastMove?.promotion && pathMove?.after === lastMove?.before) ||
    (state.startFen === lastMove?.before && !pathMove);

  if (pathMove) {
    state.cg.set({ lastMove: [pathMove.from, pathMove.to] });
  }
  // --- Promotion animations ---
  if (forwardPrmotion) {
    animateForwardPromotion(pathMove, pathMove.promotion);
  } else if (backwardsPrmotion) {
    animateBackwardsPromotion(lastMove);
  } else {
    state.cg.set({ fen: pathMove?.after ?? state.startFen });
  }
  setBoard();
}
