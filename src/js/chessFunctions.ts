import { Chess, SQUARES } from 'chess.js';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Move, PieceSymbol, Square } from 'chess.js';
import { config, state, parsedPGN, htmlElement, delayTime, cgDefaults } from './config';
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

function handlePuzzleComplete(cg: Api, chess: Chess, cgwrap: HTMLDivElement): void {
  state.puzzleComplete = true;
  positionPromoteOverlay(cgwrap);
  cgwrap.classList.remove('timerMode');
  htmlElement.style.setProperty('--border-color', state.solvedColour);
  cg.set({
    viewOnly: true
  });
}

function isMoveLegal(chess: Chess, orig: Square, dest: Square): boolean {
  const allMoves: Move[] = chess.moves({ verbose: true });
  return allMoves.some(move => move.from === orig && move.to === dest);
}

function getLegalMoveFromTo(chess: Chess, orig: Square, dest: Square): Move | null {
  const tempChess = new Chess(chess.fen());
  return tempChess.move({ from: orig, to: dest });
}

export function getLegalMoveBySan(chess: Chess, moveSan: string): Move | null {
  const tempChess = new Chess(chess.fen());
  return tempChess.move(moveSan);
}

function getLegalPromotion(chess: Chess, orig: Square, dest: Square, promotion: PromotionPieces): Move | null {
  const tempChess = new Chess(chess.fen());
  return tempChess.move({ from: orig, to: dest, promotion: promotion });
}

function isPromotion(chess: Chess, orig: Square, dest: Square): boolean {
  // check if 'orig' is a valid square name for ts
  if ((SQUARES as readonly string[]).includes(orig)) {
    const piece = chess.get(orig);
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

function isPuzzleFailed(cg: Api, chess: Chess, cgwrap: HTMLDivElement, isFailed: boolean): void {
  if (isFailed) { // manually fail
    state.errorTrack = true;
    state.solvedColour = "#b31010";
    if (config.handicapAdvance) {
      handlePuzzleComplete(cg, chess, cgwrap);
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
    handlePuzzleComplete(cg, chess, cgwrap);
  }
}


// --- Chess Logic Helpers ---

export function toDests(chess: Chess): Map<Square, Square[]> {
  const dests = new Map<Square, Square[]>();
  SQUARES.forEach(s => {
    const ms = chess.moves({ square: s, verbose: true }) as Move[];
    if (ms.length) dests.set(s, ms.map(m => m.to));
  });
    return dests;
}

export function toColor(chess: Chess): Color {
  return chess.turn() === 'w' ? 'white' : 'black';
}

function getOpponentColor(chess: Chess): 'w' | 'b' {
  return chess.turn() === 'w' ? 'b' : 'w';
}

export function getLastMove(chess: Chess): Move | false {
  const allMoves = chess.history({ verbose: true });
  const lastMove = allMoves.length > 0 ? allMoves[allMoves.length - 1] : false;
  return lastMove
}

// --- Board Interaction & Move Handling ---



export function updateBoard(cg: Api, chess: Chess, move: Move, backwardPromote: boolean = false): void {
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
      drawArrows(cg, chess);
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
  startAnalysis(chess, config.analysisTime);
}

function makeMove(cg: Api, chess: Chess, move: string): void{
  const moveResult = chess.move(move);
  if (moveResult) {
    updateBoard(cg, chess, moveResult);
  }
}

export function handleMoveAttempt(cg: Api, chess: Chess, cgwrap: HTMLDivElement, delay: number, orig: Square, dest: Square, moveSan: string | null = null): void {
  if (!isMoveLegal(chess, orig, dest)) return;
  if (!moveSan && isPromotion(chess, orig, dest)) {
    state.debounceCheck = false;
    promotePopup(cg, chess, cgwrap, orig, dest);
  } else if (moveSan) {
    const moveCheck = getLegalMoveBySan(chess, moveSan);
    if (moveCheck) {
      state.debounceCheck = moveCheck;
      if (isPromotion(chess, moveCheck.from, moveCheck.to) && state.promoteAnimate !== null) {
        state.debounceCheck = true;
        setTimeout(() => {
          state.promoteAnimate = true;
          if (state.debounceCheck === true) checkMove(cg, chess, cgwrap, moveCheck, delay);
        }, 0);
      } else {
        if (moveCheck.flags.includes("e")) state.promoteAnimate = false;
        cg.set({
          fen: chess.fen(),
        });
        checkMove(cg, chess, cgwrap, moveCheck, delay);
      }
    }
  } else {
    const moveCheck = getLegalMoveFromTo(chess, orig, dest);
    if (moveCheck) {
      if (typeof state.debounceCheck !== 'boolean' && state.debounceCheck.san === moveCheck.san) return;
      checkMove(cg, chess, cgwrap, moveCheck, delay);
    }
  }
}

function checkMove(cg: Api, chess: Chess, cgwrap: HTMLDivElement, move: Move, delay: number): void {
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
    if (isBlunder) isPuzzleFailed(cg, chess, cgwrap, true);
    extendPuzzleTime(config.increment, cg, cgwrap);
    makeMove(cg, chess, move.san);
    state.count++;
    state.expectedMove = state.expectedLine[state.count];
    if (state.expectedMove && delay) {
      playAiMove(cg, chess, cgwrap, delay);
    } else if (delay) {
      isPuzzleFailed(cg, chess, cgwrap, false)
    }
    drawArrows(cg, chess);
  } else if (delay) {
    handleWrongMove(cg, chess, cgwrap, move);
  } else if (!delay) {
    // no delay passed when we don't want Ai response
    handlePgnState(false);
    makeMove(cg, chess, move.san);
  }
}
let aiTimeout : number | null = null;
function playAiMove(cg: Api, chess: Chess, cgwrap: HTMLDivElement, delay: number): void {
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
    makeMove(cg, chess, state.expectedMove.notation.notation);
    state.count++;
    state.expectedMove = state.expectedLine[state.count];

    if (isEndOfLine()) isPuzzleFailed(cg, chess, cgwrap, false);
    drawArrows(cg, chess, true);
    aiTimeout = null;
  }, delay);
}
function playUserCorrectMove(cg: Api, chess: Chess, cgwrap: HTMLDivElement, delay: number): void {
  setTimeout(() => {
    state.debounceCheck = false;
    cg.set({ viewOnly: false }); // will be disabled when user reaches handicap
    // Make the move without the AI's variation-selection logic
    if (isEndOfLine()) return;
    makeMove(cg, chess, state.expectedMove!.notation.notation);
    state.count++;
    state.expectedMove = state.expectedLine[state.count];
    if (isEndOfLine()) {
      handlePuzzleComplete(cg, chess, cgwrap);
      setTimeout(() => { window.parent.postMessage(state, '*'); }, delayTime);
    }
  }, delay);
}

function handleWrongMove(cg: Api, chess: Chess, cgwrap: HTMLDivElement, move: Move): void {
  state.chessGroundShapes = [];
  state.errorCount++;
  cg.move(move.from, move.to)
  playSound("Error");
  // A puzzle is "failed" for scoring purposes if strict mode is on, or the handicap is exceeded.
  const isFailed = config.strictScoring || state.errorCount > config.handicap;
  if (isFailed) isPuzzleFailed(cg, chess, cgwrap, true);

  updateBoard(cg, chess, move);
  // The puzzle interaction stops and the solution is shown only when the handicap is exceeded.
  if (state.errorCount > config.handicap) {
    cg.set({ viewOnly: true }); // disable user movement until after puzzle advances
    playUserCorrectMove(cg, chess, cgwrap, delayTime); // Show the correct user move
    playAiMove(cg, chess, cgwrap, delayTime * 2); // Then play the AI's response
  }
}

function promotePopup(cg: Api, chess: Chess, cgwrap: HTMLDivElement, orig: Square, dest: Square): void {
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
    drawArrows(cg, chess);
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
      const move = getLegalPromotion(chess, orig, dest, state.promoteChoice);

      if (move && config.boardMode === 'Puzzle') {
        handleMoveAttempt(cg, chess, cgwrap, delayTime, move.from, move.to, move.san);
      } else if (move && config.boardMode === 'Viewer') {
        handleMoveAttempt(cg, chess, cgwrap, 0, move.from, move.to, move.san);
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
  positionPromoteOverlay(cgwrap);
}

// --- Navigation ---

export function handlePgnState(pgnState: boolean): void {
  state.pgnState = pgnState;
  setButtonsDisabled(['forward'], !pgnState);
}

// --- Initialization ---
export function loadChessgroundBoard(): [Api, Chess, HTMLDivElement] {
  // Load beggining state for pgn
  state.count = 0;
  state.expectedLine = parsedPGN.moves;
  state.expectedMove = state.expectedLine[0];
  const chess = new Chess();
  chess.load(state.ankiFen);
  const cgwrap = document.getElementById('board') as HTMLDivElement;
  const cg: Api = Chessground(cgwrap, cgDefaults);
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
                  handleMoveAttempt(cg, chess, cgwrap, 0, (arrowMove[0].orig as Square), (arrowMove[0].dest as Square), arrowMove[0].san);
                }
              } else { // No arrow was clicked, check if there's only one legal play to this square.
                const allMoves = chess.moves({ verbose: true });
                const movesToSquare = allMoves.filter(move => move.to === key);
                if (movesToSquare.length === 1) {
                  // If only one piece can move to this square, play that move.
                  if (config.boardMode === 'Puzzle') {
                    handleMoveAttempt(cg, chess, cgwrap, delayTime, movesToSquare[0].from, movesToSquare[0].to, movesToSquare[0].san);
                  } else if (config.boardMode === 'Viewer') {
                    handleMoveAttempt(cg, chess, cgwrap, 0, movesToSquare[0].from, movesToSquare[0].to, movesToSquare[0].san);
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
                  handleMoveAttempt(cg, chess, cgwrap, delayTime, (orig as Square), (dest as Square));
                } else if (config.boardMode === 'Viewer') {
                  handleMoveAttempt(cg, chess, cgwrap, 0, (orig as Square), (dest as Square));
                }
              },
            }
         },
         check: chess.inCheck(),
  });
  if (config.boardMode === 'Viewer') {
    drawArrows(cg, chess);
    cg.set({
      premovable: {
        enabled: false
      }
    });
    setButtonsDisabled(['back', 'reset'], true);
  } else if (!chess.isGameOver() && config.flipBoard) {
    playAiMove(cg, chess, cgwrap, delayTime);
  }

  positionPromoteOverlay(cgwrap);
  startPuzzleTimeout(config.timer, cg, cgwrap);
  return [cg, chess, cgwrap];
}
