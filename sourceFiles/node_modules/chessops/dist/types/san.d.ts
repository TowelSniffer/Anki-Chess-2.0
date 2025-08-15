import { Position } from './chess.js';
import { Move } from './types.js';
export declare const makeSanAndPlay: (pos: Position, move: Move) => string;
export declare const makeSanVariation: (pos: Position, variation: Move[]) => string;
export declare const makeSan: (pos: Position, move: Move) => string;
export declare const parseSan: (pos: Position, san: string) => Move | undefined;
