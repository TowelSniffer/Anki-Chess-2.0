import type { Chess } from 'chess.js';
import type { Api } from 'chessground/api';
import { toColor, toDests } from './chessFunctions';
import { drawArrows } from './arrows';
import type { NagData } from './arrows';
import { state, config } from './config';
import type { CustomPgnMove } from './types';
import { setButtonsDisabled } from './toolbox';
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

export function navigateFullMoveSequenceFromPath(path: string | PgnPath): PgnPath | null {
    if (!path) return null;
    let finalPath = path;
    const pathCheck = path;
    if (typeof pathCheck === 'string') {
        const pathString = createPgnPathString(pathCheck);
        if (pathString) finalPath = createPgnPathArray(pathString)
    }
    state.chess.reset();
    state.chess.load(state.ankiFen);
    let currentLine = state.parsedPGN.moves;
    let parentMove: CustomPgnMove | null = null;

    for (let i = 0; i < finalPath.length; i++) {
        const segment = finalPath[i];
        if (segment === 'v' && typeof finalPath[++i] === 'number') {
            if (parentMove?.variations) {
                const varIndex = finalPath[i++]; // second ++ to skip branching number
                console.log(varIndex)
                if (typeof varIndex !== 'number') {
                    console.error("Invalid PGN path:", finalPath);
                    return null;
                }
                currentLine = parentMove.variations[varIndex];
                state.expectedLine = currentLine;
            }
        } else if (typeof segment === 'number') {
            const movesDownCurrentLine = segment;
            for (let i = 0; i <= movesDownCurrentLine; i++) {
                const move = currentLine?.[i];
                if (move?.notation?.notation) {
                    state.chess.move(move.notation.notation);
                    parentMove = move;
                } else {
                    // last move of PGN

                }
            }
        }
    }
    state.expectedMove = parentMove;
    if (!parentMove) return null;
    return parentMove.pgnPath
}

export function navigateNextMove(path: string | PgnPath): boolean {
    let movePath = navigateFullMoveSequenceFromPath(path);
    if (!movePath) return false;
    let currentLinePosition = movePath.at(-1);
    if (typeof currentLinePosition === 'number') {
        const nextMovePath = movePath.with(-1, ++currentLinePosition);
        state.pgnPath = nextMovePath;
    }
    setButtonsDisabled(['back', 'reset'], false);
    return true;
}

export function onPgnMoveClick(event: Event): void {
    state.chessGroundShapes = [];
    state.pgnState = true;

    const target = event.target as HTMLElement;
    if (!target || !target.classList.contains('move')) return;

    document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
    target.classList.add('current');
    if (target.dataset.path) {
        const pathStr = createPgnPathString(target.dataset.path);
        if (pathStr) {
            const pathArray = createPgnPathArray(pathStr);
            if (pathArray) navigateFullMoveSequenceFromPath(pathArray);
        } else {
            return;
        }
    }
    const forwardButton = document.querySelector<HTMLButtonElement>("#navForward");
    if (forwardButton) forwardButton.disabled = !state.expectedMove;
    state.cg.set({
        fen: state.chess.fen(),
           check: state.chess.inCheck(),
           turnColor: toColor(),
           movable: {
               color: toColor(),
           dests: toDests()
           },
    });
    document.querySelectorAll<HTMLButtonElement>('#navBackward, #resetBoard')
    .forEach(el => el.disabled = false);

    drawArrows();
    startAnalysis(config.analysisTime);
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
    if (state.parsedPGN.gameComment) {
        pgnContainer.innerHTML += `<span class="comment"> ${state.parsedPGN.gameComment.comment} </span>`;
    }
    pgnContainer.innerHTML += buildPgnHtml(state.parsedPGN.moves);
}
