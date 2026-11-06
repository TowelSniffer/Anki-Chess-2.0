<script lang="ts">
  import IconCorrect from '~icons/material-symbols/check-circle-outline';
  import IconWrong from '~icons/material-symbols/cancel-outline';
  import IconHint from '~icons/material-symbols/lightbulb-outline';
  import IconSolution from '~icons/material-symbols/play-circle-outline';
  import IconChessClock from '$components/uiUtility/IconChessClock.svelte';

  import type { Snippet } from 'svelte';
  import type { PuzzleStatus } from '$Types/ChessStructs';
  import type { GameStore } from '$stores/gameStore.svelte';
  import type { TimerStore } from '$stores/timerStore.svelte';
  import { getContext } from 'svelte';

  /*
   * The state of the puzzle in words, so it isn't only the colour of the border: whose move it is,
   * the tries left after a mistake, the clock, and the result. In the bottom player bar, between
   * the status and the clock it shows the bar's own content (children); alone, next to the card's
   * tools.
   */
  let { standalone = false, children }: { standalone?: boolean; children?: Snippet } = $props();

  const gameStore = getContext<GameStore>('GAME_STORE');
  const timerStore = getContext<TimerStore>('TIMER_STORE');

  const LOW_TIME = 5; // seconds

  const status = $derived(gameStore.puzzleStatus);

  function textOf(status: PuzzleStatus): string {
    switch (status.kind) {
      case 'turn':
        if (!status.color) return 'Your move';
        return status.color === 'w' ? 'White to move' : 'Black to move';
      case 'hint':
        return status.level > 1 ? 'Hint: play this move' : 'Hint: move this piece';
      case 'wrong':
        if (!status.triesLeft) return 'Not the move · showing the solution';
        return `Not the move · ${status.triesLeft} ${status.triesLeft === 1 ? 'try' : 'tries'} left`;
      case 'correct':
        return 'Correct · keep going';
      case 'solution':
        return 'Showing the solution';
      case 'perfect':
        return 'Perfect';
      case 'pass':
        return 'Solved';
      case 'fail':
        return 'Failed';
    }
  }

  const ICONS = {
    hint: IconHint,
    wrong: IconWrong,
    fail: IconWrong,
    correct: IconCorrect,
    pass: IconCorrect,
    perfect: IconCorrect,
    solution: IconSolution,
  };

  const Icon = $derived(status && status.kind !== 'turn' ? ICONS[status.kind] : null);

  // The timer stops at 0:00, and the clock stays to show it, until the puzzle is done
  const showClock = $derived(
    (timerStore.visible || timerStore.isOutOfTime) && !gameStore.isPuzzleComplete,
  );
  const seconds = $derived(Math.ceil(timerStore.remainingTime / 1000));
  const clock = $derived(
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
  );
</script>

{#if status}
  <div class="status-line kind-{status.kind}" class:standalone>
    <span class="message" role="status">
      {#if status.kind === 'turn' && status.color}
        <span class="side {status.color}"></span>
      {:else if Icon}
        <span class="icon"><Icon /></span>
      {/if}
      <span class="text">{textOf(status)}</span>
    </span>

    {@render children?.()}

    {#if showClock}
      <span class="clock" class:low={seconds <= LOW_TIME} role="timer" title="Time left">
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
  </div>
{/if}

<style lang="scss">
  /* In a player bar its parts are laid out by the bar */
  .status-line {
    display: contents;

    &.standalone {
      display: flex;
      align-items: center;
      gap: 0.5em;
      min-width: 0;
      margin-right: auto;
      padding: 0.3em 0.6em;
      border-radius: var(--border-radius-global);
      background: var(--surface-secondary);
      color: var(--text-muted);
      font-size: 0.85rem;
    }
  }

  .message {
    display: inline-flex;
    align-items: center;
    gap: 0.35em;
    flex-shrink: 0;
    font-weight: 600;
    color: var(--text-primary);

    .standalone & {
      flex-shrink: 1;
      min-width: 0;
    }
  }

  .kind-wrong .message,
  .kind-fail .message {
    color: var(--status-fail);
  }
  .kind-correct .message,
  .kind-pass .message {
    color: var(--status-pass);
  }
  .kind-perfect .message {
    color: var(--status-perfect);
  }

  .icon {
    display: flex;
    flex-shrink: 0;
    font-size: 1.25em;
  }

  .side {
    flex-shrink: 0;
    width: 0.8em;
    height: 0.8em;
    border-radius: 50%;
    border: 1px solid var(--text-muted);

    &.w {
      background: #f5f5f5;
    }
    &.b {
      background: #1a1a1a;
    }
  }

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
  }
</style>
