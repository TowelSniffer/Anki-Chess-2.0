"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFen = exports.makeRemainingChecks = exports.makeCastlingFen = exports.makePockets = exports.makePocket = exports.makeBoardFen = exports.makePiece = exports.parsePiece = exports.parseFen = exports.parseRemainingChecks = exports.parseCastlingFen = exports.parsePockets = exports.parseBoardFen = exports.FenError = exports.InvalidFen = exports.EMPTY_FEN = exports.EMPTY_EPD = exports.EMPTY_BOARD_FEN = exports.INITIAL_FEN = exports.INITIAL_EPD = exports.INITIAL_BOARD_FEN = void 0;
const result_1 = require("@badrap/result");
const board_js_1 = require("./board.js");
const setup_js_1 = require("./setup.js");
const squareSet_js_1 = require("./squareSet.js");
const types_js_1 = require("./types.js");
const util_js_1 = require("./util.js");
exports.INITIAL_BOARD_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
exports.INITIAL_EPD = exports.INITIAL_BOARD_FEN + ' w KQkq -';
exports.INITIAL_FEN = exports.INITIAL_EPD + ' 0 1';
exports.EMPTY_BOARD_FEN = '8/8/8/8/8/8/8/8';
exports.EMPTY_EPD = exports.EMPTY_BOARD_FEN + ' w - -';
exports.EMPTY_FEN = exports.EMPTY_EPD + ' 0 1';
var InvalidFen;
(function (InvalidFen) {
    InvalidFen["Fen"] = "ERR_FEN";
    InvalidFen["Board"] = "ERR_BOARD";
    InvalidFen["Pockets"] = "ERR_POCKETS";
    InvalidFen["Turn"] = "ERR_TURN";
    InvalidFen["Castling"] = "ERR_CASTLING";
    InvalidFen["EpSquare"] = "ERR_EP_SQUARE";
    InvalidFen["RemainingChecks"] = "ERR_REMAINING_CHECKS";
    InvalidFen["Halfmoves"] = "ERR_HALFMOVES";
    InvalidFen["Fullmoves"] = "ERR_FULLMOVES";
})(InvalidFen || (exports.InvalidFen = InvalidFen = {}));
class FenError extends Error {
}
exports.FenError = FenError;
const nthIndexOf = (haystack, needle, n) => {
    let index = haystack.indexOf(needle);
    while (n-- > 0) {
        if (index === -1)
            break;
        index = haystack.indexOf(needle, index + needle.length);
    }
    return index;
};
const parseSmallUint = (str) => (/^\d{1,4}$/.test(str) ? parseInt(str, 10) : undefined);
const charToPiece = (ch) => {
    const role = (0, util_js_1.charToRole)(ch);
    return role && { role, color: ch.toLowerCase() === ch ? 'black' : 'white' };
};
const parseBoardFen = (boardPart) => {
    const board = board_js_1.Board.empty();
    let rank = 7;
    let file = 0;
    for (let i = 0; i < boardPart.length; i++) {
        const c = boardPart[i];
        if (c === '/' && file === 8) {
            file = 0;
            rank--;
        }
        else {
            const step = parseInt(c, 10);
            if (step > 0)
                file += step;
            else {
                if (file >= 8 || rank < 0)
                    return result_1.Result.err(new FenError(InvalidFen.Board));
                const square = file + rank * 8;
                const piece = charToPiece(c);
                if (!piece)
                    return result_1.Result.err(new FenError(InvalidFen.Board));
                if (boardPart[i + 1] === '~') {
                    piece.promoted = true;
                    i++;
                }
                board.set(square, piece);
                file++;
            }
        }
    }
    if (rank !== 0 || file !== 8)
        return result_1.Result.err(new FenError(InvalidFen.Board));
    return result_1.Result.ok(board);
};
exports.parseBoardFen = parseBoardFen;
const parsePockets = (pocketPart) => {
    if (pocketPart.length > 64)
        return result_1.Result.err(new FenError(InvalidFen.Pockets));
    const pockets = setup_js_1.Material.empty();
    for (const c of pocketPart) {
        const piece = charToPiece(c);
        if (!piece)
            return result_1.Result.err(new FenError(InvalidFen.Pockets));
        pockets[piece.color][piece.role]++;
    }
    return result_1.Result.ok(pockets);
};
exports.parsePockets = parsePockets;
const parseCastlingFen = (board, castlingPart) => {
    let castlingRights = squareSet_js_1.SquareSet.empty();
    if (castlingPart === '-')
        return result_1.Result.ok(castlingRights);
    for (const c of castlingPart) {
        const lower = c.toLowerCase();
        const color = c === lower ? 'black' : 'white';
        const rank = color === 'white' ? 0 : 7;
        if ('a' <= lower && lower <= 'h') {
            castlingRights = castlingRights.with((0, util_js_1.squareFromCoords)(lower.charCodeAt(0) - 'a'.charCodeAt(0), rank));
        }
        else if (lower === 'k' || lower === 'q') {
            const rooksAndKings = board[color].intersect(squareSet_js_1.SquareSet.backrank(color)).intersect(board.rook.union(board.king));
            const candidate = lower === 'k' ? rooksAndKings.last() : rooksAndKings.first();
            castlingRights = castlingRights.with((0, util_js_1.defined)(candidate) && board.rook.has(candidate) ? candidate : (0, util_js_1.squareFromCoords)(lower === 'k' ? 7 : 0, rank));
        }
        else
            return result_1.Result.err(new FenError(InvalidFen.Castling));
    }
    if (types_js_1.COLORS.some(color => squareSet_js_1.SquareSet.backrank(color).intersect(castlingRights).size() > 2)) {
        return result_1.Result.err(new FenError(InvalidFen.Castling));
    }
    return result_1.Result.ok(castlingRights);
};
exports.parseCastlingFen = parseCastlingFen;
const parseRemainingChecks = (part) => {
    const parts = part.split('+');
    if (parts.length === 3 && parts[0] === '') {
        const white = parseSmallUint(parts[1]);
        const black = parseSmallUint(parts[2]);
        if (!(0, util_js_1.defined)(white) || white > 3 || !(0, util_js_1.defined)(black) || black > 3) {
            return result_1.Result.err(new FenError(InvalidFen.RemainingChecks));
        }
        return result_1.Result.ok(new setup_js_1.RemainingChecks(3 - white, 3 - black));
    }
    else if (parts.length === 2) {
        const white = parseSmallUint(parts[0]);
        const black = parseSmallUint(parts[1]);
        if (!(0, util_js_1.defined)(white) || white > 3 || !(0, util_js_1.defined)(black) || black > 3) {
            return result_1.Result.err(new FenError(InvalidFen.RemainingChecks));
        }
        return result_1.Result.ok(new setup_js_1.RemainingChecks(white, black));
    }
    else
        return result_1.Result.err(new FenError(InvalidFen.RemainingChecks));
};
exports.parseRemainingChecks = parseRemainingChecks;
const parseFen = (fen) => {
    const parts = fen.split(/[\s_]+/);
    const boardPart = parts.shift();
    // Board and pockets
    let board;
    let pockets = result_1.Result.ok(undefined);
    if (boardPart.endsWith(']')) {
        const pocketStart = boardPart.indexOf('[');
        if (pocketStart === -1)
            return result_1.Result.err(new FenError(InvalidFen.Fen));
        board = (0, exports.parseBoardFen)(boardPart.slice(0, pocketStart));
        pockets = (0, exports.parsePockets)(boardPart.slice(pocketStart + 1, -1));
    }
    else {
        const pocketStart = nthIndexOf(boardPart, '/', 7);
        if (pocketStart === -1)
            board = (0, exports.parseBoardFen)(boardPart);
        else {
            board = (0, exports.parseBoardFen)(boardPart.slice(0, pocketStart));
            pockets = (0, exports.parsePockets)(boardPart.slice(pocketStart + 1));
        }
    }
    // Turn
    let turn;
    const turnPart = parts.shift();
    if (!(0, util_js_1.defined)(turnPart) || turnPart === 'w')
        turn = 'white';
    else if (turnPart === 'b')
        turn = 'black';
    else
        return result_1.Result.err(new FenError(InvalidFen.Turn));
    return board.chain(board => {
        // Castling
        const castlingPart = parts.shift();
        const castlingRights = (0, util_js_1.defined)(castlingPart) ? (0, exports.parseCastlingFen)(board, castlingPart) : result_1.Result.ok(squareSet_js_1.SquareSet.empty());
        // En passant square
        const epPart = parts.shift();
        let epSquare;
        if ((0, util_js_1.defined)(epPart) && epPart !== '-') {
            epSquare = (0, util_js_1.parseSquare)(epPart);
            if (!(0, util_js_1.defined)(epSquare))
                return result_1.Result.err(new FenError(InvalidFen.EpSquare));
        }
        // Halfmoves or remaining checks
        let halfmovePart = parts.shift();
        let earlyRemainingChecks;
        if ((0, util_js_1.defined)(halfmovePart) && halfmovePart.includes('+')) {
            earlyRemainingChecks = (0, exports.parseRemainingChecks)(halfmovePart);
            halfmovePart = parts.shift();
        }
        const halfmoves = (0, util_js_1.defined)(halfmovePart) ? parseSmallUint(halfmovePart) : 0;
        if (!(0, util_js_1.defined)(halfmoves))
            return result_1.Result.err(new FenError(InvalidFen.Halfmoves));
        const fullmovesPart = parts.shift();
        const fullmoves = (0, util_js_1.defined)(fullmovesPart) ? parseSmallUint(fullmovesPart) : 1;
        if (!(0, util_js_1.defined)(fullmoves))
            return result_1.Result.err(new FenError(InvalidFen.Fullmoves));
        const remainingChecksPart = parts.shift();
        let remainingChecks = result_1.Result.ok(undefined);
        if ((0, util_js_1.defined)(remainingChecksPart)) {
            if ((0, util_js_1.defined)(earlyRemainingChecks))
                return result_1.Result.err(new FenError(InvalidFen.RemainingChecks));
            remainingChecks = (0, exports.parseRemainingChecks)(remainingChecksPart);
        }
        else if ((0, util_js_1.defined)(earlyRemainingChecks)) {
            remainingChecks = earlyRemainingChecks;
        }
        if (parts.length > 0)
            return result_1.Result.err(new FenError(InvalidFen.Fen));
        return pockets.chain(pockets => castlingRights.chain(castlingRights => remainingChecks.map(remainingChecks => {
            return {
                board,
                pockets,
                turn,
                castlingRights,
                remainingChecks,
                epSquare,
                halfmoves,
                fullmoves: Math.max(1, fullmoves),
            };
        })));
    });
};
exports.parseFen = parseFen;
const parsePiece = (str) => {
    if (!str)
        return;
    const piece = charToPiece(str[0]);
    if (!piece)
        return;
    if (str.length === 2 && str[1] === '~')
        piece.promoted = true;
    else if (str.length > 1)
        return;
    return piece;
};
exports.parsePiece = parsePiece;
const makePiece = (piece) => {
    let r = (0, util_js_1.roleToChar)(piece.role);
    if (piece.color === 'white')
        r = r.toUpperCase();
    if (piece.promoted)
        r += '~';
    return r;
};
exports.makePiece = makePiece;
const makeBoardFen = (board) => {
    let fen = '';
    let empty = 0;
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            const square = file + rank * 8;
            const piece = board.get(square);
            if (!piece)
                empty++;
            else {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                fen += (0, exports.makePiece)(piece);
            }
            if (file === 7) {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                if (rank !== 0)
                    fen += '/';
            }
        }
    }
    return fen;
};
exports.makeBoardFen = makeBoardFen;
const makePocket = (material) => types_js_1.ROLES.map(role => (0, util_js_1.roleToChar)(role).repeat(material[role])).join('');
exports.makePocket = makePocket;
const makePockets = (pocket) => (0, exports.makePocket)(pocket.white).toUpperCase() + (0, exports.makePocket)(pocket.black);
exports.makePockets = makePockets;
const makeCastlingFen = (board, castlingRights) => {
    let fen = '';
    for (const color of types_js_1.COLORS) {
        const backrank = squareSet_js_1.SquareSet.backrank(color);
        let king = board.kingOf(color);
        if ((0, util_js_1.defined)(king) && !backrank.has(king))
            king = undefined;
        const candidates = board.pieces(color, 'rook').intersect(backrank);
        for (const rook of castlingRights.intersect(backrank).reversed()) {
            if (rook === candidates.first() && (0, util_js_1.defined)(king) && rook < king) {
                fen += color === 'white' ? 'Q' : 'q';
            }
            else if (rook === candidates.last() && (0, util_js_1.defined)(king) && king < rook) {
                fen += color === 'white' ? 'K' : 'k';
            }
            else {
                const file = types_js_1.FILE_NAMES[(0, util_js_1.squareFile)(rook)];
                fen += color === 'white' ? file.toUpperCase() : file;
            }
        }
    }
    return fen || '-';
};
exports.makeCastlingFen = makeCastlingFen;
const makeRemainingChecks = (checks) => `${checks.white}+${checks.black}`;
exports.makeRemainingChecks = makeRemainingChecks;
const makeFen = (setup, opts) => [
    (0, exports.makeBoardFen)(setup.board) + (setup.pockets ? `[${(0, exports.makePockets)(setup.pockets)}]` : ''),
    setup.turn[0],
    (0, exports.makeCastlingFen)(setup.board, setup.castlingRights),
    (0, util_js_1.defined)(setup.epSquare) ? (0, util_js_1.makeSquare)(setup.epSquare) : '-',
    ...(setup.remainingChecks ? [(0, exports.makeRemainingChecks)(setup.remainingChecks)] : []),
    ...((opts === null || opts === void 0 ? void 0 : opts.epd) ? [] : [Math.max(0, Math.min(setup.halfmoves, 9999)), Math.max(1, Math.min(setup.fullmoves, 9999))]),
].join(' ');
exports.makeFen = makeFen;
//# sourceMappingURL=fen.js.map