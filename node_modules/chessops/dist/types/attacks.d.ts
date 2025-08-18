/**
 * Compute attacks and rays.
 *
 * These are low-level functions that can be used to implement chess rules.
 *
 * Implementation notes: Sliding attacks are computed using
 * [Hyperbola Quintessence](https://www.chessprogramming.org/Hyperbola_Quintessence).
 * Magic Bitboards would deliver slightly faster lookups, but also require
 * initializing considerably larger attack tables. On the web, initialization
 * time is important, so the chosen method may strike a better balance.
 *
 * @packageDocumentation
 */
import { SquareSet } from './squareSet.js';
import { Color, Piece, Square } from './types.js';
/**
 * Gets squares attacked or defended by a king on `square`.
 */
export declare const kingAttacks: (square: Square) => SquareSet;
/**
 * Gets squares attacked or defended by a knight on `square`.
 */
export declare const knightAttacks: (square: Square) => SquareSet;
/**
 * Gets squares attacked or defended by a pawn of the given `color`
 * on `square`.
 */
export declare const pawnAttacks: (color: Color, square: Square) => SquareSet;
/**
 * Gets squares attacked or defended by a bishop on `square`, given `occupied`
 * squares.
 */
export declare const bishopAttacks: (square: Square, occupied: SquareSet) => SquareSet;
/**
 * Gets squares attacked or defended by a rook on `square`, given `occupied`
 * squares.
 */
export declare const rookAttacks: (square: Square, occupied: SquareSet) => SquareSet;
/**
 * Gets squares attacked or defended by a queen on `square`, given `occupied`
 * squares.
 */
export declare const queenAttacks: (square: Square, occupied: SquareSet) => SquareSet;
/**
 * Gets squares attacked or defended by a `piece` on `square`, given
 * `occupied` squares.
 */
export declare const attacks: (piece: Piece, square: Square, occupied: SquareSet) => SquareSet;
/**
 * Gets all squares of the rank, file or diagonal with the two squares
 * `a` and `b`, or an empty set if they are not aligned.
 */
export declare const ray: (a: Square, b: Square) => SquareSet;
/**
 * Gets all squares between `a` and `b` (bounds not included), or an empty set
 * if they are not on the same rank, file or diagonal.
 */
export declare const between: (a: Square, b: Square) => SquareSet;
