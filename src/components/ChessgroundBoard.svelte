<script lang="ts">
  import { onMount } from 'svelte';
  import type { PgnPath, PuzzleScored } from '$Types/ChessStructs';
  import type { IPgnGameStore } from '$Types/StoreInterfaces';
  import '@lichess-org/chessground/assets/chessground.base.css';
  import '$scss/_components/_chessground.scss';
  import { userConfig } from '$stores/userConfig.svelte';
  import { engineStore } from '$stores/engineStore.svelte';
  import { timerStore } from '$stores/timerStore.svelte';
  import { updateBoard } from '$features/board/boardAnimation';
  import { moveAudio, playSound } from '$features/audio/audio';
  import { pieceImages } from '$utils/toolkit/importAssets';
  import { getContext, untrack } from 'svelte';
  import { spring } from 'svelte/motion';

  const gameStore = getContext<IPgnGameStore>('GAME_STORE');
  let boardContainer: HTMLDivElement;
  onMount(() => {
    if (boardContainer) {
      if (isViewerMode) {
        if (userConfig.opts.flipBoard) {
          gameStore.next();
        }
      } else {
        engineStore.enabled = false;
      }
      gameStore.loadCgInstance(boardContainer);
      requestAnimationFrame(() => {
        gameStore.cg?.redrawAll();
      });
    }
    return () => {
      if (gameStore.cg) {
        gameStore.cg.destroy(); // Explicitly kill the cg instance
      }
    };
  });

  const SOFT_WHITE = '#eaeaea';
  const SOFT_BLACK = '#0f0f0f';
  const SOFT_GREY = '#c0c0c0';
  const DEFAULT_DIVIDER_COLOR = 'lightslategray'

  // Maps logical strings to visual hex codes
  const mapBorderColor = (color: string) => {
    const themes: Record<string, string> = {
      white: SOFT_WHITE,
      black: SOFT_BLACK,
      grey: SOFT_GREY,
      divider: DEFAULT_DIVIDER_COLOR
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

  // A) Puzzle state
  const isPuzzleMode = $derived(gameStore.boardMode === 'Puzzle');

  const puzzleInProgress = $derived(isPuzzleMode && !gameStore.isPuzzleComplete);

  const puzzleCompleteAndScored = $derived(gameStore.isPuzzleComplete && !!gameStore.puzzleScore);

  const isRandomPuzzle = $derived(userConfig.opts.randomOrientation && isPuzzleMode);

  // B) AI state

  const isAiMode = $derived(gameStore.boardMode === 'AI');

  // AI mode and checkmate/draw
  const isAIGameOver = $derived(isAiMode && gameStore.isGameOver);

  // C) Study state

  const isStudyMode = $derived(gameStore.boardMode === 'Study');

  // D) Viewer state

  const isViewerMode = $derived(gameStore.boardMode === 'Viewer');

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
        return gameStore.turn === gameStore.playerColor[0]
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

  let cachedEval = 50;
  const commentDiag = $derived(
    (gameStore.currentMove?.commentDiag?.eval ?? gameStore.currentMove?.commentDiag?.EV)
      ? gameStore.currentMove?.commentDiag
      : false,
  );

  const visualDivider = $derived.by(() => {
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
        return barBottomColor[0] === gameStore.currentMove?.turn ? 100 - winPercent : winPercent;
      } else if (cpMatch) {
        if (cpMatch[0] === '#') {
          // Mate: #+ is White win (100%), #- is Black win (0%)
          const winPercent = cpMatch.includes('-') ? 0 : 100;
          return barBottomColor === 'white' ? 100 - winPercent : winPercent;
        }
        // Standard: "[%eval 0.35]"
        // Centipawns: Convert to ~Win % using logistic curve
        const cp = parseFloat(cpMatch) * 100;
        const winPercent = 50 + 50 * Math.tanh(cp / 290);
        return barBottomColor === 'white' ? 100 - winPercent : winPercent;
      }
    } else if (engineStore.enabled) {
      // C) Engine eval
      let evalPercent = cachedEval;
      const bestLine = engineStore.analysisLines.find((l) => l.id === 1);
      if (bestLine) {
        evalPercent = bestLine.winChance;
      } else {
        if (gameStore.isDraw) {
          evalPercent = 50;
        } else if (gameStore.isCheckmate) {
          evalPercent = gameStore.turn === 'w' ? 0 : 100;
        }
      }

      // Extract win chance (0-100 for White).
      // If the engine is thinking, default to last score.
      cachedEval = bestLine ? bestLine.winChance : evalPercent;

      // Calculate based on board orientation
      // If Top is White: Return White %.
      // If Top is Black: Return Black % (100 - White %).
      if (barTopColor === 'white') {
        return cachedEval;
      } else {
        return 100 - cachedEval;
      }
    } else {
      return 50;
    }
  });

  // analysisMode class for board
  const analysisMode = $derived(
    visualDivider !== null &&
      (engineStore.enabled || commentDiag) &&
      (isViewerMode || (isAiMode && !gameStore.isGameOver)),
  );

  // borderFlash class for board
  const borderFlash = $derived(/^(Puzzle|Study)$/.test(gameStore.boardMode) && flashState);

  // --- REACTIVE LOGIC ---

  // Sync the Spring to derived visualDivider
  let shouldHardSpring = false;
  $effect(() => {
    if (typeof visualDivider !== 'number') return;

    // Timer handles its own animation; keep spring in sync instantly without physics
    if (timerStore.visible) {
      dividerSpring.set(visualDivider, { hard: true });
      return;
    }

    const isAnalysis = engineStore.enabled || !!commentDiag;
    const isInitialActivation = isAnalysis && !shouldHardSpring;

    dividerSpring.set(visualDivider, { hard: isInitialActivation });

    shouldHardSpring = isAnalysis;
  });

  // INITIAL LOAD
  $effect(() => {
    // Only run if board exists
    if (!gameStore.cg || !boardContainer) return;
    requestAnimationFrame(() => {
      boardContainer?.focus();
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
  $effect(() => {
    if (gameStore.isPuzzleComplete) {
      gameStore.cg?.cancelMove();
      timerStore.stop();
      setTimeout(showViewer, 300);
    }
  });

  // Move & Animation an Handler
  let previousPath: PgnPath | null = null;
  $effect(() => {
    if (!gameStore?.cg) return;
    gameStore.errorCount = 0;
    if (isFenUpdate) {
      // single click move or en passant
      const moveType = updateBoard(gameStore, previousPath);
      if (typeof moveType === 'string') {
        playSound(moveType);
      } else if (moveType) {
        moveAudio(moveType);
      }

      previousPath = [...gameStore.pgnPath];
    } else if (previousPath) {
      // drag & drop or click to move
      if (gameStore.currentMove) moveAudio(gameStore.currentMove);
      previousPath = [...gameStore.pgnPath];
    } else if (previousPath === null) {
      previousPath = [...gameStore.pgnPath];
    }
  });

  // Reset errorCount on new fen
  $effect(() => {
    if (isFenUpdate && isPuzzleMode) gameStore.errorCount = 0;
  });

  // Set cg config with rAF optimization
  let rAF_id: number;
  $effect(() => {
    if (!gameStore?.cg) return;
    const config = gameStore.boardConfig;
    // Cancel any pending render from this frame
    if (rAF_id) cancelAnimationFrame(rAF_id);

    // Schedule the render for the next paint
    rAF_id = requestAnimationFrame(() => {
      gameStore.cg?.set(config);
      gameStore.cg?.playPremove();
    });
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
  style="display: contents; {Object.entries(pieceImages)
    .map(([k, v]) => `--${k}: url('${v}')`)
    .join('; ')}"
>
  <div
    id="board"
    class="tappable"
    bind:this={boardContainer}
    onpointerdown={handlePointerDown}
    onwheel={isViewerMode ? handleWheel : null}
    onanimationend={() => (flashState = null)}
    class:analysisMode
    class:timerMode={timerStore.visible}
    class:border-flash={borderFlash}
    class:view-only={gameStore.isPuzzleComplete || gameStore.isGameOver}
    style="
    --border-color: {mapBorderColor(boardBorderColor)};
    --border-flash-color: {flashState ? SCORE_COLORS[flashState] : 'transparent'};

    /* Interative Border Colors (Engine Analysis/Timer) */
    --bar-top-color: {mapBorderColor(barTopColor)};
    --bar-bottom-color: {mapBorderColor(barBottomColor)};
    --bar-divider-color: {mapBorderColor(barDividerColor)};
    --divider: {timerStore.visible ? visualDivider : $dividerSpring}%;
    "
  ></div>
</div>

<style lang="scss">
  /* halve of actual value */
  $dividerSize: calc($board-border-width/2);

  /* Register properties to allow transitions */
  @property --bar-top-color {
    syntax: '<color>';
    inherits: false;
    initial-value: white;
  }

  @property --bar-bottom-color {
    syntax: '<color>';
    inherits: false;
    initial-value: black;
  }

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
    border: $board-border-width solid var(--border-color, #c0c0c0);
    transition:
      border-color 0.3s ease,
      --bar-top-color 0.3s ease,
      --bar-bottom-color 0.3s ease;

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
      background-repeat: no-repeat;
      background-image:
        linear-gradient(var(--content-bg, white), var(--content-bg, white)),
        linear-gradient(
          to bottom,
          var(--bar-top-color) 0%,
          var(--bar-top-color) calc(var(--divider) - $dividerSize),
          var(--bar-divider-color) calc(var(--divider) - $dividerSize),
          var(--bar-divider-color) calc(var(--divider) + $dividerSize),
          var(--bar-bottom-color) calc(var(--divider) + $dividerSize),
          var(--bar-bottom-color) 100%
        );
      background-clip: padding-box, border-box;
      background-origin: padding-box, border-box;
    }
  }
</style>
