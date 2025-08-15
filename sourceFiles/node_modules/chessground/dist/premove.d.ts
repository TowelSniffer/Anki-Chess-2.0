import * as cg from './types.js';
type Mobility = (x1: number, y1: number, x2: number, y2: number) => boolean;
export declare const knight: Mobility;
export declare const queen: Mobility;
export declare function premove(pieces: cg.Pieces, key: cg.Key, canCastle: boolean): cg.Key[];
export {};
