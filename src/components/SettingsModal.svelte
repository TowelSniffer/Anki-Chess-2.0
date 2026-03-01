<script module lang="ts">
  import type { Component, Snippet } from 'svelte';
  import type { MenuItem } from './Dropdown.svelte';
  import { marked } from 'marked';

  export type SettingsSection = {
    id: string;
    label: string;
    icon?: Component | string;
    // For standard toggles, numbers, and selects
    items?: MenuItem[];
    // For raw markdown/HTML strings
    htmlContent?: string;
    mdContent?: string;
    // For complex Svelte components (like Demo Boards)
    customSnippet?: Snippet;
  };
</script>

<script lang="ts">
  import { clickOutside } from '$utils/toolkit/clickOutside';
  import IconClose from '~icons/material-symbols/close';

  type Props = {
    isOpen: boolean;
    title?: string;
    sections: SettingsSection[];
    onClose: () => void;
  };

  let { isOpen, title = 'Info', sections, onClose }: Props = $props();

  let activeTabId = $state(sections[0]?.id);
  let activeSection = $derived(sections.find(s => s.id === activeTabId) || sections[0]);

  // Action to append modal to body
  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={isOpen ? handleKeydown : null} />

{#if isOpen}
  <div class="modal-backdrop" use:portal>
    <div class="modal-container" use:clickOutside={onClose} role="dialog" aria-modal="true">

      <div class="modal-header">
        <h2>{title}</h2>
        <button class="close-btn" onclick={onClose} aria-label="Close">
          <IconClose />
        </button>
      </div>

      <div class="modal-body">
        <nav class="modal-sidebar">
          {#each sections as section}
            <button
              class="tab-btn"
              class:active={activeTabId === section.id}
              onclick={() => activeTabId = section.id}
            >
              {#if typeof section.icon === 'string'}
                <span class="material-symbols-sharp">{section.icon}</span>
              {:else if section.icon}
                <section.icon />
              {/if}
              {section.label}
            </button>
          {/each}
        </nav>

        <main class="modal-content">
          {#if activeSection}

            {#if activeSection.items}
              <div class="settings-list">
                {#each activeSection.items as item}
                  <div class="setting-row">
                    <div class="setting-info">
                      <span class="setting-label">{item.label}</span>
                      {#if item.tooltip}<span class="setting-desc">{item.tooltip}</span>{/if}
                    </div>

                    <div class="setting-control">
                      {#if item.type === 'toggle'}
                        <label class="switch">
                          <input type="checkbox" checked={item.checked} onchange={(e) => item.onToggle?.(e.currentTarget.checked)} />
                          <span class="slider round"></span>
                        </label>
                      {:else if item.type === 'number'}
                        <input type="number" class="number-input" value={item.value} onblur={(e) => item.onChange?.(parseFloat(e.currentTarget.value))} />
                      {:else if item.type === 'action'}
                        <button class="action-btn" onclick={item.action}>{item.label}</button>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}

            {#if activeSection.htmlContent}
              <div class="html-content">
                {@html activeSection.htmlContent}
              </div>
            {/if}

            {#if activeSection.mdContent}
              <div class="html-content markdown-body">
                {@html marked.parse(activeSection.mdContent)}
              </div>
            {/if}

            {#if activeSection.customSnippet}
              <div class="custom-content">
                {@render activeSection.customSnippet()}
              </div>
            {/if}

          {/if}
        </main>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
  }

  .modal-container {
    background: var(--surface-primary);
    color: var(--text-primary);
    width: 90vw;
    max-width: 800px;
    height: 80vh;
    border-radius: var(--border-radius-global);
    border: var(--border-thin);
    box-shadow: var(--shadow-strong);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--surface-hover);
    background: var(--surface-secondary);

    h2 { margin: 0; font-size: 1.2rem; }

    .close-btn {
      all: unset;
      cursor: pointer;
      font-size: 1.5rem;
      padding: 0.2rem;
      &:hover { color: var(--status-error); }
    }
  }

  .modal-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .modal-sidebar {
    width: 200px;
    background: var(--surface-secondary);
    border-right: 1px solid var(--surface-hover);
    padding: 0.5rem 0;
    overflow-y: auto;

    .tab-btn {
      all: unset;
      box-sizing: border-box;
      width: 100%;
      padding: 0.8rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.9rem;

      &:hover { background: var(--surface-hover); }
      &.active {
        background: var(--surface-primary);
        border-left: 3px solid var(--status-correct);
        font-weight: bold;
      }
    }
  }

  .modal-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
  }

  /* Setting Row Styling */
  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--surface-hover);

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      max-width: 70%;
    }
    .setting-label { font-weight: bold; }
    .setting-desc { font-size: 0.8rem; color: var(--text-muted); }
  }

  .number-input {
    background: var(--surface-secondary);
    color: var(--text-primary);
    border: var(--border-thin);
    border-radius: 4px;
    padding: 0.4rem;
    width: 60px;
    text-align: center;
  }

  .action-btn {
    background: var(--surface-hover);
    color: var(--text-primary);
    border: var(--border-thin);
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    &:hover { background: var(--interactive-button-hover); }
  }

  /* Reuse our switch CSS from Dropdown */
  .switch { position: relative; display: inline-block; width: 34px; height: 18px; input { opacity: 0; width: 0; height: 0; } }
  .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: 0.4s; border-radius: 34px; &:before { position: absolute; content: ''; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: 0.4s; border-radius: 50%; } }
  input:checked + .slider { background-color: #2196f3; }
  input:checked + .slider:before { transform: translateX(16px); }

  .html-content {
    /* markdown/html styling rules... */
  }
</style>
