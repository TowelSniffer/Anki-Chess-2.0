import type { Color } from "chessground/types";
import { isSquare } from "../../types/Chess";

import { config } from "../../core/config";
import { state } from "../../core/state";
import { customSelectEvent, customAfterEvent } from "./customChessgroundEvents";
import { startPlayerTimer } from "../timer/timer";
import { toDests, getcurrentTurnColor } from "../chessJs/chessFunctions";
import { playAiMove } from "../chessJs/puzzleLogic";

// return ts randomOrientation
function randomOrientation(): Color {
  const orientations = ["black", "white"] as const;
  return orientations[Math.floor(Math.random() * 2)];
}

// --- Initialize board ---
export function loadChessgroundBoard(): void {
  const currentTurnColor = getcurrentTurnColor();
  const movableColor =
    config.boardMode === "Puzzle" ? state.playerColour : currentTurnColor;

  state.cg.set({
    orientation: config.randomOrientation
      ? randomOrientation()
      : state.playerColour,
    turnColor: currentTurnColor,
    movable: {
      color: movableColor,
      dests: toDests(),
      events: {
        after: (orig, dest) => {
          if (!isSquare(orig) || !isSquare(dest)) return;
          customAfterEvent(orig, dest);
        },
      },
    },
    premovable: {
      enabled: config.boardMode === "Viewer" ? false : true,
    },
    check: state.chess.inCheck(),
    events: {
      select: (key) => {
        if (!isSquare(key)) return;
        customSelectEvent(key);
      },
    },
  });
  if (
    !state.chess.isGameOver() &&
    config.flipBoard &&
    config.boardMode === "Puzzle"
  ) {
    playAiMove(state.delayTime);
  } else if (config.boardMode === "Puzzle") {
    startPlayerTimer();
  }
  return;
}
