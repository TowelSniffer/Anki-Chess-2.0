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
import { IllegalSetup, Position, PositionError } from './chess.js';
import { FenError, makeFen, parseFen } from './fen.js';
import { Outcome, Rules, Square } from './types.js';
import { defined, makeSquare, parseSquare } from './util.js';
import { defaultPosition, setupPosition } from './variant.js';

export interface Game<T> {
  headers: Map<string, string>;
  comments?: string[];
  moves: Node<T>;
}

export const defaultGame = <T>(initHeaders: () => Map<string, string> = defaultHeaders): Game<T> => ({
  headers: initHeaders(),
  moves: new Node(),
});

export class Node<T> {
  children: ChildNode<T>[] = [];

  *mainlineNodes(): Iterable<ChildNode<T>> {
    let node: Node<T> = this;
    while (node.children.length) {
      const child = node.children[0];
      yield child;
      node = child;
    }
  }

  *mainline(): Iterable<T> {
    for (const child of this.mainlineNodes()) yield child.data;
  }

  end(): Node<T> {
    let node: Node<T> = this;
    while (node.children.length) node = node.children[0];
    return node;
  }
}

export class ChildNode<T> extends Node<T> {
  constructor(public data: T) {
    super();
  }
}

export const isChildNode = <T>(node: Node<T>): node is ChildNode<T> => node instanceof ChildNode;

export const extend = <T>(node: Node<T>, data: T[]): Node<T> => {
  for (const d of data) {
    const child = new ChildNode(d);
    node.children.push(child);
    node = child;
  }
  return node;
};

export class Box<T> {
  constructor(public value: T) {}

  clone(): Box<T> {
    return new Box(this.value);
  }
}

export const transform = <T, U, C extends { clone(): C }>(
  node: Node<T>,
  ctx: C,
  f: (ctx: C, data: T, childIndex: number) => U | undefined,
): Node<U> => {
  const root = new Node<U>();
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

export const walk = <T, C extends { clone(): C }>(
  node: Node<T>,
  ctx: C,
  f: (ctx: C, data: T, childIndex: number) => boolean | void,
) => {
  const stack = [{ node, ctx }];
  let frame;
  while ((frame = stack.pop())) {
    for (let childIndex = 0; childIndex < frame.node.children.length; childIndex++) {
      const ctx = childIndex < frame.node.children.length - 1 ? frame.ctx.clone() : frame.ctx;
      const child = frame.node.children[childIndex];
      if (f(ctx, child.data, childIndex) !== false) stack.push({ node: child, ctx });
    }
  }
};

export interface PgnNodeData {
  san: string;
  startingComments?: string[];
  comments?: string[];
  nags?: number[];
}

export const makeOutcome = (outcome: Outcome | undefined): string => {
  if (!outcome) return '*';
  else if (outcome.winner === 'white') return '1-0';
  else if (outcome.winner === 'black') return '0-1';
  else return '1/2-1/2';
};

export const parseOutcome = (s: string | undefined): Outcome | undefined => {
  if (s === '1-0' || s === '1–0' || s === '1—0') return { winner: 'white' };
  else if (s === '0-1' || s === '0–1' || s === '0—1') return { winner: 'black' };
  else if (s === '1/2-1/2' || s === '1/2–1/2' || s === '1/2—1/2') return { winner: undefined };
  else return;
};

const escapeHeader = (value: string): string => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const safeComment = (comment: string): string => comment.replace(/\}/g, '');

const enum MakePgnState {
  Pre = 0,
  Sidelines = 1,
  End = 2,
}

interface MakePgnFrame {
  state: MakePgnState;
  ply: number;
  node: ChildNode<PgnNodeData>;
  sidelines: Iterator<ChildNode<PgnNodeData>>;
  startsVariation: boolean;
  inVariation: boolean;
}

export const makePgn = (game: Game<PgnNodeData>): string => {
  const builder = [],
    tokens = [];

  if (game.headers.size) {
    for (const [key, value] of game.headers.entries()) {
      builder.push('[', key, ' "', escapeHeader(value), '"]\n');
    }
    builder.push('\n');
  }

  for (const comment of game.comments || []) tokens.push('{', safeComment(comment), '}');

  const fen = game.headers.get('FEN');
  const initialPly = fen
    ? parseFen(fen).unwrap(
      setup => (setup.fullmoves - 1) * 2 + (setup.turn === 'white' ? 0 : 1),
      _ => 0,
    )
    : 0;

  const stack: MakePgnFrame[] = [];

  const variations = game.moves.children[Symbol.iterator]();
  const firstVariation = variations.next();
  if (!firstVariation.done) {
    stack.push({
      state: MakePgnState.Pre,
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
      case MakePgnState.Pre:
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
        frame.state = MakePgnState.Sidelines; // fall through
      case MakePgnState.Sidelines: {
        const child = frame.sidelines.next();
        if (child.done) {
          const variations = frame.node.children[Symbol.iterator]();
          const firstVariation = variations.next();
          if (!firstVariation.done) {
            stack.push({
              state: MakePgnState.Pre,
              ply: frame.ply + 1,
              node: firstVariation.value,
              sidelines: variations,
              startsVariation: false,
              inVariation: false,
            });
          }
          frame.state = MakePgnState.End;
        } else {
          tokens.push('(');
          forceMoveNumber = true;
          stack.push({
            state: MakePgnState.Pre,
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
      case MakePgnState.End:
        stack.pop();
    }
  }

  tokens.push(makeOutcome(parseOutcome(game.headers.get('Result'))));

  builder.push(tokens.join(' '), '\n');
  return builder.join('');
};

export const defaultHeaders = (): Map<string, string> =>
  new Map([
    ['Event', '?'],
    ['Site', '?'],
    ['Date', '????.??.??'],
    ['Round', '?'],
    ['White', '?'],
    ['Black', '?'],
    ['Result', '*'],
  ]);

export const emptyHeaders = (): Map<string, string> => new Map();

const BOM = '\ufeff';

const isWhitespace = (line: string): boolean => /^\s*$/.test(line);

const isCommentLine = (line: string): boolean => line.startsWith('%');

export interface ParseOptions {
  stream: boolean;
}

interface ParserFrame {
  parent: Node<PgnNodeData>;
  root: boolean;
  node?: ChildNode<PgnNodeData>;
  startingComments?: string[];
}

const enum ParserState {
  Bom = 0,
  Pre = 1,
  Headers = 2,
  Moves = 3,
  Comment = 4,
}

export class PgnError extends Error {}

export class PgnParser {
  private lineBuf: string[] = [];

  private budget: number;
  private found: boolean;
  private state: ParserState;
  private game: Game<PgnNodeData>;
  private stack: ParserFrame[];
  private commentBuf: string[];

  constructor(
    private emitGame: (game: Game<PgnNodeData>, err: PgnError | undefined) => void,
    private initHeaders: () => Map<string, string> = defaultHeaders,
    private maxBudget = 1_000_000,
  ) {
    this.resetGame();
    this.state = ParserState.Bom;
  }

  private resetGame() {
    this.budget = this.maxBudget;
    this.found = false;
    this.state = ParserState.Pre;
    this.game = defaultGame(this.initHeaders);
    this.stack = [{ parent: this.game.moves, root: true }];
    this.commentBuf = [];
  }

  private consumeBudget(cost: number) {
    this.budget -= cost;
    if (this.budget < 0) throw new PgnError('ERR_PGN_BUDGET');
  }

  parse(data: string, options?: ParseOptions): void {
    if (this.budget < 0) return;
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

      if (!options?.stream) {
        this.handleLine();
        this.emit(undefined);
      }
    } catch (err: unknown) {
      this.emit(err as PgnError);
    }
  }

  private handleLine() {
    let freshLine = true;
    let line = this.lineBuf.join('');
    this.lineBuf = [];

    continuedLine: for (;;) {
      switch (this.state) {
        case ParserState.Bom:
          if (line.startsWith(BOM)) line = line.slice(BOM.length);
          this.state = ParserState.Pre; // fall through
        case ParserState.Pre:
          if (isWhitespace(line) || isCommentLine(line)) return;
          this.found = true;
          this.state = ParserState.Headers; // fall through
        case ParserState.Headers: {
          if (isCommentLine(line)) return;
          let moreHeaders = true;
          while (moreHeaders) {
            moreHeaders = false;
            line = line.replace(
              /^\s*\[([A-Za-z0-9][A-Za-z0-9_+#=:-]*)\s+"((?:[^"\\]|\\"|\\\\)*)"\]/,
              (_match, headerName, headerValue) => {
                this.consumeBudget(200);
                this.handleHeader(headerName, headerValue.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
                moreHeaders = true;
                freshLine = false;
                return '';
              },
            );
          }
          if (isWhitespace(line)) return;
          this.state = ParserState.Moves; // fall through
        }
        case ParserState.Moves: {
          if (freshLine) {
            if (isCommentLine(line)) return;
            if (isWhitespace(line)) return this.emit(undefined);
          }
          const tokenRegex =
            /(?:[NBKRQ]?[a-h]?[1-8]?[-x]?[a-h][1-8](?:=?[nbrqkNBRQK])?|[pnbrqkPNBRQK]?@[a-h][1-8]|[O0o][-–—][O0o](?:[-–—][O0o])?)[+#]?|--|Z0|0000|@@@@|{|;|\$\d{1,4}|[?!]{1,2}|\(|\)|\*|1[-–—]0|0[-–—]1|1\/2[-–—]1\/2/g;
          let match;
          while ((match = tokenRegex.exec(line))) {
            const frame = this.stack[this.stack.length - 1];
            let token = match[0];
            if (token === ';') return;
            else if (token.startsWith('$')) this.handleNag(parseInt(token.slice(1), 10));
            else if (token === '!') this.handleNag(1);
            else if (token === '?') this.handleNag(2);
            else if (token === '!!') this.handleNag(3);
            else if (token === '??') this.handleNag(4);
            else if (token === '!?') this.handleNag(5);
            else if (token === '?!') this.handleNag(6);
            else if (
              token === '1-0' || token === '1–0' || token === '1—0'
              || token === '0-1' || token === '0–1' || token === '0—1'
              || token === '1/2-1/2' || token === '1/2–1/2' || token === '1/2—1/2'
              || token === '*'
            ) {
              if (this.stack.length === 1 && token !== '*') this.handleHeader('Result', token);
            } else if (token === '(') {
              this.consumeBudget(100);
              this.stack.push({ parent: frame.parent, root: false });
            } else if (token === ')') {
              if (this.stack.length > 1) this.stack.pop();
            } else if (token === '{') {
              const openIndex = tokenRegex.lastIndex;
              const beginIndex = line[openIndex] === ' ' ? openIndex + 1 : openIndex;
              line = line.slice(beginIndex);
              this.state = ParserState.Comment;
              continue continuedLine;
            } else {
              this.consumeBudget(100);
              if (token.startsWith('O') || token.startsWith('0') || token.startsWith('o')) {
                token = token.replace(/[0o]/g, 'O').replace(/[–—]/g, '-');
              } else if (token === 'Z0' || token === '0000' || token === '@@@@') token = '--';

              if (frame.node) frame.parent = frame.node;
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
        case ParserState.Comment: {
          const closeIndex = line.indexOf('}');
          if (closeIndex === -1) {
            this.commentBuf.push(line);
            return;
          } else {
            const endIndex = closeIndex > 0 && line[closeIndex - 1] === ' ' ? closeIndex - 1 : closeIndex;
            this.commentBuf.push(line.slice(0, endIndex));
            this.handleComment();
            line = line.slice(closeIndex);
            this.state = ParserState.Moves;
            freshLine = false;
          }
        }
      }
    }
  }

  private handleHeader(name: string, value: string) {
    this.game.headers.set(name, name === 'Result' ? makeOutcome(parseOutcome(value)) : value);
  }

  private handleNag(nag: number) {
    this.consumeBudget(50);
    const frame = this.stack[this.stack.length - 1];
    if (frame.node) {
      frame.node.data.nags ||= [];
      frame.node.data.nags.push(nag);
    }
  }

  private handleComment() {
    this.consumeBudget(100);
    const frame = this.stack[this.stack.length - 1];
    const comment = this.commentBuf.join('\n');
    this.commentBuf = [];
    if (frame.node) {
      frame.node.data.comments ||= [];
      frame.node.data.comments.push(comment);
    } else if (frame.root) {
      this.game.comments ||= [];
      this.game.comments.push(comment);
    } else {
      frame.startingComments ||= [];
      frame.startingComments.push(comment);
    }
  }

  private emit(err: PgnError | undefined) {
    if (this.state === ParserState.Comment) this.handleComment();
    if (err) return this.emitGame(this.game, err);
    if (this.found) this.emitGame(this.game, undefined);
    this.resetGame();
  }
}

export const parsePgn = (pgn: string, initHeaders: () => Map<string, string> = defaultHeaders): Game<PgnNodeData>[] => {
  const games: Game<PgnNodeData>[] = [];
  new PgnParser(game => games.push(game), initHeaders, NaN).parse(pgn);
  return games;
};

export const parseVariant = (variant: string | undefined): Rules | undefined => {
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

export const makeVariant = (rules: Rules): string | undefined => {
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

export const startingPosition = (headers: Map<string, string>): Result<Position, FenError | PositionError> => {
  const rules = parseVariant(headers.get('Variant'));
  if (!rules) return Result.err(new PositionError(IllegalSetup.Variant));
  const fen = headers.get('FEN');
  if (fen) return parseFen(fen).chain(setup => setupPosition(rules, setup));
  else return Result.ok(defaultPosition(rules));
};

export const setStartingPosition = (headers: Map<string, string>, pos: Position) => {
  const variant = makeVariant(pos.rules);
  if (variant) headers.set('Variant', variant);
  else headers.delete('Variant');

  const fen = makeFen(pos.toSetup());
  const defaultFen = makeFen(defaultPosition(pos.rules).toSetup());
  if (fen !== defaultFen) headers.set('FEN', fen);
  else headers.delete('FEN');
};

export type CommentShapeColor = 'green' | 'red' | 'yellow' | 'blue';

export interface CommentShape {
  color: CommentShapeColor;
  from: Square;
  to: Square;
}

export type EvaluationPawns = { pawns: number; depth?: number };
export type EvaluationMate = { mate: number; depth?: number };
export type Evaluation = EvaluationPawns | EvaluationMate;

export const isPawns = (ev: Evaluation): ev is EvaluationPawns => 'pawns' in ev;
export const isMate = (ev: Evaluation): ev is EvaluationMate => 'mate' in ev;

export interface Comment {
  text: string;
  shapes: CommentShape[];
  clock?: number;
  emt?: number;
  evaluation?: Evaluation;
}

const makeClk = (seconds: number): string => {
  seconds = Math.max(0, seconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  seconds = (seconds % 3600) % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}:${
    seconds.toLocaleString('en', {
      minimumIntegerDigits: 2,
      maximumFractionDigits: 3,
    })
  }`;
};

const makeCommentShapeColor = (color: CommentShapeColor): 'G' | 'R' | 'Y' | 'B' => {
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

function parseCommentShapeColor(str: 'G' | 'R' | 'Y' | 'B'): CommentShapeColor;
function parseCommentShapeColor(str: string): CommentShapeColor | undefined;
function parseCommentShapeColor(str: string): CommentShapeColor | undefined {
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

const makeCommentShape = (shape: CommentShape): string =>
  shape.to === shape.from
    ? `${makeCommentShapeColor(shape.color)}${makeSquare(shape.to)}`
    : `${makeCommentShapeColor(shape.color)}${makeSquare(shape.from)}${makeSquare(shape.to)}`;

const parseCommentShape = (str: string): CommentShape | undefined => {
  const color = parseCommentShapeColor(str.slice(0, 1));
  const from = parseSquare(str.slice(1, 3));
  const to = parseSquare(str.slice(3, 5));
  if (!color || !defined(from)) return;
  if (str.length === 3) return { color, from, to: from };
  if (str.length === 5 && defined(to)) return { color, from, to };
  return;
};

const makeEval = (ev: Evaluation): string => {
  const str = isMate(ev) ? '#' + ev.mate : ev.pawns.toFixed(2);
  return defined(ev.depth) ? str + ',' + ev.depth : str;
};

export const makeComment = (comment: Partial<Comment>): string => {
  const builder = [];
  if (defined(comment.text)) builder.push(comment.text);
  const circles = (comment.shapes || []).filter(shape => shape.to === shape.from).map(makeCommentShape);
  if (circles.length) builder.push(`[%csl ${circles.join(',')}]`);
  const arrows = (comment.shapes || []).filter(shape => shape.to !== shape.from).map(makeCommentShape);
  if (arrows.length) builder.push(`[%cal ${arrows.join(',')}]`);
  if (comment.evaluation) builder.push(`[%eval ${makeEval(comment.evaluation)}]`);
  if (defined(comment.emt)) builder.push(`[%emt ${makeClk(comment.emt)}]`);
  if (defined(comment.clock)) builder.push(`[%clk ${makeClk(comment.clock)}]`);
  return builder.join(' ');
};

export const parseComment = (comment: string): Comment => {
  let emt, clock, evaluation;
  const shapes: CommentShape[] = [];
  const text = comment
    .replace(
      /\s?\[%(emt|clk)\s(\d{1,5}):(\d{1,2}):(\d{1,2}(?:\.\d{0,3})?)\]\s?/g,
      (_, annotation, hours, minutes, seconds) => {
        const value = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseFloat(seconds);
        if (annotation === 'emt') emt = value;
        else if (annotation === 'clk') clock = value;
        return '  ';
      },
    )
    .replace(
      /\s?\[%(?:csl|cal)\s([RGYB][a-h][1-8](?:[a-h][1-8])?(?:,[RGYB][a-h][1-8](?:[a-h][1-8])?)*)\]\s?/g,
      (_, arrows) => {
        for (const arrow of arrows.split(',')) {
          shapes.push(parseCommentShape(arrow)!);
        }
        return '  ';
      },
    )
    .replace(
      /\s?\[%eval\s(?:#([+-]?\d{1,5})|([+-]?(?:\d{1,5}|\d{0,5}\.\d{1,2})))(?:,(\d{1,5}))?\]\s?/g,
      (_, mate, pawns, d) => {
        const depth = d && parseInt(d, 10);
        evaluation = mate ? { mate: parseInt(mate, 10), depth } : { pawns: parseFloat(pawns), depth };
        return '  ';
      },
    )
    .trim();
  return {
    text,
    shapes,
    emt,
    clock,
    evaluation,
  };
};
