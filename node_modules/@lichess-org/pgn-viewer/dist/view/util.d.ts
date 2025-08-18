import { Hooks } from 'snabbdom';
export declare function bindMobileMousedown(el: HTMLElement, f: (e: Event) => unknown, redraw?: () => void): void;
export declare const bind: <E extends Event>(eventName: string, f: (e: E) => any, redraw?: () => void, passive?: boolean) => Hooks;
export declare function onInsert<A extends HTMLElement>(f: (element: A) => void): Hooks;
