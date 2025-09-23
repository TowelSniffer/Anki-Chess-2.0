import { Chess } from 'chess.js';
import { toColor } from './chessFunctions';
import { state, config } from './config';
import type { Api } from 'chessground/api';

let stockfish: Worker | null = null;

function convertCpToWinPercentage(chess: Chess, cp: number): string {
    // This sigmoid function estimates win probability from centipawn advantage.
    const probability = 1 / (1 + Math.pow(10, -cp / 400));
    let percentage = probability * 100;

    // If the player is black, the perspective is flipped.
    if (state.playerColour === toColor(chess)) {
        percentage = 100 - percentage;
    }
    return `${percentage.toFixed(1)}%`;
}

function handleStockfishMessages(event: MessageEvent, cg: Api, chess: Chess): void {
    const message = event.data;
    if (typeof message !== 'string') {
        console.warn("Received a non-string message from the Stockfish worker:", message);
        return;
    }
    if (message.startsWith('info')) {
        const parts = message.split(' ');
        const pvIndex = parts.indexOf('pv');
        const cpIndex = parts.indexOf('cp');
        const mateIndex = parts.indexOf('mate');
        const pvDepthIndex = parts.indexOf('depth');
        if (pvIndex > -1 && parts.length > pvIndex + 1) {
            const firstMove = parts[pvIndex + 1];
            const cp = parseInt(parts[cpIndex + 1], 10);
            const mate: number = parseInt(parts[mateIndex + 1], 10);
            let advantage;
            if (cpIndex === -1) {
                advantage = mate < 0 ? 0 : 100;
                if (state.playerColour === toColor(chess)) {
                    advantage = 100 - advantage;
                }
                advantage = `${advantage.toFixed(1)}%`
            } else {
                advantage = convertCpToWinPercentage(chess, cp);
            }
            const pvDepth = parts[pvDepthIndex + 1];
            if (state.analysisFen !== 'none') document.documentElement.style.setProperty('--centipawn', advantage);
            if (state.analysisFen === chess.fen()) {
                const tempChess = new Chess(state.analysisFen);
                const moveObject = tempChess.move(firstMove);
                if (moveObject && state.analysisToggledOn) {
                    state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'stockfish' && shape.brush !== 'stockfinished');
                    state.chessGroundShapes.push({
                        orig: moveObject.from,
                        dest: moveObject.to,
                        brush: 'stockfish',
                        san: moveObject.san,
                    });
                    cg.set({drawable: {shapes: state.chessGroundShapes}});
                }
            }
        }
    } else if (message.startsWith('bestmove')) {
        cg.set({viewOnly: false});
        state.isStockfishBusy = false;
        if (state.analysisFen === 'none') {
            state.analysisFen = true;
            startAnalysis(chess, config.analysisTime);
        }
        const bestMoveUci = message.split(' ')[1];
        if (state.analysisFen === chess.fen()) {
            try {
                const tempChess = new Chess(state.analysisFen);
                const moveObject = tempChess.move(bestMoveUci);
                if (moveObject && state.analysisToggledOn) {
                    state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'stockfish' && shape.brush !== 'stockfinished');
                    state.chessGroundShapes.push({
                        orig: moveObject.from,
                        dest: moveObject.to,
                        brush: 'stockfinished',
                        san: moveObject.san,
                    });
                    cg.set({drawable: {shapes: state.chessGroundShapes}});
                }
            } catch (e) {
                // console.log(e)
            }
        }
    }
}

export function handleStockfishCrash(source: string, cg: Api, chess: Chess): void {
    console.error(`Stockfish engine crashed. Source: ${source}.`);
    if (!state.analysisToggledOn) return;

    console.log("Attempting to restart the engine...");
    state.isStockfishBusy = false;
    setTimeout(() => initializeStockfish(cg, chess), 250); // Give the browser a moment to recover
}

export function initializeStockfish(cg: Api, chess: Chess): Promise<void> {
    return new Promise((resolve, reject) => {
        // Terminate existing worker if it exists
        if (stockfish) stockfish.terminate();

        stockfish = new Worker('/_stockfish.js');
        stockfish.onmessage = (event: MessageEvent) => {
            const message: unknown = event.data ?? event;

            if (typeof message !== 'string') return;

            if (message === 'uciok') {
                stockfish!.postMessage('isready'); // Ensure the engine is fully ready
            } else if (message === 'readyok') {
                stockfish!.onmessage = ((event) => {handleStockfishMessages(event, cg, chess);})
                stockfish!.onerror = () => handleStockfishCrash("stockfish.onerror", cg, chess);
                resolve();
            }
        };

        stockfish.onerror = (error) => {
            console.error("Stockfish failed to initialize.", error);
            handleStockfishCrash("stockfish.on-init-error", cg, chess);
            reject(error);
        };

        stockfish.postMessage('uci');
    });
}

export function startAnalysis(chess: Chess, movetime: number): void {
    if (chess.moves().length === 0 || state.analysisFen === 'none' || !state.analysisToggledOn || !stockfish) return;

    if (state.isStockfishBusy) {
        state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'stockfish' && shape.brush !== 'stockfinished');
        state.isStockfishBusy = false;
        stockfish.postMessage('stop');
        state.analysisFen = 'none';
        return;
    }

    state.analysisFen = chess.fen();
    state.isStockfishBusy = true;
    stockfish.postMessage(`position fen ${state.analysisFen}`);
    stockfish.postMessage(`go movetime ${movetime}`);
}


export function toggleStockfishAnalysis(cgwrap: HTMLDivElement, cg: Api, chess: Chess): void {
    if (!cgwrap) return;
    if (!stockfish) {
        initializeStockfish(cg, chess).then(() => {
            // After initialization, re-run the toggle logic
            state.analysisToggledOn = false; // It will be flipped to true below
            toggleStockfishAnalysis(cgwrap, cg, chess);
        });
        return;
    }

    state.analysisToggledOn = !state.analysisToggledOn;
    const toggleButton = document.querySelector<HTMLButtonElement>("#stockfishToggle");

    if (toggleButton) {
        toggleButton.classList.toggle('active-toggle', state.analysisToggledOn);
        toggleButton.innerHTML = state.analysisToggledOn
        ? "<span class='material-icons md-small'>developer_board</span>"
        : "<span class='material-icons md-small'>developer_board_off</span>";
    }

    cgwrap.classList.toggle('analysisMode', state.analysisToggledOn);

    if (state.analysisToggledOn) {
        startAnalysis(chess, config.analysisTime);
    } else {
        if (state.isStockfishBusy) {
            stockfish.postMessage('stop');
            state.isStockfishBusy = false;
        }
        state.chessGroundShapes = state.chessGroundShapes.filter(
            shape => shape.brush !== 'stockfinished' && shape.brush !== 'stockfish'
        );
        cg.set({ drawable: { shapes: state.chessGroundShapes } });
    }
}
