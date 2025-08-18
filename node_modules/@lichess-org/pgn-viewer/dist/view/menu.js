import { h } from 'snabbdom';
import { bind, bindMobileMousedown, onInsert } from './util';
import { eventRepeater } from '../events';
export const renderMenu = (ctrl) => {
    var _a, _b;
    return h('div.lpv__menu.lpv__pane', [
        h('button.lpv__menu__entry.lpv__menu__flip.lpv__fbt', {
            hook: bind('click', ctrl.flip),
        }, ctrl.translate('flipTheBoard')),
        ((_a = ctrl.opts.menu.analysisBoard) === null || _a === void 0 ? void 0 : _a.enabled)
            ? h('a.lpv__menu__entry.lpv__menu__analysis.lpv__fbt', {
                attrs: {
                    href: ctrl.analysisUrl(),
                    target: '_blank',
                },
            }, ctrl.translate('analysisBoard'))
            : undefined,
        ((_b = ctrl.opts.menu.practiceWithComputer) === null || _b === void 0 ? void 0 : _b.enabled)
            ? h('a.lpv__menu__entry.lpv__menu__practice.lpv__fbt', {
                attrs: {
                    href: ctrl.practiceUrl(),
                    target: '_blank',
                },
            }, ctrl.translate('practiceWithComputer'))
            : undefined,
        ctrl.opts.menu.getPgn.enabled
            ? h('button.lpv__menu__entry.lpv__menu__pgn.lpv__fbt', {
                hook: bind('click', ctrl.togglePgn),
            }, ctrl.translate('getPgn'))
            : undefined,
        renderExternalLink(ctrl),
    ]);
};
const renderExternalLink = (ctrl) => {
    const link = ctrl.game.metadata.externalLink;
    return (link &&
        h('a.lpv__menu__entry.lpv__fbt', {
            attrs: {
                href: link,
                target: '_blank',
            },
        }, ctrl.translate(ctrl.game.metadata.isLichess ? 'viewOnLichess' : 'viewOnSite')));
};
export const renderControls = (ctrl) => h('div.lpv__controls', [
    ctrl.pane == 'board' ? undefined : dirButton(ctrl, 'first', 'step-backward'),
    dirButton(ctrl, 'prev', 'left-open'),
    h('button.lpv__fbt.lpv__controls__menu.lpv__icon', {
        class: {
            active: ctrl.pane != 'board',
            'lpv__icon-ellipsis-vert': ctrl.pane == 'board',
        },
        hook: bind('click', ctrl.toggleMenu),
    }, ctrl.pane == 'board' ? undefined : 'X'),
    dirButton(ctrl, 'next', 'right-open'),
    ctrl.pane == 'board' ? undefined : dirButton(ctrl, 'last', 'step-forward'),
]);
const dirButton = (ctrl, to, icon) => h(`button.lpv__controls__goto.lpv__controls__goto--${to}.lpv__fbt.lpv__icon.lpv__icon-${icon}`, {
    class: { disabled: ctrl.pane == 'board' && !ctrl.canGoTo(to) },
    hook: onInsert(el => bindMobileMousedown(el, e => eventRepeater(() => ctrl.goTo(to), e))),
});
//# sourceMappingURL=menu.js.map