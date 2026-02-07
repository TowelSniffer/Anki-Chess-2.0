<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Component } from 'svelte';

  type Props = {
    value: any;
    options: any[];
    onChange: (val: any) => void;
    label?: string;
    icon?: Component | string;
  };

  let { value, onChange, options, label, icon }: Props = $props();

  // State for the dropdown visibility
  let isOpen = $state(false);
  let valueTriggerRef: HTMLDivElement; // Reference to the right-side container

  function toggle() {
    isOpen = !isOpen;
  }

  function select(val: any) {
    onChange(val);
    isOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    // Only close if clicking outside the specific trigger area
    if (valueTriggerRef && !valueTriggerRef.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onMount(() => document.addEventListener('click', handleClickOutside));
  onDestroy(() => document.removeEventListener('click', handleClickOutside));
</script>

<!-- Outer Box (The visual border) -->
<div class="control-wrapper">
  <!-- Left Side: Static Label -->
  <div class="label-section">
    {label}
  </div>

  <!-- Vertical Divider -->
  <div class="divider"></div>

  <!-- Right Side: Interactive Value (Dropdown Anchor) -->
  <div class="value-section" bind:this={valueTriggerRef}>
    <button
      class="trigger-btn"
      class:isActive={isOpen}
      onclick={toggle}
      type="button"
    >
      <span class="current-value">{value}</span>
      {#if icon}
        {#if typeof icon === 'string'}
          <span>{icon}</span>
        {:else}
          {@const Icon = icon}
          <Icon />
        {/if}
      {/if}
      <span class="arrow" class:open={isOpen}>▼</span>
    </button>

    {#if isOpen}
      <div class="dropdown-list">
        {#each options as option}
          <button
            class="option-item"
            class:selected={option === value}
            onclick={() => select(option)}
            type="button"
          >
            {option}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  button {
    /* --- Remove anki Defaults --- */
    all: unset;
  }

  /* The Main Container (Draws the border) */
  .control-wrapper {
    display: inline-flex;
    align-items: stretch; /* Ensures divider touches top/bottom */
    border: 1px solid black;
    border-radius: 6px;
    background: var(--surface-primary, #f4f4f5);
    overflow: visible; /* Allows dropdown to spill out */
  }

  /* Left Side: Label */
  .label-section {
    display: flex;
    align-items: center;
    padding: 0.2rem 0.5rem;
    color: var(--text-primary, #fff);
    font-size: 0.7rem;
    font-weight: 550;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    cursor: default;
  }

  /* The Vertical Line */
  .divider {
    width: 1px;
    background-color: var(--text-muted, #ccc);
  }

  /* Right Side: The Context for the Dropdown */
  .value-section {
    position: relative; /* KEY: Anchors the absolute dropdown to this side only */
    display: flex;
    flex-direction: column;
    min-width: 60px; /* Ensures the dropdown isn't too skinny */
  }

  .value-icon {
    font-size: 1rem;
  }

  /* The button inside the right side */
  .trigger-btn {
    flex: 1;
    @include flex-center;
    gap: 0.3rem;
    padding: 0.2rem 0.4rem;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 550;
    color: var(--text-primary, #222);
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    transition: background 0.2s;
  }

  .trigger-btn:hover:not(.isActive) {
    background-color: var(--text-muted, #f9f9f9);
  }

  .isActive {
    box-shadow: inset 0px 0px 3px rgba(0, 0, 0, 1);
  }

  /* 5. The Dropdown Popup */
  .dropdown-list {
    position: absolute;
    top: calc(100% + 4px); /* Pushes it down slightly */
    left: 0;
    right: 0; /* Stretches width to match .value-section */
    background: white;
    border: 1px solid black;
    border-radius: 6px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.8);
    z-index: 50;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Internal Styling */
  .arrow {
    font-size: 0.7rem;
    color: var(--text-muted, #888);
    transition: transform 0.2s;
  }
  .arrow.open {
    transform: rotate(180deg);
  }

  .option-item {
    padding: 0.2rem;
    background: var(--text-primary, none);
    color: var(--surface-primary, none);
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    text-align: center;
  }
  .option-item:hover {
    background-color: var(--text-muted, #f0f0f0);
  }
  .option-item.selected {
    background-color: #a5d6a7;
    color: #2c2c2c;
    font-weight: bold;
  }
</style>
