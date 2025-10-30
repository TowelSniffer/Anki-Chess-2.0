"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDynamicImports = exports.mayContainDynamicImports = void 0;
var ts = require("typescript");
var common_1 = require("./common");
var util_1 = require("./util");
var blacklists_1 = require("./blacklists");
// Parse Dynamic Imports
exports.mayContainDynamicImports = function (node) {
    return !blacklists_1.namespaceBlacklist.includes(node.kind) && node.getText().includes('import(');
};
function isWithExpressionBoolean(node) {
    var myInterface = node;
    return !!myInterface.expression;
}
function isWithExpression(node) {
    return isWithExpressionBoolean(node);
}
var parseDereferencedLambdaParamsToTypes = function (paramName, lambda) {
    var types = [];
    var usagePrefix = paramName + ".";
    util_1.recurseIntoChildren(lambda, function (child) {
        if (child.getText().startsWith(usagePrefix)) {
            var usage = child.getText().substring(usagePrefix.length);
            types.push(usage);
        }
        return true;
    });
    return types;
};
var hasBracesLike = function (paramList, openBrace, closeBrace) {
    return paramList.startsWith(openBrace) && paramList.endsWith(closeBrace);
};
var parseDestructuredLambdaParamsToTypes = function (paramList) {
    if (hasBracesLike(paramList, '{', '}')) {
        var names = paramList.substring(1, paramList.length - 1);
        return names
            .split(',')
            .map(function (n) { return (n.includes(':') ? n.split(':')[0] : n); })
            .map(function (n) { return n.trim(); });
    }
    return [paramList];
};
/* Handle lambdas where the content uses imported types, via dereferencing.
 * example:
 * A_imported => {
 *   console.log(A_imported.A);
 * }
 */
var findLambdasWithDereferencing = function (node) {
    var what = [];
    var processLambda = function (lambda) {
        if (lambda.getChildCount() === 3) {
            var paramName = lambda.getChildren()[0].getText();
            parseDereferencedLambdaParamsToTypes(paramName, lambda).forEach(function (t) {
                return what.push(t);
            });
        }
        else if (lambda.getChildCount() === 5 &&
            lambda.getChildAt(1).kind == ts.SyntaxKind.SyntaxList) {
            var paramNames = lambda.getChildren()[1].getText();
            parseDestructuredLambdaParamsToTypes(paramNames).forEach(function (p) {
                what.push(p);
                parseDereferencedLambdaParamsToTypes(p, lambda).forEach(function (t) {
                    return what.push(t);
                });
            });
        }
    };
    var firstArrow = util_1.findFirstChildOfKind(node, ts.SyntaxKind.ArrowFunction);
    if (firstArrow) {
        processLambda(firstArrow);
    }
    return what;
};
var addImportViaLambda = function (node, from, addImport) {
    var whatFromLambda = findLambdasWithDereferencing(node);
    var what = ['default'].concat(whatFromLambda);
    addImport({
        from: common_1.getFromText(from),
        what: what,
    });
    return whatFromLambda.length !== 0;
};
var tryParseImportExpression = function (expr, addImport) {
    var callExpression = util_1.findFirstChildOfKind(expr, ts.SyntaxKind.CallExpression);
    if (!(callExpression === null || callExpression === void 0 ? void 0 : callExpression.getText().startsWith('import'))) {
        return false;
    }
    var syntaxListWithFrom = util_1.findFirstChildOfKind(callExpression, ts.SyntaxKind.SyntaxList);
    if (!syntaxListWithFrom) {
        return false;
    }
    var from = syntaxListWithFrom.getText();
    return addImportViaLambda(expr, from, addImport);
};
var tryParseExpression = function (expr, addImport) {
    if (expr.getText().startsWith('import')) {
        return tryParseImportExpression(expr, addImport);
    }
    // Handle complex expressions, where the 'import' is buried in a tree.
    // Example: see test with Promise.all[]
    util_1.recurseIntoChildren(expr, function (node) {
        if (isWithExpressionBoolean(node) && node.getText().startsWith('import')) {
            tryParseImportExpression(node, addImport);
        }
        return true;
    });
    return false;
};
// note: JSX Attributes do not show up as children.
var handleImportWithJsxAttributes = function (attributes, addImport) {
    attributes.properties.forEach(function (prop) {
        if (ts.isJsxAttribute(prop)) {
            if (prop.initializer &&
                ts.isJsxExpression(prop.initializer) &&
                prop.initializer.expression) {
                tryParseExpression(prop.initializer.expression, addImport);
            }
        }
    });
};
var handleImportWithinExpression = function (node, addImport) {
    var expression1 = null;
    if (node.kind === ts.SyntaxKind.CallExpression)
        expression1 = node;
    else if (isWithExpression(node))
        expression1 = node.expression;
    while (!!expression1) {
        if (!tryParseExpression(expression1, addImport)) {
            if (ts.isJsxElement(expression1) || ts.isJsxFragment(expression1)) {
                var jsxExpressions = util_1.findAllChildrenOfKind(expression1, ts.SyntaxKind.JsxExpression);
                jsxExpressions.forEach(function (j) {
                    var jsxExpr = j;
                    if (jsxExpr.expression) {
                        tryParseExpression(jsxExpr.expression, addImport);
                    }
                });
            }
            var selfClosingElements = util_1.findAllChildrenOfKind(expression1, ts.SyntaxKind.JsxSelfClosingElement);
            selfClosingElements.forEach(function (elem) {
                if (ts.isJsxSelfClosingElement(elem)) {
                    handleImportWithJsxAttributes(elem.attributes, addImport);
                }
            });
        }
        if (isWithExpression(expression1)) {
            expression1 = expression1.expression;
        }
        else {
            break;
        }
    }
};
exports.addDynamicImports = function (node, addImport) {
    var addImportsInAnyExpression = function (node) {
        if (isWithExpression(node)) {
            handleImportWithinExpression(node, addImport); // can be a ParenthesizedExpression with a JSX element inside it
        }
        return true;
    };
    // Recurse, since dynamic imports can occur at nested levels within the code
    util_1.recurseIntoChildren(node, addImportsInAnyExpression);
};
//# sourceMappingURL=dynamic.js.map