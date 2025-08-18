"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSan = exports.makeSan = exports.makeSanVariation = exports.makeSanAndPlay = void 0;
const attacks_js_1 = require("./attacks.js");
const squareSet_js_1 = require("./squareSet.js");
const types_js_1 = require("./types.js");
const util_js_1 = require("./util.js");
const makeSanWithoutSuffix = (pos, move) => {
    let san = '';
    if ((0, types_js_1.isDrop)(move)) {
        if (move.role !== 'pawn')
            san = (0, util_js_1.roleToChar)(move.role).toUpperCase();
        san += '@' + (0, util_js_1.makeSquare)(move.to);
    }
    else {
        const role = pos.board.getRole(move.from);
        if (!role)
            return '--';
        if (role === 'king' && (pos.board[pos.turn].has(move.to) || Math.abs(move.to - move.from) === 2)) {
            san = move.to > move.from ? 'O-O' : 'O-O-O';
        }
        else {
            const capture = pos.board.occupied.has(move.to)
                || (role === 'pawn' && (0, util_js_1.squareFile)(move.from) !== (0, util_js_1.squareFile)(move.to));
            if (role !== 'pawn') {
                san = (0, util_js_1.roleToChar)(role).toUpperCase();
                // Disambiguation
                let others;
                if (role === 'king')
                    others = (0, attacks_js_1.kingAttacks)(move.to).intersect(pos.board.king);
                else if (role === 'queen')
                    others = (0, attacks_js_1.queenAttacks)(move.to, pos.board.occupied).intersect(pos.board.queen);
                else if (role === 'rook')
                    others = (0, attacks_js_1.rookAttacks)(move.to, pos.board.occupied).intersect(pos.board.rook);
                else if (role === 'bishop')
                    others = (0, attacks_js_1.bishopAttacks)(move.to, pos.board.occupied).intersect(pos.board.bishop);
                else
                    others = (0, attacks_js_1.knightAttacks)(move.to).intersect(pos.board.knight);
                others = others.intersect(pos.board[pos.turn]).without(move.from);
                if (others.nonEmpty()) {
                    const ctx = pos.ctx();
                    for (const from of others) {
                        if (!pos.dests(from, ctx).has(move.to))
                            others = others.without(from);
                    }
                    if (others.nonEmpty()) {
                        let row = false;
                        let column = others.intersects(squareSet_js_1.SquareSet.fromRank((0, util_js_1.squareRank)(move.from)));
                        if (others.intersects(squareSet_js_1.SquareSet.fromFile((0, util_js_1.squareFile)(move.from))))
                            row = true;
                        else
                            column = true;
                        if (column)
                            san += types_js_1.FILE_NAMES[(0, util_js_1.squareFile)(move.from)];
                        if (row)
                            san += types_js_1.RANK_NAMES[(0, util_js_1.squareRank)(move.from)];
                    }
                }
            }
            else if (capture)
                san = types_js_1.FILE_NAMES[(0, util_js_1.squareFile)(move.from)];
            if (capture)
                san += 'x';
            san += (0, util_js_1.makeSquare)(move.to);
            if (move.promotion)
                san += '=' + (0, util_js_1.roleToChar)(move.promotion).toUpperCase();
        }
    }
    return san;
};
const makeSanAndPlay = (pos, move) => {
    var _a;
    const san = makeSanWithoutSuffix(pos, move);
    pos.play(move);
    if ((_a = pos.outcome()) === null || _a === void 0 ? void 0 : _a.winner)
        return san + '#';
    if (pos.isCheck())
        return san + '+';
    return san;
};
exports.makeSanAndPlay = makeSanAndPlay;
const makeSanVariation = (pos, variation) => {
    var _a;
    pos = pos.clone();
    const line = [];
    for (let i = 0; i < variation.length; i++) {
        if (i !== 0)
            line.push(' ');
        if (pos.turn === 'white')
            line.push(pos.fullmoves, '. ');
        else if (i === 0)
            line.push(pos.fullmoves, '... ');
        const san = makeSanWithoutSuffix(pos, variation[i]);
        pos.play(variation[i]);
        line.push(san);
        if (san === '--')
            return line.join('');
        if (i === variation.length - 1 && ((_a = pos.outcome()) === null || _a === void 0 ? void 0 : _a.winner))
            line.push('#');
        else if (pos.isCheck())
            line.push('+');
    }
    return line.join('');
};
exports.makeSanVariation = makeSanVariation;
const makeSan = (pos, move) => (0, exports.makeSanAndPlay)(pos.clone(), move);
exports.makeSan = makeSan;
const parseSan = (pos, san) => {
    const ctx = pos.ctx();
    // Normal move
    const match = san.match(/^([NBRQK])?([a-h])?([1-8])?[-x]?([a-h][1-8])(?:=?([nbrqkNBRQK]))?[+#]?$/);
    if (!match) {
        // Castling
        let castlingSide;
        if (san === 'O-O' || san === 'O-O+' || san === 'O-O#')
            castlingSide = 'h';
        else if (san === 'O-O-O' || san === 'O-O-O+' || san === 'O-O-O#')
            castlingSide = 'a';
        if (castlingSide) {
            const rook = pos.castles.rook[pos.turn][castlingSide];
            if (!(0, util_js_1.defined)(ctx.king) || !(0, util_js_1.defined)(rook) || !pos.dests(ctx.king, ctx).has(rook))
                return;
            return {
                from: ctx.king,
                to: rook,
            };
        }
        // Drop
        const match = san.match(/^([pnbrqkPNBRQK])?@([a-h][1-8])[+#]?$/);
        if (!match)
            return;
        const move = {
            role: match[1] ? (0, util_js_1.charToRole)(match[1]) : 'pawn',
            to: (0, util_js_1.parseSquare)(match[2]),
        };
        return pos.isLegal(move, ctx) ? move : undefined;
    }
    const role = match[1] ? (0, util_js_1.charToRole)(match[1]) : 'pawn';
    const to = (0, util_js_1.parseSquare)(match[4]);
    const promotion = match[5] ? (0, util_js_1.charToRole)(match[5]) : undefined;
    if (!!promotion !== (role === 'pawn' && squareSet_js_1.SquareSet.backranks().has(to)))
        return;
    if (promotion === 'king' && pos.rules !== 'antichess')
        return;
    let candidates = pos.board.pieces(pos.turn, role);
    if (role === 'pawn' && !match[2])
        candidates = candidates.intersect(squareSet_js_1.SquareSet.fromFile((0, util_js_1.squareFile)(to)));
    else if (match[2])
        candidates = candidates.intersect(squareSet_js_1.SquareSet.fromFile(match[2].charCodeAt(0) - 'a'.charCodeAt(0)));
    if (match[3])
        candidates = candidates.intersect(squareSet_js_1.SquareSet.fromRank(match[3].charCodeAt(0) - '1'.charCodeAt(0)));
    // Optimization: Reduce set of candidates
    const pawnAdvance = role === 'pawn' ? squareSet_js_1.SquareSet.fromFile((0, util_js_1.squareFile)(to)) : squareSet_js_1.SquareSet.empty();
    candidates = candidates.intersect(pawnAdvance.union((0, attacks_js_1.attacks)({ color: (0, util_js_1.opposite)(pos.turn), role }, to, pos.board.occupied)));
    // Check uniqueness and legality
    let from;
    for (const candidate of candidates) {
        if (pos.dests(candidate, ctx).has(to)) {
            if ((0, util_js_1.defined)(from))
                return; // Ambiguous
            from = candidate;
        }
    }
    if (!(0, util_js_1.defined)(from))
        return; // Illegal
    return {
        from,
        to,
        promotion,
    };
};
exports.parseSan = parseSan;
//# sourceMappingURL=san.js.map