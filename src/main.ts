import type { BoardModes } from '$Types/ChessStructs';
import { mount, unmount } from 'svelte';
import App from './App.svelte';
import '$scss/app.scss';
import { engineStore } from '$stores/engineStore.svelte';

// Track the current instance so we can destroy it before re-mounting
let appInstance: any = null;

// The logic to mount the app
const mountApp = () => {
  const target =
    document.getElementById('anki-chess-root') ??
    document.getElementById('chessRs-root');

  // Prevent double mounting
  if (!target || target.hasAttribute('data-mounted')) return;
  target.setAttribute('data-mounted', 'true');

  // Clean up existing instance if we are re-mounting (Anki specific)
  if (target) target.innerHTML = '';

  // If the target div isn't there (e.g. wrong card type), do nothing
  if (!target) return;

  const textDiv = document.getElementById('anki-textField');
  const pgnDiv = document.getElementById('anki-pgn');

  const pgnFromAnki = pgnDiv
    ? pgnDiv.textContent?.trim()
    : `[Event "?"]
[Site "?"]
[Date "2026.02.14"]
[Round "?"]
[White "White"]
[Black "Black"]
[Result "*"]

1. e4 (1. d4 d5 (1... e5)) e5 (1... d5) *
`;

  const userTextFromAnki = textDiv?.innerHTML ?? null;
  const boardModeFromAnki: BoardModes = target.getAttribute('data-boardMode') as BoardModes || 'Puzzle';

  // If an app already exists, unmount it to prevent memory leaks
  if (appInstance) {
    unmount(appInstance);
    engineStore.stopAndClear();
    appInstance = null;
  }

  appInstance = mount(App, {
    target,
    props: {
      pgn: pgnFromAnki,
      boardMode: boardModeFromAnki,
      userText: userTextFromAnki,
    },
  });
};

// Expose the function globally so Anki can call it
window.mountChess = mountApp;

// Anki will handle mounting after reading user config
if (document.getElementById('chessRs-root')) mountApp();
