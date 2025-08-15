import { Id } from './interfaces';
export declare class Path {
    readonly path: string;
    constructor(path: string);
    size: () => number;
    head: () => Id;
    tail: () => Path;
    init: () => Path;
    last: () => Id;
    empty: () => boolean;
    contains: (other: Path) => boolean;
    isChildOf: (parent: Path) => boolean;
    append: (id: Id) => Path;
    equals: (other: Path) => boolean;
    static root: Path;
}
