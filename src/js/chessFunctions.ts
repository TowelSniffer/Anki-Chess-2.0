import { Chess, SQUARES } from 'chess.js';
import type { Move, Square } from 'chess.js';
import type { Color, Key } from 'chessground/types';
import { config, state, stateProxy } from './config';
import { addMoveToPgn, navigateNextMove } from './pgnViewer';
import { drawArrows, filterShapes, shapePriority, ShapeFilter } from './arrows';
import type { PgnPath } from './pgnViewer';
import type { CustomPgnMove } from './types';
import { puzzleIncrement, startPuzzleTimeout, extendPuzzleTime } from './timer';
import { playSound } from './audio';
// import { startAnalysis } from './handleStockfish';
import { positionPromoteOverlay } from './initializeUI';

// --- Types ---
type Promotions = 'q' | 'r' | 'b' | 'n';

type MoveInput = string | { from: Square; to: Square; promotion?: Promotions };

// --- type guarding ---

// chess.js Square doesn't include a0
function isSquare(key: Key): key is Square {
  return key !== 'a0';
}

// checks if an object is Move
function isMoveObject(move: object): move is Move {
  return typeof move === 'object' && move !== null;
}

// --- Utility ---

function toggleClass(querySelector: string, className: string): void {
  document.querySelectorAll('.' + querySelector).forEach(el => el.classList.toggle(className));
}

// return ts randomOrientation
function randomOrientation(): Color {
  const orientations = ['black', 'white'] as const;
  const orientation = orientations[Math.floor(Math.random() * 2)];
  return orientation;
}

// --- PGN State & Puzzle Logic ---

function setBoard(FEN: string): void {
  state.cg.set({
    fen: FEN,
    turnColor: toColor(),
    movable: {
      color: config.boardMode === 'Puzzle' ? state.playerColour : toColor(),
      dests: toDests()
    },
    drawable: {
      shapes: state.chessGroundShapes
    }
  });
}

export function handlePuzzleComplete(): void {
  state.cgwrap.classList.remove('timerMode');
  if (puzzleIncrement) clearInterval(puzzleIncrement);
  state.puzzleTime = -1;
  document.documentElement.style.setProperty('--border-color', state.solvedColour);
  state.cg.set({
    viewOnly: true
  });
}

export function areMovesEqual(move1: Move | CustomPgnMove | null, move2: Move | CustomPgnMove | null): boolean {
  // Check for null or undefined moves
  if (!move1 || !move2) {
    return false;
  }

  return move1.before === move2.before &&
  move1.after === move2.after
}

function isMoveLegal(moveInput: MoveInput): boolean {
  const legalMoves = state.chess.moves({ verbose: true });

  if (typeof moveInput === 'string') {
    // lan of san
    return legalMoves.some(move => move.san === moveInput || move.lan === moveInput);
  } else {
    // chess.js move object
    return legalMoves.some(move =>
    move.from === moveInput.from &&
    move.to === moveInput.to &&
    (move.promotion || 'q') === (moveInput.promotion || 'q') // Default to queen for comparison
    );
  }
}

function getLegalPromotion(orig: Square, dest: Square, promotion: string): Move | null {
  const tempChess = new Chess(state.chess.fen());
  return tempChess.move({ from: orig, to: dest, promotion: promotion });
}

export function getLegalMove(moveInput: MoveInput): Move | null {
  if (!isMoveLegal(moveInput)) {
    return null;
  }

  // Since we know the move is legal, we can safely make it.
  const tempChess = new Chess(state.chess.fen());
  return tempChess.move(moveInput);
}

function isPromotion(orig: Square, dest: Square): boolean {
  // check if 'orig' is a valid square name for ts
  if (SQUARES.includes(orig)) {
    const piece = state.chess.get(orig);
    // It's not a promotion if there's no piece or it's not a pawn
    if (!piece || piece.type !== 'p') {
      return false;
    }

    // Check if the dest is back rank
    const rank = dest.charAt(1);
    if (piece.color === 'w' && rank === '8') return true;
    if (piece.color === 'b' && rank === '1') return true;
  } else {
    console.error("Invalid square passed:", orig);
  }
  return false;
}

function isPuzzleFailed(isFailed: boolean): void {
  const { chess: _chess, cg: _cg, cgwrap: _cgwrap, ...stateCopy } = state;
  if (isFailed) { // manually fail
    state.errorTrack = true;
    state.solvedColour = "#b31010";
    if (config.handicapAdvance) {
      handlePuzzleComplete();
      setTimeout(() => { window.parent.postMessage(stateCopy, '*'); }, state.delayTime);
    } else {
      window.parent.postMessage(stateCopy, '*');
    }
  } else { // correct
    state.errorTrack = state.errorTrack ? true : "correct";
    if (
      config.timer &&
      !config.timerScore &&
      state.errorTrack === "correct" &&
      puzzleIncrement
    ) {
      state.errorTrack = "correctTime";
    }
    if (config.autoAdvance) {
      setTimeout(() => { window.parent.postMessage(stateCopy, '*'); }, state.delayTime);
    } else {
      window.parent.postMessage(stateCopy, '*');
    }
    handlePuzzleComplete();
  }
}


// --- Chess Logic Helpers ---

export function toDests(): Map<Square, Square[]> {
  const dests = new Map<Square, Square[]>();
  SQUARES.forEach(s => {
    const ms = state.chess.moves({ square: s, verbose: true });
    const moveObjects = ms.filter(isMoveObject);
    if (moveObjects.length) dests.set(s, moveObjects.map(m => m.to));
  });
    return dests;
}

export function toColor(): Color {
  return state.chess.turn() === 'w' ? 'white' : 'black';
}

export function getLastMove(): Move | null {
  const allMoves = state.chess.history({ verbose: true });
  const lastMove = allMoves.length > 0 ? allMoves[allMoves.length - 1] : null;
  return lastMove
}

// --- Board Interaction & Move Handling ---

function handleMoveAttempt(delay: number, orig: Square, dest: Square, moveSan: string | null = null): void {
  let moveCheck;
  if (moveSan){
    moveCheck = getLegalMove(moveSan)
  } else {
    if (isPromotion(orig, dest)) {
      promotePopup(orig, dest);
      return;
    }
    moveCheck = getLegalMove({ from: orig, to: dest })
  };
  if (!moveCheck) return;
  let nextMovePath: PgnPath = [];
  let foundVar = false;
  let currentLinePosition = state.pgnPath.at(-1) as number;
  if (!state.pgnPath.length) {
    nextMovePath = [0];
  } else {
    nextMovePath = state.pgnPath.with(-1, ++currentLinePosition);
  }
  const pathKey = nextMovePath.join(',');
  const pathMove = state.pgnPathMap.get(pathKey);
  if (pathMove && areMovesEqual(moveCheck, pathMove)) {
    foundVar = true;
  } else if (pathMove?.variations) {
    for (const variation of pathMove.variations) {
      if (variation[0].notation.notation === moveCheck.san ) {
        if (areMovesEqual(moveCheck, variation[0])) {
          nextMovePath = variation[0].pgnPath;
          foundVar = true;
          break;
        }
      }
    };
  }
  if (!foundVar) {
    if (config.boardMode === 'Viewer') {
      // Add move to state.parsedPGN
      nextMovePath = addMoveToPgn(moveCheck);
      stateProxy.pgnPath = nextMovePath;
    } else {
      handleWrongMove(moveCheck);
    }
  } else {
    stateProxy.pgnPath = nextMovePath;
    if (config.boardMode === 'Puzzle') {
      extendPuzzleTime(config.increment);
      playAiMove(state.delayTime);
    }

  }
}

function playAiMove(delay: number): void {
  setTimeout(() => {
    const nextMovePath: (PgnPath)[] = [];
    const nextMovePathCheck = navigateNextMove(state.pgnPath);
    const nextMove = state.pgnPathMap.get(nextMovePathCheck.join(','));
    if (nextMove && nextMove.turn === state.opponentColour[0]) {
      nextMovePath.push(nextMovePathCheck);
      nextMove.variations.forEach(variation => {
        nextMovePath.push(variation[0].pgnPath)
      });
      const randomIndex = Math.floor(Math.random() * nextMovePath.length);
      stateProxy.pgnPath = nextMovePath[randomIndex];
      state.cg.playPremove();
    }
  }, delay);
}

function playUserCorrectMove(delay: number): void {
  setTimeout(() => {
    state.cg.set({ viewOnly: false }); // will be disabled when user reaches handicap
    // Make the move without the AI's variation-selection logic
    const nextMovePath = navigateNextMove(state.pgnPath);
    stateProxy.pgnPath = nextMovePath;
  }, delay);
}

function handleWrongMove(move: Move): void {
  state.errorCount++;
  state.cg.move(move.from, move.to)
  playSound("Error");
  setBoard(state.chess.fen());
  // A puzzle is "failed" for scoring purposes if strict mode is on, or the handicap is exceeded.
  const isFailed = config.strictScoring || state.errorCount > config.handicap;
  if (isFailed) isPuzzleFailed(true);

  if (state.errorCount > config.handicap) {
    state.errorCount = 0;
    state.cg.set({ viewOnly: true }); // disable user movement until after puzzle advances
    playUserCorrectMove(state.delayTime); // Show the correct user move
    playAiMove(state.delayTime * 2); // Then play the AI's response
  }
}

function promotePopup(orig: Square, dest: Square): void {
  const cancelPopup = function(){
    state.cg.set({ fen: state.chess.fen() });
    toggleClass('showHide', 'hidden');
    setBoard(state.chess.fen())
  }
  const promoteButtons = document.querySelectorAll<HTMLButtonElement>("#promoteButtons > button");
  const overlay = document.querySelector<HTMLDivElement>("#overlay");
  promoteButtons.forEach(button => {
    button.onclick = (event: MouseEvent) => {
      // 'event.currentTarget' is the element the listener is attached to
      const clickedButton = event.currentTarget;
      event.stopPropagation();
      if (clickedButton instanceof HTMLButtonElement){
        const promoteChoice = clickedButton.value;
        const move = getLegalPromotion(orig, dest, promoteChoice);
        if (move && config.boardMode === 'Puzzle') {
          handleMoveAttempt(state.delayTime, move.from, move.to, move.san);
        } else if (move && config.boardMode === 'Viewer') {
          handleMoveAttempt(0, move.from, move.to, move.san);
        }
      }
      cancelPopup();
    };
  });

  if (overlay) {
    overlay.onclick = function() {
      cancelPopup();
    };
  }
  toggleClass('showHide', 'hidden');
  positionPromoteOverlay();
}

// --- Initialization ---
export function loadChessgroundBoard(): void {
  // Load beggining state for pgn
  let afterDebounce = false;
  state.chess.load(state.startFen);
  state.cg.set({
    fen: state.startFen,
    orientation: config.randomOrientation ? randomOrientation() : state.playerColour,
    turnColor: toColor(),
    events: {
      select: (key) => {
        filterShapes(ShapeFilter.Drawn)
        state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
        if (!isSquare(key)) return;
        const orig = state.cg.state.selected;
        const dest = key;
        if (orig && isSquare(orig)) {
          const moveCheck = getLegalMove({ from: orig, to: dest})
          if (!moveCheck || moveCheck.promotion) return;
          // check if move should be handled by after: event
          const delay = config.boardMode === 'Viewer' ? 0 : state.delayTime;

          handleMoveAttempt(delay, orig, dest);
          afterDebounce = true;
          return

        }
        const arrowMove = state.chessGroundShapes
        .filter(shape => shape.dest === dest && shape.brush && shapePriority.includes(shape.brush))
        .sort((a, b) => shapePriority.indexOf(a.brush!) - shapePriority.indexOf(b.brush!));
        if (arrowMove.length > 0 && config.boardMode === 'Viewer') {
          if (arrowMove[0].dest && isSquare(arrowMove[0].orig) && isSquare(arrowMove[0].dest)) {
            handleMoveAttempt(0, arrowMove[0].orig, arrowMove[0].dest, arrowMove[0].san);
          }
        } else if (config.singleClickMove) { // No arrow was clicked, check if there's only one legal play to this square.
          const allMoves = state.chess.moves({ verbose: true });
          const movesToSquare = allMoves.filter(move => move.to === dest);
          if (movesToSquare.length === 1) {
            // If only one piece can move to this square, play that move.
            if (config.boardMode === 'Puzzle') {
              handleMoveAttempt(state.delayTime, movesToSquare[0].from, movesToSquare[0].to, movesToSquare[0].san);
            } else if (config.boardMode === 'Viewer') {
              handleMoveAttempt(0, movesToSquare[0].from, movesToSquare[0].to, movesToSquare[0].san);
            }
          }
        }
      },
    },
    movable: {
      color: config.boardMode === 'Puzzle' ? state.playerColour : toColor(),
      dests: toDests(),
      events: {

        after: (orig, dest) => {
          if (!isSquare(orig) || !isSquare(dest)) return;
          if (afterDebounce) {
            setBoard(state.chess.fen());
            afterDebounce = false;
            return;
          }
          const delay = config.boardMode === 'Viewer' ? 0 : state.delayTime;
          handleMoveAttempt(delay, orig, dest);
          afterDebounce = false;
        },
      }
    },
    premovable: {
      enabled: config.boardMode === 'Viewer' ? false : true,
    },
    check: state.chess.inCheck(),
  });
  if (!state.chess.isGameOver() && config.flipBoard) {
    playAiMove(state.delayTime);
  }

  positionPromoteOverlay();
  drawArrows([]);
  startPuzzleTimeout();
  return;
}
