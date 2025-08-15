"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rookCastlesTo = exports.kingCastlesTo = exports.makeUci = exports.moveEquals = exports.parseUci = exports.makeSquare = exports.roleToChar = exports.squareFromCoords = exports.squareFile = exports.squareRank = exports.opposite = exports.defined = void 0;
exports.charToRole = charToRole;
exports.parseSquare = parseSquare;
const types_js_1 = require("./types.js");
const defined = (v) => v !== undefined;
exports.defined = defined;
const opposite = (color) => (color === 'white' ? 'black' : 'white');
exports.opposite = opposite;
const squareRank = (square) => square >> 3;
exports.squareRank = squareRank;
const squareFile = (square) => square & 0x7;
exports.squareFile = squareFile;
const squareFromCoords = (file, rank) => 0 <= file && file < 8 && 0 <= rank && rank < 8 ? file + 8 * rank : undefined;
exports.squareFromCoords = squareFromCoords;
const roleToChar = (role) => {
    switch (role) {
        case 'pawn':
            return 'p';
        case 'knight':
            return 'n';
        case 'bishop':
            return 'b';
        case 'rook':
            return 'r';
        case 'queen':
            return 'q';
        case 'king':
            return 'k';
    }
};
exports.roleToChar = roleToChar;
function charToRole(ch) {
    switch (ch.toLowerCase()) {
        case 'p':
            return 'pawn';
        case 'n':
            return 'knight';
        case 'b':
            return 'bishop';
        case 'r':
            return 'rook';
        case 'q':
            return 'queen';
        case 'k':
            return 'king';
        default:
            return;
    }
}
function parseSquare(str) {
    if (str.length !== 2)
        return;
    return (0, exports.squareFromCoords)(str.charCodeAt(0) - 'a'.charCodeAt(0), str.charCodeAt(1) - '1'.charCodeAt(0));
}
const makeSquare = (square) => (types_js_1.FILE_NAMES[(0, exports.squareFile)(square)] + types_js_1.RANK_NAMES[(0, exports.squareRank)(square)]);
exports.makeSquare = makeSquare;
const parseUci = (str) => {
    if (str[1] === '@' && str.length === 4) {
        const role = charToRole(str[0]);
        const to = parseSquare(str.slice(2));
        if (role && (0, exports.defined)(to))
            return { role, to };
    }
    else if (str.length === 4 || str.length === 5) {
        const from = parseSquare(str.slice(0, 2));
        const to = parseSquare(str.slice(2, 4));
        let promotion;
        if (str.length === 5) {
            promotion = charToRole(str[4]);
            if (!promotion)
                return;
        }
        if ((0, exports.defined)(from) && (0, exports.defined)(to))
            return { from, to, promotion };
    }
    return;
};
exports.parseUci = parseUci;
const moveEquals = (left, right) => {
    if (left.to !== right.to)
        return false;
    if ((0, types_js_1.isDrop)(left))
        return (0, types_js_1.isDrop)(right) && left.role === right.role;
    else
        return (0, types_js_1.isNormal)(right) && left.from === right.from && left.promotion === right.promotion;
};
exports.moveEquals = moveEquals;
/**
 * Converts a move to UCI notation, like `g1f3` for a normal move,
 * `a7a8q` for promotion to a queen, and `Q@f7` for a Crazyhouse drop.
 */
const makeUci = (move) => (0, types_js_1.isDrop)(move)
    ? `${(0, exports.roleToChar)(move.role).toUpperCase()}@${(0, exports.makeSquare)(move.to)}`
    : (0, exports.makeSquare)(move.from) + (0, exports.makeSquare)(move.to) + (move.promotion ? (0, exports.roleToChar)(move.promotion) : '');
exports.makeUci = makeUci;
const kingCastlesTo = (color, side) => color === 'white' ? (side === 'a' ? 2 : 6) : side === 'a' ? 58 : 62;
exports.kingCastlesTo = kingCastlesTo;
const rookCastlesTo = (color, side) => color === 'white' ? (side === 'a' ? 3 : 5) : side === 'a' ? 59 : 61;
exports.rookCastlesTo = rookCastlesTo;
//# sourceMappingURL=util.js.map