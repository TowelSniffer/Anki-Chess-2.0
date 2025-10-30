"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNode = void 0;
var ts = require("typescript");
var common_1 = require("./common");
var dynamic_1 = require("./dynamic");
var export_1 = require("./export");
var kinds_1 = require("./kinds");
var imports_from_namespace_1 = require("./imports-from-namespace");
var import_1 = require("./import");
var blacklists_1 = require("./blacklists");
var util_1 = require("./util");
var hasModifier = function (node, mod) {
    return node.modifiers && node.modifiers.filter(function (m) { return m.kind === mod; }).length > 0;
};
var processExportDeclaration = function (node, addImport, addExport, exportNames, extraOptions) {
    var exportDecl = node;
    if ((exportDecl.isTypeOnly && (extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.allowUnusedTypes)) ||
        (kinds_1.ENUM_NODE_KINDS.includes(exportDecl.kind) && (extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.allowUnusedEnums))) {
        return;
    }
    var moduleSpecifier = exportDecl.moduleSpecifier;
    if (moduleSpecifier === undefined) {
        export_1.extractExportStatement(exportDecl).forEach(function (e) { return addExport(e, node); });
        return;
    }
    else {
        var _a = export_1.extractExportFromImport(exportDecl, moduleSpecifier), exported = _a.exported, imported = _a.imported;
        var key = addImport(imported);
        if (key) {
            var what = exported.what;
            if (what == common_1.STAR) {
                addExport("*:" + key, node);
            }
            if (what != common_1.STAR) {
                if (imported.isExportStarAs) {
                    addExport("*as:" + key, node);
                }
                what.forEach(function (w) { return exportNames.push(w); });
            }
        }
        return;
    }
};
var processExportKeyword = function (node, path, addExport, namespace, processSubNode, extraOptions) {
    if (hasModifier(node, ts.SyntaxKind.DefaultKeyword)) {
        addExport('default', node);
        return;
    }
    var decl = node;
    var names = decl.name ? [decl.name.text] : export_1.extractExportNames(path, node);
    names
        .filter(function (name) { return !!name; })
        .forEach(function (name) {
        addExport(namespace.namespace + name, node);
        if (extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.searchNamespaces) {
            // performance: halves the time taken on large codebase (150k loc)
            var isNamespace = node
                .getChildren()
                .some(function (c) { return c.kind === ts.SyntaxKind.NamespaceKeyword; });
            if (isNamespace) {
                // Process the children, in case they *export* any types:
                node
                    .getChildren()
                    .filter(function (c) { return c.kind === ts.SyntaxKind.Identifier; })
                    .forEach(function (c) {
                    processSubNode(c, namespace.namespace + name + '.');
                });
                namespace.namespace += name + '.';
            }
        }
    });
};
exports.processNode = function (node, path, addImport, addExport, imports, exportNames, extraOptions, namespace) {
    if (namespace === void 0) { namespace = ''; }
    var kind = node.kind;
    var processSubNode = function (subNode, namespace) {
        exports.processNode(subNode, path, addImport, addExport, imports, exportNames, extraOptions, namespace);
    };
    if (kind === ts.SyntaxKind.ImportDeclaration) {
        addImport(import_1.extractImport(node));
        return;
    }
    if (kind === ts.SyntaxKind.ExportAssignment) {
        addExport('default', node);
        return;
    }
    if (kind === ts.SyntaxKind.ExportDeclaration) {
        processExportDeclaration(node, addImport, addExport, exportNames, extraOptions);
    }
    // Searching for dynamic imports requires inspecting statements in the file,
    // so for performance should only be done when necessary.
    if (dynamic_1.mayContainDynamicImports(node)) {
        dynamic_1.addDynamicImports(node, addImport);
    }
    // Searching for use of types in namespace requires inspecting statements in the file,
    // so for performance should only be done when necessary.
    if (extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.searchNamespaces) {
        imports_from_namespace_1.addImportsFromNamespace(node, imports, addImport);
    }
    if ((extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.ignoreLocallyUsed) && kind === ts.SyntaxKind.Identifier) {
        addImport({
            from: util_1.removeTsFileExtension(node.getSourceFile().fileName),
            what: [node.getText()],
        });
    }
    if (hasModifier(node, ts.SyntaxKind.ExportKeyword)) {
        var nsHolder = {
            namespace: namespace,
        };
        processExportKeyword(node, path, addExport, nsHolder, processSubNode, extraOptions);
        namespace = nsHolder.namespace;
    }
    if (namespace.length > 0 || (extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.ignoreLocallyUsed)) {
        // In namespace: need to process children, in case they *import* any types
        // If ignoreLocallyUsed: need to iterate through whole AST to find local uses of exported variables
        var blacklist_1 = (extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.ignoreLocallyUsed) ? blacklists_1.ignoreLocalBlacklist
            : blacklists_1.namespaceBlacklist;
        node
            .getChildren()
            .filter(function (c) { return !blacklist_1.includes(c.kind); })
            .forEach(function (c) {
            processSubNode(c, namespace);
        });
    }
};
//# sourceMappingURL=nodeProcessor.js.map