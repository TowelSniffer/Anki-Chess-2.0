import { Game } from './game';
import { Comments, Lichess } from './interfaces';
export declare const parseComments: (strings: string[]) => Comments;
export declare const makeGame: (pgn: string, lichess?: Lichess) => Game;
