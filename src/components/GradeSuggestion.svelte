<script lang="ts">
  import type { GameStore } from '$stores/gameStore.svelte';
  import type { GradeReason } from '$Types/ChessStructs';
  import { getContext } from 'svelte';

  /*
   * On the back: the answer button the puzzle's result suggests. Anki desktop takes the answer
   * from the card (pycmd 'ease<n>', only while the back is shown): Suggest answers on a click,
   * Answer by itself after a countdown that any click or key cancels. Other apps can't be
   * answered from the card, so they only show the suggestion.
   */

  const gameStore = getContext<GameStore>('GAME_STORE');

  const BUTTONS = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' } as const;
  const REASONS: Record<GradeReason, string> = {
    unsolved: 'not solved',
    failed: 'failed',
    mistake: 'solved with a mistake',
    hint: 'solved with a hint',
    slow: 'solved after the time ran out',
    solved: 'solved',
    fast: 'solved fast',
  };
  const COUNTDOWN = 3;

  const suggestion = $derived(gameStore.gradeSuggestion);
  const mode = $derived(gameStore.config.autoGrade);
  const canAnswer = typeof pycmd !== 'undefined';

  let answered = $state(false);
  let countdown = $state<number | null>(null);

  const detail = $derived.by(() => {
    if (!suggestion) return '';
    const time = suggestion.seconds !== null && suggestion.grade > 1 ? ` in ${suggestion.seconds} s` : '';
    return `${REASONS[suggestion.reason]}${time}`;
  });

  function answer() {
    if (answered || !suggestion || !canAnswer) return;
    answered = true;
    countdown = null;
    pycmd(`ease${suggestion.grade}`);
  }

  // Answer mode: answers by itself unless a click or a key comes first
  $effect(() => {
    if (mode !== 'answer' || !canAnswer || !suggestion || answered) return;
    countdown = COUNTDOWN;
    const timer = setInterval(() => {
      if (countdown !== null && countdown > 1) countdown--;
      else answer();
    }, 1000);
    const cancel = () => {
      clearInterval(timer);
      countdown = null;
    };
    window.addEventListener('pointerdown', cancel, { capture: true, once: true });
    window.addEventListener('keydown', cancel, { capture: true, once: true });
    return () => {
      clearInterval(timer);
      window.removeEventListener('pointerdown', cancel, { capture: true });
      window.removeEventListener('keydown', cancel, { capture: true });
    };
  });
</script>

{#if suggestion && mode !== 'off'}
  {@const button = BUTTONS[suggestion.grade]}
  {#if canAnswer}
    <button
      id="grade-suggestion"
      class="tappable grade-{suggestion.grade}"
      disabled={answered}
      title="Answer {button} ({suggestion.grade})"
      onclick={answer}
    >
      <span class="button">{button}</span>
      <span class="detail">{detail}</span>
      <span class="action">
        {#if answered}
          answered
        {:else if countdown !== null}
          answering in {countdown} s · click to cancel
        {:else}
          click to answer
        {/if}
      </span>
    </button>
  {:else}
    <div id="grade-suggestion" class="grade-{suggestion.grade}">
      <span class="label">Suggested:</span>
      <span class="button">{button}</span>
      <span class="detail">{detail}</span>
    </div>
  {/if}
{/if}

<style lang="scss">
  #grade-suggestion {
    all: unset;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.25em 0.6em;
    width: 100%;
    padding: 0.45em 0.8em;
    border-left: 5px solid var(--grade-color);
    border-bottom: var(--border-thin);
    background: var(--surface-secondary);
    color: var(--text-primary);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', sans-serif;
    font-size: 0.95rem;
    line-height: 1.3;

    &.grade-1 { --grade-color: #d64c4c; }
    &.grade-2 { --grade-color: #e0a03a; }
    &.grade-3 { --grade-color: #2aa146; }
    &.grade-4 { --grade-color: #3d8ee8; }

    .button {
      font-weight: bold;
      color: var(--grade-color);
    }

    .label,
    .action {
      color: var(--text-muted);
    }

    .action {
      margin-left: auto;
      font-size: 0.85em;
    }
  }

  button#grade-suggestion {
    cursor: pointer;

    &:hover:not(:disabled) {
      background: var(--surface-hover);
    }
    &:disabled {
      cursor: default;
      opacity: 0.7;
    }
  }
</style>
