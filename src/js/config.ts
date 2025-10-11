import { Chess, DEFAULT_POSITION } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';
import type { PgnGame, PgnMove } from '@mliebelt/pgn-types';
import { Chessground } from 'chessground';
import type { Config, State, ErrorTrack, CustomPgnGame, BoardModes } from './types';
import { toColor, toDests, handlePuzzleComplete } from './chessFunctions';
import type { MirrorState } from './mirror';
import { augmentPgnTree, highlightCurrentMove, isEndOfLine } from './pgnViewer';
import { drawArrows } from './arrows';
import { moveAudio } from './audio';
import { setButtonsDisabled } from './toolbox';
import { startAnalysis } from './handleStockfish';
import type { PgnPath } from './pgnViewer';

// --- Type Guards ---
// boardMode
function isBoardMode(mode: string): mode is BoardModes {
    const boardModes = ['Viewer', 'Puzzle'];
    const modeCheck = boardModes.includes(mode);
    return modeCheck;
}
// errorTrack
function isSolvedMode(solvedState: boolean | string): solvedState is ErrorTrack {
    if (typeof solvedState === 'boolean') return solvedState;
    const solvedModes = ['correct', 'correctTime'];
    const modeCheck = solvedModes.includes(solvedState);
    return modeCheck;
}
// mirrorState
function isMirrorState(mirrorState: string): mirrorState is MirrorState {
    const mirrorStates = ["original", "original_mirror", "invert", "invert_mirror"];
    const mirrorStateCheck = mirrorStates.includes(mirrorState);
    return mirrorStateCheck;
}
// PgnGame
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPgnGame(pgn: any): pgn is PgnGame {
    return pgn && Array.isArray(pgn.moves);
}

function initializePgnData(): CustomPgnGame {
    const parsed = state.parsedPGN;

    if (!isPgnGame(parsed)) {
        console.error("Invalid PGN data provided.");
        return { moves: [] };
    }
    if (parsed.tags) state.startFen = parsed.tags.FEN
    state.cg.set({ fen: state.startFen });
    augmentPgnTree(parsed.moves as PgnMove[]);

    return parsed as unknown as CustomPgnGame;
}

// --- URL Parameter Helper ---
const urlParams = new URLSearchParams(window.location.search);

function getUrlParam<T>(name: string, defaultValue: T): string | T {
    const value = urlParams.get(name);
    return value !== null ? value : defaultValue;
}
const cgwrap = document.getElementById('board') as HTMLDivElement;
// --- Configuration ---
export const config: Config = {
    pgn: getUrlParam("PGN", `[Event "?"]
    [Site "?"]
    [Date "2023.02.13"]
    [Round "?"]
    [White "White"]
    [Black "Black"]
    [Result "*"]
    [FEN "r1b1k1nN/p1pp3p/2n5/1p1B4/3bP1pq/5p2/PPP3PP/RNBQ1K1R w q - 0 11"]
    [SetUp "1"]

    11. g3 Qh3+ {EV: 93.8%, N: 99.68% of 13.8k} 12. Ke1 {EV: 5.5%, N: 100.00% of
        31.4k} Qg2 {EV: 95.4%, N: 98.09% of 54.1k} 13. Rf1 {EV: 4.8%, N: 73.44% of 110k}
        Ba6 {EV: 96.4%, N: 97.11% of 116k} *`),
    ankiText: getUrlParam("userText", null),
    frontText: getUrlParam("frontText", 'true') === 'true',
    muteAudio: getUrlParam("muteAudio", 'false') === 'true',
    showDests: getUrlParam("showDests", 'true') === 'true',
    singleClickMove: getUrlParam("singleClickMove", 'true') === 'true',
    handicap: parseInt(getUrlParam("handicap", '1'), 10),
    strictScoring: getUrlParam("strictScoring", 'false') === 'true',
    acceptVariations: getUrlParam("acceptVariations", 'true') === 'true',
    disableArrows: getUrlParam("disableArrows", 'false') === 'true',
    flipBoard: getUrlParam("flip", 'false') === 'true',
    boardMode: 'Puzzle',
    background: getUrlParam("background", "#2C2C2C"),
    mirror: getUrlParam("mirror", 'true') === 'true',
    randomOrientation: getUrlParam("randomOrientation", 'false') === 'true',
    autoAdvance: getUrlParam("autoAdvance", 'false') === 'true',
    handicapAdvance: getUrlParam("handicapAdvance", 'false') === 'true',
    timer: parseInt(getUrlParam("timer", '4'), 10) * 1000,
    increment: parseInt(getUrlParam("increment", '2'), 10) * 1000,
    timerAdvance: getUrlParam("timerAdvance", 'false') === 'true',
    timerScore: getUrlParam("timerScore", 'false') === 'true',
    analysisTime: parseInt(getUrlParam("analysisTime", '4'), 10) * 1000,
    animationTime: parseInt(getUrlParam("animationTime", '200'), 10),
};
(function setBoardMode() {
    const mode = getUrlParam("boardMode", "Viewer");
    if (mode && isBoardMode(mode)) config.boardMode = mode;
})();

// --- Global State ---
export const state: State = {
    startFen: DEFAULT_POSITION,
    boardRotation: "black",
    playerColour: "white",
    opponentColour: "black",
    solvedColour: config.timer ? "#2CBFA7" : "limegreen",
    errorTrack: false,
    chessGroundShapes: [],
    errorCount: 0,
    puzzleTime: config.timer,
    navTimeout: null,
    isStockfishBusy: false,
    stockfishRestart: false,
    analysisToggledOn: false,
    pgnPath: [],
    pgnPathMap: new Map(),
    lastMove: null,
    mirrorState: null,
    cgwrap: cgwrap,
    cg: Chessground(cgwrap, {
        premovable: {
            enabled: true,
        },
        movable: {
            free: false,
            showDests: config.showDests,
        },
        highlight: {
            check: true,
            lastMove: true
        },
        drawable: {
            enabled: true,
            brushes: {
                stockfish: { key: 'stockfish', color: '#e5e5e5', opacity: 1, lineWidth: 7 },
                stockfinished: { key: 'stockfinished', color: 'white', opacity: 1, lineWidth: 7 },
                mainLine: { key: 'mainLine', color: '#66AA66', opacity: 1, lineWidth: 9 },
                altLine: { key: 'altLine', color: '#66AAAA', opacity: 1, lineWidth: 9 },
                blunderLine: { key: 'blunderLine', color: '#b31010', opacity: 1, lineWidth: 7 },
                // default
                green:   { key: 'green', color: 'green',   opacity: 0.7, lineWidth: 9 },
                red:     { key: 'red',   color: 'red',     opacity: 0.7, lineWidth: 9 },
                blue:    { key: 'blue',  color: 'blue',    opacity: 0.7, lineWidth: 9 },
                yellow:  { key: 'yellow',color: 'yellow',  opacity: 0.7, lineWidth: 9 },
            },
        },
    }),
    chess: new Chess(),
    parsedPGN: parse(config.pgn, { startRule: "game" }) as unknown as CustomPgnGame,
    delayTime: config.animationTime + 100,
};
initializePgnData();

// -- state proxy to handle board updates --

const stateHandler = {
    set(target: State, property: keyof State, value: PgnPath, receiver: State) {
        const pathKey = value.join(',');
        const pathMove = state.pgnPathMap.get(pathKey);

        if (property === 'pgnPath' &&
            (pathMove || !value.length) &&
            !(!state.pgnPath.join(',').length && !value.length)
        ) {
            const lastMove = state.lastMove;

            if (!value.length) {
                setButtonsDisabled(['back', 'reset'], true);
                state.chess.reset();
                state.chess.load(state.startFen);
                state.lastMove = null;
            } else {
                setButtonsDisabled(['back', 'reset'], false);
            }
            if (pathMove) {
                state.chess.load(pathMove.before)
                state.chess.move(pathMove.notation.notation)
                moveAudio(pathMove);
                state.cg.set({ lastMove: [pathMove.from, pathMove.to] })
                state.lastMove = pathMove;
            }
            // --- Promotion animations ---
            if (pathMove?.notation.promotion &&
                (lastMove?.after === pathMove?.before ||
                state.startFen === pathMove?.before && !lastMove)
            ) {
                // nav forward promote
                const tempChess = new Chess(pathMove.before);
                tempChess.remove(pathMove.to);
                state.cg.set({ fen: tempChess.fen() });
                state.cg.move( pathMove.from, pathMove.to );
                setTimeout(() => {
                    state.cg.set({ animation: { enabled: false} })
                    state.cg.set({
                        fen: state.chess.fen(),
                    });
                    state.cg.set({ animation: { enabled: true} })
                    state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
                }, config.animationTime)
            } else if (lastMove?.notation.promotion &&
                (lastMove?.before === pathMove?.after ||
                state.startFen === lastMove?.before && !pathMove)
            ) {
                // nav backwards promote
                const tempChess = new Chess(lastMove.after);
                tempChess.remove(lastMove.to);
                tempChess.put({ type: 'p', color: lastMove.turn }, lastMove.to);

                state.cg.set({ animation: { enabled: false} })
                state.cg.set({ fen: tempChess.fen() });
                state.cg.set({ animation: { enabled: true} })

                state.cg.set({
                    fen: state.chess.fen(),
                });
            } else {
                // animate board change
                state.cg.set({ fen: state.chess.fen() });
            }
            highlightCurrentMove(value);
            state.cg.set({
                check: state.chess.inCheck(),
                turnColor: toColor(),
                movable: {
                    color: config.boardMode === 'Puzzle' ? state.playerColour : toColor(),
                    dests: toDests()
                },
            });
            drawArrows(value);
            const endOfLineCheck = isEndOfLine(value);
            if (endOfLineCheck) {
                if (config.boardMode === 'Puzzle') {
                    handlePuzzleComplete();
                } else {
                    state.chessGroundShapes = [];
                }
            }
            setButtonsDisabled(['forward'], endOfLineCheck);
            startAnalysis(config.analysisTime);

            return Reflect.set(target, property, value, receiver);
        }
        return Reflect.set(target, property, state.pgnPath, receiver);
    }
};

// proxy for state
export const stateProxy = new Proxy(state, stateHandler);


// --- TypeGuards ---

(function setSolvedMode() {
    const solvedMode = getUrlParam("errorTrack", false);
    if (solvedMode && isSolvedMode(solvedMode)) state.errorTrack = solvedMode;
})();
(function setPgnPath() {
    const pgnPath = getUrlParam("pgnPath", null);
    state.pgnPath = pgnPath ? pgnPath.split(',') as PgnPath : [];
})();
(function setMirrorState() {
    const mirrorState = getUrlParam("mirrorState", null);
    if (mirrorState && isMirrorState(mirrorState)) state.mirrorState = mirrorState;
})();

