import { Api } from './api.js';
import { Config } from './config.js';
export declare function initModule({ el, config }: {
    el: HTMLElement;
    config?: Config;
}): Api;
export declare function Chessground(element: HTMLElement, config?: Config): Api;
