"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RULES = exports.isNormal = exports.isDrop = exports.CASTLING_SIDES = exports.ROLES = exports.COLORS = exports.RANK_NAMES = exports.FILE_NAMES = void 0;
exports.FILE_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
exports.RANK_NAMES = ['1', '2', '3', '4', '5', '6', '7', '8'];
exports.COLORS = ['white', 'black'];
exports.ROLES = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
exports.CASTLING_SIDES = ['a', 'h'];
const isDrop = (v) => 'role' in v;
exports.isDrop = isDrop;
const isNormal = (v) => 'from' in v;
exports.isNormal = isNormal;
exports.RULES = [
    'chess',
    'antichess',
    'kingofthehill',
    '3check',
    'atomic',
    'horde',
    'racingkings',
    'crazyhouse',
];
//# sourceMappingURL=types.js.map