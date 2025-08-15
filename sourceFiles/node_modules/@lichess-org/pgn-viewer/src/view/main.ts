import PgnViewer from '../pgnViewer';
import { Chessground } from 'chessground';
import { Config as CgConfig } from 'chessground/config';
import { h, VNode } from 'snabbdom';
import { onInsert } from './util';
import { onKeyDown, stepwiseScroll } from '../events';
import { renderMenu, renderControls } from './menu';
import { renderMoves } from './side';
import renderPlayer from './player';

export default function view(ctrl: PgnViewer) {
  const opts = ctrl.opts,
    staticClasses = `lpv.lpv--moves-${opts.showMoves}.lpv--controls-${opts.showControls}${
      opts.classes ? '.' + opts.classes.replace(' ', '.') : ''
    }`;
  const showPlayers = opts.showPlayers == 'auto' ? ctrl.game.hasPlayerName() : opts.showPlayers;
  return h(
    `div.${staticClasses}`,
    {
      class: {
        'lpv--menu': ctrl.pane != 'board',
        'lpv--players': showPlayers,
      },
      attrs: {
        tabindex: 0,
      },
      hook: onInsert(el => {
        ctrl.setGround(Chessground(el.querySelector('.cg-wrap') as HTMLElement, makeConfig(ctrl, el)));
        if (opts.keyboardToMove) el.addEventListener('keydown', onKeyDown(ctrl));
      }),
    },
    [
      showPlayers ? renderPlayer(ctrl, 'top') : undefined,
      renderBoard(ctrl),
      showPlayers ? renderPlayer(ctrl, 'bottom') : undefined,
      opts.showControls ? renderControls(ctrl) : undefined,
      opts.showMoves ? renderMoves(ctrl) : undefined,
      ctrl.pane == 'menu' ? renderMenu(ctrl) : ctrl.pane == 'pgn' ? renderPgnPane(ctrl) : undefined,
    ],
  );
}

const renderBoard = (ctrl: PgnViewer): VNode =>
  h(
    'div.lpv__board',
    {
      hook: onInsert(el => {
        el.addEventListener('click', ctrl.focus);
        if (ctrl.opts.scrollToMove && !('ontouchstart' in window))
          el.addEventListener(
            'wheel',
            stepwiseScroll((e: WheelEvent, scroll: boolean) => {
              e.preventDefault();
              if (e.deltaY > 0 && scroll) ctrl.goTo('next', false);
              else if (e.deltaY < 0 && scroll) ctrl.goTo('prev', false);
            }),
          );
      }),
    },
    h('div.cg-wrap'),
  );

const renderPgnPane = (ctrl: PgnViewer): VNode => {
  const blob = new Blob([ctrl.opts.pgn], { type: 'text/plain' });
  return h('div.lpv__pgn.lpv__pane', [
    h(
      'a.lpv__pgn__download.lpv__fbt',
      {
        attrs: {
          href: window.URL.createObjectURL(blob),
          download: ctrl.opts.menu.getPgn.fileName || `${ctrl.game.title()}.pgn`,
        },
      },
      ctrl.translate('download'),
    ),
    h('textarea.lpv__pgn__text', ctrl.opts.pgn),
  ]);
};

export const makeConfig = (ctrl: PgnViewer, rootEl: HTMLElement): CgConfig => ({
  viewOnly: !ctrl.opts.drawArrows,
  addDimensionsCssVarsTo: rootEl,
  drawable: {
    enabled: ctrl.opts.drawArrows,
    visible: true,
  },
  disableContextMenu: ctrl.opts.drawArrows,
  ...(ctrl.opts.chessground || {}),
  movable: {
    free: false,
  },
  draggable: {
    enabled: false,
  },
  selectable: {
    enabled: false,
  },
  ...ctrl.cgState(),
});
