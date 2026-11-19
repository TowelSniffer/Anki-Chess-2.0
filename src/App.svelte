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
  import BoardLayout from '$components/BoardLayout.svelte';
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
  <BoardLayout {themeColors} showComments={boardMode === 'Viewer' || (userConfig.opts.frontText && !!userText)}>
    {#snippet comments()}
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
    {/snippet}
    {#snippet board()}
      <SettingsMenu bind:isHelpOpen />
      <ChessgroundBoard />
      <PromotePopup />
    {/snippet}
  </BoardLayout>
</GameProvider>

<style lang="scss">
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
</style>
