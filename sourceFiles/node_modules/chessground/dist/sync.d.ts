import { DrawShape } from './draw';
export interface SyncableShape {
    shape: DrawShape;
    current: boolean;
    hash: Hash;
}
export type Hash = string;
export declare function syncShapes(shapes: SyncableShape[], root: HTMLElement | SVGElement, renderShape: (shape: SyncableShape) => HTMLElement | SVGElement): void;
