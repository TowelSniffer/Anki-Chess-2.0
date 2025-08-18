import { Board } from './board.js';
import { SquareSet } from './squareSet.js';
import { COLORS, ROLES } from './types.js';
import { defined } from './util.js';
export const flipVertical = (s) => s.bswap64();
export const flipHorizontal = (s) => {
    const k1 = new SquareSet(0x55555555, 0x55555555);
    const k2 = new SquareSet(0x33333333, 0x33333333);
    const k4 = new SquareSet(0x0f0f0f0f, 0x0f0f0f0f);
    s = s.shr64(1).intersect(k1).union(s.intersect(k1).shl64(1));
    s = s.shr64(2).intersect(k2).union(s.intersect(k2).shl64(2));
    s = s.shr64(4).intersect(k4).union(s.intersect(k4).shl64(4));
    return s;
};
export const flipDiagonal = (s) => {
    let t = s.xor(s.shl64(28)).intersect(new SquareSet(0, 0x0f0f0f0f));
    s = s.xor(t.xor(t.shr64(28)));
    t = s.xor(s.shl64(14)).intersect(new SquareSet(0x33330000, 0x33330000));
    s = s.xor(t.xor(t.shr64(14)));
    t = s.xor(s.shl64(7)).intersect(new SquareSet(0x55005500, 0x55005500));
    s = s.xor(t.xor(t.shr64(7)));
    return s;
};
export const rotate180 = (s) => s.rbit64();
export const transformBoard = (board, f) => {
    const b = Board.empty();
    b.occupied = f(board.occupied);
    b.promoted = f(board.promoted);
    for (const color of COLORS)
        b[color] = f(board[color]);
    for (const role of ROLES)
        b[role] = f(board[role]);
    return b;
};
export const transformSetup = (setup, f) => {
    var _a, _b;
    return ({
        board: transformBoard(setup.board, f),
        pockets: (_a = setup.pockets) === null || _a === void 0 ? void 0 : _a.clone(),
        turn: setup.turn,
        castlingRights: f(setup.castlingRights),
        epSquare: defined(setup.epSquare) ? f(SquareSet.fromSquare(setup.epSquare)).first() : undefined,
        remainingChecks: (_b = setup.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone(),
        halfmoves: setup.halfmoves,
        fullmoves: setup.fullmoves,
    });
};
//# sourceMappingURL=transform.js.map