"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEquals = exports.setupClone = exports.defaultSetup = exports.RemainingChecks = exports.Material = exports.MaterialSide = void 0;
const board_js_1 = require("./board.js");
const squareSet_js_1 = require("./squareSet.js");
const types_js_1 = require("./types.js");
class MaterialSide {
    constructor() { }
    static empty() {
        const m = new MaterialSide();
        for (const role of types_js_1.ROLES)
            m[role] = 0;
        return m;
    }
    static fromBoard(board, color) {
        const m = new MaterialSide();
        for (const role of types_js_1.ROLES)
            m[role] = board.pieces(color, role).size();
        return m;
    }
    clone() {
        const m = new MaterialSide();
        for (const role of types_js_1.ROLES)
            m[role] = this[role];
        return m;
    }
    equals(other) {
        return types_js_1.ROLES.every(role => this[role] === other[role]);
    }
    add(other) {
        const m = new MaterialSide();
        for (const role of types_js_1.ROLES)
            m[role] = this[role] + other[role];
        return m;
    }
    subtract(other) {
        const m = new MaterialSide();
        for (const role of types_js_1.ROLES)
            m[role] = this[role] - other[role];
        return m;
    }
    nonEmpty() {
        return types_js_1.ROLES.some(role => this[role] > 0);
    }
    isEmpty() {
        return !this.nonEmpty();
    }
    hasPawns() {
        return this.pawn > 0;
    }
    hasNonPawns() {
        return this.knight > 0 || this.bishop > 0 || this.rook > 0 || this.queen > 0 || this.king > 0;
    }
    size() {
        return this.pawn + this.knight + this.bishop + this.rook + this.queen + this.king;
    }
}
exports.MaterialSide = MaterialSide;
class Material {
    constructor(white, black) {
        this.white = white;
        this.black = black;
    }
    static empty() {
        return new Material(MaterialSide.empty(), MaterialSide.empty());
    }
    static fromBoard(board) {
        return new Material(MaterialSide.fromBoard(board, 'white'), MaterialSide.fromBoard(board, 'black'));
    }
    clone() {
        return new Material(this.white.clone(), this.black.clone());
    }
    equals(other) {
        return this.white.equals(other.white) && this.black.equals(other.black);
    }
    add(other) {
        return new Material(this.white.add(other.white), this.black.add(other.black));
    }
    subtract(other) {
        return new Material(this.white.subtract(other.white), this.black.subtract(other.black));
    }
    count(role) {
        return this.white[role] + this.black[role];
    }
    size() {
        return this.white.size() + this.black.size();
    }
    isEmpty() {
        return this.white.isEmpty() && this.black.isEmpty();
    }
    nonEmpty() {
        return !this.isEmpty();
    }
    hasPawns() {
        return this.white.hasPawns() || this.black.hasPawns();
    }
    hasNonPawns() {
        return this.white.hasNonPawns() || this.black.hasNonPawns();
    }
}
exports.Material = Material;
class RemainingChecks {
    constructor(white, black) {
        this.white = white;
        this.black = black;
    }
    static default() {
        return new RemainingChecks(3, 3);
    }
    clone() {
        return new RemainingChecks(this.white, this.black);
    }
    equals(other) {
        return this.white === other.white && this.black === other.black;
    }
}
exports.RemainingChecks = RemainingChecks;
const defaultSetup = () => ({
    board: board_js_1.Board.default(),
    pockets: undefined,
    turn: 'white',
    castlingRights: squareSet_js_1.SquareSet.corners(),
    epSquare: undefined,
    remainingChecks: undefined,
    halfmoves: 0,
    fullmoves: 1,
});
exports.defaultSetup = defaultSetup;
const setupClone = (setup) => {
    var _a, _b;
    return ({
        board: setup.board.clone(),
        pockets: (_a = setup.pockets) === null || _a === void 0 ? void 0 : _a.clone(),
        turn: setup.turn,
        castlingRights: setup.castlingRights,
        epSquare: setup.epSquare,
        remainingChecks: (_b = setup.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone(),
        halfmoves: setup.halfmoves,
        fullmoves: setup.fullmoves,
    });
};
exports.setupClone = setupClone;
const setupEquals = (left, right) => {
    var _a, _b;
    return (0, board_js_1.boardEquals)(left.board, right.board)
        && ((right.pockets && ((_a = left.pockets) === null || _a === void 0 ? void 0 : _a.equals(right.pockets))) || (!left.pockets && !right.pockets))
        && left.turn === right.turn
        && left.castlingRights.equals(right.castlingRights)
        && left.epSquare === right.epSquare
        && ((right.remainingChecks && ((_b = left.remainingChecks) === null || _b === void 0 ? void 0 : _b.equals(right.remainingChecks)))
            || (!left.remainingChecks && !right.remainingChecks))
        && left.halfmoves === right.halfmoves
        && left.fullmoves === right.fullmoves;
};
exports.setupEquals = setupEquals;
//# sourceMappingURL=setup.js.map