<script lang="ts">
  import type { UserConfigOpts } from '$Types/UserConfig';
  import type { BoardModes } from '$Types/ChessStructs';

  import { setContext, onDestroy } from 'svelte';
  import { DEFAULT_POSITION } from 'chess.js';

  import { GameStore } from '$stores/gameStore.svelte';
  import { EngineStore } from '$stores/engineStore.svelte';
  import { TimerStore } from '$stores/timerStore.svelte';
  import { userConfig } from '$stores/userConfig.svelte';
  import defaultConfig from '$anki/default_config.json';
  import { isFen } from '$features/pgn/pgnParsing';

  let {
    rawPgn,
    boardMode,
    configOverride = null,
    persist = true,
    children,
  }: {
    rawPgn: string;
    boardMode: BoardModes; // Or your BoardModes type
    configOverride?: Partial<UserConfigOpts> | null;
    persist?: boolean;
    children: any;
  } = $props();

  /*
   * Set Board Modes
   */

  const getPgn = $derived(rawPgn ?? DEFAULT_POSITION);
  const getBoardMode = $derived.by(() => {
    let currentMode = boardMode;
    // --- Study mode ---
    const isStudy = currentMode === 'Puzzle' && userConfig.opts.playBothSides;
    if (isStudy) currentMode = 'Study';

    const isAi = currentMode !== 'Viewer' && isFen(getPgn);
    if (isAi) currentMode = 'AI';
    return currentMode;
  });

  const config = $derived.by(() => {
    if (!configOverride) return userConfig.opts;
    // Merge default userConfig with specific overrides
    return { ...defaultConfig, ...configOverride } as UserConfigOpts;
  });

  // Instantiate the stores
  const engineStore = new EngineStore(() => config);
  const timerStore = new TimerStore(() => config);
  const gameStore = new GameStore(
    () => getPgn,
    () => getBoardMode,
    () => config,
    () => persist,
    engineStore,
    timerStore,
  );

  // Set Stores in context so child components can access them
  setContext('GAME_STORE', gameStore);
  setContext('ENGINE_STORE', engineStore);
  setContext('TIMER_STORE', timerStore);

  // Cleanup
  onDestroy(() => {
    gameStore.destroy();
    engineStore.destroy();
    timerStore.destroy();
  });
</script>

{@render children()}
