import type { Color } from 'chessground/types';

import { config } from '../../core/config';
import { state } from '../../core/state';
import { setButtonsDisabled } from '../ui/uiUtils';
import { isEndOfLine } from '../pgn/pgnViewer';
import { drawArrows } from '../board/arrows';

function getElement<T extends HTMLElement>(selector: string, _type: { new(): T }): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
        throw new Error(`Critical UI element not found: ${selector}`);
    }
    return element;
}

const htmlElement: HTMLElement = document.documentElement;

function initializePgnData(): void {
    const pathKey = state.pgnPath.join(',');
    const moveTrack = state.pgnPathMap.get(pathKey);
    state.chess.load(moveTrack?.after ?? state.startFen);
    if (config.boardMode === 'Viewer') {
        state.cg.set({ animation: { enabled: false} })
        state.cg.set({ fen: moveTrack?.after ?? state.startFen });
        if (moveTrack) state.cg.set({ lastMove: [moveTrack.from, moveTrack.to] });
        if (state.pgnPath.length && moveTrack) {
            setButtonsDisabled(['back', 'reset'], false);
            state.lastMove = moveTrack;
        };
        const endOfLineCheck = isEndOfLine(state.pgnPath);
        setButtonsDisabled(['forward'], endOfLineCheck);
        drawArrows(state.pgnPath);
    }
    state.cg.set({ animation: { enabled: true} })
}

export function initializeUI(): void {

    initializePgnData();

    // Link images to promote buttons
    const promoteBtnMap = ["Q", "B", "N", "R"];
    promoteBtnMap.forEach((piece) => {
        const imgElement = getElement(`#promote${piece}`, HTMLImageElement);
        imgElement.src = `_${state.playerColour[0]}${piece}.svg`;
    });

    if (config.background) htmlElement.style.setProperty('--background-color', config.background);

    const commentBox = document.getElementById('commentBox');

    const textField = document.getElementById('textField');
    if (textField) {
        if (config.ankiText) {
            textField.innerHTML = config.ankiText;
        } else {
            textField.style.display = "none";
        }
    }

    // Handle different board modes
    if (config.boardMode === 'Puzzle') {
        const buttonsContainer = document.querySelector<HTMLElement>('#buttons-container');
        if (buttonsContainer) buttonsContainer.style.visibility = "hidden";

        const pgnComment = document.getElementById('pgnComment');
        if (pgnComment) pgnComment.style.display = "none";

        if (commentBox && (!config.frontText || !config.ankiText)) {
            commentBox.style.display = "none";
        }
    }

    // Determine board orientation
    const fenParts = state.startFen.split(' ');
    let boardRotation: Color = (fenParts.length > 1 && fenParts[1] === 'w') ? 'white' : 'black';

    if (config.flipBoard) {
        boardRotation = boardRotation === "white" ? "black" : "white";
    }
    state.boardRotation = boardRotation;

    // Set player and opponent colors
    state.playerColour = state.boardRotation;
    state.opponentColour = state.boardRotation === "white" ? "black" : "white";

    // Update CSS variables for theming
    if (state.boardRotation === "white") {
        const coordWhite = getComputedStyle(htmlElement).getPropertyValue('--coord-white').trim();
        const coordBlack = getComputedStyle(htmlElement).getPropertyValue('--coord-black').trim();
        htmlElement.style.setProperty('--coord-white', coordBlack);
        htmlElement.style.setProperty('--coord-black', coordWhite);
    }

    const borderColor = config.randomOrientation ? "grey" : state.playerColour;
    htmlElement.style.setProperty('--border-color', borderColor);
    htmlElement.style.setProperty('--player-color', state.playerColour);
    htmlElement.style.setProperty('--opponent-color', state.opponentColour);

    // Update border color based on error tracking in Viewer mode
    if (config.boardMode === 'Viewer') {
        if (state.errorTrack === 'incorrect') {
            htmlElement.style.setProperty('--border-color', "var(--incorrect-color)");
        } else if (state.errorTrack === 'correctTime') {
            htmlElement.style.setProperty('--border-color', "var(--perfect-color)");
        } else if (state.errorTrack === 'correct') {
            htmlElement.style.setProperty('--border-color', "var(--correct-color)");
        }
    }
}

export function positionPromoteOverlay(): void {
    const promoteOverlay = document.getElementById('promoteButtonsContainer');
    if (!promoteOverlay || promoteOverlay.classList.contains("hidden")) return;

    const rect = state.cgwrap.getBoundingClientRect();
    const styles = window.getComputedStyle(state.cgwrap);
    const borderWidthString = styles.borderTopWidth;
    const borderWidth = parseInt(borderWidthString, 10);

    promoteOverlay.style.top = `${rect.top + borderWidth}px`;
    promoteOverlay.style.left = `${rect.left + borderWidth}px`;
}
