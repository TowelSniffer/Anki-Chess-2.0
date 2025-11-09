import "chessground/assets/chessground.base.css";
import type { PgnMove } from "@mliebelt/pgn-types";

import "../scss/main.scss";

import { state } from "./core/state";
import { eventEmitter } from "./core/stateProxy";
import { initPgnViewer, augmentPgnTree } from "./features/pgn/pgnViewer";
import {
  initializeUI,
  positionPromoteOverlay,
} from "./features/ui/initializeUI";
import { setupEventListeners } from "./features/ui/uiEventListeners";
import { loadChessgroundBoard } from "./features/board/chessgroundBoard";
import { initializePuzzleTimer } from "./features/timer/timer";
import { changeCurrentPgnMove } from "./core/proxyEvents/pgnPathChanged";
import { scorePuzzle } from "./core/proxyEvents/puzzleScored";
import { updateBoardBorder } from "./core/proxyEvents/updateBoardBorder";

// --- eventEmitters handle updates to board state ---

// handle changing boad position
eventEmitter.on("pgnPathChanged", (pgnPath, lastMove, pathMove) => {
  changeCurrentPgnMove(pgnPath, lastMove, pathMove);
});

// handle marking puzzle
eventEmitter.on("puzzleScored", (errorTrack) => {
  scorePuzzle(errorTrack);
});

// handle timer ui
eventEmitter.on("boardBorderUpdated", (percent) => {
  updateBoardBorder(percent);
});

// --- Run Inital Setup ---

(function loadElements(): void {
  augmentPgnTree(state.parsedPGN.moves as PgnMove[]);
  initializeUI();
  initPgnViewer();
  initializePuzzleTimer();
  loadChessgroundBoard();
  positionPromoteOverlay();
  setupEventListeners();
})();
