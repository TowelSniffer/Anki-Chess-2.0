import { Chess, SQUARES } from 'chess.js';
import { Chessground } from 'chessground';
import { parse } from '@mliebelt/pgn-parser';
import 'chessground/assets/chessground.base.css';
import './custom.css';

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
    pgn: getUrlParam("PGN", `[Event "The Opera Game"] [Site "Paris Opera House"] [Date "1858.11.02"] [Round "?"] [White "Paul Morphy"] [Black "Duke of Brunswick & Count Isouart"] [Result "1-0"] [ECO "C41"] 1. e4 e5 2. Nf3 d6 {This is the Philidor Defence. It's solid but can be passive.} 3. d4 Bg4?! {This pin is a bit premature. A more common and solid move would be 3...exd4.} 4. dxe5 Bxf3 (4... dxe5 5. Qxd8+ Kxd8 6. Nxe5 {White wins a pawn and has a better position.}) 5. Qxf3! {A great move. Morphy is willing to accept doubled pawns to accelerate his development.} 5... dxe5 6. Bc4 {Putting immediate pressure on the weak f7 square.} 6... Nf6 7. Qb3! {A powerful double attack on f7 and b7.} 7... Qe7 {This is the only move to defend both threats, but it places the queen on an awkward square and blocks the f8-bishop.} 8. Nc3 c6 9. Bg5 {Now Black's knight on f6 is pinned and cannot move without the queen being captured.} 9... b5?! {A desperate attempt to kick the bishop and relieve some pressure, but it weakens Black's queenside.} 10. Nxb5! {A brilliant sacrifice! Morphy sees that his attack is worth more than the knight.} 10... cxb5 11. Bxb5+ Nbd7 12. O-O-O {All of White's pieces are now in the attack, while Black's are tangled up and undeveloped.} 12... Rd8 13. Rxd7! {Another fantastic sacrifice to remove the defending knight.} 13... Rxd7 14. Rd1 {Renewing the pin and intensifying the pressure. Black is completely paralyzed.} 14... Qe6 {Trying to trade queens to relieve the pressure, but it's too late.} 15. Bxd7+ Nxd7 (15... Qxd7 16. Qb8+ Ke7 17. Qxe5+ Kd8 18. Bxf6+ {and White wins easily.}) 16. Qb8+! {The stunning final sacrifice! Morphy forces mate by sacrificing his most powerful piece.} 16... Nxb8 17. Rd8# {A beautiful checkmate, delivered with just a rook and bishop.} 1-0`),
    fontSize: getUrlParam("fontSize", 16),
    ankiText: getUrlParam("userText", null),
    muteAudio: getUrlParam("muteAudio", 'false') === 'true',
    handicap: parseInt(getUrlParam("handicap", 1), 10),
    strictScoring: getUrlParam("strictScoring", 'false') === 'true',
    acceptVariations: getUrlParam("acceptVariations", 'true') === 'true',
    disableArrows: getUrlParam("disableArrows", 'false') === 'true',
    flipBoard: getUrlParam("flip", 'true') === 'true',
    boardMode: getUrlParam("boardMode", 'Viewer'),
    background: getUrlParam("background", "#2C2C2C"),
};

// --- Global State ---
let state = {
    ankiFen: "",
    boardRotation: "black",
    solvedColour: "limegreen",
    errorTrack: getUrlParam("errorTrack", null),
    count: 0,
    selectState: false,
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
    analysisToggledOn: false,
    deepAnalysis: false,
};
if (!state.errorTrack) {
    state.errorTrack = false;
}

/**
 * This is a last-resort safety net to catch the fatal "abort" error from the
 * pure JS version of Stockfish. This can happen under high CPU load and
 * crashes the script instance, often bypassing its internal .onerror handler.
 */
window.addEventListener('error', (event) => {
    const message = event.message || '';
    const filename = event.filename || '';

    // Condition 1: A detailed error message that we can identify.
    const isDetailedStockfishCrash = message.includes('abort') && filename.includes('_stockfish.js');

    // Condition 2: A generic "Script error." This happens when an error is thrown
    // by a script from a different origin (a browser security feature). We have to
    // assume this might be Stockfish crashing, as it's the most likely source of
    // fatal, script-terminating errors in this context.
    const isGenericCrossOriginError = message === 'Script error.';

    if (isDetailedStockfishCrash || isGenericCrossOriginError) {
        // Prevent the default browser error console message since we are handling it
        event.preventDefault();
        console.warn("Caught a fatal Stockfish crash via global error handler.");
        if (isGenericCrossOriginError) {
            console.log("Note: The error was reported as a generic 'Script error.' due to browser security policies. Assuming it was Stockfish and attempting a restart.");
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
chess.load(state.ankiFen);

// --- UI Initialization ---
document.documentElement.style.setProperty('--background-color', config.background);
if (config.ankiText) {
    const commentBox = document.getElementById('commentBox');
    commentBox.style.fontSize = `${config.fontSize}px`;
    commentBox.classList.remove('hidden');
    document.getElementById('textField').innerHTML = config.ankiText;
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

let boardOrientation = state.boardRotation;
document.documentElement.style.setProperty('--border-color', boardOrientation);

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


function writePgnComments(reWrite) {
    const pgnCommentEl = document.getElementById('pgnComment');
    if (!state.pgnState) {
        pgnCommentEl.innerHTML = "";
        return
    }
    if (reWrite) {
        return
    }
    // --- PGN Comment Display ---
    const currentMovePgn = state.expectedLine[state.count];
    const lastMovePgn = state.expectedLine[state.count - 1];
    const comments = [];
    // Comment for the move that was just played.
    if (lastMovePgn?.commentAfter) {
        const moveColour = lastMovePgn.turn === 'b' ? 'Black' : 'White';
        comments.push({ player: moveColour, text: lastMovePgn.commentAfter });
    }
    // Comment for the upcoming move (less common, but handles pre-move comments).
    if (currentMovePgn?.commentAfter) {
        const moveColour = currentMovePgn.turn === 'b' ? 'Black' : 'White';
        comments.push({ player: moveColour, text: currentMovePgn.commentAfter });
    }

    // Use a Map to filter out duplicate comments, which can happen with some PGN structures.
    const uniqueComments = [...new Map(comments.map(item => [item.text, item])).values()];

    let commentHTML = "";
    if (uniqueComments.length > 0) {
        const listItems = uniqueComments.map(c => `<li><strong>${c.player}:</strong> ${c.text}</li>`);
        commentHTML = `<ul>${listItems.join('')}</ul>`;
    }
    // Combine the turn information and any comments into the final display.
    pgnCommentEl.innerHTML = commentHTML;
}

function drawArrows(cg, chess, redraw) {
    state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'mainLine' && shape.brush !== 'altLine');
    if (!state.pgnState || redraw) {
        cg.set({ drawable: { shapes: state.chessGroundShapes } });
        return
    }
    if ((config.boardMode === 'Puzzle') && config.disableArrows) {
        return;
    }
    if (!state.analysisToggledOn) {
        state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'stockfinished' && shape.brush !== 'stockfish');
    }
    let expectedMove = state.expectedMove;
    let expectedLine = state.expectedLine;
    let puzzleMove;
    let count = state.count;
    let parentOfChild;

    if (config.boardMode == 'Puzzle') {
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
            if (alternateMove && (alternateMove.san !== puzzleMove)) {
                state.chessGroundShapes.push({
                    orig: alternateMove.from,
                    dest: alternateMove.to,
                    brush: 'altLine',
                    san: alternateMove.san
                });
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
    }

    if (config.boardMode == 'Puzzle' && puzzleMove) {
        chess.move(puzzleMove);
    }
    cg.set({ drawable: { shapes: state.chessGroundShapes } });
}

function updateBoard(cg, chess, move, quite, commentRewrite) { // animate user/ai moves on chessground
    if (!quite) { changeAudio(move) }
    if (move.san.includes("=") && state.promoteAnimate) {
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
            cg.set({ animation: { enabled: true} })
        }, 200)
    } else {
        cg.set({ fen: chess.fen() });
    }
    cg.set({
        check: chess.inCheck(),
        turnColor: toColor(chess),
        movable: {
            dests: toDests(chess),
        },
        lastMove: [move.from, move.to]
    });
    if (config.boardMode === 'Viewer') {
        cg.set({ movable: { color: toColor(chess) } })
    }
    writePgnComments(commentRewrite);
    if (state.analysisToggledOn) {
        startAnalysis(100);
    }
}
let stockfish;

function handleStockfishCrash(source) {
    console.error(`Stockfish engine crashed. Source: ${source}.`);
    console.log("Attempting to restart the engine...");

    // Reset any state that might be stuck because of the crash
    state.isStockfishBusy = false;
    if (state.deepAnalysis) {
        state.deepAnalysis = false;
        const deepAnalysisBtn = document.querySelector("#stockfishCalc");
        setNavButtonsDisabled(false);
        deepAnalysisBtn.classList.remove('active-toggle');
    }

    // Re-initialize a fresh instance after a short delay to let the browser recover.
    setTimeout(initializeStockfish, 100);
}

function initializeStockfish() {
    console.log("Initializing Stockfish engine...");
    stockfish = STOCKFISH(); // This creates the JS instance

    // Set the message handler for the new instance
    stockfish.onmessage = (event) => {
        const message = event.data ? event.data : event;
        if (typeof message !== 'string') return;

        if (message.startsWith('info')) {
            const parts = message.split(' ');
            const pvSanIndex = parts.indexOf('pvSan');
            const pvDepthIndex = parts.indexOf('depth');
            if (pvSanIndex > -1 && parts.length > pvSanIndex + 1) {
                const firstMove = parts[pvSanIndex + 1];
                const pvDepth = parts[pvDepthIndex + 1];
                console.log(pvDepth);
                const tempChess = new Chess(chess.fen());
                const moveObject = tempChess.move(firstMove);

                if (moveObject) {
                    state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'stockfish' && shape.brush !== 'stockfinished');
                    state.chessGroundShapes.push({
                        orig: moveObject.from,
                        dest: moveObject.to,
                        brush: 'stockfish',
                        san: moveObject.san,
                    });
                    cg.set({ drawable: { shapes: state.chessGroundShapes } });
                }
            }
        } else if (message.startsWith('bestmove')) {
            cg.set({ viewOnly: false });
            state.isStockfishBusy = false;
            if (state.deepAnalysis) {
                state.deepAnalysis = false;
                const deepAnalysisBtn = document.querySelector("#stockfishCalc");
                setNavButtonsDisabled(false);
                deepAnalysisBtn.classList.remove('active-toggle');
            }
            const bestMoveUci = message.split(' ')[1];
            const tempChess = new Chess(chess.fen());
            const moveObject = tempChess.move(bestMoveUci);

            if (moveObject) {
                state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'stockfish' && shape.brush !== 'stockfinished');
                state.chessGroundShapes.push({
                    orig: moveObject.from,
                    dest: moveObject.to,
                    brush: 'stockfinished',
                    san: moveObject.san,
                });
                cg.set({ drawable: { shapes: state.chessGroundShapes } });
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

/**
 * Starts a new Stockfish analysis.
 * @param {number} movetime - The time in milliseconds for the engine to think.
 */
function startAnalysis(movetime) {
    if (chess.moves().length === 0 || state.isStockfishBusy) return;
    state.isStockfishBusy = true;
    stockfish.postMessage(`position fen ${chess.fen()}`);
    stockfish.postMessage(`go movetime ${movetime}`);
}

function toggleStockfishAnalysis() {
    state.analysisToggledOn = !state.analysisToggledOn; // Toggle the state

    const toggleButton = document.querySelector("#stockfishToggle");
    toggleButton.classList.toggle('active-toggle', state.analysisToggledOn); // Add/remove class based on state

    if (state.analysisToggledOn) {
        // Turn analysis ON
        startAnalysis(100);
    } else {
        // Turn analysis OFF
        if (state.isStockfishBusy) {
            stockfish.postMessage('stop'); // Tell the engine to stop thinking
            state.isStockfishBusy = false;
            if (state.deepAnalysis) {
                state.deepAnalysis = false;
                const deepAnalysisBtn = document.querySelector("#stockfishCalc");
                setNavButtonsDisabled(false);
                deepAnalysisBtn.classList.remove('active-toggle');
            }
        }
        // Filter out the analysis arrows
        state.chessGroundShapes = state.chessGroundShapes.filter(
            shape => shape.brush !== 'stockfish' && shape.brush !== 'stockfinished'
        );
        // Update the board to remove the arrows
        cg.set({ drawable: { shapes: state.chessGroundShapes } });
    }
}

/**
 * Enables or disables the main navigation and action buttons.
 * This is used to prevent user actions during deep analysis.
 * @param {boolean} disabled - True to disable the buttons, false to enable them.
 */
function setNavButtonsDisabled(disabled) {
    const buttonIds = ['#resetBoard', '#navBackward', '#navForward', '#rotateBoard', '#copyFen', '#stockfishToggle'];
    buttonIds.forEach(id => {
        const button = document.querySelector(id);
        if (button) {
            button.disabled = disabled;
        }
    });
}

function deepAnalysis() {
    const deepAnalysisBtn = document.querySelector("#stockfishCalc");

    // If deep analysis is already running, clicking the button again will cancel it.
    if (state.deepAnalysis) {
        stockfish.postMessage('stop');
        state.isStockfishBusy = false;
        state.deepAnalysis = false;

        deepAnalysisBtn.classList.remove('active-toggle');
        setNavButtonsDisabled(false);
        cg.set({ viewOnly: false });

        // If regular analysis is toggled on, restart it with its normal, shallow depth.
        if (state.analysisToggledOn) {
            startAnalysis(100);
        }
    } else {
        // Otherwise, start a new deep analysis.
        deepAnalysisBtn.classList.add('active-toggle');
        setNavButtonsDisabled(true);
        // The button is intentionally NOT disabled, allowing it to be clicked again to cancel.
        state.deepAnalysis = true;
        cg.set({ viewOnly: true });
        startAnalysis(4000);
    }
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
    let promoCheck = false
    if (dest) {
        move = tempChess.move({ from: orig, to: dest, promotion: 'q' });
        promoCheck = true;
    } else {
        move = tempChess.move(orig);
    }
    if (move.san.includes("=") && promoCheck) {
        promotePopup(cg, chess, orig, dest, null)
    } else {
        checkUserMove(cg, chess, move.san, null);
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
            window.parent.postMessage(state.errorTrack, '*');
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

        // Make the move without the AI's variation-selection logic
        makeMove(cg, chess, state.expectedMove.notation.notation);
        state.count++;
        state.expectedMove = state.expectedLine[state.count];

        if (!state.expectedMove || typeof state.expectedMove === 'string') {
            window.parent.postMessage(state.errorTrack, '*');
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
        window.parent.postMessage(true, '*');
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
    if ((state.expectedMove?.notation.notation === moveAttempt.san) && state.pgnState) {
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
        makeMove(cg, chess, moveAttempt);
        state.count++;
        state.expectedMove = state.expectedLine[state.count];
        if (state.expectedMove && delay) {
            playAiMove(cg, chess, delay);
        } else if (delay) {
            window.parent.postMessage(state.errorTrack, '*');
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
        tempMove = tempChess.move(orig);
    }
    if (!tempMove) return;

    if (tempMove.san.includes("=") && delay && dest) {
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
        state.selectState = false;
        toggleDisplay('showHide');
        document.querySelector("cg-board").style.cursor = 'pointer';
        if (config.boardMode == 'Viewer') {
            drawArrows(cg, chess);
        }
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
                puzzlePlay(cg, chess, 300, move.san, null);
            } else if (config.boardMode === 'Viewer') {
                handleViewerMove(cg, chess, move.san, null);
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
    document.querySelector("cg-board").style.cursor = 'default';
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

function reload() {
    state.count = 0;
    state.expectedLine = parsedPGN.moves;
    state.expectedMove = state.expectedLine[0];

    cg = Chessground(board, {
        fen: state.ankiFen,
        orientation: boardOrientation,
        turnColor: toColor(chess),
        events: {
            select: (key) => {
                if (config.boardMode === 'Puzzle') {
                    drawArrows(cg, chess, true);
                } else {
                    drawArrows(cg, chess);
                }

                // Debounce to prevent rapid firing on touchscreens
                if (state.debounceTimeout !== null) {
                    return
                };
                state.debounceTimeout = setTimeout(() => {
                    state.debounceTimeout = null; // Reset when it fires
                }, 100);

                // This logic correctly handles the state for two-click moves to prevent double event execution.
                if (cg.state.selected === state.selectState && state.selectState === key) {
                    // clicking on same piece again to unselect
                    state.selectState = false;
                    return
                } else if (state.selectState !== key && key === cg.state.selected) {
                    // A piece is selected (either the first, or a new one).
                    state.selectState = key;
                    // In Viewer mode, if the selected piece has only one legal move, play it automatically.
                    return
                } else if (state.selectState) {
                    // A piece was selected, and a new square was clicked (the destination).
                    // This is the guard against the 'select' event on the destination square.
                    // Get all legal moves from the selected square
                    const legalMovesFromSelected = chess.moves({ square: state.selectState, verbose: true });
                    // Check if the target square (key) is a valid destination for any of these moves
                    const isValidMove = legalMovesFromSelected.some(move => move.to === key);
                    if (isValidMove) {
                        return; // Let the 'after' event handle the move logic.
                    }
                    state.selectState = false;
                }
                // Find the highest-priority arrow pointing to the clicked square. This is more
                // efficient and readable than iterating through the shapes array multiple times.
                const priority = ['mainLine', 'altLine', 'stockfinished', 'stockfish'];
                const arrowMove = state.chessGroundShapes
                    .filter(shape => shape.dest === key && priority.includes(shape.brush))
                    .sort((a, b) => priority.indexOf(a.brush) - priority.indexOf(b.brush))[0];

                if (arrowMove) {
                    // If the user clicks on a Stockfish-generated move, they are deviating from the PGN.
                    if (arrowMove.brush === 'stockfish' || arrowMove.brush === 'stockfinished') {
                        state.chessGroundShapes = state.chessGroundShapes.filter(shape => shape.brush !== 'mainLine' && shape.brush !== 'altLine');
                        state.pgnState = false;
                    }
                    if (config.boardMode === 'Viewer') {
                        cg.move(arrowMove.orig, arrowMove.dest);
                        handleViewerMove(cg, chess, arrowMove.san, null);
                    }
                } else { // No arrow was clicked, check if there's only one legal play to this square.
                    const allMoves = chess.moves({ verbose: true });
                    const movesToSquare = allMoves.filter(move => move.to === key);
                    if (movesToSquare.length === 1) {
                        // If only one piece can move to this square, play that move.
                        cg.move(movesToSquare[0].from, movesToSquare[0].to);
                        if (config.boardMode === 'Puzzle') {
                            puzzlePlay(cg, chess, 300, movesToSquare[0].san, null);
                        } else if (config.boardMode === 'Viewer') {
                            handleViewerMove(cg, chess, movesToSquare[0].san, null);
                        }
                    }
                }
            },
        },
        premovable: {
            enabled: true
        },
        movable: {
            color: state.boardRotation,
            free: false,
            dests: toDests(chess),
            events: {
                after: (orig, dest) => {
                    if (config.boardMode === 'Puzzle') {
                        puzzlePlay(cg, chess, 300, orig, dest);
                    } else {
                        // Viewer mode
                        handleViewerMove(cg, chess, orig, dest);
                    }
                }
            }
        },
        highlight: { check: true },
        drawable: {
            brushes: {
                stockfish: { key: 'stockfish', color: 'indianred', opacity: 1, lineWidth: 8 },
                stockfinished: { key: 'stockfinished', color: 'red', opacity: 1, lineWidth: 8 },
                mainLine: { key: 'mainLine', color: 'green', opacity: 0.7, lineWidth: 12 },
                altLine: { key: 'altLine', color: 'blue', opacity: 0.7, lineWidth: 10 },
            },
            // An empty array disables user-drawn shapes via right-click/modifier keys.
            autoShapes: [],
        },
    });

    if (config.boardMode === 'Puzzle') {
        if (!chess.isGameOver() && config.flipBoard) {
            playAiMove(cg, chess, 300);
        }
        drawArrows(cg, chess);
        document.querySelector('#buttons-container').style.display = "none";
    } else {
        // Viewer mode
        cg.set({
            premovable: {
                enabled: false
            }
        });
        drawArrows(cg, chess);
    }
    function navBackward() {
        if (state.deepAnalysis || config.boardMode === 'Puzzle' || state.navTimeout !== null) return;
        state.navTimeout = setTimeout(() => {
            state.navTimeout = null; // Reset when it fires
        }, 200);
        const lastMove = chess.undo();
        const FENpos = chess.fen(); // used to track when udoing captured with promoted piece
        if (lastMove) {
            pgnComment.innerHTML = "";
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
            if (state.count == 0) {
                state.pgnState = true; // needed for returning to first move from variation
            } else if (state.expectedLine[state.count - 1].notation.notation == getLastMove(chess).san) {
                state.pgnState = true; // inside PGN
            }
        }
        drawArrows(cg, chess);
        writePgnComments();
        if (state.analysisToggledOn) {
            startAnalysis(100);
        }
    }
    function navForward() {
        if (state.deepAnalysis || config.boardMode === 'Puzzle' || !state.pgnState || !state.expectedMove?.notation || state.navTimeout !== null) return;
        state.navTimeout = setTimeout(() => {
            state.navTimeout = null; // Reset when it fires
        }, 200);
        const tempChess = new Chess(chess.fen());
        const move = tempChess.move(state.expectedMove?.notation?.notation)
        if (move) {
            puzzlePlay(cg, chess, null, move.from, move.to);
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
    }
    function resetBoard() {
        state.count = 0; // Int so we can track on which move we are.
        state.expectedLine = parsedPGN.moves; // Set initially to the mainline of pgn but can change path with variations
        state.expectedMove = parsedPGN.moves[state.count]; // Set the expected move according to PGN
        state.pgnState = true; // incase outside PGN
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
    document.querySelector("#stockfishCalc").addEventListener('click', deepAnalysis);
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
}
document.querySelector('#promoteQ').src = "_"+state.boardRotation[0]+"Q.svg";
document.querySelector('#promoteB').src = "_"+state.boardRotation[0]+"B.svg";
document.querySelector('#promoteN').src = "_"+state.boardRotation[0]+"N.svg";
document.querySelector('#promoteR').src = "_"+state.boardRotation[0]+"R.svg";

if ((state.errorTrack === 'true') && (config.boardMode === 'Viewer')) {
    document.documentElement.style.setProperty('--border-color', "#b31010");
} else if ((state.errorTrack === 'false') && (config.boardMode === 'Viewer')) {
    document.documentElement.style.setProperty('--border-color', "limegreen");
}

function positionPromoteOverlay() {
    const promoteOverlay = document.getElementById('center');
    const rect = document.querySelector('.cg-wrap').getBoundingClientRect();
    // Set the position of the promote element
    promoteOverlay.style.top = (rect.top + 6) + 'px';
    promoteOverlay.style.left = (rect.left + 6) + 'px';
    window.addEventListener('resize', resizeBoard);
}

async function resizeBoard() {
    positionPromoteOverlay();
}


async function loadElements() {
    await reload();
    await resizeBoard();
    initializeStockfish();

    setTimeout(() => {
        positionPromoteOverlay();
    }, 200);
}


loadElements();
