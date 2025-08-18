import { Color, Square } from './types.js';

const popcnt32 = (n: number): number => {
  n = n - ((n >>> 1) & 0x5555_5555);
  n = (n & 0x3333_3333) + ((n >>> 2) & 0x3333_3333);
  return Math.imul((n + (n >>> 4)) & 0x0f0f_0f0f, 0x0101_0101) >> 24;
};

const bswap32 = (n: number): number => {
  n = ((n >>> 8) & 0x00ff_00ff) | ((n & 0x00ff_00ff) << 8);
  return ((n >>> 16) & 0xffff) | ((n & 0xffff) << 16);
};

const rbit32 = (n: number): number => {
  n = ((n >>> 1) & 0x5555_5555) | ((n & 0x5555_5555) << 1);
  n = ((n >>> 2) & 0x3333_3333) | ((n & 0x3333_3333) << 2);
  n = ((n >>> 4) & 0x0f0f_0f0f) | ((n & 0x0f0f_0f0f) << 4);
  return bswap32(n);
};

/**
 * An immutable set of squares, implemented as a bitboard.
 */
export class SquareSet implements Iterable<Square> {
  readonly lo: number;
  readonly hi: number;

  constructor(lo: number, hi: number) {
    this.lo = lo | 0;
    this.hi = hi | 0;
  }

  static fromSquare(square: Square): SquareSet {
    return square >= 32 ? new SquareSet(0, 1 << (square - 32)) : new SquareSet(1 << square, 0);
  }

  static fromRank(rank: number): SquareSet {
    return new SquareSet(0xff, 0).shl64(8 * rank);
  }

  static fromFile(file: number): SquareSet {
    return new SquareSet(0x0101_0101 << file, 0x0101_0101 << file);
  }

  static empty(): SquareSet {
    return new SquareSet(0, 0);
  }

  static full(): SquareSet {
    return new SquareSet(0xffff_ffff, 0xffff_ffff);
  }

  static corners(): SquareSet {
    return new SquareSet(0x81, 0x8100_0000);
  }

  static center(): SquareSet {
    return new SquareSet(0x1800_0000, 0x18);
  }

  static backranks(): SquareSet {
    return new SquareSet(0xff, 0xff00_0000);
  }

  static backrank(color: Color): SquareSet {
    return color === 'white' ? new SquareSet(0xff, 0) : new SquareSet(0, 0xff00_0000);
  }

  static lightSquares(): SquareSet {
    return new SquareSet(0x55aa_55aa, 0x55aa_55aa);
  }

  static darkSquares(): SquareSet {
    return new SquareSet(0xaa55_aa55, 0xaa55_aa55);
  }

  complement(): SquareSet {
    return new SquareSet(~this.lo, ~this.hi);
  }

  xor(other: SquareSet): SquareSet {
    return new SquareSet(this.lo ^ other.lo, this.hi ^ other.hi);
  }

  union(other: SquareSet): SquareSet {
    return new SquareSet(this.lo | other.lo, this.hi | other.hi);
  }

  intersect(other: SquareSet): SquareSet {
    return new SquareSet(this.lo & other.lo, this.hi & other.hi);
  }

  diff(other: SquareSet): SquareSet {
    return new SquareSet(this.lo & ~other.lo, this.hi & ~other.hi);
  }

  intersects(other: SquareSet): boolean {
    return this.intersect(other).nonEmpty();
  }

  isDisjoint(other: SquareSet): boolean {
    return this.intersect(other).isEmpty();
  }

  supersetOf(other: SquareSet): boolean {
    return other.diff(this).isEmpty();
  }

  subsetOf(other: SquareSet): boolean {
    return this.diff(other).isEmpty();
  }

  shr64(shift: number): SquareSet {
    if (shift >= 64) return SquareSet.empty();
    if (shift >= 32) return new SquareSet(this.hi >>> (shift - 32), 0);
    if (shift > 0) return new SquareSet((this.lo >>> shift) ^ (this.hi << (32 - shift)), this.hi >>> shift);
    return this;
  }

  shl64(shift: number): SquareSet {
    if (shift >= 64) return SquareSet.empty();
    if (shift >= 32) return new SquareSet(0, this.lo << (shift - 32));
    if (shift > 0) return new SquareSet(this.lo << shift, (this.hi << shift) ^ (this.lo >>> (32 - shift)));
    return this;
  }

  bswap64(): SquareSet {
    return new SquareSet(bswap32(this.hi), bswap32(this.lo));
  }

  rbit64(): SquareSet {
    return new SquareSet(rbit32(this.hi), rbit32(this.lo));
  }

  minus64(other: SquareSet): SquareSet {
    const lo = this.lo - other.lo;
    const c = ((lo & other.lo & 1) + (other.lo >>> 1) + (lo >>> 1)) >>> 31;
    return new SquareSet(lo, this.hi - (other.hi + c));
  }

  equals(other: SquareSet): boolean {
    return this.lo === other.lo && this.hi === other.hi;
  }

  size(): number {
    return popcnt32(this.lo) + popcnt32(this.hi);
  }

  isEmpty(): boolean {
    return this.lo === 0 && this.hi === 0;
  }

  nonEmpty(): boolean {
    return this.lo !== 0 || this.hi !== 0;
  }

  has(square: Square): boolean {
    return (square >= 32 ? this.hi & (1 << (square - 32)) : this.lo & (1 << square)) !== 0;
  }

  set(square: Square, on: boolean): SquareSet {
    return on ? this.with(square) : this.without(square);
  }

  with(square: Square): SquareSet {
    return square >= 32
      ? new SquareSet(this.lo, this.hi | (1 << (square - 32)))
      : new SquareSet(this.lo | (1 << square), this.hi);
  }

  without(square: Square): SquareSet {
    return square >= 32
      ? new SquareSet(this.lo, this.hi & ~(1 << (square - 32)))
      : new SquareSet(this.lo & ~(1 << square), this.hi);
  }

  toggle(square: Square): SquareSet {
    return square >= 32
      ? new SquareSet(this.lo, this.hi ^ (1 << (square - 32)))
      : new SquareSet(this.lo ^ (1 << square), this.hi);
  }

  last(): Square | undefined {
    if (this.hi !== 0) return 63 - Math.clz32(this.hi);
    if (this.lo !== 0) return 31 - Math.clz32(this.lo);
    return;
  }

  first(): Square | undefined {
    if (this.lo !== 0) return 31 - Math.clz32(this.lo & -this.lo);
    if (this.hi !== 0) return 63 - Math.clz32(this.hi & -this.hi);
    return;
  }

  withoutFirst(): SquareSet {
    if (this.lo !== 0) return new SquareSet(this.lo & (this.lo - 1), this.hi);
    return new SquareSet(0, this.hi & (this.hi - 1));
  }

  moreThanOne(): boolean {
    return (this.hi !== 0 && this.lo !== 0) || (this.lo & (this.lo - 1)) !== 0 || (this.hi & (this.hi - 1)) !== 0;
  }

  singleSquare(): Square | undefined {
    return this.moreThanOne() ? undefined : this.last();
  }

  *[Symbol.iterator](): Iterator<Square> {
    let lo = this.lo;
    let hi = this.hi;
    while (lo !== 0) {
      const idx = 31 - Math.clz32(lo & -lo);
      lo ^= 1 << idx;
      yield idx;
    }
    while (hi !== 0) {
      const idx = 31 - Math.clz32(hi & -hi);
      hi ^= 1 << idx;
      yield 32 + idx;
    }
  }

  *reversed(): Iterable<Square> {
    let lo = this.lo;
    let hi = this.hi;
    while (hi !== 0) {
      const idx = 31 - Math.clz32(hi);
      hi ^= 1 << idx;
      yield 32 + idx;
    }
    while (lo !== 0) {
      const idx = 31 - Math.clz32(lo);
      lo ^= 1 << idx;
      yield idx;
    }
  }
}
