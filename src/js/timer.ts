import { state, config } from './config';
import { borderFlash } from './toolbox';
import { isPuzzleFailed } from './chessFunctions';

// --- Module-level timer variables ---
let animationFrameId: number | null = null;
let lastTickTimestamp: number | null = null;
let extendAnimationFrameId: number | null = null;
let lastTickExtendTimestamp: number | null = null;
let totalExtendTime = 0;
let totalTime: number;
let extendPercentage: number;


function timerLoop(timestamp: number): void {
    if (!lastTickTimestamp) {
        lastTickTimestamp = timestamp;
    }

    const deltaTime = timestamp - lastTickTimestamp;
    lastTickTimestamp = timestamp;

    state.puzzleTime = Math.max(0, state.puzzleTime - deltaTime);
    const percentage = 100 - ((state.puzzleTime / totalTime) * 100);
    document.documentElement.style.setProperty('--remainingTime', `${percentage.toFixed(2)}%`);

    if (state.puzzleTime === 0) {
        handleOutOfTime();
    } else {
        animationFrameId = requestAnimationFrame(timerLoop);
    }
}

function timerExtendLoop(extendtimestamp: number): void {
    if (!lastTickExtendTimestamp) {
        lastTickExtendTimestamp = extendtimestamp;
    }

    const deltaTime = extendtimestamp - lastTickExtendTimestamp;
    lastTickExtendTimestamp = extendtimestamp;
    const deltaTimeFraction = (deltaTime / state.delayTime) * config.increment;
    totalExtendTime = Math.min(config.increment, totalExtendTime + deltaTimeFraction);
    const percentageIncrease = (deltaTime / state.delayTime) * Math.min(extendPercentage, (config.increment * 100 / totalTime))

    state.puzzleTime = Math.min(totalTime, state.puzzleTime + deltaTimeFraction);
    extendPercentage -= percentageIncrease;

    if (extendPercentage < 0) {
        state.puzzleTime = totalTime;
        extendPercentage = 0;
    }
    document.documentElement.style.setProperty('--remainingTime', `${extendPercentage.toFixed(2)}%`);

    if (totalExtendTime === config.increment) {
        totalExtendTime = 0;
        if (extendAnimationFrameId) cancelAnimationFrame(extendAnimationFrameId);
        extendAnimationFrameId = null;
        lastTickExtendTimestamp = null;
    } else {
        extendAnimationFrameId = requestAnimationFrame(timerExtendLoop);
    }
}

function handleOutOfTime(): void {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        lastTickTimestamp = null;
    }

    document.documentElement.style.setProperty('--remainingTime', '100%');

    if (config.timerScore) {
        isPuzzleFailed(true);
    } else if (config.timerAdvance) {
        const { chess: _chess, cg: _cg, cgwrap: _cgwrap, ...stateCopy } = state;
        state.cg.set({ viewOnly: true });
        stateCopy.puzzleComplete = true;
        setTimeout(() => { window.parent.postMessage(stateCopy, '*'); }, state.delayTime);
    } else {
        if (!state.errorTrack) state.solvedColour = "var(--correct-color)";
        borderFlash("var(--incorrect-color)");
    }
}

export function stopPlayerTimer(): void {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        lastTickTimestamp = null;
    }
}

export function startPlayerTimer(): void {
    if (config.boardMode === 'Viewer' || !config.timer || state.puzzleTime <= 0) {
        return;
    }
    animationFrameId = requestAnimationFrame(timerLoop);
}

export function initializePuzzleTimer(): void {
    if (config.boardMode === 'Viewer' || !config.timer) return;
    stopPlayerTimer();
    totalTime = config.timer;
    const timerColor = config.randomOrientation ? state.solvedColour : state.opponentColour;
    document.documentElement.style.setProperty('--timer-color', timerColor);
    state.cgwrap.classList.add('timerMode');
    document.documentElement.style.setProperty('--remainingTime', `0%`);
}

export function extendPuzzleTime(additionalTime: number): void {
    if (config.boardMode === 'Viewer' || !config.timer || state.puzzleTime <= 0) return;

    extendPercentage = 100 - (state.puzzleTime / totalTime) * 100
    totalTime = Math.max(state.puzzleTime + additionalTime, config.timer)
    if (animationFrameId) stopPlayerTimer();
    extendAnimationFrameId = requestAnimationFrame(timerExtendLoop);
}
