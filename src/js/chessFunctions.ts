import { Chess, SQUARES, Move, PieceSymbol } from 'chess.js';
import { cg, chess, config, state, parsedPGN, htmlElement, ShapeFilter, shapeArray, CustomPgnMove, CustomShape, btn, setupCgwrap, NagData } from './config';
import { highlightCurrentMove } from './pgnViewer';
import { extendPuzzleTime, puzzleTimeout, startPuzzleTimeout } from './timer';
import { playSound, changeAudio } from './audio';
import { startAnalysis } from './handleStockfish';
import { positionPromoteOverlay } from './initializeUI';
import nags from '../nags.json' assert { type: 'json' };
import type { Color, Key } from 'chessground/types';

// --- Type Definitions ---

interface FindParentResult {
  key: string;
  parent: any;
}

// --- DOM & UI Helpers ---

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
    const cgwrap = await setupCgwrap();
    positionPromoteOverlay(cgwrap);
    cgwrap.classList.remove('timerMode');
  })();
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

// --- Drawing & Shapes ---

function filterShapes(filterKey: ShapeFilter): void {
  let brushesToRemove = shapeArray[filterKey];

  const shouldFilterDrawn = brushesToRemove.includes('userDrawn');
  if (shouldFilterDrawn) brushesToRemove = shapeArray[ShapeFilter.All];

  const filteredShapes = state.chessGroundShapes.filter(shape => {
    const shouldRemove = brushesToRemove.includes(shape.brush!);
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
          parentOfChild = findParentLine(parsedPGN.moves, parentOfChild!.parent);

        };
        expectedLine = parentOfChild!.parent;
        count = parentOfChild!.key as unknown as number;
        expectedMove = expectedLine[count];
      }
    }
    if (parentOfChild?.parent) {
      expectedLine = parentOfChild.parent;
    }
    expectedMove = expectedLine[count];
    if (expectedMove) {
      puzzleMove = chess.undo();
      if (puzzleMove) puzzleMove = puzzleMove.san;
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
      let brushType: string | null = 'altLine';
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
        if (foundNag && (nags as unknown as NagData)[foundNag] && (nags as unknown as NagData)[foundNag][2]) {
          state.chessGroundShapes.push({
            orig: alternateMove.to, // The square to anchor the image to
            brush: 'moveType',
            customSvg: {
              html: `<image href="${(nags as unknown as NagData)[foundNag][2]}" width="40" height="40" />'`,
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
    if (foundNag && (nags as unknown as NagData)[foundNag] && (nags as unknown as NagData)[foundNag][2]) {
      state.chessGroundShapes.push({
        orig: mainMoveAttempt.to, // The square to anchor the image to
        brush: 'moveType',
        customSvg: {
          html: `<image href="${(nags as unknown as NagData)[foundNag][2]}" width="40" height="40" />'`,
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
  setButtonsDisabled(['back', 'reset'], false);
  if (config.boardMode === "Viewer" && state.pgnState && !isEndOfLine()) highlightCurrentMove(state.expectedMove!.pgnPath!);
  startAnalysis(config.analysisTime);
}

function makeMove(move: string | { from: Key; to: Key; promotion?: PieceSymbol }): Move | null {
  const moveResult = chess.move(move);
  if (moveResult) {
    updateBoard(moveResult);
  }
  return moveResult;
}

function puzzlePlay(delay: number | null, orig: Key | CustomShape | Move, dest?: Key | null): void {
  const tempChess = new Chess(chess.fen());
  let tempMove: Move | null = null;
  if (dest && typeof orig === 'string') {
    tempMove = tempChess.move({ from: orig, to: dest, promotion: 'q' });
  } else if (typeof orig === 'object' && orig && 'san' in orig && orig.san) {
    tempMove = tempChess.move(orig.san);
  }
  if (!tempMove) {
    setTimeout(() => { // que after select: event
      state.debounceCheck = false;
    }, 0);
    return
  };
  if (tempMove.flags.includes("p") && delay && dest) {
    promotePopup(tempMove.from, tempMove.to, delay);
  } else {
    checkUserMove(tempMove.san, delay);
  }
}

function handleViewerMove(orig: Key | CustomShape | Move, dest?: Key | null): void {
  const tempChess = new Chess(chess.fen());
  let move: Move | null = null;
  if (dest && typeof orig === 'string') {
    move = tempChess.move({ from: orig, to: dest, promotion: 'q' });
  } else if (typeof orig === 'object' && orig && 'san' in orig && orig.san) {
    move = tempChess.move(orig.san);
  }

  if (!move) return;

  if (move.flags.includes("p") && dest) {
    promotePopup(move.from, move.to, null);
  } else {
    checkUserMove(move.san, null);
    isEndOfLine();
  }
}

function playAiMove(delay: number): void {
  setTimeout(() => {
    if (isEndOfLine()) return;
    state.errorCount = 0;
    if (state.expectedMove!.variations && state.expectedMove!.variations.length > 0 && config.acceptVariations) {
      const moveVar = Math.floor(Math.random() * (state.expectedMove!.variations.length + 1));
      if (moveVar !== state.expectedMove!.variations.length) {
        state.count = 0;
        state.expectedLine = state.expectedMove!.variations[moveVar];
        state.expectedMove = state.expectedLine[0];
      }
    }
    makeMove(state.expectedMove!.notation.notation);
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
    // Make the move without the AI's variation-selection logic
    makeMove(state.expectedMove!.notation.notation);
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
  if (!moveAttempt) return false;

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
    const isBlunder = state.expectedMove?.nag?.some(nags => state.blunderNags.includes(nags));
    if (isBlunder) isPuzzleFailed(true);
    extendPuzzleTime(config.increment);
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
  const promoteButtons = document.querySelectorAll<HTMLButtonElement>("#promoteButtons > button");
  const overlay = document.querySelector<HTMLDivElement>("#overlay");
  promoteButtons.forEach(button => {
    button.onclick = (event: MouseEvent) => {
      // 'event.currentTarget' is the element the listener is attached to
      const clickedButton = event.currentTarget as HTMLButtonElement;

      state.promoteAnimate = false;
      event.stopPropagation();
      state.promoteChoice = clickedButton.value as 'q' | 'r' | 'b' | 'n';

      const tempChess = new Chess(chess.fen());
      const move = tempChess.move({ from: orig, to: dest, promotion: state.promoteChoice });

      if (config.boardMode === 'Puzzle') {
        puzzlePlay(300, move, null);
      } else if (config.boardMode === 'Viewer') {
        handleViewerMove(move, null);
      }
      cancelPopup();
    };
  });

  if (overlay) {
    overlay.onclick = function() {
      cancelPopup();
      setTimeout(() => {
        state.debounceCheck = false;
      }, 0);
    };
  }
  toggleClass('showHide', 'hidden');
  (async () => {
    const cgwrap = await setupCgwrap();
    positionPromoteOverlay(cgwrap);
  })();
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
  setButtonsDisabled(['forward'], !pgnState);
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
            parentOfChild = findParentLine(parsedPGN.moves, parentOfChild!.parent);

          };
          state.expectedLine = parentOfChild!.parent;
          state.count = parentOfChild!.key as unknown as number;
          state.expectedMove = state.expectedLine[state.count];
        }
      }
    }
    const firstMoveCheck = getLastMove(chess);
    if (state.count === 0 && state.ankiFen !== chess.fen()) {
      return;
    } else if (firstMoveCheck && (state.count === 0 || state.expectedLine[state.count - 1]?.notation.notation === firstMoveCheck.san) ) {
      handlePgnState(true);
    }
  }
  drawArrows();
  if (config.boardMode === "Viewer" && !isEndOfLine()) {
    let expectedMove = state.expectedMove;
    let expectedLine = state.expectedLine;
    if (expectedLine[state.count - 1]?.notation?.notation) {
      expectedMove = expectedLine[state.count - 1];
      if (state.count === 0) {
        let parentOfChild = findParentLine(parsedPGN.moves, expectedLine);
        if (parentOfChild) {
          for (var i = 0; i < 2; i++) {
            parentOfChild = findParentLine(parsedPGN.moves, parentOfChild!.parent);

          };
          expectedLine = parentOfChild!.parent;
          const count = parentOfChild!.key as unknown as number;
          expectedMove = expectedLine[count];
        }
      }
      highlightCurrentMove(expectedMove!.pgnPath!);
    } else { // no moves played clear highlight
      document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
      setButtonsDisabled(['back', 'reset'], true);
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
  setButtonsDisabled(['back', 'reset'], false);
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
             setTimeout(() => { // 0ms timout to run thise after "after:" event
               if (state.debounceCheck) return;

               const priority = ['mainLine', 'altLine', 'blunderLine', 'stockfinished', 'stockfish'];
               const arrowMove = state.chessGroundShapes
               .filter(shape => shape.dest === key && shape.brush && priority.includes(shape.brush))
               .sort((a, b) => priority.indexOf(a.brush!) - priority.indexOf(b.brush!));
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
    setButtonsDisabled(['back', 'reset'], true);
  } else if (!chess.isGameOver() && config.flipBoard) {
    playAiMove(300);
  }
  drawArrows();
  (async () => {
    const cgwrap = await setupCgwrap();
    positionPromoteOverlay(cgwrap);
    startPuzzleTimeout(config.timer);
  })();
}
