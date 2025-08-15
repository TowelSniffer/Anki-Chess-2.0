import { Id } from './interfaces';

export class Path {
  constructor(readonly path: string) {}

  size = () => this.path.length / 2;

  head = (): Id => this.path.slice(0, 2);

  // returns an invalid path doesn't starting from root
  tail = (): Path => new Path(this.path.slice(2));

  init = (): Path => new Path(this.path.slice(0, -2));

  last = (): Id => this.path.slice(-2);

  empty = () => this.path == '';

  contains = (other: Path): boolean => this.path.startsWith(other.path);

  isChildOf = (parent: Path): boolean => this.init() === parent;

  append = (id: Id) => new Path(this.path + id);

  equals = (other: Path) => this.path == other.path;

  static root = new Path('');
}
