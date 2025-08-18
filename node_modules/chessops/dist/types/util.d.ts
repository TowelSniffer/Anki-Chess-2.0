import { CastlingSide, Color, Move, Role, Square, SquareName } from './types.js';
export declare const defined: <A>(v: A | undefined) => v is A;
export declare const opposite: (color: Color) => Color;
export declare const squareRank: (square: Square) => number;
export declare const squareFile: (square: Square) => number;
export declare const squareFromCoords: (file: number, rank: number) => Square | undefined;
export declare const roleToChar: (role: Role) => string;
export declare function charToRole(ch: 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K'): Role;
export declare function charToRole(ch: string): Role | undefined;
export declare function parseSquare(str: SquareName): Square;
export declare function parseSquare(str: string): Square | undefined;
export declare const makeSquare: (square: Square) => SquareName;
export declare const parseUci: (str: string) => Move | undefined;
export declare const moveEquals: (left: Move, right: Move) => boolean;
/**
 * Converts a move to UCI notation, like `g1f3` for a normal move,
 * `a7a8q` for promotion to a queen, and `Q@f7` for a Crazyhouse drop.
 */
export declare const makeUci: (move: Move) => string;
export declare const kingCastlesTo: (color: Color, side: CastlingSide) => Square;
export declare const rookCastlesTo: (color: Color, side: CastlingSide) => Square;
