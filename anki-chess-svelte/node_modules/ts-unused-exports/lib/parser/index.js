"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var tsconfigPaths = require("tsconfig-paths");
var export_1 = require("./export");
var import_1 = require("./import");
var util_1 = require("./util");
var comment_1 = require("./comment");
var nodeProcessor_1 = require("./nodeProcessor");
var fs_1 = require("fs");
var path_1 = require("path");
var path = require("path");
var cleanFilename = function (pathIn) {
    var nameOnly = path.parse(pathIn).name;
    var nameOnlyWithoutIndex = nameOnly.replace(/([\\/])index\.[^.]*$/, '');
    // Imports always have the '.d' part dropped from the filename,
    // so for the export counting to work with d.ts files, we need to also drop '.d' part.
    // Assumption: the same folder will not contain two files like: a.ts, a.d.ts.
    if (!!nameOnlyWithoutIndex.match(/\.d$/)) {
        return nameOnlyWithoutIndex.substr(0, nameOnly.length - 2);
    }
    return nameOnlyWithoutIndex;
};
// We remove extension, so that we can handle many different file types
var pathWithoutExtension = function (pathIn) {
    var parsed = path.parse(pathIn);
    if (util_1.indexCandidates.some(function (i) { return pathIn.endsWith(i); }))
        return parsed.dir;
    return path.join(parsed.dir, cleanFilename(pathIn));
};
var mapFile = function (path, file, baseUrl, paths, extraOptions) {
    var imports = {};
    var exportNames = [];
    var exportLocations = [];
    var tsconfigPathsMatcher = (!!paths && tsconfigPaths.createMatchPath(baseUrl, paths)) || undefined;
    var addImport = function (fw) {
        return import_1.addImportCore(fw, path, imports, baseUrl, tsconfigPathsMatcher);
    };
    var addExport = function (exportName, node) {
        export_1.addExportCore(exportName, file, node, exportLocations, exportNames, extraOptions);
    };
    ts.forEachChild(file, function (node) {
        if (comment_1.isNodeDisabledViaComment(node, file)) {
            return;
        }
        nodeProcessor_1.processNode(node, path, addImport, addExport, imports, exportNames, extraOptions);
    });
    return {
        path: pathWithoutExtension(path),
        fullPath: path,
        imports: imports,
        exports: exportNames,
        exportLocations: exportLocations,
    };
};
var parseFile = function (path, baseUrl, paths, extraOptions) {
    return mapFile(path, ts.createSourceFile(path, fs_1.readFileSync(path, { encoding: 'utf8' }), ts.ScriptTarget.ES2015, 
    /*setParentNodes */ true), baseUrl, paths, extraOptions);
};
var parsePaths = function (_a, extraOptions) {
    var baseUrl = _a.baseUrl, filePaths = _a.files, paths = _a.paths;
    var includeDeclarationFiles = !(extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.excludeDeclarationFiles);
    var files = filePaths
        .filter(function (p) { return includeDeclarationFiles || !p.includes('.d.'); })
        .map(function (path) { return parseFile(path_1.resolve('.', path), baseUrl, paths, extraOptions); });
    return files;
};
exports.default = (function (TsConfig, extraOptions) {
    return parsePaths(TsConfig, extraOptions);
});
//# sourceMappingURL=index.js.map