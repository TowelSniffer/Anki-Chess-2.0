export function stepwiseScroll(inner) {
    let scrollTotal = 0;
    return (e) => {
        scrollTotal += e.deltaY * (e.deltaMode ? 40 : 1);
        if (Math.abs(scrollTotal) >= 4) {
            inner(e, true);
            scrollTotal = 0;
        }
        else {
            inner(e, false);
        }
    };
}
export function eventRepeater(action, e) {
    const repeat = () => {
        action();
        delay = Math.max(100, delay - delay / 15);
        timeout = setTimeout(repeat, delay);
    };
    let delay = 350;
    let timeout = setTimeout(repeat, 500);
    action();
    const eventName = e.type == 'touchstart' ? 'touchend' : 'mouseup';
    document.addEventListener(eventName, () => clearTimeout(timeout), { once: true });
}
const suppressKeyNavOn = (e) => e.altKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.metaKey ||
    document.activeElement instanceof HTMLInputElement ||
    document.activeElement instanceof HTMLTextAreaElement;
export const onKeyDown = (ctrl) => (e) => {
    if (suppressKeyNavOn(e))
        return;
    else if (e.key == 'ArrowLeft')
        ctrl.goTo('prev');
    else if (e.key == 'ArrowRight')
        ctrl.goTo('next');
    else if (e.key == 'f')
        ctrl.flip();
};
//# sourceMappingURL=events.js.map