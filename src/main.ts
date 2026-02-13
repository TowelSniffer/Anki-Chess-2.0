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
[Date "2023.02.13"]
[Round "?"]
[White "White"]
[Black "Black"]
[Result "*"]
[FEN "2kr4/p1p1N2p/6q1/4nb2/3P2p1/2P5/PP1b1BPP/3KR2R b - - 1 25"]
[SetUp "1"]

25... Kb8 26. Nxg6 {[%EV 96.5] [%N 99.66% of 21.5k]} Bxe1 {[%EV 2.7] [%N 48.30% of
40.6k]} 27. Nxe5 {[%EV 97.8] [%N 99.62% of 31.6k]} Bxf2 {[%EV 2.3] [%N 86.13% of
61.1k]} 28. Nc6+ {[%EV 98.1] [%N 75.42% of 100k]} (28. Rf1 {[%EV 97.5] [%N 24.38% of
100k]}) *
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
