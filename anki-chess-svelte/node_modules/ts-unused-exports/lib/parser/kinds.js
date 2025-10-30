"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENUM_NODE_KINDS = exports.TYPE_OR_INTERFACE_NODE_KINDS = void 0;
var ts = require("typescript");
exports.TYPE_OR_INTERFACE_NODE_KINDS = [
    ts.SyntaxKind.InterfaceDeclaration,
    ts.SyntaxKind.TypeAliasDeclaration,
];
exports.ENUM_NODE_KINDS = [ts.SyntaxKind.EnumDeclaration];
//# sourceMappingURL=kinds.js.map