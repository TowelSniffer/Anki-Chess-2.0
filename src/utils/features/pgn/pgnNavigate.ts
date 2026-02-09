import type { PgnPath } from '$Types/ChessStructs';

// --- PGN Navigation ---

export function navigateNextMove(path: PgnPath): PgnPath {
  const pathCheck = path;
  let movePath: PgnPath;
  if (!pathCheck.length) {
    // No moves played
    movePath = [0];
  } else {
    let currentLinePosition = pathCheck.at(-1) as number;
    movePath = pathCheck.with(-1, ++currentLinePosition);
  }
  return movePath;
}

export function navigatePrevMove(path: PgnPath): PgnPath {
  const movePath = path;
  let prevMovePath = movePath;
  if (!movePath.length) return movePath;
  let currentLinePosition = movePath.at(-1) as number;
  if (currentLinePosition === 0) {
    if (movePath.length === 1) {
      prevMovePath = [];
    } else {
      currentLinePosition = movePath.at(-4) as number;
      // ie 2 in: 4, "v", 0, 2, "v", 1, 0
      if (currentLinePosition === 0) {
        // must be first move
        prevMovePath = [];
      } else {
        prevMovePath = [...movePath.slice(0, -4), --currentLinePosition];
      }
    }
  } else {
    prevMovePath = movePath.with(-1, --currentLinePosition);
  }
  return prevMovePath;
}
