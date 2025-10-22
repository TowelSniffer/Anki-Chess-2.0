import { getLegalMove } from './chessFunctions';
import { ShapeFilter, filterShapes, pushShapes } from './arrows';
import { state, config } from './config';
import { setButtonsDisabled, toColor } from './toolbox';

let stockfish: Worker | null = null;

function convertCpToWinPercentage(cp: number): string {
    // This sigmoid function estimates win probability from centipawn advantage.
    const probability = 1 / (1 + Math.pow(10, -cp / 400));
    let percentage = probability * 100;

    // If the player is black, the perspective is flipped.
    if (state.playerColour === toColor()) {
        percentage = 100 - percentage;
    }
    return `${percentage.toFixed(1)}%`;
}

function handleStockfishMessages(event: MessageEvent): void {
    const message = event.data;
    if (typeof message !== 'string') {
        console.warn("Received a non-string message from the Stockfish worker:", message);
        return;
    }
    const parts = message.split(' ');
    if (message.startsWith('info')) {
        // const pvDepthIndex = parts.indexOf('depth');
        // const pvDepth = parts[pvDepthIndex + 1];
        const pvIndex = parts.indexOf('pv');
        const cpIndex = parts.indexOf('cp');
        const mateIndex = parts.indexOf('mate');
        if (pvIndex > -1 && parts.length > pvIndex + 1) {
            const firstMove = parts[pvIndex + 1];
            const cp = parseInt(parts[cpIndex + 1], 10);
            const mate: number = parseInt(parts[mateIndex + 1], 10);
            let advantage;
            if (cpIndex === -1) {
                advantage = mate < 0 ? 0 : 100;
                if (state.playerColour === toColor()) {
                    advantage = 100 - advantage;
                }
                advantage = `${advantage.toFixed(1)}%`
            } else {
                advantage = convertCpToWinPercentage(cp);
            }
            document.documentElement.style.setProperty('--centipawn', advantage);
            const moveObject = getLegalMove(firstMove);
            if (moveObject && state.analysisToggledOn) {
                filterShapes(ShapeFilter.Stockfish);
                pushShapes(moveObject, "stockfish");
                state.cg.set({drawable: {shapes: state.chessGroundShapes}});
            }
        }
    } else if (message.startsWith('bestmove')) {
        state.isStockfishBusy = false;
        if (state.stockfishRestart) {
            state.stockfishRestart = false
            startAnalysis(config.analysisTime);
        }
        const bestMoveUci = message.split(' ')[1];
        const moveObject = getLegalMove(bestMoveUci);
        if (moveObject && state.analysisToggledOn) {
            filterShapes(ShapeFilter.Stockfish);
            pushShapes(moveObject, "stockfinished");
            state.cg.set({drawable: {shapes: state.chessGroundShapes}});
        }

    }
}

export function handleStockfishCrash(source: string): void {
    console.error(`Stockfish engine crashed. Source: ${source}.`);
    if (!state.analysisToggledOn) return;

    console.log("Attempting to restart the engine...");
    setTimeout(() => initializeStockfish(), 250); // Give the browser a moment to recover
}

function initializeStockfish(): Promise<void> {
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
                stockfish!.onmessage = ((event) => {handleStockfishMessages(event);})
                stockfish!.onerror = () => handleStockfishCrash("stockfish.onerror");
                resolve();
            }
        };

        stockfish.onerror = (error) => {
            console.error("Stockfish failed to initialize.", error);
            handleStockfishCrash("stockfish.on-init-error");
            reject(error);
        };

        stockfish.postMessage('uci');
    });
}

export function startAnalysis(movetime: number): void {
    if (!state.analysisToggledOn || !stockfish || state.stockfishRestart || state.chess.moves().length === 0) return;
    if (state.isStockfishBusy) {
        state.stockfishRestart = true;
        stockfish.postMessage('stop');
        return;
    }
    state.isStockfishBusy = true;
    stockfish.postMessage(`position fen ${state.chess.fen()}`);
    stockfish.postMessage(`go movetime ${movetime}`);
}

export function toggleStockfishAnalysis(): void {
    const toggleButton = document.querySelector<HTMLButtonElement>("#stockfishToggle");
    if (!toggleButton) return;
    if (!stockfish) {
        setButtonsDisabled(['stockfish'], true);
        initializeStockfish().then(() => {
            setButtonsDisabled(['stockfish'], false);
            // After initialization, re-run the toggle logic
            state.analysisToggledOn = false; // It will be flipped to true below
            toggleStockfishAnalysis();
        });
        return;
    }
    state.analysisToggledOn = !state.analysisToggledOn;

    toggleButton.classList.toggle('active-toggle', state.analysisToggledOn);

    toggleButton.innerHTML = state.analysisToggledOn
    ? "<span class='material-icons md-small'>developer_board</span>"
    : "<span class='material-icons md-small'>developer_board_off</span>";

    state.cgwrap.classList.toggle('analysisMode', state.analysisToggledOn);

    if (state.analysisToggledOn) {
        startAnalysis(config.analysisTime);
    } else {
        if (state.isStockfishBusy) {
            stockfish.postMessage('stop');
        }
        filterShapes(ShapeFilter.Stockfish);
        state.cg.set({drawable: {shapes: state.chessGroundShapes}});
    }
}
