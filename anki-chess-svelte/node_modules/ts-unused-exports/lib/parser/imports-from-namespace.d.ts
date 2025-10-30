import * as ts from 'typescript';
import { FromWhat } from './common';
import { Imports } from '../types';
export declare const addImportsFromNamespace: (node: ts.Node, imports: Imports, addImport: (fw: FromWhat) => void) => void;
