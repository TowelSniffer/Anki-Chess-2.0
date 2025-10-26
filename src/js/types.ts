import type { Color } from 'chessground/types';
import type { Api } from 'chessground/api';
import type { Chess, Square } from 'chess.js';
import type { PgnMove, PgnGame, GameComment } from '@mliebelt/pgn-types';
import type { CustomShape } from './arrows';

// --- types ---

export type MirrorState = "original" | "original_mirror" | "invert" | "invert_mirror";

export type PgnPath = ("v" | number)[];

// config types
export type BoardModes = "Viewer" | "Puzzle";

export type ErrorTrack = null | "incorrect" | "correct" | "correctTime";

// custom Pgnviewer types
export type CustomPgnMove = Omit<PgnMove, `variations` | 'moveNumber' | 'drawOffer' | 'commentDiag'> & {
    before: string;
    after: string;
    from: Square;
    to: Square;
    flags: string;
    san: string;
    drawOffer?: boolean;
    moveNumber?: number;
    commentDiag?: GameComment;
    pgnPath: PgnPath;
    variations: CustomPgnMove[][];
};

export type CustomPgnGame = Omit<PgnGame, 'moves'> & {
    moves: CustomPgnMove[];
};

// --- interface ---
export interface Config {
    pgn: string;
    ankiText: string | null;
    frontText: boolean;
    muteAudio: boolean;
    showDests: boolean;
    singleClickMove: boolean;
    handicap: number;
    strictScoring: boolean;
    acceptVariations: boolean;
    disableArrows: boolean;
    flipBoard: boolean;
    boardMode: 'Viewer' | 'Puzzle';
    background: string;
    mirror: boolean;
    randomOrientation: boolean;
    autoAdvance: boolean;
    handicapAdvance: boolean;
    timer: number;
    increment: number;
    timerAdvance: boolean;
    timerScore: boolean;
    analysisTime: number;
    animationTime: number;
}

export interface State {
    startFen: string;
    boardRotation: Color;
    playerColour: Color;
    opponentColour: Color;
    solvedColour: "var(--correct-color)" | "var(--incorrect-color)" | "var(--perfect-color)";
    errorTrack: ErrorTrack;
    chessGroundShapes: CustomShape[];
    errorCount: number;
    puzzleTime: number;
    puzzleComplete: boolean;
    navTimeout: number | null;
    isStockfishBusy: boolean;
    stockfishRestart: boolean; // Error guard for stockfish
    analysisToggledOn: boolean;
    pgnPath: PgnPath;
    pgnPathMap: Map<string, CustomPgnMove>;
    lastMove: CustomPgnMove | null;
    mirrorState: MirrorState | null;
    cgwrap: HTMLDivElement;
    cg: Api;
    chess: Chess;
    parsedPGN: CustomPgnGame;
    delayTime: number;
}
