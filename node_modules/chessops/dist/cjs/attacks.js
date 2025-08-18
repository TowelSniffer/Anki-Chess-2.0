"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.between = exports.ray = exports.attacks = exports.queenAttacks = exports.rookAttacks = exports.bishopAttacks = exports.pawnAttacks = exports.knightAttacks = exports.kingAttacks = void 0;
const squareSet_js_1 = require("./squareSet.js");
const util_js_1 = require("./util.js");
const computeRange = (square, deltas) => {
    let range = squareSet_js_1.SquareSet.empty();
    for (const delta of deltas) {
        const sq = square + delta;
        if (0 <= sq && sq < 64 && Math.abs((0, util_js_1.squareFile)(square) - (0, util_js_1.squareFile)(sq)) <= 2) {
            range = range.with(sq);
        }
    }
    return range;
};
const tabulate = (f) => {
    const table = [];
    for (let square = 0; square < 64; square++)
        table[square] = f(square);
    return table;
};
const KING_ATTACKS = tabulate(sq => computeRange(sq, [-9, -8, -7, -1, 1, 7, 8, 9]));
const KNIGHT_ATTACKS = tabulate(sq => computeRange(sq, [-17, -15, -10, -6, 6, 10, 15, 17]));
const PAWN_ATTACKS = {
    white: tabulate(sq => computeRange(sq, [7, 9])),
    black: tabulate(sq => computeRange(sq, [-7, -9])),
};
/**
 * Gets squares attacked or defended by a king on `square`.
 */
const kingAttacks = (square) => KING_ATTACKS[square];
exports.kingAttacks = kingAttacks;
/**
 * Gets squares attacked or defended by a knight on `square`.
 */
const knightAttacks = (square) => KNIGHT_ATTACKS[square];
exports.knightAttacks = knightAttacks;
/**
 * Gets squares attacked or defended by a pawn of the given `color`
 * on `square`.
 */
const pawnAttacks = (color, square) => PAWN_ATTACKS[color][square];
exports.pawnAttacks = pawnAttacks;
const FILE_RANGE = tabulate(sq => squareSet_js_1.SquareSet.fromFile((0, util_js_1.squareFile)(sq)).without(sq));
const RANK_RANGE = tabulate(sq => squareSet_js_1.SquareSet.fromRank((0, util_js_1.squareRank)(sq)).without(sq));
const DIAG_RANGE = tabulate(sq => {
    const diag = new squareSet_js_1.SquareSet(134480385, 2151686160);
    const shift = 8 * ((0, util_js_1.squareRank)(sq) - (0, util_js_1.squareFile)(sq));
    return (shift >= 0 ? diag.shl64(shift) : diag.shr64(-shift)).without(sq);
});
const ANTI_DIAG_RANGE = tabulate(sq => {
    const diag = new squareSet_js_1.SquareSet(270549120, 16909320);
    const shift = 8 * ((0, util_js_1.squareRank)(sq) + (0, util_js_1.squareFile)(sq) - 7);
    return (shift >= 0 ? diag.shl64(shift) : diag.shr64(-shift)).without(sq);
});
const hyperbola = (bit, range, occupied) => {
    let forward = occupied.intersect(range);
    let reverse = forward.bswap64(); // Assumes no more than 1 bit per rank
    forward = forward.minus64(bit);
    reverse = reverse.minus64(bit.bswap64());
    return forward.xor(reverse.bswap64()).intersect(range);
};
const fileAttacks = (square, occupied) => hyperbola(squareSet_js_1.SquareSet.fromSquare(square), FILE_RANGE[square], occupied);
const rankAttacks = (square, occupied) => {
    const range = RANK_RANGE[square];
    let forward = occupied.intersect(range);
    let reverse = forward.rbit64();
    forward = forward.minus64(squareSet_js_1.SquareSet.fromSquare(square));
    reverse = reverse.minus64(squareSet_js_1.SquareSet.fromSquare(63 - square));
    return forward.xor(reverse.rbit64()).intersect(range);
};
/**
 * Gets squares attacked or defended by a bishop on `square`, given `occupied`
 * squares.
 */
const bishopAttacks = (square, occupied) => {
    const bit = squareSet_js_1.SquareSet.fromSquare(square);
    return hyperbola(bit, DIAG_RANGE[square], occupied).xor(hyperbola(bit, ANTI_DIAG_RANGE[square], occupied));
};
exports.bishopAttacks = bishopAttacks;
/**
 * Gets squares attacked or defended by a rook on `square`, given `occupied`
 * squares.
 */
const rookAttacks = (square, occupied) => fileAttacks(square, occupied).xor(rankAttacks(square, occupied));
exports.rookAttacks = rookAttacks;
/**
 * Gets squares attacked or defended by a queen on `square`, given `occupied`
 * squares.
 */
const queenAttacks = (square, occupied) => (0, exports.bishopAttacks)(square, occupied).xor((0, exports.rookAttacks)(square, occupied));
exports.queenAttacks = queenAttacks;
/**
 * Gets squares attacked or defended by a `piece` on `square`, given
 * `occupied` squares.
 */
const attacks = (piece, square, occupied) => {
    switch (piece.role) {
        case 'pawn':
            return (0, exports.pawnAttacks)(piece.color, square);
        case 'knight':
            return (0, exports.knightAttacks)(square);
        case 'bishop':
            return (0, exports.bishopAttacks)(square, occupied);
        case 'rook':
            return (0, exports.rookAttacks)(square, occupied);
        case 'queen':
            return (0, exports.queenAttacks)(square, occupied);
        case 'king':
            return (0, exports.kingAttacks)(square);
    }
};
exports.attacks = attacks;
/**
 * Gets all squares of the rank, file or diagonal with the two squares
 * `a` and `b`, or an empty set if they are not aligned.
 */
const ray = (a, b) => {
    const other = squareSet_js_1.SquareSet.fromSquare(b);
    if (RANK_RANGE[a].intersects(other))
        return RANK_RANGE[a].with(a);
    if (ANTI_DIAG_RANGE[a].intersects(other))
        return ANTI_DIAG_RANGE[a].with(a);
    if (DIAG_RANGE[a].intersects(other))
        return DIAG_RANGE[a].with(a);
    if (FILE_RANGE[a].intersects(other))
        return FILE_RANGE[a].with(a);
    return squareSet_js_1.SquareSet.empty();
};
exports.ray = ray;
/**
 * Gets all squares between `a` and `b` (bounds not included), or an empty set
 * if they are not on the same rank, file or diagonal.
 */
const between = (a, b) => (0, exports.ray)(a, b)
    .intersect(squareSet_js_1.SquareSet.full().shl64(a).xor(squareSet_js_1.SquareSet.full().shl64(b)))
    .withoutFirst();
exports.between = between;
//# sourceMappingURL=attacks.js.map