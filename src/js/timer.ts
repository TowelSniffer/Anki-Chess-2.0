import { state, config } from './config';
import type { Api } from 'chessground/api';

// --- Module-level timer variables with explicit types ---
export let puzzleTimeout: number | null = null;
let puzzleIncrement: number | null = null;
let startTime: number = 0;
let totalTime: number = 0;
let remainingTime: number = 0;

function handleOutOfTime(): void {
    if (config.timerScore) {
        state.errorTrack = 'true'; // Assuming 'true' is a possible value
        state.solvedColour = "#b31010";
    }
    if (config.timerAdvance) {
        state.puzzleComplete = true;
    }

    window.parent.postMessage(state, '*');
    puzzleTimeout = null;
    if (puzzleIncrement) clearInterval(puzzleIncrement);
    document.documentElement.style.setProperty('--remainingTime', '100%');
}

export function extendPuzzleTime(additionalTime: number, cg: Api, cgwrap: HTMLDivElement): void {
    if (config.boardMode === 'Viewer' || !config.timer) return;

    if (puzzleTimeout) {
        clearTimeout(puzzleTimeout);
        if (puzzleIncrement) clearInterval(puzzleIncrement);

        const newDelay = remainingTime + additionalTime;

        // Ensure the new delay is not negative before restarting the timer
        if (newDelay >= 0) {
            startPuzzleTimeout(newDelay, cg, cgwrap);
        }
    }
}

export async function startPuzzleTimeout(delay: number, cg: Api, cgwrap: HTMLDivElement): Promise<void> {
    if (config.boardMode === 'Viewer' || !config.timer) return;

    // Clear any existing timers before starting a new one
    if (puzzleTimeout) clearTimeout(puzzleTimeout);
    if (puzzleIncrement) clearInterval(puzzleIncrement);

    if (!config.timerScore) {
        const timerColor = config.randomOrientation ? "#2CBFA7" : state.opponentColour;
        document.documentElement.style.setProperty('--timer-color', timerColor);
    }
    cgwrap.classList.add('timerMode');

    puzzleTimeout = window.setTimeout(handleOutOfTime, delay);

    let usedTime = config.timer - delay;
    totalTime = config.timer;

    if (usedTime < 0) {
        totalTime -= usedTime; // Effectively increases total time if delay > config.timer
        usedTime = 0;
    }

    startTime = Date.now();

    puzzleIncrement = window.setInterval(() => {
        if (state.puzzleComplete) {
            cgwrap.classList.remove('timerMode');
            if (puzzleTimeout) clearTimeout(puzzleTimeout);
            if (puzzleIncrement) clearInterval(puzzleIncrement);
            return;
        }

        const elapsedTime = Date.now() - startTime;
        remainingTime = Math.max(0, totalTime - elapsedTime - usedTime);

        // extend time when it's not the player's turn
        if (state.playerColour !== cg.state.turnColor) {
            extendPuzzleTime(10, cg, cgwrap);
            return;
        }

        const percentage = 100 - ((remainingTime / totalTime) * 100);
        document.documentElement.style.setProperty('--remainingTime', `${percentage.toFixed(2)}%`);

        if (remainingTime === 0) {
            if (puzzleIncrement) clearInterval(puzzleIncrement);
        }
    }, 10);
}
