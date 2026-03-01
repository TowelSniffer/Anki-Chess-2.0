<script lang="ts">
  import type { UserConfigOpts } from '$Types/UserConfig';
  import type { BoardModes } from '$Types/ChessStructs';

  import { setContext, onDestroy } from 'svelte';
  import { Chess, validateFen, DEFAULT_POSITION } from 'chess.js';

  import { GameStore } from '$stores/gameStore.svelte';
  import { EngineStore } from '$stores/engineStore.svelte';
  import { TimerStore } from '$stores/timerStore.svelte';
  import { userConfig } from '$stores/userConfig.svelte';
  import defaultConfig from '$anki/default_config.json';

  let {
    pgn,
    boardMode,
    configOverride = null,
    persist = true,
    children,
  }: {
    pgn: string;
    boardMode: BoardModes; // Or your BoardModes type
    configOverride?: Partial<UserConfigOpts> | null;
    persist?: boolean;
    children: any;
  } = $props();

  /*
   * Set Board Modes
   */

  const parsedData = $derived.by(() => {
    let currentMode = boardMode;
    let currentPgn = pgn;

    // --- Study mode ---
    const isStudy = currentMode === 'Puzzle' && userConfig.opts.playBothSides;
    if (isStudy) currentMode = 'Study';

    // --- AI mode (Detect FEN vs PGN) ---
    const isFen = /^\s*([rnbqkbnrPNBRQK0-8]+\/){7}[rnbqkbnrPNBRQK0-8]+\s+[bw]/i.test(currentPgn || '');

    if (isFen) {
      const { ok, error } = validateFen(currentPgn);
      error && console.warn(error);
      const fen = ok ? currentPgn : DEFAULT_POSITION;
      currentPgn = `[Event "AI Practice"]\n[FEN "${fen}"]\n[SetUp "1"]\n\n*`;
      if (currentMode !== 'Viewer') {
        currentMode = 'AI';
      }
    } else if (currentPgn) {
      const chess = new Chess();
      try {
        const cleanedPgn = currentPgn.replace(/}\s*{/g, ' ');
        chess.loadPgn(cleanedPgn);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        console.error('PGN Validation Failed:', message);
        currentPgn = `[Event "AI Practice"]\n[FEN "${DEFAULT_POSITION}"]\n[SetUp "1"]\n\n*`;
      }
    }

    return { pgn: currentPgn, boardMode: currentMode };
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
    () => parsedData.pgn,
    () => parsedData.boardMode,
    () => config,
    engineStore,
    timerStore,
    () => persist,
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
