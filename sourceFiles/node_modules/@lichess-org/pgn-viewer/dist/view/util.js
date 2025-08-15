export function bindMobileMousedown(el, f, redraw) {
    for (const mousedownEvent of ['touchstart', 'mousedown']) {
        el.addEventListener(mousedownEvent, e => {
            f(e);
            e.preventDefault();
            if (redraw)
                redraw();
        }, { passive: false });
    }
}
export const bind = (eventName, f, redraw, passive = true) => onInsert(el => el.addEventListener(eventName, e => {
    const res = f(e);
    if (res === false)
        e.preventDefault();
    redraw === null || redraw === void 0 ? void 0 : redraw();
    return res;
}, { passive }));
export function onInsert(f) {
    return {
        insert: vnode => f(vnode.elm),
    };
}
//# sourceMappingURL=util.js.map