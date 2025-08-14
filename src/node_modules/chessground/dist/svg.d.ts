import { State } from './state.js';
export { createElement, setAttributes };
export declare function createDefs(): Element;
export declare function renderSvg(state: State, shapesEl: SVGElement, customsEl: SVGElement): void;
declare function createElement(tagName: string): SVGElement;
declare function setAttributes(el: SVGElement, attrs: {
    [key: string]: any;
}): SVGElement;
