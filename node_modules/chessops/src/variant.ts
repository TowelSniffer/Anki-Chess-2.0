import { Result } from '@badrap/result';
import { between, kingAttacks, pawnAttacks } from './attacks.js';
import { Board } from './board.js';
import {
  Castles,
  castlingSide,
  Chess,
  Context,
  equalsIgnoreMoves,
  IllegalSetup,
  isImpossibleCheck,
  isStandardMaterialSide,
  normalizeMove,
  Position,
  PositionError,
  pseudoDests,
} from './chess.js';
import { Material, MaterialSide, RemainingChecks, Setup } from './setup.js';
import { SquareSet } from './squareSet.js';
import { Color, COLORS, Outcome, Piece, Rules, Square } from './types.js';
import { defined, opposite } from './util.js';

export {
  Castles,
  castlingSide,
  Chess,
  Context,
  equalsIgnoreMoves,
  IllegalSetup,
  isImpossibleCheck,
  normalizeMove,
  Position,
  PositionError,
};

export class Crazyhouse extends Position {
  private constructor() {
    super('crazyhouse');
  }

  reset() {
    super.reset();
    this.pockets = Material.empty();
  }

  protected setupUnchecked(setup: Setup) {
    super.setupUnchecked(setup);
    this.board.promoted = setup.board.promoted
      .intersect(setup.board.occupied)
      .diff(setup.board.king)
      .diff(setup.board.pawn);
    this.pockets = setup.pockets ? setup.pockets.clone() : Material.empty();
  }

  static default(): Crazyhouse {
    const pos = new this();
    pos.reset();
    return pos;
  }

  static fromSetup(setup: Setup): Result<Crazyhouse, PositionError> {
    const pos = new this();
    pos.setupUnchecked(setup);
    return pos.validate().map(_ => pos);
  }

  clone(): Crazyhouse {
    return super.clone() as Crazyhouse;
  }

  protected validate(): Result<undefined, PositionError> {
    return super.validate().chain(_ => {
      if (this.pockets?.count('king')) {
        return Result.err(new PositionError(IllegalSetup.Kings));
      }
      if ((this.pockets?.size() || 0) + this.board.occupied.size() > 64) {
        return Result.err(new PositionError(IllegalSetup.Variant));
      }
      return Result.ok(undefined);
    });
  }

  hasInsufficientMaterial(color: Color): boolean {
    // No material can leave the game, but we can easily check this for
    // custom positions.
    if (!this.pockets) return super.hasInsufficientMaterial(color);
    return (
      this.board.occupied.size() + this.pockets.size() <= 3
      && this.board.pawn.isEmpty()
      && this.board.promoted.isEmpty()
      && this.board.rooksAndQueens().isEmpty()
      && this.pockets.count('pawn') <= 0
      && this.pockets.count('rook') <= 0
      && this.pockets.count('queen') <= 0
    );
  }

  dropDests(ctx?: Context): SquareSet {
    const mask = this.board.occupied
      .complement()
      .intersect(
        this.pockets?.[this.turn].hasNonPawns()
          ? SquareSet.full()
          : this.pockets?.[this.turn].hasPawns()
          ? SquareSet.backranks().complement()
          : SquareSet.empty(),
      );

    ctx = ctx || this.ctx();
    if (defined(ctx.king) && ctx.checkers.nonEmpty()) {
      const checker = ctx.checkers.singleSquare();
      if (!defined(checker)) return SquareSet.empty();
      return mask.intersect(between(checker, ctx.king));
    } else return mask;
  }
}

export class Atomic extends Position {
  private constructor() {
    super('atomic');
  }

  static default(): Atomic {
    const pos = new this();
    pos.reset();
    return pos;
  }

  static fromSetup(setup: Setup): Result<Atomic, PositionError> {
    const pos = new this();
    pos.setupUnchecked(setup);
    return pos.validate().map(_ => pos);
  }

  clone(): Atomic {
    return super.clone() as Atomic;
  }

  protected validate(): Result<undefined, PositionError> {
    // Like chess, but allow our king to be missing.
    if (this.board.occupied.isEmpty()) return Result.err(new PositionError(IllegalSetup.Empty));
    if (this.board.king.size() > 2) return Result.err(new PositionError(IllegalSetup.Kings));
    const otherKing = this.board.kingOf(opposite(this.turn));
    if (!defined(otherKing)) return Result.err(new PositionError(IllegalSetup.Kings));
    if (this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
      return Result.err(new PositionError(IllegalSetup.OppositeCheck));
    }
    if (SquareSet.backranks().intersects(this.board.pawn)) {
      return Result.err(new PositionError(IllegalSetup.PawnsOnBackrank));
    }
    return Result.ok(undefined);
  }

  kingAttackers(square: Square, attacker: Color, occupied: SquareSet): SquareSet {
    const attackerKings = this.board.pieces(attacker, 'king');
    if (attackerKings.isEmpty() || kingAttacks(square).intersects(attackerKings)) {
      return SquareSet.empty();
    }
    return super.kingAttackers(square, attacker, occupied);
  }

  protected playCaptureAt(square: Square, captured: Piece): void {
    super.playCaptureAt(square, captured);
    this.board.take(square);
    for (const explode of kingAttacks(square).intersect(this.board.occupied).diff(this.board.pawn)) {
      const piece = this.board.take(explode);
      if (piece?.role === 'rook') this.castles.discardRook(explode);
      if (piece?.role === 'king') this.castles.discardColor(piece.color);
    }
  }

  hasInsufficientMaterial(color: Color): boolean {
    // Remaining material does not matter if the enemy king is already
    // exploded.
    if (this.board.pieces(opposite(color), 'king').isEmpty()) return false;

    // Bare king cannot mate.
    if (this.board[color].diff(this.board.king).isEmpty()) return true;

    // As long as the enemy king is not alone, there is always a chance their
    // own pieces explode next to it.
    if (this.board[opposite(color)].diff(this.board.king).nonEmpty()) {
      // Unless there are only bishops that cannot explode each other.
      if (this.board.occupied.equals(this.board.bishop.union(this.board.king))) {
        if (!this.board.bishop.intersect(this.board.white).intersects(SquareSet.darkSquares())) {
          return !this.board.bishop.intersect(this.board.black).intersects(SquareSet.lightSquares());
        }
        if (!this.board.bishop.intersect(this.board.white).intersects(SquareSet.lightSquares())) {
          return !this.board.bishop.intersect(this.board.black).intersects(SquareSet.darkSquares());
        }
      }
      return false;
    }

    // Queen or pawn (future queen) can give mate against bare king.
    if (this.board.queen.nonEmpty() || this.board.pawn.nonEmpty()) return false;

    // Single knight, bishop or rook cannot mate against bare king.
    if (this.board.knight.union(this.board.bishop).union(this.board.rook).size() === 1) return true;

    // If only knights, more than two are required to mate bare king.
    if (this.board.occupied.equals(this.board.knight.union(this.board.king))) {
      return this.board.knight.size() <= 2;
    }

    return false;
  }

  dests(square: Square, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();
    let dests = SquareSet.empty();
    for (const to of pseudoDests(this, square, ctx)) {
      const after = this.clone();
      after.play({ from: square, to });
      const ourKing = after.board.kingOf(this.turn);
      if (
        defined(ourKing)
        && (!defined(after.board.kingOf(after.turn))
          || after.kingAttackers(ourKing, after.turn, after.board.occupied).isEmpty())
      ) {
        dests = dests.with(to);
      }
    }
    return dests;
  }

  isVariantEnd(): boolean {
    return !!this.variantOutcome();
  }

  variantOutcome(_ctx?: Context): Outcome | undefined {
    for (const color of COLORS) {
      if (this.board.pieces(color, 'king').isEmpty()) return { winner: opposite(color) };
    }
    return;
  }
}

export class Antichess extends Position {
  private constructor() {
    super('antichess');
  }

  reset() {
    super.reset();
    this.castles = Castles.empty();
  }

  protected setupUnchecked(setup: Setup) {
    super.setupUnchecked(setup);
    this.castles = Castles.empty();
  }

  static default(): Antichess {
    const pos = new this();
    pos.reset();
    return pos;
  }

  static fromSetup(setup: Setup): Result<Antichess, PositionError> {
    const pos = new this();
    pos.setupUnchecked(setup);
    return pos.validate().map(_ => pos);
  }

  clone(): Antichess {
    return super.clone() as Antichess;
  }

  protected validate(): Result<undefined, PositionError> {
    if (this.board.occupied.isEmpty()) return Result.err(new PositionError(IllegalSetup.Empty));
    if (SquareSet.backranks().intersects(this.board.pawn)) {
      return Result.err(new PositionError(IllegalSetup.PawnsOnBackrank));
    }
    return Result.ok(undefined);
  }

  kingAttackers(_square: Square, _attacker: Color, _occupied: SquareSet): SquareSet {
    return SquareSet.empty();
  }

  ctx(): Context {
    const ctx = super.ctx();
    if (
      defined(this.epSquare)
      && pawnAttacks(opposite(this.turn), this.epSquare).intersects(this.board.pieces(this.turn, 'pawn'))
    ) {
      ctx.mustCapture = true;
      return ctx;
    }
    const enemy = this.board[opposite(this.turn)];
    for (const from of this.board[this.turn]) {
      if (pseudoDests(this, from, ctx).intersects(enemy)) {
        ctx.mustCapture = true;
        return ctx;
      }
    }
    return ctx;
  }

  dests(square: Square, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();
    const dests = pseudoDests(this, square, ctx);
    const enemy = this.board[opposite(this.turn)];
    return dests.intersect(
      ctx.mustCapture
        ? defined(this.epSquare) && this.board.getRole(square) === 'pawn'
          ? enemy.with(this.epSquare)
          : enemy
        : SquareSet.full(),
    );
  }

  hasInsufficientMaterial(color: Color): boolean {
    if (this.board[color].isEmpty()) return false;
    if (this.board[opposite(color)].isEmpty()) return true;
    if (this.board.occupied.equals(this.board.bishop)) {
      const weSomeOnLight = this.board[color].intersects(SquareSet.lightSquares());
      const weSomeOnDark = this.board[color].intersects(SquareSet.darkSquares());
      const theyAllOnDark = this.board[opposite(color)].isDisjoint(SquareSet.lightSquares());
      const theyAllOnLight = this.board[opposite(color)].isDisjoint(SquareSet.darkSquares());
      return (weSomeOnLight && theyAllOnDark) || (weSomeOnDark && theyAllOnLight);
    }
    if (this.board.occupied.equals(this.board.knight) && this.board.occupied.size() === 2) {
      return (
        (this.board.white.intersects(SquareSet.lightSquares())
          !== this.board.black.intersects(SquareSet.darkSquares()))
          !== (this.turn === color)
      );
    }
    return false;
  }

  isVariantEnd(): boolean {
    return this.board[this.turn].isEmpty();
  }

  variantOutcome(ctx?: Context): Outcome | undefined {
    ctx = ctx || this.ctx();
    if (ctx.variantEnd || this.isStalemate(ctx)) {
      return { winner: this.turn };
    }
    return;
  }
}

export class KingOfTheHill extends Position {
  private constructor() {
    super('kingofthehill');
  }

  static default(): KingOfTheHill {
    const pos = new this();
    pos.reset();
    return pos;
  }

  static fromSetup(setup: Setup): Result<KingOfTheHill, PositionError> {
    const pos = new this();
    pos.setupUnchecked(setup);
    return pos.validate().map(_ => pos);
  }

  clone(): KingOfTheHill {
    return super.clone() as KingOfTheHill;
  }

  hasInsufficientMaterial(_color: Color): boolean {
    return false;
  }

  isVariantEnd(): boolean {
    return this.board.king.intersects(SquareSet.center());
  }

  variantOutcome(_ctx?: Context): Outcome | undefined {
    for (const color of COLORS) {
      if (this.board.pieces(color, 'king').intersects(SquareSet.center())) return { winner: color };
    }
    return;
  }
}

export class ThreeCheck extends Position {
  private constructor() {
    super('3check');
  }

  reset() {
    super.reset();
    this.remainingChecks = RemainingChecks.default();
  }

  protected setupUnchecked(setup: Setup) {
    super.setupUnchecked(setup);
    this.remainingChecks = setup.remainingChecks?.clone() || RemainingChecks.default();
  }

  static default(): ThreeCheck {
    const pos = new this();
    pos.reset();
    return pos;
  }

  static fromSetup(setup: Setup): Result<ThreeCheck, PositionError> {
    const pos = new this();
    pos.setupUnchecked(setup);
    return pos.validate().map(_ => pos);
  }

  clone(): ThreeCheck {
    return super.clone() as ThreeCheck;
  }

  hasInsufficientMaterial(color: Color): boolean {
    return this.board.pieces(color, 'king').equals(this.board[color]);
  }

  isVariantEnd(): boolean {
    return !!this.remainingChecks && (this.remainingChecks.white <= 0 || this.remainingChecks.black <= 0);
  }

  variantOutcome(_ctx?: Context): Outcome | undefined {
    if (this.remainingChecks) {
      for (const color of COLORS) {
        if (this.remainingChecks[color] <= 0) return { winner: color };
      }
    }
    return;
  }
}

const racingKingsBoard = (): Board => {
  const board = Board.empty();
  board.occupied = new SquareSet(0xffff, 0);
  board.promoted = SquareSet.empty();
  board.white = new SquareSet(0xf0f0, 0);
  board.black = new SquareSet(0x0f0f, 0);
  board.pawn = SquareSet.empty();
  board.knight = new SquareSet(0x1818, 0);
  board.bishop = new SquareSet(0x2424, 0);
  board.rook = new SquareSet(0x4242, 0);
  board.queen = new SquareSet(0x0081, 0);
  board.king = new SquareSet(0x8100, 0);
  return board;
};

export class RacingKings extends Position {
  private constructor() {
    super('racingkings');
  }

  reset() {
    this.board = racingKingsBoard();
    this.pockets = undefined;
    this.turn = 'white';
    this.castles = Castles.empty();
    this.epSquare = undefined;
    this.remainingChecks = undefined;
    this.halfmoves = 0;
    this.fullmoves = 1;
  }

  setupUnchecked(setup: Setup) {
    super.setupUnchecked(setup);
    this.castles = Castles.empty();
  }

  static default(): RacingKings {
    const pos = new this();
    pos.reset();
    return pos;
  }

  static fromSetup(setup: Setup): Result<RacingKings, PositionError> {
    const pos = new this();
    pos.setupUnchecked(setup);
    return pos.validate().map(_ => pos);
  }

  clone(): RacingKings {
    return super.clone() as RacingKings;
  }

  protected validate(): Result<undefined, PositionError> {
    if (this.isCheck() || this.board.pawn.nonEmpty()) return Result.err(new PositionError(IllegalSetup.Variant));
    return super.validate();
  }

  dests(square: Square, ctx?: Context): SquareSet {
    ctx = ctx || this.ctx();

    // Kings cannot give check.
    if (square === ctx.king) return super.dests(square, ctx);

    // Do not allow giving check.
    let dests = SquareSet.empty();
    for (const to of super.dests(square, ctx)) {
      // Valid, because there are no promotions (or even pawns).
      const move = { from: square, to };
      const after = this.clone();
      after.play(move);
      if (!after.isCheck()) dests = dests.with(to);
    }
    return dests;
  }

  hasInsufficientMaterial(_color: Color): boolean {
    return false;
  }

  isVariantEnd(): boolean {
    const goal = SquareSet.fromRank(7);
    const inGoal = this.board.king.intersect(goal);
    if (inGoal.isEmpty()) return false;
    if (this.turn === 'white' || inGoal.intersects(this.board.black)) return true;

    // White has reached the backrank. Check if black can catch up.
    const blackKing = this.board.kingOf('black');
    if (defined(blackKing)) {
      const occ = this.board.occupied.without(blackKing);
      for (const target of kingAttacks(blackKing).intersect(goal).diff(this.board.black)) {
        if (this.kingAttackers(target, 'white', occ).isEmpty()) return false;
      }
    }
    return true;
  }

  variantOutcome(ctx?: Context): Outcome | undefined {
    if (ctx ? !ctx.variantEnd : !this.isVariantEnd()) return;
    const goal = SquareSet.fromRank(7);
    const blackInGoal = this.board.pieces('black', 'king').intersects(goal);
    const whiteInGoal = this.board.pieces('white', 'king').intersects(goal);
    if (blackInGoal && !whiteInGoal) return { winner: 'black' };
    if (whiteInGoal && !blackInGoal) return { winner: 'white' };
    return { winner: undefined };
  }
}

const hordeBoard = (): Board => {
  const board = Board.empty();
  board.occupied = new SquareSet(0xffff_ffff, 0xffff_0066);
  board.promoted = SquareSet.empty();
  board.white = new SquareSet(0xffff_ffff, 0x0000_0066);
  board.black = new SquareSet(0, 0xffff_0000);
  board.pawn = new SquareSet(0xffff_ffff, 0x00ff_0066);
  board.knight = new SquareSet(0, 0x4200_0000);
  board.bishop = new SquareSet(0, 0x2400_0000);
  board.rook = new SquareSet(0, 0x8100_0000);
  board.queen = new SquareSet(0, 0x0800_0000);
  board.king = new SquareSet(0, 0x1000_0000);
  return board;
};

export class Horde extends Position {
  private constructor() {
    super('horde');
  }

  reset() {
    this.board = hordeBoard();
    this.pockets = undefined;
    this.turn = 'white';
    this.castles = Castles.default();
    this.castles.discardColor('white');
    this.epSquare = undefined;
    this.remainingChecks = undefined;
    this.halfmoves = 0;
    this.fullmoves = 1;
  }

  static default(): Horde {
    const pos = new this();
    pos.reset();
    return pos;
  }

  static fromSetup(setup: Setup): Result<Horde, PositionError> {
    const pos = new this();
    pos.setupUnchecked(setup);
    return pos.validate().map(_ => pos);
  }

  clone(): Horde {
    return super.clone() as Horde;
  }

  protected validate(): Result<undefined, PositionError> {
    if (this.board.occupied.isEmpty()) return Result.err(new PositionError(IllegalSetup.Empty));
    if (this.board.king.size() !== 1) return Result.err(new PositionError(IllegalSetup.Kings));

    const otherKing = this.board.kingOf(opposite(this.turn));
    if (defined(otherKing) && this.kingAttackers(otherKing, this.turn, this.board.occupied).nonEmpty()) {
      return Result.err(new PositionError(IllegalSetup.OppositeCheck));
    }
    for (const color of COLORS) {
      const backranks = this.board.pieces(color, 'king').isEmpty()
        ? SquareSet.backrank(opposite(color))
        : SquareSet.backranks();
      if (this.board.pieces(color, 'pawn').intersects(backranks)) {
        return Result.err(new PositionError(IllegalSetup.PawnsOnBackrank));
      }
    }
    return Result.ok(undefined);
  }

  hasInsufficientMaterial(color: Color): boolean {
    // The side with the king can always win by capturing the horde.
    if (this.board.pieces(color, 'king').nonEmpty()) return false;

    type SquareColor = 'light' | 'dark';
    const oppositeSquareColor = (squareColor: SquareColor): SquareColor => (squareColor === 'light' ? 'dark' : 'light');
    const coloredSquares = (squareColor: SquareColor): SquareSet =>
      squareColor === 'light' ? SquareSet.lightSquares() : SquareSet.darkSquares();

    const hasBishopPair = (side: Color) => {
      const bishops = this.board.pieces(side, 'bishop');
      return bishops.intersects(SquareSet.darkSquares()) && bishops.intersects(SquareSet.lightSquares());
    };

    // By this point: color is the horde.
    // Based on
    // https://github.com/stevepapazis/horde-insufficient-material-tests.
    const horde = MaterialSide.fromBoard(this.board, color);
    const hordeBishops = (squareColor: SquareColor) =>
      coloredSquares(squareColor).intersect(this.board.pieces(color, 'bishop')).size();
    const hordeBishopColor: SquareColor = hordeBishops('light') >= 1 ? 'light' : 'dark';
    const hordeNum = horde.pawn
      + horde.knight
      + horde.rook
      + horde.queen
      + Math.min(hordeBishops('dark'), 2)
      + Math.min(hordeBishops('light'), 2);

    const pieces = MaterialSide.fromBoard(this.board, opposite(color));
    const piecesBishops = (squareColor: SquareColor) =>
      coloredSquares(squareColor)
        .intersect(this.board.pieces(opposite(color), 'bishop'))
        .size();
    const piecesNum = pieces.size();
    const piecesOfRoleNot = (piece: number) => piecesNum - piece;

    if (hordeNum === 0) return true;
    if (hordeNum >= 4) {
      // Four or more pieces can always deliver mate.
      return false;
    }
    if ((horde.pawn >= 1 || horde.queen >= 1) && hordeNum >= 2) {
      // Pawns/queens are never insufficient material when paired with any other
      // piece (a pawn promotes to a queen and delivers mate).
      return false;
    }
    if (horde.rook >= 1 && hordeNum >= 2) {
      // A rook is insufficient material only when it is paired with a bishop
      // against a lone king. The horde can mate in any other case.
      // A rook on A1 and a bishop on C3 mate a king on B1 when there is a
      // friendly pawn/opposite-color-bishop/rook/queen on C2.
      // A rook on B8 and a bishop C3 mate a king on A1 when there is a friendly
      // knight on A2.
      if (
        !(
          hordeNum === 2
          && horde.rook === 1
          && horde.bishop === 1
          && piecesOfRoleNot(piecesBishops(hordeBishopColor)) === 1
        )
      ) {
        return false;
      }
    }

    if (hordeNum === 1) {
      if (piecesNum === 1) {
        // A lone piece cannot mate a lone king.
        return true;
      } else if (horde.queen === 1) {
        // The horde has a lone queen.
        // A lone queen mates a king on A1 bounded by:
        //  -- a pawn/rook on A2
        //  -- two same color bishops on A2, B1
        // We ignore every other mating case, since it can be reduced to
        // the two previous cases (e.g. a black pawn on A2 and a black
        // bishop on B1).
        return !(pieces.pawn >= 1 || pieces.rook >= 1 || piecesBishops('light') >= 2 || piecesBishops('dark') >= 2);
      } else if (horde.pawn === 1) {
        // Promote the pawn to a queen or a knight and check whether white
        // can mate.
        const pawnSquare = this.board.pieces(color, 'pawn').last()!;
        const promoteToQueen = this.clone();
        promoteToQueen.board.set(pawnSquare, { color, role: 'queen' });
        const promoteToKnight = this.clone();
        promoteToKnight.board.set(pawnSquare, { color, role: 'knight' });
        return promoteToQueen.hasInsufficientMaterial(color) && promoteToKnight.hasInsufficientMaterial(color);
      } else if (horde.rook === 1) {
        // A lone rook mates a king on A8 bounded by a pawn/rook on A7 and a
        // pawn/knight on B7. We ignore every other case, since it can be
        // reduced to the two previous cases.
        // (e.g. three pawns on A7, B7, C7)
        return !(
          pieces.pawn >= 2
          || (pieces.rook >= 1 && pieces.pawn >= 1)
          || (pieces.rook >= 1 && pieces.knight >= 1)
          || (pieces.pawn >= 1 && pieces.knight >= 1)
        );
      } else if (horde.bishop === 1) {
        // The horde has a lone bishop.
        return !(
          // The king can be mated on A1 if there is a pawn/opposite-color-bishop
          // on A2 and an opposite-color-bishop on B1.
          // If black has two or more pawns, white gets the benefit of the doubt;
          // there is an outside chance that white promotes its pawns to
          // opposite-color-bishops and selfmates theirself.
          // Every other case that the king is mated by the bishop requires that
          // black has two pawns or two opposite-color-bishop or a pawn and an
          // opposite-color-bishop.
          // For example a king on A3 can be mated if there is
          // a pawn/opposite-color-bishop on A4, a pawn/opposite-color-bishop on
          // B3, a pawn/bishop/rook/queen on A2 and any other piece on B2.
          piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 2
          || (piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1 && pieces.pawn >= 1)
          || pieces.pawn >= 2
        );
      } else if (horde.knight === 1) {
        // The horde has a lone knight.
        return !(
          // The king on A1 can be smother mated by a knight on C2 if there is
          // a pawn/knight/bishop on B2, a knight/rook on B1 and any other piece
          // on A2.
          // Moreover, when black has four or more pieces and two of them are
          // pawns, black can promote their pawns and selfmate theirself.
          piecesNum >= 4
          && (pieces.knight >= 2
            || pieces.pawn >= 2
            || (pieces.rook >= 1 && pieces.knight >= 1)
            || (pieces.rook >= 1 && pieces.bishop >= 1)
            || (pieces.knight >= 1 && pieces.bishop >= 1)
            || (pieces.rook >= 1 && pieces.pawn >= 1)
            || (pieces.knight >= 1 && pieces.pawn >= 1)
            || (pieces.bishop >= 1 && pieces.pawn >= 1)
            || (hasBishopPair(opposite(color)) && pieces.pawn >= 1))
          && (piecesBishops('dark') < 2 || piecesOfRoleNot(piecesBishops('dark')) >= 3)
          && (piecesBishops('light') < 2 || piecesOfRoleNot(piecesBishops('light')) >= 3)
        );
      }

      // By this point, we only need to deal with white's minor pieces.
    } else if (hordeNum === 2) {
      if (piecesNum === 1) {
        // Two minor pieces cannot mate a lone king.
        return true;
      } else if (horde.knight === 2) {
        // A king on A1 is mated by two knights, if it is obstructed by a
        // pawn/bishop/knight on B2. On the other hand, if black only has
        // major pieces it is a draw.
        return pieces.pawn + pieces.bishop + pieces.knight < 1;
      } else if (hasBishopPair(color)) {
        return !(
          // A king on A1 obstructed by a pawn/bishop on A2 is mated
          // by the bishop pair.
          pieces.pawn >= 1
          || pieces.bishop >= 1
          // A pawn/bishop/knight on B4, a pawn/bishop/rook/queen on
          // A4 and the king on A3 enable Boden's mate by the bishop
          // pair. In every other case white cannot win.
          || (pieces.knight >= 1 && pieces.rook + pieces.queen >= 1)
        );
      } else if (horde.bishop >= 1 && horde.knight >= 1) {
        // The horde has a bishop and a knight.
        return !(
          // A king on A1 obstructed by a pawn/opposite-color-bishop on
          // A2 is mated by a knight on D2 and a bishop on C3.
          pieces.pawn >= 1
          || piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1
          // A king on A1 bounded by two friendly pieces on A2 and B1 is
          // mated when the knight moves from D4 to C2 so that both the
          // knight and the bishop deliver check.
          || piecesOfRoleNot(piecesBishops(hordeBishopColor)) >= 3
        );
      } else {
        // The horde has two or more bishops on the same color.
        // White can only win if black has enough material to obstruct
        // the squares of the opposite color around the king.
        return !(
          // A king on A1 obstructed by a pawn/opposite-bishop/knight
          // on A2 and a opposite-bishop/knight on B1 is mated by two
          // bishops on B2 and C3. This position is theoretically
          // achievable even when black has two pawns or when they
          // have a pawn and an opposite color bishop.
          (pieces.pawn >= 1 && piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1)
          || (pieces.pawn >= 1 && pieces.knight >= 1)
          || (piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 1 && pieces.knight >= 1)
          || piecesBishops(oppositeSquareColor(hordeBishopColor)) >= 2
          || pieces.knight >= 2
          || pieces.pawn >= 2
          // In every other case, white can only draw.
        );
      }
    } else if (hordeNum === 3) {
      // A king in the corner is mated by two knights and a bishop or three
      // knights or the bishop pair and a knight/bishop.
      if ((horde.knight === 2 && horde.bishop === 1) || horde.knight === 3 || hasBishopPair(color)) {
        return false;
      } else {
        // White has two same color bishops and a knight.
        // A king on A1 is mated by a bishop on B2, a bishop on C1 and a
        // knight on C3, as long as there is another black piece to waste
        // a tempo.
        return piecesNum === 1;
      }
    }

    return true;
  }

  isVariantEnd(): boolean {
    return this.board.white.isEmpty() || this.board.black.isEmpty();
  }

  variantOutcome(_ctx?: Context): Outcome | undefined {
    if (this.board.white.isEmpty()) return { winner: 'black' };
    if (this.board.black.isEmpty()) return { winner: 'white' };
    return;
  }
}

export const defaultPosition = (rules: Rules): Position => {
  switch (rules) {
    case 'chess':
      return Chess.default();
    case 'antichess':
      return Antichess.default();
    case 'atomic':
      return Atomic.default();
    case 'horde':
      return Horde.default();
    case 'racingkings':
      return RacingKings.default();
    case 'kingofthehill':
      return KingOfTheHill.default();
    case '3check':
      return ThreeCheck.default();
    case 'crazyhouse':
      return Crazyhouse.default();
  }
};

export const setupPosition = (rules: Rules, setup: Setup): Result<Position, PositionError> => {
  switch (rules) {
    case 'chess':
      return Chess.fromSetup(setup);
    case 'antichess':
      return Antichess.fromSetup(setup);
    case 'atomic':
      return Atomic.fromSetup(setup);
    case 'horde':
      return Horde.fromSetup(setup);
    case 'racingkings':
      return RacingKings.fromSetup(setup);
    case 'kingofthehill':
      return KingOfTheHill.fromSetup(setup);
    case '3check':
      return ThreeCheck.fromSetup(setup);
    case 'crazyhouse':
      return Crazyhouse.fromSetup(setup);
  }
};

export const isStandardMaterial = (pos: Position): boolean => {
  switch (pos.rules) {
    case 'chess':
    case 'antichess':
    case 'atomic':
    case 'kingofthehill':
    case '3check':
      return COLORS.every(color => isStandardMaterialSide(pos.board, color));
    case 'crazyhouse': {
      const promoted = pos.board.promoted;
      return (
        promoted.size() + pos.board.pawn.size() + (pos.pockets?.count('pawn') || 0) <= 16
        && pos.board.knight.diff(promoted).size() + (pos.pockets?.count('knight') || 0) <= 4
        && pos.board.bishop.diff(promoted).size() + (pos.pockets?.count('bishop') || 0) <= 4
        && pos.board.rook.diff(promoted).size() + (pos.pockets?.count('rook') || 0) <= 4
        && pos.board.queen.diff(promoted).size() + (pos.pockets?.count('queen') || 0) <= 2
      );
    }
    case 'horde':
      return COLORS.every(color =>
        pos.board.pieces(color, 'king').nonEmpty()
          ? isStandardMaterialSide(pos.board, color)
          : pos.board[color].size() <= 36
      );
    case 'racingkings':
      return COLORS.every(
        color =>
          pos.board.pieces(color, 'knight').size() <= 2
          && pos.board.pieces(color, 'bishop').size() <= 2
          && pos.board.pieces(color, 'rook').size() <= 2
          && pos.board.pieces(color, 'queen').size() <= 1,
      );
  }
};
