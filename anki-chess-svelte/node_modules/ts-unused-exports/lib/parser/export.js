"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExportCore = exports.extractExportNames = exports.extractExportFromImport = exports.extractExportStatement = void 0;
var ts = require("typescript");
var kinds_1 = require("./kinds");
var common_1 = require("./common");
// Parse Exports
var extractAliasFirstFromElements = function (elements) { return elements.map(function (e) { return e.name.text; }); };
var extractPropertyOrAliasFirstFromElements = function (elements) { return elements.map(function (e) { return (e.propertyName || e.name).text; }); };
var extractFromBindingsWith = function (bindings, extract) {
    if (ts.isNamedExports(bindings))
        return extract(bindings.elements);
    return [bindings.name.text];
};
var extractAliasFirstFromBindings = function (bindings) {
    return extractFromBindingsWith(bindings, extractAliasFirstFromElements);
};
var extractPropertyOrAliasFromBindings = function (bindings) {
    return extractFromBindingsWith(bindings, extractPropertyOrAliasFirstFromElements);
};
exports.extractExportStatement = function (decl) {
    return decl.exportClause
        ? extractAliasFirstFromBindings(decl.exportClause)
        : [];
};
exports.extractExportFromImport = function (decl, moduleSpecifier) {
    var exportClause = decl.exportClause;
    var whatExported = exportClause
        ? // The alias 'name' or the original type is exported
            extractAliasFirstFromBindings(exportClause)
        : common_1.STAR;
    var whatImported = exportClause
        ? // The original type 'propertyName' is imported
            extractPropertyOrAliasFromBindings(exportClause)
        : common_1.STAR;
    var from = common_1.getFrom(moduleSpecifier);
    return {
        exported: {
            from: from,
            what: whatExported,
        },
        imported: {
            from: from,
            what: whatImported,
            isExportStarAs: (exportClause === null || exportClause === void 0 ? void 0 : exportClause.kind) === ts.SyntaxKind.NamespaceExport,
        },
    };
};
// Can be a name like 'a' or else a destructured set like '{ a, b }'
var parseExportNames = function (exportName) {
    if (exportName.startsWith('{')) {
        var names = exportName.substring(1, exportName.length - 2);
        return names
            .split(',')
            .map(function (n) { return (n.includes(':') ? n.split(':')[1] : n); })
            .map(function (n) { return n.trim(); });
    }
    return [exportName];
};
exports.extractExportNames = function (path, node) {
    switch (node.kind) {
        case ts.SyntaxKind.VariableStatement:
            return parseExportNames(
            // prettier-ignore
            node.declarationList.declarations[0].name.getText());
        case ts.SyntaxKind.FunctionDeclaration:
            var name_1 = node.name;
            return [name_1 ? name_1.text : 'default'];
        default: {
            console.warn("WARN: " + path + ": unknown export node (kind:" + node.kind + ")");
            return [''];
        }
    }
};
var shouldNodeTypeBeIgnored = function (node, extraOptions) {
    var allowUnusedTypes = !!(extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.allowUnusedTypes);
    var allowUnusedEnums = !!(extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.allowUnusedEnums);
    if (allowUnusedTypes && allowUnusedEnums)
        return (kinds_1.TYPE_OR_INTERFACE_NODE_KINDS.includes(node.kind) ||
            kinds_1.ENUM_NODE_KINDS.includes(node.kind));
    if (allowUnusedTypes)
        return kinds_1.TYPE_OR_INTERFACE_NODE_KINDS.includes(node.kind);
    if (allowUnusedEnums)
        return kinds_1.ENUM_NODE_KINDS.includes(node.kind);
    return false;
};
exports.addExportCore = function (exportName, file, node, exportLocations, exports, extraOptions) {
    if (exports.includes(exportName) ||
        shouldNodeTypeBeIgnored(node, extraOptions)) {
        return;
    }
    exports.push(exportName);
    var location = file.getLineAndCharacterOfPosition(node.getStart());
    exportLocations.push({
        line: location.line + 1,
        character: location.character,
    });
};
//# sourceMappingURL=export.js.map