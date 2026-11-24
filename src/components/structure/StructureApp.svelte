<script lang="ts">
  import '@lichess-org/chessground/assets/chessground.base.css';
  import '$scss/_components/_chessground.scss';

  import type { Api } from '@lichess-org/chessground/api';
  import type { Config } from '@lichess-org/chessground/config';
  import type { DrawShape } from '@lichess-org/chessground/draw';
  import type { Key, Piece, Role } from '@lichess-org/chessground/types';
  import type { BoardModes } from '$Types/ChessStructs';

  import { Chessground } from '@lichess-org/chessground';
  import { write as writeFen } from '@lichess-org/chessground/fen';
  import { dragNewPiece } from '@lichess-org/chessground/drag';
  import { setDropMode, cancelDropMode } from '@lichess-org/chessground/drop';
  import { getKeyAtDomPos, whitePov } from '@lichess-org/chessground/board';
  import { eventPosition } from '@lichess-org/chessground/util';
  import BoardLayout from '$components/BoardLayout.svelte';
  import { BOARD_THEMES } from '$utils/themeData';
  import { pieceSprites } from '$utils/toolkit/pieceSprites';
  import { userConfig } from '$stores/userConfig.svelte';
  import {
    ROLES,
    checkAttempt,
    counts,
    destinations,
    given,
    parseStructure,
    piecesOf,
    type Attempt,
  } from '$features/structure/structure';

  /*
   * A structure card: the opponent's pieces are on the board, and you place yours from
   * the palette (tap a piece then the squares, or drag it), then Check. The back shows
   * the whole structure, your mistakes and the plans.
   */
  let { rawPgn: initialRawPgn, boardMode: initialBoardMode, userText } = $props();

  // svelte-ignore state_referenced_locally
  let rawPgn = $state(initialRawPgn);
  // svelte-ignore state_referenced_locally
  let boardMode = $state<BoardModes>(initialBoardMode);

  // The attempt, kept for the back side (a new page on Anki desktop)
  const STORAGE_KEY = 'chess_structure_attempt';
  const ERASER = 'eraser';

  userConfig.refresh();
  const structure = $derived(parseStructure(rawPgn));
  const side = $derived(structure.side);
  const isViewer = $derived(boardMode === 'Viewer');
  const themeColors = $derived(BOARD_THEMES[userConfig.opts.boardTheme] || BOARD_THEMES['wood']);
  const sprite = $derived(pieceSprites[userConfig.opts.pieceTheme] || pieceSprites['merida']);
  const targetCounts = $derived(counts(structure.target, side));
  const total = $derived(ROLES.reduce((sum, role) => sum + targetCounts[role], 0));

  let cg: Api | undefined;
  let placed = $state(new Map<Key, Piece>()); // your pieces on the board
  let tool = $state<Role | typeof ERASER | null>(null);
  let result = $state<Attempt | null>(null); // after Check (front), or the attempt (back)
  let attempted = $state(false); // the back side has an attempt to show
  const placedCounts = $derived(counts(placed, side));
  const score = $derived(
    result ? { correct: result.correct.length, wrong: result.wrong.length, perfect: !result.wrong.length && !result.missing.length } : null,
  );

  $effect(() => {
    (window as any).updateChessMode = (newMode: BoardModes) => {
      if (boardMode !== newMode) boardMode = newMode;
    };
    (window as any).updateRawPgn = (newPgn: string) => {
      if (rawPgn !== newPgn) rawPgn = newPgn;
    };
    return () => {
      delete (window as any).updateChessMode;
      delete (window as any).updateRawPgn;
    };
  });

  $effect(() => {
    document.body.classList.toggle('light-theme', userConfig.opts.lightMode);
  });

  // --- Board ---

  function boardFor(pieces: Map<Key, Piece>, shapes: DrawShape[]): Config {
    return {
      fen: writeFen(pieces),
      orientation: side,
      turnColor: side,
      viewOnly: isViewer,
      coordinates: true,
      highlight: { lastMove: false, check: false },
      animation: { enabled: true, duration: 150 },
      premovable: { enabled: false },
      predroppable: { enabled: false },
      draggable: { enabled: true, deleteOnDropOff: true, showGhost: true },
      selectable: { enabled: true },
      movable: {
        free: false,
        color: side,
        showDests: false,
        dests: destinations(pieces, side),
      },
      drawable: { enabled: false, visible: true, autoShapes: shapes },
      events: { change: onChange },
    };
  }

  function loadBoard(node: HTMLDivElement) {
    cg = Chessground(node, {});
    if (import.meta.env.DEV) (window as any).structureCg = cg;
    showMode();
    // Taps with a palette piece or the eraser, before Chessground sees them
    node.addEventListener('mousedown', onBoardDown, true);
    node.addEventListener('touchstart', onBoardDown, { capture: true, passive: false });
    const observer = new ResizeObserver(() => requestAnimationFrame(() => cg?.redrawAll()));
    observer.observe(document.body);
    return {
      destroy: () => {
        observer.disconnect();
        node.removeEventListener('mousedown', onBoardDown, true);
        node.removeEventListener('touchstart', onBoardDown, true);
        cg?.destroy();
      },
    };
  }

  // Front: the opponent's pieces to build on. Back: the whole structure and your mistakes.
  function showMode() {
    if (!cg) return;
    if (isViewer) {
      const attempt = readAttempt();
      attempted = !!attempt;
      result = attempt ? checkAttempt(structure.target, attempt, side) : null;
      const mistakes: DrawShape[] = result
        ? [...result.wrong, ...result.missing].map((orig) => ({ orig, brush: 'red' }))
        : [];
      tool = null;
      cg.set(boardFor(structure.target, [...structure.shapes, ...mistakes]));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      placed = new Map();
      result = null;
      cg.set(boardFor(given(structure), []));
    }
  }

  // Turning the card in place (Anki keeps the page): the board still holds the front's
  // pieces, saved now (a change is reported a moment after it happens)
  // svelte-ignore state_referenced_locally
  let shownMode = boardMode;
  $effect(() => {
    if (boardMode === shownMode) return;
    if (boardMode === 'Viewer' && shownMode !== 'Viewer') saveAttempt();
    shownMode = boardMode;
    showMode();
  });

  function onChange() {
    if (!cg || isViewer) return;
    placed = piecesOf(cg.state.pieces, side);
    // A move or a new piece passes the turn: it stays yours, for the next piece
    cg.set({ turnColor: side, movable: { dests: destinations(cg.state.pieces, side) } });
    if (result) {
      // An edit after Check: the marks are for the board as it was
      result = null;
      cg.setAutoShapes([]);
    }
    saveAttempt();
  }

  function keyAt(e: MouseEvent | TouchEvent): Key | undefined {
    const position = eventPosition(e as any);
    return cg && position ? getKeyAtDomPos(position, whitePov(cg.state), cg.state.dom.bounds()) : undefined;
  }

  // A piece of yours tapped with a palette piece: the same one is removed, another replaces
  // it. With the eraser, it's removed.
  function onBoardDown(e: MouseEvent | TouchEvent) {
    if (!cg || isViewer) return;
    // Chessground passes the turn after each piece; every tap is yours
    cg.state.turnColor = side;
    if (!tool) return;
    const key = keyAt(e);
    const piece = key && cg.state.pieces.get(key);
    if (piece && piece.color === side) {
      e.stopPropagation();
      e.preventDefault();
      const replace = tool !== ERASER && tool !== piece.role;
      cg.setPieces(new Map([[key, replace ? { role: tool as Role, color: side } : undefined]]));
      onChange();
    } else if (tool === ERASER) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  // --- Palette ---

  function pick(role: Role | typeof ERASER) {
    if (!cg) return;
    tool = tool === role ? null : role;
    if (tool && tool !== ERASER) setDropMode(cg.state, { role: tool, color: side });
    else cancelDropMode(cg.state);
  }

  function dragFromPalette(e: PointerEvent, role: Role) {
    if (!cg || e.button > 0) return;
    cg.state.turnColor = side;
    dragNewPiece(cg.state, { role, color: side }, e as any);
  }

  function clearBoard() {
    if (!cg) return;
    cg.setPieces(new Map([...placed.keys()].map((key) => [key, undefined])));
    onChange();
  }

  function check() {
    if (!cg) return;
    result = checkAttempt(structure.target, cg.state.pieces, side);
    const marks: DrawShape[] = [
      ...result.correct.map((orig) => ({ orig, brush: 'green' })),
      ...result.wrong.map((orig) => ({ orig, brush: 'red' })),
      // The piece that goes there, faded
      ...result.missing.map((orig) => ({
        orig,
        brush: 'blue',
        piece: { role: structure.target.get(orig)!.role, color: side, scale: 0.8 },
      })),
    ];
    cg.setAutoShapes(marks);
    saveAttempt();
  }

  // --- The attempt, for the back side ---

  function saveAttempt() {
    if (!cg) return;
    const pieces = [...piecesOf(cg.state.pieces, side)].map(([key, piece]) => [key, piece.role]);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ id: structure.id, pieces }));
  }

  function readAttempt(): Map<Key, Piece> | null {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
      if (!saved || saved.id !== structure.id) return null;
      return new Map(saved.pieces.map(([key, role]: [Key, Role]) => [key, { role, color: side }]));
    } catch {
      return null;
    }
  }

  const borderColor = $derived(
    score ? `var(--status-${score.perfect ? 'perfect' : 'fail'})` : side === 'white' ? '#eaeaea' : '#0f0f0f',
  );
  const sideName = $derived(side === 'white' ? 'White' : 'Black');
</script>

<div class="structure" style:--theme-sprite="url('{sprite}')">
  <BoardLayout {themeColors} showComments={true}>
    {#snippet comments()}
      {#if userText}
        <div class="text-field">{@html userText}</div>
      {/if}
      {#if !isViewer}
        <div class="palette" aria-label="Your pieces">
          <div class="hint">Place the {sideName} pieces: tap one, then the squares, or drag it.</div>
          <div class="pieces">
            {#each ROLES as role}
              <button
                class="piece-button"
                class:selected={tool === role}
                class:none={!targetCounts[role]}
                title={role}
                onpointerdown={(e) => dragFromPalette(e, role)}
                onclick={() => pick(role)}
              >
                <span class="piece {role} {side}"></span>
                <span
                  class="count"
                  class:done={targetCounts[role] > 0 && placedCounts[role] === targetCounts[role]}
                  class:over={placedCounts[role] > targetCounts[role]}
                >
                  {placedCounts[role]}/{targetCounts[role]}
                </span>
              </button>
            {/each}
            <button class="piece-button eraser" class:selected={tool === ERASER} title="Remove a piece" onclick={() => pick(ERASER)}>
              <span class="eraser-icon">✕</span>
              <span class="count">erase</span>
            </button>
          </div>
          <div class="actions">
            <button class="action" onclick={clearBoard} disabled={!placed.size}>Clear</button>
            <button class="action check" onclick={check}>Check</button>
          </div>
        </div>
      {/if}
      {#if score}
        <div class="score" class:perfect={score.perfect}>
          {#if isViewer}You placed {score.correct} of {total}{:else}{score.correct} / {total} correct{/if}{#if score.wrong}, {score.wrong} misplaced{/if}
        </div>
      {:else if isViewer && !attempted}
        <div class="score">Not attempted</div>
      {/if}
      {#if isViewer && structure.comment}
        <div class="plans">{structure.comment}</div>
      {/if}
    {/snippet}
    {#snippet board()}
      <div class="board-wrapper" style:--border-color={borderColor}>
        <div id="board" class="tappable" class:view-only={isViewer} use:loadBoard></div>
      </div>
    {/snippet}
  </BoardLayout>
</div>

<style lang="scss">
  .structure {
    display: contents;
  }

  .text-field {
    @include flex-center;
    flex-direction: column;
    padding: 0.5em;
    background: var(--surface-secondary);
    border-bottom: var(--border-thin);
  }

  .palette {
    padding: 8px;
    border-bottom: var(--border-thin);

    .hint {
      font-size: 0.9em;
      margin-bottom: 6px;
      opacity: 0.85;
    }

    .pieces {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .piece-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2px;
      border: var(--border-thin);
      border-radius: var(--border-radius-global);
      // The board's light square: black pieces stay visible on a dark theme too
      background: var(--board-light);
      color: #222;
      cursor: pointer;
      touch-action: none; // a drag from the palette isn't a scroll

      &.selected {
        background: var(--board-dark);
        box-shadow: inset 0 0 0 3px var(--status-pass);
      }
      &.none .piece {
        opacity: 0.35;
      }
    }

    .piece {
      width: 100%;
      max-width: 48px;
      aspect-ratio: 1 / 1;
      background-image: var(--theme-sprite);
      background-size: 600% 200%;
      &.white { background-position-y: 0%; }
      &.black { background-position-y: 100%; }
      &.king { background-position-x: 0%; }
      &.queen { background-position-x: 20%; }
      &.rook { background-position-x: 40%; }
      &.bishop { background-position-x: 60%; }
      &.knight { background-position-x: 80%; }
      &.pawn { background-position-x: 100%; }
    }

    .eraser-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 48px;
      aspect-ratio: 1 / 1;
      font-size: 1.4em;
    }

    .count {
      font-size: 0.8em;
      font-weight: bold;
      font-variant-numeric: tabular-nums;
      &.done {
        color: #1b7a33;
      }
      &.over {
        color: #c62828;
      }
    }

    .actions {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }

    .action {
      flex: 1;
      padding: 6px;
      border: var(--border-thin);
      border-radius: var(--border-radius-global);
      background: var(--surface-secondary);
      color: var(--text-primary);
      font-size: 1em;
      cursor: pointer;
      &.check {
        font-weight: bold;
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .score {
    padding: 8px;
    font-weight: bold;
    border-bottom: var(--border-thin);
    color: var(--status-fail);
    &.perfect {
      color: var(--status-perfect);
    }
  }

  .plans {
    padding: 8px;
    white-space: pre-line;
    line-height: 1.4;
  }

  .board-wrapper {
    position: relative;
    width: var(--board-size);
    height: var(--board-size);
    border-radius: var(--border-radius-global);
    border: $board-border-width solid var(--border-color);
    box-sizing: border-box;
    background-color: var(--border-color);
    transition: border-color 0.3s ease;
  }

  #board {
    width: 100%;
    height: 100%;
    cursor: pointer;
    position: relative;
    z-index: 7;
    border-radius: 4px;

    // The faded piece of a square still missing a piece (Check)
    :global(cg-auto-pieces piece) {
      background-image: var(--theme-sprite);
      background-size: 600% 200% !important;
      opacity: 0.45;
    }
    :global(cg-auto-pieces piece.white) { background-position-y: 0%; }
    :global(cg-auto-pieces piece.black) { background-position-y: 100%; }
    :global(cg-auto-pieces piece.king) { background-position-x: 0%; }
    :global(cg-auto-pieces piece.queen) { background-position-x: 20%; }
    :global(cg-auto-pieces piece.rook) { background-position-x: 40%; }
    :global(cg-auto-pieces piece.bishop) { background-position-x: 60%; }
    :global(cg-auto-pieces piece.knight) { background-position-x: 80%; }
    :global(cg-auto-pieces piece.pawn) { background-position-x: 100%; }

    &.view-only :global(piece) {
      cursor: default;
    }
  }
</style>
