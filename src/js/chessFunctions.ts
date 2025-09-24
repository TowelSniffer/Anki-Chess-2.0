import { Chess, SQUARES } from 'chess.js';
import type { Move, PieceSymbol, Square } from 'chess.js';
import { config, state, htmlElement } from './config';
import type { CustomPgnMove, PromotionPieces } from './types';
import { setButtonsDisabled } from './toolbox';
import { drawArrows, filterShapes, ShapeFilter, shapePriority } from './arrows';
import type { NagData } from './arrows';
import { highlightCurrentMove } from './pgnViewer';
import { extendPuzzleTime, puzzleTimeout, startPuzzleTimeout } from './timer';
import { playSound, changeAudio } from './audio';
import { startAnalysis } from './handleStockfish';
import { positionPromoteOverlay } from './initializeUI';
import type { Color } from 'chessground/types';

// --- Utility ---

function toggleClass(querySelector: string, className: string): void {
  document.querySelectorAll('.' + querySelector).forEach(el => el.classList.toggle(className));
}

// --- PGN State & Puzzle Logic ---

export function isEndOfLine(): boolean {
  const isEnd = !state.expectedMove?.notation;
  if (isEnd) setButtonsDisabled(['forward'], true);
  return isEnd
}

function handlePuzzleComplete(): void {
  state.puzzleComplete = true;
  positionPromoteOverlay();
  state.cgwrap.classList.remove('timerMode');
  htmlElement.style.setProperty('--border-color', state.solvedColour);
  state.cg.set({
    viewOnly: true
  });
}

function isMoveLegal(orig: Square, dest: Square): boolean {
  const allMoves: Move[] = state.chess.moves({ verbose: true });
  return allMoves.some(move => move.from === orig && move.to === dest);
}

function getLegalMoveFromTo(orig: Square, dest: Square): Move | null {
  const tempChess = new Chess(state.chess.fen());
  return tempChess.move({ from: orig, to: dest });
}

export function getLegalMoveBySan(moveSan: string): Move | null {
  const tempChess = new Chess(state.chess.fen());
  return tempChess.move(moveSan);
}

function getLegalPromotion(orig: Square, dest: Square, promotion: PromotionPieces): Move | null {
  const tempChess = new Chess(state.chess.fen());
  return tempChess.move({ from: orig, to: dest, promotion: promotion });
}

function isPromotion(orig: Square, dest: Square): boolean {
  // check if 'orig' is a valid square name for ts
  if ((SQUARES as readonly string[]).includes(orig)) {
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
  if (isFailed) { // manually fail
    state.errorTrack = true;
    state.solvedColour = "#b31010";
    if (config.handicapAdvance) {
      handlePuzzleComplete();
      setTimeout(() => { window.parent.postMessage(state, '*'); }, state.delayTime);
    } else {
      window.parent.postMessage(state, '*');
    }
  } else { // correct
    state.errorTrack = state.errorTrack ? true : "correct";
    if (config.timer && !config.timerScore && state.errorTrack === "correct" && puzzleTimeout) {
      state.solvedColour = "#2CBFA7";
      state.errorTrack = "correctTime";
    }
    if (config.autoAdvance) {
      setTimeout(() => { window.parent.postMessage(state, '*'); }, state.delayTime);
    } else {
      window.parent.postMessage(state, '*');
    }
    handlePuzzleComplete();
  }
}


// --- Chess Logic Helpers ---

export function toDests(): Map<Square, Square[]> {
  const dests = new Map<Square, Square[]>();
  SQUARES.forEach(s => {
    const ms = state.chess.moves({ square: s, verbose: true }) as Move[];
    if (ms.length) dests.set(s, ms.map(m => m.to));
  });
    return dests;
}

export function toColor(): Color {
  return state.chess.turn() === 'w' ? 'white' : 'black';
}

function getOpponentColor(): 'w' | 'b' {
  return state.chess.turn() === 'w' ? 'b' : 'w';
}

export function getLastMove(): Move | false {
  const allMoves = state.chess.history({ verbose: true });
  const lastMove = allMoves.length > 0 ? allMoves[allMoves.length - 1] : false;
  return lastMove
}

// --- Board Interaction & Move Handling ---



export function updateBoard(move: Move, backwardPromote: boolean = false): void {
  // animate Board chanes
  function cancelDefaultAnimation(): void {
    state.cg.set({ animation: { enabled: false} })
    state.cg.set({
      fen: state.chess.fen(),
    });
    state.cg.set({ animation: { enabled: true} })
  }
  if (!state.pgnState) {
    state.chessGroundShapes = [];
  }
  state.lastMove = getLastMove();
  if (state.pgnState && state.lastMove && state.lastMove?.san === state.expectedMove?.notation.notation && !isEndOfLine()) {
    state.pgnPath = state.expectedMove!.pgnPath!;
    window.parent.postMessage(state, '*');
  }
  if (move.flags.includes("p") && state.promoteAnimate && !backwardPromote) {
    const tempChess = new Chess(state.chess.fen());
    tempChess.load(state.chess.fen());
    tempChess.remove(move.from);
    tempChess.put({ type: 'p', color: getOpponentColor() }, move.to);
    state.cg.set({
      fen: tempChess.fen(),
    });
    setTimeout(() => {
      cancelDefaultAnimation()
      drawArrows();
    }, 200)
  } else if (move.flags.includes("p") && backwardPromote) { // nav back promote
    const FENpos = state.chess.fen(); // used to track when udoing captured with promoted piece
    const tempChess = new Chess(state.chess.fen()); // new chess instance to no break old one
    tempChess.load(FENpos);
    tempChess.remove(move.to);
    tempChess.remove(move.from);
    tempChess.put({ type: 'p', color: state.chess.turn() }, move.to);
    state.cg.set({ animation: { enabled: false} })
    state.cg.set({
      fen: tempChess.fen(),
    });
    tempChess.remove(move.to);
    tempChess.put({ type: 'p', color: state.chess.turn() }, move.from);
    state.cg.set({ animation: { enabled: true} })
    state.cg.set({
      fen: FENpos
    });
    state.promoteAnimate = false;
  } else if (move.flags.includes("e") && state.promoteAnimate) {
    cancelDefaultAnimation()
    state.cg.set({
      fen: state.chess.fen(),
    });
    state.promoteAnimate = false;
  } else {
    state.cg.set({ fen: state.chess.fen() });
  }
  state.cg.set({
    check: state.chess.inCheck(),
         turnColor: toColor(),
         movable: {
           dests: toDests(),
         color: config.boardMode === 'Puzzle' ? state.playerColour : toColor(),
         },
         lastMove: [move.from, move.to]
  });
  changeAudio(move);
  setButtonsDisabled(['back', 'reset'], false);
  if (config.boardMode === "Viewer" && state.pgnState && !isEndOfLine()) highlightCurrentMove(state.expectedMove!.pgnPath!);
  startAnalysis(config.analysisTime);
}

function makeMove(move: string): void{
  const moveResult = state.chess.move(move);
  if (moveResult) {
    updateBoard(moveResult);
  }
}

export function handleMoveAttempt(delay: number, orig: Square, dest: Square, moveSan: string | null = null): void {
  if (!isMoveLegal(orig, dest)) return;
  if (!moveSan && isPromotion(orig, dest)) {
    state.debounceCheck = false;
    promotePopup(orig, dest);
  } else if (moveSan) {
    const moveCheck = getLegalMoveBySan(moveSan);
    if (moveCheck) {
      state.debounceCheck = moveCheck;
      if (isPromotion(moveCheck.from, moveCheck.to) && state.promoteAnimate !== null) {
        state.debounceCheck = true;
        setTimeout(() => {
          state.promoteAnimate = true;
          if (state.debounceCheck === true) checkMove(moveCheck, delay);
        }, 0);
      } else {
        if (moveCheck.flags.includes("e")) state.promoteAnimate = false;
        state.cg.set({
          fen: state.chess.fen(),
        });
        checkMove(moveCheck, delay);
      }
    }
  } else {
    const moveCheck = getLegalMoveFromTo(orig, dest);
    if (moveCheck) {
      if (typeof state.debounceCheck !== 'boolean' && state.debounceCheck.san === moveCheck.san) return;
      checkMove(moveCheck, delay);
    }
  }
}

function checkMove(move: Move, delay: number): void {
  if (!move || !move.san) return;
  let foundVariation = false;
  if (state.expectedMove?.notation.notation === move.san && state.pgnState) {
    foundVariation = true;
  } else if (state.expectedMove?.variations && config.acceptVariations && state.pgnState) {
    for (let i = 0; i < state.expectedMove.variations.length; i++) {
      if (move.san === state.expectedMove.variations[i][0].notation.notation) {
        state.count = 0;
        state.expectedLine = state.expectedMove.variations[i];
        state.expectedMove = state.expectedLine[state.count];
        foundVariation = true;
        break;
      }
    }
  }
  if (foundVariation) {
    const isBlunder = state.expectedMove?.nag?.some(nags => state.blunderNags.includes(nags));
    if (isBlunder) isPuzzleFailed(true);
    extendPuzzleTime(config.increment);
    makeMove(move.san);
    state.count++;
    state.expectedMove = state.expectedLine[state.count];
    if (state.expectedMove && delay) {
      playAiMove(delay);
    } else if (delay) {
      isPuzzleFailed(false)
    }
    drawArrows();
  } else if (delay) {
    handleWrongMove(move);
  } else if (!delay) {
    // no delay passed when we don't want Ai response
    handlePgnState(false);
    makeMove(move.san);
  }
}
let aiTimeout : number | null = null;
function playAiMove(delay: number): void {
  aiTimeout = setTimeout(() => {
    if (isEndOfLine() || !state.expectedMove) return;
    state.errorCount = 0;
    if (state.expectedMove.variations && state.expectedMove.variations.length > 0 && config.acceptVariations) {
      const moveVar = Math.floor(Math.random() * (state.expectedMove!.variations.length + 1));
      if (moveVar !== state.expectedMove!.variations.length) {
        state.count = 0;
        state.expectedLine = state.expectedMove!.variations[moveVar];
        state.expectedMove = state.expectedLine[0];
      }
    }
    makeMove(state.expectedMove.notation.notation);
    state.count++;
    state.expectedMove = state.expectedLine[state.count];

    if (isEndOfLine()) isPuzzleFailed(false);
    drawArrows(true);
    aiTimeout = null;
  }, delay);
}
function playUserCorrectMove(delay: number): void {
  setTimeout(() => {
    state.debounceCheck = false;
    state.cg.set({ viewOnly: false }); // will be disabled when user reaches handicap
    // Make the move without the AI's variation-selection logic
    if (isEndOfLine()) return;
    makeMove(state.expectedMove!.notation.notation);
    state.count++;
    state.expectedMove = state.expectedLine[state.count];
    if (isEndOfLine()) {
      handlePuzzleComplete();
      setTimeout(() => { window.parent.postMessage(state, '*'); }, state.delayTime);
    }
  }, delay);
}

function handleWrongMove(move: Move): void {
  state.chessGroundShapes = [];
  state.errorCount++;
  state.cg.move(move.from, move.to)
  playSound("Error");
  // A puzzle is "failed" for scoring purposes if strict mode is on, or the handicap is exceeded.
  const isFailed = config.strictScoring || state.errorCount > config.handicap;
  if (isFailed) isPuzzleFailed(true);

  updateBoard(move);
  // The puzzle interaction stops and the solution is shown only when the handicap is exceeded.
  if (state.errorCount > config.handicap) {
    state.cg.set({ viewOnly: true }); // disable user movement until after puzzle advances
    playUserCorrectMove(state.delayTime); // Show the correct user move
    playAiMove(state.delayTime * 2); // Then play the AI's response
  }
}

function promotePopup(orig: Square, dest: Square): void {
  const cancelPopup = function(){
    state.promoteAnimate = false;
    state.cg.set({
      fen: state.chess.fen(),
           turnColor: toColor(),
           movable: {
             color: toColor(),
           dests: toDests()
           }
    });
    toggleClass('showHide', 'hidden');
    drawArrows();
  }
  const promoteButtons = document.querySelectorAll<HTMLButtonElement>("#promoteButtons > button");
  const overlay = document.querySelector<HTMLDivElement>("#overlay");
  promoteButtons.forEach(button => {
    button.onclick = (event: MouseEvent) => {
      // 'event.currentTarget' is the element the listener is attached to
      const clickedButton = event.currentTarget as HTMLButtonElement;
      event.stopPropagation();
      state.promoteChoice = clickedButton.value as PromotionPieces;
      state.promoteAnimate = null;
      const move = getLegalPromotion(orig, dest, state.promoteChoice);

      if (move && config.boardMode === 'Puzzle') {
        handleMoveAttempt(state.delayTime, move.from, move.to, move.san);
      } else if (move && config.boardMode === 'Viewer') {
        handleMoveAttempt(0, move.from, move.to, move.san);
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

// --- Navigation ---

export function handlePgnState(pgnState: boolean): void {
  state.pgnState = pgnState;
  setButtonsDisabled(['forward'], !pgnState);
}

// --- Initialization ---
export function loadChessgroundBoard(): void {
  // Load beggining state for pgn
  state.count = 0;
  state.expectedLine = state.parsedPGN.moves;
  state.expectedMove = state.expectedLine[0];
  state.chess.load(state.ankiFen);
  state.cg.set({
    fen: state.ankiFen,
    orientation: config.randomOrientation ? ['black', 'white'][Math.floor(Math.random() * 2)] as Color : state.playerColour as Color,
         turnColor: toColor(),
         events: {
           change: () => {
             // called after the situation changes on the board
           },
           move: (orig, dest, capturedPiece) => {
             // will call on any user move.
           },
           select: (key) => {
             filterShapes(ShapeFilter.Drawn);
             state.cg.set({drawable: {shapes: state.chessGroundShapes}});
              if (aiTimeout) return;
              const arrowMove = state.chessGroundShapes
              .filter(shape => shape.dest === key && shape.brush && shapePriority.includes(shape.brush))
              .sort((a, b) => shapePriority.indexOf(a.brush!) - shapePriority.indexOf(b.brush!));
              if (arrowMove.length > 0 && config.boardMode === 'Viewer') {
                // If the user clicks on a Stockfish-generated move, they are deviating from the PGN.
                if (arrowMove[0].brush === 'stockfish' || arrowMove[0].brush === 'stockfinished') {
                  handlePgnState(false);
                }
                if (arrowMove[0].dest) {
                  handleMoveAttempt(0, (arrowMove[0].orig as Square), (arrowMove[0].dest as Square), arrowMove[0].san);
                }
              } else { // No arrow was clicked, check if there's only one legal play to this square.
                const allMoves = state.chess.moves({ verbose: true });
                const movesToSquare = allMoves.filter(move => move.to === key);
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
                if (config.boardMode === 'Puzzle') {
                  handleMoveAttempt(state.delayTime, (orig as Square), (dest as Square));
                } else if (config.boardMode === 'Viewer') {
                  handleMoveAttempt(0, (orig as Square), (dest as Square));
                }
              },
            }
         },
         check: state.chess.inCheck(),
  });
  if (config.boardMode === 'Viewer') {
    drawArrows();
    state.cg.set({
      premovable: {
        enabled: false
      }
    });
    setButtonsDisabled(['back', 'reset'], true);
  } else if (!state.chess.isGameOver() && config.flipBoard) {
    playAiMove(state.delayTime);
  }

  positionPromoteOverlay();
  startPuzzleTimeout(config.timer);
  return;
}
