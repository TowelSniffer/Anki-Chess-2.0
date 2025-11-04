import { DEFAULT_POSITION } from "chess.js";
import { parse } from "@mliebelt/pgn-parser";
import { Chessground } from "chessground";

import type { State } from "./State";
import type { MirrorState, ErrorTrack } from "./Config";
import type { CustomPgnGame, PgnPath } from "../features/pgn/Pgn";

import {
  checkCastleRights,
  assignMirrorState,
  mirrorPgnTree,
  mirrorFen,
} from "../features/pgn/mirror";
import { config, getUrlParam } from "./config";

// -- Type Guards ---

// mirrorState
function isMirrorState(mirrorState: string | null): mirrorState is MirrorState {
  if (!mirrorState) return false;
  const mirrorStates = [
    "original",
    "original_mirror",
    "invert",
    "invert_mirror",
  ];
  const mirrorStateCheck = mirrorStates.includes(mirrorState);
  return mirrorStateCheck;
}

// errorTrack
function isSolvedMode(solvedState: null | string): solvedState is ErrorTrack {
  if (!solvedState) return false;
  const solvedModes = ["correct", "correctTime", "incorrect"];
  const modeCheck = solvedModes.includes(solvedState);
  return modeCheck;
}

// -- load elemets for state ---

const parsed = parse(config.pgn, {
  startRule: "game",
}) as unknown as CustomPgnGame;

const mirrorState =
  config.boardMode === "Puzzle"
    ? assignMirrorState()
    : getUrlParam("mirrorState", null);

if (
  parsed.tags?.FEN &&
  !checkCastleRights(parsed.tags.FEN) &&
  isMirrorState(mirrorState)
) {
  parsed.tags.FEN = mirrorFen(parsed.tags.FEN, mirrorState);
  mirrorPgnTree(parsed.moves, mirrorState);
}

// --- Global State ---
const cgwrap = document.getElementById("board") as HTMLDivElement;
export const state: State = {
  get startFen(): string {
    return this.parsedPGN.tags?.FEN ?? DEFAULT_POSITION;
  },
  parsedPGN: parsed,
  puzzle: {
    errorCount: 0,
    delayTime: config.animationTime + 100,
    puzzleTime: config.timer,
  },
  ankiPersist: {
    errorTrack: null,
    mirrorState: isMirrorState(mirrorState) ? mirrorState : null,
    puzzleComplete: false,
    get pgnPath(): PgnPath {
      return state.pgnTrack.pgnPath;
    },
  },
  pgnTrack: {
    pgnPath: [],
    pgnPathMap: new Map(),
    lastMove: null,
    get fen(): string {
      return state.pgnTrack.lastMove?.after ?? state.startFen;
    },
    get turn(): string {
      return state.pgnTrack.lastMove?.turn ?? state.parsedPGN.moves[0].turn;
    },
  },
  board: {
    solvedColour: null,
    boardRotation: "black",
    playerColour: "white",
    opponentColour: "black",
    chessGroundShapes: [],
    get inCheck(): boolean {
      return state.pgnTrack.lastMove?.notation.check ? true : false;
    },
  },
  cgwrap: cgwrap,
  cg: Chessground(cgwrap, {
    fen: parsed.tags?.FEN ?? DEFAULT_POSITION,
    drawable: {
      enabled: true,
      brushes: {
        stockfish: {
          key: "stockfish",
          color: "#e5e5e5",
          opacity: 1,
          lineWidth: 7,
        },
        stockfinished: {
          key: "stockfinished",
          color: "white",
          opacity: 1,
          lineWidth: 7,
        },
        mainLine: {
          key: "mainLine",
          color: "#66AA66",
          opacity: 1,
          lineWidth: 9,
        },
        altLine: { key: "altLine", color: "#66AAAA", opacity: 1, lineWidth: 9 },
        blunderLine: {
          key: "blunderLine",
          color: "var(--incorrect-color)",
          opacity: 1,
          lineWidth: 7,
        },
        // default
        green: { key: "green", color: "green", opacity: 0.7, lineWidth: 9 },
        red: { key: "red", color: "red", opacity: 0.7, lineWidth: 9 },
        blue: { key: "blue", color: "blue", opacity: 0.7, lineWidth: 9 },
        yellow: { key: "yellow", color: "yellow", opacity: 0.7, lineWidth: 9 },
      },
    },
  }),
};

// --- Set Dynamic variables ---

(function setSolvedMode() {
  const solvedMode = getUrlParam("errorTrack", null);
  if (solvedMode && isSolvedMode(solvedMode))
    state.ankiPersist.errorTrack = solvedMode;
})();

(function setPgnPath() {
  const pgnPath = getUrlParam("pgnPath", null);
  const result = pgnPath?.split(",").map((item) => {
    const num = Number(item);
    return isNaN(num) ? "v" : num;
  });
  state.pgnTrack.pgnPath = result ? result : [];
})();
