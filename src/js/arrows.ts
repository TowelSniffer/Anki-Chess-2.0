import type { Chess } from 'chess.js';
import type { Api } from 'chessground/api';
import { state, config } from './config';
import { getLegalMoveBySan } from './chessFunctions';
import { findMoveContext } from './toolbox';
import nags from '../nags.json' assert { type: 'json' };
export interface NagData {
    [nagKey: string]: string[]; // [description, symbol/sub array of symbols]
}

// --- enum/array defs for clearer function instructions ---
// Chesground Shapes
export enum ShapeFilter {
    All = "All",
    Stockfish = "Stockfish",
    PGN = "PGN",
    Nag = "Nag",
    Drawn = "Drawn",
}

export const shapePriority = ["mainLine", "altLine", "blunderLine"];

export function filterShapes(filterKey: ShapeFilter): void {
    const shapeArray: Record<ShapeFilter, string[]> = {
        [ShapeFilter.All]: ["stockfish", "stockfinished", "mainLine", "altLine", "blunderLine", "moveType"],
        [ShapeFilter.Stockfish]: ["stockfish", "stockfinished"],
        [ShapeFilter.PGN]: ["mainLine", "altLine", "blunderLine", "moveType"],
        [ShapeFilter.Nag]: ["moveType"],
        [ShapeFilter.Drawn]: ["userDrawn"],
    };
    let brushesToRemove = shapeArray[filterKey];

    const shouldFilterDrawn = brushesToRemove.includes('userDrawn');
    if (shouldFilterDrawn) brushesToRemove = shapeArray[ShapeFilter.All];

    const filteredShapes = state.chessGroundShapes.filter(shape => {
        const shouldRemove = brushesToRemove.includes(shape.brush!);
        if (shouldFilterDrawn) {
            return shouldRemove
        } else {
            return !shouldRemove;
        }
    });

    // Assign the new, filtered array back to the state.
    state.chessGroundShapes = filteredShapes;
}

export function drawArrows(redraw: boolean = false): void {
    filterShapes(ShapeFilter.Stockfish)
    if (redraw) {
        state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
        return;
    }
    if (!state.pgnState) {
        state.chessGroundShapes = [];
        return
    }
    filterShapes(ShapeFilter.All);

    if (config.boardMode === 'Puzzle' && config.disableArrows) return;

    let expectedMove = state.expectedMove;
    let expectedLine = state.expectedLine;
    let count = state.count;
    let puzzleMove;


    if (config.boardMode === 'Puzzle') {
        count--;
        expectedMove = expectedLine[count];
        if (count === 0 && expectedLine) {
            const isVariation = findMoveContext(state.parsedPGN, expectedMove);
            if (isVariation?.parent) {
                expectedLine = isVariation.parentLine;
                count = isVariation.index;
                expectedMove = isVariation.parent;
            }
        };
        if (expectedMove) {
            puzzleMove = state.chess.undo();
            if (puzzleMove) puzzleMove = puzzleMove.san;
        }
    }

    // --- Arrow Display ---
    if (!expectedMove || typeof expectedMove === 'string') {
        state.cg.set({ drawable: { shapes: state.chessGroundShapes } }); // Clear any existing arrows
        return;
    }
    // --- Arrow Drawing Logic ---
    if (expectedMove?.variations) {
        // Draw blue arrows for all variations
        for (const variation of expectedMove.variations) {
            const alternateMove = getLegalMoveBySan(variation[0].notation.notation);
            const isBlunder = variation[0].nag?.some(nags => state.blunderNags.includes(nags));
            let brushType: string | null = 'altLine';
            if (isBlunder) brushType = 'blunderLine';
            if (isBlunder && config.boardMode === 'Puzzle') brushType = null;
            if (alternateMove && (alternateMove.san !== puzzleMove) && brushType) {
                state.chessGroundShapes.push({
                    orig: alternateMove.from,
                    dest: alternateMove.to,
                    brush: brushType,
                    san: alternateMove.san
                });
            } else if (variation[0].nag && alternateMove && (alternateMove.san === puzzleMove)) {
                const foundNag = variation[0].nag?.find(key => key in nags);
                if (foundNag && (nags as unknown as NagData)[foundNag] && (nags as unknown as NagData)[foundNag][2]) {
                    state.chessGroundShapes.push({
                        orig: alternateMove.to, // The square to anchor the image to
                        brush: 'moveType',
                        customSvg: {
                            html: `<image href="${(nags as unknown as NagData)[foundNag][2]}" width="40" height="40" />'`,
                        }
                    })
                }
            }
        }
    }
    // Draw the main line's move as a green arrow, ensuring it's on top
    const mainMoveAttempt = getLegalMoveBySan(expectedMove.notation.notation);
    if (mainMoveAttempt && (mainMoveAttempt.san !== puzzleMove)) {
        state.chessGroundShapes.push({ orig: mainMoveAttempt.from, dest: mainMoveAttempt.to, brush: 'mainLine', san: mainMoveAttempt.san });
    } else if (expectedMove.nag && mainMoveAttempt && (mainMoveAttempt.san === puzzleMove)) {
        const foundNag = expectedMove.nag?.find(key => key in nags);
        if (foundNag && (nags as unknown as NagData)[foundNag] && (nags as unknown as NagData)[foundNag][2]) {
            state.chessGroundShapes.push({
                orig: mainMoveAttempt.to, // The square to anchor the image to
                brush: 'moveType',
                customSvg: {
                    html: `<image href="${(nags as unknown as NagData)[foundNag][2]}" width="40" height="40" />'`,
                }
            })
        }
    }
    if (config.boardMode === 'Puzzle' && puzzleMove) {
        state.chess.move(puzzleMove);
    }
    state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
}
