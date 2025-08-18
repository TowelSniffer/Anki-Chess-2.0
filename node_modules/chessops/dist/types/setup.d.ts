import { Board } from './board.js';
import { SquareSet } from './squareSet.js';
import { ByColor, ByRole, Color, Role, Square } from './types.js';
export declare class MaterialSide implements ByRole<number> {
    pawn: number;
    knight: number;
    bishop: number;
    rook: number;
    queen: number;
    king: number;
    private constructor();
    static empty(): MaterialSide;
    static fromBoard(board: Board, color: Color): MaterialSide;
    clone(): MaterialSide;
    equals(other: MaterialSide): boolean;
    add(other: MaterialSide): MaterialSide;
    subtract(other: MaterialSide): MaterialSide;
    nonEmpty(): boolean;
    isEmpty(): boolean;
    hasPawns(): boolean;
    hasNonPawns(): boolean;
    size(): number;
}
export declare class Material implements ByColor<MaterialSide> {
    white: MaterialSide;
    black: MaterialSide;
    constructor(white: MaterialSide, black: MaterialSide);
    static empty(): Material;
    static fromBoard(board: Board): Material;
    clone(): Material;
    equals(other: Material): boolean;
    add(other: Material): Material;
    subtract(other: Material): Material;
    count(role: Role): number;
    size(): number;
    isEmpty(): boolean;
    nonEmpty(): boolean;
    hasPawns(): boolean;
    hasNonPawns(): boolean;
}
export declare class RemainingChecks implements ByColor<number> {
    white: number;
    black: number;
    constructor(white: number, black: number);
    static default(): RemainingChecks;
    clone(): RemainingChecks;
    equals(other: RemainingChecks): boolean;
}
/**
 * A not necessarily legal chess or chess variant position.
 */
export interface Setup {
    board: Board;
    pockets: Material | undefined;
    turn: Color;
    castlingRights: SquareSet;
    epSquare: Square | undefined;
    remainingChecks: RemainingChecks | undefined;
    halfmoves: number;
    fullmoves: number;
}
export declare const defaultSetup: () => Setup;
export declare const setupClone: (setup: Setup) => Setup;
export declare const setupEquals: (left: Setup, right: Setup) => boolean;
