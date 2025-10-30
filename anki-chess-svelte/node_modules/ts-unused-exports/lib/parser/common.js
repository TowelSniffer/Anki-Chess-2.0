"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFrom = exports.getFromText = exports.STAR = void 0;
exports.STAR = ['*'];
var TRIM_QUOTES = /^['"](.*)['"]$/;
exports.getFromText = function (moduleSpecifier) {
    return moduleSpecifier
        .replace(TRIM_QUOTES, '$1')
        .replace(/\/index(.[mc]?js)?$/, '/index');
}; // Do not completely remove /index as then is ambiguous between file or folder name
exports.getFrom = function (moduleSpecifier) {
    return exports.getFromText(moduleSpecifier.getText());
};
//# sourceMappingURL=common.js.map