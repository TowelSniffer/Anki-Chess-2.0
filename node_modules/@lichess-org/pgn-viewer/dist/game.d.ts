import { Node, ChildNode } from 'chessops/pgn';
import { Initial, InitialOrMove, Metadata, MoveData, Players, Ply } from './interfaces';
import { Path } from './path';
export type AnyNode = Node<MoveData>;
export type MoveNode = ChildNode<MoveData>;
export declare class Game {
    readonly initial: Initial;
    readonly moves: AnyNode;
    readonly players: Players;
    readonly metadata: Metadata;
    mainline: MoveData[];
    constructor(initial: Initial, moves: AnyNode, players: Players, metadata: Metadata);
    nodeAt: (path: Path) => AnyNode | undefined;
    dataAt: (path: Path) => MoveData | Initial | undefined;
    title: () => string;
    pathAtMainlinePly: (ply: Ply | "last") => Path;
    hasPlayerName: () => boolean;
}
export declare const isMoveNode: (n: AnyNode) => n is MoveNode;
export declare const isMoveData: (d: InitialOrMove) => d is MoveData;
