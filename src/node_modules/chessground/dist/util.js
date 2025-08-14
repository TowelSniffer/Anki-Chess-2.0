import * as cg from './types.js';
export const invRanks = [...cg.ranks].reverse();
export const allKeys = Array.prototype.concat(...cg.files.map(c => cg.ranks.map(r => c + r)));
export const pos2key = (pos) => allKeys[8 * pos[0] + pos[1]];
export const key2pos = (k) => [k.charCodeAt(0) - 97, k.charCodeAt(1) - 49];
export const uciToMove = (uci) => {
    if (!uci)
        return undefined;
    if (uci[1] === '@')
        return [uci.slice(2, 4)];
    return [uci.slice(0, 2), uci.slice(2, 4)];
};
export const allPos = allKeys.map(key2pos);
export function memo(f) {
    let v;
    const ret = () => {
        if (v === undefined)
            v = f();
        return v;
    };
    ret.clear = () => {
        v = undefined;
    };
    return ret;
}
export const timer = () => {
    let startAt;
    return {
        start() {
            startAt = performance.now();
        },
        cancel() {
            startAt = undefined;
        },
        stop() {
            if (!startAt)
                return 0;
            const time = performance.now() - startAt;
            startAt = undefined;
            return time;
        },
    };
};
export const opposite = (c) => (c === 'white' ? 'black' : 'white');
export const distanceSq = (pos1, pos2) => {
    const dx = pos1[0] - pos2[0], dy = pos1[1] - pos2[1];
    return dx * dx + dy * dy;
};
export const samePiece = (p1, p2) => p1.role === p2.role && p1.color === p2.color;
export const posToTranslate = (bounds) => (pos, asWhite) => [
    ((asWhite ? pos[0] : 7 - pos[0]) * bounds.width) / 8,
    ((asWhite ? 7 - pos[1] : pos[1]) * bounds.height) / 8,
];
export const translate = (el, pos) => {
    el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
};
export const translateAndScale = (el, pos, scale = 1) => {
    el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${scale})`;
};
export const setVisible = (el, v) => {
    el.style.visibility = v ? 'visible' : 'hidden';
};
export const eventPosition = (e) => {
    var _a;
    if (e.clientX || e.clientX === 0)
        return [e.clientX, e.clientY];
    if ((_a = e.targetTouches) === null || _a === void 0 ? void 0 : _a[0])
        return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    return; // touchend has no position!
};
export const isRightButton = (e) => e.button === 2;
export const createEl = (tagName, className) => {
    const el = document.createElement(tagName);
    if (className)
        el.className = className;
    return el;
};
export function computeSquareCenter(key, asWhite, bounds) {
    const pos = key2pos(key);
    if (!asWhite) {
        pos[0] = 7 - pos[0];
        pos[1] = 7 - pos[1];
    }
    return [
        bounds.left + (bounds.width * pos[0]) / 8 + bounds.width / 16,
        bounds.top + (bounds.height * (7 - pos[1])) / 8 + bounds.height / 16,
    ];
}
//# sourceMappingURL=util.js.map