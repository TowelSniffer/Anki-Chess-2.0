import { SquareSet } from './squareSet.js';
import { ByColor, ByRole, Color, Piece, Role, Square } from './types.js';
/**
 * Piece positions on a board.
 *
 * Properties are sets of squares, like `board.occupied` for all occupied
 * squares, `board[color]` for all pieces of that color, and `board[role]`
 * for all pieces of that role. When modifying the properties directly, take
 * care to keep them consistent.
 */
export declare class Board implements Iterable<[Square, Piece]>, ByRole<SquareSet>, ByColor<SquareSet> {
    /**
     * All occupied squares.
     */
    occupied: SquareSet;
    /**
     * All squares occupied by pieces known to be promoted. This information is
     * relevant in chess variants like Crazyhouse.
     */
    promoted: SquareSet;
    white: SquareSet;
    black: SquareSet;
    pawn: SquareSet;
    knight: SquareSet;
    bishop: SquareSet;
    rook: SquareSet;
    queen: SquareSet;
    king: SquareSet;
    private constructor();
    static default(): Board;
    /**
     * Resets all pieces to the default starting position for standard chess.
     */
    reset(): void;
    static empty(): Board;
    clear(): void;
    clone(): Board;
    getColor(square: Square): Color | undefined;
    getRole(square: Square): Role | undefined;
    get(square: Square): Piece | undefined;
    /**
     * Removes and returns the piece from the given `square`, if any.
     */
    take(square: Square): Piece | undefined;
    /**
     * Put `piece` onto `square`, potentially replacing an existing piece.
     * Returns the existing piece, if any.
     */
    set(square: Square, piece: Piece): Piece | undefined;
    has(square: Square): boolean;
    [Symbol.iterator](): Iterator<[Square, Piece]>;
    pieces(color: Color, role: Role): SquareSet;
    rooksAndQueens(): SquareSet;
    bishopsAndQueens(): SquareSet;
    /**
     * Finds the unique king of the given `color`, if any.
     */
    kingOf(color: Color): Square | undefined;
}
export declare const boardEquals: (left: Board, right: Board) => boolean;
