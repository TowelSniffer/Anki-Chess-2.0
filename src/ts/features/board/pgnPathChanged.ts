import type { PgnPath, CustomPgnMove } from '../../core/types';

import { config } from '../../core/config';
import { state } from '../../core/state';
import { stateProxy } from '../../core/stateProxy';
import { isEndOfLine, highlightCurrentMove } from '../pgn/pgnViewer';
import { setButtonsDisabled } from '../ui/uiUtils';
import { animateBoard } from './chessFunctions';
import { drawArrows } from './arrows';
import { moveAudio } from '../audio/audio';
import { startAnalysis } from '../analysis/handleStockfish';

export function changeCurrentPgnMove (pgnPath: PgnPath, lastMove: CustomPgnMove | null, pathMove: CustomPgnMove | null): void {
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
}
