<script lang="ts">
  import { onMount, onDestroy, type Component } from 'svelte';

  type SelectOption = {
    type?: 'option' | 'action' | 'separator';
    label?: string;
    value?: any;
    icon?: Component | string;
    sprite?: string;
    color1?: string;
    color2?: string;
    action?: () => void;
    danger?: boolean;
    disabled?: boolean;
  };

  type Props = {
    type: 'toggle' | 'number' | 'select';
    label?: string;
    icon?: Component | string;
    value?: any;
    onChange?: (val: any) => void;
    maxWidth?: string;
    width?: string;

    // Number specific
    min?: number;
    max?: number;
    step?: number;

    // Select specific
    options?: SelectOption[] | string[];
  };

  let {
    type,
    label,
    icon,
    value,
    onChange,
    maxWidth,
    width,
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

  // Normalize strings into objects and default the type to 'option'
  const normalizedOptions = $derived.by(() => {
    const safeOptions = Array.isArray(options) ? options : [];
    return safeOptions.map((opt) =>
      typeof opt === 'string'
        ? { label: opt, value: opt, type: 'option' as const }
        : { type: 'option' as const, ...opt }
    );
  });
</script>

{#snippet itemIcon(iconProp: Component | string | undefined)}
  {#if typeof iconProp === 'string'}
    <span class="material-symbols-sharp icon">{iconProp}</span>
  {:else if iconProp}
    {@const Icon = iconProp}
    <span class="icon"><Icon /></span>
  {/if}
{/snippet}

<div class="custom-input-container" style="{width ? `width: ${width};` : ''} {maxWidth ? `max-width: ${maxWidth};` : ''}">
  {#if type === 'toggle'}
    <div class="control-item">
      {#if label}<span class="label">{label}</span>{/if}
      {@render itemIcon(icon)}
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
      {@render itemIcon(icon)}
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
      {@render itemIcon(icon)}
      <div class="sel-value-section">
        <!-- Ghost Sizer -->
        <div class="ghost-sizer" aria-hidden="true">
          {#each normalizedOptions as opt}
            <div class="ghost-opt">{opt.label} <span class="arrow">▼</span></div>
          {/each}
        </div>
        <button
          class="sel-trigger"
          class:isActive={isSelectOpen}
          class:has-label={!!label}
          onclick={toggleSelect}
          type="button"
        >
          <span class="curr-val">
            {normalizedOptions.find((o) => o.value === value)?.label || value}
          </span>
          <span class="arrow" class:open={isSelectOpen}>▼</span>
        </button>

        {#if isSelectOpen}
          <div class="sel-dropdown">
            {#each normalizedOptions as opt}
              {#if opt.type === 'separator'}
                <div class="sel-separator"></div>
              {:else if opt.type === 'action'}
                <button
                  class="sel-option action-opt"
                  class:danger={opt.danger}
                  class:disabled={opt.disabled}
                  onclick={(e) => {
                    e.stopPropagation();
                    if (opt.disabled) return;
                    opt.action?.();
                    isSelectOpen = false;
                  }}
                  type="button"
                >
                  <div class="opt-content">
                    {@render itemIcon(opt.icon)}
                    <span class="opt-label">{opt.label}</span>
                  </div>
                </button>
              {:else}
                <button
                  class="sel-option"
                  class:selected={opt.value === value}
                  onclick={() => handleSelect(opt.value)}
                  type="button"
                >
                  <div class="opt-content">
                    {#if opt.sprite}
                      <div class="opt-icon sprite" style="background-image: url('{opt.sprite}')"></div>
                    {/if}
                    {#if opt.color1 && opt.color2}
                      <div class="opt-swatch-container">
                        <div class="swatch" style="background: {opt.color1}"></div>
                        <div class="swatch" style="background: {opt.color2}"></div>
                      </div>
                    {/if}
                    <span class="opt-label">{opt.label}</span>
                  </div>
                </button>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  $trigger-padding: 0.3rem 0.5rem;

  button { all: unset; }

  .custom-input-container {
    display: flex;
    align-items: center;
    width: auto;
    min-width: 0; /* Crucial for flexbox text truncation */
  }

  .control-item {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
  }

  .label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-primary, #555);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }

  /* Shared Icon wrapper */
  :global(.custom-input-container .icon) {
    @include flex-center;
    font-size: 1.1rem;
    width: 1.5rem;
    height: 1.5rem;
    color: inherit;
    flex-shrink: 0;
  }

  /* --- Toggle Switch & Number Stepper --- */
  .switch { position: relative; display: inline-block; width: 34px; height: 18px; input { opacity: 0; width: 0; height: 0; } }
  .slider { position: absolute; cursor: pointer; inset: 0; background-color: var(--surface-hover); transition: 0.4s; border-radius: 34px; &:before { position: absolute; content: ''; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: 0.4s; border-radius: 50%; } }
  input:checked + .slider { background-color: #2196f3; }
  input:checked + .slider:before { transform: translateX(16px); }

  .number-stepper { display: flex; align-items: center; gap: 5px; color: var(--text-primary, grey); background: var(--surface-hover, #f0f0f0); border-radius: 4px; padding: 2px; .step-btn { @include unselectable; display: flex; align-items: center; justify-content: center; border: none; color: var(--surface-primary, grey); background: var(--text-muted, #fff); cursor: pointer; width: 20px; height: 20px; border-radius: 3px; font-weight: bold; &:hover { background: var(--text-muted); } &:active { background: #2196f3; } } .step-input { all: unset; font-size: 0.8rem; min-width: 20px; max-width: 40px; text-align: center; color: inherit; background: transparent; cursor: text; &::-webkit-outer-spin-button, &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } appearance: textfield; -moz-appearance: textfield; } }

  /* --- Select Control --- */
  .selector-wrapper {
    display: flex;
    align-items: stretch;
    border: var(--border-thin);
    background: var(--surface-secondary);
    border-radius: 4px;
    /* Let the wrapper hug the content up to 100% of the container */
    width: 100%;
    max-width: 100%;
    min-width: 0;
    position: relative;
  }

  .sel-label {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    background: var(--surface-hover, #eaeaea);
    color: var(--text-primary, #555);
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .sel-divider {
    width: 1px;
    background: var(--border-thin, #ccc);
  }

  .sel-value-section {
    display: grid;
    color: var(--surface-primary, #fff);
    width: 100%;
    max-width: 100%;
    min-width: 0;
    position: relative;
  }

  .ghost-sizer {
    grid-area: 1 / 1;
    display: grid;
    visibility: hidden;
    pointer-events: none;
    min-width: 0;
  }

  .ghost-opt {
    grid-area: 1 / 1;
    padding: 0.3rem 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .sel-trigger {
    grid-area: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: $trigger-padding;
    box-sizing: border-box;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-primary, #222);
    gap: 0.5rem;
    min-width: 0; /* CRITICAL */

    /* Default to rounded left corners (for when there is no label) */
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;

    /* If there IS a label, flatten the left side to sit flush against the divider */
    &.has-label {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    &:hover {
      background: var(--surface-hover);
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    .curr-val {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      text-align: left;
      min-width: 0; /* CRITICAL */
    }

    .arrow { font-size: 0.6rem; transition: transform 0.2s; flex-shrink: 0; }
    .arrow.open { transform: rotate(180deg); }
  }

  .sel-dropdown {
    color: var(--surface-primary, #fff);
    position: absolute;
    top: calc(100% + 4px);

    left: -1px;
    /* Lock width perfectly to the parent trigger */
    width: calc(100% + 2px);

    background: var(--surface-secondary);
    border: var(--border-thin);
    border-radius: 4px;
    z-index: 10001;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    max-height: 250px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sel-option {
    padding: 0.5rem;
    font-size: 0.85rem;
    cursor: pointer;
    color: var(--text-primary);
    width: 100%;
    box-sizing: border-box;

    &:hover:not(.disabled) { background: var(--surface-hover); }
    &.selected { background: rgba(33, 150, 243, 0.15); color: #2196f3; font-weight: bold; }
    &.action-opt {
      font-weight: 500;
      color: var(--text-primary);
      &.danger { color: #d32f2f; }
      &.disabled { opacity: 0.5; cursor: not-allowed; }
    }
  }

  .sel-separator {
    height: 1px;
    background: var(--surface-hover);
    margin: 0.2rem 0;
  }

  .opt-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    min-width: 0; /* CRITICAL: Allows flex child to shrink */
  }

  .opt-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    text-align: left;
    min-width: 0; /* CRITICAL: Triggers the ellipsis */
  }

  .opt-icon {
    width: 20px;
    height: 20px;
    @include flex-center;
    &.sprite {
      background-size: 600% 200%;
      background-position: 80% 0%;
    }
  }

  .opt-swatch-container {
    display: flex;
    border: 1px solid #ccc;
    border-radius: 2px;
    overflow: hidden;
  }

  .swatch { width: 12px; height: 12px; }
</style>
