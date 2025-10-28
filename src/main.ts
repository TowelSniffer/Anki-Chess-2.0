import 'chessground/assets/chessground.base.css';
import './custom.css';
import type { PgnMove } from '@mliebelt/pgn-types';

import { state, config } from './js/config';
import { initPgnViewer, isEndOfLine, highlightCurrentMove, augmentPgnTree } from './js/pgnViewer';
import { initializeUI, positionPromoteOverlay } from './js/initializeUI';
import { animateBoard, loadChessgroundBoard } from './js/chessFunctions';
import { setupEventListeners } from './js/eventListeners';
import { eventEmitter, stateProxy } from './js/stateProxy';
import { moveAudio } from './js/audio';
import { startAnalysis } from './js/handleStockfish';
import { drawArrows } from './js/arrows';
import { stopPlayerTimer } from './js/timer';
import { setButtonsDisabled, borderFlash } from './js/toolbox';

// --- eventEmitter handles updates to board state ---

// handle changing boad position
eventEmitter.on('pgnPathChanged', (pgnPath, lastMove, pathMove) => {
    if (!pgnPath.length) {
        setButtonsDisabled(['back', 'reset'], true);
        state.chess.reset();
        state.chess.load(state.startFen);
        state.lastMove = null;
    } else {
        setButtonsDisabled(['back', 'reset'], false);
    }

    if (pathMove) {
        state.chess.load(pathMove.after)
        moveAudio(pathMove);
    };
    setTimeout(() => {
        // timeout is needed here for some animations. dont know why
        animateBoard(lastMove, pathMove);
    }, 2)
    startAnalysis(config.analysisTime);
    drawArrows(pgnPath);
    highlightCurrentMove(pgnPath);

    const endOfLineCheck = isEndOfLine(pgnPath);
    if (endOfLineCheck) {
        if (config.boardMode === 'Puzzle') {
            state.puzzleComplete = true;
            const correctState = (state.puzzleTime > 0 && !config.timerScore) ? "correctTime" : "correct";
            stateProxy.errorTrack = state.errorTrack ?? correctState;
        } else {
            state.chessGroundShapes = [];
        }
    }
    setButtonsDisabled(['forward'], endOfLineCheck);
    const { chess: _chess, cg: _cg, cgwrap: _cgwrap, puzzleComplete: _puzzleComplete, ...stateCopy } = state;
    stateCopy.pgnPath = pgnPath;
    window.parent.postMessage(stateCopy, '*');
    animateBoard(lastMove, pathMove);
});

// handle marking puzzle
eventEmitter.on('puzzleScored', (errorTrack) => {
    const { chess: _chess, cg: _cg, cgwrap: _cgwrap, ...stateCopy } = state;

    const endOfLineCheck = isEndOfLine(state.pgnPath);
    if (endOfLineCheck) stateCopy.puzzleComplete = true;

    if (errorTrack === "correct") {
        state.solvedColour = "var(--correct-color)";
        if (config.autoAdvance) {
            stateCopy.puzzleComplete = true;
        };
    } else if (errorTrack === "correctTime") {
        state.solvedColour = "var(--perfect-color)";
    } else if (errorTrack === "incorrect") {
        state.solvedColour = "var(--incorrect-color)";
        if (config.timerAdvance && state.puzzleTime === 0 ||
            config.handicapAdvance
        ) {
            stateCopy.puzzleComplete = true;
        }
    }
    if (stateCopy.puzzleComplete) {
        stopPlayerTimer();
        state.cgwrap.classList.remove('timerMode');
        document.documentElement.style.setProperty('--border-color', state.solvedColour);
        state.cg.set({ viewOnly: true });
        setTimeout(() => {
            stateCopy.pgnPath = state.pgnPath;
            window.parent.postMessage(stateCopy, '*');
        }, state.delayTime);
    }
    if (state.solvedColour){
        borderFlash()
    }  else {
        borderFlash("var(--incorrect-color)");
    }
});

(function loadElements(): void {
    augmentPgnTree(state.parsedPGN.moves as PgnMove[]);
    initializeUI();
    initPgnViewer();
    loadChessgroundBoard();
    positionPromoteOverlay();
    setupEventListeners();
})();

