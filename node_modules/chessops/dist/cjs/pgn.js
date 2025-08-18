"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseComment = exports.makeComment = exports.isMate = exports.isPawns = exports.setStartingPosition = exports.startingPosition = exports.makeVariant = exports.parseVariant = exports.parsePgn = exports.PgnParser = exports.PgnError = exports.emptyHeaders = exports.defaultHeaders = exports.makePgn = exports.parseOutcome = exports.makeOutcome = exports.walk = exports.transform = exports.Box = exports.extend = exports.isChildNode = exports.ChildNode = exports.Node = exports.defaultGame = void 0;
/**
 * Parse, transform and write PGN.
 *
 * ## Parser
 *
 * The parser will interpret any input as a PGN, creating a tree of
 * syntactically valid (but not necessarily legal) moves, skipping any invalid
 * tokens.
 *
 * ```ts
 * import { parsePgn, startingPosition } from 'chessops/pgn';
 * import { parseSan } from 'chessops/san';
 *
 * const pgn = '1. d4 d5 *';
 * const games = parsePgn(pgn);
 * for (const game of games) {
 *   const pos = startingPosition(game.headers).unwrap();
 *   for (const node of game.moves.mainline()) {
 *     const move = parseSan(pos, node.san);
 *     if (!move) break; // Illegal move
 *     pos.play(move);
 *   }
 * }
 * ```
 *
 * ## Streaming parser
 *
 * The module also provides a denial-of-service resistant streaming parser.
 * It can be configured with a budget for reasonable complexity of a single
 * game, fed with chunks of text, and will yield parsed games as they are
 * completed.
 *
 * ```ts
 *
 * import { createReadStream } from 'fs';
 * import { PgnParser } from 'chessops/pgn';
 *
 * const stream = createReadStream('games.pgn', { encoding: 'utf-8' });
 *
 * const parser = new PgnParser((game, err) => {
 *   if (err) {
 *     // Budget exceeded.
 *     stream.destroy(err);
 *   }
 *
 *   // Use game ...
 * });
 *
 * await new Promise<void>(resolve =>
 *   stream
 *     .on('data', (chunk: string) => parser.parse(chunk, { stream: true }))
 *     .on('close', () => {
 *       parser.parse('');
 *       resolve();
 *     })
 * );
 * ```
 *
 * ## Augmenting the game tree
 *
 * You can use `walk` to visit all nodes in the game tree, or `transform`
 * to augment it with user data.
 *
 * Both allow you to provide context. You update the context inside the
 * callback, and it is automatically `clone()`-ed at each fork.
 * In the example below, the current position `pos` is provided as context.
 *
 * ```ts
 * import { transform } from 'chessops/pgn';
 * import { makeFen } from 'chessops/fen';
 * import { parseSan, makeSanAndPlay } from 'chessops/san';
 *
 * const pos = startingPosition(game.headers).unwrap();
 * game.moves = transform(game.moves, pos, (pos, node) => {
 *   const move = parseSan(pos, node.san);
 *   if (!move) {
 *     // Illegal move. Returning undefined cuts off the tree here.
 *     return;
 *   }
 *
 *   const san = makeSanAndPlay(pos, move); // Mutating pos!
 *
 *   return {
 *     ...node, // Keep comments and annotation glyphs
 *     san, // Normalized SAN
 *     fen: makeFen(pos.toSetup()), // Add arbitrary user data to node
 *   };
 * });
 * ```
 *
 * ## Writing
 *
 * Requires each node to at least have a `san` property.
 *
 * ```
 * import { makePgn } from 'chessops/pgn';
 *
 * const rewrittenPgn = makePgn(game);
 * ```
 *
 * @packageDocumentation
 */
const result_1 = require("@badrap/result");
const chess_js_1 = require("./chess.js");
const fen_js_1 = require("./fen.js");
const util_js_1 = require("./util.js");
const variant_js_1 = require("./variant.js");
const defaultGame = (initHeaders = exports.defaultHeaders) => ({
    headers: initHeaders(),
    moves: new Node(),
});
exports.defaultGame = defaultGame;
class Node {
    constructor() {
        this.children = [];
    }
    *mainlineNodes() {
        let node = this;
        while (node.children.length) {
            const child = node.children[0];
            yield child;
            node = child;
        }
    }
    *mainline() {
        for (const child of this.mainlineNodes())
            yield child.data;
    }
    end() {
        let node = this;
        while (node.children.length)
            node = node.children[0];
        return node;
    }
}
exports.Node = Node;
class ChildNode extends Node {
    constructor(data) {
        super();
        this.data = data;
    }
}
exports.ChildNode = ChildNode;
const isChildNode = (node) => node instanceof ChildNode;
exports.isChildNode = isChildNode;
const extend = (node, data) => {
    for (const d of data) {
        const child = new ChildNode(d);
        node.children.push(child);
        node = child;
    }
    return node;
};
exports.extend = extend;
class Box {
    constructor(value) {
        this.value = value;
    }
    clone() {
        return new Box(this.value);
    }
}
exports.Box = Box;
const transform = (node, ctx, f) => {
    const root = new Node();
    const stack = [
        {
            before: node,
            after: root,
            ctx,
        },
    ];
    let frame;
    while ((frame = stack.pop())) {
        for (let childIndex = 0; childIndex < frame.before.children.length; childIndex++) {
            const ctx = childIndex < frame.before.children.length - 1 ? frame.ctx.clone() : frame.ctx;
            const childBefore = frame.before.children[childIndex];
            const data = f(ctx, childBefore.data, childIndex);
            if ((0, util_js_1.defined)(data)) {
                const childAfter = new ChildNode(data);
                frame.after.children.push(childAfter);
                stack.push({
                    before: childBefore,
                    after: childAfter,
                    ctx,
                });
            }
        }
    }
    return root;
};
exports.transform = transform;
const walk = (node, ctx, f) => {
    const stack = [{ node, ctx }];
    let frame;
    while ((frame = stack.pop())) {
        for (let childIndex = 0; childIndex < frame.node.children.length; childIndex++) {
            const ctx = childIndex < frame.node.children.length - 1 ? frame.ctx.clone() : frame.ctx;
            const child = frame.node.children[childIndex];
            if (f(ctx, child.data, childIndex) !== false)
                stack.push({ node: child, ctx });
        }
    }
};
exports.walk = walk;
const makeOutcome = (outcome) => {
    if (!outcome)
        return '*';
    else if (outcome.winner === 'white')
        return '1-0';
    else if (outcome.winner === 'black')
        return '0-1';
    else
        return '1/2-1/2';
};
exports.makeOutcome = makeOutcome;
const parseOutcome = (s) => {
    if (s === '1-0' || s === '1–0' || s === '1—0')
        return { winner: 'white' };
    else if (s === '0-1' || s === '0–1' || s === '0—1')
        return { winner: 'black' };
    else if (s === '1/2-1/2' || s === '1/2–1/2' || s === '1/2—1/2')
        return { winner: undefined };
    else
        return;
};
exports.parseOutcome = parseOutcome;
const escapeHeader = (value) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const safeComment = (comment) => comment.replace(/\}/g, '');
const makePgn = (game) => {
    const builder = [], tokens = [];
    if (game.headers.size) {
        for (const [key, value] of game.headers.entries()) {
            builder.push('[', key, ' "', escapeHeader(value), '"]\n');
        }
        builder.push('\n');
    }
    for (const comment of game.comments || [])
        tokens.push('{', safeComment(comment), '}');
    const fen = game.headers.get('FEN');
    const initialPly = fen
        ? (0, fen_js_1.parseFen)(fen).unwrap(setup => (setup.fullmoves - 1) * 2 + (setup.turn === 'white' ? 0 : 1), _ => 0)
        : 0;
    const stack = [];
    const variations = game.moves.children[Symbol.iterator]();
    const firstVariation = variations.next();
    if (!firstVariation.done) {
        stack.push({
            state: 0 /* MakePgnState.Pre */,
            ply: initialPly,
            node: firstVariation.value,
            sidelines: variations,
            startsVariation: false,
            inVariation: false,
        });
    }
    let forceMoveNumber = true;
    while (stack.length) {
        const frame = stack[stack.length - 1];
        if (frame.inVariation) {
            tokens.push(')');
            frame.inVariation = false;
            forceMoveNumber = true;
        }
        switch (frame.state) {
            case 0 /* MakePgnState.Pre */:
                for (const comment of frame.node.data.startingComments || []) {
                    tokens.push('{', safeComment(comment), '}');
                    forceMoveNumber = true;
                }
                if (forceMoveNumber || frame.ply % 2 === 0) {
                    tokens.push(Math.floor(frame.ply / 2) + 1 + (frame.ply % 2 ? '...' : '.'));
                    forceMoveNumber = false;
                }
                tokens.push(frame.node.data.san);
                for (const nag of frame.node.data.nags || []) {
                    tokens.push('$' + nag);
                    forceMoveNumber = true;
                }
                for (const comment of frame.node.data.comments || []) {
                    tokens.push('{', safeComment(comment), '}');
                }
                frame.state = 1 /* MakePgnState.Sidelines */; // fall through
            case 1 /* MakePgnState.Sidelines */: {
                const child = frame.sidelines.next();
                if (child.done) {
                    const variations = frame.node.children[Symbol.iterator]();
                    const firstVariation = variations.next();
                    if (!firstVariation.done) {
                        stack.push({
                            state: 0 /* MakePgnState.Pre */,
                            ply: frame.ply + 1,
                            node: firstVariation.value,
                            sidelines: variations,
                            startsVariation: false,
                            inVariation: false,
                        });
                    }
                    frame.state = 2 /* MakePgnState.End */;
                }
                else {
                    tokens.push('(');
                    forceMoveNumber = true;
                    stack.push({
                        state: 0 /* MakePgnState.Pre */,
                        ply: frame.ply,
                        node: child.value,
                        sidelines: [][Symbol.iterator](),
                        startsVariation: true,
                        inVariation: false,
                    });
                    frame.inVariation = true;
                }
                break;
            }
            case 2 /* MakePgnState.End */:
                stack.pop();
        }
    }
    tokens.push((0, exports.makeOutcome)((0, exports.parseOutcome)(game.headers.get('Result'))));
    builder.push(tokens.join(' '), '\n');
    return builder.join('');
};
exports.makePgn = makePgn;
const defaultHeaders = () => new Map([
    ['Event', '?'],
    ['Site', '?'],
    ['Date', '????.??.??'],
    ['Round', '?'],
    ['White', '?'],
    ['Black', '?'],
    ['Result', '*'],
]);
exports.defaultHeaders = defaultHeaders;
const emptyHeaders = () => new Map();
exports.emptyHeaders = emptyHeaders;
const BOM = '\ufeff';
const isWhitespace = (line) => /^\s*$/.test(line);
const isCommentLine = (line) => line.startsWith('%');
class PgnError extends Error {
}
exports.PgnError = PgnError;
class PgnParser {
    constructor(emitGame, initHeaders = exports.defaultHeaders, maxBudget = 1000000) {
        this.emitGame = emitGame;
        this.initHeaders = initHeaders;
        this.maxBudget = maxBudget;
        this.lineBuf = [];
        this.resetGame();
        this.state = 0 /* ParserState.Bom */;
    }
    resetGame() {
        this.budget = this.maxBudget;
        this.found = false;
        this.state = 1 /* ParserState.Pre */;
        this.game = (0, exports.defaultGame)(this.initHeaders);
        this.stack = [{ parent: this.game.moves, root: true }];
        this.commentBuf = [];
    }
    consumeBudget(cost) {
        this.budget -= cost;
        if (this.budget < 0)
            throw new PgnError('ERR_PGN_BUDGET');
    }
    parse(data, options) {
        if (this.budget < 0)
            return;
        try {
            let idx = 0;
            for (;;) {
                const nlIdx = data.indexOf('\n', idx);
                if (nlIdx === -1) {
                    break;
                }
                const crIdx = nlIdx > idx && data[nlIdx - 1] === '\r' ? nlIdx - 1 : nlIdx;
                this.consumeBudget(nlIdx - idx);
                this.lineBuf.push(data.slice(idx, crIdx));
                idx = nlIdx + 1;
                this.handleLine();
            }
            this.consumeBudget(data.length - idx);
            this.lineBuf.push(data.slice(idx));
            if (!(options === null || options === void 0 ? void 0 : options.stream)) {
                this.handleLine();
                this.emit(undefined);
            }
        }
        catch (err) {
            this.emit(err);
        }
    }
    handleLine() {
        let freshLine = true;
        let line = this.lineBuf.join('');
        this.lineBuf = [];
        continuedLine: for (;;) {
            switch (this.state) {
                case 0 /* ParserState.Bom */:
                    if (line.startsWith(BOM))
                        line = line.slice(BOM.length);
                    this.state = 1 /* ParserState.Pre */; // fall through
                case 1 /* ParserState.Pre */:
                    if (isWhitespace(line) || isCommentLine(line))
                        return;
                    this.found = true;
                    this.state = 2 /* ParserState.Headers */; // fall through
                case 2 /* ParserState.Headers */: {
                    if (isCommentLine(line))
                        return;
                    let moreHeaders = true;
                    while (moreHeaders) {
                        moreHeaders = false;
                        line = line.replace(/^\s*\[([A-Za-z0-9][A-Za-z0-9_+#=:-]*)\s+"((?:[^"\\]|\\"|\\\\)*)"\]/, (_match, headerName, headerValue) => {
                            this.consumeBudget(200);
                            this.handleHeader(headerName, headerValue.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
                            moreHeaders = true;
                            freshLine = false;
                            return '';
                        });
                    }
                    if (isWhitespace(line))
                        return;
                    this.state = 3 /* ParserState.Moves */; // fall through
                }
                case 3 /* ParserState.Moves */: {
                    if (freshLine) {
                        if (isCommentLine(line))
                            return;
                        if (isWhitespace(line))
                            return this.emit(undefined);
                    }
                    const tokenRegex = /(?:[NBKRQ]?[a-h]?[1-8]?[-x]?[a-h][1-8](?:=?[nbrqkNBRQK])?|[pnbrqkPNBRQK]?@[a-h][1-8]|[O0o][-–—][O0o](?:[-–—][O0o])?)[+#]?|--|Z0|0000|@@@@|{|;|\$\d{1,4}|[?!]{1,2}|\(|\)|\*|1[-–—]0|0[-–—]1|1\/2[-–—]1\/2/g;
                    let match;
                    while ((match = tokenRegex.exec(line))) {
                        const frame = this.stack[this.stack.length - 1];
                        let token = match[0];
                        if (token === ';')
                            return;
                        else if (token.startsWith('$'))
                            this.handleNag(parseInt(token.slice(1), 10));
                        else if (token === '!')
                            this.handleNag(1);
                        else if (token === '?')
                            this.handleNag(2);
                        else if (token === '!!')
                            this.handleNag(3);
                        else if (token === '??')
                            this.handleNag(4);
                        else if (token === '!?')
                            this.handleNag(5);
                        else if (token === '?!')
                            this.handleNag(6);
                        else if (token === '1-0' || token === '1–0' || token === '1—0'
                            || token === '0-1' || token === '0–1' || token === '0—1'
                            || token === '1/2-1/2' || token === '1/2–1/2' || token === '1/2—1/2'
                            || token === '*') {
                            if (this.stack.length === 1 && token !== '*')
                                this.handleHeader('Result', token);
                        }
                        else if (token === '(') {
                            this.consumeBudget(100);
                            this.stack.push({ parent: frame.parent, root: false });
                        }
                        else if (token === ')') {
                            if (this.stack.length > 1)
                                this.stack.pop();
                        }
                        else if (token === '{') {
                            const openIndex = tokenRegex.lastIndex;
                            const beginIndex = line[openIndex] === ' ' ? openIndex + 1 : openIndex;
                            line = line.slice(beginIndex);
                            this.state = 4 /* ParserState.Comment */;
                            continue continuedLine;
                        }
                        else {
                            this.consumeBudget(100);
                            if (token.startsWith('O') || token.startsWith('0') || token.startsWith('o')) {
                                token = token.replace(/[0o]/g, 'O').replace(/[–—]/g, '-');
                            }
                            else if (token === 'Z0' || token === '0000' || token === '@@@@')
                                token = '--';
                            if (frame.node)
                                frame.parent = frame.node;
                            frame.node = new ChildNode({
                                san: token,
                                startingComments: frame.startingComments,
                            });
                            frame.startingComments = undefined;
                            frame.root = false;
                            frame.parent.children.push(frame.node);
                        }
                    }
                    return;
                }
                case 4 /* ParserState.Comment */: {
                    const closeIndex = line.indexOf('}');
                    if (closeIndex === -1) {
                        this.commentBuf.push(line);
                        return;
                    }
                    else {
                        const endIndex = closeIndex > 0 && line[closeIndex - 1] === ' ' ? closeIndex - 1 : closeIndex;
                        this.commentBuf.push(line.slice(0, endIndex));
                        this.handleComment();
                        line = line.slice(closeIndex);
                        this.state = 3 /* ParserState.Moves */;
                        freshLine = false;
                    }
                }
            }
        }
    }
    handleHeader(name, value) {
        this.game.headers.set(name, name === 'Result' ? (0, exports.makeOutcome)((0, exports.parseOutcome)(value)) : value);
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
        const comment = this.commentBuf.join('\n');
        this.commentBuf = [];
        if (frame.node) {
            (_a = frame.node.data).comments || (_a.comments = []);
            frame.node.data.comments.push(comment);
        }
        else if (frame.root) {
            (_b = this.game).comments || (_b.comments = []);
            this.game.comments.push(comment);
        }
        else {
            frame.startingComments || (frame.startingComments = []);
            frame.startingComments.push(comment);
        }
    }
    emit(err) {
        if (this.state === 4 /* ParserState.Comment */)
            this.handleComment();
        if (err)
            return this.emitGame(this.game, err);
        if (this.found)
            this.emitGame(this.game, undefined);
        this.resetGame();
    }
}
exports.PgnParser = PgnParser;
const parsePgn = (pgn, initHeaders = exports.defaultHeaders) => {
    const games = [];
    new PgnParser(game => games.push(game), initHeaders, NaN).parse(pgn);
    return games;
};
exports.parsePgn = parsePgn;
const parseVariant = (variant) => {
    switch ((variant || 'chess').toLowerCase()) {
        case 'chess':
        case 'chess960':
        case 'chess 960':
        case 'standard':
        case 'from position':
        case 'classical':
        case 'normal':
        case 'fischerandom': // Cute Chess
        case 'fischerrandom':
        case 'fischer random':
        case 'wild/0':
        case 'wild/1':
        case 'wild/2':
        case 'wild/3':
        case 'wild/4':
        case 'wild/5':
        case 'wild/6':
        case 'wild/7':
        case 'wild/8':
        case 'wild/8a':
            return 'chess';
        case 'crazyhouse':
        case 'crazy house':
        case 'house':
        case 'zh':
            return 'crazyhouse';
        case 'king of the hill':
        case 'koth':
        case 'kingofthehill':
            return 'kingofthehill';
        case 'three-check':
        case 'three check':
        case 'threecheck':
        case 'three check chess':
        case '3-check':
        case '3 check':
        case '3check':
            return '3check';
        case 'antichess':
        case 'anti chess':
        case 'anti':
            return 'antichess';
        case 'atomic':
        case 'atom':
        case 'atomic chess':
            return 'atomic';
        case 'horde':
        case 'horde chess':
            return 'horde';
        case 'racing kings':
        case 'racingkings':
        case 'racing':
        case 'race':
            return 'racingkings';
        default:
            return;
    }
};
exports.parseVariant = parseVariant;
const makeVariant = (rules) => {
    switch (rules) {
        case 'chess':
            return;
        case 'crazyhouse':
            return 'Crazyhouse';
        case 'racingkings':
            return 'Racing Kings';
        case 'horde':
            return 'Horde';
        case 'atomic':
            return 'Atomic';
        case 'antichess':
            return 'Antichess';
        case '3check':
            return 'Three-check';
        case 'kingofthehill':
            return 'King of the Hill';
    }
};
exports.makeVariant = makeVariant;
const startingPosition = (headers) => {
    const rules = (0, exports.parseVariant)(headers.get('Variant'));
    if (!rules)
        return result_1.Result.err(new chess_js_1.PositionError(chess_js_1.IllegalSetup.Variant));
    const fen = headers.get('FEN');
    if (fen)
        return (0, fen_js_1.parseFen)(fen).chain(setup => (0, variant_js_1.setupPosition)(rules, setup));
    else
        return result_1.Result.ok((0, variant_js_1.defaultPosition)(rules));
};
exports.startingPosition = startingPosition;
const setStartingPosition = (headers, pos) => {
    const variant = (0, exports.makeVariant)(pos.rules);
    if (variant)
        headers.set('Variant', variant);
    else
        headers.delete('Variant');
    const fen = (0, fen_js_1.makeFen)(pos.toSetup());
    const defaultFen = (0, fen_js_1.makeFen)((0, variant_js_1.defaultPosition)(pos.rules).toSetup());
    if (fen !== defaultFen)
        headers.set('FEN', fen);
    else
        headers.delete('FEN');
};
exports.setStartingPosition = setStartingPosition;
const isPawns = (ev) => 'pawns' in ev;
exports.isPawns = isPawns;
const isMate = (ev) => 'mate' in ev;
exports.isMate = isMate;
const makeClk = (seconds) => {
    seconds = Math.max(0, seconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    seconds = (seconds % 3600) % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toLocaleString('en', {
        minimumIntegerDigits: 2,
        maximumFractionDigits: 3,
    })}`;
};
const makeCommentShapeColor = (color) => {
    switch (color) {
        case 'green':
            return 'G';
        case 'red':
            return 'R';
        case 'yellow':
            return 'Y';
        case 'blue':
            return 'B';
    }
};
function parseCommentShapeColor(str) {
    switch (str) {
        case 'G':
            return 'green';
        case 'R':
            return 'red';
        case 'Y':
            return 'yellow';
        case 'B':
            return 'blue';
        default:
            return;
    }
}
const makeCommentShape = (shape) => shape.to === shape.from
    ? `${makeCommentShapeColor(shape.color)}${(0, util_js_1.makeSquare)(shape.to)}`
    : `${makeCommentShapeColor(shape.color)}${(0, util_js_1.makeSquare)(shape.from)}${(0, util_js_1.makeSquare)(shape.to)}`;
const parseCommentShape = (str) => {
    const color = parseCommentShapeColor(str.slice(0, 1));
    const from = (0, util_js_1.parseSquare)(str.slice(1, 3));
    const to = (0, util_js_1.parseSquare)(str.slice(3, 5));
    if (!color || !(0, util_js_1.defined)(from))
        return;
    if (str.length === 3)
        return { color, from, to: from };
    if (str.length === 5 && (0, util_js_1.defined)(to))
        return { color, from, to };
    return;
};
const makeEval = (ev) => {
    const str = (0, exports.isMate)(ev) ? '#' + ev.mate : ev.pawns.toFixed(2);
    return (0, util_js_1.defined)(ev.depth) ? str + ',' + ev.depth : str;
};
const makeComment = (comment) => {
    const builder = [];
    if ((0, util_js_1.defined)(comment.text))
        builder.push(comment.text);
    const circles = (comment.shapes || []).filter(shape => shape.to === shape.from).map(makeCommentShape);
    if (circles.length)
        builder.push(`[%csl ${circles.join(',')}]`);
    const arrows = (comment.shapes || []).filter(shape => shape.to !== shape.from).map(makeCommentShape);
    if (arrows.length)
        builder.push(`[%cal ${arrows.join(',')}]`);
    if (comment.evaluation)
        builder.push(`[%eval ${makeEval(comment.evaluation)}]`);
    if ((0, util_js_1.defined)(comment.emt))
        builder.push(`[%emt ${makeClk(comment.emt)}]`);
    if ((0, util_js_1.defined)(comment.clock))
        builder.push(`[%clk ${makeClk(comment.clock)}]`);
    return builder.join(' ');
};
exports.makeComment = makeComment;
const parseComment = (comment) => {
    let emt, clock, evaluation;
    const shapes = [];
    const text = comment
        .replace(/\s?\[%(emt|clk)\s(\d{1,5}):(\d{1,2}):(\d{1,2}(?:\.\d{0,3})?)\]\s?/g, (_, annotation, hours, minutes, seconds) => {
        const value = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseFloat(seconds);
        if (annotation === 'emt')
            emt = value;
        else if (annotation === 'clk')
            clock = value;
        return '  ';
    })
        .replace(/\s?\[%(?:csl|cal)\s([RGYB][a-h][1-8](?:[a-h][1-8])?(?:,[RGYB][a-h][1-8](?:[a-h][1-8])?)*)\]\s?/g, (_, arrows) => {
        for (const arrow of arrows.split(',')) {
            shapes.push(parseCommentShape(arrow));
        }
        return '  ';
    })
        .replace(/\s?\[%eval\s(?:#([+-]?\d{1,5})|([+-]?(?:\d{1,5}|\d{0,5}\.\d{1,2})))(?:,(\d{1,5}))?\]\s?/g, (_, mate, pawns, d) => {
        const depth = d && parseInt(d, 10);
        evaluation = mate ? { mate: parseInt(mate, 10), depth } : { pawns: parseFloat(pawns), depth };
        return '  ';
    })
        .trim();
    return {
        text,
        shapes,
        emt,
        clock,
        evaluation,
    };
};
exports.parseComment = parseComment;
//# sourceMappingURL=pgn.js.map