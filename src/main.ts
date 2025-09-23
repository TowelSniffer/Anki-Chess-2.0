import type { Chess } from 'chess.js';
import 'chessground/assets/chessground.base.css';
import './custom.css';
import type { Api } from 'chessground/api';
import { state, config, parsedPGN, htmlElement } from './js/config';
import { augmentPgnTree, highlightCurrentMove, initPgnViewer, onPgnMoveClick, navigateFullMoveSequenceFromPath, navigateNextMove, createPgnPathString, createPgnPathArray } from './js/pgnViewer';
import { playSound } from './js/audio';
import { toggleStockfishAnalysis, handleStockfishCrash, startAnalysis } from './js/handleStockfish';
import { initializeUI, positionPromoteOverlay } from './js/initializeUI';
import { loadChessgroundBoard, toDests, toColor, isEndOfLine, handlePgnState, handleMoveAttempt, getLastMove, updateBoard, getLegalMoveBySan } from './js/chessFunctions';
import { drawArrows } from './js/arrows';
import { findMoveContext, setButtonsDisabled } from './js/toolbox';

function setupEventListeners(cgwrap: HTMLDivElement, cg: Api, chess: Chess): void {
    function navBackward(): void {
        if (config.boardMode === 'Puzzle') return;
        const lastMove = chess.undo();
        if (lastMove) {
            state.debounceCheck = false;
            updateBoard(cg, chess, lastMove, true)
            if (state.expectedLine[state.count - 1]?.notation?.notation === lastMove.san) {
                state.count--
                state.expectedMove = state.expectedLine[state.count];
                if (state.count === 0 && state.expectedMove) {
                    const isVariation = findMoveContext(parsedPGN, state.expectedMove);
                    if (isVariation?.parent) {
                        state.count = isVariation.index;
                        state.expectedLine = isVariation.parentLine;
                        state.expectedMove = isVariation.parent;
                    }

                } else {
                    state.expectedMove = state.expectedLine[state.count];
                }
            }
            const firstMoveCheck = getLastMove(chess);
            if (state.count === 0 && state.ankiFen !== chess.fen()) {
                return;
            } else if (firstMoveCheck && (state.count === 0 || state.expectedLine[state.count - 1]?.notation.notation === firstMoveCheck.san) ) {
                handlePgnState(true);
            } else if (state.count === 0 && !firstMoveCheck) { // start of pgn from branch at first move
                handlePgnState(true)
            }
        }
        drawArrows(cg, chess);
        if (state.expectedLine[state.count - 1]?.notation?.notation) {

            const expectedMove = state.expectedLine[state.count - 1];
            highlightCurrentMove(expectedMove.pgnPath!);
        } else { // no moves played clear highlight
            document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
            setButtonsDisabled(['back', 'reset'], true);
        }
        startAnalysis(chess, config.analysisTime);
    }

    function navForward(): void {
        if(!state.expectedMove?.pgnPath) return;
        const navCheck = navigateNextMove(chess, state.pgnPath);
        if (navCheck) {
            cg.set({
                fen: chess.fen(),
                   check: chess.inCheck(),
                   turnColor: toColor(chess),
                   movable: {
                       color: toColor(chess),
                   dests: toDests(chess)
                   },
            });
            // drawArrows(cg, chess);
        }
    }

    function resetBoard(): void {
        state.count = 0; // Int so we can track on which move we are.
        state.chessGroundShapes = [];
        state.expectedLine = parsedPGN.moves; // Set initially to the mainline of pgn but can change path with variations
        state.expectedMove = parsedPGN.moves[state.count]; // Set the expected move according to PGN
        handlePgnState(true);
        chess.reset();
        chess.load(state.ankiFen);
        cg.set({
            fen: chess.fen(),
               check: chess.inCheck(),
               turnColor: toColor(chess),
               orientation: state.boardRotation,
               movable: {
                   color: toColor(chess),
               dests: toDests(chess)
               }
        });
        document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
        setButtonsDisabled(['back', 'reset'], true);
        startAnalysis(chess, config.analysisTime);
        drawArrows(cg, chess);
    }

    function rotateBoard(): void {
        state.boardRotation = state.boardRotation === "white" ? "black" : "white";

        const coordWhite = getComputedStyle(htmlElement).getPropertyValue("--coord-white").trim();
        const coordBlack = getComputedStyle(htmlElement).getPropertyValue("--coord-black").trim();
        htmlElement.style.setProperty("--coord-white", coordBlack);
        htmlElement.style.setProperty("--coord-black", coordWhite);

        cg.set({ orientation: state.boardRotation });

        const flipButton = document.querySelector<HTMLElement>(".flipBoardIcon");
        if (flipButton && flipButton.style.transform.includes("90deg")) {
            flipButton.style.transform = "rotate(270deg)";
        } else if (flipButton) {
            flipButton.style.transform = "rotate(90deg)";
        }
    }

    function copyFen(): boolean {
        let textarea = document.createElement("textarea");
        textarea.value = chess.fen();
        // Make the textarea invisible and off-screen
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            playSound("computer-mouse-click")
            return true;
        } catch (err) {
            playSound("Error")
            console.error('Failed to copy text using execCommand:', err);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }

    // --- PGN viewer ---
    const pgnContainer = document.getElementById('pgnComment');
    if (pgnContainer) {
        pgnContainer.addEventListener('click', (event) => {
            onPgnMoveClick(event, cg, chess);
        });
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
        'stockfishToggle': () => toggleStockfishAnalysis(cgwrap, cg, chess)
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
    cgwrap.addEventListener('wheel', (event: WheelEvent) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            navBackward();
        } else if (event.deltaY > 0) {
            navForward();
        }
    });

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
        handleStockfishCrash("window.onerror", cg, chess);
    }
    });
    // mirrorPgnTree
    let isUpdateScheduled = false;
    const handleReposition = (): void => {
        if (isUpdateScheduled) return;
        isUpdateScheduled = true;
        requestAnimationFrame(() => {
            positionPromoteOverlay(cgwrap);
            isUpdateScheduled = false;
        });
    };
    const resizeObserver = new ResizeObserver(handleReposition);
    resizeObserver.observe(cgwrap);
    window.addEventListener('resize', handleReposition);
    document.addEventListener('scroll', handleReposition, true);
}

function loadElements(): void {
    initializeUI();
    augmentPgnTree(parsedPGN.moves);
    const [cg, chess, cgwrap] = loadChessgroundBoard();
    setupEventListeners(cgwrap, cg, chess);
    initPgnViewer();
    const path = state.pgnPath;
    if (path) {
        cg.set({ animation: { enabled: false } }); // disable animation for inital startup
        navigateFullMoveSequenceFromPath(chess, path);
        cg.set({ animation: { enabled: true } });
    }
}

loadElements();
