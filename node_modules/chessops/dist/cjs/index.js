"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgn = exports.variant = exports.transform = exports.san = exports.fen = exports.debug = exports.compat = exports.PositionError = exports.Position = exports.IllegalSetup = exports.Chess = exports.Castles = exports.RemainingChecks = exports.MaterialSide = exports.Material = exports.defaultSetup = exports.Board = exports.rookAttacks = exports.ray = exports.queenAttacks = exports.pawnAttacks = exports.knightAttacks = exports.kingAttacks = exports.bishopAttacks = exports.between = exports.attacks = exports.SquareSet = exports.squareRank = exports.squareFile = exports.roleToChar = exports.parseUci = exports.parseSquare = exports.opposite = exports.makeUci = exports.makeSquare = exports.kingCastlesTo = exports.defined = exports.charToRole = exports.RULES = exports.ROLES = exports.RANK_NAMES = exports.isNormal = exports.isDrop = exports.FILE_NAMES = exports.COLORS = exports.CASTLING_SIDES = void 0;
var types_js_1 = require("./types.js");
Object.defineProperty(exports, "CASTLING_SIDES", { enumerable: true, get: function () { return types_js_1.CASTLING_SIDES; } });
Object.defineProperty(exports, "COLORS", { enumerable: true, get: function () { return types_js_1.COLORS; } });
Object.defineProperty(exports, "FILE_NAMES", { enumerable: true, get: function () { return types_js_1.FILE_NAMES; } });
Object.defineProperty(exports, "isDrop", { enumerable: true, get: function () { return types_js_1.isDrop; } });
Object.defineProperty(exports, "isNormal", { enumerable: true, get: function () { return types_js_1.isNormal; } });
Object.defineProperty(exports, "RANK_NAMES", { enumerable: true, get: function () { return types_js_1.RANK_NAMES; } });
Object.defineProperty(exports, "ROLES", { enumerable: true, get: function () { return types_js_1.ROLES; } });
Object.defineProperty(exports, "RULES", { enumerable: true, get: function () { return types_js_1.RULES; } });
var util_js_1 = require("./util.js");
Object.defineProperty(exports, "charToRole", { enumerable: true, get: function () { return util_js_1.charToRole; } });
Object.defineProperty(exports, "defined", { enumerable: true, get: function () { return util_js_1.defined; } });
Object.defineProperty(exports, "kingCastlesTo", { enumerable: true, get: function () { return util_js_1.kingCastlesTo; } });
Object.defineProperty(exports, "makeSquare", { enumerable: true, get: function () { return util_js_1.makeSquare; } });
Object.defineProperty(exports, "makeUci", { enumerable: true, get: function () { return util_js_1.makeUci; } });
Object.defineProperty(exports, "opposite", { enumerable: true, get: function () { return util_js_1.opposite; } });
Object.defineProperty(exports, "parseSquare", { enumerable: true, get: function () { return util_js_1.parseSquare; } });
Object.defineProperty(exports, "parseUci", { enumerable: true, get: function () { return util_js_1.parseUci; } });
Object.defineProperty(exports, "roleToChar", { enumerable: true, get: function () { return util_js_1.roleToChar; } });
Object.defineProperty(exports, "squareFile", { enumerable: true, get: function () { return util_js_1.squareFile; } });
Object.defineProperty(exports, "squareRank", { enumerable: true, get: function () { return util_js_1.squareRank; } });
var squareSet_js_1 = require("./squareSet.js");
Object.defineProperty(exports, "SquareSet", { enumerable: true, get: function () { return squareSet_js_1.SquareSet; } });
var attacks_js_1 = require("./attacks.js");
Object.defineProperty(exports, "attacks", { enumerable: true, get: function () { return attacks_js_1.attacks; } });
Object.defineProperty(exports, "between", { enumerable: true, get: function () { return attacks_js_1.between; } });
Object.defineProperty(exports, "bishopAttacks", { enumerable: true, get: function () { return attacks_js_1.bishopAttacks; } });
Object.defineProperty(exports, "kingAttacks", { enumerable: true, get: function () { return attacks_js_1.kingAttacks; } });
Object.defineProperty(exports, "knightAttacks", { enumerable: true, get: function () { return attacks_js_1.knightAttacks; } });
Object.defineProperty(exports, "pawnAttacks", { enumerable: true, get: function () { return attacks_js_1.pawnAttacks; } });
Object.defineProperty(exports, "queenAttacks", { enumerable: true, get: function () { return attacks_js_1.queenAttacks; } });
Object.defineProperty(exports, "ray", { enumerable: true, get: function () { return attacks_js_1.ray; } });
Object.defineProperty(exports, "rookAttacks", { enumerable: true, get: function () { return attacks_js_1.rookAttacks; } });
var board_js_1 = require("./board.js");
Object.defineProperty(exports, "Board", { enumerable: true, get: function () { return board_js_1.Board; } });
var setup_js_1 = require("./setup.js");
Object.defineProperty(exports, "defaultSetup", { enumerable: true, get: function () { return setup_js_1.defaultSetup; } });
Object.defineProperty(exports, "Material", { enumerable: true, get: function () { return setup_js_1.Material; } });
Object.defineProperty(exports, "MaterialSide", { enumerable: true, get: function () { return setup_js_1.MaterialSide; } });
Object.defineProperty(exports, "RemainingChecks", { enumerable: true, get: function () { return setup_js_1.RemainingChecks; } });
var chess_js_1 = require("./chess.js");
Object.defineProperty(exports, "Castles", { enumerable: true, get: function () { return chess_js_1.Castles; } });
Object.defineProperty(exports, "Chess", { enumerable: true, get: function () { return chess_js_1.Chess; } });
Object.defineProperty(exports, "IllegalSetup", { enumerable: true, get: function () { return chess_js_1.IllegalSetup; } });
Object.defineProperty(exports, "Position", { enumerable: true, get: function () { return chess_js_1.Position; } });
Object.defineProperty(exports, "PositionError", { enumerable: true, get: function () { return chess_js_1.PositionError; } });
exports.compat = __importStar(require("./compat.js"));
exports.debug = __importStar(require("./debug.js"));
exports.fen = __importStar(require("./fen.js"));
exports.san = __importStar(require("./san.js"));
exports.transform = __importStar(require("./transform.js"));
exports.variant = __importStar(require("./variant.js"));
exports.pgn = __importStar(require("./pgn.js"));
//# sourceMappingURL=index.js.map