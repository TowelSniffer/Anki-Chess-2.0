import * as ts from 'typescript';
export declare const STAR: string[];
export interface FromWhat {
    from: string;
    what: string[];
    isExportStarAs?: boolean;
}
export declare const getFromText: (moduleSpecifier: string) => string;
export declare const getFrom: (moduleSpecifier: ts.Expression) => string;
