import type { ErrorTrack } from "../Config";

import { config } from "../config";
import { state } from "../state";
import { isEndOfLine } from "../../features/pgn/pgnViewer";
import { borderFlash } from "../../features/ui/uiUtils";
import { stopPlayerTimer } from "../../features/timer/timer";

export function scorePuzzle(errorTrack: ErrorTrack): void {
  const endOfLineCheck = isEndOfLine(state.pgnTrack.pgnPath);
  const stateCopy = state.ankiPersist;
  if (endOfLineCheck) stateCopy.puzzleComplete = true;

  if (errorTrack === "correct") {
    state.board.solvedColour = "var(--correct-color)";
    if (config.autoAdvance) {
      stateCopy.puzzleComplete = true;
    }
  } else if (errorTrack === "correctTime") {
    state.board.solvedColour = "var(--perfect-color)";
  } else if (errorTrack === "incorrect") {
    state.board.solvedColour = "var(--incorrect-color)";
    if (
      (config.timerAdvance && state.puzzle.puzzleTime === 0) ||
      config.handicapAdvance
    ) {
      stateCopy.puzzleComplete = true;
    }
  }
  if (stateCopy.puzzleComplete) {
    stopPlayerTimer();
    state.cgwrap.classList.remove("timerMode");
    document.documentElement.style.setProperty(
      "--border-color",
      state.board.solvedColour,
    );
    state.cg.set({ viewOnly: true });
    setTimeout(() => {
      window.parent.postMessage(stateCopy, "*");
    }, state.puzzle.delayTime);
  }
  if (state.board.solvedColour) {
    borderFlash();
  } else {
    borderFlash("var(--incorrect-color)");
  }
}
