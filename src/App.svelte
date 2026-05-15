<script lang="ts">
  import ChessgroundBoard from '$components/ChessgroundBoard.svelte';
  import ButtonsContainer from '$components/ButtonsContainer.svelte';
  import PromotePopup from '$components/PromotePopup.svelte';
  import PgnViewer from '$components/PgnViewer.svelte';
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
    {#if boardMode === 'Viewer' || (userConfig.opts.frontText && userText)}
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
            </div>
            <div id="analysis-container">
              <EngineAnalysis />
            </div>
          </div>
          <div id="pgnViewer">
            <PgnViewer />
          </div>
        {/if}
      </div>
    {/if}
    <div id="board-container">
      <SettingsMenu bind:isHelpOpen />
      <ChessgroundBoard />
      <PromotePopup />
    </div>
  </div>
</GameProvider>

<style lang="scss">
  $max-width: min(100vw, 1000px);
  $comment-box-width-calc: calc($max-width - var(--board-size) - calc($max-width * 0.03));

  #container {
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
      max-height: var(--board-size);
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
        height: calc(100dvh - var(--board-size) - 14px);
        margin-left: 1px;
      }
    }
    #board-container {
      aspect-ratio: 1 / 1;
      contain: layout; /* Helps WebKit keep layout calculations isolated */
      position: relative;
      margin: 0 auto;
      grid-area: two;
      max-width: 600px;
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

