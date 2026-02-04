<script lang="ts">
  import { setContext } from 'svelte';
  import { PgnGameStore } from '$stores/gameStore.svelte';

  let { pgn, boardMode, children } = $props();

  const gameStore = new PgnGameStore(pgn, boardMode);
  setContext('GAME_STORE', gameStore);
</script>

{@render children()}
