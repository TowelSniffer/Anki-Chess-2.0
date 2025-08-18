import { Key, VNode, VNodeData } from "./vnode.js";
import { ArrayOrElement } from "./h.js";
import { Props } from "./modules/props.js";
export type JsxVNodeChild = VNode | string | number | boolean | undefined | null;
export type JsxVNodeChildren = ArrayOrElement<JsxVNodeChild>;
export type FunctionComponent = (props: {
    [prop: string]: any;
} | null, children?: VNode[]) => VNode;
export declare function Fragment(data: {
    key?: Key;
} | null, ...children: JsxVNodeChildren[]): VNode;
/**
 * jsx/tsx compatible factory function
 * see: https://www.typescriptlang.org/docs/handbook/jsx.html#factory-functions
 */
export declare function jsx(tag: string | FunctionComponent, data: VNodeData | null, ...children: JsxVNodeChildren[]): VNode;
export declare namespace jsx {
    type Element = VNode;
    type IfEquals<X, Y, Output> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? Output : never;
    type WritableKeys<T> = {
        [P in keyof T]-?: IfEquals<{
            [Q in P]: T[P];
        }, {
            -readonly [Q in P]: T[P];
        }, P>;
    }[keyof T];
    type ElementProperties<T> = {
        [Property in WritableKeys<T> as T[Property] extends string | number | null | undefined ? Property : never]?: T[Property];
    };
    type VNodeProps<T> = ElementProperties<T> & Props;
    type HtmlElements = {
        [Property in keyof HTMLElementTagNameMap]: VNodeData<VNodeProps<HTMLElementTagNameMap[Property]>>;
    };
    interface IntrinsicElements extends HtmlElements {
        [elemName: string]: VNodeData;
    }
}
