"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isImpossibleCheck = exports.isStandardMaterial = exports.isStandardMaterialSide = exports.normalizeMove = exports.castlingSide = exports.equalsIgnoreMoves = exports.pseudoDests = exports.Chess = exports.Position = exports.Castles = exports.PositionError = exports.IllegalSetup = void 0;
const result_1 = require("@badrap/result");
const attacks_js_1 = require("./attacks.js");
const board_js_1 = require("./board.js");
const squareSet_js_1 = require("./squareSet.js");
const types_js_1 = require("./types.js");
const util_js_1 = require("./util.js");
var IllegalSetup;
(function (IllegalSetup) {
    IllegalSetup["Empty"] = "ERR_EMPTY";
    IllegalSetup["OppositeCheck"] = "ERR_OPPOSITE_CHECK";
    IllegalSetup["PawnsOnBackrank"] = "ERR_PAWNS_ON_BACKRANK";
    IllegalSetup["Kings"] = "ERR_KINGS";
    IllegalSetup["Variant"] = "ERR_VARIANT";
})(IllegalSetup || (exports.IllegalSetup = IllegalSetup = {}));
class PositionError extends Error {
}
exports.PositionError = PositionError;
const attacksTo = (square, attacker, board, occupied) => board[attacker].intersect((0, attacks_js_1.rookAttacks)(square, occupied)
    .intersect(board.rooksAndQueens())
    .union((0, attacks_js_1.bishopAttacks)(square, occupied).intersect(board.bishopsAndQueens()))
    .union((0, attacks_js_1.knightAttacks)(square).intersect(board.knight))
    .union((0, attacks_js_1.kingAttacks)(square).intersect(board.king))
    .union((0, attacks_js_1.pawnAttacks)((0, util_js_1.opposite)(attacker), square).intersect(board.pawn)));
class Castles {
    constructor() { }
    static default() {
        const castles = new Castles();
        castles.castlingRights = squareSet_js_1.SquareSet.corners();
        castles.rook = {
            white: { a: 0, h: 7 },
            black: { a: 56, h: 63 },
        };
        castles.path = {
            white: { a: new squareSet_js_1.SquareSet(0xe, 0), h: new squareSet_js_1.SquareSet(0x60, 0) },
            black: { a: new squareSet_js_1.SquareSet(0, 0x0e000000), h: new squareSet_js_1.SquareSet(0, 0x60000000) },
        };
        return castles;
    }
    static empty() {
        const castles = new Castles();
        castles.castlingRights = squareSet_js_1.SquareSet.empty();
        castles.rook = {
            white: { a: undefined, h: undefined },
            black: { a: undefined, h: undefined },
        };
        castles.path = {
            white: { a: squareSet_js_1.SquareSet.empty(), h: squareSet_js_1.SquareSet.empty() },
            black: { a: squareSet_js_1.SquareSet.empty(), h: squareSet_js_1.SquareSet.empty() },
        };
        return castles;
    }
    clone() {
        const castles = new Castles();
        castles.castlingRights = this.castlingRights;
        castles.rook = {
            white: { a: this.rook.white.a, h: this.rook.white.h },
            black: { a: this.rook.black.a, h: this.rook.black.h },
        };
        castles.path = {
            white: { a: this.path.white.a, h: this.path.white.h },
            black: { a: this.path.black.a, h: this.path.black.h },
        };
        return castles;
    }
    add(color, side, king, rook) {
        const kingTo = (0, util_js_1.kingCastlesTo)(color, side);
        const rookTo = (0, util_js_1.rookCastlesTo)(color, side);
        this.castlingRights = this.castlingRights.with(rook);
        this.rook[color][side] = rook;
        this.path[color][side] = (0, attacks_js_1.between)(rook, rookTo)
            .with(rookTo)
            .union((0, attacks_js_1.between)(king, kingTo).with(kingTo))
            .without(king)
            .without(rook);
    }
    static fromSetup(setup) {
        const castles = Castles.empty();
        const rooks = setup.castlingRights.intersect(setup.board.rook);
        for (const color of types_js_1.COLORS) {
            const backrank = squareSet_js_1.SquareSet.backrank(color);
            const king = setup.board.kingOf(color);
            if (!(0, util_js_1.defined)(king) || !backrank.has(king))
                continue;
            const side = rooks.intersect(setup.board[color]).intersect(backrank);
            const aSide = side.first();
            if ((0, util_js_1.defined)(aSide) && aSide < king)
                castles.add(color, 'a', king, aSide);
            const hSide = side.last();
            if ((0, util_js_1.defined)(hSide) && king < hSide)
                castles.add(color, 'h', king, hSide);
        }
        return castles;
    }
    discardRook(square) {
        if (this.castlingRights.has(square)) {
            this.castlingRights = this.castlingRights.without(square);
            for (const color of types_js_1.COLORS) {
                for (const side of types_js_1.CASTLING_SIDES) {
                    if (this.rook[color][side] === square)
                        this.rook[color][side] = undefined;
                }
            }
        }
    }
    discardColor(color) {
        this.castlingRights = this.castlingRights.diff(squareSet_js_1.SquareSet.backrank(color));
        this.rook[color].a = undefined;
        this.rook[color].h = undefined;
    }
}
exports.Castles = Castles;
class Position {
    constructor(rules) {
        this.rules = rules;
    }
    reset() {
        this.board = board_js_1.Board.default();
        this.pockets = undefined;
        this.turn = 'white';
        this.castles = Castles.default();
        this.epSquare = undefined;
        this.remainingChecks = undefined;
        this.halfmoves = 0;
        this.fullmoves = 1;
    }
    setupUnchecked(setup) {
        this.board = setup.board.clone();
        this.board.promoted = squareSet_js_1.SquareSet.empty();
        this.pockets = undefined;
        this.turn = setup.turn;
        this.castles = Castles.fromSetup(setup);
        this.epSquare = validEpSquare(this, setup.epSquare);
        this.remainingChecks = undefined;
        this.halfmoves = setup.halfmoves;
        this.fullmoves = setup.fullmoves;
    }
    // When subclassing overwrite at least:
    //
    // - static default()
    // - static fromSetup()
    // - static clone()
    //
    // - dests()
    // - isVariantEnd()
    // - variantOutcome()
    // - hasInsufficientMaterial()
    // - isStandardMaterial()
    kingAttackers(square, attacker, occupied) {
        return attacksTo(square, attacker, this.board, occupied);
    }
    playCaptureAt(square, captured) {
        this.halfmoves = 0;
        if (captured.role === 'rook')
            this.castles.discardRook(square);
        if (this.pockets)
            this.pockets[(0, util_js_1.opposite)(captured.color)][captured.promoted ? 'pawn' : captured.role]++;
    }
    ctx() {
        const variantEnd = this.isVariantEnd();
        const king = this.board.kingOf(this.turn);
        if (!(0, util_js_1.defined)(king)) {
            return { king, blockers: squareSet_js_1.SquareSet.empty(), checkers: squareSet_js_1.SquareSet.empty(), variantEnd, mustCapture: false };
        }
        const snipers = (0, attacks_js_1.rookAttacks)(king, squareSet_js_1.SquareSet.empty())
            .intersect(this.board.rooksAndQueens())
            .union((0, attacks_js_1.bishopAttacks)(king, squareSet_js_1.SquareSet.empty()).intersect(this.board.bishopsAndQueens()))
            .intersect(this.board[(0, util_js_1.opposite)(this.turn)]);
        let blockers = squareSet_js_1.SquareSet.empty();
        for (const sniper of snipers) {
            const b = (0, attacks_js_1.between)(king, sniper).intersect(this.board.occupied);
            if (!b.moreThanOne())
                blockers = blockers.union(b);
        }
        const checkers = this.kingAttackers(king, (0, util_js_1.opposite)(this.turn), this.board.occupied);
        return {
            king,
            blockers,
            checkers,
            variantEnd,
            mustCapture: false,
        };
    }
    clone() {
        var _a, _b;
        const pos = new this.constructor();
        pos.board = this.board.clone();
        pos.pockets = (_a = this.pockets) === null || _a === void 0 ? void 0 : _a.clone();
        pos.turn = this.turn;
        pos.castles = this.castles.clone();
        pos.epSquare = this.epSquare;
        pos.remainingChecks = (_b = this.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone();
        pos.halfmoves = this.halfmoves;
        pos.fullmoves = this.fullmoves;
        return pos;
    }
    validate() {
        if (this.board.occupied.isEmpty())
            return result_1.Result.err(new PositionError(IllegalSetup.Empty));
        if (this.board.king.size() !== 2)
            return result_1.Result.err(new PositionError(IllegalSetup.Kings));
        if (!(0, util_js_1.defined)(this.board.kingOf(this.turn)))
            return result_1.Result.err(new PositionError(IllegalSetup.Kings));
        const otherKing = this.board.kingOf((0, util_js_1.opposite)(this.turn));
        if (!(0, util_js_1.defined)(otherKing))
            return result_1.Result.err(new PositionError(IllegalSetup.Kings));
        if (this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
            return result_1.Result.err(new PositionError(IllegalSetup.OppositeCheck));
        }
        if (squareSet_js_1.SquareSet.backranks().intersects(this.board.pawn)) {
            return result_1.Result.err(new PositionError(IllegalSetup.PawnsOnBackrank));
        }
        return result_1.Result.ok(undefined);
    }
    dropDests(_ctx) {
        return squareSet_js_1.SquareSet.empty();
    }
    dests(square, ctx) {
        ctx = ctx || this.ctx();
        if (ctx.variantEnd)
            return squareSet_js_1.SquareSet.empty();
        const piece = this.board.get(square);
        if (!piece || piece.color !== this.turn)
            return squareSet_js_1.SquareSet.empty();
        let pseudo, legal;
        if (piece.role === 'pawn') {
            pseudo = (0, attacks_js_1.pawnAttacks)(this.turn, square).intersect(this.board[(0, util_js_1.opposite)(this.turn)]);
            const delta = this.turn === 'white' ? 8 : -8;
            const step = square + delta;
            if (0 <= step && step < 64 && !this.board.occupied.has(step)) {
                pseudo = pseudo.with(step);
                const canDoubleStep = this.turn === 'white' ? square < 16 : square >= 64 - 16;
                const doubleStep = step + delta;
                if (canDoubleStep && !this.board.occupied.has(doubleStep)) {
                    pseudo = pseudo.with(doubleStep);
                }
            }
            if ((0, util_js_1.defined)(this.epSquare) && canCaptureEp(this, square, ctx)) {
                legal = squareSet_js_1.SquareSet.fromSquare(this.epSquare);
            }
        }
        else if (piece.role === 'bishop')
            pseudo = (0, attacks_js_1.bishopAttacks)(square, this.board.occupied);
        else if (piece.role === 'knight')
            pseudo = (0, attacks_js_1.knightAttacks)(square);
        else if (piece.role === 'rook')
            pseudo = (0, attacks_js_1.rookAttacks)(square, this.board.occupied);
        else if (piece.role === 'queen')
            pseudo = (0, attacks_js_1.queenAttacks)(square, this.board.occupied);
        else
            pseudo = (0, attacks_js_1.kingAttacks)(square);
        pseudo = pseudo.diff(this.board[this.turn]);
        if ((0, util_js_1.defined)(ctx.king)) {
            if (piece.role === 'king') {
                const occ = this.board.occupied.without(square);
                for (const to of pseudo) {
                    if (this.kingAttackers(to, (0, util_js_1.opposite)(this.turn), occ).nonEmpty())
                        pseudo = pseudo.without(to);
                }
                return pseudo.union(castlingDest(this, 'a', ctx)).union(castlingDest(this, 'h', ctx));
            }
            if (ctx.checkers.nonEmpty()) {
                const checker = ctx.checkers.singleSquare();
                if (!(0, util_js_1.defined)(checker))
                    return squareSet_js_1.SquareSet.empty();
                pseudo = pseudo.intersect((0, attacks_js_1.between)(checker, ctx.king).with(checker));
            }
            if (ctx.blockers.has(square))
                pseudo = pseudo.intersect((0, attacks_js_1.ray)(square, ctx.king));
        }
        if (legal)
            pseudo = pseudo.union(legal);
        return pseudo;
    }
    isVariantEnd() {
        return false;
    }
    variantOutcome(_ctx) {
        return;
    }
    hasInsufficientMaterial(color) {
        if (this.board[color].intersect(this.board.pawn.union(this.board.rooksAndQueens())).nonEmpty())
            return false;
        if (this.board[color].intersects(this.board.knight)) {
            return (this.board[color].size() <= 2
                && this.board[(0, util_js_1.opposite)(color)].diff(this.board.king).diff(this.board.queen).isEmpty());
        }
        if (this.board[color].intersects(this.board.bishop)) {
            const sameColor = !this.board.bishop.intersects(squareSet_js_1.SquareSet.darkSquares())
                || !this.board.bishop.intersects(squareSet_js_1.SquareSet.lightSquares());
            return sameColor && this.board.pawn.isEmpty() && this.board.knight.isEmpty();
        }
        return true;
    }
    // The following should be identical in all subclasses
    toSetup() {
        var _a, _b;
        return {
            board: this.board.clone(),
            pockets: (_a = this.pockets) === null || _a === void 0 ? void 0 : _a.clone(),
            turn: this.turn,
            castlingRights: this.castles.castlingRights,
            epSquare: legalEpSquare(this),
            remainingChecks: (_b = this.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone(),
            halfmoves: Math.min(this.halfmoves, 150),
            fullmoves: Math.min(Math.max(this.fullmoves, 1), 9999),
        };
    }
    isInsufficientMaterial() {
        return types_js_1.COLORS.every(color => this.hasInsufficientMaterial(color));
    }
    hasDests(ctx) {
        ctx = ctx || this.ctx();
        for (const square of this.board[this.turn]) {
            if (this.dests(square, ctx).nonEmpty())
                return true;
        }
        return this.dropDests(ctx).nonEmpty();
    }
    isLegal(move, ctx) {
        if ((0, types_js_1.isDrop)(move)) {
            if (!this.pockets || this.pockets[this.turn][move.role] <= 0)
                return false;
            if (move.role === 'pawn' && squareSet_js_1.SquareSet.backranks().has(move.to))
                return false;
            return this.dropDests(ctx).has(move.to);
        }
        else {
            if (move.promotion === 'pawn')
                return false;
            if (move.promotion === 'king' && this.rules !== 'antichess')
                return false;
            if (!!move.promotion !== (this.board.pawn.has(move.from) && squareSet_js_1.SquareSet.backranks().has(move.to)))
                return false;
            const dests = this.dests(move.from, ctx);
            return dests.has(move.to) || dests.has((0, exports.normalizeMove)(this, move).to);
        }
    }
    isCheck() {
        const king = this.board.kingOf(this.turn);
        return (0, util_js_1.defined)(king) && this.kingAttackers(king, (0, util_js_1.opposite)(this.turn), this.board.occupied).nonEmpty();
    }
    isEnd(ctx) {
        if (ctx ? ctx.variantEnd : this.isVariantEnd())
            return true;
        return this.isInsufficientMaterial() || !this.hasDests(ctx);
    }
    isCheckmate(ctx) {
        ctx = ctx || this.ctx();
        return !ctx.variantEnd && ctx.checkers.nonEmpty() && !this.hasDests(ctx);
    }
    isStalemate(ctx) {
        ctx = ctx || this.ctx();
        return !ctx.variantEnd && ctx.checkers.isEmpty() && !this.hasDests(ctx);
    }
    outcome(ctx) {
        const variantOutcome = this.variantOutcome(ctx);
        if (variantOutcome)
            return variantOutcome;
        ctx = ctx || this.ctx();
        if (this.isCheckmate(ctx))
            return { winner: (0, util_js_1.opposite)(this.turn) };
        else if (this.isInsufficientMaterial() || this.isStalemate(ctx))
            return { winner: undefined };
        else
            return;
    }
    allDests(ctx) {
        ctx = ctx || this.ctx();
        const d = new Map();
        if (ctx.variantEnd)
            return d;
        for (const square of this.board[this.turn]) {
            d.set(square, this.dests(square, ctx));
        }
        return d;
    }
    play(move) {
        const turn = this.turn;
        const epSquare = this.epSquare;
        const castling = (0, exports.castlingSide)(this, move);
        this.epSquare = undefined;
        this.halfmoves += 1;
        if (turn === 'black')
            this.fullmoves += 1;
        this.turn = (0, util_js_1.opposite)(turn);
        if ((0, types_js_1.isDrop)(move)) {
            this.board.set(move.to, { role: move.role, color: turn });
            if (this.pockets)
                this.pockets[turn][move.role]--;
            if (move.role === 'pawn')
                this.halfmoves = 0;
        }
        else {
            const piece = this.board.take(move.from);
            if (!piece)
                return;
            let epCapture;
            if (piece.role === 'pawn') {
                this.halfmoves = 0;
                if (move.to === epSquare) {
                    epCapture = this.board.take(move.to + (turn === 'white' ? -8 : 8));
                }
                const delta = move.from - move.to;
                if (Math.abs(delta) === 16 && 8 <= move.from && move.from <= 55) {
                    this.epSquare = (move.from + move.to) >> 1;
                }
                if (move.promotion) {
                    piece.role = move.promotion;
                    piece.promoted = !!this.pockets;
                }
            }
            else if (piece.role === 'rook') {
                this.castles.discardRook(move.from);
            }
            else if (piece.role === 'king') {
                if (castling) {
                    const rookFrom = this.castles.rook[turn][castling];
                    if ((0, util_js_1.defined)(rookFrom)) {
                        const rook = this.board.take(rookFrom);
                        this.board.set((0, util_js_1.kingCastlesTo)(turn, castling), piece);
                        if (rook)
                            this.board.set((0, util_js_1.rookCastlesTo)(turn, castling), rook);
                    }
                }
                this.castles.discardColor(turn);
            }
            if (!castling) {
                const capture = this.board.set(move.to, piece) || epCapture;
                if (capture)
                    this.playCaptureAt(move.to, capture);
            }
        }
        if (this.remainingChecks) {
            if (this.isCheck())
                this.remainingChecks[turn] = Math.max(this.remainingChecks[turn] - 1, 0);
        }
    }
}
exports.Position = Position;
class Chess extends Position {
    constructor() {
        super('chess');
    }
    static default() {
        const pos = new this();
        pos.reset();
        return pos;
    }
    static fromSetup(setup) {
        const pos = new this();
        pos.setupUnchecked(setup);
        return pos.validate().map(_ => pos);
    }
    clone() {
        return super.clone();
    }
}
exports.Chess = Chess;
const validEpSquare = (pos, square) => {
    if (!(0, util_js_1.defined)(square))
        return;
    const epRank = pos.turn === 'white' ? 5 : 2;
    const forward = pos.turn === 'white' ? 8 : -8;
    if ((0, util_js_1.squareRank)(square) !== epRank)
        return;
    if (pos.board.occupied.has(square + forward))
        return;
    const pawn = square - forward;
    if (!pos.board.pawn.has(pawn) || !pos.board[(0, util_js_1.opposite)(pos.turn)].has(pawn))
        return;
    return square;
};
const legalEpSquare = (pos) => {
    if (!(0, util_js_1.defined)(pos.epSquare))
        return;
    const ctx = pos.ctx();
    const ourPawns = pos.board.pieces(pos.turn, 'pawn');
    const candidates = ourPawns.intersect((0, attacks_js_1.pawnAttacks)((0, util_js_1.opposite)(pos.turn), pos.epSquare));
    for (const candidate of candidates) {
        if (pos.dests(candidate, ctx).has(pos.epSquare))
            return pos.epSquare;
    }
    return;
};
const canCaptureEp = (pos, pawnFrom, ctx) => {
    if (!(0, util_js_1.defined)(pos.epSquare))
        return false;
    if (!(0, attacks_js_1.pawnAttacks)(pos.turn, pawnFrom).has(pos.epSquare))
        return false;
    if (!(0, util_js_1.defined)(ctx.king))
        return true;
    const delta = pos.turn === 'white' ? 8 : -8;
    const captured = pos.epSquare - delta;
    return pos
        .kingAttackers(ctx.king, (0, util_js_1.opposite)(pos.turn), pos.board.occupied.toggle(pawnFrom).toggle(captured).with(pos.epSquare))
        .without(captured)
        .isEmpty();
};
const castlingDest = (pos, side, ctx) => {
    if (!(0, util_js_1.defined)(ctx.king) || ctx.checkers.nonEmpty())
        return squareSet_js_1.SquareSet.empty();
    const rook = pos.castles.rook[pos.turn][side];
    if (!(0, util_js_1.defined)(rook))
        return squareSet_js_1.SquareSet.empty();
    if (pos.castles.path[pos.turn][side].intersects(pos.board.occupied))
        return squareSet_js_1.SquareSet.empty();
    const kingTo = (0, util_js_1.kingCastlesTo)(pos.turn, side);
    const kingPath = (0, attacks_js_1.between)(ctx.king, kingTo);
    const occ = pos.board.occupied.without(ctx.king);
    for (const sq of kingPath) {
        if (pos.kingAttackers(sq, (0, util_js_1.opposite)(pos.turn), occ).nonEmpty())
            return squareSet_js_1.SquareSet.empty();
    }
    const rookTo = (0, util_js_1.rookCastlesTo)(pos.turn, side);
    const after = pos.board.occupied.toggle(ctx.king).toggle(rook).toggle(rookTo);
    if (pos.kingAttackers(kingTo, (0, util_js_1.opposite)(pos.turn), after).nonEmpty())
        return squareSet_js_1.SquareSet.empty();
    return squareSet_js_1.SquareSet.fromSquare(rook);
};
const pseudoDests = (pos, square, ctx) => {
    if (ctx.variantEnd)
        return squareSet_js_1.SquareSet.empty();
    const piece = pos.board.get(square);
    if (!piece || piece.color !== pos.turn)
        return squareSet_js_1.SquareSet.empty();
    let pseudo = (0, attacks_js_1.attacks)(piece, square, pos.board.occupied);
    if (piece.role === 'pawn') {
        let captureTargets = pos.board[(0, util_js_1.opposite)(pos.turn)];
        if ((0, util_js_1.defined)(pos.epSquare))
            captureTargets = captureTargets.with(pos.epSquare);
        pseudo = pseudo.intersect(captureTargets);
        const delta = pos.turn === 'white' ? 8 : -8;
        const step = square + delta;
        if (0 <= step && step < 64 && !pos.board.occupied.has(step)) {
            pseudo = pseudo.with(step);
            const canDoubleStep = pos.turn === 'white' ? square < 16 : square >= 64 - 16;
            const doubleStep = step + delta;
            if (canDoubleStep && !pos.board.occupied.has(doubleStep)) {
                pseudo = pseudo.with(doubleStep);
            }
        }
        return pseudo;
    }
    else {
        pseudo = pseudo.diff(pos.board[pos.turn]);
    }
    if (square === ctx.king)
        return pseudo.union(castlingDest(pos, 'a', ctx)).union(castlingDest(pos, 'h', ctx));
    else
        return pseudo;
};
exports.pseudoDests = pseudoDests;
const equalsIgnoreMoves = (left, right) => {
    var _a, _b;
    return left.rules === right.rules
        && (0, board_js_1.boardEquals)(left.board, right.board)
        && ((right.pockets && ((_a = left.pockets) === null || _a === void 0 ? void 0 : _a.equals(right.pockets))) || (!left.pockets && !right.pockets))
        && left.turn === right.turn
        && left.castles.castlingRights.equals(right.castles.castlingRights)
        && legalEpSquare(left) === legalEpSquare(right)
        && ((right.remainingChecks && ((_b = left.remainingChecks) === null || _b === void 0 ? void 0 : _b.equals(right.remainingChecks)))
            || (!left.remainingChecks && !right.remainingChecks));
};
exports.equalsIgnoreMoves = equalsIgnoreMoves;
const castlingSide = (pos, move) => {
    if ((0, types_js_1.isDrop)(move))
        return;
    const delta = move.to - move.from;
    if (Math.abs(delta) !== 2 && !pos.board[pos.turn].has(move.to))
        return;
    if (!pos.board.king.has(move.from))
        return;
    return delta > 0 ? 'h' : 'a';
};
exports.castlingSide = castlingSide;
const normalizeMove = (pos, move) => {
    const side = (0, exports.castlingSide)(pos, move);
    if (!side)
        return move;
    const rookFrom = pos.castles.rook[pos.turn][side];
    return {
        from: move.from,
        to: (0, util_js_1.defined)(rookFrom) ? rookFrom : move.to,
    };
};
exports.normalizeMove = normalizeMove;
const isStandardMaterialSide = (board, color) => {
    const promoted = Math.max(board.pieces(color, 'queen').size() - 1, 0)
        + Math.max(board.pieces(color, 'rook').size() - 2, 0)
        + Math.max(board.pieces(color, 'knight').size() - 2, 0)
        + Math.max(board.pieces(color, 'bishop').intersect(squareSet_js_1.SquareSet.lightSquares()).size() - 1, 0)
        + Math.max(board.pieces(color, 'bishop').intersect(squareSet_js_1.SquareSet.darkSquares()).size() - 1, 0);
    return board.pieces(color, 'pawn').size() + promoted <= 8;
};
exports.isStandardMaterialSide = isStandardMaterialSide;
const isStandardMaterial = (pos) => types_js_1.COLORS.every(color => (0, exports.isStandardMaterialSide)(pos.board, color));
exports.isStandardMaterial = isStandardMaterial;
const isImpossibleCheck = (pos) => {
    const ourKing = pos.board.kingOf(pos.turn);
    if (!(0, util_js_1.defined)(ourKing))
        return false;
    const checkers = pos.kingAttackers(ourKing, (0, util_js_1.opposite)(pos.turn), pos.board.occupied);
    if (checkers.isEmpty())
        return false;
    if ((0, util_js_1.defined)(pos.epSquare)) {
        // The pushed pawn must be the only checker, or it has uncovered
        // check by a single sliding piece.
        const pushedTo = pos.epSquare ^ 8;
        const pushedFrom = pos.epSquare ^ 24;
        return (checkers.moreThanOne()
            || (checkers.first() !== pushedTo
                && pos
                    .kingAttackers(ourKing, (0, util_js_1.opposite)(pos.turn), pos.board.occupied.without(pushedTo).with(pushedFrom))
                    .nonEmpty()));
    }
    else if (pos.rules === 'atomic') {
        // Other king moving away can cause many checks to be given at the same
        // time. Not checking details, or even that the king is close enough.
        return false;
    }
    else {
        // Sliding checkers aligned with king.
        return checkers.size() > 2 || (checkers.size() === 2 && (0, attacks_js_1.ray)(checkers.first(), checkers.last()).has(ourKing));
    }
};
exports.isImpossibleCheck = isImpossibleCheck;
//# sourceMappingURL=chess.js.map