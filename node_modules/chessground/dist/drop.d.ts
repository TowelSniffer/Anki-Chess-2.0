import { State } from './state.js';
import * as cg from './types.js';
export declare function setDropMode(s: State, piece?: cg.Piece): void;
export declare function cancelDropMode(s: State): void;
export declare function drop(s: State, e: cg.MouchEvent): void;
