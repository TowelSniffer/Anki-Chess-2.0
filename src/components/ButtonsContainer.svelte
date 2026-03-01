<script lang="ts">
  // Import the specific icons as components
  import IconSettings from '~icons/material-symbols/settings-sharp';
  import IconDevBoard from '~icons/material-symbols/developer-board-sharp';
  import IconFirstPage from '~icons/material-symbols/first-page-sharp';
  import IconArrowLeft from '~icons/material-symbols/keyboard-arrow-left';
  import IconArrowRight from '~icons/material-symbols/keyboard-arrow-right';
  import IconCopy from '~icons/material-symbols/content-copy-sharp';
  import IconSync from '~icons/material-symbols/sync-sharp';
  import IconDevBoardOff from '~icons/material-symbols/developer-board-off-sharp';
  import IconFlip from '~icons/material-symbols/flip-sharp';

  import type { GameStore } from '$stores/gameStore.svelte';
  import type { EngineStore } from '$stores/engineStore.svelte';

  import { getContext } from 'svelte';
  import Dropdown from './uiUtility/Dropdown.svelte';
  import { playSound } from '$features/audio/audio';
  import { getMenuData } from '$configs/menu';
  import { clickToCopy } from '$utils/toolkit/copyToClipboard';

  let { isHelpOpen = $bindable(false) } = $props();

  // Retrieve Stores created by the parent
  const gameStore = getContext<GameStore>('GAME_STORE');
  const engineStore = getContext<EngineStore>('ENGINE_STORE');

  let isFlipped = $state(false);

  /*
   *  DERIVED VARIABLES
   */

  const canGoBack = $derived(gameStore.pgnPath.length);
  const canGoForward = $derived(gameStore.hasNext);

  /*
   *  EFFECTS
   */

  // Engine Analysis Trigger
  $effect(() => {
    // Only auto-analyze if we are NOT in AI mode
    if (engineStore.enabled && gameStore.boardMode !== 'AI') {
      engineStore.analyze(gameStore.fen);
    }
  });

  /*
   *  HELPERS
   */

  function handleKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowLeft':
        gameStore.prev();
        break;
      case 'ArrowRight':
        gameStore.next();
        break;
      case 'ArrowDown':
        gameStore.reset();
        break;
    }
  }

  function flipBoard() {
    isFlipped = !isFlipped;
    gameStore.toggleOrientation();
  }

  const isDevMenu = import.meta.env.DEV;
  const menuData = $derived(getMenuData((val) => isHelpOpen = val, isDevMenu ? gameStore : undefined));
</script>

<svelte:window onkeydown={handleKeydown} />

<Dropdown icon={IconSettings} items={menuData} />

<button class="iconBtn" id="resetBoard" disabled={!canGoBack} onclick={() => gameStore.reset()}>
  <IconFirstPage />
</button>

<button class="iconBtn" id="navBackward" disabled={!canGoBack} onclick={() => gameStore.prev()}>
  <IconArrowLeft />
</button>

<button class="iconBtn" id="navForward" disabled={!canGoForward} onclick={() => gameStore.next()}>
  <IconArrowRight />
</button>

<button
  class="iconBtn tooltip-btn"
  title="Copy FEN to clipboard"
  use:clickToCopy={{ text: gameStore.fen, message: 'FEN Copied!' }}
  onclick={() => playSound('click')}
>
  <span class="md-small"><IconCopy /></span>
</button>

<button
  class="iconBtn"
  class:active-toggle={engineStore.enabled}
  disabled={engineStore.loading}
  title={engineStore.enabled ? 'Turn Stockfish Off' : 'Turn Stockfish On'}
  onclick={() => engineStore.toggle(gameStore.fen)}
>
  {#if engineStore.loading}
    <span class="md-small icon-spin"><IconSync /></span>
  {:else if engineStore.enabled}
    <span class="md-small"><IconDevBoard /></span>
  {:else}
    <span class="md-small"><IconDevBoardOff /></span>
  {/if}
</button>

<button class="iconBtn" onclick={flipBoard}>
  <span class="flipBoardIcon md-small" class:flipped={isFlipped}><IconFlip /></span>
</button>

<style lang="scss">
  /* Animation for when the analysis toggle button is loading */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(-360deg);
    }
  }

  button {
    @include icon-btn;

    &.iconBtn {

      /* Style for when the analysis toggle button is active */
      &.active-toggle:not(:disabled) {
        background-color: var(--interactive-button-active);
        @include subtle-shadow(0.7, inset);
        color: var(--surface-secondary);
        &:hover:not(:active) {
          @include subtle-shadow(0.7);
        }
      }



      span {
        &.icon-spin {
          animation: spin 1s linear infinite;
        }
        &.flipBoardIcon {
          transition: transform 0.3s ease-in-out;
          transform: rotate(270deg);

          &.flipped {
            transform: rotate(90deg);
          }
        }
        &.md-small {
          font-size: 1.45rem;
          @include flex-center;
        }
      }
    }
  }
</style>
