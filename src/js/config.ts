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
    [Date "2025.02.22"]
    [Round "?"]
    [White "White"]
    [Black "Black"]
    [Result "0-1"]
    [FEN "6k1/1pQ3p1/3p4/p2P1b2/8/PP2q1PP/8/2R3K1 w - - 2 34"]
    [SetUp "1"]

    34. Kg2 {EV: 33.1%, N: 99.99% of 129k} a4 {EV: 62.7%, N: 0.12% of 3.6M} 35. b4
    {EV: 14.6%, N: 86.03% of 2.2M} Be4+ {EV: 86.0%, N: 98.72% of 1.9M} 36. Kf1 {EV:
        13.9%, N: 100.00% of 1.9M} Bd3+ {EV: 86.7%, N: 98.89% of 2.0M} 37. Kg2 {EV:
            13.2%, N: 100.00% of 2.0M} Qd2+ {EV: 91.1%, N: 79.26% of 2.0M} 38. Kg1 {EV:
                8.8%, N: 100.00% of 1.6M} Kh7 {EV: 92.4%, N: 98.22% of 1.9M} 39. g4 {EV: 7.8%,
                    N: 91.43% of 2.0M} Qf4 {EV: 95.8%, N: 86.87% of 2.1M} 0-1`),
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
    const mode = getUrlParam("boardMode", "Viewer");
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
    solvedColour: config.timer ? "var(--perfect-color)" : "var(--correct-color)",
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





