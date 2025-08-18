"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perft = exports.dests = exports.square = exports.board = exports.piece = exports.squareSet = void 0;
const fen_js_1 = require("./fen.js");
const squareSet_js_1 = require("./squareSet.js");
const types_js_1 = require("./types.js");
const util_js_1 = require("./util.js");
const squareSet = (squares) => {
    const r = [];
    for (let y = 7; y >= 0; y--) {
        for (let x = 0; x < 8; x++) {
            const square = x + y * 8;
            r.push(squares.has(square) ? '1' : '.');
            r.push(x < 7 ? ' ' : '\n');
        }
    }
    return r.join('');
};
exports.squareSet = squareSet;
const piece = (piece) => (0, fen_js_1.makePiece)(piece);
exports.piece = piece;
const board = (board) => {
    const r = [];
    for (let y = 7; y >= 0; y--) {
        for (let x = 0; x < 8; x++) {
            const square = x + y * 8;
            const p = board.get(square);
            const col = p ? (0, exports.piece)(p) : '.';
            r.push(col);
            r.push(x < 7 ? (col.length < 2 ? ' ' : '') : '\n');
        }
    }
    return r.join('');
};
exports.board = board;
const square = (sq) => (0, util_js_1.makeSquare)(sq);
exports.square = square;
const dests = (dests) => {
    const lines = [];
    for (const [from, to] of dests) {
        lines.push(`${(0, util_js_1.makeSquare)(from)}: ${Array.from(to, exports.square).join(' ')}`);
    }
    return lines.join('\n');
};
exports.dests = dests;
const perft = (pos, depth, log = false) => {
    if (depth < 1)
        return 1;
    const promotionRoles = ['queen', 'knight', 'rook', 'bishop'];
    if (pos.rules === 'antichess')
        promotionRoles.push('king');
    const ctx = pos.ctx();
    const dropDests = pos.dropDests(ctx);
    if (!log && depth === 1 && dropDests.isEmpty()) {
        // Optimization for leaf nodes.
        let nodes = 0;
        for (const [from, to] of pos.allDests(ctx)) {
            nodes += to.size();
            if (pos.board.pawn.has(from)) {
                const backrank = squareSet_js_1.SquareSet.backrank((0, util_js_1.opposite)(pos.turn));
                nodes += to.intersect(backrank).size() * (promotionRoles.length - 1);
            }
        }
        return nodes;
    }
    else {
        let nodes = 0;
        for (const [from, dests] of pos.allDests(ctx)) {
            const promotions = (0, util_js_1.squareRank)(from) === (pos.turn === 'white' ? 6 : 1) && pos.board.pawn.has(from) ? promotionRoles : [undefined];
            for (const to of dests) {
                for (const promotion of promotions) {
                    const child = pos.clone();
                    const move = { from, to, promotion };
                    child.play(move);
                    const children = (0, exports.perft)(child, depth - 1, false);
                    if (log)
                        console.log((0, util_js_1.makeUci)(move), children);
                    nodes += children;
                }
            }
        }
        if (pos.pockets) {
            for (const role of types_js_1.ROLES) {
                if (pos.pockets[pos.turn][role] > 0) {
                    for (const to of role === 'pawn' ? dropDests.diff(squareSet_js_1.SquareSet.backranks()) : dropDests) {
                        const child = pos.clone();
                        const move = { role, to };
                        child.play(move);
                        const children = (0, exports.perft)(child, depth - 1, false);
                        if (log)
                            console.log((0, util_js_1.makeUci)(move), children);
                        nodes += children;
                    }
                }
            }
        }
        return nodes;
    }
};
exports.perft = perft;
//# sourceMappingURL=debug.js.map