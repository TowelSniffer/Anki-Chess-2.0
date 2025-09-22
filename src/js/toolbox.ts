import { CustomPgnMove, CustomPgnGame } from './types';

export interface FindMoveResult {
    line: CustomPgnMove[];
    index: number;
}

export function waitForElement<T extends Element>(selector: string): Promise<T> {
    return new Promise(resolve => {
        const element = document.querySelector<T>(selector);
        if (element) {
            return resolve(element);
        }
        const observer = new MutationObserver(() => {
            const element = document.querySelector<T>(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
}

function searchInLine(line: CustomPgnMove[], targetMove: CustomPgnMove): FindMoveResult | null {
    for (let i = 0; i < line.length; i++) {
        if (line[i] === targetMove) {
            return { line: line, index: i };
        }
    }

    for (const move of line) {
        if (move.variations) {
            for (const variationLine of move.variations) {
                const result = searchInLine(variationLine, targetMove);
                if (result) {
                    return result;
                }
            }
        }
    }

    return null;
}

//Finds a specific move within a CustomPgnGame structure.
export function findMoveInGame(game: CustomPgnGame, targetMove: CustomPgnMove): FindMoveResult | null {
    return searchInLine(game.moves, targetMove);
}


