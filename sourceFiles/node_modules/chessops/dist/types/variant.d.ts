import { Result } from '@badrap/result';
import { Castles, castlingSide, Chess, Context, equalsIgnoreMoves, IllegalSetup, isImpossibleCheck, normalizeMove, Position, PositionError } from './chess.js';
import { Setup } from './setup.js';
import { SquareSet } from './squareSet.js';
import { Color, Outcome, Piece, Rules, Square } from './types.js';
export { Castles, castlingSide, Chess, Context, equalsIgnoreMoves, IllegalSetup, isImpossibleCheck, normalizeMove, Position, PositionError, };
export declare class Crazyhouse extends Position {
    private constructor();
    reset(): void;
    protected setupUnchecked(setup: Setup): void;
    static default(): Crazyhouse;
    static fromSetup(setup: Setup): Result<Crazyhouse, PositionError>;
    clone(): Crazyhouse;
    protected validate(): Result<undefined, PositionError>;
    hasInsufficientMaterial(color: Color): boolean;
    dropDests(ctx?: Context): SquareSet;
}
export declare class Atomic extends Position {
    private constructor();
    static default(): Atomic;
    static fromSetup(setup: Setup): Result<Atomic, PositionError>;
    clone(): Atomic;
    protected validate(): Result<undefined, PositionError>;
    kingAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet;
    protected playCaptureAt(square: Square, captured: Piece): void;
    hasInsufficientMaterial(color: Color): boolean;
    dests(square: Square, ctx?: Context): SquareSet;
    isVariantEnd(): boolean;
    variantOutcome(_ctx?: Context): Outcome | undefined;
}
export declare class Antichess extends Position {
    private constructor();
    reset(): void;
    protected setupUnchecked(setup: Setup): void;
    static default(): Antichess;
    static fromSetup(setup: Setup): Result<Antichess, PositionError>;
    clone(): Antichess;
    protected validate(): Result<undefined, PositionError>;
    kingAttackers(_square: Square, _attacker: Color, _occupied: SquareSet): SquareSet;
    ctx(): Context;
    dests(square: Square, ctx?: Context): SquareSet;
    hasInsufficientMaterial(color: Color): boolean;
    isVariantEnd(): boolean;
    variantOutcome(ctx?: Context): Outcome | undefined;
}
export declare class KingOfTheHill extends Position {
    private constructor();
    static default(): KingOfTheHill;
    static fromSetup(setup: Setup): Result<KingOfTheHill, PositionError>;
    clone(): KingOfTheHill;
    hasInsufficientMaterial(_color: Color): boolean;
    isVariantEnd(): boolean;
    variantOutcome(_ctx?: Context): Outcome | undefined;
}
export declare class ThreeCheck extends Position {
    private constructor();
    reset(): void;
    protected setupUnchecked(setup: Setup): void;
    static default(): ThreeCheck;
    static fromSetup(setup: Setup): Result<ThreeCheck, PositionError>;
    clone(): ThreeCheck;
    hasInsufficientMaterial(color: Color): boolean;
    isVariantEnd(): boolean;
    variantOutcome(_ctx?: Context): Outcome | undefined;
}
export declare class RacingKings extends Position {
    private constructor();
    reset(): void;
    setupUnchecked(setup: Setup): void;
    static default(): RacingKings;
    static fromSetup(setup: Setup): Result<RacingKings, PositionError>;
    clone(): RacingKings;
    protected validate(): Result<undefined, PositionError>;
    dests(square: Square, ctx?: Context): SquareSet;
    hasInsufficientMaterial(_color: Color): boolean;
    isVariantEnd(): boolean;
    variantOutcome(ctx?: Context): Outcome | undefined;
}
export declare class Horde extends Position {
    private constructor();
    reset(): void;
    static default(): Horde;
    static fromSetup(setup: Setup): Result<Horde, PositionError>;
    clone(): Horde;
    protected validate(): Result<undefined, PositionError>;
    hasInsufficientMaterial(color: Color): boolean;
    isVariantEnd(): boolean;
    variantOutcome(_ctx?: Context): Outcome | undefined;
}
export declare const defaultPosition: (rules: Rules) => Position;
export declare const setupPosition: (rules: Rules, setup: Setup) => Result<Position, PositionError>;
export declare const isStandardMaterial: (pos: Position) => boolean;
