<script lang="ts">
  import '@lichess-org/chessground/assets/chessground.base.css';
  import '$scss/_components/_chessground.scss';

  import type { PgnPath, PuzzleScored } from '$Types/ChessStructs';

  import type { IPgnGameStore } from '$Types/StoreInterfaces';
  import type { EngineStore } from '$stores/engineStore.svelte';
  import type { TimerStore } from '$stores/timerStore.svelte';

  import { onMount, getContext, untrack, onDestroy } from 'svelte';
  import { spring } from 'svelte/motion';

  import { userConfig } from '$stores/userConfig.svelte';
  import { updateBoard } from '$features/board/boardAnimation';
  import { moveAudio, playSound } from '$features/audio/audio';
  import { pieceImages } from '$utils/toolkit/importAssets';

  const gameStore = getContext<IPgnGameStore>('GAME_STORE');
  const engineStore = getContext<EngineStore>('ENGINE_STORE');
  const timerStore = getContext<TimerStore>('TIMER_STORE');
  let boardContainer: HTMLDivElement;
  onMount(() => {
    if (boardContainer) {
      requestAnimationFrame(() => {
        gameStore.loadCgInstance(boardContainer);
      });
    }
    return () => {
      gameStore.cg?.destroy(); // Explicitly kill the cg instance
      gameStore.cg = null;
    };
  });

  onDestroy(() => {
    if (flashState) flashState = null;
    if (viewerTimeout) clearTimeout(viewerTimeout);
  });

  const SOFT_WHITE = '#eaeaea';
  const SOFT_BLACK = '#0f0f0f';
  const SOFT_GREY = '#c0c0c0';
  const DEFAULT_DIVIDER_COLOR = 'lightslategray';

  // Maps logical strings to visual hex codes
  const mapBorderColor = (color: string) => {
    const themes: Record<string, string> = {
      white: SOFT_WHITE,
      black: SOFT_BLACK,
      grey: SOFT_GREY,
      divider: DEFAULT_DIVIDER_COLOR,
    };
    return themes[color] || color;
  };

  const SCORE_COLORS = {
    incorrect: 'var(--status-error)',
    correct: 'var(--status-correct)',
    perfect: 'var(--status-perfect)',
  };

  // BORDER FLASH FIXME type for flash colours
  let flashState = $state<PuzzleScored>(null);

  /*
   * DERIVATIONS
   */

  // --- Board State ---

  // True: When our custom puzzle logic handles new moves
  // False: When Chessground 'after' move logic updates board
  const isFenUpdate = $derived(gameStore.fen.split(' ')[0] !== gameStore.cg?.getFen());

  // Board Modes
  const isPuzzleMode = $derived(gameStore.boardMode === 'Puzzle');
  const isStudyMode = $derived(gameStore.boardMode === 'Study');
  const isViewerMode = $derived(gameStore.boardMode === 'Viewer');
  const isAiMode = $derived(gameStore.boardMode === 'AI');
  const isScoredMode = $derived(isPuzzleMode || isStudyMode);

  // Puzzle state
  const puzzleInProgress = $derived(isPuzzleMode && !gameStore.isPuzzleComplete);
  const puzzleCompleteAndScored = $derived(gameStore.isPuzzleComplete && !!gameStore.puzzleScore);
  const isRandomPuzzle = $derived(userConfig.opts.randomOrientation && isPuzzleMode);

  // AI mode and checkmate/draw
  const isAiEval = $derived(isAiMode && userConfig.opts.aiEval && !gameStore.isGameOver);
  const isAIGameOver = $derived(isAiMode && gameStore.isGameOver);

  // --- Border Color ---

  const boardBorderColor = $derived.by(() => {
    // If we are in Puzzle mode and it's NOT done, keep it neutral/player color
    if (puzzleInProgress) {
      return isRandomPuzzle ? 'grey' : gameStore.playerColor;
    } else if (puzzleCompleteAndScored) {
      return SCORE_COLORS[gameStore.puzzleScore!];
    } else if (isStudyMode) {
      return gameStore.turn === 'w' ? 'white' : 'black';
    } else if (isAIGameOver) {
      if (gameStore.isCheckmate)
        return gameStore.turn !== gameStore.playerColor[0]
          ? SCORE_COLORS.correct
          : SCORE_COLORS.incorrect;
      return 'grey'; // draw
    } else {
      return !!gameStore.puzzleScore ? SCORE_COLORS[gameStore.puzzleScore] : gameStore.playerColor;
    }
  });

  // --- Interactive Border ---

  const barBottomColor = $derived.by(() => {
    if (isRandomPuzzle) return 'grey';
    if (isStudyMode) return gameStore.turn === 'w' ? 'white' : 'black';
    return gameStore.orientation;
  });

  const barTopColor = $derived.by(() => {
    if (isRandomPuzzle) return 'var(--status-error)';
    return barBottomColor === 'white' ? 'black' : 'white';
  });

  const barDividerColor = $derived.by(() => {
    if (!isViewerMode) return 'divider';
    return !!gameStore.puzzleScore ? SCORE_COLORS[gameStore.puzzleScore] : 'divider';
  });

  const dividerSpring = spring(50, {
    stiffness: 0.1,
    damping: 0.5,
  });

  let cachedEval: number = 50;
  const commentDiag = $derived(
    (gameStore.currentMove?.commentDiag?.eval ?? gameStore.currentMove?.commentDiag?.EV)
      ? gameStore.currentMove?.commentDiag
      : false,
  );

  const visualDivider: number = $derived.by(() => {
    if (timerStore.visible) {
      // A) Timer
      return timerStore.percent;
    } else if (!engineStore.enabled && commentDiag) {
      // B) %eval

      const evMatch = commentDiag?.EV;
      const cpMatch = commentDiag?.eval;

      if (evMatch) {
        // Custom: "EV: 27.6%"
        const winPercent = parseFloat(evMatch);
        cachedEval =
          barBottomColor[0] === gameStore.currentMove?.turn ? 100 - winPercent : winPercent;
        return cachedEval;
      } else if (cpMatch) {
        if (cpMatch[0] === '#') {
          // Mate: #+ is White win (100%), #- is Black win (0%)
          const winPercent = cpMatch.includes('-') ? 0 : 100;
          cachedEval = winPercent; // Save state
        } else {
          // Standard: "[%eval 0.35]"
          // Centipawns: Convert to ~Win % using logistic curve
          const cp = parseFloat(cpMatch) * 100;
          const winPercent = 50 + 50 * Math.tanh(cp / 290);
          cachedEval = winPercent; // Save state
        }
        cachedEval = barTopColor === 'white' ? cachedEval : 100 - cachedEval;
      } else {
        cachedEval = 50;
      }
    } else if (engineStore.enabled) {
      // C) Engine eval
      let evalPercent = cachedEval;
      const bestLine = engineStore.analysisLines.find((l) => l.id === 1);
      if (bestLine) {
        evalPercent = bestLine.winChance;
        cachedEval = barTopColor === 'white' ? evalPercent : 100 - evalPercent;
      } else {
        if (gameStore.isDraw) {
          evalPercent = 50;
        } else if (gameStore.isCheckmate) {
          evalPercent = gameStore.turn === gameStore.orientation[0] ? 100 : 0;
        }
        cachedEval = evalPercent;
      }
    }
    // Fallback: Hold the last known value while the opacity transition finishes
    // Normalize for "white" POV
    return cachedEval;
  });

  // analysisMode class for board
  const analysisMode = $derived(
    visualDivider !== null && (engineStore.enabled || commentDiag) && (isViewerMode || isAiEval),
  );

  // borderFlash class for board
  const borderFlash = $derived(isScoredMode && flashState);

  // --- REACTIVE LOGIC ---

  // $effect(() => {
  //   $inspect(flashState)
  // });

  // Sync the Spring to derived visualDivider
  let shouldHardSpring = false;
  $effect(() => {
    if (typeof visualDivider !== 'number') return;

    // Timer handles its own animation
    if (timerStore.visible) return;

    const isAnalysis = engineStore.enabled || !!commentDiag || isAiEval;
    const isInitialActivation = isAnalysis && !shouldHardSpring;
    dividerSpring.set(visualDivider, { hard: !!isInitialActivation });

    shouldHardSpring = isAnalysis;
  });

  // Direct DOM mutation
  let evalFillNode: HTMLDivElement | undefined = $state();
  $effect(() => {
    if (!evalFillNode) return;
    let scale = (timerStore.visible ? visualDivider : $dividerSpring) / 100;

    // Calculate percentage in JS, apply directly to the node
    evalFillNode.style.transform = `translate3d(0, ${-100 + scale * 100}%, 0)`;
  });

  // INITIAL LOAD
  $effect(() => {
    // Only run if board exists
    if (!gameStore.cg || !boardContainer) return;
    requestAnimationFrame(() => {
      // Fix render issue with arrows
      gameStore.cg?.redrawAll();
    });
  });

  // Store AI pgn
  $effect(() => {
    if (!isAiMode) return;
    const aiPgn = gameStore.currentMove?.history;
    if (aiPgn) {
      sessionStorage.setItem('chess_aiPgn', `${aiPgn}`);
    }
  });

  // Handle Puzzle Completion Side-Effects (Timer/Drag cancel)
  let viewerTimeout: ReturnType<typeof setTimeout>;
  $effect(() => {
    if (!gameStore.cg) return;
    const pullComplete = gameStore.isPuzzleComplete;
    if (pullComplete) {
      gameStore.cg?.cancelMove();
      timerStore.stop();
      viewerTimeout = setTimeout(showViewer, 300);
    }
  });

  // Move & Animation an Handler
  let previousPath: PgnPath | null = null;
  $effect(() => {
    void isFenUpdate;
    void gameStore.pgnPath;
    untrack(() => {
      if (!gameStore?.cg) return;
      gameStore.errorCount = 0;
      if (isFenUpdate) {
        // Single click move or en passant

        /*
         * Here we check if cg.move can be used instead of set({ fen: ... })
         * for smoother animations
         */

        const move = gameStore.currentMove;
        const prevMove = previousPath && gameStore.getMoveByPath(previousPath);

        // Special moves require set({ fen: ... })
        const shouldAnimate = move?.flags && !/^e|p|q|k$/.test(move.flags); // Promote/En Passant/Castle

        const forwardMoveCheck =
          shouldAnimate && move?.before.split(' ')[0] === gameStore.cg.getFen();
        // Special move check not needed as getCgConfig will compare fen to
        // check for Captures/Promote/En Passant/Castle.
        const undoMoveCheck = prevMove && move?.after === prevMove?.before;

        // Pre move here so getCgConfig doesn't update fen
        if (forwardMoveCheck) {
          gameStore.cg.move(move.from, move.to);
        } else if (undoMoveCheck) {
          gameStore.cg.move(prevMove.to, prevMove.from);
        }

        const moveType = updateBoard(gameStore, previousPath);
        if (typeof moveType === 'string') {
          playSound(moveType);
        } else if (moveType) {
          moveAudio(moveType);
        }
      } else if (previousPath) {
        // drag & drop or click to move
        if (gameStore.currentMove) moveAudio(gameStore.currentMove);
      }
      previousPath = [...gameStore.pgnPath];
    });
  });

  // Reset errorCount on new fen
  $effect(() => {
    if (isFenUpdate && isPuzzleMode) gameStore.errorCount = 0;
  });

  // Set cg config
  $effect(() => {
    if (!gameStore?.cg) return;
    const config = gameStore.boardConfig;

    // Schedule the render for the next paint
    gameStore.cg?.set(config);
    gameStore.cg?.playPremove();
  });

  // Engine Analysis Trigger
  $effect(() => {
    // Only auto-analyze if we are NOT in AI mode
    if (engineStore.enabled && !isAiMode) {
      void gameStore.fen;
      untrack(() => {
        engineStore.analyze(gameStore.fen);
      });
    }
  });

  // A) : Handle Mistakes (Flash Red)
  $effect(() => {
    if (gameStore.errorCount) {
      // ie > 0
      triggerFlash('incorrect');
    }
  });
  // B) : Handle Timeout (Flash Red)
  $effect(() => {
    if (timerStore.isOutOfTime) {
      triggerFlash('incorrect');
      if (userConfig.opts.timerAdvance) showViewer();
    }
  });
  // C) : Handle Puzzle Complete flash
  $effect(() => {
    if (puzzleCompleteAndScored) {
      triggerFlash(gameStore.puzzleScore);
    }
  });

  /*
   ** --- Helper Functions ---
   */

  // trigger CSS animation replay
  function triggerFlash(type: PuzzleScored) {
    flashState = null; // reset to force reflow if needed
    requestAnimationFrame(() => {
      flashState = type;
    });
  }

  function handlePointerDown(): void {
    if (!gameStore || !gameStore.cg) return;
    if (gameStore.cg.state.selected !== 'a0') {
      // Type Check For Extra CG a0 key
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

  function showViewer(): void {
    if (!userConfig.opts.autoAdvance || isViewerMode) return;
    if (typeof pycmd !== 'undefined') {
      pycmd('ans');
    } else if (typeof AnkiDroidJS !== 'undefined') {
      showAnswer();
    }
  }
</script>

<div
  style="display: contents;
    --border-color: {mapBorderColor(boardBorderColor)};
    --border-flash-color: {flashState ? SCORE_COLORS[flashState] : 'transparent'};
    --bar-top-color: {mapBorderColor(barTopColor)};
    --bar-bottom-color: {mapBorderColor(barBottomColor)};
    --bar-divider-color: {mapBorderColor(barDividerColor)};
    "
>

  <div
    style="{Object.entries(pieceImages)
    .map(([k, v]) => `--${k}: url('${v}')`)
    .join('; ')};"
    class="board-wrapper"
    class:analysisMode
    class:timerMode={timerStore.visible}
    class:border-flash={borderFlash}
    onanimationend={() => (flashState = null)}
  >
    <!-- Eval bar for border -->
    {#if timerStore.visible || analysisMode}
      <div class="eval-bar top"></div>
      <div class="eval-track">
        <div class="eval-fill" bind:this={evalFillNode}></div>
      </div>
    {/if}

    <div
      id="board"
      class="tappable"
      bind:this={boardContainer}
      onpointerdown={handlePointerDown}
      onwheel={isViewerMode ? handleWheel : null}
      class:view-only={gameStore.isPuzzleComplete || gameStore.isGameOver}
    ></div>
  </div>
</div>

<style lang="scss">
  /* Register properties to allow transitions */
  @property --bar-top-color {
    syntax: '<color>';
    inherits: true;
    initial-value: white;
  }

  @property --bar-bottom-color {
    syntax: '<color>';
    inherits: true;
    initial-value: black;
  }

  @keyframes borderFlash {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .board-wrapper {
    position: relative;
    width: var(--board-size);
    height: var(--board-size);
    border-radius: var(--border-radius-global);
    border: $board-border-width solid var(--border-color, #c0c0c0);
    box-shadow: $shadow-grey;
    box-sizing: border-box;
    background-color: var(--border-color, #c0c0c0);
    transition: border-color 0.3s ease;

    /* Flash Animation */
    &::after {
      content: '';
      position: absolute;
      inset: -$board-border-width;
      border-radius: inherit;
      box-shadow: 0 0 12px 6px var(--border-flash-color);
      opacity: 0;
      pointer-events: none;
      z-index: 10;
    }
    &.border-flash::after {
      animation: borderFlash 0.5s ease-out;
    }

    .eval-bar.top {
      position: absolute;
      top: -$board-border-width;
      left: -$board-border-width;
      right: -$board-border-width;
      height: $board-border-width;
      background-color: var(--bar-top-color);
      border-radius: var(--border-radius-global) var(--border-radius-global) 0 0;
      z-index: 5;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .eval-track {
      position: absolute;
      top: -$board-border-width; /* Extends through the top border */
      bottom: -$board-border-width; /* Extends through the bottom border */
      left: -$board-border-width; /* Shifts by border width */
      right: -$board-border-width;
      background-color: var(--bar-bottom-color);
      overflow: hidden;
      z-index: 6;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      border-radius: var(--border-radius-global);

      .eval-fill {
        position: absolute;
        top: $board-border-width;
        left: 0;
        right: 0;
        height: calc(100% - $board-border-width);
        background-color: var(--bar-top-color);
        box-sizing: border-box;
        will-change: transform;

        /* Divider Element */
        &::before {
          content: '';
          position: absolute;
          top: -$board-border-width;
          left: 0;
          right: 0;
          height: $board-border-width;
          background-color: var(--bar-top-color);
        }

        /* Divider Element */
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: $board-border-width;
          background-color: var(--bar-divider-color); /*  */
          box-shadow: inset $shadow-main;
        }
      }
    }

    /* Eval/Timer Bars */
    &.analysisMode,
    &.timerMode {
      border-color: var(--bar-bottom-color);

      .eval-bar.top,
      .eval-track {
        opacity: 1;
      }

      .eval-fill {
        /* Smoothing for custom timer animation */
        transition: transform 33ms linear;
      }
    }
  }

  #board {
    /* Chessground needs to fill the wrapper */
    width: 100%;
    height: 100%;
    cursor: pointer;
    position: relative; /* Required for z-index to work reliably */
    z-index: 7;
    @include border-shadow;
    border-radius: 4px;

    &.view-only {
      cursor: not-allowed;
      :global(piece) {
        cursor: not-allowed !important;
        pointer-events: none !important;
      }
      :global(square) {
        cursor: not-allowed !important;
      }
    }
  }
</style>
