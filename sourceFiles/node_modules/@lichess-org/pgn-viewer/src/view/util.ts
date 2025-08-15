import { Hooks } from 'snabbdom';

export function bindMobileMousedown(el: HTMLElement, f: (e: Event) => unknown, redraw?: () => void): void {
  for (const mousedownEvent of ['touchstart', 'mousedown']) {
    el.addEventListener(
      mousedownEvent,
      e => {
        f(e);
        e.preventDefault();
        if (redraw) redraw();
      },
      { passive: false },
    );
  }
}

export const bind = <E extends Event>(
  eventName: string,
  f: (e: E) => any,
  redraw?: () => void,
  passive = true,
): Hooks =>
  onInsert(el =>
    el.addEventListener(
      eventName,
      e => {
        const res = f(e as E);
        if (res === false) e.preventDefault();
        redraw?.();
        return res;
      },
      { passive },
    ),
  );

export function onInsert<A extends HTMLElement>(f: (element: A) => void): Hooks {
  return {
    insert: vnode => f(vnode.elm as A),
  };
}
