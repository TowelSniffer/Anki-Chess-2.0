import 'chessground/assets/chessground.base.css';
import './custom.css';
import { state, cg, parsedPGN } from './js/config';
import { augmentPgnTree, highlightCurrentMove, initPgnViewer, getFullMoveSequenceFromPath, onPgnMoveClick } from './js/pgnViewer';
import { toggleStockfishAnalysis, handleStockfishCrash } from './js/handleStockfish';
import { initializeUI, positionPromoteOverlay } from './js/initializeUI';
import { cgwrap, reload, resetBoard, navBackward, navForward, rotateBoard, copyFen } from './js/chessFunctions';

function setupEventListeners(): void {
    // --- PGN viewer ---
    const pgnContainer = document.getElementById('pgnComment');
    if (pgnContainer) {
        pgnContainer.addEventListener('click', onPgnMoveClick);
    }

    const commentBox = document.getElementById('commentBox');
    if (!commentBox) return;

    commentBox.addEventListener('mouseover', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
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
        const target = event.target as HTMLElement;
        const moveElement = target.closest<HTMLElement>('.move');
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
        'stockfishToggle': () => toggleStockfishAnalysis(cgwrap)
    };

    document.querySelector<HTMLElement>('#buttons-container')?.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const button = target.closest('button');
        if (!button) return;

        const handler = actions[button.id];
        if (handler) {
            handler();
        }
    });

    // --- Board navigation ---
    if (cgwrap) {
        cgwrap.addEventListener('wheel', (event: WheelEvent) => {
            event.preventDefault();
            if (event.deltaY < 0) {
                navBackward();
            } else if (event.deltaY > 0) {
                navForward();
            }
        });
    }

    document.addEventListener('keydown', (event: KeyboardEvent) => {
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
    if (cgwrap) {
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
        resizeObserver.observe(cgwrap);
        window.addEventListener('resize', handleReposition);
        document.addEventListener('scroll', handleReposition, true);
    }
}

async function loadElements(): Promise<void> {
    initializeUI();
    augmentPgnTree(parsedPGN.moves);
    await reload();
    setupEventListeners();
    initPgnViewer();
    if (state.pgnPath && state.pgnPath !== 'null') {
        cg.set({ animation: { enabled: false } });
        getFullMoveSequenceFromPath(state.pgnPath.split(','));
        highlightCurrentMove(state.pgnPath.split(','));
        cg.set({ animation: { enabled: true } });
    }
}

loadElements();
