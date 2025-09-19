import { state, config, cg, chess } from './config';
import { cgwrap } from './chessFunctions';

export let puzzleTimeout;
let puzzleIncrement;
let startTime;
let totalTime;
let remainingTime;

let handleOutOfTime = function() {
    if (config.timerScore) {
        state.errorTrack = true;
        state.solvedColour = "#b31010";
    }
    if (config.timerAdvance) state.puzzleComplete = true;
    window.parent.postMessage(state, '*');
    puzzleTimeout = null;
    clearInterval(puzzleIncrement);
    document.documentElement.style.setProperty('--remainingTime', '100%');
};

export function extendPuzzleTime(additionalTime) {
    if (config.boardMode === 'Viewer' || !config.timer) return
    if (puzzleTimeout) {
        clearTimeout(puzzleTimeout);
        clearInterval(puzzleIncrement);
        let elapsedTime = Date.now() - startTime;
        let newDelay = remainingTime + additionalTime;
        // Ensure the new delay is not negative
        if (newDelay >= 0) {
            startPuzzleTimeout(newDelay);
        }
    }
}

export function startPuzzleTimeout(delay) {
    if (config.boardMode === 'Viewer' || !config.timer) return;
    if (!config.timerScore) document.documentElement.style.setProperty('--timer-color', config.randomOrientation ? "#2CBFA7" : state.opponentColour);
    cgwrap.classList.add('timerMode');
    puzzleTimeout = setTimeout(handleOutOfTime, delay);
    totalTime = config.timer; // Set initial total time only once
    let usedTime = config.timer - delay;
    if (usedTime < 0) {
        totalTime -= usedTime;
        usedTime = 0;
    }
    startTime = Date.now();
    puzzleIncrement = setInterval(() => {
        if (state.puzzleComplete) {
            cgwrap.classList.remove('timerMode');
            clearTimeout(puzzleTimeout);
            clearInterval(puzzleIncrement);
            return
        }
        let elapsedTime = Date.now() - startTime;
        remainingTime = totalTime - elapsedTime - usedTime;

        // Ensure remaining time doesn't go negative
        if (remainingTime < 0) {
            remainingTime = 0;
        }
        if (state.playerColour !== cg.state.turnColor) {
            extendPuzzleTime(10)
            return
        }
        // Calculate the percentage of remaining time
        let percentage = 100 - ((remainingTime / totalTime) * 100)

        document.documentElement.style.setProperty('--remainingTime', `${percentage.toFixed(2)}%`);

        // Stop the interval when time runs out
        if (remainingTime === 0) {
            clearInterval(puzzleIncrement);
        }
    }, 10);
}
