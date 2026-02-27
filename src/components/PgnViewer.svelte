<script lang="ts">
  import type { IPgnGameStore } from '$Types/StoreInterfaces';
  import type { PgnPath, CustomPgnMove } from '$Types/ChessStructs';
  import { getContext } from 'svelte';
  import PgnViewer from './PgnViewer.svelte';
  import { nags, isNagKey } from '$features/pgn/nags';
  import { blunderNags } from '$features/board/arrows';

  // Retrieve the instance created by the parent
  const gameStore = getContext<IPgnGameStore>('GAME_STORE');

  let {
    moves: passedMoves = undefined,
    gameComment = gameStore.rootGame?.gameComment?.comment,
    isVariation = false,
    withBrackets = false,
  } = $props();

  let moves = $derived(passedMoves ?? gameStore.rootMoves);

  const currentPgnPathKey = $derived(gameStore.currentPathKey);

  // Auto-scroll logic
  $effect(() => {
    // We depend on currentPgnPathKey to trigger the scroll
    const activeKey = currentPgnPathKey;
    requestAnimationFrame(() => {
      const activeEl = document.querySelector(`[data-path-key="${activeKey}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    });
  });

  /*
   * HELPER FUNCTIONS
   */

  function tooltipAction(node: HTMLElement, text: string | undefined) {
    if (!text) return;

    let tooltip: HTMLDivElement | null = null;

    function createTooltip() {
      if (!text) return;
      tooltip = document.createElement('div');
      tooltip.className = 'nagTooltip global';
      tooltip.textContent = text;
      document.body.appendChild(tooltip); // Escape parent overflow

      const nodeRect = node.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      // Default: Centered above the move
      let top = nodeRect.top - tooltipRect.height - 8;
      let left = nodeRect.left + (nodeRect.width / 2) - (tooltipRect.width / 2);

      // Boundary Logic
      if (top < 0) top = nodeRect.bottom + 8; // Flip below if off top screen
      if (left < 8) left = 8; // Keep off left edge
      if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8; // Keep off right edge
      }

      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;

      // Request animation frame ensures transition fires
      requestAnimationFrame(() => tooltip?.classList.add('visible'));
    }

    function removeTooltip() {
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    }

    node.addEventListener('mouseenter', createTooltip);
    node.addEventListener('mouseleave', removeTooltip);

    return {
      destroy() {
        node.removeEventListener('mouseenter', createTooltip);
        node.removeEventListener('mouseleave', removeTooltip);
        removeTooltip();
      }
    };
  }

  function onMoveClick(path: PgnPath) {
    if (path.join(',') === currentPgnPathKey) return;
    gameStore.pgnPath = path;
  }

  function onKeyDown(event: KeyboardEvent, path: PgnPath): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent scrolling for Space
      onMoveClick(path);
    }
  }

  function getNagDetails(move: CustomPgnMove) {
    const key = move.nag?.find(isNagKey);
    if (!key) return {};

    let nagClass = '';
    if (blunderNags.includes(key)) nagClass = 'nag-error';
    else if (key === '$1') nagClass = 'nag-correct';
    else if (key === '$3') nagClass = 'nag-perfect';

    return {
      title: nags[key]?.[0],
      symbol: nags[key]?.[1],
      nagClass,
    };
  }
</script>

{#snippet nullItem()}
  <span class="nullMove">|...|</span>
{/snippet}

{#snippet moveNum(move: CustomPgnMove)}
  <span class="move-number">
    {move.moveNumber}{move.turn === 'b' && isVariation ? '...' : '.'}
  </span>
{/snippet}

{#if gameComment}
  <span class="comment"> {gameComment} </span>
{/if}

{#if withBrackets}<span class="altLineBracket">(</span>{/if}
{#if moves}
  {#each moves as move, i (move.pgnPath.join(','))}
    {#if i === 0 && move.turn === 'b'}
      {#if isVariation}
        {@render moveNum(move)}
      {:else}
        {@render moveNum(move)}
        {@render nullItem()}
      {/if}
    {/if}

    {#if move.turn === 'w'}
      {@render moveNum(move)}
    {/if}

    {@const pathKey = move.pgnPath.join(',')}
    {@const nag = getNagDetails(move)}

    <span
      class="move tappable"
      class:current={pathKey === currentPgnPathKey}
      data-path-key={pathKey}
      use:tooltipAction={nag?.title}
      onclick={() => onMoveClick(move.pgnPath)}
      onkeydown={(e) => onKeyDown(e, move.pgnPath)}
      role="button"
      tabindex="0"
    >
      {move.notation.notation}
      {#if nag?.symbol}
        <span class="moveNag {nag.nagClass ?? ''}">
          {nag?.symbol}
        </span>
      {/if}
    </span>

    {#if move.commentAfter}
      {#if move.turn === 'w' && !isVariation}
        {@render nullItem()}
      {/if}
      <span
        class="comment"
        class:has-variation={!isVariation && move.variations?.length > 0}
        class:lastContainer={i === moves.length - 1}
      >
        {move.commentAfter}
      </span>

      {#if move.turn === 'w' && i < moves.length - 1 && !isVariation && !move.variations?.length}
        {@render moveNum(move)}
        {@render nullItem()}
      {/if}
    {/if}

    {#if move.variations && move.variations.length > 0}
      {#if move.turn === 'w' && !move.commentAfter && !isVariation}
        {@render nullItem()}
      {/if}

      {#snippet variationLoop()}
        {#each move.variations as variationLine, v_idx (v_idx)}
          {#if !isVariation}
            <div class:variation-row={!isVariation} class:separator={!isVariation && v_idx > 0}>
              <PgnViewer moves={variationLine} isVariation={true} withBrackets={isVariation} />
              {#if isVariation && v_idx < move.variations.length - 1}
                <span class="sub-var-spacing"> </span>
              {/if}
            </div>
          {:else}
            <PgnViewer moves={variationLine} isVariation={true} withBrackets={isVariation} />
          {/if}
        {/each}
      {/snippet}

      {#if !isVariation}
        <div class="altLine top-level-container" class:lastContainer={i === moves.length - 1}>
          {@render variationLoop()}
        </div>
      {:else}
        {@render variationLoop()}

        {#if i < moves.length - 1}
          {#if move.turn === 'w'}
            {@render moveNum(move)}
          {/if}
        {/if}
      {/if}

      {#if move.turn === 'w' && i < moves.length - 1 && !isVariation}
        {@render moveNum(move)}
        {@render nullItem()}
      {/if}
    {/if}

    {#if i === moves.length - 1 && move.turn === 'w' && !isVariation && !move.commentAfter && (!move.variations || move.variations.length === 0)}
      {@render nullItem()}
    {/if}
  {/each}
{/if}
{#if withBrackets}<span class="altLineBracket">)</span>{/if}

<style lang="scss">
  .move-number {
    padding: 0.2em;
    background-color: var(--surface-primary);
    border-right: var(--border-thin);
    @include flex-center;
  }

  .move,
  .nullMove {
    padding: 0.25em;
    background-color: var(--surface-primary);
    @include flex-center;
  }

  .move {
    @include unselectable;
    scroll-margin-top: calc($button-size-calc + 9px);
    cursor: pointer;
    position: relative;
    box-sizing: border-box;

    &:hover,
    &.current {
      background: var(--surface-hover);
    }

    &:hover {
      background: var(--surface-hover);
      /*       border: 1px solid var(--surface-primary); */
      box-shadow: inset 0px 0px 3px rgba(0, 0, 0, 0.7);
    }

    &.current {
      box-shadow: inset 0px 0px 2px rgba(0, 0, 0, 1);
      cursor: default;
    }
    .moveNag {
      padding-left: 0.3em;
      font-weight: 550;
      color: var(--text-muted);
      /* Color nag for good and blunder */
      &.nag-error {
        color: var(--status-error);
      }
      &.nag-correct {
        color: var(--status-correct);
      }
      &.nag-perfect {
        color: var(--status-perfect);
      }
    }
  }

  .nullMove {
    color: var(--text-muted);
    cursor: default;
  }

  .comment {
    font-size: 0.8em;
    color: var(--text-primary);
    padding: 0.5em;
    background: var(--surface-hover);
    position: relative; /* Essential for positioning the border line */
    &.has-variation:not(.altLine) {
      border-bottom: 0;
    }
    &.has-variation:not(.altLine)::after {
      content: '';
      display: block; /* Makes the pseudo-element behave like a block element */
      position: absolute; /* Positions the separator relative to its parent */
      bottom: 0; /* Aligns the separator to the bottom of the container */
      left: 0;
      right: 0;
      height: 1px;
      background-color: transparent;

      box-shadow: 0px 1px 1px rgba(0, 0, 0, 1);
    }
  }

  .altLine {
    background: var(--surface-hover);
    color: white;
    font-size: 0.8em;
    padding: 0.3em;

    :global(span) {
      background-color: inherit;
      margin: 0;
      padding: 0.3em;
    }
    :global(.altLineBracket) {
      color: var(--surface-primary);
      font-weight: 700;
    }
    :global(.move) {
      border: 1px solid var(--surface-hover);
    }
    :global(.move:hover),
    :global(.move.current) {
      background: var(--surface-primary);
      border: 1px solid var(--surface-secondary);
    }

    :global(.move-number) {
      font-weight: 700;
      justify-content: flex-start;
      border-right: 0px;
    }

    :global(.comment) {
      margin-left: 0;
      border: 0;
      font-size: 0.9em;
      display: inline-flex;
    }
    :global(.nagTooltip) {
      background: var(--surface-secondary);
    }
  }

  .altLine,
  .comment {
    grid-column: 1 / -1;
    font-style: italic;
    border: var(--border-thin);
    border-left: 0;
    border-right: 0;
  }

  .top-level-container {
    display: flex;
    flex-direction: column;
    gap: 0.4em; /* Gap between distinct variation lines */
    padding-left: 0.5em;
  }

  .lastContainer {
    border-bottom: 0;
  }

  .variation-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    /* Add a separator line if it's not the first one */
    &.separator {
      border-top: 1px dashed var(--text-muted); /* Subtle separator */
      padding-top: 0.4em;
      margin-top: 0.2em;
    }
  }
  :global(.nagTooltip.global) {
    text-align: center;
    position: fixed; /* Bound to viewport, not parent */
    z-index: 9999;
    background: var(--surface-secondary);
    box-shadow: 0px 0px 2px 0px black;
    padding: 0.3em;
    border-radius: var(--border-radius-global);
    border: var(--border-thin);
    font-size: 0.8em;
    font-style: italic;
    max-width: 200px;
    pointer-events: none; /* Prevents tooltip from blocking hover events */

    /* Animation */
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  :global(.nagTooltip.global.visible) {
      opacity: 1 !important;
    }
</style>
