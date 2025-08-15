import { Module } from "./module.js";
export type ElementStyle = Partial<CSSStyleDeclaration>;
export type VNodeStyle = ElementStyle & Record<string, string> & {
    delayed?: ElementStyle & Record<string, string>;
    remove?: ElementStyle & Record<string, string>;
};
export declare const styleModule: Module;
