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
exports.analyzeTsConfig = void 0;
var ts = require("typescript");
var analyzer_1 = require("./analyzer");
var path_1 = require("path");
var argsParser_1 = require("./argsParser");
var parser_1 = require("./parser");
var parseTsConfig = function (tsconfigPath) {
    var basePath = path_1.resolve(path_1.dirname(tsconfigPath));
    tsconfigPath = path_1.resolve(tsconfigPath);
    try {
        var configFileName = ts.findConfigFile(basePath, ts.sys.fileExists, tsconfigPath);
        if (!configFileName)
            throw "Couldn't find " + tsconfigPath;
        var configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
        var result = ts.parseJsonConfigFileContent(configFile.config, ts.sys, basePath, undefined, tsconfigPath);
        if (result.errors.length)
            throw result.errors;
        // We now use absolute paths to avoid ambiguity and to be able to delegate baseUrl resolving to TypeScript.
        // A consequence is, we cannot fall back to '.' so instead the fallback is the tsconfig dir:
        // (I think this only occurs with unit tests!)
        return {
            baseUrl: result.options.baseUrl || basePath,
            paths: result.options.paths,
            files: result.fileNames,
        };
    }
    catch (e) {
        throw "\n    Cannot parse '" + tsconfigPath + "'.\n\n    " + JSON.stringify(e) + "\n  ";
    }
};
var loadTsConfig = function (tsconfigPath, explicitFiles) {
    var _a = parseTsConfig(tsconfigPath), baseUrl = _a.baseUrl, files = _a.files, paths = _a.paths;
    return { baseUrl: baseUrl, paths: paths, files: explicitFiles || files };
};
exports.analyzeTsConfig = function (tsconfigPath, files) {
    var args = argsParser_1.extractOptionsFromFiles(files);
    var tsConfig = loadTsConfig(tsconfigPath, args.tsFiles);
    var options = __assign(__assign({}, args.options), { baseUrl: tsConfig.baseUrl });
    return analyzer_1.default(parser_1.default(tsConfig, args.options), options);
};
//# sourceMappingURL=app.js.map