import * as ts from 'typescript';
import { ExtraCommandLineOptions, Imports } from '../types';
import { FromWhat } from './common';
export declare const processNode: (node: ts.Node, path: string, addImport: (fw: FromWhat) => string | undefined, addExport: (exportName: string, node: ts.Node) => void, imports: Imports, exportNames: string[], extraOptions?: ExtraCommandLineOptions | undefined, namespace?: string) => void;
