import { Path } from './path';
// immutable
export class Game {
    constructor(initial, moves, players, metadata) {
        this.initial = initial;
        this.moves = moves;
        this.players = players;
        this.metadata = metadata;
        this.nodeAt = (path) => nodeAtPathFrom(this.moves, path);
        this.dataAt = (path) => {
            const node = this.nodeAt(path);
            return node ? (isMoveNode(node) ? node.data : this.initial) : undefined;
        };
        this.title = () => this.players.white.name
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
        this.pathAtMainlinePly = (ply) => {
            var _a;
            return ply == 0
                ? Path.root
                : ((_a = this.mainline[Math.max(0, Math.min(this.mainline.length - 1, ply == 'last' ? 9999 : ply - 1))]) === null || _a === void 0 ? void 0 : _a.path) || Path.root;
        };
        this.hasPlayerName = () => { var _a, _b; return !!(((_a = this.players.white) === null || _a === void 0 ? void 0 : _a.name) || ((_b = this.players.black) === null || _b === void 0 ? void 0 : _b.name)); };
        this.mainline = Array.from(this.moves.mainline());
    }
}
const childById = (node, id) => node.children.find(c => c.data.path.last() == id);
const nodeAtPathFrom = (node, path) => {
    if (path.empty())
        return node;
    const child = childById(node, path.head());
    return child ? nodeAtPathFrom(child, path.tail()) : undefined;
};
export const isMoveNode = (n) => 'data' in n;
export const isMoveData = (d) => 'uci' in d;
//# sourceMappingURL=game.js.map