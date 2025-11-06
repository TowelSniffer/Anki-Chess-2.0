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

export function animateBoard(
  lastMove: CustomPgnMove | null,
  pathMove: CustomPgnMove | null,
): void {
  const FEN = pathMove?.after ?? state.startFen;
  const moveCheck =
    pathMove &&
    !pathMove.flags.includes("e") &&
    (lastMove?.after === pathMove.before ||
      (state.startFen === pathMove.before && !lastMove));
  const isForwardPromotion = moveCheck && pathMove?.notation.promotion;
  const backwardsMoveCheck =
    pathMove?.after === lastMove?.before ||
    (state.startFen === lastMove?.before && !pathMove);
  const isBackwardsPromotion =
    backwardsMoveCheck && lastMove?.notation.promotion;
  if (pathMove) {
    state.cg.set({ lastMove: [pathMove.from, pathMove.to] });
  }
  // --- Promotion animations ---
  if (isForwardPromotion) {
    // nav forward promote
    const promotion =
      promotionAbbreviationMap[pathMove.san.slice(-1) as SanPromotions];
    const color = colorAbbreviationMap[pathMove.turn];

    state.cg.move(pathMove.from, pathMove.to);

    const promoteDiff = new Map([
      [pathMove.to, { role: promotion, color: color, promoted: true }],
    ]);
    setTimeout(() => {
      state.cg.set({ animation: { enabled: false } });
      state.cg.setPieces(promoteDiff);
      state.cg.set({ animation: { enabled: true } });
    }, config.animationTime);
  } else if (isBackwardsPromotion) {
    // nav backwards promote
    const color = colorAbbreviationMap[lastMove.turn];
    const promoteDiff = new Map([
      [lastMove.to, { role: "pawn" as Role, color: color, promoted: true }],
    ]);

    state.cg.set({ animation: { enabled: false } });
    state.cg.setPieces(promoteDiff);
    state.cg.set({ animation: { enabled: true } });

    state.cg.move(lastMove.to, lastMove.from);
  } else if (moveCheck) {
    state.cg.move(pathMove.from, pathMove.to);
  } else if (
    backwardsMoveCheck &&
    lastMove &&
    !(
      lastMove.flags.includes("e") ||
      lastMove.flags.includes("c") ||
      lastMove.flags.includes("p")
    )
  ) {
    state.cg.move(lastMove.to, lastMove.from);
  } else {
    state.cg.set({ fen: FEN });
  }
  setBoard();
}
