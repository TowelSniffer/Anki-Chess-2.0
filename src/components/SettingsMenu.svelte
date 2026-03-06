<script lang="ts">
  import IconMenu from '~icons/material-symbols/menu';
  import Dropdown from './uiUtility/Dropdown.svelte';
  import { getContext } from 'svelte';
  import { getMenuData } from '$configs/menu';
  import type { GameStore } from '$stores/gameStore.svelte';

  let { isHelpOpen = $bindable(false) } = $props();

  const gameStore = getContext<GameStore>('GAME_STORE');
  const isDevMenu = import.meta.env.DEV;

  const menuData = $derived(
    getMenuData((val) => (isHelpOpen = val), isDevMenu ? gameStore : undefined)
  );
</script>

<div id="global-settings">
  <Dropdown icon={IconMenu} items={menuData} position="bottom-left" variant="ghost" />
</div>

<style lang="scss">
  #global-settings {
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: 100;
    pointer-events: auto; /* Ensures clicks register on the button */
  }
</style>
