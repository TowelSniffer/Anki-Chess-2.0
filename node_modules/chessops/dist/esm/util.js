import { FILE_NAMES, isDrop, isNormal, RANK_NAMES, } from './types.js';
export const defined = (v) => v !== undefined;
export const opposite = (color) => (color === 'white' ? 'black' : 'white');
export const squareRank = (square) => square >> 3;
export const squareFile = (square) => square & 0x7;
export const squareFromCoords = (file, rank) => 0 <= file && file < 8 && 0 <= rank && rank < 8 ? file + 8 * rank : undefined;
export const roleToChar = (role) => {
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
export function charToRole(ch) {
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
export function parseSquare(str) {
    if (str.length !== 2)
        return;
    return squareFromCoords(str.charCodeAt(0) - 'a'.charCodeAt(0), str.charCodeAt(1) - '1'.charCodeAt(0));
}
export const makeSquare = (square) => (FILE_NAMES[squareFile(square)] + RANK_NAMES[squareRank(square)]);
export const parseUci = (str) => {
    if (str[1] === '@' && str.length === 4) {
        const role = charToRole(str[0]);
        const to = parseSquare(str.slice(2));
        if (role && defined(to))
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
        if (defined(from) && defined(to))
            return { from, to, promotion };
    }
    return;
};
export const moveEquals = (left, right) => {
    if (left.to !== right.to)
        return false;
    if (isDrop(left))
        return isDrop(right) && left.role === right.role;
    else
        return isNormal(right) && left.from === right.from && left.promotion === right.promotion;
};
/**
 * Converts a move to UCI notation, like `g1f3` for a normal move,
 * `a7a8q` for promotion to a queen, and `Q@f7` for a Crazyhouse drop.
 */
export const makeUci = (move) => isDrop(move)
    ? `${roleToChar(move.role).toUpperCase()}@${makeSquare(move.to)}`
    : makeSquare(move.from) + makeSquare(move.to) + (move.promotion ? roleToChar(move.promotion) : '');
export const kingCastlesTo = (color, side) => color === 'white' ? (side === 'a' ? 2 : 6) : side === 'a' ? 58 : 62;
export const rookCastlesTo = (color, side) => color === 'white' ? (side === 'a' ? 3 : 5) : side === 'a' ? 59 : 61;
//# sourceMappingURL=util.js.map