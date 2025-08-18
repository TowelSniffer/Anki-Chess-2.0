import { Result } from '@badrap/result';
import { Board } from './board.js';
import { Material, RemainingChecks, Setup } from './setup.js';
import { SquareSet } from './squareSet.js';
import { ByCastlingSide, ByColor, CastlingSide, Color, Move, Outcome, Piece, Rules, Square } from './types.js';
export declare enum IllegalSetup {
    Empty = "ERR_EMPTY",
    OppositeCheck = "ERR_OPPOSITE_CHECK",
    PawnsOnBackrank = "ERR_PAWNS_ON_BACKRANK",
    Kings = "ERR_KINGS",
    Variant = "ERR_VARIANT"
}
export declare class PositionError extends Error {
}
export declare class Castles {
    castlingRights: SquareSet;
    rook: ByColor<ByCastlingSide<Square | undefined>>;
    path: ByColor<ByCastlingSide<SquareSet>>;
    private constructor();
    static default(): Castles;
    static empty(): Castles;
    clone(): Castles;
    private add;
    static fromSetup(setup: Setup): Castles;
    discardRook(square: Square): void;
    discardColor(color: Color): void;
}
export interface Context {
    king: Square | undefined;
    blockers: SquareSet;
    checkers: SquareSet;
    variantEnd: boolean;
    mustCapture: boolean;
}
export declare abstract class Position {
    readonly rules: Rules;
    board: Board;
    pockets: Material | undefined;
    turn: Color;
    castles: Castles;
    epSquare: Square | undefined;
    remainingChecks: RemainingChecks | undefined;
    halfmoves: number;
    fullmoves: number;
    protected constructor(rules: Rules);
    reset(): void;
    protected setupUnchecked(setup: Setup): void;
    kingAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet;
    protected playCaptureAt(square: Square, captured: Piece): void;
    ctx(): Context;
    clone(): Position;
    protected validate(): Result<undefined, PositionError>;
    dropDests(_ctx?: Context): SquareSet;
    dests(square: Square, ctx?: Context): SquareSet;
    isVariantEnd(): boolean;
    variantOutcome(_ctx?: Context): Outcome | undefined;
    hasInsufficientMaterial(color: Color): boolean;
    toSetup(): Setup;
    isInsufficientMaterial(): boolean;
    hasDests(ctx?: Context): boolean;
    isLegal(move: Move, ctx?: Context): boolean;
    isCheck(): boolean;
    isEnd(ctx?: Context): boolean;
    isCheckmate(ctx?: Context): boolean;
    isStalemate(ctx?: Context): boolean;
    outcome(ctx?: Context): Outcome | undefined;
    allDests(ctx?: Context): Map<Square, SquareSet>;
    play(move: Move): void;
}
export declare class Chess extends Position {
    private constructor();
    static default(): Chess;
    static fromSetup(setup: Setup): Result<Chess, PositionError>;
    clone(): Chess;
}
export declare const pseudoDests: (pos: Position, square: Square, ctx: Context) => SquareSet;
export declare const equalsIgnoreMoves: (left: Position, right: Position) => boolean;
export declare const castlingSide: (pos: Position, move: Move) => CastlingSide | undefined;
export declare const normalizeMove: (pos: Position, move: Move) => Move;
export declare const isStandardMaterialSide: (board: Board, color: Color) => boolean;
export declare const isStandardMaterial: (pos: Chess) => boolean;
export declare const isImpossibleCheck: (pos: Position) => boolean;
