import { Chessground } from 'chessground';
import { Chess, Move } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';
import { PgnReaderMove, PgnGame } from '@mliebelt/pgn-types';
import type { Color, Key } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import { assignMirrorState, mirrorPgnTree, mirrorFen, checkCastleRights, MirrorState } from './mirror';

// --- Type Definitions ---
export type Api = ReturnType<typeof Chessground>;

export type CustomPgnMove = Omit<PgnReaderMove, 'pgnPath' | `variations`> & {
    pgnPath?: (string | number)[];
    variations?: CustomPgnMove[][];
};
export type CustomPgnGame = Omit<PgnGame, 'moves'> & {
    moves: CustomPgnMove[];
};

// --- Chesground Shapes ---
enum ShapeFilter {
    All = "All",
    Stockfish = "Stockfish",
    PGN = "PGN",
    Nag = "Nag",
    Drawn = "Drawn",
}

export interface CustomShape extends DrawShape {
    san?: string
}

export interface NagData {
    [nagKey: string]: string[];
}

type booleanValues = "true" | "false" | boolean | null;
interface Config {
    pgn: string;
    fontSize: number;
    ankiText: string | null;
    frontText: boolean;
    muteAudio: boolean;
    showDests: boolean;
    handicap: number;
    strictScoring: boolean;
    acceptVariations: boolean;
    disableArrows: boolean;
    flipBoard: boolean;
    boardMode: 'Viewer' | 'Puzzle';
    background: string;
    mirror: boolean;
    randomOrientation: boolean;
    autoAdvance: boolean;
    handicapAdvance: boolean;
    timer: number;
    increment: number;
    timerAdvance: boolean;
    timerScore: boolean;
    analysisTime: number;
}

interface State {
    ankiFen: string;
    boardRotation: Color;
    playerColour: Color;
    opponentColour: Color;
    solvedColour: string;
    errorTrack: "correct" | "correctTime" | booleanValues;
    count: number;
    pgnState: boolean;
    chessGroundShapes: CustomShape[];
    expectedLine: CustomPgnMove[];
    expectedMove: CustomPgnMove | null;
    lastMove: Move | false;
    errorCount: number;
    promoteChoice: 'q' | 'r' | 'b' | 'n';
    promoteAnimate: boolean;
    debounceCheck: boolean;
    navTimeout: number | null;
    isStockfishBusy: boolean;
    analysisFen: string | booleanValues;
    analysisToggledOn: boolean;
    pgnPath: string | (string | number)[] | null;
    mirrorState: MirrorState | null;
    blunderNags: string[];
    puzzleComplete: string | boolean;
}

const shapeArray: Record<ShapeFilter, string[]> = {
    [ShapeFilter.All]: ["stockfish", "stockfinished", "mainLine", "altLine", "blunderLine", "moveType"],
    [ShapeFilter.Stockfish]: ["stockfish", "stockfinished"],
    [ShapeFilter.PGN]: ["mainLine", "altLine", "blunderLine", "moveType"],
    [ShapeFilter.Nag]: ["moveType"],
    [ShapeFilter.Drawn]: ["userDrawn"],
};

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
    [Date "2025.02.24"]
    [Round "?"]
    [White "White"]
    [Black "Black"]
    [Result "*"]
    [FEN "r7/p1pnkppp/4b3/2p5/N2pP3/1P3P2/P1P1B1PP/2KR4 w - - 0 17"]
    [SetUp "1"]

    17. Bb5 Kd6! {EV: 14.8%, N: 84.79% of 315k} (17... c6 {EV: 14.7%, N: 9.92% of
        315k} 18. Bxc6 {EV: 84.9%, N: 98.99% of 49.4k} Rc8 {EV: 15.6%, N: 98.06% of
            58.7k} 19. Bb5 {EV: 80.2%, N: 7.41% of 483k} (19. Bxd7 {EV: 83.9%, N: 91.06% of
                483k} Bxd7 {EV: 16.3%, N: 98.49% of 447k}) Ne5 {EV: 20.5%, N: 92.74% of 140k})
    18. c3 {EV: 83.9%, N: 95.46% of 62.5k} c6 {EV: 16.2%, N: 92.94% of 58.0k} 19.
    Ba6 {EV: 86.3%, N: 94.71% of 572k} Nb6 {EV: 17.1%, N: 79.75% of 2.8k} *`),
    fontSize: parseInt(getUrlParam("fontSize", '16') as string, 10),
    ankiText: getUrlParam("userText", null),
    frontText: getUrlParam("frontText", 'false') === 'true',
    muteAudio: getUrlParam("muteAudio", 'false') === 'true',
    showDests: getUrlParam("showDests", 'true') === 'true',
    handicap: parseInt(getUrlParam("handicap", '1') as string, 10),
    strictScoring: getUrlParam("strictScoring", 'false') === 'true',
    acceptVariations: getUrlParam("acceptVariations", 'true') === 'true',
    disableArrows: getUrlParam("disableArrows", 'false') === 'true',
    flipBoard: getUrlParam("flip", 'true') === 'true',
    boardMode: getUrlParam("boardMode", 'Viewer') as 'Viewer' | 'Puzzle',
    background: getUrlParam("background", "#2C2C2C") as string,
    mirror: getUrlParam("mirror", 'true') === 'true',
    randomOrientation: getUrlParam("randomOrientation", 'false') === 'true',
    autoAdvance: getUrlParam("autoAdvance", 'false') === 'true',
    handicapAdvance: getUrlParam("handicapAdvance", 'false') === 'true',
    timer: parseInt(getUrlParam("timer", '4') as string, 10) * 1000,
    increment: parseInt(getUrlParam("increment", '2') as string, 10) * 1000,
    timerAdvance: getUrlParam("timerAdvance", 'false') === 'true',
    timerScore: getUrlParam("timerScore", 'false') === 'true',
    analysisTime: parseInt(getUrlParam("analysisTime", '4') as string, 10) * 1000,
};

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

const htmlElement: HTMLElement = document.documentElement;
const chess = new Chess();
// gloabal chessground board
let cgwrap: HTMLDivElement | null = null;

function waitForElement<T extends Element>(selector: string): Promise<T> {
    return new Promise(resolve => {
        const element = document.querySelector<T>(selector);
        if (element) {
            return resolve(element);
        }
        const observer = new MutationObserver(() => {
            const element = document.querySelector<T>(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
}

// --- HTML defs ---
export const btn = {
    get reset() { return document.querySelector<HTMLButtonElement>("#resetBoard"); },
    get back() { return document.querySelector<HTMLButtonElement>("#navBackward"); },
    get forward() { return document.querySelector<HTMLButtonElement>("#navForward"); },
    get copy() { return document.querySelector<HTMLButtonElement>("#copyFen"); },
    get stockfish() { return document.querySelector<HTMLButtonElement>("#stockfishToggle"); },
    get flip() { return document.querySelector<HTMLButtonElement>("#rotateBoard"); },
};

export async function setupCgwrap(): Promise<HTMLDivElement> {
    const element = await waitForElement('.cg-wrap');
    return element as HTMLDivElement;
}

export { parsedPGN, config, state, cg, chess, htmlElement, ShapeFilter, shapeArray }
