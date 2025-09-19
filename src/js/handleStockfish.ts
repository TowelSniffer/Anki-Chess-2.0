import { Chess } from 'chess.js';
import { cgwrap, toColor } from './chessFunctions';
import { state, config, cg, chess } from './config';

let stockfish = null;

function convertCpToWinPercentage(cp) {
    const probability = 1 / (1 + Math.pow(10, -cp / 400));
    let percentage = probability * 100;
    if (state.playerColour === toColor(chess)) {
        percentage = 100 - percentage;
    }
    return `${percentage.toFixed(1)}%`;
}

function handleStockfishMessages(event) {
    const message = event.data ? event.data : event;
    // Set the message handler for the new instance
    stockfish.onmessage = (event) => {
        const message = event.data ? event.data : event;
        if (typeof message !== 'string') return;
        if (message.startsWith('info')) {
            const parts = message.split(' ');
            const pvIndex = parts.indexOf('pv');
            const cpIndex = parts.indexOf('cp');
            const mateIndex = parts.indexOf('mate');
            const pvDepthIndex = parts.indexOf('depth');
            if (pvIndex > -1 && parts.length > pvIndex + 1) {
                const firstMove = parts[pvIndex + 1];
                const cp = parts[cpIndex + 1];
                const mate = parts[mateIndex + 1];
                let advantage;
                if (cpIndex === -1) {
                    advantage = mate < 0 ? 0 : 100;
                    if (state.playerColour === toColor(chess)) {
                        advantage = 100 - advantage;
                    }
                    advantage = `${advantage.toFixed(1)}%`
                } else {
                    advantage = convertCpToWinPercentage(cp);
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
                startAnalysis(config.analysisTime);
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
    };

    // Set the error handler to restart the engine on crash
    stockfish.onerror = (error) => {
        handleStockfishCrash("stockfish.onerror");
    };
    // Send the initial 'uci' command to confirm the engine is ready.
    stockfish.postMessage('uci');
}


function handleStockfishCrash(source) {
    console.error(`Stockfish engine crashed. Source: ${source}.`);
    console.log("Attempting to restart the engine...");
    if (!state.analysisToggledOn) return;
    // Reset any state that might be stuck because of the crash
    state.isStockfishBusy = false;
    // Re-initialize a fresh instance after a short delay to let the browser recover.
    setTimeout(initializeStockfish, 100);
}

export function initializeStockfish() {
    return new Promise((resolve) => {
        stockfish = new Worker('_stockfish.js');

        stockfish.onmessage = (event) => {
            const message = event.data ? event.data : event;
            if (typeof message !== 'string') return;

            // Resolve the promise once the engine is ready
            if (message === 'uciok') {
                // Re-assign the handler to process game-related messages
                stockfish.onmessage = handleStockfishMessages;
                resolve();
            }
        };

        stockfish.onerror = (error) => {
            handleStockfishCrash("stockfish.onerror");
            // You might want to reject the promise here too
        };

        stockfish.postMessage('uci');
    });
}

export function startAnalysis(movetime) {
    if (chess.moves().length === 0 || state.analysisFen === 'none') {
        return;
    }
    if (state.isStockfishBusy) {
        state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'stockfish' && shape.brush !== 'stockfinished');
        state.isStockfishBusy = false;
        stockfish.postMessage('stop');
        state.analysisFen = 'none';
        return;
    }
    state.analysisFen = chess.fen();
    state.isStockfishBusy = true;
    setTimeout(function() {
        stockfish.postMessage(`position fen ${state.analysisFen}`);
        stockfish.postMessage(`go movetime ${movetime}`);
    }, 200);

}

export function toggleStockfishAnalysis() {
    if (!stockfish) initializeStockfish();
    state.analysisToggledOn = !state.analysisToggledOn; // Toggle the state
    const toggleButton = document.querySelector("#stockfishToggle");
    toggleButton.classList.toggle('active-toggle', state.analysisToggledOn); // Add/remove class based on state

    if (state.analysisToggledOn) {
        cgwrap.classList.add('analysisMode');
        // Turn analysis ON
        toggleButton.innerHTML = "<span class='material-icons md-small'>developer_board</span>"
        startAnalysis(config.analysisTime);
    } else {
        cgwrap.classList.remove('analysisMode');
        toggleButton.innerHTML = "<span class='material-icons md-small'>developer_board_off</span>"
        // Turn analysis OFF
        if (state.isStockfishBusy) {
            stockfish.postMessage('stop'); // Tell the engine to stop thinking
        }
        state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'stockfinished' && shape.brush !== 'stockfish');
        cg.set({drawable: {shapes: state.chessGroundShapes}});
    }
}
