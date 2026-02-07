<script lang="ts">
  // Import the specific icons as components
  import IconSettings from '~icons/material-symbols/settings-sharp';
  import IconDevBoard from '~icons/material-symbols/developer-board-sharp';
  import IconKidStar from '~icons/material-symbols/kid-star-sharp'; // Check specific name on icon-sets.iconify.design
  import IconSave from '~icons/material-symbols/save-sharp';
  import IconFirstPage from '~icons/material-symbols/first-page-sharp';
  import IconArrowLeft from '~icons/material-symbols/keyboard-arrow-left';
  import IconArrowRight from '~icons/material-symbols/keyboard-arrow-right';
  import IconCopy from '~icons/material-symbols/content-copy-sharp';
  import IconSync from '~icons/material-symbols/sync-sharp';
  import IconDevBoardOff from '~icons/material-symbols/developer-board-off-sharp';
  import IconFlip from '~icons/material-symbols/flip-sharp';

  import Dropdown, { type MenuItem } from './uiUtility/Dropdown.svelte';

  import { engineStore } from '$stores/engineStore.svelte';
  import { userConfig, type UserConfig } from '$stores/userConfig.svelte';
  import { playSound } from '$features/audio/audio';
  import { untrack, getContext } from 'svelte';
  import type { PgnGameStore } from '$stores/gameStore.svelte';

  // Retrieve the instance created by the parent
  const gameStore = getContext<PgnGameStore>('GAME_STORE');

  let isFlipped = $derived(gameStore.orientation === 'black');
  let canGoBack = $derived(gameStore.pgnPath.length > 0);
  let canGoForward = $derived(gameStore.hasNext);

  type BooleanKeys<T> = {
    [K in keyof T]: T[K] extends boolean ? K : never;
  }[keyof T];

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

  function setConfigBoolean(key: BooleanKeys<UserConfig>) {
    userConfig[key] = !userConfig[key];
  }

  const menuData: MenuItem[] = $derived([
    {
      label: 'Stockfish',
      icon: IconDevBoard,
      children: [
        {
          type: 'number',
          label: 'Thinking Time (s)',
          min: 1,
          max: 300,
          value: userConfig.analysisTime,
          onChange: (val: number) => engineStore.setThinkingTime(val),
        },
        {
          type: 'number',
          label: 'Multi Pv',
          min: 1,
          max: 5,
          value: userConfig.analysisLines,
          onChange: (val: number) => engineStore.setMultiPv(val),
        },
      ],
    },
    {
      label: 'Anki Config',
      icon: IconKidStar,
      children: [
        {
          type: 'number',
          label: 'Handicap',
          tooltip: 'Number of allowed mistakes before auto playing',
          min: 1,
          max: 10,
          value: userConfig.handicap,
          onChange: (val: number) => (userConfig.handicap = val),
        },
        {
          type: 'separator',
        },
        {
          type: 'number',
          label: 'Timer ()',
          tooltip: 'Initial time for Puzzle. set to 0 to disable',
          min: 1,
          max: 60,
          value: userConfig.timer / 1000,
          onChange: (val: number) => (userConfig.timer = val * 1000),
        },
        {
          type: 'number',
          label: 'Increment (s)',
          tooltip: 'Add time with each correct move',
          min: 1,
          max: 60,
          value: userConfig.increment / 1000,
          onChange: (val: number) => (userConfig.increment = val * 1000),
        },
        {
          type: 'separator',
        },
        {
          type: 'toggle',
          label: 'Front Text',
          tooltip: 'Show textField on front side of note',
          checked: userConfig.frontText,
          onToggle: () => setConfigBoolean('frontText'),
        },
        {
          type: 'toggle',
          label: 'flipBoard',
          tooltip:
            'Dictates where puzzle is solves from first or second move of the PGN',
          checked: userConfig.flipBoard,
          onToggle: () => setConfigBoolean('flipBoard'),
        },
        {
          type: 'toggle',
          label: 'mirror',
          tooltip:
            'Randomises orientation and colour for PGNs with no castle rights',
          checked: userConfig.mirror,
          onToggle: () => setConfigBoolean('mirror'),
        },
        {
          type: 'toggle',
          label: 'showDests',
          tooltip: 'Show legal moves for selected piece',
          checked: userConfig.showDests,
          onToggle: () => setConfigBoolean('showDests'),
        },
        {
          type: 'toggle',
          disabled: true,
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
      tooltip:
        'Updates note template for current settings (requires anki connect addon)',
      label: 'Save Config',
      icon: IconSave,
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
  class="navBtn"
  title="Copy FEN to clipboard"
  id="copyFen"
  onclick={copyFen}
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
      all: unset;
      @include flex-center;
      z-index: 20;
      flex-direction: row;
      border-radius: var(--border-radius-global);
      border: var(--border-thin);
      background-color: var(--surface-primary);
      color: var(--text-primary);
      box-shadow: $shadow-main;
      height: calc(var(--board-size) * 0.12);
      width: calc(var(--board-size) * 0.12);
      max-width: 45px;
      max-height: 45px;
      margin: 3px;
      cursor: pointer;
      box-sizing: border-box;
      transition: background 0.2s;
      font-size: 1.65rem;

      svg {
        height: 100%;
        width: 50%;
      }

      &:hover:not(:disabled) {
        background-color: var(--interactive-button-hover);
        color: var(--surface-primary);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 1);
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
        &.md-small {
          font-size: 1.45rem;
          @include flex-center;
        }
      }
    }
  }
</style>
