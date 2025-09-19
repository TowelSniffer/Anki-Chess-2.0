import 'chessground/assets/chessground.base.css';
import './custom.css';
import { state, parsedPGN } from './js/config.js';
import { augmentPgnTree, highlightCurrentMove, initPgnViewer, getFullMoveSequenceFromPath, onPgnMoveClick } from './js/pgnViewer.js';
import { toggleStockfishAnalysis } from './js/handleStockfish.js';
import { initializeUI, positionPromoteOverlay } from './js/initializeUI.js';
import { reload, resetBoard, navBackward, navForward, rotateBoard, copyFen } from './js/chessFunctions.js';

function setupEventListeners() {
    // --- PGN viewer ---
    const pgnContainer = document.getElementById('pgnComment');
    pgnContainer.addEventListener('click', onPgnMoveClick);

    const commentBox = document.getElementById('commentBox');

    commentBox.addEventListener('mouseover', (event) => {
        const moveElement = event.target.closest('.move');

        // If the mouse isn't over a '.move' element, do nothing.
        if (!moveElement) {
            return;
        }

        const tooltip = moveElement.querySelector('.nagTooltip');

        if (!tooltip || !tooltip.textContent.trim()) return;

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

    commentBox.addEventListener('mouseout', (event) => {
        const moveElement = event.target.closest('.move');

        if (!moveElement) {
            return;
        }

        const tooltip = moveElement.querySelector('.nagTooltip');
        if (tooltip) {
            tooltip.style.visibility = 'hidden';
        }
    });

    // navButtons
    const actions = {
        'resetBoard': resetBoard,
        'navBackward': navBackward,
        'navForward': navForward,
        'rotateBoard': rotateBoard,
        'copyFen': copyFen,
        'stockfishToggle': toggleStockfishAnalysis
    };

    document.querySelector('#buttons-container').addEventListener('click', (event) => {
        // Start at the clicked element and find the nearest parent <button>
        const button = event.target.closest('button');
        if (!button) return;

        const handler = actions[button.id];
        if (handler) {
            handler();
        }
    });

    // --- Board navigation ---
    // wheel navigation
    board.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            navBackward();
        } else if (event.deltaY > 0) {
            navForward();
        }
    });

    // arrow navigation
    document.addEventListener('keydown', (event) => {
        // We don't prevent default here to allow for browser shortcuts etc.
        // The individual functions can call it if needed.
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

    // stockfish crash handler
    window.addEventListener('error', (event) => {
        const message = event.message || '';
        const filename = event.filename || '';

        // stockfish js crash error message.
        const isDetailedStockfishCrash = message.includes('abort') && filename.includes('_stockfish.js');

        // generic "Script error."
        const isGenericCrossOriginError = message === 'Script error.';

        if (isDetailedStockfishCrash || isGenericCrossOriginError) {
            // Prevent the default browser error console message since we are handling it
            event.preventDefault();
            console.warn("Caught a fatal Stockfish crash via global error handler.");
            if (isGenericCrossOriginError) {
                console.log("generic message:", message)
            } else {
                console.log(`Crash details: Message: "${message}", Filename: "${filename}"`);
            }
            handleStockfishCrash("window.onerror");
        }
    });

    // handle promote resize
    const cgwrap = document.querySelector('.cg-wrap');
    if (cgwrap) {
        let isUpdateScheduled = false;
        const handleReposition = () => {
            // If an update is already in the queue for the next frame, do nothing. Prevents running twice with resize event
            if (isUpdateScheduled) {
                return;
            }
            isUpdateScheduled = true;
            requestAnimationFrame(() => { // for when board itself is resized
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

// load board
async function loadElements() {
    initializeUI();
    augmentPgnTree(parsedPGN.moves);
    await reload();
    setupEventListeners();
    initPgnViewer();
    if (state.pgnPath && state.pgnPath !== 'null') {
        cg.set({ animation: { enabled: false} })
        getFullMoveSequenceFromPath(state.pgnPath.split(','));
        highlightCurrentMove(state.pgnPath.split(','));
        cg.set({ animation: { enabled: true} })
    }
}

loadElements();
