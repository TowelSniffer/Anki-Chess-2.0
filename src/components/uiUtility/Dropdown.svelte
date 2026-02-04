<script lang="ts">
  import 'material-symbols/sharp.css';
  import { clickOutside } from '$utils/toolkit/clickOutside';
  import { onMount, onDestroy } from 'svelte';

  export type MenuItem = {
    type?: 'action' | 'separator' | 'toggle' | 'number' | 'select';
    label?: string;
    icon?: string;
    disabled?: boolean;
    danger?: boolean;
    highlight?: boolean;

    // Action & Submenu
    action?: () => void;
    children?: MenuItem[];

    // Toggle (Checkbox)
    checked?: boolean;
    onToggle?: (val: boolean) => void;

    // Number Input
    value?: number | string;
    min?: number;
    max?: number;
    step?: number;
    onChange?: (val: any) => void;

    // Select (CustomSelector)
    options?: string[];
    // uses 'value' and 'onChange' from above
  };

  type Props = {
    label?: string;
    icon?: string;
    items: MenuItem[];
    position?: 'bottom-left' | 'bottom-right';
  };

  let {
    label = null,
    icon = null,
    items,
    position = 'bottom-left',
  }: Props = $props();

  let isOpen = $state(false);
  let activeSelectorIndex = $state<number | null>(null); // Tracks which inner selector is open

  let triggerRef: HTMLButtonElement | undefined = $state();
  let menuRef: HTMLDivElement | undefined = $state();

  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }

  $effect(() => {
    if (isOpen && triggerRef && menuRef) {
      const rect = triggerRef.getBoundingClientRect();
      let top = rect.bottom + 5;
      let left = rect.left;

      if (position === 'bottom-right') {
        left = rect.right - menuRef.offsetWidth;
      }

      menuRef.style.top = `${top}px`;
      menuRef.style.left = `${left}px`;

      const menuRect = menuRef.getBoundingClientRect();
      if (menuRect.right > window.innerWidth) {
        menuRef.style.left = `${window.innerWidth - menuRect.width - 10}px`;
      }
    }
  });

  $effect(() => {
    if (isOpen) {
      const onScroll = () => close();
      window.addEventListener('scroll', onScroll, true);
      return () => window.removeEventListener('scroll', onScroll, true);
    }
  });

  function toggle() {
    isOpen = !isOpen;
    if (!isOpen) activeSelectorIndex = null;
  }

  function close() {
    isOpen = false;
    activeSelectorIndex = null;
  }

  function handleAction(item: MenuItem) {
    if (item.disabled || item.children) return;
    if (item.action) item.action();
    close();
  }

  function handleOutsideClick(event: MouseEvent) {
    if (triggerRef && triggerRef.contains(event.target as Node)) return;
    close();
  }

  // Prevents menu from closing when interacting with inner inputs
  function stopProp(e: Event) {
    e.stopPropagation();
  }
</script>

<div class="dropdown-container">
  <button
    class="trigger"
    onclick={toggle}
    class:isActive={isOpen}
    aria-expanded={isOpen}
    bind:this={triggerRef}
  >
    {#if icon}<span class="material-symbols-sharp trigger-icon">{icon}</span
      >{/if}
    {#if label}<span class="trigger-label">{label}</span>{/if}
  </button>

  {#if isOpen}
    <div
      class="menu"
      class:bottom-left={position === 'bottom-left'}
      class:bottom-right={position === 'bottom-right'}
      use:portal
      use:clickOutside={handleOutsideClick}
      bind:this={menuRef}
    >
      {@render menuList(items)}
    </div>
  {/if}
</div>

{#snippet menuList(listItems: MenuItem[])}
  <ul class="menu-list">
    {#each listItems as item, idx}
      {#if item.type === 'separator'}
        <li class="separator"></li>
      {:else if item.type === 'toggle'}
        <li class="control-item" onclick={stopProp}>
          <div class="control-label">
            {#if item.icon}<span class="material-symbols-sharp icon"
                >{item.icon}</span
              >{/if}
            <span>{item.label}</span>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              checked={item.checked}
              onchange={(e) => item.onToggle?.(e.currentTarget.checked)}
            />
            <span class="slider round"></span>
          </label>
        </li>
      {:else if item.type === 'number'}
        <li class="control-item" onclick={stopProp}>
          <div class="control-label">
            {#if item.icon}<span class="material-symbols-sharp icon"
                >{item.icon}</span
              >{/if}
            <span>{item.label}</span>
          </div>
          <div class="number-stepper">
            <button
              class="step-btn"
              onclick={() =>
                item.onChange?.(Number(item.value) - (item.step || 1))}
              >-</button
            >
            <span class="step-val">{item.value}</span>
            <button
              class="step-btn"
              onclick={() =>
                item.onChange?.(Number(item.value) + (item.step || 1))}
              >+</button
            >
          </div>
        </li>
      {:else if item.type === 'select'}
        <li class="control-item select-container" onclick={stopProp}>
          <div class="selector-wrapper">
            <div class="sel-label">{item.label}</div>
            <div class="sel-divider"></div>
            <div class="sel-value-section">
              <button
                class="sel-trigger"
                class:isActive={activeSelectorIndex === idx}
                onclick={() =>
                  (activeSelectorIndex =
                    activeSelectorIndex === idx ? null : idx)}
              >
                <span class="curr-val">{item.value}</span>
                <span class="arrow" class:open={activeSelectorIndex === idx}
                  >▼</span
                >
              </button>

              {#if activeSelectorIndex === idx}
                <div class="sel-dropdown">
                  {#each item.options || [] as opt}
                    <button
                      class="sel-option"
                      class:selected={opt === item.value}
                      onclick={() => {
                        item.onChange?.(opt);
                        activeSelectorIndex = null;
                      }}
                    >
                      {opt}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </li>
      {:else}
        <li class="menu-item-wrapper">
          <button
            class="menu-item"
            class:danger={item.danger}
            class:highlight={item.highlight}
            disabled={item.disabled}
            onclick={() => handleAction(item)}
          >
            {#if item.icon}<span class="material-symbols-sharp icon"
                >{item.icon}</span
              >{/if}
            <span class="label">{item.label}</span>
            {#if item.children}<span class="material-symbols-sharp chevron"
                >chevron_right</span
              >{/if}
          </button>
          {#if item.children}
            <div class="submenu">{@render menuList(item.children)}</div>
          {/if}
        </li>
      {/if}
    {/each}
  </ul>
{/snippet}

<style lang="scss">
  input,
  button {
    margin: 0;
    padding: 0;
  }
  /* --- Containers --- */
  .dropdown-container {
    display: inline-block;
  }

  /* --- Trigger --- */
  .trigger {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    border-radius: var(--border-radius-global, 4px);
    border: var(--border-thin, 1px solid #ccc);
    background-color: var(--surface-primary, #fff);
    color: var(--text-primary, #333);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    height: 45px;
    width: 45px;
    margin: 3px;
    cursor: pointer;
    box-sizing: border-box;
    transition: background 0.2s;

    &:hover:not(:disabled, :active) {
      background-color: var(--interactive-button-hover, #f0f0f0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 1);
    }
    &.isActive,
    &:active {
      background-color: var(--interactive-button-hover, #e0e0e0);
    }
    &:active {
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 1);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .trigger-icon {
      font-size: 1.5rem;
    }
  }

  /* --- Menu --- */
  .menu {
    all: unset;
    position: fixed;
    z-index: 9999;
    min-width: 200px;
    background-color: var(--surface-primary, #fff);
    color: var(--text-primary, #333);
    border: 1px solid #ccc;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 6px;
    padding: 0.3rem 0;
    animation: fade-in 0.1s ease-out;
  }

  .menu-list {
    all: unset;
    list-style: none;
    margin: 0;
    padding: 0;
    display: block;
  }

  /* --- Standard Items --- */
  .menu-item-wrapper {
    position: relative;
  }
  .menu-item {
    all: unset;
    box-sizing: border-box;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
    cursor: pointer;
    &:hover:not(:disabled) {
      background-color: var(--surface-interactive-hover, #f5f5f5);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    &.danger {
      color: #d32f2f;
    }
    &.highlight {
      color: #2e7d32;
    }
    .icon {
      font-size: 1.1rem;
    }
    .chevron {
      margin-left: auto;
      font-size: 1.1rem;
      opacity: 0.6;
    }
  }

  /* --- Controls (Toggle/Number/Select) --- */
  .control-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.8rem;
    gap: 1rem;
    &.select-container {
      padding: 0.4rem 0.5rem;
      justify-content: center;
    }
  }

  .control-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    .icon {
      font-size: 1.1rem;
      opacity: 0.8;
    }
  }

  /* --- Toggle Switch --- */
  .switch {
    position: relative;
    display: inline-block;
    width: 34px;
    height: 18px;
    input {
      opacity: 0;
      width: 0;
      height: 0;
    }
  }
  .slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
    &:before {
      position: absolute;
      content: '';
      height: 12px;
      width: 12px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }
  input:checked + .slider {
    background-color: #2196f3;
  }
  input:checked + .slider:before {
    transform: translateX(16px);
  }

  /* --- Number Stepper --- */
  .number-stepper {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--text-primary, grey);
    background: var(--surface-hover, #f0f0f0);
    border-radius: 4px;
    padding: 2px;
    .step-btn {
      border: none;
      color: var(--surface-primary, grey);
      background: var(--text-primary, #fff);
      cursor: pointer;
      width: 20px;
      height: 20px;
      border-radius: 3px;
      font-weight: bold;
      &:hover {
        background: #e0e0e0;
      }
    }
    .step-val {
      font-size: 0.8rem;
      min-width: 20px;
      text-align: center;
    }
  }

  /* --- Integrated Custom Selector --- */
  .selector-wrapper {
    display: flex;
    align-items: stretch;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #f9f9f9;
    width: 100%;
    position: relative;
  }
  .sel-label {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    background: var(--surface-primary, #eaeaea);
    color: var(--surface-primary, #555);
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  .sel-divider {
    width: 1px;
    background: #ccc;
  }
  .sel-value-section {
    flex: 1;
    position: relative;
  }
  .sel-trigger {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: 0 0.5rem;
    box-sizing: border-box;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    gap: 0.5rem;
    &:hover {
      background: #f0f0f0;
    }
    .arrow {
      font-size: 0.6rem;
      transition: transform 0.2s;
    }
    .arrow.open {
      transform: rotate(180deg);
    }
  }
  /* Inner Dropdown for Selector */
  .sel-dropdown {
    position: absolute;
    top: calc(100% + 2px);
    left: -1px;
    right: -1px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    z-index: 10001;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    max-height: 150px;
    overflow-y: auto;
  }
  .sel-option {
    all: unset;
    padding: 0.4rem;
    font-size: 0.85rem;
    text-align: center;
    cursor: pointer;
    &:hover {
      background: var(--surface-primary, #f0f0f0);
    }
    &.selected {
      background: #e8f5e9;
      color: #2e7d32;
      font-weight: bold;
    }
  }

  /* --- Submenu --- */
  .submenu {
    display: none;
    position: absolute;
    left: 100%;
    top: -0.3rem;
    min-width: 180px;
    background: var(--surface-primary, #fff);
    border: 1px solid #ccc;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 0.3rem 0;
  }
  .menu-item-wrapper:hover > .submenu {
    display: block;
  }

  .separator {
    height: 1px;
    background: #eee;
    margin: 0.3rem 0;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
