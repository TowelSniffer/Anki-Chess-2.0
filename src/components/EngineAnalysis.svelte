<script lang="ts">
  import { engineStore } from '$stores/engineStore.svelte';
  import CustomSelector from './uiUtility/CustomSelector.svelte';
  import { getContext } from 'svelte';
  import type { PgnGameStore } from '$stores/gameStore.svelte';
  import IconArrowSplit from '~icons/material-symbols/arrow-split';
  import IconSearchGear from '~icons/material-symbols/search-gear';

  const gameStore = getContext<PgnGameStore>('GAME_STORE');

  const lineOutput = $derived.by(() => {
    if (gameStore.isCheckmate) {
      return gameStore.turn === 'b'
        ? 'White Checkmates...'
        : 'Black Checkmates...';
    }
    if (gameStore.isDraw) {
      return 'Draw...';
    }

    return 'Thinking...';
  });

  const whiteAdv = $derived(
    engineStore.analysisLines[0]?.winChance > 50 ||
      (gameStore.isCheckmate && gameStore.turn === 'b'),
  );

  // Helper to format score (+0.5, -1.2, M3)
  function formatScore(line: any) {
    if (line.isMate) {
      return `M${Math.abs(line.scoreNormalized)}`;
    }
    // CP is centipawns from side-to-move perspective.
    // we want it shown as + for White adv, - for Black adv.
    // Since engineStore.winChance is normalized to White%,
    // we just use a visual bar or calculate raw cp relative to white.

    // Simple CP display:
    const val = line.scoreNormalized / 100;
    return val > 0 ? `+${val.toFixed(2)}` : `${val.toFixed(2)}`;
  }

  function setLines(n: number) {
    engineStore.setMultiPv(n);
  }
</script>

<div class="engine-container">
  <div class="controls">
    <CustomSelector
      label="Lines:"
      value={engineStore.multipv}
      options={engineStore.multipvOptions}
      icon={IconArrowSplit}
      onChange={(val: number) => engineStore.setMultiPv(val)}
    />

    <CustomSelector
      label="Thinking Time (s):"
      value={engineStore.analysisThinkingTime}
      options={engineStore.thinkingTimeOptions}
      icon={IconSearchGear}
      onChange={(val: number) => engineStore.setThinkingTime(val)}
    />
  </div>
  {#if engineStore.loading}
    <span>Starting...</span>
  {/if}
  {#if engineStore.analysisLines.length > 0 || engineStore.enabled}
    <div class="lines">
      {#each Array(engineStore.multipv) as _, i}
        {@const line = engineStore.analysisLines[i]}

        <div class="line" class:dummy-line={!line}>
          {#if line}
            <div class="eval" class:white-adv={whiteAdv}>
              {formatScore(line)}
            </div>
            <div class="moves">
              {line.pvSan}
            </div>
          {:else}
            <!-- Placeholder State -->
            <div class="eval" class:white-adv={whiteAdv}>{i + 1}.</div>
            <div class="moves">
              {engineStore.analysisLines.length === 0 ? lineOutput : '...'}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .engine-container {
    background: var(--surface-primary, #222);
    color: var(--text-primary, #fff);
    padding: 0.2rem;
    font-family: monospace;
    /*     border-top: 1px solid #444; */
    box-shadow:
      inset 0px 1px 1px rgba(0, 0, 0, 0.6),
      inset 0px -1px 1px rgba(0, 0, 0, 0.6);
    border-bottom: 1px solid #000;
  }

  .controls {
    @include flex-center;
    gap: 0.2rem;
    margin-bottom: 0.2rem;
    font-size: 0.9em;
  }

  .line {
    display: flex;
    gap: 0.8rem;
    padding: 0.2rem 0;
    border-bottom: 1px solid #333;
  }

  .eval {
    min-width: 3.5rem;
    font-weight: bold;
    text-align: right;
    color: #ff6b6b;
    /* Black advantage color */
  }

  .eval.white-adv {
    color: #51cf66;
    /* White advantage color */
  }

  .moves {
    color: #aaa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
