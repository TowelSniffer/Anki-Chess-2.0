<script lang="ts">
  import type { IPgnGameStore } from '$Types/StoreInterfaces';
  import { getContext, type Snippet } from 'svelte';
  import GameProvider from '$components/Providers/GameProvider.svelte';
  import ChessgroundBoard from '$components/ChessgroundBoard.svelte';
  import HelpModal, { type SettingsSection } from '$components/uiUtility/HelpModal.svelte';
  import { mdDocs } from '$utils/toolkit/importAssets';
  import IconInfo from '~icons/material-symbols/info';

  let { isHelpOpen = $bindable(false) } = $props();

  // Dynamically create a section for each imported markdown file
  const markdownSections: SettingsSection[] = Object.entries(mdDocs).map(([key, content]) => ({
    id: key.toLowerCase(),
    label: key.replace(/([A-Z])/g, ' $1').trim(), // Formats "CamelCase" to "Camel Case"
    icon: IconInfo,
    mdContent: content
  }));

  let settingsConfig = $derived<SettingsSection[]>([
    ...markdownSections,
    {
      id: 'demo',
      label: 'Interactive Examples',
      icon: IconInfo,
      customSnippet: demoBoardSnippet
    }
  ]);
</script>

{#snippet demoBoardSnippet()}
{@const configPuzzle = { flipBoard: false, timer: 10000 }}
  <div class="demo-wrapper" style="width: 100%; max-width: 400px; aspect-ratio: 1; margin: 0 auto;">
    <h3>Puzzle</h3>
    <h4>Try to find the mate</h4>
    <p>flipBoard: false, timer: 10000 (10s)</p>
    <GameProvider
      pgn={'[FEN "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4"]\n[SetUp "1"]\n\n1. Qxf7# *'}
      boardMode="Puzzle"
      configOverride={configPuzzle}
    >
      <div style="--board-size: 300px; width: var(--board-size); height: var(--board-size); position: relative;">
        <ChessgroundBoard />
      </div>
    </GameProvider>
    <h3>Play Vs Engine</h3>
    <h4>Bishop & Knight mate</h4>
    <p>Engine cards can be made by pasting a FEN instead of a PGN into the PGN field</p>
    <GameProvider
      pgn={'2B5/k1K5/8/3N4/8/8/8/8 w - - 1 2'}
      boardMode="Puzzle"
    >
      <div style="--board-size: 300px; width: var(--board-size); height: var(--board-size); position: relative;">
        <ChessgroundBoard />
      </div>
    </GameProvider>
  </div>
{/snippet}

<HelpModal
  isOpen={isHelpOpen}
  sections={settingsConfig}
  onClose={() => isHelpOpen = false}
/>

<style lang="scss">
</style>
