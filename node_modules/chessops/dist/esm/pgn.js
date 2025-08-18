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
import { Result } from '@badrap/result';
import { IllegalSetup, PositionError } from './chess.js';
import { makeFen, parseFen } from './fen.js';
import { defined, makeSquare, parseSquare } from './util.js';
import { defaultPosition, setupPosition } from './variant.js';
export const defaultGame = (initHeaders = defaultHeaders) => ({
    headers: initHeaders(),
    moves: new Node(),
});
export class Node {
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
export class ChildNode extends Node {
    constructor(data) {
        super();
        this.data = data;
    }
}
export const isChildNode = (node) => node instanceof ChildNode;
export const extend = (node, data) => {
    for (const d of data) {
        const child = new ChildNode(d);
        node.children.push(child);
        node = child;
    }
    return node;
};
export class Box {
    constructor(value) {
        this.value = value;
    }
    clone() {
        return new Box(this.value);
    }
}
export const transform = (node, ctx, f) => {
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
            if (defined(data)) {
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
export const walk = (node, ctx, f) => {
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
export const makeOutcome = (outcome) => {
    if (!outcome)
        return '*';
    else if (outcome.winner === 'white')
        return '1-0';
    else if (outcome.winner === 'black')
        return '0-1';
    else
        return '1/2-1/2';
};
export const parseOutcome = (s) => {
    if (s === '1-0' || s === '1–0' || s === '1—0')
        return { winner: 'white' };
    else if (s === '0-1' || s === '0–1' || s === '0—1')
        return { winner: 'black' };
    else if (s === '1/2-1/2' || s === '1/2–1/2' || s === '1/2—1/2')
        return { winner: undefined };
    else
        return;
};
const escapeHeader = (value) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const safeComment = (comment) => comment.replace(/\}/g, '');
export const makePgn = (game) => {
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
        ? parseFen(fen).unwrap(setup => (setup.fullmoves - 1) * 2 + (setup.turn === 'white' ? 0 : 1), _ => 0)
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
    tokens.push(makeOutcome(parseOutcome(game.headers.get('Result'))));
    builder.push(tokens.join(' '), '\n');
    return builder.join('');
};
export const defaultHeaders = () => new Map([
    ['Event', '?'],
    ['Site', '?'],
    ['Date', '????.??.??'],
    ['Round', '?'],
    ['White', '?'],
    ['Black', '?'],
    ['Result', '*'],
]);
export const emptyHeaders = () => new Map();
const BOM = '\ufeff';
const isWhitespace = (line) => /^\s*$/.test(line);
const isCommentLine = (line) => line.startsWith('%');
export class PgnError extends Error {
}
export class PgnParser {
    constructor(emitGame, initHeaders = defaultHeaders, maxBudget = 1000000) {
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
        this.game = defaultGame(this.initHeaders);
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
        this.game.headers.set(name, name === 'Result' ? makeOutcome(parseOutcome(value)) : value);
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
export const parsePgn = (pgn, initHeaders = defaultHeaders) => {
    const games = [];
    new PgnParser(game => games.push(game), initHeaders, NaN).parse(pgn);
    return games;
};
export const parseVariant = (variant) => {
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
export const makeVariant = (rules) => {
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
export const startingPosition = (headers) => {
    const rules = parseVariant(headers.get('Variant'));
    if (!rules)
        return Result.err(new PositionError(IllegalSetup.Variant));
    const fen = headers.get('FEN');
    if (fen)
        return parseFen(fen).chain(setup => setupPosition(rules, setup));
    else
        return Result.ok(defaultPosition(rules));
};
export const setStartingPosition = (headers, pos) => {
    const variant = makeVariant(pos.rules);
    if (variant)
        headers.set('Variant', variant);
    else
        headers.delete('Variant');
    const fen = makeFen(pos.toSetup());
    const defaultFen = makeFen(defaultPosition(pos.rules).toSetup());
    if (fen !== defaultFen)
        headers.set('FEN', fen);
    else
        headers.delete('FEN');
};
export const isPawns = (ev) => 'pawns' in ev;
export const isMate = (ev) => 'mate' in ev;
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
    ? `${makeCommentShapeColor(shape.color)}${makeSquare(shape.to)}`
    : `${makeCommentShapeColor(shape.color)}${makeSquare(shape.from)}${makeSquare(shape.to)}`;
const parseCommentShape = (str) => {
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
const makeEval = (ev) => {
    const str = isMate(ev) ? '#' + ev.mate : ev.pawns.toFixed(2);
    return defined(ev.depth) ? str + ',' + ev.depth : str;
};
export const makeComment = (comment) => {
    const builder = [];
    if (defined(comment.text))
        builder.push(comment.text);
    const circles = (comment.shapes || []).filter(shape => shape.to === shape.from).map(makeCommentShape);
    if (circles.length)
        builder.push(`[%csl ${circles.join(',')}]`);
    const arrows = (comment.shapes || []).filter(shape => shape.to !== shape.from).map(makeCommentShape);
    if (arrows.length)
        builder.push(`[%cal ${arrows.join(',')}]`);
    if (comment.evaluation)
        builder.push(`[%eval ${makeEval(comment.evaluation)}]`);
    if (defined(comment.emt))
        builder.push(`[%emt ${makeClk(comment.emt)}]`);
    if (defined(comment.clock))
        builder.push(`[%clk ${makeClk(comment.clock)}]`);
    return builder.join(' ');
};
export const parseComment = (comment) => {
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
//# sourceMappingURL=pgn.js.map