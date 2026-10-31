<script lang="ts">
  import IconHint from '~icons/material-symbols/lightbulb-outline';
  import { getContext } from 'svelte';
  import type { GameStore } from '$stores/gameStore.svelte';
  import { showHint } from '$features/chessJs/puzzleLogic';

  const gameStore = getContext<GameStore>('GAME_STORE');

  // On the front while the puzzle is being solved
  const visible = $derived(
    gameStore.config.hints &&
      /^(Puzzle|Study)$/.test(gameStore.boardMode) &&
      !gameStore.isPuzzleComplete,
  );
  const disabled = $derived(!gameStore.hintMove || gameStore.hintLevel > 2);

  function handleKeydown(e: KeyboardEvent) {
    const typing = (e.target as HTMLElement | null)?.closest('input, textarea, [contenteditable]');
    if (e.key.toLowerCase() !== 'h' || e.ctrlKey || e.metaKey || e.altKey || typing) return;
    showHint(gameStore);
  }
</script>

<svelte:window onkeydown={visible ? handleKeydown : null} />

{#if visible}
  <button
    id="hint-button"
    class="tappable"
    title="Hint (H)"
    aria-label="Hint"
    {disabled}
    onclick={() => showHint(gameStore)}
  >
    <IconHint />
    {#if gameStore.hintLevel}
      <span class="level">{gameStore.hintLevel}</span>
    {/if}
  </button>
{/if}

<style lang="scss">
  /*
   * Outside the board, in a bottom corner: in the comment box's grid area (#container in App),
   * just left of the board in landscape; the screen's corner, under the board, in portrait.
   */
  #hint-button {
    @include icon-btn;
    position: absolute;
    grid-area: one;
    right: 0;
    bottom: 0;
    margin: 8px;
    z-index: 50; /* Under the popups */

    @media (orientation: portrait) {
      position: fixed;
      bottom: env(safe-area-inset-bottom, 0px);
    }

    .level {
      position: absolute;
      top: 1px;
      right: 3px;
      font-size: 0.6rem;
      font-weight: bold;
      line-height: 1;
    }
  }
</style>
