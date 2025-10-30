"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNodeDisabledViaComment = void 0;
var ts = require("typescript");
// Parse Comments (that can disable ts-unused-exports)
exports.isNodeDisabledViaComment = function (node, file) {
    var comments = ts.getLeadingCommentRanges(file.getFullText(), node.getFullStart());
    if (comments) {
        var commentRange = comments[comments.length - 1];
        var commentText = file
            .getFullText()
            .substring(commentRange.pos, commentRange.end);
        if (commentText === '// ts-unused-exports:disable-next-line') {
            return true;
        }
    }
    return false;
};
//# sourceMappingURL=comment.js.map