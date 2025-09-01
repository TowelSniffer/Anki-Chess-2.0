import { Chess, SQUARES } from 'chess.js';
import { Chessground } from 'chessground';
import { parse } from '@mliebelt/pgn-parser';
import 'chessground/assets/chessground.base.css';
import './custom.css';
import * as mirror from './mirror.js';

function toggleDisplay(className) {
    document.querySelectorAll('.' + className).forEach(el => el.classList.toggle('hidden'));
}
const urlVars = {};
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
    // The value from the regex is raw, so it needs to be decoded only once.
    urlVars[key] = decodeURIComponent(value).replace("#!/0", "");
});

function getUrlParam(name, defaultValue) {
    return urlVars[name] !== undefined ? urlVars[name] : defaultValue;
}

// --- Configuration ---
const config = {
    pgn: getUrlParam("PGN", `[Event "?"]
    [Site "?"]
    [Date "2023.02.13"]
    [Round "?"]
    [White "White"]
    [Black "Black"]
    [Result "*"]
    [FEN "r1bq1rk1/ppp1bppp/2pn4/8/8/8/PPPP1PPP/RNBQRBK1 w - - 2 9"]
    [SetUp "1"]

    9. d4 Re8 {EV: 46.6%, N: 60.04% of 177k} (9... Nf5 {EV: 46.7%, N: 25.55% of
        177k}) (9... Bg5 {EV: 45.5%, N: 3.91% of 177k}) (9... Bf5 {EV: 44.9%, N: 2.86%
            of 177k}) (9... a5 {EV: 45.4%, N: 2.51% of 177k}) *`),
    fontSize: getUrlParam("fontSize", 16),
    ankiText: getUrlParam("userText", null),
    frontText: getUrlParam("frontText", 'false') === 'true',
    muteAudio: getUrlParam("muteAudio", 'false') === 'true',
    showDests: getUrlParam("showDests", 'true') === 'true',
    handicap: parseInt(getUrlParam("handicap", 1), 10),
    strictScoring: getUrlParam("strictScoring", 'false') === 'true',
    acceptVariations: getUrlParam("acceptVariations", 'true') === 'true',
    disableArrows: getUrlParam("disableArrows", 'false') === 'true',
    flipBoard: getUrlParam("flip", 'false') === 'true',
    boardMode: getUrlParam("boardMode", 'Viewer'),
    background: getUrlParam("background", "#2C2C2C"),
    mirror: getUrlParam("mirror", 'true') === 'true',
};

// --- Global State ---
let state = {
    ankiFen: "",
    boardRotation: "black",
    playerColour: "white",
    opponentColour: "black",
    solvedColour: "limegreen",
    errorTrack: getUrlParam("errorTrack", null),
    count: 0,
    pgnState: true,
    chessGroundShapes: [],
    expectedLine: [],
    expectedMove: null,
    errorCount: 0,
    promoteChoice: 'q',
    promoteAnimate: true,
    debounceTimeout: null,
    navTimeout: null,
    isStockfishBusy: false,
    analysisFen: null,
    analysisToggledOn: false,
    pgnPath: [],
    mirrorState: getUrlParam("mirrorState", null),
};

const nags = {
    "$1": ["Good move", "!", "_good.webp"],
    "$2": ["Poor move", "?", "_mistake.webp"],
    "$3": ["Excellent move!", "!!", "_brilliant.webp"],
    "$4": ["Blunder", "??", "_blunder.webp"],
    "$5": ["Interesting move", "!?"],
    "$6": ["Dubious move", "?!", "_dubious.webp"],
    "$9": ["Worst move", "???", "_blunder.webp"],
    "$10": ["Equal chances, quiet position", "="],
    "$11": ["Equal chances, active position", "=†"],
    "$13": ["Unclear position", "∞"],
    "$14": ["White slight advantage", "+/="], // alt: ⩲
    "$15": ["Black slight advantage", "=/+"], // alt: ⩱
    "$16": ["White moderate advantage", "+/-"], // alt: ±
    "$17": ["Black moderate advantage", "-/+"], // alt: ∓
    "$18": ["White decisive advantage", "+-"],
    "$19": ["Black decisive advantage", "-+"],
    "$20": ["White crushing advantage (resign)", ""],
    "$21": ["Black crushing advantage (resign)", ""],
    "$22": ["White in zugzwang", "⨀"],
    "$23": ["Black in zugzwang", "⨀"],
    "$26": ["White moderate space advantage", "○"],
    "$27": ["Black moderate space advantage", "○"],
    "$32": ["White moderate development advantage", "⟳"],
    "$33": ["Black moderate development advantage", "⟳"],
    "$36": ["White has the initiative", "↑"],
    "$37": ["Black has the initiative", "↑"]
};

const blunderNags = ['$2', '$4', '$6', '$9'];

if (!state.errorTrack) {
    state.errorTrack = false;
}

window.addEventListener('error', (event) => {
    const message = event.message || '';
    const filename = event.filename || '';

    // Condition 1: A detailed error message that we can identify.
    const isDetailedStockfishCrash = message.includes('abort') && filename.includes('_stockfish.js');

    // Condition 2: A generic "Script error."
    const isGenericCrossOriginError = message === 'Script error.';

    if (isDetailedStockfishCrash || isGenericCrossOriginError) {
        // Prevent the default browser error console message since we are handling it
        event.preventDefault();
        console.warn("Caught a fatal Stockfish crash via global error handler.");
        if (isGenericCrossOriginError) {
        } else {
            console.log(`Crash details: Message: "${message}", Filename: "${filename}"`);
        }
        handleStockfishCrash("window.onerror");
    }
});

// --- Stockfish Analysis State ---
let cg = null;
let chess = null;

// --- Audio Handling ---
// Pre-load all audio files to prevent playback delays and race conditions.
function initAudio(mute) {
    const sounds = ["Move", "checkmate", "move-check", "Capture", "castle", "promote", "Error", "computer-mouse-click"];
    const audioMap = new Map();
    sounds.forEach(sound => {
        const audio = new Audio(`_${sound}.mp3`);
        audio.preload = 'auto';
        audio.muted = mute;
        audioMap.set(sound, audio);
    });
    return audioMap;
}

const audioMap = initAudio(config.muteAudio);

function playSound(soundName) {
    if (config.muteAudio) return
    const audio = audioMap.get(soundName);
    if (audio) {
        // Clone the preloaded audio element and play the clone.
        // This prevents race conditions and issues with interrupting a sound that's already playing, especially in Firefox.
        audio.cloneNode().play().catch(e => console.error(`Could not play sound: ${soundName}`, e));
    }
}

chess = new Chess();
const parsedPGN = parse(config.pgn, { startRule: "game" });

state.ankiFen = parsedPGN.tags.FEN ? parsedPGN.tags.FEN : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function checkCastleRights(fen) {
    const castlingPart = fen.split(' ')[2];
    // If the castling part is not '-', at least one side has castling rights.
    return castlingPart !== '-';
}

if (config.mirror && !checkCastleRights(state.ankiFen) && config.boardMode === 'Puzzle') {
    if (!state.mirrorState) state.mirrorState = mirror.assignMirrorState(config.pgn);
    mirror.mirrorPgnTree(parsedPGN.moves, state.mirrorState);
    state.ankiFen = mirror.mirrorFen(state.ankiFen, state.mirrorState);
}

function augmentPgnTree(moves, path = []) {
    if (!moves) return;
    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const currentPath = [...path, i];
        move.pgnPath = currentPath;

        if (move.variations) {
            move.variations.forEach((variation, varIndex) => {
                const variationPath = [...currentPath, 'v', varIndex];
                augmentPgnTree(variation, variationPath);
            });
        }
    }
}

augmentPgnTree(parsedPGN.moves);

chess.load(state.ankiFen);

// --- UI Initialization ---
document.documentElement.style.setProperty('--background-color', config.background);
const commentBox = document.getElementById('commentBox');
commentBox.style.fontSize = `${config.fontSize}px`;
if (config.ankiText) {
    document.getElementById('textField').innerHTML = config.ankiText;
} else {
    document.getElementById('textField').style.display = "none";
}
if (config.boardMode === "Puzzle") {
    document.querySelector('#buttons-container').style.visibility = "hidden";
    document.getElementById('pgnComment').style.display = "none";

    if (!config.frontText || !config.ankiText) commentBox.style.display = "none";
}
const fenParts = state.ankiFen.split(' ');
state.boardRotation = (fenParts.length > 1 && fenParts[1] === 'w') ? 'white' : 'black';

if (config.flipBoard) {
    state.boardRotation = state.boardRotation === "white" ? "black" : "white";
}
if (state.boardRotation === "white") {
    const root = document.documentElement;
    // Get the current values of the CSS variables
    const coordWhite = getComputedStyle(root).getPropertyValue('--coord-white').trim();
    const coordBlack = getComputedStyle(root).getPropertyValue('--coord-black').trim();
    // Swap the values. so coord colors are correct
    root.style.setProperty('--coord-white', coordBlack);
    root.style.setProperty('--coord-black', coordWhite);
}

state.playerColour = state.boardRotation;
state.opponentColour = state.boardRotation === "white" ? "black" : "white";
document.documentElement.style.setProperty('--border-color', state.playerColour);
document.documentElement.style.setProperty('--player-color', state.playerColour);
document.documentElement.style.setProperty('--opponent-color', state.opponentColour);

// --- Core Functions ---
function toDests(chess) {
    const dests = new Map();
    SQUARES.forEach(s => {
        const ms = chess.moves({ square: s, verbose: true });
        if (ms.length) dests.set(s, ms.map(m => m.to));
    });
    return dests;
}

function toColor(chess) {
    return chess.turn() === 'w' ? 'white' : 'black';
}

function getOpponentColor(chess) {
    return chess.turn() === 'w' ? 'b' : 'w';
}

function getLastMove(chess) {
    const allMoves = chess.history({ verbose: true }); // Get all moves with verbose details

    if (allMoves.length > 0) {
        return allMoves[allMoves.length - 1];
    } else {
        return false // No moves have been made yet.
    }
}

function highlightCurrentMove(pgnPath) {
    document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
    document.querySelector(`[data-path="${pgnPath.join(',')}"]`).classList.add("current");
}

function drawArrows(cg, chess, redraw) {
    state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'stockfinished' && shape.brush !== 'stockfish');
    if (redraw) {
        cg.set({ drawable: { shapes: state.chessGroundShapes } });
        return;
    }
    if (!state.pgnState) {
        state.chessGroundShapes = [];
        return
    }
    state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'mainLine' && shape.brush !== 'altLine' && shape.brush !== 'blunderLine' && shape.customSvg?.brush !== 'moveType');
    if (config.boardMode === 'Puzzle' && config.disableArrows) {
        return;
    }

    let expectedMove = state.expectedMove;
    let expectedLine = state.expectedLine;
    let puzzleMove;
    let count = state.count;
    let parentOfChild;

    if (config.boardMode === 'Puzzle') {
        count--;
        if (count === 0) {
            parentOfChild = findParent(parsedPGN.moves, expectedLine);
            if (parentOfChild) {
                for (var i = 0; i < 2; i++) {
                    parentOfChild = findParent(parsedPGN.moves, parentOfChild.parent);

                };
                expectedLine = parentOfChild.parent;
                count = parentOfChild.key;
                expectedMove = expectedLine[count];
            }
        }
        if (parentOfChild?.parent) {
            expectedLine = parentOfChild.parent;
        }
        expectedMove = expectedLine[count];
        if (expectedMove) {
            puzzleMove = chess.undo().san;
        }
    }

    // --- Arrow Display ---
    if (!expectedMove || typeof expectedMove === 'string') {
        cg.set({ drawable: { shapes: state.chessGroundShapes } }); // Clear any existing arrows
        return;
    }
    // --- Arrow Drawing Logic ---
    const tempChess = new Chess(chess.fen());
    // Draw blue arrows for all variations
    if (expectedMove?.variations) {
        for (const variation of expectedMove.variations) {
            const alternateMove = tempChess.move(variation[0].notation.notation);
            const isBlunder = variation[0].nag?.some(nags => blunderNags.includes(nags));
            let brushType = 'altLine';
            if (isBlunder) brushType = 'blunderLine';
            if (isBlunder && config.boardMode === 'Puzzle') brushType = null;
            if (alternateMove && (alternateMove.san !== puzzleMove) && brushType) {
                state.chessGroundShapes.push({
                    orig: alternateMove.from,
                    dest: alternateMove.to,
                    brush: brushType,
                    san: alternateMove.san
                });
            } else if (variation[0].nag && (alternateMove.san === puzzleMove)) {
                const foundNag = variation[0].nag?.find(key => key in nags);
                if (foundNag && nags[foundNag] && nags[foundNag][2]) {
                    state.chessGroundShapes.push({
                        orig: alternateMove.to, // The square to anchor the image to
                        customSvg: {
                            html: `<image href="${nags[foundNag][2]}" width="40" height="40" />'`,
                            brush: 'moveType'
                        }
                    })
                }
            }
            tempChess.undo(); // Reset for the next variation check
        }
    }


    // Draw the main line's move as a green arrow, ensuring it's on top
    let mainMoveAttempt
    if (tempChess.moves().includes(expectedMove.notation.notation)) {
        mainMoveAttempt = tempChess.move(expectedMove.notation.notation);
    } else {
        mainMoveAttempt = null;
    }
    if (mainMoveAttempt && (mainMoveAttempt.san !== puzzleMove)) {
        state.chessGroundShapes.push({ orig: mainMoveAttempt.from, dest: mainMoveAttempt.to, brush: 'mainLine', san: mainMoveAttempt.san });
    } else if (expectedMove.nag && mainMoveAttempt && (mainMoveAttempt.san === puzzleMove)) {
        const foundNag = expectedMove.nag?.find(key => key in nags);
        if (foundNag && nags[foundNag] && nags[foundNag][2]) {
            state.chessGroundShapes.push({
                orig: mainMoveAttempt.to, // The square to anchor the image to
                customSvg: {
                    html: `<image href="${nags[foundNag][2]}" width="40" height="40" />'`,
                    brush: 'moveType'
                }
            })
        }
    }

    if (config.boardMode === 'Puzzle' && puzzleMove) {
        chess.move(puzzleMove);
    }
    cg.set({ drawable: { shapes: state.chessGroundShapes } });
}

function updateBoard(cg, chess, move, quite) { // animate user/ai moves on chessground
    if (!quite) { changeAudio(move) }
    if (!state.analysisToggledOn) {
        cgwrap.classList.remove('analysisMode');
    }
    if (!state.pgnState) {
        state.chessGroundShapes = [];
    }
    if (state.pgnState && state.expectedLine && state.count > 0) {
        const currentMove = state.expectedLine[state.count - 1];
        if (currentMove && currentMove.pgnPath) {
            state.pgnPath = currentMove.pgnPath;
        }
    }

    if (move.flags.includes("p") && state.promoteAnimate) {
        const tempChess = new Chess(chess.fen());
        tempChess.load(chess.fen());
        tempChess.remove(move.from);
        tempChess.put({ type: 'p', color: getOpponentColor(chess) }, move.to);
        cg.set({
            fen: tempChess.fen(),
        });
        setTimeout(() => {
            cg.set({ animation: { enabled: false} })
            cg.set({
                fen: chess.fen(),
            });
            cg.set({ animation: { enabled: true} });
            drawArrows(cg, chess);
        }, 200)
    } else if (move.flags.includes("e") && !state.selectState) {
        chess.undo();
        cg.set({ animation: { enabled: false} })
        cg.set({
            fen: chess.fen(),
        });
        cg.set({ animation: { enabled: true} })
        chess.move(move.san);
        cg.set({
            fen: chess.fen(),
        });
    } else {
            cg.set({ fen: chess.fen() });
    }
    cg.set({
        check: chess.inCheck(),
        turnColor: toColor(chess),
        movable: {
            dests: toDests(chess),
            // In Puzzle mode, the movable color is fixed to the user's side to allow premoves.
            // In Viewer mode, it follows the current turn.
            color: config.boardMode === 'Puzzle' ? state.playerColour : toColor(chess),
        },
        lastMove: [move.from, move.to]
    });
    document.querySelector("#navBackward").disabled = false;
    document.querySelector("#resetBoard").disabled = false;
    if (config.boardMode === "Viewer" && state.pgnState) highlightCurrentMove(state.expectedMove.pgnPath);
    if (state.analysisToggledOn) {
        startAnalysis(4000);
    }
}
var stockfish = null;

function handleStockfishCrash(source) {
    console.error(`Stockfish engine crashed. Source: ${source}.`);
    console.log("Attempting to restart the engine...");
    if (!state.analysisToggledOn) return;
    // Reset any state that might be stuck because of the crash
    state.isStockfishBusy = false;
    // Re-initialize a fresh instance after a short delay to let the browser recover.
    setTimeout(initializeStockfish, 100);
}

function convertCpToWinPercentage(cp) {
    const probability = 1 / (1 + Math.pow(10, -cp / 400));
    let percentage = probability * 100;
    if (state.playerColour === toColor(chess)) {
        percentage = 100 - percentage;
    }
    return `${percentage.toFixed(1)}%`;
}

// A more robust, async version
function initializeStockfish() {
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
                startAnalysis(4000);
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
function startAnalysis(movetime) {
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

function toggleStockfishAnalysis() {
    if (!stockfish) initializeStockfish();
    state.analysisToggledOn = !state.analysisToggledOn; // Toggle the state
    const toggleButton = document.querySelector("#stockfishToggle");
    toggleButton.classList.toggle('active-toggle', state.analysisToggledOn); // Add/remove class based on state

    if (state.analysisToggledOn) {
        cgwrap.classList.add('analysisMode');
        // Turn analysis ON
        toggleButton.innerHTML = "<span class='material-icons md-small'>developer_board</span>"
        startAnalysis(4000);
    } else {
        cgwrap.classList.remove('analysisMode');
        toggleButton.innerHTML = "<span class='material-icons md-small'>developer_board_off</span>"
        // Turn analysis OFF
        if (state.isStockfishBusy) {
            stockfish.postMessage('stop'); // Tell the engine to stop thinking
        }
    }
    drawArrows(cg, chess);
}

function setNavButtonsDisabled(disabled) {
    const buttonIds = ['#resetBoard', '#navBackward', '#navForward', '#rotateBoard', '#copyFen', '#stockfishToggle'];
    buttonIds.forEach(id => {
        const button = document.querySelector(id);
        if (button) {
            button.disabled = disabled;
        }
    });
}

function makeMove(cg, chess, move) {
    const moveResult = chess.move(move);
    if (!moveResult) return null;
    updateBoard(cg, chess, moveResult);
    return moveResult;
}

function handleViewerMove(cg, chess, orig, dest) {
    const tempChess = new Chess(chess.fen());
    let move;
    let promoCheck = false;
    if (dest) {
        move = tempChess.move({ from: orig, to: dest, promotion: 'q' });
        promoCheck = true;
    } else {
        move = tempChess.move(orig.san);
    }
    if (move.flags.includes("p") && promoCheck) {
        promotePopup(cg, chess, move.from, move.to, null)
    } else {
        checkUserMove(cg, chess, move.san, null);
    }
    if (!state.expectedMove || typeof state.expectedMove === 'string') {
        document.querySelector("#navForward").disabled = true;
    }
}

function playAiMove(cg, chess, delay) {
    setTimeout(() => {
        if (!state.expectedMove || typeof state.expectedMove === 'string') return;
        state.errorCount = 0;
        if (state.expectedMove.variations && state.expectedMove.variations.length > 0 && config.acceptVariations) {
            const moveVar = Math.floor(Math.random() * (state.expectedMove.variations.length + 1));
            if (moveVar !== state.expectedMove.variations.length) {
                state.count = 0;
                state.expectedLine = state.expectedMove.variations[moveVar];
                state.expectedMove = state.expectedLine[0];
            }
        }
        makeMove(cg, chess, state.expectedMove.notation.notation);
        state.count++;
        state.expectedMove = state.expectedLine[state.count];

        if (!state.expectedMove || typeof state.expectedMove === 'string') {
            window.parent.postMessage(state, '*');
            document.documentElement.style.setProperty('--border-color', state.solvedColour);
            cg.set({
                selected: undefined, // Clear any selected square
                draggable: {
                    current: undefined // Explicitly clear any currently dragged piece
                },
                viewOnly: true
            });
        }
        drawArrows(cg, chess, true);
    }, delay);
}

function playUserCorrectMove(cg, chess, delay) {
    setTimeout(() => {
        cg.set({ viewOnly: false }); // will be disabled when user reaches handicap
        if (!state.expectedMove || typeof state.expectedMove === 'string') return;
        state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.customSvg?.brush !== 'moveType');
        // Make the move without the AI's variation-selection logic
        makeMove(cg, chess, state.expectedMove.notation.notation);
        state.count++;
        state.expectedMove = state.expectedLine[state.count];

        if (!state.expectedMove || typeof state.expectedMove === 'string') {
            window.parent.postMessage(state, '*');
            document.documentElement.style.setProperty('--border-color', state.solvedColour);
            cg.set({
                selected: undefined, // Clear any selected square
                draggable: {
                    current: undefined // Explicitly clear any currently dragged piece
                },
                viewOnly: true
            });
        }
    }, delay);
}

function handleWrongMove(cg, chess, move) {
    state.errorCount++;
    playSound("Error");
    // A puzzle is "failed" for scoring purposes if strict mode is on, or the handicap is exceeded.
    const isFailed = config.strictScoring || state.errorCount > config.handicap;
    if (isFailed) {
        state.errorTrack = true;
        window.parent.postMessage(state, '*');
        state.solvedColour = "#b31010";
    }
    updateBoard(cg, chess, move, true, true);
    // The puzzle interaction stops and the solution is shown only when the handicap is exceeded.
    if (state.errorCount > config.handicap) {
        cg.set({ viewOnly: true }); // disable user movement until after puzzle advances
        playUserCorrectMove(cg, chess, 300); // Show the correct user move
        playAiMove(cg, chess, 600); // Then play the AI's response
    }
}

function checkUserMove(cg, chess, moveSan, delay) {
    const tempChess = new Chess(chess.fen());
    const moveAttempt = tempChess.move(moveSan);

    if (!moveAttempt) return;

    let foundVariation = false;
    if (state.expectedMove?.notation.notation === moveAttempt.san && state.pgnState) {
        foundVariation = true;
    } else if (state.expectedMove?.variations && config.acceptVariations && state.pgnState) {
        for (let i = 0; i < state.expectedMove.variations.length; i++) {
            if (moveAttempt.san === state.expectedMove.variations[i][0].notation.notation) {
                state.count = 0;
                state.expectedLine = state.expectedMove.variations[i];
                state.expectedMove = state.expectedLine[state.count];
                foundVariation = true;
                break;
            }
        }
    }
    if (foundVariation) {
        const isBlunder = state.expectedMove.nag?.some(nags => blunderNags.includes(nags));
        if (isBlunder) {
            state.errorTrack = true;
            window.parent.postMessage(state, '*');
            state.solvedColour = "#b31010";
        }
        makeMove(cg, chess, moveAttempt);
        state.count++;
        state.expectedMove = state.expectedLine[state.count];
        if (state.expectedMove && delay) {
            playAiMove(cg, chess, delay);
        } else if (delay) {
            window.parent.postMessage(state, '*');
            document.documentElement.style.setProperty('--border-color', state.solvedColour);
            cg.set({
                selected: undefined, // Clear any selected square
                draggable: {
                    current: undefined // Explicitly clear any currently dragged piece
                },
                viewOnly: true
            });
        }
        drawArrows(cg, chess);
    } else if (delay) {
        handleWrongMove(cg, chess, moveAttempt);
        drawArrows(cg, chess, true);
    } else if (!delay) { // no delay passed from viewer mode
        state.pgnState = false;
        document.querySelector("#navForward").disabled = true;
        makeMove(cg, chess, moveAttempt);
    }
    return foundVariation
}

function changeAudio(gameState) {
    const soundMap = {
        "#": "checkmate", "+": "move-check", "x": "Capture",
        "k": "castle", "q": "castle", "p": "promote"
    };
    let sound = "Move";
    for (const flag in soundMap) {
        if (gameState.san.includes(flag) || (gameState.flags && gameState.flags.includes(flag))) {
            sound = soundMap[flag];
            break;
        }
    }
    playSound(sound);
}

function puzzlePlay(cg, chess, delay, orig, dest) {
    const tempChess = new Chess(chess.fen());
    let tempMove = false;
    if (dest) {
        tempMove = tempChess.move({ from: orig, to: dest, promotion: 'q' });
    } else {
        tempMove = tempChess.move(orig.san);
    }
    if (!tempMove) return;
    if (tempMove.flags.includes("p") && delay && dest) {
        promotePopup(cg, chess, orig, dest, delay);
    } else {
        checkUserMove(cg, chess, tempMove.san, delay);
    }
}

function promotePopup(cg, chess, orig, dest, delay) {
    const cancelPopup = function(){
        state.promoteAnimate = true;
        cg.set({
            fen: chess.fen(),
            turnColor: toColor(chess),
            movable: {
                color: toColor(chess),
                dests: toDests(chess)
            }
        });
        toggleDisplay('showHide');
        document.querySelector("cg-board").style.cursor = 'pointer';
        drawArrows(cg, chess)
    }
    const promoteButtons = document.querySelectorAll("#center > button");
    const overlay = document.querySelector("#overlay");
    for (var i=0; i<promoteButtons.length; i++){
        promoteButtons[i].onclick = function(){
            state.promoteAnimate = false
            event.stopPropagation();
            state.promoteChoice=this.value;
            const tempChess = new Chess(chess.fen());
            const move = tempChess.move({ from: orig, to: dest, promotion: state.promoteChoice} );
            if (config.boardMode === 'Puzzle') {
                puzzlePlay(cg, chess, 300, move, null);
            } else if (config.boardMode === 'Viewer') {
                handleViewerMove(cg, chess, move, null);
            }
            cancelPopup();
            document.querySelector(".cg-wrap").style.filter = 'none';
            document.querySelector("cg-board").style.cursor = 'pointer';
        }
        overlay.onclick = function() {
            cancelPopup();
            playSound("Move")
        }
    }
    toggleDisplay('showHide');
}
function findParent(obj, targetChild) {
    for (const key in obj) {
        // Ensure we're only looking at own properties to avoid prototype chain issues
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            if (typeof value === 'object' && value !== null) {
                // If the current value is the targetChild, then 'obj' is its immediate parent
                if (value === targetChild) {
                    return {
                        key: key,
                        parent: obj // This is the direct parent
                    };
                }

                // If not the child, recurse into the current value (object or array)
                const foundParent = findParent(value, targetChild);

                // If the child was found in a deeper level, propagate that result directly
                if (foundParent) {
                    return foundParent; // Return the actual parent found deeper, not wrapped again
                }
            }
        }
    }
    return null; // Parent not found in this branch
};

function buildPgnHtml(moves, path = [], altLine) {
    let html = '';
    if (!moves || moves.length === 0) return '';
    let lineClass
    if (moves[0].turn === 'b' && path.length <= 1) {
        const moveNumber = moves[0].moveNumber;
        html += `<span class="move-number">${moveNumber}</span><span class="nullMove">...</span> `;
    }

    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];

        if (move.turn === 'w') {
            const moveNumber = move.moveNumber;
            html += `<span class="move-number">${moveNumber}.</span> `;
        }
        let nagCheck = '';
        let nagTitle = null;
        if (move.nag) {
            const foundNagKey = move.nag?.find(key => key in nags);
            nagCheck = nags[foundNagKey]?.[1] ?? '';
            nagTitle = nags[foundNagKey]?.[0] ?? '';
        }
        nagTitle = nagTitle ? `<span class="nagTooltip">${nagTitle}</span>` : '';
        html += `<span class="move" data-path="${move.pgnPath.join(',')}">${nagTitle}${move.notation.notation} ${nagCheck}</span>`;

        if (move.commentAfter) {
            if (move.turn === 'w' && !altLine) html += `<span class="nullMove">|...|</span>`;
            html += `<span class="comment"> ${move.commentAfter} </span>`;
            if (move.turn === 'w' && i < moves.length - 1 && !altLine && !move.variations?.length) html += `<span class="move-number">${move.moveNumber}.</span><span class="nullMove">|...|</span>`;
        }

        if (move.variations && move.variations.length > 0) {
            if (!altLine) {
                if (move.turn === 'w' && !altLine && !move.commentAfter) html += `<span class="nullMove">|...|</span>`;
                html += `<div class="altLine">`;
            }
            move.variations.forEach(variation => {
                html += `(${buildPgnHtml(variation, variation.pgnPath, true)})`;
            });
            if (!altLine) {
                html += `</div>`;
                if (move.turn === 'w' && i < moves.length - 1) html += `<span class="move-number">${move.moveNumber}.</span><span class="nullMove">|...|</span>`;
            }
        }
    }
    return html;
}

function getFullMoveSequenceFromPath(path) {
    state.count = 0; // Int so we can track on which move we are.
    state.chessGroundShapes = [];
    state.expectedLine = parsedPGN.moves; // Set initially to the mainline of pgn but can change path with variations
    state.expectedMove = parsedPGN.moves[state.count]; // Set the expected move according to PGN
    state.pgnState = true; // incase outside PGN
    document.querySelector("#navForward").disabled = false;
    chess.reset();
    chess.load(state.ankiFen);
    let branchIndex = null;
    for ( let i=0; i < path.length; i++) {
        // [ "3", "v", "1", "2" ] means: at the 3rd mainline move branch into branch[1] and then 2 mainline moves down branch one
        const pathCount = parseInt(path[i], 10);
        if (path[i+1] === 'v') {
            branchIndex = parseInt(path[i+2], 10);
            i = i + 2 // skip branch move and index after branch
        }
        for (let j = 0; j <= pathCount; j++) {
            if (branchIndex !== null && j === pathCount) {
                state.count = 0;
                state.expectedLine = state.expectedMove.variations[branchIndex];
                state.expectedMove = state.expectedLine[0];
                branchIndex = null;
            } else {
                chess.move(state.expectedMove.notation.notation);
                state.count++;
                state.expectedMove = state.expectedLine[state.count];
            }
        }
    }

    return chess.moves()
}

function onPgnMoveClick(event) {
    if (!event.target.classList.contains('move')) return;
    document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
    event.target.classList.add('current');
    const pathStr = event.target.dataset.path;
    const path = pathStr.split(',');
    getFullMoveSequenceFromPath(path);
    cg.set({
        fen: chess.fen(),
        check: chess.inCheck(),
        turnColor: toColor(chess),
        movable: {
            color: toColor(chess),
            dests: toDests(chess)
        },
    });
    document.querySelectorAll('#navBackward, #resetBoard')
        .forEach(el => el.disabled = false);
    if (!state.expectedMove || typeof state.expectedMove === 'string') {
        document.querySelector("#navForward").disabled = true;
    }
    if (state.analysisToggledOn) {
        startAnalysis(4000);
    }
    drawArrows(cg, chess)
}

function initPgnViewer() {
    state.pgnPath = [];
    const pgnContainer = document.getElementById('pgnComment');
    pgnContainer.innerHTML = buildPgnHtml(parsedPGN.moves);
    pgnContainer.addEventListener('click', onPgnMoveClick);
}

function reload() {
    state.count = 0;
    state.expectedLine = parsedPGN.moves;
    state.expectedMove = state.expectedLine[0];

    cg = Chessground(board, {
        fen: state.ankiFen,
        orientation: state.playerColour,
        turnColor: toColor(chess),
        events: {
            select: (key) => {
                cg.set({drawable: {shapes: state.chessGroundShapes}});
                const arrowCheck = state.chessGroundShapes.filter(shape => shape.brush !== 'mainLine' && shape.brush !== 'altLine' && shape.brush !== 'blunderLine' && shape.brush !== 'stockfish' && shape.brush !== 'stockfinished' && shape.customSvg?.brush !== 'moveType');
                if (arrowCheck.length > 0) {
                    state.chessGroundShapes = state.chessGroundShapes.filter(element => !arrowCheck.includes(element));
                }
               if (!cg.state.selectState) {
                    const legalMovesFromSelected = chess.moves({ square: state.selectState, verbose: true });
                    // Check if the target square (key) is a valid destination for any of these moves
                    const isValidMove = legalMovesFromSelected.some(move => move.to === key);
                    state.selectState = false;
                    if (isValidMove) {
                        state.debounceTimeout = true;
                    }
                }

                const priority = ['mainLine', 'altLine', 'blunderLine', 'stockfinished', 'stockfish'];
                const arrowMove = state.chessGroundShapes
                    .filter(shape => shape.dest === key && priority.includes(shape.brush))
                    .sort((a, b) => priority.indexOf(a.brush) - priority.indexOf(b.brush));
                if (arrowMove.length === 1 && config.boardMode === 'Viewer') {
                    // If the user clicks on a Stockfish-generated move, they are deviating from the PGN.
                    if (arrowMove[0].brush === 'stockfish' || arrowMove[0].brush === 'stockfinished') {
                        state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'mainLine' && shape.brush !== 'altLine' && shape.brush !== 'blunderLine');
                        state.pgnState = false;
                        document.querySelector("#navForward").disabled = true;
                    }
                    handleViewerMove(cg, chess, arrowMove[0], null);
                } else { // No arrow was clicked, check if there's only one legal play to this square.
                    const allMoves = chess.moves({ verbose: true });
                    const movesToSquare = allMoves.filter(move => move.to === key);
                    if (movesToSquare.length === 1) {
                        // If only one piece can move to this square, play that move.
                        cg.move(movesToSquare[0].from, movesToSquare[0].to);
                        if (config.boardMode === 'Puzzle') {
                            puzzlePlay(cg, chess, 300, movesToSquare[0], null);
                        } else if (config.boardMode === 'Viewer') {
                            handleViewerMove(cg, chess, movesToSquare[0], null);
                        }
                    } else {
                        state.debounceTimeout = false;
                    }
                }
            },
        },
        premovable: {
            enabled: true,
        },
        movable: {
            color: config.boardMode === 'Puzzle' ? state.playerColour : toColor(chess),
            free: false,
            showDests: config.showDests,
            dests: toDests(chess),
            events: {
                after: (orig, dest) => {
                    if (state.debounceTimeout) {
                        state.debounceTimeout = false
                        return
                    }
                    if (config.boardMode === 'Puzzle') {
                        puzzlePlay(cg, chess, 300, orig, dest);
                    } else {
                        // Viewer mode
                        handleViewerMove(cg, chess, orig, dest);
                    }
                }
            }
        },
        check: chess.inCheck(),
        highlight: { check: true },
        drawable: {
            enabled: true,
            brushes: {
                stockfish: { key: 'stockfish', color: '#e5e5e5', opacity: 1, lineWidth: 7 },
                stockfinished: { key: 'stockfinished', color: 'white', opacity: 1, lineWidth: 7 },
                mainLine: { key: 'mainLine', color: '#66AA66', opacity: 1, lineWidth: 9 },
                altLine: { key: 'altLine', color: '#66AAAA', opacity: 1, lineWidth: 9 },
                blunderLine: { key: 'blunderLine', color: '#b31010', opacity: 1, lineWidth: 9 },
                green: { opacity: 0.7, lineWidth: 9 },
                red: { opacity: 0.7, lineWidth: 9 },
                blue: { opacity: 0.7, lineWidth: 9 },
                yellow: { opacity: 0.7, lineWidth: 9 },
            }
        },
    });

    if (config.boardMode === 'Puzzle') {
        if (!chess.isGameOver() && config.flipBoard) {
            playAiMove(cg, chess, 300);
        }
        drawArrows(cg, chess);
    } else {
        // Viewer mode
        cg.set({
            premovable: {
                enabled: false
            }
        });
        initPgnViewer();
        drawArrows(cg, chess);
    }
    function navBackward() {
        if (config.boardMode === 'Puzzle') return;
        const lastMove = chess.undo();
        const FENpos = chess.fen(); // used to track when udoing captured with promoted piece
        if (lastMove) {
            if (lastMove.promotion) { // fix promotion animation
                const tempChess = new Chess(chess.fen()); // new chess instance to no break old one
                tempChess.load(FENpos);
                tempChess.remove(lastMove.to);
                tempChess.remove(lastMove.from);
                tempChess.put({ type: 'p', color: chess.turn() }, lastMove.to);
                cg.set({ animation: { enabled: false} })
                cg.set({
                    fen: tempChess.fen(),
                });
                tempChess.remove(lastMove.to);
                tempChess.put({ type: 'p', color: chess.turn() }, lastMove.from);
                cg.set({ animation: { enabled: true} })
                cg.set({
                    fen: FENpos
                });
            } else {
                cg.set({
                    fen: chess.fen()
                });
            }
            cg.set({
                check: chess.inCheck(),
                turnColor: toColor(chess),
                movable: {
                    color: toColor(chess),
                    dests: toDests(chess)
                },
                lastMove: [lastMove.from, lastMove.to]
            });
            if (state.expectedLine[state.count - 1]?.notation?.notation === lastMove.san) {
                state.count--
                state.expectedMove = state.expectedLine[state.count];
                if (state.count === 0) {
                    let parentOfChild = findParent(parsedPGN.moves, state.expectedLine);
                    if (parentOfChild) {
                        for (var i = 0; i < 2; i++) {
                            parentOfChild = findParent(parsedPGN.moves, parentOfChild.parent);

                        };
                        state.expectedLine = parentOfChild.parent;
                        state.count = parentOfChild.key;
                        state.expectedMove = state.expectedLine[state.count];
                    }
                }
            }
            if (state.count === 0 && state.ankiFen !== chess.fen()) {
                if (state.analysisToggledOn) {
                    startAnalysis(4000);
                }
                return;
            } else if (state.count === 0) {
                state.pgnState = true; // needed for returning to first move from variation
                document.querySelector("#navForward").disabled = false;
            } else if (state.expectedLine[state.count - 1]?.notation.notation === getLastMove(chess).san) {
                state.pgnState = true; // inside PGN
                document.querySelector("#navForward").disabled = false;
            }
        }
        state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.customSvg?.brush !== 'moveType');
        drawArrows(cg, chess);
        if (config.boardMode === "Viewer") {
            let expectedMove = state.expectedMove;
            let expectedLine = state.expectedLine;
            if (expectedLine[state.count - 1]?.notation?.notation) {
                expectedMove = expectedLine[state.count - 1];
                if (state.count === 0) {
                    let parentOfChild = findParent(parsedPGN.moves, expectedLine);
                    if (parentOfChild) {
                        for (var i = 0; i < 2; i++) {
                            parentOfChild = findParent(parsedPGN.moves, parentOfChild.parent);

                        };
                        expectedLine = parentOfChild.parent;
                        const count = parentOfChild.key;
                        expectedMove = expectedLine[count];
                    }
                }
                highlightCurrentMove(expectedMove.pgnPath);
            } else { // no moves played clear highlight
                document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
                document.querySelectorAll('#navBackward, #resetBoard').forEach(el => el.disabled = true);
            }
        }
        if (state.analysisToggledOn) {
            startAnalysis(4000);
        }
    }
    function navForward() {
        if (config.boardMode === 'Puzzle' || !state.pgnState || !state.expectedMove?.notation) return;
        const tempChess = new Chess(chess.fen());
        const move = tempChess.move(state.expectedMove?.notation?.notation);
        if (move) {
            puzzlePlay(cg, chess, null, move.from, move.to);
        }
        document.querySelector("#navBackward").disabled = false;
        document.querySelector("#resetBoard").disabled = false;
        if (!state.expectedMove || typeof state.expectedMove === 'string') {
            document.querySelector("#navForward").disabled = true;
        }
    }
    function rotateBoard() {
        state.boardRotation = ((state.boardRotation === 'white') ? 'black' : 'white')
        const root = document.documentElement;
        // Get the current values of the CSS variables
        const coordWhite = getComputedStyle(root).getPropertyValue('--coord-white').trim();
        const coordBlack = getComputedStyle(root).getPropertyValue('--coord-black').trim();
        // Swap the values. so coord colors are correct
        root.style.setProperty('--coord-white', coordBlack);
        root.style.setProperty('--coord-black', coordWhite);
        cg.set({
            orientation: state.boardRotation
        });
        const flipButton = document.querySelector(".flipBoardIcon");
        if (flipButton.style.transform.includes("90deg")) {
            flipButton.style.transform = "rotate(270deg)";
        } else {
            flipButton.style.transform = "rotate(90deg)";
        }
    }
    function resetBoard() {
        state.count = 0; // Int so we can track on which move we are.
        state.chessGroundShapes = [];
        state.expectedLine = parsedPGN.moves; // Set initially to the mainline of pgn but can change path with variations
        state.expectedMove = parsedPGN.moves[state.count]; // Set the expected move according to PGN
        state.pgnState = true; // incase outside PGN
        document.querySelector("#navForward").disabled = false;
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
        document.querySelector("#navBackward").disabled = true;
        document.querySelector("#resetBoard").disabled = true;
        if (state.analysisToggledOn) {
            startAnalysis(4000);
        }
        drawArrows(cg, chess);
    }
    function copyFen() { //copy FEN to clipboard
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
    document.querySelector("#resetBoard").addEventListener('click', resetBoard);
    document.querySelector("#navBackward").addEventListener('click', navBackward);
    document.querySelector("#navForward").addEventListener('click', navForward);
    document.querySelector("#rotateBoard").addEventListener('click', rotateBoard);
    document.querySelector("#copyFen").addEventListener('click', copyFen);
    document.querySelector("#stockfishToggle").addEventListener('click', toggleStockfishAnalysis);
    board.addEventListener('wheel', (event) => { // scroll Navigation
        event.preventDefault();
        if (event.deltaY < 0) {
            // Perform actions for scrolling up
            navBackward()
        } else if (event.deltaY > 0) {
            // Perform actions for scrolling down
            navForward()
        }
    });
    document.addEventListener('keydown', (event) => { // scroll Navigation
        event.preventDefault();
        if (event.key === 'ArrowLeft') {
            navBackward()
        } else if (event.key === 'ArrowRight') {
            navForward()
        } else if (event.key === 'ArrowDown') {
            resetBoard()
        }
    });
}
document.querySelector('#promoteQ').src = "_"+state.boardRotation[0]+"Q.svg";
document.querySelector('#promoteB').src = "_"+state.boardRotation[0]+"B.svg";
document.querySelector('#promoteN').src = "_"+state.boardRotation[0]+"N.svg";
document.querySelector('#promoteR').src = "_"+state.boardRotation[0]+"R.svg";

if (state.errorTrack === 'true' && config.boardMode === 'Viewer') {
    document.documentElement.style.setProperty('--border-color', "#b31010");
} else if (state.errorTrack === 'false' && config.boardMode === 'Viewer') {
    document.documentElement.style.setProperty('--border-color', "limegreen");
}

function positionPromoteOverlay() {
    const promoteOverlay = document.getElementById('center');
    const rect = document.querySelector('.cg-wrap').getBoundingClientRect();
    // Set the position of the promote element
    promoteOverlay.style.top = (rect.top + 8) + 'px';
    promoteOverlay.style.left = (rect.left + 8) + 'px';
    window.addEventListener('resize', resizeBoard);
}

async function resizeBoard() {
    positionPromoteOverlay();
}


async function loadElements() {
    await reload();
    await resizeBoard();
    setTimeout(() => {
        positionPromoteOverlay();
    }, 200);
}
loadElements();
const cgwrap = document.getElementsByClassName("cg-wrap")[0];
document.querySelector("#navBackward").disabled = true;
document.querySelector("#resetBoard").disabled = true;
document.querySelectorAll('.move').forEach(item => {
    // Position nag tooltips and keep withing comment box
    item.addEventListener('mouseover', function(e) {
        const commentBox = document.getElementById('commentBox');
        const tooltip = this.querySelector('.nagTooltip');

        if (!tooltip || !tooltip.textContent.trim()) {
            return; // Exit if no tooltip or it's empty
        }

        const itemRect = this.getBoundingClientRect();
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
        tooltip.style.visibility = 'visible'
    });

    item.addEventListener('mouseout', function() {
        const tooltip = this.querySelector('.nagTooltip');
        if (tooltip) {
            tooltip.style.visibility = 'hidden';
        }
    });
});
