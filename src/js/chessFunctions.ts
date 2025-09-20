import { Chess, SQUARES, Move, PieceSymbol } from 'chess.js';
import { cg, chess, config, state, parsedPGN, htmlElement, ShapeFilter, shapeArray, CustomPgnMove } from './config';
import { highlightCurrentMove } from './pgnViewer';
import { extendPuzzleTime, startPuzzleTimeout, puzzleTimeout } from './timer';
import { playSound, changeAudio } from './audio';
import { startAnalysis } from './handleStockfish';
import { positionPromoteOverlay } from './initializeUI';
import nags from '../nags.json' assert { type: 'json' };
import type { Color, Key, DrawShape } from 'chessground';

// --- Type Definitions ---
interface NagData {
  [nagKey: string]: [string, string, string?]; // [description, symbol, image_url?]
}

interface FindParentResult {
  key: string;
  parent: any;
}

// --- Module-level Variables ---
export let cgwrap: HTMLDivElement | null = null; // Assigned asynchronously in setupTimer

// --- DOM & UI Helpers ---

function toggleClass(querySelector: string, className: string): void {
  document.querySelectorAll('.' + querySelector).forEach(el => el.classList.toggle(className));
}

function getElement<T extends HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

// --- PGN State & Puzzle Logic ---

function isEndOfLine(): boolean {
  const isEnd = !state.expectedMove || typeof state.expectedMove === 'string';
  if (isEnd) document.querySelector("#navForward").disabled = true;
  return isEnd
}

function handlePuzzleComplete(): void {
  state.puzzleComplete = true;
  if (cgwrap) cgwrap.classList.remove('timerMode');
  htmlElement.style.setProperty('--border-color', state.solvedColour);
  cg.set({
    viewOnly: true
  });
}

function isPuzzleFailed(isFailed: boolean): void {
  if (isFailed) { // manually fail
    state.errorTrack = true;
    state.solvedColour = "#b31010";
    if (config.handicapAdvance) {
      handlePuzzleComplete();
      setTimeout(() => { window.parent.postMessage(state, '*'); }, 300);
    } else {
      window.parent.postMessage(state, '*');
    }
  } else { // correct
    console.log(state.errorTrack)
    state.errorTrack = state.errorTrack ? true : "correct";
    if (config.timer && !config.timerScore && state.errorTrack === "correct" && puzzleTimeout) {
      state.solvedColour = "#2CBFA7";
      state.errorTrack = "correctTime";
    }
    if (config.autoAdvance) {
      setTimeout(() => { window.parent.postMessage(state, '*'); }, 300);
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
    const ms = chess.moves({ square: s as Key, verbose: true });
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
  return allMoves.length > 0 ? allMoves[allMoves.length - 1] : false;
}

// --- Drawing & Shapes ---

function filterShapes(filterKey: ShapeFilter): void {
  let brushesToRemove = shapeArray[filterKey];

  // Check for removing all non custom shapes
  const shouldFilterDrawn = brushesToRemove.includes('userDrawn');
  if (shouldFilterDrawn) brushesToRemove = shapeArray[ShapeFilter.All];

  // Separate the customSvgs from standard brush filters.
  const shouldFilterMoveType = brushesToRemove.includes('moveType');
  const normalBrushesToRemove = brushesToRemove.filter(b => b !== 'moveType');

  const filteredShapes = state.chessGroundShapes.filter(shape => {
    const isNormalBrushMatch = normalBrushesToRemove.includes(shape.brush);
    const isMoveTypeMatch = shouldFilterMoveType && shape.customSvg?.brush === 'moveType';

    const shouldRemove = isNormalBrushMatch || isMoveTypeMatch;
    if (shouldFilterDrawn) {
      return shouldRemove
    } else {
      return !shouldRemove;
    }
  });

  // Assign the new, filtered array back to the state.
  state.chessGroundShapes = filteredShapes;
}

export function drawArrows(redraw?: boolean): void {
  filterShapes(ShapeFilter.Stockfish)
  if (redraw) {
    cg.set({ drawable: { shapes: state.chessGroundShapes } });
    return;
  }
  if (!state.pgnState) {
    state.chessGroundShapes = [];
    return
  }
  filterShapes(ShapeFilter.All);

  if (config.boardMode === 'Puzzle' && config.disableArrows) return;

  let expectedMove = state.expectedMove;
  let expectedLine = state.expectedLine;
  let puzzleMove;
  let count = state.count;
  let parentOfChild;

  if (config.boardMode === 'Puzzle') {
    count--;
    if (count === 0) {
      parentOfChild = findParentLine(parsedPGN.moves, expectedLine);
      if (parentOfChild) {
        for (var i = 0; i < 2; i++) {
          parentOfChild = findParentLine(parsedPGN.moves, parentOfChild.parent);

        };
        expectedLine = parentOfChild.parent;
        count = parentOfChild.key;
        expectedMove = expectedLine[count];
      }
    }
    if (parentOfChild?.parent) {
      expectedLine = parentOfChild.parent;
    }
    expectedMove = expectedLine[count];
    if (expectedMove) {
      puzzleMove = chess.undo().san;
    }
  }

  // --- Arrow Display ---
  if (!expectedMove || typeof expectedMove === 'string') {
    cg.set({ drawable: { shapes: state.chessGroundShapes } }); // Clear any existing arrows
    return;
  }
  // --- Arrow Drawing Logic ---
  const tempChess = new Chess(chess.fen());
  // Draw blue arrows for all variations
  if (expectedMove?.variations) {
    for (const variation of expectedMove.variations) {
      const alternateMove = tempChess.move(variation[0].notation.notation);
      const isBlunder = variation[0].nag?.some(nags => state.blunderNags.includes(nags));
      let brushType = 'altLine';
      if (isBlunder) brushType = 'blunderLine';
      if (isBlunder && config.boardMode === 'Puzzle') brushType = null;
      if (alternateMove && (alternateMove.san !== puzzleMove) && brushType) {
        state.chessGroundShapes.push({
          orig: alternateMove.from,
          dest: alternateMove.to,
          brush: brushType,
          san: alternateMove.san
        });
      } else if (variation[0].nag && (alternateMove.san === puzzleMove)) {
        const foundNag = variation[0].nag?.find(key => key in nags);
        if (foundNag && nags[foundNag] && nags[foundNag][2]) {
          state.chessGroundShapes.push({
            orig: alternateMove.to, // The square to anchor the image to
            customSvg: {
              html: `<image href="${nags[foundNag][2]}" width="40" height="40" />'`,
              brush: 'moveType'
            }
          })
        }
      }
      tempChess.undo(); // Reset for the next variation check
    }
  }


  // Draw the main line's move as a green arrow, ensuring it's on top
  let mainMoveAttempt
  if (tempChess.moves().includes(expectedMove.notation.notation)) {
    mainMoveAttempt = tempChess.move(expectedMove.notation.notation);
  } else {
    mainMoveAttempt = null;
  }
  if (mainMoveAttempt && (mainMoveAttempt.san !== puzzleMove)) {
    state.chessGroundShapes.push({ orig: mainMoveAttempt.from, dest: mainMoveAttempt.to, brush: 'mainLine', san: mainMoveAttempt.san });
  } else if (expectedMove.nag && mainMoveAttempt && (mainMoveAttempt.san === puzzleMove)) {
    const foundNag = expectedMove.nag?.find(key => key in nags);
    if (foundNag && nags[foundNag] && nags[foundNag][2]) {
      state.chessGroundShapes.push({
        orig: mainMoveAttempt.to, // The square to anchor the image to
        customSvg: {
          html: `<image href="${nags[foundNag][2]}" width="40" height="40" />'`,
          brush: 'moveType'
        }
      })
    }
  }

  if (config.boardMode === 'Puzzle' && puzzleMove) {
    chess.move(puzzleMove);
  }
  cg.set({ drawable: { shapes: state.chessGroundShapes } });
}


// --- Board Interaction & Move Handling ---

function updateBoard(move: Move, backwardPromote: boolean = false): void {
  function cancelDefaultAnimation(chessInstance) {
    cg.set({ animation: { enabled: false} })
    cg.set({
      fen: chessInstance.fen(),
    });
    cg.set({ animation: { enabled: true} })
  }
  if (!state.pgnState) {
    state.chessGroundShapes = [];
  }
  state.lastMove = getLastMove(chess).san;
  if (state.pgnState && state.lastMove === state.expectedMove?.notation.notation ) {
    state.pgnPath = state.expectedMove.pgnPath;
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
  } else if (move.flags.includes("e") && state.debounceCheck) {
    cancelDefaultAnimation(chess)
    cg.set({
      fen: chess.fen(),
    });
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
  document.querySelector("#navBackward").disabled = false;
  document.querySelector("#resetBoard").disabled = false;
  if (config.boardMode === "Viewer" && state.pgnState && !isEndOfLine()) highlightCurrentMove(state.expectedMove.pgnPath);
  startAnalysis(config.analysisTime);
}

function makeMove(move: string | { from: Key; to: Key; promotion?: PieceSymbol }): Move | null {
  const moveResult = chess.move(move);
  if (moveResult) {
    updateBoard(moveResult);
  }
  return moveResult;
}

function puzzlePlay(delay: number, orig: Key | { san: string }, dest?: Key): void {
  const tempChess = new Chess(chess.fen());
  let tempMove = false;
  if (dest) {
    tempMove = tempChess.move({ from: orig, to: dest, promotion: 'q' });
  } else {
    tempMove = tempChess.move(orig.san);
  }
  if (!tempMove) {
    setTimeout(() => { // que after select: event
      state.debounceCheck = false;
    }, 0);
    return
  };
  if (tempMove.flags.includes("p") && delay && dest) {
    promotePopup(orig, dest, delay);
  } else {
    checkUserMove(tempMove.san, delay);
  }
}

function handleViewerMove(orig: Key | { san: string }, dest?: Key): void {
  const tempChess = new Chess(chess.fen());
  const move = typeof orig === 'string'
  ? tempChess.move({ from: orig, to: dest!, promotion: 'q' })
  : tempChess.move(orig.san);

  if (!move) return;

  if (move.flags.includes("p") && dest) {
    promotePopup(orig as Key, dest, null);
  } else {
    checkUserMove(move.san, null);
    isEndOfLine();
  }
}

function playAiMove(delay: number): void {
  setTimeout(() => {
    if (isEndOfLine()) return;
    state.errorCount = 0;
    if (state.expectedMove.variations && state.expectedMove.variations.length > 0 && config.acceptVariations) {
      const moveVar = Math.floor(Math.random() * (state.expectedMove.variations.length + 1));
      if (moveVar !== state.expectedMove.variations.length) {
        state.count = 0;
        state.expectedLine = state.expectedMove.variations[moveVar];
        state.expectedMove = state.expectedLine[0];
      }
    }
    makeMove(state.expectedMove.notation.notation);
    state.count++;
    state.expectedMove = state.expectedLine[state.count];

    if (isEndOfLine()) isPuzzleFailed(false);

    drawArrows(true);
    state.debounceCheck = false;
  }, delay);
}
function playUserCorrectMove(delay: number): void {
  setTimeout(() => {
    cg.set({ viewOnly: false }); // will be disabled when user reaches handicap
    if (isEndOfLine()) return;
    // Make the move without the AI's variation-selection logic
    makeMove(state.expectedMove.notation.notation);
    state.count++;
    state.expectedMove = state.expectedLine[state.count];
    if (isEndOfLine()) {
      handlePuzzleComplete();
      setTimeout(() => { window.parent.postMessage(state, '*'); }, 300);
    }
  }, delay);
}

function handleWrongMove(move: Move): void {
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
    playUserCorrectMove(300); // Show the correct user move
    playAiMove(600); // Then play the AI's response
    setTimeout(() => { // que after select: event
      state.debounceCheck = false;
    }, 0);
  } else {
    setTimeout(() => { // que after select: event
      state.debounceCheck = false;
    }, 0);
  }
}


function checkUserMove(moveSan: string, delay: number | null): boolean {
  const tempChess = new Chess(chess.fen());
  const moveAttempt = tempChess.move(moveSan);

  if (!moveAttempt) return;

  let foundVariation = false;
  if (state.expectedMove?.notation.notation === moveAttempt.san && state.pgnState) {
    foundVariation = true;
  } else if (state.expectedMove?.variations && config.acceptVariations && state.pgnState) {
    for (let i = 0; i < state.expectedMove.variations.length; i++) {
      if (moveAttempt.san === state.expectedMove.variations[i][0].notation.notation) {
        state.count = 0;
        state.expectedLine = state.expectedMove.variations[i];
        state.expectedMove = state.expectedLine[state.count];
        foundVariation = true;
        break;
      }
    }
  }
  if (foundVariation) {
    const isBlunder = state.expectedMove.nag?.some(nags => state.blunderNags.includes(nags));
    if (isBlunder) isPuzzleFailed(true);
    extendPuzzleTime(cgwrap, config.increment);
    makeMove(moveAttempt);
    state.count++;
    state.expectedMove = state.expectedLine[state.count];
    if (state.expectedMove && delay) {
      playAiMove(delay);
    } else if (delay) {
      isPuzzleFailed(false)
    }
    drawArrows();
  } else if (delay) {
    handleWrongMove(moveAttempt);
    drawArrows(true);
  } else if (!delay) { // no delay passed from viewer mode
    handlePgnState(false);
    makeMove(moveAttempt);
  }
  return foundVariation
}


function promotePopup(orig: Key, dest: Key, delay: number | null): void {
  const cancelPopup = function(){
    state.promoteAnimate = true;
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
  const promoteButtons = document.querySelectorAll("#promoteButtons > button");
  const overlay = document.querySelector("#overlay");
  for (var i=0; i<promoteButtons.length; i++){
    promoteButtons[i].onclick = function(){
      state.promoteAnimate = false
      event.stopPropagation();
      state.promoteChoice=this.value;
      const tempChess = new Chess(chess.fen());
      const move = tempChess.move({ from: orig, to: dest, promotion: state.promoteChoice} );
      if (config.boardMode === 'Puzzle') {
        puzzlePlay(300, move, null);
      } else if (config.boardMode === 'Viewer') {
        handleViewerMove(move, null);
      }
      cancelPopup();
    }
    overlay.onclick = function() {
      cancelPopup();
      setTimeout(() => { // que after select: event
        state.debounceCheck = false;
      }, 0);
    }
  }
  toggleClass('showHide', 'hidden');
  positionPromoteOverlay();
}

function findParentLine(obj: any, targetChild: CustomPgnMove[]): FindParentResult | null {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (typeof value === 'object' && value !== null) {
        if (value === targetChild) {
          return {
            key: key,
            parent: obj // This is the direct parent
          };
        }
        const foundParent = findParentLine(value, targetChild);
        if (foundParent) {
          return foundParent;
        }
      }
    }
  }
  return null;
};
// --- Navigation ---

function handlePgnState(pgnState: boolean): void {
  state.pgnState = pgnState;
  const forwardButton = getElement<HTMLButtonElement>("#navForward");
  if (forwardButton) forwardButton.disabled = !pgnState;
}

export function navBackward(): void {

  if (config.boardMode === 'Puzzle') return;
  const lastMove = chess.undo();
  if (lastMove) {
    updateBoard(lastMove, true)
    if (state.expectedLine[state.count - 1]?.notation?.notation === lastMove.san) {
      state.count--
      state.expectedMove = state.expectedLine[state.count];
      if (state.count === 0) {
        let parentOfChild = findParentLine(parsedPGN.moves, state.expectedLine);
        if (parentOfChild) {
          for (var i = 0; i < 2; i++) {
            parentOfChild = findParentLine(parsedPGN.moves, parentOfChild.parent);

          };
          state.expectedLine = parentOfChild.parent;
          state.count = parentOfChild.key;
          state.expectedMove = state.expectedLine[state.count];
        }
      }
    }
    if (state.count === 0 && state.ankiFen !== chess.fen()) {
      return;
    } else if (state.count === 0 || state.expectedLine[state.count - 1]?.notation.notation === getLastMove(chess).san) {
      handlePgnState(true);
    }
  }
  drawArrows();
  if (config.boardMode === "Viewer") {
    let expectedMove = state.expectedMove;
    let expectedLine = state.expectedLine;
    if (expectedLine[state.count - 1]?.notation?.notation) {
      expectedMove = expectedLine[state.count - 1];
      if (state.count === 0) {
        let parentOfChild = findParentLine(parsedPGN.moves, expectedLine);
        if (parentOfChild) {
          for (var i = 0; i < 2; i++) {
            parentOfChild = findParentLine(parsedPGN.moves, parentOfChild.parent);

          };
          expectedLine = parentOfChild.parent;
          const count = parentOfChild.key;
          expectedMove = expectedLine[count];
        }
      }
      highlightCurrentMove(expectedMove.pgnPath);
    } else { // no moves played clear highlight
      document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
      document.querySelectorAll('#navBackward, #resetBoard').forEach(el => el.disabled = true);
    }
  }
  startAnalysis(config.analysisTime);
}

export function navForward(): void {
  if (config.boardMode === 'Puzzle' || !state.pgnState || !state.expectedMove?.notation) return;
  const tempChess = new Chess(chess.fen());
  const move = tempChess.move(state.expectedMove?.notation?.notation);
  if (move) {
    puzzlePlay(null, move.from, move.to);
  }
  isEndOfLine();
  document.querySelector("#navBackward").disabled = false;
  document.querySelector("#resetBoard").disabled = false;
}

// --- Board Actions ---

export function rotateBoard(): void {
  state.boardRotation = (state.boardRotation === 'white') ? 'black' : 'white';
  cg.set({ orientation: state.boardRotation });
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
  document.querySelector("#navBackward").disabled = true;
  document.querySelector("#resetBoard").disabled = true;
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

async function setupTimer(): Promise<void> {
  const element = await waitForElement('.cg-wrap');
  cgwrap = element as HTMLElement;
  if (config.timer) {
    startPuzzleTimeout(config.timer);
  }
}

function waitForElement<T extends Element>(selector: string): Promise<T> {
  return new Promise(resolve => {
    const element = document.querySelector<T>(selector);
    if (element) {
      return resolve(element);
    }
    const observer = new MutationObserver(() => {
      const element = document.querySelector<T>(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}


export function reload(): void {
  // Load beggining state for pgn
  state.count = 0;
  state.expectedLine = parsedPGN.moves;
  state.expectedMove = state.expectedLine[0];
  chess.load(state.ankiFen);

  cg.set({
    fen: state.ankiFen,
    orientation: config.randomOrientation ? ['black', 'white'][Math.floor(Math.random() * 2)] : state.playerColour,
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
             setTimeout(() => { // 0ms timout to run thise after "after:" event
               if (state.debounceCheck) return;

               const priority = ['mainLine', 'altLine', 'blunderLine', 'stockfinished', 'stockfish'];
               const arrowMove = state.chessGroundShapes
               .filter(shape => shape.dest === key && priority.includes(shape.brush))
               .sort((a, b) => priority.indexOf(a.brush) - priority.indexOf(b.brush));
               if (arrowMove.length > 0 && config.boardMode === 'Viewer') {
                 // If the user clicks on a Stockfish-generated move, they are deviating from the PGN.
                 if (arrowMove[0].brush === 'stockfish' || arrowMove[0].brush === 'stockfinished') {
                   handlePgnState(false);
                 }
                 handleViewerMove(arrowMove[0], null);
               } else { // No arrow was clicked, check if there's only one legal play to this square.
                 const allMoves = chess.moves({ verbose: true });
                 const movesToSquare = allMoves.filter(move => move.to === key);
                 if (movesToSquare.length === 1) {
                   // If only one piece can move to this square, play that move.
                   if (config.boardMode === 'Puzzle') {
                     puzzlePlay(300, movesToSquare[0], null);
                   } else if (config.boardMode === 'Viewer') {
                     handleViewerMove(movesToSquare[0], null);
                   }
                 }
               }
             }, 0);
           },
         },
         movable: {
            color: config.boardMode === 'Puzzle' ? state.playerColour : toColor(chess),
            dests: toDests(chess),
            events: {
              after: (orig, dest) => {
                state.debounceCheck = true;
                if (config.boardMode === 'Puzzle') {
                  puzzlePlay(300, orig, dest);
                } else {
                  // Viewer mode
                  handleViewerMove(orig, dest);
                  setTimeout(() => { // que after select: event
                    state.debounceCheck = false;
                  }, 0);
                }
              },
            }
         },
         check: chess.inCheck(),
  });
  if (config.boardMode === 'Viewer') {
    cg.set({
      premovable: {
        enabled: false
      }
    });
    document.querySelector("#navBackward").disabled = true;
    document.querySelector("#resetBoard").disabled = true;
  } else if (!chess.isGameOver() && config.flipBoard) {
    playAiMove(300);
  }
  drawArrows();
  setupTimer()

}
