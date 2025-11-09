import { config } from "../../core/config";
import { state } from "../../core/state";
import { stateProxy } from "../../core/stateProxy";

// --- Module-level timer variables ---
let animationFrameId: number | null = null;
let lastTickTimestamp: number | null = null;
let extendAnimationFrameId: number | null = null;
let lastTickExtendTimestamp: number | null = null;
let totalExtendTime = 0;
let totalTime: number;
let extendPercentage: number;

function timerLoop(timestamp: number): void {
  if (!lastTickTimestamp) {
    lastTickTimestamp = timestamp;
  }

  const deltaTime = timestamp - lastTickTimestamp;
  lastTickTimestamp = timestamp;

  state.puzzle.remainingTime = Math.max(
    0,
    state.puzzle.remainingTime - deltaTime,
  );
  const percentage = 100 - (state.puzzle.remainingTime / totalTime) * 100;
  stateProxy.board.borderPercent = percentage;

  if (state.puzzle.remainingTime === 0) {
    handleOutOfTime();
  } else {
    animationFrameId = requestAnimationFrame(timerLoop);
  }
}

function timerExtendLoop(extendtimestamp: number): void {
  if (!lastTickExtendTimestamp) {
    lastTickExtendTimestamp = extendtimestamp;
  }

  const deltaTime = extendtimestamp - lastTickExtendTimestamp;
  lastTickExtendTimestamp = extendtimestamp;
  const deltaTimeFraction =
    (deltaTime / state.puzzle.delayTime) * config.increment;
  totalExtendTime = Math.min(
    config.increment,
    totalExtendTime + deltaTimeFraction,
  );
  const percentageIncrease =
    (deltaTime / state.puzzle.delayTime) *
    Math.min(extendPercentage, (config.increment * 100) / totalTime);

  state.puzzle.remainingTime = Math.min(
    totalTime,
    state.puzzle.remainingTime + deltaTimeFraction,
  );
  extendPercentage -= percentageIncrease;

  if (extendPercentage < 0) {
    state.puzzle.remainingTime = totalTime;
    extendPercentage = 0;
  }
  stateProxy.board.borderPercent = extendPercentage;

  if (totalExtendTime === config.increment) {
    totalExtendTime = 0;
    if (extendAnimationFrameId) cancelAnimationFrame(extendAnimationFrameId);
    extendAnimationFrameId = null;
    lastTickExtendTimestamp = null;
  } else {
    extendAnimationFrameId = requestAnimationFrame(timerExtendLoop);
  }
}

function handleOutOfTime(): void {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    lastTickTimestamp = null;
  }
  stateProxy.board.borderPercent = 100;
  if (config.timerScore) {
    stateProxy.ankiPersist.errorTrack = "incorrect";
  } else if (config.timerAdvance) {
    state.ankiPersist.puzzleComplete = true;
    window.parent.postMessage(state.ankiPersist, "*");
  } else {
    stateProxy.ankiPersist.errorTrack = state.ankiPersist.errorTrack;
  }
}

export function stopPlayerTimer(): void {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    lastTickTimestamp = null;
  }
}

export function startPlayerTimer(): void {
  if (
    config.boardMode === "Viewer" ||
    !config.timer ||
    state.puzzle.remainingTime <= 0
  ) {
    return;
  }
  animationFrameId = requestAnimationFrame(timerLoop);
}

export function initializePuzzleTimer(): void {
  if (config.boardMode === "Viewer" || !config.timer) return;
  stopPlayerTimer();
  totalTime = config.timer;
  const timerColor = config.randomOrientation
    ? "var(--incorrect-color)"
    : state.board.opponentColour;
  document.documentElement.style.setProperty("--timer-color", timerColor);
  state.cgwrap.classList.add("timerMode");
  stateProxy.board.borderPercent = 0;
}

export function extendPuzzleTime(additionalTime: number): void {
  if (
    config.boardMode === "Viewer" ||
    !config.timer ||
    state.puzzle.remainingTime <= 0
  )
    return;

  extendPercentage = 100 - (state.puzzle.remainingTime / totalTime) * 100;
  totalTime = Math.max(
    state.puzzle.remainingTime + additionalTime,
    config.timer,
  );
  if (animationFrameId) stopPlayerTimer();
  extendAnimationFrameId = requestAnimationFrame(timerExtendLoop);
}
