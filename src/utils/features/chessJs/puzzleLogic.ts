import type { Move, Square } from 'chess.js';
import type { CustomPgnMove, PgnPath } from '$Types/ChessStructs';
import type { IPgnGameStore } from '$Types/StoreInterfaces';
import { timerStore } from '$stores/timerStore.svelte';
import { userConfig } from '$stores/userConfig.svelte';
import { playSound } from '$features/audio/audio';
import { navigateNextMove } from '$features/pgn/pgnNavigate';
import { getLegalMove, type MoveInput } from './chessFunctions';
import { engineStore } from '$stores/engineStore.svelte';

// --- Helper Functions ---

function isSameMove(pgnMove: CustomPgnMove, playedMove: Move): boolean {
  return (
    pgnMove.from === playedMove.from &&
    pgnMove.to === playedMove.to &&
    // chess.js uses lowercase for promotion, PGN often uses uppercase
    (pgnMove.promotion?.toLowerCase() ?? null) === (playedMove.promotion ?? null)
  );
}

function findMatchingPath(gameStore: IPgnGameStore, playedMove: Move): PgnPath | null {
  const nextMainPath = navigateNextMove(gameStore.pgnPath);

  const nextMainMove = gameStore.getMoveByPath(nextMainPath);
  if (!nextMainMove) return null;

  // check Main Line
  if (isSameMove(nextMainMove, playedMove)) return nextMainPath;

  if (gameStore.boardMode === 'Puzzle' && !userConfig.opts.acceptVariations) return null;

  // check Variations
  if (nextMainMove.variations?.length) {
    for (const variationLine of nextMainMove.variations) {
      if (isSameMove(variationLine[0], playedMove)) return variationLine[0].pgnPath;
    }
  }

  return null;
}

// --- Main Handler ---

export async function handleUserMove(
  gameStore: IPgnGameStore,
  orig: Square,
  dest: Square,
  san?: string,
  promotionRole?: string,
): void {
  let moveObject: string | MoveInput;
  moveObject = promotionRole
    ? { from: orig, to: dest, promotion: promotionRole }
    : { from: orig, to: dest };
  const move = getLegalMove(san ?? moveObject, gameStore.fen);

  if (!move) {
    gameStore.pgnPath = [...gameStore.pgnPath]; // Trigger re-render to snap piece back
    return;
  }

  if (gameStore.boardMode === 'AI') {

    gameStore.addMove(move);

    if (gameStore.isGameOver) return;

    // Trigger AI Response
    try {
      const bestMoveSan = await engineStore.requestMove(gameStore.fen, 2500);

      // Play AI Move
      const aiMove = getLegalMove(bestMoveSan, gameStore.fen); // Validate SAN
      if (aiMove) {
        gameStore.addMove(aiMove);
      }
    } catch (e) {
      console.error("AI failed to move", e);
    }

  } else {

  // logic: Existing Path vs New Move
  const existingPath = findMatchingPath(gameStore, move);

  if (existingPath) {
    // A) Move exists in PGN (Main line or Variation)
    gameStore.pgnPath = existingPath;

    if (gameStore.boardMode === 'Puzzle') {
      timerStore.extend(userConfig.opts.increment, gameStore.aiDelayTime);
      playAiMove(gameStore, gameStore.aiDelayTime || 300);
    }
  } else {
    // B) Move does not exist in PGN
    if (gameStore.boardMode === 'Viewer') {
      gameStore.addMove(move); // Add to PGN
    } else {
      // Wrong move in Puzzle mode
      handleWrongMove(gameStore, move);
    }
  }
  }
}

export function playAiMove(gameStore: IPgnGameStore, delay: number): void {
  setTimeout(() => {
    gameStore.errorCount = 0;
    const nextMovePathCheck = navigateNextMove(gameStore.pgnPath);
    const nextMove = gameStore.getMoveByPath(nextMovePathCheck);

    // Only play if it's the opponent's turn
    if (nextMove && nextMove.turn === gameStore.opponentColor[0]) {
      const candidates: PgnPath[] = [nextMovePathCheck];

      // If variations exist, add them to candidates
      if (userConfig.opts.acceptVariations && nextMove.variations) {
        nextMove.variations.forEach((variation: CustomPgnMove[]) => {
          candidates.push(variation[0].pgnPath);
        });
      }

      // Pick random continuation
      const randomIndex = Math.floor(Math.random() * candidates.length);
      gameStore.pgnPath = candidates[randomIndex];
    }
  }, delay);
}

function playUserCorrectMove(gameStore: IPgnGameStore, delay: number): void {
  // disable interaction until player move is made
  gameStore.setMoveDebounce();
  setTimeout(() => {
    // Make the move without the AI's variation-selection logic
    const nextMovePath = navigateNextMove(gameStore.pgnPath);
    gameStore.pgnPath = nextMovePath;
    if (gameStore.boardMode === 'Puzzle') {
      playAiMove(gameStore, delay); // then play the AI's response
    }
  }, delay);
}

function handleWrongMove(gameStore: IPgnGameStore, move: Move): void {
  if (!gameStore.cg) return;
  gameStore.errorCount++;
  gameStore.customAnimation = { fen: move.after, animate: true };
  playSound('error');
  const isFailed = gameStore.errorCount > userConfig.opts.handicap;

  if (isFailed) {
    playUserCorrectMove(gameStore, gameStore.aiDelayTime); // show the correct user move
  }
}
