import { Chess, DEFAULT_POSITION } from "chess.js";
import { parse } from "@mliebelt/pgn-parser";
import { Chessground } from "chessground";

import type { State } from "../types/Main";
import { isMirrorState, isSolvedMode } from "../types/Main";
import type { CustomPgnGame } from "../types/Pgn";

import {
  checkCastleRights,
  assignMirrorState,
  mirrorPgnTree,
  mirrorFen,
} from "../features/pgn/mirror";
import { config, getUrlParam } from "./config";

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
      lastMove: true,
    },
    animation: {
      enabled: false, // will manulally enable later to prevent position load animation
      duration: config.animationTime,
    },
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
  const result = pgnPath?.split(",").map((item) => {
    const num = Number(item);
    return isNaN(num) ? "v" : num;
  });
  state.pgnPath = result ? result : [];
})();
