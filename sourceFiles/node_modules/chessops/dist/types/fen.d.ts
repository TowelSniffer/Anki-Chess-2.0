import { Result } from '@badrap/result';
import { Board } from './board.js';
import { Material, MaterialSide, RemainingChecks, Setup } from './setup.js';
import { SquareSet } from './squareSet.js';
import { Piece } from './types.js';
export declare const INITIAL_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
export declare const INITIAL_EPD: string;
export declare const INITIAL_FEN: string;
export declare const EMPTY_BOARD_FEN = "8/8/8/8/8/8/8/8";
export declare const EMPTY_EPD: string;
export declare const EMPTY_FEN: string;
export declare enum InvalidFen {
    Fen = "ERR_FEN",
    Board = "ERR_BOARD",
    Pockets = "ERR_POCKETS",
    Turn = "ERR_TURN",
    Castling = "ERR_CASTLING",
    EpSquare = "ERR_EP_SQUARE",
    RemainingChecks = "ERR_REMAINING_CHECKS",
    Halfmoves = "ERR_HALFMOVES",
    Fullmoves = "ERR_FULLMOVES"
}
export declare class FenError extends Error {
}
export declare const parseBoardFen: (boardPart: string) => Result<Board, FenError>;
export declare const parsePockets: (pocketPart: string) => Result<Material, FenError>;
export declare const parseCastlingFen: (board: Board, castlingPart: string) => Result<SquareSet, FenError>;
export declare const parseRemainingChecks: (part: string) => Result<RemainingChecks, FenError>;
export declare const parseFen: (fen: string) => Result<Setup, FenError>;
export interface FenOpts {
    epd?: boolean;
}
export declare const parsePiece: (str: string) => Piece | undefined;
export declare const makePiece: (piece: Piece) => string;
export declare const makeBoardFen: (board: Board) => string;
export declare const makePocket: (material: MaterialSide) => string;
export declare const makePockets: (pocket: Material) => string;
export declare const makeCastlingFen: (board: Board, castlingRights: SquareSet) => string;
export declare const makeRemainingChecks: (checks: RemainingChecks) => string;
export declare const makeFen: (setup: Setup, opts?: FenOpts) => string;
