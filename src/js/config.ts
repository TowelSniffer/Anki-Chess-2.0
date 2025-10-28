import { Chess, DEFAULT_POSITION } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';
import { Chessground } from 'chessground';
import type { Config, State, ErrorTrack, CustomPgnGame, BoardModes, MirrorState } from './types';
import { checkCastleRights, assignMirrorState, mirrorPgnTree, mirrorFen } from './mirror';

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
function isMirrorState(mirrorState: string | null): mirrorState is MirrorState {
    if (!mirrorState) return false;
    const mirrorStates = ["original", "original_mirror", "invert", "invert_mirror"];
    const mirrorStateCheck = mirrorStates.includes(mirrorState);
    return mirrorStateCheck;
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
    [FEN "q4rk1/p4ppp/b7/8/Pp6/1n1P2P1/1N2QP1P/R3R1K1 w - - 1 21"]
    [SetUp "1"]

    21. Rad1 Nd4 {EV: 92.7%, N: 99.32% of 78.6k} 22. Qe4 {EV: 8.0%, N: 93.34% of
        125k} Nf3+ {EV: 92.2%, N: 99.46% of 230k} 23. Kf1 {EV: 8.2%, N: 96.48% of 422k}
        Nxh2+ {EV: 92.5%, N: 96.74% of 510k} 24. Kg1 {EV: 8.1%, N: 91.63% of 520k} Nf3+
        {EV: 92.1%, N: 99.09% of 496k} 25. Kf1 {EV: 8.1%, N: 97.24% of 511k} Nxe1 {EV:
            92.4%, N: 97.58% of 602k} *
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
    timer: parseInt(getUrlParam("timer", '4'), 10) * 1000,
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

const mirrorState = config.boardMode === "Puzzle" ? assignMirrorState() : getUrlParam("mirrorState", null);

if (parsed.tags?.FEN && !checkCastleRights(parsed.tags.FEN) && isMirrorState(mirrorState)
) {
    parsed.tags.FEN = mirrorFen(parsed.tags.FEN, mirrorState)
    mirrorPgnTree(parsed.moves, mirrorState)
}

// --- Global State ---
export const state: State = {
    startFen: parsed.tags?.FEN ?? DEFAULT_POSITION,
    boardRotation: "black",
    playerColour: "white",
    opponentColour: "black",
    solvedColour: null,
    errorTrack: null,
    chessGroundShapes: [],
    errorCount: 0,
    puzzleTime: config.timer,
    puzzleComplete: false,
    navTimeout: null,
    isStockfishBusy: false,
    stockfishRestart: false,
    analysisToggledOn: false,
    pgnPath: [],
    pgnPathMap: new Map(),
    lastMove: null,
    mirrorState: isMirrorState(mirrorState) ? mirrorState : null,
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
        animation: {
            enabled: false, // will manulally enable later to prevent position load animation
            duration: config.animationTime,
        },
        drawable: {
            enabled: true,
            brushes: {
                stockfish: { key: 'stockfish', color: '#e5e5e5', opacity: 1, lineWidth: 7 },
                stockfinished: { key: 'stockfinished', color: 'white', opacity: 1, lineWidth: 7 },
                mainLine: { key: 'mainLine', color: '#66AA66', opacity: 1, lineWidth: 9 },
                altLine: { key: 'altLine', color: '#66AAAA', opacity: 1, lineWidth: 9 },
                blunderLine: { key: 'blunderLine', color: 'var(--incorrect-color)', opacity: 1, lineWidth: 7 },
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





