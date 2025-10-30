"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./parser/util");
var isExportArray = function (e) {
    return e.startsWith('[') && e.endsWith(']');
};
var parseExportArray = function (e) {
    return e
        .replace('[', '')
        .replace(']', '')
        .split(',')
        .map(function (e) { return e.trim(); });
};
var getFileExports = function (file) {
    var exports = {};
    file.exports.forEach(function (e, index) {
        var addExport = function (exportName) {
            exports[exportName] = {
                usageCount: 0,
                location: file.exportLocations[index],
            };
        };
        if (isExportArray(e)) {
            var exportArray = parseExportArray(e);
            exportArray.forEach(addExport);
        }
        else {
            addExport(e);
        }
    });
    return { exports: exports, path: file.fullPath, fileWasImported: false };
};
var getExportMap = function (files) {
    var map = {};
    files.forEach(function (file) {
        map[file.path] = getFileExports(file);
    });
    return map;
};
var processImports = function (file, exportMap) {
    Object.keys(file.imports).forEach(function (key) {
        var _a, _b, _c;
        var importedFileExports = exportMap[util_1.removeFileExtensionToAllowForJsTsJsxTsx(key)] || null;
        var ex = (importedFileExports === null || importedFileExports === void 0 ? void 0 : importedFileExports.exports) || null;
        // Handle imports from an index file
        if (!ex) {
            // Try matching import from /a/b/c -> /a/b/c/index.x
            for (var c = 0; c < util_1.indexCandidates.length; c++) {
                var indexKey = util_1.indexCandidates[c];
                ex = ((_a = exportMap[indexKey]) === null || _a === void 0 ? void 0 : _a.exports) || undefined;
                if (ex)
                    break;
            }
            if (!ex && key.endsWith('index')) {
                // Try matching import from /a/b/c/index -> /a/b/c/index.x
                for (var c = 0; c < util_1.indexCandidateExtensions.length; c++) {
                    var indexKey = key + util_1.indexCandidateExtensions[c];
                    ex = ((_b = exportMap[indexKey]) === null || _b === void 0 ? void 0 : _b.exports) || undefined;
                    if (ex)
                        break;
                }
                if (!ex) {
                    // Try matching import from /a/b/c/index -> /a/b/c
                    var indexKey = key.substring(0, key.length - '/index'.length);
                    ex = ((_c = exportMap[indexKey]) === null || _c === void 0 ? void 0 : _c.exports) || undefined;
                }
            }
        }
        if (!ex) {
            // DEV DEBUG - console.warn(`Could not resolve ${key}`);
            return;
        }
        var addUsage = function (imp) {
            if (!ex[imp]) {
                // The imported symbol we are checking was not found in the imported
                // file. For example:
                // `a.ts` import { b } from './b';
                // `b.ts` does not export a `b` symbol
                // In here `imp` is `b`, `imports` represents `a.ts` and `ex.exports`
                // are the symbols exported by `b.ts`
                ex[imp] = {
                    usageCount: 0,
                    location: {
                        line: 1,
                        character: 1,
                    },
                };
            }
            // DEV DEBUG - console.log(`Marking as used: ${imp} in ${file.path}`);
            ex[imp].usageCount++;
        };
        if (!!importedFileExports) {
            importedFileExports.fileWasImported = true;
        }
        file.imports[key].forEach(function (imp) {
            imp === '*' ? Object.keys(ex).forEach(addUsage) : addUsage(imp);
        });
    });
};
var expandExportFromStarOrStarAsForFile = function (file, exportMap, prefix, isWithAlias) {
    var fileExports = exportMap[file.path];
    file.exports
        .filter(function (ex) { return ex.startsWith(prefix); })
        .forEach(function (ex) {
        var _a;
        delete fileExports.exports[ex];
        var exports = (_a = exportMap[util_1.removeExportStarPrefix(ex)]) === null || _a === void 0 ? void 0 : _a.exports;
        if (exports) {
            Object.keys(exports)
                .filter(function (e) { return e != 'default'; })
                .forEach(function (key) {
                if (!isWithAlias) {
                    // Copy the exports from the imported file:
                    if (!fileExports.exports[key]) {
                        var export1 = exports[key];
                        fileExports.exports[key] = {
                            usageCount: 0,
                            location: export1.location,
                        };
                    }
                    fileExports.exports[key].usageCount = 0;
                }
                // else is export-as: so this file exports a new namespace.
                // Mark the items as imported, for the imported file:
                var importedFileExports = exportMap[util_1.removeExportStarPrefix(ex)];
                if (importedFileExports) {
                    // DEV DEBUG
                    /* console.log(
                      `Marking as used: ${key} in ${removeExportStarPrefix(ex)}`,
                    );
                    console.dir(Object.keys(exportMap));*/
                    importedFileExports.fileWasImported = true;
                    importedFileExports.exports[key].usageCount++;
                }
            });
        }
    });
};
// export * from 'a' (no 'alias')
var expandExportFromStarForFile = function (file, exportMap) {
    expandExportFromStarOrStarAsForFile(file, exportMap, '*:', false);
};
// export * as X from 'a' (has 'alias')
var expandExportFromStarAsForFile = function (file, exportMap) {
    expandExportFromStarOrStarAsForFile(file, exportMap, '*as:', true);
};
var expandExportFromStar = function (files, exportMap) {
    files.forEach(function (file) {
        expandExportFromStarForFile(file, exportMap);
        expandExportFromStarAsForFile(file, exportMap);
    });
};
// Allow disabling of *results*, by path from command line (useful for large projects)
var shouldPathBeExcludedFromResults = function (path, extraOptions) {
    if (!extraOptions || !extraOptions.pathsToExcludeFromReport) {
        return false;
    }
    return extraOptions.pathsToExcludeFromReport.some(function (ignore) {
        return new RegExp(ignore).test(path);
    });
};
var filterFiles = function (files, extraOptions) {
    var _a;
    if (!(extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.ignoreFilesRegex)) {
        return files;
    }
    var regexes = (_a = extraOptions.ignoreFilesRegex) === null || _a === void 0 ? void 0 : _a.map(function (rex) { return new RegExp(rex); });
    var shouldIgnoreFile = function (fileName) {
        return regexes.some(function (reg) {
            return reg.test(fileName);
        });
    };
    return files.filter(function (f) { return !shouldIgnoreFile(f.fullPath); });
};
var areEqual = function (files1, files2) {
    if (files1.length !== files2.length)
        return false;
    return files1.every(function (f) { return files2.includes(f); });
};
var makeExportStarRelativeForPresentation = function (baseUrl, filePath) {
    if (!filePath.startsWith('*')) {
        return filePath;
    }
    var filePathNoStar = util_1.removeExportStarPrefix(filePath);
    if (!!baseUrl && filePathNoStar.startsWith(baseUrl)) {
        return "* -> " + filePathNoStar.substring(baseUrl.length);
    }
    return filePath;
};
exports.default = (function (files, extraOptions) {
    var filteredFiles = filterFiles(files, extraOptions);
    var exportMap = getExportMap(filteredFiles);
    expandExportFromStar(filteredFiles, exportMap);
    filteredFiles.forEach(function (file) { return processImports(file, exportMap); });
    var analysis = { unusedExports: {} };
    var unusedFiles = [];
    Object.keys(exportMap).forEach(function (file) {
        var expItem = exportMap[file];
        var exports = expItem.exports, path = expItem.path;
        if (shouldPathBeExcludedFromResults(path, extraOptions))
            return;
        var unusedExports = Object.keys(exports).filter(function (k) {
            // If the file was imported at least once, then do NOT consider any of its 'export (import) *' as unused.
            // This avoids false positives with transitive import/exports like a -> b -> c.
            if (expItem.fileWasImported && k.startsWith('*')) {
                return false;
            }
            return exports[k].usageCount === 0;
        });
        if (unusedExports.length === 0) {
            return;
        }
        var realExportNames = Object.keys(exports);
        analysis.unusedExports[path] = [];
        unusedExports.forEach(function (e) {
            analysis.unusedExports[path].push({
                exportName: makeExportStarRelativeForPresentation(extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.baseUrl, e),
                location: exports[e].location,
            });
        });
        if ((extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.findCompletelyUnusedFiles) &&
            areEqual(realExportNames, unusedExports)) {
            unusedFiles.push(path);
        }
    });
    if (extraOptions === null || extraOptions === void 0 ? void 0 : extraOptions.findCompletelyUnusedFiles) {
        analysis.unusedFiles = unusedFiles;
    }
    return analysis;
});
//# sourceMappingURL=analyzer.js.map