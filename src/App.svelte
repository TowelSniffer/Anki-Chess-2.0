<script lang="ts">
  import ChessgroundBoard from '$components/ChessgroundBoard.svelte';
  import ButtonsContainer from '$components/ButtonsContainer.svelte';
  import PromotePopup from '$components/PromotePopup.svelte';
  import PgnViewer from '$components/PgnViewer.svelte';
  import GameProvider from '$components/Providers/GameProvider.svelte';
  import EngineAnalysis from '$components//EngineAnalysis.svelte';
  import HelpWrapper from '$components/HelpWrapper.svelte';

  import { RenderScan } from 'svelte-render-scan';
  import { userConfig } from '$stores/userConfig.svelte';

  let { pgn, boardMode, userText } = $props();

  let isHelpOpen = $state(false);

  $effect(() => {
   $inspect(isHelpOpen)
  })
</script>

{#if import.meta.env.DEV}
  <RenderScan />
{/if}
<HelpWrapper bind:isHelpOpen/>
<GameProvider {pgn} {boardMode}>
  <div id="container">
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
              <ButtonsContainer bind:isHelpOpen/>
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
