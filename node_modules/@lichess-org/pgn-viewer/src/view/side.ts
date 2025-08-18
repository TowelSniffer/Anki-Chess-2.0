import { h, VNode } from 'snabbdom';
import PgnViewer from '../pgnViewer';
import { MoveNode } from '../game';
import { MoveData } from '../interfaces';
import { Path } from '../path';
import { renderNag } from './glyph';

export const renderMoves = (ctrl: PgnViewer) =>
  h('div.lpv__side', [
    h(
      'div.lpv__moves',
      {
        hook: {
          insert: vnode => {
            const el = vnode.elm as HTMLElement;
            if (!ctrl.path.empty()) autoScroll(ctrl, el);
            el.addEventListener(
              'mousedown',
              e => {
                const path = (e.target as HTMLElement).getAttribute('p');
                if (path) ctrl.toPath(new Path(path));
              },
              { passive: true },
            );
          },
          postpatch: (_, vnode) => {
            if (ctrl.autoScrollRequested) {
              autoScroll(ctrl, vnode.elm as HTMLElement);
              ctrl.autoScrollRequested = false;
            }
          },
        },
      },
      [...ctrl.game.initial.comments.map(commentNode), ...makeMoveNodes(ctrl), ...renderResultComment(ctrl)],
    ),
  ]);

const renderResultComment = (ctrl: PgnViewer) => {
  const res = ctrl.game.metadata.result;
  return res && res != '*' ? [h('comment.result', ctrl.game.metadata.result)] : [];
};

const emptyMove = () => h('move.empty', '...');
const indexNode = (turn: number) => h('index', `${turn}.`);
const commentNode = (comment: string) => h('comment', comment);
const parenOpen = () => h('paren.open', '(');
const parenClose = () => h('paren.close', ')');
const moveTurn = (move: MoveData) => Math.floor((move.ply - 1) / 2) + 1;

const makeMoveNodes = (ctrl: PgnViewer): Array<VNode | undefined> => {
  const moveDom = renderMove(ctrl);
  const elms: VNode[] = [];
  let node: MoveNode | undefined,
    variations: MoveNode[] = ctrl.game.moves.children.slice(1);
  if (ctrl.game.initial.pos.turn == 'black' && ctrl.game.mainline[0])
    elms.push(indexNode(ctrl.game.initial.pos.fullmoves), emptyMove());
  while ((node = (node || ctrl.game.moves).children[0])) {
    const move = node.data;
    const oddMove = move.ply % 2 == 1;
    if (oddMove) elms.push(indexNode(moveTurn(move)));
    elms.push(moveDom(move));
    const addEmptyMove = oddMove && (variations.length || move.comments.length) && node.children.length;
    if (addEmptyMove) elms.push(emptyMove());
    move.comments.forEach(comment => elms.push(commentNode(comment)));
    variations.forEach(variation => elms.push(makeMainVariation(moveDom, variation)));
    if (addEmptyMove) elms.push(indexNode(moveTurn(move)), emptyMove());
    variations = node.children.slice(1);
  }
  return elms;
};

type MoveToDom = (move: MoveData) => VNode;

const makeMainVariation = (moveDom: MoveToDom, node: MoveNode) =>
  h('variation', [...node.data.startingComments.map(commentNode), ...makeVariationMoves(moveDom, node)]);

const makeVariationMoves = (moveDom: MoveToDom, node: MoveNode) => {
  let elms: VNode[] = [];
  let variations: MoveNode[] = [];
  if (node.data.ply % 2 == 0) elms.push(h('index', [moveTurn(node.data), '...']));
  do {
    const move = node.data;
    if (move.ply % 2 == 1) elms.push(h('index', [moveTurn(move), '.']));
    elms.push(moveDom(move));
    move.comments.forEach(comment => elms.push(commentNode(comment)));
    variations.forEach(variation => {
      elms = [...elms, parenOpen(), ...makeVariationMoves(moveDom, variation), parenClose()];
    });
    variations = node.children.slice(1);
    node = node.children[0];
  } while (node);
  return elms;
};

const renderMove = (ctrl: PgnViewer) => (move: MoveData) =>
  h(
    'move',
    {
      class: {
        current: ctrl.path.equals(move.path),
        ancestor: ctrl.path.contains(move.path),
        good: move.nags.includes(1),
        mistake: move.nags.includes(2),
        brilliant: move.nags.includes(3),
        blunder: move.nags.includes(4),
        interesting: move.nags.includes(5),
        inaccuracy: move.nags.includes(6),
      },
      attrs: {
        p: move.path.path,
      },
    },
    [move.san, ...move.nags.map(renderNag)],
  );

const autoScroll = (ctrl: PgnViewer, cont: HTMLElement) => {
  const target = cont.querySelector<HTMLElement>('.current');
  if (!target) {
    cont.scrollTop = ctrl.path.empty() ? 0 : 99999;
    return;
  }
  cont.scrollTop = target.offsetTop - cont.offsetHeight / 2 + target.offsetHeight;
};
