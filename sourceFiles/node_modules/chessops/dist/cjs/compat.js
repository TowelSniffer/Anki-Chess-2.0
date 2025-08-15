"use strict";
/**
 * Compatibility with other libraries.
 *
 * Convert between the formats used by chessops,
 * [chessground](https://github.com/lichess-org/chessground),
 * and [scalachess](https://github.com/lichess-org/scalachess).
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.lichessVariant = exports.lichessRules = exports.scalachessCharPair = exports.chessgroundMove = exports.chessgroundDests = void 0;
const types_js_1 = require("./types.js");
const util_js_1 = require("./util.js");
/**
 * Computes the legal move destinations in the format used by chessground.
 *
 * Includes both possible representations of castling moves (unless
 * `chess960` mode is enabled), so that the `rookCastles` option will work
 * correctly.
 */
const chessgroundDests = (pos, opts) => {
    const result = new Map();
    const ctx = pos.ctx();
    for (const [from, squares] of pos.allDests(ctx)) {
        if (squares.nonEmpty()) {
            const d = Array.from(squares, util_js_1.makeSquare);
            if (!(opts === null || opts === void 0 ? void 0 : opts.chess960) && from === ctx.king && (0, util_js_1.squareFile)(from) === 4) {
                // Chessground needs both types of castling dests and filters based on
                // a rookCastles setting.
                if (squares.has(0))
                    d.push('c1');
                else if (squares.has(56))
                    d.push('c8');
                if (squares.has(7))
                    d.push('g1');
                else if (squares.has(63))
                    d.push('g8');
            }
            result.set((0, util_js_1.makeSquare)(from), d);
        }
    }
    return result;
};
exports.chessgroundDests = chessgroundDests;
const chessgroundMove = (move) => (0, types_js_1.isDrop)(move) ? [(0, util_js_1.makeSquare)(move.to)] : [(0, util_js_1.makeSquare)(move.from), (0, util_js_1.makeSquare)(move.to)];
exports.chessgroundMove = chessgroundMove;
const scalachessCharPair = (move) => (0, types_js_1.isDrop)(move)
    ? String.fromCharCode(35 + move.to, 35 + 64 + 8 * 5 + ['queen', 'rook', 'bishop', 'knight', 'pawn'].indexOf(move.role))
    : String.fromCharCode(35 + move.from, move.promotion
        ? 35 + 64 + 8 * ['queen', 'rook', 'bishop', 'knight', 'king'].indexOf(move.promotion) + (0, util_js_1.squareFile)(move.to)
        : 35 + move.to);
exports.scalachessCharPair = scalachessCharPair;
const lichessRules = (variant) => {
    switch (variant) {
        case 'standard':
        case 'chess960':
        case 'fromPosition':
            return 'chess';
        case 'threeCheck':
            return '3check';
        case 'kingOfTheHill':
            return 'kingofthehill';
        case 'racingKings':
            return 'racingkings';
        default:
            return variant;
    }
};
exports.lichessRules = lichessRules;
const lichessVariant = (rules) => {
    switch (rules) {
        case 'chess':
            return 'standard';
        case '3check':
            return 'threeCheck';
        case 'kingofthehill':
            return 'kingOfTheHill';
        case 'racingkings':
            return 'racingKings';
        default:
            return rules;
    }
};
exports.lichessVariant = lichessVariant;
//# sourceMappingURL=compat.js.map