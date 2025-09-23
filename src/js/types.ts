import { Chessground } from 'chessground';
import type { Color } from 'chessground/types';
import { Move } from 'chess.js';
import type { DrawShape } from 'chessground/draw';
import { PgnMove, PgnGame } from '@mliebelt/pgn-types';
import type { MirrorState } from './mirror';
import type { PgnPathString, PgnPath } from './pgnViewer';

// --- interface ---
export interface Config {
    pgn: string;
    fontSize: number;
    ankiText: string | null;
    frontText: boolean;
    muteAudio: boolean;
    showDests: boolean;
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
    ankiFen: string;
    boardRotation: Color;
    playerColour: Color;
    opponentColour: Color;
    solvedColour: string;
    errorTrack: "correct" | "correctTime" | booleanValues;
    count: number;
    pgnState: boolean;
    chessGroundShapes: CustomShape[];
    expectedLine: CustomPgnMove[];
    expectedMove: CustomPgnMove | null;
    lastMove: Move | false;
    errorCount: number;
    promoteChoice: PromotionPieces;
    promoteAnimate: boolean | null;
    debounceCheck: boolean | Move;
    navTimeout: number | null;
    isStockfishBusy: boolean;
    analysisFen: string | booleanValues;
    analysisToggledOn: boolean;
    pgnPath: PgnPathString | PgnPath | null;
    mirrorState: MirrorState | null;
    blunderNags: string[];
    puzzleComplete: string | boolean;
}

// --- types ---

export type PromotionPieces = 'q' | 'r' | 'b' | 'n';

export type booleanValues = "true" | "false" | boolean | null;

export type CustomPgnMove = Omit<PgnMove, `variations` | 'moveNumber'> & {
    moveNumber: number | null;
    pgnPath?: PgnPath;
    variations: CustomPgnMove[][];
};
export type CustomPgnGame = Omit<PgnGame, 'moves'> & {
    moves: CustomPgnMove[];
};

export interface CustomShape extends DrawShape {
    san?: string
}
