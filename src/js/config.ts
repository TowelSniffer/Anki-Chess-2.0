import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';
import { Config, State, Api, booleanValues, CustomPgnGame } from './types';
import { waitForElement } from './toolbox';
import { assignMirrorState, mirrorPgnTree, mirrorFen, checkCastleRights, MirrorState } from './mirror';

// --- URL Parameter Helper ---
const urlParams = new URLSearchParams(window.location.search);

function getUrlParam<T>(name: string, defaultValue: T): string | T {
    const value = urlParams.get(name);
    return value !== null ? value : defaultValue;
}

// --- Configuration ---
const config: Config = {
    pgn: getUrlParam("PGN", `[Event "?"]
    [Site "?"]
    [Date "2025.09.22"]
    [Round "?"]
    [White "White"]
    [Black "Black"]
    [Result "*"]
    [FEN "3rr3/1p2ppkp/p2p2p1/2pP4/2P2P2/PP2R1P1/7P/4R1K1 b - - 1 29"]
    [SetUp "1"]

    29... Rd7 30. Rxe7 (30. g4 h5 31. gxh5 gxh5 32. h4 Kh6 (32... f6) 33. f5) Rexe7
    31. Rxe7 Rxe7 (31... g5) *
    `),
    fontSize: parseInt(getUrlParam("fontSize", '16') as string, 10),
    ankiText: getUrlParam("userText", null),
    frontText: getUrlParam("frontText", 'true') === 'true',
    muteAudio: getUrlParam("muteAudio", 'false') === 'true',
    showDests: getUrlParam("showDests", 'true') === 'true',
    handicap: parseInt(getUrlParam("handicap", '1') as string, 10),
    strictScoring: getUrlParam("strictScoring", 'false') === 'true',
    acceptVariations: getUrlParam("acceptVariations", 'true') === 'true',
    disableArrows: getUrlParam("disableArrows", 'false') === 'true',
    flipBoard: getUrlParam("flip", 'true') === 'true',
    boardMode: getUrlParam("boardMode", 'Puzzle') as 'Viewer' | 'Puzzle',
    background: getUrlParam("background", "#2C2C2C") as string,
    mirror: getUrlParam("mirror", 'false') === 'true',
    randomOrientation: getUrlParam("randomOrientation", 'false') === 'true',
    autoAdvance: getUrlParam("autoAdvance", 'false') === 'true',
    handicapAdvance: getUrlParam("handicapAdvance", 'false') === 'true',
    timer: parseInt(getUrlParam("timer", '4') as string, 10) * 1000,
    increment: parseInt(getUrlParam("increment", '2') as string, 10) * 1000,
    timerAdvance: getUrlParam("timerAdvance", 'false') === 'true',
    timerScore: getUrlParam("timerScore", 'false') === 'true',
    analysisTime: parseInt(getUrlParam("analysisTime", '4') as string, 10) * 1000,
    animationTime: parseInt(getUrlParam("animationTime", '200') as string, 10),
};

const delayTime = config.animationTime + 100;
const parsedPGN = parse(config.pgn, { startRule: "game" }) as unknown as CustomPgnGame;

// --- Global State ---
const state: State = {
    ankiFen: parsedPGN.tags?.FEN ? parsedPGN.tags.FEN as string : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    boardRotation: "black",
    playerColour: "white",
    opponentColour: "black",
    solvedColour: "limegreen",
    errorTrack: getUrlParam("errorTrack", null) as "correct" | "correctTime" | booleanValues,
    count: 0,
    pgnState: true,
    chessGroundShapes: [],
    expectedLine: [],
    expectedMove: null,
    lastMove: false,
    errorCount: 0,
    promoteChoice: 'q',
    promoteAnimate: true,
    debounceCheck: false,
    navTimeout: null,
    isStockfishBusy: false,
    analysisFen: null,
    analysisToggledOn: false,
    pgnPath: getUrlParam("pgnPath", null),
    mirrorState: getUrlParam("mirrorState", null) as MirrorState | null,
    blunderNags: ['$2', '$4', '$6', '$9'],
    puzzleComplete: false,
};
// Mirror PGN if applicable
if (config.mirror && !checkCastleRights(state.ankiFen)) {
    if (!state.mirrorState) {
        state.mirrorState = assignMirrorState();
    }
    window.parent.postMessage(state, '*');
    mirrorPgnTree(parsedPGN.moves, state.mirrorState);
    state.ankiFen = mirrorFen(state.ankiFen, state.mirrorState);
}

// --- Global Variables & Initialization ---
const boardElement = document.getElementById('board');
if (!boardElement) {
    throw new Error("Fatal: Board element with id 'board' not found in the DOM.");
}

const cg: Api = Chessground(boardElement, {
    fen: state.ankiFen,
    premovable: {
        enabled: true,
    },
    movable: {
        free: false,
        showDests: config.showDests,
    },
    highlight: { check: true },
    drawable: {
        enabled: true,
        brushes: {
            stockfish: { key: 'stockfish', color: '#e5e5e5', opacity: 1, lineWidth: 7 },
            stockfinished: { key: 'stockfinished', color: 'white', opacity: 1, lineWidth: 7 },
            mainLine: { key: 'mainLine', color: '#66AA66', opacity: 1, lineWidth: 9 },
            altLine: { key: 'altLine', color: '#66AAAA', opacity: 1, lineWidth: 9 },
            blunderLine: { key: 'blunderLine', color: '#b31010', opacity: 1, lineWidth: 9 },
            moveType: { key: 'moveType', color: 'transparant',   opacity: 0.7, lineWidth: 9 },
            // default
            green:   { key: 'green', color: 'green',   opacity: 0.7, lineWidth: 9 },
            red:     { key: 'red',   color: 'red',     opacity: 0.7, lineWidth: 9 },
            blue:    { key: 'blue',  color: 'blue',    opacity: 0.7, lineWidth: 9 },
            yellow:  { key: 'yellow',color: 'yellow',  opacity: 0.7, lineWidth: 9 },
        },
    },
});
const shapePriority = ['mainLine', 'altLine', 'blunderLine', 'stockfinished', 'stockfish'];

const htmlElement: HTMLElement = document.documentElement;
const chess = new Chess();
// gloabal chessground board
let cgwrap: HTMLDivElement | null = null;

// --- HTML defs ---
export const btn = {
    get reset() { return document.querySelector<HTMLButtonElement>("#resetBoard"); },
    get back() { return document.querySelector<HTMLButtonElement>("#navBackward"); },
    get forward() { return document.querySelector<HTMLButtonElement>("#navForward"); },
    get copy() { return document.querySelector<HTMLButtonElement>("#copyFen"); },
    get stockfish() { return document.querySelector<HTMLButtonElement>("#stockfishToggle"); },
    get flip() { return document.querySelector<HTMLButtonElement>("#rotateBoard"); },
};

export async function defineDynamicElement(dynamicElement: string): Promise<HTMLDivElement> {
    const element = await waitForElement(dynamicElement);
    return element as HTMLDivElement;
}

export { parsedPGN, config, state, cg, chess, htmlElement, shapePriority, delayTime }
