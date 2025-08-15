import { State } from './state.js';
import * as cg from './types.js';
export declare function bindBoard(s: State, onResize: () => void): void;
export declare function bindDocument(s: State, onResize: () => void): cg.Unbind;
