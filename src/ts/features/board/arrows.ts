import type { Move } from "chess.js";

import type { CustomShapeBrushes } from "../../types/CustomChessgroundShapes";
import type { PgnPath, CustomPgnMove } from "../../types/Pgn";
import { isNagKey } from "../../types/Pgn";

import { config } from "../../core/config";
import { state } from "../../core/state";
import nags from "../../../json/nags.json" assert { type: "json" };
import { navigateNextMove } from "../pgn/pgnViewer";

const blunderNags = ["$2", "$4", "$6", "$9"];

// enum defs for clearer function instructions
export enum ShapeFilter {
  All = "All",
  Stockfish = "Stockfish",
  PGN = "PGN",
  Drawn = "Drawn",
}

export const shapePriority: CustomShapeBrushes[] = [
  "mainLine",
  "altLine",
  "blunderLine",
  "stockfish",
  "stockfinished",
];

const customShapeBrushes: CustomShapeBrushes[] = [
  "stockfish",
  "stockfinished",
  "mainLine",
  "altLine",
  "blunderLine",
];

const shapeArray: Record<ShapeFilter, CustomShapeBrushes[]> = {
  [ShapeFilter.All]: customShapeBrushes,
  [ShapeFilter.Stockfish]: ["stockfish", "stockfinished"],
  [ShapeFilter.PGN]: ["mainLine", "altLine", "blunderLine"],
  [ShapeFilter.Drawn]: ["userDrawn"],
};

export function filterShapes(filterKey: ShapeFilter): void {
  let brushesToRemove = shapeArray[filterKey];
  const shouldFilterDrawn = brushesToRemove.includes("userDrawn");
  if (shouldFilterDrawn) brushesToRemove = shapeArray[ShapeFilter.All];

  const filteredShapes = state.chessGroundShapes.filter((shape) => {
    const shouldRemove = !shape.brush || brushesToRemove.includes(shape.brush);
    if (shouldFilterDrawn) {
      return shouldRemove;
    } else {
      return !shouldRemove;
    }
  });

  // Assign the new, filtered array back to the state.
  state.chessGroundShapes = filteredShapes;
}

export function pushShapes(
  move: CustomPgnMove | Move,
  brush: CustomShapeBrushes,
): void {
  let targetImage: string | undefined;
  if ("nag" in move && move.nag) {
    const foundNagKey = move.nag.find(isNagKey);
    if (foundNagKey && nags[foundNagKey][2]) {
      targetImage += `<image href="${nags[foundNagKey][2]}" width="50%" height="50%" />`;
    }
  }

  state.chessGroundShapes.push({
    orig: move.from,
    dest: move.to,
    brush: brush,
    san: move.san,
    customSvg: targetImage ? { html: targetImage, center: "dest" } : undefined,
  });
}

export function drawArrows(pgnPath: PgnPath): void {
  filterShapes(ShapeFilter.Drawn);
  if (config.boardMode === "Puzzle" && config.disableArrows) return;
  let nextMovePath = navigateNextMove(state.pgnPath);
  if (config.boardMode === "Viewer") {
    nextMovePath = navigateNextMove(pgnPath);
  } else if (
    state.playerColour === (state.chess.turn() === "w" ? "white" : "black")
  ) {
    state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
    return;
  }
  filterShapes(ShapeFilter.All);
  const mainLine = state.pgnPathMap.get(nextMovePath.join(","));
  if (!mainLine) return;
  if (mainLine.variations.length) {
    mainLine.variations.forEach((variation) => {
      const varMove = variation[0];
      const isBlunder = blunderNags.some((blunder) =>
        varMove.nag?.includes(blunder),
      );
      pushShapes(varMove, isBlunder ? "blunderLine" : "altLine");
    });
  }
  const isBlunder = blunderNags.some((blunder) =>
    mainLine.nag?.includes(blunder),
  );
  pushShapes(mainLine, isBlunder ? "blunderLine" : "mainLine");

  if (config.boardMode === "Puzzle") {
    // remove played arrow
    const parentMove = state.pgnPathMap.get(pgnPath.join(","));
    const puzzleMoveShapes = state.chessGroundShapes.filter(
      (shape) => shape.san !== parentMove?.san,
    );

    state.chessGroundShapes
      .filter((shape) => shape.san === parentMove?.san)
      .forEach((filteredShape) => {
        if (filteredShape.customSvg)
          puzzleMoveShapes.push({
            orig: filteredShape.orig,
            dest: filteredShape.dest,
            customSvg: filteredShape.customSvg,
          });
      });
    state.chessGroundShapes = puzzleMoveShapes ?? [];
  }

  state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
}
