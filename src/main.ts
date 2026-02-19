import type { BoardModes } from '$Types/ChessStructs';
import { mount, unmount } from 'svelte';
import App from './App.svelte';
import '$scss/app.scss';
import { userConfig } from '$stores/userConfig.svelte';
import { engineStore } from '$stores/engineStore.svelte';

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

  let pgnContent = pgnDiv
    ? pgnDiv.textContent?.trim()
    : `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`;

  // Detect FEN vs PGN
  // Simple check: Does it look like a FEN? (start with piece/number, contains slashes)
  const isFen = /^\s*([rnbqkbnrPNBRQK0-8]+\/){7}[rnbqkbnrPNBRQK0-8]+\s+[bw]/i.test(pgnContent || '');

  if (isFen && pgnContent) {
    // Wrap raw FEN in a minimal PGN structure
    // SetUp "1" is crucial for PGN parsers to respect the FEN tag
    engineStore.init(pgnContent);
    pgnContent = `[Event "AI Practice"]\n[FEN "${pgnContent}"]\n[SetUp "1"]\n\n*`;
  }

  console.log(pgnContent)
  const userTextFromAnki = textDiv?.innerHTML ?? null;
  const boardModeFromAnki: BoardModes =
    (target.getAttribute('data-boardMode') as BoardModes) || 'AI';

  // Refresh config from the new Window context
  userConfig.refresh();

  // If an app already exists, unmount it to prevent memory leaks
  if (appInstance) {
    unmount(appInstance);
    engineStore.stopAndClear();
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
