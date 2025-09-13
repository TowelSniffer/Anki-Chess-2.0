import { Chess, SQUARES } from 'chess.js';
import { Chessground } from 'chessground';
import { parse } from '@mliebelt/pgn-parser';
import 'chessground/assets/chessground.base.css';
import './custom.css';
import * as mirror from './js/mirror.js';
import * as pgnViewer from './js/pgnViewer.js';
import * as handleStockfish from './js/handleStockfish.js';
import nags from './nags.json' assert { type: 'json' };

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
    [FEN "rnbq1bnr/ppppkppp/8/4p3/4P3/8/PPPPKPPP/RNBQ1BNR w - - 2 3"]
    [SetUp "1"]

    3. d4 exd4 4. c4 dxc3 5. Qc2 cxb2 (5... d5 6. exd5 c5 7. d6+ Kf6 8. Kd1 Qxd6+ (
        8... Bxd6 9. Qd3 Nc6)) 6. Qc4 Nc6 7. e5 d6 8. exd6+ (8. e6 Ke8 9. Qd5) cxd6 9.
        Qd5 Be6 *
        `),
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
    boardMode: getUrlParam("boardMode", 'Puzzle'),
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
    blunderNags: ['$2', '$4', '$6', '$9'],
};

//if (!state.errorTrack) {
//    state.errorTrack = false;
//}

// --- Stockfish Analysis State ---
let cg = null;
let chess = new Chess();

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
const parsedPGN = parse(config.pgn, { startRule: "game" });

state.ankiFen = parsedPGN.tags.FEN ? parsedPGN.tags.FEN : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function checkCastleRights(fen) {
    const castlingPart = fen.split(' ')[2];
    // If the castling part is not '-', at least one side has castling rights.
    return castlingPart !== '-';
}

if (config.mirror && !checkCastleRights(state.ankiFen)) {
    if (!state.mirrorState) state.mirrorState = mirror.assignMirrorState(config.pgn);
    window.parent.postMessage(state, '*');
    mirror.mirrorPgnTree(parsedPGN.moves, state.mirrorState);
    state.ankiFen = mirror.mirrorFen(state.ankiFen, state.mirrorState);
}
pgnViewer.augmentPgnTree(parsedPGN.moves);
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
export function toDests(chess) {
    const dests = new Map();
    SQUARES.forEach(s => {
        const ms = chess.moves({ square: s, verbose: true });
        if (ms.length) dests.set(s, ms.map(m => m.to));
    });
    return dests;
}

export function toColor(chess) {
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

export function drawArrows(cg, chess, redraw) {
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
            const isBlunder = variation[0].nag?.some(nags => state.blunderNags.includes(nags));
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
    } else if (move.flags.includes("e") && state.debounceTimeout) {
        cg.set({ animation: { enabled: false} })
        cg.set({
            fen: chess.fen(),
        });
        cg.set({ animation: { enabled: true} })
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
    if (config.boardMode === "Viewer" && state.pgnState) pgnViewer.highlightCurrentMove(state.expectedMove.pgnPath);
    if (state.analysisToggledOn) {
        handleStockfish.startAnalysis(4000);
    }
}

function makeMove(cg, chess, move) {
    const moveResult = chess.move(move);
    if (!moveResult) return null;
    updateBoard(cg, chess, moveResult);
    return moveResult;
}

function puzzlePlay(cg, chess, delay, orig, dest) {
    const tempChess = new Chess(chess.fen());
    let tempMove = false;
    if (dest) {
        tempMove = tempChess.move({ from: orig, to: dest, promotion: 'q' });
    } else {
        tempMove = tempChess.move(orig.san);
    }
    if (!tempMove) {
        setTimeout(() => { // que after select: event
            state.debounceTimeout = false;
        }, 0);
        return
    };
    if (tempMove.flags.includes("p") && delay && dest) {
        promotePopup(cg, chess, orig, dest, delay);
    } else {
        checkUserMove(cg, chess, tempMove.san, delay);
    }
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
	    // set state.errorTrack to false (as opposed to null) on correct answer
            if (!state.errorTrack) state.errorTrack = false;
            setTimeout(() => { window.parent.postMessage(state, '*');}, 200);
            /*document.documentElement.style.setProperty('--border-color', state.solvedColour);
            cg.set({
                selected: undefined, // Clear any selected square
                draggable: {
                    current: undefined // Explicitly clear any currently dragged piece
                },
                viewOnly: true
            });*/
        }
	if (!(state.errorTrack === false)) {
            drawArrows(cg, chess, true);
	}
        state.debounceTimeout = false;
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
    cg.move(move.from, move.to)
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
        setTimeout(() => { // que after select: event
            state.debounceTimeout = false;
        }, 0);
    } else {
        setTimeout(() => { // que after select: event
            state.debounceTimeout = false;
        }, 0);
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
        const isBlunder = state.expectedMove.nag?.some(nags => state.blunderNags.includes(nags));
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
	    // set state.errorTrack to false (as opposed to null) on correct answer
            if (!state.errorTrack) state.errorTrack = false;
            setTimeout(() => { window.parent.postMessage(state, '*'); }, 200);
            /*document.documentElement.style.setProperty('--border-color', state.solvedColour);
            cg.set({
                selected: undefined, // Clear any selected square
                draggable: {
                    current: undefined // Explicitly clear any currently dragged piece
                },
                viewOnly: true
            });*/
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
            setTimeout(() => { // que after select: event
                state.debounceTimeout = false;
            }, 0);
        }
    }
    toggleDisplay('showHide');
}
function findParent(obj, targetChild) { // used to find previous line in PGN
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            if (typeof value === 'object' && value !== null) {
                if (value === targetChild) {
                    return {
                        key: key,
                        parent: obj // This is the direct parent
                    };
                }
                const foundParent = findParent(value, targetChild);
                if (foundParent) {
                    return foundParent;
                }
            }
        }
    }
    return null;
};

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
                const arrowCheck = state.chessGroundShapes.filter(shape => shape.brush !== 'mainLine' && shape.brush !== 'altLine' && shape.brush !== 'blunderLine' && shape.brush !== 'stockfish' && shape.brush !== 'stockfinished' && shape.customSvg?.brush !== 'moveType');
                if (arrowCheck.length > 0) {
                    state.chessGroundShapes = state.chessGroundShapes.filter(element => !arrowCheck.includes(element));
                }
                cg.set({drawable: {shapes: state.chessGroundShapes}});
                setTimeout(() => { // 0ms timout to run thise after "after:" event
                    if (state.debounceTimeout) return;


                    const priority = ['mainLine', 'altLine', 'blunderLine', 'stockfinished', 'stockfish'];
                    const arrowMove = state.chessGroundShapes
                        .filter(shape => shape.dest === key && priority.includes(shape.brush))
                        .sort((a, b) => priority.indexOf(a.brush) - priority.indexOf(b.brush));
                    if (arrowMove.length > 0 && config.boardMode === 'Viewer') {
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
                            if (config.boardMode === 'Puzzle') {
                                puzzlePlay(cg, chess, 300, movesToSquare[0], null);
                            } else if (config.boardMode === 'Viewer') {
                                handleViewerMove(cg, chess, movesToSquare[0], null);
                            }
                        }
                    }
                }, 0);
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
                    state.debounceTimeout = true;
                    if (config.boardMode === 'Puzzle') {
                        puzzlePlay(cg, chess, 300, orig, dest);
                    } else {
                        // Viewer mode
                        handleViewerMove(cg, chess, orig, dest);
                        setTimeout(() => { // que after select: event
                            state.debounceTimeout = false;
                        }, 0);
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

    if (config.boardMode === 'Viewer') {
        cg.set({
            premovable: {
                enabled: false
            }
        });
        pgnViewer.initPgnViewer();
    }
    if (!chess.isGameOver() && config.flipBoard) {
        if (config.boardMode === 'Viewer') {
            setTimeout(() => {
                navForward()
            }, 200);
        } else {
            playAiMove(cg, chess, 300);
        }
    }
    drawArrows(cg, chess);
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
                    handleStockfish.startAnalysis(4000);
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
                pgnViewer.highlightCurrentMove(expectedMove.pgnPath);
            } else { // no moves played clear highlight
                document.querySelectorAll('#pgnComment .move.current').forEach(el => el.classList.remove('current'));
                document.querySelectorAll('#navBackward, #resetBoard').forEach(el => el.disabled = true);
            }
        }
        if (state.analysisToggledOn) {
            handleStockfish.startAnalysis(4000);
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
            handleStockfish.startAnalysis(4000);
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
    document.querySelector("#stockfishToggle").addEventListener('click', handleStockfish.toggleStockfishAnalysis);
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
    window.addEventListener('resize', positionPromoteOverlay);
}

async function loadElements() {
    await reload();
    await positionPromoteOverlay();
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
export { cg, chess, state, parsedPGN, nags, cgwrap }
