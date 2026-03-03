<script lang="ts">
  import { getContext } from 'svelte';
  import type { GameStore } from '$stores/gameStore.svelte';
  import IconInfo from '~icons/material-symbols/info';

  let { isHelpOpen = $bindable(false) } = $props();

  const gameStore = getContext<GameStore>('GAME_STORE');
</script>

{#if gameStore.parseError}
  <div class="popup-overlay">
    <div class="popup-content">
      <h2>⚠️ PGN Parsing Error</h2>
      <p>{gameStore.parseError}</p>
      <div class="btn-container">
        <button onclick={() => gameStore.clearError()}>Dismiss</button>
        <button onclick={() => (isHelpOpen = true)}><IconInfo />&nbsp;Help</button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    background: rgba(0, 0, 0, 0.6);
    @include flex-center;
    z-index: 9999; /* Ensure it sits above everything */
  }

  .popup-content {
    background: var(--surface-primary);
    color: var(--text-primary);
    border: 2px solid var(--status-fail);
    border-radius: var(--border-radius-global);
    padding: 1.5rem;
    box-shadow: var(--shadow-strong);
    max-width: 90%;
    width: 400px;
    text-align: center;
    @include flex-center;
    flex-direction: column;
    gap: 1rem;

    h2 {
      margin: 0;
      color: var(--status-fail);
      font-size: 1.2rem;
    }

    p {
      margin: 0;
      color: var(--text-muted);
      word-wrap: break-word;
    }

    .btn-container {
      @include flex-center;
      gap: 0.5rem;

      button {
      @include icon-btn(auto);
      padding: 0.5rem 1.5rem;
      font-size: 1rem;
      height: auto;
      margin: 0; /* Override the default icon-btn margin */
    }
    }


  }
</style>
