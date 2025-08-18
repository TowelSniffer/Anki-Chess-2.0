import { Color, Move, Position } from 'chessops';
import { Config as CgConfig } from 'chessground/config';
import { FEN } from 'chessground/types';
import { Path } from './path';
import { CommentShape } from 'chessops/pgn';

export type Id = string;
export type San = string;
export type Uci = string;
export type Ply = number;

export type Translate = (key: string) => string | undefined;

export type Clocks = {
  white?: number;
  black?: number;
};

export interface InitialOrMove {
  fen: FEN;
  turn: Color;
  check: boolean;
  comments: string[];
  shapes: CommentShape[];
  clocks: Clocks;
}

export interface Initial extends InitialOrMove {
  pos: Position;
}

export interface MoveData extends InitialOrMove {
  path: Path;
  ply: number;
  move: Move;
  san: San;
  uci: Uci;
  startingComments: string[];
  nags: number[];
  emt?: number;
}

export interface Metadata {
  externalLink?: string;
  isLichess: boolean;
  timeControl?: {
    initial: number;
    increment: number;
  };
  orientation?: Color;
  result?: string;
}

export interface Player {
  name?: string;
  title?: string;
  rating?: number;
  isLichessUser: boolean;
}
export interface Players {
  white: Player;
  black: Player;
}

export type Pane = 'board' | 'menu' | 'pgn';

export interface Comments {
  texts: string[];
  shapes: CommentShape[];
  clock?: number;
  emt?: number;
}

export type GoTo = 'first' | 'prev' | 'next' | 'last';

export type ShowMoves = false | 'right' | 'bottom' | 'auto';
export type ShowPlayers = true | false | 'auto';
export type Lichess = string | false;

export interface Opts {
  pgn: string;
  fen?: string;
  chessground: CgConfig;
  orientation?: Color;
  showPlayers: ShowPlayers;
  showMoves: ShowMoves;
  showClocks: boolean;
  showControls: boolean;
  initialPly: Ply | 'last';
  scrollToMove: boolean;
  keyboardToMove: boolean;
  drawArrows: boolean;
  menu: {
    getPgn: {
      enabled?: boolean;
      fileName?: string;
    };
    practiceWithComputer?: {
      enabled?: boolean;
    };
    analysisBoard?: {
      enabled?: boolean;
    };
  };
  lichess: Lichess;
  classes?: string;
  translate?: Translate;
}
