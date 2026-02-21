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

  import type { IPgnGameStore } from '$Types/StoreInterfaces';

  import { getContext } from 'svelte';
  import Dropdown from './uiUtility/Dropdown.svelte';
  import { engineStore } from '$stores/engineStore.svelte';
  import { playSound } from '$features/audio/audio';
  import { getMenuData } from '$configs/menu';
  import { clickToCopy } from '$utils/toolkit/copyToClipboard';


  // Retrieve the instance created by the parent
  const gameStore = getContext<IPgnGameStore>('GAME_STORE');

  let isFlipped = $derived(gameStore.orientation === 'black');
  let canGoBack = $derived(gameStore.pgnPath.length);
  let canGoForward = $derived(gameStore.hasNext);

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
  const isDevMenu = import.meta.env.DEV;
  const menuData = $derived(getMenuData(isDevMenu ? gameStore : undefined));
</script>

<svelte:window onkeydown={handleKeydown} />

<Dropdown icon={IconSettings} items={menuData} />

<button
  class="navBtn"
  id="resetBoard"
  disabled={!canGoBack}
  onclick={() => gameStore.reset()}
>
  <IconFirstPage />
</button>

<button
  class="navBtn"
  id="navBackward"
  disabled={!canGoBack}
  onclick={() => gameStore.prev()}
>
  <IconArrowLeft />
</button>

<button
  class="navBtn"
  id="navForward"
  disabled={!canGoForward}
  onclick={() => gameStore.next()}
>
  <IconArrowRight />
</button>

<button
  class="navBtn tooltip-btn"
  title="Copy FEN to clipboard"
  use:clickToCopy={{ text: gameStore.fen, message: 'FEN Copied!' }}
  onclick={() => playSound('click')}
>
  <span class="md-small"><IconCopy /></span>
</button>

<button
  class="navBtn"
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

<button class="navBtn" onclick={() => gameStore.toggleOrientation()}>
  <span class="flipBoardIcon md-small" class:flipped={isFlipped}
    ><IconFlip /></span
  >
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
    /* remove default button styling */
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;

    &:focus-visible {
      outline: 1px solid blue; /* Or any style you prefer */
    }

    &.navBtn {
      @include flex-center;
      z-index: 20;
      flex-direction: row;
      border-radius: var(--border-radius-global);
      border: var(--border-thin);
      background-color: var(--surface-primary);
      color: var(--text-primary);
      @include border-shadow;
      width: $button-size-calc;
      height: $button-size-calc;
      @include x-margin($button-margin-calc);
      cursor: pointer;
      box-sizing: border-box;
      transition: background 0.2s;
      font-size: 1.65rem;

      &:hover:not(:disabled, .active-toggle) {
        background-color: var(--interactive-button-hover);
        color: var(--surface-primary);
        @include border-shadow(0.7);
      }

      &:active:not(:disabled) {
        background-color: var(--interactive-button-active);
        color: var(--surface-primary);
        @include border-shadow(0.7, inset);
      }

      /* Style for when the analysis toggle button is active */
      &.active-toggle {
        background-color: var(--interactive-button-active);
        @include border-shadow(0.7, inset);
        color: var(--surface-secondary);
        &:hover:not(:active) {
          @include border-shadow(0.7);
        }
      }

      &:focus {
        outline: 0;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
