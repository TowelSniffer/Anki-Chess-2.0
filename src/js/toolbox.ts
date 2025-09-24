import type { CustomPgnMove, CustomPgnGame } from './types';

interface ParentContext {
    parent: CustomPgnMove;
    parentLine: CustomPgnMove[];
    index: number;
}

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

// Finds the parent of a target move's line, and the line that contains that parent.
export function findMoveContext(game: CustomPgnGame, targetMove: CustomPgnMove): ParentContext | null {
    // Find the line where target move lives.
    const moveLocation = findMoveInGame(game, targetMove);
    if (!moveLocation) return null;

    // Find the parent of that line.
    const lineParentResult = findParentMoveOfLine(game, moveLocation.line);
    if (!lineParentResult) return null; // No parent (it's the main line).

    const parentMove = lineParentResult.parent;

    // Find the line and index that contains the parentMove.
    const parentMoveLocation = findMoveInGame(game, parentMove);
    if (!parentMoveLocation) return null; // Should not happen in a valid tree.

    return {
        parent: parentMove,
        parentLine: parentMoveLocation.line,
        index: parentMoveLocation.index
    };
}

function findMoveInGame(game: CustomPgnGame, targetMove: CustomPgnMove): { line: CustomPgnMove[]; index: number } | null {
    function search(line: CustomPgnMove[]): { line: CustomPgnMove[]; index: number } | null {
        const index = line.indexOf(targetMove);
        if (index !== -1) return { line, index };
        for (const move of line) {
            if (move.variations) {
                for (const variationLine of move.variations) {
                    const result = search(variationLine);
                    if (result) return result;
                }
            }
        }
        return null;
    }
    return search(game.moves);
}

function findParentMoveOfLine(game: CustomPgnGame, targetLine: CustomPgnMove[]): { parent: CustomPgnMove; variationIndex: number } | null {
    function search(moves: CustomPgnMove[]): { parent: CustomPgnMove; variationIndex: number } | null {
        for (const move of moves) {
            if (move.variations) {
                const index = move.variations.indexOf(targetLine);
                if (index !== -1) return { parent: move, variationIndex: index };
                for (const variationLine of move.variations) {
                    const result = search(variationLine);
                    if (result) return result;
                }
            }
        }
        return null;
    }
    return search(game.moves);
}

