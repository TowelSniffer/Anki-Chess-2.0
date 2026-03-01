<script lang="ts">
  import type { IPgnGameStore } from '$Types/StoreInterfaces';
  import type { EngineStore } from '$stores/engineStore.svelte';
  import { slide } from 'svelte/transition';
  import CustomInputs from './uiUtility/CustomInputs.svelte';
  import { getContext } from 'svelte';
  import IconArrowSplit from '~icons/material-symbols/arrow-split';
  import IconSearchGear from '~icons/material-symbols/search-gear';

  const gameStore = getContext<IPgnGameStore>('GAME_STORE');
  const engineStore = getContext<EngineStore>('ENGINE_STORE');

  const config = $derived(gameStore.config);

  const whiteAdv = $derived(
    engineStore.analysisLines[0]?.winChance > 50 ||
      (gameStore.isCheckmate && gameStore.turn === 'b'),
  );

  // Helper to format score (+0.5, -1.2, M3)
  function formatScore(line: any) {
    if (line.isMate) {
      return `M${Math.abs(line.scoreNormalized)}`;
    }
    const val = line.scoreNormalized / 100;
    return val > 0 ? `+${val.toFixed(2)}` : `${val.toFixed(2)}`;
  }
</script>

{#if engineStore?.enabled}
  <div class="engine-container" transition:slide={{ duration: 300 }}>
    <div class="controls">
      <CustomInputs
        type="number"
        label="Lines"
        value={config.analysisLines}
        min=1
        max=5
        icon={IconArrowSplit}
        onChange={(val: number) => (config.analysisLines = val)}
      />

      <CustomInputs
        type="number"
        label="Time"
        value={config.analysisTime}
        min=1
        max=10
        icon={IconSearchGear}
        onChange={(val: number) => (config.analysisTime = val)}
      />
    </div>
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
            {:else if gameStore.isCheckmate && i === 0}
              <div class="eval">&nbsp;</div>
              <div class="moves checkmate-msg" class:white-adv={whiteAdv}>
                {gameStore.turn === 'b' ? 'White ' : 'Black '}Checkmates
              </div>
            {:else}
              {@const loadingText = engineStore.loading && i === 0 ? 'Starting...' : ` `}
              <div class="eval">&nbsp;</div>
              <div class="moves">{loadingText}</div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  .engine-container {
    background: var(--surface-primary, #222);
    color: var(--text-primary, #fff);
    padding: 0.2rem;
    font-family: monospace;
    box-shadow:
      inset 0px 1px 1px rgba(0, 0, 0, 0.6),
      inset 0px -1px 1px rgba(0, 0, 0, 0.6);
    border-bottom: 1px solid #000;
  }

  .controls {
    @include justify-space-evenly;
    gap: 0.2rem;
    margin-bottom: 0.2rem;
    font-size: 0.9em;
  }

  .line {
    display: flex;
    gap: 0.8rem;
    padding: 0.2rem 0;
    border-bottom: 1px solid #333;
    min-height: 1.5em; /* Ensure height when empty */
  }

  .eval {
    min-width: 3.5rem;
    font-weight: bold;
    text-align: right;
    color: #ff6b6b; /* Black advantage color */
  }

  .eval.white-adv {
    color: #51cf66; /* White advantage color */
  }

  .moves {
    color: #aaa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.checkmate-msg {
      font-weight: bold;
      color: #ff6b6b; /* Default to Red (Black Wins) */

      &.white-adv {
        color: #51cf66; /* Green (White Wins) */
      }
    }
  }
</style>
