<script lang="ts">
  import { setContext, onDestroy } from 'svelte';
  import { Chess, validateFen, DEFAULT_POSITION } from 'chess.js';

  import { PgnGameStore } from '$stores/gameStore.svelte';
  import { EngineStore } from '$stores/engineStore.svelte';
  import { TimerStore } from '$stores/timerStore.svelte';
  import { userConfig } from '$stores/userConfig.svelte';
  import defaultConfig from '$anki/default_config.json';

  let { pgn, boardMode, configOverride = null, children } = $props();

  /*
   * Set Board Modes
   */

  // --- Study mode ---
  const isStudy = boardMode === 'puzzle' && userConfig.opts.playBothSides;
  if (isStudy) boardMode = 'Study';

  // --- AI mode (Detect FEN vs PGN) ---

  // Simple check: Does it look like a FEN? (start with piece/number, contains slashes)

  if (boardMode === 'Viewer' && !configOverride) {
    const aiPgn = sessionStorage.getItem('chess_aiPgn');
    aiPgn && sessionStorage.removeItem('chess_aiPgn');
    if (aiPgn && boardMode === 'Viewer') pgn = aiPgn;
  }
  const isFen = /^\s*([rnbqkbnrPNBRQK0-8]+\/){7}[rnbqkbnrPNBRQK0-8]+\s+[bw]/i.test(pgn || '');

  if (isFen && pgn) {
    // Wrap raw FEN in a minimal PGN structure
    // SetUp "1" is crucial for PGN parsers to respect the FEN tag
    const { ok, error } = validateFen(pgn);
    error && console.warn(error);
    const fen = ok ? pgn : DEFAULT_POSITION;
    pgn = `[Event "AI Practice"]\n[FEN "${fen}"]\n[SetUp "1"]\n\n*`;
    if (boardMode !== 'Viewer') {
      boardMode = 'AI';
    }
  } else if (pgn) {
    const chess = new Chess();
    try {
      const cleanedPgn = pgn.replace(/}\s*{/g, ' '); // merge adjacent comments
      chess.loadPgn(cleanedPgn);
      // PGN is valid and loaded
    } catch (e) {
      // Invalid PGN
      const message = e instanceof Error ? e.message : 'Unknown error';
      console.error('PGN Validation Failed:', message);
      pgn = `[Event "AI Practice"]\n[FEN "${DEFAULT_POSITION}"]\n[SetUp "1"]\n\n*`;
    }
  }

  const config = $derived.by(() => {
    if (!configOverride) return userConfig.opts;
    // Merge default userConfig with specific overrides
    return { ...defaultConfig, ...configOverride };
  });

  // Instantiate the stores
  const engineStore = new EngineStore(() => config);
  const timerStore = new TimerStore(() => config);
  const gameStore = new PgnGameStore(
    () => pgn,
    () => boardMode,
    () => config,
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
