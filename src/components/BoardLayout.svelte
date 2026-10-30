<script lang="ts">
  import type { Snippet } from 'svelte';

  /*
   * The card layout: the comment box beside the board (above it in portrait), sized
   * from the board. Shared by the game card (App) and the structure card.
   */
  let {
    themeColors,
    showComments,
    comments,
    board,
  }: {
    themeColors: { light: string; dark: string };
    showComments: boolean;
    comments: Snippet;
    board: Snippet;
  } = $props();
</script>

<div id="container" style="--board-light: {themeColors.light}; --board-dark: {themeColors.dark};">
  {#if showComments}
    <div id="commentBox">
      {@render comments()}
    </div>
  {/if}
  <div id="board-container">
    {@render board()}
  </div>
</div>

<style lang="scss">
  $max-width: min(100vw, 1000px);
  $comment-box-width-calc: calc($max-width - var(--board-size) - calc($max-width * 0.03));

  #container {
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
      max-height: var(--board-size);
      margin-top: 1px;
      overflow: scroll;
      box-sizing: border-box;
    }
    @media (orientation: portrait) {
      #commentBox {
        width: calc(var(--board-size) + 12px);
        height: calc(100dvh - var(--board-size) - 14px);
        margin-left: 1px;
      }
    }
    #board-container {
      aspect-ratio: 1 / 1;
      contain: layout; /* Helps WebKit keep layout calculations isolated */
      position: relative;
      margin: 0 auto;
      grid-area: two;
      max-width: 600px;
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
