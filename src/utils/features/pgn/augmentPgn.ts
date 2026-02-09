import type { Move } from 'chess.js';
import type {
  SanPromotions,
  CustomPgnMove,
  PgnPath
} from '$Types/ChessStructs';
import { Chess } from 'chess.js';

// Reconstructs game state by current path

export function augmentPgnTree(
  moves: CustomPgnMove[],
  path: PgnPath,
  chess: Chess,
  mapToPopulate: Map<string, CustomPgnMove>,
): void {
  if (!moves) return;

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const currentPath: PgnPath = [...path, i];

    const moveResult = chess.move(move.notation.notation);
    if (!moveResult) continue;


    Object.assign(move, {
      pgnPath: currentPath,
      before: moveResult.before,
      after: moveResult.after,
      from: moveResult.from,
      to: moveResult.to,
      flags: moveResult.flags,
      san: moveResult.san,
      promotion:
        (moveResult.promotion?.toUpperCase() as SanPromotions) ?? undefined,

      history: chess.history(),
      isCheck: chess.inCheck(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isThreefoldRepetition: chess.isThreefoldRepetition(),
      isDraw: chess.isDraw()
    });

    // update map
    const key = currentPath.join(',');
    mapToPopulate.set(key, move);

    if (move.variations) {
      move.variations.forEach((variation, varIndex) => {
        const variationPath: PgnPath = [...currentPath, 'v', varIndex];
        chess.undo();
        // Pass the map down recursively
        augmentPgnTree(variation, variationPath, chess, mapToPopulate);
        chess.move(move.notation.notation);
      });
    }
  }

  // backtrack
  for (let i = 0; i < moves.length; i++) chess.undo();
}

export function addMoveToPgn(
  move: Move,
  currentPath: PgnPath,
  moveMap: Map<string, CustomPgnMove>,
  rootMoves: CustomPgnMove[],
  chess: Chess,
): PgnPath {

  chess.move(move);
  const moveNumber = chess.moveNumber();

  // calculate the "Candidate" move
  let nextPathCandidate: PgnPath;
  if (currentPath.length === 0) {
    nextPathCandidate = [0];
  } else {
    const last = currentPath.at(-1) as number;
    nextPathCandidate = currentPath.with(-1, last + 1);
  }

  // check for Collision (ergo. new variation)
  const collisionMove = moveMap.get(nextPathCandidate.join(','));
  const isVariation = collisionMove && collisionMove.turn === move.color;

  let nextMovePath: PgnPath;

  if (isVariation) {
    if (!collisionMove.variations) collisionMove.variations = [];
    const newVarIndex = collisionMove.variations.length;
    nextMovePath = [...nextPathCandidate, 'v', newVarIndex, 0];
  } else {
    nextMovePath = nextPathCandidate;
  }

  // create the Move Object (raw object)
  const promotionCheck = move.san.match(/=([QRBN])/);
  const newCustomPgnMove: CustomPgnMove = {
    moveNumber,
    notation: {
      check: move.san.includes('+') ? '+' : undefined,
      notation: move.san,
      fig: move.piece,
      strike: move.san.includes('x') ? 'x' : null,
      col: move.to[0],
      row: move.to[1],
      promotion: promotionCheck ? promotionCheck[0] : null,
    },
    turn: move.color,
    before: move.before,
    after: move.after,
    from: move.from,
    to: move.to,
    flags: move.flags,
    san: move.san,
    promotion: (move.promotion?.toUpperCase() as SanPromotions) ?? undefined,
    variations: [],
    nag: [],
    pgnPath: nextMovePath,

    history: chess.history(),
    isCheck: chess.inCheck(),
    isCheckmate: chess.isCheckmate(),
    isStalemate: chess.isStalemate(),
    isThreefoldRepetition: chess.isThreefoldRepetition(),
    isDraw: chess.isDraw()
  };

  // update the tree AND update map with proxy
  // must push to the store first, then retrieve the PROXY from the store to put in the map.

  if (isVariation) {
    // add as new Variation
    // push a new array containing the move
    collisionMove!.variations.push([newCustomPgnMove]);

    // retrieve the proxy: last variation array -> first move in that array
    const newVarLine = collisionMove!.variations.at(-1);
    const addedMoveProxy = newVarLine![0];

    moveMap.set(nextMovePath.join(','), addedMoveProxy);
  } else if (nextMovePath.length === 1) {
    // mainline move (e.g. 1. e4)
    rootMoves.push(newCustomPgnMove);

    // retrieve the proxy after to ensure moveMap is consistent with rootMoves $state rune
    const addedMoveProxy = rootMoves.at(-1)!;

    moveMap.set(nextMovePath.join(','), addedMoveProxy);
  } else {
    // appending to an existing line
    const variationRootPath = nextMovePath.slice(0, -3);

    if (
      variationRootPath.length === 0 &&
      nextMovePath.length > 1 &&
      typeof nextMovePath[1] === 'number'
    ) {
      // extending root main line
      rootMoves.push(newCustomPgnMove);
      const addedMoveProxy = rootMoves.at(-1)!;
      moveMap.set(nextMovePath.join(','), addedMoveProxy);
    } else if (variationRootPath.length > 0) {
      // extending a variation
      const lineParent = moveMap.get(variationRootPath.join(','));
      const varIndex = nextMovePath.at(-2) as number;

      if (lineParent && lineParent.variations[varIndex]) {
        lineParent.variations[varIndex].push(newCustomPgnMove);

        // retrieve proxy
        const addedMoveProxy = lineParent.variations[varIndex].at(-1)!;
        moveMap.set(nextMovePath.join(','), addedMoveProxy);
      }
    } else if (nextMovePath.every((x) => typeof x === 'number')) {
      // fallback for simple numeric path extension
      rootMoves.push(newCustomPgnMove);
      const addedMoveProxy = rootMoves.at(-1)!;
      moveMap.set(nextMovePath.join(','), addedMoveProxy);
    }
  }

  return nextMovePath;
}
