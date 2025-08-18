/**
 * Compatibility with other libraries.
 *
 * Convert between the formats used by chessops,
 * [chessground](https://github.com/lichess-org/chessground),
 * and [scalachess](https://github.com/lichess-org/scalachess).
 *
 * @packageDocumentation
 */
import { Position } from './chess.js';
import { Move, Rules, SquareName } from './types.js';
export interface ChessgroundDestsOpts {
    chess960?: boolean;
}
/**
 * Computes the legal move destinations in the format used by chessground.
 *
 * Includes both possible representations of castling moves (unless
 * `chess960` mode is enabled), so that the `rookCastles` option will work
 * correctly.
 */
export declare const chessgroundDests: (pos: Position, opts?: ChessgroundDestsOpts) => Map<SquareName, SquareName[]>;
export declare const chessgroundMove: (move: Move) => SquareName[];
export declare const scalachessCharPair: (move: Move) => string;
export declare const lichessRules: (variant: "standard" | "chess960" | "antichess" | "fromPosition" | "kingOfTheHill" | "threeCheck" | "atomic" | "horde" | "racingKings" | "crazyhouse") => Rules;
export declare const lichessVariant: (rules: Rules) => "standard" | "antichess" | "kingOfTheHill" | "threeCheck" | "atomic" | "horde" | "racingKings" | "crazyhouse";
