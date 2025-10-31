import type { Move, Square } from "chess.js";

import type { PgnPath } from "../../types/Pgn";

import { config } from "../../core/config";
import { state } from "../../core/state";
import { stateProxy } from "../../core/stateProxy";
import {
  startPlayerTimer,
  stopPlayerTimer,
  extendPuzzleTime,
} from "../timer/timer";
import { playSound } from "../audio/audio";
import { setBoard } from "../board/customAnimations";
import { promotePopup } from "../board/handlePromotion";
import { addMoveToPgn, navigateNextMove, isEndOfLine } from "../pgn/pgnViewer";
import { areMovesEqual, getLegalMove, isPromotion } from "./chessFunctions";
// --- Board Interaction & Move Handling ---

export function handleMoveAttempt(
  delay: number,
  orig: Square,
  dest: Square,
  moveSan: string | null = null,
): void {
  let moveCheck;
  if (moveSan) {
    moveCheck = getLegalMove(moveSan);
  } else {
    if (isPromotion(orig, dest)) {
      promotePopup(orig, dest);
      return;
    }
    moveCheck = getLegalMove({ from: orig, to: dest });
  }
  if (!moveCheck) return;

  let nextMovePath: PgnPath = [];
  let foundVar = false;
  let currentLinePosition = state.pgnPath.at(-1) as number;
  if (!state.pgnPath.length) {
    nextMovePath = [0];
  } else {
    nextMovePath = state.pgnPath.with(-1, ++currentLinePosition);
  }
  const pathKey = nextMovePath.join(",");
  const pathMove = state.pgnPathMap.get(pathKey);
  if (pathMove && areMovesEqual(moveCheck, pathMove)) {
    foundVar = true;
  } else if (pathMove?.variations && config.acceptVariations) {
    for (const variation of pathMove.variations) {
      if (variation[0].notation.notation === moveCheck.san) {
        if (areMovesEqual(moveCheck, variation[0])) {
          nextMovePath = variation[0].pgnPath;
          foundVar = true;
          break;
        }
      }
    }
  }
  if (!foundVar) {
    if (config.boardMode === "Viewer") {
      // Add move to state.parsedPGN
      nextMovePath = addMoveToPgn(moveCheck);
      stateProxy.pgnPath = nextMovePath;
    } else {
      handleWrongMove(moveCheck);
    }
  } else {
    stateProxy.pgnPath = nextMovePath;
    if (config.boardMode === "Puzzle") {
      if (!isEndOfLine(nextMovePath)) {
        extendPuzzleTime(config.increment);
      }
      playAiMove(state.delayTime);
    }
  }
}

export function playAiMove(delay: number): void {
  setTimeout(() => {
    state.errorCount = 0;
    const nextMovePath: PgnPath[] = [];
    const nextMovePathCheck = navigateNextMove(state.pgnPath);
    const nextMove = state.pgnPathMap.get(nextMovePathCheck.join(","));
    if (nextMove && nextMove.turn === state.opponentColour[0]) {
      nextMovePath.push(nextMovePathCheck);
      if (config.acceptVariations)
        nextMove.variations.forEach((variation) => {
          nextMovePath.push(variation[0].pgnPath);
        });
      const randomIndex = Math.floor(Math.random() * nextMovePath.length);
      stateProxy.pgnPath = nextMovePath[randomIndex];
      startPlayerTimer();
    }
  }, delay);
}

function playUserCorrectMove(delay: number): void {
  setTimeout(() => {
    state.cg.set({ viewOnly: false }); // will be disabled when user reaches handicap
    // Make the move without the AI's variation-selection logic
    const nextMovePath = navigateNextMove(state.pgnPath);
    stateProxy.pgnPath = nextMovePath;
    playAiMove(delay); // then play the AI's response
  }, delay);
}

export let wrongMoveDebounce: number | null = null;
function handleWrongMove(move: Move): void {
  state.errorCount++;
  state.cg.set({ fen: move.after });
  playSound("Error");
  setBoard(move.before);
  wrongMoveDebounce = setTimeout(() => {
    wrongMoveDebounce = null;
  }, state.delayTime);

  const isFailed = config.strictScoring || state.errorCount > config.handicap;
  if (isFailed) {
    stateProxy.errorTrack = "incorrect";
  }
  if (isFailed && !config.handicapAdvance) {
    stopPlayerTimer();
    state.cg.set({ viewOnly: true }); // disable user movement until after puzzle advances
    playUserCorrectMove(state.delayTime); // show the correct user move
  }
}
