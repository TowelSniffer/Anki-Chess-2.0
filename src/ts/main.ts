import 'chessground/assets/chessground.base.css';
import type { PgnMove } from '@mliebelt/pgn-types';

import '../scss/main.scss';

import { state } from './core/state';
import { eventEmitter } from './core/stateProxy';
import { initPgnViewer, augmentPgnTree } from './features/pgn/pgnViewer';
import { initializeUI, positionPromoteOverlay } from './features/ui/initializeUI';
import { setupEventListeners } from './features/ui/eventListeners';
import { loadChessgroundBoard } from './features/board/chessFunctions';
import { changeCurrentPgnMove } from './features/board/pgnPathChanged';
import { scorePuzzle } from './features/board/puzzleScored';

// --- eventEmitters handle updates to board state ---

// handle changing boad position
eventEmitter.on('pgnPathChanged', (pgnPath, lastMove, pathMove) => {
    changeCurrentPgnMove(pgnPath, lastMove, pathMove);
});

// handle marking puzzle
eventEmitter.on('puzzleScored', (errorTrack) => {
    scorePuzzle(errorTrack);
});

// --- Run Inital Setup ---

(function loadElements(): void {
    augmentPgnTree(state.parsedPGN.moves as PgnMove[]);
    initializeUI();
    initPgnViewer();
    loadChessgroundBoard();
    positionPromoteOverlay();
    setupEventListeners();
})();

