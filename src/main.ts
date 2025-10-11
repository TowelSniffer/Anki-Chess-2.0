import 'chessground/assets/chessground.base.css';
import './custom.css';
import { state, stateProxy } from './js/config';
import { initPgnViewer } from './js/pgnViewer';
import { initializeUI } from './js/initializeUI';
import { loadChessgroundBoard } from './js/chessFunctions';
import { setupEventListeners } from './js/toolbox';


(function loadElements(): void {
    initializeUI();
    initPgnViewer();
    loadChessgroundBoard();
    setupEventListeners();

    const path = state.pgnPath;
    if (path.length) {
        state.cg.set({ animation: { enabled: false } }); // disable animation for inital startup
        stateProxy.pgnPath = path;
        state.cg.set({ animation: { enabled: true } });
    }
})();

