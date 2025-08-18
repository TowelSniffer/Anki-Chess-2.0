"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boardEquals = exports.Board = void 0;
const squareSet_js_1 = require("./squareSet.js");
const types_js_1 = require("./types.js");
/**
 * Piece positions on a board.
 *
 * Properties are sets of squares, like `board.occupied` for all occupied
 * squares, `board[color]` for all pieces of that color, and `board[role]`
 * for all pieces of that role. When modifying the properties directly, take
 * care to keep them consistent.
 */
class Board {
    constructor() { }
    static default() {
        const board = new Board();
        board.reset();
        return board;
    }
    /**
     * Resets all pieces to the default starting position for standard chess.
     */
    reset() {
        this.occupied = new squareSet_js_1.SquareSet(0xffff, 4294901760);
        this.promoted = squareSet_js_1.SquareSet.empty();
        this.white = new squareSet_js_1.SquareSet(0xffff, 0);
        this.black = new squareSet_js_1.SquareSet(0, 4294901760);
        this.pawn = new squareSet_js_1.SquareSet(0xff00, 16711680);
        this.knight = new squareSet_js_1.SquareSet(0x42, 1107296256);
        this.bishop = new squareSet_js_1.SquareSet(0x24, 603979776);
        this.rook = new squareSet_js_1.SquareSet(0x81, 2164260864);
        this.queen = new squareSet_js_1.SquareSet(0x8, 134217728);
        this.king = new squareSet_js_1.SquareSet(0x10, 268435456);
    }
    static empty() {
        const board = new Board();
        board.clear();
        return board;
    }
    clear() {
        this.occupied = squareSet_js_1.SquareSet.empty();
        this.promoted = squareSet_js_1.SquareSet.empty();
        for (const color of types_js_1.COLORS)
            this[color] = squareSet_js_1.SquareSet.empty();
        for (const role of types_js_1.ROLES)
            this[role] = squareSet_js_1.SquareSet.empty();
    }
    clone() {
        const board = new Board();
        board.occupied = this.occupied;
        board.promoted = this.promoted;
        for (const color of types_js_1.COLORS)
            board[color] = this[color];
        for (const role of types_js_1.ROLES)
            board[role] = this[role];
        return board;
    }
    getColor(square) {
        if (this.white.has(square))
            return 'white';
        if (this.black.has(square))
            return 'black';
        return;
    }
    getRole(square) {
        for (const role of types_js_1.ROLES) {
            if (this[role].has(square))
                return role;
        }
        return;
    }
    get(square) {
        const color = this.getColor(square);
        if (!color)
            return;
        const role = this.getRole(square);
        const promoted = this.promoted.has(square);
        return { color, role, promoted };
    }
    /**
     * Removes and returns the piece from the given `square`, if any.
     */
    take(square) {
        const piece = this.get(square);
        if (piece) {
            this.occupied = this.occupied.without(square);
            this[piece.color] = this[piece.color].without(square);
            this[piece.role] = this[piece.role].without(square);
            if (piece.promoted)
                this.promoted = this.promoted.without(square);
        }
        return piece;
    }
    /**
     * Put `piece` onto `square`, potentially replacing an existing piece.
     * Returns the existing piece, if any.
     */
    set(square, piece) {
        const old = this.take(square);
        this.occupied = this.occupied.with(square);
        this[piece.color] = this[piece.color].with(square);
        this[piece.role] = this[piece.role].with(square);
        if (piece.promoted)
            this.promoted = this.promoted.with(square);
        return old;
    }
    has(square) {
        return this.occupied.has(square);
    }
    *[Symbol.iterator]() {
        for (const square of this.occupied) {
            yield [square, this.get(square)];
        }
    }
    pieces(color, role) {
        return this[color].intersect(this[role]);
    }
    rooksAndQueens() {
        return this.rook.union(this.queen);
    }
    bishopsAndQueens() {
        return this.bishop.union(this.queen);
    }
    /**
     * Finds the unique king of the given `color`, if any.
     */
    kingOf(color) {
        return this.pieces(color, 'king').singleSquare();
    }
}
exports.Board = Board;
const boardEquals = (left, right) => left.white.equals(right.white)
    && left.promoted.equals(right.promoted)
    && types_js_1.ROLES.every(role => left[role].equals(right[role]));
exports.boardEquals = boardEquals;
//# sourceMappingURL=board.js.map