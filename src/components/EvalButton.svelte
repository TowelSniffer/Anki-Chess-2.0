<script lang="ts">
  import IconDevBoard from '~icons/material-symbols/developer-board-sharp';
  import IconDevBoardOff from '~icons/material-symbols/developer-board-off-sharp';
  import IconSync from '~icons/material-symbols/sync-sharp';
  import { getContext } from 'svelte';
  import type { GameStore } from '$stores/gameStore.svelte';
  import type { EngineStore } from '$stores/engineStore.svelte';

  // The back's Stockfish button on the front, where it turns on only the eval bar
  const gameStore = getContext<GameStore>('GAME_STORE');
  const engineStore = getContext<EngineStore>('ENGINE_STORE');

  // While the puzzle is being solved, unless a random orientation rules the bar out
  const visible = $derived(
    /^(Puzzle|Study)$/.test(gameStore.boardMode) &&
      !gameStore.isPuzzleComplete &&
      !gameStore.config.randomOrientation,
  );
  const on = $derived(gameStore.config.frontEval);
  const label = $derived(on ? 'Turn the eval bar off' : 'Turn the eval bar on (Stockfish)');
</script>

{#if visible}
  <button
    id="eval-button"
    class:active-toggle={on}
    title={label}
    aria-label={label}
    aria-pressed={on}
    onclick={() => (gameStore.config.frontEval = !on)}
  >
    {#if on && engineStore.loading}
      <span class="spin"><IconSync /></span>
    {:else if on}
      <span class="icon"><IconDevBoard /></span>
    {:else}
      <span class="icon"><IconDevBoardOff /></span>
    {/if}
  </button>
{/if}

<style lang="scss">
  /* Placed by App, next to the settings menu: in the comment box's top row or floating with it */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(-360deg);
    }
  }

  #eval-button {
    @include icon-btn;

    &.active-toggle {
      background-color: var(--interactive-button-active);
      @include subtle-shadow(0.7, inset);
    }
  }

  .icon,
  .spin {
    @include flex-center;
    font-size: 1.45rem;
  }

  .spin {
    animation: spin 1s linear infinite;
  }
</style>
