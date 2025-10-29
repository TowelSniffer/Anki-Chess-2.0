// src/stores/chessStore.ts
import { defineStore } from 'pinia';
import { Chess, DEFAULT_POSITION } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';

// Import your types (copy your types.ts file into the project)
import type {
    State,
    Config,
    ErrorTrack,
    CustomPgnGame,
    MirrorState,
    PgnPath,
    CustomPgnMove
} from '../ts/core/types'; // Adjust path as needed
import type { PgnMove } from '@mliebelt/pgn-types'; // Import PgnMove


// --- Helper Functions (from config.ts) ---
const urlParams = new URLSearchParams(window.location.search);
function getUrlParam<T>(name: string, defaultValue: T): string | T {
    const value = urlParams.get(name);
    return value !== null ? value : defaultValue;
}
function isBoardMode(mode: string): mode is "Viewer" | "Puzzle" {
    return ['Viewer', 'Puzzle'].includes(mode);
}
function isMirrorState(mirrorState: string | null): mirrorState is MirrorState {
    if (!mirrorState) return false;
    return ["original", "original_mirror", "invert", "invert_mirror"].includes(mirrorState);
}
function isSolvedMode(solvedState: null | string): solvedState is ErrorTrack {
    if (!solvedState) return false;
    return ['correct', 'correctTime', 'incorrect'].includes(solvedState);
}
// --- (Add your other helpers like mirrorFen, assignMirrorState, etc. here) ---


// --- Define the Store ---
// We use the 'Partial<State>' because 'cg' and 'cgwrap' will not be in the store.
type ChessState = Omit<State, 'cg' | 'cgwrap' | 'chess'> & {
    config: Config, // We merge config into the store
    chess: Chess | null, // We will initialize this in an action
}

export const useChessStore = defineStore('chess', {
    //
    // 1. STATE
    // Replaces the `state: State = { ... }` export
    //
    state: (): ChessState => ({
        // --- From config.ts ---
      config: {
        pgn: getUrlParam(
          "PGN",
          `[Event "?"]
          [Site "?"]
          [Date "2023.02.13"]
          [Round "?"]
          [White "White"]
          [Black "Black"]
          [Result "*"]
          [FEN "q4rk1/p4ppp/b7/8/Pp6/1n1P2P1/1N2QP1P/R3R1K1 w - - 1 21"]
          [SetUp "1"]

          21. Rad1 Nd4! {EV: 92.7%, N: 99.32% of 78.6k} 22. Qe4 {EV: 8.0%, N: 93.34% of
            125k} Nf3+?? {EV: 92.2%, N: 99.46% of 230k} 23. Kf1 {EV: 8.2%, N: 96.48% of 422k}
            Nxh2+ {EV: 92.5%, N: 96.74% of 510k} 24. Kg1 {EV: 8.1%, N: 91.63% of 520k} Nf3+
            {EV: 92.1%, N: 99.09% of 496k} 25. Kf1 {EV: 8.1%, N: 97.24% of 511k} Nxe1 {EV:
              92.4%, N: 97.58% of 602k} *
              `,
        ),
        ankiText: getUrlParam("userText", null),
        frontText: getUrlParam("frontText", "true") === "true",
        muteAudio: getUrlParam("muteAudio", "false") === "true",
        showDests: getUrlParam("showDests", "true") === "true",
        singleClickMove: getUrlParam("singleClickMove", "true") === "true",
        handicap: parseInt(getUrlParam("handicap", "1"), 10),
        strictScoring: getUrlParam("strictScoring", "false") === "true",
        acceptVariations: getUrlParam("acceptVariations", "true") === "true",
        disableArrows: getUrlParam("disableArrows", "false") === "true",
        flipBoard: getUrlParam("flip", "true") === "true",
        boardMode: "Puzzle",
        background: getUrlParam("background", null),
        mirror: getUrlParam("mirror", "true") === "true",
        randomOrientation: getUrlParam("randomOrientation", "false") === "true",
        autoAdvance: getUrlParam("autoAdvance", "false") === "true",
        handicapAdvance: getUrlParam("handicapAdvance", "false") === "true",
        timer: parseInt(getUrlParam("timer", "4"), 10) * 1000,
        increment: parseInt(getUrlParam("increment", "1"), 10) * 1000,
        timerAdvance: getUrlParam("timerAdvance", "false") === "true",
        timerScore: getUrlParam("timerScore", "false") === "true",
        analysisTime: parseInt(getUrlParam("analysisTime", "4"), 10) * 1000,
        animationTime: parseInt(getUrlParam("animationTime", "200"), 10),
      },

        // --- From state.ts ---
      startFen: DEFAULT_POSITION,
      boardRotation: "black",
      playerColour: "white",
      opponentColour: "black",
      solvedColour: null,
      errorTrack: null,
      chessGroundShapes: [],
      errorCount: 0,
      puzzleTime: parseInt(getUrlParam("timer", "4"), 10) * 1000,
      puzzleComplete: false,
      navTimeout: null,
      isStockfishBusy: false,
      stockfishRestart: false,
      analysisToggledOn: false,
      pgnPath: [],
      pgnPathMap: new Map(),
      lastMove: null,
      mirrorState: null,
      // cgwrap: cgwrap,
      // cg: null as any, // Initialize cg as null
      chess: new Chess(),
      parsedPGN: { moves: [] },
      delayTime: parseInt(getUrlParam("animationTime", "200"), 10) + 100,
    }),

    //
    // 2. GETTERS
    // These are computed properties derived from state
    //
    getters: {
        isPuzzleMode: (state) => state.config.boardMode === 'Puzzle',
        currentFen: (state) => state.chess?.fen() ?? state.startFen,
        currentTurnColor: (state) => (state.chess?.turn() === 'w' ? 'white' : 'black'),
        // ... you can add many more getters here
    },

    //
    // 3. ACTIONS
    // These are methods that change the state.
    // This replaces your stateProxy event emitter.
    //
    actions: {
        // This action replaces all the IIFE startup logic
        initializeStore() {
            // --- Set Board Mode (from config.ts) ---
            const mode = getUrlParam("boardMode", "Viewer");
            if (mode && isBoardMode(mode)) this.config.boardMode = mode;

            // --- Parse PGN (from state.ts) ---
            const parsed = parse(this.config.pgn, { startRule: "game" }) as unknown as CustomPgnGame;
            console.log("parsed", parsed)
            console.log("parsed.moves", parsed.moves)

            // --- Set Mirror State (from state.ts) ---
            const mirrorState = this.config.boardMode === "Puzzle"
                ? "original" // Simplified: replace with your assignMirrorState()
                : getUrlParam("mirrorState", null);

            if (isMirrorState(mirrorState)) {
                this.mirrorState = mirrorState;
                // ... (Add your mirrorPgnTree logic here) ...
            }

            this.parsedPGN = parsed;
            this.startFen = parsed.tags?.FEN ?? DEFAULT_POSITION;

            console.log("augmented PGN", this.parsedPGN.moves)

            // --- Initialize chess.js ---
            this.chess = new Chess(this.startFen);

            // --- Set Timers (from state.ts) ---
            this.puzzleTime = this.config.timer;
            this.delayTime = this.config.animationTime + 100;

            // --- Set Initial State from URL (from state.ts) ---
            const solvedMode = getUrlParam("errorTrack", null);
            if (solvedMode && isSolvedMode(solvedMode)) {
                this.errorTrack = solvedMode;
            }

            const pgnPath = getUrlParam("pgnPath", null);
            const result = pgnPath?.split(',').map(item => isNaN(Number(item)) ? 'v' : Number(item));
            this.pgnPath = result ? (result as PgnPath) : [];
        },

        // This replaces the 'pgnPathChanged' event
        setPgnPath(path: PgnPath, lastMove: CustomPgnMove | null, pathMove: CustomPgnMove | null) {
            this.pgnPath = path;
            this.lastMove = lastMove;

            // All your logic from 'changeCurrentPgnMove' in main.ts goes here
            // For example:
            if (pathMove) {
                this.chess?.load(pathMove.after);
                // ... etc
            } else {
                this.chess?.load(this.startFen);
                // ... etc
            }
        },

        // This replaces the 'puzzleScored' event
        scorePuzzle(error: ErrorTrack) {
            this.errorTrack = error;
            // ... all logic from 'scorePuzzle' in main.ts goes here
        }
    }
});
