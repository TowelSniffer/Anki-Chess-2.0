<script lang="ts">
  // Import the specific icons as components
  import IconDevBoard from '~icons/material-symbols/developer-board-sharp';
  import IconFirstPage from '~icons/material-symbols/first-page-sharp';
  import IconArrowLeft from '~icons/material-symbols/keyboard-arrow-left';
  import IconArrowRight from '~icons/material-symbols/keyboard-arrow-right';
  import IconCopy from '~icons/material-symbols/content-copy-sharp';
  import IconSync from '~icons/material-symbols/sync-sharp';
  import IconDevBoardOff from '~icons/material-symbols/developer-board-off-sharp';
  import IconFlip from '~icons/material-symbols/flip-sharp';
  import IconShare from '~icons/material-symbols/ios-share-sharp';
  import IconFileCopy from '~icons/material-symbols/file-copy-sharp';
  import IconAddCard from '~icons/material-symbols/add-card-sharp';

  import type { GameStore } from '$stores/gameStore.svelte';
  import type { EngineStore } from '$stores/engineStore.svelte';
  import type { MenuItem } from '$components/uiUtility/Dropdown.svelte';

  import { getContext } from 'svelte';
  import Dropdown from '$components/uiUtility/Dropdown.svelte';
  import { playSound } from '$features/audio/audio';
  import { writePgn, writePgnFrom } from '$features/pgn/pgnWriter';
  import { clickToCopy, copyToClipboard, showTooltip } from '$utils/toolkit/copyToClipboard';

  // Retrieve Stores created by the parent
  const gameStore = getContext<GameStore>('GAME_STORE');
  const engineStore = getContext<EngineStore>('ENGINE_STORE');

  let isFlipped = $state(false);

  /*
   *  DERIVED VARIABLES
   */

  const isViewerMode = $derived(gameStore.boardMode === 'Viewer');
  const canGoBack = $derived(gameStore.pgnPath.length);
  const canGoForward = $derived(gameStore.hasNext);

  /*
   *  EFFECTS
   */

  // Engine Analysis Trigger
  $effect(() => {
    const shouldAutoAnalyse = engineStore.enabled && gameStore.boardMode !== 'AI';
    if (!shouldAutoAnalyse) return;

    // We auto analyse on any new fen
    const fen = gameStore.fen;
    engineStore.analyze(fen);
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

  /*
   *  EXPORT: the PGN with the analysis, or a new card from the position on the board
   */

  let exportAnchor: HTMLElement | undefined = $state();

  // Anki desktop with the Lichess Study Importer add-on, which opens the Add window
  const canAddNote =
    typeof pycmd !== 'undefined' && !!(window as { ANKI_CHESS_IMPORTER?: number }).ANKI_CHESS_IMPORTER;

  const wholePgn = () => writePgn(gameStore.rootGame!);
  const pgnFromHere = () =>
    writePgnFrom(gameStore.rootGame!, gameStore.pgnPath, gameStore.startFen);

  function copyPgn(text: string, message: string) {
    // Not awaited first: Anki copies only within the click
    copyToClipboard(text).then((ok) => {
      if (ok && exportAnchor) showTooltip(exportAnchor, message);
    });
  }

  function newNote() {
    pycmd(`ankiChessImporter:newNote:${JSON.stringify({ pgn: wholePgn() })}`);
  }

  const exportItems: MenuItem[] = [
    {
      type: 'action',
      label: 'Copy PGN',
      icon: IconFileCopy,
      tooltip:
        'The whole game, with the moves and lines you added while analysing. It gets its own AnkiChessId, so a card made from it is a card of its own.',
      action: () => copyPgn(wholePgn(), 'PGN Copied!'),
    },
    {
      type: 'action',
      label: 'Copy PGN from this position',
      icon: IconFileCopy,
      tooltip:
        'A new game starting from the position on the board, with the moves that follow on this line and their variations.',
      action: () => copyPgn(pgnFromHere(), 'PGN Copied!'),
    },
    ...(canAddNote
      ? [
          {
            type: 'action',
            label: 'New card with this PGN',
            icon: IconAddCard,
            tooltip:
              "Opens Anki's Add window with the PGN of Copy PGN (the whole game with your analysis), in this card's deck and note type and with its tags.",
            action: newNote,
          } as MenuItem,
        ]
      : []),
  ];

</script>

<svelte:window onkeydown={isViewerMode ? handleKeydown : null} />

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

<span class="export" title="Export the PGN or make a new card" bind:this={exportAnchor}>
  <Dropdown icon={IconShare} items={exportItems} position="bottom-left" />
</span>

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
  .export {
    display: flex;
  }

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
