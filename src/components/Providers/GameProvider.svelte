<script lang="ts">
  import { setContext, onDestroy } from 'svelte';
  import { PgnGameStore } from '$stores/gameStore.svelte';import { EngineStore } from '$stores/engineStore.svelte';
  import { TimerStore } from '$stores/timerStore.svelte';
  import { userConfig } from '$stores/userConfig.svelte';

  let { pgn, boardMode, children } = $props();

  // Instantiate the stores
  const engineStore = new EngineStore();
  const timerStore = new TimerStore();

  if (boardMode === 'puzzle' && userConfig.opts.playBothSides) boardMode = 'Study';

  const gameStore = new PgnGameStore(
    () => pgn,
    () => boardMode,
    engineStore,
    timerStore
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
