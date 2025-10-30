import * as ts from 'typescript';
import * as tsconfigPaths from 'tsconfig-paths';
import { FromWhat } from './common';
import { Imports } from '../types';
export declare const extractImport: (decl: ts.ImportDeclaration) => FromWhat;
export declare const addImportCore: (fw: FromWhat, pathIn: string, imports: Imports, baseUrl: string, tsconfigPathsMatcher?: tsconfigPaths.MatchPath | undefined) => string | undefined;
