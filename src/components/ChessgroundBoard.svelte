<script lang="ts">
  import { onMount } from 'svelte';
  import '@lichess-org/chessground/assets/chessground.base.css';
  import type { Key } from '@lichess-org/chessground/types';
  import '$scss/_components/_chessground.scss';
  import { loadBoard } from '$stores/cgInstance';
  import {
    type PgnPath,
    type CustomPgnMove,
  } from '$stores/gameStore.svelte.ts';
  import { userConfig } from '$stores/userConfig.svelte.ts';
  import { engineStore } from '$stores/engineStore.svelte';
  import { timerStore } from '$stores/timerStore.svelte';
  import { updateBoard } from '$features/board/boardAnimation';
  import { playAiMove } from '$features/chessJs/puzzleLogic';
  import { getContext } from 'svelte';
  import { spring } from 'svelte/motion';
  import type { PgnGameStore } from '$stores/Providers/GameProvider.svelte';

  const gameStore = getContext<PgnGameStore>('GAME_STORE');
  let previousPath: PgnPath | null = null;

  let boardContainer: HTMLDivElement;
  onMount(() => {
    if (boardContainer) {
      timerStore.isRunning = false;
      timerStore.isOutOfTime = false;
      if (gameStore.boardMode === 'Viewer') {
        if (userConfig.flipBoard) {
          gameStore.next();
        }
      } else {
        engineStore.enabled = false;
      }
      gameStore.cg = loadBoard(boardContainer, gameStore);

      boardContainer.focus();
      if (gameStore.boardMode === 'Puzzle') {
        if (userConfig.timer) timerStore.start();
        if (userConfig.flipBoard) playAiMove(gameStore);
      } else {
        timerStore.stop();
      }
    }
  });

  const SCORE_COLORS = {
    incorrect: 'var(--status-error)',
    correct: 'var(--status-correct)',
    perfect: 'var(--status-perfect)',
  };

  // --- DERIVATIONS ---

  // --- Chessground Config ---

  const boardConfig = $derived({
    orientation: gameStore.orientation,
    viewOnly: gameStore.isPuzzleComplete,
    movable: {
      showDests: userConfig.showDests,
    },
    drawable: {
      // If hiding shapes (player thinking), send empty array.
      // Otherwise, show system shapes (engine lines, etc).
      autoShapes: gameStore.systemShapes,
    },
  });

  // --- Border Color ---
  const boardBorderColor = $derived.by(() => {
    // If we are in Puzzle mode and it's NOT done, keep it neutral/player color
    if (gameStore.boardMode === 'Puzzle' && !gameStore.isPuzzleComplete) {
      return gameStore.playerColor;
    }

    // If done, show the score color
    if (gameStore.puzzleScore) {
      return SCORE_COLORS[gameStore.puzzleScore];
    }

    // Default fallback
    return gameStore.playerColor;
  });

  // --- Interactive Border ---

  // A) Analysis Centipawn:
  const barTopColor = $derived(
    gameStore.orientation === 'white' ? 'black' : 'white',
  );

  const barBottomColor = $derived(
    gameStore.orientation === 'white' ? 'white' : 'black',
  );

  const dividerSpring = spring(gameStore.boardMode === 'Puzzle' ? 0 : 50, {
    stiffness: 0.1,
    damping: 0.5,
  });

  let cachedEval = 50;
  const visualDivider = $derived.by(() => {
    if (timerStore.visible) {
      return timerStore.percent;
    } else if (!engineStore.enabled) {
      return null;
    }

    // Find the best analysis line (id: 1)
    const bestLine = engineStore.analysisLines.find((l) => l.id === 1);

    // default to draw (ie stalemate)
    let gameScore = cachedEval;

    // check if either no valid lines or race condition with fen change
    if (!bestLine) {
      if (gameStore.isDraw) {
        gameScore = 50;
      } else if (gameStore.isCheckmate) {
        gameScore = gameStore.turn === 'w' ? 0 : 100;
      }
    }

    // Extract win chance (0-100 for White).
    // If the engine is thinking, default to last score.
    cachedEval = bestLine ? bestLine.winChance : gameScore;

    // Calculate based on board orientation
    // If Top is White: Return White %.
    // If Top is Black: Return Black % (100 - White %).
    if (barTopColor === 'white') {
      return cachedEval;
    } else {
      return 100 - cachedEval;
    }
  });

  // --- REACTIVE LOGIC ---

  // Sync the Spring to derived visualDivider
  $effect(() => {
    if (visualDivider === null) return;
    dividerSpring.set(visualDivider);
  });

  // INITIAL CG CONFIG
  $effect(() => {
    // Only run if board exists
    if (!gameStore.cg) return;

    // Apply the entire config in one efficient call
    gameStore.cg.set(boardConfig);
  });

  // Handle Puzzle Completion Side-Effects (Timer/Drag cancel)
  $effect(() => {
    if (gameStore.isPuzzleComplete) {
      gameStore.cg?.cancelMove();
      timerStore.stop();
    }
  });

  // Move & Board Animations (Requires updateBoard logic)
  $effect(() => {
    if (!gameStore?.cg) return;
    updateBoard(gameStore, gameStore.cg, previousPath);
    previousPath = [...gameStore.pgnPath];
  });

  // Engine Analysis Trigger
  $effect(() => {
    if (engineStore.enabled) {
      engineStore.analyze(gameStore.fen);
    }
  });

  // BORDER FLASH FIXME type for flash colours
  let flashState = $state<null | string>(null);
  let lastErrorCount = 0; // To track changes, not just values

  // A) : Handle Mistakes (Flash Red)
  $effect(() => {
    // Determine if error count increased
    if (gameStore.errorCount > lastErrorCount) {
      triggerFlash('incorrect');
    }
    lastErrorCount = gameStore.errorCount;
  });
  // B) : Handle Timeout (Flash Red)
  $effect(() => {
    if (timerStore.isOutOfTime) {
      triggerFlash('incorrect');
    }
  });
  // C) : Handle Puzzle Complete flash
  $effect(() => {
    if (gameStore.isPuzzleComplete && gameStore.puzzleScore) {
      triggerFlash(gameStore.puzzleScore);
    }
  });

  // SESSION STORAGE
  $effect(() => {
    if (gameStore.boardMode === 'Puzzle' && gameStore.puzzleScore)
      sessionStorage.setItem('chess_puzzle_score', gameStore.puzzleScore);
  });

  /*
   ** --- Helper Functions ---
   */

  // trigger CSS animation replay
  function triggerFlash(type: string) {
    flashState = null; // reset to force reflow if needed
    requestAnimationFrame(() => {
      flashState = type;
    });
  }

  function handlePointerDown(): void {
    if (!gameStore || !gameStore.cg) return;
    if (gameStore.cg.state.selected !== 'a0') {
      gameStore.selectedPiece = gameStore.cg.state.selected;
    }
  }

  function handleWheel(e: WheelEvent): void {
    // e.preventDefault();
    if (e.deltaY < 0) {
      // Scroll Up
      gameStore.next();
    } else {
      // Scroll Down
      gameStore.prev();
    }
  }
</script>

<div
  id="board"
  bind:this={boardContainer}
  onpointerdown={handlePointerDown}
  onwheel={gameStore.boardMode === 'Viewer' ? handleWheel : null}
  onanimationend={() => (flashState = null)}
  class:analysisMode={engineStore.enabled && visualDivider !== null}
  class:timerMode={timerStore.visible}
  class:border-flash={gameStore.boardMode === 'Puzzle' && flashState}
  class:view-only={gameStore.isPuzzleComplete}
  style="
    --player-color: {gameStore.playerColor};
    --opponent-color: {gameStore.opponentColor};
    --border-color: {boardBorderColor};
    --border-flash-color: {SCORE_COLORS[flashState] ?? 'transparent'};

    /* Interative Border Colors (Engine Analysis/Timer) */
    --bar-top-color: {barTopColor};
    --bar-bottom-color: {barBottomColor};
    --divider: {$dividerSpring}%;

  "
></div>

<style lang="scss">
  @keyframes borderFlash {
    0% {
      box-shadow: 0 0 12px 6px var(--border-flash-color);
    }
    100% {
      box-shadow: var(--shadow-grey);
    }
  }

  /*  .cg-wrap might be nedded here? */
  #board {
    border: $board-border-width solid var(--border-color, grey);
    transition: border-color 0.2s ease;
    box-shadow: var(--shadow-grey);
    width: var(--board-size);
    height: var(--board-size);
    cursor: pointer;

    box-sizing: border-box;
    border-radius: var(--border-radius-global);

    &.border-flash {
      animation: borderFlash 0.5s ease-out;
    }

    &.view-only {
      cursor: not-allowed;

      :global(piece) {
        cursor: not-allowed !important;
        /* Optional: prevents hover effects (like green squares) if user hovers pieces */
        pointer-events: none !important;
      }

      /* Optional: Also kill the square cursors if necessary */
      :global(square) {
        cursor: not-allowed !important;
      }
    }

    &.analysisMode,
    &.timerMode {
      border-color: transparent;
      box-shadow: var(--shadow-grey);
      background-repeat: no-repeat;
      background-image:
        linear-gradient(var(--content-bg, white), var(--content-bg, white)),
        linear-gradient(
          to bottom,
          var(--bar-top-color) 0%,
          var(--bar-top-color) calc(var(--divider) - 1px),
          red calc(var(--divider) - 1px),
          red calc(var(--divider) + 1px),
          var(--bar-bottom-color) calc(var(--divider) + 1px),
          var(--bar-bottom-color) 100%
        );
      background-clip: padding-box, border-box;
      background-origin: padding-box, border-box;
    }
  }
</style>
