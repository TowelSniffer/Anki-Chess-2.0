"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStandardMaterial = exports.setupPosition = exports.defaultPosition = exports.Horde = exports.RacingKings = exports.ThreeCheck = exports.KingOfTheHill = exports.Antichess = exports.Atomic = exports.Crazyhouse = exports.PositionError = exports.Position = exports.normalizeMove = exports.isImpossibleCheck = exports.IllegalSetup = exports.equalsIgnoreMoves = exports.Chess = exports.castlingSide = exports.Castles = void 0;
const result_1 = require("@badrap/result");
const attacks_js_1 = require("./attacks.js");
const board_js_1 = require("./board.js");
const chess_js_1 = require("./chess.js");
Object.defineProperty(exports, "Castles", { enumerable: true, get: function () { return chess_js_1.Castles; } });
Object.defineProperty(exports, "castlingSide", { enumerable: true, get: function () { return chess_js_1.castlingSide; } });
Object.defineProperty(exports, "Chess", { enumerable: true, get: function () { return chess_js_1.Chess; } });
Object.defineProperty(exports, "equalsIgnoreMoves", { enumerable: true, get: function () { return chess_js_1.equalsIgnoreMoves; } });
Object.defineProperty(exports, "IllegalSetup", { enumerable: true, get: function () { return chess_js_1.IllegalSetup; } });
Object.defineProperty(exports, "isImpossibleCheck", { enumerable: true, get: function () { return chess_js_1.isImpossibleCheck; } });
Object.defineProperty(exports, "normalizeMove", { enumerable: true, get: function () { return chess_js_1.normalizeMove; } });
Object.defineProperty(exports, "Position", { enumerable: true, get: function () { return chess_js_1.Position; } });
Object.defineProperty(exports, "PositionError", { enumerable: true, get: function () { return chess_js_1.PositionError; } });
const setup_js_1 = require("./setup.js");
const squareSet_js_1 = require("./squareSet.js");
const types_js_1 = require("./types.js");
const util_js_1 = require("./util.js");
class Crazyhouse extends chess_js_1.Position {
    constructor() {
        super('crazyhouse');
    }
    reset() {
        super.reset();
        this.pockets = setup_js_1.Material.empty();
    }
    setupUnchecked(setup) {
        super.setupUnchecked(setup);
        this.board.promoted = setup.board.promoted
            .intersect(setup.board.occupied)
            .diff(setup.board.king)
            .diff(setup.board.pawn);
        this.pockets = setup.pockets ? setup.pockets.clone() : setup_js_1.Material.empty();
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
    validate() {
        return super.validate().chain(_ => {
            var _a, _b;
            if ((_a = this.pockets) === null || _a === void 0 ? void 0 : _a.count('king')) {
                return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.Kings));
            }
            if ((((_b = this.pockets) === null || _b === void 0 ? void 0 : _b.size()) || 0) + this.board.occupied.size() > 64) {
                return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.Variant));
            }
            return result_1.Result.ok(undefined);
        });
    }
    hasInsufficientMaterial(color) {
        // No material can leave the game, but we can easily check this for
        // custom positions.
        if (!this.pockets)
            return super.hasInsufficientMaterial(color);
        return (this.board.occupied.size() + this.pockets.size() <= 3
            && this.board.pawn.isEmpty()
            && this.board.promoted.isEmpty()
            && this.board.rooksAndQueens().isEmpty()
            && this.pockets.count('pawn') <= 0
            && this.pockets.count('rook') <= 0
            && this.pockets.count('queen') <= 0);
    }
    dropDests(ctx) {
        var _a, _b;
        const mask = this.board.occupied
            .complement()
            .intersect(((_a = this.pockets) === null || _a === void 0 ? void 0 : _a[this.turn].hasNonPawns())
            ? squareSet_js_1.SquareSet.full()
            : ((_b = this.pockets) === null || _b === void 0 ? void 0 : _b[this.turn].hasPawns())
                ? squareSet_js_1.SquareSet.backranks().complement()
                : squareSet_js_1.SquareSet.empty());
        ctx = ctx || this.ctx();
        if ((0, util_js_1.defined)(ctx.king) && ctx.checkers.nonEmpty()) {
            const checker = ctx.checkers.singleSquare();
            if (!(0, util_js_1.defined)(checker))
                return squareSet_js_1.SquareSet.empty();
            return mask.intersect((0, attacks_js_1.between)(checker, ctx.king));
        }
        else
            return mask;
    }
}
exports.Crazyhouse = Crazyhouse;
class Atomic extends chess_js_1.Position {
    constructor() {
        super('atomic');
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
    validate() {
        // Like chess, but allow our king to be missing.
        if (this.board.occupied.isEmpty())
            return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.Empty));
        if (this.board.king.size() > 2)
            return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.Kings));
        const otherKing = this.board.kingOf((0, util_js_1.opposite)(this.turn));
        if (!(0, util_js_1.defined)(otherKing))
            return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.Kings));
        if (this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
            return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.OppositeCheck));
        }
        if (squareSet_js_1.SquareSet.backranks().intersects(this.board.pawn)) {
            return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.PawnsOnBackrank));
        }
        return result_1.Result.ok(undefined);
    }
    kingAttackers(square, attacker, occupied) {
        const attackerKings = this.board.pieces(attacker, 'king');
        if (attackerKings.isEmpty() || (0, attacks_js_1.kingAttacks)(square).intersects(attackerKings)) {
            return squareSet_js_1.SquareSet.empty();
        }
        return super.kingAttackers(square, attacker, occupied);
    }
    playCaptureAt(square, captured) {
        super.playCaptureAt(square, captured);
        this.board.take(square);
        for (const explode of (0, attacks_js_1.kingAttacks)(square).intersect(this.board.occupied).diff(this.board.pawn)) {
            const piece = this.board.take(explode);
            if ((piece === null || piece === void 0 ? void 0 : piece.role) === 'rook')
                this.castles.discardRook(explode);
            if ((piece === null || piece === void 0 ? void 0 : piece.role) === 'king')
                this.castles.discardColor(piece.color);
        }
    }
    hasInsufficientMaterial(color) {
        // Remaining material does not matter if the enemy king is already
        // exploded.
        if (this.board.pieces((0, util_js_1.opposite)(color), 'king').isEmpty())
            return false;
        // Bare king cannot mate.
        if (this.board[color].diff(this.board.king).isEmpty())
            return true;
        // As long as the enemy king is not alone, there is always a chance their
        // own pieces explode next to it.
        if (this.board[(0, util_js_1.opposite)(color)].diff(this.board.king).nonEmpty()) {
            // Unless there are only bishops that cannot explode each other.
            if (this.board.occupied.equals(this.board.bishop.union(this.board.king))) {
                if (!this.board.bishop.intersect(this.board.white).intersects(squareSet_js_1.SquareSet.darkSquares())) {
                    return !this.board.bishop.intersect(this.board.black).intersects(squareSet_js_1.SquareSet.lightSquares());
                }
                if (!this.board.bishop.intersect(this.board.white).intersects(squareSet_js_1.SquareSet.lightSquares())) {
                    return !this.board.bishop.intersect(this.board.black).intersects(squareSet_js_1.SquareSet.darkSquares());
                }
            }
            return false;
        }
        // Queen or pawn (future queen) can give mate against bare king.
        if (this.board.queen.nonEmpty() || this.board.pawn.nonEmpty())
            return false;
        // Single knight, bishop or rook cannot mate against bare king.
        if (this.board.knight.union(this.board.bishop).union(this.board.rook).size() === 1)
            return true;
        // If only knights, more than two are required to mate bare king.
        if (this.board.occupied.equals(this.board.knight.union(this.board.king))) {
            return this.board.knight.size() <= 2;
        }
        return false;
    }
    dests(square, ctx) {
        ctx = ctx || this.ctx();
        let dests = squareSet_js_1.SquareSet.empty();
        for (const to of (0, chess_js_1.pseudoDests)(this, square, ctx)) {
            const after = this.clone();
            after.play({ from: square, to });
            const ourKing = after.board.kingOf(this.turn);
            if ((0, util_js_1.defined)(ourKing)
                && (!(0, util_js_1.defined)(after.board.kingOf(after.turn))
                    || after.kingAttackers(ourKing, after.turn, after.board.occupied).isEmpty())) {
                dests = dests.with(to);
            }
        }
        return dests;
    }
    isVariantEnd() {
        return !!this.variantOutcome();
    }
    variantOutcome(_ctx) {
        for (const color of types_js_1.COLORS) {
            if (this.board.pieces(color, 'king').isEmpty())
                return { winner: (0, util_js_1.opposite)(color) };
        }
        return;
    }
}
exports.Atomic = Atomic;
class Antichess extends chess_js_1.Position {
    constructor() {
        super('antichess');
    }
    reset() {
        super.reset();
        this.castles = chess_js_1.Castles.empty();
    }
    setupUnchecked(setup) {
        super.setupUnchecked(setup);
        this.castles = chess_js_1.Castles.empty();
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
    validate() {
        if (this.board.occupied.isEmpty())
            return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.Empty));
        if (squareSet_js_1.SquareSet.backranks().intersects(this.board.pawn)) {
            return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.PawnsOnBackrank));
        }
        return result_1.Result.ok(undefined);
    }
    kingAttackers(_square, _attacker, _occupied) {
        return squareSet_js_1.SquareSet.empty();
    }
    ctx() {
        const ctx = super.ctx();
        if ((0, util_js_1.defined)(this.epSquare)
            && (0, attacks_js_1.pawnAttacks)((0, util_js_1.opposite)(this.turn), this.epSquare).intersects(this.board.pieces(this.turn, 'pawn'))) {
            ctx.mustCapture = true;
            return ctx;
        }
        const enemy = this.board[(0, util_js_1.opposite)(this.turn)];
        for (const from of this.board[this.turn]) {
            if ((0, chess_js_1.pseudoDests)(this, from, ctx).intersects(enemy)) {
                ctx.mustCapture = true;
                return ctx;
            }
        }
        return ctx;
    }
    dests(square, ctx) {
        ctx = ctx || this.ctx();
        const dests = (0, chess_js_1.pseudoDests)(this, square, ctx);
        const enemy = this.board[(0, util_js_1.opposite)(this.turn)];
        return dests.intersect(ctx.mustCapture
            ? (0, util_js_1.defined)(this.epSquare) && this.board.getRole(square) === 'pawn'
                ? enemy.with(this.epSquare)
                : enemy
            : squareSet_js_1.SquareSet.full());
    }
    hasInsufficientMaterial(color) {
        if (this.board[color].isEmpty())
            return false;
        if (this.board[(0, util_js_1.opposite)(color)].isEmpty())
            return true;
        if (this.board.occupied.equals(this.board.bishop)) {
            const weSomeOnLight = this.board[color].intersects(squareSet_js_1.SquareSet.lightSquares());
            const weSomeOnDark = this.board[color].intersects(squareSet_js_1.SquareSet.darkSquares());
            const theyAllOnDark = this.board[(0, util_js_1.opposite)(color)].isDisjoint(squareSet_js_1.SquareSet.lightSquares());
            const theyAllOnLight = this.board[(0, util_js_1.opposite)(color)].isDisjoint(squareSet_js_1.SquareSet.darkSquares());
            return (weSomeOnLight && theyAllOnDark) || (weSomeOnDark && theyAllOnLight);
        }
        if (this.board.occupied.equals(this.board.knight) && this.board.occupied.size() === 2) {
            return ((this.board.white.intersects(squareSet_js_1.SquareSet.lightSquares())
                !== this.board.black.intersects(squareSet_js_1.SquareSet.darkSquares()))
                !== (this.turn === color));
        }
        return false;
    }
    isVariantEnd() {
        return this.board[this.turn].isEmpty();
    }
    variantOutcome(ctx) {
        ctx = ctx || this.ctx();
        if (ctx.variantEnd || this.isStalemate(ctx)) {
            return { winner: this.turn };
        }
        return;
    }
}
exports.Antichess = Antichess;
class KingOfTheHill extends chess_js_1.Position {
    constructor() {
        super('kingofthehill');
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
    hasInsufficientMaterial(_color) {
        return false;
    }
    isVariantEnd() {
        return this.board.king.intersects(squareSet_js_1.SquareSet.center());
    }
    variantOutcome(_ctx) {
        for (const color of types_js_1.COLORS) {
            if (this.board.pieces(color, 'king').intersects(squareSet_js_1.SquareSet.center()))
                return { winner: color };
        }
        return;
    }
}
exports.KingOfTheHill = KingOfTheHill;
class ThreeCheck extends chess_js_1.Position {
    constructor() {
        super('3check');
    }
    reset() {
        super.reset();
        this.remainingChecks = setup_js_1.RemainingChecks.default();
    }
    setupUnchecked(setup) {
        var _a;
        super.setupUnchecked(setup);
        this.remainingChecks = ((_a = setup.remainingChecks) === null || _a === void 0 ? void 0 : _a.clone()) || setup_js_1.RemainingChecks.default();
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
    hasInsufficientMaterial(color) {
        return this.board.pieces(color, 'king').equals(this.board[color]);
    }
    isVariantEnd() {
        return !!this.remainingChecks && (this.remainingChecks.white <= 0 || this.remainingChecks.black <= 0);
    }
    variantOutcome(_ctx) {
        if (this.remainingChecks) {
            for (const color of types_js_1.COLORS) {
                if (this.remainingChecks[color] <= 0)
                    return { winner: color };
            }
        }
        return;
    }
}
exports.ThreeCheck = ThreeCheck;
const racingKingsBoard = () => {
    const board = board_js_1.Board.empty();
    board.occupied = new squareSet_js_1.SquareSet(0xffff, 0);
    board.promoted = squareSet_js_1.SquareSet.empty();
    board.white = new squareSet_js_1.SquareSet(0xf0f0, 0);
    board.black = new squareSet_js_1.SquareSet(0x0f0f, 0);
    board.pawn = squareSet_js_1.SquareSet.empty();
    board.knight = new squareSet_js_1.SquareSet(0x1818, 0);
    board.bishop = new squareSet_js_1.SquareSet(0x2424, 0);
    board.rook = new squareSet_js_1.SquareSet(0x4242, 0);
    board.queen = new squareSet_js_1.SquareSet(0x0081, 0);
    board.king = new squareSet_js_1.SquareSet(0x8100, 0);
    return board;
};
class RacingKings extends chess_js_1.Position {
    constructor() {
        super('racingkings');
    }
    reset() {
        this.board = racingKingsBoard();
        this.pockets = undefined;
        this.turn = 'white';
        this.castles = chess_js_1.Castles.empty();
        this.epSquare = undefined;
        this.remainingChecks = undefined;
        this.halfmoves = 0;
        this.fullmoves = 1;
    }
    setupUnchecked(setup) {
        super.setupUnchecked(setup);
        this.castles = chess_js_1.Castles.empty();
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
    validate() {
        if (this.isCheck() || this.board.pawn.nonEmpty())
            return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.Variant));
        return super.validate();
    }
    dests(square, ctx) {
        ctx = ctx || this.ctx();
        // Kings cannot give check.
        if (square === ctx.king)
            return super.dests(square, ctx);
        // Do not allow giving check.
        let dests = squareSet_js_1.SquareSet.empty();
        for (const to of super.dests(square, ctx)) {
            // Valid, because there are no promotions (or even pawns).
            const move = { from: square, to };
            const after = this.clone();
            after.play(move);
            if (!after.isCheck())
                dests = dests.with(to);
        }
        return dests;
    }
    hasInsufficientMaterial(_color) {
        return false;
    }
    isVariantEnd() {
        const goal = squareSet_js_1.SquareSet.fromRank(7);
        const inGoal = this.board.king.intersect(goal);
        if (inGoal.isEmpty())
            return false;
        if (this.turn === 'white' || inGoal.intersects(this.board.black))
            return true;
        // White has reached the backrank. Check if black can catch up.
        const blackKing = this.board.kingOf('black');
        if ((0, util_js_1.defined)(blackKing)) {
            const occ = this.board.occupied.without(blackKing);
            for (const target of (0, attacks_js_1.kingAttacks)(blackKing).intersect(goal).diff(this.board.black)) {
                if (this.kingAttackers(target, 'white', occ).isEmpty())
                    return false;
            }
        }
        return true;
    }
    variantOutcome(ctx) {
        if (ctx ? !ctx.variantEnd : !this.isVariantEnd())
            return;
        const goal = squareSet_js_1.SquareSet.fromRank(7);
        const blackInGoal = this.board.pieces('black', 'king').intersects(goal);
        const whiteInGoal = this.board.pieces('white', 'king').intersects(goal);
        if (blackInGoal && !whiteInGoal)
            return { winner: 'black' };
        if (whiteInGoal && !blackInGoal)
            return { winner: 'white' };
        return { winner: undefined };
    }
}
exports.RacingKings = RacingKings;
const hordeBoard = () => {
    const board = board_js_1.Board.empty();
    board.occupied = new squareSet_js_1.SquareSet(4294967295, 4294901862);
    board.promoted = squareSet_js_1.SquareSet.empty();
    board.white = new squareSet_js_1.SquareSet(4294967295, 102);
    board.black = new squareSet_js_1.SquareSet(0, 4294901760);
    board.pawn = new squareSet_js_1.SquareSet(4294967295, 16711782);
    board.knight = new squareSet_js_1.SquareSet(0, 1107296256);
    board.bishop = new squareSet_js_1.SquareSet(0, 603979776);
    board.rook = new squareSet_js_1.SquareSet(0, 2164260864);
    board.queen = new squareSet_js_1.SquareSet(0, 134217728);
    board.king = new squareSet_js_1.SquareSet(0, 268435456);
    return board;
};
class Horde extends chess_js_1.Position {
    constructor() {
        super('horde');
    }
    reset() {
        this.board = hordeBoard();
        this.pockets = undefined;
        this.turn = 'white';
        this.castles = chess_js_1.Castles.default();
        this.castles.discardColor('white');
        this.epSquare = undefined;
        this.remainingChecks = undefined;
        this.halfmoves = 0;
        this.fullmoves = 1;
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
    validate() {
        if (this.board.occupied.isEmpty())
            return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.Empty));
        if (this.board.king.size() !== 1)
            return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.Kings));
        const otherKing = this.board.kingOf((0, util_js_1.opposite)(this.turn));
        if ((0, util_js_1.defined)(otherKing) && this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
            return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.OppositeCheck));
        }
        for (const color of types_js_1.COLORS) {
            const backranks = this.board.pieces(color, 'king').isEmpty()
                ? squareSet_js_1.SquareSet.backrank((0, util_js_1.opposite)(color))
                : squareSet_js_1.SquareSet.backranks();
            if (this.board.pieces(color, 'pawn').intersects(backranks)) {
                return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.PawnsOnBackrank));
            }
        }
        return result_1.Result.ok(undefined);
    }
    hasInsufficientMaterial(color) {
        // The side with the king can always win by capturing the horde.
        if (this.board.pieces(color, 'king').nonEmpty())
            return false;
        const oppositeSquareColor = (squareColor) => (squareColor === 'light' ? 'dark' : 'light');
        const coloredSquares = (squareColor) => squareColor === 'light' ? squareSet_js_1.SquareSet.lightSquares() : squareSet_js_1.SquareSet.darkSquares();
        const hasBishopPair = (side) => {
            const bishops = this.board.pieces(side, 'bishop');
            return bishops.intersects(squareSet_js_1.SquareSet.darkSquares()) && bishops.intersects(squareSet_js_1.SquareSet.lightSquares());
        };
        // By this point: color is the horde.
        // Based on
        // https://github.com/stevepapazis/horde-insufficient-material-tests.
        const horde = setup_js_1.MaterialSide.fromBoard(this.board, color);
        const hordeBishops = (squareColor) => coloredSquares(squareColor).intersect(this.board.pieces(color, 'bishop')).size();
        const hordeBishopColor = hordeBishops('light') >= 1 ? 'light' : 'dark';
        const hordeNum = horde.pawn
            + horde.knight
            + horde.rook
            + horde.queen
            + Math.min(hordeBishops('dark'), 2)
            + Math.min(hordeBishops('light'), 2);
        const pieces = setup_js_1.MaterialSide.fromBoard(this.board, (0, util_js_1.opposite)(color));
        const piecesBishops = (squareColor) => coloredSquares(squareColor)
            .intersect(this.board.pieces((0, util_js_1.opposite)(color), 'bishop'))
            .size();
        const piecesNum = pieces.size();
        const piecesOfRoleNot = (piece) => piecesNum - piece;
        if (hordeNum === 0)
            return true;
        if (hordeNum >= 4) {
            // Four or more pieces can always deliver mate.
            return false;
        }
        if ((horde.pawn >= 1 || horde.queen >= 1) && hordeNum >= 2) {
            // Pawns/queens are never insufficient material when paired with any other
            // piece (a pawn promotes to a queen and delivers mate).
            return false;
        }
        if (horde.rook >= 1 && hordeNum >= 2) {
            // A rook is insufficient material only when it is paired with a bishop
            // against a lone king. The horde can mate in any other case.
            // A rook on A1 and a bishop on C3 mate a king on B1 when there is a
            // friendly pawn/opposite-color-bishop/rook/queen on C2.
            // A rook on B8 and a bishop C3 mate a king on A1 when there is a friendly
            // knight on A2.
            if (!(hordeNum === 2
                && horde.rook === 1
                && horde.bishop === 1
                && piecesOfRoleNot(piecesBishops(hordeBishopColor)) === 1)) {
                return false;
            }
        }
        if (hordeNum === 1) {
            if (piecesNum === 1) {
                // A lone piece cannot mate a lone king.
                return true;
            }
            else if (horde.queen === 1) {
                // The horde has a lone queen.
                // A lone queen mates a king on A1 bounded by:
                //  -- a pawn/rook on A2
                //  -- two same color bishops on A2, B1
                // We ignore every other mating case, since it can be reduced to
                // the two previous cases (e.g. a black pawn on A2 and a black
                // bishop on B1).
                return !(pieces.pawn >= 1 || pieces.rook >= 1 || piecesBishops('light') >= 2 || piecesBishops('dark') >= 2);
            }
            else if (horde.pawn === 1) {
                // Promote the pawn to a queen or a knight and check whether white
                // can mate.
                const pawnSquare = this.board.pieces(color, 'pawn').last();
                const promoteToQueen = this.clone();
                promoteToQueen.board.set(pawnSquare, { color, role: 'queen' });
                const promoteToKnight = this.clone();
                promoteToKnight.board.set(pawnSquare, { color, role: 'knight' });
                return promoteToQueen.hasInsufficientMaterial(color) && promoteToKnight.hasInsufficientMaterial(color);
            }
            else if (horde.rook === 1) {
                // A lone rook mates a king on A8 bounded by a pawn/rook on A7 and a
                // pawn/knight on B7. We ignore every other case, since it can be
                // reduced to the two previous cases.
                // (e.g. three pawns on A7, B7, C7)
                return !(pieces.pawn >= 2
                    || (pieces.rook >= 1 && pieces.pawn >= 1)
                    || (pieces.rook >= 1 && pieces.knight >= 1)
                    || (pieces.pawn >= 1 && pieces.knight >= 1));
            }
            else if (horde.bishop === 1) {
                // The horde has a lone bishop.
                return !(
                // The king can be mated on A1 if there is a pawn/opposite-color-bishop
                // on A2 and an opposite-color-bishop on B1.
                // If black has two or more pawns, white gets the benefit of the doubt;
                // there is an outside chance that white promotes its pawns to
                // opposite-color-bishops and selfmates theirself.
                // Every other case that the king is mated by the bishop requires that
                // black has two pawns or two opposite-color-bishop or a pawn and an
                // opposite-color-bishop.
                // For example a king on A3 can be mated if there is
                // a pawn/opposite-color-bishop on A4, a pawn/opposite-color-bishop on
                // B3, a pawn/bishop/rook/queen on A2 and any other piece on B2.
                piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 2
                    || (piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1 && pieces.pawn >= 1)
                    || pieces.pawn >= 2);
            }
            else if (horde.knight === 1) {
                // The horde has a lone knight.
                return !(
                // The king on A1 can be smother mated by a knight on C2 if there is
                // a pawn/knight/bishop on B2, a knight/rook on B1 and any other piece
                // on A2.
                // Moreover, when black has four or more pieces and two of them are
                // pawns, black can promote their pawns and selfmate theirself.
                piecesNum >= 4
                    && (pieces.knight >= 2
                        || pieces.pawn >= 2
                        || (pieces.rook >= 1 && pieces.knight >= 1)
                        || (pieces.rook >= 1 && pieces.bishop >= 1)
                        || (pieces.knight >= 1 && pieces.bishop >= 1)
                        || (pieces.rook >= 1 && pieces.pawn >= 1)
                        || (pieces.knight >= 1 && pieces.pawn >= 1)
                        || (pieces.bishop >= 1 && pieces.pawn >= 1)
                        || (hasBishopPair((0, util_js_1.opposite)(color)) && pieces.pawn >= 1))
                    && (piecesBishops('dark') < 2 || piecesOfRoleNot(piecesBishops('dark')) >= 3)
                    && (piecesBishops('light') < 2 || piecesOfRoleNot(piecesBishops('light')) >= 3));
            }
            // By this point, we only need to deal with white's minor pieces.
        }
        else if (hordeNum === 2) {
            if (piecesNum === 1) {
                // Two minor pieces cannot mate a lone king.
                return true;
            }
            else if (horde.knight === 2) {
                // A king on A1 is mated by two knights, if it is obstructed by a
                // pawn/bishop/knight on B2. On the other hand, if black only has
                // major pieces it is a draw.
                return pieces.pawn + pieces.bishop + pieces.knight < 1;
            }
            else if (hasBishopPair(color)) {
                return !(
                // A king on A1 obstructed by a pawn/bishop on A2 is mated
                // by the bishop pair.
                pieces.pawn >= 1
                    || pieces.bishop >= 1
                    // A pawn/bishop/knight on B4, a pawn/bishop/rook/queen on
                    // A4 and the king on A3 enable Boden's mate by the bishop
                    // pair. In every other case white cannot win.
                    || (pieces.knight >= 1 && pieces.rook + pieces.queen >= 1));
            }
            else if (horde.bishop >= 1 && horde.knight >= 1) {
                // The horde has a bishop and a knight.
                return !(
                // A king on A1 obstructed by a pawn/opposite-color-bishop on
                // A2 is mated by a knight on D2 and a bishop on C3.
                pieces.pawn >= 1
                    || piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1
                    // A king on A1 bounded by two friendly pieces on A2 and B1 is
                    // mated when the knight moves from D4 to C2 so that both the
                    // knight and the bishop deliver check.
                    || piecesOfRoleNot(piecesBishops(hordeBishopColor)) >= 3);
            }
            else {
                // The horde has two or more bishops on the same color.
                // White can only win if black has enough material to obstruct
                // the squares of the opposite color around the king.
                return !(
                // A king on A1 obstructed by a pawn/opposite-bishop/knight
                // on A2 and a opposite-bishop/knight on B1 is mated by two
                // bishops on B2 and C3. This position is theoretically
                // achievable even when black has two pawns or when they
                // have a pawn and an opposite color bishop.
                (pieces.pawn >= 1 && piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1)
                    || (pieces.pawn >= 1 && pieces.knight >= 1)
                    || (piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1 && pieces.knight >= 1)
                    || piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 2
                    || pieces.knight >= 2
                    || pieces.pawn >= 2
                // In every other case, white can only draw.
                );
            }
        }
        else if (hordeNum === 3) {
            // A king in the corner is mated by two knights and a bishop or three
            // knights or the bishop pair and a knight/bishop.
            if ((horde.knight === 2 && horde.bishop === 1) || horde.knight === 3 || hasBishopPair(color)) {
                return false;
            }
            else {
                // White has two same color bishops and a knight.
                // A king on A1 is mated by a bishop on B2, a bishop on C1 and a
                // knight on C3, as long as there is another black piece to waste
                // a tempo.
                return piecesNum === 1;
            }
        }
        return true;
    }
    isVariantEnd() {
        return this.board.white.isEmpty() || this.board.black.isEmpty();
    }
    variantOutcome(_ctx) {
        if (this.board.white.isEmpty())
            return { winner: 'black' };
        if (this.board.black.isEmpty())
            return { winner: 'white' };
        return;
    }
}
exports.Horde = Horde;
const defaultPosition = (rules) => {
    switch (rules) {
        case 'chess':
            return chess_js_1.Chess.default();
        case 'antichess':
            return Antichess.default();
        case 'atomic':
            return Atomic.default();
        case 'horde':
            return Horde.default();
        case 'racingkings':
            return RacingKings.default();
        case 'kingofthehill':
            return KingOfTheHill.default();
        case '3check':
            return ThreeCheck.default();
        case 'crazyhouse':
            return Crazyhouse.default();
    }
};
exports.defaultPosition = defaultPosition;
const setupPosition = (rules, setup) => {
    switch (rules) {
        case 'chess':
            return chess_js_1.Chess.fromSetup(setup);
        case 'antichess':
            return Antichess.fromSetup(setup);
        case 'atomic':
            return Atomic.fromSetup(setup);
        case 'horde':
            return Horde.fromSetup(setup);
        case 'racingkings':
            return RacingKings.fromSetup(setup);
        case 'kingofthehill':
            return KingOfTheHill.fromSetup(setup);
        case '3check':
            return ThreeCheck.fromSetup(setup);
        case 'crazyhouse':
            return Crazyhouse.fromSetup(setup);
    }
};
exports.setupPosition = setupPosition;
const isStandardMaterial = (pos) => {
    var _a, _b, _c, _d, _e;
    switch (pos.rules) {
        case 'chess':
        case 'antichess':
        case 'atomic':
        case 'kingofthehill':
        case '3check':
            return types_js_1.COLORS.every(color => (0, chess_js_1.isStandardMaterialSide)(pos.board, color));
        case 'crazyhouse': {
            const promoted = pos.board.promoted;
            return (promoted.size() + pos.board.pawn.size() + (((_a = pos.pockets) === null || _a === void 0 ? void 0 : _a.count('pawn')) || 0) <= 16
                && pos.board.knight.diff(promoted).size() + (((_b = pos.pockets) === null || _b === void 0 ? void 0 : _b.count('knight')) || 0) <= 4
                && pos.board.bishop.diff(promoted).size() + (((_c = pos.pockets) === null || _c === void 0 ? void 0 : _c.count('bishop')) || 0) <= 4
                && pos.board.rook.diff(promoted).size() + (((_d = pos.pockets) === null || _d === void 0 ? void 0 : _d.count('rook')) || 0) <= 4
                && pos.board.queen.diff(promoted).size() + (((_e = pos.pockets) === null || _e === void 0 ? void 0 : _e.count('queen')) || 0) <= 2);
        }
        case 'horde':
            return types_js_1.COLORS.every(color => pos.board.pieces(color, 'king').nonEmpty()
                ? (0, chess_js_1.isStandardMaterialSide)(pos.board, color)
                : pos.board[color].size() <= 36);
        case 'racingkings':
            return types_js_1.COLORS.every(color => pos.board.pieces(color, 'knight').size() <= 2
                && pos.board.pieces(color, 'bishop').size() <= 2
                && pos.board.pieces(color, 'rook').size() <= 2
                && pos.board.pieces(color, 'queen').size() <= 1);
    }
};
exports.isStandardMaterial = isStandardMaterial;
//# sourceMappingURL=variant.js.map