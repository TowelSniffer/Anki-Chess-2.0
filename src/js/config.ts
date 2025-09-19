import { Chessground } from 'chessground';
import { Chess } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';

// --- shape filters ---
enum ShapeFilter {
    All = "All",
    Stockfish = "Stockfish",
    PGN = "PGN",
    Custom = "Custom",
}

const shapeArray: Record<ShapeFilter, string[]> = {
    [ShapeFilter.All]: ["stockfish", "stockfinished", "mainLine", "altLine", "blunderLine", "moveType"],
    [ShapeFilter.Stockfish]: ["stockfish", "stockfinished"],
    [ShapeFilter.PGN]: ["mainLine", "altLine", "blunderLine", "moveType"],
    [ShapeFilter.Drawn]: ["userDrawn"],
};

const urlParams = new URLSearchParams(window.location.search);

function getUrlParam(name, defaultValue) {
    if (urlParams.has(name)) {
        return urlParams.get(name);
    }
    return defaultValue;
}

// --- Configuration ---
const config = {
    pgn: getUrlParam("PGN", `[Event "?"]
    [Site "?"]
    [Date "2025.09.20"]
    [Round "?"]
    [White "White"]
    [Black "Black"]
    [Result "*"]

    1. e4 f5 (1... e5) (1... d5) (1... c5) (1... b5) (1... a5) (1... g5) (1... h5) *
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
    flipBoard: getUrlParam("flip", 'true') === 'true',
    boardMode: getUrlParam("boardMode", 'Puzzle'),
    background: getUrlParam("background", "#2C2C2C"),
    mirror: getUrlParam("mirror", 'true') === 'true',
    randomOrientation: getUrlParam("randomOrientation", 'false') === 'true',
    autoAdvance: getUrlParam("autoAdvance", 'false') === 'true',
    handicapAdvance: getUrlParam("handicapAdvance", 'false') === 'true',
    timer: parseInt(getUrlParam("timer", 5), 10) * 1000,
    increment: parseInt(getUrlParam("increment", 2), 10) * 1000,
    timerAdvance: getUrlParam("timerAdvance", 'false') === 'true',
    timerScore: getUrlParam("timerScore", 'false') === 'true',
    analysisTime: parseInt(getUrlParam("analysisTime", 4), 10) * 1000,
};

const parsedPGN = parse(config.pgn, { startRule: "game" });

// --- Global State ---
const state = {
    ankiFen: parsedPGN.tags.FEN ? parsedPGN.tags.FEN : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
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
    debounceTimeout: null,
    navTimeout: null,
    isStockfishBusy: false,
    analysisFen: null,
    analysisToggledOn: false,
    pgnPath: getUrlParam("pgnPath", null),
    mirrorState: getUrlParam("mirrorState", null),
    blunderNags: ['$2', '$4', '$6', '$9'],
    puzzleComplete: false,
};

// --- Global Variables ---
// default chessgrounf values
const cg = Chessground(board, {
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

const htmlElement = document.documentElement;
const chess = new Chess();

export { parsedPGN, config, state, cg, chess, htmlElement, ShapeFilter, shapeArray }
