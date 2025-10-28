import { config } from '../../core/config';
import { state } from '../../core/state';
import { stateProxy } from '../../core/stateProxy';
import { navForward, navBackward, rotateBoard, copyFen, resetBoard } from '../ui/uiUtils';
import { positionPromoteOverlay } from './initializeUI';
import { toggleStockfishAnalysis, handleStockfishCrash } from '../analysis/handleStockfish';


// --- Event listeners ---

// setupEventListeners for scroll and key navigation and promote popup resize event listener
export function setupEventListeners(): void {

    // --- PGN viewer ---
    const pgnContainer = document.getElementById('pgnComment');
    if (pgnContainer) {
        pgnContainer.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLSpanElement) || !target.classList.contains('move')) return;
            const pathKey = target.dataset.pathKey;
            if (pathKey) {
                const move = state.pgnPathMap.get(pathKey);
                if (move) {
                    stateProxy.pgnPath = move.pgnPath;
                } else {
                    return;
                }
            }
        });
    }

    const commentBox = document.getElementById('commentBox');
    if (!commentBox) return;

    commentBox.addEventListener('mouseover', (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const moveElement = target.closest<HTMLElement>('.move');
        if (!moveElement) return;

        const tooltip = moveElement.querySelector<HTMLElement>('.nagTooltip');
        if (!tooltip || !tooltip.textContent?.trim()) return;

        const itemRect = moveElement.getBoundingClientRect();
        const tooltipWidth = tooltip.offsetWidth;
        const commentBoxRect = commentBox.getBoundingClientRect();

        let tooltipLeft = itemRect.left + (itemRect.width / 2) - (tooltipWidth / 2);
        if (tooltipLeft < commentBoxRect.left) {
            tooltipLeft = commentBoxRect.left;
        } else if (tooltipLeft + tooltipWidth > commentBoxRect.right) {
            tooltipLeft = commentBoxRect.right - tooltipWidth;
        }

        tooltip.style.left = `${tooltipLeft}px`;
        tooltip.style.top = `${itemRect.top - tooltip.offsetHeight - 3}px`;
        tooltip.style.display = 'block';
        tooltip.style.visibility = 'visible';
    });

    commentBox.addEventListener('mouseout', (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const moveElement = target.closest('.move');
        if (!moveElement) return;

        const tooltip = moveElement.querySelector<HTMLElement>('.nagTooltip');
        if (tooltip) {
            tooltip.style.visibility = 'hidden';
        }
    });

    // --- Button Actions ---
    const actions: Record<string, () => void> = {
        'resetBoard': resetBoard,
        'navBackward': navBackward,
        'navForward': navForward,
        'rotateBoard': rotateBoard,
        'copyFen': copyFen,
        'stockfishToggle': () => toggleStockfishAnalysis()
    };

    document.querySelector<HTMLDivElement>('#buttons-container')?.addEventListener('click', (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const button = target.closest('button');
        if (!button) return;
        const handler = actions[button.id];
        if (handler) {
            handler();
        }
    });

    // --- Board navigation ---

    const promoteOverlay = document.getElementById('overlay');
    state.cgwrap.addEventListener('wheel', (event: WheelEvent) => {
        if ((promoteOverlay && !promoteOverlay.classList.contains('hidden')) || config.boardMode !== 'Viewer') return;
        event.preventDefault();
        if (event.deltaY < 0) {
            navBackward();
        } else if (event.deltaY > 0) {
            navForward();
        }
    });

    document.addEventListener('keydown', (event: KeyboardEvent) => {
        if ((promoteOverlay && !promoteOverlay.classList.contains('hidden')) || config.boardMode !== 'Viewer') return;
        switch (event.key) {
            case 'ArrowLeft':
                navBackward();
                break;
            case 'ArrowRight':
                navForward();
                break;
            case 'ArrowDown':
                resetBoard();
                break;
        }
    });

    // --- Error and Resize Handlers ---
    window.addEventListener('error', (event: ErrorEvent) => {
        const message = event.message || '';
        const filename = event.filename || '';
        const isDetailedStockfishCrash = message.includes('abort') && filename.includes('_stockfish.js');
        const isGenericCrossOriginError = message === 'Script error.';

    if (isDetailedStockfishCrash || isGenericCrossOriginError) {
        event.preventDefault();
        console.warn("Caught a fatal Stockfish crash via global error handler.");
        if (isGenericCrossOriginError) {
            console.log("generic message:", message);
        } else {
            console.log(`Crash details: Message: "${message}", Filename: "${filename}"`);
        }
        handleStockfishCrash("window.onerror");
    }
    });
    // mirrorPgnTree
    let isUpdateScheduled = false;
    const handleReposition = (): void => {
        if (isUpdateScheduled) return;
        isUpdateScheduled = true;
        requestAnimationFrame(() => {
            positionPromoteOverlay();
            isUpdateScheduled = false;
        });
    };
    const resizeObserver = new ResizeObserver(handleReposition);
    resizeObserver.observe(state.cgwrap);
    window.addEventListener('resize', handleReposition);
    document.addEventListener('scroll', handleReposition, true);
}
