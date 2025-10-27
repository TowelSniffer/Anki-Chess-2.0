import { state, config } from './config';
import { navigateNextMove, navigatePrevMove, highlightCurrentMove, isEndOfLine } from './pgnViewer';
import { positionPromoteOverlay } from './initializeUI';
import { toggleStockfishAnalysis, handleStockfishCrash, startAnalysis } from './handleStockfish';
import { playSound, moveAudio } from './audio';
import { animateBoard } from './chessFunctions';
import { drawArrows } from './arrows';
import { stopPlayerTimer } from './timer';
import type { PgnPath } from './types';
import type { State, ErrorTrack } from './types';
import type { Color } from 'chessground/types';


// --- State Handler ---

const stateHandler = {
    set(target: State, property: keyof State, value: PgnPath | ErrorTrack, receiver: State) {
        if (property === 'pgnPath') {

            const pgnPath = value as PgnPath;
            const pathKey = pgnPath.join(',');
            const pathMove = state.pgnPathMap.get(pathKey) ?? null;
            console.log(pgnPath, pathMove)

            if ((pathMove || !pgnPath.length) &&
                !(!state.pgnPath.join(',').length && !pgnPath.length)
            ) {

                const lastMove = state.lastMove;
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
        } else if (property === 'errorTrack') {

            const errorTrack = value as ErrorTrack;
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
            borderFlash();

        }
        return Reflect.set(target, property, value, receiver);
    }
};

export const stateProxy = new Proxy(state, stateHandler);

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

function borderFlash(colour: string | null = null): void {
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

function navBackward(): void {
    if (!state.pgnPath.length) return;
    const navCheck = navigatePrevMove(state.pgnPath);
    if (!navCheck.length){
        resetBoard();
    } else {
        stateProxy.pgnPath = navCheck;
    }
}

function navForward(): void {
    if (isEndOfLine(state.pgnPath)) return;
    const navCheck = navigateNextMove(state.pgnPath);
    console.log(state.pgnPath, navCheck)
    stateProxy.pgnPath = navCheck;
}

function resetBoard(): void {
    stateProxy.pgnPath = [];
}

function rotateBoard(): void {
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

function copyFen(): boolean {
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

export function setupEventListeners(): void {

    // --- PGN viewer ---
    const pgnContainer = document.getElementById('pgnComment');
    if (pgnContainer) {
        pgnContainer.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLSpanElement) || !target.classList.contains('move')) return;
            const pathKey = target.dataset.pathKey;
            if (pathKey) {
                const move = state.pgnPathMap.get(pathKey);
                if (move) {
                    stateProxy.pgnPath = move.pgnPath;
                } else {
                    return;
                }
            }
        });
    }

    const commentBox = document.getElementById('commentBox');
    if (!commentBox) return;

    commentBox.addEventListener('mouseover', (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const moveElement = target.closest<HTMLElement>('.move');
        if (!moveElement) return;

        const tooltip = moveElement.querySelector<HTMLElement>('.nagTooltip');
        if (!tooltip || !tooltip.textContent?.trim()) return;

        const itemRect = moveElement.getBoundingClientRect();
        const tooltipWidth = tooltip.offsetWidth;
        const commentBoxRect = commentBox.getBoundingClientRect();

        let tooltipLeft = itemRect.left + (itemRect.width / 2) - (tooltipWidth / 2);
        if (tooltipLeft < commentBoxRect.left) {
            tooltipLeft = commentBoxRect.left;
        } else if (tooltipLeft + tooltipWidth > commentBoxRect.right) {
            tooltipLeft = commentBoxRect.right - tooltipWidth;
        }

        tooltip.style.left = `${tooltipLeft}px`;
        tooltip.style.top = `${itemRect.top - tooltip.offsetHeight - 3}px`;
        tooltip.style.display = 'block';
        tooltip.style.visibility = 'visible';
    });

    commentBox.addEventListener('mouseout', (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const moveElement = target.closest('.move');
        if (!moveElement) return;

        const tooltip = moveElement.querySelector<HTMLElement>('.nagTooltip');
        if (tooltip) {
            tooltip.style.visibility = 'hidden';
        }
    });

    // --- Button Actions ---
    const actions: Record<string, () => void> = {
        'resetBoard': resetBoard,
        'navBackward': navBackward,
        'navForward': navForward,
        'rotateBoard': rotateBoard,
        'copyFen': copyFen,
        'stockfishToggle': () => toggleStockfishAnalysis()
    };

    document.querySelector<HTMLDivElement>('#buttons-container')?.addEventListener('click', (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const button = target.closest('button');
        if (!button) return;
        const handler = actions[button.id];
        if (handler) {
            handler();
        }
    });

    // --- Board navigation ---

    const promoteOverlay = document.getElementById('overlay');
    state.cgwrap.addEventListener('wheel', (event: WheelEvent) => {
        if ((promoteOverlay && !promoteOverlay.classList.contains('hidden')) || config.boardMode !== 'Viewer') return;
        event.preventDefault();
        if (event.deltaY < 0) {
            navBackward();
        } else if (event.deltaY > 0) {
            navForward();
        }
    });

    document.addEventListener('keydown', (event: KeyboardEvent) => {
        if ((promoteOverlay && !promoteOverlay.classList.contains('hidden')) || config.boardMode !== 'Viewer') return;
        switch (event.key) {
            case 'ArrowLeft':
                navBackward();
                break;
            case 'ArrowRight':
                navForward();
                break;
            case 'ArrowDown':
                resetBoard();
                break;
        }
    });

    // --- Error and Resize Handlers ---
    window.addEventListener('error', (event: ErrorEvent) => {
        const message = event.message || '';
        const filename = event.filename || '';
        const isDetailedStockfishCrash = message.includes('abort') && filename.includes('_stockfish.js');
        const isGenericCrossOriginError = message === 'Script error.';

    if (isDetailedStockfishCrash || isGenericCrossOriginError) {
        event.preventDefault();
        console.warn("Caught a fatal Stockfish crash via global error handler.");
        if (isGenericCrossOriginError) {
            console.log("generic message:", message);
        } else {
            console.log(`Crash details: Message: "${message}", Filename: "${filename}"`);
        }
        handleStockfishCrash("window.onerror");
    }
    });
    // mirrorPgnTree
    let isUpdateScheduled = false;
    const handleReposition = (): void => {
        if (isUpdateScheduled) return;
        isUpdateScheduled = true;
        requestAnimationFrame(() => {
            positionPromoteOverlay();
            isUpdateScheduled = false;
        });
    };
    const resizeObserver = new ResizeObserver(handleReposition);
    resizeObserver.observe(state.cgwrap);
    window.addEventListener('resize', handleReposition);
    document.addEventListener('scroll', handleReposition, true);
}

