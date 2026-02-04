<script lang="ts">
  import Dropdown from './uiUtility/Dropdown.svelte';
  import type { MenuItem } from './uiUtility/Dropdown.svelte';

  import 'material-symbols/sharp.css';
  import { engineStore } from '$stores/engineStore.svelte';
  import { userConfig } from '$stores/userConfig.svelte';
  import { playSound } from '$features/audio/audio';
  import { untrack, getContext } from 'svelte';
  import type { PgnGameStore } from '$stores/Providers/GameProvider.svelte';

  // Retrieve the instance created by the parent
  const gameStore = getContext<PgnGameStore>('GAME_STORE');

  let isFlipped = $derived(gameStore.orientation === 'black');
  let canGoBack = $derived(gameStore.pgnPath.length > 0);
  let canGoForward = $derived(gameStore.hasNext);

  async function copyFen() {
    try {
      await navigator.clipboard.writeText(gameStore.fen);
      playSound('computer-mouse-click');
    } catch (err) {
      console.error('Failed to copy FEN:', err);
      playSound('error');
    }
  }

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

  function setConfigBoolean(key) {
    userConfig[key] = !userConfig[key];
  }

  const menuData = $derived([
    {
      label: 'Stockfish',
      icon: 'developer_board',
      children: [
        {
          type: 'number',
          label: 'Thinking Time (s)',
          min: 1,
          max: 300,
          value: userConfig.analysisTime,
          onChange: (val) => engineStore.setThinkingTime(val),
        },
        {
          type: 'number',
          label: 'Multi Pv',
          min: 1,
          max: 5,
          value: userConfig.analysisLines,
          onChange: (val) => engineStore.setMultiPv(val),
        },
      ],
    },
    {
      label: 'Anki Config',
      icon: 'kid_star',
      children: [
        {
          type: 'number',
          label: 'Handicap',
          min: 1,
          max: 10,
          value: userConfig.handicap,
          onChange: (val) => (userConfig.handicap = val),
        },
        {
          type: 'separator',
        },
        {
          type: 'number',
          label: 'Timer',
          min: 1,
          max: 60,
          value: userConfig.timer / 1000,
          onChange: (val) => (userConfig.timer = val * 1000),
        },
        {
          type: 'number',
          label: 'Increment',
          min: 1,
          max: 60,
          value: userConfig.increment / 1000,
          onChange: (val) => (userConfig.increment = val * 1000),
        },
        {
          type: 'separator',
        },
        {
          type: 'toggle',
          label: 'Front Text',
          checked: userConfig.frontText,
          onToggle: () => setConfigBoolean('frontText'),
        },
        {
          type: 'toggle',
          label: 'flipBoard',
          checked: userConfig.flipBoard,
          onToggle: () => setConfigBoolean('flipBoard'),
        },
        {
          type: 'toggle',
          label: 'mirror',
          checked: userConfig.mirror,
          onToggle: () => setConfigBoolean('mirror'),
        },
        {
          type: 'toggle',
          label: 'showDests',
          checked: userConfig.showDests,
          onToggle: () => setConfigBoolean('showDests'),
        },
        {
          type: 'toggle',
          label: 'muteAudio',
          checked: userConfig.muteAudio,
          onToggle: () => setConfigBoolean('muteAudio'),
        },
      ],
    },
    {
      type: 'separator',
    },
    {
      disabled: !userConfig.saveDue,
      label: 'Save Config',
      icon: 'save',
      danger: userConfig.saveDue,
      action: () => userConfig.save(),
    },
  ]);

  // --- Effects ---

  $effect(() => {
    // register dependencies by reading the values
    userConfig.flipBoard;

    untrack(() => {
      gameStore.parsePGN();
    });
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<Dropdown icon="settings" items={menuData} />

<button
  class="navBtn"
  id="resetBoard"
  disabled={!canGoBack}
  onclick={() => gameStore.reset()}
>
  <span class="material-symbols-sharp">first_page</span>
</button>

<button
  class="navBtn"
  id="navBackward"
  disabled={!canGoBack}
  onclick={() => gameStore.prev()}
>
  <span class="material-symbols-sharp">keyboard_arrow_left</span>
</button>

<button
  class="navBtn"
  id="navForward"
  disabled={!canGoForward}
  onclick={() => gameStore.next()}
>
  <span class="material-symbols-sharp">keyboard_arrow_right</span>
</button>

<button
  class="navBtn"
  title="Copy FEN to clipboard"
  id="copyFen"
  onclick={copyFen}
>
  <span class="material-symbols-sharp md-small">content_copy</span>
</button>

<button
  class="navBtn"
  class:active-toggle={engineStore.enabled}
  disabled={engineStore.loading}
  title={engineStore.enabled ? 'Turn Stockfish Off' : 'Turn Stockfish On'}
  onclick={() => engineStore.toggle(gameStore.fen)}
>
  {#if engineStore.loading}
    <span class="material-symbols-sharp icon-spin md-small">sync</span>
  {:else if engineStore.enabled}
    <span class="material-symbols-sharp md-small">developer_board</span>
  {:else}
    <span class="material-symbols-sharp md-small">developer_board_off</span>
  {/if}
</button>

<button class="navBtn" onclick={() => gameStore.toggleOrientation()}>
  <span
    class="flipBoardIcon material-symbols-sharp md-small"
    class:flipped={isFlipped}>flip</span
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
      box-shadow: $shadow-main;
      height: calc(var(--board-size) * 0.08);
      width: calc(var(--board-size) * 0.08);
      max-width: 45px;
      max-height: 45px;
      margin: 3px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover:not(:disabled) {
        background-color: var(--interactive-button-hover);
        color: var(--surface-primary);
        box-shadow: var(--shadow-grey);
      }

      &:active:not(:disabled) {
        background-color: var(--interactive-button-active);
        color: var(--surface-primary);
      }

      /* Style for when the analysis toggle button is active */
      &.active-toggle {
        background-color: var(--interactive-button-active);
        box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.5);
        color: var(--surface-secondary);
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
        &.material-symbols-sharp {
          font-size: 1.65rem;
        }
        &.md-small {
          font-size: 1.45rem;
        }
      }
    }
  }
</style>
