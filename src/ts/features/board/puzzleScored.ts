import type { ErrorTrack } from '../../core/types';

import { config } from '../../core/config';
import { state } from '../../core/state';
import { isEndOfLine } from '../pgn/pgnViewer';
import { borderFlash } from '../ui/uiUtils';
import { stopPlayerTimer } from '../timer/timer';

export function scorePuzzle (errorTrack: ErrorTrack): void {

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
}
