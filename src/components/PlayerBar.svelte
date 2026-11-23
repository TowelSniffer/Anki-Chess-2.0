<script lang="ts">
  import IconQueen from '~icons/material-symbols/chess-queen';
  import IconRook from '~icons/material-symbols/chess-rook';
  import IconBishop from '~icons/material-symbols/chess-bishop-2'; // the other one looks like the pawn
  import IconKnight from '~icons/material-symbols/chess-knight';
  import IconPawn from '~icons/material-symbols/chess-pawn';

  import type { GameStore } from '$stores/gameStore.svelte';
  import type { MaterialRole } from '$features/chessJs/material';
  import { getContext } from 'svelte';
  import { materialDiff } from '$features/chessJs/material';
  import { playerInfo } from '$features/pgn/players';

  // The side of the board this bar is on: it shows the player of the colour there
  let { position }: { position: 'top' | 'bottom' } = $props();

  const gameStore = getContext<GameStore>('GAME_STORE');

  const ICONS = { q: IconQueen, r: IconRook, b: IconBishop, n: IconKnight, p: IconPawn };

  const color = $derived.by(() => {
    const bottom = gameStore.orientation === 'white' ? 'w' : 'b';
    if (position === 'bottom') return bottom;
    return bottom === 'w' ? 'b' : 'w';
  });

  const player = $derived(
    playerInfo(gameStore.rootGame?.tags as Record<string, unknown> | undefined, color),
  );

  // The result would give the puzzle away: only on the back, or once solved
  const showResult = $derived(gameStore.boardMode === 'Viewer' || gameStore.isPuzzleComplete);

  const material = $derived(materialDiff(gameStore.fen)[color]);

  // Pieces of the same kind drawn overlapping, as on Lichess
  const groups = $derived.by(() => {
    const result: { role: MaterialRole; count: number }[] = [];
    for (const role of material.pieces) {
      const last = result[result.length - 1];
      if (last?.role === role) last.count++;
      else result.push({ role, count: 1 });
    }
    return result;
  });
</script>

<div class="player-bar {position}" data-color={color}>
  {#if showResult && player.result}
    <span class="result" class:win={player.result === '1'} class:loss={player.result === '0'}>
      {player.result}
    </span>
  {/if}
  {#if player.title}
    <span class="title">{player.title}</span>
  {/if}
  <span class="name" title={player.name}>{player.name}</span>
  {#if player.elo}
    <span class="elo">{player.elo}</span>
  {/if}

  <span class="material">
    {#each groups as { role, count } (role)}
      {@const Icon = ICONS[role]}
      <span class="group">
        {#each Array(count) as _, i (i)}
          <span class="piece" data-role={role}><Icon /></span>
        {/each}
      </span>
    {/each}
    {#if material.score > 0}
      <span class="score">+{material.score}</span>
    {/if}
  </span>
</div>

<style lang="scss">
  .player-bar {
    @include unselectable;
    display: flex;
    align-items: center;
    gap: 0.5em;
    width: var(--board-size);
    height: $player-bar;
    padding: 0 0.7em;
    box-sizing: border-box;
    overflow: hidden;
    white-space: nowrap;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', sans-serif;
    font-size: clamp(11px, calc($player-bar * 0.5), 14px);
    line-height: 1;
    background: var(--surface-secondary);
    color: var(--text-muted);
    box-shadow: var(--shadow-main);

    &.top {
      border-radius: var(--border-radius-global) var(--border-radius-global) 0 0;
    }
    &.bottom {
      border-radius: 0 0 var(--border-radius-global) var(--border-radius-global);
    }
  }

  .result {
    font-weight: bold;

    &.win {
      color: var(--status-pass);
    }
    &.loss {
      color: var(--status-fail);
    }
  }

  .title {
    font-weight: bold;
    color: #bf811d; // Lichess' title colour
  }

  .name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
    color: var(--text-primary);
    opacity: 0.85;
  }

  .elo {
    flex-shrink: 0;
  }

  .material {
    display: flex;
    align-items: center;
    gap: 0.25em;
    flex-shrink: 0;
    margin-left: auto;

    .group {
      display: flex;
    }

    .piece {
      display: flex;
      font-size: 1.3em;

      & + .piece {
        margin-left: -0.5em;
      }
    }

    .score {
      margin-left: 0.15em;
    }
  }
</style>
