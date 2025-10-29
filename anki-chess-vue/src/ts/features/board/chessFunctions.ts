import type { Color, Key } from "chessground/types";
import type { Move, Square } from "chess.js";
import { Chess, SQUARES } from "chess.js";

import type { PgnPath, CustomPgnMove } from "../../core/types";
import { config } from "../../core/config";
import { state } from "../../core/state";
import { stateProxy } from "../../core/stateProxy";
import { addMoveToPgn, navigateNextMove, isEndOfLine } from "../pgn/pgnViewer";
import { filterShapes, shapePriority, ShapeFilter } from "../board/arrows";
import { positionPromoteOverlay } from "../ui/initializeUI";
import {
  initializePuzzleTimer,
  startPlayerTimer,
  stopPlayerTimer,
  extendPuzzleTime,
} from "../timer/timer";
import { playSound } from "../audio/audio";

// --- Types ---
type Promotions = "q" | "r" | "b" | "n";

type MoveInput = string | { from: Square; to: Square; promotion?: Promotions };

// --- type guarding ---

// chess.js Square doesn't include a0
function isSquare(key: Key): key is Square {
  return key !== "a0";
}

// checks if an object is Move
function isMoveObject(move: object): move is Move {
  return typeof move === "object" && move !== null;
}

// --- Utility ---

export function getcurrentTurnColor(): Color {
  return state.chess.turn() === "w" ? "white" : "black";
}

function toggleClass(querySelector: string, className: string): void {
  document
    .querySelectorAll("." + querySelector)
    .forEach((el) => el.classList.toggle(className));
}

// return ts randomOrientation
function randomOrientation(): Color {
  const orientations = ["black", "white"] as const;
  return orientations[Math.floor(Math.random() * 2)]!;
}

// --- animate board ---

function setBoard(FEN: string): void {
  state.cg.set({
    fen: FEN,
    turnColor: getcurrentTurnColor(),
    movable: {
      color:
        config.boardMode === "Puzzle"
          ? state.playerColour
          : getcurrentTurnColor(),
      dests: toDests(),
    },
    drawable: {
      shapes: state.chessGroundShapes,
    },
  });
}

let promoteAnimate = true;
export function animateBoard(
  lastMove: CustomPgnMove | null,
  pathMove: CustomPgnMove | null,
): void {
  if (pathMove) {
    state.cg.set({ lastMove: [pathMove.from, pathMove.to] });
    state.lastMove = pathMove;
  }
  // --- Promotion animations ---
  if (
    promoteAnimate &&
    pathMove?.notation.promotion &&
    (lastMove?.after === pathMove?.before ||
      (state.startFen === pathMove?.before && !lastMove))
  ) {
    // nav forward promote
    const tempChess = new Chess(pathMove.before);
    tempChess.remove(pathMove.to);
    state.cg.set({ fen: tempChess.fen() });
    state.cg.move(pathMove.from, pathMove.to);
    setTimeout(() => {
      state.cg.set({ animation: { enabled: false } });
      state.cg.set({
        fen: state.chess.fen(),
      });
      state.cg.set({ animation: { enabled: true } });
          state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
        }, config.animationTime);  } else if (
    lastMove?.notation.promotion &&
    (lastMove?.before === pathMove?.after ||
      (state.startFen === lastMove?.before && !pathMove))
  ) {
    // nav backwards promote
    const tempChess = new Chess(lastMove.after);
    tempChess.remove(lastMove.to);
    tempChess.put({ type: "p", color: lastMove.turn }, lastMove.to);

    state.cg.set({ animation: { enabled: false } });
    state.cg.set({ fen: tempChess.fen() });
    state.cg.set({ animation: { enabled: true } });

    state.cg.set({
      fen: state.chess.fen(),
    });
  } else {
    state.cg.set({ fen: state.chess.fen() });
  }

  const currentTurnColor = getcurrentTurnColor();
  const movableColor =
    config.boardMode === "Puzzle" ? state.playerColour : currentTurnColor;

  state.cg.set({
    check: state.chess.inCheck(),
    turnColor: currentTurnColor,
    movable: {
      color: movableColor,
      dests: toDests(),
    },
    drawable: { shapes: state.chessGroundShapes },
  });
  setTimeout(() => {
    state.cg.playPremove();
  }, 2);
  promoteAnimate = true;
}

// --- PGN State & Puzzle Logic ---

function areMovesEqual(
  move1: Move | CustomPgnMove | null,
  move2: Move | CustomPgnMove | null,
): boolean {
  // Check for null or undefined moves
  if (!move1 || !move2) {
    return false;
  }

  return move1.before === move2.before && move1.after === move2.after;
}

function isMoveLegal(moveInput: MoveInput): boolean {
  const legalMoves = state.chess.moves({ verbose: true });

  if (typeof moveInput === "string") {
    // lan or san
    return legalMoves.some(
      (move) => move.san === moveInput || move.lan === moveInput,
    );
  } else {
    // chess.js move object
    return legalMoves.some(
      (move) =>
        move.from === moveInput.from &&
        move.to === moveInput.to &&
        (move.promotion || "q") === (moveInput.promotion || "q"), // Default to queen for comparison
    );
  }
}

export function getLegalMove(moveInput: MoveInput): Move | null {
  if (!isMoveLegal(moveInput)) {
    return null;
  }

  const tempChess = new Chess(state.chess.fen());
  return tempChess.move(moveInput);
}

function isPromotion(orig: Square, dest: Square): boolean {
  if (SQUARES.includes(orig)) {
    const piece = state.chess.get(orig);
    if (!piece || piece.type !== "p") {
      return false;
    }

    // check if the dest is back rank
    const rank = dest.charAt(1);
    if (piece.color === "w" && rank === "8") return true;
    if (piece.color === "b" && rank === "1") return true;
  } else {
    console.error("Invalid square passed:", orig);
  }
  return false;
}

// --- Chess Logic Helpers ---

function toDests(): Map<Square, Square[]> {
  const dests = new Map<Square, Square[]>();
  SQUARES.forEach((s) => {
    const ms = state.chess.moves({ square: s, verbose: true });
    const moveObjects = ms.filter(isMoveObject);
    if (moveObjects.length)
      dests.set(
        s,
        moveObjects.map((m) => m.to),
      );
  });
  return dests;
}

// --- Board Interaction & Move Handling ---

function handleMoveAttempt(
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
      if (!variation[0]) continue;
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

function playAiMove(delay: number): void {
  setTimeout(() => {
    state.errorCount = 0;
    const nextMovePath: PgnPath[] = [];
    const nextMovePathCheck = navigateNextMove(state.pgnPath);
    const nextMove = state.pgnPathMap.get(nextMovePathCheck.join(","));
    if (nextMove && nextMove.turn === state.opponentColour[0]) {
      nextMovePath.push(nextMovePathCheck);
      if (config.acceptVariations)
        nextMove.variations.forEach((variation) => {
          if (nextMovePath && variation[0]) {
            nextMovePath.push(variation[0].pgnPath);
          }
        });
      const randomIndex = Math.floor(Math.random() * nextMovePath.length);
      stateProxy.pgnPath = nextMovePath[randomIndex]!;
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

let wrongMoveDebounce: number | null = null;
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

function promotePopup(orig: Square, dest: Square): void {
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
        if (move) promoteAnimate = false;

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

// --- Initialization ---
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
          const delay = config.boardMode === "Viewer" ? 0 : state.delayTime;
          handleMoveAttempt(delay, orig, dest);
        },
      },
    },
    premovable: {
      enabled: config.boardMode === "Viewer" ? false : true,
    },
    check: state.chess.inCheck(),
    events: {
      select: (key) => {
        filterShapes(ShapeFilter.Drawn);
        state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
        if (
          (config.boardMode === "Puzzle" &&
            state.playerColour !== getcurrentTurnColor()) ||
          !isSquare(key) ||
          wrongMoveDebounce
        ) {
          return;
        }
        const orig = state.cg.state.selected;
        const dest = key;

        if (orig && isSquare(orig)) {
          const moveCheck = getLegalMove({
            from: orig,
            to: dest,
            promotion: "q",
          });
          if (!moveCheck || moveCheck.promotion) return;
          // check if move should be handled by after: event
          const delay = config.boardMode === "Viewer" ? 0 : state.delayTime;

          handleMoveAttempt(delay, orig, dest);
          state.cg.selectSquare(null);
          return;
        }
        const arrowMove = state.chessGroundShapes
          .filter(
            (shape) =>
              shape.dest === dest &&
              shape.brush &&
              shapePriority.includes(shape.brush),
          )
          .sort(
            (a, b) =>
              shapePriority.indexOf(a.brush!) - shapePriority.indexOf(b.brush!),
          );
        if (arrowMove.length > 0 && config.boardMode === "Viewer") {
          if (
            arrowMove[0]!.dest &&
            isSquare(arrowMove[0]!.orig) &&
            isSquare(arrowMove[0]!.dest)
          ) {
            handleMoveAttempt(
              0,
              arrowMove[0]!.orig,
              arrowMove[0]!.dest,
              arrowMove[0]!.san,
            );
          }
        } else if (config.singleClickMove) {
          // No arrow was clicked, check if there's only one legal play to this square.
          const allMoves = state.chess.moves({ verbose: true });
          const movesToSquare = allMoves.filter((move) => move.to === dest);
          if (movesToSquare.length === 1) {
            // If only one piece can move to this square, play that move.
            if (config.boardMode === "Puzzle") {
              handleMoveAttempt(
                state.delayTime,
                movesToSquare[0]!.from,
                movesToSquare[0]!.to,
                movesToSquare[0]!.san,
              );
            } else if (config.boardMode === "Viewer") {
              handleMoveAttempt(
                0,
                              movesToSquare[0]!.from,
                              movesToSquare[0]!.to,
                              movesToSquare[0]!.san,              );
            }
          }
        }
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
  initializePuzzleTimer();
  return;
}
