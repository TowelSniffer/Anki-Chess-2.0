import { CustomPgnMove } from './types';

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

function findParentCustomMove(movesToSearch: CustomPgnMove[], targetMove: CustomPgnMove): CustomPgnMove | null {
    for (const move of movesToSearch) {
        if (move.variations) {
            for (const variationLine of move.variations) {
                // Check if this specific line contains the target move.
                if (variationLine.includes(targetMove)) {
                    return move; // 'move' is the parent.
                }

                // If not, recurse into this line to check its children's variations.
                const foundParent = findParentCustomMove(variationLine, targetMove);
                if (foundParent) {
                    return foundParent; // Pass the result up.
                }
            }
        }
    }

    return null;
}
