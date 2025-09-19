import { Chessground } from 'chessground';
import { Chess, Move } from 'chess.js';
import { parse, PgnGame } from '@mliebelt/pgn-parser';
import type { Api, DrawShape, Color } from 'chessground';


// --- Type Definitions ---
// Note: Ensure you have the necessary type definitions installed:
// npm install --save-dev @types/chessground

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
    boardMode: 'Viewer' | 'Practice' | 'Analysis'; // Assuming possible modes
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
    errorTrack: string | null;
    count: number;
    pgnState: boolean;
    chessGroundShapes: DrawShape[];
    expectedLine: Move[];
    expectedMove: Move | null;
    lastMove: Move | null;
    errorCount: number;
    promoteChoice: 'q' | 'r' | 'b' | 'n';
    promoteAnimate: boolean;
    debounceCheck: number | null;
    navTimeout: number | null;
    isStockfishBusy: boolean;
    analysisFen: string | null;
    analysisToggledOn: boolean;
    pgnPath: string | null;
    mirrorState: string | null;
    blunderNags: string[];
    puzzleComplete: boolean;
}

// --- Shape Filters ---
enum ShapeFilter {
    All = "All",
    Stockfish = "Stockfish",
    PGN = "PGN",
    Custom = "Custom",
    Nag = "Nag",
    Drawn = "Drawn",
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
    [Date "2025.09.20"]
    [Round "?"]
    [White "White"]
    [Black "Black"]
    [Result "*"]

    1. e4 e5 2. f4 f5 3. g4 *
    `),
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
    boardMode: getUrlParam("boardMode", 'Viewer') as 'Viewer' | 'Practice' | 'Analysis',
    background: getUrlParam("background", "#2C2C2C") as string,
    mirror: getUrlParam("mirror", 'true') === 'true',
    randomOrientation: getUrlParam("randomOrientation", 'false') === 'true',
    autoAdvance: getUrlParam("autoAdvance", 'false') === 'true',
    handicapAdvance: getUrlParam("handicapAdvance", 'false') === 'true',
    timer: parseInt(getUrlParam("timer", '2') as string, 10) * 1000,
    increment: parseInt(getUrlParam("increment", '2') as string, 10) * 1000,
    timerAdvance: getUrlParam("timerAdvance", 'false') === 'true',
    timerScore: getUrlParam("timerScore", 'false') === 'true',
    analysisTime: parseInt(getUrlParam("analysisTime", '4') as string, 10) * 1000,
};

const parsedPGN = parse(config.pgn, { startRule: "game" }) as PgnGame;

// --- Global State ---
const state: State = {
    ankiFen: parsedPGN.tags?.FEN ? parsedPGN.tags.FEN as string : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
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
    lastMove: null,
    errorCount: 0,
    promoteChoice: 'q',
    promoteAnimate: true,
    debounceCheck: null,
    navTimeout: null,
    isStockfishBusy: false,
    analysisFen: null,
    analysisToggledOn: false,
    pgnPath: getUrlParam("pgnPath", null),
    mirrorState: getUrlParam("mirrorState", null),
    blunderNags: ['$2', '$4', '$6', '$9'],
    puzzleComplete: false,
};

// --- Global Variables & Initialization ---
const boardElement = document.getElementById('board');
if (!boardElement) {
    throw new Error("Fatal: Board element with id 'board' not found in the DOM.");
}

const cg: Api = Chessground(boardElement, {
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
            green: { opacity: 0.7, lineWidth: 9 },
            red: { opacity: 0.7, lineWidth: 9 },
            blue: { opacity: 0.7, lineWidth: 9 },
            yellow: { opacity: 0.7, lineWidth: 9 },
        },
    },
});

const htmlElement: HTMLElement = document.documentElement;
const chess = new Chess();

export { parsedPGN, config, state, cg, chess, htmlElement, ShapeFilter, shapeArray }
