import type { BoardModes } from '$Types/ChessStructs';
import { mount } from 'svelte';
import App from './App.svelte';
import TemplateConfig from '$components/TemplateConfig.svelte';
import HelpWrapper from '$components/HelpWrapper.svelte';
import '$scss/app.scss';
import { devPgn, devBoardMode, devText } from '$configs/defaults';

// The logic to mount the app
const mountApp = () => {
  const target = document.getElementById('chessRs-root');
  if (!target) return;

  // Prevent double mounting on the EXACT same element
  if (target.hasAttribute('data-mounted')) {
      // Retained DOM: If the answer marker is here, ensure UI updates
      if (document.getElementById('chessRs-isAnswer') && window.updateChessMode) {
          window.updateChessMode('Viewer');
      }
      return;
  }
  target.setAttribute('data-mounted', 'true');

  // Check if we are in the Python Addon Settings Webview
  if (target.getAttribute('data-mode') === 'addon-settings') {
    mount(TemplateConfig, { target });
    return;
  }

  if (target.getAttribute('data-mode') === 'addon-about') {
    mount(HelpWrapper, {
      target,
      props: { isHelpOpen: true, isStandalone: true }
    });
    return;
  }

  const textDiv = document.getElementById('anki-textField');
  const pgnDiv = document.getElementById('anki-pgn');

  let pgnContent = pgnDiv ? pgnDiv.textContent?.trim() : devPgn;

  // --- Check for the answer side marker (anki) ---
  const isAnswerSide = document.getElementById('chessRs-isAnswer') !== null;

  let boardMode: BoardModes = import.meta.env.DEV
    ? devBoardMode
    : (isAnswerSide ? 'Viewer' : (target.getAttribute('data-boardMode') as BoardModes));

  const userTextFromAnki = import.meta.env.DEV ? devText : (textDiv?.innerHTML ?? '');

  mount(App, {
    target,
    props: {
      rawPgn: pgnContent,
      boardMode: boardMode,
      userText: userTextFromAnki,
    },
  });
};

// Expose the function globally so Anki can call it
window.mountChess = mountApp;

// Anki will handle mounting after reading user config
if (document.getElementById('chessRs-root')) mountApp();
