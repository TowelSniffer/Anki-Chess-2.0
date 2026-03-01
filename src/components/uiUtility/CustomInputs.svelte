<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  type Props = {
    type: 'toggle' | 'number' | 'select';
    label?: string;
    value?: any;
    onChange?: (val: any) => void;

    // Number specific
    min?: number;
    max?: number;
    step?: number;

    // Select specific
    options?: any[];
  };

  let {
    type,
    label,
    value,
    onChange,
    min = -Infinity,
    max = Infinity,
    step = 1,
    options = [],
  }: Props = $props();

  // --- Select Logic ---
  let isSelectOpen = $state(false);
  let selectRef: HTMLDivElement | undefined = $state();

  function toggleSelect() {
    isSelectOpen = !isSelectOpen;
  }

  function handleSelect(val: any) {
    onChange?.(val);
    isSelectOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (isSelectOpen && selectRef && !selectRef.contains(event.target as Node)) {
      isSelectOpen = false;
    }
  }

  onMount(() => document.addEventListener('click', handleClickOutside));
  onDestroy(() => document.removeEventListener('click', handleClickOutside));

  // --- Number Logic ---
  function handleNumberInput(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    const val = parseFloat(target.value);

    if (!isNaN(val)) {
      const constrained = Math.min(max, Math.max(min, val));
      onChange?.(constrained);
      if (constrained !== val) {
        target.value = String(constrained);
      }
    } else {
      target.value = String(value);
    }
  }

  function handleNumberKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
      return;
    }
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', '.'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }
</script>

<div class="custom-input-container">
  {#if type === 'toggle'}
    <div class="control-item">
      {#if label}<span class="label">{label}</span>{/if}
      <label class="switch">
        <input
          type="checkbox"
          checked={value}
          onchange={(e) => onChange?.(e.currentTarget.checked)}
        />
        <span class="slider round"></span>
      </label>
    </div>
  {:else if type === 'number'}
    <div class="control-item">
      {#if label}<span class="label">{label}</span>{/if}
      <div class="number-stepper">
        <button class="step-btn" onclick={() => onChange?.(Math.max(min, Number(value) - step))}
          >-</button
        >
        <input
          type="number"
          class="step-input"
          {value}
          inputmode="decimal"
          enterkeyhint="done"
          onblur={handleNumberInput}
          onkeydown={handleNumberKeydown}
          onclick={(e) => e.currentTarget.select()}
        />
        <button class="step-btn" onclick={() => onChange?.(Math.min(max, Number(value) + step))}
          >+</button
        >
      </div>
    </div>
  {:else if type === 'select'}
    <div class="selector-wrapper" bind:this={selectRef}>
      {#if label}
        <div class="sel-label">{label}</div>
        <div class="sel-divider"></div>
      {/if}
      <div class="sel-value-section">
        <!-- A ghost element to help keep sizing uniform -->
        <div class="ghost-sizer" aria-hidden="true">
          {#each options as opt}
            <div class="ghost-opt">{opt} ▼</div>
          {/each}
        </div>
        <button
          class="sel-trigger"
          class:isActive={isSelectOpen}
          onclick={toggleSelect}
          type="button"
        >
          <span class="curr-val">{value}</span>
          <span class="arrow" class:open={isSelectOpen}>▼</span>
        </button>

        {#if isSelectOpen}
          <div class="sel-dropdown">
            {#each options as opt}
              <button
                class="sel-option"
                class:selected={opt === value}
                onclick={() => handleSelect(opt)}
                type="button"
              >
                {opt}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  /* --- Global Reset for Buttons inside Inputs --- */
  button {
    all: unset;
  }

  .custom-input-container {
    display: flex;
    align-items: center;
  }

  .control-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 0.5rem;
  }

  .label {
    font-size: 0.85rem;
    color: var(--text-primary, #333);
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
      display: flex;
      align-items: center;
      justify-content: center;
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
      &:active {
        background: #e0e0e0;
      }
    }

    .step-input {
      all: unset;
      font-size: 0.8rem;
      min-width: 20px;
      max-width: 40px;
      text-align: center;
      color: inherit;
      background: transparent;
      cursor: text;

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      appearance: textfield;
      -moz-appearance: textfield;
    }
  }

  /* --- Select Control --- */
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
    display: flex;
    align-items: center;
  }
  .sel-divider {
    width: 1px;
    background: #ccc;
  }
  .sel-value-section {
    color: var(--surface-primary, #fff);
    flex: 1;
    position: relative;
    min-width: 60px;
  }
  .ghost-sizer {
    grid-area: 1 / 1;
    visibility: hidden;
    pointer-events: none;
    height: 0;
  }
  .sel-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: 0.3rem 0.5rem;
    box-sizing: border-box;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--surface-primary, #222);
    gap: 0.3rem;
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
    padding: 0.4rem;
    font-size: 0.85rem;
    cursor: pointer;
    color: var(--surface-secondary, #333);
    &:hover {
      background: var(--text-muted, #f0f0f0);
    }
    &.selected {
      background: #e8f5e9;
      color: #2e7d32;
      font-weight: bold;
    }
  }
</style>
