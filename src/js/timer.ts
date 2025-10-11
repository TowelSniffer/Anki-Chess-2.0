import { state, config } from './config';

// --- Module-level timer variables with explicit types ---
export let puzzleIncrement: number | null = null;
let totalTime: number;

function handleOutOfTime(): void {
    // state.cgwrap.classList.remove('timerMode');
    document.documentElement.style.setProperty('--remainingTime', `100%`);
    if (config.timerScore) {
        state.errorTrack = true;
    } else if (!state.errorTrack) {
        state.solvedColour = "limegreen";
    }
    document.documentElement.style.setProperty('--timer-flash-color', "#b31010");
    setTimeout(() => {
        state.cgwrap.classList.add('time-added-flash');
    }, 0);
    setTimeout(() => {
        state.cgwrap.classList.remove('time-added-flash');
    }, 500);

    const { chess: _chess, cg: _cg, cgwrap: _cgwrap, ...stateCopy } = state;
    window.parent.postMessage(stateCopy, '*');
    if (puzzleIncrement) {
        clearInterval(puzzleIncrement);
        puzzleIncrement = null;
    }
    document.documentElement.style.setProperty('--remainingTime', '100%');
}

export function extendPuzzleTime(additionalTime: number): void {
    if (config.boardMode === 'Viewer' || !config.timer || state.puzzleTime <= 0) return;

    state.puzzleTime += additionalTime;

    const usedTime = config.timer - state.puzzleTime;

    if (usedTime <= 0) {
        // when new delay is greater than original timer
        totalTime -= usedTime;
    }

    setTimeout(() => {
        if (state.puzzleTime > 0) state.cgwrap.classList.add('time-added-flash');
    }, state.delayTime);
    // 2. Remove the class after 500ms so the animation can be re-triggered later.
    setTimeout(() => {
        if (state.puzzleTime > 0) state.cgwrap.classList.remove('time-added-flash');
    }, state.delayTime + 500);
}

export async function startPuzzleTimeout(): Promise<void> {
    if (config.boardMode === 'Viewer' || !config.timer) return;

    if (!config.timerScore) {
        const timerColor = config.randomOrientation ? state.solvedColour : state.opponentColour;
        document.documentElement.style.setProperty('--timer-color', timerColor);
    }
    state.cgwrap.classList.add('timerMode');
    totalTime = config.timer;
    puzzleIncrement = window.setInterval(() => {
        if (state.playerColour[0] === state.chess.turn()) {

            // reduce timer only on players move
            state.puzzleTime = Math.max(0, state.puzzleTime - 10);

            const percentage = 100 - ((state.puzzleTime / totalTime) * 100);
            document.documentElement.style.setProperty('--remainingTime', `${percentage.toFixed(2)}%`);

            if (state.puzzleTime === 0) {
                handleOutOfTime()
            }
        } else {
            // pause on opponets turn;
        }

    }, 10);
}
