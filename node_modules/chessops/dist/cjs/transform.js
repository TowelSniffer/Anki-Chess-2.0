"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformSetup = exports.transformBoard = exports.rotate180 = exports.flipDiagonal = exports.flipHorizontal = exports.flipVertical = void 0;
const board_js_1 = require("./board.js");
const squareSet_js_1 = require("./squareSet.js");
const types_js_1 = require("./types.js");
const util_js_1 = require("./util.js");
const flipVertical = (s) => s.bswap64();
exports.flipVertical = flipVertical;
const flipHorizontal = (s) => {
    const k1 = new squareSet_js_1.SquareSet(0x55555555, 0x55555555);
    const k2 = new squareSet_js_1.SquareSet(0x33333333, 0x33333333);
    const k4 = new squareSet_js_1.SquareSet(0x0f0f0f0f, 0x0f0f0f0f);
    s = s.shr64(1).intersect(k1).union(s.intersect(k1).shl64(1));
    s = s.shr64(2).intersect(k2).union(s.intersect(k2).shl64(2));
    s = s.shr64(4).intersect(k4).union(s.intersect(k4).shl64(4));
    return s;
};
exports.flipHorizontal = flipHorizontal;
const flipDiagonal = (s) => {
    let t = s.xor(s.shl64(28)).intersect(new squareSet_js_1.SquareSet(0, 0x0f0f0f0f));
    s = s.xor(t.xor(t.shr64(28)));
    t = s.xor(s.shl64(14)).intersect(new squareSet_js_1.SquareSet(0x33330000, 0x33330000));
    s = s.xor(t.xor(t.shr64(14)));
    t = s.xor(s.shl64(7)).intersect(new squareSet_js_1.SquareSet(0x55005500, 0x55005500));
    s = s.xor(t.xor(t.shr64(7)));
    return s;
};
exports.flipDiagonal = flipDiagonal;
const rotate180 = (s) => s.rbit64();
exports.rotate180 = rotate180;
const transformBoard = (board, f) => {
    const b = board_js_1.Board.empty();
    b.occupied = f(board.occupied);
    b.promoted = f(board.promoted);
    for (const color of types_js_1.COLORS)
        b[color] = f(board[color]);
    for (const role of types_js_1.ROLES)
        b[role] = f(board[role]);
    return b;
};
exports.transformBoard = transformBoard;
const transformSetup = (setup, f) => {
    var _a, _b;
    return ({
        board: (0, exports.transformBoard)(setup.board, f),
        pockets: (_a = setup.pockets) === null || _a === void 0 ? void 0 : _a.clone(),
        turn: setup.turn,
        castlingRights: f(setup.castlingRights),
        epSquare: (0, util_js_1.defined)(setup.epSquare) ? f(squareSet_js_1.SquareSet.fromSquare(setup.epSquare)).first() : undefined,
        remainingChecks: (_b = setup.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone(),
        halfmoves: setup.halfmoves,
        fullmoves: setup.fullmoves,
    });
};
exports.transformSetup = transformSetup;
//# sourceMappingURL=transform.js.map