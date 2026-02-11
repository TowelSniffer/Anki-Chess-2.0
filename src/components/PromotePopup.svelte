<script lang="ts">
  import type { ChessJsPromotions } from '$Types/ChessStructs';
  import { handleUserMove } from '$features/chessJs/puzzleLogic';

  import wQRaw from '$assets/pieces/_wQ.svg?raw';
  import wRRaw from '$assets/pieces/_wR.svg?raw';
  import wBRaw from '$assets/pieces/_wB.svg?raw';
  import wNRaw from '$assets/pieces/_wN.svg?raw';

  import bQRaw from '$assets/pieces/_bQ.svg?raw';
  import bRRaw from '$assets/pieces/_bR.svg?raw';
  import bBRaw from '$assets/pieces/_bB.svg?raw';
  import bNRaw from '$assets/pieces/_bN.svg?raw';

  import { getContext } from 'svelte';
  import type { IPgnGameStore } from '$Types/StoreInterfaces';

  // Retrieve the instance created by the parent
  const gameStore = getContext<IPgnGameStore>('GAME_STORE');

  let turnColor = $derived(gameStore.turn[0]); // 'w' or 'b'
  let orientaion = $derived(gameStore.orientation[0]);

  const toDataUri = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`;
  let pieceAssets = $derived({
    q: turnColor === 'w' ? toDataUri(wQRaw) : toDataUri(bQRaw),
    b: turnColor === 'w' ? toDataUri(wBRaw) : toDataUri(bBRaw),
    n: turnColor === 'w' ? toDataUri(wNRaw) : toDataUri(bNRaw),
    r: turnColor === 'w' ? toDataUri(wRRaw) : toDataUri(bRRaw),
  });

  function select(role: ChessJsPromotions) {
    if (!gameStore.pendingPromotion) return;

    const { from, to } = gameStore.pendingPromotion;

    handleUserMove(gameStore, from, to, undefined, role);

    gameStore.pendingPromotion = null;
  }

  function cancelPopup() {
    gameStore.pendingPromotion = null;
    requestAnimationFrame(() => {
      gameStore.cg?.set({ fen: gameStore.fen, ...gameStore.boardConfig });
    });
  }
</script>

{#if gameStore.pendingPromotion}
  <div
    id="promoteButtonsContainer"
    class:top={turnColor === orientaion}
    class:bottom={turnColor !== orientaion}
  >
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
  <div
    id="overlay"
    role="button"
    tabindex="0"
    onclick={() => cancelPopup()}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') cancelPopup();
    }}
  ></div>
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
    margin: $board-border-width;
    position: absolute;
    left: 0; /* Anchor to the left */
    height: calc(var(--board-size) * 0.25);
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    width: calc(100% - $board-border-width * 2); /* This ensures it spans the full width */
    box-sizing: border-box;
    box-shadow: $shadow-strong;
    z-index: 100;
    border-radius: var(--border-radius-global) var(--border-radius-global) 0 0;
    &.top {
      top: 0;
    }
    &.bottom {
      bottom: 0;
    }
  }

  #overlay {
    height: 100dvh;
    width: 100dvw;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    background: rgba(0, 0, 0, 0.5);
  }
</style>
