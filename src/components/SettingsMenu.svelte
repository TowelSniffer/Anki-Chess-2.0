<script lang="ts">
  import IconMenu from '~icons/material-symbols/menu';
  import Dropdown from './uiUtility/Dropdown.svelte';
  import { getContext } from 'svelte';
  import { getMenuData } from '$configs/menu';
  import type { GameStore } from '$stores/gameStore.svelte';

  // inToolbar: in the comment box's button row; otherwise it floats beside the board
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

  /*
   * Without the comment box, outside the board in a bottom corner. Landscape: in the comment
   * box's grid area (#container in App), just left of the board. Portrait: the screen's corner,
   * under the board, within thumb reach.
   */
  .floating {
    position: absolute;
    grid-area: one;
    right: 0;
    bottom: 0;
    margin: 8px;
    z-index: 50; /* Under the popups */

    @media (orientation: portrait) {
      position: fixed;
      bottom: env(safe-area-inset-bottom, 0px);
    }
  }
</style>
