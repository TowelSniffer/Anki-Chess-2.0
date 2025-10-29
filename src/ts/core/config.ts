import type { Config, BoardModes } from "../core/types";

// --- Type Guards ---
// boardMode
function isBoardMode(mode: string): mode is BoardModes {
  const boardModes = ["Viewer", "Puzzle"];
  const modeCheck = boardModes.includes(mode);
  return modeCheck;
}

// --- URL Parameter Helper ---
const urlParams = new URLSearchParams(window.location.search);

export function getUrlParam<T>(name: string, defaultValue: T): string | T {
  const value = urlParams.get(name);
  return value !== null ? value : defaultValue;
}

// --- Global Configuration ---

export const config: Config = {
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
};

(function setBoardMode() {
  const mode = getUrlParam("boardMode", "Viewer");
  if (mode && isBoardMode(mode)) config.boardMode = mode;
})();
