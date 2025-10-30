<script lang="ts">
  import type { CustomPgnMove, PgnPath } from "../core/types";
  import nags from "../../json/nags.json";

  export let move: CustomPgnMove;
  export let currentPgnPath: PgnPath;
  export let altLine: boolean = false;

  type NagKey = keyof typeof nags;

  function isNagKey(key: string): key is NagKey {
    return key in nags;
  }

  $: isCurrent =
    currentPgnPath &&
    move.pgnPath &&
    currentPgnPath.join(",") === move.pgnPath.join(",");

  $: nagDisplay = (() => {
    let check = "";
    let title = "";
    if (move.nag) {
      const foundNagKey = move.nag.find(isNagKey);
      if (foundNagKey) {
        check = nags[foundNagKey]?.[1] ?? "";
        title = nags[foundNagKey]?.[0] ?? "";
      }
    }
       return { check, title };
  })();
</script>

  {#if move.turn === "w"}
  <span class="move-number">{move.moveNumber}.</span>
{/if}

<span class="move" class:current={isCurrent} data-path-key={move.pgnPath?.join(",")}>
  {#if nagDisplay.title}
    <span class="nagTooltip">{nagDisplay.title}</span>
  {/if}
  {move.notation.notation}
  {nagDisplay.check}
</span>

{#if move.commentAfter}
  {#if move.turn === "w" && !altLine}
    <span class="nullMove">|...|</span>
  {/if}
  <span class="comment"> {move.commentAfter} </span>
  {#if move.turn === "w" && !altLine && !move.variations?.length}
    <span class="move-number">{move.moveNumber}.</span><span class="nullMove">|...|</span>
  {/if}
{/if}

{#if move.variations && move.variations.length > 0}
  {#if !altLine}
    {#if move.turn === "w" && !altLine && !move.commentAfter}
      <span class="nullMove">|...|</span>
    {/if}
    <div class="altLine">
  {/if}
  {#each move.variations as variation}
    <span class="altLineBracket">(</span>
    {#each variation as varMove}
      <svelte:self move={varMove} currentPgnPath={currentPgnPath} altLine={true} />
    {/each}
    <span class="altLineBracket">)</span>
  {/each}
  {#if !altLine}
    </div>
    {#if move.turn === "w"}
      <span class="move-number">{move.moveNumber}.</span><span class="nullMove">|...|</span>
    {/if}
  {/if}
{/if}
