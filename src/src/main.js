import { Chess, SQUARES } from 'chess.js';
import { Chessground } from 'chessground';
import { parse } from '@mliebelt/pgn-parser';
import 'chessground/assets/chessground.base.css';
import './custom.css';

function toggleDisplay(className) { // toggle hidden class for promote elements
    const elements = document.querySelectorAll('.' + className);
    elements.forEach(element => {
    element.classList.toggle('hidden');
    });
}

// --- URL variables ---
function getUrlVars() { // extract URL variables
    let vars = {};
    const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = decodeURIComponent(value).replace("#!/0", "");
    });
    return vars;
};

const urlPGN = getUrlVars()["PGN"] ? getUrlVars()["PGN"] : `[Event "The Opera Game"]
[Site "Paris Opera House"]
[Date "1858.11.02"]
[Round "?"]
[White "Paul Morphy"]
[Black "Duke of Brunswick & Count Isouart"]
[Result "1-0"]
[ECO "C41"]

1. e4 e5 2. Nf3 d6 {This is the Philidor Defence. It's solid but can be passive.} 3. d4 Bg4?! {This pin is a bit premature. A more common and solid move would be 3...exd4.} 4. dxe5 Bxf3 (4... dxe5 5. Qxd8+ Kxd8 6. Nxe5 {White wins a pawn and has a better position.}) 5. Qxf3! {A great move. Morphy is willing to accept doubled pawns to accelerate his development.} 5... dxe5 6. Bc4 {Putting immediate pressure on the weak f7 square.} 6... Nf6 7. Qb3! {A powerful double attack on f7 and b7.} 7... Qe7 {This is the only move to defend both threats, but it places the queen on an awkward square and blocks the f8-bishop.} 8. Nc3 c6 9. Bg5 {Now Black's knight on f6 is pinned and cannot move without the queen being captured.} 9... b5?! {A desperate attempt to kick the bishop and relieve some pressure, but it weakens Black's queenside.} 10. Nxb5! {A brilliant sacrifice! Morphy sees that his attack is worth more than the knight.} 10... cxb5 11. Bxb5+ Nbd7 12. O-O-O {All of White's pieces are now in the attack, while Black's are tangled up and undeveloped.} 12... Rd8 13. Rxd7! {Another fantastic sacrifice to remove the defending knight.} 13... Rxd7 14. Rd1 {Renewing the pin and intensifying the pressure. Black is completely paralyzed.} 14... Qe6 {Trying to trade queens to relieve the pressure, but it's too late.} 15. Bxd7+ Nxd7 (15... Qxd7 16. Qb8+ Ke7 17. Qxe5+ Kd8 18. Bxf6+ {and White wins easily.}) 16. Qb8+! {The stunning final sacrifice! Morphy forces mate by sacrificing his most powerful piece.} 16... Nxb8 17. Rd8# {A beautiful checkmate, delivered with just a rook and bishop.} 1-0
`;
let ankiFen; // initialize starting FEN
const fontSize = getUrlVars()["fontSize"] ? getUrlVars()["fontSize"] : 16; // font size for user text and pgn comments in px
const ankiText = getUrlVars()["userText"] ? getUrlVars()["userText"] : `<h2>The Opera Game</h2>White: Paul Morphy<br>Black:Duke of Brunswick & Count Isouart`;
const muteAudio = getUrlVars()["muteAudio"] ? getUrlVars()["muteAudio"] : 'false';
const handicap = getUrlVars()["handicap"] ? getUrlVars()["handicap"] : 1;
const strictScoring = getUrlVars()["strictScoring"] ? getUrlVars()["strictScoring"] : 'false';
const acceptVariations = getUrlVars()["acceptVariations"] ? getUrlVars()["acceptVariations"] : 'true';
var solvedColour = "limegreen"; // sets border colour on puzzle completion
var errorTrack = getUrlVars()["errorTrack"] ? getUrlVars()["errorTrack"] : '';
const disableArrows = getUrlVars()["disableArrows"] ? getUrlVars()["disableArrows"] : 'false'; // eneable/disable drawing arrows for alternate lines
let boardRotation = "black";
const flipBoard = getUrlVars()["flip"] ? getUrlVars()["flip"] : 'true';
const boardMode = getUrlVars()["boardMode"] ? getUrlVars()["boardMode"] : 'Viewer'; // Front = Puzzle Back = Viewer
const background = getUrlVars()["background"] ? getUrlVars()["background"] : "#2C2C2C"; // background colour

// --- initialize Template ---

document.documentElement.style.setProperty('--background-color', background);
const parsedPGN = parse(urlPGN, { startRule: "game" });
if (parsedPGN.tags.FEN) {
    ankiFen = parsedPGN.tags.FEN
} else {
    ankiFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
}
if (ankiText) {
    commentBox.style = "font-size: " + fontSize + "px;"
    commentBox.classList.toggle('hidden');
    textField.innerHTML = ankiText;
}

const patt = /(( b | w ))(?!.*\1)/g;
const result = ankiFen.match(patt); // Find fisrt move of PGN
if (result == " w ") {
    boardRotation = "white";
}
if (flipBoard != 'true' && boardRotation == "white" || flipBoard == 'true' && boardRotation == "black") {
    const root = document.documentElement;

    // Get the current values of the CSS variables
    const coordWhite = getComputedStyle(root).getPropertyValue('--coord-white').trim();
    const coordBlack = getComputedStyle(root).getPropertyValue('--coord-black').trim();
    // Swap the values
    root.style.setProperty('--coord-white', coordBlack);
    root.style.setProperty('--coord-black', coordWhite);
}

if (flipBoard == 'true' && boardRotation == "white") {
    boardRotation = "black"
} else if (flipBoard == 'true' && boardRotation == "black") {
    boardRotation = "white";
}
var boarOrientation = boardRotation; // track board orientation for fliping
document.documentElement.style.setProperty('--border-color', boardRotation);

if (errorTrack == "true" && boardMode == 'Viewer') {
    document.documentElement.style.setProperty('--border-color', "#b31010");
    document.documentElement.style.setProperty('--border-shadow', "#b31010");
} else if(errorTrack == "false" && boardMode == 'Viewer') {
    document.documentElement.style.setProperty('--border-color', "limegreen");
    document.documentElement.style.setProperty('--border-shadow', "limegreen");
}
window.parent.postMessage(errorTrack, '*'); // communicates with anki connect that puzzle should be marked incomplete (black/white border)
errorTrack = 'false'; // default to marking correct

// promote buttons
document.querySelector('#promoteQ').src = "_"+boardRotation[0]+"Q.svg";
document.querySelector('#promoteB').src = "_"+boardRotation[0]+"B.svg";
document.querySelector('#promoteN').src = "_"+boardRotation[0]+"N.svg";
document.querySelector('#promoteR').src = "_"+boardRotation[0]+"R.svg";

// --- Initialize Tracking Variables ---
var count; // Int so we can track on which move we are.
var selectState = false; // used to track if piece is selected
var pgnState = true; // boolian to indicate when entering and exiting scope of PGN
var expectedLine; // Set initially to the mainline of pgn but can change path with variations
var expectedMove; // Set the expected move according to PGN
var errorCount = 0; // tracks mistakes against handicap
var alternateMove; // used as bullion to show other correct moves with arrows
var alternateMoves = []; // used to store alternate correct moves in an array
var promoteChoice = 'q'; //default promotion to queen, can be changed with button withing template however it must be specified before move is made.
var debounceTimeout = null; // prevent rapid execution of functions
var foundVariation; // a bullion to check if there are multiple lines

// --- Board interaction functions ---

function toDests(chess) {
    const dests = new Map();
    SQUARES.forEach(s => {
        const ms = chess.moves({ square: s, verbose: true });
        if (ms.length)
            dests.set(s, ms.map(m => m.to));
    });
    return dests;
}
function toColor(chess) {
    return (chess.turn() === 'w') ? 'white' : 'black';
}
function getLastMove(chess) {
    const allMoves = chess.history({ verbose: true }); // Get all moves with verbose details

    if (allMoves.length > 0) {
        return allMoves[allMoves.length - 1];
    } else {
        return false // No moves have been made yet.
    }
}
function playOtherSide(cg, chess) {
    return (orig, dest) => {
        selectState = false; // piece has been dropped when this is run so assume no select
        const promoteCheck = chess.move({ from: orig, to: dest, promotion: promoteChoice});
        if (promoteCheck.san.includes("=")) { 
            chess.undo();
            promotePopup(null, cg, chess, orig, dest, null)
        } else {
            const lastMove = getLastMove(chess);
            changeAudio(lastMove);
            cg.set({
                fen: chess.fen(),
                check: chess.inCheck(),
                turnColor: toColor(chess),
                movable: {
                    color: toColor(chess),
                    dests: toDests(chess)
                },
                lastMove: [lastMove.from, lastMove.to]
            });
            PGNnavigator(cg, chess, lastMove.san)
        }

    };
}
function moveChecker(moveCheck, cg, chess, orig, dest, delay, chess2) {
// funtion to check if move is correct
    let moveCheckIsPromote = false;
    if (moveCheck.includes("=")) { // convert pawn move into promotion
    moveCheckIsPromote = true;
    chess.move({ from: orig, to: dest, promotion: promoteChoice});
    cg.set({
        fen: chess.fen(),

    });
    moveCheck = chess.undo().san;
    }

    if (expectedMove?.variations) { // Multiple possible lines
    if (expectedMove.notation.notation == moveCheck) { // move = next mainline move
        foundVariation = true;
    } else if (expectedMove.notation.notation !== moveCheck) {
        if (expectedMove.variations.length > 0 && acceptVariations == 'true') {
        for (var i = 0; i < expectedMove.variations.length; i++) {
            if (moveCheck === expectedMove.variations[i][0].notation.notation) {
            count = 0;
            expectedLine = expectedMove.variations[i];
            expectedMove = expectedLine[count];
            foundVariation = true;
            break
            }

        }
        if (foundVariation === false) { // Move not in variations
            wrongMove(cg, chess)
        }

        } else { // Move not in main line
        wrongMove(cg, chess)
        }

    }
    }
    if (foundVariation == true) { // correct move played
    count++;
    expectedMove = expectedLine[count];
    chess.move({ from: orig, to: dest, promotion: promoteChoice});
    changeAudio(getLastMove(chess));
    cg.set({
        turnColor: toColor(chess),
        check: chess.inCheck()
    });
    if (expectedMove?.variations) { // Ai response exists, ie puzzle not over
    setTimeout(() => { // delay response for puzzle
        errorCount = 0; // reset error count after move played
        if (expectedMove?.variations.length > 0 && acceptVariations == 'true') {
        const moveVar = Math.floor(Math.random() * (expectedMove.variations.length + 1));
        if (moveVar !== expectedMove.variations.length) { // variation chosen instead of main line
            // switch main line of PGN to the main line of chose variation
            count = 0; // varation moves begin at 0 again
            expectedLine = expectedMove.variations[moveVar];
            expectedMove = expectedLine[0];
        }
        }
        chess.move(expectedMove.notation.notation);
        const lastMoveAi = getLastMove(chess);
        if (expectedMove.notation.promotion) {
        const lastMove = chess.undo();
        chess2.load(chess.fen());
        chess2.remove(lastMove.from);
        chess2.put({ type: 'p', color: chess.turn() }, lastMove.to);
        cg.set({
            fen: chess2.fen(),
        });
        chess.move(expectedMove.notation.notation);
        setTimeout(() => {
            cg.set({ animation: { enabled: false} })
            cg.set({
                fen: chess.fen(),
            });
            cg.set({ animation: { enabled: true} })
        }, 200)
        } else {
        cg.set({
            fen: chess.fen()
        });
        }
        changeAudio(lastMoveAi);
        cg.set({
            turnColor: toColor(chess),
            movable: {
                color: toColor(chess),
                dests: toDests(chess)
            }
        });
        cg.set({
            check: chess.inCheck()
        });
        cg.set({ lastMove: [lastMoveAi.from, lastMoveAi.to] });
        count++;
        expectedMove = expectedLine[count];
        cg.playPremove(); // allows premoves

        if (!expectedMove || typeof expectedMove === 'string') {
            window.parent.postMessage(errorTrack, '*'); // communicates with anki connect how puzzle should be marked
            document.documentElement.style.setProperty('--border-color',solvedColour);
            cg.set({
            selected: undefined, // Clear any selected square
            draggable: {
                current: undefined // Explicitly clear any currently dragged piece
            },
            viewOnly: true
            });
        }
        cg.set({ // draw any alternate line if recorded
        drawable: {
            shapes: alternateMoves
        }
        });
    }, delay);
    } else { // end of puzzle
    count++;
    expectedMove = expectedLine[count];
    if (!expectedMove || typeof expectedMove === 'string') {
        window.parent.postMessage(errorTrack, '*'); // communicates with anki connect how puzzle should be marked
        document.documentElement.style.setProperty('--border-color',solvedColour);
        cg.set({
        fen: chess.fen(),
        selected: undefined, // Clear any selected square
        draggable: {
            current: undefined // Explicitly clear any currently dragged piece
        },
        viewOnly: true
        });
    }
    count--;
    expectedMove = expectedLine[count];
    }
    cg.set({
        drawable: {
            shapes: alternateMoves
        }
    });
} else { // incorect move played
    errorCount++;
    if (moveCheckIsPromote && (errorCount <= (handicap+1))) { // makes pawn animate back when wrong promotion chosen

    chess2.load(chess.fen());
    chess2.remove(orig);
    chess2.put({ type: 'p', color: chess.turn() }, dest);
    cg.set({ animation: { enabled: false} })
    cg.set({
        fen: chess2.fen(),
    });
    cg.set({ animation: { enabled: true} })
    chess2.remove(dest);
    chess2.put({ type: 'p', color: chess.turn() }, orig);
    cg.set({
        fen: chess.fen(),
    });
    }


    const audio = document.getElementById("myAudio");
    if (errorCount > 0 && strictScoring == 'true') { // marks puzzle incorrect with one wrong move
    errorTrack = 'true';
    window.parent.postMessage(errorTrack, '*'); // communicates with anki connect that puzzle should be marked incorrect (red border)
    solvedColour = "#b31010";
    };
    if (errorCount > handicap) {
    const audio = document.getElementById("myAudio");
    audio.src = "_Error.mp3"
    audio.play();
    setTimeout(() => {
        // mistake limit met so puzzle auto advances
        errorTrack = 'true';
        window.parent.postMessage(errorTrack, '*'); // communicates with anki connect that puzzle should be marked incorrect (red border)
        solvedColour = "#b31010";
        if (expectedMove?.variations.length > 0 && acceptVariations == 'true') {
        // looked for variations and randomly choses one
        const randomIndex = Math.floor(Math.random() * (expectedMove.variations.length + 1)); // +1 to include mainline
        if (randomIndex != expectedMove.variations.length) {
            count = 0;
            expectedLine = expectedMove.variations[randomIndex]
            expectedMove = expectedLine[count];

        }
        }
        if (moveCheckIsPromote && expectedMove.notation.promotion) { // attempted a promotion and correct move is another promotion
        chess.move(expectedMove.notation.notation);
        const lastMove = chess.undo(); // orig dest to wont work here as same pawn might promote od different squar
        chess2.load(chess.fen());
        chess2.remove(lastMove.from);
        chess2.put({ type: 'p', color: chess.turn() }, lastMove.to);
        cg.set({
            fen: chess2.fen(),
        });
        chess.move(expectedMove.notation.notation);
        setTimeout(() => {
            cg.set({ animation: { enabled: false} })
            cg.set({
                fen: chess.fen(),
            });
            cg.set({ animation: { enabled: true} })
        }, 200)
        } else if (expectedMove.notation.promotion) {
            chess2.load(chess.fen());
            chess.move(expectedMove.notation.notation);
            const lastMove = chess.undo();
            chess2.remove(lastMove.from);
            chess2.put({ type: 'p', color: chess.turn() }, lastMove.to);
            cg.set({
                fen: chess2.fen(),
            });
            chess.move(expectedMove.notation.notation);
            setTimeout(() => {
            cg.set({ animation: { enabled: false} })
            cg.set({
                fen: chess.fen(),
            });
            cg.set({ animation: { enabled: true} })
            }, 200)
        } else {
        chess.move(expectedMove.notation.notation);
        cg.set({
            fen: chess.fen()
        });
        }
        const lastMoveAi = getLastMove(chess);
        changeAudio(lastMoveAi);
        cg.set({
            turnColor: toColor(chess),
            check: chess.inCheck(),
            lastMove: [lastMoveAi.from, lastMoveAi.to],
            movable: {
                color: toColor(chess),
                dests: toDests(chess)
            }
        });
        count++;
        expectedMove = expectedLine[count];
        if (expectedMove?.variations) {
            setTimeout(() => {
            errorCount = 0;
                if (expectedMove?.variations.length > 0 && acceptVariations == 'true') {
                const moveVar = Math.floor(Math.random() * (expectedMove.variations.length + 1));
                if (moveVar == expectedMove.variations.length) {
                } else {
                count = 0;
                expectedLine = expectedMove.variations[moveVar];
                expectedMove = expectedLine[0];
                }
            }

            if (expectedMove.notation.promotion) {
                chess2.load(chess.fen());
                chess.move(expectedMove.notation.notation);
                const lastMove = chess.undo();
                chess2.remove(lastMove.from);
                chess2.put({ type: 'p', color: chess.turn() }, lastMove.to);
                cg.set({
                    fen: chess2.fen(),
                });
                chess.move(expectedMove.notation.notation);
                setTimeout(() => {
                cg.set({ animation: { enabled: false} })
                cg.set({
                    fen: chess.fen(),
                });
                cg.set({ animation: { enabled: true} })
                }, 200)
            } else {
                chess.move(expectedMove.notation.notation);
                cg.set({
                    fen: chess.fen()
                });
            }
            const lastMoveAi = getLastMove(chess);
            changeAudio(lastMoveAi);
            cg.set({
                turnColor: toColor(chess),
                movable: {
                    color: toColor(chess),
                    dests: toDests(chess)
                }
            });
            cg.set({
                check: chess.inCheck()
            });
            cg.set({ lastMove: [lastMoveAi.from, lastMoveAi.to] });
            count++;
            expectedMove = expectedLine[count];
            cg.playPremove();

            if (!expectedMove || typeof expectedMove === 'string') {
                window.parent.postMessage(errorTrack, '*'); // communicates with anki connect that puzzle should be marked correct (green border)
                document.documentElement.style.setProperty('--border-color',solvedColour);
                cg.set({
                selected: undefined, // Clear any selected square
                draggable: {
                    current: undefined // Explicitly clear any currently dragged piece
                },
                viewOnly: true
                });
            }

            }, delay);
        } else {
            count++;
            expectedMove = expectedLine[count];
            if (!expectedMove || typeof expectedMove === 'string') {
            window.parent.postMessage(errorTrack, '*'); // communicates with anki connect that puzzle should be marked correct (green border)
            document.documentElement.style.setProperty('--border-color',solvedColour);
            cg.set({
                selected: undefined, // Clear any selected square
                draggable: {
                current: undefined // Explicitly clear any currently dragged piece
                },
                viewOnly: true
            });
            }
            count--;
            expectedMove = expectedLine[count];
        }
        errorCount = 0;
    }, delay);
    } else {
    audio.src = "_Error.mp3"
    audio.play();
    }
}
}
function drawArrows(cg, chess) {
    if (!pgnState || typeof expectedMove === 'string') { // outside/end of pgn
    return
    }
    const comment = expectedLine[count - 1]?.commentAfter;
    if (comment) {
    pgnComment.innerHTML = "<ul><li>" + expectedLine[count -1].commentAfter+ "</ul></li>";
    } else {
    pgnComment.innerHTML = ""
    }
    if (expectedMove?.variations) {

    chess.move(expectedMove.notation.notation);
    alternateMove = chess.undo();
    if (alternateMove.san === expectedMove.notation.notation) {
        alternateMoves = [];
        //handles when later moves outside of PGN move to the same square
        alternateMoves.push({ orig: alternateMove.from, dest: alternateMove.to, brush: 'green' });
        for (var i = 0; i < expectedMove.variations.length; i++) {
            chess.move(expectedMove.variations[i][0].notation.notation);
            alternateMove = chess.undo();
            alternateMoves.push({ orig: alternateMove.from, dest: alternateMove.to, brush: 'blue' });
        };
        // shifts main arrow to end to green is on top if needed
        const alternateMovesShift = alternateMoves.shift();
        alternateMoves.push(alternateMovesShift);
    }
    cg.set({
    drawable: {
        shapes: alternateMoves
    }
    });
    }
};
function PGNnavigator(cg, chess, moveSan, chess2) {
// Keeps track of where or if board state is within PGN
    if (moveSan) {
    // check if function is provided a move to consider otherwise it will assume next move of PGN
    if (expectedMove?.variations) {
        if (moveSan === expectedMove.notation.notation && pgnState) {
        count++;
        expectedMove = expectedLine[count];
        drawArrows(cg, chess);
        } else if (expectedMove.variations.length > 0 && pgnState ) {
        // looks to match move to an alternate line
        pgnState = false; // asume no line found
        for (var i = 0; i < expectedMove.variations.length; i++) {
            if (moveSan == expectedMove.variations[i][0].notation.notation) {
                pgnState = true; // alternate line found
                expectedLine = expectedMove.variations[i];
                expectedMove = expectedLine[1];
                count=1
                drawArrows(cg, chess);
                break
            }
        };
        } else if (pgnState) {
        pgnState = false; // outside PGN
        }
    }
    } else {
    chess.move(expectedMove.notation.notation);
    const lastMoveAi = getLastMove(chess);
    if (expectedMove.notation.promotion) {
        const lastMove = chess.undo();
        chess2.load(chess.fen());
        chess2.remove(lastMove.from);
        chess2.put({ type: 'p', color: chess.turn() }, lastMove.to);
        cg.set({
            fen: chess2.fen(),
        });
        chess.move(expectedMove.notation.notation);
        setTimeout(() => {
        cg.set({ animation: { enabled: false} })
        cg.set({
            fen: chess.fen(),
        });
        drawArrows(cg, chess);
        cg.set({ animation: { enabled: true} })
        }, 200)
    } else {
        cg.set({
            fen: chess.fen()
        });
    }
    changeAudio(lastMoveAi);
    cg.set({
        turnColor: toColor(chess),
        lastMove: [lastMoveAi.from, lastMoveAi.to],
        check: chess.inCheck(),
        movable: {
            color: toColor(chess),
            dests: toDests(chess)
        }
    });
    count++;
    expectedMove = expectedLine[count];
    drawArrows(cg, chess);
    }
}
function getLegalMovesToSquare(chess, targetSquare) {
    const allLegalMoves = chess.moves({ verbose: true });
    const movesToTargetSquare = [];

    for (const move of allLegalMoves) {
    if (move.to === targetSquare) {
        movesToTargetSquare.push(move);
    }
    }
    return movesToTargetSquare;
}
function wrongMove(cg, chess) {
    cg.set({
    check: chess.inCheck(),
    fen: chess.fen(),
    turnColor: toColor(chess),
    movable: {
        color: toColor(chess),
        dests: toDests(chess)
    }
    }
    );
}
function promotePopup(moveCheck, cg, chess, orig, dest, delay, chess2) {
    const cancelPopup = function(){
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
    if (boardMode == 'Viewer') {
        drawArrows(cg, chess);
    }
    }
    const promoteButtons = document.querySelectorAll("#center > button");
    const overlay = document.querySelector("#overlay");
    for (var i=0; i<promoteButtons.length; i++){
    promoteButtons[i].onclick = function(){
        event.stopPropagation();
        promoteChoice=this.value;
        if (boardMode === 'Puzzle') {
        cancelPopup();
        moveChecker(moveCheck, cg, chess, orig, dest, delay, chess2)
        } else if (boardMode === 'Viewer') {
        cancelPopup();
        const move = chess.move({ from: orig, to: dest, promotion: promoteChoice});
        changeAudio(move);
        cg.set({
            fen: chess.fen(),
            check: chess.inCheck(),
            turnColor: toColor(chess),
            movable: {
                color: toColor(chess),
                dests: toDests(chess)
            },
            lastMove: [move.from, move.to]
        });
        PGNnavigator(cg, chess, move.san)
        }
        document.querySelector(".cg-wrap").style.filter = 'none';
        document.querySelector("cg-board").style.cursor = 'pointer';
    }
    overlay.onclick = function() {
        cancelPopup();
        const audio = document.getElementById("myAudio");
        audio.src = "_Move.mp3"
        audio.play();
    }
    }
    toggleDisplay('showHide');
    document.querySelector("cg-board").style.cursor = 'default';
}
function puzzlePlay(cg, chess, delay, from, to, chess2) {
    return (orig, dest) => { // drag and drop after event for Puzzle
        selectState = false; // disables select state indication for dropped piece to allow for click move event
        const moveAccepted = count; // count will increase if a correct move is played
        if (from) { // from and to are manually provided with click move select: event
        orig = from;
        dest = to;
        };
        const playerComment = expectedLine[count]?.commentAfter;
        foundVariation = false; // is move correct?
        alternateMoves = [];
        console.log("moveCheck")
        console.log(chess.fen())
        chess.move({ from: orig, to: dest, promotion: promoteChoice}); // move to check
        const moveCheck = chess.undo().san;
        console.log(moveCheck)
        if (expectedMove?.variations.length > 0 && disableArrows == 'false') { // compare move to mainline and variations and store arrows
        for (var i = 0; i < expectedMove.variations.length; i++) {
            if (moveCheck != expectedMove.variations[i][0].notation.notation) {
            chess.move(expectedMove.variations[i][0].notation.notation);
            alternateMove = chess.undo();
            alternateMoves.push({ orig: alternateMove.from, dest: alternateMove.to, brush: 'blue' });
            } else {
            chess.move(expectedMove.notation.notation);
            alternateMove = chess.undo();
            alternateMoves.push({ orig: alternateMove.from, dest: alternateMove.to, brush: 'green' });
            }
        };
        }
        if (moveCheck.includes("=")) {//promotion
            promotePopup(moveCheck, cg, chess, orig, dest, delay, chess2)
        } else {
            moveChecker(moveCheck, cg, chess, orig, dest, delay, chess2);
        }
        const opponentComment = expectedLine[count]?.commentAfter;
        if ((playerComment || opponentComment) && (moveAccepted < count) ) {
        pgnComment.innerHTML = "<ul><li>" + ((boarOrientation === 'white') ? '<b>White: </b>' : '<b>Black: </b>') + (playerComment ? playerComment : '') + "</li><li>" + ((boarOrientation === 'white') ? '<b>Black: </b>' : '<b>White: </b>') + (opponentComment ? opponentComment : '') + "</ul></li>";
        } else if (moveAccepted < count){
        pgnComment.innerHTML = ""
        }
    };
}
function changeAudio(gameState) {
    const audio = document.getElementById("myAudio");
    if (gameState.san.includes("#")) {
    audio.src = "_checkmate.mp3"
    } else if (gameState.san.includes("+")) {
    audio.src = "_move-check.mp3"
    } else if (gameState.flags.includes("c")) {
    audio.src = "_Capture.mp3"
    } else if (gameState.flags.includes("k") || gameState.flags.includes("q")) {
    audio.src = "_castle.mp3"
    } else if (gameState.flags.includes("p")) {
    audio.src = "_promote.mp3"
    } else {
    audio.src = "_Move.mp3"
    }
    audio.play();
};


// --- PGN Handling ---


// --- Chessground Initialization ---
function reload() {
    count = 0; // Int so we can track on which move we are.
    expectedLine = parsedPGN.moves; // Set initially to the mainline of pgn but can change path with variations
    expectedMove = parsedPGN.moves[count]; // Set the expected move according to PGN
    const chess = new Chess(ankiFen);
    const chess2 = new Chess(); // second instance to fuck with when manually animating promotions
    const board = document.getElementById('board');
    // --- Puzzle Mode ---
    if (boardMode === 'Puzzle') {
        
        const cg = Chessground(board, {
        fen: ankiFen,
        ranksPosition: 'right',
        turnColor: boardRotation,
        orientation: boardRotation,
        movable: {
            color: boardRotation,
            free: false,
            dests: toDests(chess)
        },
        highlight: {
            check: true,
        },
        events: {
            select: (key) => { // 'key' is the clicked square string (e.g., "e2")
            //prevent radip firing on touchscreen
            if (debounceTimeout !== null) {
                return
            };
            debounceTimeout = setTimeout(() => {
                debounceTimeout = null; // Reset when it fires
            }, 300); // wait for puzzlePlay()

            // checks for senarios when not to run onclick event to avoid double execution with click to move or drag and drop
            if (cg.state.selected == selectState && selectState == key) {
                // clicking on same piece again to unselect
                selectState = false;
                return
            } else if (selectState !== key && key == cg.state.selected) {
                // when another movable piece is clicked
                selectState = key;
                return
            } else if (selectState) {
                // key is not a movable piece and currently peice selected
                // Get all legal moves from the selected square
                const legalMovesFromSelected = chess.moves({ square: selectState, verbose: true });
                // Check if the target square (key) is a valid destination for any of these moves
                const isValidMove = legalMovesFromSelected.some(move => move.to === key);
                if (isValidMove) {
                    return
                } else {
                }
                selectState = false;
            }
            const targetSquare = key; // finds all legal moves that lead to clicked square
            const legalMovesToSquare = getLegalMovesToSquare(chess, targetSquare);
            if (legalMovesToSquare.length == 1) {
                // if only one valid move to clicked square, assume you wish to play it
                const lastMove = chess.move(legalMovesToSquare[0].san);
                cg.set({
                    fen: chess.fen(),
                    turnColor: toColor(chess),
                    movable: {
                    color: toColor(chess),
                    dests: toDests(chess)
                    },
                    check: chess.inCheck(),
                    lastMove: [lastMove.from, lastMove.to]
                });
                chess.undo(); // need this basically simulates click to move so puzzlePlay will handle it as a pice dragged from, to
                puzzlePlay(cg, chess, 300, legalMovesToSquare[0].from, legalMovesToSquare[0].to, chess2)();
            }
            }
        }
        });
        cg.set({
            movable: {
                events: {
                    after: puzzlePlay(cg, chess, 300, null, null, chess2)
                }
            }
        });
        if (chess.inCheck() == true) {
        cg.set({
            check: true,
        });
        }
        if (chess.isGameOver() == false && flipBoard == 'true') {
        setTimeout(() => {
            if (expectedMove?.variations.length > 0 && acceptVariations == 'true') {
                const moveVar = Math.floor(Math.random() * (expectedMove.variations.length + 1));
                if (moveVar == expectedMove.variations.length) {
                } else {
                count = 0;
                expectedLine = expectedMove.variations[moveVar];
                expectedMove = expectedLine[0];
                }
            }
            chess.move(expectedMove.notation.notation);
            const lastMoveAi = getLastMove(chess);
            changeAudio(lastMoveAi);
            cg.set({
                fen: chess.fen(),
                movable: {
                    dests: toDests(chess),
                }
            });

                cg.set({
                turnColor: boardRotation,
                    check: chess.inCheck()
                });
                cg.set({ lastMove: [lastMoveAi.from, lastMoveAi.to] });
            count++;
            expectedMove = expectedLine[count];
            cg.playPremove();
        }, 200);
        }
        document.querySelector('#buttons-container').style = "display: none"
    } else // --- Viewer Mode ---
    if (boardMode === 'Viewer') {
        const cg = Chessground(board, {
        fen: ankiFen,
        orientation: boardRotation,
        turnColor: boardRotation,
        movable: {
            free: false,
            color: boardRotation,
            dests: toDests(chess)
        },
        highlight: {
            check: true,
        },
        events: {
            select: (key) => { // onclick handler: 'key' is the clicked square string (e.g., "e2")
            //prevent radip firing on touchscreen
            if (debounceTimeout !== null) {
                drawArrows(cg, chess);
                return
            };
            debounceTimeout = setTimeout(() => {
                debounceTimeout = null; // Reset when it fires
            }, 100); // 100 is as low as it can seem to go
            // checks for senarios when not to run onclick event to avoid double execution with click to move or drag and drop
            if (cg.state.selected == selectState && selectState == key) {
                // clicking on same piece again to unselect
                selectState = false;
                drawArrows(cg, chess);
                return
            } else if (selectState !== key && key == cg.state.selected) {
                // when another movable piece is clicked
                selectState = key;
                drawArrows(cg, chess);
                return
            } else if (selectState) {
                // key is not a movable piece and currently peice selected
                // Get all legal moves from the selected square
                const legalMovesFromSelected = chess.moves({ square: selectState, verbose: true });
                // Check if the target square (key) is a valid destination for any of these moves
                const isValidMove = legalMovesFromSelected.some(move => move.to === key);
                if (isValidMove) {
                    return
                } else {
                }
                selectState = false;
            }
            const targetSquare = key; // finds all legal moves that lead to clicked square
            const legalMovesToSquare = getLegalMovesToSquare(chess, targetSquare);
            if (legalMovesToSquare.length == 1) {
                // if only one valid move to clicked square, assume you wish to play it
                chess.move(legalMovesToSquare[0].san);
                const lastMove = getLastMove(chess);
                changeAudio(lastMove);
                cg.set({
                    fen: chess.fen(),
                    check: chess.inCheck(),
                    turnColor: toColor(chess),
                    movable: {
                    color: toColor(chess),
                    dests: toDests(chess)
                    },
                    lastMove: [lastMove.from, lastMove.to]
                });
                PGNnavigator(cg, chess, lastMove.san);
            } else if (legalMovesToSquare.length > 1 && pgnState) {
                // checks if clicked square is a correct choice and if so moves to first instance.
                let moveTracker = false; //will be refrenced to see if valid move is played
                if (expectedMove?.variations) {
                const expectedMoveStore = expectedMove?.notation?.notation; // helps
                for (var i = 0; i < legalMovesToSquare.length; i++) {
                    const legalMovesToSquareAlt = legalMovesToSquare[i].san; // store each legal move to check against main line and variations
                    if (moveTracker) { // line found
                    break
                    }
                    for (var k = 0; k < legalMovesToSquare.length; k++) { // first loop legal moves against mainline. Note this will only run once
                    const legalMovesToSquareAlt = legalMovesToSquare[k].san;
                    if (expectedMove?.notation?.notation === legalMovesToSquareAlt) {
                        chess.move(legalMovesToSquareAlt);
                        if (expectedMove.notation.promotion) { // fix promotion animation
                            const lastMove = chess.undo();
                            const chess2 = new Chess();
                            chess2.load(chess.fen());
                            chess2.remove(lastMove.from);
                            chess2.put({ type: 'p', color: chess.turn() }, lastMove.to);
                            cg.set({
                                fen: chess2.fen(),
                            });
                            chess.move(expectedMove.notation.notation);
                            setTimeout(() => {
                            cg.set({ animation: { enabled: false} })
                            cg.set({
                                fen: chess.fen(),
                            });
                            cg.set({ animation: { enabled: true} })
                            drawArrows(cg, chess);
                            }, 200)
                        } else {
                            cg.set({
                                fen: chess.fen()
                            });
                        }
                        const lastMove = getLastMove(chess);
                        changeAudio(lastMove);
                        cg.set({
                            check: chess.inCheck(),
                            turnColor: toColor(chess),
                            movable: {
                                color: toColor(chess),
                                dests: toDests(chess)
                            },
                            lastMove: [lastMove.from, lastMove.to]
                        });
                        PGNnavigator(cg, chess, lastMove.san);
                        moveTracker = true;
                        break
                        }
                    }
                    for (var j = 0; j < expectedMove?.variations?.length; j++) { // consecutively loop for alternate line only entire minline has been looked at
                    if (expectedMove.variations[j][0].notation.notation === legalMovesToSquareAlt) {
                        chess.move(expectedMove.variations[j][0].notation.notation);
                        if (expectedMove.variations[j][0].notation.promotion) { // fix promotion animation
                            const lastMove = chess.undo();
                            const chess2 = new Chess();
                            chess2.load(chess.fen());
                            chess2.remove(lastMove.from);
                            chess2.put({ type: 'p', color: chess.turn() }, lastMove.to);
                            cg.set({
                                fen: chess2.fen(),
                            });
                            chess.move(expectedMove.variations[j][0].notation.notation);
                            setTimeout(() => {
                            cg.set({ animation: { enabled: false} })
                            cg.set({
                                fen: chess.fen(),
                            });
                            cg.set({ animation: { enabled: true} })
                            drawArrows(cg, chess);
                            }, 200)
                        } else {
                        cg.set({
                            fen: chess.fen()
                        });
                        }
                        const lastMove = getLastMove(chess);
                        changeAudio(lastMove);
                        cg.set({
                            check: chess.inCheck(),
                            turnColor: toColor(chess),
                            movable: {
                            color: toColor(chess),
                            dests: toDests(chess)
                            },
                            lastMove: [lastMove.from, lastMove.to]
                        });
                        PGNnavigator(cg, chess, legalMovesToSquareAlt);
                        moveTracker = true;
                        break;
                    }
                    }
                }
                }
                if (!moveTracker) { // ie. no move played but legal moves to clicked square
                drawArrows(cg, chess);
                }
            } else { // no legal moves to clicked square
                drawArrows(cg, chess);
            }
            }
        }
        });


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

        var resetBoard = function() {
        count = 0; // Int so we can track on which move we are.
        expectedLine = parsedPGN.moves; // Set initially to the mainline of pgn but can change path with variations
        expectedMove = parsedPGN.moves[count]; // Set the expected move according to PGN
        pgnState = true; // incase outside PGN
        chess.reset();
        chess.load(ankiFen);
        cg.set({
                fen: chess.fen(),
                check: chess.inCheck(),
                turnColor: toColor(chess),
                orientation: boarOrientation,
                movable: {
                color: toColor(chess),
                dests: toDests(chess)
                }
        });
        drawArrows(cg, chess);

        }
        var rotateBoard = function() {
            boarOrientation = ((boarOrientation === 'white') ? 'black' : 'white')
            const root = document.documentElement;
            // Get the current values of the CSS variables
            const coordWhite = getComputedStyle(root).getPropertyValue('--coord-white').trim();
            const coordBlack = getComputedStyle(root).getPropertyValue('--coord-black').trim();
            // Swap the values. so coord colors are correct
            root.style.setProperty('--coord-white', coordBlack);
            root.style.setProperty('--coord-black', coordWhite);
            cg.set({
                orientation: boarOrientation
            });
        }
        function navBackward() { // Move forward in PGN
        const lastMove = chess.undo();
        const FENpos = chess.fen(); // used to track when udoing captured with promoted piece
        if (lastMove) {
            if (lastMove.promotion) { // fix promotion animation
                const chess2 = new Chess(); // new chess instance to no break old one
                chess2.load(FENpos);
                chess2.remove(lastMove.to);
                chess2.remove(lastMove.from);
                chess2.put({ type: 'p', color: chess.turn() }, lastMove.to);
                cg.set({ animation: { enabled: false} })
                cg.set({
                    fen: chess2.fen(),
                });
                chess2.remove(lastMove.to);
                chess2.put({ type: 'p', color: chess.turn() }, lastMove.from);
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

            if (expectedLine[count-1]?.notation?.notation === lastMove.san) {
            if (true) {
                count--
                expectedMove = expectedLine[count];
                if (count === 0) {
                let parentOfChild = findParent(parsedPGN.moves, expectedLine);
                if (parentOfChild) {
                    for (var i = 0; i < 2; i++) {
                    parentOfChild = findParent(parsedPGN.moves, parentOfChild.parent);

                    };
                    expectedLine = parentOfChild.parent;
                    count = parentOfChild.key;
                    expectedMove = expectedLine[count];
                }
                }
            }
            }
            if (count == 0) {
            pgnState = true; // needed for returning to first move from variation
            drawArrows(cg, chess);
            } else if (expectedLine[count-1].notation.notation == getLastMove(chess).san) {
            pgnState = true; // inside PGN
            drawArrows(cg, chess);
            }
        }
        };
        var navForward = function() { // Move Forward in PGN
        const chess2 = new Chess(); // second chess intance for promotion handling animation
        if (count == 0) { // handles for when board undone to first move
            const lastMove = getLastMove(chess);
            if (!lastMove) { // this must be the beginning of the PGN and not simply the start of a variation
            pgnState = true;
            expectedMove = expectedLine[count];
            PGNnavigator(cg, chess, null, chess2);
            }
        } else if (expectedLine[count]?.notation) {
            const lastMove = getLastMove(chess);
            if ((expectedLine[count-1]?.notation?.notation == lastMove.san)) {
            // checks if last move made was part of PGN
            expectedMove = expectedLine[count];
            PGNnavigator(cg, chess, null, chess2);
            }
        }
        }
        var copyFen = function() { //copy FEN to clipboard
        let textarea = document.createElement("textarea");
        textarea.value = chess.fen();
        // Make the textarea invisible and off-screen
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            const audio = document.getElementById("myAudio");
            audio.src = "_computer-mouse-click.mp3"
            audio.play();
            return true;
        } catch (err) {
            const audio = document.getElementById("myAudio");
            audio.src = "_Error.mp3"
            audio.play();
            console.error('Failed to copy text using execCommand:', err);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
        }

        // handle event listeners for buttons
        document.querySelector("#resetBoard").addEventListener('click', resetBoard);
        document.querySelector("#navBackward").addEventListener('click', navBackward);
        document.querySelector("#navForward").addEventListener('click', navForward);
        document.querySelector("#rotateBoard").addEventListener('click', rotateBoard);
        document.querySelector("#copyFen").addEventListener('click', copyFen);
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
        cg.set({
            movable: {
            events: {
                after: playOtherSide(cg, chess)
            }
            }
        });
        if (chess.inCheck() == true) {
        cg.set({
            turnColor: toColor(chess),
            check: true,
        });
        }
        if (chess.isGameOver() == false && flipBoard == 'true') {
        setTimeout(() => {
            if (expectedMove?.variations.length > 0 && acceptVariations == 'true') {
                const moveVar = Math.floor(Math.random() * (expectedMove.variations.length + 1));
                if (moveVar == expectedMove.variations.length) {
                } else {
                count = 0;
                expectedLine = expectedMove.variations[moveVar];
                expectedMove = expectedLine[0];
                }
            }

            chess.move(expectedMove.notation.notation);
            const lastMoveAi = getLastMove(chess);
            changeAudio(lastMoveAi);
            cg.set({
                fen: chess.fen(),
                movable: {
                    dests: toDests(chess),
                }
            });

                cg.set({
                turnColor: toColor(chess),
                check: chess.inCheck()
                });
                cg.set({ lastMove: [lastMoveAi.from, lastMoveAi.to] });
            count++;
            expectedMove = expectedLine[count];
            cg.playPremove();
            drawArrows(cg, chess);
        }, 200);
        } else {
        drawArrows(cg, chess);
        }
        return cg;

    
    }

}


let vh = 12;

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

    setTimeout(() => {
    positionPromoteOverlay();
    }, 200);
}

if (muteAudio == 'true') {
    const audioElement = document.getElementById("myAudio");
    audioElement.muted = true;
}

loadElements();
