<script lang="ts">
  import type { Snippet } from 'svelte';

  /*
   * The card layout: the comment box beside the board (above it in portrait), sized
   * from the board. Shared by the game card (App) and the structure card.
   */
  let {
    themeColors,
    playerBars = false,
    showComments,
    comments,
    board,
    outside,
  }: {
    themeColors: { light: string; dark: string };
    playerBars?: boolean;
    showComments: boolean;
    comments: Snippet;
    board: Snippet;
    // In the layout but outside the board (the menu, when there is no comment box)
    outside?: Snippet;
  } = $props();
</script>

<div id="container" style="--board-light: {themeColors.light}; --board-dark: {themeColors.dark};">
  {#if showComments}
    <div id="commentBox">
      {@render comments()}
    </div>
  {/if}
  <div id="board-container" class:player-bars={playerBars}>
    {@render board()}
  </div>
  {@render outside?.()}
</div>

<style lang="scss">
  // Set on the root, where --board-size is computed from it
  :global(:root.player-bars) {
    --player-bar: clamp(18px, 3.4dvh, 28px);
  }

  // Board plus room for the comment box (1000px with the default 600px board)
  $max-width: min(100vw, calc(var(--board-max, 600px) + 400px));
  $comment-box-width-calc: calc($max-width - var(--board-size) - calc($max-width * 0.03));

  #container {
    position: relative; /* The menu sits in a corner of its grid area in landscape */
    margin: 0;
    margin-right: 15px;
    gap: 4px;
    width: $max-width;
    grid-template-areas: 'one two';
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
    justify-content: center;

    #commentBox {
      grid-area: one;
      padding: 0px;
      width: $comment-box-width-calc;
      box-shadow: var(--shadow-main);
      background: var(--surface-primary);
      color: var(--text-primary);
      border: var(--border-thin);
      border-radius: var(--border-radius-global);
      max-height: calc(var(--board-size) + $player-bar * 2);
      margin-top: 1px;
      overflow: scroll;
      box-sizing: border-box;
    }
    @media (orientation: portrait) {
      #commentBox {
        width: calc(var(--board-size) + 12px);
        height: calc(100dvh - var(--board-size) - $player-bar * 2 - 14px);
        margin-left: 1px;
      }
    }
    #board-container {
      aspect-ratio: 1 / 1;
      contain: layout; /* Helps WebKit keep layout calculations isolated */
      position: relative;
      margin: 0 auto;
      grid-area: two;
      max-width: var(--board-max, 600px);

      // Taller than wide with the player bars: as a square it would overflow phones
      &.player-bars {
        aspect-ratio: auto;
      }
    }
  }

  @media (orientation: portrait) {
    #container {
      margin-right: 0px;
      grid-template-areas:
        'two'
        'one';
      grid-template-columns: auto;
    }
  }
</style>
