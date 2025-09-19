import { assignMirrorState, mirrorPgnTree, mirrorFen, checkCastleRights } from './mirror';
import { parsedPGN, state, config, htmlElement } from './config';
import { cgwrap } from './chessFunctions';

export function initializeUI() {
    // Mirror PGN
    if (config.mirror && !checkCastleRights(state.ankiFen)) {
        if (!state.mirrorState) state.mirrorState = assignMirrorState(config.pgn);
        window.parent.postMessage(state, '*');
        mirrorPgnTree(parsedPGN.moves, state.mirrorState);
        state.ankiFen = mirrorFen(state.ankiFen, state.mirrorState);
    }
    // link images to promote buttons
    const promoteBtnMap = ["Q", "B", "N", "R"];
    promoteBtnMap.forEach((piece) => document.querySelector(`#promote${piece}`).src = `_${state.boardRotation[0]}${piece}.svg`);

    htmlElement.style.setProperty('--background-color', config.background);
    const commentBox = document.getElementById('commentBox');
    commentBox.style.fontSize = `${config.fontSize}px`;
    if (config.ankiText) {
        document.getElementById('textField').innerHTML = config.ankiText;
    } else {
        document.getElementById('textField').style.display = "none";
    }
    if (config.boardMode === 'Puzzle') {
        document.querySelector('#buttons-container').style.visibility = "hidden";
        document.getElementById('pgnComment').style.display = "none";

        if (!config.frontText || !config.ankiText) commentBox.style.display = "none";
    }
    const fenParts = state.ankiFen.split(' ');
    state.boardRotation = (fenParts.length > 1 && fenParts[1] === 'w') ? 'white' : 'black';

    if (config.flipBoard) {
        state.boardRotation = state.boardRotation === "white" ? "black" : "white";
    }
    if (state.boardRotation === "white") {
        // Get the current values of the CSS variables
        const coordWhite = getComputedStyle(htmlElement).getPropertyValue('--coord-white').trim();
        const coordBlack = getComputedStyle(htmlElement).getPropertyValue('--coord-black').trim();
        // Swap the values. so coord colors are correct
        htmlElement.style.setProperty('--coord-white', coordBlack);
        htmlElement.style.setProperty('--coord-black', coordWhite);
    }

    state.playerColour = state.boardRotation;
    state.opponentColour = state.boardRotation === "white" ? "black" : "white";
    htmlElement.style.setProperty('--border-color', config.randomOrientation ? "grey" : state.playerColour);
    htmlElement.style.setProperty('--player-color', config.randomOrientation ? "grey" : state.playerColour);
    htmlElement.style.setProperty('--opponent-color', state.opponentColour);
    // score puzzle in viewer mode
    if (state.errorTrack === 'true' && config.boardMode === 'Viewer') {
        htmlElement.style.setProperty('--border-color', "#b31010");
    } else if (state.errorTrack === 'correctTime' && config.boardMode === 'Viewer') {
        htmlElement.style.setProperty('--border-color', "#2CBFA7");
    } else if (state.errorTrack === 'correct' && config.boardMode === 'Viewer') {
        htmlElement.style.setProperty('--border-color', "limegreen");
    }
}

export function positionPromoteOverlay() {
    const promoteOverlay = document.getElementById('promoteButtons');
    if (!promoteOverlay || promoteOverlay.classList.contains("hidden")) return;
    const rect = cgwrap.getBoundingClientRect();
    // Set the position of the promote element
    promoteOverlay.style.top = (rect.top + 8) + 'px';
    promoteOverlay.style.left = (rect.left + 8) + 'px';
}
