"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addImportsFromNamespace = void 0;
var blacklists_1 = require("./blacklists");
var getPossibleImportedNamespaces = function (imports) {
    var keys = Object.keys(imports);
    var imported = [];
    keys.forEach(function (fromFile) {
        var namespaces = imports[fromFile].map(function (i) { return i + "."; });
        imported.push({
            file: fromFile,
            namespaces: namespaces,
        });
    });
    return imported;
};
var mayContainImportsFromNamespace = function (node, imports) {
    var nodeText = node.getText();
    return imports.some(function (possible) {
        return possible.namespaces.some(function (ns) { return nodeText.includes(ns); });
    });
};
exports.addImportsFromNamespace = function (node, imports, addImport) {
    var possibles = getPossibleImportedNamespaces(imports);
    if (!mayContainImportsFromNamespace(node, possibles)) {
        return;
    }
    // Scan elements in file, for use of any recognised 'namespace.type'
    var findImportUsagesWithin = function (node) {
        var nodeText = node.getText();
        possibles.forEach(function (p) {
            p.namespaces.forEach(function (ns) {
                if (nodeText.startsWith(ns)) {
                    addImport({
                        from: p.file,
                        what: [nodeText],
                    });
                }
            });
        });
    };
    var recurseIntoChildren = function (next) {
        findImportUsagesWithin(next);
        next
            .getChildren()
            .filter(function (c) { return !blacklists_1.namespaceBlacklist.includes(c.kind); })
            .forEach(recurseIntoChildren);
    };
    recurseIntoChildren(node);
};
//# sourceMappingURL=imports-from-namespace.js.map