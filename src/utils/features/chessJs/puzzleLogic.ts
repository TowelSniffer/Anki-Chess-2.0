import type { Move, Square } from 'chess.js';
import type { CustomPgnMove, PgnPath } from '$Types/ChessStructs';
import type { IPgnGameStore } from '$Types/StoreInterfaces';
import { playSound } from '$features/audio/audio';
import { navigateNextMove } from '$features/pgn/pgnNavigate';
import { getLegalMove, type MoveInput } from './chessFunctions';

// --- Timeout Management ---
const activeTimeouts = new Set<ReturnType<typeof setTimeout>>();

function setTrackedTimeout(callback: () => void, delay: number) {
  const id = setTimeout(() => {
    activeTimeouts.delete(id);
    callback();
  }, delay);
  activeTimeouts.add(id);
}

export function destroyPuzzleTimeouts() {
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts.clear();
}

// --- Helper Functions ---

function isSameMove(pgnMove: CustomPgnMove, playedMove: Move): boolean {
  return (
    pgnMove.from === playedMove.from &&
    pgnMove.to === playedMove.to &&
    // chess.js uses lowercase for promotion, PGN often uses uppercase
    (pgnMove.promotion?.toLowerCase() ?? null) === (playedMove.promotion ?? null)
  );
}

function findMatchingPath(store: IPgnGameStore, playedMove: Move): PgnPath | null {
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
  store: IPgnGameStore,
  orig: Square,
  dest: Square,
  san?: string,
  promotionRole?: string,
) {
  let moveObject: string | MoveInput;
  moveObject = promotionRole
    ? { from: orig, to: dest, promotion: promotionRole }
    : { from: orig, to: dest };
  const move = getLegalMove(san ?? moveObject, store.fen);

  if (!move) {
    store.pgnPath = [...store.pgnPath]; // Trigger re-render to snap piece back
    return;
  }

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
        setTrackedTimeout(() => {
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

export function playAiMove(store: IPgnGameStore, delay: number): void {
  setTrackedTimeout(() => {
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
  }, delay);
}

function playUserCorrectMove(store: IPgnGameStore, delay: number): void {
  // disable interaction until player move is made
  store.setMoveDebounce();
  setTrackedTimeout(() => {
    // Make the move without the AI's variation-selection logic
    const nextMovePath = navigateNextMove(store.pgnPath);
    store.pgnPath = nextMovePath;
    if (store.boardMode === 'Puzzle') {
      playAiMove(store, delay); // then play the AI's response
    }
  }, delay);
}

function handleWrongMove(store: IPgnGameStore, move: Move): void {
  if (!store.cg) return;
  store.errorCount++;
  store.customAnimation = { fen: move.after, animate: true };
  playSound('error');
  const isFailed = store.errorCount > store.config.handicap;

  if (isFailed) {
    playUserCorrectMove(store, store.config.animationTime * 2); // show the correct user move
  }
}
