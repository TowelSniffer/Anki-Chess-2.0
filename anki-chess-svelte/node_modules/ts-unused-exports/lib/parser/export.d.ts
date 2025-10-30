import * as ts from 'typescript';
import { ExtraCommandLineOptions, LocationInFile } from '../types';
import { FromWhat } from './common';
export declare const extractExportStatement: (decl: ts.ExportDeclaration) => string[];
export declare const extractExportFromImport: (decl: ts.ExportDeclaration, moduleSpecifier: ts.Expression) => {
    exported: FromWhat;
    imported: FromWhat;
};
export declare const extractExportNames: (path: string, node: ts.Node) => string[];
export declare const addExportCore: (exportName: string, file: ts.SourceFile, node: ts.Node, exportLocations: LocationInFile[], exports: string[], extraOptions?: ExtraCommandLineOptions | undefined) => void;
