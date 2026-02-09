<script lang="ts">
  import type { PgnGameStore } from '$stores/gameStore.svelte';
  import type { PgnPath, CustomPgnMove } from '$Types/ChessStructs';
  import { getContext } from 'svelte';
  import PgnViewer from './PgnViewer.svelte';
  import { nags, isNagKey } from '$features/pgn/nags';

  // Retrieve the instance created by the parent
  const gameStore = getContext<PgnGameStore>('GAME_STORE');

  let {
    moves: passedMoves = undefined,
    gameComment = gameStore.rootGame?.gameComment?.comment,
    isVariation = false,
    withBrackets = false,
  } = $props();

  let moves = $derived(passedMoves ?? gameStore.rootMoves);

  const currentPgnPathKey = $derived(gameStore.currentPathKey);

  function onMoveClick(path: PgnPath) {
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
    return key ? { title: nags[key]?.[0], symbol: nags[key]?.[1] } : {};
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
      class="move"
      class:current={pathKey === currentPgnPathKey}
      data-path-key={pathKey}
      onclick={() => onMoveClick(move.pgnPath)}
      onkeydown={(e) => onKeyDown(e, move.pgnPath)}
      role="button"
      tabindex="0"
    >
      {#if nag?.title}<span class="nagTooltip">{nag.title}</span>{/if}
      {move.notation.notation}
      {nag.symbol ?? ''}
    </span>

    {#if move.commentAfter}
      {#if move.turn === 'w' && !isVariation}
        {@render nullItem()}
      {/if}
      <span
        class="comment"
        class:has-variation={move.variations?.length > 0}
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
            <div
              class:variation-row={!isVariation}
              class:separator={!isVariation && v_idx > 0}
            >
              <PgnViewer
                moves={variationLine}
                isVariation={true}
                withBrackets={isVariation}
              />
              {#if isVariation && v_idx < move.variations.length - 1}
                <span class="sub-var-spacing"> </span>
              {/if}
            </div>
          {:else}
            <PgnViewer
              moves={variationLine}
              isVariation={true}
              withBrackets={isVariation}
            />
          {/if}
        {/each}
      {/snippet}

      {#if !isVariation}
        <div
          class="altLine top-level-container"
          class:lastContainer={i === moves.length - 1}
        >
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
    height: 1.5em;
    padding-left: 0.3em;
    padding-right: 0.3em;
    background-color: var(--surface-primary);
    border-right: var(--border-thin);
    text-align: center;
  }

  .move,
  .nullMove {
    height: 1.5em;
    background-color: var(--surface-primary);
    text-align: center;
  }

  .move {
    cursor: pointer;
    position: relative;
    display: inline-block;
    box-sizing: border-box;

    &:hover,
    &.current {
      background: var(--surface-hover);
    }

    &:hover {
      background: var(--surface-hover);
      /*       border: 1px solid var(--surface-primary); */
      box-shadow: inset 0px 0px 3px rgba(0, 0, 0, 0.7);

      .nagTooltip {
        visibility: visible;
        opacity: 1;
      }
    }

    &.current {
      box-shadow: inset 0px 0px 3px rgba(0, 0, 0, 1);
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
      display: inline-flex;
      background-color: inherit;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
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

  .nagTooltip {
    position: absolute; /* Change from fixed to absolute */
    bottom: 100%; /* Position it right above the parent */
    left: 50%; /* Move left edge to the horizontal middle */
    transform: translateX(-50%); /* Shift back by half its width to center */

    /* Add a small gap between text and tooltip */
    margin-bottom: 0.4em;
    font-size: 0.8em;
    font-style: italic;
    white-space: nowrap;
    z-index: 100;
    /* Basic styling for the tooltip */
    background: var(--surface-secondary);
    box-shadow: 0px 0px 2px 0px black;
    padding: 0.3em;
    border-radius: var(--border-radius-global);
    border: var(--border-thin);
    /* Hide the tooltip by default */
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
</style>
