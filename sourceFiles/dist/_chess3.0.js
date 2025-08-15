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
    var peg$f2 = function(tagName2, tagValue) {
      return [tagName2, tagValue];
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
  function xoroshiro128(state) {
    return function() {
      let s0 = BigInt(state & MASK64);
      let s1 = BigInt(state >> 64n & MASK64);
      const result = wrappingMul(rotl(wrappingMul(s0, 5n), 7n), 9n);
      s1 ^= s0;
      s0 = (rotl(s0, 24n) ^ s1 ^ s1 << 16n) & MASK64;
      s1 = rotl(s1, 37n);
      state = s1 << 64n | s0;
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
    const r2 = rank(square);
    return "abcdefgh".substring(f, f + 1) + "87654321".substring(r2, r2 + 1);
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
    const r2 = rank(to);
    if (piece === PAWN && (r2 === RANK_1 || r2 === RANK_8)) {
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
            var e2 = this.location.end;
            var filler = peg$padEnd("", offset_s.line.toString().length, " ");
            var line = src[s.line - 1];
            var last = s.line === e2.line ? e2.column : line.length + 1;
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
  var invRanks, allKeys, pos2key, key2pos, uciToMove, allPos, timer, opposite, distanceSq, samePiece, posToTranslate, translate, translateAndScale, setVisible, eventPosition, isRightButton, createEl;
  var init_util = __esm({
    "node_modules/chessground/dist/util.js"() {
      init_types();
      invRanks = [...ranks].reverse();
      allKeys = Array.prototype.concat(...files.map((c) => ranks.map((r2) => c + r2)));
      pos2key = (pos) => allKeys[8 * pos[0] + pos[1]];
      key2pos = (k) => [k.charCodeAt(0) - 97, k.charCodeAt(1) - 49];
      uciToMove = (uci) => {
        if (!uci)
          return void 0;
        if (uci[1] === "@")
          return [uci.slice(2, 4)];
        return [uci.slice(0, 2), uci.slice(2, 4)];
      };
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
      eventPosition = (e2) => {
        var _a;
        if (e2.clientX || e2.clientX === 0)
          return [e2.clientX, e2.clientY];
        if ((_a = e2.targetTouches) === null || _a === void 0 ? void 0 : _a[0])
          return [e2.targetTouches[0].clientX, e2.targetTouches[0].clientY];
        return;
      };
      isRightButton = (e2) => e2.button === 2;
      createEl = (tagName2, className) => {
        const el = document.createElement(tagName2);
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
    const pos = key2pos(key), r2 = piece.role, mobility = r2 === "pawn" ? pawn(piece.color) : r2 === "knight" ? knight : r2 === "bishop" ? bishop : r2 === "rook" ? rook : r2 === "queen" ? queen : king(piece.color, rookFilesOf(pieces, piece.color), canCastle);
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
      setTimeout(() => f(...args), 1);
  }
  function toggleOrientation(state) {
    state.orientation = opposite(state.orientation);
    state.animation.current = state.draggable.current = state.selected = void 0;
  }
  function setPieces(state, pieces) {
    for (const [key, piece] of pieces) {
      if (piece)
        state.pieces.set(key, piece);
      else
        state.pieces.delete(key);
    }
  }
  function setCheck(state, color) {
    state.check = void 0;
    if (color === true)
      color = state.turnColor;
    if (color)
      for (const [k, p] of state.pieces) {
        if (p.role === "king" && p.color === color) {
          state.check = k;
        }
      }
  }
  function setPremove(state, orig, dest, meta) {
    unsetPredrop(state);
    state.premovable.current = [orig, dest];
    callUserFunction(state.premovable.events.set, orig, dest, meta);
  }
  function unsetPremove(state) {
    if (state.premovable.current) {
      state.premovable.current = void 0;
      callUserFunction(state.premovable.events.unset);
    }
  }
  function setPredrop(state, role, key) {
    unsetPremove(state);
    state.predroppable.current = { role, key };
    callUserFunction(state.predroppable.events.set, role, key);
  }
  function unsetPredrop(state) {
    const pd = state.predroppable;
    if (pd.current) {
      pd.current = void 0;
      callUserFunction(pd.events.unset);
    }
  }
  function tryAutoCastle(state, orig, dest) {
    if (!state.autoCastle)
      return false;
    const king2 = state.pieces.get(orig);
    if (!king2 || king2.role !== "king")
      return false;
    const origPos = key2pos(orig);
    const destPos = key2pos(dest);
    if (origPos[1] !== 0 && origPos[1] !== 7 || origPos[1] !== destPos[1])
      return false;
    if (origPos[0] === 4 && !state.pieces.has(dest)) {
      if (destPos[0] === 6)
        dest = pos2key([7, destPos[1]]);
      else if (destPos[0] === 2)
        dest = pos2key([0, destPos[1]]);
    }
    const rook2 = state.pieces.get(dest);
    if (!rook2 || rook2.color !== king2.color || rook2.role !== "rook")
      return false;
    state.pieces.delete(orig);
    state.pieces.delete(dest);
    if (origPos[0] < destPos[0]) {
      state.pieces.set(pos2key([6, destPos[1]]), king2);
      state.pieces.set(pos2key([5, destPos[1]]), rook2);
    } else {
      state.pieces.set(pos2key([2, destPos[1]]), king2);
      state.pieces.set(pos2key([3, destPos[1]]), rook2);
    }
    return true;
  }
  function baseMove(state, orig, dest) {
    const origPiece = state.pieces.get(orig), destPiece = state.pieces.get(dest);
    if (orig === dest || !origPiece)
      return false;
    const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : void 0;
    if (dest === state.selected)
      unselect(state);
    callUserFunction(state.events.move, orig, dest, captured);
    if (!tryAutoCastle(state, orig, dest)) {
      state.pieces.set(dest, origPiece);
      state.pieces.delete(orig);
    }
    state.lastMove = [orig, dest];
    state.check = void 0;
    callUserFunction(state.events.change);
    return captured || true;
  }
  function baseNewPiece(state, piece, key, force) {
    if (state.pieces.has(key)) {
      if (force)
        state.pieces.delete(key);
      else
        return false;
    }
    callUserFunction(state.events.dropNewPiece, piece, key);
    state.pieces.set(key, piece);
    state.lastMove = [key];
    state.check = void 0;
    callUserFunction(state.events.change);
    state.movable.dests = void 0;
    state.turnColor = opposite(state.turnColor);
    return true;
  }
  function baseUserMove(state, orig, dest) {
    const result = baseMove(state, orig, dest);
    if (result) {
      state.movable.dests = void 0;
      state.turnColor = opposite(state.turnColor);
      state.animation.current = void 0;
    }
    return result;
  }
  function userMove(state, orig, dest) {
    if (canMove(state, orig, dest)) {
      const result = baseUserMove(state, orig, dest);
      if (result) {
        const holdTime = state.hold.stop();
        unselect(state);
        const metadata = {
          premove: false,
          ctrlKey: state.stats.ctrlKey,
          holdTime
        };
        if (result !== true)
          metadata.captured = result;
        callUserFunction(state.movable.events.after, orig, dest, metadata);
        return true;
      }
    } else if (canPremove(state, orig, dest)) {
      setPremove(state, orig, dest, {
        ctrlKey: state.stats.ctrlKey
      });
      unselect(state);
      return true;
    }
    unselect(state);
    return false;
  }
  function dropNewPiece(state, orig, dest, force) {
    const piece = state.pieces.get(orig);
    if (piece && (canDrop(state, orig, dest) || force)) {
      state.pieces.delete(orig);
      baseNewPiece(state, piece, dest, force);
      callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
        premove: false,
        predrop: false
      });
    } else if (piece && canPredrop(state, orig, dest)) {
      setPredrop(state, piece.role, dest);
    } else {
      unsetPremove(state);
      unsetPredrop(state);
    }
    state.pieces.delete(orig);
    unselect(state);
  }
  function selectSquare(state, key, force) {
    callUserFunction(state.events.select, key);
    if (state.selected) {
      if (state.selected === key && !state.draggable.enabled) {
        unselect(state);
        state.hold.cancel();
        return;
      } else if ((state.selectable.enabled || force) && state.selected !== key) {
        if (userMove(state, state.selected, key)) {
          state.stats.dragged = false;
          return;
        }
      }
    }
    if ((state.selectable.enabled || state.draggable.enabled) && (isMovable(state, key) || isPremovable(state, key))) {
      setSelected(state, key);
      state.hold.start();
    }
  }
  function setSelected(state, key) {
    state.selected = key;
    if (isPremovable(state, key)) {
      if (!state.premovable.customDests) {
        state.premovable.dests = premove(state.pieces, key, state.premovable.castle);
      }
    } else
      state.premovable.dests = void 0;
  }
  function unselect(state) {
    state.selected = void 0;
    state.premovable.dests = void 0;
    state.hold.cancel();
  }
  function isMovable(state, orig) {
    const piece = state.pieces.get(orig);
    return !!piece && (state.movable.color === "both" || state.movable.color === piece.color && state.turnColor === piece.color);
  }
  function canDrop(state, orig, dest) {
    const piece = state.pieces.get(orig);
    return !!piece && (orig === dest || !state.pieces.has(dest)) && (state.movable.color === "both" || state.movable.color === piece.color && state.turnColor === piece.color);
  }
  function isPremovable(state, orig) {
    const piece = state.pieces.get(orig);
    return !!piece && state.premovable.enabled && state.movable.color === piece.color && state.turnColor !== piece.color;
  }
  function canPremove(state, orig, dest) {
    var _a, _b;
    const validPremoves = (_b = (_a = state.premovable.customDests) === null || _a === void 0 ? void 0 : _a.get(orig)) !== null && _b !== void 0 ? _b : premove(state.pieces, orig, state.premovable.castle);
    return orig !== dest && isPremovable(state, orig) && validPremoves.includes(dest);
  }
  function canPredrop(state, orig, dest) {
    const piece = state.pieces.get(orig);
    const destPiece = state.pieces.get(dest);
    return !!piece && (!destPiece || destPiece.color !== state.movable.color) && state.predroppable.enabled && (piece.role !== "pawn" || dest[1] !== "1" && dest[1] !== "8") && state.movable.color === piece.color && state.turnColor !== piece.color;
  }
  function isDraggable(state, orig) {
    const piece = state.pieces.get(orig);
    return !!piece && state.draggable.enabled && (state.movable.color === "both" || state.movable.color === piece.color && (state.turnColor === piece.color || state.premovable.enabled));
  }
  function playPremove(state) {
    const move3 = state.premovable.current;
    if (!move3)
      return false;
    const orig = move3[0], dest = move3[1];
    let success = false;
    if (canMove(state, orig, dest)) {
      const result = baseUserMove(state, orig, dest);
      if (result) {
        const metadata = { premove: true };
        if (result !== true)
          metadata.captured = result;
        callUserFunction(state.movable.events.after, orig, dest, metadata);
        success = true;
      }
    }
    unsetPremove(state);
    return success;
  }
  function playPredrop(state, validate) {
    const drop2 = state.predroppable.current;
    let success = false;
    if (!drop2)
      return false;
    if (validate(drop2)) {
      const piece = {
        role: drop2.role,
        color: state.movable.color
      };
      if (baseNewPiece(state, piece, drop2.key)) {
        callUserFunction(state.movable.events.afterNewPiece, drop2.role, drop2.key, {
          premove: false,
          predrop: true
        });
        success = true;
      }
    }
    unsetPredrop(state);
    return success;
  }
  function cancelMove(state) {
    unsetPremove(state);
    unsetPredrop(state);
    unselect(state);
  }
  function stop(state) {
    state.movable.color = state.movable.dests = state.animation.current = void 0;
    cancelMove(state);
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
      canMove = (state, orig, dest) => {
        var _a, _b;
        return orig !== dest && isMovable(state, orig) && (state.movable.free || !!((_b = (_a = state.movable.dests) === null || _a === void 0 ? void 0 : _a.get(orig)) === null || _b === void 0 ? void 0 : _b.includes(dest)));
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
  function applyAnimation(state, config) {
    if (config.animation) {
      deepMerge(state.animation, config.animation);
      if ((state.animation.duration || 0) < 70)
        state.animation.enabled = false;
    }
  }
  function configure(state, config) {
    var _a, _b, _c;
    if ((_a = config.movable) === null || _a === void 0 ? void 0 : _a.dests)
      state.movable.dests = void 0;
    if ((_b = config.drawable) === null || _b === void 0 ? void 0 : _b.autoShapes)
      state.drawable.autoShapes = [];
    deepMerge(state, config);
    if (config.fen) {
      state.pieces = read(config.fen);
      state.drawable.shapes = ((_c = config.drawable) === null || _c === void 0 ? void 0 : _c.shapes) || [];
    }
    if ("check" in config)
      setCheck(state, config.check || false);
    if ("lastMove" in config && !config.lastMove)
      state.lastMove = void 0;
    else if (config.lastMove)
      state.lastMove = config.lastMove;
    if (state.selected)
      setSelected(state, state.selected);
    applyAnimation(state, config);
    if (!state.movable.rookCastle && state.movable.dests) {
      const rank2 = state.movable.color === "white" ? "1" : "8", kingStartPos = "e" + rank2, dests = state.movable.dests.get(kingStartPos), king2 = state.pieces.get(kingStartPos);
      if (!dests || !king2 || king2.role !== "king")
        return;
      state.movable.dests.set(kingStartPos, dests.filter((d) => !(d === "a" + rank2 && dests.includes("c" + rank2)) && !(d === "h" + rank2 && dests.includes("g" + rank2))));
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
  function render(mutation, state) {
    const result = mutation(state);
    state.dom.redraw();
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
  function step(state, now) {
    const cur = state.animation.current;
    if (cur === void 0) {
      if (!state.dom.destroyed)
        state.dom.redrawNow();
      return;
    }
    const rest = 1 - (now - cur.start) * cur.frequency;
    if (rest <= 0) {
      state.animation.current = void 0;
      state.dom.redrawNow();
    } else {
      const ease = easing(rest);
      for (const cfg of cur.plan.anims.values()) {
        cfg[2] = cfg[0] * ease;
        cfg[3] = cfg[1] * ease;
      }
      state.dom.redrawNow(true);
      requestAnimationFrame((now2 = performance.now()) => step(state, now2));
    }
  }
  function animate(mutation, state) {
    const prevPieces = new Map(state.pieces);
    const result = mutation(state);
    const plan = computePlan(prevPieces, state);
    if (plan.anims.size || plan.fadings.size) {
      const alreadyRunning = state.animation.current && state.animation.current.start;
      state.animation.current = {
        start: performance.now(),
        frequency: 1 / state.animation.duration,
        plan
      };
      if (!alreadyRunning)
        step(state, performance.now());
    } else {
      state.dom.redraw();
    }
    return result;
  }
  var anim, makePiece, closer, easing;
  var init_anim = __esm({
    "node_modules/chessground/dist/anim.js"() {
      init_util();
      anim = (mutation, state) => state.animation.enabled ? animate(mutation, state) : render(mutation, state);
      makePiece = (key, piece) => ({
        key,
        pos: key2pos(key),
        piece
      });
      closer = (piece, pieces) => pieces.sort((p1, p2) => distanceSq(piece.pos, p1.pos) - distanceSq(piece.pos, p2.pos))[0];
      easing = (t2) => t2 < 0.5 ? 4 * t2 * t2 * t2 : (t2 - 1) * (2 * t2 - 2) * (2 * t2 - 2) + 1;
    }
  });

  // node_modules/chessground/dist/draw.js
  function start(state, e2) {
    if (e2.touches && e2.touches.length > 1)
      return;
    e2.stopPropagation();
    e2.preventDefault();
    e2.ctrlKey ? unselect(state) : cancelMove(state);
    const pos = eventPosition(e2), orig = getKeyAtDomPos(pos, whitePov(state), state.dom.bounds());
    if (!orig)
      return;
    state.drawable.current = {
      orig,
      pos,
      brush: eventBrush(e2),
      snapToValidMove: state.drawable.defaultSnapToValidMove
    };
    processDraw(state);
  }
  function processDraw(state) {
    requestAnimationFrame(() => {
      const cur = state.drawable.current;
      if (cur) {
        const keyAtDomPos = getKeyAtDomPos(cur.pos, whitePov(state), state.dom.bounds());
        if (!keyAtDomPos) {
          cur.snapToValidMove = false;
        }
        const mouseSq = cur.snapToValidMove ? getSnappedKeyAtDomPos(cur.orig, cur.pos, whitePov(state), state.dom.bounds()) : keyAtDomPos;
        if (mouseSq !== cur.mouseSq) {
          cur.mouseSq = mouseSq;
          cur.dest = mouseSq !== cur.orig ? mouseSq : void 0;
          state.dom.redrawNow();
        }
        processDraw(state);
      }
    });
  }
  function move(state, e2) {
    if (state.drawable.current)
      state.drawable.current.pos = eventPosition(e2);
  }
  function end(state) {
    const cur = state.drawable.current;
    if (cur) {
      if (cur.mouseSq)
        addShape(state.drawable, cur);
      cancel(state);
    }
  }
  function cancel(state) {
    if (state.drawable.current) {
      state.drawable.current = void 0;
      state.dom.redraw();
    }
  }
  function clear(state) {
    if (state.drawable.shapes.length) {
      state.drawable.shapes = [];
      state.dom.redraw();
      onChange(state.drawable);
    }
  }
  function eventBrush(e2) {
    var _a;
    const modA = (e2.shiftKey || e2.ctrlKey) && isRightButton(e2);
    const modB = e2.altKey || e2.metaKey || ((_a = e2.getModifierState) === null || _a === void 0 ? void 0 : _a.call(e2, "AltGraph"));
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
  function start2(s, e2) {
    if (!(s.trustAllEvents || e2.isTrusted))
      return;
    if (e2.buttons !== void 0 && e2.buttons > 1)
      return;
    if (e2.touches && e2.touches.length > 1)
      return;
    const bounds = s.dom.bounds(), position = eventPosition(e2), orig = getKeyAtDomPos(position, whitePov(s), bounds);
    if (!orig)
      return;
    const piece = s.pieces.get(orig);
    const previouslySelected = s.selected;
    if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || !piece || piece.color !== s.turnColor))
      clear(s);
    if (e2.cancelable !== false && (!e2.touches || s.blockTouchScroll || piece || previouslySelected || pieceCloseTo(s, position)))
      e2.preventDefault();
    else if (e2.touches)
      return;
    const hadPremove = !!s.premovable.current;
    const hadPredrop = !!s.predroppable.current;
    s.stats.ctrlKey = e2.ctrlKey;
    if (s.selected && canMove(s, s.selected, orig)) {
      anim((state) => selectSquare(state, orig), s);
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
        originTarget: e2.target,
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
  function dragNewPiece(s, piece, e2, force) {
    const key = "a0";
    s.pieces.set(key, piece);
    s.dom.redraw();
    const position = eventPosition(e2);
    s.draggable.current = {
      orig: key,
      piece,
      origPos: position,
      pos: position,
      started: true,
      element: () => pieceElementByKey(s, key),
      originTarget: e2.target,
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
  function move2(s, e2) {
    if (s.draggable.current && (!e2.touches || e2.touches.length < 2)) {
      s.draggable.current.pos = eventPosition(e2);
    }
  }
  function end2(s, e2) {
    const cur = s.draggable.current;
    if (!cur)
      return;
    if (e2.type === "touchend" && e2.cancelable !== false)
      e2.preventDefault();
    if (e2.type === "touchend" && cur.originTarget !== e2.target && !cur.newPiece) {
      s.draggable.current = void 0;
      return;
    }
    unsetPremove(s);
    unsetPredrop(s);
    const eventPos = eventPosition(e2) || cur.pos;
    const dest = getKeyAtDomPos(eventPos, whitePov(s), s.dom.bounds());
    if (dest && cur.started && cur.orig !== dest) {
      if (cur.newPiece)
        dropNewPiece(s, cur.orig, dest, cur.force);
      else {
        s.stats.ctrlKey = e2.ctrlKey;
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
    const e2 = s.dom.elements;
    if (e2.ghost)
      setVisible(e2.ghost, false);
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
  function explosion(state, keys) {
    state.exploding = { stage: 1, keys };
    state.dom.redraw();
    setTimeout(() => {
      setStage(state, 2);
      setTimeout(() => setStage(state, void 0), 120);
    }, 120);
  }
  function setStage(state, stage) {
    if (state.exploding) {
      if (stage)
        state.exploding.stage = stage;
      else
        state.exploding = void 0;
      state.dom.redraw();
    }
  }
  var init_explosion = __esm({
    "node_modules/chessground/dist/explosion.js"() {
    }
  });

  // node_modules/chessground/dist/api.js
  function start3(state, redrawAll) {
    function toggleOrientation2() {
      toggleOrientation(state);
      redrawAll();
    }
    return {
      set(config) {
        if (config.orientation && config.orientation !== state.orientation)
          toggleOrientation2();
        applyAnimation(state, config);
        (config.fen ? anim : render)((state2) => configure(state2, config), state);
      },
      state,
      getFen: () => write(state.pieces),
      toggleOrientation: toggleOrientation2,
      setPieces(pieces) {
        anim((state2) => setPieces(state2, pieces), state);
      },
      selectSquare(key, force) {
        if (key)
          anim((state2) => selectSquare(state2, key, force), state);
        else if (state.selected) {
          unselect(state);
          state.dom.redraw();
        }
      },
      move(orig, dest) {
        anim((state2) => baseMove(state2, orig, dest), state);
      },
      newPiece(piece, key) {
        anim((state2) => baseNewPiece(state2, piece, key), state);
      },
      playPremove() {
        if (state.premovable.current) {
          if (anim(playPremove, state))
            return true;
          state.dom.redraw();
        }
        return false;
      },
      playPredrop(validate) {
        if (state.predroppable.current) {
          const result = playPredrop(state, validate);
          state.dom.redraw();
          return result;
        }
        return false;
      },
      cancelPremove() {
        render(unsetPremove, state);
      },
      cancelPredrop() {
        render(unsetPredrop, state);
      },
      cancelMove() {
        render((state2) => {
          cancelMove(state2);
          cancel2(state2);
        }, state);
      },
      stop() {
        render((state2) => {
          stop(state2);
          cancel2(state2);
        }, state);
      },
      explode(keys) {
        explosion(state, keys);
      },
      setAutoShapes(shapes) {
        render((state2) => state2.drawable.autoShapes = shapes, state);
      },
      setShapes(shapes) {
        render((state2) => state2.drawable.shapes = shapes, state);
      },
      getKeyAtDomPos(pos) {
        return getKeyAtDomPos(pos, whitePov(state), state.dom.bounds());
      },
      redrawAll,
      dragNewPiece(piece, event2, force) {
        dragNewPiece(state, piece, event2, force);
      },
      destroy() {
        stop(state);
        state.dom.unbind && state.dom.unbind();
        state.dom.destroyed = true;
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
  function renderSvg(state, shapesEl, customsEl) {
    var _a;
    const d = state.drawable, curD = d.current, cur = curD && curD.mouseSq ? curD : void 0, dests = /* @__PURE__ */ new Map(), bounds = state.dom.bounds(), nonPieceAutoShapes = d.autoShapes.filter((autoShape) => !autoShape.piece);
    for (const s of d.shapes.concat(nonPieceAutoShapes).concat(cur ? [cur] : [])) {
      if (!s.dest)
        continue;
      const sources = (_a = dests.get(s.dest)) !== null && _a !== void 0 ? _a : /* @__PURE__ */ new Set(), from = pos2user(orient(key2pos(s.orig), state.orientation), bounds), to = pos2user(orient(key2pos(s.dest), state.orientation), bounds);
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
    if (fullHash === state.drawable.prevSvgHash)
      return;
    state.drawable.prevSvgHash = fullHash;
    const defsEl = shapesEl.querySelector("defs");
    syncDefs(d, shapes, defsEl);
    syncShapes(shapes, shapesEl.querySelector("g"), customsEl.querySelector("g"), (s) => renderShape(state, s, d.brushes, dests, bounds));
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
    let h2 = 0;
    for (let i = 0; i < s.length; i++) {
      h2 = (h2 << 5) - h2 + s.charCodeAt(i) >>> 0;
    }
    return h2.toString();
  }
  function renderShape(state, { shape, current, hash: hash2 }, brushes2, dests, bounds) {
    var _a, _b;
    const from = pos2user(orient(key2pos(shape.orig), state.orientation), bounds), to = shape.dest ? pos2user(orient(key2pos(shape.dest), state.orientation), bounds) : from, brush = shape.brush && makeCustomBrush(brushes2[shape.brush], shape.modifiers), slots = dests.get(shape.dest), svgs = [];
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
  function createElement(tagName2) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName2);
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
        files.forEach((f, i) => container.appendChild(renderCoords(ranks.map((r2) => f + r2), "squares rank" + rankN(i) + orientClass + ranksPositionClass)));
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
  function drop(s, e2) {
    if (!s.dropmode.active)
      return;
    unsetPremove(s);
    unsetPredrop(s);
    const piece = s.dropmode.piece;
    if (piece) {
      s.pieces.set("a0", piece);
      const position = eventPosition(e2);
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
      boardEl.addEventListener("contextmenu", (e2) => e2.preventDefault());
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
      startDragOrDraw = (s) => (e2) => {
        if (s.draggable.current)
          cancel2(s);
        else if (s.drawable.current)
          cancel(s);
        else if (e2.shiftKey || isRightButton(e2)) {
          if (s.drawable.enabled)
            start(s, e2);
        } else if (!s.viewOnly) {
          if (s.dropmode.active)
            drop(s, e2);
          else
            start2(s, e2);
        }
      };
      dragOrDraw = (s, withDrag, withDraw) => (e2) => {
        if (s.drawable.current) {
          if (s.drawable.enabled)
            withDraw(s, e2);
        } else if (!s.viewOnly)
          withDrag(s, e2);
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
  function render3(state, autoPieceEl) {
    const autoPieces = state.drawable.autoShapes.filter((autoShape) => autoShape.piece);
    const autoPieceShapes = autoPieces.map((s) => {
      return {
        shape: s,
        hash: hash(s),
        current: false
      };
    });
    syncShapes2(autoPieceShapes, autoPieceEl, (shape) => renderShape2(state, shape, state.dom.bounds()));
  }
  function renderResized2(state) {
    var _a;
    const asWhite = whitePov(state), posToTranslate2 = posToTranslate(state.dom.bounds());
    let el = (_a = state.dom.elements.autoPieces) === null || _a === void 0 ? void 0 : _a.firstChild;
    while (el) {
      translateAndScale(el, posToTranslate2(key2pos(el.cgKey), asWhite), el.cgScale);
      el = el.nextSibling;
    }
  }
  function renderShape2(state, { shape, hash: hash2 }, bounds) {
    var _a, _b, _c;
    const orig = shape.orig;
    const role = (_a = shape.piece) === null || _a === void 0 ? void 0 : _a.role;
    const color = (_b = shape.piece) === null || _b === void 0 ? void 0 : _b.color;
    const scale = (_c = shape.piece) === null || _c === void 0 ? void 0 : _c.scale;
    const pieceEl = createEl("piece", `${role} ${color}`);
    pieceEl.setAttribute("cgHash", hash2);
    pieceEl.cgKey = orig;
    pieceEl.cgScale = scale;
    translateAndScale(pieceEl, posToTranslate(bounds)(key2pos(orig), whitePov(state)), scale);
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
  function Chessground(element, config) {
    const maybeState = defaults();
    configure(maybeState, config || {});
    function redrawAll() {
      const prevUnbind = "dom" in maybeState ? maybeState.dom.unbind : void 0;
      const elements = renderWrap(element, maybeState), bounds = memo(() => elements.board.getBoundingClientRect()), redrawNow = (skipSvg) => {
        render2(state);
        if (elements.autoPieces)
          render3(state, elements.autoPieces);
        if (!skipSvg && elements.svg)
          renderSvg(state, elements.svg, elements.customSvg);
      }, onResize = () => {
        updateBounds(state);
        renderResized(state);
        if (elements.autoPieces)
          renderResized2(state);
      };
      const state = maybeState;
      state.dom = {
        elements,
        bounds,
        redraw: debounceRedraw(redrawNow),
        redrawNow,
        unbind: prevUnbind
      };
      state.drawable.prevSvgHash = "";
      updateBounds(state);
      redrawNow(false);
      bindBoard(state, onResize);
      if (!prevUnbind)
        state.dom.unbind = bindDocument(state, onResize);
      state.events.insert && state.events.insert(elements);
      return state;
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
                    var e2 = this.location.end;
                    var filler = peg$padEnd2("", offset_s.line.toString().length, " ");
                    var line = src[s.line - 1];
                    var last = s.line === e2.line ? e2.column : line.length + 1;
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
                var peg$f3 = function(t2, c, p) {
                  var mess = messages;
                  messages = [];
                  return { tags: t2, gameComment: c, moves: p, messages: mess };
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
                var peg$f67 = function(c, t2) {
                  return c + "/" + t2;
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
                var peg$f92 = function(e2) {
                  return e2;
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
                function merge(array2) {
                  var ret = {};
                  array2.forEach(function(json) {
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
                  var r2 = /^\s+/;
                  return st.replace(r2, "");
                }
                function trimEnd(st) {
                  if (typeof st !== "string")
                    return st;
                  var r2 = /\s+$/;
                  return st.replace(r2, "");
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
        function parse(input, options) {
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
        exports2.parse = parse;
        exports2.parseGame = parseGame;
        exports2.parseGames = parseGames;
        exports2.split = split;
      }));
    }
  });

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

  // node_modules/chessops/dist/esm/types.js
  var FILE_NAMES, RANK_NAMES, COLORS, ROLES, CASTLING_SIDES, isDrop;
  var init_types2 = __esm({
    "node_modules/chessops/dist/esm/types.js"() {
      FILE_NAMES = ["a", "b", "c", "d", "e", "f", "g", "h"];
      RANK_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8"];
      COLORS = ["white", "black"];
      ROLES = ["pawn", "knight", "bishop", "rook", "queen", "king"];
      CASTLING_SIDES = ["a", "h"];
      isDrop = (v) => "role" in v;
    }
  });

  // node_modules/chessops/dist/esm/util.js
  function charToRole(ch) {
    switch (ch.toLowerCase()) {
      case "p":
        return "pawn";
      case "n":
        return "knight";
      case "b":
        return "bishop";
      case "r":
        return "rook";
      case "q":
        return "queen";
      case "k":
        return "king";
      default:
        return;
    }
  }
  function parseSquare(str) {
    if (str.length !== 2)
      return;
    return squareFromCoords(str.charCodeAt(0) - "a".charCodeAt(0), str.charCodeAt(1) - "1".charCodeAt(0));
  }
  var defined, opposite2, squareRank, squareFile, squareFromCoords, roleToChar, makeSquare, makeUci, kingCastlesTo, rookCastlesTo;
  var init_util2 = __esm({
    "node_modules/chessops/dist/esm/util.js"() {
      init_types2();
      defined = (v) => v !== void 0;
      opposite2 = (color) => color === "white" ? "black" : "white";
      squareRank = (square) => square >> 3;
      squareFile = (square) => square & 7;
      squareFromCoords = (file2, rank2) => 0 <= file2 && file2 < 8 && 0 <= rank2 && rank2 < 8 ? file2 + 8 * rank2 : void 0;
      roleToChar = (role) => {
        switch (role) {
          case "pawn":
            return "p";
          case "knight":
            return "n";
          case "bishop":
            return "b";
          case "rook":
            return "r";
          case "queen":
            return "q";
          case "king":
            return "k";
        }
      };
      makeSquare = (square) => FILE_NAMES[squareFile(square)] + RANK_NAMES[squareRank(square)];
      makeUci = (move3) => isDrop(move3) ? `${roleToChar(move3.role).toUpperCase()}@${makeSquare(move3.to)}` : makeSquare(move3.from) + makeSquare(move3.to) + (move3.promotion ? roleToChar(move3.promotion) : "");
      kingCastlesTo = (color, side) => color === "white" ? side === "a" ? 2 : 6 : side === "a" ? 58 : 62;
      rookCastlesTo = (color, side) => color === "white" ? side === "a" ? 3 : 5 : side === "a" ? 59 : 61;
    }
  });

  // node_modules/chessops/dist/esm/squareSet.js
  var popcnt32, bswap32, rbit32, SquareSet;
  var init_squareSet = __esm({
    "node_modules/chessops/dist/esm/squareSet.js"() {
      popcnt32 = (n2) => {
        n2 = n2 - (n2 >>> 1 & 1431655765);
        n2 = (n2 & 858993459) + (n2 >>> 2 & 858993459);
        return Math.imul(n2 + (n2 >>> 4) & 252645135, 16843009) >> 24;
      };
      bswap32 = (n2) => {
        n2 = n2 >>> 8 & 16711935 | (n2 & 16711935) << 8;
        return n2 >>> 16 & 65535 | (n2 & 65535) << 16;
      };
      rbit32 = (n2) => {
        n2 = n2 >>> 1 & 1431655765 | (n2 & 1431655765) << 1;
        n2 = n2 >>> 2 & 858993459 | (n2 & 858993459) << 2;
        n2 = n2 >>> 4 & 252645135 | (n2 & 252645135) << 4;
        return bswap32(n2);
      };
      SquareSet = class _SquareSet {
        constructor(lo, hi) {
          this.lo = lo | 0;
          this.hi = hi | 0;
        }
        static fromSquare(square) {
          return square >= 32 ? new _SquareSet(0, 1 << square - 32) : new _SquareSet(1 << square, 0);
        }
        static fromRank(rank2) {
          return new _SquareSet(255, 0).shl64(8 * rank2);
        }
        static fromFile(file2) {
          return new _SquareSet(16843009 << file2, 16843009 << file2);
        }
        static empty() {
          return new _SquareSet(0, 0);
        }
        static full() {
          return new _SquareSet(4294967295, 4294967295);
        }
        static corners() {
          return new _SquareSet(129, 2164260864);
        }
        static center() {
          return new _SquareSet(402653184, 24);
        }
        static backranks() {
          return new _SquareSet(255, 4278190080);
        }
        static backrank(color) {
          return color === "white" ? new _SquareSet(255, 0) : new _SquareSet(0, 4278190080);
        }
        static lightSquares() {
          return new _SquareSet(1437226410, 1437226410);
        }
        static darkSquares() {
          return new _SquareSet(2857740885, 2857740885);
        }
        complement() {
          return new _SquareSet(~this.lo, ~this.hi);
        }
        xor(other) {
          return new _SquareSet(this.lo ^ other.lo, this.hi ^ other.hi);
        }
        union(other) {
          return new _SquareSet(this.lo | other.lo, this.hi | other.hi);
        }
        intersect(other) {
          return new _SquareSet(this.lo & other.lo, this.hi & other.hi);
        }
        diff(other) {
          return new _SquareSet(this.lo & ~other.lo, this.hi & ~other.hi);
        }
        intersects(other) {
          return this.intersect(other).nonEmpty();
        }
        isDisjoint(other) {
          return this.intersect(other).isEmpty();
        }
        supersetOf(other) {
          return other.diff(this).isEmpty();
        }
        subsetOf(other) {
          return this.diff(other).isEmpty();
        }
        shr64(shift) {
          if (shift >= 64)
            return _SquareSet.empty();
          if (shift >= 32)
            return new _SquareSet(this.hi >>> shift - 32, 0);
          if (shift > 0)
            return new _SquareSet(this.lo >>> shift ^ this.hi << 32 - shift, this.hi >>> shift);
          return this;
        }
        shl64(shift) {
          if (shift >= 64)
            return _SquareSet.empty();
          if (shift >= 32)
            return new _SquareSet(0, this.lo << shift - 32);
          if (shift > 0)
            return new _SquareSet(this.lo << shift, this.hi << shift ^ this.lo >>> 32 - shift);
          return this;
        }
        bswap64() {
          return new _SquareSet(bswap32(this.hi), bswap32(this.lo));
        }
        rbit64() {
          return new _SquareSet(rbit32(this.hi), rbit32(this.lo));
        }
        minus64(other) {
          const lo = this.lo - other.lo;
          const c = (lo & other.lo & 1) + (other.lo >>> 1) + (lo >>> 1) >>> 31;
          return new _SquareSet(lo, this.hi - (other.hi + c));
        }
        equals(other) {
          return this.lo === other.lo && this.hi === other.hi;
        }
        size() {
          return popcnt32(this.lo) + popcnt32(this.hi);
        }
        isEmpty() {
          return this.lo === 0 && this.hi === 0;
        }
        nonEmpty() {
          return this.lo !== 0 || this.hi !== 0;
        }
        has(square) {
          return (square >= 32 ? this.hi & 1 << square - 32 : this.lo & 1 << square) !== 0;
        }
        set(square, on) {
          return on ? this.with(square) : this.without(square);
        }
        with(square) {
          return square >= 32 ? new _SquareSet(this.lo, this.hi | 1 << square - 32) : new _SquareSet(this.lo | 1 << square, this.hi);
        }
        without(square) {
          return square >= 32 ? new _SquareSet(this.lo, this.hi & ~(1 << square - 32)) : new _SquareSet(this.lo & ~(1 << square), this.hi);
        }
        toggle(square) {
          return square >= 32 ? new _SquareSet(this.lo, this.hi ^ 1 << square - 32) : new _SquareSet(this.lo ^ 1 << square, this.hi);
        }
        last() {
          if (this.hi !== 0)
            return 63 - Math.clz32(this.hi);
          if (this.lo !== 0)
            return 31 - Math.clz32(this.lo);
          return;
        }
        first() {
          if (this.lo !== 0)
            return 31 - Math.clz32(this.lo & -this.lo);
          if (this.hi !== 0)
            return 63 - Math.clz32(this.hi & -this.hi);
          return;
        }
        withoutFirst() {
          if (this.lo !== 0)
            return new _SquareSet(this.lo & this.lo - 1, this.hi);
          return new _SquareSet(0, this.hi & this.hi - 1);
        }
        moreThanOne() {
          return this.hi !== 0 && this.lo !== 0 || (this.lo & this.lo - 1) !== 0 || (this.hi & this.hi - 1) !== 0;
        }
        singleSquare() {
          return this.moreThanOne() ? void 0 : this.last();
        }
        *[Symbol.iterator]() {
          let lo = this.lo;
          let hi = this.hi;
          while (lo !== 0) {
            const idx = 31 - Math.clz32(lo & -lo);
            lo ^= 1 << idx;
            yield idx;
          }
          while (hi !== 0) {
            const idx = 31 - Math.clz32(hi & -hi);
            hi ^= 1 << idx;
            yield 32 + idx;
          }
        }
        *reversed() {
          let lo = this.lo;
          let hi = this.hi;
          while (hi !== 0) {
            const idx = 31 - Math.clz32(hi);
            hi ^= 1 << idx;
            yield 32 + idx;
          }
          while (lo !== 0) {
            const idx = 31 - Math.clz32(lo);
            lo ^= 1 << idx;
            yield idx;
          }
        }
      };
    }
  });

  // node_modules/chessops/dist/esm/attacks.js
  var computeRange, tabulate, KING_ATTACKS, KNIGHT_ATTACKS, PAWN_ATTACKS, kingAttacks, knightAttacks, pawnAttacks, FILE_RANGE, RANK_RANGE, DIAG_RANGE, ANTI_DIAG_RANGE, hyperbola, fileAttacks, rankAttacks, bishopAttacks, rookAttacks, queenAttacks, attacks, ray, between;
  var init_attacks = __esm({
    "node_modules/chessops/dist/esm/attacks.js"() {
      init_squareSet();
      init_util2();
      computeRange = (square, deltas) => {
        let range = SquareSet.empty();
        for (const delta of deltas) {
          const sq = square + delta;
          if (0 <= sq && sq < 64 && Math.abs(squareFile(square) - squareFile(sq)) <= 2) {
            range = range.with(sq);
          }
        }
        return range;
      };
      tabulate = (f) => {
        const table = [];
        for (let square = 0; square < 64; square++)
          table[square] = f(square);
        return table;
      };
      KING_ATTACKS = tabulate((sq) => computeRange(sq, [-9, -8, -7, -1, 1, 7, 8, 9]));
      KNIGHT_ATTACKS = tabulate((sq) => computeRange(sq, [-17, -15, -10, -6, 6, 10, 15, 17]));
      PAWN_ATTACKS = {
        white: tabulate((sq) => computeRange(sq, [7, 9])),
        black: tabulate((sq) => computeRange(sq, [-7, -9]))
      };
      kingAttacks = (square) => KING_ATTACKS[square];
      knightAttacks = (square) => KNIGHT_ATTACKS[square];
      pawnAttacks = (color, square) => PAWN_ATTACKS[color][square];
      FILE_RANGE = tabulate((sq) => SquareSet.fromFile(squareFile(sq)).without(sq));
      RANK_RANGE = tabulate((sq) => SquareSet.fromRank(squareRank(sq)).without(sq));
      DIAG_RANGE = tabulate((sq) => {
        const diag = new SquareSet(134480385, 2151686160);
        const shift = 8 * (squareRank(sq) - squareFile(sq));
        return (shift >= 0 ? diag.shl64(shift) : diag.shr64(-shift)).without(sq);
      });
      ANTI_DIAG_RANGE = tabulate((sq) => {
        const diag = new SquareSet(270549120, 16909320);
        const shift = 8 * (squareRank(sq) + squareFile(sq) - 7);
        return (shift >= 0 ? diag.shl64(shift) : diag.shr64(-shift)).without(sq);
      });
      hyperbola = (bit, range, occupied) => {
        let forward = occupied.intersect(range);
        let reverse = forward.bswap64();
        forward = forward.minus64(bit);
        reverse = reverse.minus64(bit.bswap64());
        return forward.xor(reverse.bswap64()).intersect(range);
      };
      fileAttacks = (square, occupied) => hyperbola(SquareSet.fromSquare(square), FILE_RANGE[square], occupied);
      rankAttacks = (square, occupied) => {
        const range = RANK_RANGE[square];
        let forward = occupied.intersect(range);
        let reverse = forward.rbit64();
        forward = forward.minus64(SquareSet.fromSquare(square));
        reverse = reverse.minus64(SquareSet.fromSquare(63 - square));
        return forward.xor(reverse.rbit64()).intersect(range);
      };
      bishopAttacks = (square, occupied) => {
        const bit = SquareSet.fromSquare(square);
        return hyperbola(bit, DIAG_RANGE[square], occupied).xor(hyperbola(bit, ANTI_DIAG_RANGE[square], occupied));
      };
      rookAttacks = (square, occupied) => fileAttacks(square, occupied).xor(rankAttacks(square, occupied));
      queenAttacks = (square, occupied) => bishopAttacks(square, occupied).xor(rookAttacks(square, occupied));
      attacks = (piece, square, occupied) => {
        switch (piece.role) {
          case "pawn":
            return pawnAttacks(piece.color, square);
          case "knight":
            return knightAttacks(square);
          case "bishop":
            return bishopAttacks(square, occupied);
          case "rook":
            return rookAttacks(square, occupied);
          case "queen":
            return queenAttacks(square, occupied);
          case "king":
            return kingAttacks(square);
        }
      };
      ray = (a, b) => {
        const other = SquareSet.fromSquare(b);
        if (RANK_RANGE[a].intersects(other))
          return RANK_RANGE[a].with(a);
        if (ANTI_DIAG_RANGE[a].intersects(other))
          return ANTI_DIAG_RANGE[a].with(a);
        if (DIAG_RANGE[a].intersects(other))
          return DIAG_RANGE[a].with(a);
        if (FILE_RANGE[a].intersects(other))
          return FILE_RANGE[a].with(a);
        return SquareSet.empty();
      };
      between = (a, b) => ray(a, b).intersect(SquareSet.full().shl64(a).xor(SquareSet.full().shl64(b))).withoutFirst();
    }
  });

  // node_modules/chessops/dist/esm/board.js
  var Board;
  var init_board2 = __esm({
    "node_modules/chessops/dist/esm/board.js"() {
      init_squareSet();
      init_types2();
      Board = class _Board {
        constructor() {
        }
        static default() {
          const board = new _Board();
          board.reset();
          return board;
        }
        /**
         * Resets all pieces to the default starting position for standard chess.
         */
        reset() {
          this.occupied = new SquareSet(65535, 4294901760);
          this.promoted = SquareSet.empty();
          this.white = new SquareSet(65535, 0);
          this.black = new SquareSet(0, 4294901760);
          this.pawn = new SquareSet(65280, 16711680);
          this.knight = new SquareSet(66, 1107296256);
          this.bishop = new SquareSet(36, 603979776);
          this.rook = new SquareSet(129, 2164260864);
          this.queen = new SquareSet(8, 134217728);
          this.king = new SquareSet(16, 268435456);
        }
        static empty() {
          const board = new _Board();
          board.clear();
          return board;
        }
        clear() {
          this.occupied = SquareSet.empty();
          this.promoted = SquareSet.empty();
          for (const color of COLORS)
            this[color] = SquareSet.empty();
          for (const role of ROLES)
            this[role] = SquareSet.empty();
        }
        clone() {
          const board = new _Board();
          board.occupied = this.occupied;
          board.promoted = this.promoted;
          for (const color of COLORS)
            board[color] = this[color];
          for (const role of ROLES)
            board[role] = this[role];
          return board;
        }
        getColor(square) {
          if (this.white.has(square))
            return "white";
          if (this.black.has(square))
            return "black";
          return;
        }
        getRole(square) {
          for (const role of ROLES) {
            if (this[role].has(square))
              return role;
          }
          return;
        }
        get(square) {
          const color = this.getColor(square);
          if (!color)
            return;
          const role = this.getRole(square);
          const promoted = this.promoted.has(square);
          return { color, role, promoted };
        }
        /**
         * Removes and returns the piece from the given `square`, if any.
         */
        take(square) {
          const piece = this.get(square);
          if (piece) {
            this.occupied = this.occupied.without(square);
            this[piece.color] = this[piece.color].without(square);
            this[piece.role] = this[piece.role].without(square);
            if (piece.promoted)
              this.promoted = this.promoted.without(square);
          }
          return piece;
        }
        /**
         * Put `piece` onto `square`, potentially replacing an existing piece.
         * Returns the existing piece, if any.
         */
        set(square, piece) {
          const old = this.take(square);
          this.occupied = this.occupied.with(square);
          this[piece.color] = this[piece.color].with(square);
          this[piece.role] = this[piece.role].with(square);
          if (piece.promoted)
            this.promoted = this.promoted.with(square);
          return old;
        }
        has(square) {
          return this.occupied.has(square);
        }
        *[Symbol.iterator]() {
          for (const square of this.occupied) {
            yield [square, this.get(square)];
          }
        }
        pieces(color, role) {
          return this[color].intersect(this[role]);
        }
        rooksAndQueens() {
          return this.rook.union(this.queen);
        }
        bishopsAndQueens() {
          return this.bishop.union(this.queen);
        }
        /**
         * Finds the unique king of the given `color`, if any.
         */
        kingOf(color) {
          return this.pieces(color, "king").singleSquare();
        }
      };
    }
  });

  // node_modules/chessops/dist/esm/setup.js
  var MaterialSide, Material, RemainingChecks;
  var init_setup = __esm({
    "node_modules/chessops/dist/esm/setup.js"() {
      init_types2();
      MaterialSide = class _MaterialSide {
        constructor() {
        }
        static empty() {
          const m = new _MaterialSide();
          for (const role of ROLES)
            m[role] = 0;
          return m;
        }
        static fromBoard(board, color) {
          const m = new _MaterialSide();
          for (const role of ROLES)
            m[role] = board.pieces(color, role).size();
          return m;
        }
        clone() {
          const m = new _MaterialSide();
          for (const role of ROLES)
            m[role] = this[role];
          return m;
        }
        equals(other) {
          return ROLES.every((role) => this[role] === other[role]);
        }
        add(other) {
          const m = new _MaterialSide();
          for (const role of ROLES)
            m[role] = this[role] + other[role];
          return m;
        }
        subtract(other) {
          const m = new _MaterialSide();
          for (const role of ROLES)
            m[role] = this[role] - other[role];
          return m;
        }
        nonEmpty() {
          return ROLES.some((role) => this[role] > 0);
        }
        isEmpty() {
          return !this.nonEmpty();
        }
        hasPawns() {
          return this.pawn > 0;
        }
        hasNonPawns() {
          return this.knight > 0 || this.bishop > 0 || this.rook > 0 || this.queen > 0 || this.king > 0;
        }
        size() {
          return this.pawn + this.knight + this.bishop + this.rook + this.queen + this.king;
        }
      };
      Material = class _Material {
        constructor(white, black) {
          this.white = white;
          this.black = black;
        }
        static empty() {
          return new _Material(MaterialSide.empty(), MaterialSide.empty());
        }
        static fromBoard(board) {
          return new _Material(MaterialSide.fromBoard(board, "white"), MaterialSide.fromBoard(board, "black"));
        }
        clone() {
          return new _Material(this.white.clone(), this.black.clone());
        }
        equals(other) {
          return this.white.equals(other.white) && this.black.equals(other.black);
        }
        add(other) {
          return new _Material(this.white.add(other.white), this.black.add(other.black));
        }
        subtract(other) {
          return new _Material(this.white.subtract(other.white), this.black.subtract(other.black));
        }
        count(role) {
          return this.white[role] + this.black[role];
        }
        size() {
          return this.white.size() + this.black.size();
        }
        isEmpty() {
          return this.white.isEmpty() && this.black.isEmpty();
        }
        nonEmpty() {
          return !this.isEmpty();
        }
        hasPawns() {
          return this.white.hasPawns() || this.black.hasPawns();
        }
        hasNonPawns() {
          return this.white.hasNonPawns() || this.black.hasNonPawns();
        }
      };
      RemainingChecks = class _RemainingChecks {
        constructor(white, black) {
          this.white = white;
          this.black = black;
        }
        static default() {
          return new _RemainingChecks(3, 3);
        }
        clone() {
          return new _RemainingChecks(this.white, this.black);
        }
        equals(other) {
          return this.white === other.white && this.black === other.black;
        }
      };
    }
  });

  // node_modules/@badrap/result/dist/index.modern.mjs
  var r, t, e, n;
  var init_index_modern = __esm({
    "node_modules/@badrap/result/dist/index.modern.mjs"() {
      r = class {
        unwrap(r2, t2) {
          const e2 = this._chain((t3) => n.ok(r2 ? r2(t3) : t3), (r3) => t2 ? n.ok(t2(r3)) : n.err(r3));
          if (e2.isErr) throw e2.error;
          return e2.value;
        }
        map(r2, t2) {
          return this._chain((t3) => n.ok(r2(t3)), (r3) => n.err(t2 ? t2(r3) : r3));
        }
        chain(r2, t2) {
          return this._chain(r2, t2 || ((r3) => n.err(r3)));
        }
      };
      t = class extends r {
        constructor(r2) {
          super(), this.value = void 0, this.isOk = true, this.isErr = false, this.value = r2;
        }
        _chain(r2, t2) {
          return r2(this.value);
        }
      };
      e = class extends r {
        constructor(r2) {
          super(), this.error = void 0, this.isOk = false, this.isErr = true, this.error = r2;
        }
        _chain(r2, t2) {
          return t2(this.error);
        }
      };
      !(function(r2) {
        r2.ok = function(r3) {
          return new t(r3);
        }, r2.err = function(r3) {
          return new e(r3 || new Error());
        }, r2.all = function(t2) {
          if (Array.isArray(t2)) {
            const e3 = [];
            for (let r3 = 0; r3 < t2.length; r3++) {
              const n3 = t2[r3];
              if (n3.isErr) return n3;
              e3.push(n3.value);
            }
            return r2.ok(e3);
          }
          const e2 = {}, n2 = Object.keys(t2);
          for (let r3 = 0; r3 < n2.length; r3++) {
            const s = t2[n2[r3]];
            if (s.isErr) return s;
            e2[n2[r3]] = s.value;
          }
          return r2.ok(e2);
        };
      })(n || (n = {}));
    }
  });

  // node_modules/chessops/dist/esm/chess.js
  var IllegalSetup, PositionError, attacksTo, Castles, Position, Chess2, validEpSquare, legalEpSquare, canCaptureEp, castlingDest, pseudoDests, castlingSide, normalizeMove;
  var init_chess2 = __esm({
    "node_modules/chessops/dist/esm/chess.js"() {
      init_index_modern();
      init_attacks();
      init_board2();
      init_squareSet();
      init_types2();
      init_util2();
      (function(IllegalSetup2) {
        IllegalSetup2["Empty"] = "ERR_EMPTY";
        IllegalSetup2["OppositeCheck"] = "ERR_OPPOSITE_CHECK";
        IllegalSetup2["PawnsOnBackrank"] = "ERR_PAWNS_ON_BACKRANK";
        IllegalSetup2["Kings"] = "ERR_KINGS";
        IllegalSetup2["Variant"] = "ERR_VARIANT";
      })(IllegalSetup || (IllegalSetup = {}));
      PositionError = class extends Error {
      };
      attacksTo = (square, attacker, board, occupied) => board[attacker].intersect(rookAttacks(square, occupied).intersect(board.rooksAndQueens()).union(bishopAttacks(square, occupied).intersect(board.bishopsAndQueens())).union(knightAttacks(square).intersect(board.knight)).union(kingAttacks(square).intersect(board.king)).union(pawnAttacks(opposite2(attacker), square).intersect(board.pawn)));
      Castles = class _Castles {
        constructor() {
        }
        static default() {
          const castles = new _Castles();
          castles.castlingRights = SquareSet.corners();
          castles.rook = {
            white: { a: 0, h: 7 },
            black: { a: 56, h: 63 }
          };
          castles.path = {
            white: { a: new SquareSet(14, 0), h: new SquareSet(96, 0) },
            black: { a: new SquareSet(0, 234881024), h: new SquareSet(0, 1610612736) }
          };
          return castles;
        }
        static empty() {
          const castles = new _Castles();
          castles.castlingRights = SquareSet.empty();
          castles.rook = {
            white: { a: void 0, h: void 0 },
            black: { a: void 0, h: void 0 }
          };
          castles.path = {
            white: { a: SquareSet.empty(), h: SquareSet.empty() },
            black: { a: SquareSet.empty(), h: SquareSet.empty() }
          };
          return castles;
        }
        clone() {
          const castles = new _Castles();
          castles.castlingRights = this.castlingRights;
          castles.rook = {
            white: { a: this.rook.white.a, h: this.rook.white.h },
            black: { a: this.rook.black.a, h: this.rook.black.h }
          };
          castles.path = {
            white: { a: this.path.white.a, h: this.path.white.h },
            black: { a: this.path.black.a, h: this.path.black.h }
          };
          return castles;
        }
        add(color, side, king2, rook2) {
          const kingTo = kingCastlesTo(color, side);
          const rookTo = rookCastlesTo(color, side);
          this.castlingRights = this.castlingRights.with(rook2);
          this.rook[color][side] = rook2;
          this.path[color][side] = between(rook2, rookTo).with(rookTo).union(between(king2, kingTo).with(kingTo)).without(king2).without(rook2);
        }
        static fromSetup(setup) {
          const castles = _Castles.empty();
          const rooks = setup.castlingRights.intersect(setup.board.rook);
          for (const color of COLORS) {
            const backrank = SquareSet.backrank(color);
            const king2 = setup.board.kingOf(color);
            if (!defined(king2) || !backrank.has(king2))
              continue;
            const side = rooks.intersect(setup.board[color]).intersect(backrank);
            const aSide = side.first();
            if (defined(aSide) && aSide < king2)
              castles.add(color, "a", king2, aSide);
            const hSide = side.last();
            if (defined(hSide) && king2 < hSide)
              castles.add(color, "h", king2, hSide);
          }
          return castles;
        }
        discardRook(square) {
          if (this.castlingRights.has(square)) {
            this.castlingRights = this.castlingRights.without(square);
            for (const color of COLORS) {
              for (const side of CASTLING_SIDES) {
                if (this.rook[color][side] === square)
                  this.rook[color][side] = void 0;
              }
            }
          }
        }
        discardColor(color) {
          this.castlingRights = this.castlingRights.diff(SquareSet.backrank(color));
          this.rook[color].a = void 0;
          this.rook[color].h = void 0;
        }
      };
      Position = class {
        constructor(rules) {
          this.rules = rules;
        }
        reset() {
          this.board = Board.default();
          this.pockets = void 0;
          this.turn = "white";
          this.castles = Castles.default();
          this.epSquare = void 0;
          this.remainingChecks = void 0;
          this.halfmoves = 0;
          this.fullmoves = 1;
        }
        setupUnchecked(setup) {
          this.board = setup.board.clone();
          this.board.promoted = SquareSet.empty();
          this.pockets = void 0;
          this.turn = setup.turn;
          this.castles = Castles.fromSetup(setup);
          this.epSquare = validEpSquare(this, setup.epSquare);
          this.remainingChecks = void 0;
          this.halfmoves = setup.halfmoves;
          this.fullmoves = setup.fullmoves;
        }
        // When subclassing overwrite at least:
        //
        // - static default()
        // - static fromSetup()
        // - static clone()
        //
        // - dests()
        // - isVariantEnd()
        // - variantOutcome()
        // - hasInsufficientMaterial()
        // - isStandardMaterial()
        kingAttackers(square, attacker, occupied) {
          return attacksTo(square, attacker, this.board, occupied);
        }
        playCaptureAt(square, captured) {
          this.halfmoves = 0;
          if (captured.role === "rook")
            this.castles.discardRook(square);
          if (this.pockets)
            this.pockets[opposite2(captured.color)][captured.promoted ? "pawn" : captured.role]++;
        }
        ctx() {
          const variantEnd = this.isVariantEnd();
          const king2 = this.board.kingOf(this.turn);
          if (!defined(king2)) {
            return { king: king2, blockers: SquareSet.empty(), checkers: SquareSet.empty(), variantEnd, mustCapture: false };
          }
          const snipers = rookAttacks(king2, SquareSet.empty()).intersect(this.board.rooksAndQueens()).union(bishopAttacks(king2, SquareSet.empty()).intersect(this.board.bishopsAndQueens())).intersect(this.board[opposite2(this.turn)]);
          let blockers = SquareSet.empty();
          for (const sniper of snipers) {
            const b = between(king2, sniper).intersect(this.board.occupied);
            if (!b.moreThanOne())
              blockers = blockers.union(b);
          }
          const checkers = this.kingAttackers(king2, opposite2(this.turn), this.board.occupied);
          return {
            king: king2,
            blockers,
            checkers,
            variantEnd,
            mustCapture: false
          };
        }
        clone() {
          var _a, _b;
          const pos = new this.constructor();
          pos.board = this.board.clone();
          pos.pockets = (_a = this.pockets) === null || _a === void 0 ? void 0 : _a.clone();
          pos.turn = this.turn;
          pos.castles = this.castles.clone();
          pos.epSquare = this.epSquare;
          pos.remainingChecks = (_b = this.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone();
          pos.halfmoves = this.halfmoves;
          pos.fullmoves = this.fullmoves;
          return pos;
        }
        validate() {
          if (this.board.occupied.isEmpty())
            return n.err(new PositionError(IllegalSetup.Empty));
          if (this.board.king.size() !== 2)
            return n.err(new PositionError(IllegalSetup.Kings));
          if (!defined(this.board.kingOf(this.turn)))
            return n.err(new PositionError(IllegalSetup.Kings));
          const otherKing = this.board.kingOf(opposite2(this.turn));
          if (!defined(otherKing))
            return n.err(new PositionError(IllegalSetup.Kings));
          if (this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
            return n.err(new PositionError(IllegalSetup.OppositeCheck));
          }
          if (SquareSet.backranks().intersects(this.board.pawn)) {
            return n.err(new PositionError(IllegalSetup.PawnsOnBackrank));
          }
          return n.ok(void 0);
        }
        dropDests(_ctx) {
          return SquareSet.empty();
        }
        dests(square, ctx) {
          ctx = ctx || this.ctx();
          if (ctx.variantEnd)
            return SquareSet.empty();
          const piece = this.board.get(square);
          if (!piece || piece.color !== this.turn)
            return SquareSet.empty();
          let pseudo, legal;
          if (piece.role === "pawn") {
            pseudo = pawnAttacks(this.turn, square).intersect(this.board[opposite2(this.turn)]);
            const delta = this.turn === "white" ? 8 : -8;
            const step2 = square + delta;
            if (0 <= step2 && step2 < 64 && !this.board.occupied.has(step2)) {
              pseudo = pseudo.with(step2);
              const canDoubleStep = this.turn === "white" ? square < 16 : square >= 64 - 16;
              const doubleStep = step2 + delta;
              if (canDoubleStep && !this.board.occupied.has(doubleStep)) {
                pseudo = pseudo.with(doubleStep);
              }
            }
            if (defined(this.epSquare) && canCaptureEp(this, square, ctx)) {
              legal = SquareSet.fromSquare(this.epSquare);
            }
          } else if (piece.role === "bishop")
            pseudo = bishopAttacks(square, this.board.occupied);
          else if (piece.role === "knight")
            pseudo = knightAttacks(square);
          else if (piece.role === "rook")
            pseudo = rookAttacks(square, this.board.occupied);
          else if (piece.role === "queen")
            pseudo = queenAttacks(square, this.board.occupied);
          else
            pseudo = kingAttacks(square);
          pseudo = pseudo.diff(this.board[this.turn]);
          if (defined(ctx.king)) {
            if (piece.role === "king") {
              const occ = this.board.occupied.without(square);
              for (const to of pseudo) {
                if (this.kingAttackers(to, opposite2(this.turn), occ).nonEmpty())
                  pseudo = pseudo.without(to);
              }
              return pseudo.union(castlingDest(this, "a", ctx)).union(castlingDest(this, "h", ctx));
            }
            if (ctx.checkers.nonEmpty()) {
              const checker = ctx.checkers.singleSquare();
              if (!defined(checker))
                return SquareSet.empty();
              pseudo = pseudo.intersect(between(checker, ctx.king).with(checker));
            }
            if (ctx.blockers.has(square))
              pseudo = pseudo.intersect(ray(square, ctx.king));
          }
          if (legal)
            pseudo = pseudo.union(legal);
          return pseudo;
        }
        isVariantEnd() {
          return false;
        }
        variantOutcome(_ctx) {
          return;
        }
        hasInsufficientMaterial(color) {
          if (this.board[color].intersect(this.board.pawn.union(this.board.rooksAndQueens())).nonEmpty())
            return false;
          if (this.board[color].intersects(this.board.knight)) {
            return this.board[color].size() <= 2 && this.board[opposite2(color)].diff(this.board.king).diff(this.board.queen).isEmpty();
          }
          if (this.board[color].intersects(this.board.bishop)) {
            const sameColor = !this.board.bishop.intersects(SquareSet.darkSquares()) || !this.board.bishop.intersects(SquareSet.lightSquares());
            return sameColor && this.board.pawn.isEmpty() && this.board.knight.isEmpty();
          }
          return true;
        }
        // The following should be identical in all subclasses
        toSetup() {
          var _a, _b;
          return {
            board: this.board.clone(),
            pockets: (_a = this.pockets) === null || _a === void 0 ? void 0 : _a.clone(),
            turn: this.turn,
            castlingRights: this.castles.castlingRights,
            epSquare: legalEpSquare(this),
            remainingChecks: (_b = this.remainingChecks) === null || _b === void 0 ? void 0 : _b.clone(),
            halfmoves: Math.min(this.halfmoves, 150),
            fullmoves: Math.min(Math.max(this.fullmoves, 1), 9999)
          };
        }
        isInsufficientMaterial() {
          return COLORS.every((color) => this.hasInsufficientMaterial(color));
        }
        hasDests(ctx) {
          ctx = ctx || this.ctx();
          for (const square of this.board[this.turn]) {
            if (this.dests(square, ctx).nonEmpty())
              return true;
          }
          return this.dropDests(ctx).nonEmpty();
        }
        isLegal(move3, ctx) {
          if (isDrop(move3)) {
            if (!this.pockets || this.pockets[this.turn][move3.role] <= 0)
              return false;
            if (move3.role === "pawn" && SquareSet.backranks().has(move3.to))
              return false;
            return this.dropDests(ctx).has(move3.to);
          } else {
            if (move3.promotion === "pawn")
              return false;
            if (move3.promotion === "king" && this.rules !== "antichess")
              return false;
            if (!!move3.promotion !== (this.board.pawn.has(move3.from) && SquareSet.backranks().has(move3.to)))
              return false;
            const dests = this.dests(move3.from, ctx);
            return dests.has(move3.to) || dests.has(normalizeMove(this, move3).to);
          }
        }
        isCheck() {
          const king2 = this.board.kingOf(this.turn);
          return defined(king2) && this.kingAttackers(king2, opposite2(this.turn), this.board.occupied).nonEmpty();
        }
        isEnd(ctx) {
          if (ctx ? ctx.variantEnd : this.isVariantEnd())
            return true;
          return this.isInsufficientMaterial() || !this.hasDests(ctx);
        }
        isCheckmate(ctx) {
          ctx = ctx || this.ctx();
          return !ctx.variantEnd && ctx.checkers.nonEmpty() && !this.hasDests(ctx);
        }
        isStalemate(ctx) {
          ctx = ctx || this.ctx();
          return !ctx.variantEnd && ctx.checkers.isEmpty() && !this.hasDests(ctx);
        }
        outcome(ctx) {
          const variantOutcome = this.variantOutcome(ctx);
          if (variantOutcome)
            return variantOutcome;
          ctx = ctx || this.ctx();
          if (this.isCheckmate(ctx))
            return { winner: opposite2(this.turn) };
          else if (this.isInsufficientMaterial() || this.isStalemate(ctx))
            return { winner: void 0 };
          else
            return;
        }
        allDests(ctx) {
          ctx = ctx || this.ctx();
          const d = /* @__PURE__ */ new Map();
          if (ctx.variantEnd)
            return d;
          for (const square of this.board[this.turn]) {
            d.set(square, this.dests(square, ctx));
          }
          return d;
        }
        play(move3) {
          const turn = this.turn;
          const epSquare = this.epSquare;
          const castling = castlingSide(this, move3);
          this.epSquare = void 0;
          this.halfmoves += 1;
          if (turn === "black")
            this.fullmoves += 1;
          this.turn = opposite2(turn);
          if (isDrop(move3)) {
            this.board.set(move3.to, { role: move3.role, color: turn });
            if (this.pockets)
              this.pockets[turn][move3.role]--;
            if (move3.role === "pawn")
              this.halfmoves = 0;
          } else {
            const piece = this.board.take(move3.from);
            if (!piece)
              return;
            let epCapture;
            if (piece.role === "pawn") {
              this.halfmoves = 0;
              if (move3.to === epSquare) {
                epCapture = this.board.take(move3.to + (turn === "white" ? -8 : 8));
              }
              const delta = move3.from - move3.to;
              if (Math.abs(delta) === 16 && 8 <= move3.from && move3.from <= 55) {
                this.epSquare = move3.from + move3.to >> 1;
              }
              if (move3.promotion) {
                piece.role = move3.promotion;
                piece.promoted = !!this.pockets;
              }
            } else if (piece.role === "rook") {
              this.castles.discardRook(move3.from);
            } else if (piece.role === "king") {
              if (castling) {
                const rookFrom = this.castles.rook[turn][castling];
                if (defined(rookFrom)) {
                  const rook2 = this.board.take(rookFrom);
                  this.board.set(kingCastlesTo(turn, castling), piece);
                  if (rook2)
                    this.board.set(rookCastlesTo(turn, castling), rook2);
                }
              }
              this.castles.discardColor(turn);
            }
            if (!castling) {
              const capture = this.board.set(move3.to, piece) || epCapture;
              if (capture)
                this.playCaptureAt(move3.to, capture);
            }
          }
          if (this.remainingChecks) {
            if (this.isCheck())
              this.remainingChecks[turn] = Math.max(this.remainingChecks[turn] - 1, 0);
          }
        }
      };
      Chess2 = class extends Position {
        constructor() {
          super("chess");
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
      };
      validEpSquare = (pos, square) => {
        if (!defined(square))
          return;
        const epRank = pos.turn === "white" ? 5 : 2;
        const forward = pos.turn === "white" ? 8 : -8;
        if (squareRank(square) !== epRank)
          return;
        if (pos.board.occupied.has(square + forward))
          return;
        const pawn2 = square - forward;
        if (!pos.board.pawn.has(pawn2) || !pos.board[opposite2(pos.turn)].has(pawn2))
          return;
        return square;
      };
      legalEpSquare = (pos) => {
        if (!defined(pos.epSquare))
          return;
        const ctx = pos.ctx();
        const ourPawns = pos.board.pieces(pos.turn, "pawn");
        const candidates = ourPawns.intersect(pawnAttacks(opposite2(pos.turn), pos.epSquare));
        for (const candidate of candidates) {
          if (pos.dests(candidate, ctx).has(pos.epSquare))
            return pos.epSquare;
        }
        return;
      };
      canCaptureEp = (pos, pawnFrom, ctx) => {
        if (!defined(pos.epSquare))
          return false;
        if (!pawnAttacks(pos.turn, pawnFrom).has(pos.epSquare))
          return false;
        if (!defined(ctx.king))
          return true;
        const delta = pos.turn === "white" ? 8 : -8;
        const captured = pos.epSquare - delta;
        return pos.kingAttackers(ctx.king, opposite2(pos.turn), pos.board.occupied.toggle(pawnFrom).toggle(captured).with(pos.epSquare)).without(captured).isEmpty();
      };
      castlingDest = (pos, side, ctx) => {
        if (!defined(ctx.king) || ctx.checkers.nonEmpty())
          return SquareSet.empty();
        const rook2 = pos.castles.rook[pos.turn][side];
        if (!defined(rook2))
          return SquareSet.empty();
        if (pos.castles.path[pos.turn][side].intersects(pos.board.occupied))
          return SquareSet.empty();
        const kingTo = kingCastlesTo(pos.turn, side);
        const kingPath = between(ctx.king, kingTo);
        const occ = pos.board.occupied.without(ctx.king);
        for (const sq of kingPath) {
          if (pos.kingAttackers(sq, opposite2(pos.turn), occ).nonEmpty())
            return SquareSet.empty();
        }
        const rookTo = rookCastlesTo(pos.turn, side);
        const after = pos.board.occupied.toggle(ctx.king).toggle(rook2).toggle(rookTo);
        if (pos.kingAttackers(kingTo, opposite2(pos.turn), after).nonEmpty())
          return SquareSet.empty();
        return SquareSet.fromSquare(rook2);
      };
      pseudoDests = (pos, square, ctx) => {
        if (ctx.variantEnd)
          return SquareSet.empty();
        const piece = pos.board.get(square);
        if (!piece || piece.color !== pos.turn)
          return SquareSet.empty();
        let pseudo = attacks(piece, square, pos.board.occupied);
        if (piece.role === "pawn") {
          let captureTargets = pos.board[opposite2(pos.turn)];
          if (defined(pos.epSquare))
            captureTargets = captureTargets.with(pos.epSquare);
          pseudo = pseudo.intersect(captureTargets);
          const delta = pos.turn === "white" ? 8 : -8;
          const step2 = square + delta;
          if (0 <= step2 && step2 < 64 && !pos.board.occupied.has(step2)) {
            pseudo = pseudo.with(step2);
            const canDoubleStep = pos.turn === "white" ? square < 16 : square >= 64 - 16;
            const doubleStep = step2 + delta;
            if (canDoubleStep && !pos.board.occupied.has(doubleStep)) {
              pseudo = pseudo.with(doubleStep);
            }
          }
          return pseudo;
        } else {
          pseudo = pseudo.diff(pos.board[pos.turn]);
        }
        if (square === ctx.king)
          return pseudo.union(castlingDest(pos, "a", ctx)).union(castlingDest(pos, "h", ctx));
        else
          return pseudo;
      };
      castlingSide = (pos, move3) => {
        if (isDrop(move3))
          return;
        const delta = move3.to - move3.from;
        if (Math.abs(delta) !== 2 && !pos.board[pos.turn].has(move3.to))
          return;
        if (!pos.board.king.has(move3.from))
          return;
        return delta > 0 ? "h" : "a";
      };
      normalizeMove = (pos, move3) => {
        const side = castlingSide(pos, move3);
        if (!side)
          return move3;
        const rookFrom = pos.castles.rook[pos.turn][side];
        return {
          from: move3.from,
          to: defined(rookFrom) ? rookFrom : move3.to
        };
      };
    }
  });

  // node_modules/chessops/dist/esm/compat.js
  var scalachessCharPair;
  var init_compat = __esm({
    "node_modules/chessops/dist/esm/compat.js"() {
      init_types2();
      init_util2();
      scalachessCharPair = (move3) => isDrop(move3) ? String.fromCharCode(35 + move3.to, 35 + 64 + 8 * 5 + ["queen", "rook", "bishop", "knight", "pawn"].indexOf(move3.role)) : String.fromCharCode(35 + move3.from, move3.promotion ? 35 + 64 + 8 * ["queen", "rook", "bishop", "knight", "king"].indexOf(move3.promotion) + squareFile(move3.to) : 35 + move3.to);
    }
  });

  // node_modules/chessops/dist/esm/fen.js
  var INITIAL_BOARD_FEN, INITIAL_EPD, INITIAL_FEN, EMPTY_BOARD_FEN, EMPTY_EPD, EMPTY_FEN, InvalidFen, FenError, nthIndexOf, parseSmallUint, charToPiece, parseBoardFen, parsePockets, parseCastlingFen, parseRemainingChecks, parseFen, makePiece2, makeBoardFen, makePocket, makePockets, makeCastlingFen, makeRemainingChecks, makeFen;
  var init_fen2 = __esm({
    "node_modules/chessops/dist/esm/fen.js"() {
      init_index_modern();
      init_board2();
      init_setup();
      init_squareSet();
      init_types2();
      init_util2();
      INITIAL_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
      INITIAL_EPD = INITIAL_BOARD_FEN + " w KQkq -";
      INITIAL_FEN = INITIAL_EPD + " 0 1";
      EMPTY_BOARD_FEN = "8/8/8/8/8/8/8/8";
      EMPTY_EPD = EMPTY_BOARD_FEN + " w - -";
      EMPTY_FEN = EMPTY_EPD + " 0 1";
      (function(InvalidFen2) {
        InvalidFen2["Fen"] = "ERR_FEN";
        InvalidFen2["Board"] = "ERR_BOARD";
        InvalidFen2["Pockets"] = "ERR_POCKETS";
        InvalidFen2["Turn"] = "ERR_TURN";
        InvalidFen2["Castling"] = "ERR_CASTLING";
        InvalidFen2["EpSquare"] = "ERR_EP_SQUARE";
        InvalidFen2["RemainingChecks"] = "ERR_REMAINING_CHECKS";
        InvalidFen2["Halfmoves"] = "ERR_HALFMOVES";
        InvalidFen2["Fullmoves"] = "ERR_FULLMOVES";
      })(InvalidFen || (InvalidFen = {}));
      FenError = class extends Error {
      };
      nthIndexOf = (haystack, needle, n2) => {
        let index = haystack.indexOf(needle);
        while (n2-- > 0) {
          if (index === -1)
            break;
          index = haystack.indexOf(needle, index + needle.length);
        }
        return index;
      };
      parseSmallUint = (str) => /^\d{1,4}$/.test(str) ? parseInt(str, 10) : void 0;
      charToPiece = (ch) => {
        const role = charToRole(ch);
        return role && { role, color: ch.toLowerCase() === ch ? "black" : "white" };
      };
      parseBoardFen = (boardPart) => {
        const board = Board.empty();
        let rank2 = 7;
        let file2 = 0;
        for (let i = 0; i < boardPart.length; i++) {
          const c = boardPart[i];
          if (c === "/" && file2 === 8) {
            file2 = 0;
            rank2--;
          } else {
            const step2 = parseInt(c, 10);
            if (step2 > 0)
              file2 += step2;
            else {
              if (file2 >= 8 || rank2 < 0)
                return n.err(new FenError(InvalidFen.Board));
              const square = file2 + rank2 * 8;
              const piece = charToPiece(c);
              if (!piece)
                return n.err(new FenError(InvalidFen.Board));
              if (boardPart[i + 1] === "~") {
                piece.promoted = true;
                i++;
              }
              board.set(square, piece);
              file2++;
            }
          }
        }
        if (rank2 !== 0 || file2 !== 8)
          return n.err(new FenError(InvalidFen.Board));
        return n.ok(board);
      };
      parsePockets = (pocketPart) => {
        if (pocketPart.length > 64)
          return n.err(new FenError(InvalidFen.Pockets));
        const pockets = Material.empty();
        for (const c of pocketPart) {
          const piece = charToPiece(c);
          if (!piece)
            return n.err(new FenError(InvalidFen.Pockets));
          pockets[piece.color][piece.role]++;
        }
        return n.ok(pockets);
      };
      parseCastlingFen = (board, castlingPart) => {
        let castlingRights = SquareSet.empty();
        if (castlingPart === "-")
          return n.ok(castlingRights);
        for (const c of castlingPart) {
          const lower = c.toLowerCase();
          const color = c === lower ? "black" : "white";
          const rank2 = color === "white" ? 0 : 7;
          if ("a" <= lower && lower <= "h") {
            castlingRights = castlingRights.with(squareFromCoords(lower.charCodeAt(0) - "a".charCodeAt(0), rank2));
          } else if (lower === "k" || lower === "q") {
            const rooksAndKings = board[color].intersect(SquareSet.backrank(color)).intersect(board.rook.union(board.king));
            const candidate = lower === "k" ? rooksAndKings.last() : rooksAndKings.first();
            castlingRights = castlingRights.with(defined(candidate) && board.rook.has(candidate) ? candidate : squareFromCoords(lower === "k" ? 7 : 0, rank2));
          } else
            return n.err(new FenError(InvalidFen.Castling));
        }
        if (COLORS.some((color) => SquareSet.backrank(color).intersect(castlingRights).size() > 2)) {
          return n.err(new FenError(InvalidFen.Castling));
        }
        return n.ok(castlingRights);
      };
      parseRemainingChecks = (part) => {
        const parts = part.split("+");
        if (parts.length === 3 && parts[0] === "") {
          const white = parseSmallUint(parts[1]);
          const black = parseSmallUint(parts[2]);
          if (!defined(white) || white > 3 || !defined(black) || black > 3) {
            return n.err(new FenError(InvalidFen.RemainingChecks));
          }
          return n.ok(new RemainingChecks(3 - white, 3 - black));
        } else if (parts.length === 2) {
          const white = parseSmallUint(parts[0]);
          const black = parseSmallUint(parts[1]);
          if (!defined(white) || white > 3 || !defined(black) || black > 3) {
            return n.err(new FenError(InvalidFen.RemainingChecks));
          }
          return n.ok(new RemainingChecks(white, black));
        } else
          return n.err(new FenError(InvalidFen.RemainingChecks));
      };
      parseFen = (fen) => {
        const parts = fen.split(/[\s_]+/);
        const boardPart = parts.shift();
        let board;
        let pockets = n.ok(void 0);
        if (boardPart.endsWith("]")) {
          const pocketStart = boardPart.indexOf("[");
          if (pocketStart === -1)
            return n.err(new FenError(InvalidFen.Fen));
          board = parseBoardFen(boardPart.slice(0, pocketStart));
          pockets = parsePockets(boardPart.slice(pocketStart + 1, -1));
        } else {
          const pocketStart = nthIndexOf(boardPart, "/", 7);
          if (pocketStart === -1)
            board = parseBoardFen(boardPart);
          else {
            board = parseBoardFen(boardPart.slice(0, pocketStart));
            pockets = parsePockets(boardPart.slice(pocketStart + 1));
          }
        }
        let turn;
        const turnPart = parts.shift();
        if (!defined(turnPart) || turnPart === "w")
          turn = "white";
        else if (turnPart === "b")
          turn = "black";
        else
          return n.err(new FenError(InvalidFen.Turn));
        return board.chain((board2) => {
          const castlingPart = parts.shift();
          const castlingRights = defined(castlingPart) ? parseCastlingFen(board2, castlingPart) : n.ok(SquareSet.empty());
          const epPart = parts.shift();
          let epSquare;
          if (defined(epPart) && epPart !== "-") {
            epSquare = parseSquare(epPart);
            if (!defined(epSquare))
              return n.err(new FenError(InvalidFen.EpSquare));
          }
          let halfmovePart = parts.shift();
          let earlyRemainingChecks;
          if (defined(halfmovePart) && halfmovePart.includes("+")) {
            earlyRemainingChecks = parseRemainingChecks(halfmovePart);
            halfmovePart = parts.shift();
          }
          const halfmoves = defined(halfmovePart) ? parseSmallUint(halfmovePart) : 0;
          if (!defined(halfmoves))
            return n.err(new FenError(InvalidFen.Halfmoves));
          const fullmovesPart = parts.shift();
          const fullmoves = defined(fullmovesPart) ? parseSmallUint(fullmovesPart) : 1;
          if (!defined(fullmoves))
            return n.err(new FenError(InvalidFen.Fullmoves));
          const remainingChecksPart = parts.shift();
          let remainingChecks = n.ok(void 0);
          if (defined(remainingChecksPart)) {
            if (defined(earlyRemainingChecks))
              return n.err(new FenError(InvalidFen.RemainingChecks));
            remainingChecks = parseRemainingChecks(remainingChecksPart);
          } else if (defined(earlyRemainingChecks)) {
            remainingChecks = earlyRemainingChecks;
          }
          if (parts.length > 0)
            return n.err(new FenError(InvalidFen.Fen));
          return pockets.chain((pockets2) => castlingRights.chain((castlingRights2) => remainingChecks.map((remainingChecks2) => {
            return {
              board: board2,
              pockets: pockets2,
              turn,
              castlingRights: castlingRights2,
              remainingChecks: remainingChecks2,
              epSquare,
              halfmoves,
              fullmoves: Math.max(1, fullmoves)
            };
          })));
        });
      };
      makePiece2 = (piece) => {
        let r2 = roleToChar(piece.role);
        if (piece.color === "white")
          r2 = r2.toUpperCase();
        if (piece.promoted)
          r2 += "~";
        return r2;
      };
      makeBoardFen = (board) => {
        let fen = "";
        let empty = 0;
        for (let rank2 = 7; rank2 >= 0; rank2--) {
          for (let file2 = 0; file2 < 8; file2++) {
            const square = file2 + rank2 * 8;
            const piece = board.get(square);
            if (!piece)
              empty++;
            else {
              if (empty > 0) {
                fen += empty;
                empty = 0;
              }
              fen += makePiece2(piece);
            }
            if (file2 === 7) {
              if (empty > 0) {
                fen += empty;
                empty = 0;
              }
              if (rank2 !== 0)
                fen += "/";
            }
          }
        }
        return fen;
      };
      makePocket = (material) => ROLES.map((role) => roleToChar(role).repeat(material[role])).join("");
      makePockets = (pocket) => makePocket(pocket.white).toUpperCase() + makePocket(pocket.black);
      makeCastlingFen = (board, castlingRights) => {
        let fen = "";
        for (const color of COLORS) {
          const backrank = SquareSet.backrank(color);
          let king2 = board.kingOf(color);
          if (defined(king2) && !backrank.has(king2))
            king2 = void 0;
          const candidates = board.pieces(color, "rook").intersect(backrank);
          for (const rook2 of castlingRights.intersect(backrank).reversed()) {
            if (rook2 === candidates.first() && defined(king2) && rook2 < king2) {
              fen += color === "white" ? "Q" : "q";
            } else if (rook2 === candidates.last() && defined(king2) && king2 < rook2) {
              fen += color === "white" ? "K" : "k";
            } else {
              const file2 = FILE_NAMES[squareFile(rook2)];
              fen += color === "white" ? file2.toUpperCase() : file2;
            }
          }
        }
        return fen || "-";
      };
      makeRemainingChecks = (checks) => `${checks.white}+${checks.black}`;
      makeFen = (setup, opts) => [
        makeBoardFen(setup.board) + (setup.pockets ? `[${makePockets(setup.pockets)}]` : ""),
        setup.turn[0],
        makeCastlingFen(setup.board, setup.castlingRights),
        defined(setup.epSquare) ? makeSquare(setup.epSquare) : "-",
        ...setup.remainingChecks ? [makeRemainingChecks(setup.remainingChecks)] : [],
        ...(opts === null || opts === void 0 ? void 0 : opts.epd) ? [] : [Math.max(0, Math.min(setup.halfmoves, 9999)), Math.max(1, Math.min(setup.fullmoves, 9999))]
      ].join(" ");
    }
  });

  // node_modules/chessops/dist/esm/debug.js
  var init_debug = __esm({
    "node_modules/chessops/dist/esm/debug.js"() {
    }
  });

  // node_modules/chessops/dist/esm/san.js
  var makeSanWithoutSuffix, makeSanAndPlay, parseSan;
  var init_san = __esm({
    "node_modules/chessops/dist/esm/san.js"() {
      init_attacks();
      init_squareSet();
      init_types2();
      init_util2();
      makeSanWithoutSuffix = (pos, move3) => {
        let san = "";
        if (isDrop(move3)) {
          if (move3.role !== "pawn")
            san = roleToChar(move3.role).toUpperCase();
          san += "@" + makeSquare(move3.to);
        } else {
          const role = pos.board.getRole(move3.from);
          if (!role)
            return "--";
          if (role === "king" && (pos.board[pos.turn].has(move3.to) || Math.abs(move3.to - move3.from) === 2)) {
            san = move3.to > move3.from ? "O-O" : "O-O-O";
          } else {
            const capture = pos.board.occupied.has(move3.to) || role === "pawn" && squareFile(move3.from) !== squareFile(move3.to);
            if (role !== "pawn") {
              san = roleToChar(role).toUpperCase();
              let others;
              if (role === "king")
                others = kingAttacks(move3.to).intersect(pos.board.king);
              else if (role === "queen")
                others = queenAttacks(move3.to, pos.board.occupied).intersect(pos.board.queen);
              else if (role === "rook")
                others = rookAttacks(move3.to, pos.board.occupied).intersect(pos.board.rook);
              else if (role === "bishop")
                others = bishopAttacks(move3.to, pos.board.occupied).intersect(pos.board.bishop);
              else
                others = knightAttacks(move3.to).intersect(pos.board.knight);
              others = others.intersect(pos.board[pos.turn]).without(move3.from);
              if (others.nonEmpty()) {
                const ctx = pos.ctx();
                for (const from of others) {
                  if (!pos.dests(from, ctx).has(move3.to))
                    others = others.without(from);
                }
                if (others.nonEmpty()) {
                  let row = false;
                  let column = others.intersects(SquareSet.fromRank(squareRank(move3.from)));
                  if (others.intersects(SquareSet.fromFile(squareFile(move3.from))))
                    row = true;
                  else
                    column = true;
                  if (column)
                    san += FILE_NAMES[squareFile(move3.from)];
                  if (row)
                    san += RANK_NAMES[squareRank(move3.from)];
                }
              }
            } else if (capture)
              san = FILE_NAMES[squareFile(move3.from)];
            if (capture)
              san += "x";
            san += makeSquare(move3.to);
            if (move3.promotion)
              san += "=" + roleToChar(move3.promotion).toUpperCase();
          }
        }
        return san;
      };
      makeSanAndPlay = (pos, move3) => {
        var _a;
        const san = makeSanWithoutSuffix(pos, move3);
        pos.play(move3);
        if ((_a = pos.outcome()) === null || _a === void 0 ? void 0 : _a.winner)
          return san + "#";
        if (pos.isCheck())
          return san + "+";
        return san;
      };
      parseSan = (pos, san) => {
        const ctx = pos.ctx();
        const match = san.match(/^([NBRQK])?([a-h])?([1-8])?[-x]?([a-h][1-8])(?:=?([nbrqkNBRQK]))?[+#]?$/);
        if (!match) {
          let castlingSide2;
          if (san === "O-O" || san === "O-O+" || san === "O-O#")
            castlingSide2 = "h";
          else if (san === "O-O-O" || san === "O-O-O+" || san === "O-O-O#")
            castlingSide2 = "a";
          if (castlingSide2) {
            const rook2 = pos.castles.rook[pos.turn][castlingSide2];
            if (!defined(ctx.king) || !defined(rook2) || !pos.dests(ctx.king, ctx).has(rook2))
              return;
            return {
              from: ctx.king,
              to: rook2
            };
          }
          const match2 = san.match(/^([pnbrqkPNBRQK])?@([a-h][1-8])[+#]?$/);
          if (!match2)
            return;
          const move3 = {
            role: match2[1] ? charToRole(match2[1]) : "pawn",
            to: parseSquare(match2[2])
          };
          return pos.isLegal(move3, ctx) ? move3 : void 0;
        }
        const role = match[1] ? charToRole(match[1]) : "pawn";
        const to = parseSquare(match[4]);
        const promotion = match[5] ? charToRole(match[5]) : void 0;
        if (!!promotion !== (role === "pawn" && SquareSet.backranks().has(to)))
          return;
        if (promotion === "king" && pos.rules !== "antichess")
          return;
        let candidates = pos.board.pieces(pos.turn, role);
        if (role === "pawn" && !match[2])
          candidates = candidates.intersect(SquareSet.fromFile(squareFile(to)));
        else if (match[2])
          candidates = candidates.intersect(SquareSet.fromFile(match[2].charCodeAt(0) - "a".charCodeAt(0)));
        if (match[3])
          candidates = candidates.intersect(SquareSet.fromRank(match[3].charCodeAt(0) - "1".charCodeAt(0)));
        const pawnAdvance = role === "pawn" ? SquareSet.fromFile(squareFile(to)) : SquareSet.empty();
        candidates = candidates.intersect(pawnAdvance.union(attacks({ color: opposite2(pos.turn), role }, to, pos.board.occupied)));
        let from;
        for (const candidate of candidates) {
          if (pos.dests(candidate, ctx).has(to)) {
            if (defined(from))
              return;
            from = candidate;
          }
        }
        if (!defined(from))
          return;
        return {
          from,
          to,
          promotion
        };
      };
    }
  });

  // node_modules/chessops/dist/esm/transform.js
  var init_transform = __esm({
    "node_modules/chessops/dist/esm/transform.js"() {
    }
  });

  // node_modules/chessops/dist/esm/variant.js
  var Crazyhouse, Atomic, Antichess, KingOfTheHill, ThreeCheck, racingKingsBoard, RacingKings, hordeBoard, Horde, defaultPosition, setupPosition;
  var init_variant = __esm({
    "node_modules/chessops/dist/esm/variant.js"() {
      init_index_modern();
      init_attacks();
      init_board2();
      init_chess2();
      init_setup();
      init_squareSet();
      init_types2();
      init_util2();
      Crazyhouse = class extends Position {
        constructor() {
          super("crazyhouse");
        }
        reset() {
          super.reset();
          this.pockets = Material.empty();
        }
        setupUnchecked(setup) {
          super.setupUnchecked(setup);
          this.board.promoted = setup.board.promoted.intersect(setup.board.occupied).diff(setup.board.king).diff(setup.board.pawn);
          this.pockets = setup.pockets ? setup.pockets.clone() : Material.empty();
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        validate() {
          return super.validate().chain((_) => {
            var _a, _b;
            if ((_a = this.pockets) === null || _a === void 0 ? void 0 : _a.count("king")) {
              return n.err(new PositionError(IllegalSetup.Kings));
            }
            if ((((_b = this.pockets) === null || _b === void 0 ? void 0 : _b.size()) || 0) + this.board.occupied.size() > 64) {
              return n.err(new PositionError(IllegalSetup.Variant));
            }
            return n.ok(void 0);
          });
        }
        hasInsufficientMaterial(color) {
          if (!this.pockets)
            return super.hasInsufficientMaterial(color);
          return this.board.occupied.size() + this.pockets.size() <= 3 && this.board.pawn.isEmpty() && this.board.promoted.isEmpty() && this.board.rooksAndQueens().isEmpty() && this.pockets.count("pawn") <= 0 && this.pockets.count("rook") <= 0 && this.pockets.count("queen") <= 0;
        }
        dropDests(ctx) {
          var _a, _b;
          const mask = this.board.occupied.complement().intersect(((_a = this.pockets) === null || _a === void 0 ? void 0 : _a[this.turn].hasNonPawns()) ? SquareSet.full() : ((_b = this.pockets) === null || _b === void 0 ? void 0 : _b[this.turn].hasPawns()) ? SquareSet.backranks().complement() : SquareSet.empty());
          ctx = ctx || this.ctx();
          if (defined(ctx.king) && ctx.checkers.nonEmpty()) {
            const checker = ctx.checkers.singleSquare();
            if (!defined(checker))
              return SquareSet.empty();
            return mask.intersect(between(checker, ctx.king));
          } else
            return mask;
        }
      };
      Atomic = class extends Position {
        constructor() {
          super("atomic");
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        validate() {
          if (this.board.occupied.isEmpty())
            return n.err(new PositionError(IllegalSetup.Empty));
          if (this.board.king.size() > 2)
            return n.err(new PositionError(IllegalSetup.Kings));
          const otherKing = this.board.kingOf(opposite2(this.turn));
          if (!defined(otherKing))
            return n.err(new PositionError(IllegalSetup.Kings));
          if (this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
            return n.err(new PositionError(IllegalSetup.OppositeCheck));
          }
          if (SquareSet.backranks().intersects(this.board.pawn)) {
            return n.err(new PositionError(IllegalSetup.PawnsOnBackrank));
          }
          return n.ok(void 0);
        }
        kingAttackers(square, attacker, occupied) {
          const attackerKings = this.board.pieces(attacker, "king");
          if (attackerKings.isEmpty() || kingAttacks(square).intersects(attackerKings)) {
            return SquareSet.empty();
          }
          return super.kingAttackers(square, attacker, occupied);
        }
        playCaptureAt(square, captured) {
          super.playCaptureAt(square, captured);
          this.board.take(square);
          for (const explode of kingAttacks(square).intersect(this.board.occupied).diff(this.board.pawn)) {
            const piece = this.board.take(explode);
            if ((piece === null || piece === void 0 ? void 0 : piece.role) === "rook")
              this.castles.discardRook(explode);
            if ((piece === null || piece === void 0 ? void 0 : piece.role) === "king")
              this.castles.discardColor(piece.color);
          }
        }
        hasInsufficientMaterial(color) {
          if (this.board.pieces(opposite2(color), "king").isEmpty())
            return false;
          if (this.board[color].diff(this.board.king).isEmpty())
            return true;
          if (this.board[opposite2(color)].diff(this.board.king).nonEmpty()) {
            if (this.board.occupied.equals(this.board.bishop.union(this.board.king))) {
              if (!this.board.bishop.intersect(this.board.white).intersects(SquareSet.darkSquares())) {
                return !this.board.bishop.intersect(this.board.black).intersects(SquareSet.lightSquares());
              }
              if (!this.board.bishop.intersect(this.board.white).intersects(SquareSet.lightSquares())) {
                return !this.board.bishop.intersect(this.board.black).intersects(SquareSet.darkSquares());
              }
            }
            return false;
          }
          if (this.board.queen.nonEmpty() || this.board.pawn.nonEmpty())
            return false;
          if (this.board.knight.union(this.board.bishop).union(this.board.rook).size() === 1)
            return true;
          if (this.board.occupied.equals(this.board.knight.union(this.board.king))) {
            return this.board.knight.size() <= 2;
          }
          return false;
        }
        dests(square, ctx) {
          ctx = ctx || this.ctx();
          let dests = SquareSet.empty();
          for (const to of pseudoDests(this, square, ctx)) {
            const after = this.clone();
            after.play({ from: square, to });
            const ourKing = after.board.kingOf(this.turn);
            if (defined(ourKing) && (!defined(after.board.kingOf(after.turn)) || after.kingAttackers(ourKing, after.turn, after.board.occupied).isEmpty())) {
              dests = dests.with(to);
            }
          }
          return dests;
        }
        isVariantEnd() {
          return !!this.variantOutcome();
        }
        variantOutcome(_ctx) {
          for (const color of COLORS) {
            if (this.board.pieces(color, "king").isEmpty())
              return { winner: opposite2(color) };
          }
          return;
        }
      };
      Antichess = class extends Position {
        constructor() {
          super("antichess");
        }
        reset() {
          super.reset();
          this.castles = Castles.empty();
        }
        setupUnchecked(setup) {
          super.setupUnchecked(setup);
          this.castles = Castles.empty();
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        validate() {
          if (this.board.occupied.isEmpty())
            return n.err(new PositionError(IllegalSetup.Empty));
          if (SquareSet.backranks().intersects(this.board.pawn)) {
            return n.err(new PositionError(IllegalSetup.PawnsOnBackrank));
          }
          return n.ok(void 0);
        }
        kingAttackers(_square, _attacker, _occupied) {
          return SquareSet.empty();
        }
        ctx() {
          const ctx = super.ctx();
          if (defined(this.epSquare) && pawnAttacks(opposite2(this.turn), this.epSquare).intersects(this.board.pieces(this.turn, "pawn"))) {
            ctx.mustCapture = true;
            return ctx;
          }
          const enemy = this.board[opposite2(this.turn)];
          for (const from of this.board[this.turn]) {
            if (pseudoDests(this, from, ctx).intersects(enemy)) {
              ctx.mustCapture = true;
              return ctx;
            }
          }
          return ctx;
        }
        dests(square, ctx) {
          ctx = ctx || this.ctx();
          const dests = pseudoDests(this, square, ctx);
          const enemy = this.board[opposite2(this.turn)];
          return dests.intersect(ctx.mustCapture ? defined(this.epSquare) && this.board.getRole(square) === "pawn" ? enemy.with(this.epSquare) : enemy : SquareSet.full());
        }
        hasInsufficientMaterial(color) {
          if (this.board[color].isEmpty())
            return false;
          if (this.board[opposite2(color)].isEmpty())
            return true;
          if (this.board.occupied.equals(this.board.bishop)) {
            const weSomeOnLight = this.board[color].intersects(SquareSet.lightSquares());
            const weSomeOnDark = this.board[color].intersects(SquareSet.darkSquares());
            const theyAllOnDark = this.board[opposite2(color)].isDisjoint(SquareSet.lightSquares());
            const theyAllOnLight = this.board[opposite2(color)].isDisjoint(SquareSet.darkSquares());
            return weSomeOnLight && theyAllOnDark || weSomeOnDark && theyAllOnLight;
          }
          if (this.board.occupied.equals(this.board.knight) && this.board.occupied.size() === 2) {
            return this.board.white.intersects(SquareSet.lightSquares()) !== this.board.black.intersects(SquareSet.darkSquares()) !== (this.turn === color);
          }
          return false;
        }
        isVariantEnd() {
          return this.board[this.turn].isEmpty();
        }
        variantOutcome(ctx) {
          ctx = ctx || this.ctx();
          if (ctx.variantEnd || this.isStalemate(ctx)) {
            return { winner: this.turn };
          }
          return;
        }
      };
      KingOfTheHill = class extends Position {
        constructor() {
          super("kingofthehill");
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        hasInsufficientMaterial(_color) {
          return false;
        }
        isVariantEnd() {
          return this.board.king.intersects(SquareSet.center());
        }
        variantOutcome(_ctx) {
          for (const color of COLORS) {
            if (this.board.pieces(color, "king").intersects(SquareSet.center()))
              return { winner: color };
          }
          return;
        }
      };
      ThreeCheck = class extends Position {
        constructor() {
          super("3check");
        }
        reset() {
          super.reset();
          this.remainingChecks = RemainingChecks.default();
        }
        setupUnchecked(setup) {
          var _a;
          super.setupUnchecked(setup);
          this.remainingChecks = ((_a = setup.remainingChecks) === null || _a === void 0 ? void 0 : _a.clone()) || RemainingChecks.default();
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        hasInsufficientMaterial(color) {
          return this.board.pieces(color, "king").equals(this.board[color]);
        }
        isVariantEnd() {
          return !!this.remainingChecks && (this.remainingChecks.white <= 0 || this.remainingChecks.black <= 0);
        }
        variantOutcome(_ctx) {
          if (this.remainingChecks) {
            for (const color of COLORS) {
              if (this.remainingChecks[color] <= 0)
                return { winner: color };
            }
          }
          return;
        }
      };
      racingKingsBoard = () => {
        const board = Board.empty();
        board.occupied = new SquareSet(65535, 0);
        board.promoted = SquareSet.empty();
        board.white = new SquareSet(61680, 0);
        board.black = new SquareSet(3855, 0);
        board.pawn = SquareSet.empty();
        board.knight = new SquareSet(6168, 0);
        board.bishop = new SquareSet(9252, 0);
        board.rook = new SquareSet(16962, 0);
        board.queen = new SquareSet(129, 0);
        board.king = new SquareSet(33024, 0);
        return board;
      };
      RacingKings = class extends Position {
        constructor() {
          super("racingkings");
        }
        reset() {
          this.board = racingKingsBoard();
          this.pockets = void 0;
          this.turn = "white";
          this.castles = Castles.empty();
          this.epSquare = void 0;
          this.remainingChecks = void 0;
          this.halfmoves = 0;
          this.fullmoves = 1;
        }
        setupUnchecked(setup) {
          super.setupUnchecked(setup);
          this.castles = Castles.empty();
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        validate() {
          if (this.isCheck() || this.board.pawn.nonEmpty())
            return n.err(new PositionError(IllegalSetup.Variant));
          return super.validate();
        }
        dests(square, ctx) {
          ctx = ctx || this.ctx();
          if (square === ctx.king)
            return super.dests(square, ctx);
          let dests = SquareSet.empty();
          for (const to of super.dests(square, ctx)) {
            const move3 = { from: square, to };
            const after = this.clone();
            after.play(move3);
            if (!after.isCheck())
              dests = dests.with(to);
          }
          return dests;
        }
        hasInsufficientMaterial(_color) {
          return false;
        }
        isVariantEnd() {
          const goal = SquareSet.fromRank(7);
          const inGoal = this.board.king.intersect(goal);
          if (inGoal.isEmpty())
            return false;
          if (this.turn === "white" || inGoal.intersects(this.board.black))
            return true;
          const blackKing = this.board.kingOf("black");
          if (defined(blackKing)) {
            const occ = this.board.occupied.without(blackKing);
            for (const target of kingAttacks(blackKing).intersect(goal).diff(this.board.black)) {
              if (this.kingAttackers(target, "white", occ).isEmpty())
                return false;
            }
          }
          return true;
        }
        variantOutcome(ctx) {
          if (ctx ? !ctx.variantEnd : !this.isVariantEnd())
            return;
          const goal = SquareSet.fromRank(7);
          const blackInGoal = this.board.pieces("black", "king").intersects(goal);
          const whiteInGoal = this.board.pieces("white", "king").intersects(goal);
          if (blackInGoal && !whiteInGoal)
            return { winner: "black" };
          if (whiteInGoal && !blackInGoal)
            return { winner: "white" };
          return { winner: void 0 };
        }
      };
      hordeBoard = () => {
        const board = Board.empty();
        board.occupied = new SquareSet(4294967295, 4294901862);
        board.promoted = SquareSet.empty();
        board.white = new SquareSet(4294967295, 102);
        board.black = new SquareSet(0, 4294901760);
        board.pawn = new SquareSet(4294967295, 16711782);
        board.knight = new SquareSet(0, 1107296256);
        board.bishop = new SquareSet(0, 603979776);
        board.rook = new SquareSet(0, 2164260864);
        board.queen = new SquareSet(0, 134217728);
        board.king = new SquareSet(0, 268435456);
        return board;
      };
      Horde = class extends Position {
        constructor() {
          super("horde");
        }
        reset() {
          this.board = hordeBoard();
          this.pockets = void 0;
          this.turn = "white";
          this.castles = Castles.default();
          this.castles.discardColor("white");
          this.epSquare = void 0;
          this.remainingChecks = void 0;
          this.halfmoves = 0;
          this.fullmoves = 1;
        }
        static default() {
          const pos = new this();
          pos.reset();
          return pos;
        }
        static fromSetup(setup) {
          const pos = new this();
          pos.setupUnchecked(setup);
          return pos.validate().map((_) => pos);
        }
        clone() {
          return super.clone();
        }
        validate() {
          if (this.board.occupied.isEmpty())
            return n.err(new PositionError(IllegalSetup.Empty));
          if (this.board.king.size() !== 1)
            return n.err(new PositionError(IllegalSetup.Kings));
          const otherKing = this.board.kingOf(opposite2(this.turn));
          if (defined(otherKing) && this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
            return n.err(new PositionError(IllegalSetup.OppositeCheck));
          }
          for (const color of COLORS) {
            const backranks = this.board.pieces(color, "king").isEmpty() ? SquareSet.backrank(opposite2(color)) : SquareSet.backranks();
            if (this.board.pieces(color, "pawn").intersects(backranks)) {
              return n.err(new PositionError(IllegalSetup.PawnsOnBackrank));
            }
          }
          return n.ok(void 0);
        }
        hasInsufficientMaterial(color) {
          if (this.board.pieces(color, "king").nonEmpty())
            return false;
          const oppositeSquareColor = (squareColor) => squareColor === "light" ? "dark" : "light";
          const coloredSquares = (squareColor) => squareColor === "light" ? SquareSet.lightSquares() : SquareSet.darkSquares();
          const hasBishopPair = (side) => {
            const bishops = this.board.pieces(side, "bishop");
            return bishops.intersects(SquareSet.darkSquares()) && bishops.intersects(SquareSet.lightSquares());
          };
          const horde = MaterialSide.fromBoard(this.board, color);
          const hordeBishops = (squareColor) => coloredSquares(squareColor).intersect(this.board.pieces(color, "bishop")).size();
          const hordeBishopColor = hordeBishops("light") >= 1 ? "light" : "dark";
          const hordeNum = horde.pawn + horde.knight + horde.rook + horde.queen + Math.min(hordeBishops("dark"), 2) + Math.min(hordeBishops("light"), 2);
          const pieces = MaterialSide.fromBoard(this.board, opposite2(color));
          const piecesBishops = (squareColor) => coloredSquares(squareColor).intersect(this.board.pieces(opposite2(color), "bishop")).size();
          const piecesNum = pieces.size();
          const piecesOfRoleNot = (piece) => piecesNum - piece;
          if (hordeNum === 0)
            return true;
          if (hordeNum >= 4) {
            return false;
          }
          if ((horde.pawn >= 1 || horde.queen >= 1) && hordeNum >= 2) {
            return false;
          }
          if (horde.rook >= 1 && hordeNum >= 2) {
            if (!(hordeNum === 2 && horde.rook === 1 && horde.bishop === 1 && piecesOfRoleNot(piecesBishops(hordeBishopColor)) === 1)) {
              return false;
            }
          }
          if (hordeNum === 1) {
            if (piecesNum === 1) {
              return true;
            } else if (horde.queen === 1) {
              return !(pieces.pawn >= 1 || pieces.rook >= 1 || piecesBishops("light") >= 2 || piecesBishops("dark") >= 2);
            } else if (horde.pawn === 1) {
              const pawnSquare = this.board.pieces(color, "pawn").last();
              const promoteToQueen = this.clone();
              promoteToQueen.board.set(pawnSquare, { color, role: "queen" });
              const promoteToKnight = this.clone();
              promoteToKnight.board.set(pawnSquare, { color, role: "knight" });
              return promoteToQueen.hasInsufficientMaterial(color) && promoteToKnight.hasInsufficientMaterial(color);
            } else if (horde.rook === 1) {
              return !(pieces.pawn >= 2 || pieces.rook >= 1 && pieces.pawn >= 1 || pieces.rook >= 1 && pieces.knight >= 1 || pieces.pawn >= 1 && pieces.knight >= 1);
            } else if (horde.bishop === 1) {
              return !// The king can be mated on A1 if there is a pawn/opposite-color-bishop
              // on A2 and an opposite-color-bishop on B1.
              // If black has two or more pawns, white gets the benefit of the doubt;
              // there is an outside chance that white promotes its pawns to
              // opposite-color-bishops and selfmates theirself.
              // Every other case that the king is mated by the bishop requires that
              // black has two pawns or two opposite-color-bishop or a pawn and an
              // opposite-color-bishop.
              // For example a king on A3 can be mated if there is
              // a pawn/opposite-color-bishop on A4, a pawn/opposite-color-bishop on
              // B3, a pawn/bishop/rook/queen on A2 and any other piece on B2.
              (piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 2 || piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1 && pieces.pawn >= 1 || pieces.pawn >= 2);
            } else if (horde.knight === 1) {
              return !// The king on A1 can be smother mated by a knight on C2 if there is
              // a pawn/knight/bishop on B2, a knight/rook on B1 and any other piece
              // on A2.
              // Moreover, when black has four or more pieces and two of them are
              // pawns, black can promote their pawns and selfmate theirself.
              (piecesNum >= 4 && (pieces.knight >= 2 || pieces.pawn >= 2 || pieces.rook >= 1 && pieces.knight >= 1 || pieces.rook >= 1 && pieces.bishop >= 1 || pieces.knight >= 1 && pieces.bishop >= 1 || pieces.rook >= 1 && pieces.pawn >= 1 || pieces.knight >= 1 && pieces.pawn >= 1 || pieces.bishop >= 1 && pieces.pawn >= 1 || hasBishopPair(opposite2(color)) && pieces.pawn >= 1) && (piecesBishops("dark") < 2 || piecesOfRoleNot(piecesBishops("dark")) >= 3) && (piecesBishops("light") < 2 || piecesOfRoleNot(piecesBishops("light")) >= 3));
            }
          } else if (hordeNum === 2) {
            if (piecesNum === 1) {
              return true;
            } else if (horde.knight === 2) {
              return pieces.pawn + pieces.bishop + pieces.knight < 1;
            } else if (hasBishopPair(color)) {
              return !// A king on A1 obstructed by a pawn/bishop on A2 is mated
              // by the bishop pair.
              (pieces.pawn >= 1 || pieces.bishop >= 1 || pieces.knight >= 1 && pieces.rook + pieces.queen >= 1);
            } else if (horde.bishop >= 1 && horde.knight >= 1) {
              return !// A king on A1 obstructed by a pawn/opposite-color-bishop on
              // A2 is mated by a knight on D2 and a bishop on C3.
              (pieces.pawn >= 1 || piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1 || piecesOfRoleNot(piecesBishops(hordeBishopColor)) >= 3);
            } else {
              return !// A king on A1 obstructed by a pawn/opposite-bishop/knight
              // on A2 and a opposite-bishop/knight on B1 is mated by two
              // bishops on B2 and C3. This position is theoretically
              // achievable even when black has two pawns or when they
              // have a pawn and an opposite color bishop.
              (pieces.pawn >= 1 && piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1 || pieces.pawn >= 1 && pieces.knight >= 1 || piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1 && pieces.knight >= 1 || piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 2 || pieces.knight >= 2 || pieces.pawn >= 2);
            }
          } else if (hordeNum === 3) {
            if (horde.knight === 2 && horde.bishop === 1 || horde.knight === 3 || hasBishopPair(color)) {
              return false;
            } else {
              return piecesNum === 1;
            }
          }
          return true;
        }
        isVariantEnd() {
          return this.board.white.isEmpty() || this.board.black.isEmpty();
        }
        variantOutcome(_ctx) {
          if (this.board.white.isEmpty())
            return { winner: "black" };
          if (this.board.black.isEmpty())
            return { winner: "white" };
          return;
        }
      };
      defaultPosition = (rules) => {
        switch (rules) {
          case "chess":
            return Chess2.default();
          case "antichess":
            return Antichess.default();
          case "atomic":
            return Atomic.default();
          case "horde":
            return Horde.default();
          case "racingkings":
            return RacingKings.default();
          case "kingofthehill":
            return KingOfTheHill.default();
          case "3check":
            return ThreeCheck.default();
          case "crazyhouse":
            return Crazyhouse.default();
        }
      };
      setupPosition = (rules, setup) => {
        switch (rules) {
          case "chess":
            return Chess2.fromSetup(setup);
          case "antichess":
            return Antichess.fromSetup(setup);
          case "atomic":
            return Atomic.fromSetup(setup);
          case "horde":
            return Horde.fromSetup(setup);
          case "racingkings":
            return RacingKings.fromSetup(setup);
          case "kingofthehill":
            return KingOfTheHill.fromSetup(setup);
          case "3check":
            return ThreeCheck.fromSetup(setup);
          case "crazyhouse":
            return Crazyhouse.fromSetup(setup);
        }
      };
    }
  });

  // node_modules/chessops/dist/esm/pgn.js
  function parseCommentShapeColor(str) {
    switch (str) {
      case "G":
        return "green";
      case "R":
        return "red";
      case "Y":
        return "yellow";
      case "B":
        return "blue";
      default:
        return;
    }
  }
  var defaultGame, Node, ChildNode, transform, makeOutcome, parseOutcome, defaultHeaders, BOM, isWhitespace, isCommentLine, PgnError, PgnParser, parsePgn, parseVariant, startingPosition, parseCommentShape, parseComment;
  var init_pgn = __esm({
    "node_modules/chessops/dist/esm/pgn.js"() {
      init_index_modern();
      init_chess2();
      init_fen2();
      init_util2();
      init_variant();
      defaultGame = (initHeaders = defaultHeaders) => ({
        headers: initHeaders(),
        moves: new Node()
      });
      Node = class {
        constructor() {
          this.children = [];
        }
        *mainlineNodes() {
          let node2 = this;
          while (node2.children.length) {
            const child = node2.children[0];
            yield child;
            node2 = child;
          }
        }
        *mainline() {
          for (const child of this.mainlineNodes())
            yield child.data;
        }
        end() {
          let node2 = this;
          while (node2.children.length)
            node2 = node2.children[0];
          return node2;
        }
      };
      ChildNode = class extends Node {
        constructor(data) {
          super();
          this.data = data;
        }
      };
      transform = (node2, ctx, f) => {
        const root = new Node();
        const stack = [
          {
            before: node2,
            after: root,
            ctx
          }
        ];
        let frame;
        while (frame = stack.pop()) {
          for (let childIndex = 0; childIndex < frame.before.children.length; childIndex++) {
            const ctx2 = childIndex < frame.before.children.length - 1 ? frame.ctx.clone() : frame.ctx;
            const childBefore = frame.before.children[childIndex];
            const data = f(ctx2, childBefore.data, childIndex);
            if (defined(data)) {
              const childAfter = new ChildNode(data);
              frame.after.children.push(childAfter);
              stack.push({
                before: childBefore,
                after: childAfter,
                ctx: ctx2
              });
            }
          }
        }
        return root;
      };
      makeOutcome = (outcome) => {
        if (!outcome)
          return "*";
        else if (outcome.winner === "white")
          return "1-0";
        else if (outcome.winner === "black")
          return "0-1";
        else
          return "1/2-1/2";
      };
      parseOutcome = (s) => {
        if (s === "1-0" || s === "1\u20130" || s === "1\u20140")
          return { winner: "white" };
        else if (s === "0-1" || s === "0\u20131" || s === "0\u20141")
          return { winner: "black" };
        else if (s === "1/2-1/2" || s === "1/2\u20131/2" || s === "1/2\u20141/2")
          return { winner: void 0 };
        else
          return;
      };
      defaultHeaders = () => /* @__PURE__ */ new Map([
        ["Event", "?"],
        ["Site", "?"],
        ["Date", "????.??.??"],
        ["Round", "?"],
        ["White", "?"],
        ["Black", "?"],
        ["Result", "*"]
      ]);
      BOM = "\uFEFF";
      isWhitespace = (line) => /^\s*$/.test(line);
      isCommentLine = (line) => line.startsWith("%");
      PgnError = class extends Error {
      };
      PgnParser = class {
        constructor(emitGame, initHeaders = defaultHeaders, maxBudget = 1e6) {
          this.emitGame = emitGame;
          this.initHeaders = initHeaders;
          this.maxBudget = maxBudget;
          this.lineBuf = [];
          this.resetGame();
          this.state = 0;
        }
        resetGame() {
          this.budget = this.maxBudget;
          this.found = false;
          this.state = 1;
          this.game = defaultGame(this.initHeaders);
          this.stack = [{ parent: this.game.moves, root: true }];
          this.commentBuf = [];
        }
        consumeBudget(cost) {
          this.budget -= cost;
          if (this.budget < 0)
            throw new PgnError("ERR_PGN_BUDGET");
        }
        parse(data, options) {
          if (this.budget < 0)
            return;
          try {
            let idx = 0;
            for (; ; ) {
              const nlIdx = data.indexOf("\n", idx);
              if (nlIdx === -1) {
                break;
              }
              const crIdx = nlIdx > idx && data[nlIdx - 1] === "\r" ? nlIdx - 1 : nlIdx;
              this.consumeBudget(nlIdx - idx);
              this.lineBuf.push(data.slice(idx, crIdx));
              idx = nlIdx + 1;
              this.handleLine();
            }
            this.consumeBudget(data.length - idx);
            this.lineBuf.push(data.slice(idx));
            if (!(options === null || options === void 0 ? void 0 : options.stream)) {
              this.handleLine();
              this.emit(void 0);
            }
          } catch (err) {
            this.emit(err);
          }
        }
        handleLine() {
          let freshLine = true;
          let line = this.lineBuf.join("");
          this.lineBuf = [];
          continuedLine: for (; ; ) {
            switch (this.state) {
              case 0:
                if (line.startsWith(BOM))
                  line = line.slice(BOM.length);
                this.state = 1;
              // fall through
              case 1:
                if (isWhitespace(line) || isCommentLine(line))
                  return;
                this.found = true;
                this.state = 2;
              // fall through
              case 2: {
                if (isCommentLine(line))
                  return;
                let moreHeaders = true;
                while (moreHeaders) {
                  moreHeaders = false;
                  line = line.replace(/^\s*\[([A-Za-z0-9][A-Za-z0-9_+#=:-]*)\s+"((?:[^"\\]|\\"|\\\\)*)"\]/, (_match, headerName, headerValue) => {
                    this.consumeBudget(200);
                    this.handleHeader(headerName, headerValue.replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
                    moreHeaders = true;
                    freshLine = false;
                    return "";
                  });
                }
                if (isWhitespace(line))
                  return;
                this.state = 3;
              }
              case 3: {
                if (freshLine) {
                  if (isCommentLine(line))
                    return;
                  if (isWhitespace(line))
                    return this.emit(void 0);
                }
                const tokenRegex = /(?:[NBKRQ]?[a-h]?[1-8]?[-x]?[a-h][1-8](?:=?[nbrqkNBRQK])?|[pnbrqkPNBRQK]?@[a-h][1-8]|[O0o][-–—][O0o](?:[-–—][O0o])?)[+#]?|--|Z0|0000|@@@@|{|;|\$\d{1,4}|[?!]{1,2}|\(|\)|\*|1[-–—]0|0[-–—]1|1\/2[-–—]1\/2/g;
                let match;
                while (match = tokenRegex.exec(line)) {
                  const frame = this.stack[this.stack.length - 1];
                  let token = match[0];
                  if (token === ";")
                    return;
                  else if (token.startsWith("$"))
                    this.handleNag(parseInt(token.slice(1), 10));
                  else if (token === "!")
                    this.handleNag(1);
                  else if (token === "?")
                    this.handleNag(2);
                  else if (token === "!!")
                    this.handleNag(3);
                  else if (token === "??")
                    this.handleNag(4);
                  else if (token === "!?")
                    this.handleNag(5);
                  else if (token === "?!")
                    this.handleNag(6);
                  else if (token === "1-0" || token === "1\u20130" || token === "1\u20140" || token === "0-1" || token === "0\u20131" || token === "0\u20141" || token === "1/2-1/2" || token === "1/2\u20131/2" || token === "1/2\u20141/2" || token === "*") {
                    if (this.stack.length === 1 && token !== "*")
                      this.handleHeader("Result", token);
                  } else if (token === "(") {
                    this.consumeBudget(100);
                    this.stack.push({ parent: frame.parent, root: false });
                  } else if (token === ")") {
                    if (this.stack.length > 1)
                      this.stack.pop();
                  } else if (token === "{") {
                    const openIndex = tokenRegex.lastIndex;
                    const beginIndex = line[openIndex] === " " ? openIndex + 1 : openIndex;
                    line = line.slice(beginIndex);
                    this.state = 4;
                    continue continuedLine;
                  } else {
                    this.consumeBudget(100);
                    if (token.startsWith("O") || token.startsWith("0") || token.startsWith("o")) {
                      token = token.replace(/[0o]/g, "O").replace(/[–—]/g, "-");
                    } else if (token === "Z0" || token === "0000" || token === "@@@@")
                      token = "--";
                    if (frame.node)
                      frame.parent = frame.node;
                    frame.node = new ChildNode({
                      san: token,
                      startingComments: frame.startingComments
                    });
                    frame.startingComments = void 0;
                    frame.root = false;
                    frame.parent.children.push(frame.node);
                  }
                }
                return;
              }
              case 4: {
                const closeIndex = line.indexOf("}");
                if (closeIndex === -1) {
                  this.commentBuf.push(line);
                  return;
                } else {
                  const endIndex = closeIndex > 0 && line[closeIndex - 1] === " " ? closeIndex - 1 : closeIndex;
                  this.commentBuf.push(line.slice(0, endIndex));
                  this.handleComment();
                  line = line.slice(closeIndex);
                  this.state = 3;
                  freshLine = false;
                }
              }
            }
          }
        }
        handleHeader(name, value) {
          this.game.headers.set(name, name === "Result" ? makeOutcome(parseOutcome(value)) : value);
        }
        handleNag(nag) {
          var _a;
          this.consumeBudget(50);
          const frame = this.stack[this.stack.length - 1];
          if (frame.node) {
            (_a = frame.node.data).nags || (_a.nags = []);
            frame.node.data.nags.push(nag);
          }
        }
        handleComment() {
          var _a, _b;
          this.consumeBudget(100);
          const frame = this.stack[this.stack.length - 1];
          const comment = this.commentBuf.join("\n");
          this.commentBuf = [];
          if (frame.node) {
            (_a = frame.node.data).comments || (_a.comments = []);
            frame.node.data.comments.push(comment);
          } else if (frame.root) {
            (_b = this.game).comments || (_b.comments = []);
            this.game.comments.push(comment);
          } else {
            frame.startingComments || (frame.startingComments = []);
            frame.startingComments.push(comment);
          }
        }
        emit(err) {
          if (this.state === 4)
            this.handleComment();
          if (err)
            return this.emitGame(this.game, err);
          if (this.found)
            this.emitGame(this.game, void 0);
          this.resetGame();
        }
      };
      parsePgn = (pgn2, initHeaders = defaultHeaders) => {
        const games = [];
        new PgnParser((game) => games.push(game), initHeaders, NaN).parse(pgn2);
        return games;
      };
      parseVariant = (variant) => {
        switch ((variant || "chess").toLowerCase()) {
          case "chess":
          case "chess960":
          case "chess 960":
          case "standard":
          case "from position":
          case "classical":
          case "normal":
          case "fischerandom":
          // Cute Chess
          case "fischerrandom":
          case "fischer random":
          case "wild/0":
          case "wild/1":
          case "wild/2":
          case "wild/3":
          case "wild/4":
          case "wild/5":
          case "wild/6":
          case "wild/7":
          case "wild/8":
          case "wild/8a":
            return "chess";
          case "crazyhouse":
          case "crazy house":
          case "house":
          case "zh":
            return "crazyhouse";
          case "king of the hill":
          case "koth":
          case "kingofthehill":
            return "kingofthehill";
          case "three-check":
          case "three check":
          case "threecheck":
          case "three check chess":
          case "3-check":
          case "3 check":
          case "3check":
            return "3check";
          case "antichess":
          case "anti chess":
          case "anti":
            return "antichess";
          case "atomic":
          case "atom":
          case "atomic chess":
            return "atomic";
          case "horde":
          case "horde chess":
            return "horde";
          case "racing kings":
          case "racingkings":
          case "racing":
          case "race":
            return "racingkings";
          default:
            return;
        }
      };
      startingPosition = (headers) => {
        const rules = parseVariant(headers.get("Variant"));
        if (!rules)
          return n.err(new PositionError(IllegalSetup.Variant));
        const fen = headers.get("FEN");
        if (fen)
          return parseFen(fen).chain((setup) => setupPosition(rules, setup));
        else
          return n.ok(defaultPosition(rules));
      };
      parseCommentShape = (str) => {
        const color = parseCommentShapeColor(str.slice(0, 1));
        const from = parseSquare(str.slice(1, 3));
        const to = parseSquare(str.slice(3, 5));
        if (!color || !defined(from))
          return;
        if (str.length === 3)
          return { color, from, to: from };
        if (str.length === 5 && defined(to))
          return { color, from, to };
        return;
      };
      parseComment = (comment) => {
        let emt, clock, evaluation;
        const shapes = [];
        const text = comment.replace(/\s?\[%(emt|clk)\s(\d{1,5}):(\d{1,2}):(\d{1,2}(?:\.\d{0,3})?)\]\s?/g, (_, annotation, hours, minutes, seconds) => {
          const value = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseFloat(seconds);
          if (annotation === "emt")
            emt = value;
          else if (annotation === "clk")
            clock = value;
          return "  ";
        }).replace(/\s?\[%(?:csl|cal)\s([RGYB][a-h][1-8](?:[a-h][1-8])?(?:,[RGYB][a-h][1-8](?:[a-h][1-8])?)*)\]\s?/g, (_, arrows) => {
          for (const arrow of arrows.split(",")) {
            shapes.push(parseCommentShape(arrow));
          }
          return "  ";
        }).replace(/\s?\[%eval\s(?:#([+-]?\d{1,5})|([+-]?(?:\d{1,5}|\d{0,5}\.\d{1,2})))(?:,(\d{1,5}))?\]\s?/g, (_, mate, pawns, d) => {
          const depth = d && parseInt(d, 10);
          evaluation = mate ? { mate: parseInt(mate, 10), depth } : { pawns: parseFloat(pawns), depth };
          return "  ";
        }).trim();
        return {
          text,
          shapes,
          emt,
          clock,
          evaluation
        };
      };
    }
  });

  // node_modules/chessops/dist/esm/index.js
  var init_esm = __esm({
    "node_modules/chessops/dist/esm/index.js"() {
      init_util2();
      init_compat();
      init_debug();
      init_fen2();
      init_san();
      init_transform();
      init_variant();
      init_pgn();
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/translation.js
  function translate2(translator) {
    return (key) => translator && translator(key) || defaultTranslator(key);
  }
  var defaultTranslator, defaultTranslations;
  var init_translation = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/translation.js"() {
      defaultTranslator = (key) => defaultTranslations[key];
      defaultTranslations = {
        flipTheBoard: "Flip the board",
        analysisBoard: "Analysis board",
        practiceWithComputer: "Practice with computer",
        getPgn: "Get PGN",
        download: "Download",
        viewOnLichess: "View on Lichess",
        viewOnSite: "View on site"
      };
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/path.js
  var Path;
  var init_path = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/path.js"() {
      Path = class _Path {
        constructor(path) {
          this.path = path;
          this.size = () => this.path.length / 2;
          this.head = () => this.path.slice(0, 2);
          this.tail = () => new _Path(this.path.slice(2));
          this.init = () => new _Path(this.path.slice(0, -2));
          this.last = () => this.path.slice(-2);
          this.empty = () => this.path == "";
          this.contains = (other) => this.path.startsWith(other.path);
          this.isChildOf = (parent) => this.init() === parent;
          this.append = (id) => new _Path(this.path + id);
          this.equals = (other) => this.path == other.path;
        }
      };
      Path.root = new Path("");
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/game.js
  var Game, childById, nodeAtPathFrom, isMoveNode, isMoveData;
  var init_game = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/game.js"() {
      init_path();
      Game = class {
        constructor(initial2, moves, players, metadata) {
          this.initial = initial2;
          this.moves = moves;
          this.players = players;
          this.metadata = metadata;
          this.nodeAt = (path) => nodeAtPathFrom(this.moves, path);
          this.dataAt = (path) => {
            const node2 = this.nodeAt(path);
            return node2 ? isMoveNode(node2) ? node2.data : this.initial : void 0;
          };
          this.title = () => this.players.white.name ? [
            this.players.white.title,
            this.players.white.name,
            "vs",
            this.players.black.title,
            this.players.black.name
          ].filter((x) => x && !!x.trim()).join("_").replace(" ", "-") : "lichess-pgn-viewer";
          this.pathAtMainlinePly = (ply) => {
            var _a;
            return ply == 0 ? Path.root : ((_a = this.mainline[Math.max(0, Math.min(this.mainline.length - 1, ply == "last" ? 9999 : ply - 1))]) === null || _a === void 0 ? void 0 : _a.path) || Path.root;
          };
          this.hasPlayerName = () => {
            var _a, _b;
            return !!(((_a = this.players.white) === null || _a === void 0 ? void 0 : _a.name) || ((_b = this.players.black) === null || _b === void 0 ? void 0 : _b.name));
          };
          this.mainline = Array.from(this.moves.mainline());
        }
      };
      childById = (node2, id) => node2.children.find((c) => c.data.path.last() == id);
      nodeAtPathFrom = (node2, path) => {
        if (path.empty())
          return node2;
        const child = childById(node2, path.head());
        return child ? nodeAtPathFrom(child, path.tail()) : void 0;
      };
      isMoveNode = (n2) => "data" in n2;
      isMoveData = (d) => "uci" in d;
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/pgn.js
  function makePlayers(headers, metadata) {
    const get = (color, field) => {
      const raw = headers.get(`${color}${field}`);
      return raw == "?" || raw == "" ? void 0 : raw;
    };
    const makePlayer = (color) => {
      const name = get(color, "");
      return {
        name,
        title: get(color, "title"),
        rating: parseInt(get(color, "elo") || "") || void 0,
        isLichessUser: metadata.isLichess && !!(name === null || name === void 0 ? void 0 : name.match(/^[a-z0-9][a-z0-9_-]{0,28}[a-z0-9]$/i))
      };
    };
    return {
      white: makePlayer("white"),
      black: makePlayer("black")
    };
  }
  function makeMetadata(headers, lichess) {
    var _a;
    const site = headers.get("chapterurl") || headers.get("gameurl") || headers.get("source") || headers.get("site");
    const tcs = (_a = headers.get("timecontrol")) === null || _a === void 0 ? void 0 : _a.split("+").map((x) => parseInt(x));
    const timeControl = tcs && tcs[0] ? {
      initial: tcs[0],
      increment: tcs[1] || 0
    } : void 0;
    const orientation = headers.get("orientation");
    return {
      externalLink: site && site.match(/^https?:\/\//) ? site : void 0,
      isLichess: !!(lichess && (site === null || site === void 0 ? void 0 : site.startsWith(lichess))),
      timeControl,
      orientation: orientation === "white" || orientation === "black" ? orientation : void 0,
      result: headers.get("result")
    };
  }
  var State, parseComments, makeGame, makeMoves, makeClocks;
  var init_pgn2 = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/pgn.js"() {
      init_esm();
      init_compat();
      init_fen2();
      init_pgn();
      init_san();
      init_game();
      init_path();
      State = class _State {
        constructor(pos, path, clocks) {
          this.pos = pos;
          this.path = path;
          this.clocks = clocks;
          this.clone = () => new _State(this.pos.clone(), this.path, { ...this.clocks });
        }
      };
      parseComments = (strings) => {
        const comments = strings.map(parseComment);
        const reduceTimes = (times) => times.reduce((last, time) => typeof time == void 0 ? last : time, void 0);
        return {
          texts: comments.map((c) => c.text).filter((t2) => !!t2),
          shapes: comments.flatMap((c) => c.shapes),
          clock: reduceTimes(comments.map((c) => c.clock)),
          emt: reduceTimes(comments.map((c) => c.emt))
        };
      };
      makeGame = (pgn2, lichess = false) => {
        var _a, _b;
        const game = parsePgn(pgn2)[0] || parsePgn("*")[0];
        const start5 = startingPosition(game.headers).unwrap();
        const fen = makeFen(start5.toSetup());
        const comments = parseComments(game.comments || []);
        const headers = new Map(Array.from(game.headers, ([key, value]) => [key.toLowerCase(), value]));
        const metadata = makeMetadata(headers, lichess);
        const initial2 = {
          fen,
          turn: start5.turn,
          check: start5.isCheck(),
          pos: start5.clone(),
          comments: comments.texts,
          shapes: comments.shapes,
          clocks: {
            white: ((_a = metadata.timeControl) === null || _a === void 0 ? void 0 : _a.initial) || comments.clock,
            black: ((_b = metadata.timeControl) === null || _b === void 0 ? void 0 : _b.initial) || comments.clock
          }
        };
        const moves = makeMoves(start5, game.moves, metadata);
        const players = makePlayers(headers, metadata);
        return new Game(initial2, moves, players, metadata);
      };
      makeMoves = (start5, moves, metadata) => transform(moves, new State(start5, Path.root, {}), (state, node2, _index) => {
        const move3 = parseSan(state.pos, node2.san);
        if (!move3)
          return void 0;
        const moveId = scalachessCharPair(move3);
        const path = state.path.append(moveId);
        const san = makeSanAndPlay(state.pos, move3);
        state.path = path;
        const setup = state.pos.toSetup();
        const comments = parseComments(node2.comments || []);
        const startingComments = parseComments(node2.startingComments || []);
        const shapes = [...comments.shapes, ...startingComments.shapes];
        const ply = (setup.fullmoves - 1) * 2 + (state.pos.turn === "white" ? 0 : 1);
        let clocks = state.clocks = makeClocks(state.clocks, state.pos.turn, comments.clock);
        if (ply < 2 && metadata.timeControl)
          clocks = {
            white: metadata.timeControl.initial,
            black: metadata.timeControl.initial,
            ...clocks
          };
        const moveNode = {
          path,
          ply,
          move: move3,
          san,
          uci: makeUci(move3),
          fen: makeFen(state.pos.toSetup()),
          turn: state.pos.turn,
          check: state.pos.isCheck(),
          comments: comments.texts,
          startingComments: startingComments.texts,
          nags: node2.nags || [],
          shapes,
          clocks,
          emt: comments.emt
        };
        return moveNode;
      });
      makeClocks = (prev, turn, clk) => turn == "white" ? { ...prev, black: clk } : { ...prev, white: clk };
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/pgnViewer.js
  var PgnViewer;
  var init_pgnViewer = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/pgnViewer.js"() {
      init_esm();
      init_translation();
      init_util();
      init_path();
      init_game();
      init_pgn2();
      PgnViewer = class {
        constructor(opts, redraw) {
          this.opts = opts;
          this.redraw = redraw;
          this.flipped = false;
          this.pane = "board";
          this.autoScrollRequested = false;
          this.curNode = () => this.game.nodeAt(this.path) || this.game.moves;
          this.curData = () => this.game.dataAt(this.path) || this.game.initial;
          this.goTo = (to, focus = true) => {
            var _a, _b;
            const path = to == "first" ? Path.root : to == "prev" ? this.path.init() : to == "next" ? (_b = (_a = this.game.nodeAt(this.path)) === null || _a === void 0 ? void 0 : _a.children[0]) === null || _b === void 0 ? void 0 : _b.data.path : this.game.pathAtMainlinePly("last");
            this.toPath(path || this.path, focus);
          };
          this.canGoTo = (to) => to == "prev" || to == "first" ? !this.path.empty() : !!this.curNode().children[0];
          this.toPath = (path, focus = true) => {
            this.path = path;
            this.pane = "board";
            this.autoScrollRequested = true;
            this.redrawGround();
            this.redraw();
            if (focus)
              this.focus();
          };
          this.focus = () => {
            var _a;
            return (_a = this.div) === null || _a === void 0 ? void 0 : _a.focus();
          };
          this.toggleMenu = () => {
            this.pane = this.pane == "board" ? "menu" : "board";
            this.redraw();
          };
          this.togglePgn = () => {
            this.pane = this.pane == "pgn" ? "board" : "pgn";
            this.redraw();
          };
          this.orientation = () => {
            const base = this.opts.orientation || "white";
            return this.flipped ? opposite2(base) : base;
          };
          this.flip = () => {
            this.flipped = !this.flipped;
            this.pane = "board";
            this.redrawGround();
            this.redraw();
          };
          this.cgState = () => {
            var _a;
            const data = this.curData();
            const lastMove = isMoveData(data) ? uciToMove(data.uci) : (_a = this.opts.chessground) === null || _a === void 0 ? void 0 : _a.lastMove;
            return {
              fen: data.fen,
              orientation: this.orientation(),
              check: data.check,
              lastMove,
              turnColor: data.turn
            };
          };
          this.analysisUrl = () => this.game.metadata.isLichess && this.game.metadata.externalLink || `https://lichess.org/analysis/${this.curData().fen.replace(" ", "_")}?color=${this.orientation()}`;
          this.practiceUrl = () => `${this.analysisUrl()}#practice`;
          this.setGround = (cg) => {
            this.ground = cg;
            this.redrawGround();
          };
          this.redrawGround = () => this.withGround((g) => {
            g.set(this.cgState());
            g.setShapes(this.curData().shapes.map((s) => ({
              orig: makeSquare(s.from),
              dest: makeSquare(s.to),
              brush: s.color
            })));
          });
          this.withGround = (f) => this.ground && f(this.ground);
          this.game = makeGame(opts.pgn, opts.lichess);
          opts.orientation = opts.orientation || this.game.metadata.orientation;
          this.translate = translate2(opts.translate);
          this.path = this.game.pathAtMainlinePly(opts.initialPly);
        }
      };
    }
  });

  // node_modules/snabbdom/build/htmldomapi.js
  function createElement2(tagName2, options) {
    return document.createElement(tagName2, options);
  }
  function createElementNS(namespaceURI, qualifiedName, options) {
    return document.createElementNS(namespaceURI, qualifiedName, options);
  }
  function createDocumentFragment() {
    return parseFragment(document.createDocumentFragment());
  }
  function createTextNode(text) {
    return document.createTextNode(text);
  }
  function createComment(text) {
    return document.createComment(text);
  }
  function insertBefore(parentNode2, newNode, referenceNode) {
    if (isDocumentFragment(parentNode2)) {
      let node2 = parentNode2;
      while (node2 && isDocumentFragment(node2)) {
        const fragment2 = parseFragment(node2);
        node2 = fragment2.parent;
      }
      parentNode2 = node2 !== null && node2 !== void 0 ? node2 : parentNode2;
    }
    if (isDocumentFragment(newNode)) {
      newNode = parseFragment(newNode, parentNode2);
    }
    if (referenceNode && isDocumentFragment(referenceNode)) {
      referenceNode = parseFragment(referenceNode).firstChildNode;
    }
    parentNode2.insertBefore(newNode, referenceNode);
  }
  function removeChild(node2, child) {
    node2.removeChild(child);
  }
  function appendChild(node2, child) {
    if (isDocumentFragment(child)) {
      child = parseFragment(child, node2);
    }
    node2.appendChild(child);
  }
  function parentNode(node2) {
    if (isDocumentFragment(node2)) {
      while (node2 && isDocumentFragment(node2)) {
        const fragment2 = parseFragment(node2);
        node2 = fragment2.parent;
      }
      return node2 !== null && node2 !== void 0 ? node2 : null;
    }
    return node2.parentNode;
  }
  function nextSibling(node2) {
    var _a;
    if (isDocumentFragment(node2)) {
      const fragment2 = parseFragment(node2);
      const parent = parentNode(fragment2);
      if (parent && fragment2.lastChildNode) {
        const children = Array.from(parent.childNodes);
        const index = children.indexOf(fragment2.lastChildNode);
        return (_a = children[index + 1]) !== null && _a !== void 0 ? _a : null;
      }
      return null;
    }
    return node2.nextSibling;
  }
  function tagName(elm) {
    return elm.tagName;
  }
  function setTextContent(node2, text) {
    node2.textContent = text;
  }
  function getTextContent(node2) {
    return node2.textContent;
  }
  function isElement(node2) {
    return node2.nodeType === 1;
  }
  function isText(node2) {
    return node2.nodeType === 3;
  }
  function isComment(node2) {
    return node2.nodeType === 8;
  }
  function isDocumentFragment(node2) {
    return node2.nodeType === 11;
  }
  function parseFragment(fragmentNode, parentNode2) {
    var _a, _b, _c;
    const fragment2 = fragmentNode;
    (_a = fragment2.parent) !== null && _a !== void 0 ? _a : fragment2.parent = parentNode2 !== null && parentNode2 !== void 0 ? parentNode2 : null;
    (_b = fragment2.firstChildNode) !== null && _b !== void 0 ? _b : fragment2.firstChildNode = fragmentNode.firstChild;
    (_c = fragment2.lastChildNode) !== null && _c !== void 0 ? _c : fragment2.lastChildNode = fragmentNode.lastChild;
    return fragment2;
  }
  var htmlDomApi;
  var init_htmldomapi = __esm({
    "node_modules/snabbdom/build/htmldomapi.js"() {
      htmlDomApi = {
        createElement: createElement2,
        createElementNS,
        createTextNode,
        createDocumentFragment,
        createComment,
        insertBefore,
        removeChild,
        appendChild,
        parentNode,
        nextSibling,
        tagName,
        setTextContent,
        getTextContent,
        isElement,
        isText,
        isComment,
        isDocumentFragment
      };
    }
  });

  // node_modules/snabbdom/build/vnode.js
  function vnode(sel, data, children, text, elm) {
    const key = data === void 0 ? void 0 : data.key;
    return { sel, data, children, text, elm, key };
  }
  var init_vnode = __esm({
    "node_modules/snabbdom/build/vnode.js"() {
    }
  });

  // node_modules/snabbdom/build/is.js
  function primitive(s) {
    return typeof s === "string" || typeof s === "number" || s instanceof String || s instanceof Number;
  }
  var array;
  var init_is = __esm({
    "node_modules/snabbdom/build/is.js"() {
      array = Array.isArray;
    }
  });

  // node_modules/snabbdom/build/init.js
  function isUndef(s) {
    return s === void 0;
  }
  function isDef(s) {
    return s !== void 0;
  }
  function sameVnode(vnode1, vnode2) {
    var _a, _b;
    const isSameKey = vnode1.key === vnode2.key;
    const isSameIs = ((_a = vnode1.data) === null || _a === void 0 ? void 0 : _a.is) === ((_b = vnode2.data) === null || _b === void 0 ? void 0 : _b.is);
    const isSameSel = vnode1.sel === vnode2.sel;
    const isSameTextOrFragment = !vnode1.sel && vnode1.sel === vnode2.sel ? typeof vnode1.text === typeof vnode2.text : true;
    return isSameSel && isSameKey && isSameIs && isSameTextOrFragment;
  }
  function documentFragmentIsNotSupported() {
    throw new Error("The document fragment is not supported on this platform.");
  }
  function isElement2(api, vnode2) {
    return api.isElement(vnode2);
  }
  function isDocumentFragment2(api, vnode2) {
    return api.isDocumentFragment(vnode2);
  }
  function createKeyToOldIdx(children, beginIdx, endIdx) {
    var _a;
    const map = {};
    for (let i = beginIdx; i <= endIdx; ++i) {
      const key = (_a = children[i]) === null || _a === void 0 ? void 0 : _a.key;
      if (key !== void 0) {
        map[key] = i;
      }
    }
    return map;
  }
  function init(modules, domApi, options) {
    const cbs = {
      create: [],
      update: [],
      remove: [],
      destroy: [],
      pre: [],
      post: []
    };
    const api = domApi !== void 0 ? domApi : htmlDomApi;
    for (const hook of hooks) {
      for (const module of modules) {
        const currentHook = module[hook];
        if (currentHook !== void 0) {
          cbs[hook].push(currentHook);
        }
      }
    }
    function emptyNodeAt(elm) {
      const id = elm.id ? "#" + elm.id : "";
      const classes = elm.getAttribute("class");
      const c = classes ? "." + classes.split(" ").join(".") : "";
      return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], void 0, elm);
    }
    function emptyDocumentFragmentAt(frag) {
      return vnode(void 0, {}, [], void 0, frag);
    }
    function createRmCb(childElm, listeners) {
      return function rmCb() {
        if (--listeners === 0) {
          const parent = api.parentNode(childElm);
          if (parent !== null) {
            api.removeChild(parent, childElm);
          }
        }
      };
    }
    function createElm(vnode2, insertedVnodeQueue) {
      var _a, _b, _c, _d;
      let i;
      let data = vnode2.data;
      if (data !== void 0) {
        const init2 = (_a = data.hook) === null || _a === void 0 ? void 0 : _a.init;
        if (isDef(init2)) {
          init2(vnode2);
          data = vnode2.data;
        }
      }
      const children = vnode2.children;
      const sel = vnode2.sel;
      if (sel === "!") {
        if (isUndef(vnode2.text)) {
          vnode2.text = "";
        }
        vnode2.elm = api.createComment(vnode2.text);
      } else if (sel === "") {
        vnode2.elm = api.createTextNode(vnode2.text);
      } else if (sel !== void 0) {
        const hashIdx = sel.indexOf("#");
        const dotIdx = sel.indexOf(".", hashIdx);
        const hash2 = hashIdx > 0 ? hashIdx : sel.length;
        const dot = dotIdx > 0 ? dotIdx : sel.length;
        const tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash2, dot)) : sel;
        const elm = vnode2.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag, data) : api.createElement(tag, data);
        if (hash2 < dot)
          elm.setAttribute("id", sel.slice(hash2 + 1, dot));
        if (dotIdx > 0)
          elm.setAttribute("class", sel.slice(dot + 1).replace(/\./g, " "));
        for (i = 0; i < cbs.create.length; ++i)
          cbs.create[i](emptyNode, vnode2);
        if (primitive(vnode2.text) && (!array(children) || children.length === 0)) {
          api.appendChild(elm, api.createTextNode(vnode2.text));
        }
        if (array(children)) {
          for (i = 0; i < children.length; ++i) {
            const ch = children[i];
            if (ch != null) {
              api.appendChild(elm, createElm(ch, insertedVnodeQueue));
            }
          }
        }
        const hook = vnode2.data.hook;
        if (isDef(hook)) {
          (_b = hook.create) === null || _b === void 0 ? void 0 : _b.call(hook, emptyNode, vnode2);
          if (hook.insert) {
            insertedVnodeQueue.push(vnode2);
          }
        }
      } else if (((_c = options === null || options === void 0 ? void 0 : options.experimental) === null || _c === void 0 ? void 0 : _c.fragments) && vnode2.children) {
        vnode2.elm = ((_d = api.createDocumentFragment) !== null && _d !== void 0 ? _d : documentFragmentIsNotSupported)();
        for (i = 0; i < cbs.create.length; ++i)
          cbs.create[i](emptyNode, vnode2);
        for (i = 0; i < vnode2.children.length; ++i) {
          const ch = vnode2.children[i];
          if (ch != null) {
            api.appendChild(vnode2.elm, createElm(ch, insertedVnodeQueue));
          }
        }
      } else {
        vnode2.elm = api.createTextNode(vnode2.text);
      }
      return vnode2.elm;
    }
    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx];
        if (ch != null) {
          api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
        }
      }
    }
    function invokeDestroyHook(vnode2) {
      var _a, _b;
      const data = vnode2.data;
      if (data !== void 0) {
        (_b = (_a = data === null || data === void 0 ? void 0 : data.hook) === null || _a === void 0 ? void 0 : _a.destroy) === null || _b === void 0 ? void 0 : _b.call(_a, vnode2);
        for (let i = 0; i < cbs.destroy.length; ++i)
          cbs.destroy[i](vnode2);
        if (vnode2.children !== void 0) {
          for (let j = 0; j < vnode2.children.length; ++j) {
            const child = vnode2.children[j];
            if (child != null && typeof child !== "string") {
              invokeDestroyHook(child);
            }
          }
        }
      }
    }
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
      var _a, _b;
      for (; startIdx <= endIdx; ++startIdx) {
        let listeners;
        let rm;
        const ch = vnodes[startIdx];
        if (ch != null) {
          if (isDef(ch.sel)) {
            invokeDestroyHook(ch);
            listeners = cbs.remove.length + 1;
            rm = createRmCb(ch.elm, listeners);
            for (let i = 0; i < cbs.remove.length; ++i)
              cbs.remove[i](ch, rm);
            const removeHook = (_b = (_a = ch === null || ch === void 0 ? void 0 : ch.data) === null || _a === void 0 ? void 0 : _a.hook) === null || _b === void 0 ? void 0 : _b.remove;
            if (isDef(removeHook)) {
              removeHook(ch, rm);
            } else {
              rm();
            }
          } else if (ch.children) {
            invokeDestroyHook(ch);
            removeVnodes(parentElm, ch.children, 0, ch.children.length - 1);
          } else {
            api.removeChild(parentElm, ch.elm);
          }
        }
      }
    }
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
      let oldStartIdx = 0;
      let newStartIdx = 0;
      let oldEndIdx = oldCh.length - 1;
      let oldStartVnode = oldCh[0];
      let oldEndVnode = oldCh[oldEndIdx];
      let newEndIdx = newCh.length - 1;
      let newStartVnode = newCh[0];
      let newEndVnode = newCh[newEndIdx];
      let oldKeyToIdx;
      let idxInOld;
      let elmToMove;
      let before;
      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (oldStartVnode == null) {
          oldStartVnode = oldCh[++oldStartIdx];
        } else if (oldEndVnode == null) {
          oldEndVnode = oldCh[--oldEndIdx];
        } else if (newStartVnode == null) {
          newStartVnode = newCh[++newStartIdx];
        } else if (newEndVnode == null) {
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
          oldStartVnode = oldCh[++oldStartIdx];
          newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
          patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
          oldEndVnode = oldCh[--oldEndIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) {
          patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
          api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
          oldStartVnode = oldCh[++oldStartIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) {
          patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
          api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
          oldEndVnode = oldCh[--oldEndIdx];
          newStartVnode = newCh[++newStartIdx];
        } else {
          if (oldKeyToIdx === void 0) {
            oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
          }
          idxInOld = oldKeyToIdx[newStartVnode.key];
          if (isUndef(idxInOld)) {
            api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          } else if (isUndef(oldKeyToIdx[newEndVnode.key])) {
            api.insertBefore(parentElm, createElm(newEndVnode, insertedVnodeQueue), api.nextSibling(oldEndVnode.elm));
            newEndVnode = newCh[--newEndIdx];
          } else {
            elmToMove = oldCh[idxInOld];
            if (elmToMove.sel !== newStartVnode.sel) {
              api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
            } else {
              patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
              oldCh[idxInOld] = void 0;
              api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
            }
            newStartVnode = newCh[++newStartIdx];
          }
        }
      }
      if (newStartIdx <= newEndIdx) {
        before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      }
      if (oldStartIdx <= oldEndIdx) {
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
      }
    }
    function patchVnode(oldVnode, vnode2, insertedVnodeQueue) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const hook = (_a = vnode2.data) === null || _a === void 0 ? void 0 : _a.hook;
      (_b = hook === null || hook === void 0 ? void 0 : hook.prepatch) === null || _b === void 0 ? void 0 : _b.call(hook, oldVnode, vnode2);
      const elm = vnode2.elm = oldVnode.elm;
      if (oldVnode === vnode2)
        return;
      if (vnode2.data !== void 0 || isDef(vnode2.text) && vnode2.text !== oldVnode.text) {
        (_c = vnode2.data) !== null && _c !== void 0 ? _c : vnode2.data = {};
        (_d = oldVnode.data) !== null && _d !== void 0 ? _d : oldVnode.data = {};
        for (let i = 0; i < cbs.update.length; ++i)
          cbs.update[i](oldVnode, vnode2);
        (_g = (_f = (_e = vnode2.data) === null || _e === void 0 ? void 0 : _e.hook) === null || _f === void 0 ? void 0 : _f.update) === null || _g === void 0 ? void 0 : _g.call(_f, oldVnode, vnode2);
      }
      const oldCh = oldVnode.children;
      const ch = vnode2.children;
      if (isUndef(vnode2.text)) {
        if (isDef(oldCh) && isDef(ch)) {
          if (oldCh !== ch)
            updateChildren(elm, oldCh, ch, insertedVnodeQueue);
        } else if (isDef(ch)) {
          if (isDef(oldVnode.text))
            api.setTextContent(elm, "");
          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        } else if (isDef(oldCh)) {
          removeVnodes(elm, oldCh, 0, oldCh.length - 1);
        } else if (isDef(oldVnode.text)) {
          api.setTextContent(elm, "");
        }
      } else if (oldVnode.text !== vnode2.text) {
        if (isDef(oldCh)) {
          removeVnodes(elm, oldCh, 0, oldCh.length - 1);
        }
        api.setTextContent(elm, vnode2.text);
      }
      (_h = hook === null || hook === void 0 ? void 0 : hook.postpatch) === null || _h === void 0 ? void 0 : _h.call(hook, oldVnode, vnode2);
    }
    return function patch(oldVnode, vnode2) {
      let i, elm, parent;
      const insertedVnodeQueue = [];
      for (i = 0; i < cbs.pre.length; ++i)
        cbs.pre[i]();
      if (isElement2(api, oldVnode)) {
        oldVnode = emptyNodeAt(oldVnode);
      } else if (isDocumentFragment2(api, oldVnode)) {
        oldVnode = emptyDocumentFragmentAt(oldVnode);
      }
      if (sameVnode(oldVnode, vnode2)) {
        patchVnode(oldVnode, vnode2, insertedVnodeQueue);
      } else {
        elm = oldVnode.elm;
        parent = api.parentNode(elm);
        createElm(vnode2, insertedVnodeQueue);
        if (parent !== null) {
          api.insertBefore(parent, vnode2.elm, api.nextSibling(elm));
          removeVnodes(parent, [oldVnode], 0, 0);
        }
      }
      for (i = 0; i < insertedVnodeQueue.length; ++i) {
        insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
      }
      for (i = 0; i < cbs.post.length; ++i)
        cbs.post[i]();
      return vnode2;
    };
  }
  var emptyNode, hooks;
  var init_init = __esm({
    "node_modules/snabbdom/build/init.js"() {
      init_vnode();
      init_is();
      init_htmldomapi();
      emptyNode = vnode("", {}, [], void 0, void 0);
      hooks = [
        "create",
        "update",
        "remove",
        "destroy",
        "pre",
        "post"
      ];
    }
  });

  // node_modules/snabbdom/build/h.js
  function addNS(data, children, sel) {
    data.ns = "http://www.w3.org/2000/svg";
    if (sel !== "foreignObject" && children !== void 0) {
      for (let i = 0; i < children.length; ++i) {
        const child = children[i];
        if (typeof child === "string")
          continue;
        const childData = child.data;
        if (childData !== void 0) {
          addNS(childData, child.children, child.sel);
        }
      }
    }
  }
  function h(sel, b, c) {
    let data = {};
    let children;
    let text;
    let i;
    if (c !== void 0) {
      if (b !== null) {
        data = b;
      }
      if (array(c)) {
        children = c;
      } else if (primitive(c)) {
        text = c.toString();
      } else if (c && c.sel) {
        children = [c];
      }
    } else if (b !== void 0 && b !== null) {
      if (array(b)) {
        children = b;
      } else if (primitive(b)) {
        text = b.toString();
      } else if (b && b.sel) {
        children = [b];
      } else {
        data = b;
      }
    }
    if (children !== void 0) {
      for (i = 0; i < children.length; ++i) {
        if (primitive(children[i]))
          children[i] = vnode(void 0, void 0, void 0, children[i], void 0);
      }
    }
    if (sel.startsWith("svg") && (sel.length === 3 || sel[3] === "." || sel[3] === "#")) {
      addNS(data, children, sel);
    }
    return vnode(sel, data, children, text, void 0);
  }
  var init_h = __esm({
    "node_modules/snabbdom/build/h.js"() {
      init_vnode();
      init_is();
    }
  });

  // node_modules/snabbdom/build/hooks.js
  var init_hooks = __esm({
    "node_modules/snabbdom/build/hooks.js"() {
    }
  });

  // node_modules/snabbdom/build/modules/attributes.js
  function updateAttrs(oldVnode, vnode2) {
    let key;
    const elm = vnode2.elm;
    let oldAttrs = oldVnode.data.attrs;
    let attrs = vnode2.data.attrs;
    if (!oldAttrs && !attrs)
      return;
    if (oldAttrs === attrs)
      return;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};
    for (key in attrs) {
      const cur = attrs[key];
      const old = oldAttrs[key];
      if (old !== cur) {
        if (cur === true) {
          elm.setAttribute(key, "");
        } else if (cur === false) {
          elm.removeAttribute(key);
        } else {
          if (key.charCodeAt(0) !== xChar) {
            elm.setAttribute(key, cur);
          } else if (key.charCodeAt(3) === colonChar) {
            elm.setAttributeNS(xmlNS, key, cur);
          } else if (key.charCodeAt(5) === colonChar) {
            key.charCodeAt(1) === mChar ? elm.setAttributeNS(xmlnsNS, key, cur) : elm.setAttributeNS(xlinkNS, key, cur);
          } else {
            elm.setAttribute(key, cur);
          }
        }
      }
    }
    for (key in oldAttrs) {
      if (!(key in attrs)) {
        elm.removeAttribute(key);
      }
    }
  }
  var xlinkNS, xmlnsNS, xmlNS, colonChar, xChar, mChar, attributesModule;
  var init_attributes = __esm({
    "node_modules/snabbdom/build/modules/attributes.js"() {
      xlinkNS = "http://www.w3.org/1999/xlink";
      xmlnsNS = "http://www.w3.org/2000/xmlns/";
      xmlNS = "http://www.w3.org/XML/1998/namespace";
      colonChar = 58;
      xChar = 120;
      mChar = 109;
      attributesModule = {
        create: updateAttrs,
        update: updateAttrs
      };
    }
  });

  // node_modules/snabbdom/build/modules/class.js
  function updateClass(oldVnode, vnode2) {
    let cur;
    let name;
    const elm = vnode2.elm;
    let oldClass = oldVnode.data.class;
    let klass = vnode2.data.class;
    if (!oldClass && !klass)
      return;
    if (oldClass === klass)
      return;
    oldClass = oldClass || {};
    klass = klass || {};
    for (name in oldClass) {
      if (oldClass[name] && !Object.prototype.hasOwnProperty.call(klass, name)) {
        elm.classList.remove(name);
      }
    }
    for (name in klass) {
      cur = klass[name];
      if (cur !== oldClass[name]) {
        elm.classList[cur ? "add" : "remove"](name);
      }
    }
  }
  var classModule;
  var init_class = __esm({
    "node_modules/snabbdom/build/modules/class.js"() {
      classModule = { create: updateClass, update: updateClass };
    }
  });

  // node_modules/snabbdom/build/index.js
  var init_build = __esm({
    "node_modules/snabbdom/build/index.js"() {
      init_init();
      init_h();
      init_hooks();
      init_attributes();
      init_class();
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/view/util.js
  function bindMobileMousedown(el, f, redraw) {
    for (const mousedownEvent of ["touchstart", "mousedown"]) {
      el.addEventListener(mousedownEvent, (e2) => {
        f(e2);
        e2.preventDefault();
        if (redraw)
          redraw();
      }, { passive: false });
    }
  }
  function onInsert(f) {
    return {
      insert: (vnode2) => f(vnode2.elm)
    };
  }
  var bind;
  var init_util3 = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/view/util.js"() {
      bind = (eventName, f, redraw, passive = true) => onInsert((el) => el.addEventListener(eventName, (e2) => {
        const res = f(e2);
        if (res === false)
          e2.preventDefault();
        redraw === null || redraw === void 0 ? void 0 : redraw();
        return res;
      }, { passive }));
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/events.js
  function stepwiseScroll(inner) {
    let scrollTotal = 0;
    return (e2) => {
      scrollTotal += e2.deltaY * (e2.deltaMode ? 40 : 1);
      if (Math.abs(scrollTotal) >= 4) {
        inner(e2, true);
        scrollTotal = 0;
      } else {
        inner(e2, false);
      }
    };
  }
  function eventRepeater(action, e2) {
    const repeat = () => {
      action();
      delay = Math.max(100, delay - delay / 15);
      timeout = setTimeout(repeat, delay);
    };
    let delay = 350;
    let timeout = setTimeout(repeat, 500);
    action();
    const eventName = e2.type == "touchstart" ? "touchend" : "mouseup";
    document.addEventListener(eventName, () => clearTimeout(timeout), { once: true });
  }
  var suppressKeyNavOn, onKeyDown;
  var init_events2 = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/events.js"() {
      suppressKeyNavOn = (e2) => e2.altKey || e2.ctrlKey || e2.shiftKey || e2.metaKey || document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;
      onKeyDown = (ctrl) => (e2) => {
        if (suppressKeyNavOn(e2))
          return;
        else if (e2.key == "ArrowLeft")
          ctrl.goTo("prev");
        else if (e2.key == "ArrowRight")
          ctrl.goTo("next");
        else if (e2.key == "f")
          ctrl.flip();
      };
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/view/menu.js
  var renderMenu, renderExternalLink, renderControls, dirButton;
  var init_menu = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/view/menu.js"() {
      init_build();
      init_util3();
      init_events2();
      renderMenu = (ctrl) => {
        var _a, _b;
        return h("div.lpv__menu.lpv__pane", [
          h("button.lpv__menu__entry.lpv__menu__flip.lpv__fbt", {
            hook: bind("click", ctrl.flip)
          }, ctrl.translate("flipTheBoard")),
          ((_a = ctrl.opts.menu.analysisBoard) === null || _a === void 0 ? void 0 : _a.enabled) ? h("a.lpv__menu__entry.lpv__menu__analysis.lpv__fbt", {
            attrs: {
              href: ctrl.analysisUrl(),
              target: "_blank"
            }
          }, ctrl.translate("analysisBoard")) : void 0,
          ((_b = ctrl.opts.menu.practiceWithComputer) === null || _b === void 0 ? void 0 : _b.enabled) ? h("a.lpv__menu__entry.lpv__menu__practice.lpv__fbt", {
            attrs: {
              href: ctrl.practiceUrl(),
              target: "_blank"
            }
          }, ctrl.translate("practiceWithComputer")) : void 0,
          ctrl.opts.menu.getPgn.enabled ? h("button.lpv__menu__entry.lpv__menu__pgn.lpv__fbt", {
            hook: bind("click", ctrl.togglePgn)
          }, ctrl.translate("getPgn")) : void 0,
          renderExternalLink(ctrl)
        ]);
      };
      renderExternalLink = (ctrl) => {
        const link = ctrl.game.metadata.externalLink;
        return link && h("a.lpv__menu__entry.lpv__fbt", {
          attrs: {
            href: link,
            target: "_blank"
          }
        }, ctrl.translate(ctrl.game.metadata.isLichess ? "viewOnLichess" : "viewOnSite"));
      };
      renderControls = (ctrl) => h("div.lpv__controls", [
        ctrl.pane == "board" ? void 0 : dirButton(ctrl, "first", "step-backward"),
        dirButton(ctrl, "prev", "left-open"),
        h("button.lpv__fbt.lpv__controls__menu.lpv__icon", {
          class: {
            active: ctrl.pane != "board",
            "lpv__icon-ellipsis-vert": ctrl.pane == "board"
          },
          hook: bind("click", ctrl.toggleMenu)
        }, ctrl.pane == "board" ? void 0 : "X"),
        dirButton(ctrl, "next", "right-open"),
        ctrl.pane == "board" ? void 0 : dirButton(ctrl, "last", "step-forward")
      ]);
      dirButton = (ctrl, to, icon) => h(`button.lpv__controls__goto.lpv__controls__goto--${to}.lpv__fbt.lpv__icon.lpv__icon-${icon}`, {
        class: { disabled: ctrl.pane == "board" && !ctrl.canGoTo(to) },
        hook: onInsert((el) => bindMobileMousedown(el, (e2) => eventRepeater(() => ctrl.goTo(to), e2)))
      });
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/view/glyph.js
  var renderNag, glyphs;
  var init_glyph = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/view/glyph.js"() {
      init_build();
      renderNag = (nag) => {
        const glyph = glyphs[nag];
        return glyph ? h("nag", { attrs: { title: glyph.name } }, glyph.symbol) : void 0;
      };
      glyphs = {
        1: {
          symbol: "!",
          name: "Good move"
        },
        2: {
          symbol: "?",
          name: "Mistake"
        },
        3: {
          symbol: "!!",
          name: "Brilliant move"
        },
        4: {
          symbol: "??",
          name: "Blunder"
        },
        5: {
          symbol: "!?",
          name: "Interesting move"
        },
        6: {
          symbol: "?!",
          name: "Dubious move"
        },
        7: {
          symbol: "\u25A1",
          name: "Only move"
        },
        22: {
          symbol: "\u2A00",
          name: "Zugzwang"
        },
        10: {
          symbol: "=",
          name: "Equal position"
        },
        13: {
          symbol: "\u221E",
          name: "Unclear position"
        },
        14: {
          symbol: "\u2A72",
          name: "White is slightly better"
        },
        15: {
          symbol: "\u2A71",
          name: "Black is slightly better"
        },
        16: {
          symbol: "\xB1",
          name: "White is better"
        },
        17: {
          symbol: "\u2213",
          name: "Black is better"
        },
        18: {
          symbol: "+\u2212",
          name: "White is winning"
        },
        19: {
          symbol: "-+",
          name: "Black is winning"
        },
        146: {
          symbol: "N",
          name: "Novelty"
        },
        32: {
          symbol: "\u2191\u2191",
          name: "Development"
        },
        36: {
          symbol: "\u2191",
          name: "Initiative"
        },
        40: {
          symbol: "\u2192",
          name: "Attack"
        },
        132: {
          symbol: "\u21C6",
          name: "Counterplay"
        },
        138: {
          symbol: "\u2295",
          name: "Time trouble"
        },
        44: {
          symbol: "=\u221E",
          name: "With compensation"
        },
        140: {
          symbol: "\u2206",
          name: "With the idea"
        }
      };
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/view/side.js
  var renderMoves, renderResultComment, emptyMove, indexNode, commentNode, parenOpen, parenClose, moveTurn, makeMoveNodes, makeMainVariation, makeVariationMoves, renderMove, autoScroll;
  var init_side = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/view/side.js"() {
      init_build();
      init_path();
      init_glyph();
      renderMoves = (ctrl) => h("div.lpv__side", [
        h("div.lpv__moves", {
          hook: {
            insert: (vnode2) => {
              const el = vnode2.elm;
              if (!ctrl.path.empty())
                autoScroll(ctrl, el);
              el.addEventListener("mousedown", (e2) => {
                const path = e2.target.getAttribute("p");
                if (path)
                  ctrl.toPath(new Path(path));
              }, { passive: true });
            },
            postpatch: (_, vnode2) => {
              if (ctrl.autoScrollRequested) {
                autoScroll(ctrl, vnode2.elm);
                ctrl.autoScrollRequested = false;
              }
            }
          }
        }, [...ctrl.game.initial.comments.map(commentNode), ...makeMoveNodes(ctrl), ...renderResultComment(ctrl)])
      ]);
      renderResultComment = (ctrl) => {
        const res = ctrl.game.metadata.result;
        return res && res != "*" ? [h("comment.result", ctrl.game.metadata.result)] : [];
      };
      emptyMove = () => h("move.empty", "...");
      indexNode = (turn) => h("index", `${turn}.`);
      commentNode = (comment) => h("comment", comment);
      parenOpen = () => h("paren.open", "(");
      parenClose = () => h("paren.close", ")");
      moveTurn = (move3) => Math.floor((move3.ply - 1) / 2) + 1;
      makeMoveNodes = (ctrl) => {
        const moveDom = renderMove(ctrl);
        const elms = [];
        let node2, variations = ctrl.game.moves.children.slice(1);
        if (ctrl.game.initial.pos.turn == "black" && ctrl.game.mainline[0])
          elms.push(indexNode(ctrl.game.initial.pos.fullmoves), emptyMove());
        while (node2 = (node2 || ctrl.game.moves).children[0]) {
          const move3 = node2.data;
          const oddMove = move3.ply % 2 == 1;
          if (oddMove)
            elms.push(indexNode(moveTurn(move3)));
          elms.push(moveDom(move3));
          const addEmptyMove = oddMove && (variations.length || move3.comments.length) && node2.children.length;
          if (addEmptyMove)
            elms.push(emptyMove());
          move3.comments.forEach((comment) => elms.push(commentNode(comment)));
          variations.forEach((variation) => elms.push(makeMainVariation(moveDom, variation)));
          if (addEmptyMove)
            elms.push(indexNode(moveTurn(move3)), emptyMove());
          variations = node2.children.slice(1);
        }
        return elms;
      };
      makeMainVariation = (moveDom, node2) => h("variation", [...node2.data.startingComments.map(commentNode), ...makeVariationMoves(moveDom, node2)]);
      makeVariationMoves = (moveDom, node2) => {
        let elms = [];
        let variations = [];
        if (node2.data.ply % 2 == 0)
          elms.push(h("index", [moveTurn(node2.data), "..."]));
        do {
          const move3 = node2.data;
          if (move3.ply % 2 == 1)
            elms.push(h("index", [moveTurn(move3), "."]));
          elms.push(moveDom(move3));
          move3.comments.forEach((comment) => elms.push(commentNode(comment)));
          variations.forEach((variation) => {
            elms = [...elms, parenOpen(), ...makeVariationMoves(moveDom, variation), parenClose()];
          });
          variations = node2.children.slice(1);
          node2 = node2.children[0];
        } while (node2);
        return elms;
      };
      renderMove = (ctrl) => (move3) => h("move", {
        class: {
          current: ctrl.path.equals(move3.path),
          ancestor: ctrl.path.contains(move3.path),
          good: move3.nags.includes(1),
          mistake: move3.nags.includes(2),
          brilliant: move3.nags.includes(3),
          blunder: move3.nags.includes(4),
          interesting: move3.nags.includes(5),
          inaccuracy: move3.nags.includes(6)
        },
        attrs: {
          p: move3.path.path
        }
      }, [move3.san, ...move3.nags.map(renderNag)]);
      autoScroll = (ctrl, cont) => {
        const target = cont.querySelector(".current");
        if (!target) {
          cont.scrollTop = ctrl.path.empty() ? 0 : 99999;
          return;
        }
        cont.scrollTop = target.offsetTop - cont.offsetHeight / 2 + target.offsetHeight;
      };
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/view/player.js
  function renderPlayer(ctrl, side) {
    const color = side == "bottom" ? ctrl.orientation() : opposite2(ctrl.orientation());
    const player = ctrl.game.players[color];
    const personEls = [
      player.title ? h("span.lpv__player__title", player.title) : void 0,
      h("span.lpv__player__name", player.name),
      player.rating ? h("span.lpv__player__rating", ["(", player.rating, ")"]) : void 0
    ];
    return h(`div.lpv__player.lpv__player--${side}`, [
      player.isLichessUser ? h("a.lpv__player__person.ulpt.user-link", { attrs: { href: `${ctrl.opts.lichess}/@/${player.name}` } }, personEls) : h("span.lpv__player__person", personEls),
      ctrl.opts.showClocks ? renderClock(ctrl, color) : void 0
    ]);
  }
  var renderClock, clockContent, pad2;
  var init_player = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/view/player.js"() {
      init_esm();
      init_build();
      renderClock = (ctrl, color) => {
        const move3 = ctrl.curData();
        const clock = move3.clocks && move3.clocks[color];
        return typeof clock == void 0 ? void 0 : h("div.lpv__player__clock", { class: { active: color == move3.turn } }, clockContent(clock));
      };
      clockContent = (seconds) => {
        if (!seconds && seconds !== 0)
          return ["-"];
        const date = new Date(seconds * 1e3), sep = ":", baseStr = pad2(date.getUTCMinutes()) + sep + pad2(date.getUTCSeconds());
        return seconds >= 3600 ? [Math.floor(seconds / 3600) + sep + baseStr] : [baseStr];
      };
      pad2 = (num) => (num < 10 ? "0" : "") + num;
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/view/main.js
  function view(ctrl) {
    const opts = ctrl.opts, staticClasses = `lpv.lpv--moves-${opts.showMoves}.lpv--controls-${opts.showControls}${opts.classes ? "." + opts.classes.replace(" ", ".") : ""}`;
    const showPlayers = opts.showPlayers == "auto" ? ctrl.game.hasPlayerName() : opts.showPlayers;
    return h(`div.${staticClasses}`, {
      class: {
        "lpv--menu": ctrl.pane != "board",
        "lpv--players": showPlayers
      },
      attrs: {
        tabindex: 0
      },
      hook: onInsert((el) => {
        ctrl.setGround(Chessground(el.querySelector(".cg-wrap"), makeConfig(ctrl, el)));
        if (opts.keyboardToMove)
          el.addEventListener("keydown", onKeyDown(ctrl));
      })
    }, [
      showPlayers ? renderPlayer(ctrl, "top") : void 0,
      renderBoard(ctrl),
      showPlayers ? renderPlayer(ctrl, "bottom") : void 0,
      opts.showControls ? renderControls(ctrl) : void 0,
      opts.showMoves ? renderMoves(ctrl) : void 0,
      ctrl.pane == "menu" ? renderMenu(ctrl) : ctrl.pane == "pgn" ? renderPgnPane(ctrl) : void 0
    ]);
  }
  var renderBoard, renderPgnPane, makeConfig;
  var init_main = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/view/main.js"() {
      init_chessground();
      init_build();
      init_util3();
      init_events2();
      init_menu();
      init_side();
      init_player();
      renderBoard = (ctrl) => h("div.lpv__board", {
        hook: onInsert((el) => {
          el.addEventListener("click", ctrl.focus);
          if (ctrl.opts.scrollToMove && !("ontouchstart" in window))
            el.addEventListener("wheel", stepwiseScroll((e2, scroll) => {
              e2.preventDefault();
              if (e2.deltaY > 0 && scroll)
                ctrl.goTo("next", false);
              else if (e2.deltaY < 0 && scroll)
                ctrl.goTo("prev", false);
            }));
        })
      }, h("div.cg-wrap"));
      renderPgnPane = (ctrl) => {
        const blob = new Blob([ctrl.opts.pgn], { type: "text/plain" });
        return h("div.lpv__pgn.lpv__pane", [
          h("a.lpv__pgn__download.lpv__fbt", {
            attrs: {
              href: window.URL.createObjectURL(blob),
              download: ctrl.opts.menu.getPgn.fileName || `${ctrl.game.title()}.pgn`
            }
          }, ctrl.translate("download")),
          h("textarea.lpv__pgn__text", ctrl.opts.pgn)
        ]);
      };
      makeConfig = (ctrl, rootEl) => ({
        viewOnly: !ctrl.opts.drawArrows,
        addDimensionsCssVarsTo: rootEl,
        drawable: {
          enabled: ctrl.opts.drawArrows,
          visible: true
        },
        disableContextMenu: ctrl.opts.drawArrows,
        ...ctrl.opts.chessground || {},
        movable: {
          free: false
        },
        draggable: {
          enabled: false
        },
        selectable: {
          enabled: false
        },
        ...ctrl.cgState()
      });
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/config.js
  function config_default(element, cfg) {
    const opts = { ...defaults2 };
    deepMerge2(opts, cfg);
    if (opts.fen)
      opts.pgn = `[FEN "${opts.fen}"]
${opts.pgn}`;
    if (!opts.classes)
      opts.classes = element.className;
    return opts;
  }
  function deepMerge2(base, extend) {
    for (const key in extend) {
      if (typeof extend[key] !== "undefined") {
        if (isPlainObject2(base[key]) && isPlainObject2(extend[key]))
          deepMerge2(base[key], extend[key]);
        else
          base[key] = extend[key];
      }
    }
  }
  function isPlainObject2(o) {
    if (typeof o !== "object" || o === null)
      return false;
    const proto = Object.getPrototypeOf(o);
    return proto === Object.prototype || proto === null;
  }
  var defaults2;
  var init_config2 = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/config.js"() {
      defaults2 = {
        pgn: "*",
        // the PGN to render
        fen: void 0,
        // initial FEN, will append [FEN "initial FEN"] to the PGN
        showPlayers: "auto",
        // show the players above and under the board
        showClocks: true,
        // show the clocks alongside the players
        showMoves: "auto",
        // false | "right" | "bottom" | auto. "auto" uses media queries
        showControls: true,
        // show the [prev, menu, next] buttons
        scrollToMove: true,
        // enable scrolling through moves with a mouse wheel
        keyboardToMove: true,
        // enable keyboard navigation through moves
        orientation: void 0,
        // orientation of the board. Undefined to use the Orientation PGN tag.
        initialPly: 0,
        // current position to display. Can be a number, or "last"
        chessground: {},
        // chessground configuration https://github.com/lichess-org/chessground/blob/master/src/config.ts#L7
        drawArrows: true,
        // allow mouse users to draw volatile arrows on the board. Disable for little perf boost
        menu: {
          getPgn: {
            enabled: true,
            // enable the "Get PGN" menu entry
            fileName: void 0
            // name of the file when user clicks "Download PGN". Leave empty for automatic name.
          },
          practiceWithComputer: {
            enabled: true
          },
          analysisBoard: {
            enabled: true
          }
        },
        lichess: "https://lichess.org",
        // support for Lichess games, with links to the game and players. Set to false to disable.
        classes: void 0
        // CSS classes to set on the root element. Defaults to the element classes before being replaced by LPV.
      };
    }
  });

  // node_modules/@lichess-org/pgn-viewer/dist/main.js
  function start4(element, cfg) {
    const patch = init([classModule, attributesModule]);
    const opts = config_default(element, cfg);
    const ctrl = new PgnViewer(opts, redraw);
    const blueprint = view(ctrl);
    element.innerHTML = "";
    let vnode2 = patch(element, blueprint);
    ctrl.div = vnode2.elm;
    function redraw() {
      vnode2 = patch(vnode2, view(ctrl));
    }
    return ctrl;
  }
  var init_main2 = __esm({
    "node_modules/@lichess-org/pgn-viewer/dist/main.js"() {
      init_pgnViewer();
      init_main();
      init_build();
      init_config2();
    }
  });

  // src/main.js
  var require_main = __commonJS({
    "src/main.js"() {
      init_chess();
      init_chessground();
      var import_pgn_parser = __toESM(require_index_umd());
      init_chessground_base();
      init_custom();
      init_main2();
      function toggleDisplay(className) {
        const elements = document.querySelectorAll("." + className);
        elements.forEach((element) => {
          element.classList.toggle("hidden");
        });
      }
      function getUrlVars() {
        let vars = {};
        const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
          vars[key] = decodeURIComponent(value).replace("#!/0", "");
        });
        return vars;
      }
      var urlPGN = getUrlVars()["PGN"] ? getUrlVars()["PGN"] : `[Event "The Opera Game"]
[Site "Paris Opera House"]
[Date "1858.11.02"]
[Round "?"]
[White "Paul Morphy"]
[Black "Duke of Brunswick & Count Isouart"]
[Result "1-0"]
[ECO "C41"]

1. e4 e5 2. Nf3 d6 {This is the Philidor Defence. It's solid but can be passive.} 3. d4 Bg4?! {This pin is a bit premature. A more common and solid move would be 3...exd4.} 4. dxe5 Bxf3 (4... dxe5 5. Qxd8+ Kxd8 6. Nxe5 {White wins a pawn and has a better position.}) 5. Qxf3! {A great move. Morphy is willing to accept doubled pawns to accelerate his development.} 5... dxe5 6. Bc4 {Putting immediate pressure on the weak f7 square.} 6... Nf6 7. Qb3! {A powerful double attack on f7 and b7.} 7... Qe7 {This is the only move to defend both threats, but it places the queen on an awkward square and blocks the f8-bishop.} 8. Nc3 c6 9. Bg5 {Now Black's knight on f6 is pinned and cannot move without the queen being captured.} 9... b5?! {A desperate attempt to kick the bishop and relieve some pressure, but it weakens Black's queenside.} 10. Nxb5! {A brilliant sacrifice! Morphy sees that his attack is worth more than the knight.} 10... cxb5 11. Bxb5+ Nbd7 12. O-O-O {All of White's pieces are now in the attack, while Black's are tangled up and undeveloped.} 12... Rd8 13. Rxd7! {Another fantastic sacrifice to remove the defending knight.} 13... Rxd7 14. Rd1 {Renewing the pin and intensifying the pressure. Black is completely paralyzed.} 14... Qe6 {Trying to trade queens to relieve the pressure, but it's too late.} 15. Bxd7+ Nxd7 (15... Qxd7 16. Qb8+ Ke7 17. Qxe5+ Kd8 18. Bxf6+ {and White wins easily.}) 16. Qb8+! {The stunning final sacrifice! Morphy forces mate by sacrificing his most powerful piece.} 16... Nxb8 17. Rd8# {A beautiful checkmate, delivered with just a rook and bishop.} 1-0
`;
      var ankiFen;
      var fontSize = getUrlVars()["fontSize"] ? getUrlVars()["fontSize"] : 16;
      var ankiText = getUrlVars()["userText"];
      var muteAudio = getUrlVars()["muteAudio"] ? getUrlVars()["muteAudio"] : "false";
      var handicap = getUrlVars()["handicap"] ? getUrlVars()["handicap"] : 1;
      var strictScoring = getUrlVars()["strictScoring"] ? getUrlVars()["strictScoring"] : "false";
      var acceptVariations = getUrlVars()["acceptVariations"] ? getUrlVars()["acceptVariations"] : "true";
      var solvedColour = "limegreen";
      var errorTrack = getUrlVars()["errorTrack"] ? getUrlVars()["errorTrack"] : "";
      var disableArrows = getUrlVars()["disableArrows"] ? getUrlVars()["disableArrows"] : "false";
      var boardRotation = "black";
      var flipBoard = getUrlVars()["flip"] ? getUrlVars()["flip"] : "true";
      var boardMode = getUrlVars()["boardMode"] ? getUrlVars()["boardMode"] : "test";
      var background = getUrlVars()["background"] ? getUrlVars()["background"] : "#2C2C2C";
      document.documentElement.style.setProperty("--background-color", background);
      var parsedPGN = (0, import_pgn_parser.parse)(urlPGN, { startRule: "game" });
      if (parsedPGN.tags.FEN) {
        ankiFen = parsedPGN.tags.FEN;
      } else {
        ankiFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      }
      if (ankiText) {
        commentBox.style = "font-size: " + fontSize + "px;";
        commentBox.classList.toggle("hidden");
        textField.innerHTML = ankiText;
      }
      var patt = /(( b | w ))(?!.*\1)/g;
      var result = ankiFen.match(patt);
      if (result == " w ") {
        boardRotation = "white";
      }
      if (flipBoard != "true" && boardRotation == "white" || flipBoard == "true" && boardRotation == "black") {
        const root = document.documentElement;
        const coordWhite = getComputedStyle(root).getPropertyValue("--coord-white").trim();
        const coordBlack = getComputedStyle(root).getPropertyValue("--coord-black").trim();
        root.style.setProperty("--coord-white", coordBlack);
        root.style.setProperty("--coord-black", coordBlack);
      }
      if (flipBoard == "true" && boardRotation == "white") {
        boardRotation = "black";
      } else if (flipBoard == "true" && boardRotation == "black") {
        boardRotation = "white";
      }
      var boarOrientation = boardRotation;
      document.documentElement.style.setProperty("--border-color", boardRotation);
      if (errorTrack == "true" && boardMode == "Viewer") {
        document.documentElement.style.setProperty("--border-color", "#b31010");
        document.documentElement.style.setProperty("--border-shadow", "#b31010");
      } else if (errorTrack == "false" && boardMode == "Viewer") {
        document.documentElement.style.setProperty("--border-color", "limegreen");
        document.documentElement.style.setProperty("--border-shadow", "limegreen");
      }
      window.parent.postMessage(errorTrack, "*");
      errorTrack = "false";
      document.querySelector("#promoteQ").src = "_" + boardRotation[0] + "Q.svg";
      document.querySelector("#promoteB").src = "_" + boardRotation[0] + "B.svg";
      document.querySelector("#promoteN").src = "_" + boardRotation[0] + "N.svg";
      document.querySelector("#promoteR").src = "_" + boardRotation[0] + "R.svg";
      var count;
      var selectState = false;
      var pgnState = true;
      var expectedLine;
      var expectedMove;
      var errorCount = 0;
      var alternateMove;
      var alternateMoves = [];
      var promoteChoice = "q";
      var debounceTimeout = null;
      var foundVariation;
      function toDests(chess) {
        const dests = /* @__PURE__ */ new Map();
        SQUARES.forEach((s) => {
          const ms = chess.moves({ square: s, verbose: true });
          if (ms.length)
            dests.set(s, ms.map((m) => m.to));
        });
        return dests;
      }
      function toColor(chess) {
        return chess.turn() === "w" ? "white" : "black";
      }
      function getLastMove(chess) {
        const allMoves = chess.history({ verbose: true });
        if (allMoves.length > 0) {
          return allMoves[allMoves.length - 1];
        } else {
          return false;
        }
      }
      function playOtherSide(cg, chess) {
        return (orig, dest) => {
          selectState = false;
          const promoteCheck = chess.move({ from: orig, to: dest, promotion: promoteChoice });
          if (promoteCheck.san.includes("=")) {
            chess.undo();
            promotePopup(null, cg, chess, orig, dest, null);
          } else {
            const lastMove = getLastMove(chess);
            changeAudio(lastMove);
            cg.set({
              fen: chess.fen(),
              check: chess.inCheck(),
              turnColor: toColor(chess),
              movable: {
                color: toColor(chess),
                dests: toDests(chess)
              },
              lastMove: [lastMove.from, lastMove.to]
            });
            PGNnavigator(cg, chess, lastMove.san);
          }
        };
      }
      function moveChecker(moveCheck, cg, chess, orig, dest, delay, chess2) {
        let moveCheckIsPromote = false;
        if (moveCheck.includes("=")) {
          moveCheckIsPromote = true;
          chess.move({ from: orig, to: dest, promotion: promoteChoice });
          cg.set({
            fen: chess.fen()
          });
          moveCheck = chess.undo().san;
        }
        if (expectedMove?.variations) {
          if (expectedMove.notation.notation == moveCheck) {
            foundVariation = true;
          } else if (expectedMove.notation.notation !== moveCheck) {
            if (expectedMove.variations.length > 0 && acceptVariations == "true") {
              for (var i = 0; i < expectedMove.variations.length; i++) {
                if (moveCheck === expectedMove.variations[i][0].notation.notation) {
                  count = 0;
                  expectedLine = expectedMove.variations[i];
                  expectedMove = expectedLine[count];
                  foundVariation = true;
                  break;
                }
              }
              if (foundVariation === false) {
                wrongMove(cg, chess);
              }
            } else {
              wrongMove(cg, chess);
            }
          }
        }
        if (foundVariation == true) {
          count++;
          expectedMove = expectedLine[count];
          chess.move({ from: orig, to: dest, promotion: promoteChoice });
          changeAudio(getLastMove(chess));
          cg.set({
            turnColor: toColor(chess),
            check: chess.inCheck()
          });
          if (expectedMove?.variations) {
            setTimeout(() => {
              errorCount = 0;
              if (expectedMove?.variations.length > 0 && acceptVariations == "true") {
                const moveVar = Math.floor(Math.random() * (expectedMove.variations.length + 1));
                if (moveVar !== expectedMove.variants.length) {
                  count = 0;
                  expectedLine = expectedMove.variations[moveVar];
                  expectedMove = expectedLine[0];
                }
              }
              chess.move(expectedMove.notation.notation);
              const lastMoveAi = getLastMove(chess);
              if (expectedMove.notation.promotion) {
                const lastMove = chess.undo();
                chess2.load(chess.fen());
                chess2.remove(lastMove.from);
                chess2.put({ type: "p", color: chess.turn() }, lastMove.to);
                cg.set({
                  fen: chess2.fen()
                });
                chess.move(expectedMove.notation.notation);
                setTimeout(() => {
                  cg.set({ animation: { enabled: false } });
                  cg.set({
                    fen: chess.fen()
                  });
                  cg.set({ animation: { enabled: true } });
                }, 200);
              } else {
                cg.set({
                  fen: chess.fen()
                });
              }
              changeAudio(lastMoveAi);
              cg.set({
                turnColor: toColor(chess),
                movable: {
                  color: toColor(chess),
                  dests: toDests(chess)
                }
              });
              cg.set({
                check: chess.inCheck()
              });
              cg.set({ lastMove: [lastMoveAi.from, lastMoveAi.to] });
              count++;
              expectedMove = expectedLine[count];
              cg.playPremove();
              if (!expectedMove || typeof expectedMove === "string") {
                window.parent.postMessage(errorTrack, "*");
                document.documentElement.style.setProperty("--border-color", solvedColour);
                cg.set({
                  selected: void 0,
                  // Clear any selected square
                  draggable: {
                    current: void 0
                    // Explicitly clear any currently dragged piece
                  },
                  viewOnly: true
                });
              }
              cg.set({
                // draw any alternate line if recorded
                drawable: {
                  shapes: alternateMoves
                }
              });
            }, delay);
          } else {
            count++;
            expectedMove = expectedLine[count];
            if (!expectedMove || typeof expectedMove === "string") {
              window.parent.postMessage(errorTrack, "*");
              document.documentElement.style.setProperty("--border-color", solvedColour);
              cg.set({
                fen: chess.fen(),
                selected: void 0,
                // Clear any selected square
                draggable: {
                  current: void 0
                  // Explicitly clear any currently dragged piece
                },
                viewOnly: true
              });
            }
            count--;
            expectedMove = expectedLine[count];
          }
          cg.set({
            drawable: {
              shapes: alternateMoves
            }
          });
        } else {
          errorCount++;
          if (moveCheckIsPromote && errorCount <= handicap + 1) {
            chess2.load(chess.fen());
            chess2.remove(orig);
            chess2.put({ type: "p", color: chess.turn() }, dest);
            cg.set({ animation: { enabled: false } });
            cg.set({
              fen: chess2.fen()
            });
            cg.set({ animation: { enabled: true } });
            chess2.remove(dest);
            chess2.put({ type: "p", color: chess.turn() }, orig);
            cg.set({
              fen: chess.fen()
            });
            const audio = document.getElementById("myAudio");
            if (errorCount > 0 && strictScoring == "true") {
              errorTrack = "true";
              window.parent.postMessage(errorTrack, "*");
              solvedColour = "#b31010";
            }
            ;
            if (errorCount > handicap) {
              const audio2 = document.getElementById("myAudio");
              audio2.src = "_Error.mp3";
              audio2.play().catch(() => {
              });
              setTimeout(() => {
                errorTrack = "true";
                window.parent.postMessage(errorTrack, "*");
                solvedColour = "#b31010";
                if (expectedMove?.variations.length > 0 && acceptVariations == "true") {
                  const randomIndex = Math.floor(Math.random() * (expectedMove.variants.length + 1));
                  if (randomIndex != expectedMove.variants.length) {
                    count = 0;
                    expectedLine = expectedMove.variations[randomIndex];
                    expectedMove = expectedLine[count];
                  }
                }
                if (moveCheckIsPromote && expectedMove.notation.promotion) {
                  chess.move(expectedMove.notation.notation);
                  const lastMove = chess.undo();
                  chess2.load(chess.fen());
                  chess2.remove(lastMove.from);
                  chess2.put({ type: "p", color: chess.turn() }, lastMove.to);
                  cg.set({
                    fen: chess2.fen()
                  });
                  chess.move(expectedMove.notation.notation);
                  setTimeout(() => {
                    cg.set({ animation: { enabled: false } });
                    cg.set({
                      fen: chess.fen()
                    });
                    cg.set({ animation: { enabled: true } });
                  }, 200);
                } else if (expectedMove.notation.promotion) {
                  chess2.load(chess.fen());
                  chess.move(expectedMove.notation.notation);
                  const lastMove = chess.undo();
                  chess2.remove(lastMove.from);
                  chess2.put({ type: "p", color: chess.turn() }, lastMove.to);
                  cg.set({
                    fen: chess2.fen()
                  });
                  chess.move(expectedMove.notation.notation);
                  setTimeout(() => {
                    cg.set({ animation: { enabled: false } });
                    cg.set({
                      fen: chess.fen()
                    });
                    cg.set({ animation: { enabled: true } });
                  }, 200);
                } else {
                  chess.move(expectedMove.notation.notation);
                  cg.set({
                    fen: chess.fen()
                  });
                }
                const lastMoveAi = getLastMove(chess);
                changeAudio(lastMoveAi);
                cg.set({
                  turnColor: toColor(chess),
                  check: chess.inCheck(),
                  lastMove: [lastMoveAi.from, lastMoveAi.to],
                  movable: {
                    color: toColor(chess),
                    dests: toDests(chess)
                  }
                });
                count++;
                expectedMove = expectedLine[count];
                if (expectedMove?.variations) {
                  setTimeout(() => {
                    errorCount = 0;
                    if (expectedMove?.variations.length > 0 && acceptVariations == "true") {
                      const moveVar = Math.floor(Math.random() * (expectedMove.variants.length + 1));
                      if (moveVar == expectedMove.variants.length) {
                      } else {
                        count = 0;
                        expectedLine = expectedMove.variations[moveVar];
                        expectedMove = expectedLine[0];
                      }
                    }
                    if (expectedMove.notation.promotion) {
                      chess2.load(chess.fen());
                      chess.move(expectedMove.notation.notation);
                      const lastMove = chess.undo();
                      chess2.remove(lastMove.from);
                      chess2.put({ type: "p", color: chess.turn() }, lastMove.to);
                      cg.set({
                        fen: chess2.fen()
                      });
                      chess.move(expectedMove.notation.notation);
                      setTimeout(() => {
                        cg.set({ animation: { enabled: false } });
                        cg.set({
                          fen: chess.fen()
                        });
                        cg.set({ animation: { enabled: true } });
                      }, 200);
                    } else {
                      chess.move(expectedMove.notation.notation);
                      cg.set({
                        fen: chess.fen()
                      });
                    }
                    const lastMoveAi2 = getLastMove(chess);
                    changeAudio(lastMoveAi2);
                    cg.set({
                      turnColor: toColor(chess),
                      movable: {
                        color: toColor(chess),
                        dests: toDests(chess)
                      }
                    });
                    cg.set({
                      check: chess.inCheck()
                    });
                    cg.set({ lastMove: [lastMoveAi2.from, lastMoveAi2.to] });
                    count++;
                    expectedMove = expectedLine[count];
                    cg.playPremove();
                    if (!expectedMove || typeof expectedMove === "string") {
                      window.parent.postMessage(errorTrack, "*");
                      document.documentElement.style.setProperty("--border-color", solvedColour);
                      cg.set({
                        selected: void 0,
                        // Clear any selected square
                        draggable: {
                          current: void 0
                          // Explicitly clear any currently dragged piece
                        },
                        viewOnly: true
                      });
                    }
                  }, delay);
                } else {
                  count++;
                  expectedMove = expectedLine[count];
                  if (!expectedMove || typeof expectedMove === "string") {
                    window.parent.postMessage(errorTrack, "*");
                    document.documentElement.style.setProperty("--border-color", solvedColour);
                    cg.set({
                      selected: void 0,
                      // Clear any selected square
                      draggable: {
                        current: void 0
                        // Explicitly clear any currently dragged piece
                      },
                      viewOnly: true
                    });
                  }
                  count--;
                  expectedMove = expectedLine[count];
                }
                errorCount = 0;
              }, delay);
            } else {
              audio.src = "_Error.mp3";
              audio.play().catch(() => {
              });
            }
          }
        }
      }
      function drawArrows(cg, chess) {
        if (!pgnState || typeof expectedMove === "string") {
          return;
        }
        const comment = expectedLine[count - 1]?.commentAfter;
        if (comment) {
          pgnComment.innerHTML = "<ul><li>" + expectedLine[count - 1].commentAfter + "</ul></li>";
        } else {
          pgnComment.innerHTML = "";
        }
        if (expectedMove?.variations) {
          chess.move(expectedMove.notation.notation);
          alternateMove = chess.undo();
          if (alternateMove.san === expectedMove.notation.notation) {
            alternateMoves = [];
            alternateMoves.push({ orig: alternateMove.from, dest: alternateMove.to, brush: "green" });
            for (var i = 0; i < expectedMove.variations.length; i++) {
              chess.move(expectedMove.variations[i][0].notation.notation);
              alternateMove = chess.undo();
              alternateMoves.push({ orig: alternateMove.from, dest: alternateMove.to, brush: "blue" });
            }
            ;
            const alternateMovesShift = alternateMoves.shift();
            alternateMoves.push(alternateMovesShift);
          }
          cg.set({
            drawable: {
              shapes: alternateMoves
            }
          });
        }
      }
      function PGNnavigator(cg, chess, moveSan, chess2) {
        if (moveSan) {
          if (expectedMove?.variations) {
            if (moveSan === expectedMove.notation.notation && pgnState) {
              count++;
              expectedMove = expectedLine[count];
              drawArrows(cg, chess);
            } else if (expectedMove.variations.length > 0 && pgnState) {
              pgnState = false;
              for (var i = 0; i < expectedMove.variations.length; i++) {
                if (moveSan == expectedMove.variations[i][0].notation.notation) {
                  pgnState = true;
                  expectedLine = expectedMove.variations[i];
                  expectedMove = expectedLine[1];
                  count = 1;
                  drawArrows(cg, chess);
                  break;
                }
              }
              ;
            } else if (pgnState) {
              pgnState = false;
            }
          }
        } else {
          chess.move(expectedMove.notation.notation);
          const lastMoveAi = getLastMove(chess);
          if (expectedMove.notation.promotion) {
            const lastMove = chess.undo();
            chess2.load(chess.fen());
            chess2.remove(lastMove.from);
            chess2.put({ type: "p", color: chess.turn() }, lastMove.to);
            cg.set({
              fen: chess2.fen()
            });
            chess.move(expectedMove.notation.notation);
            setTimeout(() => {
              cg.set({ animation: { enabled: false } });
              cg.set({
                fen: chess.fen()
              });
              drawArrows(cg, chess);
              cg.set({ animation: { enabled: true } });
            }, 200);
          } else {
            cg.set({
              fen: chess.fen()
            });
          }
          changeAudio(lastMoveAi);
          cg.set({
            turnColor: toColor(chess),
            lastMove: [lastMoveAi.from, lastMoveAi.to],
            check: chess.inCheck(),
            movable: {
              color: toColor(chess),
              dests: toDests(chess)
            }
          });
          count++;
          expectedMove = expectedLine[count];
          drawArrows(cg, chess);
        }
      }
      function getLegalMovesToSquare(chess, targetSquare) {
        const allLegalMoves = chess.moves({ verbose: true });
        const movesToTargetSquare = [];
        for (const move3 of allLegalMoves) {
          if (move3.to === targetSquare) {
            movesToTargetSquare.push(move3);
          }
        }
        return movesToTargetSquare;
      }
      function wrongMove(cg, chess) {
        cg.set(
          {
            check: chess.inCheck(),
            fen: chess.fen(),
            turnColor: toColor(chess),
            movable: {
              color: toColor(chess),
              dests: toDests(chess)
            }
          }
        );
      }
      function promotePopup(moveCheck, cg, chess, orig, dest, delay, chess2) {
        const cancelPopup = function() {
          cg.set({
            fen: chess.fen(),
            turnColor: toColor(chess),
            movable: {
              color: toColor(chess),
              dests: toDests(chess)
            }
          });
          toggleDisplay("showHide");
          document.querySelector("cg-board").style.cursor = "pointer";
          if (boardMode == "Viewer") {
            drawArrows(cg, chess);
          }
        };
        const promoteButtons = document.querySelectorAll("#center > button");
        const overlay = document.querySelector("#overlay");
        for (var i = 0; i < promoteButtons.length; i++) {
          promoteButtons[i].onclick = function() {
            event.stopPropagation();
            promoteChoice = this.value;
            if (boardMode === "Puzzle") {
              cancelPopup();
              moveChecker(moveCheck, cg, chess, orig, dest, delay, chess2);
            } else if (boardMode === "Viewer") {
              cancelPopup();
              const move3 = chess.move({ from: orig, to: dest, promotion: promoteChoice });
              changeAudio(move3);
              cg.set({
                fen: chess.fen(),
                check: chess.inCheck(),
                turnColor: toColor(chess),
                movable: {
                  color: toColor(chess),
                  dests: toDests(chess)
                },
                lastMove: [move3.from, move3.to]
              });
              PGNnavigator(cg, chess, move3.san);
            }
            document.querySelector(".cg-wrap").style.filter = "none";
            document.querySelector("cg-board").style.cursor = "pointer";
          };
          overlay.onclick = function() {
            cancelPopup();
            const audio = document.getElementById("myAudio");
            audio.src = "_Move.mp3";
            audio.play();
          };
        }
        toggleDisplay("showHide");
        document.querySelector("cg-board").style.cursor = "default";
      }
      function puzzlePlay(cg, chess, delay, from, to, chess2) {
        return (orig, dest) => {
          selectState = false;
          const moveAccepted = count;
          if (from) {
            orig = from;
            dest = to;
          }
          ;
          const playerComment = expectedLine[count]?.commentAfter;
          foundVariation = false;
          alternateMoves = [];
          console.log("moveCheck");
          console.log(chess.fen());
          chess.move({ from: orig, to: dest, promotion: promoteChoice });
          const moveCheck = chess.undo().san;
          console.log(moveCheck);
          if (expectedMove?.variations.length > 0 && disableArrows == "false") {
            for (var i = 0; i < expectedMove.variations.length; i++) {
              if (moveCheck != expectedMove.variations[i][0].notation.notation) {
                chess.move(expectedMove.variations[i][0].notation.notation);
                alternateMove = chess.undo();
                alternateMoves.push({ orig: alternateMove.from, dest: alternateMove.to, brush: "blue" });
              } else {
                chess.move(expectedMove.notation.notation);
                alternateMove = chess.undo();
                alternateMoves.push({ orig: alternateMove.from, dest: alternateMove.to, brush: "green" });
              }
            }
            ;
          }
          if (moveCheck.includes("=")) {
            promotePopup(moveCheck, cg, chess, orig, dest, delay, chess2);
          } else {
            moveChecker(moveCheck, cg, chess, orig, dest, delay, chess2);
          }
          const opponentComment = expectedLine[count]?.commentAfter;
          if ((playerComment || opponentComment) && moveAccepted < count) {
            pgnComment.innerHTML = "<ul><li>" + (boarOrientation === "white" ? "<b>White: </b>" : "<b>Black: </b>") + (playerComment ? playerComment : "") + "</li><li>" + (boarOrientation === "white" ? "<b>Black: </b>" : "<b>White: </b>") + (opponentComment ? opponentComment : "") + "</ul></li>";
          } else if (moveAccepted < count) {
            pgnComment.innerHTML = "";
          }
        };
      }
      function changeAudio(gameState) {
        const audio = document.getElementById("myAudio");
        if (gameState.san.includes("#")) {
          audio.src = "_checkmate.mp3";
        } else if (gameState.san.includes("+")) {
          audio.src = "_move-check.mp3";
        } else if (gameState.flags.includes("c")) {
          audio.src = "_Capture.mp3";
        } else if (gameState.flags.includes("k") || gameState.flags.includes("q")) {
          audio.src = "_castle.mp3";
        } else if (gameState.flags.includes("p")) {
          audio.src = "_promote.mp3";
        } else {
          audio.src = "_Move.mp3";
        }
        audio.play().catch(() => {
        });
      }
      function reload() {
        count = 0;
        expectedLine = parsedPGN.moves;
        expectedMove = parsedPGN.moves[count];
        const chess = new Chess(ankiFen);
        const chess2 = new Chess();
        const board = document.getElementById("board");
        if (boardMode === "Puzzle") {
          const cg = Chessground(board, {
            fen: ankiFen,
            turnColor: boardRotation,
            orientation: boardRotation,
            movable: {
              color: boardRotation,
              free: false,
              dests: toDests(chess)
            },
            highlight: {
              check: true
            },
            events: {
              select: (key) => {
                if (debounceTimeout !== null) {
                  return;
                }
                ;
                debounceTimeout = setTimeout(() => {
                  debounceTimeout = null;
                }, 300);
                if (cg.state.selected == selectState && selectState == key) {
                  selectState = false;
                  return;
                } else if (selectState !== key && key == cg.state.selected) {
                  selectState = key;
                  return;
                } else if (selectState) {
                  const legalMovesFromSelected = chess.moves({ square: selectState, verbose: true });
                  const isValidMove = legalMovesFromSelected.some((move3) => move3.to === key);
                  if (isValidMove) {
                    return;
                  } else {
                  }
                  selectState = false;
                }
                const targetSquare = key;
                const legalMovesToSquare = getLegalMovesToSquare(chess, targetSquare);
                if (legalMovesToSquare.length == 1) {
                  const lastMove = chess.move(legalMovesToSquare[0].san);
                  cg.set({
                    fen: chess.fen(),
                    turnColor: toColor(chess),
                    movable: {
                      color: toColor(chess),
                      dests: toDests(chess)
                    },
                    check: chess.inCheck(),
                    lastMove: [lastMove.from, lastMove.to]
                  });
                  chess.undo();
                  puzzlePlay(cg, chess, 300, legalMovesToSquare[0].from, legalMovesToSquare[0].to, chess2)();
                }
              }
            }
          });
          cg.set({
            movable: {
              events: {
                after: puzzlePlay(cg, chess, 300, null, null, chess2)
              }
            }
          });
          if (chess.inCheck() == true) {
            cg.set({
              check: true
            });
          }
          if (chess.isGameOver() == false && flipBoard == "true") {
            setTimeout(() => {
              if (expectedMove?.variations.length > 0 && acceptVariations == "true") {
                const moveVar = Math.floor(Math.random() * (expectedMove.variants.length + 1));
                if (moveVar == expectedMove.variants.length) {
                } else {
                  count = 0;
                  expectedLine = expectedMove.variations[moveVar];
                  expectedMove = expectedLine[0];
                }
              }
              chess.move(expectedMove.notation.notation);
              const lastMoveAi = getLastMove(chess);
              changeAudio(lastMoveAi);
              cg.set({
                fen: chess.fen(),
                movable: {
                  dests: toDests(chess)
                }
              });
              cg.set({
                turnColor: boardRotation,
                check: chess.inCheck()
              });
              cg.set({ lastMove: [lastMoveAi.from, lastMoveAi.to] });
              count++;
              expectedMove = expectedLine[count];
              cg.playPremove();
            }, 200);
          }
          document.querySelector("#buttons-container").style = "display: none";
        } else if (boardMode === "Viewer") {
          let findParent = function(obj, targetChild) {
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (typeof value === "object" && value !== null) {
                  if (value === targetChild) {
                    return {
                      key,
                      parent: obj
                      // This is the direct parent
                    };
                  }
                  const foundParent = findParent(value, targetChild);
                  if (foundParent) {
                    return foundParent;
                  }
                }
              }
            }
            return null;
          }, navBackward = function() {
            const lastMove = chess.undo();
            const FENpos = chess.fen();
            if (lastMove) {
              if (lastMove.promotion) {
                const chess22 = new Chess();
                chess22.load(FENpos);
                chess22.remove(lastMove.to);
                chess22.remove(lastMove.from);
                chess22.put({ type: "p", color: chess.turn() }, lastMove.to);
                cg.set({ animation: { enabled: false } });
                cg.set({
                  fen: chess22.fen()
                });
                chess22.remove(lastMove.to);
                chess22.put({ type: "p", color: chess.turn() }, lastMove.from);
                cg.set({ animation: { enabled: true } });
                cg.set({
                  fen: FENpos
                });
              } else {
                cg.set({
                  fen: chess.fen()
                });
              }
              cg.set({
                check: chess.inCheck(),
                turnColor: toColor(chess),
                movable: {
                  color: toColor(chess),
                  dests: toDests(chess)
                },
                lastMove: [lastMove.from, lastMove.to]
              });
              if (expectedLine[count - 1]?.notation?.notation === lastMove.san) {
                if (true) {
                  count--;
                  expectedMove = expectedLine[count];
                  if (count === 0) {
                    let parentOfChild = findParent(parsedPGN.moves, expectedLine);
                    if (parentOfChild) {
                      for (var i = 0; i < 2; i++) {
                        parentOfChild = findParent(parsedPGN.moves, parentOfChild.parent);
                      }
                      ;
                      expectedLine = parentOfChild.parent;
                      count = parentOfChild.key;
                      expectedMove = expectedLine[count];
                    }
                  }
                }
              }
              if (count == 0) {
                pgnState = true;
                drawArrows(cg, chess);
              } else if (expectedLine[count - 1].notation.notation == getLastMove(chess).san) {
                pgnState = true;
                drawArrows(cg, chess);
              }
            }
          };
          const cg = Chessground(board, {
            fen: ankiFen,
            orientation: boardRotation,
            turnColor: boardRotation,
            movable: {
              free: false,
              color: boardRotation,
              dests: toDests(chess)
            },
            highlight: {
              check: true
            },
            events: {
              select: (key) => {
                if (debounceTimeout !== null) {
                  drawArrows(cg, chess);
                  return;
                }
                ;
                debounceTimeout = setTimeout(() => {
                  debounceTimeout = null;
                }, 100);
                if (cg.state.selected == selectState && selectState == key) {
                  selectState = false;
                  drawArrows(cg, chess);
                  return;
                } else if (selectState !== key && key == cg.state.selected) {
                  selectState = key;
                  drawArrows(cg, chess);
                  return;
                } else if (selectState) {
                  const legalMovesFromSelected = chess.moves({ square: selectState, verbose: true });
                  const isValidMove = legalMovesFromSelected.some((move3) => move3.to === key);
                  if (isValidMove) {
                    return;
                  } else {
                  }
                  selectState = false;
                }
                const targetSquare = key;
                const legalMovesToSquare = getLegalMovesToSquare(chess, targetSquare);
                if (legalMovesToSquare.length == 1) {
                  chess.move(legalMovesToSquare[0].san);
                  const lastMove = getLastMove(chess);
                  changeAudio(lastMove);
                  cg.set({
                    fen: chess.fen(),
                    check: chess.inCheck(),
                    turnColor: toColor(chess),
                    movable: {
                      color: toColor(chess),
                      dests: toDests(chess)
                    },
                    lastMove: [lastMove.from, lastMove.to]
                  });
                  PGNnavigator(cg, chess, lastMove.san);
                } else if (legalMovesToSquare.length > 1 && pgnState) {
                  let moveTracker = false;
                  if (expectedMove?.variations) {
                    const expectedMoveStore = expectedMove?.notation?.notation;
                    for (var i = 0; i < legalMovesToSquare.length; i++) {
                      const legalMovesToSquareAlt = legalMovesToSquare[i].san;
                      if (moveTracker) {
                        break;
                      }
                      for (var k = 0; k < legalMovesToSquare.length; k++) {
                        const legalMovesToSquareAlt2 = legalMovesToSquare[k].san;
                        if (expectedMove?.notation?.notation === legalMovesToSquareAlt2) {
                          chess.move(legalMovesToSquareAlt2);
                          if (expectedMove.notation.promotion) {
                            const lastMove2 = chess.undo();
                            const chess22 = new Chess();
                            chess22.load(chess.fen());
                            chess22.remove(lastMove2.from);
                            chess22.put({ type: "p", color: chess.turn() }, lastMove2.to);
                            cg.set({
                              fen: chess22.fen()
                            });
                            chess.move(expectedMove.notation.notation);
                            setTimeout(() => {
                              cg.set({ animation: { enabled: false } });
                              cg.set({
                                fen: chess.fen()
                              });
                              cg.set({ animation: { enabled: true } });
                              drawArrows(cg, chess);
                            }, 200);
                          } else {
                            cg.set({
                              fen: chess.fen()
                            });
                          }
                          const lastMove = getLastMove(chess);
                          changeAudio(lastMove);
                          cg.set({
                            check: chess.inCheck(),
                            turnColor: toColor(chess),
                            movable: {
                              color: toColor(chess),
                              dests: toDests(chess)
                            },
                            lastMove: [lastMove.from, lastMove.to]
                          });
                          PGNnavigator(cg, chess, lastMove.san);
                          moveTracker = true;
                          break;
                        }
                      }
                      for (var j = 0; j < expectedMove?.variations?.length; j++) {
                        if (expectedMove.variations[j][0].notation.notation === legalMovesToSquareAlt) {
                          chess.move(expectedMove.variations[j][0].notation.notation);
                          if (expectedMove.variants[j][0].notation.promotion) {
                            const lastMove2 = chess.undo();
                            const chess22 = new Chess();
                            chess22.load(chess.fen());
                            chess22.remove(lastMove2.from);
                            chess22.put({ type: "p", color: chess.turn() }, lastMove2.to);
                            cg.set({
                              fen: chess22.fen()
                            });
                            chess.move(expectedMove.variants[j][0].notation.notation);
                            setTimeout(() => {
                              cg.set({ animation: { enabled: false } });
                              cg.set({
                                fen: chess.fen()
                              });
                              cg.set({ animation: { enabled: true } });
                              drawArrows(cg, chess);
                            }, 200);
                          } else {
                            cg.set({
                              fen: chess.fen()
                            });
                          }
                          const lastMove = getLastMove(chess);
                          changeAudio(lastMove);
                          cg.set({
                            check: chess.inCheck(),
                            turnColor: toColor(chess),
                            movable: {
                              color: toColor(chess),
                              dests: toDests(chess)
                            },
                            lastMove: [lastMove.from, lastMove.to]
                          });
                          PGNnavigator(cg, chess, legalMovesToSquareAlt);
                          moveTracker = true;
                          break;
                        }
                      }
                    }
                  }
                  if (!moveTracker) {
                    drawArrows(cg, chess);
                  }
                } else {
                  drawArrows(cg, chess);
                }
              }
            }
          });
          ;
          var resetBoard = function() {
            count = 0;
            expectedLine = parsedPGN.moves;
            expectedMove = parsedPGN.moves[count];
            pgnState = true;
            chess.reset();
            chess.load(ankiFen);
            cg.set({
              fen: chess.fen(),
              check: chess.inCheck(),
              turnColor: toColor(chess),
              orientation: boarOrientation,
              movable: {
                color: toColor(chess),
                dests: toDests(chess)
              }
            });
            drawArrows(cg, chess);
          };
          var rotateBoard = function() {
            boarOrientation = boarOrientation === "white" ? "black" : "white";
            const root = document.documentElement;
            const coordWhite = getComputedStyle(root).getPropertyValue("--coord-white").trim();
            const coordBlack = getComputedStyle(root).getPropertyValue("--coord-black").trim();
            root.style.setProperty("--coord-white", coordBlack);
            root.style.setProperty("--coord-black", coordBlack);
            cg.set({
              orientation: boarOrientation
            });
          };
          ;
          var navForward = function() {
            const chess22 = new Chess();
            if (count == 0) {
              const lastMove = getLastMove(chess);
              if (!lastMove) {
                pgnState = true;
                expectedMove = expectedLine[count];
                PGNnavigator(cg, chess, null, chess22);
              }
            } else if (expectedLine[count]?.notation) {
              const lastMove = getLastMove(chess);
              if (expectedLine[count - 1]?.notation?.notation == lastMove.san) {
                expectedMove = expectedLine[count];
                PGNnavigator(cg, chess, null, chess22);
              }
            }
          };
          var copyFen = function() {
            let textarea = document.createElement("textarea");
            textarea.value = chess.fen();
            textarea.style.position = "absolute";
            textarea.style.left = "-9999px";
            document.body.appendChild(textarea);
            textarea.select();
            try {
              document.execCommand("copy");
              const audio = document.getElementById("myAudio");
              audio.src = "_computer-mouse-click.mp3";
              audio.play().catch(() => {
              });
              return true;
            } catch (err) {
              const audio = document.getElementById("myAudio");
              audio.src = "_Error.mp3";
              audio.play().catch(() => {
              });
              console.error("Failed to copy text using execCommand:", err);
              return false;
            } finally {
              document.body.removeChild(textarea);
            }
          };
          document.querySelector("#resetBoard").addEventListener("click", resetBoard);
          document.querySelector("#navBackward").addEventListener("click", navBackward);
          document.querySelector("#navForward").addEventListener("click", navForward);
          document.querySelector("#rotateBoard").addEventListener("click", rotateBoard);
          document.querySelector("#copyFen").addEventListener("click", copyFen);
          board.addEventListener("wheel", (event2) => {
            event2.preventDefault();
            if (event2.deltaY < 0) {
              navBackward();
            } else if (event2.deltaY > 0) {
              navForward();
            }
          });
          cg.set({
            movable: {
              events: {
                after: playOtherSide(cg, chess)
              }
            }
          });
          if (chess.inCheck() == true) {
            cg.set({
              turnColor: toColor(chess),
              check: true
            });
          }
          if (chess.isGameOver() == false && flipBoard == "true") {
            setTimeout(() => {
              if (expectedMove?.variations.length > 0 && acceptVariations == "true") {
                const moveVar = Math.floor(Math.random() * (expectedMove.variants.length + 1));
                if (moveVar == expectedMove.variants.length) {
                } else {
                  count = 0;
                  expectedLine = expectedMove.variations[moveVar];
                  expectedMove = expectedLine[0];
                }
              }
              chess.move(expectedMove.notation.notation);
              const lastMoveAi = getLastMove(chess);
              changeAudio(lastMoveAi);
              cg.set({
                fen: chess.fen(),
                movable: {
                  dests: toDests(chess)
                }
              });
              cg.set({
                turnColor: toColor(chess),
                check: chess.inCheck()
              });
              cg.set({ lastMove: [lastMoveAi.from, lastMoveAi.to] });
              count++;
              expectedMove = expectedLine[count];
              cg.playPremove();
              drawArrows(cg, chess);
            }, 200);
          } else {
            drawArrows(cg, chess);
          }
          return cg;
        } else if (boardMode === "test") {
          const boardContainer = document.getElementById("board-container");
          const pgnViewer = new start4(boardContainer, {
            pgn: urlPGN
          });
          var stockfish = STOCKFISH();
          stockfish.addEventListener("message", function(e2) {
            console.log(e2.data);
          });
          stockfish.postMessage("uci");
        }
      }
      function positionPromoteOverlay() {
        if (boardMode === "test") {
          return;
        }
        ;
        const promoteOverlay = document.getElementById("center");
        const rect = document.querySelector(".cg-wrap").getBoundingClientRect();
        promoteOverlay.style.top = rect.top + 6 + "px";
        promoteOverlay.style.left = rect.left + 6 + "px";
        window.addEventListener("resize", resizeBoard);
      }
      async function resizeBoard() {
        positionPromoteOverlay();
      }
      async function loadElements() {
        await reload();
        await resizeBoard();
        setTimeout(() => {
          positionPromoteOverlay();
        }, 200);
      }
      if (muteAudio == "true") {
        const audioElement = document.getElementById("myAudio");
        audioElement.muted = true;
      }
      loadElements();
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
