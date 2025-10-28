import { state } from './config';
import { stateProxy } from './stateProxy';
import { navigateNextMove, navigatePrevMove, isEndOfLine } from './pgnViewer';
import { playSound } from './audio';
import type { Color } from 'chessground/types';

// --- UI tools ---

const htmlElement: HTMLElement = document.documentElement;

const btn = {
    get reset() { return document.querySelector<HTMLButtonElement>("#resetBoard"); },
    get back() { return document.querySelector<HTMLButtonElement>("#navBackward"); },
    get forward() { return document.querySelector<HTMLButtonElement>("#navForward"); },
    get copy() { return document.querySelector<HTMLButtonElement>("#copyFen"); },
    get stockfish() { return document.querySelector<HTMLButtonElement>("#stockfishToggle"); },
    get flip() { return document.querySelector<HTMLButtonElement>("#rotateBoard"); },
};

export function setButtonsDisabled(keys: (keyof typeof btn)[], isDisabled: boolean): void {
    keys.forEach(key => {
        const button = btn[key];
        if (button) {
            button.disabled = isDisabled;
        }
    });
}

// animations

export function borderFlash(colour: string | null = null): void {
    document.documentElement.style.setProperty('--timer-flash-color', colour ?? state.solvedColour);
    state.cgwrap.classList.add('time-added-flash');
    setTimeout(() => {
        state.cgwrap.classList.remove('time-added-flash');
    }, 500);
}

// --- chess.js and chessground tools ---

export function toColor(): Color {
    return state.chess.turn() === 'w' ? 'white' : 'black';
}

// --- Navigation Tools ---

export function navForward(): void {
    if (isEndOfLine(state.pgnPath)) return;
    const navCheck = navigateNextMove(state.pgnPath);
    stateProxy.pgnPath = navCheck;
}

export function navBackward(): void {
    if (!state.pgnPath.length) return;
    const navCheck = navigatePrevMove(state.pgnPath);
    if (!navCheck.length){
        resetBoard();
    } else {
        stateProxy.pgnPath = navCheck;
    }
}

export function resetBoard(): void {
    stateProxy.pgnPath = [];
}

// Button tools --

export function rotateBoard(): void {
    state.boardRotation = state.boardRotation === "white" ? "black" : "white";

    const coordWhite = getComputedStyle(htmlElement).getPropertyValue("--coord-white").trim();
    const coordBlack = getComputedStyle(htmlElement).getPropertyValue("--coord-black").trim();
    htmlElement.style.setProperty("--coord-white", coordBlack);
    htmlElement.style.setProperty("--coord-black", coordWhite);

    state.cg.set({ orientation: state.boardRotation });

    const flipButton = document.querySelector<HTMLElement>(".flipBoardIcon");
    if (flipButton && flipButton.style.transform.includes("90deg")) {
        flipButton.style.transform = "rotate(270deg)";
    } else if (flipButton) {
        flipButton.style.transform = "rotate(90deg)";
    }
}

export function copyFen(): boolean {
    const textarea = document.createElement("textarea");
    textarea.value = state.chess.fen();
    // Make the textarea invisible and off-screen
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        playSound("computer-mouse-click")
        return true;
    } catch (err) {
        playSound("Error")
        console.error('Failed to copy text using execCommand:', err);
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}

