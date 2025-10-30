<script lang="ts">
  import type { CustomPgnMove, PgnPath } from "../core/types";
  import PgnMove from "./PgnMove.svelte";

  export let moves: CustomPgnMove[];
  export let currentPgnPath: PgnPath;
</script>

{#if moves[0]?.turn === "b"}
  {#if moves[0].pgnPath.at(-1) === 0 && moves[0].pgnPath.length === 1}
    <span class="move-number">{moves[0].moveNumber}.</span><span class="nullMove">|...|</span>
  {:else if moves[0].pgnPath.at(-1) === 0}
    <span class="move-number">{moves[0].moveNumber}...</span>
  {/if}
{/if}

{#each moves as move}
  <PgnMove {move} {currentPgnPath} />
{/each}
