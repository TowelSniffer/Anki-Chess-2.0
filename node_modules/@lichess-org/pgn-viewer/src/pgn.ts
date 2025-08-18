import { Color, makeUci, Position } from 'chessops';
import { scalachessCharPair } from 'chessops/compat';
import { makeFen } from 'chessops/fen';
import { parsePgn, parseComment, PgnNodeData, startingPosition, transform, Node } from 'chessops/pgn';
import { makeSanAndPlay, parseSan } from 'chessops/san';
import { Game } from './game';
import { MoveData, Initial, Players, Player, Comments, Metadata, Clocks, Lichess } from './interfaces';
import { Path } from './path';

class State {
  constructor(
    readonly pos: Position,
    public path: Path,
    public clocks: Clocks,
  ) {}
  clone = () => new State(this.pos.clone(), this.path, { ...this.clocks });
}

export const parseComments = (strings: string[]): Comments => {
  const comments = strings.map(parseComment);
  const reduceTimes = (times: Array<number | undefined>) =>
    times.reduce<number | undefined>((last, time) => (typeof time == undefined ? last : time), undefined);
  return {
    texts: comments.map(c => c.text).filter(t => !!t),
    shapes: comments.flatMap(c => c.shapes),
    clock: reduceTimes(comments.map(c => c.clock)),
    emt: reduceTimes(comments.map(c => c.emt)),
  };
};

export const makeGame = (pgn: string, lichess: Lichess = false): Game => {
  const game = parsePgn(pgn)[0] || parsePgn('*')[0];
  const start = startingPosition(game.headers).unwrap();
  const fen = makeFen(start.toSetup());
  const comments = parseComments(game.comments || []);
  const headers = new Map(Array.from(game.headers, ([key, value]) => [key.toLowerCase(), value]));
  const metadata = makeMetadata(headers, lichess);
  const initial: Initial = {
    fen,
    turn: start.turn,
    check: start.isCheck(),
    pos: start.clone(),
    comments: comments.texts,
    shapes: comments.shapes,
    clocks: {
      white: metadata.timeControl?.initial || comments.clock,
      black: metadata.timeControl?.initial || comments.clock,
    },
  };
  const moves = makeMoves(start, game.moves, metadata);
  const players = makePlayers(headers, metadata);
  return new Game(initial, moves, players, metadata);
};

const makeMoves = (start: Position, moves: Node<PgnNodeData>, metadata: Metadata) =>
  transform<PgnNodeData, MoveData, State>(moves, new State(start, Path.root, {}), (state, node, _index) => {
    const move = parseSan(state.pos, node.san);
    if (!move) return undefined;
    const moveId = scalachessCharPair(move);
    const path = state.path.append(moveId);
    const san = makeSanAndPlay(state.pos, move);
    state.path = path;
    const setup = state.pos.toSetup();
    const comments = parseComments(node.comments || []);
    const startingComments = parseComments(node.startingComments || []);
    const shapes = [...comments.shapes, ...startingComments.shapes];
    const ply = (setup.fullmoves - 1) * 2 + (state.pos.turn === 'white' ? 0 : 1);
    let clocks = (state.clocks = makeClocks(state.clocks, state.pos.turn, comments.clock));
    if (ply < 2 && metadata.timeControl)
      clocks = {
        white: metadata.timeControl.initial,
        black: metadata.timeControl.initial,
        ...clocks,
      };
    const moveNode: MoveData = {
      path,
      ply,
      move,
      san,
      uci: makeUci(move),
      fen: makeFen(state.pos.toSetup()),
      turn: state.pos.turn,
      check: state.pos.isCheck(),
      comments: comments.texts,
      startingComments: startingComments.texts,
      nags: node.nags || [],
      shapes,
      clocks,
      emt: comments.emt,
    };
    return moveNode;
  });

const makeClocks = (prev: Clocks, turn: Color, clk?: number): Clocks =>
  turn == 'white' ? { ...prev, black: clk } : { ...prev, white: clk };

type Headers = Map<string, string>;

function makePlayers(headers: Headers, metadata: Metadata): Players {
  const get = (color: Color, field: string): string | undefined => {
    const raw = headers.get(`${color}${field}`);
    return raw == '?' || raw == '' ? undefined : raw;
  };
  const makePlayer = (color: Color): Player => {
    const name = get(color, '');
    return {
      name,
      title: get(color, 'title'),
      rating: parseInt(get(color, 'elo') || '') || undefined,
      isLichessUser: metadata.isLichess && !!name?.match(/^[a-z0-9][a-z0-9_-]{0,28}[a-z0-9]$/i),
    };
  };
  return {
    white: makePlayer('white'),
    black: makePlayer('black'),
  };
}

function makeMetadata(headers: Headers, lichess: Lichess): Metadata {
  const site =
    headers.get('chapterurl') || headers.get('gameurl') || headers.get('source') || headers.get('site');
  const tcs = headers
    .get('timecontrol')
    ?.split('+')
    .map(x => parseInt(x));
  const timeControl =
    tcs && tcs[0]
      ? {
          initial: tcs[0],
          increment: tcs[1] || 0,
        }
      : undefined;
  const orientation = headers.get('orientation');
  return {
    externalLink: site && site.match(/^https?:\/\//) ? site : undefined,
    isLichess: !!(lichess && site?.startsWith(lichess)),
    timeControl,
    orientation: orientation === 'white' || orientation === 'black' ? orientation : undefined,
    result: headers.get('result'),
  };
}
