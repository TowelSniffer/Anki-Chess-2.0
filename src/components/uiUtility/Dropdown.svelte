<script module lang="ts">
  export type MenuItem = {
    type?: 'action' | 'separator' | 'toggle' | 'number' | 'select';
    label?: string;
    icon?: Component | string;
    tooltip?: string;
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
  };
</script>

<script lang="ts">
  import { clickOutside } from '$utils/toolkit/clickOutside';
  import { tick } from 'svelte';
  import type { Component } from 'svelte';
  import IconHelp from '~icons/material-symbols/help';
  import IconArrowRight from '~icons/material-symbols/keyboard-arrow-right';

  type Props = {
    label?: string;
    icon?: Component | string;
    items: MenuItem[];
    position?: 'bottom-left' | 'bottom-right';
  };

  let { label = '', icon = '', items, position = 'bottom-left' }: Props = $props();

  let isOpen = $state(false);
  let activeSelectorIndex = $state<number | null>(null);
  let activeTooltips = $state(new Set<MenuItem>());
  let triggerRef: HTMLButtonElement | undefined = $state();
  let menuRef: HTMLDivElement | undefined = $state();

  // --- Logic ---

  /**
   * Re-calculates the position of a submenu attached to the given LI.
   * Ensures it stays within the viewport boundaries.
   */
  function repositionSubmenu(li: HTMLElement) {
    const submenu = li.querySelector('.submenu') as HTMLElement;
    if (!submenu) return;

    // Reset transform to measure natural position
    submenu.style.transform = 'none';

    // Measure and shift
    requestAnimationFrame(() => {
      const rect = submenu.getBoundingClientRect();
      const padding = 10;
      let shiftX = 0;
      let shiftY = 0;

      // Horizontal Shift (Right Edge)
      if (rect.right > window.innerWidth) {
        shiftX = window.innerWidth - rect.right - padding;
      }

      // Vertical Shift (Bottom Edge)
      if (rect.bottom > window.innerHeight) {
        shiftY = window.innerHeight - rect.bottom - padding;
      }

      if (shiftX !== 0 || shiftY !== 0) {
        submenu.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
      }
    });
  }

  // Called on MouseEnter (existing logic)
  function adjustSubmenuPosition(e: MouseEvent) {
    repositionSubmenu(e.currentTarget as HTMLElement);
  }

  // Called on Tooltip Click (New logic)
  async function toggleTooltip(e: Event, item: MenuItem) {
    e.stopPropagation();

    // Update State
    const next = new Set(activeTooltips);
    if (next.has(item)) {
      next.delete(item);
    } else {
      next.add(item);
    }
    activeTooltips = next;

    // Wait for DOM to render the tooltip text
    await tick();

    // Find relevant containers and update positions
    const target = e.target as HTMLElement;

    // A: If this item has its OWN submenu (it's a parent), update that submenu
    const myWrapper = target.closest('.menu-item-wrapper') as HTMLElement;
    if (myWrapper) {
      repositionSubmenu(myWrapper);
    }

    // B: If this item is INSIDE a submenu, update the container submenu
    // (Because the container just grew/shrank)
    const containerSubmenu = target.closest('.submenu');
    if (containerSubmenu && containerSubmenu.parentElement) {
      repositionSubmenu(containerSubmenu.parentElement as HTMLElement);
    }
  }

  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }

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

  function stopProp(e: Event) {
    e.stopPropagation();
  }

  function handleInput(e: Event, item: MenuItem) {
    const target = e.currentTarget as HTMLInputElement;
    const val = parseFloat(target?.value);

    if (!isNaN(val)) {
      // Calculate clamped value
      const constrained = Math.min(item.max ?? Infinity, Math.max(item.min ?? -Infinity, val));

      // Update parent state
      item.onChange?.(constrained);

      // Force visual reset if the value was clamped
      // (We do this manually here because if the value clamps from 99 -> 10,
      // and the previous value was already 10, Svelte won't trigger the action update)
      if (constrained !== val) {
        target.textContent = String(constrained);
      }
    } else {
      // Reset to old value if input was garbage (NaN)
      target.textContent = String(item.value);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    // Handle Enter to save/blur
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
      return;
    }

    // Block non-numeric keys (Allow only positive whole numbers)
    // Allow navigation/editing keys (Backspace, Arrows, etc.)
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Block anything that isn't a number 0-9
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }

  // --- Reactive Logic ---

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
      menuRef.style.maxWidth = `${menuRect.width}px`;

      if (menuRect.right > window.innerWidth) {
        menuRef.style.left = `${window.innerWidth - menuRect.width - 10}px`;
      }
      if (menuRect.bottom > window.innerHeight) {
        menuRef.style.top = `${window.innerHeight - menuRect.height - 10}px`;
      }
    }
  });

  $effect(() => {
    if (isOpen) {
      const onEvent = () => close();

      // Close on scroll (capture phase to catch scrolling in sub-elements)
      window.addEventListener('scroll', onEvent, true);
      // Close on resize (standard bubble phase is fine)
      window.addEventListener('resize', onEvent);

      return () => {
        window.removeEventListener('scroll', onEvent, true);
        window.removeEventListener('resize', onEvent);
      };
    }
  });
</script>

<div class="dropdown-container tappable">
  <button
    class="trigger"
    onclick={toggle}
    class:isActive={isOpen}
    aria-expanded={isOpen}
    bind:this={triggerRef}
  >
    {#if icon}
      {#if typeof icon === 'string'}
        <span class="material-symbols-sharp trigger-icon">{icon}</span>
      {:else}
        {@const Icon = icon}
        <span class="trigger-icon">
          <Icon />
        </span>
      {/if}
    {/if}
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

{#snippet itemLabel(item: MenuItem)}
  <div class="label-container">
    {#if !item.type || item.type === 'action'}
      <div class="label-content">
        {#if typeof item.icon === 'string'}
          <span class="material-symbols-sharp icon">{item.icon}</span>
        {:else}
          <span class="icon">
            <item.icon />
          </span>
        {/if}
        <span class="text">{item.label}</span>

        {#if item.tooltip}
          <span
            class="info-hint"
            class:has-tooltip={!!item.tooltip}
            onclick={(e) => item.tooltip && toggleTooltip(e, item)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && item.tooltip && toggleTooltip(e, item)}
          >
            <IconHelp />
          </span>
        {/if}
      </div>
    {:else}
      <div
        class="label-content"
        class:has-tooltip={!!item.tooltip}
        onclick={(e) => item.tooltip && toggleTooltip(e, item)}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && item.tooltip && toggleTooltip(e, item)}
      >
        {#if item.icon}
          <span class="material-symbols-sharp icon">{item.icon}</span>
        {/if}
        <span class="text">{item.label}</span>
        {#if item.tooltip}
          <span class="info-hint material-symbols-sharp"><IconHelp /></span>
        {/if}
      </div>
    {/if}
    {#if activeTooltips.has(item)}
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div class="tooltip-text" role="note" tabindex="-1" onclick={stopProp} onkeydown={stopProp}>
        {item.tooltip}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet menuList(listItems: MenuItem[])}
  <ul class="menu-list">
    {#each listItems as item, idx}
      {#if item.type === 'separator'}
        <li class="separator"></li>
      {:else if item.type === 'toggle'}
        <li>
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <div class="control-item" role="group" onclick={stopProp} onkeydown={stopProp}>
            {@render itemLabel(item)}
            <label class="switch">
              <input
                type="checkbox"
                checked={item.checked}
                onchange={(e) => item.onToggle?.(e.currentTarget.checked)}
              />
              <span class="slider round"></span>
            </label>
          </div>
        </li>
      {:else if item.type === 'number'}
        <li>
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <div class="control-item" role="group" onclick={stopProp} onkeydown={stopProp}>
            {@render itemLabel(item)}
            <div class="number-stepper">
              <button
                class="step-btn"
                onclick={() =>
                  item.onChange?.(
                    Math.max(item.min ?? -Infinity, Number(item.value) - (item.step || 1)),
                  )}>-</button
              >
              <input
                type="number"
                class="step-input"
                value={item.value}
                inputmode="decimal"
                enterkeyhint="done"
                onblur={(e) => handleInput(e, item)}
                onkeydown={handleKeydown}
                onclick={(e) => {
                  e.stopPropagation(); // Prevent menu closing
                  e.currentTarget.select();
                }}
              />
              <button
                class="step-btn"
                onclick={() =>
                  item.onChange?.(
                    Math.min(item.max ?? Infinity, Number(item.value) + (item.step || 1)),
                  )}>+</button
              >
            </div>
          </div>
        </li>
      {:else if item.type === 'select'}
        <li>
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <div
            class="control-item select-container"
            role="group"
            onclick={stopProp}
            onkeydown={stopProp}
          >
            <div class="selector-wrapper">
              <div class="sel-label">{item.label}</div>
              <div class="sel-divider"></div>
              <div class="sel-value-section">
                <button
                  class="sel-trigger"
                  class:isActive={activeSelectorIndex === idx}
                  onclick={() => (activeSelectorIndex = activeSelectorIndex === idx ? null : idx)}
                >
                  <span class="curr-val">{item.value}</span>
                  <span class="arrow" class:open={activeSelectorIndex === idx}>▼</span>
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
          </div>
        </li>
      {:else if item}
        <li class="menu-item-wrapper" onmouseenter={adjustSubmenuPosition}>
          <div
            class="menu-item"
            role="menuitem"
            tabindex={item.disabled ? -1 : 0}
            class:danger={item.danger}
            class:highlight={item.highlight}
            class:disabled={item.disabled}
            onclick={() => handleAction(item)}
            onkeydown={(e) => e.key === 'Enter' && handleAction(item)}
          >
            {@render itemLabel(item)}

            {#if item.children}
              <IconArrowRight />
            {/if}
          </div>

          {#if item.children}
            <div class="submenu">{@render menuList(item.children)}</div>
          {/if}
        </li>
      {/if}
    {/each}
  </ul>
{/snippet}

<style lang="scss">
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
    padding: 0;
    @include flex-center;
    z-index: 20;
    border-radius: var(--border-radius-global, 4px);
    border: var(--border-thin, 1px solid #ccc);
    background-color: var(--surface-primary, #fff);
    color: var(--text-primary, #333);
    @include border-shadow;
    width: $button-size-calc;
    height: $button-size-calc;
    @include x-margin($button-margin-calc);
    cursor: pointer;
    box-sizing: border-box;
    transition: background 0.2s;

    &:hover:not(:disabled, :active, .isActive) {
      background-color: var(--interactive-button-hover, #f0f0f0);
      color: var(--surface-primary);
      @include border-shadow(0.7);
    }
    &.isActive,
    &:active {
      background-color: var(--interactive-button-active, #e0e0e0);
      color: var(--surface-primary);
      @include border-shadow(0.7, inset);
      &:hover:not(:active) {
        @include border-shadow(0.7);
      }
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .trigger-icon {
      font-size: 1.5rem;
      @include flex-center;
    }
  }

  @mixin menu-shadow($opacity) {
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, $opacity),
      0 10px 15px -3px rgba(0, 0, 0, $opacity);
  }

  /* --- Menu --- */
  .menu, .submenu {
    @include menu-shadow(0.5);
  }

  .menu {
    box-sizing: border-box;
    position: fixed;
    z-index: 9999;
    min-width: 200px;
    background-color: var(--surface-primary, #fff);
    color: var(--text-primary, #333);
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 0.3rem 0;
    animation: fade-in 0.1s ease-out;
  }

  /* --- Submenu --- */
  .submenu {
    display: block; /* Always layout so we can measure, but hide visually */
    visibility: hidden;
    opacity: 0;

    position: absolute;
    left: 100%;
    top: -0.3rem;
    min-width: 200px;
    z-index: 10001;

    /* ... (Your other styling: background, border, shadow, etc.) ... */
    background: var(--surface-primary, #fff);
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 0.3rem 0;

    /* GRACE PERIOD (Default / Mouse Leave) */
    /* Wait 0.3s before doing anything. */
    /* Then fade out opacity over 0.2s. */
    /* Keep visibility 'visible' until the fade finishes (0.3s + 0.2s = 0.5s) */
    transition-property: opacity, visibility;
    transition-duration: 0.2s, 0s;
    transition-delay: 0.3s, 0.5s;
  }

  /* OPENING (Mouse Enter Self OR Focus Inside) */
  .menu-item-wrapper:hover > .submenu,
  .menu-item-wrapper:focus-within > .submenu {
    visibility: visible;
    opacity: 1;
    transition-delay: 0s, 0s;
  }

  /* SIBLING SWITCH (Immediate Hide Logic) */
  /* If the parent list is hovered, BUT this specific item is NOT hovered... */
  .menu-list:hover > .menu-item-wrapper:not(:hover) > .submenu {
    /* FORCE HIDE: Overrides :focus-within if we are hovering a sibling */
    visibility: hidden;
    opacity: 0;

    /* Kill the delay so it vanishes immediately */
    transition-delay: 0s, 0s;
    transition-duration: 0.1s, 0s;
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
    &:hover:not(.disabled) {
      color: var(--surface-primary, #fff);
      background-color: var(--surface-interactive-hover, #f5f5f5);
    }
    .info-hint {
      opacity: 1;
      cursor: help;
      pointer-events: auto;
    }
    &.disabled {
      cursor: not-allowed;
      .text {
        opacity: 0.5;
      }
      .icon,
      .text {
        cursor: not-allowed;
        opacity: 0.5;
      }
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

  /* --- Label & Tooltip --- */
  .label-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1; /* Ensure it takes available space */
  }

  .label-content {
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    gap: 0.5rem;

    &.has-tooltip {
      cursor: help;
      /* The cursor you requested */

      &:hover .text {
        text-decoration: underline dotted;
        /* Optional visual hint */
      }
    }
  }

  .tooltip-text {
    font-size: 0.75rem;
    color: var(--surface-secondary, #666);
    background: var(--text-primary, #333);
    padding: 4px 8px;
    border-radius: 4px;
    margin-top: 4px;
    border-left: 2px solid #2196f3;
    width: 100%;
    box-sizing: border-box;
    white-space: normal;
    word-break: break-word;
    cursor: default;
  }

  .info-hint {
    font-size: 0.9rem;
    opacity: 0.5;
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
    /* --- Number Stepper Input --- */
    .step-input {
      /* Reset all default input styles */
      all: unset;
      font-size: 0.8rem;
      min-width: 20px;
      max-width: 40px; /* prevents layout shift */
      text-align: center;
      color: inherit;
      background: transparent;
      cursor: text;

      /* Hide the Up/Down spinners in WebKit (Chrome/Safari/Android) */
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Hide spinners in Firefox */
      appearance: textfield;
      -moz-appearance: textfield;
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
    font-weight: 400;
    background: var(--surface-primary, #eaeaea);
    color: var(--text-primary, #555);
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  .sel-divider {
    width: 1px;
    background: #ccc;
  }
  .sel-value-section {
    color: var(--surface-primary, #fff);
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
    color: var(--surface-primary, #fff);
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
      background: var(--text-muted, #f0f0f0);
    }
    &.selected {
      background: #e8f5e9;
      color: #2e7d32;
      font-weight: bold;
    }
  }

  .separator {
    height: 1px;
    background: var(--text-primary, #eee);
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
