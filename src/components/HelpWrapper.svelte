<script lang="ts">
  import type { IPgnGameStore } from '$Types/StoreInterfaces';

  import GameProvider from '$components/Providers/GameProvider.svelte';
  import ChessgroundBoard from '$components/ChessgroundBoard.svelte';
  import HelpModal, { type SettingsSection } from '$components/uiUtility/HelpModal.svelte';
  import CustomInputs from '$components/uiUtility/CustomInputs.svelte';
  import IconInfo from '~icons/material-symbols/info';
  import IconSync from '~icons/material-symbols/sync-sharp';
  import { getContext, type Snippet } from 'svelte';
  import { mdDocs } from '$utils/toolkit/importAssets';

  let { isHelpOpen = $bindable(false) } = $props();

  const puzzlePgn = `
[FEN "2B5/k1K5/8/3N4/8/8/8/8 w - - 1 2"]
[SetUp "1"]

2. Nb4 {[%EV 100.0]} (2. Ne7 {[%EV 100.0]} Ka8 {[%EV 0.0]} 3. Bb7+ {[%EV 100.0]} Ka7
{[%EV 0.0]} 4. Nc6# {[%EV 100.0]} (4. Nc8# {[%EV 100.0]})) (2. Nc3 {[%EV 100.0]} Ka8
{[%EV 0.0]} 3. Bb7+ {[%EV 100.0]} Ka7 {[%EV 0.0]} 4. Nb5# {[%EV 100.0]}) (2. Nb6?!
{[%EV 50.0]}) (2. Bb7?! {[%EV 50.0]}) Ka8 {[%EV 0.0]} 3. Bb7+ {[%EV 100.0]} Ka7 {EV:
0.0]} 4. Nc6# {[%EV 100.0]} 1-0
`

  const flippedPuzzlePgn = `
[FEN "8/7p/p7/1pN1kb2/1P4p1/P1K1P1P1/7P/8 b - - 7 39"]
[SetUp "1"]

39... Bc8 40. e4 {[%EV 98.6] [%N 49.62% of 164k]} (40. Kd3 {[%EV 98.2] [%N 40.69%
of 164k]}) *
`// Define the preset examples
  const demoOptions = [
    {
      label: 'Timed',
      subtitle: 'Mate in 3',
      description: 'This uses a 10 Second timer with a 1 second increment. Timer can be disabled by ',
      pgn: puzzlePgn,
      boardMode: 'Puzzle',
      configOverride: { flipBoard: false, timer: 10000 },
    },
    {
      label: 'Flipped',
      subtitle: 'Maintain advantage',
      description: 'This utilises the "Flip PGN" option under "Anki Template" options',
      pgn: flippedPuzzlePgn,
      boardMode: 'Puzzle',
      configOverride: { flipBoard: true, timer: 0 },
    },
    {
      label: 'Play Vs Engine',
      subtitle: 'Bishop and Knight Mate',
      description: 'Engine cards can be made by pasting a FEN instead of a PGN into the PGN field',
      pgn: '8/8/8/8/8/8/KB1k4/N7 w - - 0 1',
      boardMode: 'Puzzle',
      configOverride: undefined,
    },
  ];

  // State to track the active selection
  let selectedDemoLabel = $state(demoOptions[0].label);
  let reloadKey = $state(0);
  const activeDemo = $derived(
    demoOptions.find((d) => d.label === selectedDemoLabel) || demoOptions[0],
  );

  // Dynamically create a section for each imported markdown file
  const markdownSections: SettingsSection[] = Object.entries(mdDocs).map(([key, content]) => ({
    id: key.toLowerCase(),
    label: key.replace(/([A-Z])/g, ' $1').trim(), // Formats "CamelCase" to "Camel Case"
    icon: IconInfo,
    mdContent: content,
  }));

  let settingsConfig = $derived<SettingsSection[]>([
    ...markdownSections,
    {
      id: 'demo',
      label: 'Interactive Examples',
      icon: IconInfo,
      customSnippet: demoBoardSnippet,
    },
  ]);
</script>

{#snippet demoBoardSnippet()}
  <div class="demo-wrapper" style="width: 100%; max-width: 400px; aspect-ratio: 1; margin: 0 auto;">
    <h2>Try Tome Example Presets</h2>

    <div style="display:flex; gap: 1rem; justify-content: space-evenly; margin-bottom: 1rem;">
      <CustomInputs
        type="select"
        label="Example"
        options={demoOptions.map((d) => d.label)}
        value={selectedDemoLabel}
        onChange={(val) => (selectedDemoLabel = val)}
      />
      <button class="iconBtn" onclick={() => reloadKey++}>
        <IconSync />
      </button>
    </div>

    <h4>{activeDemo.subtitle}</h4>

    {#key `${activeDemo.label}-${reloadKey}`}
      <GameProvider
        pgn={activeDemo.pgn}
        boardMode={activeDemo.boardMode}
        configOverride={activeDemo.configOverride}
      >
        <div
          style="--board-size: 300px; width: var(--board-size); height: var(--board-size); position: relative; margin: 0 auto;"
        >
          <ChessgroundBoard />
        </div>
      </GameProvider>
    {/key}

    <p>{activeDemo.description}</p>
  </div>
{/snippet}

<HelpModal isOpen={isHelpOpen} sections={settingsConfig} onClose={() => (isHelpOpen = false)} />

<style lang="scss">
  button {
    @include icon-btn(2rem);
  }
</style>
