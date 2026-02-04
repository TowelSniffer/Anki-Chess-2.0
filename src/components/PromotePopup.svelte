<script lang="ts">
  import PromotePopup from '$components/PromotePopup.svelte';
  import { type ChessJsPromotions } from '$stores/gameStore.svelte.ts';
  import { handleUserMove } from '$features/chessJs/puzzleLogic';

  import wQ from '$assets/pieces/_wQ.svg?url';
  import wR from '$assets/pieces/_wR.svg?url';
  import wB from '$assets/pieces/_wB.svg?url';
  import wN from '$assets/pieces/_wN.svg?url';

  import bQ from '$assets/pieces/_bQ.svg?url';
  import bR from '$assets/pieces/_bR.svg?url';
  import bB from '$assets/pieces/_bB.svg?url';
  import bN from '$assets/pieces/_bN.svg?url';

  import { getContext } from 'svelte';
  import type { PgnGameStore } from '$stores/Providers/GameProvider.svelte';

  // Retrieve the instance created by the parent
  const gameStore = getContext<PgnGameStore>('GAME_STORE');

  let turnColor = $derived(gameStore.turn[0]); // 'w' or 'b'

  let pieceAssets = $derived({
    q: turnColor === 'w' ? wQ : bQ,
    b: turnColor === 'w' ? wB : bB,
    n: turnColor === 'w' ? wN : bN,
    r: turnColor === 'w' ? wR : bR,
  });

  function select(role: ChessJsPromotions) {
    if (!gameStore.pendingPromotion) return;

    const { from, to } = gameStore.pendingPromotion;

    handleUserMove(gameStore, from, to, undefined, role);

    gameStore.pendingPromotion = null;
  }
</script>

{#if gameStore.pendingPromotion}
  <div id="promoteButtonsContainer">
    <button class="promoteBtn" onclick={() => select('q')}>
      <img class="promotePiece" src={pieceAssets.q} alt="Promote to Queen" />
    </button>
    <button class="promoteBtn" onclick={() => select('b')}>
      <img class="promotePiece" src={pieceAssets.b} alt="Promote to Bishop" />
    </button>
    <button class="promoteBtn" onclick={() => select('n')}>
      <img class="promotePiece" src={pieceAssets.n} alt="Promote to Knight" />
    </button>
    <button class="promoteBtn" onclick={() => select('r')}>
      <img class="promotePiece" src={pieceAssets.r} alt="Promote to Rook" />
    </button>
  </div>
  <div id="overlay"></div>
{/if}

<style lang="scss">
  button {
    &.promoteBtn {
      @include flex-center;
      @include board-square-size;
      border: 0px;
      margin: 10px;
      /*     position: relative; */
      top: 0.07em;
      font-size: 1.4em;
      background-color: var(--surface-interactive-hover);
      border: var(--border-thin);
      border-radius: var(--border-radius-global);
      box-shadow: $shadow-strong;
      z-index: 100;
      cursor: pointer;

      &:hover {
        background-color: var(--interactive-button-hover);
        box-shadow: var(--shadow-grey);
      }

      &:active {
        background-color: var(--interactive-button-active);
        color: var(--surface-primary);
      }

      &:focus {
        outline: 0;
      }

      .promotePiece {
        margin: 0;
        @include board-square-size;
      }
    }
  }

  #promoteButtonsContainer {
    @include flex-center;
    position: absolute;
    height: calc(var(--board-size) * 0.25);
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    width: var(--board-size);
    box-shadow: $shadow-strong;
    z-index: 100;
  }

  #overlay {
    height: 100dvh;
    width: 100dvw;
    position: absolute;
    z-index: 99;
    background: rgba(0, 0, 0, 0.5);
  }
</style>
