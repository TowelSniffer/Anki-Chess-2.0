import { state, stateProxy, config } from './config';
import { onPgnMoveClick, navigateNextMove, navigatePrevMove } from './pgnViewer';
import { positionPromoteOverlay } from './initializeUI';
import { toggleStockfishAnalysis, handleStockfishCrash } from './handleStockfish';
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

function navBackward(): void {
    const navCheck = navigatePrevMove(state.pgnPath);
    if (!navCheck.length){
        resetBoard();
    } else {
        stateProxy.pgnPath = navCheck;
    }
}

function navForward(): void {
    const navCheck = navigateNextMove(state.pgnPath);
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
            onPgnMoveClick(event);
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

