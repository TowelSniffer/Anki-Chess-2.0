import type {
  CustomShapeBrushes,
  CustomShape,
  CustomPgnMove,
  PgnPath,
  BoardModes
} from '$stores/gameStore.svelte';
import { isNagKey, nags, type NagKey} from '$features/pgn/nags';
import { navigateNextMove, navigatePrevMove } from '$features/pgn/pgnNavigate';
import { areMovesEqual } from '$features/chessJs/chessFunctions'
export const blunderNags = ['$2', '$4', '$6', '$9'];
const goodNags = ['$3', '$1'];

// enum defs for clearer function instructions
export enum ShapeFilter {
  All = 'All',
  Stockfish = 'Stockfish',
  PGN = 'PGN',
  Drawn = 'Drawn',
}

export const shapePriority: CustomShapeBrushes[] = [
  'stockfish', // Draw this first (Bottom Layer)
  'stockfishAlt',
  'mainLine', // Draw this second
  'altLine',
  'blunderLine', // Draw this last (Top Layer)
];

// helper to create a single shape object
function createShape(
  move: CustomPgnMove,
  brush: CustomShapeBrushes,
): CustomShape {
  let customSvg: { html: string; center: 'dest' } | undefined;

  // logic for NAG icons (Blunders, etc)
  if (move.nag) {
    const foundNagKey = move.nag.find(isNagKey);
    // Assuming nags is a constant imported above
    if (foundNagKey && nags[foundNagKey][2]) {
      const imgHtml = `<image href="${nags[foundNagKey][2]}" width="50%" height="50%" />`;
      customSvg = { html: imgHtml, center: 'dest' };
    }
  }

  return {
    orig: move.from,
    dest: move.to,
    brush,
    san: move.san,
    customSvg,
  };
}

function getNagType(nags: string[]): CustomShapeBrushes | null {
  const isBlunder = nags.some((n) => blunderNags.includes(n));
  const isGood = nags.some((n) => goodNags.includes(n));

  let brush: CustomShapeBrushes | null = null;
  if (isBlunder) {
    brush = 'blunderLine';
  } else if (isGood) {
    brush = 'goodLine';
  }
  return brush;
}

function getParentMove(path: PgnPath): PgnPath {
  const prevPath = navigatePrevMove(path);
  return navigateNextMove(prevPath);
}

/**
 * Calculates ONLY system arrows (Main Line, Variations, Stockfish)
 */
export function getSystemShapes(
  currentPath: PgnPath,
  moveMap: Map<string, CustomPgnMove>,
  boardMode: BoardModes,
): CustomShape[] {
  const shapes: CustomShape[] = [];

  const nextPath = boardMode !== 'Puzzle' ? navigateNextMove(currentPath) : currentPath;

  const nextMoveKey = boardMode !== 'Puzzle' ? nextPath.join(',') : getParentMove(nextPath).join(',');
  const mainMove = moveMap.get(nextMoveKey);
  if (!mainMove) return shapes;
  const currentMove = moveMap.get(currentPath.join(',')) ?? null
  // Variations (Alt Lines)
  if (mainMove.variations && mainMove.variations.length > 0) {
    mainMove.variations.forEach((variationLine) => {
      const varMove = variationLine[0];
      const nags = varMove.nag || [];

      const shouldPushAlt = !(boardMode === 'Puzzle' && areMovesEqual(varMove, currentMove))
      const brush = shouldPushAlt ? getNagType(nags) : 'nagOnly';

      shapes.push(createShape(varMove, brush ?? 'altLine'));
    });
  }

  // Main Line
  const nags = mainMove.nag || [];

  const shouldPushMain = !(boardMode === 'Puzzle' && areMovesEqual(mainMove, currentMove))
  const brush = shouldPushMain ? getNagType(nags) : 'nagOnly';

  shapes.push(
    createShape(mainMove, brush ?? 'mainLine'),
  );

  return shapes;
}
