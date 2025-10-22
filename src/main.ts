import 'chessground/assets/chessground.base.css';
import './custom.css';
import { initPgnViewer } from './js/pgnViewer';
import { initializeUI } from './js/initializeUI';
import { loadChessgroundBoard } from './js/chessFunctions';
import { setupEventListeners } from './js/toolbox';


(function loadElements(): void {
    initializeUI();
    initPgnViewer();
    loadChessgroundBoard();
    setupEventListeners();
})();

