import { state, config, htmlElement } from './config';
import { cgwrap } from './chessFunctions';
import type { Color } from 'chessground/types';
import type { PgnMove } from '@mliebelt/pgn-parser';

/**
 * Safely finds and returns an HTML element, throwing an error if not found.
 * @param selector The CSS selector for the element.
 * @param type The element type constructor (e.g., HTMLDivElement).
 * @returns The found element.
 */
function getElement<T extends HTMLElement>(selector: string, type: { new(): T }): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
        throw new Error(`Critical UI element not found: ${selector}`);
    }
    return element;
}

export function initializeUI(): void {

    // Link images to promote buttons
    const promoteBtnMap = ["Q", "B", "N", "R"];
    promoteBtnMap.forEach((piece) => {
        const imgElement = getElement(`#promote${piece}`, HTMLImageElement);
        imgElement.src = `_${state.boardRotation[0]}${piece}.svg`;
    });

    htmlElement.style.setProperty('--background-color', config.background);

    const commentBox = document.getElementById('commentBox');
    if (commentBox) {
        commentBox.style.fontSize = `${config.fontSize}px`;
    }

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
    const fenParts = state.ankiFen.split(' ');
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
    htmlElement.style.setProperty('--player-color', borderColor);
    htmlElement.style.setProperty('--opponent-color', state.opponentColour);

    // Update border color based on error tracking in Viewer mode
    if (config.boardMode === 'Viewer') {
        if (state.errorTrack === 'true') {
            htmlElement.style.setProperty('--border-color', "#b31010");
        } else if (state.errorTrack === 'correctTime') {
            htmlElement.style.setProperty('--border-color', "#2CBFA7");
        } else if (state.errorTrack === 'correct') {
            htmlElement.style.setProperty('--border-color', "limegreen");
        }
    }
}

export function positionPromoteOverlay(): void {
    const promoteOverlay = document.getElementById('promoteButtons');
    if (!promoteOverlay || promoteOverlay.classList.contains("hidden")) return;

    const rect = cgwrap.getBoundingClientRect();
    promoteOverlay.style.top = `${rect.top + 8}px`;
    promoteOverlay.style.left = `${rect.left + 8}px`;
}
