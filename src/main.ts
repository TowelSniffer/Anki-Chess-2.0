import type { BoardModes } from '$Types/ChessStructs';
import { mount, unmount } from 'svelte';
import App from './App.svelte';
import '$scss/app.scss';
import { devPgn, devBoardMode, devText } from '$configs/defaults';

// Track the current instance so we can destroy it before re-mounting
let appInstance: any = null;

// The logic to mount the app
const mountApp = () => {
  const target =
    document.getElementById('anki-chess-root') ?? document.getElementById('chessRs-root');

  // Prevent double mounting
  if (!target || target.hasAttribute('data-mounted')) return;
  target.setAttribute('data-mounted', 'true');

  // Clean up existing instance if we are re-mounting (Anki specific)
  if (target) target.innerHTML = '';

  // If the target div isn't there (e.g. wrong card type), do nothing
  if (!target) return;

  const textDiv = document.getElementById('anki-textField');
  const pgnDiv = document.getElementById('anki-pgn');

  let pgnContent = pgnDiv ? pgnDiv.textContent?.trim() : devPgn;
  let boardModeFromAnki: BoardModes =
    (target.getAttribute('data-boardMode') as BoardModes) || devBoardMode;

  const userTextFromAnki = import.meta.env.DEV ? devText : (textDiv?.innerHTML ?? '');

  // If an app already exists, unmount it to prevent memory leaks
  if (appInstance) {
    unmount(appInstance);
    appInstance = null;
  }

  appInstance = mount(App, {
    target,
    props: {
      pgn: pgnContent,
      boardMode: boardModeFromAnki,
      userText: userTextFromAnki,
    },
  });
};

// Expose the function globally so Anki can call it
window.mountChess = mountApp;

// Anki will handle mounting after reading user config
if (document.getElementById('chessRs-root')) mountApp();
