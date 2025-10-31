import type { Square } from "chess.js";

import type { Promotions } from "../../types/Chess";

import { config } from "../../core/config";
import { state } from "../../core/state";
import { toggleClass } from "../ui/uiUtils";
import { positionPromoteOverlay } from "../ui/initializeUI";
import { startPlayerTimer, stopPlayerTimer } from "../timer/timer";
import { getLegalMove } from "../chessJs/chessFunctions";
import { handleMoveAttempt } from "../chessJs/puzzleLogic";
import { setBoard } from "../board/customAnimations";

export function promotePopup(orig: Square, dest: Square): void {
  stopPlayerTimer();
  const cancelPopup = function () {
    toggleClass("showHide", "hidden");
    setBoard(state.chess.fen());
    setTimeout(() => {
      startPlayerTimer();
    }, config.animationTime);
  };
  const promoteButtons = document.querySelectorAll<HTMLButtonElement>(
    "#promoteButtonsContainer > button",
  );
  const overlay = document.querySelector<HTMLDivElement>("#overlay");
  promoteButtons.forEach((button) => {
    button.onclick = (event: MouseEvent) => {
      // 'event.currentTarget' is the element the listener is attached to
      const clickedButton = event.currentTarget;
      event.stopPropagation();
      if (clickedButton instanceof HTMLButtonElement) {
        toggleClass("showHide", "hidden");
        const promoteChoice = clickedButton.value as Promotions;

        const move = getLegalMove({
          from: orig,
          to: dest,
          promotion: promoteChoice,
        });

        if (move && config.boardMode === "Puzzle") {
          startPlayerTimer();
          handleMoveAttempt(state.delayTime, move.from, move.to, move.san);
        } else if (move && config.boardMode === "Viewer") {
          handleMoveAttempt(0, move.from, move.to, move.san);
        }
      }
    };
  });

  if (overlay) {
    overlay.onclick = function () {
      cancelPopup();
    };
  }
  toggleClass("showHide", "hidden");
  positionPromoteOverlay();
}
