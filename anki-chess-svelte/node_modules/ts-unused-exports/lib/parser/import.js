"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addImportCore = exports.extractImport = void 0;
var common_1 = require("./common");
var path_1 = require("path");
var fs_1 = require("fs");
var util_1 = require("./util");
var path = require("path");
// Parse Imports
var EXTENSIONS = [
    '.d.ts',
    '.ts',
    '.cts',
    '.mts',
    '.tsx',
    '.js',
    '.cjs',
    '.mjs',
    '.jsx',
];
var isRelativeToBaseDir = function (baseDir, from) {
    return fs_1.existsSync(path_1.resolve(baseDir, from + ".js")) ||
        fs_1.existsSync(path_1.resolve(baseDir, from + ".cjs")) ||
        fs_1.existsSync(path_1.resolve(baseDir, from + ".mjs")) ||
        fs_1.existsSync(path_1.resolve(baseDir, from + ".ts")) ||
        fs_1.existsSync(path_1.resolve(baseDir, from + ".cts")) ||
        fs_1.existsSync(path_1.resolve(baseDir, from + ".mts")) ||
        fs_1.existsSync(path_1.resolve(baseDir, from + ".d.ts")) ||
        fs_1.existsSync(path_1.resolve(baseDir, from + ".tsx")) ||
        fs_1.existsSync(path_1.resolve(baseDir, from, 'index.js')) ||
        fs_1.existsSync(path_1.resolve(baseDir, from, 'index.cjs')) ||
        fs_1.existsSync(path_1.resolve(baseDir, from, 'index.mjs')) ||
        fs_1.existsSync(path_1.resolve(baseDir, from, 'index.ts')) ||
        fs_1.existsSync(path_1.resolve(baseDir, from, 'index.cts')) ||
        fs_1.existsSync(path_1.resolve(baseDir, from, 'index.mts')) ||
        fs_1.existsSync(path_1.resolve(baseDir, from, 'index.tsx'));
};
var joinWithBaseUrl = function (baseUrl, from) {
    if (!from.startsWith(baseUrl))
        return path.join(baseUrl, from);
    return from;
};
exports.extractImport = function (decl) {
    var from = common_1.getFrom(decl.moduleSpecifier);
    var importClause = decl.importClause;
    if (!importClause)
        return {
            from: from,
            what: common_1.STAR,
        };
    var namedBindings = importClause.namedBindings;
    var importDefault = !!importClause.name ? ['default'] : [];
    if (!namedBindings) {
        return {
            from: from,
            what: importDefault,
        };
    }
    var isStar = !!namedBindings.name;
    var importNames = isStar
        ? common_1.STAR
        : namedBindings.elements.map(function (e) { return (e.propertyName || e.name).text; });
    // note on namespaces: when importing a namespace, we cannot differentiate that from another element.
    // (we differentiate on *export*)
    return {
        from: from,
        what: importDefault.concat(importNames),
    };
};
var declarationFilePatch = function (matchedPath) {
    return matchedPath.endsWith('.d') && fs_1.existsSync(matchedPath + ".ts")
        ? matchedPath.slice(0, -2)
        : matchedPath;
};
exports.addImportCore = function (fw, pathIn, imports, baseUrl, tsconfigPathsMatcher) {
    var from = fw.from, what = fw.what;
    var getKey = function (from) {
        if (from[0] == '.') {
            // An undefined return indicates the import is from 'index.ts' or similar == '.'
            return path_1.resolve(path_1.dirname(pathIn), from) || '.';
        }
        else {
            var matchedPath = void 0;
            if (isRelativeToBaseDir(baseUrl, from)) {
                return joinWithBaseUrl(baseUrl, from);
            }
            if (tsconfigPathsMatcher &&
                (matchedPath = tsconfigPathsMatcher(from, undefined, undefined, EXTENSIONS))) {
                var matched = declarationFilePatch(matchedPath);
                if (!matched.startsWith(baseUrl))
                    return path.join(baseUrl, matched);
                // Use join to normalize path separators, since tsconfig-path can return mixed path separators (Windows)
                return path.join(matched);
            }
            return joinWithBaseUrl(baseUrl, from);
        }
    };
    var key = getKey(from);
    var items = imports[key] || [];
    imports[key] = items.concat(what).filter(util_1.isUnique);
    return key;
};
//# sourceMappingURL=import.js.map