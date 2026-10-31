import type { Move, Square } from 'chess.js';
import type { CustomPgnMove, PgnPath } from '$Types/ChessStructs';
import type { GameStore } from '$stores/gameStore.svelte';
import { playSound } from '$features/audio/audio';
import { navigateNextMove } from '$features/pgn/pgnNavigate';
import { getLegalMove, type MoveInput } from './chessFunctions';

// --- Helper Functions ---

function isSameMove(pgnMove: CustomPgnMove, playedMove: Move): boolean {
  return (
    pgnMove.from === playedMove.from &&
    pgnMove.to === playedMove.to &&
    // chess.js uses lowercase for promotion, PGN often uses uppercase
    (pgnMove.promotion?.toLowerCase() ?? null) === (playedMove.promotion ?? null)
  );
}

function findMatchingPath(store: GameStore, playedMove: Move): PgnPath | null {
  const nextMainPath = navigateNextMove(store.pgnPath);

  const nextMainMove = store.getMoveByPath(nextMainPath);
  if (!nextMainMove) return null;

  // A) Check Main Line
  if (isSameMove(nextMainMove, playedMove)) return nextMainPath;

  // B) Check Variation Lines
  const isVariations = nextMainMove.variations?.length;
  const isPuzzle = /^(Puzzle|Study)$/.test(store.boardMode);
  const rejectVariations = isPuzzle && !store.config.acceptVariations;
  // acceptVariations?
  if (rejectVariations || !isVariations) return null;

  // Loop through Variations
  for (const variationLine of nextMainMove.variations) {
    if (isSameMove(variationLine[0], playedMove)) return variationLine[0].pgnPath;
  }

  return null;
}

// --- Main Handler ---

export async function handleUserMove(
  store: GameStore,
  orig: Square,
  dest: Square,
  san?: string,
  promotionRole?: string,
) {
  // Clear any existing wrong move highlight on new attempt
  store.wrongMove = null;

  let moveObject: string | MoveInput;
  moveObject = promotionRole
    ? { from: orig, to: dest, promotion: promotionRole }
    : { from: orig, to: dest };
  const move = getLegalMove(san ?? moveObject, store.fen);

  if (!move) return;

  if (store.boardMode === 'AI') {
    store.addMove(move);

    if (store.isGameOver) return;

    // Trigger AI Response
    try {
      const bestMoveSan = await store.engineStore.requestMove(store.fen);
      if (store.boardMode !== 'AI') return;
      // Play AI Move
      const aiMove = getLegalMove(bestMoveSan, store.fen); // Validate SAN
      if (aiMove) {
        store.setTrackedTimeout(() => {
          !!getLegalMove(bestMoveSan, store.fen) && store.addMove(aiMove);
        }, store.aiDelayTime || 300);
      }
    } catch (e) {
      console.error('AI failed to move', e);
    }
  } else {
    // logic: Existing Path vs New Move
    const existingPath = findMatchingPath(store, move);

    if (existingPath) {
      // A) Move exists in PGN (Main line or Variation)
      store.pgnPath = existingPath;
      checkPuzzleComplete(store);
      store.timerStore.extend(store.config.increment, store.aiDelayTime);
      if (store.boardMode === 'Puzzle') {
        playAiMove(store, store.aiDelayTime || 300);
      }
    } else {
      // B) Move does not exist in PGN
      if (store.boardMode === 'Viewer') {
        store.addMove(move); // Add to PGN
      } else {
        // Wrong move in Puzzle mode
        handleWrongMove(store, move);
      }
    }
  }
}

export function playAiMove(store: GameStore, delay: number): void {
  store.setTrackedTimeout(() => {
    // Clear any existing wrong move highlight
    store.wrongMove = null;
    store.errorCount = 0;
    const nextMovePathCheck = navigateNextMove(store.pgnPath);

    const nextMove = store.getMoveByPath(nextMovePathCheck);
    // Only play if it's the opponent's turn
    if (nextMove && nextMove.turn === store.opponentColor[0]) {
      const candidates: PgnPath[] = [nextMovePathCheck];

      // If variations exist, add them to candidates
      if (store.config.acceptVariations && nextMove.variations) {
        nextMove.variations.forEach((variation: CustomPgnMove[]) => {
          candidates.push(variation[0].pgnPath);
        });
      }

      // Pick random continuation
      const randomIndex = Math.floor(Math.random() * candidates.length);
      store.pgnPath = candidates[randomIndex];
    }
    checkPuzzleComplete(store);
  }, delay);
}

function playUserCorrectMove(store: GameStore, delay: number): void {
  // disable interaction until player move is made
  // Clear any existing wrong move highlight
  store.wrongMove = null;
  store.setTrackedTimeout(() => {
    store.errorCount = 0;
    // Make the move without the AI's variation-selection logic
    const nextMovePath = navigateNextMove(store.pgnPath);
    store.pgnPath = nextMovePath;
    if (store.boardMode === 'Puzzle') {
      playAiMove(store, delay); // then play the AI's response
    }
    checkPuzzleComplete(store);
  }, delay);
}

function handleWrongMove(store: GameStore, move: Move): void {

  store.errorCount++;
  store.hasMadeMistake = true;
  // Track the wrong move
  store.wrongMove = { from: move.from, to: move.to };
  playSound('error');
  const isFailed = store.errorCount > store.config.handicap;

  if (store.config.refutation) {
    store.customAnimation({ preFen: move.after, animate: true });
    showRefutation(store, move).then(() => {
      if (isFailed) playUserCorrectMove(store, store.config.animationTime); // show the correct user move
    });
    return;
  }

  store.customAnimation({ preFen: move.after, animate: true, postFen: move.before });
  if (isFailed) {
    playUserCorrectMove(store, store.config.animationTime * 2); // show the correct user move
  }
}

// --- Refutation ---

// How long the punishing reply stays on the board
const REFUTATION_HOLD = 1200;

const pause = (store: GameStore, ms: number) =>
  new Promise<void>((resolve) => store.setTrackedTimeout(resolve, ms));

// The PGN's reply to the wrong move, when it is a variation there with a continuation
function authorReply(store: GameStore, wrongMove: Move): Move | null {
  const nextMainMove = store.getMoveByPath(navigateNextMove(store.pgnPath));
  for (const variationLine of nextMainMove?.variations ?? []) {
    const reply = variationLine[1];
    if (reply && isSameMove(variationLine[0], wrongMove)) {
      return getLegalMove(reply.san, wrongMove.after);
    }
  }
  return null;
}

async function engineReply(store: GameStore, fen: string): Promise<Move | null> {
  const bestMoveUci = await store.engineStore.requestBestMove(fen);
  return bestMoveUci ? getLegalMove(bestMoveUci, fen) : null;
}

/*
 * After a wrong move: the reply that punishes it (the PGN's, else Stockfish's), then the move is
 * taken back. The board is locked and the puzzle clock stopped meanwhile.
 */
async function showRefutation(store: GameStore, move: Move): Promise<void> {
  const pathKey = store.currentPathKey;
  store.isRefuting = true;
  store.setMoveDebounce(60_000); // stops the clock until setMoveDebounce(0) below

  const [reply] = await Promise.all([
    authorReply(store, move) ?? engineReply(store, move.after),
    pause(store, store.config.animationTime + 150), // the wrong move lands first
  ]);

  if (reply && store.currentPathKey === pathKey) {
    store.refutation = { from: reply.from, to: reply.to };
    store.customAnimation({ preFen: reply.after, animate: true });
    playSound(reply.captured ? 'capture' : 'move');
    await pause(store, REFUTATION_HOLD);
  }

  store.refutation = null;
  store.isRefuting = false;
  store.customAnimation({ preFen: store.fen, animate: true });
  store.setMoveDebounce(0);
}

function checkPuzzleComplete(store: GameStore): void {
  const puzzleComplete = store.isPuzzleComplete;
  if (puzzleComplete) {
    store.cg?.selectSquare(null, true);
    store.timerStore.stop();
  }
}
