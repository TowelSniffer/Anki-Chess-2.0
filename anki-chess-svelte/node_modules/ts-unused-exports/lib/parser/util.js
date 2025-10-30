"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFirstChildOfKind = exports.findAllChildrenOfKind = exports.recurseIntoChildren = exports.removeExportStarPrefix = exports.stripExtensionsFromPath = exports.removeTsFileExtension = exports.removeFileExtensionToAllowForJsTsJsxTsx = exports.indexCandidateExtensions = exports.indexCandidates = exports.isUnique = void 0;
var ts = require("typescript");
var blacklists_1 = require("./blacklists");
function isUnique(value, index, self) {
    return self.indexOf(value) === index;
}
exports.isUnique = isUnique;
exports.indexCandidates = [
    '/index',
    '/index.ts',
    '/index.cts',
    '/index.mts',
    '/index.tsx',
    '/index.js',
    '/index.cjs',
    '/index.mjs',
];
exports.indexCandidateExtensions = [
    '.ts',
    '.cts',
    '.mts',
    '.tsx',
    '.js',
    '.cjs',
    '.mjs',
];
function removeFileExtensionToAllowForJsTsJsxTsx(path) {
    // ref: https://www.typescriptlang.org/docs/handbook/esm-node.html
    var extensionsToStrip = ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx'];
    return stripExtensionsFromPath(extensionsToStrip, path);
}
exports.removeFileExtensionToAllowForJsTsJsxTsx = removeFileExtensionToAllowForJsTsJsxTsx;
function removeTsFileExtension(path) {
    var ext = ['.ts'];
    return stripExtensionsFromPath(ext, path);
}
exports.removeTsFileExtension = removeTsFileExtension;
function stripExtensionsFromPath(extensions, path) {
    for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
        var extension = extensions_1[_i];
        if (path.endsWith(extension)) {
            return path.substring(0, path.length - extension.length);
        }
    }
    return path;
}
exports.stripExtensionsFromPath = stripExtensionsFromPath;
function removeExportStarPrefix(path) {
    if (path.startsWith('*:'))
        return path.slice(2);
    else if (path.startsWith('*as:'))
        return path.slice(4);
    return path;
}
exports.removeExportStarPrefix = removeExportStarPrefix;
// A whitelist, to over-ride namespaceBlacklist.
//
// We need to search some structures that would not have a namespace.
var whitelist = [
    ts.SyntaxKind.MethodDeclaration,
    ts.SyntaxKind.PropertyAssignment,
    ts.SyntaxKind.JsxElement,
    ts.SyntaxKind.JsxSelfClosingElement,
];
function runForChildren(next, fun) {
    next
        .getChildren()
        .filter(function (c) { return !blacklists_1.namespaceBlacklist.includes(c.kind) || whitelist.includes(c.kind); })
        .forEach(function (node) {
        fun(node);
    });
}
function recurseIntoChildren(next, fun) {
    var alsoProcessChildren = fun(next);
    if (alsoProcessChildren) {
        runForChildren(next, function (node) { return recurseIntoChildren(node, fun); });
    }
    return alsoProcessChildren;
}
exports.recurseIntoChildren = recurseIntoChildren;
function findAllChildrenOfKind(node, kind) {
    var childrenFound = [];
    var innerFindFirstChildOfKind = function (childNode) {
        if (childNode.kind === kind) {
            childrenFound.push(childNode);
        }
        return true;
    };
    recurseIntoChildren(node, innerFindFirstChildOfKind);
    return childrenFound;
}
exports.findAllChildrenOfKind = findAllChildrenOfKind;
function findFirstChildOfKind(node, kind) {
    var childFound = null;
    var innerFindFirstChildOfKind = function (childNode) {
        if (!childFound && childNode.kind === kind) {
            childFound = childNode;
            return false;
        }
        return true;
    };
    recurseIntoChildren(node, innerFindFirstChildOfKind);
    return childFound;
}
exports.findFirstChildOfKind = findFirstChildOfKind;
//# sourceMappingURL=util.js.map