import { Board } from './board.js';
import { Setup } from './setup.js';
import { SquareSet } from './squareSet.js';
export declare const flipVertical: (s: SquareSet) => SquareSet;
export declare const flipHorizontal: (s: SquareSet) => SquareSet;
export declare const flipDiagonal: (s: SquareSet) => SquareSet;
export declare const rotate180: (s: SquareSet) => SquareSet;
export declare const transformBoard: (board: Board, f: (s: SquareSet) => SquareSet) => Board;
export declare const transformSetup: (setup: Setup, f: (s: SquareSet) => SquareSet) => Setup;
