<script lang="ts">
  import IconExpand from '~icons/material-symbols/keyboard-arrow-down';

  /*
   * The note's text above the board. A text laid out as a panel (the importer's Lichess
   * puzzles: a title, then a grid of label and value) can fold its grid under Details. It's
   * open unless it was folded on an earlier card: the choice is kept on this device.
   * joined: the front's row of tools follows, on the same surface.
   */
  let { text, joined = false }: { text: string; joined?: boolean } = $props();

  const FOLDED_KEY = 'ankiChess:noteTextFolded';

  // The panel's grid, and the word for Details in the importer's language
  const panel = $derived.by(() => {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const info = doc.querySelector('.ac-info');
    return {
      hasGrid: !!doc.querySelector('.ac-grid'),
      details: info?.getAttribute('data-details') || 'Details',
    };
  });

  let folded = $state(readFolded());

  function readFolded(): boolean {
    try {
      return localStorage.getItem(FOLDED_KEY) === '1';
    } catch {
      return false; // No storage (a sandboxed webview): always open
    }
  }

  function toggle() {
    folded = !folded;
    try {
      localStorage.setItem(FOLDED_KEY, folded ? '1' : '0');
    } catch {
      // Kept for this card only
    }
  }
</script>

<div id="userTextContainer" class:joined class:folded={panel.hasGrid && folded}>
  <div id="textField">{@html text}</div>
  {#if panel.hasGrid}
    <button
      class="details"
      aria-expanded={!folded}
      onclick={toggle}
    >
      {panel.details}
      <IconExpand />
    </button>
  {/if}
</div>

<style lang="scss">
  #userTextContainer {
    position: relative; /* For Details */
    width: 100%;
    background: var(--surface-secondary);
    color: var(--text-primary);
    border-bottom: var(--border-thin);

    /* The front's tools continue the panel below it */
    &.joined {
      border-bottom: none;
    }
  }

  #textField {
    padding: 0.5em 0.75em;

    :global(h1),
    :global(h2),
    :global(h3) {
      margin: 0.1em 0 0.3em;
    }

    :global(a) {
      color: var(--link);
      text-decoration: none;
    }

    :global(a:hover) {
      text-decoration: underline;
    }

    /* The importer's panel (ac-*): the title with your result's dot and the rating... */
    :global(.ac-title) {
      display: flex;
      align-items: center;
      gap: 0.5em;
      margin: 0.15em 0;
      padding-right: 6.5em; /* Room for Details */
      font-size: 1.05rem;
    }

    :global(.ac-dot) {
      flex-shrink: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--text-muted);
    }

    :global(.ac-dot.ac-failed) {
      background: var(--status-fail);
    }

    :global(.ac-dot.ac-solved) {
      background: var(--status-pass);
    }

    :global(.ac-rating) {
      color: var(--text-soft);
      font-size: 0.85rem;
      font-weight: 400;
      font-variant-numeric: tabular-nums;
    }

    /* ...then a grid of label and value */
    :global(.ac-grid) {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 5px 14px;
      align-items: baseline;
      margin: 8px 0 2px;
      padding-top: 8px;
      border-top: 1px solid var(--line-soft);
      font-size: 0.82rem;
    }

    :global(.ac-grid dt) {
      color: var(--text-soft);
    }

    :global(.ac-grid dd) {
      margin: 0;
      min-width: 0;
    }

    :global(.ac-result.ac-failed) {
      color: var(--fail-text);
      font-weight: 600;
    }

    :global(.ac-result.ac-solved) {
      color: var(--pass-text);
      font-weight: 600;
    }

    :global(.ac-chip) {
      display: inline-block;
      margin: 1px 4px 2px 0;
      padding: 1px 9px;
      border-radius: 999px;
      border: 1px solid var(--chip-line);
      background: var(--chip-bg);
      font-size: 0.78rem;
      white-space: nowrap;
    }

    /* The commas between the chips, for where the panel has no style */
    :global(.ac-sep) {
      display: none;
    }
  }

  .folded #textField :global(.ac-grid) {
    display: none;
  }

  .details {
    all: unset;
    position: absolute;
    top: 0.55em;
    right: 0.5em;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 4px 6px;
    border-radius: 6px;
    color: var(--text-soft);
    font-size: 0.8rem;
    cursor: pointer;

    :global(svg) {
      width: 18px;
      height: 18px;
      transition: transform 0.15s;
    }

    &[aria-expanded='true'] :global(svg) {
      transform: rotate(180deg);
    }

    &:focus-visible {
      @include focus-ring;
    }

    @include can-hover {
      &:hover {
        background: var(--chip-bg);
        color: var(--text-primary);
      }
    }
  }
</style>
