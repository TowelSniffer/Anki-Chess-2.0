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
import { Position, PositionError } from './chess.js';
import { FenError } from './fen.js';
import { Outcome, Rules, Square } from './types.js';
export interface Game<T> {
    headers: Map<string, string>;
    comments?: string[];
    moves: Node<T>;
}
export declare const defaultGame: <T>(initHeaders?: () => Map<string, string>) => Game<T>;
export declare class Node<T> {
    children: ChildNode<T>[];
    mainlineNodes(): Iterable<ChildNode<T>>;
    mainline(): Iterable<T>;
    end(): Node<T>;
}
export declare class ChildNode<T> extends Node<T> {
    data: T;
    constructor(data: T);
}
export declare const isChildNode: <T>(node: Node<T>) => node is ChildNode<T>;
export declare const extend: <T>(node: Node<T>, data: T[]) => Node<T>;
export declare class Box<T> {
    value: T;
    constructor(value: T);
    clone(): Box<T>;
}
export declare const transform: <T, U, C extends {
    clone(): C;
}>(node: Node<T>, ctx: C, f: (ctx: C, data: T, childIndex: number) => U | undefined) => Node<U>;
export declare const walk: <T, C extends {
    clone(): C;
}>(node: Node<T>, ctx: C, f: (ctx: C, data: T, childIndex: number) => boolean | void) => void;
export interface PgnNodeData {
    san: string;
    startingComments?: string[];
    comments?: string[];
    nags?: number[];
}
export declare const makeOutcome: (outcome: Outcome | undefined) => string;
export declare const parseOutcome: (s: string | undefined) => Outcome | undefined;
export declare const makePgn: (game: Game<PgnNodeData>) => string;
export declare const defaultHeaders: () => Map<string, string>;
export declare const emptyHeaders: () => Map<string, string>;
export interface ParseOptions {
    stream: boolean;
}
export declare class PgnError extends Error {
}
export declare class PgnParser {
    private emitGame;
    private initHeaders;
    private maxBudget;
    private lineBuf;
    private budget;
    private found;
    private state;
    private game;
    private stack;
    private commentBuf;
    constructor(emitGame: (game: Game<PgnNodeData>, err: PgnError | undefined) => void, initHeaders?: () => Map<string, string>, maxBudget?: number);
    private resetGame;
    private consumeBudget;
    parse(data: string, options?: ParseOptions): void;
    private handleLine;
    private handleHeader;
    private handleNag;
    private handleComment;
    private emit;
}
export declare const parsePgn: (pgn: string, initHeaders?: () => Map<string, string>) => Game<PgnNodeData>[];
export declare const parseVariant: (variant: string | undefined) => Rules | undefined;
export declare const makeVariant: (rules: Rules) => string | undefined;
export declare const startingPosition: (headers: Map<string, string>) => Result<Position, FenError | PositionError>;
export declare const setStartingPosition: (headers: Map<string, string>, pos: Position) => void;
export type CommentShapeColor = 'green' | 'red' | 'yellow' | 'blue';
export interface CommentShape {
    color: CommentShapeColor;
    from: Square;
    to: Square;
}
export type EvaluationPawns = {
    pawns: number;
    depth?: number;
};
export type EvaluationMate = {
    mate: number;
    depth?: number;
};
export type Evaluation = EvaluationPawns | EvaluationMate;
export declare const isPawns: (ev: Evaluation) => ev is EvaluationPawns;
export declare const isMate: (ev: Evaluation) => ev is EvaluationMate;
export interface Comment {
    text: string;
    shapes: CommentShape[];
    clock?: number;
    emt?: number;
    evaluation?: Evaluation;
}
export declare const makeComment: (comment: Partial<Comment>) => string;
export declare const parseComment: (comment: string) => Comment;
