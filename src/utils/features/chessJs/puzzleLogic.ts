import { Chess, type Move, type Square } from 'chess.js';
import type { Api } from '@lichess-org/chessground/api';
import type { CustomPgnMove, PgnPath } from '$stores/gameStore.svelte.ts';
import { timerStore } from '$stores/timerStore.svelte';
import { userConfig } from '$stores/userConfig.svelte.ts';
import { playSound } from '$features/audio/audio';
import { navigateNextMove } from '$features/pgn/pgnNavigate';
import { getLegalMove, type MoveInput } from './chessFunctions';
import { getContext } from 'svelte';
import { syncBoardVisuals } from '$features/board/boardAnimation';
import type { PgnGameStore } from '$stores/Providers/GameProvider.svelte';

// debounce handler for handliing after event race conditions and wrong move

export let wrongMoveDebounce: number | null = null;

// --- Helper Functions ---

function isSameMove(pgnMove: CustomPgnMove, playedMove: Move): boolean {
  return (
    pgnMove.from === playedMove.from &&
    pgnMove.to === playedMove.to &&
    // chess.js uses lowercase for promotion, PGN often uses uppercase
    (pgnMove.promotion?.toLowerCase() ?? null) ===
    (playedMove.promotion ?? null)
  );
}

function findMatchingPath(
  gameStore: PgnGameStore,
  playedMove: Move,
): PgnPath | null {
  const nextMainPath = navigateNextMove(gameStore.pgnPath);

  // check Root (if at start of game)
  if (gameStore.pgnPath.length === 0) {
    for (const rootMove of gameStore.rootMoves ?? []) {
      if (isSameMove(rootMove, playedMove)) return rootMove.pgnPath;
    }
  }

  const nextMainMove = gameStore.getMoveByPath(nextMainPath);
  if (!nextMainMove) return null;

  // check Main Line
  if (isSameMove(nextMainMove, playedMove)) return nextMainPath;

  // check Variations
  if (nextMainMove.variations?.length) {
    for (const variationLine of nextMainMove.variations) {
      if (isSameMove(variationLine[0], playedMove))
        return variationLine[0].pgnPath;
    }
  }

  return null;
}

// --- Main Handler ---

export function handleUserMove(
  gameStore: PgnGameStore,
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

  // logic: Existing Path vs New Move
  const existingPath = findMatchingPath(gameStore, move);

  if (existingPath) {
    // A) Move exists in PGN (Main line or Variation)
    gameStore.pgnPath = existingPath;

    if (gameStore.boardMode === 'Puzzle') {
      timerStore.extend(userConfig.increment, gameStore.aiDelayTime);
      playAiMove(gameStore, gameStore.aiDelayTime || 300);
    }
  } else {
    // B) Move does not exist in PGN
    if (gameStore.boardMode === 'Viewer') {
      gameStore.addMove(move); // Add to PGN
    } else {
      // Wrong move in Puzzle mode
      syncBoardVisuals(gameStore, gameStore.cg);
      handleWrongMove(gameStore, move);
    }
  }
}

export function playAiMove(gameStore: PgnGameStore, delay: number): void {
  setTimeout(() => {
    gameStore.errorCount = 0;
    const nextMovePathCheck = navigateNextMove(gameStore.pgnPath);
    const nextMove = gameStore.getMoveByPath(nextMovePathCheck);

    // Only play if it's the opponent's turn
    if (nextMove && nextMove.turn === gameStore.opponentColor[0]) {
      const candidates: PgnPath[] = [nextMovePathCheck];

      // If variations exist, add them to candidates
      if (userConfig.acceptVariations && nextMove.variations) {
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

function playUserCorrectMove(gameStore: PgnGameStore, delay: number): void {
  setTimeout(() => {
    gameStore.cg.set({ viewOnly: false }); // will be disabled when user reaches handicap
    timerStore.resume();
    // Make the move without the AI's variation-selection logic
    const nextMovePath = navigateNextMove(gameStore.pgnPath);
    gameStore.pgnPath = nextMovePath;
    playAiMove(gameStore, delay); // then play the AI's response
  }, delay);
}

function handleWrongMove(gameStore: PgnGameStore, move: Move): void {
  gameStore.errorCount++;
  gameStore.cg.set({ fen: move.after });
  gameStore.cg.set({ fen: move.before });
  playSound('error');
  wrongMoveDebounce = setTimeout(() => {
    wrongMoveDebounce = null;
  }, gameStore.aiDelayTime);

  const isFailed = gameStore.errorCount > userConfig.handicap;

  if (isFailed && !userConfig.handicapAdvance) {
    gameStore.cg.set({ viewOnly: true }); // disable user movement until after puzzle advances
    timerStore.pause();
    playUserCorrectMove(gameStore, gameStore.aiDelayTime); // show the correct user move
  }
}
