import { Chess, SQUARES } from 'chess.js';
import type { Move, PieceSymbol, Square } from 'chess.js';
import { cg, chess, config, state, parsedPGN, htmlElement, btn, defineDynamicElement, shapePriority, delayTime } from './config';
import type { CustomPgnMove, PromotionPieces } from './types';
import { findMoveContext } from './toolbox';
import { drawArrows, filterShapes, ShapeFilter } from './arrows';
import type { NagData } from './arrows';
import { highlightCurrentMove } from './pgnViewer';
import { extendPuzzleTime, puzzleTimeout, startPuzzleTimeout } from './timer';
import { playSound, changeAudio } from './audio';
import { startAnalysis } from './handleStockfish';
import { positionPromoteOverlay } from './initializeUI';
import type { Color, Key } from 'chessground/types';

// --- Utility ---

function toggleClass(querySelector: string, className: string): void {
  document.querySelectorAll('.' + querySelector).forEach(el => el.classList.toggle(className));
}
function setButtonsDisabled(keys: (keyof typeof btn)[], isDisabled: boolean): void {
  keys.forEach(key => {
    const button = btn[key];
    if (button) {
      button.disabled = isDisabled;
    }
  });
}

// --- PGN State & Puzzle Logic ---

function isEndOfLine(): boolean {
  const isEnd = !state.expectedMove || typeof state.expectedMove === 'string';
  if (isEnd) setButtonsDisabled(['forward'], true);
  return isEnd
}

function handlePuzzleComplete(): void {
  state.puzzleComplete = true;
  (async () => {
    const cgwrap = await defineDynamicElement('.cg-wrap');
    positionPromoteOverlay(cgwrap);
    cgwrap.classList.remove('timerMode');
  })();
  htmlElement.style.setProperty('--border-color', state.solvedColour);
  cg.set({
    viewOnly: true
  });
}

function isMoveLegal(chess: Chess, orig: Key, dest: Key): boolean {
  const allMoves: Move[] = chess.moves({ verbose: true });
  return allMoves.some(move => move.from === orig && move.to === dest);
}

function getLegalMoveFromTo(orig: Key, dest: Key): Move | null {
  const tempChess = new Chess(chess.fen());
  return tempChess.move({ from: orig, to: dest });
}

export function getLegalMoveBySan(moveSan: string): Move | null {
  const tempChess = new Chess(chess.fen());
  return tempChess.move(moveSan);
}

function getLegalPromotion(orig: Key, dest: Key, promotion: PromotionPieces): Move | null {
  const tempChess = new Chess(chess.fen());
  return tempChess.move({ from: orig, to: dest, promotion: promotion });
}

function isPromotion(orig: Key, dest: Key): boolean {
  // check if 'orig' is a valid square name for ts
  if ((SQUARES as readonly string[]).includes(orig)) {
    const piece = chess.get(orig as Square);
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
      setTimeout(() => { window.parent.postMessage(state, '*'); }, delayTime);
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
      setTimeout(() => { window.parent.postMessage(state, '*'); }, delayTime);
    } else {
      window.parent.postMessage(state, '*');
    }
    handlePuzzleComplete()
  }
}


// --- Chess Logic Helpers ---

export function toDests(chess: Chess): Map<Key, Key[]> {
  const dests = new Map<Key, Key[]>();
  SQUARES.forEach(s => {
    const ms = chess.moves({ square: s, verbose: true }) as Move[];
    if (ms.length) dests.set(s as Key, ms.map(m => m.to));
  });
    return dests;
}

export function toColor(chess: Chess): Color {
  return chess.turn() === 'w' ? 'white' : 'black';
}

function getOpponentColor(chess: Chess): 'w' | 'b' {
  return chess.turn() === 'w' ? 'b' : 'w';
}

function getLastMove(chess: Chess): Move | false {
  const allMoves = chess.history({ verbose: true });
  const lastMove = allMoves.length > 0 ? allMoves[allMoves.length - 1] : false;
  return lastMove
}

// --- Board Interaction & Move Handling ---

function updateBoard(move: Move, backwardPromote: boolean = false): void {
  // animate Board chanes
  function cancelDefaultAnimation(chessInstance: Chess): void {
    cg.set({ animation: { enabled: false} })
    cg.set({
      fen: chessInstance.fen(),
    });
    cg.set({ animation: { enabled: true} })
  }
  if (!state.pgnState) {
    state.chessGroundShapes = [];
  }
  state.lastMove = getLastMove(chess);
  if (state.pgnState && state.lastMove && state.lastMove?.san === state.expectedMove?.notation.notation && !isEndOfLine()) {
    state.pgnPath = state.expectedMove!.pgnPath!;
    window.parent.postMessage(state, '*');
  }
  if (move.flags.includes("p") && state.promoteAnimate && !backwardPromote) {
    const tempChess = new Chess(chess.fen());
    tempChess.load(chess.fen());
    tempChess.remove(move.from);
    tempChess.put({ type: 'p', color: getOpponentColor(chess) }, move.to);
    cg.set({
      fen: tempChess.fen(),
    });
    setTimeout(() => {
      cancelDefaultAnimation(chess)
      drawArrows();
    }, 200)
  } else if (move.flags.includes("p") && backwardPromote) { // nav back promote
    const FENpos = chess.fen(); // used to track when udoing captured with promoted piece
    const tempChess = new Chess(chess.fen()); // new chess instance to no break old one
    tempChess.load(FENpos);
    tempChess.remove(move.to);
    tempChess.remove(move.from);
    tempChess.put({ type: 'p', color: chess.turn() }, move.to);
    cg.set({ animation: { enabled: false} })
    cg.set({
      fen: tempChess.fen(),
    });
    tempChess.remove(move.to);
    tempChess.put({ type: 'p', color: chess.turn() }, move.from);
    cg.set({ animation: { enabled: true} })
    cg.set({
      fen: FENpos
    });
    state.promoteAnimate = false;
  } else if (move.flags.includes("e") && state.promoteAnimate) {
    cancelDefaultAnimation(chess)
    cg.set({
      fen: chess.fen(),
    });
    state.promoteAnimate = false;
  } else {
    cg.set({ fen: chess.fen() });
  }
  cg.set({
    check: chess.inCheck(),
         turnColor: toColor(chess),
         movable: {
           dests: toDests(chess),
         color: config.boardMode === 'Puzzle' ? state.playerColour : toColor(chess),
         },
         lastMove: [move.from, move.to]
  });
  changeAudio(move);
  setButtonsDisabled(['back', 'reset'], false);
  if (config.boardMode === "Viewer" && state.pgnState && !isEndOfLine()) highlightCurrentMove(state.expectedMove!.pgnPath!);
  startAnalysis(config.analysisTime);
}

function makeMove(move: string): void{
  const moveResult = chess.move(move);
  if (moveResult) {
    updateBoard(moveResult);
  }
}

function handleMoveAttempt(delay: number, orig: Key, dest: Key, moveSan: string | null = null): void {
  if (!isMoveLegal(chess, orig, dest)) return;
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
        cg.set({
          fen: chess.fen(),
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
  isEndOfLine();
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
    cg.set({ viewOnly: false }); // will be disabled when user reaches handicap
    // Make the move without the AI's variation-selection logic
    if (isEndOfLine()) return;
    makeMove(state.expectedMove!.notation.notation);
    state.count++;
    state.expectedMove = state.expectedLine[state.count];
    if (isEndOfLine()) {
      handlePuzzleComplete();
      setTimeout(() => { window.parent.postMessage(state, '*'); }, delayTime);
    }
  }, delay);
}

function handleWrongMove(move: Move): void {
  state.chessGroundShapes = [];
  state.errorCount++;
  cg.move(move.from, move.to)
  playSound("Error");
  // A puzzle is "failed" for scoring purposes if strict mode is on, or the handicap is exceeded.
  const isFailed = config.strictScoring || state.errorCount > config.handicap;
  if (isFailed) isPuzzleFailed(true);

  updateBoard(move);
  // The puzzle interaction stops and the solution is shown only when the handicap is exceeded.
  if (state.errorCount > config.handicap) {
    cg.set({ viewOnly: true }); // disable user movement until after puzzle advances
    playUserCorrectMove(delayTime); // Show the correct user move
    playAiMove(delayTime * 2); // Then play the AI's response
  }
}

function promotePopup(orig: Key, dest: Key): void {
  const cancelPopup = function(){
    state.promoteAnimate = false;
    cg.set({
      fen: chess.fen(),
           turnColor: toColor(chess),
           movable: {
             color: toColor(chess),
           dests: toDests(chess)
           }
    });
    toggleClass('showHide', 'hidden');
    drawArrows()
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
        handleMoveAttempt(delayTime, move.from, move.to, move.san);
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
  (async () => {
    const cgwrap = await defineDynamicElement('.cg-wrap');
    positionPromoteOverlay(cgwrap);
  })();
}

// --- Navigation ---

function handlePgnState(pgnState: boolean): void {
  state.pgnState = pgnState;
  setButtonsDisabled(['forward'], !pgnState);
}

export function navBackward(): void {
  if (config.boardMode === 'Puzzle') return;
  const lastMove = chess.undo();
  if (lastMove) {
    state.debounceCheck = false;
    updateBoard(lastMove, true)
    if (state.expectedLine[state.count - 1]?.notation?.notation === lastMove.san) {
      state.count--
      state.expectedMove = state.expectedLine[state.count];
      if (state.count === 0 && state.expectedMove) {
        const isVariation = findMoveContext(parsedPGN, state.expectedMove);
        if (isVariation?.parent) {
          state.count = isVariation.index;
          state.expectedLine = isVariation.parentLine;
          state.expectedMove = isVariation.parent;
        }

      } else {
        state.expectedMove = state.expectedLine[state.count];
      }
    }
    const firstMoveCheck = getLastMove(chess);
    if (state.count === 0 && state.ankiFen !== chess.fen()) {
      return;
    } else if (firstMoveCheck && (state.count === 0 || state.expectedLine[state.count - 1]?.notation.notation === firstMoveCheck.san) ) {
      handlePgnState(true);
    } else if (state.count === 0 && !firstMoveCheck) { // start of pgn from branch at first move
      handlePgnState(true)
    }
  }
  drawArrows();
  if (state.expectedLine[state.count - 1]?.notation?.notation) {

    const expectedMove = state.expectedLine[state.count - 1];
    highlightCurrentMove(expectedMove.pgnPath!);
  } else { // no moves played clear highlight
    document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
    setButtonsDisabled(['back', 'reset'], true);
  }
  startAnalysis(config.analysisTime);
}

export function navForward(): void {
  if (config.boardMode === 'Puzzle' || !state.pgnState || !state.expectedMove?.notation) return;
  const expectedMove = state.expectedMove?.notation?.notation;
  if (!expectedMove) return;
  const move = getLegalMoveBySan(expectedMove);
  if (move) {
    handleMoveAttempt(0, move.from, move.to, move.san);
    isEndOfLine();
    setButtonsDisabled(['back', 'reset'], false);
  }
}

// --- Board Actions ---

export function rotateBoard(): void {
  state.boardRotation = state.boardRotation === "white" ? "black" : "white";

  const coordWhite = getComputedStyle(htmlElement).getPropertyValue("--coord-white").trim();
  const coordBlack = getComputedStyle(htmlElement).getPropertyValue("--coord-black").trim();
  htmlElement.style.setProperty("--coord-white", coordBlack);
  htmlElement.style.setProperty("--coord-black", coordWhite);

  cg.set({ orientation: state.boardRotation });

  const flipButton = document.querySelector<HTMLElement>(".flipBoardIcon");
  if (flipButton && flipButton.style.transform.includes("90deg")) {
    flipButton.style.transform = "rotate(270deg)";
  } else if (flipButton) {
    flipButton.style.transform = "rotate(90deg)";
  }
}

export function resetBoard(): void {
  state.count = 0; // Int so we can track on which move we are.
  state.chessGroundShapes = [];
  state.expectedLine = parsedPGN.moves; // Set initially to the mainline of pgn but can change path with variations
  state.expectedMove = parsedPGN.moves[state.count]; // Set the expected move according to PGN
  handlePgnState(true);
  chess.reset();
  chess.load(state.ankiFen);
  cg.set({
    fen: chess.fen(),
         check: chess.inCheck(),
         turnColor: toColor(chess),
         orientation: state.boardRotation,
         movable: {
           color: toColor(chess),
         dests: toDests(chess)
         }
  });
  document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
  setButtonsDisabled(['back', 'reset'], true);
  startAnalysis(config.analysisTime);
  drawArrows();
}

export function copyFen(): boolean {
  let textarea = document.createElement("textarea");
  textarea.value = chess.fen();
  // Make the textarea invisible and off-screen
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    playSound("computer-mouse-click")
    return true;
  } catch (err) {
    playSound("Error")
    console.error('Failed to copy text using execCommand:', err);
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

// --- Initialization ---
export function reload(): void {
  // Load beggining state for pgn
  state.count = 0;
  state.expectedLine = parsedPGN.moves;
  state.expectedMove = state.expectedLine[0];
  chess.load(state.ankiFen);

  cg.set({
    fen: state.ankiFen,
    orientation: config.randomOrientation ? ['black', 'white'][Math.floor(Math.random() * 2)] as Color : state.playerColour as Color,
         turnColor: toColor(chess),
         events: {
           change: () => {
             // called after the situation changes on the board
           },
           move: (orig, dest, capturedPiece) => {
             // will call on any user move.
           },
           select: (key) => {
             filterShapes(ShapeFilter.Drawn);
             cg.set({drawable: {shapes: state.chessGroundShapes}});
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
                  handleMoveAttempt(0, arrowMove[0].orig, arrowMove[0].dest, arrowMove[0].san);
                }
              } else { // No arrow was clicked, check if there's only one legal play to this square.
                const allMoves = chess.moves({ verbose: true });
                const movesToSquare = allMoves.filter(move => move.to === key);
                if (movesToSquare.length === 1) {
                  // If only one piece can move to this square, play that move.
                  if (config.boardMode === 'Puzzle') {
                    handleMoveAttempt(delayTime, movesToSquare[0].from, movesToSquare[0].to, movesToSquare[0].san);
                  } else if (config.boardMode === 'Viewer') {
                    handleMoveAttempt(0, movesToSquare[0].from, movesToSquare[0].to, movesToSquare[0].san);
                  }
                }
              }
            },
         },
         movable: {
            color: config.boardMode === 'Puzzle' ? state.playerColour : toColor(chess),
            dests: toDests(chess),
            events: {
              after: (orig, dest) => {
                if (config.boardMode === 'Puzzle') {
                  handleMoveAttempt(delayTime, orig, dest);
                } else if (config.boardMode === 'Viewer') {
                  handleMoveAttempt(0, orig, dest);
                }
              },
            }
         },
         check: chess.inCheck(),
  });
  if (config.boardMode === 'Viewer') {
    drawArrows();
    cg.set({
      premovable: {
        enabled: false
      }
    });
    setButtonsDisabled(['back', 'reset'], true);
  } else if (!chess.isGameOver() && config.flipBoard) {
    playAiMove(delayTime);
  }
  (async () => {
    const cgwrap = await defineDynamicElement('.cg-wrap');
    positionPromoteOverlay(cgwrap);
    startPuzzleTimeout(config.timer);
  })();
}
