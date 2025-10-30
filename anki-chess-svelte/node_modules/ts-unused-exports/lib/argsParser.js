"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasValidArgs = exports.extractOptionsFromFiles = void 0;
var fs_1 = require("fs");
function processOptions(filesAndOptions, options) {
    var pathsToExcludeFromReport = [];
    var ignoreFilesRegex = [];
    var maxIssues = 0;
    var newOptions = {
        pathsToExcludeFromReport: pathsToExcludeFromReport,
        ignoreFilesRegex: ignoreFilesRegex,
        maxIssues: maxIssues,
    };
    var newFilesAndOptions = {
        options: newOptions,
        tsFiles: filesAndOptions.tsFiles,
    };
    options.forEach(function (option) {
        var parts = option.split('=');
        var optionName = parts[0];
        var optionValue = parts[1];
        switch (optionName) {
            case '--allowUnusedEnums':
                newOptions.allowUnusedEnums = true;
                break;
            case '--allowUnusedTypes':
                newOptions.allowUnusedTypes = true;
                break;
            case '--excludeDeclarationFiles':
                newOptions.excludeDeclarationFiles = true;
                break;
            case '--excludePathsFromReport':
                {
                    var paths = optionValue.split(';');
                    paths.forEach(function (path) {
                        if (path) {
                            pathsToExcludeFromReport.push(path);
                        }
                    });
                }
                break;
            case '--exitWithCount':
                newOptions.exitWithCount = true;
                break;
            case '--exitWithUnusedTypesCount':
                newOptions.exitWithUnusedTypesCount = true;
                break;
            case '--ignoreFiles':
                {
                    ignoreFilesRegex.push(optionValue);
                }
                break;
            case '--ignoreProductionFiles':
                {
                    ignoreFilesRegex.push("^(?!.*(test|Test)).*$");
                }
                break;
            case '--ignoreTestFiles':
                {
                    ignoreFilesRegex.push("(.spec|.test|Test.*)");
                }
                break;
            case '--ignoreLocallyUsed': {
                newOptions.ignoreLocallyUsed = true;
                break;
            }
            case '--maxIssues':
                {
                    newFilesAndOptions.options = __assign(__assign({}, newFilesAndOptions.options), { maxIssues: parseInt(optionValue, 10) || 0 });
                }
                break;
            case '--searchNamespaces':
                newOptions.searchNamespaces = true;
                break;
            case '--showLineNumber':
                newOptions.showLineNumber = true;
                break;
            case '--silent':
                newOptions.silent = true;
                break;
            case '--findCompletelyUnusedFiles':
                newOptions.findCompletelyUnusedFiles = true;
                break;
            default:
                throw new Error("Not a recognised option '" + optionName + "'");
        }
    });
    if (newOptions.exitWithCount && newOptions.exitWithUnusedTypesCount) {
        throw new Error('The options exitWithCount and exitWithUnusedTypesCount are mutually exclusive - please just use one of them.');
    }
    return newFilesAndOptions;
}
function extractOptionsFromFiles(files) {
    var filesAndOptions = {
        tsFiles: undefined,
        options: {
            ignoreFilesRegex: [],
            maxIssues: 0,
        },
    };
    var isOption = function (opt) {
        return opt.startsWith('--');
    };
    if (files) {
        var options = files.filter(function (f) { return isOption(f); });
        var filteredFiles = files.filter(function (f) { return !isOption(f); });
        filesAndOptions.tsFiles = filteredFiles.length ? filteredFiles : undefined;
        return processOptions(filesAndOptions, options);
    }
    return filesAndOptions;
}
exports.extractOptionsFromFiles = extractOptionsFromFiles;
function canExtractOptionsFromFiles(files) {
    try {
        extractOptionsFromFiles(files);
        return true;
    }
    catch (e) {
        if (!!e.message)
            console.error(e.message);
        return false;
    }
}
function isTsConfigValid(tsconfigFilePath) {
    return fs_1.existsSync(tsconfigFilePath) && fs_1.statSync(tsconfigFilePath).isFile();
}
function hasValidArgs(showError, tsconfig, tsFiles) {
    if (!tsconfig) {
        return false;
    }
    if (!isTsConfigValid(tsconfig)) {
        showError("The tsconfig file '" + tsconfig + "' could not be found.");
        return false;
    }
    if (!canExtractOptionsFromFiles(tsFiles)) {
        showError("Invalid options.");
        return false;
    }
    return true;
}
exports.hasValidArgs = hasValidArgs;
//# sourceMappingURL=argsParser.js.map