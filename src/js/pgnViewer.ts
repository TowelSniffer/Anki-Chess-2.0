import type { Chess } from 'chess.js';
import type { Api } from 'chessground/api';
import { toColor, toDests } from './chessFunctions';
import { drawArrows } from './arrows';
import type { NagData } from './arrows';
import { state, parsedPGN, config } from './config';
import type { CustomPgnMove } from './types';
import { startAnalysis } from './handleStockfish';
import nags from '../nags.json' assert { type: 'json' };

// --- Types ---
export type PgnPathString = string & { readonly __brand: 'pgnPathString' };
export type PgnPath = ("v" | number)[];

// type filter functions
function isPgnPathString(str: string): str is PgnPathString {
    // checks if string contains only numbers, 'v', and commas
    return /^[0-9,v]+$/.test(str);
}
export function createPgnPathString(str: string): PgnPathString | null {
    if (isPgnPathString(str)) {
        return str as PgnPathString;
    }
    return null;
}

export function isPgnPathArray(arr: (string | number)[]): arr is PgnPath {
    return arr.every(item => typeof item === 'number' || item === 'v');
}

export function createPgnPathArray(pathStr: PgnPathString): PgnPath {
    const pathArray = pathStr.split(',')
    .filter(segment => segment !== '' && (segment === 'v' || !isNaN(Number(segment))))
    .map(segment => {
        const num = Number(segment);
        return !isNaN(num) ? num : segment;
    });
    return pathArray as PgnPath;
}


// --- PGN tracking ---
function getMoveFromPath(path: (string | number)[]): CustomPgnMove | null {
    if (!path || path.length === 0) return null;

    let moves = parsedPGN.moves;
    let move: CustomPgnMove | null = null;

    for (let i = 0; i < path.length; i++) {
        const segment = path[i];
        if (segment === 'v') {
            const varIndex = path[++i];
            if (typeof varIndex !== 'number') return null;
            if (move && move.variations) {
                moves = move.variations[varIndex];
            } else {
                return null;
            }
        } else if (typeof segment === 'number') {
            const moveIndex = segment;
            if (moves && moves[moveIndex]) {
                move = moves[moveIndex];
            } else {
                return null;
            }
        }
    }
    return move;
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
            const foundNagKey = move.nag?.find((key: string) => key in nags);
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

export function getFullMoveSequenceFromPath(chess: Chess, cg: Api, path: PgnPath): void {
    state.chessGroundShapes = [];
    state.pgnState = true;

    chess.reset();
    chess.load(state.ankiFen);


    // --- Start of rewritten logic ---
    let currentLine = parsedPGN.moves;
    let parentMove: CustomPgnMove | null = null; // To access variations from

    for (let i = 0; i < path.length; i++) {
        const segment = path[i];
        if (segment === 'v' && typeof path[++i] === 'number') {
            if (parentMove?.variations) {
                const varIndex = path[i++]; // second ++ to skip branching number
                console.log(varIndex)
                if (typeof varIndex !== 'number') {
                    console.error("Invalid PGN path:", path);
                    return
                }
                currentLine = parentMove.variations[varIndex];
            }
        } else if (typeof segment === 'number') {
            const movesDownCurrentLine = segment;
            for (let i = 0; i <= movesDownCurrentLine; i++) {
                const move = currentLine?.[i];
                if (move?.notation?.notation) {
                    console.log(move?.notation?.notation)
                    chess.move(move.notation.notation);
                    parentMove = move;
                } else {
                    console.error("Invalid PGN path or move not found at:", path.slice(0, i + 1));
                }
            }
        }
    }

    console.log(chess.fen())

    cg.set({
        fen: chess.fen(),
           check: chess.inCheck(),
           turnColor: toColor(chess),
           movable: {
               color: toColor(chess),
           dests: toDests(chess)
           },
    });



    document.querySelectorAll<HTMLButtonElement>('#navBackward, #resetBoard')
    .forEach(el => el.disabled = false);

    if (state.analysisToggledOn) {
        startAnalysis(chess, config.analysisTime);
    }
}

function navigatePgnPath(moveList: string[]): void {


}

export function onPgnMoveClick(event: Event, cg: Api, chess: Chess): void {
    const target = event.target as HTMLElement;
    if (!target || !target.classList.contains('move')) return;

    document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
    target.classList.add('current');
    if (target.dataset.path) {
        const pathStr = createPgnPathString(target.dataset.path);
        if (pathStr) {
            const pathArray = createPgnPathArray(pathStr);
            if (pathArray) getFullMoveSequenceFromPath(chess, cg, pathArray);
        }
    }
    const forwardButton = document.querySelector<HTMLButtonElement>("#navForward");
    if (forwardButton) forwardButton.disabled = !state.expectedMove;

    drawArrows(cg, chess);
}

// --- PGN Data Augmentation ---

export function augmentPgnTree(moves: CustomPgnMove[], path: (string | number)[] = []): void {
    if (!moves) return;
    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const currentPath = [...path, i];
        if(isPgnPathArray(currentPath)) move.pgnPath = currentPath;
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
