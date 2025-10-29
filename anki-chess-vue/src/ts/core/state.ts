import { Chess, DEFAULT_POSITION } from "chess.js";
import { parse } from "@mliebelt/pgn-parser";
import { Chessground } from "chessground";

import type {
  State,
  ErrorTrack,
  CustomPgnGame,
  MirrorState,
} from "../core/types";

import {
  checkCastleRights,
  assignMirrorState,
  mirrorPgnTree,
  mirrorFen,
} from "../features/pgn/mirror";
import { config, getUrlParam } from "./config";

// --- Type Guards ---

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
console.log("Parsed PGN:", parsed); // Added console log

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
const cgwrap = null as unknown as HTMLDivElement;
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
  cg: null as any, // Initialize cg as null
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
