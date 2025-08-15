export class Path {
    constructor(path) {
        this.path = path;
        this.size = () => this.path.length / 2;
        this.head = () => this.path.slice(0, 2);
        // returns an invalid path doesn't starting from root
        this.tail = () => new Path(this.path.slice(2));
        this.init = () => new Path(this.path.slice(0, -2));
        this.last = () => this.path.slice(-2);
        this.empty = () => this.path == '';
        this.contains = (other) => this.path.startsWith(other.path);
        this.isChildOf = (parent) => this.init() === parent;
        this.append = (id) => new Path(this.path + id);
        this.equals = (other) => this.path == other.path;
    }
}
Path.root = new Path('');
//# sourceMappingURL=path.js.map