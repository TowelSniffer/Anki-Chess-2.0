import PgnViewer from '../pgnViewer';
import { Config as CgConfig } from 'chessground/config';
import { VNode } from 'snabbdom';
export default function view(ctrl: PgnViewer): VNode;
export declare const makeConfig: (ctrl: PgnViewer, rootEl: HTMLElement) => CgConfig;
