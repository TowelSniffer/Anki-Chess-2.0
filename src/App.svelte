<script lang="ts">
  import ChessgroundBoard from '$components/ChessgroundBoard.svelte';
  import ButtonsContainer from '$components/ButtonsContainer.svelte';
  import PromotePopup from '$components/PromotePopup.svelte';
  import PgnViewer from '$components/PgnViewer.svelte';
  import PlayerBar from '$components/PlayerBar.svelte';
  import GameProvider from '$components/Providers/GameProvider.svelte';
  import EngineAnalysis from '$components/EngineAnalysis.svelte';
  import HelpWrapper from '$components/HelpWrapper.svelte';
  import ErrorPopup from '$components/ErrorPopup.svelte';
  import SettingsMenu from '$components/SettingsMenu.svelte';
  import TemplateConfig from '$components/TemplateConfig.svelte';
  import { BOARD_THEMES } from '$utils/themeData';

  import { RenderScan } from 'svelte-render-scan';
  import { userConfig } from '$stores/userConfig.svelte';

  let { rawPgn: initialRawPgn, boardMode: initialBoardMode, userText } = $props();

  // svelte-ignore state_referenced_locally
  let rawPgn = $state(initialRawPgn);
  // svelte-ignore state_referenced_locally
  let boardMode = $state(initialBoardMode);

  let isHelpOpen = $state(false);

  let themeColors = $derived(BOARD_THEMES[userConfig.opts.boardTheme] || BOARD_THEMES['wood']);
  let showDevConfig = $state(false);
  let showComments = $derived(boardMode === 'Viewer' || (userConfig.opts.frontText && !!userText));

  if (import.meta.env.DEV) {
    window.addEventListener('dev:toggleTemplateConfig', () => {
      showDevConfig = true;
    });
  }

  // Watch the root DOM element for attribute changes (Handles Anki Card Flips)
  $effect(() => {
    // Expose a direct reactive setter to the global window
    (window as any).updateChessMode = (newMode: string) => {
      if (boardMode !== newMode) {
        boardMode = newMode as typeof boardMode;
      }
    };

    (window as any).updateRawPgn = (newPgn: string) => {
      if (rawPgn !== newPgn) rawPgn = newPgn;
    };

    // Cleanup if the component unmounts
    return () => {
      delete (window as any).updateChessMode;
      delete (window as any).updateRawPgn;
    };
  });

  $effect(() => {
    // Automatically apply or remove the class on the body tag
    if (userConfig.opts.lightMode) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  });

  $effect(() => {
    // Maximum board size; the viewport still limits it on small screens
    document.documentElement.style.setProperty('--board-max', `${userConfig.opts.boardSize}px`);
  });

  $effect(() => {
    // Room above and below the board for the player bars
    document.documentElement.classList.toggle('player-bars', userConfig.opts.playerBars);
  });
</script>

{#if import.meta.env.DEV}
  <RenderScan />
{/if}

{#if showDevConfig}
  <!-- Dark backdrop to dim the rest of the app -->
  <div style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 999999;">

    <!-- 800x600 Modal Container (Matches Python QDialog) -->
    <div style="width: 800px; height: 600px; max-width: 95vw; max-height: 95vh; background: var(--surface-primary); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <TemplateConfig onClose={() => (showDevConfig = false)} />
    </div>

  </div>
{/if}

<HelpWrapper bind:isHelpOpen />
<GameProvider {rawPgn} {boardMode}>
  <ErrorPopup bind:isHelpOpen />
  <div id="container" style="--board-light: {themeColors.light}; --board-dark: {themeColors.dark};">
    {#if showComments}
      <div id="commentBox">
        {#if userText}
          <div id="userTextContainer">
            <div id="textField">{@html userText}</div>
          </div>
        {/if}
        {#if boardMode === 'Viewer'}
          <div id="sticky-container">
            <div id="buttons-container">
              <ButtonsContainer />
              <SettingsMenu bind:isHelpOpen inToolbar />
            </div>
            <div id="analysis-container">
              <EngineAnalysis />
            </div>
          </div>
          <div id="pgnViewer">
            <PgnViewer />
          </div>
        {:else}
          <!-- The front has no move buttons (they'd give the solution away): just the menu -->
          <div id="sticky-container">
            <div id="buttons-container" class="menu-only">
              <SettingsMenu bind:isHelpOpen inToolbar />
            </div>
          </div>
        {/if}
      </div>
    {/if}
    <div id="board-container" class:player-bars={userConfig.opts.playerBars}>
      {#if userConfig.opts.playerBars}
        <PlayerBar position="top" />
      {/if}
      <ChessgroundBoard />
      {#if userConfig.opts.playerBars}
        <PlayerBar position="bottom" />
      {/if}
      <PromotePopup />
    </div>
    {#if !showComments}
      <!-- No comment box for the menu: it floats beside the board, never over a square -->
      <SettingsMenu bind:isHelpOpen />
    {/if}
  </div>
</GameProvider>

<style lang="scss">
  // Set on the root, where --board-size is computed from it
  :global(:root.player-bars) {
    --player-bar: clamp(18px, 3.4dvh, 28px);
  }

  // Board plus room for the comment box (1000px with the default 600px board)
  $max-width: min(100vw, calc(var(--board-max, 600px) + 400px));
  $comment-box-width-calc: calc($max-width - var(--board-size) - calc($max-width * 0.03));

  #container {
    position: relative; /* The menu sits in a corner of its grid area in landscape */
    margin: 0;
    margin-right: 15px;
    gap: 4px;
    width: $max-width;
    grid-template-areas: 'one two';
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
    justify-content: center;

    #commentBox {
      grid-area: one;
      padding: 0px;
      width: $comment-box-width-calc;
      box-shadow: var(--shadow-main);
      background: var(--surface-primary);
      color: var(--text-primary);
      border: var(--border-thin);
      border-radius: var(--border-radius-global);
      max-height: calc(var(--board-size) + $player-bar * 2);
      margin-top: 1px;
      overflow: scroll;
      box-sizing: border-box;

      #userTextContainer {
        @include flex-center;
        width: 100%;
        background: var(--surface-secondary);
        color: var(--text-primary);
        border-bottom: var(--border-thin);

        #textField {
          padding: 0.5em;
        }
      }

      #sticky-container {
        position: sticky;
        top: 0; /* Sticks to the top of the container when you scroll */
        z-index: 25;
        #buttons-container {
          @include flex-center;
          border-bottom: var(--border-thin);
          background: var(--surface-secondary);
          padding: 4px;

          // A lone menu goes to the end, as menus do in toolbars
          &.menu-only {
            justify-content: flex-end;
          }
        }
      }

      #pgnViewer {
        font-size: 1.2em;
        background: var(--surface-primary);
        display: grid;
        grid-template-columns: auto 1fr 1fr; /* 3-column layout */
        border-bottom: var(--border-thin);
      }
    }
    @media (orientation: portrait) {
      #commentBox {
        width: calc(var(--board-size) + 12px);
        height: calc(100dvh - var(--board-size) - $player-bar * 2 - 14px);
        margin-left: 1px;
      }
    }
    #board-container {
      aspect-ratio: 1 / 1;
      contain: layout; /* Helps WebKit keep layout calculations isolated */
      position: relative;
      margin: 0 auto;
      grid-area: two;
      max-width: var(--board-max, 600px);

      // Taller than wide with the player bars: as a square it would overflow phones
      &.player-bars {
        aspect-ratio: auto;
      }
    }
  }

  @media (orientation: portrait) {
    #container {
      margin-right: 0px;
      grid-template-areas:
        'two'
        'one';
      grid-template-columns: auto;
    }
  }
</style>

