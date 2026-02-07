import { mount, unmount } from 'svelte';
import App from './App.svelte';
import '$scss/app.scss';
import { userConfig } from '$stores/userConfig.svelte.ts';
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
[FEN "8/p6p/6k1/1pp2r2/7R/KP4P1/P7/8 w - - 2 31"]
[SetUp "1"]

31. Re4! (31. Rf4?) a5? {[%eval 3.02]} 32. Re8 {[%eval #-3]} Rf2 {[%eval 1.02] [%EV 23.7]} (32... Rg5? {EV:
71.5%}) *`;

  const userTextFromAnki = textDiv?.innerHTML ?? null;
  const boardModeFromAnki = target.getAttribute('data-boardMode') || 'Puzzle';

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
// @ts-ignore
window.mountChess = mountApp;

// Anki will handle mounting after reading user config
if (document.getElementById('chessRs-root')) mountApp();
