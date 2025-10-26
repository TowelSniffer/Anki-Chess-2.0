import 'chessground/assets/chessground.base.css';
import './custom.css';
import type { PgnMove } from '@mliebelt/pgn-types';
import { initPgnViewer } from './js/pgnViewer';
import { initializeUI } from './js/initializeUI';
import { loadChessgroundBoard } from './js/chessFunctions';
import { setupEventListeners } from './js/toolbox';
import { augmentPgnTree } from './js/pgnViewer';
import { state } from './js/config';

(function loadElements(): void {
    augmentPgnTree(state.parsedPGN.moves as PgnMove[]);
    initializeUI();
    initPgnViewer();
    loadChessgroundBoard();
    setupEventListeners();
})();

