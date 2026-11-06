<script lang="ts">
  import IconMenu from '~icons/material-symbols/menu';
  import Dropdown from './uiUtility/Dropdown.svelte';
  import { getContext } from 'svelte';
  import { getMenuData } from '$configs/menu';
  import type { GameStore } from '$stores/gameStore.svelte';
  import { userConfig } from '$stores/userConfig.svelte';

  // inToolbar: in the comment box's button row; otherwise it floats beside the board (App
  // places it, with the hint button)
  let { isHelpOpen = $bindable(false), inToolbar = false } = $props();

  const gameStore = getContext<GameStore>('GAME_STORE');
  const isDevMenu = import.meta.env.DEV;

  const menuData = $derived(
    getMenuData((val) => (isHelpOpen = val), isDevMenu ? gameStore : undefined)
  );

  // Settings changed and not saved yet: only the menu's Save entry says so, and it's closed
  const canSave = $derived(userConfig.hasAddon || userConfig.isAnkiConnect || !!window.CARD_CONFIG);
  const unsaved = $derived(canSave && userConfig.saveDue);
</script>

<!-- Floating in a bottom corner it opens upwards; in the row at the top of the box, downwards -->
<div id="global-settings" class:floating={!inToolbar}>
  <Dropdown
    icon={IconMenu}
    items={menuData}
    position={inToolbar ? 'bottom-right' : 'top-right'}
    ariaLabel={unsaved ? 'Settings (unsaved changes)' : 'Settings'}
  />
  {#if unsaved}
    <span class="unsaved-dot" aria-hidden="true"></span>
  {/if}
</div>

<style lang="scss">
  #global-settings {
    display: flex;
    position: relative;
  }

  .unsaved-dot {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--status-fail);
    box-shadow: 0 0 0 1px var(--surface-primary);
    pointer-events: none;
    z-index: 21; /* Over the button */
  }
</style>
