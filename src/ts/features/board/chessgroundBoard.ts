import type { Color } from "chessground/types";

import { config } from "../../core/config";
import { state } from "../../core/state";
import { customSelectEvent, customAfterEvent } from "./customChessgroundEvents";
import { startPlayerTimer } from "../timer/timer";
import {
  isSquare,
  toDests,
  getcurrentTurnColor,
} from "../chessJs/chessFunctions";
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
    config.boardMode === "Puzzle" ? state.board.playerColour : currentTurnColor;

  state.cg.set({
    orientation: config.randomOrientation
      ? randomOrientation()
      : state.board.playerColour,
    turnColor: currentTurnColor,
    highlight: {
      check: true,
      lastMove: true,
    },
    animation: {
      duration: config.animationTime,
    },
    movable: {
      free: false,
      showDests: config.showDests,
      color: movableColor,
      dests: toDests(),
      events: {
        after: (orig, dest, metadata) => {
          if (!isSquare(orig) || !isSquare(dest)) return;
          customAfterEvent(orig, dest, metadata);
        },
      },
    },
    premovable: {
      enabled: config.boardMode === "Viewer" ? false : true,
    },
    check: state.board.inCheck,
    events: {
      select: (key) => {
        if (!isSquare(key)) return;
        customSelectEvent(key);
      },
    },
  });
  if (config.flipBoard && config.boardMode === "Puzzle") {
    playAiMove(state.puzzle.delayTime);
  } else if (config.boardMode === "Puzzle") {
    startPlayerTimer();
  }
  return;
}
