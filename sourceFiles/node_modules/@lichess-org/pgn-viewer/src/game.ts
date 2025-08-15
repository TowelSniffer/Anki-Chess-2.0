import { Node, ChildNode } from 'chessops/pgn';
import { Id, Initial, InitialOrMove, Metadata, MoveData, Players, Ply } from './interfaces';
import { Path } from './path';

export type AnyNode = Node<MoveData>;
export type MoveNode = ChildNode<MoveData>;

// immutable
export class Game {
  mainline: MoveData[];

  constructor(
    readonly initial: Initial,
    readonly moves: AnyNode,
    readonly players: Players,
    readonly metadata: Metadata,
  ) {
    this.mainline = Array.from(this.moves.mainline());
  }

  nodeAt = (path: Path): AnyNode | undefined => nodeAtPathFrom(this.moves, path);

  dataAt = (path: Path): MoveData | Initial | undefined => {
    const node = this.nodeAt(path);
    return node ? (isMoveNode(node) ? node.data : this.initial) : undefined;
  };

  title = () =>
    this.players.white.name
      ? [
          this.players.white.title,
          this.players.white.name,
          'vs',
          this.players.black.title,
          this.players.black.name,
        ]
          .filter(x => x && !!x.trim())
          .join('_')
          .replace(' ', '-')
      : 'lichess-pgn-viewer';

  pathAtMainlinePly = (ply: Ply | 'last') =>
    ply == 0
      ? Path.root
      : this.mainline[Math.max(0, Math.min(this.mainline.length - 1, ply == 'last' ? 9999 : ply - 1))]
          ?.path || Path.root;

  hasPlayerName = () => !!(this.players.white?.name || this.players.black?.name);
}

const childById = (node: AnyNode, id: Id): MoveNode | undefined =>
  node.children.find(c => c.data.path.last() == id);

const nodeAtPathFrom = (node: AnyNode, path: Path): AnyNode | undefined => {
  if (path.empty()) return node;
  const child = childById(node, path.head());
  return child ? nodeAtPathFrom(child, path.tail()) : undefined;
};

export const isMoveNode = (n: AnyNode): n is MoveNode => 'data' in n;
export const isMoveData = (d: InitialOrMove): d is MoveData => 'uci' in d;
