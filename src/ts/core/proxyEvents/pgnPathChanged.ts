import type { PgnPath, CustomPgnMove } from "../../types/Pgn";

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
    state.chess.reset();
    state.chess.load(state.startFen);
    state.lastMove = null;
  } else {
    setButtonsDisabled(["back", "reset"], false);
  }

  if (pathMove) {
    state.chess.load(pathMove.after);
    moveAudio(pathMove);
  }
  setTimeout(() => {
    // timeout is needed here for some animations. dont know why
    animateBoard(lastMove, pathMove);
  }, 2);
  startAnalysis(config.analysisTime);
  drawArrows(pgnPath);
  highlightCurrentMove(pgnPath);

  const endOfLineCheck = isEndOfLine(pgnPath);
  if (endOfLineCheck) {
    if (config.boardMode === "Puzzle") {
      state.puzzleComplete = true;
      const correctState =
        state.puzzleTime > 0 && !config.timerScore ? "correctTime" : "correct";
      stateProxy.errorTrack = state.errorTrack ?? correctState;
    } else {
      state.chessGroundShapes = [];
    }
  }
  setButtonsDisabled(["forward"], endOfLineCheck);
  const {
    chess: _chess,
    cg: _cg,
    cgwrap: _cgwrap,
    puzzleComplete: _puzzleComplete,
    ...stateCopy
  } = state;
  stateCopy.pgnPath = pgnPath;
  window.parent.postMessage(stateCopy, "*");
}
