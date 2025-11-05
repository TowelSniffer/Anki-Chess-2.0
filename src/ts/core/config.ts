import type { Config, BoardModes } from "./Config";

// --- Type Guards ---
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
[Date "2025.11.06"]
[Round "?"]
[White "White"]
[Black "Black"]
[Result "*"]
[FEN "q4rk1/p2P1ppp/b7/8/Pp6/6P1/1N2QP1P/Rn2R1K1 w - - 1 25"]
[SetUp "1"]

25. d8=N Bd3 26. Qxd3 *
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
