import { Color, Square } from './types.js';
/**
 * An immutable set of squares, implemented as a bitboard.
 */
export declare class SquareSet implements Iterable<Square> {
    readonly lo: number;
    readonly hi: number;
    constructor(lo: number, hi: number);
    static fromSquare(square: Square): SquareSet;
    static fromRank(rank: number): SquareSet;
    static fromFile(file: number): SquareSet;
    static empty(): SquareSet;
    static full(): SquareSet;
    static corners(): SquareSet;
    static center(): SquareSet;
    static backranks(): SquareSet;
    static backrank(color: Color): SquareSet;
    static lightSquares(): SquareSet;
    static darkSquares(): SquareSet;
    complement(): SquareSet;
    xor(other: SquareSet): SquareSet;
    union(other: SquareSet): SquareSet;
    intersect(other: SquareSet): SquareSet;
    diff(other: SquareSet): SquareSet;
    intersects(other: SquareSet): boolean;
    isDisjoint(other: SquareSet): boolean;
    supersetOf(other: SquareSet): boolean;
    subsetOf(other: SquareSet): boolean;
    shr64(shift: number): SquareSet;
    shl64(shift: number): SquareSet;
    bswap64(): SquareSet;
    rbit64(): SquareSet;
    minus64(other: SquareSet): SquareSet;
    equals(other: SquareSet): boolean;
    size(): number;
    isEmpty(): boolean;
    nonEmpty(): boolean;
    has(square: Square): boolean;
    set(square: Square, on: boolean): SquareSet;
    with(square: Square): SquareSet;
    without(square: Square): SquareSet;
    toggle(square: Square): SquareSet;
    last(): Square | undefined;
    first(): Square | undefined;
    withoutFirst(): SquareSet;
    moreThanOne(): boolean;
    singleSquare(): Square | undefined;
    [Symbol.iterator](): Iterator<Square>;
    reversed(): Iterable<Square>;
}
