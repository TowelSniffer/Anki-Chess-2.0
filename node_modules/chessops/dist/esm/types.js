export const FILE_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANK_NAMES = ['1', '2', '3', '4', '5', '6', '7', '8'];
export const COLORS = ['white', 'black'];
export const ROLES = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
export const CASTLING_SIDES = ['a', 'h'];
export const isDrop = (v) => 'role' in v;
export const isNormal = (v) => 'from' in v;
export const RULES = [
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