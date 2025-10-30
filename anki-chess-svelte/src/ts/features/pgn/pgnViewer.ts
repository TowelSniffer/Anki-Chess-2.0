import type { Move } from "chess.js";
import type { PgnMove } from "@mliebelt/pgn-types";
import { Chess } from "chess.js";

import type { CustomPgnMove, PgnPath } from "../../core/types";
import PgnViewer from "../../components/PgnViewer.svelte";

let pgnViewerInstance: PgnViewer | undefined;

// --- Types ---
type NagKey = keyof typeof nags;

// type guard functions

// --- PGN Rendering ---

// --- PGN Navigation ---

export function isEndOfLine(path: PgnPath): boolean {
  const nextMovePath = navigateNextMove(path);
  const nextMoveCheck = state.pgnPathMap.get(nextMovePath.join(","))?.pgnPath;
  return nextMoveCheck ? false : true;
}

function navigateFullMoveSequenceFromPath(path: PgnPath): PgnPath {
  const finalPath = path;
  if (!finalPath.length) return [];

  let currentLine = state.parsedPGN.moves;
  let parentMove: CustomPgnMove | null = null;

  for (let i = 0; i < finalPath.length; i++) {
    const segment = finalPath[i];
    if (finalPath[i] === "v" && typeof finalPath[++i] === "number") {
      if (parentMove?.variations) {
        const varIndex = finalPath[i++]; // second ++ to skip branching number
        if (typeof varIndex !== "number") {
          console.error("Invalid PGN path:", finalPath);
          return [];
        }

        currentLine = parentMove.variations[varIndex];
        i--;
      }
    } else if (typeof segment === "number") {
      const movesDownCurrentLine = segment;
      for (let i = 0; i <= movesDownCurrentLine; i++) {
        const move = currentLine?.[i];
        if (move?.notation?.notation) {
          parentMove = move;
        } else {
          // at last move of PGN
        }
      }
    }
  }
  if (!parentMove) return [];
  return parentMove.pgnPath;
}

export function addMoveToPgn(move: Move): PgnPath {
  const chess = new Chess();
  chess.load(move.before);
  const chessState = chess.moveNumber();
  const currentPath = state.pgnPath;
  let currentLinePosition = currentPath.at(-1) as number;
  if (currentLinePosition === null) currentLinePosition = 0;

  let nextMovePath: PgnPath;
  if (!currentPath.length) {
    // first move
    nextMovePath = [0];
  } else {
    nextMovePath = currentPath.with(-1, ++currentLinePosition);
  }

  const pgnMove = state.pgnPathMap.get(nextMovePath.join(","));

  const isVariation = pgnMove?.turn === move.color;

  nextMovePath = isVariation
    ? [...nextMovePath, "v", pgnMove.variations.length, 0]
    : nextMovePath;
  const newCustomPgnMove: CustomPgnMove = {
    moveNumber: chessState,
    notation: {
      notation: move.san,
      fig: move.piece,
      strike: move.san.includes("x") ? "x" : null,
      col: move.to[0],
      row: move.to[1],
      promotion: move.promotion ? move.promotion : null,
    },
    turn: move.color,
    before: move.before,
    after: move.after,
    from: move.from,
    to: move.to,
    flags: move.flags,
    san: move.san,
    variations: [],
    nag: [],
    pgnPath: nextMovePath,
  };
  const parentPath = navigateFullMoveSequenceFromPath(nextMovePath);
  if (nextMovePath.length === 1) {
    state.parsedPGN.moves.push(newCustomPgnMove);
  } else if (isVariation) {
    const parentMove = state.pgnPathMap.get(parentPath.join(","));
    parentMove!.variations.push([newCustomPgnMove]);
  } else {
    const variationLine = parentPath.slice(0, -3);
    const parentLine = state.pgnPathMap.get(variationLine.join(","));
    parentLine!.variations[parentPath.at(-2) as number].push(newCustomPgnMove);
  }

  state.pgnPathMap.set(nextMovePath.join(","), newCustomPgnMove);

  renderNewPgnMove(newCustomPgnMove, nextMovePath);
  return nextMovePath;
}

function renderNewPgnMove(newMove: CustomPgnMove, newMovePath: PgnPath): void {
  if (pgnViewerInstance) {
    pgnViewerInstance.$set({
      moves: state.parsedPGN.moves,
      currentPgnPath: newMovePath,
    });
  }
}

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
  let currentLinePosition = movePath.at(-1);
  if (currentLinePosition === 0) {
    if (movePath.length === 1) {
      prevMovePath = [];
    } else {
      currentLinePosition = movePath.at(-4);
      console.log(currentLinePosition);
      // ie 2 in: 4, "v", 0, 2, "v", 1, 0
      if (currentLinePosition === 0) {
        // must be first move
        prevMovePath = [];
      } else if (typeof currentLinePosition === "number") {
        prevMovePath = [...movePath.slice(0, -4), --currentLinePosition];
      }
    }
  } else if (typeof currentLinePosition === "number") {
    prevMovePath = movePath.with(-1, --currentLinePosition);
  } else {
    prevMovePath = [];
  }
  return prevMovePath;
}

// --- PGN Data Augmentation ---
export function augmentPgnTree(moves: PgnMove[], path: PgnPath = []): void {
  const chess = new Chess(state.startFen);
  _augmentAndGenerateFen(moves as CustomPgnMove[], path, chess);
}

function _augmentAndGenerateFen(
  moves: CustomPgnMove[],
  path: PgnPath = [],
  chess: Chess,
): void {
  if (!moves) return;

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const currentPath: PgnPath = [...path, i];

    const moveResult = chess.move(move.notation.notation);
    if (!moveResult) {
      console.error(
        `Invalid move ${move.notation.notation} at path ${currentPath}`,
      );
      continue; // Skip invalid moves
    }

    move.pgnPath = currentPath;
    move.before = moveResult.before;
    move.after = moveResult.after;
    move.from = moveResult.from;
    move.to = moveResult.to;
    move.flags = moveResult.flags;
    move.san = moveResult.san;

    const pathKey = move.pgnPath.join(",");
    state.pgnPathMap.set(pathKey, move);

    if (move.variations) {
      move.variations.forEach((variation, varIndex) => {
        const variationPath: PgnPath = [...currentPath, "v", varIndex];
        // undo the parent move
        chess.undo();
        _augmentAndGenerateFen(variation, variationPath, chess);
        // After the variation is done, re-apply the parent move
        chess.move(move.notation.notation);
      });
    }
  }
  // after iterating through a line, undo all its moves to backtrack correctly
  for (let i = 0; i < moves.length; i++) {
    chess.undo();
  }
}

export function highlightCurrentMove(pgnPath: PgnPath): void {
  if (pgnViewerInstance) {
    pgnViewerInstance.$set({ currentPgnPath: pgnPath });
  }
}

// --- Initialization ---

export function initPgnViewer(): void {
  const pgnContainer = document.getElementById("pgnComment");
  if (!pgnContainer) return;

  pgnContainer.innerHTML = ""; // Clear existing content

  if (state.parsedPGN.gameComment) {
    const commentSpan = document.createElement("span");
    commentSpan.classList.add("comment");
    commentSpan.textContent = ` ${state.parsedPGN.gameComment.comment} `;
    pgnContainer.appendChild(commentSpan);
  }

  pgnViewerInstance = new PgnViewer({
    target: pgnContainer,
    props: {
      moves: state.parsedPGN.moves,
      currentPgnPath: state.pgnPath,
    },
  });
}
