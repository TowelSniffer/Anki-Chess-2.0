<script lang="ts">
  import type { GameStore } from '$stores/gameStore.svelte';
  import type { CustomPgnMove } from '$Types/ChessStructs';
  import { getContext, tick } from 'svelte';
  import { cleanComment } from '$features/pgn/pgnParsing';
  import IconSchool from '~icons/material-symbols/school-outline';
  import IconWrong from '~icons/material-symbols/cancel-outline';

  /*
   * Front side comments (Puzzle/Study): intro comment, comments of the moves
   * played so far and the comment of a wrong move matching a PGN variation.
   */

  const gameStore = getContext<GameStore>('GAME_STORE');

  type Entry = {
    key: string;
    kind: 'intro' | 'move' | 'wrong';
    text: string;
    label?: string;
    side?: 'w' | 'b';
  };

  let container = $state<HTMLDivElement>();

  function moveLabel(move: CustomPgnMove): string {
    const fullMove = move.before.split(' ')[5] ?? '';
    return `${fullMove}${move.turn === 'b' ? '...' : '.'} ${move.notation.notation}`;
  }

  const entries = $derived.by(() => {
    const list: Entry[] = [];
    const intro = cleanComment(gameStore.rootGame?.gameComment?.comment);
    if (intro) list.push({ key: 'intro', kind: 'intro', text: intro });

    for (const move of gameStore.pathMoves) {
      const key = move.pgnPath.join(',');
      const before = cleanComment(move.commentMove);
      if (before) list.push({ key: `${key}-before`, kind: 'intro', text: before });
      const after = cleanComment(move.commentAfter);
      if (after) {
        list.push({ key, kind: 'move', text: after, label: moveLabel(move), side: move.turn });
      }
    }

    if (gameStore.wrongMoveComment) {
      list.push({ key: 'wrong', kind: 'wrong', text: gameStore.wrongMoveComment });
    }
    return list;
  });

  // Keep the latest comment in view
  $effect(() => {
    entries.length;
    tick().then(() =>
      container?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
    );
  });
</script>

{#if entries.length}
  <div class="puzzleComments" bind:this={container}>
    {#each entries as entry (entry.key)}
      <div class="entry {entry.kind}">
        {#if entry.kind === 'intro'}
          <span class="icon"><IconSchool /></span>
        {:else if entry.kind === 'wrong'}
          <span class="icon"><IconWrong /></span>
        {/if}
        <p class="text">
          {#if entry.label}
            <span class="label"><span class="side {entry.side}"></span>{entry.label}</span>
          {/if}
          {entry.text}
        </p>
      </div>
    {/each}
  </div>
{/if}

<style lang="scss">
  .puzzleComments {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 0.6em;
    font-size: 1.05em;
    line-height: 1.45;

    .entry {
      --accent: var(--text-muted);
      display: flex;
      align-items: flex-start;
      gap: 0.5em;
      padding: 0.5em 0.7em;
      background: var(--surface-secondary);
      border: var(--border-thin);
      border-left: 3px solid var(--accent);
      border-radius: var(--border-radius-global);
      transition: opacity 0.3s ease;
      animation: entry-in 0.25s ease-out;

      // Older comments step back so the latest one stands out
      &:not(:last-child) {
        opacity: 0.6;
      }

      &.intro {
        --accent: var(--interactive-button-active);
      }

      &.wrong {
        --accent: var(--status-fail);
        background: color-mix(in srgb, var(--status-fail) 12%, var(--surface-secondary));
      }

      .icon {
        display: flex;
        flex-shrink: 0;
        color: var(--accent);
        font-size: 1.25em;
        line-height: 1;
        margin-top: 0.05em;
      }

      .text {
        margin: 0;
        white-space: pre-line;
        overflow-wrap: anywhere;
      }

      .label {
        display: inline-flex;
        align-items: center;
        gap: 0.35em;
        margin-right: 0.45em;
        padding: 0.05em 0.45em;
        border-radius: 999px;
        background: var(--surface-hover);
        font-size: 0.85em;
        font-weight: 600;
        white-space: nowrap;
        vertical-align: 0.05em;

        // Colour of the side that played the move
        .side {
          width: 0.65em;
          height: 0.65em;
          border-radius: 50%;
          border: 1px solid var(--text-muted);

          &.w {
            background: #f5f5f5;
          }
          &.b {
            background: #1a1a1a;
          }
        }
      }
    }
  }

  @keyframes entry-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
  }
</style>
