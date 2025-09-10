import { cg, chess, toColor, toDests, drawArrows, state, parsedPGN, nags } from '../main.js';
function buildPgnHtml(moves, path = [], altLine) {
    let html = '';
    if (!moves || moves.length === 0) return '';
    let lineClass
    if (moves[0].turn === 'b' && path.length <= 1) {
        const moveNumber = moves[0].moveNumber;
        html += `<span class="move-number">${moveNumber}</span><span class="nullMove">...</span> `;
    }

    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];

        if (move.turn === 'w') {
            const moveNumber = move.moveNumber;
            html += `<span class="move-number">${moveNumber}.</span> `;
        }
        let nagCheck = '';
        let nagTitle = null;
        if (move.nag) {
            const foundNagKey = move.nag?.find(key => key in nags);
            nagCheck = nags[foundNagKey]?.[1] ?? '';
            nagTitle = nags[foundNagKey]?.[0] ?? '';
        }
        nagTitle = nagTitle ? `<span class="nagTooltip">${nagTitle}</span>` : '';
        html += ` <span class="move" data-path="${move.pgnPath.join(',')}">${nagTitle} ${move.notation.notation} ${nagCheck}</span>`;

        if (move.commentAfter) {
            if (move.turn === 'w' && !altLine) html += `<span class="nullMove">|...|</span>`;
            html += `<span class="comment"> ${move.commentAfter} </span>`;
            if (move.turn === 'w' && i < moves.length - 1 && !altLine && !move.variations?.length) html += `<span class="move-number">${move.moveNumber}.</span><span class="nullMove">|...|</span>`;
        }

        if (move.variations && move.variations.length > 0) {
            if (!altLine) {
                if (move.turn === 'w' && !altLine && !move.commentAfter) html += `<span class="nullMove">|...|</span>`;
                html += `<div class="altLine">`;
            }
            move.variations.forEach(variation => {
                html += `(${buildPgnHtml(variation, variation.pgnPath, true)})`;
            });
            if (!altLine) {
                html += `</div>`;
                if (move.turn === 'w' && i < moves.length - 1) html += `<span class="move-number">${move.moveNumber}.</span><span class="nullMove">|...|</span>`;
            }
        }
    }
    return html;
}

function getFullMoveSequenceFromPath(path) {
    state.count = 0; // Int so we can track on which move we are.
    state.chessGroundShapes = [];
    state.expectedLine = parsedPGN.moves; // Set initially to the mainline of pgn but can change path with variations
    state.expectedMove = parsedPGN.moves[state.count]; // Set the expected move according to PGN
    state.pgnState = true; // incase outside PGN
    document.querySelector("#navForward").disabled = false;
    chess.reset();
    chess.load(state.ankiFen);
    let branchIndex = null;
    for ( let i=0; i < path.length; i++) {
        // [ "3", "v", "1", "2" ] means: at the 3rd mainline move branch into branch[1] and then 2 mainline moves down branch one
        const pathCount = parseInt(path[i], 10);
        if (path[i+1] === 'v') {
            branchIndex = parseInt(path[i+2], 10);
            i = i + 2 // skip branch move and index after branch
        }
        for (let j = 0; j <= pathCount; j++) {
            if (branchIndex !== null && j === pathCount) {
                state.count = 0;
                state.expectedLine = state.expectedMove.variations[branchIndex];
                state.expectedMove = state.expectedLine[0];
                branchIndex = null;
            } else {
                chess.move(state.expectedMove.notation.notation);
                state.count++;
                state.expectedMove = state.expectedLine[state.count];
            }
        }
    }

    return chess.moves()
}

function onPgnMoveClick(event) {
    if (!event.target.classList.contains('move')) return;
    document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
    event.target.classList.add('current');
    const pathStr = event.target.dataset.path;
    const path = pathStr.split(',');
    getFullMoveSequenceFromPath(path);
    cg.set({
        fen: chess.fen(),
           check: chess.inCheck(),
           turnColor: toColor(chess),
           movable: {
               color: toColor(chess),
           dests: toDests(chess)
           },
    });
    document.querySelectorAll('#navBackward, #resetBoard')
    .forEach(el => el.disabled = false);
    if (!state.expectedMove || typeof state.expectedMove === 'string') {
        document.querySelector("#navForward").disabled = true;
    }
    if (state.analysisToggledOn) {
        handleStockfish.startAnalysis(4000);
    }
    drawArrows(cg, chess)
}

export function augmentPgnTree(moves, path = []) {
    if (!moves) return;
    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const currentPath = [...path, i];
        move.pgnPath = currentPath;
        if (move.variations) {
            move.variations.forEach((variation, varIndex) => {
                const variationPath = [...currentPath, 'v', varIndex];
                augmentPgnTree(variation, variationPath);
            });
        }
    }
}

export function highlightCurrentMove(pgnPath) {
    document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
    document.querySelector(`[data-path="${pgnPath.join(',')}"]`).classList.add("current");
}


export function initPgnViewer() {
    state.pgnPath = [];
    const pgnContainer = document.getElementById('pgnComment');
    pgnContainer.innerHTML = '';
    if (parsedPGN.gameComment) {
        pgnContainer.innerHTML += `<span class="comment"> ${parsedPGN.gameComment.comment} </span>`;
    }
    pgnContainer.innerHTML += buildPgnHtml(parsedPGN.moves);
    pgnContainer.addEventListener('click', onPgnMoveClick);
}
