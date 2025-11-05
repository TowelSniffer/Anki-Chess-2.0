import type { PgnPath, CustomPgnMove } from "../../features/pgn/Pgn";

import { config } from "../config";
import { state } from "../state";
import { stateProxy } from "../stateProxy";
import {
  isEndOfLine,
  highlightCurrentMove,
} from "../../features/pgn/pgnViewer";
import { setButtonsDisabled } from "../../features/ui/uiUtils";
import { animateBoard } from "../../features/board/customAnimations";
import { drawArrows } from "../../features/board/arrows";
import { moveAudio } from "../../features/audio/audio";
import { startAnalysis } from "../../features/analysis/handleStockfish";

export function changeCurrentPgnMove(
  pgnPath: PgnPath,
  lastMove: CustomPgnMove | null,
  pathMove: CustomPgnMove | null,
): void {
  if (!pgnPath.length) {
    setButtonsDisabled(["back", "reset"], true);
  } else {
    setButtonsDisabled(["back", "reset"], false);
  }
  state.pgnTrack.lastMove = pathMove ?? null;
  if (pathMove) {
    moveAudio(pathMove);
  }

  drawArrows(pgnPath);
  animateBoard(lastMove, pathMove);
  highlightCurrentMove(pgnPath);
  startAnalysis(config.analysisTime);

  const endOfLineCheck = isEndOfLine(pgnPath);
  if (endOfLineCheck) {
    if (config.boardMode === "Puzzle") {
      state.ankiPersist.puzzleComplete = true;
      const correctState =
        state.puzzle.puzzleTime > 0 && !config.timerScore
          ? "correctTime"
          : "correct";
      stateProxy.ankiPersist.errorTrack =
        state.ankiPersist.errorTrack ?? correctState;
    } else {
      state.board.chessGroundShapes = [];
    }
  }
  setButtonsDisabled(["forward"], endOfLineCheck);
  const { puzzleComplete: _puzzleComplete, ...stateCopy } = state.ankiPersist;
  stateCopy.pgnPath = pgnPath;
  window.parent.postMessage(stateCopy, "*");
}
