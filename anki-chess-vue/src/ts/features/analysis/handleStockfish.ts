import type { Move } from "chess.js";

import { config } from "../../core/config";
import { state } from "../../core/state";
import { getLegalMove, getcurrentTurnColor } from "../board/chessFunctions";
import { ShapeFilter, filterShapes, pushShapes } from "../board/arrows";
import { setButtonsDisabled } from "../ui/uiUtils";

let stockfish: Worker | null = null;

let analysisCache = {
  // cache info to reduce lag while analysis is on
  fen: "",
  moveUci: "",
  move: null as Move | null,
  advantage: "50.0%",
};

function convertCpToWinPercentage(cp: number): string {
  const probability = 1 / (1 + Math.pow(10, -cp / 400));
  let percentage = probability * 100;

  // If the player is black, the perspective is flipped.
  if (state.playerColour === getcurrentTurnColor()) {
    percentage = 100 - percentage;
  }
  return `${percentage.toFixed(1)}%`;
}

function handleStockfishMessages(event: MessageEvent): void {
  const message = event.data;
  if (typeof message !== "string") {
    console.warn(
      "Received a non-string message from the Stockfish worker:",
      message,
    );
    return;
  }
  const parts = message.split(" ");
  if (message.startsWith("info")) {
    if (analysisCache.fen !== state.chess.fen()) return;
    // const pvDepthIndex = parts.indexOf('depth');
    // const pvDepth = parts[pvDepthIndex + 1];
    const pvIndex = parts.indexOf("pv");
    const cpIndex = parts.indexOf("cp");
    const mateIndex = parts.indexOf("mate");
    const firstMove = parts[pvIndex + 1];

    if (mateIndex > -1) {
      const mate = parts[mateIndex + 1] ? parseInt(parts[mateIndex + 1] as string, 10) : 0;
      let adv = mate < 0 ? 0 : 100;
      if (state.playerColour === getcurrentTurnColor()) adv = 100 - adv;
      analysisCache.advantage = `${adv.toFixed(1)}%`;
    } else if (cpIndex > -1) {
      const cp = parts[cpIndex + 1] ? parseInt(parts[cpIndex + 1] as string, 10) : 0;
      analysisCache.advantage = convertCpToWinPercentage(cp);
    }
    document.documentElement.style.setProperty(
      "--centipawn",
      analysisCache.advantage,
    );

    if (firstMove === analysisCache.moveUci) {
      return;
    }

    const moveObject = firstMove ? getLegalMove(firstMove) : null;

    // Update cache
    analysisCache.moveUci = firstMove || "";
    analysisCache.move = moveObject;

    // Now update the drawing
    if (moveObject && state.analysisToggledOn) {
      filterShapes(ShapeFilter.Stockfish);
      pushShapes(moveObject, "stockfish");
      state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
    }
  } else if (message.startsWith("bestmove")) {
    state.isStockfishBusy = false;
    if (state.stockfishRestart) {
      state.stockfishRestart = false;
      startAnalysis(config.analysisTime);
    }
    const bestMoveUci = message.split(" ")[1];
    const moveObject = bestMoveUci ? getLegalMove(bestMoveUci) : null;
    if (moveObject && state.analysisToggledOn) {
      filterShapes(ShapeFilter.Stockfish);
      pushShapes(moveObject, "stockfinished");
      state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
    }
  }
}

export function handleStockfishCrash(source: string): void {
  console.error(`Stockfish engine crashed. Source: ${source}.`);
  if (!state.analysisToggledOn) return;

  console.log("Attempting to restart the engine...");
  setTimeout(() => initializeStockfish(), 250); // Give the browser a moment to recover
}

function initializeStockfish(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Terminate existing worker if it exists
    if (stockfish) stockfish.terminate();

    stockfish = new Worker("/_stockfish.js");
    stockfish.onmessage = (event: MessageEvent) => {
      const message: unknown = event.data ?? event;

      if (typeof message !== "string") return;

      if (message === "uciok") {
        stockfish!.postMessage("isready"); // Ensure the engine is fully ready
      } else if (message === "readyok") {
        stockfish!.onmessage = (event) => {
          handleStockfishMessages(event);
        };
        stockfish!.onerror = () => handleStockfishCrash("stockfish.onerror");
        resolve();
      }
    };

    stockfish.onerror = (error) => {
      console.error("Stockfish failed to initialize.", error);
      handleStockfishCrash("stockfish.on-init-error");
      reject(error);
    };

    stockfish.postMessage("uci");
  });
}

export function startAnalysis(movetime: number): void {
  if (
    !state.analysisToggledOn ||
    !stockfish ||
    state.stockfishRestart ||
    state.chess.moves().length === 0
  )
    return;
  if (state.isStockfishBusy) {
    state.stockfishRestart = true;
    stockfish.postMessage("stop");
    return;
  }
  if (analysisCache.fen !== state.chess.fen()) {
    analysisCache = {
      fen: state.chess.fen(), // Set the new FEN
      moveUci: "",
      move: null,
      advantage: analysisCache.advantage,
    };
    filterShapes(ShapeFilter.Stockfish);
    state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
  }

  state.isStockfishBusy = true;
  stockfish.postMessage(`position fen ${state.chess.fen()}`);
  stockfish.postMessage(`go movetime ${movetime}`);
}

export function toggleStockfishAnalysis(): void {
  const toggleButton =
    document.querySelector<HTMLButtonElement>("#stockfishToggle");
  if (!toggleButton) return;
  if (!stockfish) {
    setButtonsDisabled(["stockfish"], true);

    // Loading icon
    const icon = toggleButton.querySelector<HTMLElement>(".material-icons");
    if (icon) {
      icon.textContent = "sync"; // Change icon to 'sync'
      icon.classList.add("icon-spin"); // Add spinning class
    }

    initializeStockfish().then(() => {
      setButtonsDisabled(["stockfish"], false);
      state.analysisToggledOn = false;
      toggleStockfishAnalysis();
    });
    return;
  }
  state.analysisToggledOn = !state.analysisToggledOn;

  toggleButton.classList.toggle("active-toggle", state.analysisToggledOn);

  toggleButton.innerHTML = state.analysisToggledOn
    ? "<span class='material-icons md-small'>developer_board</span>"
    : "<span class='material-icons md-small'>developer_board_off</span>";

  state.cgwrap.classList.toggle("analysisMode", state.analysisToggledOn);

  if (state.analysisToggledOn) {
    startAnalysis(config.analysisTime);
  } else {
    if (state.isStockfishBusy) {
      stockfish.postMessage("stop");
    }
    filterShapes(ShapeFilter.Stockfish);
    state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
  }
}
