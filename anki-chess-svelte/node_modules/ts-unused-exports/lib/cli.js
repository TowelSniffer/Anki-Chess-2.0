"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCli = void 0;
var chalk = require("chalk");
var argsParser_1 = require("./argsParser");
var usage_1 = require("./usage");
var app_1 = require("./app");
// eslint style exit code:
var ExitCode;
(function (ExitCode) {
    ExitCode[ExitCode["NoUnusedExportsFound"] = 0] = "NoUnusedExportsFound";
    ExitCode[ExitCode["UnusedExportsFound"] = 1] = "UnusedExportsFound";
    ExitCode[ExitCode["BadArgsOrException"] = 2] = "BadArgsOrException";
})(ExitCode || (ExitCode = {}));
var getLocationInFile = function (location) {
    if (!location) {
        return '';
    }
    return "[" + location.line + "," + location.character + "]";
};
var showMessages = function (files, showMessage, analysis, unusedFiles, options) {
    var filesCountMessage = chalk.bold(files.length.toString()) + " module" + (files.length == 1 ? '' : 's') + " with unused exports";
    showMessage(files.length ? chalk.red(filesCountMessage) : filesCountMessage);
    if (options === null || options === void 0 ? void 0 : options.showLineNumber) {
        files.forEach(function (path) {
            analysis.unusedExports[path].forEach(function (unusedExport) {
                showMessage("" + path + getLocationInFile(unusedExport.location) + ": " + chalk.bold.yellow(unusedExport.exportName));
            });
        });
    }
    else {
        files.forEach(function (path) {
            return showMessage(path + ": " + chalk.bold.yellow(analysis.unusedExports[path].map(function (r) { return r.exportName; }).join(', ')));
        });
    }
    if (unusedFiles && unusedFiles.length > 0) {
        showMessage(chalk.red('Completely unused files:'));
        unusedFiles.forEach(function (path) {
            showMessage(path);
        });
    }
};
exports.runCli = function (exitWith, showError, showMessage, _a) {
    var tsconfig = _a[0], tsFiles = _a.slice(1);
    if (!argsParser_1.hasValidArgs(showError, tsconfig, tsFiles)) {
        showError(usage_1.USAGE);
        return exitWith(ExitCode.BadArgsOrException);
    }
    try {
        var _b = app_1.analyzeTsConfig(tsconfig, tsFiles.length ? tsFiles : undefined), unusedFiles = _b.unusedFiles, analysis_1 = __rest(_b, ["unusedFiles"]);
        var files = Object.keys(analysis_1.unusedExports);
        var options = argsParser_1.extractOptionsFromFiles(tsFiles).options;
        var hideMessages = (options === null || options === void 0 ? void 0 : options.silent) && files.length === 0;
        if (!hideMessages) {
            showMessages(files, showMessage, analysis_1, unusedFiles, options);
        }
        // Max allowed exit code is 127 (single signed byte)
        var MAX_ALLOWED_EXIT_CODE = 127;
        if (options === null || options === void 0 ? void 0 : options.exitWithCount) {
            return exitWith(Math.min(MAX_ALLOWED_EXIT_CODE, files.length));
        }
        else if (options === null || options === void 0 ? void 0 : options.exitWithUnusedTypesCount) {
            var totalIssues = files
                .map(function (f) { return analysis_1.unusedExports[f].length; })
                .reduce(function (previous, current) { return previous + current; }, 0);
            return exitWith(Math.min(MAX_ALLOWED_EXIT_CODE, totalIssues));
        }
        var maxIssues = (options === null || options === void 0 ? void 0 : options.maxIssues) || 0;
        return exitWith(files.length <= maxIssues
            ? ExitCode.NoUnusedExportsFound
            : ExitCode.UnusedExportsFound);
    }
    catch (e) {
        showError(e);
        return exitWith(ExitCode.BadArgsOrException);
    }
};
//# sourceMappingURL=cli.js.map