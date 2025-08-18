import { opposite } from 'chessops';
import { h } from 'snabbdom';
export default function renderPlayer(ctrl, side) {
    const color = side == 'bottom' ? ctrl.orientation() : opposite(ctrl.orientation());
    const player = ctrl.game.players[color];
    const personEls = [
        player.title ? h('span.lpv__player__title', player.title) : undefined,
        h('span.lpv__player__name', player.name),
        player.rating ? h('span.lpv__player__rating', ['(', player.rating, ')']) : undefined,
    ];
    return h(`div.lpv__player.lpv__player--${side}`, [
        player.isLichessUser
            ? h('a.lpv__player__person.ulpt.user-link', { attrs: { href: `${ctrl.opts.lichess}/@/${player.name}` } }, personEls)
            : h('span.lpv__player__person', personEls),
        ctrl.opts.showClocks ? renderClock(ctrl, color) : undefined,
    ]);
}
const renderClock = (ctrl, color) => {
    const move = ctrl.curData();
    const clock = move.clocks && move.clocks[color];
    return typeof clock == undefined
        ? undefined
        : h('div.lpv__player__clock', { class: { active: color == move.turn } }, clockContent(clock));
};
const clockContent = (seconds) => {
    if (!seconds && seconds !== 0)
        return ['-'];
    const date = new Date(seconds * 1000), sep = ':', baseStr = pad2(date.getUTCMinutes()) + sep + pad2(date.getUTCSeconds());
    return seconds >= 3600 ? [Math.floor(seconds / 3600) + sep + baseStr] : [baseStr];
};
const pad2 = (num) => (num < 10 ? '0' : '') + num;
//# sourceMappingURL=player.js.map