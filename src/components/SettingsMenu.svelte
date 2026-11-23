<script lang="ts">
  import IconMenu from '~icons/material-symbols/menu';
  import Dropdown from './uiUtility/Dropdown.svelte';
  import { getContext } from 'svelte';
  import { getMenuData } from '$configs/menu';
  import type { GameStore } from '$stores/gameStore.svelte';

  // inToolbar: in the comment box's button row; otherwise it floats beside the board (App
  // places it, with the hint button)
  let { isHelpOpen = $bindable(false), inToolbar = false } = $props();

  const gameStore = getContext<GameStore>('GAME_STORE');
  const isDevMenu = import.meta.env.DEV;

  const menuData = $derived(
    getMenuData((val) => (isHelpOpen = val), isDevMenu ? gameStore : undefined)
  );
</script>

<!-- Floating in a bottom corner it opens upwards; in the row at the top of the box, downwards -->
<div id="global-settings" class:floating={!inToolbar}>
  <Dropdown icon={IconMenu} items={menuData} position={inToolbar ? 'bottom-right' : 'top-right'} />
</div>

<style lang="scss">
  #global-settings {
    display: flex;
  }
</style>
