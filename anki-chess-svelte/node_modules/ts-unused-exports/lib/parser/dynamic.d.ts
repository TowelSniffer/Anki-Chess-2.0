import * as ts from 'typescript';
import { FromWhat } from './common';
export declare const mayContainDynamicImports: (node: ts.Node) => boolean;
export declare const addDynamicImports: (node: ts.Node, addImport: (fw: FromWhat) => void) => void;
