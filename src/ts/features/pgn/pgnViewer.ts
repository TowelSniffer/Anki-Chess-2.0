import type { Move } from "chess.js";
import type { PgnMove } from "@mliebelt/pgn-types";
import { Chess } from "chess.js";

import type { CustomPgnMove, PgnPath } from "./Pgn";
import { isNagKey, nags } from "./nags";
import { state } from "../../core/state";

// --- PGN Rendering ---

function buildPgnHtml(moves: CustomPgnMove[], altLine?: boolean): string {
  let html = "";
  if (!moves || moves.length === 0) return "";
  if (moves[0].turn === "b") {
    const moveNumber = moves[0].moveNumber;
    if (moves[0].pgnPath.at(-1) === 0 && moves[0].pgnPath.length === 1) {
      // mainline
      html += `<span class="move-number">${moveNumber}.</span><span class="nullMove">|...|</span> `;
    } else if (moves[0].pgnPath.at(-1) === 0) {
      html += `<span class="move-number">${moveNumber}...</span> `;
    }
  }

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];

    if (move.turn === "w") {
      const moveNumber = move.moveNumber;
      html += `<span class="move-number">${moveNumber}.</span> `;
    }
    let nagCheck = "";
    let nagTitle = null;
    if (move.nag) {
      const foundNagKey = move.nag.find(isNagKey);
      if (foundNagKey) {
        nagCheck = nags[foundNagKey]?.[1] ?? "";
        nagTitle = nags[foundNagKey]?.[0] ?? "";
      }
    }
    nagTitle = nagTitle ? `<span class="nagTooltip">${nagTitle}</span>` : "";
    const pathKey = move.pgnPath.join(",");
    if (pathKey && move.pgnPath) {
      html += ` <span class="move" data-path-key="${pathKey}">${nagTitle} ${move.notation.notation} ${nagCheck}</span>`;
    }

    if (move.commentAfter) {
      if (move.turn === "w" && !altLine)
        html += `<span class="nullMove">|...|</span>`;
      html += `<span class="comment"> ${move.commentAfter} </span>`;
      if (
        move.turn === "w" &&
        i < moves.length - 1 &&
        !altLine &&
        !move.variations?.length
      )
        html += `<span class="move-number">${move.moveNumber}.</span><span class="nullMove">|...|</span>`;
    }

    if (move.variations && move.variations.length > 0) {
      if (!altLine) {
        if (move.turn === "w" && !altLine && !move.commentAfter)
          html += `<span class="nullMove">|...|</span>`;
        html += `<div class="altLine">`;
      }
      move.variations.forEach((variation) => {
        html += `<span class="altLineBracket">(</span>${buildPgnHtml(variation, true)}<span class="altLineBracket">)</span>`;
      });
      if (!altLine) {
        html += `</div>`;
        if (move.turn === "w" && i < moves.length - 1)
          html += `<span class="move-number">${move.moveNumber}.</span><span class="nullMove">|...|</span>`;
      }
    }
  }
  return html;
}

// --- PGN Navigation ---

export function isEndOfLine(path: PgnPath): boolean {
  const nextMovePath = navigateNextMove(path);
  const nextMoveCheck = state.pgnTrack.pgnPathMap.get(
    nextMovePath.join(","),
  )?.pgnPath;
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
  const currentPath = state.pgnTrack.pgnPath;
  let currentLinePosition = currentPath.at(-1) as number;
  if (currentLinePosition === null) currentLinePosition = 0;

  let nextMovePath: PgnPath;
  if (!currentPath.length) {
    // first move
    nextMovePath = [0];
  } else {
    nextMovePath = currentPath.with(-1, ++currentLinePosition);
  }

  const pgnMove = state.pgnTrack.pgnPathMap.get(nextMovePath.join(","));

  const isVariation = pgnMove?.turn === move.color;

  nextMovePath = isVariation
    ? [...nextMovePath, "v", pgnMove.variations.length, 0]
    : nextMovePath;
  const newCustomPgnMove: CustomPgnMove = {
    moveNumber: chessState,
    notation: {
      check: move.san.includes("+") ? "+" : undefined,
      notation: move.san,
      fig: move.piece,
      strike: move.san.includes("x") ? "x" : null,
      col: move.to[0],
      row: move.to[1],
      promotion: move.promotion ? move.san.slice(-2) : null,
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
    const parentMove = state.pgnTrack.pgnPathMap.get(parentPath.join(","));
    parentMove!.variations.push([newCustomPgnMove]);
  } else {
    const variationLine = parentPath.slice(0, -3);
    const parentLine = state.pgnTrack.pgnPathMap.get(variationLine.join(","));
    parentLine!.variations[parentPath.at(-2) as number].push(newCustomPgnMove);
  }

  state.pgnTrack.pgnPathMap.set(nextMovePath.join(","), newCustomPgnMove);

  renderNewPgnMove(newCustomPgnMove, nextMovePath);
  return nextMovePath;
}

function renderNewPgnMove(newMove: CustomPgnMove, newMovePath: PgnPath): void {
  const moveHtml = buildPgnHtml([newMove]);
  const pathIndex = newMovePath.at(-1) as number;
  const previousMoveEl = document.querySelector(
    `[data-path-key="${newMovePath.with(-1, pathIndex - 1).join(",")}"]`,
  );
  if (newMovePath.length === 1) {
    const pgnContainer = document.getElementById("pgnComment");
    if (
      newMove.turn === "w" &&
      previousMoveEl?.nextElementSibling?.classList.contains("move")
    ) {
      // need to add white null move is last move has variation/comment
      pgnContainer?.insertAdjacentHTML(
        "beforeend",
        `<span class="move-number">${newMove.moveNumber}.</span> <span class="nullMove">|...|</span>`,
      );
    } else if (newMove.turn === "b" && previousMoveEl?.nextElementSibling) {
      // need to add white null move is last move has variation/comment
      pgnContainer?.insertAdjacentHTML(
        "beforeend",
        `<span class="move-number">${newMove.moveNumber}.</span> <span class="nullMove">|...|</span>`,
      );
    }
    pgnContainer?.insertAdjacentHTML("beforeend", moveHtml);
    return;
  }

  const parentPath = newMovePath.slice(0, -3);

  // Continuing an existing line or variation
  if (pathIndex && pathIndex > 0) {
    // adding move to existing variation
    if (previousMoveEl)
      previousMoveEl.insertAdjacentHTML("afterend", `${moveHtml}`);
    return;
  } else if (pathIndex === 0) {
    const newVarHtml = `<span class="altLineBracket">(</span>${moveHtml}<span class="altLineBracket">)</span>`;
    const newVarDivHtml = `<div class="altLine">${newVarHtml}</div>`;
    // adding new variation
    const variationMoveEl = document.querySelector(
      `[data-path-key="${parentPath.join(",")}"]`,
    );
    if (!variationMoveEl) return;
    let nextAltLineEl = variationMoveEl.nextElementSibling;
    while (nextAltLineEl) {
      if (
        nextAltLineEl.classList.contains("altLine") ||
        (nextAltLineEl.localName === "span" &&
          !nextAltLineEl.classList.contains("nullMove") &&
          !nextAltLineEl.classList.contains("comment"))
      ) {
        break;
      }
      nextAltLineEl = nextAltLineEl.nextElementSibling;
    }
    if (nextAltLineEl?.classList.contains("altLine")) {
      nextAltLineEl.insertAdjacentHTML("beforeend", newVarHtml);
    } else if (
      parentPath.length === 1 &&
      (!nextAltLineEl || nextAltLineEl.classList.contains("move"))
    ) {
      // insert new variation div in middle of main line White
      let insertVarDivHtml = ``;
      if (nextAltLineEl || (!nextAltLineEl && newMove.turn === "w"))
        insertVarDivHtml += `<span class="nullMove">|...|</span>`;
      insertVarDivHtml += newVarDivHtml;
      if (nextAltLineEl && !variationMoveEl.nextElementSibling)
        insertVarDivHtml += `<span class="move-number">${newMove.moveNumber}.</span> <span class="nullMove">|...|</span>`;
      if (variationMoveEl.nextElementSibling?.classList.contains("move")) {
        insertVarDivHtml += `<span class="move-number">${newMove.moveNumber}.</span> <span class="nullMove">|...|</span>`;
      }
      variationMoveEl.insertAdjacentHTML("afterend", insertVarDivHtml);
    } else if (
      parentPath.length === 1 &&
      nextAltLineEl?.classList.contains("move-number")
    ) {
      // insert new variation div in middle of main line Black
      if (variationMoveEl.nextElementSibling?.classList.contains("nullMove")) {
        // null move can be made when moves have comments but no variations
        variationMoveEl.nextElementSibling.insertAdjacentHTML(
          "afterend",
          newVarDivHtml,
        );
      } else {
        variationMoveEl.insertAdjacentHTML("afterend", newVarDivHtml);
      }
    } else {
      // insert new variation within existing variation div
      variationMoveEl.insertAdjacentHTML("afterend", newVarHtml);
    }
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
    state.pgnTrack.pgnPathMap.set(pathKey, move);

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
  document
    .querySelectorAll("#pgnComment .move.current")
    .forEach((el) => el.classList.remove("current"));
  const pgnMoveEl = document.querySelector(
    `[data-path-key="${pgnPath.join(",")}"]`,
  );
  if (pgnMoveEl) {
    pgnMoveEl.classList.add("current");
  }
}

// --- Initialization ---

export function initPgnViewer(): void {
  const pgnContainer = document.getElementById("pgnComment");
  if (!pgnContainer) return;

  pgnContainer.innerHTML = "";
  if (state.parsedPGN.gameComment) {
    pgnContainer.innerHTML += `<span class="comment"> ${state.parsedPGN.gameComment.comment} </span>`;
  }
  pgnContainer.innerHTML += buildPgnHtml(state.parsedPGN.moves);
  highlightCurrentMove(state.pgnTrack.pgnPath);
}
