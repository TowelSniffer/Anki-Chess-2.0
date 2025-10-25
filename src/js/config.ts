import { Chess, DEFAULT_POSITION } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';
import type { PgnMove } from '@mliebelt/pgn-types';
import { Chessground } from 'chessground';
import type { Config, State, ErrorTrack, CustomPgnGame, BoardModes } from './types';
import { handlePuzzleComplete, animateBoard } from './chessFunctions';
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
function isSolvedMode(solvedState: null | string): solvedState is ErrorTrack {
    if (!solvedState) return false;
    const solvedModes = ['correct', 'correctTime', 'incorrect'];
    const modeCheck = solvedModes.includes(solvedState);
    return modeCheck;
}
// mirrorState
function isMirrorState(mirrorState: string): mirrorState is MirrorState {
    const mirrorStates = ["original", "original_mirror", "invert", "invert_mirror"];
    const mirrorStateCheck = mirrorStates.includes(mirrorState);
    return mirrorStateCheck;
}

function initializePgnData(): void {
    const pathKey = state.pgnPath.join(',');
    const moveTrack = state.pgnPathMap.get(pathKey);
    state.chess.load(moveTrack?.after ?? state.startFen);
    if (config.boardMode === 'Viewer') {
        state.cg.set({ animation: { enabled: false} })
        state.cg.set({ fen: moveTrack?.after ?? state.startFen });
        state.cg.set({ animation: { enabled: true} })
        if (state.pgnPath.length && moveTrack) {
            setButtonsDisabled(['back', 'reset'], false);
            state.lastMove = moveTrack;
        };
        const endOfLineCheck = isEndOfLine(state.pgnPath);
        setButtonsDisabled(['forward'], endOfLineCheck);
        drawArrows(state.pgnPath);
    }
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
    [FEN "4rrk1/1ppq1ppp/p1np1n2/4P3/3p1P2/P2B2QP/1PPB2P1/4RRK1 b - - 0 14"]
    [SetUp "1"]

    14... dxe5 15. fxe5 {EV: 94.7%} Nd5 {EV: 5.2%} (15... Nh5 {EV: 3.4%} 16. Qg4
    {EV: 98.6%} Qxg4 {EV: 1.3%} 17. hxg4 {EV: 98.8%} Ng3 {EV: 1.2%} 18. Rf3 {EV:
        99.2%}) 16. Bh6 {EV: 95.3%} *
    `),
    ankiText: getUrlParam("userText", null),
    frontText: getUrlParam("frontText", 'true') === 'true',
    muteAudio: getUrlParam("muteAudio", 'false') === 'true',
    showDests: getUrlParam("showDests", 'true') === 'true',
    singleClickMove: getUrlParam("singleClickMove", 'true') === 'true',
    handicap: parseInt(getUrlParam("handicap", '1'), 10),
    strictScoring: getUrlParam("strictScoring", 'false') === 'true',
    acceptVariations: getUrlParam("acceptVariations", 'true') === 'true',
    disableArrows: getUrlParam("disableArrows", 'false') === 'true',
    flipBoard: getUrlParam("flip", 'true') === 'true',
    boardMode: 'Puzzle',
    background: getUrlParam("background", "var(--color-bg-secondary)"),
    mirror: getUrlParam("mirror", 'true') === 'true',
    randomOrientation: getUrlParam("randomOrientation", 'false') === 'true',
    autoAdvance: getUrlParam("autoAdvance", 'false') === 'true',
    handicapAdvance: getUrlParam("handicapAdvance", 'false') === 'true',
    timer: parseInt(getUrlParam("timer", '10'), 10) * 1000,
    increment: parseInt(getUrlParam("increment", '1'), 10) * 1000,
    timerAdvance: getUrlParam("timerAdvance", 'false') === 'true',
    timerScore: getUrlParam("timerScore", 'false') === 'true',
    analysisTime: parseInt(getUrlParam("analysisTime", '4'), 10) * 1000,
    animationTime: parseInt(getUrlParam("animationTime", '200'), 10),
};
(function setBoardMode() {
    const mode = getUrlParam("boardMode", "Puzzle");
    if (mode && isBoardMode(mode)) config.boardMode = mode;
})();

const parsed = parse(config.pgn, { startRule: "game" }) as unknown as CustomPgnGame;

// --- Global State ---
export const state: State = {
    startFen: parsed.tags?.FEN ?? DEFAULT_POSITION,
    boardRotation: "black",
    playerColour: "white",
    opponentColour: "black",
    solvedColour: config.timer ? "#2CBFA7" : "limegreen",
    errorTrack: null,
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
        fen: parsed.tags?.FEN ?? DEFAULT_POSITION,
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
    parsedPGN: parsed,
    delayTime: config.animationTime + 100,
};

augmentPgnTree(state.parsedPGN.moves as PgnMove[]);
// --- TypeGuards ---

(function setSolvedMode() {
    const solvedMode = getUrlParam("errorTrack", null);
    if (solvedMode && isSolvedMode(solvedMode)) state.errorTrack = solvedMode;
})();
(function setPgnPath() {
    const pgnPath = getUrlParam("pgnPath", null);
    const result = pgnPath?.split(',').map(item => {
        const num = Number(item);
        return isNaN(num) ? 'v' : num;
    });
    state.pgnPath = result ? result : [];
})();
(function setMirrorState() {
    const mirrorState = getUrlParam("mirrorState", null);
    if (mirrorState && isMirrorState(mirrorState)) state.mirrorState = mirrorState;
})();

// -- state proxy to handle board updates --

const stateHandler = {
    set(target: State, property: keyof State, value: PgnPath, receiver: State) {
        const pathKey = value.join(',');
        const pathMove = state.pgnPathMap.get(pathKey) ?? null;

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
                state.chess.load(pathMove.after)
                moveAudio(pathMove);
            };
            setTimeout(() => {
                // timeout is needed here for some animations. dont know why
                animateBoard(lastMove, pathMove);
            }, 2)
            startAnalysis(config.analysisTime);
            drawArrows(value);
            highlightCurrentMove(value);


            const endOfLineCheck = isEndOfLine(value);
            if (endOfLineCheck) {
                if (config.boardMode === 'Puzzle') {
                    handlePuzzleComplete();
                } else {
                    state.chessGroundShapes = [];
                }
            }
            setButtonsDisabled(['forward'], endOfLineCheck);

            const { chess: _chess, cg: _cg, cgwrap: _cgwrap, ...stateCopy } = state;
            stateCopy.pgnPath = value;
            window.parent.postMessage(stateCopy, '*');

            return Reflect.set(target, property, value, receiver);
        }
        return Reflect.set(target, property, state.pgnPath, receiver);
    }
};

// proxy for state
export const stateProxy = new Proxy(state, stateHandler);

initializePgnData();



