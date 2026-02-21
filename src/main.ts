import type { BoardModes } from '$Types/ChessStructs';
import { mount, unmount } from 'svelte';
import App from './App.svelte';
import { Chess, validateFen, DEFAULT_POSITION } from 'chess.js';
import '$scss/app.scss';
import { devPgn, devBoardMode, devText} from '$configs/defaults'
import { userConfig } from '$stores/userConfig.svelte';

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
    : devPgn;
  let boardModeFromAnki: BoardModes =
    (target.getAttribute('data-boardMode') as BoardModes) || devBoardMode;

  // Detect FEN vs PGN
  // Simple check: Does it look like a FEN? (start with piece/number, contains slashes)
  const aiPgn = sessionStorage.getItem('chess_aiPgn');
  if (aiPgn) {
    sessionStorage.removeItem('chess_aiPgn');
    if (boardModeFromAnki === 'Viewer') pgnContent = aiPgn;
  }

  const isFen = /^\s*([rnbqkbnrPNBRQK0-8]+\/){7}[rnbqkbnrPNBRQK0-8]+\s+[bw]/i.test(
    pgnContent || '',
  );

  if (isFen && pgnContent) {
    // Wrap raw FEN in a minimal PGN structure
    // SetUp "1" is crucial for PGN parsers to respect the FEN tag
    const { ok, error } = validateFen(pgnContent);
    error && console.warn(error);
    const fen = ok ? pgnContent : DEFAULT_POSITION;
    pgnContent = `[Event "AI Practice"]\n[FEN "${fen}"]\n[SetUp "1"]\n\n*`;
    if (boardModeFromAnki !== 'Viewer') {
      boardModeFromAnki = 'AI';
    }
  } else if (pgnContent) {
    const chess = new Chess();
    try {
      chess.loadPgn(pgnContent);
      // PGN is valid and loaded
    } catch (e) {
      // Invalid PGN
      const message = e instanceof Error ? e.message : 'Unknown error';
      console.error('PGN Validation Failed:', message);
      pgnContent = `[Event "AI Practice"]\n[FEN "${DEFAULT_POSITION}"]\n[SetUp "1"]\n\n*`;
    }
  }

  const userTextFromAnki = textDiv?.innerHTML || devText;

  // Refresh config from the new Window context
  userConfig.refresh();

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
