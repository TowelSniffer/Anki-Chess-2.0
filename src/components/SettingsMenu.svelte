<script lang="ts">
  import IconSettings from '~icons/material-symbols/settings-sharp';
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
  <Dropdown icon={IconSettings} items={menuData} position="bottom-left" />
</div>

<style lang="scss">
  #global-settings {
    position: absolute;
    top: -50px;
    left: 0px;
    z-index: 100;
  }
</style>
