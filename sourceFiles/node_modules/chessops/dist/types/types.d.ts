export declare const FILE_NAMES: readonly ["a", "b", "c", "d", "e", "f", "g", "h"];
export type FileName = (typeof FILE_NAMES)[number];
export declare const RANK_NAMES: readonly ["1", "2", "3", "4", "5", "6", "7", "8"];
export type RankName = (typeof RANK_NAMES)[number];
export type Square = number;
export type SquareName = `${FileName}${RankName}`;
/**
 * Indexable by square indices.
 */
export type BySquare<T> = T[];
export declare const COLORS: readonly ["white", "black"];
export type Color = (typeof COLORS)[number];
/**
 * Indexable by `white` and `black`.
 */
export type ByColor<T> = {
    [color in Color]: T;
};
export declare const ROLES: readonly ["pawn", "knight", "bishop", "rook", "queen", "king"];
export type Role = (typeof ROLES)[number];
/**
 * Indexable by `pawn`, `knight`, `bishop`, `rook`, `queen`, and `king`.
 */
export type ByRole<T> = {
    [role in Role]: T;
};
export declare const CASTLING_SIDES: readonly ["a", "h"];
export type CastlingSide = (typeof CASTLING_SIDES)[number];
/**
 * Indexable by `a` and `h`.
 */
export type ByCastlingSide<T> = {
    [side in CastlingSide]: T;
};
export interface Piece {
    role: Role;
    color: Color;
    promoted?: boolean;
}
export interface NormalMove {
    from: Square;
    to: Square;
    promotion?: Role;
}
export interface DropMove {
    role: Role;
    to: Square;
}
export type Move = NormalMove | DropMove;
export declare const isDrop: (v: Move) => v is DropMove;
export declare const isNormal: (v: Move) => v is NormalMove;
export declare const RULES: readonly ["chess", "antichess", "kingofthehill", "3check", "atomic", "horde", "racingkings", "crazyhouse"];
export type Rules = (typeof RULES)[number];
export interface Outcome {
    winner: Color | undefined;
}
