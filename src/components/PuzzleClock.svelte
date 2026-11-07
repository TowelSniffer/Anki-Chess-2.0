<script lang="ts">
  import IconChessClock from '$components/uiUtility/IconChessClock.svelte';

  import type { GameStore } from '$stores/gameStore.svelte';
  import type { TimerStore } from '$stores/timerStore.svelte';
  import { getContext } from 'svelte';

  // The puzzle's time left: in the bottom player bar or, without the bars, next to the card's tools
  let { standalone = false }: { standalone?: boolean } = $props();

  const gameStore = getContext<GameStore>('GAME_STORE');
  const timerStore = getContext<TimerStore>('TIMER_STORE');

  const LOW_TIME = 5; // seconds

  // The timer stops at 0:00, and the clock stays to show it, until the puzzle is done
  const showClock = $derived(
    /^(Puzzle|Study)$/.test(gameStore.boardMode) &&
      (timerStore.visible || timerStore.isOutOfTime) &&
      !gameStore.isPuzzleComplete,
  );
  const seconds = $derived(Math.ceil(timerStore.remainingTime / 1000));
  const clock = $derived(
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
  );
</script>

{#if showClock}
  <span class="clock" class:standalone class:low={seconds <= LOW_TIME} role="timer" title="Time left">
    <IconChessClock
      {seconds}
      side={gameStore.turn === 'w' ? 'left' : 'right'}
      running={timerStore.isRunning}
      low={seconds <= LOW_TIME}
      flagged={seconds === 0}
    />
    <span class="time">{clock}</span>
  </span>
{/if}

<style lang="scss">
  .clock {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    flex-shrink: 0;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);

    &.low {
      color: var(--status-fail);
    }

    &.standalone {
      margin-right: auto;
      padding: 0.3em 0.6em;
      border-radius: var(--border-radius-global);
      background: var(--surface-secondary);
      font-size: 0.85rem;
    }
  }
</style>
