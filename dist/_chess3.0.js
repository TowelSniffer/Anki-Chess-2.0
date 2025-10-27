"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/chessground/assets/chessground.base.css
  var init_chessground_base = __esm({
    "node_modules/chessground/assets/chessground.base.css"() {
    }
  });

  // src/custom.css
  var init_custom = __esm({
    "src/custom.css"() {
    }
  });

  // node_modules/chess.js/dist/esm/chess.js
  function rootNode(comment) {
    return comment !== null ? { comment, variations: [] } : { variations: [] };
  }
  function node(move3, suffix, nag, comment, variations) {
    const node2 = { move: move3, variations };
    if (suffix) {
      node2.suffix = suffix;
    }
    if (nag) {
      node2.nag = nag;
    }
    if (comment !== null) {
      node2.comment = comment;
    }
    return node2;
  }
  function lineToTree(...nodes) {
    const [root, ...rest] = nodes;
    let parent = root;
    for (const child of rest) {
      if (child !== null) {
        parent.variations = [child, ...child.variations];
        child.variations = [];
        parent = child;
      }
    }
    return root;
  }
  function pgn(headers, game) {
    if (game.marker && game.marker.comment) {
      let node2 = game.root;
      while (true) {
        const next = node2.variations[0];
        if (!next) {
          node2.comment = game.marker.comment;
          break;
        }
        node2 = next;
      }
    }
    return {
      headers,
      root: game.root,
      result: (game.marker && game.marker.result) ?? void 0
    };
  }
  function peg$subclass(child, parent) {
    function C() {
      this.constructor = child;
    }
    C.prototype = parent.prototype;
    child.prototype = new C();
  }
  function peg$SyntaxError(message, expected, found, location) {
    var self2 = Error.call(this, message);
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(self2, peg$SyntaxError.prototype);
    }
    self2.expected = expected;
    self2.found = found;
    self2.location = location;
    self2.name = "SyntaxError";
    return self2;
  }
  function peg$padEnd(str, targetLength, padString) {
    padString = padString || " ";
    if (str.length > targetLength) {
      return str;
    }
    targetLength -= str.length;
    padString += padString.repeat(targetLength);
    return str + padString.slice(0, targetLength);
  }
  function peg$parse(input, options) {
    options = options !== void 0 ? options : {};
    var peg$FAILED = {};
    var peg$source = options.grammarSource;
    var peg$startRuleFunctions = { pgn: peg$parsepgn };
    var peg$startRuleFunction = peg$parsepgn;
    var peg$c0 = "[";
    var peg$c1 = '"';
    var peg$c2 = "]";
    var peg$c3 = ".";
    var peg$c4 = "O-O-O";
    var peg$c5 = "O-O";
    var peg$c6 = "0-0-0";
    var peg$c7 = "0-0";
    var peg$c8 = "$";
    var peg$c9 = "{";
    var peg$c10 = "}";
    var peg$c11 = ";";
    var peg$c12 = "(";
    var peg$c13 = ")";
    var peg$c14 = "1-0";
    var peg$c15 = "0-1";
    var peg$c16 = "1/2-1/2";
    var peg$c17 = "*";
    var peg$r0 = /^[a-zA-Z]/;
    var peg$r1 = /^[^"]/;
    var peg$r2 = /^[0-9]/;
    var peg$r3 = /^[.]/;
    var peg$r4 = /^[a-zA-Z1-8\-=]/;
    var peg$r5 = /^[+#]/;
    var peg$r6 = /^[!?]/;
    var peg$r7 = /^[^}]/;
    var peg$r8 = /^[^\r\n]/;
    var peg$r9 = /^[ \t\r\n]/;
    var peg$e0 = peg$otherExpectation("tag pair");
    var peg$e1 = peg$literalExpectation("[", false);
    var peg$e2 = peg$literalExpectation('"', false);
    var peg$e3 = peg$literalExpectation("]", false);
    var peg$e4 = peg$otherExpectation("tag name");
    var peg$e5 = peg$classExpectation([["a", "z"], ["A", "Z"]], false, false);
    var peg$e6 = peg$otherExpectation("tag value");
    var peg$e7 = peg$classExpectation(['"'], true, false);
    var peg$e8 = peg$otherExpectation("move number");
    var peg$e9 = peg$classExpectation([["0", "9"]], false, false);
    var peg$e10 = peg$literalExpectation(".", false);
    var peg$e11 = peg$classExpectation(["."], false, false);
    var peg$e12 = peg$otherExpectation("standard algebraic notation");
    var peg$e13 = peg$literalExpectation("O-O-O", false);
    var peg$e14 = peg$literalExpectation("O-O", false);
    var peg$e15 = peg$literalExpectation("0-0-0", false);
    var peg$e16 = peg$literalExpectation("0-0", false);
    var peg$e17 = peg$classExpectation([["a", "z"], ["A", "Z"], ["1", "8"], "-", "="], false, false);
    var peg$e18 = peg$classExpectation(["+", "#"], false, false);
    var peg$e19 = peg$otherExpectation("suffix annotation");
    var peg$e20 = peg$classExpectation(["!", "?"], false, false);
    var peg$e21 = peg$otherExpectation("NAG");
    var peg$e22 = peg$literalExpectation("$", false);
    var peg$e23 = peg$otherExpectation("brace comment");
    var peg$e24 = peg$literalExpectation("{", false);
    var peg$e25 = peg$classExpectation(["}"], true, false);
    var peg$e26 = peg$literalExpectation("}", false);
    var peg$e27 = peg$otherExpectation("rest of line comment");
    var peg$e28 = peg$literalExpectation(";", false);
    var peg$e29 = peg$classExpectation(["\r", "\n"], true, false);
    var peg$e30 = peg$otherExpectation("variation");
    var peg$e31 = peg$literalExpectation("(", false);
    var peg$e32 = peg$literalExpectation(")", false);
    var peg$e33 = peg$otherExpectation("game termination marker");
    var peg$e34 = peg$literalExpectation("1-0", false);
    var peg$e35 = peg$literalExpectation("0-1", false);
    var peg$e36 = peg$literalExpectation("1/2-1/2", false);
    var peg$e37 = peg$literalExpectation("*", false);
    var peg$e38 = peg$otherExpectation("whitespace");
    var peg$e39 = peg$classExpectation([" ", "	", "\r", "\n"], false, false);
    var peg$f0 = function(headers, game) {
      return pgn(headers, game);
    };
    var peg$f1 = function(tagPairs) {
      return Object.fromEntries(tagPairs);
    };
    var peg$f2 = function(tagName, tagValue) {
      return [tagName, tagValue];
    };
    var peg$f3 = function(root, marker) {
      return { root, marker };
    };
    var peg$f4 = function(comment, moves) {
      return lineToTree(rootNode(comment), ...moves.flat());
    };
    var peg$f5 = function(san, suffix, nag, comment, variations) {
      return node(san, suffix, nag, comment, variations);
    };
    var peg$f6 = function(nag) {
      return nag;
    };
    var peg$f7 = function(comment) {
      return comment.replace(/[\r\n]+/g, " ");
    };
    var peg$f8 = function(comment) {
      return comment.trim();
    };
    var peg$f9 = function(line) {
      return line;
    };
    var peg$f10 = function(result, comment) {
      return { result, comment };
    };
    var peg$currPos = options.peg$currPos | 0;
    var peg$posDetailsCache = [{ line: 1, column: 1 }];
    var peg$maxFailPos = peg$currPos;
    var peg$maxFailExpected = options.peg$maxFailExpected || [];
    var peg$silentFails = options.peg$silentFails | 0;
    var peg$result;
    if (options.startRule) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
      }
      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }
    function peg$literalExpectation(text, ignoreCase) {
      return { type: "literal", text, ignoreCase };
    }
    function peg$classExpectation(parts, inverted, ignoreCase) {
      return { type: "class", parts, inverted, ignoreCase };
    }
    function peg$endExpectation() {
      return { type: "end" };
    }
    function peg$otherExpectation(description) {
      return { type: "other", description };
    }
    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos];
      var p;
      if (details) {
        return details;
      } else {
        if (pos >= peg$posDetailsCache.length) {
          p = peg$posDetailsCache.length - 1;
        } else {
          p = pos;
          while (!peg$posDetailsCache[--p]) {
          }
        }
        details = peg$posDetailsCache[p];
        details = {
          line: details.line,
          column: details.column
        };
        while (p < pos) {
          if (input.charCodeAt(p) === 10) {
            details.line++;
            details.column = 1;
          } else {
            details.column++;
          }
          p++;
        }
        peg$posDetailsCache[pos] = details;
        return details;
      }
    }
    function peg$computeLocation(startPos, endPos, offset) {
      var startPosDetails = peg$computePosDetails(startPos);
      var endPosDetails = peg$computePosDetails(endPos);
      var res = {
        source: peg$source,
        start: {
          offset: startPos,
          line: startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line: endPosDetails.line,
          column: endPosDetails.column
        }
      };
      return res;
    }
    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) {
        return;
      }
      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }
      peg$maxFailExpected.push(expected);
    }
    function peg$buildStructuredError(expected, found, location) {
      return new peg$SyntaxError(
        peg$SyntaxError.buildMessage(expected, found),
        expected,
        found,
        location
      );
    }
    function peg$parsepgn() {
      var s0, s1, s2;
      s0 = peg$currPos;
      s1 = peg$parsetagPairSection();
      s2 = peg$parsemoveTextSection();
      s0 = peg$f0(s1, s2);
      return s0;
    }
    function peg$parsetagPairSection() {
      var s0, s1, s2;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsetagPair();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsetagPair();
      }
      s2 = peg$parse_();
      s0 = peg$f1(s1);
      return s0;
    }
    function peg$parsetagPair() {
      var s0, s2, s4, s6, s7, s8, s10;
      peg$silentFails++;
      s0 = peg$currPos;
      peg$parse_();
      if (input.charCodeAt(peg$currPos) === 91) {
        s2 = peg$c0;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e1);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$parse_();
        s4 = peg$parsetagName();
        if (s4 !== peg$FAILED) {
          peg$parse_();
          if (input.charCodeAt(peg$currPos) === 34) {
            s6 = peg$c1;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e2);
            }
          }
          if (s6 !== peg$FAILED) {
            s7 = peg$parsetagValue();
            if (input.charCodeAt(peg$currPos) === 34) {
              s8 = peg$c1;
              peg$currPos++;
            } else {
              s8 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e2);
              }
            }
            if (s8 !== peg$FAILED) {
              peg$parse_();
              if (input.charCodeAt(peg$currPos) === 93) {
                s10 = peg$c2;
                peg$currPos++;
              } else {
                s10 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e3);
                }
              }
              if (s10 !== peg$FAILED) {
                s0 = peg$f2(s4, s7);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        if (peg$silentFails === 0) {
          peg$fail(peg$e0);
        }
      }
      return s0;
    }
    function peg$parsetagName() {
      var s0, s1, s2;
      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = input.charAt(peg$currPos);
      if (peg$r0.test(s2)) {
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e5);
        }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = input.charAt(peg$currPos);
          if (peg$r0.test(s2)) {
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e5);
            }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s0 = input.substring(s0, peg$currPos);
      } else {
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e4);
        }
      }
      return s0;
    }
    function peg$parsetagValue() {
      var s0, s1, s2;
      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = input.charAt(peg$currPos);
      if (peg$r1.test(s2)) {
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e7);
        }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r1.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e7);
          }
        }
      }
      s0 = input.substring(s0, peg$currPos);
      peg$silentFails--;
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e6);
      }
      return s0;
    }
    function peg$parsemoveTextSection() {
      var s0, s1, s3;
      s0 = peg$currPos;
      s1 = peg$parseline();
      peg$parse_();
      s3 = peg$parsegameTerminationMarker();
      if (s3 === peg$FAILED) {
        s3 = null;
      }
      peg$parse_();
      s0 = peg$f3(s1, s3);
      return s0;
    }
    function peg$parseline() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$parsecomment();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      s2 = [];
      s3 = peg$parsemove();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsemove();
      }
      s0 = peg$f4(s1, s2);
      return s0;
    }
    function peg$parsemove() {
      var s0, s4, s5, s6, s7, s8, s9, s10;
      s0 = peg$currPos;
      peg$parse_();
      peg$parsemoveNumber();
      peg$parse_();
      s4 = peg$parsesan();
      if (s4 !== peg$FAILED) {
        s5 = peg$parsesuffixAnnotation();
        if (s5 === peg$FAILED) {
          s5 = null;
        }
        s6 = [];
        s7 = peg$parsenag();
        while (s7 !== peg$FAILED) {
          s6.push(s7);
          s7 = peg$parsenag();
        }
        s7 = peg$parse_();
        s8 = peg$parsecomment();
        if (s8 === peg$FAILED) {
          s8 = null;
        }
        s9 = [];
        s10 = peg$parsevariation();
        while (s10 !== peg$FAILED) {
          s9.push(s10);
          s10 = peg$parsevariation();
        }
        s0 = peg$f5(s4, s5, s6, s8, s9);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsemoveNumber() {
      var s0, s1, s2, s3, s4, s5;
      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = input.charAt(peg$currPos);
      if (peg$r2.test(s2)) {
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e9);
        }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r2.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e9);
          }
        }
      }
      if (input.charCodeAt(peg$currPos) === 46) {
        s2 = peg$c3;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e10);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parse_();
        s4 = [];
        s5 = input.charAt(peg$currPos);
        if (peg$r3.test(s5)) {
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e11);
          }
        }
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = input.charAt(peg$currPos);
          if (peg$r3.test(s5)) {
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e11);
            }
          }
        }
        s1 = [s1, s2, s3, s4];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e8);
        }
      }
      return s0;
    }
    function peg$parsesan() {
      var s0, s1, s2, s3, s4, s5;
      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c4) {
        s2 = peg$c4;
        peg$currPos += 5;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e13);
        }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c5) {
          s2 = peg$c5;
          peg$currPos += 3;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e14);
          }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 5) === peg$c6) {
            s2 = peg$c6;
            peg$currPos += 5;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e15);
            }
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c7) {
              s2 = peg$c7;
              peg$currPos += 3;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e16);
              }
            }
            if (s2 === peg$FAILED) {
              s2 = peg$currPos;
              s3 = input.charAt(peg$currPos);
              if (peg$r0.test(s3)) {
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e5);
                }
              }
              if (s3 !== peg$FAILED) {
                s4 = [];
                s5 = input.charAt(peg$currPos);
                if (peg$r4.test(s5)) {
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e17);
                  }
                }
                if (s5 !== peg$FAILED) {
                  while (s5 !== peg$FAILED) {
                    s4.push(s5);
                    s5 = input.charAt(peg$currPos);
                    if (peg$r4.test(s5)) {
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e17);
                      }
                    }
                  }
                } else {
                  s4 = peg$FAILED;
                }
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            }
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = input.charAt(peg$currPos);
        if (peg$r5.test(s3)) {
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e18);
          }
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        s2 = [s2, s3];
        s1 = s2;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s0 = input.substring(s0, peg$currPos);
      } else {
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e12);
        }
      }
      return s0;
    }
    function peg$parsesuffixAnnotation() {
      var s0, s1, s2;
      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = input.charAt(peg$currPos);
      if (peg$r6.test(s2)) {
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e20);
        }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (s1.length >= 2) {
          s2 = peg$FAILED;
        } else {
          s2 = input.charAt(peg$currPos);
          if (peg$r6.test(s2)) {
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e20);
            }
          }
        }
      }
      if (s1.length < 1) {
        peg$currPos = s0;
        s0 = peg$FAILED;
      } else {
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e19);
        }
      }
      return s0;
    }
    function peg$parsenag() {
      var s0, s2, s3, s4, s5;
      peg$silentFails++;
      s0 = peg$currPos;
      peg$parse_();
      if (input.charCodeAt(peg$currPos) === 36) {
        s2 = peg$c8;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e22);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        s4 = [];
        s5 = input.charAt(peg$currPos);
        if (peg$r2.test(s5)) {
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e9);
          }
        }
        if (s5 !== peg$FAILED) {
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = input.charAt(peg$currPos);
            if (peg$r2.test(s5)) {
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e9);
              }
            }
          }
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = input.substring(s3, peg$currPos);
        } else {
          s3 = s4;
        }
        if (s3 !== peg$FAILED) {
          s0 = peg$f6(s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        if (peg$silentFails === 0) {
          peg$fail(peg$e21);
        }
      }
      return s0;
    }
    function peg$parsecomment() {
      var s0;
      s0 = peg$parsebraceComment();
      if (s0 === peg$FAILED) {
        s0 = peg$parserestOfLineComment();
      }
      return s0;
    }
    function peg$parsebraceComment() {
      var s0, s1, s2, s3, s4;
      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c9;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e24);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = [];
        s4 = input.charAt(peg$currPos);
        if (peg$r7.test(s4)) {
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e25);
          }
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = input.charAt(peg$currPos);
          if (peg$r7.test(s4)) {
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e25);
            }
          }
        }
        s2 = input.substring(s2, peg$currPos);
        if (input.charCodeAt(peg$currPos) === 125) {
          s3 = peg$c10;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e26);
          }
        }
        if (s3 !== peg$FAILED) {
          s0 = peg$f7(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e23);
        }
      }
      return s0;
    }
    function peg$parserestOfLineComment() {
      var s0, s1, s2, s3, s4;
      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 59) {
        s1 = peg$c11;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e28);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = [];
        s4 = input.charAt(peg$currPos);
        if (peg$r8.test(s4)) {
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e29);
          }
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = input.charAt(peg$currPos);
          if (peg$r8.test(s4)) {
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e29);
            }
          }
        }
        s2 = input.substring(s2, peg$currPos);
        s0 = peg$f8(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e27);
        }
      }
      return s0;
    }
    function peg$parsevariation() {
      var s0, s2, s3, s5;
      peg$silentFails++;
      s0 = peg$currPos;
      peg$parse_();
      if (input.charCodeAt(peg$currPos) === 40) {
        s2 = peg$c12;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e31);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseline();
        if (s3 !== peg$FAILED) {
          peg$parse_();
          if (input.charCodeAt(peg$currPos) === 41) {
            s5 = peg$c13;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e32);
            }
          }
          if (s5 !== peg$FAILED) {
            s0 = peg$f9(s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        if (peg$silentFails === 0) {
          peg$fail(peg$e30);
        }
      }
      return s0;
    }
    function peg$parsegameTerminationMarker() {
      var s0, s1, s3;
      peg$silentFails++;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c14) {
        s1 = peg$c14;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e34);
        }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c15) {
          s1 = peg$c15;
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e35);
          }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 7) === peg$c16) {
            s1 = peg$c16;
            peg$currPos += 7;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e36);
            }
          }
          if (s1 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 42) {
              s1 = peg$c17;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e37);
              }
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$parse_();
        s3 = peg$parsecomment();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        s0 = peg$f10(s1, s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e33);
        }
      }
      return s0;
    }
    function peg$parse_() {
      var s0, s1;
      peg$silentFails++;
      s0 = [];
      s1 = input.charAt(peg$currPos);
      if (peg$r9.test(s1)) {
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e39);
        }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = input.charAt(peg$currPos);
        if (peg$r9.test(s1)) {
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e39);
          }
        }
      }
      peg$silentFails--;
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e38);
      }
      return s0;
    }
    peg$result = peg$startRuleFunction();
    if (options.peg$library) {
      return (
        /** @type {any} */
        {
          peg$result,
          peg$currPos,
          peg$FAILED,
          peg$maxFailExpected,
          peg$maxFailPos
        }
      );
    }
    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail(peg$endExpectation());
      }
      throw peg$buildStructuredError(
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }
  function rotl(x, k) {
    return (x << k | x >> 64n - k) & 0xffffffffffffffffn;
  }
  function wrappingMul(x, y) {
    return x * y & MASK64;
  }
  function xoroshiro128(state2) {
    return function() {
      let s0 = BigInt(state2 & MASK64);
      let s1 = BigInt(state2 >> 64n & MASK64);
      const result = wrappingMul(rotl(wrappingMul(s0, 5n), 7n), 9n);
      s1 ^= s0;
      s0 = (rotl(s0, 24n) ^ s1 ^ s1 << 16n) & MASK64;
      s1 = rotl(s1, 37n);
      state2 = s1 << 64n | s0;
      return result;
    };
  }
  function rank(square) {
    return square >> 4;
  }
  function file(square) {
    return square & 15;
  }
  function isDigit(c) {
    return "0123456789".indexOf(c) !== -1;
  }
  function algebraic(square) {
    const f = file(square);
    const r = rank(square);
    return "abcdefgh".substring(f, f + 1) + "87654321".substring(r, r + 1);
  }
  function swapColor(color) {
    return color === WHITE ? BLACK : WHITE;
  }
  function validateFen(fen) {
    const tokens = fen.split(/\s+/);
    if (tokens.length !== 6) {
      return {
        ok: false,
        error: "Invalid FEN: must contain six space-delimited fields"
      };
    }
    const moveNumber = parseInt(tokens[5], 10);
    if (isNaN(moveNumber) || moveNumber <= 0) {
      return {
        ok: false,
        error: "Invalid FEN: move number must be a positive integer"
      };
    }
    const halfMoves = parseInt(tokens[4], 10);
    if (isNaN(halfMoves) || halfMoves < 0) {
      return {
        ok: false,
        error: "Invalid FEN: half move counter number must be a non-negative integer"
      };
    }
    if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
      return { ok: false, error: "Invalid FEN: en-passant square is invalid" };
    }
    if (/[^kKqQ-]/.test(tokens[2])) {
      return { ok: false, error: "Invalid FEN: castling availability is invalid" };
    }
    if (!/^(w|b)$/.test(tokens[1])) {
      return { ok: false, error: "Invalid FEN: side-to-move is invalid" };
    }
    const rows = tokens[0].split("/");
    if (rows.length !== 8) {
      return {
        ok: false,
        error: "Invalid FEN: piece data does not contain 8 '/'-delimited rows"
      };
    }
    for (let i = 0; i < rows.length; i++) {
      let sumFields = 0;
      let previousWasNumber = false;
      for (let k = 0; k < rows[i].length; k++) {
        if (isDigit(rows[i][k])) {
          if (previousWasNumber) {
            return {
              ok: false,
              error: "Invalid FEN: piece data is invalid (consecutive number)"
            };
          }
          sumFields += parseInt(rows[i][k], 10);
          previousWasNumber = true;
        } else {
          if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
            return {
              ok: false,
              error: "Invalid FEN: piece data is invalid (invalid piece)"
            };
          }
          sumFields += 1;
          previousWasNumber = false;
        }
      }
      if (sumFields !== 8) {
        return {
          ok: false,
          error: "Invalid FEN: piece data is invalid (too many squares in rank)"
        };
      }
    }
    if (tokens[3][1] == "3" && tokens[1] == "w" || tokens[3][1] == "6" && tokens[1] == "b") {
      return { ok: false, error: "Invalid FEN: illegal en-passant square" };
    }
    const kings = [
      { color: "white", regex: /K/g },
      { color: "black", regex: /k/g }
    ];
    for (const { color, regex } of kings) {
      if (!regex.test(tokens[0])) {
        return { ok: false, error: `Invalid FEN: missing ${color} king` };
      }
      if ((tokens[0].match(regex) || []).length > 1) {
        return { ok: false, error: `Invalid FEN: too many ${color} kings` };
      }
    }
    if (Array.from(rows[0] + rows[7]).some((char) => char.toUpperCase() === "P")) {
      return {
        ok: false,
        error: "Invalid FEN: some pawns are on the edge rows"
      };
    }
    return { ok: true };
  }
  function getDisambiguator(move3, moves) {
    const from = move3.from;
    const to = move3.to;
    const piece = move3.piece;
    let ambiguities = 0;
    let sameRank = 0;
    let sameFile = 0;
    for (let i = 0, len = moves.length; i < len; i++) {
      const ambigFrom = moves[i].from;
      const ambigTo = moves[i].to;
      const ambigPiece = moves[i].piece;
      if (piece === ambigPiece && from !== ambigFrom && to === ambigTo) {
        ambiguities++;
        if (rank(from) === rank(ambigFrom)) {
          sameRank++;
        }
        if (file(from) === file(ambigFrom)) {
          sameFile++;
        }
      }
    }
    if (ambiguities > 0) {
      if (sameRank > 0 && sameFile > 0) {
        return algebraic(from);
      } else if (sameFile > 0) {
        return algebraic(from).charAt(1);
      } else {
        return algebraic(from).charAt(0);
      }
    }
    return "";
  }
  function addMove(moves, color, from, to, piece, captured = void 0, flags = BITS.NORMAL) {
    const r = rank(to);
    if (piece === PAWN && (r === RANK_1 || r === RANK_8)) {
      for (let i = 0; i < PROMOTIONS.length; i++) {
        const promotion = PROMOTIONS[i];
        moves.push({
          color,
          from,
          to,
          piece,
          captured,
          promotion,
          flags: flags | BITS.PROMOTION
        });
      }
    } else {
      moves.push({
        color,
        from,
        to,
        piece,
        captured,
        flags
      });
    }
  }
  function inferPieceType(san) {
    let pieceType = san.charAt(0);
    if (pieceType >= "a" && pieceType <= "h") {
      const matches = san.match(/[a-h]\d.*[a-h]\d/);
      if (matches) {
        return void 0;
      }
      return PAWN;
    }
    pieceType = pieceType.toLowerCase();
    if (pieceType === "o") {
      return KING;
    }
    return pieceType;
  }
  function strippedSan(move3) {
    return move3.replace(/=/, "").replace(/[+#]?[?!]*$/, "");
  }
  var MASK64, rand, PIECE_KEYS, EP_KEYS, CASTLING_KEYS, SIDE_KEY, WHITE, BLACK, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, DEFAULT_POSITION, Move, EMPTY, FLAGS, SQUARES, BITS, SEVEN_TAG_ROSTER, SUPLEMENTAL_TAGS, HEADER_TEMPLATE, Ox88, PAWN_OFFSETS, PIECE_OFFSETS, ATTACKS, RAYS, PIECE_MASKS, SYMBOLS, PROMOTIONS, RANK_1, RANK_2, RANK_7, RANK_8, SIDES, ROOKS, SECOND_RANK, SAN_NULLMOVE, Chess;
  var init_chess = __esm({
    "node_modules/chess.js/dist/esm/chess.js"() {
      peg$subclass(peg$SyntaxError, Error);
      peg$SyntaxError.prototype.format = function(sources) {
        var str = "Error: " + this.message;
        if (this.location) {
          var src = null;
          var k;
          for (k = 0; k < sources.length; k++) {
            if (sources[k].source === this.location.source) {
              src = sources[k].text.split(/\r\n|\n|\r/g);
              break;
            }
          }
          var s = this.location.start;
          var offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
          var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
          if (src) {
            var e = this.location.end;
            var filler = peg$padEnd("", offset_s.line.toString().length, " ");
            var line = src[s.line - 1];
            var last = s.line === e.line ? e.column : line.length + 1;
            var hatLen = last - s.column || 1;
            str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + peg$padEnd("", s.column - 1, " ") + peg$padEnd("", hatLen, "^");
          } else {
            str += "\n at " + loc;
          }
        }
        return str;
      };
      peg$SyntaxError.buildMessage = function(expected, found) {
        var DESCRIBE_EXPECTATION_FNS = {
          literal: function(expectation) {
            return '"' + literalEscape(expectation.text) + '"';
          },
          class: function(expectation) {
            var escapedParts = expectation.parts.map(function(part) {
              return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
            });
            return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
          },
          any: function() {
            return "any character";
          },
          end: function() {
            return "end of input";
          },
          other: function(expectation) {
            return expectation.description;
          }
        };
        function hex(ch) {
          return ch.charCodeAt(0).toString(16).toUpperCase();
        }
        function literalEscape(s) {
          return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
            return "\\x0" + hex(ch);
          }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
            return "\\x" + hex(ch);
          });
        }
        function classEscape(s) {
          return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
            return "\\x0" + hex(ch);
          }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
            return "\\x" + hex(ch);
          });
        }
        function describeExpectation(expectation) {
          return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
        }
        function describeExpected(expected2) {
          var descriptions = expected2.map(describeExpectation);
          var i, j;
          descriptions.sort();
          if (descriptions.length > 0) {
            for (i = 1, j = 1; i < descriptions.length; i++) {
              if (descriptions[i - 1] !== descriptions[i]) {
                descriptions[j] = descriptions[i];
                j++;
              }
            }
            descriptions.length = j;
          }
          switch (descriptions.length) {
            case 1:
              return descriptions[0];
            case 2:
              return descriptions[0] + " or " + descriptions[1];
            default:
              return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
          }
        }
        function describeFound(found2) {
          return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
        }
        return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
      };
      MASK64 = 0xffffffffffffffffn;
      rand = xoroshiro128(0xa187eb39cdcaed8f31c4b365b102e01en);
      PIECE_KEYS = Array.from({ length: 2 }, () => Array.from({ length: 6 }, () => Array.from({ length: 128 }, () => rand())));
      EP_KEYS = Array.from({ length: 8 }, () => rand());
      CASTLING_KEYS = Array.from({ length: 16 }, () => rand());
      SIDE_KEY = rand();
      WHITE = "w";
      BLACK = "b";
      PAWN = "p";
      KNIGHT = "n";
      BISHOP = "b";
      ROOK = "r";
      QUEEN = "q";
      KING = "k";
      DEFAULT_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      Move = class {
        color;
        from;
        to;
        piece;
        captured;
        promotion;
        /**
         * @deprecated This field is deprecated and will be removed in version 2.0.0.
         * Please use move descriptor functions instead: `isCapture`, `isPromotion`,
         * `isEnPassant`, `isKingsideCastle`, `isQueensideCastle`, `isCastle`, and
         * `isBigPawn`
         */
        flags;
        san;
        lan;
        before;
        after;
        constructor(chess, internal) {
          const { color, piece, from, to, flags, captured, promotion } = internal;
          const fromAlgebraic = algebraic(from);
          const toAlgebraic = algebraic(to);
          this.color = color;
          this.piece = piece;
          this.from = fromAlgebraic;
          this.to = toAlgebraic;
          this.san = chess["_moveToSan"](internal, chess["_moves"]({ legal: true }));
          this.lan = fromAlgebraic + toAlgebraic;
          this.before = chess.fen();
          chess["_makeMove"](internal);
          this.after = chess.fen();
          chess["_undoMove"]();
          this.flags = "";
          for (const flag in BITS) {
            if (BITS[flag] & flags) {
              this.flags += FLAGS[flag];
            }
          }
          if (captured) {
            this.captured = captured;
          }
          if (promotion) {
            this.promotion = promotion;
            this.lan += promotion;
          }
        }
        isCapture() {
          return this.flags.indexOf(FLAGS["CAPTURE"]) > -1;
        }
        isPromotion() {
          return this.flags.indexOf(FLAGS["PROMOTION"]) > -1;
        }
        isEnPassant() {
          return this.flags.indexOf(FLAGS["EP_CAPTURE"]) > -1;
        }
        isKingsideCastle() {
          return this.flags.indexOf(FLAGS["KSIDE_CASTLE"]) > -1;
        }
        isQueensideCastle() {
          return this.flags.indexOf(FLAGS["QSIDE_CASTLE"]) > -1;
        }
        isBigPawn() {
          return this.flags.indexOf(FLAGS["BIG_PAWN"]) > -1;
        }
      };
      EMPTY = -1;
      FLAGS = {
        NORMAL: "n",
        CAPTURE: "c",
        BIG_PAWN: "b",
        EP_CAPTURE: "e",
        PROMOTION: "p",
        KSIDE_CASTLE: "k",
        QSIDE_CASTLE: "q",
        NULL_MOVE: "-"
      };
      SQUARES = [
        "a8",
        "b8",
        "c8",
        "d8",
        "e8",
        "f8",
        "g8",
        "h8",
        "a7",
        "b7",
        "c7",
        "d7",
        "e7",
        "f7",
        "g7",
        "h7",
        "a6",
        "b6",
        "c6",
        "d6",
        "e6",
        "f6",
        "g6",
        "h6",
        "a5",
        "b5",
        "c5",
        "d5",
        "e5",
        "f5",
        "g5",
        "h5",
        "a4",
        "b4",
        "c4",
        "d4",
        "e4",
        "f4",
        "g4",
        "h4",
        "a3",
        "b3",
        "c3",
        "d3",
        "e3",
        "f3",
        "g3",
        "h3",
        "a2",
        "b2",
        "c2",
        "d2",
        "e2",
        "f2",
        "g2",
        "h2",
        "a1",
        "b1",
        "c1",
        "d1",
        "e1",
        "f1",
        "g1",
        "h1"
      ];
      BITS = {
        NORMAL: 1,
        CAPTURE: 2,
        BIG_PAWN: 4,
        EP_CAPTURE: 8,
        PROMOTION: 16,
        KSIDE_CASTLE: 32,
        QSIDE_CASTLE: 64,
        NULL_MOVE: 128
      };
      SEVEN_TAG_ROSTER = {
        Event: "?",
        Site: "?",
        Date: "????.??.??",
        Round: "?",
        White: "?",
        Black: "?",
        Result: "*"
      };
      SUPLEMENTAL_TAGS = {
        WhiteTitle: null,
        BlackTitle: null,
        WhiteElo: null,
        BlackElo: null,
        WhiteUSCF: null,
        BlackUSCF: null,
        WhiteNA: null,
        BlackNA: null,
        WhiteType: null,
        BlackType: null,
        EventDate: null,
        EventSponsor: null,
        Section: null,
        Stage: null,
        Board: null,
        Opening: null,
        Variation: null,
        SubVariation: null,
        ECO: null,
        NIC: null,
        Time: null,
        UTCTime: null,
        UTCDate: null,
        TimeControl: null,
        SetUp: null,
        FEN: null,
        Termination: null,
        Annotator: null,
        Mode: null,
        PlyCount: null
      };
      HEADER_TEMPLATE = {
        ...SEVEN_TAG_ROSTER,
        ...SUPLEMENTAL_TAGS
      };
      Ox88 = {
        a8: 0,
        b8: 1,
        c8: 2,
        d8: 3,
        e8: 4,
        f8: 5,
        g8: 6,
        h8: 7,
        a7: 16,
        b7: 17,
        c7: 18,
        d7: 19,
        e7: 20,
        f7: 21,
        g7: 22,
        h7: 23,
        a6: 32,
        b6: 33,
        c6: 34,
        d6: 35,
        e6: 36,
        f6: 37,
        g6: 38,
        h6: 39,
        a5: 48,
        b5: 49,
        c5: 50,
        d5: 51,
        e5: 52,
        f5: 53,
        g5: 54,
        h5: 55,
        a4: 64,
        b4: 65,
        c4: 66,
        d4: 67,
        e4: 68,
        f4: 69,
        g4: 70,
        h4: 71,
        a3: 80,
        b3: 81,
        c3: 82,
        d3: 83,
        e3: 84,
        f3: 85,
        g3: 86,
        h3: 87,
        a2: 96,
        b2: 97,
        c2: 98,
        d2: 99,
        e2: 100,
        f2: 101,
        g2: 102,
        h2: 103,
        a1: 112,
        b1: 113,
        c1: 114,
        d1: 115,
        e1: 116,
        f1: 117,
        g1: 118,
        h1: 119
      };
      PAWN_OFFSETS = {
        b: [16, 32, 17, 15],
        w: [-16, -32, -17, -15]
      };
      PIECE_OFFSETS = {
        n: [-18, -33, -31, -14, 18, 33, 31, 14],
        b: [-17, -15, 17, 15],
        r: [-16, 1, 16, -1],
        q: [-17, -16, -15, 1, 17, 16, 15, -1],
        k: [-17, -16, -15, 1, 17, 16, 15, -1]
      };
      ATTACKS = [
        20,
        0,
        0,
        0,
        0,
        0,
        0,
        24,
        0,
        0,
        0,
        0,
        0,
        0,
        20,
        0,
        0,
        20,
        0,
        0,
        0,
        0,
        0,
        24,
        0,
        0,
        0,
        0,
        0,
        20,
        0,
        0,
        0,
        0,
        20,
        0,
        0,
        0,
        0,
        24,
        0,
        0,
        0,
        0,
        20,
        0,
        0,
        0,
        0,
        0,
        0,
        20,
        0,
        0,
        0,
        24,
        0,
        0,
        0,
        20,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        20,
        0,
        0,
        24,
        0,
        0,
        20,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        20,
        2,
        24,
        2,
        20,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        53,
        56,
        53,
        2,
        0,
        0,
        0,
        0,
        0,
        0,
        24,
        24,
        24,
        24,
        24,
        24,
        56,
        0,
        56,
        24,
        24,
        24,
        24,
        24,
        24,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        53,
        56,
        53,
        2,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        20,
        2,
        24,
        2,
        20,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        20,
        0,
        0,
        24,
        0,
        0,
        20,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        20,
        0,
        0,
        0,
        24,
        0,
        0,
        0,
        20,
        0,
        0,
        0,
        0,
        0,
        0,
        20,
        0,
        0,
        0,
        0,
        24,
        0,
        0,
        0,
        0,
        20,
        0,
        0,
        0,
        0,
        20,
        0,
        0,
        0,
        0,
        0,
        24,
        0,
        0,
        0,
        0,
        0,
        20,
        0,
        0,
        20,
        0,
        0,
        0,
        0,
        0,
        0,
        24,
        0,
        0,
        0,
        0,
        0,
        0,
        20
      ];
      RAYS = [
        17,
        0,
        0,
        0,
        0,
        0,
        0,
        16,
        0,
        0,
        0,
        0,
        0,
        0,
        15,
        0,
        0,
        17,
        0,
        0,
        0,
        0,
        0,
        16,
        0,
        0,
        0,
        0,
        0,
        15,
        0,
        0,
        0,
        0,
        17,
        0,
        0,
        0,
        0,
        16,
        0,
        0,
        0,
        0,
        15,
        0,
        0,
        0,
        0,
        0,
        0,
        17,
        0,
        0,
        0,
        16,
        0,
        0,
        0,
        15,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        17,
        0,
        0,
        16,
        0,
        0,
        15,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        17,
        0,
        16,
        0,
        15,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        17,
        16,
        15,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        -15,
        -16,
        -17,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        -15,
        0,
        -16,
        0,
        -17,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        -15,
        0,
        0,
        -16,
        0,
        0,
        -17,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        -15,
        0,
        0,
        0,
        -16,
        0,
        0,
        0,
        -17,
        0,
        0,
        0,
        0,
        0,
        0,
        -15,
        0,
        0,
        0,
        0,
        -16,
        0,
        0,
        0,
        0,
        -17,
        0,
        0,
        0,
        0,
        -15,
        0,
        0,
        0,
        0,
        0,
        -16,
        0,
        0,
        0,
        0,
        0,
        -17,
        0,
        0,
        -15,
        0,
        0,
        0,
        0,
        0,
        0,
        -16,
        0,
        0,
        0,
        0,
        0,
        0,
        -17
      ];
      PIECE_MASKS = { p: 1, n: 2, b: 4, r: 8, q: 16, k: 32 };
      SYMBOLS = "pnbrqkPNBRQK";
      PROMOTIONS = [KNIGHT, BISHOP, ROOK, QUEEN];
      RANK_1 = 7;
      RANK_2 = 6;
      RANK_7 = 1;
      RANK_8 = 0;
      SIDES = {
        [KING]: BITS.KSIDE_CASTLE,
        [QUEEN]: BITS.QSIDE_CASTLE
      };
      ROOKS = {
        w: [
          { square: Ox88.a1, flag: BITS.QSIDE_CASTLE },
          { square: Ox88.h1, flag: BITS.KSIDE_CASTLE }
        ],
        b: [
          { square: Ox88.a8, flag: BITS.QSIDE_CASTLE },
          { square: Ox88.h8, flag: BITS.KSIDE_CASTLE }
        ]
      };
      SECOND_RANK = { b: RANK_7, w: RANK_2 };
      SAN_NULLMOVE = "--";
      Chess = class {
        _board = new Array(128);
        _turn = WHITE;
        _header = {};
        _kings = { w: EMPTY, b: EMPTY };
        _epSquare = -1;
        _halfMoves = 0;
        _moveNumber = 0;
        _history = [];
        _comments = {};
        _castling = { w: 0, b: 0 };
        _hash = 0n;
        // tracks number of times a position has been seen for repetition checking
        _positionCount = /* @__PURE__ */ new Map();
        constructor(fen = DEFAULT_POSITION, { skipValidation = false } = {}) {
          this.load(fen, { skipValidation });
        }
        clear({ preserveHeaders = false } = {}) {
          this._board = new Array(128);
          this._kings = { w: EMPTY, b: EMPTY };
          this._turn = WHITE;
          this._castling = { w: 0, b: 0 };
          this._epSquare = EMPTY;
          this._halfMoves = 0;
          this._moveNumber = 1;
          this._history = [];
          this._comments = {};
          this._header = preserveHeaders ? this._header : { ...HEADER_TEMPLATE };
          this._hash = this._computeHash();
          this._positionCount = /* @__PURE__ */ new Map();
          this._header["SetUp"] = null;
          this._header["FEN"] = null;
        }
        load(fen, { skipValidation = false, preserveHeaders = false } = {}) {
          let tokens = fen.split(/\s+/);
          if (tokens.length >= 2 && tokens.length < 6) {
            const adjustments = ["-", "-", "0", "1"];
            fen = tokens.concat(adjustments.slice(-(6 - tokens.length))).join(" ");
          }
          tokens = fen.split(/\s+/);
          if (!skipValidation) {
            const { ok, error } = validateFen(fen);
            if (!ok) {
              throw new Error(error);
            }
          }
          const position = tokens[0];
          let square = 0;
          this.clear({ preserveHeaders });
          for (let i = 0; i < position.length; i++) {
            const piece = position.charAt(i);
            if (piece === "/") {
              square += 8;
            } else if (isDigit(piece)) {
              square += parseInt(piece, 10);
            } else {
              const color = piece < "a" ? WHITE : BLACK;
              this._put({ type: piece.toLowerCase(), color }, algebraic(square));
              square++;
            }
          }
          this._turn = tokens[1];
          if (tokens[2].indexOf("K") > -1) {
            this._castling.w |= BITS.KSIDE_CASTLE;
          }
          if (tokens[2].indexOf("Q") > -1) {
            this._castling.w |= BITS.QSIDE_CASTLE;
          }
          if (tokens[2].indexOf("k") > -1) {
            this._castling.b |= BITS.KSIDE_CASTLE;
          }
          if (tokens[2].indexOf("q") > -1) {
            this._castling.b |= BITS.QSIDE_CASTLE;
          }
          this._epSquare = tokens[3] === "-" ? EMPTY : Ox88[tokens[3]];
          this._halfMoves = parseInt(tokens[4], 10);
          this._moveNumber = parseInt(tokens[5], 10);
          this._hash = this._computeHash();
          this._updateSetup(fen);
          this._incPositionCount();
        }
        fen({ forceEnpassantSquare = false } = {}) {
          let empty = 0;
          let fen = "";
          for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            if (this._board[i]) {
              if (empty > 0) {
                fen += empty;
                empty = 0;
              }
              const { color, type: piece } = this._board[i];
              fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
            } else {
              empty++;
            }
            if (i + 1 & 136) {
              if (empty > 0) {
                fen += empty;
              }
              if (i !== Ox88.h1) {
                fen += "/";
              }
              empty = 0;
              i += 8;
            }
          }
          let castling = "";
          if (this._castling[WHITE] & BITS.KSIDE_CASTLE) {
            castling += "K";
          }
          if (this._castling[WHITE] & BITS.QSIDE_CASTLE) {
            castling += "Q";
          }
          if (this._castling[BLACK] & BITS.KSIDE_CASTLE) {
            castling += "k";
          }
          if (this._castling[BLACK] & BITS.QSIDE_CASTLE) {
            castling += "q";
          }
          castling = castling || "-";
          let epSquare = "-";
          if (this._epSquare !== EMPTY) {
            if (forceEnpassantSquare) {
              epSquare = algebraic(this._epSquare);
            } else {
              const bigPawnSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);
              const squares = [bigPawnSquare + 1, bigPawnSquare - 1];
              for (const square of squares) {
                if (square & 136) {
                  continue;
                }
                const color = this._turn;
                if (this._board[square]?.color === color && this._board[square]?.type === PAWN) {
                  this._makeMove({
                    color,
                    from: square,
                    to: this._epSquare,
                    piece: PAWN,
                    captured: PAWN,
                    flags: BITS.EP_CAPTURE
                  });
                  const isLegal = !this._isKingAttacked(color);
                  this._undoMove();
                  if (isLegal) {
                    epSquare = algebraic(this._epSquare);
                    break;
                  }
                }
              }
            }
          }
          return [
            fen,
            this._turn,
            castling,
            epSquare,
            this._halfMoves,
            this._moveNumber
          ].join(" ");
        }
        _pieceKey(i) {
          if (!this._board[i]) {
            return 0n;
          }
          const { color, type } = this._board[i];
          const colorIndex = {
            w: 0,
            b: 1
          }[color];
          const typeIndex = {
            p: 0,
            n: 1,
            b: 2,
            r: 3,
            q: 4,
            k: 5
          }[type];
          return PIECE_KEYS[colorIndex][typeIndex][i];
        }
        _epKey() {
          return this._epSquare === EMPTY ? 0n : EP_KEYS[this._epSquare & 7];
        }
        _castlingKey() {
          const index = this._castling.w >> 5 | this._castling.b >> 3;
          return CASTLING_KEYS[index];
        }
        _computeHash() {
          let hash2 = 0n;
          for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            if (i & 136) {
              i += 7;
              continue;
            }
            if (this._board[i]) {
              hash2 ^= this._pieceKey(i);
            }
          }
          hash2 ^= this._epKey();
          hash2 ^= this._castlingKey();
          if (this._turn === "b") {
            hash2 ^= SIDE_KEY;
          }
          return hash2;
        }
        /*
         * Called when the initial board setup is changed with put() or remove().
         * modifies the SetUp and FEN properties of the header object. If the FEN
         * is equal to the default position, the SetUp and FEN are deleted the setup
         * is only updated if history.length is zero, ie moves haven't been made.
         */
        _updateSetup(fen) {
          if (this._history.length > 0)
            return;
          if (fen !== DEFAULT_POSITION) {
            this._header["SetUp"] = "1";
            this._header["FEN"] = fen;
          } else {
            this._header["SetUp"] = null;
            this._header["FEN"] = null;
          }
        }
        reset() {
          this.load(DEFAULT_POSITION);
        }
        get(square) {
          return this._board[Ox88[square]];
        }
        findPiece(piece) {
          const squares = [];
          for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            if (i & 136) {
              i += 7;
              continue;
            }
            if (!this._board[i] || this._board[i]?.color !== piece.color) {
              continue;
            }
            if (this._board[i].color === piece.color && this._board[i].type === piece.type) {
              squares.push(algebraic(i));
            }
          }
          return squares;
        }
        put({ type, color }, square) {
          if (this._put({ type, color }, square)) {
            this._updateCastlingRights();
            this._updateEnPassantSquare();
            this._updateSetup(this.fen());
            return true;
          }
          return false;
        }
        _set(sq, piece) {
          this._hash ^= this._pieceKey(sq);
          this._board[sq] = piece;
          this._hash ^= this._pieceKey(sq);
        }
        _put({ type, color }, square) {
          if (SYMBOLS.indexOf(type.toLowerCase()) === -1) {
            return false;
          }
          if (!(square in Ox88)) {
            return false;
          }
          const sq = Ox88[square];
          if (type == KING && !(this._kings[color] == EMPTY || this._kings[color] == sq)) {
            return false;
          }
          const currentPieceOnSquare = this._board[sq];
          if (currentPieceOnSquare && currentPieceOnSquare.type === KING) {
            this._kings[currentPieceOnSquare.color] = EMPTY;
          }
          this._set(sq, { type, color });
          if (type === KING) {
            this._kings[color] = sq;
          }
          return true;
        }
        _clear(sq) {
          this._hash ^= this._pieceKey(sq);
          delete this._board[sq];
        }
        remove(square) {
          const piece = this.get(square);
          this._clear(Ox88[square]);
          if (piece && piece.type === KING) {
            this._kings[piece.color] = EMPTY;
          }
          this._updateCastlingRights();
          this._updateEnPassantSquare();
          this._updateSetup(this.fen());
          return piece;
        }
        _updateCastlingRights() {
          this._hash ^= this._castlingKey();
          const whiteKingInPlace = this._board[Ox88.e1]?.type === KING && this._board[Ox88.e1]?.color === WHITE;
          const blackKingInPlace = this._board[Ox88.e8]?.type === KING && this._board[Ox88.e8]?.color === BLACK;
          if (!whiteKingInPlace || this._board[Ox88.a1]?.type !== ROOK || this._board[Ox88.a1]?.color !== WHITE) {
            this._castling.w &= -65;
          }
          if (!whiteKingInPlace || this._board[Ox88.h1]?.type !== ROOK || this._board[Ox88.h1]?.color !== WHITE) {
            this._castling.w &= -33;
          }
          if (!blackKingInPlace || this._board[Ox88.a8]?.type !== ROOK || this._board[Ox88.a8]?.color !== BLACK) {
            this._castling.b &= -65;
          }
          if (!blackKingInPlace || this._board[Ox88.h8]?.type !== ROOK || this._board[Ox88.h8]?.color !== BLACK) {
            this._castling.b &= -33;
          }
          this._hash ^= this._castlingKey();
        }
        _updateEnPassantSquare() {
          if (this._epSquare === EMPTY) {
            return;
          }
          const startSquare = this._epSquare + (this._turn === WHITE ? -16 : 16);
          const currentSquare = this._epSquare + (this._turn === WHITE ? 16 : -16);
          const attackers = [currentSquare + 1, currentSquare - 1];
          if (this._board[startSquare] !== null || this._board[this._epSquare] !== null || this._board[currentSquare]?.color !== swapColor(this._turn) || this._board[currentSquare]?.type !== PAWN) {
            this._hash ^= this._epKey();
            this._epSquare = EMPTY;
            return;
          }
          const canCapture = (square) => !(square & 136) && this._board[square]?.color === this._turn && this._board[square]?.type === PAWN;
          if (!attackers.some(canCapture)) {
            this._hash ^= this._epKey();
            this._epSquare = EMPTY;
          }
        }
        _attacked(color, square, verbose) {
          const attackers = [];
          for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            if (i & 136) {
              i += 7;
              continue;
            }
            if (this._board[i] === void 0 || this._board[i].color !== color) {
              continue;
            }
            const piece = this._board[i];
            const difference = i - square;
            if (difference === 0) {
              continue;
            }
            const index = difference + 119;
            if (ATTACKS[index] & PIECE_MASKS[piece.type]) {
              if (piece.type === PAWN) {
                if (difference > 0 && piece.color === WHITE || difference <= 0 && piece.color === BLACK) {
                  if (!verbose) {
                    return true;
                  } else {
                    attackers.push(algebraic(i));
                  }
                }
                continue;
              }
              if (piece.type === "n" || piece.type === "k") {
                if (!verbose) {
                  return true;
                } else {
                  attackers.push(algebraic(i));
                  continue;
                }
              }
              const offset = RAYS[index];
              let j = i + offset;
              let blocked = false;
              while (j !== square) {
                if (this._board[j] != null) {
                  blocked = true;
                  break;
                }
                j += offset;
              }
              if (!blocked) {
                if (!verbose) {
                  return true;
                } else {
                  attackers.push(algebraic(i));
                  continue;
                }
              }
            }
          }
          if (verbose) {
            return attackers;
          } else {
            return false;
          }
        }
        attackers(square, attackedBy) {
          if (!attackedBy) {
            return this._attacked(this._turn, Ox88[square], true);
          } else {
            return this._attacked(attackedBy, Ox88[square], true);
          }
        }
        _isKingAttacked(color) {
          const square = this._kings[color];
          return square === -1 ? false : this._attacked(swapColor(color), square);
        }
        hash() {
          return this._hash.toString(16);
        }
        isAttacked(square, attackedBy) {
          return this._attacked(attackedBy, Ox88[square]);
        }
        isCheck() {
          return this._isKingAttacked(this._turn);
        }
        inCheck() {
          return this.isCheck();
        }
        isCheckmate() {
          return this.isCheck() && this._moves().length === 0;
        }
        isStalemate() {
          return !this.isCheck() && this._moves().length === 0;
        }
        isInsufficientMaterial() {
          const pieces = {
            b: 0,
            n: 0,
            r: 0,
            q: 0,
            k: 0,
            p: 0
          };
          const bishops = [];
          let numPieces = 0;
          let squareColor = 0;
          for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            squareColor = (squareColor + 1) % 2;
            if (i & 136) {
              i += 7;
              continue;
            }
            const piece = this._board[i];
            if (piece) {
              pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1;
              if (piece.type === BISHOP) {
                bishops.push(squareColor);
              }
              numPieces++;
            }
          }
          if (numPieces === 2) {
            return true;
          } else if (
            // k vs. kn .... or .... k vs. kb
            numPieces === 3 && (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)
          ) {
            return true;
          } else if (numPieces === pieces[BISHOP] + 2) {
            let sum = 0;
            const len = bishops.length;
            for (let i = 0; i < len; i++) {
              sum += bishops[i];
            }
            if (sum === 0 || sum === len) {
              return true;
            }
          }
          return false;
        }
        isThreefoldRepetition() {
          return this._getPositionCount(this._hash) >= 3;
        }
        isDrawByFiftyMoves() {
          return this._halfMoves >= 100;
        }
        isDraw() {
          return this.isDrawByFiftyMoves() || this.isStalemate() || this.isInsufficientMaterial() || this.isThreefoldRepetition();
        }
        isGameOver() {
          return this.isCheckmate() || this.isDraw();
        }
        moves({ verbose = false, square = void 0, piece = void 0 } = {}) {
          const moves = this._moves({ square, piece });
          if (verbose) {
            return moves.map((move3) => new Move(this, move3));
          } else {
            return moves.map((move3) => this._moveToSan(move3, moves));
          }
        }
        _moves({ legal = true, piece = void 0, square = void 0 } = {}) {
          const forSquare = square ? square.toLowerCase() : void 0;
          const forPiece = piece?.toLowerCase();
          const moves = [];
          const us = this._turn;
          const them = swapColor(us);
          let firstSquare = Ox88.a8;
          let lastSquare = Ox88.h1;
          let singleSquare = false;
          if (forSquare) {
            if (!(forSquare in Ox88)) {
              return [];
            } else {
              firstSquare = lastSquare = Ox88[forSquare];
              singleSquare = true;
            }
          }
          for (let from = firstSquare; from <= lastSquare; from++) {
            if (from & 136) {
              from += 7;
              continue;
            }
            if (!this._board[from] || this._board[from].color === them) {
              continue;
            }
            const { type } = this._board[from];
            let to;
            if (type === PAWN) {
              if (forPiece && forPiece !== type)
                continue;
              to = from + PAWN_OFFSETS[us][0];
              if (!this._board[to]) {
                addMove(moves, us, from, to, PAWN);
                to = from + PAWN_OFFSETS[us][1];
                if (SECOND_RANK[us] === rank(from) && !this._board[to]) {
                  addMove(moves, us, from, to, PAWN, void 0, BITS.BIG_PAWN);
                }
              }
              for (let j = 2; j < 4; j++) {
                to = from + PAWN_OFFSETS[us][j];
                if (to & 136)
                  continue;
                if (this._board[to]?.color === them) {
                  addMove(moves, us, from, to, PAWN, this._board[to].type, BITS.CAPTURE);
                } else if (to === this._epSquare) {
                  addMove(moves, us, from, to, PAWN, PAWN, BITS.EP_CAPTURE);
                }
              }
            } else {
              if (forPiece && forPiece !== type)
                continue;
              for (let j = 0, len = PIECE_OFFSETS[type].length; j < len; j++) {
                const offset = PIECE_OFFSETS[type][j];
                to = from;
                while (true) {
                  to += offset;
                  if (to & 136)
                    break;
                  if (!this._board[to]) {
                    addMove(moves, us, from, to, type);
                  } else {
                    if (this._board[to].color === us)
                      break;
                    addMove(moves, us, from, to, type, this._board[to].type, BITS.CAPTURE);
                    break;
                  }
                  if (type === KNIGHT || type === KING)
                    break;
                }
              }
            }
          }
          if (forPiece === void 0 || forPiece === KING) {
            if (!singleSquare || lastSquare === this._kings[us]) {
              if (this._castling[us] & BITS.KSIDE_CASTLE) {
                const castlingFrom = this._kings[us];
                const castlingTo = castlingFrom + 2;
                if (!this._board[castlingFrom + 1] && !this._board[castlingTo] && !this._attacked(them, this._kings[us]) && !this._attacked(them, castlingFrom + 1) && !this._attacked(them, castlingTo)) {
                  addMove(moves, us, this._kings[us], castlingTo, KING, void 0, BITS.KSIDE_CASTLE);
                }
              }
              if (this._castling[us] & BITS.QSIDE_CASTLE) {
                const castlingFrom = this._kings[us];
                const castlingTo = castlingFrom - 2;
                if (!this._board[castlingFrom - 1] && !this._board[castlingFrom - 2] && !this._board[castlingFrom - 3] && !this._attacked(them, this._kings[us]) && !this._attacked(them, castlingFrom - 1) && !this._attacked(them, castlingTo)) {
                  addMove(moves, us, this._kings[us], castlingTo, KING, void 0, BITS.QSIDE_CASTLE);
                }
              }
            }
          }
          if (!legal || this._kings[us] === -1) {
            return moves;
          }
          const legalMoves = [];
          for (let i = 0, len = moves.length; i < len; i++) {
            this._makeMove(moves[i]);
            if (!this._isKingAttacked(us)) {
              legalMoves.push(moves[i]);
            }
            this._undoMove();
          }
          return legalMoves;
        }
        move(move3, { strict = false } = {}) {
          let moveObj = null;
          if (typeof move3 === "string") {
            moveObj = this._moveFromSan(move3, strict);
          } else if (move3 === null) {
            moveObj = this._moveFromSan(SAN_NULLMOVE, strict);
          } else if (typeof move3 === "object") {
            const moves = this._moves();
            for (let i = 0, len = moves.length; i < len; i++) {
              if (move3.from === algebraic(moves[i].from) && move3.to === algebraic(moves[i].to) && (!("promotion" in moves[i]) || move3.promotion === moves[i].promotion)) {
                moveObj = moves[i];
                break;
              }
            }
          }
          if (!moveObj) {
            if (typeof move3 === "string") {
              throw new Error(`Invalid move: ${move3}`);
            } else {
              throw new Error(`Invalid move: ${JSON.stringify(move3)}`);
            }
          }
          if (this.isCheck() && moveObj.flags & BITS.NULL_MOVE) {
            throw new Error("Null move not allowed when in check");
          }
          const prettyMove = new Move(this, moveObj);
          this._makeMove(moveObj);
          this._incPositionCount();
          return prettyMove;
        }
        _push(move3) {
          this._history.push({
            move: move3,
            kings: { b: this._kings.b, w: this._kings.w },
            turn: this._turn,
            castling: { b: this._castling.b, w: this._castling.w },
            epSquare: this._epSquare,
            halfMoves: this._halfMoves,
            moveNumber: this._moveNumber
          });
        }
        _movePiece(from, to) {
          this._hash ^= this._pieceKey(from);
          this._board[to] = this._board[from];
          delete this._board[from];
          this._hash ^= this._pieceKey(to);
        }
        _makeMove(move3) {
          const us = this._turn;
          const them = swapColor(us);
          this._push(move3);
          if (move3.flags & BITS.NULL_MOVE) {
            if (us === BLACK) {
              this._moveNumber++;
            }
            this._halfMoves++;
            this._turn = them;
            this._epSquare = EMPTY;
            return;
          }
          this._hash ^= this._epKey();
          this._hash ^= this._castlingKey();
          if (move3.captured) {
            this._hash ^= this._pieceKey(move3.to);
          }
          this._movePiece(move3.from, move3.to);
          if (move3.flags & BITS.EP_CAPTURE) {
            if (this._turn === BLACK) {
              this._clear(move3.to - 16);
            } else {
              this._clear(move3.to + 16);
            }
          }
          if (move3.promotion) {
            this._clear(move3.to);
            this._set(move3.to, { type: move3.promotion, color: us });
          }
          if (this._board[move3.to].type === KING) {
            this._kings[us] = move3.to;
            if (move3.flags & BITS.KSIDE_CASTLE) {
              const castlingTo = move3.to - 1;
              const castlingFrom = move3.to + 1;
              this._movePiece(castlingFrom, castlingTo);
            } else if (move3.flags & BITS.QSIDE_CASTLE) {
              const castlingTo = move3.to + 1;
              const castlingFrom = move3.to - 2;
              this._movePiece(castlingFrom, castlingTo);
            }
            this._castling[us] = 0;
          }
          if (this._castling[us]) {
            for (let i = 0, len = ROOKS[us].length; i < len; i++) {
              if (move3.from === ROOKS[us][i].square && this._castling[us] & ROOKS[us][i].flag) {
                this._castling[us] ^= ROOKS[us][i].flag;
                break;
              }
            }
          }
          if (this._castling[them]) {
            for (let i = 0, len = ROOKS[them].length; i < len; i++) {
              if (move3.to === ROOKS[them][i].square && this._castling[them] & ROOKS[them][i].flag) {
                this._castling[them] ^= ROOKS[them][i].flag;
                break;
              }
            }
          }
          this._hash ^= this._castlingKey();
          if (move3.flags & BITS.BIG_PAWN) {
            let epSquare;
            if (us === BLACK) {
              epSquare = move3.to - 16;
            } else {
              epSquare = move3.to + 16;
            }
            if (!(move3.to - 1 & 136) && this._board[move3.to - 1]?.type === PAWN && this._board[move3.to - 1]?.color === them || !(move3.to + 1 & 136) && this._board[move3.to + 1]?.type === PAWN && this._board[move3.to + 1]?.color === them) {
              this._epSquare = epSquare;
              this._hash ^= this._epKey();
            } else {
              this._epSquare = EMPTY;
            }
          } else {
            this._epSquare = EMPTY;
          }
          if (move3.piece === PAWN) {
            this._halfMoves = 0;
          } else if (move3.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
            this._halfMoves = 0;
          } else {
            this._halfMoves++;
          }
          if (us === BLACK) {
            this._moveNumber++;
          }
          this._turn = them;
          this._hash ^= SIDE_KEY;
        }
        undo() {
          const hash2 = this._hash;
          const move3 = this._undoMove();
          if (move3) {
            const prettyMove = new Move(this, move3);
            this._decPositionCount(hash2);
            return prettyMove;
          }
          return null;
        }
        _undoMove() {
          const old = this._history.pop();
          if (old === void 0) {
            return null;
          }
          this._hash ^= this._epKey();
          this._hash ^= this._castlingKey();
          const move3 = old.move;
          this._kings = old.kings;
          this._turn = old.turn;
          this._castling = old.castling;
          this._epSquare = old.epSquare;
          this._halfMoves = old.halfMoves;
          this._moveNumber = old.moveNumber;
          this._hash ^= this._epKey();
          this._hash ^= this._castlingKey();
          this._hash ^= SIDE_KEY;
          const us = this._turn;
          const them = swapColor(us);
          if (move3.flags & BITS.NULL_MOVE) {
            return move3;
          }
          this._movePiece(move3.to, move3.from);
          if (move3.piece) {
            this._clear(move3.from);
            this._set(move3.from, { type: move3.piece, color: us });
          }
          if (move3.captured) {
            if (move3.flags & BITS.EP_CAPTURE) {
              let index;
              if (us === BLACK) {
                index = move3.to - 16;
              } else {
                index = move3.to + 16;
              }
              this._set(index, { type: PAWN, color: them });
            } else {
              this._set(move3.to, { type: move3.captured, color: them });
            }
          }
          if (move3.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
            let castlingTo, castlingFrom;
            if (move3.flags & BITS.KSIDE_CASTLE) {
              castlingTo = move3.to + 1;
              castlingFrom = move3.to - 1;
            } else {
              castlingTo = move3.to - 2;
              castlingFrom = move3.to + 1;
            }
            this._movePiece(castlingFrom, castlingTo);
          }
          return move3;
        }
        pgn({ newline = "\n", maxWidth = 0 } = {}) {
          const result = [];
          let headerExists = false;
          for (const i in this._header) {
            const headerTag = this._header[i];
            if (headerTag)
              result.push(`[${i} "${this._header[i]}"]` + newline);
            headerExists = true;
          }
          if (headerExists && this._history.length) {
            result.push(newline);
          }
          const appendComment = (moveString2) => {
            const comment = this._comments[this.fen()];
            if (typeof comment !== "undefined") {
              const delimiter = moveString2.length > 0 ? " " : "";
              moveString2 = `${moveString2}${delimiter}{${comment}}`;
            }
            return moveString2;
          };
          const reversedHistory = [];
          while (this._history.length > 0) {
            reversedHistory.push(this._undoMove());
          }
          const moves = [];
          let moveString = "";
          if (reversedHistory.length === 0) {
            moves.push(appendComment(""));
          }
          while (reversedHistory.length > 0) {
            moveString = appendComment(moveString);
            const move3 = reversedHistory.pop();
            if (!move3) {
              break;
            }
            if (!this._history.length && move3.color === "b") {
              const prefix = `${this._moveNumber}. ...`;
              moveString = moveString ? `${moveString} ${prefix}` : prefix;
            } else if (move3.color === "w") {
              if (moveString.length) {
                moves.push(moveString);
              }
              moveString = this._moveNumber + ".";
            }
            moveString = moveString + " " + this._moveToSan(move3, this._moves({ legal: true }));
            this._makeMove(move3);
          }
          if (moveString.length) {
            moves.push(appendComment(moveString));
          }
          moves.push(this._header.Result || "*");
          if (maxWidth === 0) {
            return result.join("") + moves.join(" ");
          }
          const strip = function() {
            if (result.length > 0 && result[result.length - 1] === " ") {
              result.pop();
              return true;
            }
            return false;
          };
          const wrapComment = function(width, move3) {
            for (const token of move3.split(" ")) {
              if (!token) {
                continue;
              }
              if (width + token.length > maxWidth) {
                while (strip()) {
                  width--;
                }
                result.push(newline);
                width = 0;
              }
              result.push(token);
              width += token.length;
              result.push(" ");
              width++;
            }
            if (strip()) {
              width--;
            }
            return width;
          };
          let currentWidth = 0;
          for (let i = 0; i < moves.length; i++) {
            if (currentWidth + moves[i].length > maxWidth) {
              if (moves[i].includes("{")) {
                currentWidth = wrapComment(currentWidth, moves[i]);
                continue;
              }
            }
            if (currentWidth + moves[i].length > maxWidth && i !== 0) {
              if (result[result.length - 1] === " ") {
                result.pop();
              }
              result.push(newline);
              currentWidth = 0;
            } else if (i !== 0) {
              result.push(" ");
              currentWidth++;
            }
            result.push(moves[i]);
            currentWidth += moves[i].length;
          }
          return result.join("");
        }
        /**
         * @deprecated Use `setHeader` and `getHeaders` instead. This method will return null header tags (which is not what you want)
         */
        header(...args) {
          for (let i = 0; i < args.length; i += 2) {
            if (typeof args[i] === "string" && typeof args[i + 1] === "string") {
              this._header[args[i]] = args[i + 1];
            }
          }
          return this._header;
        }
        // TODO: value validation per spec
        setHeader(key, value) {
          this._header[key] = value ?? SEVEN_TAG_ROSTER[key] ?? null;
          return this.getHeaders();
        }
        removeHeader(key) {
          if (key in this._header) {
            this._header[key] = SEVEN_TAG_ROSTER[key] || null;
            return true;
          }
          return false;
        }
        // return only non-null headers (omit placemarker nulls)
        getHeaders() {
          const nonNullHeaders = {};
          for (const [key, value] of Object.entries(this._header)) {
            if (value !== null) {
              nonNullHeaders[key] = value;
            }
          }
          return nonNullHeaders;
        }
        loadPgn(pgn2, { strict = false, newlineChar = "\r?\n" } = {}) {
          if (newlineChar !== "\r?\n") {
            pgn2 = pgn2.replace(new RegExp(newlineChar, "g"), "\n");
          }
          const parsedPgn = peg$parse(pgn2);
          this.reset();
          const headers = parsedPgn.headers;
          let fen = "";
          for (const key in headers) {
            if (key.toLowerCase() === "fen") {
              fen = headers[key];
            }
            this.header(key, headers[key]);
          }
          if (!strict) {
            if (fen) {
              this.load(fen, { preserveHeaders: true });
            }
          } else {
            if (headers["SetUp"] === "1") {
              if (!("FEN" in headers)) {
                throw new Error("Invalid PGN: FEN tag must be supplied with SetUp tag");
              }
              this.load(headers["FEN"], { preserveHeaders: true });
            }
          }
          let node2 = parsedPgn.root;
          while (node2) {
            if (node2.move) {
              const move3 = this._moveFromSan(node2.move, strict);
              if (move3 == null) {
                throw new Error(`Invalid move in PGN: ${node2.move}`);
              } else {
                this._makeMove(move3);
                this._incPositionCount();
              }
            }
            if (node2.comment !== void 0) {
              this._comments[this.fen()] = node2.comment;
            }
            node2 = node2.variations[0];
          }
          const result = parsedPgn.result;
          if (result && Object.keys(this._header).length && this._header["Result"] !== result) {
            this.setHeader("Result", result);
          }
        }
        /*
         * Convert a move from 0x88 coordinates to Standard Algebraic Notation
         * (SAN)
         *
         * @param {boolean} strict Use the strict SAN parser. It will throw errors
         * on overly disambiguated moves (see below):
         *
         * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
         * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
         * 4. ... Ne7 is technically the valid SAN
         */
        _moveToSan(move3, moves) {
          let output = "";
          if (move3.flags & BITS.KSIDE_CASTLE) {
            output = "O-O";
          } else if (move3.flags & BITS.QSIDE_CASTLE) {
            output = "O-O-O";
          } else if (move3.flags & BITS.NULL_MOVE) {
            return SAN_NULLMOVE;
          } else {
            if (move3.piece !== PAWN) {
              const disambiguator = getDisambiguator(move3, moves);
              output += move3.piece.toUpperCase() + disambiguator;
            }
            if (move3.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
              if (move3.piece === PAWN) {
                output += algebraic(move3.from)[0];
              }
              output += "x";
            }
            output += algebraic(move3.to);
            if (move3.promotion) {
              output += "=" + move3.promotion.toUpperCase();
            }
          }
          this._makeMove(move3);
          if (this.isCheck()) {
            if (this.isCheckmate()) {
              output += "#";
            } else {
              output += "+";
            }
          }
          this._undoMove();
          return output;
        }
        // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
        _moveFromSan(move3, strict = false) {
          let cleanMove = strippedSan(move3);
          if (!strict) {
            if (cleanMove === "0-0") {
              cleanMove = "O-O";
            } else if (cleanMove === "0-0-0") {
              cleanMove = "O-O-O";
            }
          }
          if (cleanMove == SAN_NULLMOVE) {
            const res = {
              color: this._turn,
              from: 0,
              to: 0,
              piece: "k",
              flags: BITS.NULL_MOVE
            };
            return res;
          }
          let pieceType = inferPieceType(cleanMove);
          let moves = this._moves({ legal: true, piece: pieceType });
          for (let i = 0, len = moves.length; i < len; i++) {
            if (cleanMove === strippedSan(this._moveToSan(moves[i], moves))) {
              return moves[i];
            }
          }
          if (strict) {
            return null;
          }
          let piece = void 0;
          let matches = void 0;
          let from = void 0;
          let to = void 0;
          let promotion = void 0;
          let overlyDisambiguated = false;
          matches = cleanMove.match(/([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/);
          if (matches) {
            piece = matches[1];
            from = matches[2];
            to = matches[3];
            promotion = matches[4];
            if (from.length == 1) {
              overlyDisambiguated = true;
            }
          } else {
            matches = cleanMove.match(/([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/);
            if (matches) {
              piece = matches[1];
              from = matches[2];
              to = matches[3];
              promotion = matches[4];
              if (from.length == 1) {
                overlyDisambiguated = true;
              }
            }
          }
          pieceType = inferPieceType(cleanMove);
          moves = this._moves({
            legal: true,
            piece: piece ? piece : pieceType
          });
          if (!to) {
            return null;
          }
          for (let i = 0, len = moves.length; i < len; i++) {
            if (!from) {
              if (cleanMove === strippedSan(this._moveToSan(moves[i], moves)).replace("x", "")) {
                return moves[i];
              }
            } else if ((!piece || piece.toLowerCase() == moves[i].piece) && Ox88[from] == moves[i].from && Ox88[to] == moves[i].to && (!promotion || promotion.toLowerCase() == moves[i].promotion)) {
              return moves[i];
            } else if (overlyDisambiguated) {
              const square = algebraic(moves[i].from);
              if ((!piece || piece.toLowerCase() == moves[i].piece) && Ox88[to] == moves[i].to && (from == square[0] || from == square[1]) && (!promotion || promotion.toLowerCase() == moves[i].promotion)) {
                return moves[i];
              }
            }
          }
          return null;
        }
        ascii() {
          let s = "   +------------------------+\n";
          for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            if (file(i) === 0) {
              s += " " + "87654321"[rank(i)] + " |";
            }
            if (this._board[i]) {
              const piece = this._board[i].type;
              const color = this._board[i].color;
              const symbol = color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
              s += " " + symbol + " ";
            } else {
              s += " . ";
            }
            if (i + 1 & 136) {
              s += "|\n";
              i += 8;
            }
          }
          s += "   +------------------------+\n";
          s += "     a  b  c  d  e  f  g  h";
          return s;
        }
        perft(depth) {
          const moves = this._moves({ legal: false });
          let nodes = 0;
          const color = this._turn;
          for (let i = 0, len = moves.length; i < len; i++) {
            this._makeMove(moves[i]);
            if (!this._isKingAttacked(color)) {
              if (depth - 1 > 0) {
                nodes += this.perft(depth - 1);
              } else {
                nodes++;
              }
            }
            this._undoMove();
          }
          return nodes;
        }
        setTurn(color) {
          if (this._turn == color) {
            return false;
          }
          this.move("--");
          return true;
        }
        turn() {
          return this._turn;
        }
        board() {
          const output = [];
          let row = [];
          for (let i = Ox88.a8; i <= Ox88.h1; i++) {
            if (this._board[i] == null) {
              row.push(null);
            } else {
              row.push({
                square: algebraic(i),
                type: this._board[i].type,
                color: this._board[i].color
              });
            }
            if (i + 1 & 136) {
              output.push(row);
              row = [];
              i += 8;
            }
          }
          return output;
        }
        squareColor(square) {
          if (square in Ox88) {
            const sq = Ox88[square];
            return (rank(sq) + file(sq)) % 2 === 0 ? "light" : "dark";
          }
          return null;
        }
        history({ verbose = false } = {}) {
          const reversedHistory = [];
          const moveHistory = [];
          while (this._history.length > 0) {
            reversedHistory.push(this._undoMove());
          }
          while (true) {
            const move3 = reversedHistory.pop();
            if (!move3) {
              break;
            }
            if (verbose) {
              moveHistory.push(new Move(this, move3));
            } else {
              moveHistory.push(this._moveToSan(move3, this._moves()));
            }
            this._makeMove(move3);
          }
          return moveHistory;
        }
        /*
         * Keeps track of position occurrence counts for the purpose of repetition
         * checking. Old positions are removed from the map if their counts are reduced to 0.
         */
        _getPositionCount(hash2) {
          return this._positionCount.get(hash2) ?? 0;
        }
        _incPositionCount() {
          this._positionCount.set(this._hash, (this._positionCount.get(this._hash) ?? 0) + 1);
        }
        _decPositionCount(hash2) {
          const currentCount = this._positionCount.get(hash2) ?? 0;
          if (currentCount === 1) {
            this._positionCount.delete(hash2);
          } else {
            this._positionCount.set(hash2, currentCount - 1);
          }
        }
        _pruneComments() {
          const reversedHistory = [];
          const currentComments = {};
          const copyComment = (fen) => {
            if (fen in this._comments) {
              currentComments[fen] = this._comments[fen];
            }
          };
          while (this._history.length > 0) {
            reversedHistory.push(this._undoMove());
          }
          copyComment(this.fen());
          while (true) {
            const move3 = reversedHistory.pop();
            if (!move3) {
              break;
            }
            this._makeMove(move3);
            copyComment(this.fen());
          }
          this._comments = currentComments;
        }
        getComment() {
          return this._comments[this.fen()];
        }
        setComment(comment) {
          this._comments[this.fen()] = comment.replace("{", "[").replace("}", "]");
        }
        /**
         * @deprecated Renamed to `removeComment` for consistency
         */
        deleteComment() {
          return this.removeComment();
        }
        removeComment() {
          const comment = this._comments[this.fen()];
          delete this._comments[this.fen()];
          return comment;
        }
        getComments() {
          this._pruneComments();
          return Object.keys(this._comments).map((fen) => {
            return { fen, comment: this._comments[fen] };
          });
        }
        /**
         * @deprecated Renamed to `removeComments` for consistency
         */
        deleteComments() {
          return this.removeComments();
        }
        removeComments() {
          this._pruneComments();
          return Object.keys(this._comments).map((fen) => {
            const comment = this._comments[fen];
            delete this._comments[fen];
            return { fen, comment };
          });
        }
        setCastlingRights(color, rights) {
          for (const side of [KING, QUEEN]) {
            if (rights[side] !== void 0) {
              if (rights[side]) {
                this._castling[color] |= SIDES[side];
              } else {
                this._castling[color] &= ~SIDES[side];
              }
            }
          }
          this._updateCastlingRights();
          const result = this.getCastlingRights(color);
          return (rights[KING] === void 0 || rights[KING] === result[KING]) && (rights[QUEEN] === void 0 || rights[QUEEN] === result[QUEEN]);
        }
        getCastlingRights(color) {
          return {
            [KING]: (this._castling[color] & SIDES[KING]) !== 0,
            [QUEEN]: (this._castling[color] & SIDES[QUEEN]) !== 0
          };
        }
        moveNumber() {
          return this._moveNumber;
        }
      };
    }
  });

  // node_modules/@mliebelt/pgn-parser/lib/index.umd.js
  var require_index_umd = __commonJS({
    "node_modules/@mliebelt/pgn-parser/lib/index.umd.js"(exports, module) {
      (function(global, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.PgnParser = {}));
      })(exports, (function(exports2) {
        "use strict";
        function getDefaultExportFromCjs(x) {
          return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
        }
        var _pgnParser$1 = { exports: {} };
        var _pgnParser = _pgnParser$1.exports;
        var hasRequired_pgnParser;
        function require_pgnParser() {
          if (hasRequired_pgnParser) return _pgnParser$1.exports;
          hasRequired_pgnParser = 1;
          (function(module2) {
            (function(root, factory) {
              if (module2.exports) {
                module2.exports = factory();
              }
            })(_pgnParser, function() {
              function peg$subclass2(child, parent) {
                function C() {
                  this.constructor = child;
                }
                C.prototype = parent.prototype;
                child.prototype = new C();
              }
              function peg$SyntaxError2(message, expected, found, location) {
                var self2 = Error.call(this, message);
                if (Object.setPrototypeOf) {
                  Object.setPrototypeOf(self2, peg$SyntaxError2.prototype);
                }
                self2.expected = expected;
                self2.found = found;
                self2.location = location;
                self2.name = "SyntaxError";
                return self2;
              }
              peg$subclass2(peg$SyntaxError2, Error);
              function peg$padEnd2(str, targetLength, padString) {
                padString = padString || " ";
                if (str.length > targetLength) {
                  return str;
                }
                targetLength -= str.length;
                padString += padString.repeat(targetLength);
                return str + padString.slice(0, targetLength);
              }
              peg$SyntaxError2.prototype.format = function(sources) {
                var str = "Error: " + this.message;
                if (this.location) {
                  var src = null;
                  var k;
                  for (k = 0; k < sources.length; k++) {
                    if (sources[k].source === this.location.source) {
                      src = sources[k].text.split(/\r\n|\n|\r/g);
                      break;
                    }
                  }
                  var s = this.location.start;
                  var offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
                  var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
                  if (src) {
                    var e = this.location.end;
                    var filler = peg$padEnd2("", offset_s.line.toString().length, " ");
                    var line = src[s.line - 1];
                    var last = s.line === e.line ? e.column : line.length + 1;
                    var hatLen = last - s.column || 1;
                    str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + peg$padEnd2("", s.column - 1, " ") + peg$padEnd2("", hatLen, "^");
                  } else {
                    str += "\n at " + loc;
                  }
                }
                return str;
              };
              peg$SyntaxError2.buildMessage = function(expected, found) {
                var DESCRIBE_EXPECTATION_FNS = {
                  literal: function(expectation) {
                    return '"' + literalEscape(expectation.text) + '"';
                  },
                  class: function(expectation) {
                    var escapedParts = expectation.parts.map(function(part) {
                      return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
                    });
                    return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
                  },
                  any: function() {
                    return "any character";
                  },
                  end: function() {
                    return "end of input";
                  },
                  other: function(expectation) {
                    return expectation.description;
                  }
                };
                function hex(ch) {
                  return ch.charCodeAt(0).toString(16).toUpperCase();
                }
                function literalEscape(s) {
                  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
                    return "\\x0" + hex(ch);
                  }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
                    return "\\x" + hex(ch);
                  });
                }
                function classEscape(s) {
                  return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
                    return "\\x0" + hex(ch);
                  }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
                    return "\\x" + hex(ch);
                  });
                }
                function describeExpectation(expectation) {
                  return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
                }
                function describeExpected(expected2) {
                  var descriptions = expected2.map(describeExpectation);
                  var i, j;
                  descriptions.sort();
                  if (descriptions.length > 0) {
                    for (i = 1, j = 1; i < descriptions.length; i++) {
                      if (descriptions[i - 1] !== descriptions[i]) {
                        descriptions[j] = descriptions[i];
                        j++;
                      }
                    }
                    descriptions.length = j;
                  }
                  switch (descriptions.length) {
                    case 1:
                      return descriptions[0];
                    case 2:
                      return descriptions[0] + " or " + descriptions[1];
                    default:
                      return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
                  }
                }
                function describeFound(found2) {
                  return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
                }
                return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
              };
              function peg$parse2(input, options) {
                options = options !== void 0 ? options : {};
                var peg$FAILED = {};
                var peg$source = options.grammarSource;
                var peg$startRuleFunctions = { pgn: peg$parsepgn, tags: peg$parsetags, game: peg$parsegame, games: peg$parsegames };
                var peg$startRuleFunction = peg$parsepgn;
                var peg$c0 = "\uFEFF";
                var peg$c1 = "Event";
                var peg$c2 = "event";
                var peg$c3 = "Site";
                var peg$c4 = "site";
                var peg$c5 = "Date";
                var peg$c6 = "date";
                var peg$c7 = "Round";
                var peg$c8 = "round";
                var peg$c9 = "White";
                var peg$c10 = "white";
                var peg$c11 = "Black";
                var peg$c12 = "black";
                var peg$c13 = "Result";
                var peg$c14 = "result";
                var peg$c15 = "WhiteTitle";
                var peg$c16 = "Whitetitle";
                var peg$c17 = "whitetitle";
                var peg$c18 = "whiteTitle";
                var peg$c19 = "BlackTitle";
                var peg$c20 = "Blacktitle";
                var peg$c21 = "blacktitle";
                var peg$c22 = "blackTitle";
                var peg$c23 = "WhiteELO";
                var peg$c24 = "WhiteElo";
                var peg$c25 = "Whiteelo";
                var peg$c26 = "whiteelo";
                var peg$c27 = "whiteElo";
                var peg$c28 = "BlackELO";
                var peg$c29 = "BlackElo";
                var peg$c30 = "Blackelo";
                var peg$c31 = "blackelo";
                var peg$c32 = "blackElo";
                var peg$c33 = "WhiteUSCF";
                var peg$c34 = "WhiteUscf";
                var peg$c35 = "Whiteuscf";
                var peg$c36 = "whiteuscf";
                var peg$c37 = "whiteUscf";
                var peg$c38 = "BlackUSCF";
                var peg$c39 = "BlackUscf";
                var peg$c40 = "Blackuscf";
                var peg$c41 = "blackuscf";
                var peg$c42 = "blackUscf";
                var peg$c43 = "WhiteNA";
                var peg$c44 = "WhiteNa";
                var peg$c45 = "Whitena";
                var peg$c46 = "whitena";
                var peg$c47 = "whiteNa";
                var peg$c48 = "whiteNA";
                var peg$c49 = "BlackNA";
                var peg$c50 = "BlackNa";
                var peg$c51 = "Blackna";
                var peg$c52 = "blackna";
                var peg$c53 = "blackNA";
                var peg$c54 = "blackNa";
                var peg$c55 = "WhiteType";
                var peg$c56 = "Whitetype";
                var peg$c57 = "whitetype";
                var peg$c58 = "whiteType";
                var peg$c59 = "BlackType";
                var peg$c60 = "Blacktype";
                var peg$c61 = "blacktype";
                var peg$c62 = "blackType";
                var peg$c63 = "EventDate";
                var peg$c64 = "Eventdate";
                var peg$c65 = "eventdate";
                var peg$c66 = "eventDate";
                var peg$c67 = "EventSponsor";
                var peg$c68 = "Eventsponsor";
                var peg$c69 = "eventsponsor";
                var peg$c70 = "eventSponsor";
                var peg$c71 = "Section";
                var peg$c72 = "section";
                var peg$c73 = "Stage";
                var peg$c74 = "stage";
                var peg$c75 = "Board";
                var peg$c76 = "board";
                var peg$c77 = "Opening";
                var peg$c78 = "opening";
                var peg$c79 = "Variation";
                var peg$c80 = "variation";
                var peg$c81 = "SubVariation";
                var peg$c82 = "Subvariation";
                var peg$c83 = "subvariation";
                var peg$c84 = "subVariation";
                var peg$c85 = "ECO";
                var peg$c86 = "Eco";
                var peg$c87 = "eco";
                var peg$c88 = "NIC";
                var peg$c89 = "Nic";
                var peg$c90 = "nic";
                var peg$c91 = "Time";
                var peg$c92 = "time";
                var peg$c93 = "UTCTime";
                var peg$c94 = "UTCtime";
                var peg$c95 = "UtcTime";
                var peg$c96 = "Utctime";
                var peg$c97 = "utctime";
                var peg$c98 = "utcTime";
                var peg$c99 = "UTCDate";
                var peg$c100 = "UTCdate";
                var peg$c101 = "UtcDate";
                var peg$c102 = "Utcdate";
                var peg$c103 = "utcdate";
                var peg$c104 = "utcDate";
                var peg$c105 = "TimeControl";
                var peg$c106 = "Timecontrol";
                var peg$c107 = "timecontrol";
                var peg$c108 = "timeControl";
                var peg$c109 = "SetUp";
                var peg$c110 = "Setup";
                var peg$c111 = "setup";
                var peg$c112 = "setUp";
                var peg$c113 = "FEN";
                var peg$c114 = "Fen";
                var peg$c115 = "fen";
                var peg$c116 = "Termination";
                var peg$c117 = "termination";
                var peg$c118 = "Annotator";
                var peg$c119 = "annotator";
                var peg$c120 = "Mode";
                var peg$c121 = "mode";
                var peg$c122 = "PlyCount";
                var peg$c123 = "Plycount";
                var peg$c124 = "plycount";
                var peg$c125 = "plyCount";
                var peg$c126 = "Variant";
                var peg$c127 = "variant";
                var peg$c128 = "WhiteRatingDiff";
                var peg$c129 = "BlackRatingDiff";
                var peg$c130 = "WhiteFideId";
                var peg$c131 = "BlackFideId";
                var peg$c132 = "WhiteTeam";
                var peg$c133 = "BlackTeam";
                var peg$c134 = "Clock";
                var peg$c135 = "WhiteClock";
                var peg$c136 = "BlackClock";
                var peg$c138 = '"';
                var peg$c139 = "\\";
                var peg$c140 = ".";
                var peg$c141 = ":";
                var peg$c142 = "/";
                var peg$c143 = "?";
                var peg$c144 = "-";
                var peg$c145 = "+";
                var peg$c146 = "*";
                var peg$c147 = "1-0";
                var peg$c148 = "0-1";
                var peg$c149 = "1/2-1/2";
                var peg$c150 = "1/2";
                var peg$c151 = "=";
                var peg$c152 = "%csl";
                var peg$c153 = "%cal";
                var peg$c154 = "%";
                var peg$c155 = "%eval";
                var peg$c156 = "[%";
                var peg$c157 = "}";
                var peg$c158 = ",";
                var peg$c159 = "Y";
                var peg$c160 = "G";
                var peg$c161 = "R";
                var peg$c162 = "B";
                var peg$c163 = "O";
                var peg$c164 = "C";
                var peg$c165 = "{";
                var peg$c166 = "[";
                var peg$c167 = "]";
                var peg$c168 = ";";
                var peg$c169 = "clk";
                var peg$c170 = "egt";
                var peg$c171 = "emt";
                var peg$c172 = "mct";
                var peg$c173 = "(";
                var peg$c174 = ")";
                var peg$c175 = " ";
                var peg$c176 = "e.p.";
                var peg$c177 = "O-O-O";
                var peg$c178 = "O-O";
                var peg$c179 = "@";
                var peg$c180 = "Z0";
                var peg$c181 = "+-";
                var peg$c182 = "$$$";
                var peg$c183 = "#";
                var peg$c184 = "$";
                var peg$c185 = "!!";
                var peg$c186 = "??";
                var peg$c187 = "!?";
                var peg$c188 = "?!";
                var peg$c189 = "!";
                var peg$c190 = "\u203C";
                var peg$c191 = "\u2047";
                var peg$c192 = "\u2049";
                var peg$c193 = "\u2048";
                var peg$c194 = "\u25A1";
                var peg$c195 = "\u221E";
                var peg$c196 = "\u2A72";
                var peg$c197 = "\u2A71";
                var peg$c198 = "\xB1";
                var peg$c199 = "\u2213";
                var peg$c200 = "-+";
                var peg$c201 = "\u2A00";
                var peg$c202 = "\u27F3";
                var peg$c203 = "\u2192";
                var peg$c204 = "\u2191";
                var peg$c205 = "\u21C6";
                var peg$c206 = "D";
                var peg$c207 = "x";
                var peg$r0 = /^[ \t\n\r]/;
                var peg$r1 = /^[\n\r]/;
                var peg$r2 = /^[\-a-zA-Z0-9_.]/;
                var peg$r3 = /^[^"\\\r\n]/;
                var peg$r4 = /^[0-9?]/;
                var peg$r5 = /^[0-9]/;
                var peg$r6 = /^[BNW]/;
                var peg$r7 = /^[^\n\r]/;
                var peg$r8 = /^[1-8a-h]/;
                var peg$r9 = /^[RNBQKP]/;
                var peg$r10 = /^[RNBQ]/;
                var peg$r11 = /^[a-h]/;
                var peg$r12 = /^[1-8]/;
                var peg$r13 = /^[\-x]/;
                var peg$e0 = peg$literalExpectation("\uFEFF", false);
                var peg$e1 = peg$literalExpectation("Event", false);
                var peg$e2 = peg$literalExpectation("event", false);
                var peg$e3 = peg$literalExpectation("Site", false);
                var peg$e4 = peg$literalExpectation("site", false);
                var peg$e5 = peg$literalExpectation("Date", false);
                var peg$e6 = peg$literalExpectation("date", false);
                var peg$e7 = peg$literalExpectation("Round", false);
                var peg$e8 = peg$literalExpectation("round", false);
                var peg$e9 = peg$literalExpectation("White", false);
                var peg$e10 = peg$literalExpectation("white", false);
                var peg$e11 = peg$literalExpectation("Black", false);
                var peg$e12 = peg$literalExpectation("black", false);
                var peg$e13 = peg$literalExpectation("Result", false);
                var peg$e14 = peg$literalExpectation("result", false);
                var peg$e15 = peg$literalExpectation("WhiteTitle", false);
                var peg$e16 = peg$literalExpectation("Whitetitle", false);
                var peg$e17 = peg$literalExpectation("whitetitle", false);
                var peg$e18 = peg$literalExpectation("whiteTitle", false);
                var peg$e19 = peg$literalExpectation("BlackTitle", false);
                var peg$e20 = peg$literalExpectation("Blacktitle", false);
                var peg$e21 = peg$literalExpectation("blacktitle", false);
                var peg$e22 = peg$literalExpectation("blackTitle", false);
                var peg$e23 = peg$literalExpectation("WhiteELO", false);
                var peg$e24 = peg$literalExpectation("WhiteElo", false);
                var peg$e25 = peg$literalExpectation("Whiteelo", false);
                var peg$e26 = peg$literalExpectation("whiteelo", false);
                var peg$e27 = peg$literalExpectation("whiteElo", false);
                var peg$e28 = peg$literalExpectation("BlackELO", false);
                var peg$e29 = peg$literalExpectation("BlackElo", false);
                var peg$e30 = peg$literalExpectation("Blackelo", false);
                var peg$e31 = peg$literalExpectation("blackelo", false);
                var peg$e32 = peg$literalExpectation("blackElo", false);
                var peg$e33 = peg$literalExpectation("WhiteUSCF", false);
                var peg$e34 = peg$literalExpectation("WhiteUscf", false);
                var peg$e35 = peg$literalExpectation("Whiteuscf", false);
                var peg$e36 = peg$literalExpectation("whiteuscf", false);
                var peg$e37 = peg$literalExpectation("whiteUscf", false);
                var peg$e38 = peg$literalExpectation("BlackUSCF", false);
                var peg$e39 = peg$literalExpectation("BlackUscf", false);
                var peg$e40 = peg$literalExpectation("Blackuscf", false);
                var peg$e41 = peg$literalExpectation("blackuscf", false);
                var peg$e42 = peg$literalExpectation("blackUscf", false);
                var peg$e43 = peg$literalExpectation("WhiteNA", false);
                var peg$e44 = peg$literalExpectation("WhiteNa", false);
                var peg$e45 = peg$literalExpectation("Whitena", false);
                var peg$e46 = peg$literalExpectation("whitena", false);
                var peg$e47 = peg$literalExpectation("whiteNa", false);
                var peg$e48 = peg$literalExpectation("whiteNA", false);
                var peg$e49 = peg$literalExpectation("BlackNA", false);
                var peg$e50 = peg$literalExpectation("BlackNa", false);
                var peg$e51 = peg$literalExpectation("Blackna", false);
                var peg$e52 = peg$literalExpectation("blackna", false);
                var peg$e53 = peg$literalExpectation("blackNA", false);
                var peg$e54 = peg$literalExpectation("blackNa", false);
                var peg$e55 = peg$literalExpectation("WhiteType", false);
                var peg$e56 = peg$literalExpectation("Whitetype", false);
                var peg$e57 = peg$literalExpectation("whitetype", false);
                var peg$e58 = peg$literalExpectation("whiteType", false);
                var peg$e59 = peg$literalExpectation("BlackType", false);
                var peg$e60 = peg$literalExpectation("Blacktype", false);
                var peg$e61 = peg$literalExpectation("blacktype", false);
                var peg$e62 = peg$literalExpectation("blackType", false);
                var peg$e63 = peg$literalExpectation("EventDate", false);
                var peg$e64 = peg$literalExpectation("Eventdate", false);
                var peg$e65 = peg$literalExpectation("eventdate", false);
                var peg$e66 = peg$literalExpectation("eventDate", false);
                var peg$e67 = peg$literalExpectation("EventSponsor", false);
                var peg$e68 = peg$literalExpectation("Eventsponsor", false);
                var peg$e69 = peg$literalExpectation("eventsponsor", false);
                var peg$e70 = peg$literalExpectation("eventSponsor", false);
                var peg$e71 = peg$literalExpectation("Section", false);
                var peg$e72 = peg$literalExpectation("section", false);
                var peg$e73 = peg$literalExpectation("Stage", false);
                var peg$e74 = peg$literalExpectation("stage", false);
                var peg$e75 = peg$literalExpectation("Board", false);
                var peg$e76 = peg$literalExpectation("board", false);
                var peg$e77 = peg$literalExpectation("Opening", false);
                var peg$e78 = peg$literalExpectation("opening", false);
                var peg$e79 = peg$literalExpectation("Variation", false);
                var peg$e80 = peg$literalExpectation("variation", false);
                var peg$e81 = peg$literalExpectation("SubVariation", false);
                var peg$e82 = peg$literalExpectation("Subvariation", false);
                var peg$e83 = peg$literalExpectation("subvariation", false);
                var peg$e84 = peg$literalExpectation("subVariation", false);
                var peg$e85 = peg$literalExpectation("ECO", false);
                var peg$e86 = peg$literalExpectation("Eco", false);
                var peg$e87 = peg$literalExpectation("eco", false);
                var peg$e88 = peg$literalExpectation("NIC", false);
                var peg$e89 = peg$literalExpectation("Nic", false);
                var peg$e90 = peg$literalExpectation("nic", false);
                var peg$e91 = peg$literalExpectation("Time", false);
                var peg$e92 = peg$literalExpectation("time", false);
                var peg$e93 = peg$literalExpectation("UTCTime", false);
                var peg$e94 = peg$literalExpectation("UTCtime", false);
                var peg$e95 = peg$literalExpectation("UtcTime", false);
                var peg$e96 = peg$literalExpectation("Utctime", false);
                var peg$e97 = peg$literalExpectation("utctime", false);
                var peg$e98 = peg$literalExpectation("utcTime", false);
                var peg$e99 = peg$literalExpectation("UTCDate", false);
                var peg$e100 = peg$literalExpectation("UTCdate", false);
                var peg$e101 = peg$literalExpectation("UtcDate", false);
                var peg$e102 = peg$literalExpectation("Utcdate", false);
                var peg$e103 = peg$literalExpectation("utcdate", false);
                var peg$e104 = peg$literalExpectation("utcDate", false);
                var peg$e105 = peg$literalExpectation("TimeControl", false);
                var peg$e106 = peg$literalExpectation("Timecontrol", false);
                var peg$e107 = peg$literalExpectation("timecontrol", false);
                var peg$e108 = peg$literalExpectation("timeControl", false);
                var peg$e109 = peg$literalExpectation("SetUp", false);
                var peg$e110 = peg$literalExpectation("Setup", false);
                var peg$e111 = peg$literalExpectation("setup", false);
                var peg$e112 = peg$literalExpectation("setUp", false);
                var peg$e113 = peg$literalExpectation("FEN", false);
                var peg$e114 = peg$literalExpectation("Fen", false);
                var peg$e115 = peg$literalExpectation("fen", false);
                var peg$e116 = peg$literalExpectation("Termination", false);
                var peg$e117 = peg$literalExpectation("termination", false);
                var peg$e118 = peg$literalExpectation("Annotator", false);
                var peg$e119 = peg$literalExpectation("annotator", false);
                var peg$e120 = peg$literalExpectation("Mode", false);
                var peg$e121 = peg$literalExpectation("mode", false);
                var peg$e122 = peg$literalExpectation("PlyCount", false);
                var peg$e123 = peg$literalExpectation("Plycount", false);
                var peg$e124 = peg$literalExpectation("plycount", false);
                var peg$e125 = peg$literalExpectation("plyCount", false);
                var peg$e126 = peg$literalExpectation("Variant", false);
                var peg$e127 = peg$literalExpectation("variant", false);
                var peg$e128 = peg$literalExpectation("WhiteRatingDiff", false);
                var peg$e129 = peg$literalExpectation("BlackRatingDiff", false);
                var peg$e130 = peg$literalExpectation("WhiteFideId", false);
                var peg$e131 = peg$literalExpectation("BlackFideId", false);
                var peg$e132 = peg$literalExpectation("WhiteTeam", false);
                var peg$e133 = peg$literalExpectation("BlackTeam", false);
                var peg$e134 = peg$literalExpectation("Clock", false);
                var peg$e135 = peg$literalExpectation("WhiteClock", false);
                var peg$e136 = peg$literalExpectation("BlackClock", false);
                var peg$e137 = peg$otherExpectation("whitespace");
                var peg$e138 = peg$classExpectation([" ", "	", "\n", "\r"], false, false);
                var peg$e139 = peg$classExpectation(["\n", "\r"], false, false);
                var peg$e141 = peg$classExpectation(["-", ["a", "z"], ["A", "Z"], ["0", "9"], "_", "."], false, false);
                var peg$e142 = peg$literalExpectation('"', false);
                var peg$e143 = peg$classExpectation(['"', "\\", "\r", "\n"], true, false);
                var peg$e144 = peg$literalExpectation("\\", false);
                var peg$e145 = peg$classExpectation([["0", "9"], "?"], false, false);
                var peg$e146 = peg$literalExpectation(".", false);
                var peg$e147 = peg$classExpectation([["0", "9"]], false, false);
                var peg$e148 = peg$literalExpectation(":", false);
                var peg$e149 = peg$literalExpectation("/", false);
                var peg$e150 = peg$classExpectation(["B", "N", "W"], false, false);
                var peg$e151 = peg$literalExpectation("?", false);
                var peg$e152 = peg$literalExpectation("-", false);
                var peg$e153 = peg$literalExpectation("+", false);
                var peg$e154 = peg$literalExpectation("*", false);
                var peg$e155 = peg$literalExpectation("1-0", false);
                var peg$e156 = peg$literalExpectation("0-1", false);
                var peg$e157 = peg$literalExpectation("1/2-1/2", false);
                var peg$e158 = peg$literalExpectation("1/2", false);
                var peg$e159 = peg$literalExpectation("=", false);
                var peg$e160 = peg$literalExpectation("%csl", false);
                var peg$e161 = peg$literalExpectation("%cal", false);
                var peg$e162 = peg$literalExpectation("%", false);
                var peg$e163 = peg$literalExpectation("%eval", false);
                var peg$e164 = peg$literalExpectation("[%", false);
                var peg$e165 = peg$literalExpectation("}", false);
                var peg$e166 = peg$anyExpectation();
                var peg$e167 = peg$classExpectation(["\n", "\r"], true, false);
                var peg$e168 = peg$literalExpectation(",", false);
                var peg$e169 = peg$literalExpectation("Y", false);
                var peg$e170 = peg$literalExpectation("G", false);
                var peg$e171 = peg$literalExpectation("R", false);
                var peg$e172 = peg$literalExpectation("B", false);
                var peg$e173 = peg$literalExpectation("O", false);
                var peg$e174 = peg$literalExpectation("C", false);
                var peg$e175 = peg$literalExpectation("{", false);
                var peg$e176 = peg$literalExpectation("[", false);
                var peg$e177 = peg$literalExpectation("]", false);
                var peg$e178 = peg$literalExpectation(";", false);
                var peg$e179 = peg$literalExpectation("clk", false);
                var peg$e180 = peg$literalExpectation("egt", false);
                var peg$e181 = peg$literalExpectation("emt", false);
                var peg$e182 = peg$literalExpectation("mct", false);
                var peg$e183 = peg$literalExpectation("(", false);
                var peg$e184 = peg$literalExpectation(")", false);
                var peg$e185 = peg$otherExpectation("integer");
                var peg$e186 = peg$literalExpectation(" ", false);
                var peg$e187 = peg$literalExpectation("e.p.", false);
                var peg$e188 = peg$literalExpectation("O-O-O", false);
                var peg$e189 = peg$literalExpectation("O-O", false);
                var peg$e190 = peg$literalExpectation("@", false);
                var peg$e191 = peg$literalExpectation("Z0", false);
                var peg$e192 = peg$literalExpectation("+-", false);
                var peg$e193 = peg$literalExpectation("$$$", false);
                var peg$e194 = peg$literalExpectation("#", false);
                var peg$e195 = peg$literalExpectation("$", false);
                var peg$e196 = peg$literalExpectation("!!", false);
                var peg$e197 = peg$literalExpectation("??", false);
                var peg$e198 = peg$literalExpectation("!?", false);
                var peg$e199 = peg$literalExpectation("?!", false);
                var peg$e200 = peg$literalExpectation("!", false);
                var peg$e201 = peg$literalExpectation("\u203C", false);
                var peg$e202 = peg$literalExpectation("\u2047", false);
                var peg$e203 = peg$literalExpectation("\u2049", false);
                var peg$e204 = peg$literalExpectation("\u2048", false);
                var peg$e205 = peg$literalExpectation("\u25A1", false);
                var peg$e206 = peg$literalExpectation("\u221E", false);
                var peg$e207 = peg$literalExpectation("\u2A72", false);
                var peg$e208 = peg$literalExpectation("\u2A71", false);
                var peg$e209 = peg$literalExpectation("\xB1", false);
                var peg$e210 = peg$literalExpectation("\u2213", false);
                var peg$e211 = peg$literalExpectation("-+", false);
                var peg$e212 = peg$literalExpectation("\u2A00", false);
                var peg$e213 = peg$literalExpectation("\u27F3", false);
                var peg$e214 = peg$literalExpectation("\u2192", false);
                var peg$e215 = peg$literalExpectation("\u2191", false);
                var peg$e216 = peg$literalExpectation("\u21C6", false);
                var peg$e217 = peg$literalExpectation("D", false);
                var peg$e218 = peg$classExpectation([["1", "8"], ["a", "h"]], false, false);
                var peg$e219 = peg$classExpectation(["R", "N", "B", "Q", "K", "P"], false, false);
                var peg$e220 = peg$classExpectation(["R", "N", "B", "Q"], false, false);
                var peg$e221 = peg$classExpectation([["a", "h"]], false, false);
                var peg$e222 = peg$classExpectation([["1", "8"]], false, false);
                var peg$e223 = peg$literalExpectation("x", false);
                var peg$e224 = peg$classExpectation(["-", "x"], false, false);
                var peg$f0 = function(head, m) {
                  return m;
                };
                var peg$f1 = function(head, tail) {
                  return [head].concat(tail);
                };
                var peg$f2 = function(games) {
                  return games;
                };
                var peg$f3 = function(t, c, p) {
                  var mess = messages;
                  messages = [];
                  return { tags: t, gameComment: c, moves: p, messages: mess };
                };
                var peg$f4 = function(head, m) {
                  return m;
                };
                var peg$f5 = function(head, tail) {
                  var result = {};
                  [head].concat(tail).forEach(function(element) {
                    result[element.name] = element.value;
                  });
                  return result;
                };
                var peg$f6 = function(members) {
                  if (members === null)
                    return {};
                  members.messages = messages;
                  return members;
                };
                var peg$f7 = function(tag) {
                  return tag;
                };
                var peg$f8 = function(value) {
                  return { name: "Event", value };
                };
                var peg$f9 = function(value) {
                  return { name: "Site", value };
                };
                var peg$f10 = function(value) {
                  return { name: "Date", value };
                };
                var peg$f11 = function(value) {
                  return { name: "Round", value };
                };
                var peg$f12 = function(value) {
                  return { name: "WhiteTitle", value };
                };
                var peg$f13 = function(value) {
                  return { name: "BlackTitle", value };
                };
                var peg$f14 = function(value) {
                  return { name: "WhiteElo", value };
                };
                var peg$f15 = function(value) {
                  return { name: "BlackElo", value };
                };
                var peg$f16 = function(value) {
                  return { name: "WhiteUSCF", value };
                };
                var peg$f17 = function(value) {
                  return { name: "BlackUSCF", value };
                };
                var peg$f18 = function(value) {
                  return { name: "WhiteNA", value };
                };
                var peg$f19 = function(value) {
                  return { name: "BlackNA", value };
                };
                var peg$f20 = function(value) {
                  return { name: "WhiteType", value };
                };
                var peg$f21 = function(value) {
                  return { name: "BlackType", value };
                };
                var peg$f22 = function(value) {
                  return { name: "White", value };
                };
                var peg$f23 = function(value) {
                  return { name: "Black", value };
                };
                var peg$f24 = function(value) {
                  return { name: "Result", value };
                };
                var peg$f25 = function(value) {
                  return { name: "EventDate", value };
                };
                var peg$f26 = function(value) {
                  return { name: "EventSponsor", value };
                };
                var peg$f27 = function(value) {
                  return { name: "Section", value };
                };
                var peg$f28 = function(value) {
                  return { name: "Stage", value };
                };
                var peg$f29 = function(value) {
                  return { name: "Board", value };
                };
                var peg$f30 = function(value) {
                  return { name: "Opening", value };
                };
                var peg$f31 = function(value) {
                  return { name: "Variation", value };
                };
                var peg$f32 = function(value) {
                  return { name: "SubVariation", value };
                };
                var peg$f33 = function(value) {
                  return { name: "ECO", value };
                };
                var peg$f34 = function(value) {
                  return { name: "NIC", value };
                };
                var peg$f35 = function(value) {
                  return { name: "Time", value };
                };
                var peg$f36 = function(value) {
                  return { name: "UTCTime", value };
                };
                var peg$f37 = function(value) {
                  return { name: "UTCDate", value };
                };
                var peg$f38 = function(value) {
                  return { name: "TimeControl", value };
                };
                var peg$f39 = function(value) {
                  return { name: "SetUp", value };
                };
                var peg$f40 = function(value) {
                  return { name: "FEN", value };
                };
                var peg$f41 = function(value) {
                  return { name: "Termination", value };
                };
                var peg$f42 = function(value) {
                  return { name: "Annotator", value };
                };
                var peg$f43 = function(value) {
                  return { name: "Mode", value };
                };
                var peg$f44 = function(value) {
                  return { name: "PlyCount", value };
                };
                var peg$f45 = function(value) {
                  return { name: "Variant", value };
                };
                var peg$f46 = function(value) {
                  return { name: "WhiteRatingDiff", value };
                };
                var peg$f47 = function(value) {
                  return { name: "BlackRatingDiff", value };
                };
                var peg$f48 = function(value) {
                  return { name: "WhiteFideId", value };
                };
                var peg$f49 = function(value) {
                  return { name: "BlackFideId", value };
                };
                var peg$f50 = function(value) {
                  return { name: "WhiteTeam", value };
                };
                var peg$f51 = function(value) {
                  return { name: "BlackTeam", value };
                };
                var peg$f52 = function(value) {
                  return { name: "Clock", value };
                };
                var peg$f53 = function(value) {
                  return { name: "WhiteClock", value };
                };
                var peg$f54 = function(value) {
                  return { name: "BlackClock", value };
                };
                var peg$f55 = function(a, value) {
                  addMessage({ key: a, value, message: `Format of tag: "${a}" not correct: "${value}"` });
                  return { name: a, value };
                };
                var peg$f56 = function(a, value) {
                  addMessage({ key: a, value, message: `Tag: "${a}" not known: "${value}"` });
                  return { name: a, value };
                };
                var peg$f58 = function(chars) {
                  return chars.join("");
                };
                var peg$f59 = function(stringContent) {
                  return stringContent.map((c) => c.char || c).join("");
                };
                var peg$f60 = function() {
                  return { type: "char", char: "\\" };
                };
                var peg$f61 = function() {
                  return { type: "char", char: '"' };
                };
                var peg$f62 = function(sequence) {
                  return sequence;
                };
                var peg$f63 = function(year, month, day) {
                  let val = "" + year.join("") + "." + month.join("") + "." + day.join("");
                  return { value: val, year: mi(year), month: mi(month), day: mi(day) };
                };
                var peg$f64 = function(hour, minute, second, millis) {
                  let val = hour.join("") + ":" + minute.join("") + ":" + second.join("");
                  let ms = 0;
                  if (millis) {
                    val = val + "." + millis;
                    addMessage({ message: `Unusual use of millis in time: ${val}` });
                    mi(millis);
                  }
                  return { value: val, hour: mi(hour), minute: mi(minute), second: mi(second), millis: ms };
                };
                var peg$f65 = function(millis) {
                  return millis.join("");
                };
                var peg$f66 = function(value) {
                  return value;
                };
                var peg$f67 = function(c, t) {
                  return c + "/" + t;
                };
                var peg$f68 = function(value) {
                  return value;
                };
                var peg$f69 = function(value) {
                  return value;
                };
                var peg$f70 = function(res) {
                  if (!res) {
                    addMessage({ message: "Tag TimeControl has to have a value" });
                    return "";
                  }
                  return res;
                };
                var peg$f71 = function(head, m) {
                  return m;
                };
                var peg$f72 = function(head, tail) {
                  let ret = [head].concat(tail);
                  ret.value = ret.map((ret2) => ret2.value).join(":");
                  return ret;
                };
                var peg$f73 = function(tcnqs) {
                  return tcnqs;
                };
                var peg$f74 = function() {
                  return { kind: "unknown", value: "?" };
                };
                var peg$f75 = function() {
                  return { kind: "unlimited", value: "-" };
                };
                var peg$f76 = function(moves, seconds, incr) {
                  return { kind: "movesInSecondsIncrement", moves, seconds, increment: incr, value: "" + moves + "/" + seconds + "+" + incr };
                };
                var peg$f77 = function(moves, seconds) {
                  return { kind: "movesInSeconds", moves, seconds, value: "" + moves + "/" + seconds };
                };
                var peg$f78 = function(seconds, incr) {
                  return { kind: "increment", seconds, increment: incr, value: "" + seconds + "+" + incr };
                };
                var peg$f79 = function(seconds) {
                  return { kind: "suddenDeath", seconds, value: "" + seconds };
                };
                var peg$f80 = function(seconds) {
                  return { kind: "hourglass", seconds, value: "*" + seconds };
                };
                var peg$f81 = function(res) {
                  return res;
                };
                var peg$f82 = function(res) {
                  return res;
                };
                var peg$f83 = function(res) {
                  return res;
                };
                var peg$f84 = function(res) {
                  return res;
                };
                var peg$f85 = function() {
                  return "1/2-1/2";
                };
                var peg$f86 = function(res) {
                  return res;
                };
                var peg$f87 = function(v) {
                  return v;
                };
                var peg$f88 = function() {
                  return 0;
                };
                var peg$f89 = function() {
                  addMessage({ message: 'Use "-" for an unknown value' });
                  return 0;
                };
                var peg$f90 = function(digits) {
                  return makeInteger(digits);
                };
                var peg$f91 = function(cm, mn, hm, nag, dr, ca, vari, all) {
                  var arr = all ? all : [];
                  var move3 = {};
                  move3.moveNumber = mn;
                  move3.notation = hm;
                  if (ca) {
                    move3.commentAfter = ca.comment;
                  }
                  if (cm) {
                    move3.commentMove = cm.comment;
                  }
                  if (dr) {
                    move3.drawOffer = true;
                  }
                  move3.variations = vari ? vari : [];
                  move3.nag = nag ? nag : null;
                  arr.unshift(move3);
                  move3.commentDiag = ca;
                  return arr;
                };
                var peg$f92 = function(e) {
                  return e;
                };
                var peg$f93 = function(eg) {
                  return [eg];
                };
                var peg$f94 = function(cf, c) {
                  return c;
                };
                var peg$f95 = function(cf, cfl) {
                  return merge([cf].concat(cfl));
                };
                var peg$f96 = function() {
                  return;
                };
                var peg$f97 = function(cm) {
                  return cm;
                };
                var peg$f98 = function(cm) {
                  return { comment: cm };
                };
                var peg$f99 = function(cf, ic) {
                  return ic;
                };
                var peg$f100 = function(cf, tail) {
                  return merge([{ colorFields: cf }].concat(tail[0]));
                };
                var peg$f101 = function(ca, ic) {
                  return ic;
                };
                var peg$f102 = function(ca, tail) {
                  return merge([{ colorArrows: ca }].concat(tail[0]));
                };
                var peg$f103 = function(cc, cv, ic) {
                  return ic;
                };
                var peg$f104 = function(cc, cv, tail) {
                  var ret = {};
                  ret[cc] = cv;
                  return merge([ret].concat(tail[0]));
                };
                var peg$f105 = function(cc, cv, ic) {
                  return ic;
                };
                var peg$f106 = function(cc, cv, tail) {
                  var ret = {};
                  ret[cc] = cv;
                  return merge([ret].concat(tail[0]));
                };
                var peg$f107 = function(ev, ic) {
                  return ic;
                };
                var peg$f108 = function(ev, tail) {
                  var ret = {};
                  ret["eval"] = parseFloat(ev);
                  return merge([ret].concat(tail[0]));
                };
                var peg$f109 = function(ac, val, ic) {
                  return ic;
                };
                var peg$f110 = function(ac, val, tail) {
                  var ret = {};
                  ret[ac] = val.join("");
                  return merge([ret].concat(tail[0]));
                };
                var peg$f111 = function(c, ic) {
                  return ic;
                };
                var peg$f112 = function(c, tail) {
                  if (tail.length > 0) {
                    return merge([{ comment: trimEnd(c.join("")) }].concat(trimStart(tail[0])));
                  } else {
                    return { comment: c.join("") };
                  }
                };
                var peg$f113 = function(ch) {
                  return ch;
                };
                var peg$f114 = function(ch) {
                  return ch;
                };
                var peg$f115 = function(cm) {
                  return cm.join("");
                };
                var peg$f116 = function(cf, cfl) {
                  var arr = [];
                  arr.push(cf);
                  for (var i = 0; i < cfl.length; i++) {
                    arr.push(cfl[i][2]);
                  }
                  return arr;
                };
                var peg$f117 = function(col, f) {
                  return col + f;
                };
                var peg$f118 = function(cf, cfl) {
                  var arr = [];
                  arr.push(cf);
                  for (var i = 0; i < cfl.length; i++) {
                    arr.push(cfl[i][2]);
                  }
                  return arr;
                };
                var peg$f119 = function(col, ff, ft) {
                  return col + ff + ft;
                };
                var peg$f120 = function() {
                  return "Y";
                };
                var peg$f121 = function() {
                  return "G";
                };
                var peg$f122 = function() {
                  return "R";
                };
                var peg$f123 = function() {
                  return "B";
                };
                var peg$f124 = function() {
                  return "O";
                };
                var peg$f125 = function() {
                  return "C";
                };
                var peg$f126 = function(col, row) {
                  return col + row;
                };
                var peg$f131 = function() {
                  return "clk";
                };
                var peg$f132 = function() {
                  return "egt";
                };
                var peg$f133 = function() {
                  return "emt";
                };
                var peg$f134 = function() {
                  return "mct";
                };
                var peg$f135 = function(hm, s1, s2, millis) {
                  let ret = s1;
                  if (!hm) {
                    addMessage({ message: `Hours and minutes missing` });
                  } else {
                    ret = hm + ret;
                  }
                  if (hm && (hm.match(/:/g) || []).length == 2) {
                    if (hm.search(":") == 2) {
                      addMessage({ message: `Only 1 digit for hours normally used` });
                    }
                  }
                  if (!s2) {
                    addMessage({ message: `Only 2 digit for seconds normally used` });
                  } else {
                    ret += s2;
                  }
                  if (millis) {
                    addMessage({ message: `Unusual use of millis in clock value` });
                    ret += "." + millis;
                  }
                  return ret;
                };
                var peg$f136 = function(hm, s1, s2) {
                  let ret = s1;
                  if (!hm) {
                    addMessage({ message: `Hours and minutes missing` });
                  } else {
                    ret = hm + ret;
                  }
                  if (hm && (hm.match(/:/g) || []).length == 2) {
                    if (hm.search(":") == 1) {
                      addMessage({ message: `Only 2 digits for hours normally used` });
                    }
                  }
                  if (!s2) {
                    addMessage({ message: `Only 2 digit for seconds normally used` });
                  } else {
                    ret += s2;
                  }
                  return ret;
                };
                var peg$f137 = function(hours, minutes) {
                  if (!minutes) {
                    addMessage({ message: `No hours found` });
                    return hours;
                  }
                  return hours + minutes;
                };
                var peg$f138 = function(h1, h2) {
                  let ret = h1;
                  if (h2) {
                    ret += h2 + ":";
                  } else {
                    ret += ":";
                  }
                  return ret;
                };
                var peg$f139 = function(m1, m2) {
                  let ret = m1;
                  if (m2) {
                    ret += m2 + ":";
                  } else {
                    ret += ":";
                    addMessage({ message: `Only 2 digits for minutes normally used` });
                  }
                  return ret;
                };
                var peg$f140 = function(d) {
                  return d;
                };
                var peg$f141 = function(vari, all) {
                  var arr = all ? all : [];
                  arr.unshift(vari);
                  return arr;
                };
                var peg$f142 = function(num) {
                  return num;
                };
                var peg$f143 = function(digits) {
                  return makeInteger(digits);
                };
                var peg$f144 = function() {
                  return "";
                };
                var peg$f145 = function(fig, disc, str, col, row, pr, ch) {
                  var hm = {};
                  hm.fig = fig ? fig : null;
                  hm.disc = disc ? disc : null;
                  hm.strike = str ? str : null;
                  hm.col = col;
                  hm.row = row;
                  hm.check = ch ? ch : null;
                  hm.promotion = pr;
                  hm.notation = (fig ? fig : "") + (disc ? disc : "") + (str ? str : "") + col + row + (pr ? pr : "") + (ch ? ch : "");
                  return hm;
                };
                var peg$f146 = function(fig, cols, rows, str, col, row, pr, ch) {
                  var hm = {};
                  hm.fig = fig ? fig : null;
                  hm.strike = str == "x" ? str : null;
                  hm.col = col;
                  hm.row = row;
                  hm.notation = (fig && fig !== "P" ? fig : "") + cols + rows + (str == "x" ? str : "-") + col + row + (pr ? pr : "") + (ch ? ch : "");
                  hm.check = ch ? ch : null;
                  hm.promotion = pr;
                  return hm;
                };
                var peg$f147 = function(fig, str, col, row, pr, ch) {
                  var hm = {};
                  hm.fig = fig ? fig : null;
                  hm.strike = str ? str : null;
                  hm.col = col;
                  hm.row = row;
                  hm.check = ch ? ch : null;
                  hm.promotion = pr;
                  hm.notation = (fig ? fig : "") + (str ? str : "") + col + row + (pr ? pr : "") + (ch ? ch : "");
                  return hm;
                };
                var peg$f148 = function(ch) {
                  var hm = {};
                  hm.notation = "O-O-O" + (ch ? ch : "");
                  hm.check = ch ? ch : null;
                  return hm;
                };
                var peg$f149 = function(ch) {
                  var hm = {};
                  hm.notation = "O-O" + (ch ? ch : "");
                  hm.check = ch ? ch : null;
                  return hm;
                };
                var peg$f150 = function(fig, col, row) {
                  var hm = {};
                  hm.fig = fig;
                  hm.drop = true;
                  hm.col = col;
                  hm.row = row;
                  hm.notation = fig + "@" + col + row;
                  return hm;
                };
                var peg$f151 = function() {
                  var hm = {};
                  hm.notation = "Z0";
                  return hm;
                };
                var peg$f152 = function(ch) {
                  return ch[1];
                };
                var peg$f153 = function(ch) {
                  return ch[1];
                };
                var peg$f154 = function(f) {
                  return "=" + f;
                };
                var peg$f155 = function(nag, nags) {
                  var arr = nags ? nags : [];
                  arr.unshift(nag);
                  return arr;
                };
                var peg$f156 = function(num) {
                  return "$" + num;
                };
                var peg$f157 = function() {
                  return "$3";
                };
                var peg$f158 = function() {
                  return "$4";
                };
                var peg$f159 = function() {
                  return "$5";
                };
                var peg$f160 = function() {
                  return "$6";
                };
                var peg$f161 = function() {
                  return "$1";
                };
                var peg$f162 = function() {
                  return "$2";
                };
                var peg$f163 = function() {
                  return "$3";
                };
                var peg$f164 = function() {
                  return "$4";
                };
                var peg$f165 = function() {
                  return "$5";
                };
                var peg$f166 = function() {
                  return "$6";
                };
                var peg$f167 = function() {
                  return "$7";
                };
                var peg$f168 = function() {
                  return "$10";
                };
                var peg$f169 = function() {
                  return "$13";
                };
                var peg$f170 = function() {
                  return "$14";
                };
                var peg$f171 = function() {
                  return "$15";
                };
                var peg$f172 = function() {
                  return "$16";
                };
                var peg$f173 = function() {
                  return "$17";
                };
                var peg$f174 = function() {
                  return "$18";
                };
                var peg$f175 = function() {
                  return "$19";
                };
                var peg$f176 = function() {
                  return "$22";
                };
                var peg$f177 = function() {
                  return "$32";
                };
                var peg$f178 = function() {
                  return "$36";
                };
                var peg$f179 = function() {
                  return "$40";
                };
                var peg$f180 = function() {
                  return "$132";
                };
                var peg$f181 = function() {
                  return "$220";
                };
                var peg$currPos = options.peg$currPos | 0;
                var peg$savedPos = peg$currPos;
                var peg$posDetailsCache = [{ line: 1, column: 1 }];
                var peg$maxFailPos = peg$currPos;
                var peg$maxFailExpected = options.peg$maxFailExpected || [];
                var peg$silentFails = options.peg$silentFails | 0;
                var peg$result;
                if (options.startRule) {
                  if (!(options.startRule in peg$startRuleFunctions)) {
                    throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
                  }
                  peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
                }
                function location() {
                  return peg$computeLocation(peg$savedPos, peg$currPos);
                }
                function peg$literalExpectation(text, ignoreCase) {
                  return { type: "literal", text, ignoreCase };
                }
                function peg$classExpectation(parts, inverted, ignoreCase) {
                  return { type: "class", parts, inverted, ignoreCase };
                }
                function peg$anyExpectation() {
                  return { type: "any" };
                }
                function peg$endExpectation() {
                  return { type: "end" };
                }
                function peg$otherExpectation(description) {
                  return { type: "other", description };
                }
                function peg$computePosDetails(pos) {
                  var details = peg$posDetailsCache[pos];
                  var p;
                  if (details) {
                    return details;
                  } else {
                    if (pos >= peg$posDetailsCache.length) {
                      p = peg$posDetailsCache.length - 1;
                    } else {
                      p = pos;
                      while (!peg$posDetailsCache[--p]) {
                      }
                    }
                    details = peg$posDetailsCache[p];
                    details = {
                      line: details.line,
                      column: details.column
                    };
                    while (p < pos) {
                      if (input.charCodeAt(p) === 10) {
                        details.line++;
                        details.column = 1;
                      } else {
                        details.column++;
                      }
                      p++;
                    }
                    peg$posDetailsCache[pos] = details;
                    return details;
                  }
                }
                function peg$computeLocation(startPos, endPos, offset) {
                  var startPosDetails = peg$computePosDetails(startPos);
                  var endPosDetails = peg$computePosDetails(endPos);
                  var res = {
                    source: peg$source,
                    start: {
                      offset: startPos,
                      line: startPosDetails.line,
                      column: startPosDetails.column
                    },
                    end: {
                      offset: endPos,
                      line: endPosDetails.line,
                      column: endPosDetails.column
                    }
                  };
                  return res;
                }
                function peg$fail(expected) {
                  if (peg$currPos < peg$maxFailPos) {
                    return;
                  }
                  if (peg$currPos > peg$maxFailPos) {
                    peg$maxFailPos = peg$currPos;
                    peg$maxFailExpected = [];
                  }
                  peg$maxFailExpected.push(expected);
                }
                function peg$buildStructuredError(expected, found, location2) {
                  return new peg$SyntaxError2(peg$SyntaxError2.buildMessage(expected, found), expected, found, location2);
                }
                function peg$parseBOM() {
                  var s0;
                  if (input.charCodeAt(peg$currPos) === 65279) {
                    s0 = peg$c0;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e0);
                    }
                  }
                  return s0;
                }
                function peg$parsegames() {
                  var s0, s3, s4, s5, s6, s8;
                  s0 = peg$currPos;
                  peg$parseBOM();
                  peg$parsews();
                  s3 = peg$currPos;
                  s4 = peg$parsegame();
                  if (s4 !== peg$FAILED) {
                    s5 = [];
                    s6 = peg$currPos;
                    peg$parsews();
                    s8 = peg$parsegame();
                    if (s8 !== peg$FAILED) {
                      peg$savedPos = s6;
                      s6 = peg$f0(s4, s8);
                    } else {
                      peg$currPos = s6;
                      s6 = peg$FAILED;
                    }
                    while (s6 !== peg$FAILED) {
                      s5.push(s6);
                      s6 = peg$currPos;
                      peg$parsews();
                      s8 = peg$parsegame();
                      if (s8 !== peg$FAILED) {
                        peg$savedPos = s6;
                        s6 = peg$f0(s4, s8);
                      } else {
                        peg$currPos = s6;
                        s6 = peg$FAILED;
                      }
                    }
                    peg$savedPos = s3;
                    s3 = peg$f1(s4, s5);
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 === peg$FAILED) {
                    s3 = null;
                  }
                  peg$savedPos = s0;
                  s0 = peg$f2(s3);
                  return s0;
                }
                function peg$parsegame() {
                  var s0, s2, s3, s4;
                  s0 = peg$currPos;
                  peg$parseBOM();
                  s2 = peg$parsetags();
                  s3 = peg$parsecomments();
                  if (s3 === peg$FAILED) {
                    s3 = null;
                  }
                  s4 = peg$parsepgn();
                  if (s4 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f3(s2, s3, s4);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsetags() {
                  var s0, s3, s4, s5, s6, s8;
                  s0 = peg$currPos;
                  peg$parseBOM();
                  peg$parsews();
                  s3 = peg$currPos;
                  s4 = peg$parsetag();
                  if (s4 !== peg$FAILED) {
                    s5 = [];
                    s6 = peg$currPos;
                    peg$parsews();
                    s8 = peg$parsetag();
                    if (s8 !== peg$FAILED) {
                      peg$savedPos = s6;
                      s6 = peg$f4(s4, s8);
                    } else {
                      peg$currPos = s6;
                      s6 = peg$FAILED;
                    }
                    while (s6 !== peg$FAILED) {
                      s5.push(s6);
                      s6 = peg$currPos;
                      peg$parsews();
                      s8 = peg$parsetag();
                      if (s8 !== peg$FAILED) {
                        peg$savedPos = s6;
                        s6 = peg$f4(s4, s8);
                      } else {
                        peg$currPos = s6;
                        s6 = peg$FAILED;
                      }
                    }
                    peg$savedPos = s3;
                    s3 = peg$f5(s4, s5);
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 === peg$FAILED) {
                    s3 = null;
                  }
                  s4 = peg$parsews();
                  peg$savedPos = s0;
                  s0 = peg$f6(s3);
                  return s0;
                }
                function peg$parsetag() {
                  var s0, s1, s3, s5;
                  s0 = peg$currPos;
                  s1 = peg$parsebl();
                  if (s1 !== peg$FAILED) {
                    peg$parsews();
                    s3 = peg$parsetagKeyValue();
                    if (s3 !== peg$FAILED) {
                      peg$parsews();
                      s5 = peg$parsebr();
                      if (s5 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f7(s3);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsetagKeyValue() {
                  var s0, s1, s2, s3, s4;
                  s0 = peg$currPos;
                  s1 = peg$parseeventKey();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsews();
                    s3 = peg$parsestring();
                    if (s3 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f8(s3);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parsesiteKey();
                    if (s1 !== peg$FAILED) {
                      s2 = peg$parsews();
                      s3 = peg$parsestring();
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f9(s3);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parsedateKey();
                      if (s1 !== peg$FAILED) {
                        s2 = peg$parsews();
                        s3 = peg$parsedateString();
                        if (s3 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s0 = peg$f10(s3);
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parseroundKey();
                        if (s1 !== peg$FAILED) {
                          s2 = peg$parsews();
                          s3 = peg$parsestring();
                          if (s3 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f11(s3);
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          s1 = peg$parsewhiteTitleKey();
                          if (s1 !== peg$FAILED) {
                            s2 = peg$parsews();
                            s3 = peg$parsestring();
                            if (s3 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s0 = peg$f12(s3);
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parseblackTitleKey();
                            if (s1 !== peg$FAILED) {
                              s2 = peg$parsews();
                              s3 = peg$parsestring();
                              if (s3 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f13(s3);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              s1 = peg$parsewhiteEloKey();
                              if (s1 !== peg$FAILED) {
                                s2 = peg$parsews();
                                s3 = peg$parseintegerOrDashString();
                                if (s3 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s0 = peg$f14(s3);
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                              if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                s1 = peg$parseblackEloKey();
                                if (s1 !== peg$FAILED) {
                                  s2 = peg$parsews();
                                  s3 = peg$parseintegerOrDashString();
                                  if (s3 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s0 = peg$f15(s3);
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                                if (s0 === peg$FAILED) {
                                  s0 = peg$currPos;
                                  s1 = peg$parsewhiteUSCFKey();
                                  if (s1 !== peg$FAILED) {
                                    s2 = peg$parsews();
                                    s3 = peg$parseintegerString();
                                    if (s3 !== peg$FAILED) {
                                      peg$savedPos = s0;
                                      s0 = peg$f16(s3);
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    s1 = peg$parseblackUSCFKey();
                                    if (s1 !== peg$FAILED) {
                                      s2 = peg$parsews();
                                      s3 = peg$parseintegerString();
                                      if (s3 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s0 = peg$f17(s3);
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$currPos;
                                      s1 = peg$parsewhiteNAKey();
                                      if (s1 !== peg$FAILED) {
                                        s2 = peg$parsews();
                                        s3 = peg$parsestring();
                                        if (s3 !== peg$FAILED) {
                                          peg$savedPos = s0;
                                          s0 = peg$f18(s3);
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$FAILED;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                      }
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        s1 = peg$parseblackNAKey();
                                        if (s1 !== peg$FAILED) {
                                          s2 = peg$parsews();
                                          s3 = peg$parsestring();
                                          if (s3 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s0 = peg$f19(s3);
                                          } else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                          }
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$FAILED;
                                        }
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$currPos;
                                          s1 = peg$parsewhiteTypeKey();
                                          if (s1 !== peg$FAILED) {
                                            s2 = peg$parsews();
                                            s3 = peg$parsestring();
                                            if (s3 !== peg$FAILED) {
                                              peg$savedPos = s0;
                                              s0 = peg$f20(s3);
                                            } else {
                                              peg$currPos = s0;
                                              s0 = peg$FAILED;
                                            }
                                          } else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                          }
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            s1 = peg$parseblackTypeKey();
                                            if (s1 !== peg$FAILED) {
                                              s2 = peg$parsews();
                                              s3 = peg$parsestring();
                                              if (s3 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s0 = peg$f21(s3);
                                              } else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                              }
                                            } else {
                                              peg$currPos = s0;
                                              s0 = peg$FAILED;
                                            }
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$currPos;
                                              s1 = peg$parsewhiteKey();
                                              if (s1 !== peg$FAILED) {
                                                s2 = peg$parsews();
                                                s3 = peg$parsestring();
                                                if (s3 !== peg$FAILED) {
                                                  peg$savedPos = s0;
                                                  s0 = peg$f22(s3);
                                                } else {
                                                  peg$currPos = s0;
                                                  s0 = peg$FAILED;
                                                }
                                              } else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                              }
                                              if (s0 === peg$FAILED) {
                                                s0 = peg$currPos;
                                                s1 = peg$parseblackKey();
                                                if (s1 !== peg$FAILED) {
                                                  s2 = peg$parsews();
                                                  s3 = peg$parsestring();
                                                  if (s3 !== peg$FAILED) {
                                                    peg$savedPos = s0;
                                                    s0 = peg$f23(s3);
                                                  } else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                  }
                                                } else {
                                                  peg$currPos = s0;
                                                  s0 = peg$FAILED;
                                                }
                                                if (s0 === peg$FAILED) {
                                                  s0 = peg$currPos;
                                                  s1 = peg$parseresultKey();
                                                  if (s1 !== peg$FAILED) {
                                                    s2 = peg$parsews();
                                                    s3 = peg$parseresult();
                                                    if (s3 !== peg$FAILED) {
                                                      peg$savedPos = s0;
                                                      s0 = peg$f24(s3);
                                                    } else {
                                                      peg$currPos = s0;
                                                      s0 = peg$FAILED;
                                                    }
                                                  } else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                  }
                                                  if (s0 === peg$FAILED) {
                                                    s0 = peg$currPos;
                                                    s1 = peg$parseeventDateKey();
                                                    if (s1 !== peg$FAILED) {
                                                      s2 = peg$parsews();
                                                      s3 = peg$parsedateString();
                                                      if (s3 !== peg$FAILED) {
                                                        peg$savedPos = s0;
                                                        s0 = peg$f25(s3);
                                                      } else {
                                                        peg$currPos = s0;
                                                        s0 = peg$FAILED;
                                                      }
                                                    } else {
                                                      peg$currPos = s0;
                                                      s0 = peg$FAILED;
                                                    }
                                                    if (s0 === peg$FAILED) {
                                                      s0 = peg$currPos;
                                                      s1 = peg$parseeventSponsorKey();
                                                      if (s1 !== peg$FAILED) {
                                                        s2 = peg$parsews();
                                                        s3 = peg$parsestring();
                                                        if (s3 !== peg$FAILED) {
                                                          peg$savedPos = s0;
                                                          s0 = peg$f26(s3);
                                                        } else {
                                                          peg$currPos = s0;
                                                          s0 = peg$FAILED;
                                                        }
                                                      } else {
                                                        peg$currPos = s0;
                                                        s0 = peg$FAILED;
                                                      }
                                                      if (s0 === peg$FAILED) {
                                                        s0 = peg$currPos;
                                                        s1 = peg$parsesectionKey();
                                                        if (s1 !== peg$FAILED) {
                                                          s2 = peg$parsews();
                                                          s3 = peg$parsestring();
                                                          if (s3 !== peg$FAILED) {
                                                            peg$savedPos = s0;
                                                            s0 = peg$f27(s3);
                                                          } else {
                                                            peg$currPos = s0;
                                                            s0 = peg$FAILED;
                                                          }
                                                        } else {
                                                          peg$currPos = s0;
                                                          s0 = peg$FAILED;
                                                        }
                                                        if (s0 === peg$FAILED) {
                                                          s0 = peg$currPos;
                                                          s1 = peg$parsestageKey();
                                                          if (s1 !== peg$FAILED) {
                                                            s2 = peg$parsews();
                                                            s3 = peg$parsestring();
                                                            if (s3 !== peg$FAILED) {
                                                              peg$savedPos = s0;
                                                              s0 = peg$f28(s3);
                                                            } else {
                                                              peg$currPos = s0;
                                                              s0 = peg$FAILED;
                                                            }
                                                          } else {
                                                            peg$currPos = s0;
                                                            s0 = peg$FAILED;
                                                          }
                                                          if (s0 === peg$FAILED) {
                                                            s0 = peg$currPos;
                                                            s1 = peg$parseboardKey();
                                                            if (s1 !== peg$FAILED) {
                                                              s2 = peg$parsews();
                                                              s3 = peg$parseintegerString();
                                                              if (s3 !== peg$FAILED) {
                                                                peg$savedPos = s0;
                                                                s0 = peg$f29(s3);
                                                              } else {
                                                                peg$currPos = s0;
                                                                s0 = peg$FAILED;
                                                              }
                                                            } else {
                                                              peg$currPos = s0;
                                                              s0 = peg$FAILED;
                                                            }
                                                            if (s0 === peg$FAILED) {
                                                              s0 = peg$currPos;
                                                              s1 = peg$parseopeningKey();
                                                              if (s1 !== peg$FAILED) {
                                                                s2 = peg$parsews();
                                                                s3 = peg$parsestring();
                                                                if (s3 !== peg$FAILED) {
                                                                  peg$savedPos = s0;
                                                                  s0 = peg$f30(s3);
                                                                } else {
                                                                  peg$currPos = s0;
                                                                  s0 = peg$FAILED;
                                                                }
                                                              } else {
                                                                peg$currPos = s0;
                                                                s0 = peg$FAILED;
                                                              }
                                                              if (s0 === peg$FAILED) {
                                                                s0 = peg$currPos;
                                                                s1 = peg$parsevariationKey();
                                                                if (s1 !== peg$FAILED) {
                                                                  s2 = peg$parsews();
                                                                  s3 = peg$parsestring();
                                                                  if (s3 !== peg$FAILED) {
                                                                    peg$savedPos = s0;
                                                                    s0 = peg$f31(s3);
                                                                  } else {
                                                                    peg$currPos = s0;
                                                                    s0 = peg$FAILED;
                                                                  }
                                                                } else {
                                                                  peg$currPos = s0;
                                                                  s0 = peg$FAILED;
                                                                }
                                                                if (s0 === peg$FAILED) {
                                                                  s0 = peg$currPos;
                                                                  s1 = peg$parsesubVariationKey();
                                                                  if (s1 !== peg$FAILED) {
                                                                    s2 = peg$parsews();
                                                                    s3 = peg$parsestring();
                                                                    if (s3 !== peg$FAILED) {
                                                                      peg$savedPos = s0;
                                                                      s0 = peg$f32(s3);
                                                                    } else {
                                                                      peg$currPos = s0;
                                                                      s0 = peg$FAILED;
                                                                    }
                                                                  } else {
                                                                    peg$currPos = s0;
                                                                    s0 = peg$FAILED;
                                                                  }
                                                                  if (s0 === peg$FAILED) {
                                                                    s0 = peg$currPos;
                                                                    s1 = peg$parseecoKey();
                                                                    if (s1 !== peg$FAILED) {
                                                                      s2 = peg$parsews();
                                                                      s3 = peg$parsestring();
                                                                      if (s3 !== peg$FAILED) {
                                                                        peg$savedPos = s0;
                                                                        s0 = peg$f33(s3);
                                                                      } else {
                                                                        peg$currPos = s0;
                                                                        s0 = peg$FAILED;
                                                                      }
                                                                    } else {
                                                                      peg$currPos = s0;
                                                                      s0 = peg$FAILED;
                                                                    }
                                                                    if (s0 === peg$FAILED) {
                                                                      s0 = peg$currPos;
                                                                      s1 = peg$parsenicKey();
                                                                      if (s1 !== peg$FAILED) {
                                                                        s2 = peg$parsews();
                                                                        s3 = peg$parsestring();
                                                                        if (s3 !== peg$FAILED) {
                                                                          peg$savedPos = s0;
                                                                          s0 = peg$f34(s3);
                                                                        } else {
                                                                          peg$currPos = s0;
                                                                          s0 = peg$FAILED;
                                                                        }
                                                                      } else {
                                                                        peg$currPos = s0;
                                                                        s0 = peg$FAILED;
                                                                      }
                                                                      if (s0 === peg$FAILED) {
                                                                        s0 = peg$currPos;
                                                                        s1 = peg$parsetimeKey();
                                                                        if (s1 !== peg$FAILED) {
                                                                          s2 = peg$parsews();
                                                                          s3 = peg$parsetimeString();
                                                                          if (s3 !== peg$FAILED) {
                                                                            peg$savedPos = s0;
                                                                            s0 = peg$f35(s3);
                                                                          } else {
                                                                            peg$currPos = s0;
                                                                            s0 = peg$FAILED;
                                                                          }
                                                                        } else {
                                                                          peg$currPos = s0;
                                                                          s0 = peg$FAILED;
                                                                        }
                                                                        if (s0 === peg$FAILED) {
                                                                          s0 = peg$currPos;
                                                                          s1 = peg$parseutcTimeKey();
                                                                          if (s1 !== peg$FAILED) {
                                                                            s2 = peg$parsews();
                                                                            s3 = peg$parsetimeString();
                                                                            if (s3 !== peg$FAILED) {
                                                                              peg$savedPos = s0;
                                                                              s0 = peg$f36(s3);
                                                                            } else {
                                                                              peg$currPos = s0;
                                                                              s0 = peg$FAILED;
                                                                            }
                                                                          } else {
                                                                            peg$currPos = s0;
                                                                            s0 = peg$FAILED;
                                                                          }
                                                                          if (s0 === peg$FAILED) {
                                                                            s0 = peg$currPos;
                                                                            s1 = peg$parseutcDateKey();
                                                                            if (s1 !== peg$FAILED) {
                                                                              s2 = peg$parsews();
                                                                              s3 = peg$parsedateString();
                                                                              if (s3 !== peg$FAILED) {
                                                                                peg$savedPos = s0;
                                                                                s0 = peg$f37(s3);
                                                                              } else {
                                                                                peg$currPos = s0;
                                                                                s0 = peg$FAILED;
                                                                              }
                                                                            } else {
                                                                              peg$currPos = s0;
                                                                              s0 = peg$FAILED;
                                                                            }
                                                                            if (s0 === peg$FAILED) {
                                                                              s0 = peg$currPos;
                                                                              s1 = peg$parsetimeControlKey();
                                                                              if (s1 !== peg$FAILED) {
                                                                                s2 = peg$parsews();
                                                                                s3 = peg$parsetimeControl();
                                                                                if (s3 !== peg$FAILED) {
                                                                                  peg$savedPos = s0;
                                                                                  s0 = peg$f38(s3);
                                                                                } else {
                                                                                  peg$currPos = s0;
                                                                                  s0 = peg$FAILED;
                                                                                }
                                                                              } else {
                                                                                peg$currPos = s0;
                                                                                s0 = peg$FAILED;
                                                                              }
                                                                              if (s0 === peg$FAILED) {
                                                                                s0 = peg$currPos;
                                                                                s1 = peg$parsesetUpKey();
                                                                                if (s1 !== peg$FAILED) {
                                                                                  s2 = peg$parsews();
                                                                                  s3 = peg$parsestring();
                                                                                  if (s3 !== peg$FAILED) {
                                                                                    peg$savedPos = s0;
                                                                                    s0 = peg$f39(s3);
                                                                                  } else {
                                                                                    peg$currPos = s0;
                                                                                    s0 = peg$FAILED;
                                                                                  }
                                                                                } else {
                                                                                  peg$currPos = s0;
                                                                                  s0 = peg$FAILED;
                                                                                }
                                                                                if (s0 === peg$FAILED) {
                                                                                  s0 = peg$currPos;
                                                                                  s1 = peg$parsefenKey();
                                                                                  if (s1 !== peg$FAILED) {
                                                                                    s2 = peg$parsews();
                                                                                    s3 = peg$parsestring();
                                                                                    if (s3 !== peg$FAILED) {
                                                                                      peg$savedPos = s0;
                                                                                      s0 = peg$f40(s3);
                                                                                    } else {
                                                                                      peg$currPos = s0;
                                                                                      s0 = peg$FAILED;
                                                                                    }
                                                                                  } else {
                                                                                    peg$currPos = s0;
                                                                                    s0 = peg$FAILED;
                                                                                  }
                                                                                  if (s0 === peg$FAILED) {
                                                                                    s0 = peg$currPos;
                                                                                    s1 = peg$parseterminationKey();
                                                                                    if (s1 !== peg$FAILED) {
                                                                                      s2 = peg$parsews();
                                                                                      s3 = peg$parsestring();
                                                                                      if (s3 !== peg$FAILED) {
                                                                                        peg$savedPos = s0;
                                                                                        s0 = peg$f41(s3);
                                                                                      } else {
                                                                                        peg$currPos = s0;
                                                                                        s0 = peg$FAILED;
                                                                                      }
                                                                                    } else {
                                                                                      peg$currPos = s0;
                                                                                      s0 = peg$FAILED;
                                                                                    }
                                                                                    if (s0 === peg$FAILED) {
                                                                                      s0 = peg$currPos;
                                                                                      s1 = peg$parseannotatorKey();
                                                                                      if (s1 !== peg$FAILED) {
                                                                                        s2 = peg$parsews();
                                                                                        s3 = peg$parsestring();
                                                                                        if (s3 !== peg$FAILED) {
                                                                                          peg$savedPos = s0;
                                                                                          s0 = peg$f42(s3);
                                                                                        } else {
                                                                                          peg$currPos = s0;
                                                                                          s0 = peg$FAILED;
                                                                                        }
                                                                                      } else {
                                                                                        peg$currPos = s0;
                                                                                        s0 = peg$FAILED;
                                                                                      }
                                                                                      if (s0 === peg$FAILED) {
                                                                                        s0 = peg$currPos;
                                                                                        s1 = peg$parsemodeKey();
                                                                                        if (s1 !== peg$FAILED) {
                                                                                          s2 = peg$parsews();
                                                                                          s3 = peg$parsestring();
                                                                                          if (s3 !== peg$FAILED) {
                                                                                            peg$savedPos = s0;
                                                                                            s0 = peg$f43(s3);
                                                                                          } else {
                                                                                            peg$currPos = s0;
                                                                                            s0 = peg$FAILED;
                                                                                          }
                                                                                        } else {
                                                                                          peg$currPos = s0;
                                                                                          s0 = peg$FAILED;
                                                                                        }
                                                                                        if (s0 === peg$FAILED) {
                                                                                          s0 = peg$currPos;
                                                                                          s1 = peg$parseplyCountKey();
                                                                                          if (s1 !== peg$FAILED) {
                                                                                            s2 = peg$parsews();
                                                                                            s3 = peg$parseintegerString();
                                                                                            if (s3 !== peg$FAILED) {
                                                                                              peg$savedPos = s0;
                                                                                              s0 = peg$f44(s3);
                                                                                            } else {
                                                                                              peg$currPos = s0;
                                                                                              s0 = peg$FAILED;
                                                                                            }
                                                                                          } else {
                                                                                            peg$currPos = s0;
                                                                                            s0 = peg$FAILED;
                                                                                          }
                                                                                          if (s0 === peg$FAILED) {
                                                                                            s0 = peg$currPos;
                                                                                            s1 = peg$parsevariantKey();
                                                                                            if (s1 !== peg$FAILED) {
                                                                                              s2 = peg$parsews();
                                                                                              s3 = peg$parsestring();
                                                                                              if (s3 !== peg$FAILED) {
                                                                                                peg$savedPos = s0;
                                                                                                s0 = peg$f45(s3);
                                                                                              } else {
                                                                                                peg$currPos = s0;
                                                                                                s0 = peg$FAILED;
                                                                                              }
                                                                                            } else {
                                                                                              peg$currPos = s0;
                                                                                              s0 = peg$FAILED;
                                                                                            }
                                                                                            if (s0 === peg$FAILED) {
                                                                                              s0 = peg$currPos;
                                                                                              s1 = peg$parsewhiteRatingDiffKey();
                                                                                              if (s1 !== peg$FAILED) {
                                                                                                s2 = peg$parsews();
                                                                                                s3 = peg$parsestring();
                                                                                                if (s3 !== peg$FAILED) {
                                                                                                  peg$savedPos = s0;
                                                                                                  s0 = peg$f46(s3);
                                                                                                } else {
                                                                                                  peg$currPos = s0;
                                                                                                  s0 = peg$FAILED;
                                                                                                }
                                                                                              } else {
                                                                                                peg$currPos = s0;
                                                                                                s0 = peg$FAILED;
                                                                                              }
                                                                                              if (s0 === peg$FAILED) {
                                                                                                s0 = peg$currPos;
                                                                                                s1 = peg$parseblackRatingDiffKey();
                                                                                                if (s1 !== peg$FAILED) {
                                                                                                  s2 = peg$parsews();
                                                                                                  s3 = peg$parsestring();
                                                                                                  if (s3 !== peg$FAILED) {
                                                                                                    peg$savedPos = s0;
                                                                                                    s0 = peg$f47(s3);
                                                                                                  } else {
                                                                                                    peg$currPos = s0;
                                                                                                    s0 = peg$FAILED;
                                                                                                  }
                                                                                                } else {
                                                                                                  peg$currPos = s0;
                                                                                                  s0 = peg$FAILED;
                                                                                                }
                                                                                                if (s0 === peg$FAILED) {
                                                                                                  s0 = peg$currPos;
                                                                                                  s1 = peg$parsewhiteFideIdKey();
                                                                                                  if (s1 !== peg$FAILED) {
                                                                                                    s2 = peg$parsews();
                                                                                                    s3 = peg$parsestring();
                                                                                                    if (s3 !== peg$FAILED) {
                                                                                                      peg$savedPos = s0;
                                                                                                      s0 = peg$f48(s3);
                                                                                                    } else {
                                                                                                      peg$currPos = s0;
                                                                                                      s0 = peg$FAILED;
                                                                                                    }
                                                                                                  } else {
                                                                                                    peg$currPos = s0;
                                                                                                    s0 = peg$FAILED;
                                                                                                  }
                                                                                                  if (s0 === peg$FAILED) {
                                                                                                    s0 = peg$currPos;
                                                                                                    s1 = peg$parseblackFideIdKey();
                                                                                                    if (s1 !== peg$FAILED) {
                                                                                                      s2 = peg$parsews();
                                                                                                      s3 = peg$parsestring();
                                                                                                      if (s3 !== peg$FAILED) {
                                                                                                        peg$savedPos = s0;
                                                                                                        s0 = peg$f49(s3);
                                                                                                      } else {
                                                                                                        peg$currPos = s0;
                                                                                                        s0 = peg$FAILED;
                                                                                                      }
                                                                                                    } else {
                                                                                                      peg$currPos = s0;
                                                                                                      s0 = peg$FAILED;
                                                                                                    }
                                                                                                    if (s0 === peg$FAILED) {
                                                                                                      s0 = peg$currPos;
                                                                                                      s1 = peg$parsewhiteTeamKey();
                                                                                                      if (s1 !== peg$FAILED) {
                                                                                                        s2 = peg$parsews();
                                                                                                        s3 = peg$parsestring();
                                                                                                        if (s3 !== peg$FAILED) {
                                                                                                          peg$savedPos = s0;
                                                                                                          s0 = peg$f50(s3);
                                                                                                        } else {
                                                                                                          peg$currPos = s0;
                                                                                                          s0 = peg$FAILED;
                                                                                                        }
                                                                                                      } else {
                                                                                                        peg$currPos = s0;
                                                                                                        s0 = peg$FAILED;
                                                                                                      }
                                                                                                      if (s0 === peg$FAILED) {
                                                                                                        s0 = peg$currPos;
                                                                                                        s1 = peg$parseblackTeamKey();
                                                                                                        if (s1 !== peg$FAILED) {
                                                                                                          s2 = peg$parsews();
                                                                                                          s3 = peg$parsestring();
                                                                                                          if (s3 !== peg$FAILED) {
                                                                                                            peg$savedPos = s0;
                                                                                                            s0 = peg$f51(s3);
                                                                                                          } else {
                                                                                                            peg$currPos = s0;
                                                                                                            s0 = peg$FAILED;
                                                                                                          }
                                                                                                        } else {
                                                                                                          peg$currPos = s0;
                                                                                                          s0 = peg$FAILED;
                                                                                                        }
                                                                                                        if (s0 === peg$FAILED) {
                                                                                                          s0 = peg$currPos;
                                                                                                          s1 = peg$parseclockKey();
                                                                                                          if (s1 !== peg$FAILED) {
                                                                                                            s2 = peg$parsews();
                                                                                                            s3 = peg$parsecolorClockTimeQ();
                                                                                                            if (s3 !== peg$FAILED) {
                                                                                                              peg$savedPos = s0;
                                                                                                              s0 = peg$f52(s3);
                                                                                                            } else {
                                                                                                              peg$currPos = s0;
                                                                                                              s0 = peg$FAILED;
                                                                                                            }
                                                                                                          } else {
                                                                                                            peg$currPos = s0;
                                                                                                            s0 = peg$FAILED;
                                                                                                          }
                                                                                                          if (s0 === peg$FAILED) {
                                                                                                            s0 = peg$currPos;
                                                                                                            s1 = peg$parsewhiteClockKey();
                                                                                                            if (s1 !== peg$FAILED) {
                                                                                                              s2 = peg$parsews();
                                                                                                              s3 = peg$parseclockTimeQ();
                                                                                                              if (s3 !== peg$FAILED) {
                                                                                                                peg$savedPos = s0;
                                                                                                                s0 = peg$f53(s3);
                                                                                                              } else {
                                                                                                                peg$currPos = s0;
                                                                                                                s0 = peg$FAILED;
                                                                                                              }
                                                                                                            } else {
                                                                                                              peg$currPos = s0;
                                                                                                              s0 = peg$FAILED;
                                                                                                            }
                                                                                                            if (s0 === peg$FAILED) {
                                                                                                              s0 = peg$currPos;
                                                                                                              s1 = peg$parseblackClockKey();
                                                                                                              if (s1 !== peg$FAILED) {
                                                                                                                s2 = peg$parsews();
                                                                                                                s3 = peg$parseclockTimeQ();
                                                                                                                if (s3 !== peg$FAILED) {
                                                                                                                  peg$savedPos = s0;
                                                                                                                  s0 = peg$f54(s3);
                                                                                                                } else {
                                                                                                                  peg$currPos = s0;
                                                                                                                  s0 = peg$FAILED;
                                                                                                                }
                                                                                                              } else {
                                                                                                                peg$currPos = s0;
                                                                                                                s0 = peg$FAILED;
                                                                                                              }
                                                                                                              if (s0 === peg$FAILED) {
                                                                                                                s0 = peg$currPos;
                                                                                                                s1 = peg$currPos;
                                                                                                                peg$silentFails++;
                                                                                                                s2 = peg$parsevalidatedKey();
                                                                                                                peg$silentFails--;
                                                                                                                if (s2 !== peg$FAILED) {
                                                                                                                  peg$currPos = s1;
                                                                                                                  s1 = void 0;
                                                                                                                } else {
                                                                                                                  s1 = peg$FAILED;
                                                                                                                }
                                                                                                                if (s1 !== peg$FAILED) {
                                                                                                                  s2 = peg$parsestringNoQuot();
                                                                                                                  s3 = peg$parsews();
                                                                                                                  s4 = peg$parsestring();
                                                                                                                  if (s4 !== peg$FAILED) {
                                                                                                                    peg$savedPos = s0;
                                                                                                                    s0 = peg$f55(s2, s4);
                                                                                                                  } else {
                                                                                                                    peg$currPos = s0;
                                                                                                                    s0 = peg$FAILED;
                                                                                                                  }
                                                                                                                } else {
                                                                                                                  peg$currPos = s0;
                                                                                                                  s0 = peg$FAILED;
                                                                                                                }
                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                  s0 = peg$currPos;
                                                                                                                  s1 = peg$currPos;
                                                                                                                  peg$silentFails++;
                                                                                                                  s2 = peg$parsevalidatedKey();
                                                                                                                  peg$silentFails--;
                                                                                                                  if (s2 === peg$FAILED) {
                                                                                                                    s1 = void 0;
                                                                                                                  } else {
                                                                                                                    peg$currPos = s1;
                                                                                                                    s1 = peg$FAILED;
                                                                                                                  }
                                                                                                                  if (s1 !== peg$FAILED) {
                                                                                                                    s2 = peg$parsestringNoQuot();
                                                                                                                    s3 = peg$parsews();
                                                                                                                    s4 = peg$parsestring();
                                                                                                                    if (s4 !== peg$FAILED) {
                                                                                                                      peg$savedPos = s0;
                                                                                                                      s0 = peg$f56(s2, s4);
                                                                                                                    } else {
                                                                                                                      peg$currPos = s0;
                                                                                                                      s0 = peg$FAILED;
                                                                                                                    }
                                                                                                                  } else {
                                                                                                                    peg$currPos = s0;
                                                                                                                    s0 = peg$FAILED;
                                                                                                                  }
                                                                                                                }
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        }
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsevalidatedKey() {
                  var s0;
                  s0 = peg$parsedateKey();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parsewhiteEloKey();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parseblackEloKey();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parsewhiteUSCFKey();
                        if (s0 === peg$FAILED) {
                          s0 = peg$parseblackUSCFKey();
                          if (s0 === peg$FAILED) {
                            s0 = peg$parseresultKey();
                            if (s0 === peg$FAILED) {
                              s0 = peg$parseeventDateKey();
                              if (s0 === peg$FAILED) {
                                s0 = peg$parseboardKey();
                                if (s0 === peg$FAILED) {
                                  s0 = peg$parsetimeKey();
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$parseutcTimeKey();
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$parseutcDateKey();
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$parsetimeControlKey();
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$parseplyCountKey();
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$parseclockKey();
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$parsewhiteClockKey();
                                              if (s0 === peg$FAILED) {
                                                s0 = peg$parseblackClockKey();
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseeventKey() {
                  var s0;
                  if (input.substr(peg$currPos, 5) === peg$c1) {
                    s0 = peg$c1;
                    peg$currPos += 5;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e1);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 5) === peg$c2) {
                      s0 = peg$c2;
                      peg$currPos += 5;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e2);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsesiteKey() {
                  var s0;
                  if (input.substr(peg$currPos, 4) === peg$c3) {
                    s0 = peg$c3;
                    peg$currPos += 4;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e3);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 4) === peg$c4) {
                      s0 = peg$c4;
                      peg$currPos += 4;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e4);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsedateKey() {
                  var s0;
                  if (input.substr(peg$currPos, 4) === peg$c5) {
                    s0 = peg$c5;
                    peg$currPos += 4;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e5);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 4) === peg$c6) {
                      s0 = peg$c6;
                      peg$currPos += 4;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e6);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseroundKey() {
                  var s0;
                  if (input.substr(peg$currPos, 5) === peg$c7) {
                    s0 = peg$c7;
                    peg$currPos += 5;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e7);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 5) === peg$c8) {
                      s0 = peg$c8;
                      peg$currPos += 5;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e8);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsewhiteKey() {
                  var s0;
                  if (input.substr(peg$currPos, 5) === peg$c9) {
                    s0 = peg$c9;
                    peg$currPos += 5;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e9);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 5) === peg$c10) {
                      s0 = peg$c10;
                      peg$currPos += 5;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e10);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseblackKey() {
                  var s0;
                  if (input.substr(peg$currPos, 5) === peg$c11) {
                    s0 = peg$c11;
                    peg$currPos += 5;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e11);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 5) === peg$c12) {
                      s0 = peg$c12;
                      peg$currPos += 5;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e12);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseresultKey() {
                  var s0;
                  if (input.substr(peg$currPos, 6) === peg$c13) {
                    s0 = peg$c13;
                    peg$currPos += 6;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e13);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 6) === peg$c14) {
                      s0 = peg$c14;
                      peg$currPos += 6;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e14);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsewhiteTitleKey() {
                  var s0;
                  if (input.substr(peg$currPos, 10) === peg$c15) {
                    s0 = peg$c15;
                    peg$currPos += 10;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e15);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 10) === peg$c16) {
                      s0 = peg$c16;
                      peg$currPos += 10;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e16);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 10) === peg$c17) {
                        s0 = peg$c17;
                        peg$currPos += 10;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e17);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 10) === peg$c18) {
                          s0 = peg$c18;
                          peg$currPos += 10;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e18);
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseblackTitleKey() {
                  var s0;
                  if (input.substr(peg$currPos, 10) === peg$c19) {
                    s0 = peg$c19;
                    peg$currPos += 10;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e19);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 10) === peg$c20) {
                      s0 = peg$c20;
                      peg$currPos += 10;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e20);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 10) === peg$c21) {
                        s0 = peg$c21;
                        peg$currPos += 10;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e21);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 10) === peg$c22) {
                          s0 = peg$c22;
                          peg$currPos += 10;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e22);
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsewhiteEloKey() {
                  var s0;
                  if (input.substr(peg$currPos, 8) === peg$c23) {
                    s0 = peg$c23;
                    peg$currPos += 8;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e23);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 8) === peg$c24) {
                      s0 = peg$c24;
                      peg$currPos += 8;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e24);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 8) === peg$c25) {
                        s0 = peg$c25;
                        peg$currPos += 8;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e25);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 8) === peg$c26) {
                          s0 = peg$c26;
                          peg$currPos += 8;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e26);
                          }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 8) === peg$c27) {
                            s0 = peg$c27;
                            peg$currPos += 8;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e27);
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseblackEloKey() {
                  var s0;
                  if (input.substr(peg$currPos, 8) === peg$c28) {
                    s0 = peg$c28;
                    peg$currPos += 8;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e28);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 8) === peg$c29) {
                      s0 = peg$c29;
                      peg$currPos += 8;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e29);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 8) === peg$c30) {
                        s0 = peg$c30;
                        peg$currPos += 8;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e30);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 8) === peg$c31) {
                          s0 = peg$c31;
                          peg$currPos += 8;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e31);
                          }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 8) === peg$c32) {
                            s0 = peg$c32;
                            peg$currPos += 8;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e32);
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsewhiteUSCFKey() {
                  var s0;
                  if (input.substr(peg$currPos, 9) === peg$c33) {
                    s0 = peg$c33;
                    peg$currPos += 9;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e33);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 9) === peg$c34) {
                      s0 = peg$c34;
                      peg$currPos += 9;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e34);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 9) === peg$c35) {
                        s0 = peg$c35;
                        peg$currPos += 9;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e35);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 9) === peg$c36) {
                          s0 = peg$c36;
                          peg$currPos += 9;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e36);
                          }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 9) === peg$c37) {
                            s0 = peg$c37;
                            peg$currPos += 9;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e37);
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseblackUSCFKey() {
                  var s0;
                  if (input.substr(peg$currPos, 9) === peg$c38) {
                    s0 = peg$c38;
                    peg$currPos += 9;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e38);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 9) === peg$c39) {
                      s0 = peg$c39;
                      peg$currPos += 9;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e39);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 9) === peg$c40) {
                        s0 = peg$c40;
                        peg$currPos += 9;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e40);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 9) === peg$c41) {
                          s0 = peg$c41;
                          peg$currPos += 9;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e41);
                          }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 9) === peg$c42) {
                            s0 = peg$c42;
                            peg$currPos += 9;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e42);
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsewhiteNAKey() {
                  var s0;
                  if (input.substr(peg$currPos, 7) === peg$c43) {
                    s0 = peg$c43;
                    peg$currPos += 7;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e43);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 7) === peg$c44) {
                      s0 = peg$c44;
                      peg$currPos += 7;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e44);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 7) === peg$c45) {
                        s0 = peg$c45;
                        peg$currPos += 7;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e45);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7) === peg$c46) {
                          s0 = peg$c46;
                          peg$currPos += 7;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e46);
                          }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 7) === peg$c47) {
                            s0 = peg$c47;
                            peg$currPos += 7;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e47);
                            }
                          }
                          if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 7) === peg$c48) {
                              s0 = peg$c48;
                              peg$currPos += 7;
                            } else {
                              s0 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e48);
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseblackNAKey() {
                  var s0;
                  if (input.substr(peg$currPos, 7) === peg$c49) {
                    s0 = peg$c49;
                    peg$currPos += 7;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e49);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 7) === peg$c50) {
                      s0 = peg$c50;
                      peg$currPos += 7;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e50);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 7) === peg$c51) {
                        s0 = peg$c51;
                        peg$currPos += 7;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e51);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7) === peg$c52) {
                          s0 = peg$c52;
                          peg$currPos += 7;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e52);
                          }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 7) === peg$c53) {
                            s0 = peg$c53;
                            peg$currPos += 7;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e53);
                            }
                          }
                          if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 7) === peg$c54) {
                              s0 = peg$c54;
                              peg$currPos += 7;
                            } else {
                              s0 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e54);
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsewhiteTypeKey() {
                  var s0;
                  if (input.substr(peg$currPos, 9) === peg$c55) {
                    s0 = peg$c55;
                    peg$currPos += 9;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e55);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 9) === peg$c56) {
                      s0 = peg$c56;
                      peg$currPos += 9;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e56);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 9) === peg$c57) {
                        s0 = peg$c57;
                        peg$currPos += 9;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e57);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 9) === peg$c58) {
                          s0 = peg$c58;
                          peg$currPos += 9;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e58);
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseblackTypeKey() {
                  var s0;
                  if (input.substr(peg$currPos, 9) === peg$c59) {
                    s0 = peg$c59;
                    peg$currPos += 9;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e59);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 9) === peg$c60) {
                      s0 = peg$c60;
                      peg$currPos += 9;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e60);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 9) === peg$c61) {
                        s0 = peg$c61;
                        peg$currPos += 9;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e61);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 9) === peg$c62) {
                          s0 = peg$c62;
                          peg$currPos += 9;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e62);
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseeventDateKey() {
                  var s0;
                  if (input.substr(peg$currPos, 9) === peg$c63) {
                    s0 = peg$c63;
                    peg$currPos += 9;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e63);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 9) === peg$c64) {
                      s0 = peg$c64;
                      peg$currPos += 9;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e64);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 9) === peg$c65) {
                        s0 = peg$c65;
                        peg$currPos += 9;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e65);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 9) === peg$c66) {
                          s0 = peg$c66;
                          peg$currPos += 9;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e66);
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseeventSponsorKey() {
                  var s0;
                  if (input.substr(peg$currPos, 12) === peg$c67) {
                    s0 = peg$c67;
                    peg$currPos += 12;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e67);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 12) === peg$c68) {
                      s0 = peg$c68;
                      peg$currPos += 12;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e68);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 12) === peg$c69) {
                        s0 = peg$c69;
                        peg$currPos += 12;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e69);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 12) === peg$c70) {
                          s0 = peg$c70;
                          peg$currPos += 12;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e70);
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsesectionKey() {
                  var s0;
                  if (input.substr(peg$currPos, 7) === peg$c71) {
                    s0 = peg$c71;
                    peg$currPos += 7;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e71);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 7) === peg$c72) {
                      s0 = peg$c72;
                      peg$currPos += 7;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e72);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsestageKey() {
                  var s0;
                  if (input.substr(peg$currPos, 5) === peg$c73) {
                    s0 = peg$c73;
                    peg$currPos += 5;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e73);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 5) === peg$c74) {
                      s0 = peg$c74;
                      peg$currPos += 5;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e74);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseboardKey() {
                  var s0;
                  if (input.substr(peg$currPos, 5) === peg$c75) {
                    s0 = peg$c75;
                    peg$currPos += 5;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e75);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 5) === peg$c76) {
                      s0 = peg$c76;
                      peg$currPos += 5;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e76);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseopeningKey() {
                  var s0;
                  if (input.substr(peg$currPos, 7) === peg$c77) {
                    s0 = peg$c77;
                    peg$currPos += 7;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e77);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 7) === peg$c78) {
                      s0 = peg$c78;
                      peg$currPos += 7;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e78);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsevariationKey() {
                  var s0;
                  if (input.substr(peg$currPos, 9) === peg$c79) {
                    s0 = peg$c79;
                    peg$currPos += 9;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e79);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 9) === peg$c80) {
                      s0 = peg$c80;
                      peg$currPos += 9;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e80);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsesubVariationKey() {
                  var s0;
                  if (input.substr(peg$currPos, 12) === peg$c81) {
                    s0 = peg$c81;
                    peg$currPos += 12;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e81);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 12) === peg$c82) {
                      s0 = peg$c82;
                      peg$currPos += 12;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e82);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 12) === peg$c83) {
                        s0 = peg$c83;
                        peg$currPos += 12;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e83);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 12) === peg$c84) {
                          s0 = peg$c84;
                          peg$currPos += 12;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e84);
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseecoKey() {
                  var s0;
                  if (input.substr(peg$currPos, 3) === peg$c85) {
                    s0 = peg$c85;
                    peg$currPos += 3;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e85);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 3) === peg$c86) {
                      s0 = peg$c86;
                      peg$currPos += 3;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e86);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 3) === peg$c87) {
                        s0 = peg$c87;
                        peg$currPos += 3;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e87);
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsenicKey() {
                  var s0;
                  if (input.substr(peg$currPos, 3) === peg$c88) {
                    s0 = peg$c88;
                    peg$currPos += 3;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e88);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 3) === peg$c89) {
                      s0 = peg$c89;
                      peg$currPos += 3;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e89);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 3) === peg$c90) {
                        s0 = peg$c90;
                        peg$currPos += 3;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e90);
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsetimeKey() {
                  var s0;
                  if (input.substr(peg$currPos, 4) === peg$c91) {
                    s0 = peg$c91;
                    peg$currPos += 4;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e91);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 4) === peg$c92) {
                      s0 = peg$c92;
                      peg$currPos += 4;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e92);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseutcTimeKey() {
                  var s0;
                  if (input.substr(peg$currPos, 7) === peg$c93) {
                    s0 = peg$c93;
                    peg$currPos += 7;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e93);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 7) === peg$c94) {
                      s0 = peg$c94;
                      peg$currPos += 7;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e94);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 7) === peg$c95) {
                        s0 = peg$c95;
                        peg$currPos += 7;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e95);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7) === peg$c96) {
                          s0 = peg$c96;
                          peg$currPos += 7;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e96);
                          }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 7) === peg$c97) {
                            s0 = peg$c97;
                            peg$currPos += 7;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e97);
                            }
                          }
                          if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 7) === peg$c98) {
                              s0 = peg$c98;
                              peg$currPos += 7;
                            } else {
                              s0 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e98);
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseutcDateKey() {
                  var s0;
                  if (input.substr(peg$currPos, 7) === peg$c99) {
                    s0 = peg$c99;
                    peg$currPos += 7;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e99);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 7) === peg$c100) {
                      s0 = peg$c100;
                      peg$currPos += 7;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e100);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 7) === peg$c101) {
                        s0 = peg$c101;
                        peg$currPos += 7;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e101);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7) === peg$c102) {
                          s0 = peg$c102;
                          peg$currPos += 7;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e102);
                          }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 7) === peg$c103) {
                            s0 = peg$c103;
                            peg$currPos += 7;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e103);
                            }
                          }
                          if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 7) === peg$c104) {
                              s0 = peg$c104;
                              peg$currPos += 7;
                            } else {
                              s0 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e104);
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsetimeControlKey() {
                  var s0;
                  if (input.substr(peg$currPos, 11) === peg$c105) {
                    s0 = peg$c105;
                    peg$currPos += 11;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e105);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 11) === peg$c106) {
                      s0 = peg$c106;
                      peg$currPos += 11;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e106);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 11) === peg$c107) {
                        s0 = peg$c107;
                        peg$currPos += 11;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e107);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 11) === peg$c108) {
                          s0 = peg$c108;
                          peg$currPos += 11;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e108);
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsesetUpKey() {
                  var s0;
                  if (input.substr(peg$currPos, 5) === peg$c109) {
                    s0 = peg$c109;
                    peg$currPos += 5;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e109);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 5) === peg$c110) {
                      s0 = peg$c110;
                      peg$currPos += 5;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e110);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 5) === peg$c111) {
                        s0 = peg$c111;
                        peg$currPos += 5;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e111);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 5) === peg$c112) {
                          s0 = peg$c112;
                          peg$currPos += 5;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e112);
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsefenKey() {
                  var s0;
                  if (input.substr(peg$currPos, 3) === peg$c113) {
                    s0 = peg$c113;
                    peg$currPos += 3;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e113);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 3) === peg$c114) {
                      s0 = peg$c114;
                      peg$currPos += 3;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e114);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 3) === peg$c115) {
                        s0 = peg$c115;
                        peg$currPos += 3;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e115);
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseterminationKey() {
                  var s0;
                  if (input.substr(peg$currPos, 11) === peg$c116) {
                    s0 = peg$c116;
                    peg$currPos += 11;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e116);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 11) === peg$c117) {
                      s0 = peg$c117;
                      peg$currPos += 11;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e117);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseannotatorKey() {
                  var s0;
                  if (input.substr(peg$currPos, 9) === peg$c118) {
                    s0 = peg$c118;
                    peg$currPos += 9;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e118);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 9) === peg$c119) {
                      s0 = peg$c119;
                      peg$currPos += 9;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e119);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsemodeKey() {
                  var s0;
                  if (input.substr(peg$currPos, 4) === peg$c120) {
                    s0 = peg$c120;
                    peg$currPos += 4;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e120);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 4) === peg$c121) {
                      s0 = peg$c121;
                      peg$currPos += 4;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e121);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseplyCountKey() {
                  var s0;
                  if (input.substr(peg$currPos, 8) === peg$c122) {
                    s0 = peg$c122;
                    peg$currPos += 8;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e122);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 8) === peg$c123) {
                      s0 = peg$c123;
                      peg$currPos += 8;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e123);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 8) === peg$c124) {
                        s0 = peg$c124;
                        peg$currPos += 8;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e124);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 8) === peg$c125) {
                          s0 = peg$c125;
                          peg$currPos += 8;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e125);
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsevariantKey() {
                  var s0;
                  if (input.substr(peg$currPos, 7) === peg$c126) {
                    s0 = peg$c126;
                    peg$currPos += 7;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e126);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 7) === peg$c127) {
                      s0 = peg$c127;
                      peg$currPos += 7;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e127);
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsewhiteRatingDiffKey() {
                  var s0;
                  if (input.substr(peg$currPos, 15) === peg$c128) {
                    s0 = peg$c128;
                    peg$currPos += 15;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e128);
                    }
                  }
                  return s0;
                }
                function peg$parseblackRatingDiffKey() {
                  var s0;
                  if (input.substr(peg$currPos, 15) === peg$c129) {
                    s0 = peg$c129;
                    peg$currPos += 15;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e129);
                    }
                  }
                  return s0;
                }
                function peg$parsewhiteFideIdKey() {
                  var s0;
                  if (input.substr(peg$currPos, 11) === peg$c130) {
                    s0 = peg$c130;
                    peg$currPos += 11;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e130);
                    }
                  }
                  return s0;
                }
                function peg$parseblackFideIdKey() {
                  var s0;
                  if (input.substr(peg$currPos, 11) === peg$c131) {
                    s0 = peg$c131;
                    peg$currPos += 11;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e131);
                    }
                  }
                  return s0;
                }
                function peg$parsewhiteTeamKey() {
                  var s0;
                  if (input.substr(peg$currPos, 9) === peg$c132) {
                    s0 = peg$c132;
                    peg$currPos += 9;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e132);
                    }
                  }
                  return s0;
                }
                function peg$parseblackTeamKey() {
                  var s0;
                  if (input.substr(peg$currPos, 9) === peg$c133) {
                    s0 = peg$c133;
                    peg$currPos += 9;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e133);
                    }
                  }
                  return s0;
                }
                function peg$parseclockKey() {
                  var s0;
                  if (input.substr(peg$currPos, 5) === peg$c134) {
                    s0 = peg$c134;
                    peg$currPos += 5;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e134);
                    }
                  }
                  return s0;
                }
                function peg$parsewhiteClockKey() {
                  var s0;
                  if (input.substr(peg$currPos, 10) === peg$c135) {
                    s0 = peg$c135;
                    peg$currPos += 10;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e135);
                    }
                  }
                  return s0;
                }
                function peg$parseblackClockKey() {
                  var s0;
                  if (input.substr(peg$currPos, 10) === peg$c136) {
                    s0 = peg$c136;
                    peg$currPos += 10;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e136);
                    }
                  }
                  return s0;
                }
                function peg$parsews() {
                  var s0, s1;
                  peg$silentFails++;
                  s0 = [];
                  s1 = input.charAt(peg$currPos);
                  if (peg$r0.test(s1)) {
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e138);
                    }
                  }
                  while (s1 !== peg$FAILED) {
                    s0.push(s1);
                    s1 = input.charAt(peg$currPos);
                    if (peg$r0.test(s1)) {
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e138);
                      }
                    }
                  }
                  peg$silentFails--;
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e137);
                  }
                  return s0;
                }
                function peg$parsewsp() {
                  var s0, s1;
                  s0 = [];
                  s1 = input.charAt(peg$currPos);
                  if (peg$r0.test(s1)) {
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e138);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    while (s1 !== peg$FAILED) {
                      s0.push(s1);
                      s1 = input.charAt(peg$currPos);
                      if (peg$r0.test(s1)) {
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e138);
                        }
                      }
                    }
                  } else {
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parseeol() {
                  var s0, s1;
                  s0 = [];
                  s1 = input.charAt(peg$currPos);
                  if (peg$r1.test(s1)) {
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e139);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    while (s1 !== peg$FAILED) {
                      s0.push(s1);
                      s1 = input.charAt(peg$currPos);
                      if (peg$r1.test(s1)) {
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e139);
                        }
                      }
                    }
                  } else {
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsestringNoQuot() {
                  var s0, s1, s2;
                  s0 = peg$currPos;
                  s1 = [];
                  s2 = input.charAt(peg$currPos);
                  if (peg$r2.test(s2)) {
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e141);
                    }
                  }
                  while (s2 !== peg$FAILED) {
                    s1.push(s2);
                    s2 = input.charAt(peg$currPos);
                    if (peg$r2.test(s2)) {
                      peg$currPos++;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e141);
                      }
                    }
                  }
                  peg$savedPos = s0;
                  s1 = peg$f58(s1);
                  s0 = s1;
                  return s0;
                }
                function peg$parsequotation_mark() {
                  var s0;
                  if (input.charCodeAt(peg$currPos) === 34) {
                    s0 = peg$c138;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e142);
                    }
                  }
                  return s0;
                }
                function peg$parsestring() {
                  var s0, s1, s3, s4, s5;
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 34) {
                    s1 = peg$c138;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e142);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$parse_();
                    s3 = [];
                    s4 = peg$parsestringChar();
                    while (s4 !== peg$FAILED) {
                      s3.push(s4);
                      s4 = peg$parsestringChar();
                    }
                    s4 = peg$parse_();
                    if (input.charCodeAt(peg$currPos) === 34) {
                      s5 = peg$c138;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e142);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f59(s3);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsestringChar() {
                  var s0, s1, s2, s3;
                  s0 = input.charAt(peg$currPos);
                  if (peg$r3.test(s0)) {
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e143);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parseEscape();
                    if (s1 !== peg$FAILED) {
                      s2 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 92) {
                        s3 = peg$c139;
                        peg$currPos++;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e144);
                        }
                      }
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s2;
                        s3 = peg$f60();
                      }
                      s2 = s3;
                      if (s2 === peg$FAILED) {
                        s2 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 34) {
                          s3 = peg$c138;
                          peg$currPos++;
                        } else {
                          s3 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e142);
                          }
                        }
                        if (s3 !== peg$FAILED) {
                          peg$savedPos = s2;
                          s3 = peg$f61();
                        }
                        s2 = s3;
                      }
                      if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f62(s2);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  }
                  return s0;
                }
                function peg$parse_() {
                  var s0, s1;
                  peg$silentFails++;
                  s0 = [];
                  s1 = input.charAt(peg$currPos);
                  if (peg$r0.test(s1)) {
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e138);
                    }
                  }
                  while (s1 !== peg$FAILED) {
                    s0.push(s1);
                    s1 = input.charAt(peg$currPos);
                    if (peg$r0.test(s1)) {
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e138);
                      }
                    }
                  }
                  peg$silentFails--;
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e137);
                  }
                  return s0;
                }
                function peg$parseEscape() {
                  var s0;
                  if (input.charCodeAt(peg$currPos) === 92) {
                    s0 = peg$c139;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e144);
                    }
                  }
                  return s0;
                }
                function peg$parsedateString() {
                  var s0, s1, s2, s3, s4, s5, s6, s7, s8;
                  s0 = peg$currPos;
                  s1 = peg$parsequotation_mark();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$currPos;
                    s3 = input.charAt(peg$currPos);
                    if (peg$r4.test(s3)) {
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e145);
                      }
                    }
                    if (s3 !== peg$FAILED) {
                      s4 = input.charAt(peg$currPos);
                      if (peg$r4.test(s4)) {
                        peg$currPos++;
                      } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e145);
                        }
                      }
                      if (s4 !== peg$FAILED) {
                        s5 = input.charAt(peg$currPos);
                        if (peg$r4.test(s5)) {
                          peg$currPos++;
                        } else {
                          s5 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e145);
                          }
                        }
                        if (s5 !== peg$FAILED) {
                          s6 = input.charAt(peg$currPos);
                          if (peg$r4.test(s6)) {
                            peg$currPos++;
                          } else {
                            s6 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e145);
                            }
                          }
                          if (s6 !== peg$FAILED) {
                            s3 = [s3, s4, s5, s6];
                            s2 = s3;
                          } else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s2;
                          s2 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s2;
                      s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 46) {
                        s3 = peg$c140;
                        peg$currPos++;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e146);
                        }
                      }
                      if (s3 !== peg$FAILED) {
                        s4 = peg$currPos;
                        s5 = input.charAt(peg$currPos);
                        if (peg$r4.test(s5)) {
                          peg$currPos++;
                        } else {
                          s5 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e145);
                          }
                        }
                        if (s5 !== peg$FAILED) {
                          s6 = input.charAt(peg$currPos);
                          if (peg$r4.test(s6)) {
                            peg$currPos++;
                          } else {
                            s6 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e145);
                            }
                          }
                          if (s6 !== peg$FAILED) {
                            s5 = [s5, s6];
                            s4 = s5;
                          } else {
                            peg$currPos = s4;
                            s4 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s4;
                          s4 = peg$FAILED;
                        }
                        if (s4 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 46) {
                            s5 = peg$c140;
                            peg$currPos++;
                          } else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e146);
                            }
                          }
                          if (s5 !== peg$FAILED) {
                            s6 = peg$currPos;
                            s7 = input.charAt(peg$currPos);
                            if (peg$r4.test(s7)) {
                              peg$currPos++;
                            } else {
                              s7 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e145);
                              }
                            }
                            if (s7 !== peg$FAILED) {
                              s8 = input.charAt(peg$currPos);
                              if (peg$r4.test(s8)) {
                                peg$currPos++;
                              } else {
                                s8 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e145);
                                }
                              }
                              if (s8 !== peg$FAILED) {
                                s7 = [s7, s8];
                                s6 = s7;
                              } else {
                                peg$currPos = s6;
                                s6 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s6;
                              s6 = peg$FAILED;
                            }
                            if (s6 !== peg$FAILED) {
                              s7 = peg$parsequotation_mark();
                              if (s7 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f63(s2, s4, s6);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsetimeString() {
                  var s0, s1, s2, s3, s4, s5, s6, s7, s8;
                  s0 = peg$currPos;
                  s1 = peg$parsequotation_mark();
                  if (s1 !== peg$FAILED) {
                    s2 = [];
                    s3 = input.charAt(peg$currPos);
                    if (peg$r5.test(s3)) {
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e147);
                      }
                    }
                    if (s3 !== peg$FAILED) {
                      while (s3 !== peg$FAILED) {
                        s2.push(s3);
                        s3 = input.charAt(peg$currPos);
                        if (peg$r5.test(s3)) {
                          peg$currPos++;
                        } else {
                          s3 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e147);
                          }
                        }
                      }
                    } else {
                      s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 58) {
                        s3 = peg$c141;
                        peg$currPos++;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e148);
                        }
                      }
                      if (s3 !== peg$FAILED) {
                        s4 = [];
                        s5 = input.charAt(peg$currPos);
                        if (peg$r5.test(s5)) {
                          peg$currPos++;
                        } else {
                          s5 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e147);
                          }
                        }
                        if (s5 !== peg$FAILED) {
                          while (s5 !== peg$FAILED) {
                            s4.push(s5);
                            s5 = input.charAt(peg$currPos);
                            if (peg$r5.test(s5)) {
                              peg$currPos++;
                            } else {
                              s5 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e147);
                              }
                            }
                          }
                        } else {
                          s4 = peg$FAILED;
                        }
                        if (s4 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 58) {
                            s5 = peg$c141;
                            peg$currPos++;
                          } else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e148);
                            }
                          }
                          if (s5 !== peg$FAILED) {
                            s6 = [];
                            s7 = input.charAt(peg$currPos);
                            if (peg$r5.test(s7)) {
                              peg$currPos++;
                            } else {
                              s7 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e147);
                              }
                            }
                            if (s7 !== peg$FAILED) {
                              while (s7 !== peg$FAILED) {
                                s6.push(s7);
                                s7 = input.charAt(peg$currPos);
                                if (peg$r5.test(s7)) {
                                  peg$currPos++;
                                } else {
                                  s7 = peg$FAILED;
                                  if (peg$silentFails === 0) {
                                    peg$fail(peg$e147);
                                  }
                                }
                              }
                            } else {
                              s6 = peg$FAILED;
                            }
                            if (s6 !== peg$FAILED) {
                              s7 = peg$parsemillis();
                              if (s7 === peg$FAILED) {
                                s7 = null;
                              }
                              s8 = peg$parsequotation_mark();
                              if (s8 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f64(s2, s4, s6, s7);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsemillis() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 46) {
                    s1 = peg$c140;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e146);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = [];
                    s3 = input.charAt(peg$currPos);
                    if (peg$r5.test(s3)) {
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e147);
                      }
                    }
                    if (s3 !== peg$FAILED) {
                      while (s3 !== peg$FAILED) {
                        s2.push(s3);
                        s3 = input.charAt(peg$currPos);
                        if (peg$r5.test(s3)) {
                          peg$currPos++;
                        } else {
                          s3 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e147);
                          }
                        }
                      }
                    } else {
                      s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f65(s2);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsecolorClockTimeQ() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsequotation_mark();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsecolorClockTime();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsequotation_mark();
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f66(s2);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsecolorClockTime() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parseclockColor();
                  if (s1 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 47) {
                      s2 = peg$c142;
                      peg$currPos++;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e149);
                      }
                    }
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parseclockTime();
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f67(s1, s3);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parseclockColor() {
                  var s0;
                  s0 = input.charAt(peg$currPos);
                  if (peg$r6.test(s0)) {
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e150);
                    }
                  }
                  return s0;
                }
                function peg$parseclockTimeQ() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsequotation_mark();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parseclockTime();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsequotation_mark();
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f68(s2);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parseclockTime() {
                  var s0, s1;
                  s0 = peg$currPos;
                  s1 = peg$parseclockValue1D();
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f69(s1);
                  }
                  s0 = s1;
                  return s0;
                }
                function peg$parsetimeControl() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsequotation_mark();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsetcnqs();
                    s3 = peg$parsequotation_mark();
                    if (s3 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f70(s2);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsetcnqs() {
                  var s0, s1, s2, s3, s4, s5, s6;
                  s0 = peg$currPos;
                  s1 = peg$currPos;
                  s2 = peg$parsetcnq();
                  if (s2 !== peg$FAILED) {
                    s3 = [];
                    s4 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 58) {
                      s5 = peg$c141;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e148);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsetcnq();
                      if (s6 !== peg$FAILED) {
                        peg$savedPos = s4;
                        s4 = peg$f71(s2, s6);
                      } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s4;
                      s4 = peg$FAILED;
                    }
                    while (s4 !== peg$FAILED) {
                      s3.push(s4);
                      s4 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 58) {
                        s5 = peg$c141;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e148);
                        }
                      }
                      if (s5 !== peg$FAILED) {
                        s6 = peg$parsetcnq();
                        if (s6 !== peg$FAILED) {
                          peg$savedPos = s4;
                          s4 = peg$f71(s2, s6);
                        } else {
                          peg$currPos = s4;
                          s4 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                      }
                    }
                    peg$savedPos = s1;
                    s1 = peg$f72(s2, s3);
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                  if (s1 === peg$FAILED) {
                    s1 = null;
                  }
                  peg$savedPos = s0;
                  s1 = peg$f73(s1);
                  s0 = s1;
                  return s0;
                }
                function peg$parsetcnq() {
                  var s0, s1, s2, s3, s4, s5;
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 63) {
                    s1 = peg$c143;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e151);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f74();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 45) {
                      s1 = peg$c144;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e152);
                      }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$f75();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parseinteger();
                      if (s1 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 47) {
                          s2 = peg$c142;
                          peg$currPos++;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e149);
                          }
                        }
                        if (s2 !== peg$FAILED) {
                          s3 = peg$parseinteger();
                          if (s3 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 43) {
                              s4 = peg$c145;
                              peg$currPos++;
                            } else {
                              s4 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e153);
                              }
                            }
                            if (s4 !== peg$FAILED) {
                              s5 = peg$parseinteger();
                              if (s5 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f76(s1, s3, s5);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parseinteger();
                        if (s1 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 47) {
                            s2 = peg$c142;
                            peg$currPos++;
                          } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e149);
                            }
                          }
                          if (s2 !== peg$FAILED) {
                            s3 = peg$parseinteger();
                            if (s3 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s0 = peg$f77(s1, s3);
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          s1 = peg$parseinteger();
                          if (s1 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 43) {
                              s2 = peg$c145;
                              peg$currPos++;
                            } else {
                              s2 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e153);
                              }
                            }
                            if (s2 !== peg$FAILED) {
                              s3 = peg$parseinteger();
                              if (s3 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f78(s1, s3);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parseinteger();
                            if (s1 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$f79(s1);
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.charCodeAt(peg$currPos) === 42) {
                                s1 = peg$c146;
                                peg$currPos++;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e154);
                                }
                              }
                              if (s1 !== peg$FAILED) {
                                s2 = peg$parseinteger();
                                if (s2 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s0 = peg$f80(s2);
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseresult() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsequotation_mark();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parseinnerResult();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsequotation_mark();
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f81(s2);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parseinnerResult() {
                  var s0, s1;
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 3) === peg$c147) {
                    s1 = peg$c147;
                    peg$currPos += 3;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e155);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f82(s1);
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 3) === peg$c148) {
                      s1 = peg$c148;
                      peg$currPos += 3;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e156);
                      }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$f83(s1);
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.substr(peg$currPos, 7) === peg$c149) {
                        s1 = peg$c149;
                        peg$currPos += 7;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e157);
                        }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f84(s1);
                      }
                      s0 = s1;
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 3) === peg$c150) {
                          s1 = peg$c150;
                          peg$currPos += 3;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e158);
                          }
                        }
                        if (s1 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$f85();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 42) {
                            s1 = peg$c146;
                            peg$currPos++;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e154);
                            }
                          }
                          if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f86(s1);
                          }
                          s0 = s1;
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseintegerOrDashString() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parseintegerString();
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f87(s1);
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parsequotation_mark();
                    if (s1 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 45) {
                        s2 = peg$c144;
                        peg$currPos++;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e152);
                        }
                      }
                      if (s2 !== peg$FAILED) {
                        s3 = peg$parsequotation_mark();
                        if (s3 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s0 = peg$f88();
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parsequotation_mark();
                      if (s1 !== peg$FAILED) {
                        s2 = peg$parsequotation_mark();
                        if (s2 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s0 = peg$f89();
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    }
                  }
                  return s0;
                }
                function peg$parseintegerString() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsequotation_mark();
                  if (s1 !== peg$FAILED) {
                    s2 = [];
                    s3 = input.charAt(peg$currPos);
                    if (peg$r5.test(s3)) {
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e147);
                      }
                    }
                    if (s3 !== peg$FAILED) {
                      while (s3 !== peg$FAILED) {
                        s2.push(s3);
                        s3 = input.charAt(peg$currPos);
                        if (peg$r5.test(s3)) {
                          peg$currPos++;
                        } else {
                          s3 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e147);
                          }
                        }
                      }
                    } else {
                      s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsequotation_mark();
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f90(s2);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsepgn() {
                  var s0, s2, s3, s5, s7, s9, s10, s12, s14, s15;
                  s0 = peg$currPos;
                  peg$parseBOM();
                  s2 = peg$parsews();
                  s3 = peg$parsecomments();
                  if (s3 === peg$FAILED) {
                    s3 = null;
                  }
                  peg$parsews();
                  s5 = peg$parsemoveNumber();
                  if (s5 === peg$FAILED) {
                    s5 = null;
                  }
                  peg$parsews();
                  s7 = peg$parsehalfMove();
                  if (s7 !== peg$FAILED) {
                    peg$parsews();
                    s9 = peg$parsenags();
                    if (s9 === peg$FAILED) {
                      s9 = null;
                    }
                    s10 = peg$parsedrawOffer();
                    if (s10 === peg$FAILED) {
                      s10 = null;
                    }
                    peg$parsews();
                    s12 = peg$parsecomments();
                    if (s12 === peg$FAILED) {
                      s12 = null;
                    }
                    peg$parsews();
                    s14 = peg$parsevariation();
                    if (s14 === peg$FAILED) {
                      s14 = null;
                    }
                    s15 = peg$parsepgn();
                    if (s15 === peg$FAILED) {
                      s15 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f91(s3, s5, s7, s9, s10, s12, s14, s15);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    peg$parsews();
                    s2 = peg$parseendGame();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsews();
                      peg$savedPos = s0;
                      s0 = peg$f92(s2);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  }
                  return s0;
                }
                function peg$parsedrawOffer() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsepl();
                  if (s1 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 61) {
                      s2 = peg$c151;
                      peg$currPos++;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e159);
                      }
                    }
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsepr();
                      if (s3 !== peg$FAILED) {
                        s1 = [s1, s2, s3];
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parseendGame() {
                  var s0, s1;
                  s0 = peg$currPos;
                  s1 = peg$parseinnerResult();
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f93(s1);
                  }
                  s0 = s1;
                  return s0;
                }
                function peg$parsecomments() {
                  var s0, s1, s2, s3, s5;
                  s0 = peg$currPos;
                  s1 = peg$parsecomment();
                  if (s1 !== peg$FAILED) {
                    s2 = [];
                    s3 = peg$currPos;
                    peg$parsews();
                    s5 = peg$parsecomment();
                    if (s5 !== peg$FAILED) {
                      peg$savedPos = s3;
                      s3 = peg$f94(s1, s5);
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                    while (s3 !== peg$FAILED) {
                      s2.push(s3);
                      s3 = peg$currPos;
                      peg$parsews();
                      s5 = peg$parsecomment();
                      if (s5 !== peg$FAILED) {
                        peg$savedPos = s3;
                        s3 = peg$f94(s1, s5);
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    }
                    peg$savedPos = s0;
                    s0 = peg$f95(s1, s2);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsecomment() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsecl();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsecr();
                    if (s2 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f96();
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parsecl();
                    if (s1 !== peg$FAILED) {
                      s2 = peg$parseinnerComment();
                      if (s2 !== peg$FAILED) {
                        s3 = peg$parsecr();
                        if (s3 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s0 = peg$f97(s2);
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parsecommentEndOfLine();
                      if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f98(s1);
                      }
                      s0 = s1;
                    }
                  }
                  return s0;
                }
                function peg$parseinnerComment() {
                  var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;
                  s0 = peg$currPos;
                  s1 = peg$parsews();
                  s2 = peg$parsebl();
                  if (s2 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 4) === peg$c152) {
                      s3 = peg$c152;
                      peg$currPos += 4;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e160);
                      }
                    }
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parsewsp();
                      if (s4 !== peg$FAILED) {
                        s5 = peg$parsecolorFields();
                        if (s5 === peg$FAILED) {
                          s5 = null;
                        }
                        s6 = peg$parsews();
                        s7 = peg$parsebr();
                        if (s7 !== peg$FAILED) {
                          s8 = peg$parsews();
                          s9 = [];
                          s10 = peg$currPos;
                          s11 = peg$parseinnerComment();
                          if (s11 !== peg$FAILED) {
                            peg$savedPos = s10;
                            s11 = peg$f99(s5, s11);
                          }
                          s10 = s11;
                          while (s10 !== peg$FAILED) {
                            s9.push(s10);
                            s10 = peg$currPos;
                            s11 = peg$parseinnerComment();
                            if (s11 !== peg$FAILED) {
                              peg$savedPos = s10;
                              s11 = peg$f99(s5, s11);
                            }
                            s10 = s11;
                          }
                          peg$savedPos = s0;
                          s0 = peg$f100(s5, s9);
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parsews();
                    s2 = peg$parsebl();
                    if (s2 !== peg$FAILED) {
                      if (input.substr(peg$currPos, 4) === peg$c153) {
                        s3 = peg$c153;
                        peg$currPos += 4;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e161);
                        }
                      }
                      if (s3 !== peg$FAILED) {
                        s4 = peg$parsewsp();
                        if (s4 !== peg$FAILED) {
                          s5 = peg$parsecolorArrows();
                          if (s5 === peg$FAILED) {
                            s5 = null;
                          }
                          s6 = peg$parsews();
                          s7 = peg$parsebr();
                          if (s7 !== peg$FAILED) {
                            s8 = peg$parsews();
                            s9 = [];
                            s10 = peg$currPos;
                            s11 = peg$parseinnerComment();
                            if (s11 !== peg$FAILED) {
                              peg$savedPos = s10;
                              s11 = peg$f101(s5, s11);
                            }
                            s10 = s11;
                            while (s10 !== peg$FAILED) {
                              s9.push(s10);
                              s10 = peg$currPos;
                              s11 = peg$parseinnerComment();
                              if (s11 !== peg$FAILED) {
                                peg$savedPos = s10;
                                s11 = peg$f101(s5, s11);
                              }
                              s10 = s11;
                            }
                            peg$savedPos = s0;
                            s0 = peg$f102(s5, s9);
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parsews();
                      s2 = peg$parsebl();
                      if (s2 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 37) {
                          s3 = peg$c154;
                          peg$currPos++;
                        } else {
                          s3 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e162);
                          }
                        }
                        if (s3 !== peg$FAILED) {
                          s4 = peg$parseclockCommand1D();
                          if (s4 !== peg$FAILED) {
                            s5 = peg$parsewsp();
                            if (s5 !== peg$FAILED) {
                              s6 = peg$parseclockValue1D();
                              if (s6 !== peg$FAILED) {
                                s7 = peg$parsews();
                                s8 = peg$parsebr();
                                if (s8 !== peg$FAILED) {
                                  s9 = peg$parsews();
                                  s10 = [];
                                  s11 = peg$currPos;
                                  s12 = peg$parseinnerComment();
                                  if (s12 !== peg$FAILED) {
                                    peg$savedPos = s11;
                                    s12 = peg$f103(s4, s6, s12);
                                  }
                                  s11 = s12;
                                  while (s11 !== peg$FAILED) {
                                    s10.push(s11);
                                    s11 = peg$currPos;
                                    s12 = peg$parseinnerComment();
                                    if (s12 !== peg$FAILED) {
                                      peg$savedPos = s11;
                                      s12 = peg$f103(s4, s6, s12);
                                    }
                                    s11 = s12;
                                  }
                                  peg$savedPos = s0;
                                  s0 = peg$f104(s4, s6, s10);
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parsews();
                        s2 = peg$parsebl();
                        if (s2 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 37) {
                            s3 = peg$c154;
                            peg$currPos++;
                          } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e162);
                            }
                          }
                          if (s3 !== peg$FAILED) {
                            s4 = peg$parseclockCommand2D();
                            if (s4 !== peg$FAILED) {
                              s5 = peg$parsewsp();
                              if (s5 !== peg$FAILED) {
                                s6 = peg$parseclockValue2D();
                                if (s6 !== peg$FAILED) {
                                  s7 = peg$parsews();
                                  s8 = peg$parsebr();
                                  if (s8 !== peg$FAILED) {
                                    s9 = peg$parsews();
                                    s10 = [];
                                    s11 = peg$currPos;
                                    s12 = peg$parseinnerComment();
                                    if (s12 !== peg$FAILED) {
                                      peg$savedPos = s11;
                                      s12 = peg$f105(s4, s6, s12);
                                    }
                                    s11 = s12;
                                    while (s11 !== peg$FAILED) {
                                      s10.push(s11);
                                      s11 = peg$currPos;
                                      s12 = peg$parseinnerComment();
                                      if (s12 !== peg$FAILED) {
                                        peg$savedPos = s11;
                                        s12 = peg$f105(s4, s6, s12);
                                      }
                                      s11 = s12;
                                    }
                                    peg$savedPos = s0;
                                    s0 = peg$f106(s4, s6, s10);
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          s1 = peg$parsews();
                          s2 = peg$parsebl();
                          if (s2 !== peg$FAILED) {
                            if (input.substr(peg$currPos, 5) === peg$c155) {
                              s3 = peg$c155;
                              peg$currPos += 5;
                            } else {
                              s3 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e163);
                              }
                            }
                            if (s3 !== peg$FAILED) {
                              s4 = peg$parsewsp();
                              if (s4 !== peg$FAILED) {
                                s5 = peg$parsestringNoQuot();
                                s6 = peg$parsews();
                                s7 = peg$parsebr();
                                if (s7 !== peg$FAILED) {
                                  s8 = peg$parsews();
                                  s9 = [];
                                  s10 = peg$currPos;
                                  s11 = peg$parseinnerComment();
                                  if (s11 !== peg$FAILED) {
                                    peg$savedPos = s10;
                                    s11 = peg$f107(s5, s11);
                                  }
                                  s10 = s11;
                                  while (s10 !== peg$FAILED) {
                                    s9.push(s10);
                                    s10 = peg$currPos;
                                    s11 = peg$parseinnerComment();
                                    if (s11 !== peg$FAILED) {
                                      peg$savedPos = s10;
                                      s11 = peg$f107(s5, s11);
                                    }
                                    s10 = s11;
                                  }
                                  peg$savedPos = s0;
                                  s0 = peg$f108(s5, s9);
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parsews();
                            s2 = peg$parsebl();
                            if (s2 !== peg$FAILED) {
                              if (input.charCodeAt(peg$currPos) === 37) {
                                s3 = peg$c154;
                                peg$currPos++;
                              } else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e162);
                                }
                              }
                              if (s3 !== peg$FAILED) {
                                s4 = peg$parsestringNoQuot();
                                s5 = peg$parsewsp();
                                if (s5 !== peg$FAILED) {
                                  s6 = [];
                                  s7 = peg$parsenbr();
                                  if (s7 !== peg$FAILED) {
                                    while (s7 !== peg$FAILED) {
                                      s6.push(s7);
                                      s7 = peg$parsenbr();
                                    }
                                  } else {
                                    s6 = peg$FAILED;
                                  }
                                  if (s6 !== peg$FAILED) {
                                    s7 = peg$parsebr();
                                    if (s7 !== peg$FAILED) {
                                      s8 = peg$parsews();
                                      s9 = [];
                                      s10 = peg$currPos;
                                      s11 = peg$parseinnerComment();
                                      if (s11 !== peg$FAILED) {
                                        peg$savedPos = s10;
                                        s11 = peg$f109(s4, s6, s11);
                                      }
                                      s10 = s11;
                                      while (s10 !== peg$FAILED) {
                                        s9.push(s10);
                                        s10 = peg$currPos;
                                        s11 = peg$parseinnerComment();
                                        if (s11 !== peg$FAILED) {
                                          peg$savedPos = s10;
                                          s11 = peg$f109(s4, s6, s11);
                                        }
                                        s10 = s11;
                                      }
                                      peg$savedPos = s0;
                                      s0 = peg$f110(s4, s6, s9);
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$FAILED;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              s1 = [];
                              s2 = peg$parsenonCommand();
                              if (s2 !== peg$FAILED) {
                                while (s2 !== peg$FAILED) {
                                  s1.push(s2);
                                  s2 = peg$parsenonCommand();
                                }
                              } else {
                                s1 = peg$FAILED;
                              }
                              if (s1 !== peg$FAILED) {
                                s2 = [];
                                s3 = peg$currPos;
                                s4 = peg$parsews();
                                s5 = peg$parseinnerComment();
                                if (s5 !== peg$FAILED) {
                                  peg$savedPos = s3;
                                  s3 = peg$f111(s1, s5);
                                } else {
                                  peg$currPos = s3;
                                  s3 = peg$FAILED;
                                }
                                while (s3 !== peg$FAILED) {
                                  s2.push(s3);
                                  s3 = peg$currPos;
                                  s4 = peg$parsews();
                                  s5 = peg$parseinnerComment();
                                  if (s5 !== peg$FAILED) {
                                    peg$savedPos = s3;
                                    s3 = peg$f111(s1, s5);
                                  } else {
                                    peg$currPos = s3;
                                    s3 = peg$FAILED;
                                  }
                                }
                                peg$savedPos = s0;
                                s0 = peg$f112(s1, s2);
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsenonCommand() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$currPos;
                  peg$silentFails++;
                  if (input.substr(peg$currPos, 2) === peg$c156) {
                    s2 = peg$c156;
                    peg$currPos += 2;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e164);
                    }
                  }
                  peg$silentFails--;
                  if (s2 === peg$FAILED) {
                    s1 = void 0;
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = peg$currPos;
                    peg$silentFails++;
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s3 = peg$c157;
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e165);
                      }
                    }
                    peg$silentFails--;
                    if (s3 === peg$FAILED) {
                      s2 = void 0;
                    } else {
                      peg$currPos = s2;
                      s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                      if (input.length > peg$currPos) {
                        s3 = input.charAt(peg$currPos);
                        peg$currPos++;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e166);
                        }
                      }
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f113(s3);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsenbr() {
                  var s0, s1, s2;
                  s0 = peg$currPos;
                  s1 = peg$currPos;
                  peg$silentFails++;
                  s2 = peg$parsebr();
                  peg$silentFails--;
                  if (s2 === peg$FAILED) {
                    s1 = void 0;
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                  if (s1 !== peg$FAILED) {
                    if (input.length > peg$currPos) {
                      s2 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e166);
                      }
                    }
                    if (s2 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f114(s2);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsecommentEndOfLine() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsesemicolon();
                  if (s1 !== peg$FAILED) {
                    s2 = [];
                    s3 = input.charAt(peg$currPos);
                    if (peg$r7.test(s3)) {
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e167);
                      }
                    }
                    while (s3 !== peg$FAILED) {
                      s2.push(s3);
                      s3 = input.charAt(peg$currPos);
                      if (peg$r7.test(s3)) {
                        peg$currPos++;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e167);
                        }
                      }
                    }
                    s3 = peg$parseeol();
                    if (s3 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f115(s2);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsecolorFields() {
                  var s0, s1, s3, s4, s5, s6, s7;
                  s0 = peg$currPos;
                  s1 = peg$parsecolorField();
                  if (s1 !== peg$FAILED) {
                    peg$parsews();
                    s3 = [];
                    s4 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 44) {
                      s5 = peg$c158;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e168);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsews();
                      s7 = peg$parsecolorField();
                      if (s7 !== peg$FAILED) {
                        s5 = [s5, s6, s7];
                        s4 = s5;
                      } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s4;
                      s4 = peg$FAILED;
                    }
                    while (s4 !== peg$FAILED) {
                      s3.push(s4);
                      s4 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 44) {
                        s5 = peg$c158;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e168);
                        }
                      }
                      if (s5 !== peg$FAILED) {
                        s6 = peg$parsews();
                        s7 = peg$parsecolorField();
                        if (s7 !== peg$FAILED) {
                          s5 = [s5, s6, s7];
                          s4 = s5;
                        } else {
                          peg$currPos = s4;
                          s4 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                      }
                    }
                    peg$savedPos = s0;
                    s0 = peg$f116(s1, s3);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsecolorField() {
                  var s0, s1, s2;
                  s0 = peg$currPos;
                  s1 = peg$parsecolor();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsefield();
                    if (s2 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f117(s1, s2);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsecolorArrows() {
                  var s0, s1, s3, s4, s5, s6, s7;
                  s0 = peg$currPos;
                  s1 = peg$parsecolorArrow();
                  if (s1 !== peg$FAILED) {
                    peg$parsews();
                    s3 = [];
                    s4 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 44) {
                      s5 = peg$c158;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e168);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsews();
                      s7 = peg$parsecolorArrow();
                      if (s7 !== peg$FAILED) {
                        s5 = [s5, s6, s7];
                        s4 = s5;
                      } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s4;
                      s4 = peg$FAILED;
                    }
                    while (s4 !== peg$FAILED) {
                      s3.push(s4);
                      s4 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 44) {
                        s5 = peg$c158;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e168);
                        }
                      }
                      if (s5 !== peg$FAILED) {
                        s6 = peg$parsews();
                        s7 = peg$parsecolorArrow();
                        if (s7 !== peg$FAILED) {
                          s5 = [s5, s6, s7];
                          s4 = s5;
                        } else {
                          peg$currPos = s4;
                          s4 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s4;
                        s4 = peg$FAILED;
                      }
                    }
                    peg$savedPos = s0;
                    s0 = peg$f118(s1, s3);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsecolorArrow() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsecolor();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsefield();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsefield();
                      if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f119(s1, s2, s3);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsecolor() {
                  var s0, s1;
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 89) {
                    s1 = peg$c159;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e169);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f120();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 71) {
                      s1 = peg$c160;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e170);
                      }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$f121();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 82) {
                        s1 = peg$c161;
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e171);
                        }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f122();
                      }
                      s0 = s1;
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 66) {
                          s1 = peg$c162;
                          peg$currPos++;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e172);
                          }
                        }
                        if (s1 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$f123();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 79) {
                            s1 = peg$c163;
                            peg$currPos++;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e173);
                            }
                          }
                          if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f124();
                          }
                          s0 = s1;
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 67) {
                              s1 = peg$c164;
                              peg$currPos++;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e174);
                              }
                            }
                            if (s1 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$f125();
                            }
                            s0 = s1;
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsefield() {
                  var s0, s1, s2;
                  s0 = peg$currPos;
                  s1 = peg$parsecolumn();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parserow();
                    if (s2 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f126(s1, s2);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsecl() {
                  var s0;
                  if (input.charCodeAt(peg$currPos) === 123) {
                    s0 = peg$c165;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e175);
                    }
                  }
                  return s0;
                }
                function peg$parsecr() {
                  var s0;
                  if (input.charCodeAt(peg$currPos) === 125) {
                    s0 = peg$c157;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e165);
                    }
                  }
                  return s0;
                }
                function peg$parsebl() {
                  var s0;
                  if (input.charCodeAt(peg$currPos) === 91) {
                    s0 = peg$c166;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e176);
                    }
                  }
                  return s0;
                }
                function peg$parsebr() {
                  var s0;
                  if (input.charCodeAt(peg$currPos) === 93) {
                    s0 = peg$c167;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e177);
                    }
                  }
                  return s0;
                }
                function peg$parsesemicolon() {
                  var s0;
                  if (input.charCodeAt(peg$currPos) === 59) {
                    s0 = peg$c168;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e178);
                    }
                  }
                  return s0;
                }
                function peg$parseclockCommand1D() {
                  var s0, s1;
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 3) === peg$c169) {
                    s1 = peg$c169;
                    peg$currPos += 3;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e179);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f131();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 3) === peg$c170) {
                      s1 = peg$c170;
                      peg$currPos += 3;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e180);
                      }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$f132();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.substr(peg$currPos, 3) === peg$c171) {
                        s1 = peg$c171;
                        peg$currPos += 3;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e181);
                        }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f133();
                      }
                      s0 = s1;
                    }
                  }
                  return s0;
                }
                function peg$parseclockCommand2D() {
                  var s0, s1;
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 3) === peg$c172) {
                    s1 = peg$c172;
                    peg$currPos += 3;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e182);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f134();
                  }
                  s0 = s1;
                  return s0;
                }
                function peg$parseclockValue1D() {
                  var s0, s1, s2, s3, s4;
                  s0 = peg$currPos;
                  s1 = peg$parsehoursMinutes();
                  if (s1 === peg$FAILED) {
                    s1 = null;
                  }
                  s2 = peg$parsedigit();
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parsedigit();
                    if (s3 === peg$FAILED) {
                      s3 = null;
                    }
                    s4 = peg$parsemillis();
                    if (s4 === peg$FAILED) {
                      s4 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f135(s1, s2, s3, s4);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parseclockValue2D() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsehoursMinutes();
                  if (s1 === peg$FAILED) {
                    s1 = null;
                  }
                  s2 = peg$parsedigit();
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parsedigit();
                    if (s3 === peg$FAILED) {
                      s3 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f136(s1, s2, s3);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsehoursMinutes() {
                  var s0, s1, s2;
                  s0 = peg$currPos;
                  s1 = peg$parsehoursClock();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parseminutesClock();
                    if (s2 === peg$FAILED) {
                      s2 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f137(s1, s2);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsehoursClock() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsedigit();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsedigit();
                    if (s2 === peg$FAILED) {
                      s2 = null;
                    }
                    if (input.charCodeAt(peg$currPos) === 58) {
                      s3 = peg$c141;
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e148);
                      }
                    }
                    if (s3 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f138(s1, s2);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parseminutesClock() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsedigit();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsedigit();
                    if (s2 === peg$FAILED) {
                      s2 = null;
                    }
                    if (input.charCodeAt(peg$currPos) === 58) {
                      s3 = peg$c141;
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e148);
                      }
                    }
                    if (s3 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f139(s1, s2);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsedigit() {
                  var s0, s1;
                  s0 = peg$currPos;
                  s1 = input.charAt(peg$currPos);
                  if (peg$r5.test(s1)) {
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e147);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f140(s1);
                  }
                  s0 = s1;
                  return s0;
                }
                function peg$parsevariation() {
                  var s0, s1, s2, s3, s5;
                  s0 = peg$currPos;
                  s1 = peg$parsepl();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsepgn();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsepr();
                      if (s3 !== peg$FAILED) {
                        peg$parsews();
                        s5 = peg$parsevariation();
                        if (s5 === peg$FAILED) {
                          s5 = null;
                        }
                        peg$savedPos = s0;
                        s0 = peg$f141(s2, s5);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsepl() {
                  var s0;
                  if (input.charCodeAt(peg$currPos) === 40) {
                    s0 = peg$c173;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e183);
                    }
                  }
                  return s0;
                }
                function peg$parsepr() {
                  var s0;
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s0 = peg$c174;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e184);
                    }
                  }
                  return s0;
                }
                function peg$parsemoveNumber() {
                  var s0, s1, s2, s3, s4, s5, s6;
                  s0 = peg$currPos;
                  s1 = peg$parseinteger();
                  if (s1 !== peg$FAILED) {
                    s2 = [];
                    s3 = peg$parsewhiteSpace();
                    while (s3 !== peg$FAILED) {
                      s2.push(s3);
                      s3 = peg$parsewhiteSpace();
                    }
                    s3 = [];
                    s4 = peg$parsedot();
                    while (s4 !== peg$FAILED) {
                      s3.push(s4);
                      s4 = peg$parsedot();
                    }
                    s4 = [];
                    s5 = peg$parsewhiteSpace();
                    while (s5 !== peg$FAILED) {
                      s4.push(s5);
                      s5 = peg$parsewhiteSpace();
                    }
                    s5 = [];
                    s6 = peg$parsedot();
                    while (s6 !== peg$FAILED) {
                      s5.push(s6);
                      s6 = peg$parsedot();
                    }
                    peg$savedPos = s0;
                    s0 = peg$f142(s1);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsedot() {
                  var s0;
                  if (input.charCodeAt(peg$currPos) === 46) {
                    s0 = peg$c140;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e146);
                    }
                  }
                  return s0;
                }
                function peg$parseinteger() {
                  var s0, s1, s2;
                  peg$silentFails++;
                  s0 = peg$currPos;
                  s1 = [];
                  s2 = input.charAt(peg$currPos);
                  if (peg$r5.test(s2)) {
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e147);
                    }
                  }
                  if (s2 !== peg$FAILED) {
                    while (s2 !== peg$FAILED) {
                      s1.push(s2);
                      s2 = input.charAt(peg$currPos);
                      if (peg$r5.test(s2)) {
                        peg$currPos++;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e147);
                        }
                      }
                    }
                  } else {
                    s1 = peg$FAILED;
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f143(s1);
                  }
                  s0 = s1;
                  peg$silentFails--;
                  if (s0 === peg$FAILED) {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e185);
                    }
                  }
                  return s0;
                }
                function peg$parsewhiteSpace() {
                  var s0, s1, s2;
                  s0 = peg$currPos;
                  s1 = [];
                  if (input.charCodeAt(peg$currPos) === 32) {
                    s2 = peg$c175;
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e186);
                    }
                  }
                  if (s2 !== peg$FAILED) {
                    while (s2 !== peg$FAILED) {
                      s1.push(s2);
                      if (input.charCodeAt(peg$currPos) === 32) {
                        s2 = peg$c175;
                        peg$currPos++;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e186);
                        }
                      }
                    }
                  } else {
                    s1 = peg$FAILED;
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f144();
                  }
                  s0 = s1;
                  return s0;
                }
                function peg$parsehalfMove() {
                  var s0, s1, s2, s3, s4, s5, s6, s7, s8;
                  s0 = peg$currPos;
                  s1 = peg$parsefigure();
                  if (s1 === peg$FAILED) {
                    s1 = null;
                  }
                  s2 = peg$currPos;
                  peg$silentFails++;
                  s3 = peg$parsecheckdisc();
                  peg$silentFails--;
                  if (s3 !== peg$FAILED) {
                    peg$currPos = s2;
                    s2 = void 0;
                  } else {
                    s2 = peg$FAILED;
                  }
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parsediscriminator();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parsestrike();
                      if (s4 === peg$FAILED) {
                        s4 = null;
                      }
                      s5 = peg$parsecolumn();
                      if (s5 !== peg$FAILED) {
                        s6 = peg$parserow();
                        if (s6 !== peg$FAILED) {
                          s7 = peg$parsepromotion();
                          if (s7 === peg$FAILED) {
                            s7 = null;
                          }
                          s8 = peg$parsecheck();
                          if (s8 === peg$FAILED) {
                            s8 = null;
                          }
                          peg$parsews();
                          if (input.substr(peg$currPos, 4) === peg$c176) {
                            peg$currPos += 4;
                          } else {
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e187);
                            }
                          }
                          peg$savedPos = s0;
                          s0 = peg$f145(s1, s3, s4, s5, s6, s7, s8);
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parsefigure();
                    if (s1 === peg$FAILED) {
                      s1 = null;
                    }
                    s2 = peg$parsecolumn();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parserow();
                      if (s3 !== peg$FAILED) {
                        s4 = peg$parsestrikeOrDash();
                        if (s4 === peg$FAILED) {
                          s4 = null;
                        }
                        s5 = peg$parsecolumn();
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parserow();
                          if (s6 !== peg$FAILED) {
                            s7 = peg$parsepromotion();
                            if (s7 === peg$FAILED) {
                              s7 = null;
                            }
                            s8 = peg$parsecheck();
                            if (s8 === peg$FAILED) {
                              s8 = null;
                            }
                            peg$savedPos = s0;
                            s0 = peg$f146(s1, s2, s3, s4, s5, s6, s7, s8);
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parsefigure();
                      if (s1 === peg$FAILED) {
                        s1 = null;
                      }
                      s2 = peg$parsestrike();
                      if (s2 === peg$FAILED) {
                        s2 = null;
                      }
                      s3 = peg$parsecolumn();
                      if (s3 !== peg$FAILED) {
                        s4 = peg$parserow();
                        if (s4 !== peg$FAILED) {
                          s5 = peg$parsepromotion();
                          if (s5 === peg$FAILED) {
                            s5 = null;
                          }
                          s6 = peg$parsecheck();
                          if (s6 === peg$FAILED) {
                            s6 = null;
                          }
                          peg$savedPos = s0;
                          s0 = peg$f147(s1, s2, s3, s4, s5, s6);
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 5) === peg$c177) {
                          s1 = peg$c177;
                          peg$currPos += 5;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e188);
                          }
                        }
                        if (s1 !== peg$FAILED) {
                          s2 = peg$parsecheck();
                          if (s2 === peg$FAILED) {
                            s2 = null;
                          }
                          peg$savedPos = s0;
                          s0 = peg$f148(s2);
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.substr(peg$currPos, 3) === peg$c178) {
                            s1 = peg$c178;
                            peg$currPos += 3;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e189);
                            }
                          }
                          if (s1 !== peg$FAILED) {
                            s2 = peg$parsecheck();
                            if (s2 === peg$FAILED) {
                              s2 = null;
                            }
                            peg$savedPos = s0;
                            s0 = peg$f149(s2);
                          } else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                          }
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parsefigure();
                            if (s1 !== peg$FAILED) {
                              if (input.charCodeAt(peg$currPos) === 64) {
                                s2 = peg$c179;
                                peg$currPos++;
                              } else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e190);
                                }
                              }
                              if (s2 !== peg$FAILED) {
                                s3 = peg$parsecolumn();
                                if (s3 !== peg$FAILED) {
                                  s4 = peg$parserow();
                                  if (s4 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s0 = peg$f150(s1, s3, s4);
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$FAILED;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$FAILED;
                            }
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.substr(peg$currPos, 2) === peg$c180) {
                                s1 = peg$c180;
                                peg$currPos += 2;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e191);
                                }
                              }
                              if (s1 === peg$FAILED) {
                                s1 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 45) {
                                  s2 = peg$c144;
                                  peg$currPos++;
                                } else {
                                  s2 = peg$FAILED;
                                  if (peg$silentFails === 0) {
                                    peg$fail(peg$e152);
                                  }
                                }
                                if (s2 !== peg$FAILED) {
                                  if (input.charCodeAt(peg$currPos) === 45) {
                                    s3 = peg$c144;
                                    peg$currPos++;
                                  } else {
                                    s3 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                      peg$fail(peg$e152);
                                    }
                                  }
                                  if (s3 !== peg$FAILED) {
                                    s2 = [s2, s3];
                                    s1 = s2;
                                  } else {
                                    peg$currPos = s1;
                                    s1 = peg$FAILED;
                                  }
                                } else {
                                  peg$currPos = s1;
                                  s1 = peg$FAILED;
                                }
                              }
                              if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$f151();
                              }
                              s0 = s1;
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsecheck() {
                  var s0, s1, s2, s3;
                  s0 = peg$currPos;
                  s1 = peg$currPos;
                  s2 = peg$currPos;
                  peg$silentFails++;
                  if (input.substr(peg$currPos, 2) === peg$c181) {
                    s3 = peg$c181;
                    peg$currPos += 2;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e192);
                    }
                  }
                  peg$silentFails--;
                  if (s3 === peg$FAILED) {
                    s2 = void 0;
                  } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                  }
                  if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 43) {
                      s3 = peg$c145;
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e153);
                      }
                    }
                    if (s3 !== peg$FAILED) {
                      s2 = [s2, s3];
                      s1 = s2;
                    } else {
                      peg$currPos = s1;
                      s1 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f152(s1);
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$currPos;
                    s2 = peg$currPos;
                    peg$silentFails++;
                    if (input.substr(peg$currPos, 3) === peg$c182) {
                      s3 = peg$c182;
                      peg$currPos += 3;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e193);
                      }
                    }
                    peg$silentFails--;
                    if (s3 === peg$FAILED) {
                      s2 = void 0;
                    } else {
                      peg$currPos = s2;
                      s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 35) {
                        s3 = peg$c183;
                        peg$currPos++;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e194);
                        }
                      }
                      if (s3 !== peg$FAILED) {
                        s2 = [s2, s3];
                        s1 = s2;
                      } else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$FAILED;
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$f153(s1);
                    }
                    s0 = s1;
                  }
                  return s0;
                }
                function peg$parsepromotion() {
                  var s0, s2;
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 61) {
                    peg$currPos++;
                  } else {
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e159);
                    }
                  }
                  s2 = peg$parsepromFigure();
                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f154(s2);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsenags() {
                  var s0, s1, s3;
                  s0 = peg$currPos;
                  s1 = peg$parsenag();
                  if (s1 !== peg$FAILED) {
                    peg$parsews();
                    s3 = peg$parsenags();
                    if (s3 === peg$FAILED) {
                      s3 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f155(s1, s3);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsenag() {
                  var s0, s1, s2;
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 36) {
                    s1 = peg$c184;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e195);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parseinteger();
                    if (s2 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f156(s2);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c185) {
                      s1 = peg$c185;
                      peg$currPos += 2;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e196);
                      }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$f157();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.substr(peg$currPos, 2) === peg$c186) {
                        s1 = peg$c186;
                        peg$currPos += 2;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e197);
                        }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f158();
                      }
                      s0 = s1;
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 2) === peg$c187) {
                          s1 = peg$c187;
                          peg$currPos += 2;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e198);
                          }
                        }
                        if (s1 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$f159();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.substr(peg$currPos, 2) === peg$c188) {
                            s1 = peg$c188;
                            peg$currPos += 2;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e199);
                            }
                          }
                          if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f160();
                          }
                          s0 = s1;
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 33) {
                              s1 = peg$c189;
                              peg$currPos++;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e200);
                              }
                            }
                            if (s1 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$f161();
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.charCodeAt(peg$currPos) === 63) {
                                s1 = peg$c143;
                                peg$currPos++;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e151);
                                }
                              }
                              if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$f162();
                              }
                              s0 = s1;
                              if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 8252) {
                                  s1 = peg$c190;
                                  peg$currPos++;
                                } else {
                                  s1 = peg$FAILED;
                                  if (peg$silentFails === 0) {
                                    peg$fail(peg$e201);
                                  }
                                }
                                if (s1 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s1 = peg$f163();
                                }
                                s0 = s1;
                                if (s0 === peg$FAILED) {
                                  s0 = peg$currPos;
                                  if (input.charCodeAt(peg$currPos) === 8263) {
                                    s1 = peg$c191;
                                    peg$currPos++;
                                  } else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                      peg$fail(peg$e202);
                                    }
                                  }
                                  if (s1 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$f164();
                                  }
                                  s0 = s1;
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    if (input.charCodeAt(peg$currPos) === 8265) {
                                      s1 = peg$c192;
                                      peg$currPos++;
                                    } else {
                                      s1 = peg$FAILED;
                                      if (peg$silentFails === 0) {
                                        peg$fail(peg$e203);
                                      }
                                    }
                                    if (s1 !== peg$FAILED) {
                                      peg$savedPos = s0;
                                      s1 = peg$f165();
                                    }
                                    s0 = s1;
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$currPos;
                                      if (input.charCodeAt(peg$currPos) === 8264) {
                                        s1 = peg$c193;
                                        peg$currPos++;
                                      } else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                          peg$fail(peg$e204);
                                        }
                                      }
                                      if (s1 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s1 = peg$f166();
                                      }
                                      s0 = s1;
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        if (input.charCodeAt(peg$currPos) === 9633) {
                                          s1 = peg$c194;
                                          peg$currPos++;
                                        } else {
                                          s1 = peg$FAILED;
                                          if (peg$silentFails === 0) {
                                            peg$fail(peg$e205);
                                          }
                                        }
                                        if (s1 !== peg$FAILED) {
                                          peg$savedPos = s0;
                                          s1 = peg$f167();
                                        }
                                        s0 = s1;
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$currPos;
                                          if (input.charCodeAt(peg$currPos) === 61) {
                                            s1 = peg$c151;
                                            peg$currPos++;
                                          } else {
                                            s1 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                              peg$fail(peg$e159);
                                            }
                                          }
                                          if (s1 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s1 = peg$f168();
                                          }
                                          s0 = s1;
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            if (input.charCodeAt(peg$currPos) === 8734) {
                                              s1 = peg$c195;
                                              peg$currPos++;
                                            } else {
                                              s1 = peg$FAILED;
                                              if (peg$silentFails === 0) {
                                                peg$fail(peg$e206);
                                              }
                                            }
                                            if (s1 !== peg$FAILED) {
                                              peg$savedPos = s0;
                                              s1 = peg$f169();
                                            }
                                            s0 = s1;
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$currPos;
                                              if (input.charCodeAt(peg$currPos) === 10866) {
                                                s1 = peg$c196;
                                                peg$currPos++;
                                              } else {
                                                s1 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                  peg$fail(peg$e207);
                                                }
                                              }
                                              if (s1 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s1 = peg$f170();
                                              }
                                              s0 = s1;
                                              if (s0 === peg$FAILED) {
                                                s0 = peg$currPos;
                                                if (input.charCodeAt(peg$currPos) === 10865) {
                                                  s1 = peg$c197;
                                                  peg$currPos++;
                                                } else {
                                                  s1 = peg$FAILED;
                                                  if (peg$silentFails === 0) {
                                                    peg$fail(peg$e208);
                                                  }
                                                }
                                                if (s1 !== peg$FAILED) {
                                                  peg$savedPos = s0;
                                                  s1 = peg$f171();
                                                }
                                                s0 = s1;
                                                if (s0 === peg$FAILED) {
                                                  s0 = peg$currPos;
                                                  if (input.charCodeAt(peg$currPos) === 177) {
                                                    s1 = peg$c198;
                                                    peg$currPos++;
                                                  } else {
                                                    s1 = peg$FAILED;
                                                    if (peg$silentFails === 0) {
                                                      peg$fail(peg$e209);
                                                    }
                                                  }
                                                  if (s1 !== peg$FAILED) {
                                                    peg$savedPos = s0;
                                                    s1 = peg$f172();
                                                  }
                                                  s0 = s1;
                                                  if (s0 === peg$FAILED) {
                                                    s0 = peg$currPos;
                                                    if (input.charCodeAt(peg$currPos) === 8723) {
                                                      s1 = peg$c199;
                                                      peg$currPos++;
                                                    } else {
                                                      s1 = peg$FAILED;
                                                      if (peg$silentFails === 0) {
                                                        peg$fail(peg$e210);
                                                      }
                                                    }
                                                    if (s1 !== peg$FAILED) {
                                                      peg$savedPos = s0;
                                                      s1 = peg$f173();
                                                    }
                                                    s0 = s1;
                                                    if (s0 === peg$FAILED) {
                                                      s0 = peg$currPos;
                                                      if (input.substr(peg$currPos, 2) === peg$c181) {
                                                        s1 = peg$c181;
                                                        peg$currPos += 2;
                                                      } else {
                                                        s1 = peg$FAILED;
                                                        if (peg$silentFails === 0) {
                                                          peg$fail(peg$e192);
                                                        }
                                                      }
                                                      if (s1 !== peg$FAILED) {
                                                        peg$savedPos = s0;
                                                        s1 = peg$f174();
                                                      }
                                                      s0 = s1;
                                                      if (s0 === peg$FAILED) {
                                                        s0 = peg$currPos;
                                                        if (input.substr(peg$currPos, 2) === peg$c200) {
                                                          s1 = peg$c200;
                                                          peg$currPos += 2;
                                                        } else {
                                                          s1 = peg$FAILED;
                                                          if (peg$silentFails === 0) {
                                                            peg$fail(peg$e211);
                                                          }
                                                        }
                                                        if (s1 !== peg$FAILED) {
                                                          peg$savedPos = s0;
                                                          s1 = peg$f175();
                                                        }
                                                        s0 = s1;
                                                        if (s0 === peg$FAILED) {
                                                          s0 = peg$currPos;
                                                          if (input.charCodeAt(peg$currPos) === 10752) {
                                                            s1 = peg$c201;
                                                            peg$currPos++;
                                                          } else {
                                                            s1 = peg$FAILED;
                                                            if (peg$silentFails === 0) {
                                                              peg$fail(peg$e212);
                                                            }
                                                          }
                                                          if (s1 !== peg$FAILED) {
                                                            peg$savedPos = s0;
                                                            s1 = peg$f176();
                                                          }
                                                          s0 = s1;
                                                          if (s0 === peg$FAILED) {
                                                            s0 = peg$currPos;
                                                            if (input.charCodeAt(peg$currPos) === 10227) {
                                                              s1 = peg$c202;
                                                              peg$currPos++;
                                                            } else {
                                                              s1 = peg$FAILED;
                                                              if (peg$silentFails === 0) {
                                                                peg$fail(peg$e213);
                                                              }
                                                            }
                                                            if (s1 !== peg$FAILED) {
                                                              peg$savedPos = s0;
                                                              s1 = peg$f177();
                                                            }
                                                            s0 = s1;
                                                            if (s0 === peg$FAILED) {
                                                              s0 = peg$currPos;
                                                              if (input.charCodeAt(peg$currPos) === 8594) {
                                                                s1 = peg$c203;
                                                                peg$currPos++;
                                                              } else {
                                                                s1 = peg$FAILED;
                                                                if (peg$silentFails === 0) {
                                                                  peg$fail(peg$e214);
                                                                }
                                                              }
                                                              if (s1 !== peg$FAILED) {
                                                                peg$savedPos = s0;
                                                                s1 = peg$f178();
                                                              }
                                                              s0 = s1;
                                                              if (s0 === peg$FAILED) {
                                                                s0 = peg$currPos;
                                                                if (input.charCodeAt(peg$currPos) === 8593) {
                                                                  s1 = peg$c204;
                                                                  peg$currPos++;
                                                                } else {
                                                                  s1 = peg$FAILED;
                                                                  if (peg$silentFails === 0) {
                                                                    peg$fail(peg$e215);
                                                                  }
                                                                }
                                                                if (s1 !== peg$FAILED) {
                                                                  peg$savedPos = s0;
                                                                  s1 = peg$f179();
                                                                }
                                                                s0 = s1;
                                                                if (s0 === peg$FAILED) {
                                                                  s0 = peg$currPos;
                                                                  if (input.charCodeAt(peg$currPos) === 8646) {
                                                                    s1 = peg$c205;
                                                                    peg$currPos++;
                                                                  } else {
                                                                    s1 = peg$FAILED;
                                                                    if (peg$silentFails === 0) {
                                                                      peg$fail(peg$e216);
                                                                    }
                                                                  }
                                                                  if (s1 !== peg$FAILED) {
                                                                    peg$savedPos = s0;
                                                                    s1 = peg$f180();
                                                                  }
                                                                  s0 = s1;
                                                                  if (s0 === peg$FAILED) {
                                                                    s0 = peg$currPos;
                                                                    if (input.charCodeAt(peg$currPos) === 68) {
                                                                      s1 = peg$c206;
                                                                      peg$currPos++;
                                                                    } else {
                                                                      s1 = peg$FAILED;
                                                                      if (peg$silentFails === 0) {
                                                                        peg$fail(peg$e217);
                                                                      }
                                                                    }
                                                                    if (s1 !== peg$FAILED) {
                                                                      peg$savedPos = s0;
                                                                      s1 = peg$f181();
                                                                    }
                                                                    s0 = s1;
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  return s0;
                }
                function peg$parsediscriminator() {
                  var s0;
                  s0 = input.charAt(peg$currPos);
                  if (peg$r8.test(s0)) {
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e218);
                    }
                  }
                  return s0;
                }
                function peg$parsecheckdisc() {
                  var s0, s1, s2, s3, s4;
                  s0 = peg$currPos;
                  s1 = peg$parsediscriminator();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsestrike();
                    if (s2 === peg$FAILED) {
                      s2 = null;
                    }
                    s3 = peg$parsecolumn();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parserow();
                      if (s4 !== peg$FAILED) {
                        s1 = [s1, s2, s3, s4];
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  return s0;
                }
                function peg$parsefigure() {
                  var s0;
                  s0 = input.charAt(peg$currPos);
                  if (peg$r9.test(s0)) {
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e219);
                    }
                  }
                  return s0;
                }
                function peg$parsepromFigure() {
                  var s0;
                  s0 = input.charAt(peg$currPos);
                  if (peg$r10.test(s0)) {
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e220);
                    }
                  }
                  return s0;
                }
                function peg$parsecolumn() {
                  var s0;
                  s0 = input.charAt(peg$currPos);
                  if (peg$r11.test(s0)) {
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e221);
                    }
                  }
                  return s0;
                }
                function peg$parserow() {
                  var s0;
                  s0 = input.charAt(peg$currPos);
                  if (peg$r12.test(s0)) {
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e222);
                    }
                  }
                  return s0;
                }
                function peg$parsestrike() {
                  var s0;
                  if (input.charCodeAt(peg$currPos) === 120) {
                    s0 = peg$c207;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e223);
                    }
                  }
                  return s0;
                }
                function peg$parsestrikeOrDash() {
                  var s0;
                  s0 = input.charAt(peg$currPos);
                  if (peg$r13.test(s0)) {
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e224);
                    }
                  }
                  return s0;
                }
                var messages = [];
                function addMessage(json) {
                  var o = Object.assign(json, location());
                  messages.push(o);
                  return o;
                }
                function makeInteger(o) {
                  return parseInt(o.join(""), 10);
                }
                function mi(o) {
                  return o.join("").match(/\?/) ? o.join("") : makeInteger(o);
                }
                function merge(array) {
                  var ret = {};
                  array.forEach(function(json) {
                    for (var key in json) {
                      if (Array.isArray(json[key])) {
                        ret[key] = ret[key] ? ret[key].concat(json[key]) : json[key];
                      } else {
                        ret[key] = ret[key] ? trimEnd(ret[key]) + " " + trimStart(json[key]) : json[key];
                      }
                    }
                  });
                  return ret;
                }
                function trimStart(st) {
                  if (typeof st !== "string")
                    return st;
                  var r = /^\s+/;
                  return st.replace(r, "");
                }
                function trimEnd(st) {
                  if (typeof st !== "string")
                    return st;
                  var r = /\s+$/;
                  return st.replace(r, "");
                }
                peg$result = peg$startRuleFunction();
                if (options.peg$library) {
                  return (
                    /** @type {any} */
                    {
                      peg$result,
                      peg$currPos,
                      peg$FAILED,
                      peg$maxFailExpected,
                      peg$maxFailPos
                    }
                  );
                }
                if (peg$result !== peg$FAILED && peg$currPos === input.length) {
                  return peg$result;
                } else {
                  if (peg$result !== peg$FAILED && peg$currPos < input.length) {
                    peg$fail(peg$endExpectation());
                  }
                  throw peg$buildStructuredError(peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
                }
              }
              return {
                StartRules: ["pgn", "tags", "game", "games"],
                SyntaxError: peg$SyntaxError2,
                parse: peg$parse2
              };
            });
          })(_pgnParser$1);
          return _pgnParser$1.exports;
        }
        var _pgnParserExports = require_pgnParser();
        var PegParser = /* @__PURE__ */ getDefaultExportFromCjs(_pgnParserExports);
        function parse2(input, options) {
          if (!options || options.startRule === "games") {
            return parseGames(input, options);
          } else {
            return parseGame(input, options);
          }
        }
        function parseGame(input, options = { startRule: "game" }) {
          try {
            input = input.trim();
            let result = PegParser.parse(input, options);
            let res2 = { moves: [], messages: [] };
            if (options.startRule === "pgn") {
              res2.moves = result;
            } else if (options.startRule === "tags") {
              res2.tags = result;
            } else {
              res2 = result;
            }
            return postParseGame(res2, input, options);
          } catch (error) {
            throw parseError(input, options, error);
          }
        }
        function parseError(input, options, error) {
          if (error.location && error.location.start) {
            const line = error.location.start.line;
            const column = error.location.start.column;
            const lines = input.split("\n");
            const contextStart = Math.max(0, line - 3);
            const contextEnd = Math.min(lines.length, line + 2);
            const contextLines = [];
            for (let i = contextStart; i < contextEnd; i++) {
              const lineNum = i + 1;
              let lineContent = lines[i] || "";
              if (lineNum === line) {
                if (column <= lineContent.length) {
                  lineContent = lineContent.substring(0, column - 1) + "**" + lineContent.substring(column - 1);
                } else {
                  lineContent += "**";
                }
              }
              contextLines.push(`${lineNum}: ${lineContent}`);
            }
            error.errorHint = `Error at line ${line}, column ${column}:
${contextLines.join("\n")}`;
          } else {
            error.errorHint = `Error parsing PGN (no location information available): ${error.message || "Unknown error"}`;
          }
          return error;
        }
        function postParseGame(_parseTree, _input, _options) {
          function handleGameResult(parseTree) {
            if (_options.startRule !== "tags") {
              let move3 = parseTree.moves[parseTree.moves.length - 1];
              if (typeof move3 == "string") {
                parseTree.moves.pop();
                if (parseTree.tags) {
                  let tmp = parseTree.tags["Result"];
                  if (tmp) {
                    if (move3 !== tmp) {
                      parseTree.messages.push({
                        key: "Result",
                        value: tmp,
                        message: "Result in tags is different to result in SAN"
                      });
                    }
                  }
                  parseTree.tags["Result"] = move3;
                }
              }
            }
            return parseTree;
          }
          function handleTurn(parseResult) {
            function handleTurnGame(_game) {
              function getTurnFromFEN(fen2) {
                return fen2.split(/\s+/)[1];
              }
              function setTurn(_move, _currentTurn) {
                function switchTurn(currentTurn2) {
                  return currentTurn2 === "w" ? "b" : "w";
                }
                _move.turn = _currentTurn;
                if (_move.variations) {
                  _move.variations.forEach(function(variation) {
                    let varTurn = _currentTurn;
                    variation.forEach((varMove) => varTurn = setTurn(varMove, varTurn));
                  });
                }
                return switchTurn(_currentTurn);
              }
              const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
              let fen = _options.fen || _game.tags && _game.tags["FEN"] || START;
              let currentTurn = getTurnFromFEN(fen);
              _game.moves.forEach((move3) => currentTurn = setTurn(move3, currentTurn));
              return _game;
            }
            if (!parseResult.moves) {
              return parseResult;
            }
            return handleTurnGame(parseResult);
          }
          return handleTurn(handleGameResult(_parseTree));
        }
        function parseGames(input, options = { startRule: "games" }) {
          function handleGamesAnomaly(parseTree) {
            if (!Array.isArray(parseTree))
              return [];
            if (parseTree.length === 0)
              return parseTree;
            let last = parseTree.pop();
            if (last.tags !== void 0 || last.moves.length > 0) {
              parseTree.push(last);
            }
            return parseTree;
          }
          function postParseGames(parseTrees, input2, options2 = { startRule: "games" }) {
            return handleGamesAnomaly(parseTrees);
          }
          try {
            const gamesOptions = Object.assign({ startRule: "games" }, options);
            let result = PegParser.parse(input, gamesOptions);
            if (!result) {
              return [];
            }
            postParseGames(result, input, gamesOptions);
            result.forEach((pt) => {
              postParseGame(pt, input, gamesOptions);
            });
            return result;
          } catch (error) {
            throw parseError(input, options, error);
          }
        }
        const normalizeLineEndings = (str, normalized = "\n") => str.replace(/\r?\n/g, normalized);
        function split(input, options = { startRule: "games" }) {
          let result = normalizeLineEndings(input).split(/\n\n+/);
          let res = [];
          let g = { tags: "", pgn: "", all: "" };
          result.forEach(function(part) {
            if (part.startsWith("[")) {
              g.tags = part;
            } else if (part) {
              g.pgn = part;
              let game = g.tags ? g.tags + "\n\n" + g.pgn : g.pgn;
              g.all = game;
              res.push(g);
              g = { tags: "", pgn: "", all: "" };
            }
          });
          return res;
        }
        exports2.parse = parse2;
        exports2.parseGame = parseGame;
        exports2.parseGames = parseGames;
        exports2.split = split;
      }));
    }
  });

  // node_modules/chessground/dist/types.js
  var colors, files, ranks;
  var init_types = __esm({
    "node_modules/chessground/dist/types.js"() {
      colors = ["white", "black"];
      files = ["a", "b", "c", "d", "e", "f", "g", "h"];
      ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];
    }
  });

  // node_modules/chessground/dist/util.js
  function memo(f) {
    let v;
    const ret = () => {
      if (v === void 0)
        v = f();
      return v;
    };
    ret.clear = () => {
      v = void 0;
    };
    return ret;
  }
  function computeSquareCenter(key, asWhite, bounds) {
    const pos = key2pos(key);
    if (!asWhite) {
      pos[0] = 7 - pos[0];
      pos[1] = 7 - pos[1];
    }
    return [
      bounds.left + bounds.width * pos[0] / 8 + bounds.width / 16,
      bounds.top + bounds.height * (7 - pos[1]) / 8 + bounds.height / 16
    ];
  }
  var invRanks, allKeys, pos2key, key2pos, allPos, timer, opposite, distanceSq, samePiece, posToTranslate, translate, translateAndScale, setVisible, eventPosition, isRightButton, createEl;
  var init_util = __esm({
    "node_modules/chessground/dist/util.js"() {
      init_types();
      invRanks = [...ranks].reverse();
      allKeys = Array.prototype.concat(...files.map((c) => ranks.map((r) => c + r)));
      pos2key = (pos) => allKeys[8 * pos[0] + pos[1]];
      key2pos = (k) => [k.charCodeAt(0) - 97, k.charCodeAt(1) - 49];
      allPos = allKeys.map(key2pos);
      timer = () => {
        let startAt;
        return {
          start() {
            startAt = performance.now();
          },
          cancel() {
            startAt = void 0;
          },
          stop() {
            if (!startAt)
              return 0;
            const time = performance.now() - startAt;
            startAt = void 0;
            return time;
          }
        };
      };
      opposite = (c) => c === "white" ? "black" : "white";
      distanceSq = (pos1, pos2) => {
        const dx = pos1[0] - pos2[0], dy = pos1[1] - pos2[1];
        return dx * dx + dy * dy;
      };
      samePiece = (p1, p2) => p1.role === p2.role && p1.color === p2.color;
      posToTranslate = (bounds) => (pos, asWhite) => [
        (asWhite ? pos[0] : 7 - pos[0]) * bounds.width / 8,
        (asWhite ? 7 - pos[1] : pos[1]) * bounds.height / 8
      ];
      translate = (el, pos) => {
        el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
      };
      translateAndScale = (el, pos, scale = 1) => {
        el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${scale})`;
      };
      setVisible = (el, v) => {
        el.style.visibility = v ? "visible" : "hidden";
      };
      eventPosition = (e) => {
        var _a;
        if (e.clientX || e.clientX === 0)
          return [e.clientX, e.clientY];
        if ((_a = e.targetTouches) === null || _a === void 0 ? void 0 : _a[0])
          return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
        return;
      };
      isRightButton = (e) => e.button === 2;
      createEl = (tagName, className) => {
        const el = document.createElement(tagName);
        if (className)
          el.className = className;
        return el;
      };
    }
  });

  // node_modules/chessground/dist/premove.js
  function rookFilesOf(pieces, color) {
    const backrank = color === "white" ? "1" : "8";
    const files2 = [];
    for (const [key, piece] of pieces) {
      if (key[1] === backrank && piece.color === color && piece.role === "rook") {
        files2.push(key2pos(key)[0]);
      }
    }
    return files2;
  }
  function premove(pieces, key, canCastle) {
    const piece = pieces.get(key);
    if (!piece)
      return [];
    const pos = key2pos(key), r = piece.role, mobility = r === "pawn" ? pawn(piece.color) : r === "knight" ? knight : r === "bishop" ? bishop : r === "rook" ? rook : r === "queen" ? queen : king(piece.color, rookFilesOf(pieces, piece.color), canCastle);
    return allPos.filter((pos2) => (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1])).map(pos2key);
  }
  var diff, pawn, knight, bishop, rook, queen, king;
  var init_premove = __esm({
    "node_modules/chessground/dist/premove.js"() {
      init_util();
      diff = (a, b) => Math.abs(a - b);
      pawn = (color) => (x1, y1, x2, y2) => diff(x1, x2) < 2 && (color === "white" ? (
        // allow 2 squares from first two ranks, for horde
        y2 === y1 + 1 || y1 <= 1 && y2 === y1 + 2 && x1 === x2
      ) : y2 === y1 - 1 || y1 >= 6 && y2 === y1 - 2 && x1 === x2);
      knight = (x1, y1, x2, y2) => {
        const xd = diff(x1, x2);
        const yd = diff(y1, y2);
        return xd === 1 && yd === 2 || xd === 2 && yd === 1;
      };
      bishop = (x1, y1, x2, y2) => {
        return diff(x1, x2) === diff(y1, y2);
      };
      rook = (x1, y1, x2, y2) => {
        return x1 === x2 || y1 === y2;
      };
      queen = (x1, y1, x2, y2) => {
        return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
      };
      king = (color, rookFiles, canCastle) => (x1, y1, x2, y2) => diff(x1, x2) < 2 && diff(y1, y2) < 2 || canCastle && y1 === y2 && y1 === (color === "white" ? 0 : 7) && (x1 === 4 && (x2 === 2 && rookFiles.includes(0) || x2 === 6 && rookFiles.includes(7)) || rookFiles.includes(x2));
    }
  });

  // node_modules/chessground/dist/board.js
  function callUserFunction(f, ...args) {
    if (f)
      f(...args);
  }
  function toggleOrientation(state2) {
    state2.orientation = opposite(state2.orientation);
    state2.animation.current = state2.draggable.current = state2.selected = void 0;
  }
  function setPieces(state2, pieces) {
    for (const [key, piece] of pieces) {
      if (piece)
        state2.pieces.set(key, piece);
      else
        state2.pieces.delete(key);
    }
  }
  function setCheck(state2, color) {
    state2.check = void 0;
    if (color === true)
      color = state2.turnColor;
    if (color)
      for (const [k, p] of state2.pieces) {
        if (p.role === "king" && p.color === color) {
          state2.check = k;
        }
      }
  }
  function setPremove(state2, orig, dest, meta) {
    unsetPredrop(state2);
    state2.premovable.current = [orig, dest];
    callUserFunction(state2.premovable.events.set, orig, dest, meta);
  }
  function unsetPremove(state2) {
    if (state2.premovable.current) {
      state2.premovable.current = void 0;
      callUserFunction(state2.premovable.events.unset);
    }
  }
  function setPredrop(state2, role, key) {
    unsetPremove(state2);
    state2.predroppable.current = { role, key };
    callUserFunction(state2.predroppable.events.set, role, key);
  }
  function unsetPredrop(state2) {
    const pd = state2.predroppable;
    if (pd.current) {
      pd.current = void 0;
      callUserFunction(pd.events.unset);
    }
  }
  function tryAutoCastle(state2, orig, dest) {
    if (!state2.autoCastle)
      return false;
    const king2 = state2.pieces.get(orig);
    if (!king2 || king2.role !== "king")
      return false;
    const origPos = key2pos(orig);
    const destPos = key2pos(dest);
    if (origPos[1] !== 0 && origPos[1] !== 7 || origPos[1] !== destPos[1])
      return false;
    if (origPos[0] === 4 && !state2.pieces.has(dest)) {
      if (destPos[0] === 6)
        dest = pos2key([7, destPos[1]]);
      else if (destPos[0] === 2)
        dest = pos2key([0, destPos[1]]);
    }
    const rook2 = state2.pieces.get(dest);
    if (!rook2 || rook2.color !== king2.color || rook2.role !== "rook")
      return false;
    state2.pieces.delete(orig);
    state2.pieces.delete(dest);
    if (origPos[0] < destPos[0]) {
      state2.pieces.set(pos2key([6, destPos[1]]), king2);
      state2.pieces.set(pos2key([5, destPos[1]]), rook2);
    } else {
      state2.pieces.set(pos2key([2, destPos[1]]), king2);
      state2.pieces.set(pos2key([3, destPos[1]]), rook2);
    }
    return true;
  }
  function baseMove(state2, orig, dest) {
    const origPiece = state2.pieces.get(orig), destPiece = state2.pieces.get(dest);
    if (orig === dest || !origPiece)
      return false;
    const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : void 0;
    if (dest === state2.selected)
      unselect(state2);
    callUserFunction(state2.events.move, orig, dest, captured);
    if (!tryAutoCastle(state2, orig, dest)) {
      state2.pieces.set(dest, origPiece);
      state2.pieces.delete(orig);
    }
    state2.lastMove = [orig, dest];
    state2.check = void 0;
    callUserFunction(state2.events.change);
    return captured || true;
  }
  function baseNewPiece(state2, piece, key, force) {
    if (state2.pieces.has(key)) {
      if (force)
        state2.pieces.delete(key);
      else
        return false;
    }
    callUserFunction(state2.events.dropNewPiece, piece, key);
    state2.pieces.set(key, piece);
    state2.lastMove = [key];
    state2.check = void 0;
    callUserFunction(state2.events.change);
    state2.movable.dests = void 0;
    state2.turnColor = opposite(state2.turnColor);
    return true;
  }
  function baseUserMove(state2, orig, dest) {
    const result = baseMove(state2, orig, dest);
    if (result) {
      state2.movable.dests = void 0;
      state2.turnColor = opposite(state2.turnColor);
      state2.animation.current = void 0;
    }
    return result;
  }
  function userMove(state2, orig, dest) {
    if (canMove(state2, orig, dest)) {
      const result = baseUserMove(state2, orig, dest);
      if (result) {
        const holdTime = state2.hold.stop();
        unselect(state2);
        const metadata = {
          premove: false,
          ctrlKey: state2.stats.ctrlKey,
          holdTime
        };
        if (result !== true)
          metadata.captured = result;
        callUserFunction(state2.movable.events.after, orig, dest, metadata);
        return true;
      }
    } else if (canPremove(state2, orig, dest)) {
      setPremove(state2, orig, dest, {
        ctrlKey: state2.stats.ctrlKey
      });
      unselect(state2);
      return true;
    }
    unselect(state2);
    return false;
  }
  function dropNewPiece(state2, orig, dest, force) {
    const piece = state2.pieces.get(orig);
    if (piece && (canDrop(state2, orig, dest) || force)) {
      state2.pieces.delete(orig);
      baseNewPiece(state2, piece, dest, force);
      callUserFunction(state2.movable.events.afterNewPiece, piece.role, dest, {
        premove: false,
        predrop: false
      });
    } else if (piece && canPredrop(state2, orig, dest)) {
      setPredrop(state2, piece.role, dest);
    } else {
      unsetPremove(state2);
      unsetPredrop(state2);
    }
    state2.pieces.delete(orig);
    unselect(state2);
  }
  function selectSquare(state2, key, force) {
    callUserFunction(state2.events.select, key);
    if (state2.selected) {
      if (state2.selected === key && !state2.draggable.enabled) {
        unselect(state2);
        state2.hold.cancel();
        return;
      } else if ((state2.selectable.enabled || force) && state2.selected !== key) {
        if (userMove(state2, state2.selected, key)) {
          state2.stats.dragged = false;
          return;
        }
      }
    }
    if ((state2.selectable.enabled || state2.draggable.enabled) && (isMovable(state2, key) || isPremovable(state2, key))) {
      setSelected(state2, key);
      state2.hold.start();
    }
  }
  function setSelected(state2, key) {
    state2.selected = key;
    if (isPremovable(state2, key)) {
      if (!state2.premovable.customDests) {
        state2.premovable.dests = premove(state2.pieces, key, state2.premovable.castle);
      }
    } else
      state2.premovable.dests = void 0;
  }
  function unselect(state2) {
    state2.selected = void 0;
    state2.premovable.dests = void 0;
    state2.hold.cancel();
  }
  function isMovable(state2, orig) {
    const piece = state2.pieces.get(orig);
    return !!piece && (state2.movable.color === "both" || state2.movable.color === piece.color && state2.turnColor === piece.color);
  }
  function canDrop(state2, orig, dest) {
    const piece = state2.pieces.get(orig);
    return !!piece && (orig === dest || !state2.pieces.has(dest)) && (state2.movable.color === "both" || state2.movable.color === piece.color && state2.turnColor === piece.color);
  }
  function isPremovable(state2, orig) {
    const piece = state2.pieces.get(orig);
    return !!piece && state2.premovable.enabled && state2.movable.color === piece.color && state2.turnColor !== piece.color;
  }
  function canPremove(state2, orig, dest) {
    var _a, _b;
    const validPremoves = (_b = (_a = state2.premovable.customDests) === null || _a === void 0 ? void 0 : _a.get(orig)) !== null && _b !== void 0 ? _b : premove(state2.pieces, orig, state2.premovable.castle);
    return orig !== dest && isPremovable(state2, orig) && validPremoves.includes(dest);
  }
  function canPredrop(state2, orig, dest) {
    const piece = state2.pieces.get(orig);
    const destPiece = state2.pieces.get(dest);
    return !!piece && (!destPiece || destPiece.color !== state2.movable.color) && state2.predroppable.enabled && (piece.role !== "pawn" || dest[1] !== "1" && dest[1] !== "8") && state2.movable.color === piece.color && state2.turnColor !== piece.color;
  }
  function isDraggable(state2, orig) {
    const piece = state2.pieces.get(orig);
    return !!piece && state2.draggable.enabled && (state2.movable.color === "both" || state2.movable.color === piece.color && (state2.turnColor === piece.color || state2.premovable.enabled));
  }
  function playPremove(state2) {
    const move3 = state2.premovable.current;
    if (!move3)
      return false;
    const orig = move3[0], dest = move3[1];
    let success = false;
    if (canMove(state2, orig, dest)) {
      const result = baseUserMove(state2, orig, dest);
      if (result) {
        const metadata = { premove: true };
        if (result !== true)
          metadata.captured = result;
        callUserFunction(state2.movable.events.after, orig, dest, metadata);
        success = true;
      }
    }
    unsetPremove(state2);
    return success;
  }
  function playPredrop(state2, validate) {
    const drop2 = state2.predroppable.current;
    let success = false;
    if (!drop2)
      return false;
    if (validate(drop2)) {
      const piece = {
        role: drop2.role,
        color: state2.movable.color
      };
      if (baseNewPiece(state2, piece, drop2.key)) {
        callUserFunction(state2.movable.events.afterNewPiece, drop2.role, drop2.key, {
          premove: false,
          predrop: true
        });
        success = true;
      }
    }
    unsetPredrop(state2);
    return success;
  }
  function cancelMove(state2) {
    unsetPremove(state2);
    unsetPredrop(state2);
    unselect(state2);
  }
  function stop(state2) {
    state2.movable.color = state2.movable.dests = state2.animation.current = void 0;
    cancelMove(state2);
  }
  function getKeyAtDomPos(pos, asWhite, bounds) {
    let file2 = Math.floor(8 * (pos[0] - bounds.left) / bounds.width);
    if (!asWhite)
      file2 = 7 - file2;
    let rank2 = 7 - Math.floor(8 * (pos[1] - bounds.top) / bounds.height);
    if (!asWhite)
      rank2 = 7 - rank2;
    return file2 >= 0 && file2 < 8 && rank2 >= 0 && rank2 < 8 ? pos2key([file2, rank2]) : void 0;
  }
  function getSnappedKeyAtDomPos(orig, pos, asWhite, bounds) {
    const origPos = key2pos(orig);
    const validSnapPos = allPos.filter((pos2) => queen(origPos[0], origPos[1], pos2[0], pos2[1]) || knight(origPos[0], origPos[1], pos2[0], pos2[1]));
    const validSnapCenters = validSnapPos.map((pos2) => computeSquareCenter(pos2key(pos2), asWhite, bounds));
    const validSnapDistances = validSnapCenters.map((pos2) => distanceSq(pos, pos2));
    const [, closestSnapIndex] = validSnapDistances.reduce((a, b, index) => a[0] < b ? a : [b, index], [validSnapDistances[0], 0]);
    return pos2key(validSnapPos[closestSnapIndex]);
  }
  var canMove, whitePov;
  var init_board = __esm({
    "node_modules/chessground/dist/board.js"() {
      init_util();
      init_premove();
      canMove = (state2, orig, dest) => {
        var _a, _b;
        return orig !== dest && isMovable(state2, orig) && (state2.movable.free || !!((_b = (_a = state2.movable.dests) === null || _a === void 0 ? void 0 : _a.get(orig)) === null || _b === void 0 ? void 0 : _b.includes(dest)));
      };
      whitePov = (s) => s.orientation === "white";
    }
  });

  // node_modules/chessground/dist/fen.js
  function read(fen) {
    if (fen === "start")
      fen = initial;
    const pieces = /* @__PURE__ */ new Map();
    let row = 7, col = 0;
    for (const c of fen) {
      switch (c) {
        case " ":
        case "[":
          return pieces;
        case "/":
          --row;
          if (row < 0)
            return pieces;
          col = 0;
          break;
        case "~": {
          const piece = pieces.get(pos2key([col - 1, row]));
          if (piece)
            piece.promoted = true;
          break;
        }
        default: {
          const nb = c.charCodeAt(0);
          if (nb < 57)
            col += nb - 48;
          else {
            const role = c.toLowerCase();
            pieces.set(pos2key([col, row]), {
              role: roles[role],
              color: c === role ? "black" : "white"
            });
            ++col;
          }
        }
      }
    }
    return pieces;
  }
  function write(pieces) {
    return invRanks.map((y) => files.map((x) => {
      const piece = pieces.get(x + y);
      if (piece) {
        let p = letters[piece.role];
        if (piece.color === "white")
          p = p.toUpperCase();
        if (piece.promoted)
          p += "~";
        return p;
      } else
        return "1";
    }).join("")).join("/").replace(/1{2,}/g, (s) => s.length.toString());
  }
  var initial, roles, letters;
  var init_fen = __esm({
    "node_modules/chessground/dist/fen.js"() {
      init_util();
      init_types();
      initial = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
      roles = {
        p: "pawn",
        r: "rook",
        n: "knight",
        b: "bishop",
        q: "queen",
        k: "king"
      };
      letters = {
        pawn: "p",
        rook: "r",
        knight: "n",
        bishop: "b",
        queen: "q",
        king: "k"
      };
    }
  });

  // node_modules/chessground/dist/config.js
  function applyAnimation(state2, config2) {
    if (config2.animation) {
      deepMerge(state2.animation, config2.animation);
      if ((state2.animation.duration || 0) < 70)
        state2.animation.enabled = false;
    }
  }
  function configure(state2, config2) {
    var _a, _b, _c;
    if ((_a = config2.movable) === null || _a === void 0 ? void 0 : _a.dests)
      state2.movable.dests = void 0;
    if ((_b = config2.drawable) === null || _b === void 0 ? void 0 : _b.autoShapes)
      state2.drawable.autoShapes = [];
    deepMerge(state2, config2);
    if (config2.fen) {
      state2.pieces = read(config2.fen);
      state2.drawable.shapes = ((_c = config2.drawable) === null || _c === void 0 ? void 0 : _c.shapes) || [];
    }
    if ("check" in config2)
      setCheck(state2, config2.check || false);
    if ("lastMove" in config2 && !config2.lastMove)
      state2.lastMove = void 0;
    else if (config2.lastMove)
      state2.lastMove = config2.lastMove;
    if (state2.selected)
      setSelected(state2, state2.selected);
    applyAnimation(state2, config2);
    if (!state2.movable.rookCastle && state2.movable.dests) {
      const rank2 = state2.movable.color === "white" ? "1" : "8", kingStartPos = "e" + rank2, dests = state2.movable.dests.get(kingStartPos), king2 = state2.pieces.get(kingStartPos);
      if (!dests || !king2 || king2.role !== "king")
        return;
      state2.movable.dests.set(kingStartPos, dests.filter((d) => !(d === "a" + rank2 && dests.includes("c" + rank2)) && !(d === "h" + rank2 && dests.includes("g" + rank2))));
    }
  }
  function deepMerge(base, extend) {
    for (const key in extend) {
      if (key === "__proto__" || key === "constructor" || !Object.prototype.hasOwnProperty.call(extend, key))
        continue;
      if (Object.prototype.hasOwnProperty.call(base, key) && isPlainObject(base[key]) && isPlainObject(extend[key]))
        deepMerge(base[key], extend[key]);
      else
        base[key] = extend[key];
    }
  }
  function isPlainObject(o) {
    if (typeof o !== "object" || o === null)
      return false;
    const proto = Object.getPrototypeOf(o);
    return proto === Object.prototype || proto === null;
  }
  var init_config = __esm({
    "node_modules/chessground/dist/config.js"() {
      init_board();
      init_fen();
    }
  });

  // node_modules/chessground/dist/anim.js
  function render(mutation, state2) {
    const result = mutation(state2);
    state2.dom.redraw();
    return result;
  }
  function computePlan(prevPieces, current) {
    const anims = /* @__PURE__ */ new Map(), animedOrigs = [], fadings = /* @__PURE__ */ new Map(), missings = [], news = [], prePieces = /* @__PURE__ */ new Map();
    let curP, preP, vector;
    for (const [k, p] of prevPieces) {
      prePieces.set(k, makePiece(k, p));
    }
    for (const key of allKeys) {
      curP = current.pieces.get(key);
      preP = prePieces.get(key);
      if (curP) {
        if (preP) {
          if (!samePiece(curP, preP.piece)) {
            missings.push(preP);
            news.push(makePiece(key, curP));
          }
        } else
          news.push(makePiece(key, curP));
      } else if (preP)
        missings.push(preP);
    }
    for (const newP of news) {
      preP = closer(newP, missings.filter((p) => samePiece(newP.piece, p.piece)));
      if (preP) {
        vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
        anims.set(newP.key, vector.concat(vector));
        animedOrigs.push(preP.key);
      }
    }
    for (const p of missings) {
      if (!animedOrigs.includes(p.key))
        fadings.set(p.key, p.piece);
    }
    return {
      anims,
      fadings
    };
  }
  function step(state2, now) {
    const cur = state2.animation.current;
    if (cur === void 0) {
      if (!state2.dom.destroyed)
        state2.dom.redrawNow();
      return;
    }
    const rest = 1 - (now - cur.start) * cur.frequency;
    if (rest <= 0) {
      state2.animation.current = void 0;
      state2.dom.redrawNow();
    } else {
      const ease = easing(rest);
      for (const cfg of cur.plan.anims.values()) {
        cfg[2] = cfg[0] * ease;
        cfg[3] = cfg[1] * ease;
      }
      state2.dom.redrawNow(true);
      requestAnimationFrame((now2 = performance.now()) => step(state2, now2));
    }
  }
  function animate(mutation, state2) {
    const prevPieces = new Map(state2.pieces);
    const result = mutation(state2);
    const plan = computePlan(prevPieces, state2);
    if (plan.anims.size || plan.fadings.size) {
      const alreadyRunning = state2.animation.current && state2.animation.current.start;
      state2.animation.current = {
        start: performance.now(),
        frequency: 1 / state2.animation.duration,
        plan
      };
      if (!alreadyRunning)
        step(state2, performance.now());
    } else {
      state2.dom.redraw();
    }
    return result;
  }
  var anim, makePiece, closer, easing;
  var init_anim = __esm({
    "node_modules/chessground/dist/anim.js"() {
      init_util();
      anim = (mutation, state2) => state2.animation.enabled ? animate(mutation, state2) : render(mutation, state2);
      makePiece = (key, piece) => ({
        key,
        pos: key2pos(key),
        piece
      });
      closer = (piece, pieces) => pieces.sort((p1, p2) => distanceSq(piece.pos, p1.pos) - distanceSq(piece.pos, p2.pos))[0];
      easing = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
  });

  // node_modules/chessground/dist/draw.js
  function start(state2, e) {
    if (e.touches && e.touches.length > 1)
      return;
    e.stopPropagation();
    e.preventDefault();
    e.ctrlKey ? unselect(state2) : cancelMove(state2);
    const pos = eventPosition(e), orig = getKeyAtDomPos(pos, whitePov(state2), state2.dom.bounds());
    if (!orig)
      return;
    state2.drawable.current = {
      orig,
      pos,
      brush: eventBrush(e),
      snapToValidMove: state2.drawable.defaultSnapToValidMove
    };
    processDraw(state2);
  }
  function processDraw(state2) {
    requestAnimationFrame(() => {
      const cur = state2.drawable.current;
      if (cur) {
        const keyAtDomPos = getKeyAtDomPos(cur.pos, whitePov(state2), state2.dom.bounds());
        if (!keyAtDomPos) {
          cur.snapToValidMove = false;
        }
        const mouseSq = cur.snapToValidMove ? getSnappedKeyAtDomPos(cur.orig, cur.pos, whitePov(state2), state2.dom.bounds()) : keyAtDomPos;
        if (mouseSq !== cur.mouseSq) {
          cur.mouseSq = mouseSq;
          cur.dest = mouseSq !== cur.orig ? mouseSq : void 0;
          state2.dom.redrawNow();
        }
        processDraw(state2);
      }
    });
  }
  function move(state2, e) {
    if (state2.drawable.current)
      state2.drawable.current.pos = eventPosition(e);
  }
  function end(state2) {
    const cur = state2.drawable.current;
    if (cur) {
      if (cur.mouseSq)
        addShape(state2.drawable, cur);
      cancel(state2);
    }
  }
  function cancel(state2) {
    if (state2.drawable.current) {
      state2.drawable.current = void 0;
      state2.dom.redraw();
    }
  }
  function clear(state2) {
    if (state2.drawable.shapes.length) {
      state2.drawable.shapes = [];
      state2.dom.redraw();
      onChange(state2.drawable);
    }
  }
  function eventBrush(e) {
    var _a;
    const modA = (e.shiftKey || e.ctrlKey) && isRightButton(e);
    const modB = e.altKey || e.metaKey || ((_a = e.getModifierState) === null || _a === void 0 ? void 0 : _a.call(e, "AltGraph"));
    return brushes[(modA ? 1 : 0) + (modB ? 2 : 0)];
  }
  function addShape(drawable, cur) {
    const sameShape = (s) => s.orig === cur.orig && s.dest === cur.dest;
    const similar = drawable.shapes.find(sameShape);
    if (similar)
      drawable.shapes = drawable.shapes.filter((s) => !sameShape(s));
    if (!similar || similar.brush !== cur.brush)
      drawable.shapes.push({
        orig: cur.orig,
        dest: cur.dest,
        brush: cur.brush
      });
    onChange(drawable);
  }
  function onChange(drawable) {
    if (drawable.onChange)
      drawable.onChange(drawable.shapes);
  }
  var brushes;
  var init_draw = __esm({
    "node_modules/chessground/dist/draw.js"() {
      init_board();
      init_util();
      brushes = ["green", "red", "blue", "yellow"];
    }
  });

  // node_modules/chessground/dist/drag.js
  function start2(s, e) {
    if (!(s.trustAllEvents || e.isTrusted))
      return;
    if (e.buttons !== void 0 && e.buttons > 1)
      return;
    if (e.touches && e.touches.length > 1)
      return;
    const bounds = s.dom.bounds(), position = eventPosition(e), orig = getKeyAtDomPos(position, whitePov(s), bounds);
    if (!orig)
      return;
    const piece = s.pieces.get(orig);
    const previouslySelected = s.selected;
    if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || !piece || piece.color !== s.turnColor))
      clear(s);
    if (e.cancelable !== false && (!e.touches || s.blockTouchScroll || piece || previouslySelected || pieceCloseTo(s, position)))
      e.preventDefault();
    else if (e.touches)
      return;
    const hadPremove = !!s.premovable.current;
    const hadPredrop = !!s.predroppable.current;
    s.stats.ctrlKey = e.ctrlKey;
    if (s.selected && canMove(s, s.selected, orig)) {
      anim((state2) => selectSquare(state2, orig), s);
    } else {
      selectSquare(s, orig);
    }
    const stillSelected = s.selected === orig;
    const element = pieceElementByKey(s, orig);
    if (piece && element && stillSelected && isDraggable(s, orig)) {
      s.draggable.current = {
        orig,
        piece,
        origPos: position,
        pos: position,
        started: s.draggable.autoDistance && s.stats.dragged,
        element,
        previouslySelected,
        originTarget: e.target,
        keyHasChanged: false
      };
      element.cgDragging = true;
      element.classList.add("dragging");
      const ghost = s.dom.elements.ghost;
      if (ghost) {
        ghost.className = `ghost ${piece.color} ${piece.role}`;
        translate(ghost, posToTranslate(bounds)(key2pos(orig), whitePov(s)));
        setVisible(ghost, true);
      }
      processDrag(s);
    } else {
      if (hadPremove)
        unsetPremove(s);
      if (hadPredrop)
        unsetPredrop(s);
    }
    s.dom.redraw();
  }
  function pieceCloseTo(s, pos) {
    const asWhite = whitePov(s), bounds = s.dom.bounds(), radiusSq = Math.pow(bounds.width / 8, 2);
    for (const key of s.pieces.keys()) {
      const center = computeSquareCenter(key, asWhite, bounds);
      if (distanceSq(center, pos) <= radiusSq)
        return true;
    }
    return false;
  }
  function dragNewPiece(s, piece, e, force) {
    const key = "a0";
    s.pieces.set(key, piece);
    s.dom.redraw();
    const position = eventPosition(e);
    s.draggable.current = {
      orig: key,
      piece,
      origPos: position,
      pos: position,
      started: true,
      element: () => pieceElementByKey(s, key),
      originTarget: e.target,
      newPiece: true,
      force: !!force,
      keyHasChanged: false
    };
    processDrag(s);
  }
  function processDrag(s) {
    requestAnimationFrame(() => {
      var _a;
      const cur = s.draggable.current;
      if (!cur)
        return;
      if ((_a = s.animation.current) === null || _a === void 0 ? void 0 : _a.plan.anims.has(cur.orig))
        s.animation.current = void 0;
      const origPiece = s.pieces.get(cur.orig);
      if (!origPiece || !samePiece(origPiece, cur.piece))
        cancel2(s);
      else {
        if (!cur.started && distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 2))
          cur.started = true;
        if (cur.started) {
          if (typeof cur.element === "function") {
            const found = cur.element();
            if (!found)
              return;
            found.cgDragging = true;
            found.classList.add("dragging");
            cur.element = found;
          }
          const bounds = s.dom.bounds();
          translate(cur.element, [
            cur.pos[0] - bounds.left - bounds.width / 16,
            cur.pos[1] - bounds.top - bounds.height / 16
          ]);
          cur.keyHasChanged || (cur.keyHasChanged = cur.orig !== getKeyAtDomPos(cur.pos, whitePov(s), bounds));
        }
      }
      processDrag(s);
    });
  }
  function move2(s, e) {
    if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
      s.draggable.current.pos = eventPosition(e);
    }
  }
  function end2(s, e) {
    const cur = s.draggable.current;
    if (!cur)
      return;
    if (e.type === "touchend" && e.cancelable !== false)
      e.preventDefault();
    if (e.type === "touchend" && cur.originTarget !== e.target && !cur.newPiece) {
      s.draggable.current = void 0;
      return;
    }
    unsetPremove(s);
    unsetPredrop(s);
    const eventPos = eventPosition(e) || cur.pos;
    const dest = getKeyAtDomPos(eventPos, whitePov(s), s.dom.bounds());
    if (dest && cur.started && cur.orig !== dest) {
      if (cur.newPiece)
        dropNewPiece(s, cur.orig, dest, cur.force);
      else {
        s.stats.ctrlKey = e.ctrlKey;
        if (userMove(s, cur.orig, dest))
          s.stats.dragged = true;
      }
    } else if (cur.newPiece) {
      s.pieces.delete(cur.orig);
    } else if (s.draggable.deleteOnDropOff && !dest) {
      s.pieces.delete(cur.orig);
      callUserFunction(s.events.change);
    }
    if ((cur.orig === cur.previouslySelected || cur.keyHasChanged) && (cur.orig === dest || !dest))
      unselect(s);
    else if (!s.selectable.enabled)
      unselect(s);
    removeDragElements(s);
    s.draggable.current = void 0;
    s.dom.redraw();
  }
  function cancel2(s) {
    const cur = s.draggable.current;
    if (cur) {
      if (cur.newPiece)
        s.pieces.delete(cur.orig);
      s.draggable.current = void 0;
      unselect(s);
      removeDragElements(s);
      s.dom.redraw();
    }
  }
  function removeDragElements(s) {
    const e = s.dom.elements;
    if (e.ghost)
      setVisible(e.ghost, false);
  }
  function pieceElementByKey(s, key) {
    let el = s.dom.elements.board.firstChild;
    while (el) {
      if (el.cgKey === key && el.tagName === "PIECE")
        return el;
      el = el.nextSibling;
    }
    return;
  }
  var init_drag = __esm({
    "node_modules/chessground/dist/drag.js"() {
      init_board();
      init_util();
      init_draw();
      init_anim();
    }
  });

  // node_modules/chessground/dist/explosion.js
  function explosion(state2, keys) {
    state2.exploding = { stage: 1, keys };
    state2.dom.redraw();
    setTimeout(() => {
      setStage(state2, 2);
      setTimeout(() => setStage(state2, void 0), 120);
    }, 120);
  }
  function setStage(state2, stage) {
    if (state2.exploding) {
      if (stage)
        state2.exploding.stage = stage;
      else
        state2.exploding = void 0;
      state2.dom.redraw();
    }
  }
  var init_explosion = __esm({
    "node_modules/chessground/dist/explosion.js"() {
    }
  });

  // node_modules/chessground/dist/api.js
  function start3(state2, redrawAll) {
    function toggleOrientation2() {
      toggleOrientation(state2);
      redrawAll();
    }
    return {
      set(config2) {
        if (config2.orientation && config2.orientation !== state2.orientation)
          toggleOrientation2();
        applyAnimation(state2, config2);
        (config2.fen ? anim : render)((state3) => configure(state3, config2), state2);
      },
      state: state2,
      getFen: () => write(state2.pieces),
      toggleOrientation: toggleOrientation2,
      setPieces(pieces) {
        anim((state3) => setPieces(state3, pieces), state2);
      },
      selectSquare(key, force) {
        if (key)
          anim((state3) => selectSquare(state3, key, force), state2);
        else if (state2.selected) {
          unselect(state2);
          state2.dom.redraw();
        }
      },
      move(orig, dest) {
        anim((state3) => baseMove(state3, orig, dest), state2);
      },
      newPiece(piece, key) {
        anim((state3) => baseNewPiece(state3, piece, key), state2);
      },
      playPremove() {
        if (state2.premovable.current) {
          if (anim(playPremove, state2))
            return true;
          state2.dom.redraw();
        }
        return false;
      },
      playPredrop(validate) {
        if (state2.predroppable.current) {
          const result = playPredrop(state2, validate);
          state2.dom.redraw();
          return result;
        }
        return false;
      },
      cancelPremove() {
        render(unsetPremove, state2);
      },
      cancelPredrop() {
        render(unsetPredrop, state2);
      },
      cancelMove() {
        render((state3) => {
          cancelMove(state3);
          cancel2(state3);
        }, state2);
      },
      stop() {
        render((state3) => {
          stop(state3);
          cancel2(state3);
        }, state2);
      },
      explode(keys) {
        explosion(state2, keys);
      },
      setAutoShapes(shapes) {
        render((state3) => state3.drawable.autoShapes = shapes, state2);
      },
      setShapes(shapes) {
        render((state3) => state3.drawable.shapes = shapes, state2);
      },
      getKeyAtDomPos(pos) {
        return getKeyAtDomPos(pos, whitePov(state2), state2.dom.bounds());
      },
      redrawAll,
      dragNewPiece(piece, event, force) {
        dragNewPiece(state2, piece, event, force);
      },
      destroy() {
        stop(state2);
        state2.dom.unbind && state2.dom.unbind();
        state2.dom.destroyed = true;
      }
    };
  }
  var init_api = __esm({
    "node_modules/chessground/dist/api.js"() {
      init_board();
      init_fen();
      init_config();
      init_anim();
      init_drag();
      init_explosion();
    }
  });

  // node_modules/chessground/dist/state.js
  function defaults() {
    return {
      pieces: read(initial),
      orientation: "white",
      turnColor: "white",
      coordinates: true,
      coordinatesOnSquares: false,
      ranksPosition: "right",
      autoCastle: true,
      viewOnly: false,
      disableContextMenu: false,
      addPieceZIndex: false,
      blockTouchScroll: false,
      pieceKey: false,
      trustAllEvents: false,
      highlight: {
        lastMove: true,
        check: true
      },
      animation: {
        enabled: true,
        duration: 200
      },
      movable: {
        free: true,
        color: "both",
        showDests: true,
        events: {},
        rookCastle: true
      },
      premovable: {
        enabled: true,
        showDests: true,
        castle: true,
        events: {}
      },
      predroppable: {
        enabled: false,
        events: {}
      },
      draggable: {
        enabled: true,
        distance: 3,
        autoDistance: true,
        showGhost: true,
        deleteOnDropOff: false
      },
      dropmode: {
        active: false
      },
      selectable: {
        enabled: true
      },
      stats: {
        // on touchscreen, default to "tap-tap" moves
        // instead of drag
        dragged: !("ontouchstart" in window)
      },
      events: {},
      drawable: {
        enabled: true,
        // can draw
        visible: true,
        // can view
        defaultSnapToValidMove: true,
        eraseOnClick: true,
        shapes: [],
        autoShapes: [],
        brushes: {
          green: { key: "g", color: "#15781B", opacity: 1, lineWidth: 10 },
          red: { key: "r", color: "#882020", opacity: 1, lineWidth: 10 },
          blue: { key: "b", color: "#003088", opacity: 1, lineWidth: 10 },
          yellow: { key: "y", color: "#e68f00", opacity: 1, lineWidth: 10 },
          paleBlue: { key: "pb", color: "#003088", opacity: 0.4, lineWidth: 15 },
          paleGreen: { key: "pg", color: "#15781B", opacity: 0.4, lineWidth: 15 },
          paleRed: { key: "pr", color: "#882020", opacity: 0.4, lineWidth: 15 },
          paleGrey: {
            key: "pgr",
            color: "#4a4a4a",
            opacity: 0.35,
            lineWidth: 15
          },
          purple: { key: "purple", color: "#68217a", opacity: 0.65, lineWidth: 10 },
          pink: { key: "pink", color: "#ee2080", opacity: 0.5, lineWidth: 10 },
          white: { key: "white", color: "white", opacity: 1, lineWidth: 10 }
        },
        prevSvgHash: ""
      },
      hold: timer()
    };
  }
  var init_state = __esm({
    "node_modules/chessground/dist/state.js"() {
      init_fen();
      init_util();
    }
  });

  // node_modules/chessground/dist/svg.js
  function createDefs() {
    const defs = createElement("defs");
    const filter = setAttributes(createElement("filter"), { id: "cg-filter-blur" });
    filter.appendChild(setAttributes(createElement("feGaussianBlur"), { stdDeviation: "0.019" }));
    defs.appendChild(filter);
    return defs;
  }
  function renderSvg(state2, shapesEl, customsEl) {
    var _a;
    const d = state2.drawable, curD = d.current, cur = curD && curD.mouseSq ? curD : void 0, dests = /* @__PURE__ */ new Map(), bounds = state2.dom.bounds(), nonPieceAutoShapes = d.autoShapes.filter((autoShape) => !autoShape.piece);
    for (const s of d.shapes.concat(nonPieceAutoShapes).concat(cur ? [cur] : [])) {
      if (!s.dest)
        continue;
      const sources = (_a = dests.get(s.dest)) !== null && _a !== void 0 ? _a : /* @__PURE__ */ new Set(), from = pos2user(orient(key2pos(s.orig), state2.orientation), bounds), to = pos2user(orient(key2pos(s.dest), state2.orientation), bounds);
      sources.add(moveAngle(from, to));
      dests.set(s.dest, sources);
    }
    const shapes = d.shapes.concat(nonPieceAutoShapes).map((s) => {
      return {
        shape: s,
        current: false,
        hash: shapeHash(s, isShort(s.dest, dests), false, bounds)
      };
    });
    if (cur)
      shapes.push({
        shape: cur,
        current: true,
        hash: shapeHash(cur, isShort(cur.dest, dests), true, bounds)
      });
    const fullHash = shapes.map((sc) => sc.hash).join(";");
    if (fullHash === state2.drawable.prevSvgHash)
      return;
    state2.drawable.prevSvgHash = fullHash;
    const defsEl = shapesEl.querySelector("defs");
    syncDefs(d, shapes, defsEl);
    syncShapes(shapes, shapesEl.querySelector("g"), customsEl.querySelector("g"), (s) => renderShape(state2, s, d.brushes, dests, bounds));
  }
  function syncDefs(d, shapes, defsEl) {
    var _a;
    const brushes2 = /* @__PURE__ */ new Map();
    let brush;
    for (const s of shapes.filter((s2) => s2.shape.dest && s2.shape.brush)) {
      brush = makeCustomBrush(d.brushes[s.shape.brush], s.shape.modifiers);
      if ((_a = s.shape.modifiers) === null || _a === void 0 ? void 0 : _a.hilite)
        brushes2.set(hilite(brush).key, hilite(brush));
      brushes2.set(brush.key, brush);
    }
    const keysInDom = /* @__PURE__ */ new Set();
    let el = defsEl.firstElementChild;
    while (el) {
      keysInDom.add(el.getAttribute("cgKey"));
      el = el.nextElementSibling;
    }
    for (const [key, brush2] of brushes2.entries()) {
      if (!keysInDom.has(key))
        defsEl.appendChild(renderMarker(brush2));
    }
  }
  function syncShapes(syncables, shapes, customs, renderShape3) {
    const hashesInDom = /* @__PURE__ */ new Map();
    for (const sc of syncables)
      hashesInDom.set(sc.hash, false);
    for (const root of [shapes, customs]) {
      const toRemove = [];
      let el = root.firstElementChild, elHash;
      while (el) {
        elHash = el.getAttribute("cgHash");
        if (hashesInDom.has(elHash))
          hashesInDom.set(elHash, true);
        else
          toRemove.push(el);
        el = el.nextElementSibling;
      }
      for (const el2 of toRemove)
        root.removeChild(el2);
    }
    for (const sc of syncables.filter((s) => !hashesInDom.get(s.hash))) {
      for (const svg of renderShape3(sc)) {
        if (svg.isCustom)
          customs.appendChild(svg.el);
        else
          shapes.appendChild(svg.el);
      }
    }
  }
  function shapeHash({ orig, dest, brush, piece, modifiers, customSvg, label }, shorten, current, bounds) {
    var _a, _b;
    return [
      bounds.width,
      bounds.height,
      current,
      orig,
      dest,
      brush,
      shorten && "-",
      piece && pieceHash(piece),
      modifiers && modifiersHash(modifiers),
      customSvg && `custom-${textHash(customSvg.html)},${(_b = (_a = customSvg.center) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : "o"}`,
      label && `label-${textHash(label.text)}`
    ].filter((x) => x).join(",");
  }
  function pieceHash(piece) {
    return [piece.color, piece.role, piece.scale].filter((x) => x).join(",");
  }
  function modifiersHash(m) {
    return [m.lineWidth, m.hilite && "*"].filter((x) => x).join(",");
  }
  function textHash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i) >>> 0;
    }
    return h.toString();
  }
  function renderShape(state2, { shape, current, hash: hash2 }, brushes2, dests, bounds) {
    var _a, _b;
    const from = pos2user(orient(key2pos(shape.orig), state2.orientation), bounds), to = shape.dest ? pos2user(orient(key2pos(shape.dest), state2.orientation), bounds) : from, brush = shape.brush && makeCustomBrush(brushes2[shape.brush], shape.modifiers), slots = dests.get(shape.dest), svgs = [];
    if (brush) {
      const el = setAttributes(createElement("g"), { cgHash: hash2 });
      svgs.push({ el });
      if (from[0] !== to[0] || from[1] !== to[1])
        el.appendChild(renderArrow(shape, brush, from, to, current, isShort(shape.dest, dests)));
      else
        el.appendChild(renderCircle(brushes2[shape.brush], from, current, bounds));
    }
    if (shape.label) {
      const label = shape.label;
      (_a = label.fill) !== null && _a !== void 0 ? _a : label.fill = shape.brush && brushes2[shape.brush].color;
      const corner = shape.brush ? void 0 : "tr";
      svgs.push({ el: renderLabel(label, hash2, from, to, slots, corner), isCustom: true });
    }
    if (shape.customSvg) {
      const on = (_b = shape.customSvg.center) !== null && _b !== void 0 ? _b : "orig";
      const [x, y] = on === "label" ? labelCoords(from, to, slots).map((c) => c - 0.5) : on === "dest" ? to : from;
      const el = setAttributes(createElement("g"), { transform: `translate(${x},${y})`, cgHash: hash2 });
      el.innerHTML = `<svg width="1" height="1" viewBox="0 0 100 100">${shape.customSvg.html}</svg>`;
      svgs.push({ el, isCustom: true });
    }
    return svgs;
  }
  function renderCircle(brush, at, current, bounds) {
    const widths = circleWidth(), radius = (bounds.width + bounds.height) / (4 * Math.max(bounds.width, bounds.height));
    return setAttributes(createElement("circle"), {
      stroke: brush.color,
      "stroke-width": widths[current ? 0 : 1],
      fill: "none",
      opacity: opacity(brush, current),
      cx: at[0],
      cy: at[1],
      r: radius - widths[1] / 2
    });
  }
  function hilite(brush) {
    return ["#ffffff", "#fff", "white"].includes(brush.color) ? hilites["hilitePrimary"] : hilites["hiliteWhite"];
  }
  function renderArrow(s, brush, from, to, current, shorten) {
    var _a;
    function renderLine(isHilite) {
      var _a2;
      const m = arrowMargin(shorten && !current), dx = to[0] - from[0], dy = to[1] - from[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
      return setAttributes(createElement("line"), {
        stroke: isHilite ? hilite(brush).color : brush.color,
        "stroke-width": lineWidth(brush, current) + (isHilite ? 0.04 : 0),
        "stroke-linecap": "round",
        "marker-end": `url(#arrowhead-${isHilite ? hilite(brush).key : brush.key})`,
        opacity: ((_a2 = s.modifiers) === null || _a2 === void 0 ? void 0 : _a2.hilite) ? 1 : opacity(brush, current),
        x1: from[0],
        y1: from[1],
        x2: to[0] - xo,
        y2: to[1] - yo
      });
    }
    if (!((_a = s.modifiers) === null || _a === void 0 ? void 0 : _a.hilite))
      return renderLine(false);
    const g = createElement("g");
    const blurred = setAttributes(createElement("g"), { filter: "url(#cg-filter-blur)" });
    blurred.appendChild(filterBox(from, to));
    blurred.appendChild(renderLine(true));
    g.appendChild(blurred);
    g.appendChild(renderLine(false));
    return g;
  }
  function renderMarker(brush) {
    const marker = setAttributes(createElement("marker"), {
      id: "arrowhead-" + brush.key,
      orient: "auto",
      overflow: "visible",
      markerWidth: 4,
      markerHeight: 4,
      refX: brush.key.startsWith("hilite") ? 1.86 : 2.05,
      refY: 2
    });
    marker.appendChild(setAttributes(createElement("path"), {
      d: "M0,0 V4 L3,2 Z",
      fill: brush.color
    }));
    marker.setAttribute("cgKey", brush.key);
    return marker;
  }
  function renderLabel(label, hash2, from, to, slots, corner) {
    var _a;
    const labelSize = 0.4, fontSize = labelSize * 0.75 ** label.text.length, at = labelCoords(from, to, slots), cornerOff = corner === "tr" ? 0.4 : 0, g = setAttributes(createElement("g"), {
      transform: `translate(${at[0] + cornerOff},${at[1] - cornerOff})`,
      cgHash: hash2
    });
    g.appendChild(setAttributes(createElement("circle"), {
      r: labelSize / 2,
      "fill-opacity": corner ? 1 : 0.8,
      "stroke-opacity": corner ? 1 : 0.7,
      "stroke-width": 0.03,
      fill: (_a = label.fill) !== null && _a !== void 0 ? _a : "#666",
      stroke: "white"
    }));
    const labelEl = setAttributes(createElement("text"), {
      "font-size": fontSize,
      "font-family": "Noto Sans",
      "text-anchor": "middle",
      fill: "white",
      y: 0.13 * 0.75 ** label.text.length
    });
    labelEl.innerHTML = label.text;
    g.appendChild(labelEl);
    return g;
  }
  function orient(pos, color) {
    return color === "white" ? pos : [7 - pos[0], 7 - pos[1]];
  }
  function isShort(dest, dests) {
    return true === (dest && dests.has(dest) && dests.get(dest).size > 1);
  }
  function createElement(tagName) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }
  function setAttributes(el, attrs) {
    for (const key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key))
        el.setAttribute(key, attrs[key]);
    }
    return el;
  }
  function makeCustomBrush(base, modifiers) {
    return !modifiers ? base : {
      color: base.color,
      opacity: Math.round(base.opacity * 10) / 10,
      lineWidth: Math.round(modifiers.lineWidth || base.lineWidth),
      key: [base.key, modifiers.lineWidth].filter((x) => x).join("")
    };
  }
  function circleWidth() {
    return [3 / 64, 4 / 64];
  }
  function lineWidth(brush, current) {
    return (brush.lineWidth || 10) * (current ? 0.85 : 1) / 64;
  }
  function opacity(brush, current) {
    return (brush.opacity || 1) * (current ? 0.9 : 1);
  }
  function arrowMargin(shorten) {
    return (shorten ? 20 : 10) / 64;
  }
  function pos2user(pos, bounds) {
    const xScale = Math.min(1, bounds.width / bounds.height);
    const yScale = Math.min(1, bounds.height / bounds.width);
    return [(pos[0] - 3.5) * xScale, (3.5 - pos[1]) * yScale];
  }
  function filterBox(from, to) {
    const box = {
      from: [Math.floor(Math.min(from[0], to[0])), Math.floor(Math.min(from[1], to[1]))],
      to: [Math.ceil(Math.max(from[0], to[0])), Math.ceil(Math.max(from[1], to[1]))]
    };
    return setAttributes(createElement("rect"), {
      x: box.from[0],
      y: box.from[1],
      width: box.to[0] - box.from[0],
      height: box.to[1] - box.from[1],
      fill: "none",
      stroke: "none"
    });
  }
  function moveAngle(from, to, asSlot = true) {
    const angle = Math.atan2(to[1] - from[1], to[0] - from[0]) + Math.PI;
    return asSlot ? (Math.round(angle * 8 / Math.PI) + 16) % 16 : angle;
  }
  function dist(from, to) {
    return Math.sqrt([from[0] - to[0], from[1] - to[1]].reduce((acc, x) => acc + x * x, 0));
  }
  function labelCoords(from, to, slots) {
    let mag = dist(from, to);
    const angle = moveAngle(from, to, false);
    if (slots) {
      mag -= 33 / 64;
      if (slots.size > 1) {
        mag -= 10 / 64;
        const slot = moveAngle(from, to);
        if (slots.has((slot + 1) % 16) || slots.has((slot + 15) % 16)) {
          if (slot & 1)
            mag -= 0.4;
        }
      }
    }
    return [from[0] - Math.cos(angle) * mag, from[1] - Math.sin(angle) * mag].map((c) => c + 0.5);
  }
  var hilites;
  var init_svg = __esm({
    "node_modules/chessground/dist/svg.js"() {
      init_util();
      hilites = {
        hilitePrimary: { key: "hilitePrimary", color: "#3291ff", opacity: 1, lineWidth: 1 },
        hiliteWhite: { key: "hiliteWhite", color: "#ffffff", opacity: 1, lineWidth: 1 }
      };
    }
  });

  // node_modules/chessground/dist/wrap.js
  function renderWrap(element, s) {
    element.innerHTML = "";
    element.classList.add("cg-wrap");
    for (const c of colors)
      element.classList.toggle("orientation-" + c, s.orientation === c);
    element.classList.toggle("manipulable", !s.viewOnly);
    const container = createEl("cg-container");
    element.appendChild(container);
    const board = createEl("cg-board");
    container.appendChild(board);
    let svg;
    let customSvg;
    let autoPieces;
    if (s.drawable.visible) {
      svg = setAttributes(createElement("svg"), {
        class: "cg-shapes",
        viewBox: "-4 -4 8 8",
        preserveAspectRatio: "xMidYMid slice"
      });
      svg.appendChild(createDefs());
      svg.appendChild(createElement("g"));
      customSvg = setAttributes(createElement("svg"), {
        class: "cg-custom-svgs",
        viewBox: "-3.5 -3.5 8 8",
        preserveAspectRatio: "xMidYMid slice"
      });
      customSvg.appendChild(createElement("g"));
      autoPieces = createEl("cg-auto-pieces");
      container.appendChild(svg);
      container.appendChild(customSvg);
      container.appendChild(autoPieces);
    }
    if (s.coordinates) {
      const orientClass = s.orientation === "black" ? " black" : "";
      const ranksPositionClass = s.ranksPosition === "left" ? " left" : "";
      if (s.coordinatesOnSquares) {
        const rankN = s.orientation === "white" ? (i) => i + 1 : (i) => 8 - i;
        files.forEach((f, i) => container.appendChild(renderCoords(ranks.map((r) => f + r), "squares rank" + rankN(i) + orientClass + ranksPositionClass)));
      } else {
        container.appendChild(renderCoords(ranks, "ranks" + orientClass + ranksPositionClass));
        container.appendChild(renderCoords(files, "files" + orientClass));
      }
    }
    let ghost;
    if (s.draggable.enabled && s.draggable.showGhost) {
      ghost = createEl("piece", "ghost");
      setVisible(ghost, false);
      container.appendChild(ghost);
    }
    return {
      board,
      container,
      wrap: element,
      ghost,
      svg,
      customSvg,
      autoPieces
    };
  }
  function renderCoords(elems, className) {
    const el = createEl("coords", className);
    let f;
    for (const elem of elems) {
      f = createEl("coord");
      f.textContent = elem;
      el.appendChild(f);
    }
    return el;
  }
  var init_wrap = __esm({
    "node_modules/chessground/dist/wrap.js"() {
      init_util();
      init_types();
      init_svg();
    }
  });

  // node_modules/chessground/dist/drop.js
  function drop(s, e) {
    if (!s.dropmode.active)
      return;
    unsetPremove(s);
    unsetPredrop(s);
    const piece = s.dropmode.piece;
    if (piece) {
      s.pieces.set("a0", piece);
      const position = eventPosition(e);
      const dest = position && getKeyAtDomPos(position, whitePov(s), s.dom.bounds());
      if (dest)
        dropNewPiece(s, "a0", dest);
    }
    s.dom.redraw();
  }
  var init_drop = __esm({
    "node_modules/chessground/dist/drop.js"() {
      init_board();
      init_util();
      init_drag();
    }
  });

  // node_modules/chessground/dist/events.js
  function bindBoard(s, onResize) {
    const boardEl = s.dom.elements.board;
    if ("ResizeObserver" in window)
      new ResizeObserver(onResize).observe(s.dom.elements.wrap);
    if (s.disableContextMenu || s.drawable.enabled) {
      boardEl.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    if (s.viewOnly)
      return;
    const onStart = startDragOrDraw(s);
    boardEl.addEventListener("touchstart", onStart, {
      passive: false
    });
    boardEl.addEventListener("mousedown", onStart, {
      passive: false
    });
  }
  function bindDocument(s, onResize) {
    const unbinds = [];
    if (!("ResizeObserver" in window))
      unbinds.push(unbindable(document.body, "chessground.resize", onResize));
    if (!s.viewOnly) {
      const onmove = dragOrDraw(s, move2, move);
      const onend = dragOrDraw(s, end2, end);
      for (const ev of ["touchmove", "mousemove"])
        unbinds.push(unbindable(document, ev, onmove));
      for (const ev of ["touchend", "mouseup"])
        unbinds.push(unbindable(document, ev, onend));
      const onScroll = () => s.dom.bounds.clear();
      unbinds.push(unbindable(document, "scroll", onScroll, { capture: true, passive: true }));
      unbinds.push(unbindable(window, "resize", onScroll, { passive: true }));
    }
    return () => unbinds.forEach((f) => f());
  }
  function unbindable(el, eventName, callback, options) {
    el.addEventListener(eventName, callback, options);
    return () => el.removeEventListener(eventName, callback, options);
  }
  var startDragOrDraw, dragOrDraw;
  var init_events = __esm({
    "node_modules/chessground/dist/events.js"() {
      init_drag();
      init_draw();
      init_drop();
      init_util();
      startDragOrDraw = (s) => (e) => {
        if (s.draggable.current)
          cancel2(s);
        else if (s.drawable.current)
          cancel(s);
        else if (e.shiftKey || isRightButton(e)) {
          if (s.drawable.enabled)
            start(s, e);
        } else if (!s.viewOnly) {
          if (s.dropmode.active)
            drop(s, e);
          else
            start2(s, e);
        }
      };
      dragOrDraw = (s, withDrag, withDraw) => (e) => {
        if (s.drawable.current) {
          if (s.drawable.enabled)
            withDraw(s, e);
        } else if (!s.viewOnly)
          withDrag(s, e);
      };
    }
  });

  // node_modules/chessground/dist/render.js
  function render2(s) {
    const asWhite = whitePov(s), posToTranslate2 = posToTranslate(s.dom.bounds()), boardEl = s.dom.elements.board, pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : /* @__PURE__ */ new Map(), fadings = curAnim ? curAnim.plan.fadings : /* @__PURE__ */ new Map(), curDrag = s.draggable.current, squares = computeSquareClasses(s), samePieces = /* @__PURE__ */ new Set(), sameSquares = /* @__PURE__ */ new Set(), movedPieces = /* @__PURE__ */ new Map(), movedSquares = /* @__PURE__ */ new Map();
    let k, el, pieceAtKey, elPieceName, anim2, fading, pMvdset, pMvd, sMvdset, sMvd;
    el = boardEl.firstChild;
    while (el) {
      k = el.cgKey;
      if (isPieceNode(el)) {
        pieceAtKey = pieces.get(k);
        anim2 = anims.get(k);
        fading = fadings.get(k);
        elPieceName = el.cgPiece;
        if (el.cgDragging && (!curDrag || curDrag.orig !== k)) {
          el.classList.remove("dragging");
          translate(el, posToTranslate2(key2pos(k), asWhite));
          el.cgDragging = false;
        }
        if (!fading && el.cgFading) {
          el.cgFading = false;
          el.classList.remove("fading");
        }
        if (pieceAtKey) {
          if (anim2 && el.cgAnimating && elPieceName === pieceNameOf(pieceAtKey)) {
            const pos = key2pos(k);
            pos[0] += anim2[2];
            pos[1] += anim2[3];
            el.classList.add("anim");
            translate(el, posToTranslate2(pos, asWhite));
          } else if (el.cgAnimating) {
            el.cgAnimating = false;
            el.classList.remove("anim");
            translate(el, posToTranslate2(key2pos(k), asWhite));
            if (s.addPieceZIndex)
              el.style.zIndex = posZIndex(key2pos(k), asWhite);
          }
          if (elPieceName === pieceNameOf(pieceAtKey) && (!fading || !el.cgFading)) {
            samePieces.add(k);
          } else {
            if (fading && elPieceName === pieceNameOf(fading)) {
              el.classList.add("fading");
              el.cgFading = true;
            } else {
              appendValue(movedPieces, elPieceName, el);
            }
          }
        } else {
          appendValue(movedPieces, elPieceName, el);
        }
      } else if (isSquareNode(el)) {
        const cn = el.className;
        if (squares.get(k) === cn)
          sameSquares.add(k);
        else
          appendValue(movedSquares, cn, el);
      }
      el = el.nextSibling;
    }
    for (const [sk, className] of squares) {
      if (!sameSquares.has(sk)) {
        sMvdset = movedSquares.get(className);
        sMvd = sMvdset && sMvdset.pop();
        const translation = posToTranslate2(key2pos(sk), asWhite);
        if (sMvd) {
          sMvd.cgKey = sk;
          translate(sMvd, translation);
        } else {
          const squareNode = createEl("square", className);
          squareNode.cgKey = sk;
          translate(squareNode, translation);
          boardEl.insertBefore(squareNode, boardEl.firstChild);
        }
      }
    }
    for (const [k2, p] of pieces) {
      anim2 = anims.get(k2);
      if (!samePieces.has(k2)) {
        pMvdset = movedPieces.get(pieceNameOf(p));
        pMvd = pMvdset && pMvdset.pop();
        if (pMvd) {
          pMvd.cgKey = k2;
          if (pMvd.cgFading) {
            pMvd.classList.remove("fading");
            pMvd.cgFading = false;
          }
          const pos = key2pos(k2);
          if (s.addPieceZIndex)
            pMvd.style.zIndex = posZIndex(pos, asWhite);
          if (anim2) {
            pMvd.cgAnimating = true;
            pMvd.classList.add("anim");
            pos[0] += anim2[2];
            pos[1] += anim2[3];
          }
          translate(pMvd, posToTranslate2(pos, asWhite));
        } else {
          const pieceName = pieceNameOf(p), pieceNode = createEl("piece", pieceName), pos = key2pos(k2);
          pieceNode.cgPiece = pieceName;
          pieceNode.cgKey = k2;
          if (anim2) {
            pieceNode.cgAnimating = true;
            pos[0] += anim2[2];
            pos[1] += anim2[3];
          }
          translate(pieceNode, posToTranslate2(pos, asWhite));
          if (s.addPieceZIndex)
            pieceNode.style.zIndex = posZIndex(pos, asWhite);
          boardEl.appendChild(pieceNode);
        }
      }
    }
    for (const nodes of movedPieces.values())
      removeNodes(s, nodes);
    for (const nodes of movedSquares.values())
      removeNodes(s, nodes);
  }
  function renderResized(s) {
    const asWhite = whitePov(s), posToTranslate2 = posToTranslate(s.dom.bounds());
    let el = s.dom.elements.board.firstChild;
    while (el) {
      if (isPieceNode(el) && !el.cgAnimating || isSquareNode(el)) {
        translate(el, posToTranslate2(key2pos(el.cgKey), asWhite));
      }
      el = el.nextSibling;
    }
  }
  function updateBounds(s) {
    var _a, _b;
    const bounds = s.dom.elements.wrap.getBoundingClientRect();
    const container = s.dom.elements.container;
    const ratio = bounds.height / bounds.width;
    const width = Math.floor(bounds.width * window.devicePixelRatio / 8) * 8 / window.devicePixelRatio;
    const height = width * ratio;
    container.style.width = width + "px";
    container.style.height = height + "px";
    s.dom.bounds.clear();
    (_a = s.addDimensionsCssVarsTo) === null || _a === void 0 ? void 0 : _a.style.setProperty("---cg-width", width + "px");
    (_b = s.addDimensionsCssVarsTo) === null || _b === void 0 ? void 0 : _b.style.setProperty("---cg-height", height + "px");
  }
  function removeNodes(s, nodes) {
    for (const node2 of nodes)
      s.dom.elements.board.removeChild(node2);
  }
  function posZIndex(pos, asWhite) {
    const minZ = 3;
    const rank2 = pos[1];
    const z = asWhite ? minZ + 7 - rank2 : minZ + rank2;
    return `${z}`;
  }
  function computeSquareClasses(s) {
    var _a, _b, _c;
    const squares = /* @__PURE__ */ new Map();
    if (s.lastMove && s.highlight.lastMove)
      for (const k of s.lastMove) {
        addSquare(squares, k, "last-move");
      }
    if (s.check && s.highlight.check)
      addSquare(squares, s.check, "check");
    if (s.selected) {
      addSquare(squares, s.selected, "selected");
      if (s.movable.showDests) {
        const dests = (_a = s.movable.dests) === null || _a === void 0 ? void 0 : _a.get(s.selected);
        if (dests)
          for (const k of dests) {
            addSquare(squares, k, "move-dest" + (s.pieces.has(k) ? " oc" : ""));
          }
        const pDests = (_c = (_b = s.premovable.customDests) === null || _b === void 0 ? void 0 : _b.get(s.selected)) !== null && _c !== void 0 ? _c : s.premovable.dests;
        if (pDests)
          for (const k of pDests) {
            addSquare(squares, k, "premove-dest" + (s.pieces.has(k) ? " oc" : ""));
          }
      }
    }
    const premove2 = s.premovable.current;
    if (premove2)
      for (const k of premove2)
        addSquare(squares, k, "current-premove");
    else if (s.predroppable.current)
      addSquare(squares, s.predroppable.current.key, "current-premove");
    const o = s.exploding;
    if (o)
      for (const k of o.keys)
        addSquare(squares, k, "exploding" + o.stage);
    if (s.highlight.custom) {
      s.highlight.custom.forEach((v, k) => {
        addSquare(squares, k, v);
      });
    }
    return squares;
  }
  function addSquare(squares, key, klass) {
    const classes = squares.get(key);
    if (classes)
      squares.set(key, `${classes} ${klass}`);
    else
      squares.set(key, klass);
  }
  function appendValue(map, key, value) {
    const arr = map.get(key);
    if (arr)
      arr.push(value);
    else
      map.set(key, [value]);
  }
  var isPieceNode, isSquareNode, pieceNameOf;
  var init_render = __esm({
    "node_modules/chessground/dist/render.js"() {
      init_util();
      init_board();
      isPieceNode = (el) => el.tagName === "PIECE";
      isSquareNode = (el) => el.tagName === "SQUARE";
      pieceNameOf = (piece) => `${piece.color} ${piece.role}`;
    }
  });

  // node_modules/chessground/dist/sync.js
  function syncShapes2(shapes, root, renderShape3) {
    const hashesInDom = /* @__PURE__ */ new Map(), toRemove = [];
    for (const sc of shapes)
      hashesInDom.set(sc.hash, false);
    let el = root.firstElementChild, elHash;
    while (el) {
      elHash = el.getAttribute("cgHash");
      if (hashesInDom.has(elHash))
        hashesInDom.set(elHash, true);
      else
        toRemove.push(el);
      el = el.nextElementSibling;
    }
    for (const el2 of toRemove)
      root.removeChild(el2);
    for (const sc of shapes) {
      if (!hashesInDom.get(sc.hash))
        root.appendChild(renderShape3(sc));
    }
  }
  var init_sync = __esm({
    "node_modules/chessground/dist/sync.js"() {
    }
  });

  // node_modules/chessground/dist/autoPieces.js
  function render3(state2, autoPieceEl) {
    const autoPieces = state2.drawable.autoShapes.filter((autoShape) => autoShape.piece);
    const autoPieceShapes = autoPieces.map((s) => {
      return {
        shape: s,
        hash: hash(s),
        current: false
      };
    });
    syncShapes2(autoPieceShapes, autoPieceEl, (shape) => renderShape2(state2, shape, state2.dom.bounds()));
  }
  function renderResized2(state2) {
    var _a;
    const asWhite = whitePov(state2), posToTranslate2 = posToTranslate(state2.dom.bounds());
    let el = (_a = state2.dom.elements.autoPieces) === null || _a === void 0 ? void 0 : _a.firstChild;
    while (el) {
      translateAndScale(el, posToTranslate2(key2pos(el.cgKey), asWhite), el.cgScale);
      el = el.nextSibling;
    }
  }
  function renderShape2(state2, { shape, hash: hash2 }, bounds) {
    var _a, _b, _c;
    const orig = shape.orig;
    const role = (_a = shape.piece) === null || _a === void 0 ? void 0 : _a.role;
    const color = (_b = shape.piece) === null || _b === void 0 ? void 0 : _b.color;
    const scale = (_c = shape.piece) === null || _c === void 0 ? void 0 : _c.scale;
    const pieceEl = createEl("piece", `${role} ${color}`);
    pieceEl.setAttribute("cgHash", hash2);
    pieceEl.cgKey = orig;
    pieceEl.cgScale = scale;
    translateAndScale(pieceEl, posToTranslate(bounds)(key2pos(orig), whitePov(state2)), scale);
    return pieceEl;
  }
  var hash;
  var init_autoPieces = __esm({
    "node_modules/chessground/dist/autoPieces.js"() {
      init_util();
      init_board();
      init_sync();
      hash = (autoPiece) => {
        var _a, _b, _c;
        return [autoPiece.orig, (_a = autoPiece.piece) === null || _a === void 0 ? void 0 : _a.role, (_b = autoPiece.piece) === null || _b === void 0 ? void 0 : _b.color, (_c = autoPiece.piece) === null || _c === void 0 ? void 0 : _c.scale].join(",");
      };
    }
  });

  // node_modules/chessground/dist/chessground.js
  function Chessground(element, config2) {
    const maybeState = defaults();
    configure(maybeState, config2 || {});
    function redrawAll() {
      const prevUnbind = "dom" in maybeState ? maybeState.dom.unbind : void 0;
      const elements = renderWrap(element, maybeState), bounds = memo(() => elements.board.getBoundingClientRect()), redrawNow = (skipSvg) => {
        render2(state2);
        if (elements.autoPieces)
          render3(state2, elements.autoPieces);
        if (!skipSvg && elements.svg)
          renderSvg(state2, elements.svg, elements.customSvg);
      }, onResize = () => {
        updateBounds(state2);
        renderResized(state2);
        if (elements.autoPieces)
          renderResized2(state2);
      };
      const state2 = maybeState;
      state2.dom = {
        elements,
        bounds,
        redraw: debounceRedraw(redrawNow),
        redrawNow,
        unbind: prevUnbind
      };
      state2.drawable.prevSvgHash = "";
      updateBounds(state2);
      redrawNow(false);
      bindBoard(state2, onResize);
      if (!prevUnbind)
        state2.dom.unbind = bindDocument(state2, onResize);
      state2.events.insert && state2.events.insert(elements);
      return state2;
    }
    return start3(redrawAll(), redrawAll);
  }
  function debounceRedraw(redrawNow) {
    let redrawing = false;
    return () => {
      if (redrawing)
        return;
      redrawing = true;
      requestAnimationFrame(() => {
        redrawNow();
        redrawing = false;
      });
    };
  }
  var init_chessground = __esm({
    "node_modules/chessground/dist/chessground.js"() {
      init_api();
      init_config();
      init_state();
      init_wrap();
      init_events();
      init_render();
      init_autoPieces();
      init_svg();
      init_util();
    }
  });

  // src/js/mirror.ts
  function assignMirrorState() {
    const states = ["original", "original_mirror", "invert", "invert_mirror"];
    const mirrorRandom = Math.floor(Math.random() * states.length);
    return states[mirrorRandom];
  }
  function mirrorFenRow(row) {
    return row.split("").reverse().join("");
  }
  function mirrorFen(fullFen, mirrorState2) {
    if (mirrorState2 === "original") {
      return fullFen;
    }
    const fenParts = fullFen.split(" ");
    const fenBoard = fenParts[0];
    const fenColor = fenParts[1];
    const fenRest = fenParts.slice(2).join(" ");
    const fenRows = fenBoard.split("/");
    const fenBoardInverted = swapCase(fenBoard.split("").reverse().join(""));
    const fenBoardMirrored = fenRows.map(mirrorFenRow).join("/");
    const fenBoardMirroredInverted = swapCase(fenBoardMirrored.split("").reverse().join(""));
    const fenColorSwapped = fenColor === "w" ? "b" : "w";
    switch (mirrorState2) {
      case "invert_mirror":
        return `${fenBoardMirroredInverted} ${fenColorSwapped} ${fenRest}`;
      case "invert":
        return `${fenBoardInverted} ${fenColorSwapped} ${fenRest}`;
      case "original_mirror":
        return `${fenBoardMirrored} ${fenColor} ${fenRest}`;
      default:
        return fullFen;
    }
  }
  function swapCase(str) {
    return str.split("").map(
      (ch) => ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()
    ).join("");
  }
  function mirrorMove(move3, mirrorState2) {
    const notationMaps = {
      "invert_mirror": { q: "q", a: "a", b: "b", c: "c", d: "d", e: "e", f: "f", g: "g", h: "h", "1": "8", "2": "7", "3": "6", "4": "5", "5": "4", "6": "3", "7": "2", "8": "1" },
      "invert": { q: "q", a: "h", b: "g", c: "f", d: "e", e: "d", f: "c", g: "b", h: "a", "1": "8", "2": "7", "3": "6", "4": "5", "5": "4", "6": "3", "7": "2", "8": "1" },
      "original_mirror": { q: "q", a: "h", b: "g", c: "f", d: "e", e: "d", f: "c", g: "b", h: "a", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8" },
      "original": { q: "q", a: "a", b: "b", c: "c", d: "d", e: "e", f: "f", g: "g", h: "h", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8" }
    };
    const notationMap = notationMaps[mirrorState2];
    function transform(val) {
      if (val === void 0) return void 0;
      return val.split("").map((char) => notationMap[char] || char).join("");
    }
    move3.notation.disc = move3.notation.disc ?? transform(move3.notation.disc);
    move3.notation.col = transform(move3.notation.col);
    move3.notation.row = move3.notation.row ?? transform(move3.notation.row);
    move3.notation.notation = transform(move3.notation.notation) ?? move3.notation.notation;
  }
  function mirrorPgnTree(moves, mirrorState2, parentMove = null) {
    if (!moves || moves.length === 0) return;
    for (const move3 of moves) {
      if (move3.variations) {
        move3.variations.forEach((variation) => {
          mirrorPgnTree(variation, mirrorState2, move3);
        });
      }
    }
    const isInverted = mirrorState2 === "invert" || mirrorState2 === "invert_mirror";
    if (!isInverted) {
      for (const move3 of moves) mirrorMove(move3, mirrorState2);
      return;
    }
    let lastValidMoveNumber;
    const startsWithWhite = moves[0].turn === "w";
    if (startsWithWhite) {
      moves.forEach((move3, index) => {
        mirrorMove(move3, mirrorState2);
        if (move3.turn === "w") {
          move3.turn = "b";
          if (index === 0) {
            move3.moveNumber--;
            lastValidMoveNumber = move3.moveNumber;
          } else {
            delete move3.moveNumber;
          }
        } else {
          move3.turn = "w";
          move3.moveNumber = lastValidMoveNumber + 1;
          lastValidMoveNumber = move3.moveNumber;
        }
      });
    } else {
      lastValidMoveNumber = parentMove?.moveNumber ?? moves[0].moveNumber ?? 0;
      moves.forEach((move3, index) => {
        mirrorMove(move3, mirrorState2);
        if (move3.turn === "b") {
          move3.turn = "w";
          if (move3.moveNumber) {
            lastValidMoveNumber = move3.moveNumber;
          } else {
            move3.moveNumber = index === 0 ? lastValidMoveNumber : lastValidMoveNumber + 1;
            lastValidMoveNumber = move3.moveNumber;
          }
        } else {
          move3.turn = "b";
          delete move3.moveNumber;
        }
      });
    }
  }
  function checkCastleRights(fen) {
    const fenParts = fen.split(" ");
    if (fenParts.length < 3) return false;
    const castlingPart = fenParts[2];
    return castlingPart !== "-";
  }
  var init_mirror = __esm({
    "src/js/mirror.ts"() {
      "use strict";
    }
  });

  // src/js/config.ts
  function isBoardMode(mode) {
    const boardModes = ["Viewer", "Puzzle"];
    const modeCheck = boardModes.includes(mode);
    return modeCheck;
  }
  function isSolvedMode(solvedState) {
    if (!solvedState) return false;
    const solvedModes = ["correct", "correctTime", "incorrect"];
    const modeCheck = solvedModes.includes(solvedState);
    return modeCheck;
  }
  function isMirrorState(mirrorState2) {
    if (!mirrorState2) return false;
    const mirrorStates = ["original", "original_mirror", "invert", "invert_mirror"];
    const mirrorStateCheck = mirrorStates.includes(mirrorState2);
    return mirrorStateCheck;
  }
  function getUrlParam(name, defaultValue) {
    const value = urlParams.get(name);
    return value !== null ? value : defaultValue;
  }
  var import_pgn_parser, urlParams, cgwrap, config, parsed, mirrorState, state;
  var init_config2 = __esm({
    "src/js/config.ts"() {
      "use strict";
      init_chess();
      import_pgn_parser = __toESM(require_index_umd());
      init_chessground();
      init_mirror();
      urlParams = new URLSearchParams(window.location.search);
      cgwrap = document.getElementById("board");
      config = {
        pgn: getUrlParam("PGN", `[Event "?"]
    [Site "?"]
    [Date "2023.02.13"]
    [Round "?"]
    [White "White"]
    [Black "Black"]
    [Result "*"]
    [FEN "q4rk1/p4ppp/b7/8/Pp6/1n1P2P1/1N2QP1P/R3R1K1 w - - 1 21"]
    [SetUp "1"]

    21. Rad1 Nd4 {EV: 92.7%, N: 99.32% of 78.6k} 22. Qe4 {EV: 8.0%, N: 93.34% of
        125k} Nf3+ {EV: 92.2%, N: 99.46% of 230k} 23. Kf1 {EV: 8.2%, N: 96.48% of 422k}
        Nxh2+ {EV: 92.5%, N: 96.74% of 510k} 24. Kg1 {EV: 8.1%, N: 91.63% of 520k} Nf3+
        {EV: 92.1%, N: 99.09% of 496k} 25. Kf1 {EV: 8.1%, N: 97.24% of 511k} Nxe1 {EV:
            92.4%, N: 97.58% of 602k} *
            `),
        ankiText: getUrlParam("userText", null),
        frontText: getUrlParam("frontText", "true") === "true",
        muteAudio: getUrlParam("muteAudio", "false") === "true",
        showDests: getUrlParam("showDests", "true") === "true",
        singleClickMove: getUrlParam("singleClickMove", "true") === "true",
        handicap: parseInt(getUrlParam("handicap", "1"), 10),
        strictScoring: getUrlParam("strictScoring", "false") === "true",
        acceptVariations: getUrlParam("acceptVariations", "true") === "true",
        disableArrows: getUrlParam("disableArrows", "false") === "true",
        flipBoard: getUrlParam("flip", "true") === "true",
        boardMode: "Puzzle",
        background: getUrlParam("background", "var(--color-bg-secondary)"),
        mirror: getUrlParam("mirror", "true") === "true",
        randomOrientation: getUrlParam("randomOrientation", "false") === "true",
        autoAdvance: getUrlParam("autoAdvance", "false") === "true",
        handicapAdvance: getUrlParam("handicapAdvance", "false") === "true",
        timer: parseInt(getUrlParam("timer", "4"), 10) * 1e3,
        increment: parseInt(getUrlParam("increment", "1"), 10) * 1e3,
        timerAdvance: getUrlParam("timerAdvance", "false") === "true",
        timerScore: getUrlParam("timerScore", "false") === "true",
        analysisTime: parseInt(getUrlParam("analysisTime", "4"), 10) * 1e3,
        animationTime: parseInt(getUrlParam("animationTime", "200"), 10)
      };
      (function setBoardMode() {
        const mode = getUrlParam("boardMode", "Puzzle");
        if (mode && isBoardMode(mode)) config.boardMode = mode;
      })();
      parsed = (0, import_pgn_parser.parse)(config.pgn, { startRule: "game" });
      mirrorState = config.boardMode === "Puzzle" ? assignMirrorState() : getUrlParam("mirrorState", null);
      if (parsed.tags?.FEN && !checkCastleRights(parsed.tags.FEN) && isMirrorState(mirrorState)) {
        parsed.tags.FEN = mirrorFen(parsed.tags.FEN, mirrorState);
        mirrorPgnTree(parsed.moves, mirrorState);
      }
      state = {
        startFen: parsed.tags?.FEN ?? DEFAULT_POSITION,
        boardRotation: "black",
        playerColour: "white",
        opponentColour: "black",
        solvedColour: config.timer ? "var(--perfect-color)" : "var(--correct-color)",
        errorTrack: null,
        chessGroundShapes: [],
        errorCount: 0,
        puzzleTime: config.timer,
        puzzleComplete: false,
        navTimeout: null,
        isStockfishBusy: false,
        stockfishRestart: false,
        analysisToggledOn: false,
        pgnPath: [],
        pgnPathMap: /* @__PURE__ */ new Map(),
        lastMove: null,
        mirrorState: isMirrorState(mirrorState) ? mirrorState : null,
        cgwrap,
        cg: Chessground(cgwrap, {
          fen: parsed.tags?.FEN ?? DEFAULT_POSITION,
          premovable: {
            enabled: true
          },
          movable: {
            free: false,
            showDests: config.showDests
          },
          highlight: {
            check: true,
            lastMove: true
          },
          drawable: {
            enabled: true,
            brushes: {
              stockfish: { key: "stockfish", color: "#e5e5e5", opacity: 1, lineWidth: 7 },
              stockfinished: { key: "stockfinished", color: "white", opacity: 1, lineWidth: 7 },
              mainLine: { key: "mainLine", color: "#66AA66", opacity: 1, lineWidth: 9 },
              altLine: { key: "altLine", color: "#66AAAA", opacity: 1, lineWidth: 9 },
              blunderLine: { key: "blunderLine", color: "var(--incorrect-color)", opacity: 1, lineWidth: 7 },
              // default
              green: { key: "green", color: "green", opacity: 0.7, lineWidth: 9 },
              red: { key: "red", color: "red", opacity: 0.7, lineWidth: 9 },
              blue: { key: "blue", color: "blue", opacity: 0.7, lineWidth: 9 },
              yellow: { key: "yellow", color: "yellow", opacity: 0.7, lineWidth: 9 }
            }
          }
        }),
        chess: new Chess(),
        parsedPGN: parsed,
        delayTime: config.animationTime + 100
      };
      (function setSolvedMode() {
        const solvedMode = getUrlParam("errorTrack", null);
        if (solvedMode && isSolvedMode(solvedMode)) state.errorTrack = solvedMode;
      })();
      (function setPgnPath() {
        const pgnPath = getUrlParam("pgnPath", null);
        const result = pgnPath?.split(",").map((item) => {
          const num = Number(item);
          return isNaN(num) ? "v" : num;
        });
        state.pgnPath = result ? result : [];
      })();
    }
  });

  // src/nags.json
  var nags_default;
  var init_nags = __esm({
    "src/nags.json"() {
      nags_default = {
        $1: ["Good move", "!", "_good.webp"],
        $2: ["Poor move", "?", "_mistake.webp"],
        $3: ["Excellent move", "!!", "_brilliant.webp"],
        $4: ["Blunder", "??", "_blunder.webp"],
        $5: ["Interesting move", "!?"],
        $6: ["Dubious move", "?!", "_dubious.webp"],
        $7: ["Forced move", "+"],
        $8: ["The only move", "\u25A1"],
        $9: ["Worst move", "???", "_blunder.webp"],
        $10: ["Drawish position", "="],
        $11: ["Equal chances, quiet position", "="],
        $12: ["Equal chances, active position", "\u2189"],
        $13: ["Unclear position", "\u221E"],
        $14: ["White has a slight advantage", "\u2A72"],
        $15: ["Black has a slight advantage", "\u2A71"],
        $16: ["White has a moderate advantage", "\xB1"],
        $17: ["Black has a moderate advantage", "\u2213"],
        $18: ["White has a decisive advantage", "+-"],
        $19: ["Black has a decisive advantage", "-+"],
        $20: ["White has a crushing advantage", "+--"],
        $21: ["Black has a crushing advantage", "--+"],
        $22: ["White is in zugzwang", "\u2A00"],
        $23: ["Black is in zugzwang", "\u2A00"],
        $24: ["White has a slight space advantage", "\u25CB"],
        $25: ["Black has a slight space advantage", "\u25CB"],
        $26: ["White has a moderate space advantage", "\u25CB\u25CB"],
        $27: ["Black has a moderate space advantage", "\u25CB\u25CB"],
        $28: ["White has a decisive space advantage", "\u25CB\u25CB\u25CB"],
        $29: ["Black has a decisive space advantage", "\u25CB\u25CB\u25CB"],
        $30: ["White has a slight development advantage", "\u21BB"],
        $31: ["Black has a slight development advantage", "\u21BA"],
        $32: ["White has a moderate development advantage", "\u27F3"],
        $33: ["Black has a moderate development advantage", "\u27F3"],
        $34: ["White has a decisive development advantage", "\u21BB\u21BB\u21BB"],
        $35: ["Black has a decisive development advantage", "\u21BA\u21BA\u21BA"],
        $36: ["White has the initiative", "\u2191"],
        $37: ["Black has the initiative", "\u2193"],
        $38: ["White has a lasting initiative", "\u21D1"],
        $39: ["Black has a lasting initiative", "\u21D3"],
        $40: ["White has the attack", "\u2192"],
        $41: ["Black has the attack", "\u2190"],
        $42: ["White has insufficient compensation", "\u2BDA"],
        $43: ["Black has insufficient compensation", "\u2BDA"],
        $44: ["White has sufficient compensation", "=/="],
        $45: ["Black has sufficient compensation", "=/="],
        $46: ["White has more than adequate compensation", "$"],
        $47: ["Black has more than adequate compensation", "$"],
        $48: ["White has a slight center control advantage", "\u229E"],
        $49: ["Black has a slight center control advantage", "\u229E"],
        $50: ["White has a moderate center control advantage", "\u229E\u229E"],
        $51: ["Black has a moderate center control advantage", "\u229E\u229E"],
        $52: ["White has a decisive center control advantage", "\u229E\u229E\u229E"],
        $53: ["Black has a decisive center control advantage", "\u229E\u229E\u229E"],
        $54: ["White has a slight kingside control advantage", "\u29E9"],
        $55: ["Black has a slight kingside control advantage", "\u29E9"],
        $56: ["White has a moderate kingside control advantage", "\u29EB"],
        $57: ["Black has a moderate kingside control advantage", "\u29EB"],
        $58: ["White has a decisive kingside control advantage", "\u22D9"],
        $59: ["Black has a decisive kingside control advantage", "\u22D9"],
        $60: ["White has a slight queenside control advantage", "\u29E8"],
        $61: ["Black has a slight queenside control advantage", "\u29E8"],
        $62: ["White has a moderate queenside control advantage", "\u29EA"],
        $63: ["Black has a moderate queenside control advantage", "\u29EA"],
        $64: ["White has a decisive queenside control advantage", "\u22D8"],
        $65: ["Black has a decisive queenside control advantage", "\u22D8"],
        $66: ["White has a vulnerable first rank", "+"],
        $67: ["Black has a vulnerable first rank", "+"],
        $68: ["White has a well protected first rank", "+"],
        $69: ["Black has a well protected first rank", "+"],
        $70: ["White has a poorly protected king", "+"],
        $71: ["Black has a poorly protected king", "+"],
        $72: ["White has a well protected king", "+"],
        $73: ["Black has a well protected king", "+"],
        $74: ["White has a poorly placed king", "+"],
        $75: ["Black has a poorly placed king", "+"],
        $76: ["White has a well placed king", "+"],
        $77: ["Black has a well placed king", "+"],
        $78: ["White has a very weak pawn structure", "+"],
        $79: ["Black has a very weak pawn structure", "+"],
        $80: ["White has a moderately weak pawn structure", "+"],
        $81: ["Black has a moderately weak pawn structure", "+"],
        $82: ["White has a moderately strong pawn structure", "+"],
        $83: ["Black has a moderately strong pawn structure", "+"],
        $84: ["White has a very strong pawn structure", "+"],
        $85: ["Black has a very strong pawn structure", "+"],
        $86: ["White has poor knight placement", "+"],
        $87: ["Black has poor knight placement", "+"],
        $88: ["White has good knight placement", "+"],
        $89: ["Black has good knight placement", "+"],
        $90: ["White has poor bishop placement", "+"],
        $91: ["Black has poor bishop placement", "+"],
        $92: ["White has good bishop placement", "\u2197"],
        $93: ["Black has good bishop placement", "\u2196"],
        $94: ["White has poor rook placement", "+"],
        $95: ["Black has poor rook placement", "+"],
        $96: ["White has good rook placement", "\u21C8"],
        $97: ["Black has good rook placement", "\u21CA"],
        $98: ["White has poor queen placement", "+"],
        $99: ["Black has poor queen placement", "+"],
        $100: ["White has good queen placement", "+"],
        $101: ["Black has good queen placement", "+"],
        $102: ["White has poor piece coordination", "+"],
        $103: ["Black has poor piece coordination", "+"],
        $104: ["White has good piece coordination", "+"],
        $105: ["Black has good piece coordination", "+"],
        $106: ["White has played the opening very poorly", "+"],
        $107: ["Black has played the opening very poorly", "+"],
        $108: ["White has played the opening poorly", "+"],
        $109: ["Black has played the opening poorly", "+"],
        $110: ["White has played the opening well", "+"],
        $111: ["Black has played the opening well", "+"],
        $112: ["White has played the opening very well", "+"],
        $113: ["Black has played the opening very well", "+"],
        $114: ["White has played the middlegame very poorly", "+"],
        $115: ["Black has played the middlegame very poorly", "+"],
        $116: ["White has played the middlegame poorly", "+"],
        $117: ["Black has played the middlegame poorly", "+"],
        $118: ["White has played the middlegame well", "+"],
        $119: ["Black has played the middlegame well", "+"],
        $120: ["White has played the middlegame very well", "+"],
        $121: ["Black has played the middlegame very well", "+"],
        $122: ["White has played the ending very poorly", "+"],
        $123: ["Black has played the ending very poorly", "+"],
        $124: ["White has played the ending poorly", "+"],
        $125: ["Black has played the ending poorly", "+"],
        $126: ["White has played the ending well", "+"],
        $127: ["Black has played the ending well", "+"],
        $128: ["White has played the ending very well", "+"],
        $129: ["Black has played the ending very well", "+"],
        $130: ["White has slight counterplay", "\u21C4"],
        $131: ["Black has slight counterplay", "\u21C4"],
        $132: ["White has moderate counterplay", "\u21C4\u21C4"],
        $133: ["Black has moderate counterplay", "\u21C4\u21C4"],
        $134: ["White has decisive counterplay", "\u21C4\u21C4\u21C4"],
        $135: ["Black has decisive counterplay", "\u21C4\u21C4\u21C4"],
        $136: ["White has moderate time control pressure", "\u2295"],
        $137: ["Black has moderate time control pressure", "\u2296"],
        $138: ["White has severe time control pressure", "\u2295\u2295"],
        $139: ["Black has severe time control pressure", "\u2296\u2296"]
      };
    }
  });

  // src/js/pgnViewer.ts
  function isNagKey(key) {
    return key in nags_default;
  }
  function buildPgnHtml(moves, altLine) {
    let html = "";
    if (!moves || moves.length === 0) return "";
    if (moves[0].turn === "b") {
      const moveNumber = moves[0].moveNumber;
      if (moves[0].pgnPath.at(-1) === 0 && moves[0].pgnPath.length === 1) {
        html += `<span class="move-number">${moveNumber}.</span><span class="nullMove">|...|</span> `;
      } else if (moves[0].pgnPath.at(-1) === 0) {
        html += `<span class="move-number">${moveNumber}...</span> `;
      }
    }
    for (let i = 0; i < moves.length; i++) {
      const move3 = moves[i];
      if (move3.turn === "w") {
        const moveNumber = move3.moveNumber;
        html += `<span class="move-number">${moveNumber}.</span> `;
      }
      let nagCheck = "";
      let nagTitle = null;
      if (move3.nag) {
        const foundNagKey = move3.nag.find(isNagKey);
        if (foundNagKey) {
          nagCheck = nags_default[foundNagKey]?.[1] ?? "";
          nagTitle = nags_default[foundNagKey]?.[0] ?? "";
        }
      }
      nagTitle = nagTitle ? `<span class="nagTooltip">${nagTitle}</span>` : "";
      const pathKey = move3.pgnPath?.join(",");
      if (pathKey && move3.pgnPath) {
        html += ` <span class="move" data-path-key="${pathKey}">${nagTitle} ${move3.notation.notation} ${nagCheck}</span>`;
      }
      if (move3.commentAfter) {
        if (move3.turn === "w" && !altLine) html += `<span class="nullMove">|...|</span>`;
        html += `<span class="comment"> ${move3.commentAfter} </span>`;
        if (move3.turn === "w" && i < moves.length - 1 && !altLine && !move3.variations?.length) html += `<span class="move-number">${move3.moveNumber}.</span><span class="nullMove">|...|</span>`;
      }
      if (move3.variations && move3.variations.length > 0) {
        if (!altLine) {
          if (move3.turn === "w" && !altLine && !move3.commentAfter) html += `<span class="nullMove">|...|</span>`;
          html += `<div class="altLine">`;
        }
        move3.variations.forEach((variation) => {
          html += `<span class="altLineBracket">(</span>${buildPgnHtml(variation, true)}<span class="altLineBracket">)</span>`;
        });
        if (!altLine) {
          html += `</div>`;
          if (move3.turn === "w" && i < moves.length - 1) html += `<span class="move-number">${move3.moveNumber}.</span><span class="nullMove">|...|</span>`;
        }
      }
    }
    return html;
  }
  function isEndOfLine(path) {
    const nextMovePath = navigateNextMove(path);
    const nextMoveCheck = state.pgnPathMap.get(nextMovePath.join(","))?.pgnPath;
    return nextMoveCheck ? false : true;
  }
  function navigateFullMoveSequenceFromPath(path) {
    const finalPath = path;
    if (!finalPath.length) return [];
    let currentLine = state.parsedPGN.moves;
    let parentMove = null;
    for (let i = 0; i < finalPath.length; i++) {
      const segment = finalPath[i];
      if (finalPath[i] === "v" && typeof finalPath[++i] === "number") {
        if (parentMove?.variations) {
          const varIndex = finalPath[i++];
          if (typeof varIndex !== "number") {
            console.error("Invalid PGN path:", finalPath);
            return [];
          }
          currentLine = parentMove.variations[varIndex];
          i--;
        }
      } else if (typeof segment === "number") {
        const movesDownCurrentLine = segment;
        for (let i2 = 0; i2 <= movesDownCurrentLine; i2++) {
          const move3 = currentLine?.[i2];
          if (move3?.notation?.notation) {
            parentMove = move3;
          } else {
          }
        }
      }
    }
    if (!parentMove) return [];
    return parentMove.pgnPath;
  }
  function addMoveToPgn(move3) {
    const chess = new Chess();
    chess.load(move3.before);
    const chessState = chess.moveNumber();
    const currentPath = state.pgnPath;
    let currentLinePosition = currentPath.at(-1);
    if (currentLinePosition === null) currentLinePosition = 0;
    let nextMovePath;
    if (!currentPath.length) {
      nextMovePath = [0];
    } else {
      nextMovePath = currentPath.with(-1, ++currentLinePosition);
    }
    const pgnMove = state.pgnPathMap.get(nextMovePath.join(","));
    const isVariation = pgnMove?.turn === move3.color;
    nextMovePath = isVariation ? [...nextMovePath, "v", pgnMove.variations.length, 0] : nextMovePath;
    const newCustomPgnMove = {
      moveNumber: chessState,
      notation: {
        notation: move3.san,
        fig: move3.piece,
        strike: move3.san.includes("x") ? "x" : null,
        col: move3.to[0],
        row: move3.to[1],
        promotion: move3.promotion ? move3.promotion : null
      },
      turn: move3.color,
      before: move3.before,
      after: move3.after,
      from: move3.from,
      to: move3.to,
      flags: move3.flags,
      san: move3.san,
      variations: [],
      nag: [],
      pgnPath: nextMovePath
    };
    const parentPath = navigateFullMoveSequenceFromPath(nextMovePath);
    if (nextMovePath.length === 1) {
      state.parsedPGN.moves.push(newCustomPgnMove);
    } else if (isVariation) {
      const parentMove = state.pgnPathMap.get(parentPath.join(","));
      parentMove.variations.push([newCustomPgnMove]);
    } else {
      const variationLine = parentPath.slice(0, -3);
      const parentLine = state.pgnPathMap.get(variationLine.join(","));
      parentLine.variations[parentPath.at(-2)].push(newCustomPgnMove);
    }
    state.pgnPathMap.set(nextMovePath.join(","), newCustomPgnMove);
    renderNewPgnMove(newCustomPgnMove, nextMovePath);
    return nextMovePath;
  }
  function renderNewPgnMove(newMove, newMovePath) {
    const moveHtml = buildPgnHtml([newMove]);
    const pathIndex = newMovePath.at(-1);
    const previousMoveEl = document.querySelector(`[data-path-key="${newMovePath.with(-1, pathIndex - 1).join(",")}"]`);
    if (newMovePath.length === 1) {
      const pgnContainer = document.getElementById("pgnComment");
      console.log(previousMoveEl?.nextElementSibling);
      if (newMove.turn === "w" && previousMoveEl?.nextElementSibling?.classList.contains("move")) {
        pgnContainer?.insertAdjacentHTML("beforeend", `<span class="move-number">${newMove.moveNumber}.</span> <span class="nullMove">|...|</span>`);
      } else if (newMove.turn === "b" && previousMoveEl?.nextElementSibling) {
        pgnContainer?.insertAdjacentHTML("beforeend", `<span class="move-number">${newMove.moveNumber}.</span> <span class="nullMove">|...|</span>`);
      }
      pgnContainer?.insertAdjacentHTML("beforeend", moveHtml);
      return;
    }
    const parentPath = newMovePath.slice(0, -3);
    if (pathIndex && pathIndex > 0) {
      if (previousMoveEl) previousMoveEl.insertAdjacentHTML("afterend", `${moveHtml}`);
      return;
    } else if (pathIndex === 0) {
      const newVarHtml = `<span class="altLineBracket">(</span>${moveHtml}<span class="altLineBracket">)</span>`;
      const newVarDivHtml = `<div class="altLine">${newVarHtml}</div>`;
      const variationMoveEl = document.querySelector(`[data-path-key="${parentPath.join(",")}"]`);
      if (!variationMoveEl) return;
      let nextAltLineEl = variationMoveEl.nextElementSibling;
      while (nextAltLineEl) {
        if (nextAltLineEl.classList.contains("altLine") || nextAltLineEl.localName === "span" && !nextAltLineEl.classList.contains("nullMove") && !nextAltLineEl.classList.contains("comment")) {
          break;
        }
        nextAltLineEl = nextAltLineEl.nextElementSibling;
      }
      if (nextAltLineEl?.classList.contains("altLine")) {
        nextAltLineEl.insertAdjacentHTML("beforeend", newVarHtml);
      } else if (parentPath.length === 1 && (!nextAltLineEl || nextAltLineEl.classList.contains("move"))) {
        let insertVarDivHtml = ``;
        if (nextAltLineEl || !nextAltLineEl && newMove.turn === "w") insertVarDivHtml += `<span class="nullMove">|...|</span>`;
        insertVarDivHtml += newVarDivHtml;
        if (nextAltLineEl && !variationMoveEl.nextElementSibling) insertVarDivHtml += `<span class="move-number">${newMove.moveNumber}.</span> <span class="nullMove">|...|</span>`;
        if (variationMoveEl.nextElementSibling?.classList.contains("move")) {
          insertVarDivHtml += `<span class="move-number">${newMove.moveNumber}.</span> <span class="nullMove">|...|</span>`;
        }
        variationMoveEl.insertAdjacentHTML("afterend", insertVarDivHtml);
      } else if (parentPath.length === 1 && nextAltLineEl?.classList.contains("move-number")) {
        if (variationMoveEl.nextElementSibling?.classList.contains("nullMove")) {
          variationMoveEl.nextElementSibling.insertAdjacentHTML("afterend", newVarDivHtml);
        } else {
          variationMoveEl.insertAdjacentHTML("afterend", newVarDivHtml);
        }
      } else {
        variationMoveEl.insertAdjacentHTML("afterend", newVarHtml);
      }
    }
  }
  function navigateNextMove(path) {
    const pathCheck = path;
    let movePath;
    if (!pathCheck.length) {
      movePath = [0];
    } else {
      let currentLinePosition = pathCheck.at(-1);
      movePath = pathCheck.with(-1, ++currentLinePosition);
    }
    return movePath;
  }
  function navigatePrevMove(path) {
    const movePath = path;
    let prevMovePath = movePath;
    if (!movePath.length) return movePath;
    let currentLinePosition = movePath.at(-1);
    if (currentLinePosition === 0) {
      if (movePath.length === 1) {
        prevMovePath = [];
      } else {
        currentLinePosition = movePath.at(-4);
        console.log(currentLinePosition);
        if (currentLinePosition === 0) {
          prevMovePath = [];
        } else if (typeof currentLinePosition === "number") {
          prevMovePath = [...movePath.slice(0, -4), --currentLinePosition];
        }
      }
    } else if (typeof currentLinePosition === "number") {
      prevMovePath = movePath.with(-1, --currentLinePosition);
    } else {
      prevMovePath = [];
    }
    return prevMovePath;
  }
  function augmentPgnTree(moves, path = []) {
    const chess = new Chess(state.startFen);
    _augmentAndGenerateFen(moves, path, chess);
  }
  function _augmentAndGenerateFen(moves, path = [], chess) {
    if (!moves) return;
    for (let i = 0; i < moves.length; i++) {
      const move3 = moves[i];
      const currentPath = [...path, i];
      const moveResult = chess.move(move3.notation.notation);
      if (!moveResult) {
        console.error(`Invalid move ${move3.notation.notation} at path ${currentPath}`);
        continue;
      }
      move3.pgnPath = currentPath;
      move3.before = moveResult.before;
      move3.after = moveResult.after;
      move3.from = moveResult.from;
      move3.to = moveResult.to;
      move3.flags = moveResult.flags;
      move3.san = moveResult.san;
      const pathKey = move3.pgnPath.join(",");
      state.pgnPathMap.set(pathKey, move3);
      if (move3.variations) {
        move3.variations.forEach((variation, varIndex) => {
          const variationPath = [...currentPath, "v", varIndex];
          chess.undo();
          _augmentAndGenerateFen(variation, variationPath, chess);
          chess.move(move3.notation.notation);
        });
      }
    }
    for (let i = 0; i < moves.length; i++) {
      chess.undo();
    }
  }
  function highlightCurrentMove(pgnPath) {
    document.querySelectorAll("#pgnComment .move.current").forEach((el) => el.classList.remove("current"));
    const pgnMoveEl = document.querySelector(`[data-path-key="${pgnPath.join(",")}"]`);
    if (pgnMoveEl) {
      pgnMoveEl.classList.add("current");
    }
  }
  function initPgnViewer() {
    const pgnContainer = document.getElementById("pgnComment");
    if (!pgnContainer) return;
    pgnContainer.innerHTML = "";
    if (state.parsedPGN.gameComment) {
      pgnContainer.innerHTML += `<span class="comment"> ${state.parsedPGN.gameComment.comment} </span>`;
    }
    pgnContainer.innerHTML += buildPgnHtml(state.parsedPGN.moves);
    highlightCurrentMove(state.pgnPath);
  }
  var init_pgnViewer = __esm({
    "src/js/pgnViewer.ts"() {
      "use strict";
      init_chess();
      init_config2();
      init_nags();
    }
  });

  // src/js/arrows.ts
  function filterShapes(filterKey) {
    let brushesToRemove = shapeArray[filterKey];
    const shouldFilterDrawn = brushesToRemove.includes("userDrawn");
    if (shouldFilterDrawn) brushesToRemove = shapeArray["All" /* All */];
    const filteredShapes = state.chessGroundShapes.filter((shape) => {
      const shouldRemove = !shape.brush || brushesToRemove.includes(shape.brush);
      if (shouldFilterDrawn) {
        return shouldRemove;
      } else {
        return !shouldRemove;
      }
    });
    state.chessGroundShapes = filteredShapes;
  }
  function pushShapes(move3, brush) {
    let targetImage;
    if ("nag" in move3 && move3.nag) {
      const foundNagKey = move3.nag.find(isNagKey);
      if (foundNagKey && nags_default[foundNagKey][2]) {
        targetImage += `<image href="${nags_default[foundNagKey][2]}" width="50%" height="50%" />`;
      }
    }
    state.chessGroundShapes.push({
      orig: move3.from,
      dest: move3.to,
      brush,
      san: move3.san,
      customSvg: targetImage ? { html: targetImage, center: "dest" } : void 0
    });
  }
  function drawArrows(pgnPath) {
    filterShapes("Drawn" /* Drawn */);
    if (config.boardMode === "Puzzle" && config.disableArrows) return;
    let nextMovePath = navigateNextMove(state.pgnPath);
    if (config.boardMode === "Viewer") {
      nextMovePath = navigateNextMove(pgnPath);
    } else if (state.playerColour === (state.chess.turn() === "w" ? "white" : "black")) {
      state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
      return;
    }
    filterShapes("All" /* All */);
    const mainLine = state.pgnPathMap.get(nextMovePath.join(","));
    if (!mainLine) return;
    if (mainLine.variations.length) {
      mainLine.variations.forEach((variation) => {
        const varMove = variation[0];
        const isBlunder2 = blunderNags.some((blunder) => varMove.nag?.includes(blunder));
        pushShapes(varMove, isBlunder2 ? "blunderLine" : "altLine");
      });
    }
    const isBlunder = blunderNags.some((blunder) => mainLine.nag?.includes(blunder));
    pushShapes(mainLine, isBlunder ? "blunderLine" : "mainLine");
    if (config.boardMode === "Puzzle") {
      const parentMove = state.pgnPathMap.get(pgnPath.join(","));
      const puzzleMoveShapes = state.chessGroundShapes.filter((shape) => shape.san !== parentMove?.san);
      state.chessGroundShapes.filter((shape) => shape.san === parentMove?.san).forEach((filteredShape) => {
        if (filteredShape.customSvg) puzzleMoveShapes.push({
          orig: filteredShape.orig,
          dest: filteredShape.dest,
          customSvg: filteredShape.customSvg
        });
      });
      state.chessGroundShapes = puzzleMoveShapes ?? [];
    }
    state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
  }
  var blunderNags, shapePriority, customShapeBrushes, shapeArray;
  var init_arrows = __esm({
    "src/js/arrows.ts"() {
      "use strict";
      init_config2();
      init_pgnViewer();
      init_nags();
      blunderNags = ["$2", "$4", "$6", "$9"];
      shapePriority = ["mainLine", "altLine", "blunderLine", "stockfish", "stockfinished"];
      customShapeBrushes = [
        "stockfish",
        "stockfinished",
        "mainLine",
        "altLine",
        "blunderLine"
      ];
      shapeArray = {
        ["All" /* All */]: customShapeBrushes,
        ["Stockfish" /* Stockfish */]: ["stockfish", "stockfinished"],
        ["PGN" /* PGN */]: ["mainLine", "altLine", "blunderLine"],
        ["Drawn" /* Drawn */]: ["userDrawn"]
      };
    }
  });

  // src/js/timer.ts
  function timerLoop(timestamp) {
    if (!lastTickTimestamp) {
      lastTickTimestamp = timestamp;
    }
    const deltaTime = timestamp - lastTickTimestamp;
    lastTickTimestamp = timestamp;
    state.puzzleTime = Math.max(0, state.puzzleTime - deltaTime);
    const percentage = 100 - state.puzzleTime / totalTime * 100;
    document.documentElement.style.setProperty("--remainingTime", `${percentage.toFixed(2)}%`);
    if (state.puzzleTime === 0) {
      handleOutOfTime();
    } else {
      animationFrameId = requestAnimationFrame(timerLoop);
    }
  }
  function timerExtendLoop(extendtimestamp) {
    if (!lastTickExtendTimestamp) {
      lastTickExtendTimestamp = extendtimestamp;
    }
    const deltaTime = extendtimestamp - lastTickExtendTimestamp;
    lastTickExtendTimestamp = extendtimestamp;
    const deltaTimeFraction = deltaTime / state.delayTime * config.increment;
    totalExtendTime = Math.min(config.increment, totalExtendTime + deltaTimeFraction);
    const percentageIncrease = deltaTime / state.delayTime * Math.min(extendPercentage, config.increment * 100 / totalTime);
    state.puzzleTime = Math.min(totalTime, state.puzzleTime + deltaTimeFraction);
    extendPercentage -= percentageIncrease;
    if (extendPercentage < 0) {
      state.puzzleTime = totalTime;
      extendPercentage = 0;
    }
    document.documentElement.style.setProperty("--remainingTime", `${extendPercentage.toFixed(2)}%`);
    if (totalExtendTime === config.increment) {
      totalExtendTime = 0;
      if (extendAnimationFrameId) cancelAnimationFrame(extendAnimationFrameId);
      extendAnimationFrameId = null;
      lastTickExtendTimestamp = null;
    } else {
      extendAnimationFrameId = requestAnimationFrame(timerExtendLoop);
    }
  }
  function handleOutOfTime() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      lastTickTimestamp = null;
    }
    document.documentElement.style.setProperty("--remainingTime", "100%");
    if (config.timerScore) {
      stateProxy.errorTrack = "incorrect";
    } else if (config.timerAdvance) {
      state.puzzleComplete = true;
      const { chess: _chess, cg: _cg, cgwrap: _cgwrap, ...stateCopy } = state;
      window.parent.postMessage(stateCopy, "*");
    }
  }
  function stopPlayerTimer() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      lastTickTimestamp = null;
    }
  }
  function startPlayerTimer() {
    if (config.boardMode === "Viewer" || !config.timer || state.puzzleTime <= 0) {
      return;
    }
    animationFrameId = requestAnimationFrame(timerLoop);
  }
  function initializePuzzleTimer() {
    if (config.boardMode === "Viewer" || !config.timer) return;
    stopPlayerTimer();
    totalTime = config.timer;
    const timerColor = config.randomOrientation ? state.solvedColour : state.opponentColour;
    document.documentElement.style.setProperty("--timer-color", timerColor);
    state.cgwrap.classList.add("timerMode");
    document.documentElement.style.setProperty("--remainingTime", `0%`);
  }
  function extendPuzzleTime(additionalTime) {
    if (config.boardMode === "Viewer" || !config.timer || state.puzzleTime <= 0) return;
    extendPercentage = 100 - state.puzzleTime / totalTime * 100;
    totalTime = Math.max(state.puzzleTime + additionalTime, config.timer);
    if (animationFrameId) stopPlayerTimer();
    extendAnimationFrameId = requestAnimationFrame(timerExtendLoop);
  }
  var animationFrameId, lastTickTimestamp, extendAnimationFrameId, lastTickExtendTimestamp, totalExtendTime, totalTime, extendPercentage;
  var init_timer = __esm({
    "src/js/timer.ts"() {
      "use strict";
      init_config2();
      init_toolbox();
      animationFrameId = null;
      lastTickTimestamp = null;
      extendAnimationFrameId = null;
      lastTickExtendTimestamp = null;
      totalExtendTime = 0;
    }
  });

  // src/js/audio.ts
  function initAudio() {
    const sounds = ["move", "checkmate", "check", "capture", "castle", "promote", "Error", "computer-mouse-click"];
    const audioMap2 = /* @__PURE__ */ new Map();
    sounds.forEach((sound) => {
      const audio = new Audio(`_${sound}.mp3`);
      audio.preload = "auto";
      audioMap2.set(sound, audio);
    });
    return audioMap2;
  }
  function playSound(soundName) {
    if (config.muteAudio) return;
    const audio = audioMap.get(soundName);
    if (audio) {
      const clone = audio.cloneNode();
      if (clone instanceof HTMLAudioElement) {
        clone.play().catch((e) => console.error(`Could not play sound: ${soundName}`, e));
      }
    }
  }
  function moveAudio(move3) {
    if (config.muteAudio) return;
    const moveType = moveSoundPriority.find((p) => p.condition(move3.san, move3.flags));
    const soundToPlay = moveType ? moveSoundMap[moveType.event] : moveSoundMap.move;
    playSound(soundToPlay);
  }
  var moveSoundMap, moveSoundPriority, audioMap;
  var init_audio = __esm({
    "src/js/audio.ts"() {
      "use strict";
      init_config2();
      moveSoundMap = {
        checkmate: "checkmate",
        promote: "promote",
        castle: "castle",
        capture: "capture",
        check: "check",
        move: "move"
      };
      moveSoundPriority = [
        { event: "checkmate", condition: (san) => san.includes("#") },
        { event: "check", condition: (san) => san.includes("+") },
        { event: "promote", condition: (_san, flags) => flags.includes("p") },
        { event: "castle", condition: (_san, flags) => flags.includes("k") || flags.includes("q") },
        { event: "capture", condition: (_san, flags) => flags.includes("c") || flags.includes("e") }
      ];
      audioMap = initAudio();
    }
  });

  // src/js/chessFunctions.ts
  function isSquare(key) {
    return key !== "a0";
  }
  function isMoveObject(move3) {
    return typeof move3 === "object" && move3 !== null;
  }
  function toggleClass(querySelector, className) {
    document.querySelectorAll("." + querySelector).forEach((el) => el.classList.toggle(className));
  }
  function randomOrientation() {
    const orientations = ["black", "white"];
    return orientations[Math.floor(Math.random() * 2)];
  }
  function setBoard(FEN) {
    state.cg.set({
      fen: FEN,
      turnColor: toColor(),
      movable: {
        color: config.boardMode === "Puzzle" ? state.playerColour : toColor(),
        dests: toDests()
      },
      drawable: {
        shapes: state.chessGroundShapes
      }
    });
  }
  function animateBoard(lastMove, pathMove) {
    if (pathMove) {
      state.cg.set({ lastMove: [pathMove.from, pathMove.to] });
      state.lastMove = pathMove;
    }
    if (promoteAnimate && pathMove?.notation.promotion && (lastMove?.after === pathMove?.before || state.startFen === pathMove?.before && !lastMove)) {
      const tempChess = new Chess(pathMove.before);
      tempChess.remove(pathMove.to);
      state.cg.set({ fen: tempChess.fen() });
      state.cg.move(pathMove.from, pathMove.to);
      setTimeout(() => {
        state.cg.set({ animation: { enabled: false } });
        state.cg.set({
          fen: state.chess.fen()
        });
        state.cg.set({ animation: { enabled: true } });
        state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
      }, config.animationTime);
    } else if (lastMove?.notation.promotion && (lastMove?.before === pathMove?.after || state.startFen === lastMove?.before && !pathMove)) {
      const tempChess = new Chess(lastMove.after);
      tempChess.remove(lastMove.to);
      tempChess.put({ type: "p", color: lastMove.turn }, lastMove.to);
      state.cg.set({ animation: { enabled: false } });
      state.cg.set({ fen: tempChess.fen() });
      state.cg.set({ animation: { enabled: true } });
      state.cg.set({
        fen: state.chess.fen()
      });
    } else {
      state.cg.set({ fen: state.chess.fen() });
    }
    state.cg.set({
      check: state.chess.inCheck(),
      turnColor: toColor(),
      movable: {
        color: config.boardMode === "Puzzle" ? state.playerColour : toColor(),
        dests: toDests()
      },
      drawable: { shapes: state.chessGroundShapes }
    });
    setTimeout(() => {
      state.cg.playPremove();
    }, 2);
    promoteAnimate = true;
  }
  function areMovesEqual(move1, move22) {
    if (!move1 || !move22) {
      return false;
    }
    return move1.before === move22.before && move1.after === move22.after;
  }
  function isMoveLegal(moveInput) {
    const legalMoves = state.chess.moves({ verbose: true });
    if (typeof moveInput === "string") {
      return legalMoves.some((move3) => move3.san === moveInput || move3.lan === moveInput);
    } else {
      return legalMoves.some(
        (move3) => move3.from === moveInput.from && move3.to === moveInput.to && (move3.promotion || "q") === (moveInput.promotion || "q")
        // Default to queen for comparison
      );
    }
  }
  function getLegalMove(moveInput) {
    if (!isMoveLegal(moveInput)) {
      return null;
    }
    const tempChess = new Chess(state.chess.fen());
    return tempChess.move(moveInput);
  }
  function isPromotion(orig, dest) {
    if (SQUARES.includes(orig)) {
      const piece = state.chess.get(orig);
      if (!piece || piece.type !== "p") {
        return false;
      }
      const rank2 = dest.charAt(1);
      if (piece.color === "w" && rank2 === "8") return true;
      if (piece.color === "b" && rank2 === "1") return true;
    } else {
      console.error("Invalid square passed:", orig);
    }
    return false;
  }
  function toDests() {
    const dests = /* @__PURE__ */ new Map();
    SQUARES.forEach((s) => {
      const ms = state.chess.moves({ square: s, verbose: true });
      const moveObjects = ms.filter(isMoveObject);
      if (moveObjects.length) dests.set(s, moveObjects.map((m) => m.to));
    });
    return dests;
  }
  function handleMoveAttempt(delay, orig, dest, moveSan = null) {
    let moveCheck;
    if (moveSan) {
      moveCheck = getLegalMove(moveSan);
    } else {
      if (isPromotion(orig, dest)) {
        promotePopup(orig, dest);
        return;
      }
      moveCheck = getLegalMove({ from: orig, to: dest });
    }
    ;
    if (!moveCheck) return;
    let nextMovePath = [];
    let foundVar = false;
    let currentLinePosition = state.pgnPath.at(-1);
    if (!state.pgnPath.length) {
      nextMovePath = [0];
    } else {
      nextMovePath = state.pgnPath.with(-1, ++currentLinePosition);
    }
    const pathKey = nextMovePath.join(",");
    const pathMove = state.pgnPathMap.get(pathKey);
    if (pathMove && areMovesEqual(moveCheck, pathMove)) {
      foundVar = true;
    } else if (pathMove?.variations && config.acceptVariations) {
      for (const variation of pathMove.variations) {
        if (variation[0].notation.notation === moveCheck.san) {
          if (areMovesEqual(moveCheck, variation[0])) {
            nextMovePath = variation[0].pgnPath;
            foundVar = true;
            break;
          }
        }
      }
      ;
    }
    if (!foundVar) {
      if (config.boardMode === "Viewer") {
        nextMovePath = addMoveToPgn(moveCheck);
        stateProxy.pgnPath = nextMovePath;
      } else {
        handleWrongMove(moveCheck);
      }
    } else {
      stateProxy.pgnPath = nextMovePath;
      if (config.boardMode === "Puzzle") {
        if (!isEndOfLine(nextMovePath)) {
          extendPuzzleTime(config.increment);
        }
        playAiMove(state.delayTime);
      }
    }
  }
  function playAiMove(delay) {
    setTimeout(() => {
      state.errorCount = 0;
      const nextMovePath = [];
      const nextMovePathCheck = navigateNextMove(state.pgnPath);
      const nextMove = state.pgnPathMap.get(nextMovePathCheck.join(","));
      if (nextMove && nextMove.turn === state.opponentColour[0]) {
        nextMovePath.push(nextMovePathCheck);
        if (config.acceptVariations) nextMove.variations.forEach((variation) => {
          nextMovePath.push(variation[0].pgnPath);
        });
        const randomIndex = Math.floor(Math.random() * nextMovePath.length);
        stateProxy.pgnPath = nextMovePath[randomIndex];
        startPlayerTimer();
      }
    }, delay);
  }
  function playUserCorrectMove(delay) {
    setTimeout(() => {
      state.cg.set({ viewOnly: false });
      const nextMovePath = navigateNextMove(state.pgnPath);
      stateProxy.pgnPath = nextMovePath;
      playAiMove(delay);
    }, delay);
  }
  function handleWrongMove(move3) {
    state.errorCount++;
    state.cg.set({ fen: move3.after });
    playSound("Error");
    setBoard(move3.before);
    const isFailed = config.strictScoring || state.errorCount > config.handicap;
    if (isFailed) {
      stateProxy.errorTrack = "incorrect";
    }
    if (isFailed && !config.handicapAdvance) {
      stopPlayerTimer();
      state.cg.set({ viewOnly: true });
      playUserCorrectMove(state.delayTime);
    }
  }
  function promotePopup(orig, dest) {
    stopPlayerTimer();
    const cancelPopup = function() {
      toggleClass("showHide", "hidden");
      setBoard(state.chess.fen());
      setTimeout(() => {
        startPlayerTimer();
      }, config.animationTime);
    };
    const promoteButtons = document.querySelectorAll("#promoteButtons > button");
    const overlay = document.querySelector("#overlay");
    promoteButtons.forEach((button) => {
      button.onclick = (event) => {
        const clickedButton = event.currentTarget;
        event.stopPropagation();
        if (clickedButton instanceof HTMLButtonElement) {
          toggleClass("showHide", "hidden");
          const promoteChoice = clickedButton.value;
          const move3 = getLegalMove({ from: orig, to: dest, promotion: promoteChoice });
          if (move3) promoteAnimate = false;
          if (move3 && config.boardMode === "Puzzle") {
            startPlayerTimer();
            handleMoveAttempt(state.delayTime, move3.from, move3.to, move3.san);
          } else if (move3 && config.boardMode === "Viewer") {
            handleMoveAttempt(0, move3.from, move3.to, move3.san);
          }
        }
      };
    });
    if (overlay) {
      overlay.onclick = function() {
        cancelPopup();
      };
    }
    toggleClass("showHide", "hidden");
    positionPromoteOverlay();
  }
  function loadChessgroundBoard() {
    state.cg.set({
      orientation: config.randomOrientation ? randomOrientation() : state.playerColour,
      turnColor: toColor(),
      events: {
        select: (key) => {
          filterShapes("Drawn" /* Drawn */);
          state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
          if (config.boardMode === "Puzzle" && state.playerColour !== toColor()) return;
          if (!isSquare(key)) return;
          const orig = state.cg.state.selected;
          const dest = key;
          if (orig && isSquare(orig)) {
            const moveCheck = getLegalMove({ from: orig, to: dest, promotion: "q" });
            if (!moveCheck || moveCheck.promotion) return;
            const delay = config.boardMode === "Viewer" ? 0 : state.delayTime;
            handleMoveAttempt(delay, orig, dest);
            state.cg.selectSquare(null);
            return;
          }
          const arrowMove = state.chessGroundShapes.filter((shape) => shape.dest === dest && shape.brush && shapePriority.includes(shape.brush)).sort((a, b) => shapePriority.indexOf(a.brush) - shapePriority.indexOf(b.brush));
          if (arrowMove.length > 0 && config.boardMode === "Viewer") {
            if (arrowMove[0].dest && isSquare(arrowMove[0].orig) && isSquare(arrowMove[0].dest)) {
              handleMoveAttempt(0, arrowMove[0].orig, arrowMove[0].dest, arrowMove[0].san);
            }
          } else if (config.singleClickMove) {
            const allMoves = state.chess.moves({ verbose: true });
            const movesToSquare = allMoves.filter((move3) => move3.to === dest);
            if (movesToSquare.length === 1) {
              if (config.boardMode === "Puzzle") {
                handleMoveAttempt(state.delayTime, movesToSquare[0].from, movesToSquare[0].to, movesToSquare[0].san);
              } else if (config.boardMode === "Viewer") {
                handleMoveAttempt(0, movesToSquare[0].from, movesToSquare[0].to, movesToSquare[0].san);
              }
            }
          }
        }
      },
      movable: {
        color: config.boardMode === "Puzzle" ? state.playerColour : toColor(),
        dests: toDests(),
        events: {
          after: (orig, dest) => {
            if (!isSquare(orig) || !isSquare(dest)) return;
            const delay = config.boardMode === "Viewer" ? 0 : state.delayTime;
            handleMoveAttempt(delay, orig, dest);
          }
        }
      },
      premovable: {
        enabled: config.boardMode === "Viewer" ? false : true
      },
      check: state.chess.inCheck()
    });
    if (!state.chess.isGameOver() && config.flipBoard && config.boardMode === "Puzzle") {
      playAiMove(state.delayTime);
    } else if (config.boardMode === "Puzzle") {
      startPlayerTimer();
    }
    positionPromoteOverlay();
    initializePuzzleTimer();
    return;
  }
  var promoteAnimate;
  var init_chessFunctions = __esm({
    "src/js/chessFunctions.ts"() {
      "use strict";
      init_chess();
      init_config2();
      init_toolbox();
      init_pgnViewer();
      init_arrows();
      init_timer();
      init_audio();
      init_initializeUI();
      promoteAnimate = true;
    }
  });

  // src/js/handleStockfish.ts
  function convertCpToWinPercentage(cp) {
    const probability = 1 / (1 + Math.pow(10, -cp / 400));
    let percentage = probability * 100;
    if (state.playerColour === toColor()) {
      percentage = 100 - percentage;
    }
    return `${percentage.toFixed(1)}%`;
  }
  function handleStockfishMessages(event) {
    const message = event.data;
    if (typeof message !== "string") {
      console.warn("Received a non-string message from the Stockfish worker:", message);
      return;
    }
    const parts = message.split(" ");
    if (message.startsWith("info")) {
      if (analysisCache.fen !== state.chess.fen()) return;
      const pvIndex = parts.indexOf("pv");
      const cpIndex = parts.indexOf("cp");
      const mateIndex = parts.indexOf("mate");
      const firstMove = parts[pvIndex + 1];
      if (mateIndex > -1) {
        const mate = parseInt(parts[mateIndex + 1], 10);
        let adv = mate < 0 ? 0 : 100;
        if (state.playerColour === toColor()) adv = 100 - adv;
        analysisCache.advantage = `${adv.toFixed(1)}%`;
      } else if (cpIndex > -1) {
        const cp = parseInt(parts[cpIndex + 1], 10);
        analysisCache.advantage = convertCpToWinPercentage(cp);
      }
      document.documentElement.style.setProperty("--centipawn", analysisCache.advantage);
      if (firstMove === analysisCache.moveUci) {
        return;
      }
      const moveObject = getLegalMove(firstMove);
      analysisCache.moveUci = firstMove;
      analysisCache.move = moveObject;
      if (moveObject && state.analysisToggledOn) {
        filterShapes("Stockfish" /* Stockfish */);
        pushShapes(moveObject, "stockfish");
        state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
      }
    } else if (message.startsWith("bestmove")) {
      state.isStockfishBusy = false;
      if (state.stockfishRestart) {
        state.stockfishRestart = false;
        startAnalysis(config.analysisTime);
      }
      const bestMoveUci = message.split(" ")[1];
      const moveObject = getLegalMove(bestMoveUci);
      if (moveObject && state.analysisToggledOn) {
        filterShapes("Stockfish" /* Stockfish */);
        pushShapes(moveObject, "stockfinished");
        state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
      }
    }
  }
  function handleStockfishCrash(source) {
    console.error(`Stockfish engine crashed. Source: ${source}.`);
    if (!state.analysisToggledOn) return;
    console.log("Attempting to restart the engine...");
    setTimeout(() => initializeStockfish(), 250);
  }
  function initializeStockfish() {
    return new Promise((resolve, reject) => {
      if (stockfish) stockfish.terminate();
      stockfish = new Worker("/_stockfish.js");
      stockfish.onmessage = (event) => {
        const message = event.data ?? event;
        if (typeof message !== "string") return;
        if (message === "uciok") {
          stockfish.postMessage("isready");
        } else if (message === "readyok") {
          stockfish.onmessage = ((event2) => {
            handleStockfishMessages(event2);
          });
          stockfish.onerror = () => handleStockfishCrash("stockfish.onerror");
          resolve();
        }
      };
      stockfish.onerror = (error) => {
        console.error("Stockfish failed to initialize.", error);
        handleStockfishCrash("stockfish.on-init-error");
        reject(error);
      };
      stockfish.postMessage("uci");
    });
  }
  function startAnalysis(movetime) {
    if (!state.analysisToggledOn || !stockfish || state.stockfishRestart || state.chess.moves().length === 0) return;
    if (state.isStockfishBusy) {
      state.stockfishRestart = true;
      stockfish.postMessage("stop");
      return;
    }
    if (analysisCache.fen !== state.chess.fen()) {
      analysisCache = {
        fen: state.chess.fen(),
        // Set the new FEN
        moveUci: "",
        move: null,
        advantage: analysisCache.advantage
      };
      filterShapes("Stockfish" /* Stockfish */);
      state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
    }
    state.isStockfishBusy = true;
    stockfish.postMessage(`position fen ${state.chess.fen()}`);
    stockfish.postMessage(`go movetime ${movetime}`);
  }
  function toggleStockfishAnalysis() {
    const toggleButton = document.querySelector("#stockfishToggle");
    if (!toggleButton) return;
    if (!stockfish) {
      setButtonsDisabled(["stockfish"], true);
      const icon = toggleButton.querySelector(".material-icons");
      if (icon) {
        icon.textContent = "sync";
        icon.classList.add("icon-spin");
      }
      initializeStockfish().then(() => {
        setButtonsDisabled(["stockfish"], false);
        state.analysisToggledOn = false;
        toggleStockfishAnalysis();
      });
      return;
    }
    state.analysisToggledOn = !state.analysisToggledOn;
    toggleButton.classList.toggle("active-toggle", state.analysisToggledOn);
    toggleButton.innerHTML = state.analysisToggledOn ? "<span class='material-icons md-small'>developer_board</span>" : "<span class='material-icons md-small'>developer_board_off</span>";
    state.cgwrap.classList.toggle("analysisMode", state.analysisToggledOn);
    if (state.analysisToggledOn) {
      startAnalysis(config.analysisTime);
    } else {
      if (state.isStockfishBusy) {
        stockfish.postMessage("stop");
      }
      filterShapes("Stockfish" /* Stockfish */);
      state.cg.set({ drawable: { shapes: state.chessGroundShapes } });
    }
  }
  var stockfish, analysisCache;
  var init_handleStockfish = __esm({
    "src/js/handleStockfish.ts"() {
      "use strict";
      init_chessFunctions();
      init_arrows();
      init_config2();
      init_toolbox();
      stockfish = null;
      analysisCache = {
        // cache info to reduce lag while analysis is on
        fen: "",
        moveUci: "",
        move: null,
        advantage: "50.0%"
      };
    }
  });

  // src/js/toolbox.ts
  function setButtonsDisabled(keys, isDisabled) {
    keys.forEach((key) => {
      const button = btn[key];
      if (button) {
        button.disabled = isDisabled;
      }
    });
  }
  function borderFlash(colour = null) {
    document.documentElement.style.setProperty("--timer-flash-color", colour ?? state.solvedColour);
    state.cgwrap.classList.add("time-added-flash");
    setTimeout(() => {
      state.cgwrap.classList.remove("time-added-flash");
    }, 500);
  }
  function toColor() {
    return state.chess.turn() === "w" ? "white" : "black";
  }
  function navBackward() {
    if (!state.pgnPath.length) return;
    const navCheck = navigatePrevMove(state.pgnPath);
    if (!navCheck.length) {
      resetBoard();
    } else {
      stateProxy.pgnPath = navCheck;
    }
  }
  function navForward() {
    if (isEndOfLine(state.pgnPath)) return;
    const navCheck = navigateNextMove(state.pgnPath);
    console.log(state.pgnPath, navCheck);
    stateProxy.pgnPath = navCheck;
  }
  function resetBoard() {
    stateProxy.pgnPath = [];
  }
  function rotateBoard() {
    state.boardRotation = state.boardRotation === "white" ? "black" : "white";
    const coordWhite = getComputedStyle(htmlElement).getPropertyValue("--coord-white").trim();
    const coordBlack = getComputedStyle(htmlElement).getPropertyValue("--coord-black").trim();
    htmlElement.style.setProperty("--coord-white", coordBlack);
    htmlElement.style.setProperty("--coord-black", coordWhite);
    state.cg.set({ orientation: state.boardRotation });
    const flipButton = document.querySelector(".flipBoardIcon");
    if (flipButton && flipButton.style.transform.includes("90deg")) {
      flipButton.style.transform = "rotate(270deg)";
    } else if (flipButton) {
      flipButton.style.transform = "rotate(90deg)";
    }
  }
  function copyFen() {
    const textarea = document.createElement("textarea");
    textarea.value = state.chess.fen();
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      playSound("computer-mouse-click");
      return true;
    } catch (err) {
      playSound("Error");
      console.error("Failed to copy text using execCommand:", err);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
  function setupEventListeners() {
    const pgnContainer = document.getElementById("pgnComment");
    if (pgnContainer) {
      pgnContainer.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLSpanElement) || !target.classList.contains("move")) return;
        const pathKey = target.dataset.pathKey;
        if (pathKey) {
          const move3 = state.pgnPathMap.get(pathKey);
          if (move3) {
            stateProxy.pgnPath = move3.pgnPath;
          } else {
            return;
          }
        }
      });
    }
    const commentBox = document.getElementById("commentBox");
    if (!commentBox) return;
    commentBox.addEventListener("mouseover", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const moveElement = target.closest(".move");
      if (!moveElement) return;
      const tooltip = moveElement.querySelector(".nagTooltip");
      if (!tooltip || !tooltip.textContent?.trim()) return;
      const itemRect = moveElement.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth;
      const commentBoxRect = commentBox.getBoundingClientRect();
      let tooltipLeft = itemRect.left + itemRect.width / 2 - tooltipWidth / 2;
      if (tooltipLeft < commentBoxRect.left) {
        tooltipLeft = commentBoxRect.left;
      } else if (tooltipLeft + tooltipWidth > commentBoxRect.right) {
        tooltipLeft = commentBoxRect.right - tooltipWidth;
      }
      tooltip.style.left = `${tooltipLeft}px`;
      tooltip.style.top = `${itemRect.top - tooltip.offsetHeight - 3}px`;
      tooltip.style.display = "block";
      tooltip.style.visibility = "visible";
    });
    commentBox.addEventListener("mouseout", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const moveElement = target.closest(".move");
      if (!moveElement) return;
      const tooltip = moveElement.querySelector(".nagTooltip");
      if (tooltip) {
        tooltip.style.visibility = "hidden";
      }
    });
    const actions = {
      "resetBoard": resetBoard,
      "navBackward": navBackward,
      "navForward": navForward,
      "rotateBoard": rotateBoard,
      "copyFen": copyFen,
      "stockfishToggle": () => toggleStockfishAnalysis()
    };
    document.querySelector("#buttons-container")?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest("button");
      if (!button) return;
      const handler = actions[button.id];
      if (handler) {
        handler();
      }
    });
    const promoteOverlay = document.getElementById("overlay");
    state.cgwrap.addEventListener("wheel", (event) => {
      if (promoteOverlay && !promoteOverlay.classList.contains("hidden") || config.boardMode !== "Viewer") return;
      event.preventDefault();
      if (event.deltaY < 0) {
        navBackward();
      } else if (event.deltaY > 0) {
        navForward();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (promoteOverlay && !promoteOverlay.classList.contains("hidden") || config.boardMode !== "Viewer") return;
      switch (event.key) {
        case "ArrowLeft":
          navBackward();
          break;
        case "ArrowRight":
          navForward();
          break;
        case "ArrowDown":
          resetBoard();
          break;
      }
    });
    window.addEventListener("error", (event) => {
      const message = event.message || "";
      const filename = event.filename || "";
      const isDetailedStockfishCrash = message.includes("abort") && filename.includes("_stockfish.js");
      const isGenericCrossOriginError = message === "Script error.";
      if (isDetailedStockfishCrash || isGenericCrossOriginError) {
        event.preventDefault();
        console.warn("Caught a fatal Stockfish crash via global error handler.");
        if (isGenericCrossOriginError) {
          console.log("generic message:", message);
        } else {
          console.log(`Crash details: Message: "${message}", Filename: "${filename}"`);
        }
        handleStockfishCrash("window.onerror");
      }
    });
    let isUpdateScheduled = false;
    const handleReposition = () => {
      if (isUpdateScheduled) return;
      isUpdateScheduled = true;
      requestAnimationFrame(() => {
        positionPromoteOverlay();
        isUpdateScheduled = false;
      });
    };
    const resizeObserver = new ResizeObserver(handleReposition);
    resizeObserver.observe(state.cgwrap);
    window.addEventListener("resize", handleReposition);
    document.addEventListener("scroll", handleReposition, true);
  }
  var stateHandler, stateProxy, htmlElement, btn;
  var init_toolbox = __esm({
    "src/js/toolbox.ts"() {
      "use strict";
      init_config2();
      init_pgnViewer();
      init_initializeUI();
      init_handleStockfish();
      init_audio();
      init_chessFunctions();
      init_arrows();
      init_timer();
      stateHandler = {
        set(target, property, value, receiver) {
          if (property === "pgnPath") {
            const pgnPath = value;
            const pathKey = pgnPath.join(",");
            const pathMove = state.pgnPathMap.get(pathKey) ?? null;
            console.log(pgnPath, pathMove);
            if ((pathMove || !pgnPath.length) && !(!state.pgnPath.join(",").length && !pgnPath.length)) {
              const lastMove = state.lastMove;
              if (!pgnPath.length) {
                setButtonsDisabled(["back", "reset"], true);
                state.chess.reset();
                state.chess.load(state.startFen);
                state.lastMove = null;
              } else {
                setButtonsDisabled(["back", "reset"], false);
              }
              if (pathMove) {
                state.chess.load(pathMove.after);
                moveAudio(pathMove);
              }
              ;
              setTimeout(() => {
                animateBoard(lastMove, pathMove);
              }, 2);
              startAnalysis(config.analysisTime);
              drawArrows(pgnPath);
              highlightCurrentMove(pgnPath);
              const endOfLineCheck = isEndOfLine(pgnPath);
              if (endOfLineCheck) {
                if (config.boardMode === "Puzzle") {
                  state.puzzleComplete = true;
                  const correctState = state.puzzleTime > 0 && !config.timerScore ? "correctTime" : "correct";
                  stateProxy.errorTrack = state.errorTrack ?? correctState;
                } else {
                  state.chessGroundShapes = [];
                }
              }
              setButtonsDisabled(["forward"], endOfLineCheck);
              const { chess: _chess, cg: _cg, cgwrap: _cgwrap, puzzleComplete: _puzzleComplete, ...stateCopy } = state;
              stateCopy.pgnPath = pgnPath;
              window.parent.postMessage(stateCopy, "*");
            }
          } else if (property === "errorTrack") {
            const errorTrack = value;
            const { chess: _chess, cg: _cg, cgwrap: _cgwrap, ...stateCopy } = state;
            const endOfLineCheck = isEndOfLine(state.pgnPath);
            if (endOfLineCheck) stateCopy.puzzleComplete = true;
            if (errorTrack === "correct") {
              state.solvedColour = "var(--correct-color)";
              if (config.autoAdvance) {
                stateCopy.puzzleComplete = true;
              }
              ;
            } else if (errorTrack === "correctTime") {
              state.solvedColour = "var(--perfect-color)";
            } else if (errorTrack === "incorrect") {
              state.solvedColour = "var(--incorrect-color)";
              if (config.timerAdvance && state.puzzleTime === 0 || config.handicapAdvance) {
                stateCopy.puzzleComplete = true;
              }
            }
            if (stateCopy.puzzleComplete) {
              stopPlayerTimer();
              state.cgwrap.classList.remove("timerMode");
              document.documentElement.style.setProperty("--border-color", state.solvedColour);
              state.cg.set({ viewOnly: true });
              setTimeout(() => {
                stateCopy.pgnPath = state.pgnPath;
                window.parent.postMessage(stateCopy, "*");
              }, state.delayTime);
            }
            borderFlash();
          }
          return Reflect.set(target, property, value, receiver);
        }
      };
      stateProxy = new Proxy(state, stateHandler);
      htmlElement = document.documentElement;
      btn = {
        get reset() {
          return document.querySelector("#resetBoard");
        },
        get back() {
          return document.querySelector("#navBackward");
        },
        get forward() {
          return document.querySelector("#navForward");
        },
        get copy() {
          return document.querySelector("#copyFen");
        },
        get stockfish() {
          return document.querySelector("#stockfishToggle");
        },
        get flip() {
          return document.querySelector("#rotateBoard");
        }
      };
    }
  });

  // src/js/initializeUI.ts
  function getElement(selector, _type) {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Critical UI element not found: ${selector}`);
    }
    return element;
  }
  function initializePgnData() {
    const pathKey = state.pgnPath.join(",");
    const moveTrack = state.pgnPathMap.get(pathKey);
    state.chess.load(moveTrack?.after ?? state.startFen);
    if (config.boardMode === "Viewer") {
      state.cg.set({ animation: { enabled: false } });
      state.cg.set({ fen: moveTrack?.after ?? state.startFen });
      state.cg.set({ animation: { enabled: true } });
      if (moveTrack) state.cg.set({ lastMove: [moveTrack.from, moveTrack.to] });
      if (state.pgnPath.length && moveTrack) {
        setButtonsDisabled(["back", "reset"], false);
        state.lastMove = moveTrack;
      }
      ;
      const endOfLineCheck = isEndOfLine(state.pgnPath);
      setButtonsDisabled(["forward"], endOfLineCheck);
      drawArrows(state.pgnPath);
    }
  }
  function initializeUI() {
    initializePgnData();
    const promoteBtnMap = ["Q", "B", "N", "R"];
    promoteBtnMap.forEach((piece) => {
      const imgElement = getElement(`#promote${piece}`, HTMLImageElement);
      imgElement.src = `_${state.playerColour[0]}${piece}.svg`;
    });
    htmlElement2.style.setProperty("--background-color", config.background);
    const commentBox = document.getElementById("commentBox");
    const textField = document.getElementById("textField");
    if (textField) {
      if (config.ankiText) {
        textField.innerHTML = config.ankiText;
      } else {
        textField.style.display = "none";
      }
    }
    if (config.boardMode === "Puzzle") {
      const buttonsContainer = document.querySelector("#buttons-container");
      if (buttonsContainer) buttonsContainer.style.visibility = "hidden";
      const pgnComment = document.getElementById("pgnComment");
      if (pgnComment) pgnComment.style.display = "none";
      if (commentBox && (!config.frontText || !config.ankiText)) {
        commentBox.style.display = "none";
      }
    }
    const fenParts = state.startFen.split(" ");
    let boardRotation = fenParts.length > 1 && fenParts[1] === "w" ? "white" : "black";
    if (config.flipBoard) {
      boardRotation = boardRotation === "white" ? "black" : "white";
    }
    state.boardRotation = boardRotation;
    state.playerColour = state.boardRotation;
    state.opponentColour = state.boardRotation === "white" ? "black" : "white";
    if (state.boardRotation === "white") {
      const coordWhite = getComputedStyle(htmlElement2).getPropertyValue("--coord-white").trim();
      const coordBlack = getComputedStyle(htmlElement2).getPropertyValue("--coord-black").trim();
      htmlElement2.style.setProperty("--coord-white", coordBlack);
      htmlElement2.style.setProperty("--coord-black", coordWhite);
    }
    const borderColor = config.randomOrientation ? "grey" : state.playerColour;
    htmlElement2.style.setProperty("--border-color", borderColor);
    htmlElement2.style.setProperty("--player-color", state.playerColour);
    htmlElement2.style.setProperty("--opponent-color", state.opponentColour);
    if (config.boardMode === "Viewer") {
      if (state.errorTrack === "incorrect") {
        htmlElement2.style.setProperty("--border-color", "var(--incorrect-color)");
      } else if (state.errorTrack === "correctTime") {
        htmlElement2.style.setProperty("--border-color", "var(--perfect-color)");
      } else if (state.errorTrack === "correct") {
        htmlElement2.style.setProperty("--border-color", "var(--correct-color)");
      }
    }
  }
  function positionPromoteOverlay() {
    const promoteOverlay = document.getElementById("promoteButtons");
    if (!promoteOverlay || promoteOverlay.classList.contains("hidden")) return;
    const rect = state.cgwrap.getBoundingClientRect();
    const borderWidthString = getComputedStyle(document.documentElement).getPropertyValue("--board-border-width");
    const borderWidth = parseInt(borderWidthString, 10);
    promoteOverlay.style.top = `${rect.top + borderWidth}px`;
    promoteOverlay.style.left = `${rect.left + borderWidth}px`;
  }
  var htmlElement2;
  var init_initializeUI = __esm({
    "src/js/initializeUI.ts"() {
      "use strict";
      init_config2();
      init_toolbox();
      init_pgnViewer();
      init_arrows();
      htmlElement2 = document.documentElement;
    }
  });

  // src/main.ts
  var require_main = __commonJS({
    "src/main.ts"() {
      init_chessground_base();
      init_custom();
      init_pgnViewer();
      init_initializeUI();
      init_chessFunctions();
      init_toolbox();
      init_pgnViewer();
      init_config2();
      (function loadElements() {
        augmentPgnTree(state.parsedPGN.moves);
        initializeUI();
        initPgnViewer();
        loadChessgroundBoard();
        setupEventListeners();
      })();
    }
  });
  require_main();
})();
/*! Bundled license information:

chess.js/dist/esm/chess.js:
  (**
   * @license
   * Copyright (c) 2025, Jeff Hlywa (jhlywa@gmail.com)
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice,
   *    this list of conditions and the following disclaimer.
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   *    this list of conditions and the following disclaimer in the documentation
   *    and/or other materials provided with the distribution.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
   * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
   * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
   * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
   * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
   * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
   * POSSIBILITY OF SUCH DAMAGE.
   *)
*/
