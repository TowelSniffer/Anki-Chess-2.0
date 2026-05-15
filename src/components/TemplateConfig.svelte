<script lang="ts">
  import { slide } from 'svelte/transition';
  import { userConfig } from '$stores/userConfig.svelte';
  import { getMenuData } from '$utils/configs/menu';
  import CustomInputs from '$components/uiUtility/CustomInputs.svelte';
  import defaultConfig from '$anki/default_config.json';
  import { generateFrontHtml } from '$anki/ankiConnect';
  import backTemplate from '$anki/back.html?raw';
  import defaultCss from '$anki/style.css?raw';

  import IconAdd from '~icons/material-symbols/add';
  import IconDelete from '~icons/material-symbols/delete';
  import IconSave from '~icons/material-symbols/save';
  import IconClose from '~icons/material-symbols/close';

  // DEV OVERLAY PROP
  let { onClose = undefined }: { onClose?: () => void } = $props();

  // 1. Load Data
  let models = $state((window as any).__ADDON_STATE__ || []);
  let activeModelIdx = $state(0);
  let activeCardIdx = $state(0);
  let initialPayloadJSON = $state(JSON.stringify(models));

  let activeModel = $derived(models[activeModelIdx]);
  let activeCard = $derived(activeModel?.cards[activeCardIdx]);

  // Derive the complete current state dynamically, injecting the active config
  let currentPayloadJSON = $derived.by(() => {
    if (models.length === 0) return "[]";
    const snapshot = structuredClone($state.snapshot(models));
    if (snapshot[activeModelIdx] && snapshot[activeModelIdx].cards[activeCardIdx]) {
      snapshot[activeModelIdx].cards[activeCardIdx].config = $state.snapshot(userConfig.opts);
    }
    return JSON.stringify(snapshot);
  });

  let hasChanges = $derived(currentPayloadJSON !== initialPayloadJSON);

  $effect(() => {
    if (activeCard) {
      userConfig.opts = { ...activeCard.config };
    }
  });

  function switchCard(newModelIdx: number, newCardIdx: number) {
    if (activeCard) {
      activeCard.config = $state.snapshot(userConfig.opts);
    }
    activeModelIdx = newModelIdx;
    activeCardIdx = newCardIdx;
  }

  // 2. Fetch Menu Layout
  let fullMenu = $derived.by(() => getMenuData(() => {}));
  let sidebarTabs = $derived.by(() => fullMenu.filter((item) => item.children));

  let activeTabLabel = $state<string | undefined>();
  let activeTab = $derived(sidebarTabs.find((t) => t.label === activeTabLabel) || sidebarTabs[0]);

  // 3. Select Option Builders
  let modelOptions = $derived.by(() => {
    return models.map((m: any, i: number) => ({
      label: m.modelName,
      value: i
    }));
  });

  let cardOptions = $derived.by(() => {
    if (!activeModel) return [];
    return activeModel.cards.map((c: any, i: number) => ({
      label: c.cardName,
      value: i
    }));
  });

  // --- Handlers ---
  function updateBaselineStructure(action: string, name?: string) {
    let baseline = JSON.parse(initialPayloadJSON);

    switch(action) {
      case 'addModel':
        baseline.push({ modelName: name, cards: [{ cardName: 'Card 1', config: structuredClone(defaultConfig) }] });
        break;
      case 'addCard':
        if (baseline[activeModelIdx]) {
          baseline[activeModelIdx].cards.push({ cardName: name, config: $state.snapshot(userConfig.opts) });
        }
        break;
      case 'deleteModel':
        baseline.splice(activeModelIdx, 1);
        break;
      case 'deleteCard':
        if (baseline[activeModelIdx]) {
          baseline[activeModelIdx].cards.splice(activeCardIdx, 1);
        }
        break;
    }

    initialPayloadJSON = JSON.stringify(baseline);
  }

  async function handleNewModel() {
    const name = prompt("Enter new Note Type name:");
    if (name) {
      const w = window as any;
      if (typeof w.pycmd !== 'undefined') {
        const payload = JSON.stringify({
          modelName: name,
          frontHtml: generateFrontHtml(defaultConfig),
          backHtml: backTemplate,
          css: defaultCss
        });
        w.pycmd(`ankiChess:createNoteType:${payload}`);
      }

      updateBaselineStructure('addModel', name);

      models.push({ modelName: name, cards: [{ cardName: 'Card 1', config: structuredClone(defaultConfig) }] });
      switchCard(models.length - 1, 0);
    }
  }

  async function handleNewCard() {
    const name = prompt("Enter new Card name:");
    if (name && activeModel) {
      const w = window as any;
      if (typeof w.pycmd !== 'undefined') {
        const payload = JSON.stringify({
          modelName: activeModel.modelName,
          cardName: name,
          // Use current config so Anki DB matches local Svelte state
          frontHtml: generateFrontHtml($state.snapshot(userConfig.opts)),
          backHtml: backTemplate
        });
        w.pycmd(`ankiChess:addCard:${payload}`);
      }

      updateBaselineStructure('addCard', name);

      activeModel.cards.push({ cardName: name, config: $state.snapshot(userConfig.opts) });
      switchCard(activeModelIdx, activeModel.cards.length - 1);
    }
  }

  async function handleDeleteModel() {
    if (confirm(`Delete ${activeModel.modelName}?\n\nWARNING: This will delete all Anki notes associated with this type.`)) {
      const w = window as any;
      if (typeof w.pycmd !== 'undefined') {
        const payload = JSON.stringify({ modelName: activeModel.modelName });
        w.pycmd(`ankiChess:deleteModel:${payload}`);
      }

      updateBaselineStructure('deleteModel');

      models.splice(activeModelIdx, 1);
      switchCard(0, 0);
    }
  }

  async function handleDeleteCard() {
    if (confirm(`Delete ${activeCard.cardName}?`)) {
      const w = window as any;
      if (typeof w.pycmd !== 'undefined') {
        const payload = JSON.stringify({
          modelName: activeModel.modelName,
          cardName: activeCard.cardName
        });
        w.pycmd(`ankiChess:deleteCard:${payload}`);
      }

      updateBaselineStructure('deleteCard');

      activeModel.cards.splice(activeCardIdx, 1);
      switchCard(activeModelIdx, 0);
    }
  }

  async function saveToAnki() {
     if (activeCard) {
        activeCard.config = $state.snapshot(userConfig.opts);
     }

     const payload = JSON.stringify($state.snapshot(models));
     const w = window as any;

     let retries = 0;
     while (typeof w.pycmd === 'undefined' && retries < 40) {
         await new Promise(r => setTimeout(r, 50));
         retries++;
     }

     if (typeof w.pycmd !== 'undefined') {
         try {
             w.pycmd(`ankiChess:saveAll:${payload}`);
             initialPayloadJSON = currentPayloadJSON;
         } catch(e) {
             alert("Bridge Error: Failed to send data to Anki.");
         }
     } else {
         console.log("Dev Mode Save Payload:", JSON.parse(payload));
         alert("Dev Mode: pycmd is undefined. Payload logged to console.");
     }
  }
</script>

<div class="addon-layout">
  <header class="header-bar">
    <div class="header-left">
      <h2>Templates</h2>
    </div>

    {#if models.length > 0}
      <div class="selectors">
        <div class="control-group">
          <CustomInputs
            type="select"
            label="Type"
            value={activeModelIdx}
            onChange={(val) => { if (typeof val === 'number') switchCard(val, 0); }}
            options={modelOptions}
            width="200px"
          />
          <button class="icon-action" onclick={handleNewModel} title="New Note Type"><IconAdd /></button>
          <button class="icon-action danger" onclick={handleDeleteModel} disabled={models.length <= 1} title="Delete Note Type"><IconDelete /></button>
        </div>

        <div class="control-group">
          <CustomInputs
            type="select"
            label="Card"
            value={activeCardIdx}
            onChange={(val) => { if (typeof val === 'number') switchCard(activeModelIdx, val); }}
            options={cardOptions}
            width="200px"
          />
          <button class="icon-action" onclick={handleNewCard} title="New Card Side"><IconAdd /></button>
          <button class="icon-action danger" onclick={handleDeleteCard} disabled={activeModel?.cards.length <= 1} title="Delete Card Side"><IconDelete /></button>
        </div>
      </div>
    {:else}
      <span class="no-data center-absolute">No chessRs templates found.</span>
    {/if}


    <div class="header-right">
      <button class="save-btn" onclick={saveToAnki} disabled={models.length === 0 || !hasChanges}>
        <IconSave /> Save
      </button>

      <!-- DEV MODE ONLY EXIT BUTTON -->
      {#if onClose}
        <button class="dev-close-btn" onclick={onClose} title="Close Dev Overlay">
          <IconClose />
        </button>
      {/if}
    </div>
  </header>

  <div class="main-body">
    <nav class="sidebar">
      {#each sidebarTabs as tab}
        <button
          class="tab-btn"
          class:active={activeTabLabel === tab.label}
          onclick={() => activeTabLabel = tab.label}
        >
          {#if tab.icon}
            <span class="tab-icon">
              {#if typeof tab.icon === 'string'}
                 <span class="material-symbols-sharp">{tab.icon}</span>
              {:else}
                 <tab.icon />
              {/if}
            </span>
          {/if}
          <span class="tab-label">{tab.label}</span>
        </button>
      {/each}
    </nav>

    <main class="content-area">
      {#key activeTabLabel}
        {#if activeTab && activeTab.children}
          <div class="settings-group">
            <h3 class="section-title">{activeTab.label}</h3>

            <div class="settings-list">
              {#each activeTab.children as item}
                {#if item.type === 'separator'}
                    <div class="separator"></div>
                {:else if item}
                    <div
                      class="setting-row"
                      class:sub-item={item.indent}
                      transition:slide={{ duration: 250 }}
                    >
                      <div class="setting-info">
                        <span class="setting-label">{item.label}</span>
                        {#if item.tooltip}<span class="setting-desc">{item.tooltip}</span>{/if}
                      </div>
                      <div class="setting-control">
                        <CustomInputs
                          type={item.type as "number" | "select" | "toggle"}
                          value={item.type === 'toggle' ? item.checked : item.value}
                          onChange={item.type === 'toggle' ? item.onToggle : item.onChange}
                          options={item.options}
                          min={item.min} max={item.max} step={item.step}
                        />
                      </div>
                    </div>
                {/if}
              {/each}
            </div>
          </div>
        {/if}
      {/key}
    </main>
  </div>
</div>

<style lang="scss">
  .addon-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: var(--surface-primary);
    color: var(--text-primary);
    font-family: sans-serif;
  }

  /* --- HEADER --- */
  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem; /* Ensures the middle section doesn't crash into the title/buttons */
    padding: 0.8rem 1rem;
    background: var(--surface-secondary);
    border-bottom: 1px solid var(--surface-hover);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 10;

    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
    }

    h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--status-pass);
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 0.2rem;
    }

    .icon-action {
      all: unset;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.2rem;
      border-radius: var(--border-radius-global);
      cursor: pointer;
      color: var(--text-muted);
      transition: background 0.1s, color 0.1s;
      font-size: 1.1rem;

      &:hover:not(:disabled) {
        background: var(--surface-hover);
        color: var(--text-primary);
      }

      &.danger:hover:not(:disabled) {
        color: var(--status-fail);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .selectors {
      flex: 1; /* Take up all available unused space */
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      background: var(--surface-primary);
      padding: 0.2rem 0.5rem;
      border-radius: var(--border-radius-global);
      border: var(--border-thin);
    }

    /* EMPTY STATE */
    .center-absolute {
      flex: 1;
      text-align: center;
      color: var(--text-muted);
    }

    .save-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--status-pass);
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: var(--border-radius-global);
      cursor: pointer;
      font-weight: bold;
      font-size: 0.95rem;
      transition: opacity 0.2s;

      &:hover:not(:disabled) { opacity: 0.9; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .dev-close-btn {
      all: unset;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--status-fail);
      color: white;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      cursor: pointer;
      font-size: 1.2rem;

      &:hover { opacity: 0.8; }
    }
  }

  /* --- BODY & SIDEBAR --- */
  .main-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .sidebar {
    width: 240px;
    background: var(--surface-secondary);
    border-right: 1px solid var(--surface-hover);
    overflow-y: auto;
    padding: 1rem 0;

    .tab-btn {
      all: unset;
      box-sizing: border-box;
      width: 100%;
      padding: 0.8rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      cursor: pointer;
      font-size: 0.95rem;
      transition: background 0.1s;
      color: var(--text-muted);

      .tab-icon {
        font-size: 1.2rem;
        display: flex;
      }

      &:hover {
        background: var(--surface-hover);
        color: var(--text-primary);
      }

      &.active {
        background: var(--surface-primary);
        border-left: 4px solid var(--status-pass);
        color: var(--text-primary);
        font-weight: 600;
        padding-left: calc(1.5rem - 4px); /* Prevent layout shift */
      }
    }
  }

  /* --- CONTENT AREA --- */
  .content-area {
    flex: 1;
    padding: 2rem 3rem;
    overflow-y: auto;
    background: var(--surface-primary);
  }

  .settings-group {
    max-width: 800px;
    margin: 0 auto;

    .section-title {
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      border-bottom: 1px solid var(--surface-hover);
      padding-bottom: 0.5rem;
      color: var(--text-primary);
    }
  }

  .settings-list {
    display: flex;
    flex-direction: column;
  }

  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 0;

    /* Hide border if followed by a separator */
    &:has(+ .separator) {
      border-bottom: none;
    }

    /* If followed by an indented child, remove the border and tighten the gap */
    &:has(+ .sub-item) {
      padding-bottom: 1.5rem;
    }

    &:last-child {
      border-bottom: none;
    }

    /* Styles for the dependent child option */
    &.sub-item {
      padding-top: 0.4rem;
      padding-bottom: 0.8rem; /* Keep the bottom tight too */
      padding-left: 2rem;
      border-bottom: none; /* Sub-items shouldn't have bottom borders */
      position: relative;

      /* Optional: Add a subtle vertical line connecting it to the parent */
      &::before {
        content: '';
        position: absolute;
        left: 0.8rem;
        top: -0.8rem; /* Stretch up to the parent */
        bottom: 1.2rem;
        width: 2px;
        background: var(--surface-hover);
        border-radius: 2px;
      }

      /* If multiple sub-items are chained together, keep them tight */
      &:has(+ .sub-item) {
        border-bottom: none;
        padding-bottom: 0.4rem;
        &::before {
          bottom: -0.4rem; /* Stretch line down to the next child */
        }
      }
    }

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      max-width: 70%;
    }

    .setting-label {
      font-weight: 600;
      font-size: 1rem;
    }

    .setting-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .setting-control {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 120px;
    }
  }

  .separator {
    height: 1px;
    /* Make the section break slightly more distinct than a standard row border */
    background: var(--text-muted);
    opacity: 0.3;
    margin: 1rem 0; /* Add nice breathing room between groups */
  }
</style>
