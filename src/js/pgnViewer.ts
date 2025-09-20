import { toColor, toDests, drawArrows } from './chessFunctions';
import { state, parsedPGN, config, cg, chess, CustomPgnMove } from './config';
import { startAnalysis } from './handleStockfish';
import nags from '../nags.json' assert { type: 'json' };

// --- Type Definitions ---

// Define the shape of the imported nags.json file.
interface NagData {
    [nagKey: string]: string[]; // [description, symbol/sub array of symbols]
}



// --- PGN Rendering ---

function buildPgnHtml(moves: CustomPgnMove[], path: (string | number)[] = [], altLine?: boolean): string {
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
            if (foundNagKey) {
                nagCheck = (nags as NagData)[foundNagKey]?.[1] ?? '';
                nagTitle = (nags as NagData)[foundNagKey]?.[0] ?? '';
            }
        }
        nagTitle = nagTitle ? `<span class="nagTooltip">${nagTitle}</span>` : '';
        html += ` <span class="move" data-path="${move.pgnPath?.join(',')}">${nagTitle} ${move.notation.notation} ${nagCheck}</span>`;

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
                html += `(${buildPgnHtml(variation, [], true)})`;
            });
            if (!altLine) {
                html += `</div>`;
                if (move.turn === 'w' && i < moves.length - 1) html += `<span class="move-number">${move.moveNumber}.</span><span class="nullMove">|...|</span>`;
            }
        }
    }
    return html;
}

// --- PGN Navigation ---

export function getFullMoveSequenceFromPath(path: string[]): string[] {
    state.count = 0;
    state.chessGroundShapes = [];
    state.expectedLine = parsedPGN.moves;
    state.expectedMove = state.expectedLine[state.count];
    state.pgnState = true;

    chess.reset();
    chess.load(state.ankiFen);

    let branchIndex: number | null = null;
    for (let i = 0; i < path.length; i++) {
        const pathCount = parseInt(path[i], 10);
        if (path[i + 1] === 'v') {
            branchIndex = parseInt(path[i + 2], 10);
            i += 2; // Skip 'v' and branch index
        }

        for (let j = 0; j <= pathCount; j++) {
            if (branchIndex !== null && j === pathCount) {
                if (state.expectedMove?.variations) {
                    state.count = 0;
                    state.expectedLine = state.expectedMove.variations[branchIndex];
                    state.expectedMove = state.expectedLine[0];
                    branchIndex = null;
                }
            } else if (state.expectedMove?.notation) {
                chess.move(state.expectedMove.notation.notation);
                state.count++;
                state.expectedMove = state.expectedLine[state.count];
            }
        }
    }

    cg.set({
        fen: chess.fen(),
           check: chess.inCheck(),
           turnColor: toColor(chess),
           movable: {
               color: toColor(chess),
           dests: toDests(chess)
           },
    });

    const forwardButton = document.querySelector<HTMLButtonElement>("#navForward");
    if (forwardButton) forwardButton.disabled = !state.expectedMove;

    document.querySelectorAll<HTMLButtonElement>('#navBackward, #resetBoard')
    .forEach(el => el.disabled = false);

    if (state.analysisToggledOn) {
        startAnalysis(config.analysisTime);
    }
    drawArrows();
    return chess.moves();
}

export function onPgnMoveClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target || !target.classList.contains('move')) return;

    document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
    target.classList.add('current');

    const pathStr = target.dataset.path;
    if (pathStr) {
        getFullMoveSequenceFromPath(pathStr.split(','));
    }
}

// --- PGN Data Augmentation ---

export function augmentPgnTree(moves: CustomPgnMove[], path: (string | number)[] = []): void {
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

export function highlightCurrentMove(pgnPath: (string | number)[]): void {
    document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
    const currentMoveEl = document.querySelector(`[data-path="${pgnPath.join(',')}"]`);
    if (currentMoveEl) {
        currentMoveEl.classList.add("current");
    }
}

// --- Initialization ---

export function initPgnViewer(): void {
    if (config.boardMode === 'Puzzle') return;

    const pgnContainer = document.getElementById('pgnComment');
    if (!pgnContainer) return;

    pgnContainer.innerHTML = '';
    if (parsedPGN.gameComment) {
        pgnContainer.innerHTML += `<span class="comment"> ${parsedPGN.gameComment.comment} </span>`;
    }
    pgnContainer.innerHTML += buildPgnHtml(parsedPGN.moves);
}
