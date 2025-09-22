import { Chessground } from 'chessground';
import type { Color, Key } from 'chessground/types';
import { Move } from 'chess.js';
import type { DrawShape } from 'chessground/draw';
import { PgnMove, PgnGame } from '@mliebelt/pgn-types';
import { MirrorState } from './mirror';

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
    promoteAnimate: boolean;
    debounceCheck: boolean | Move;
    navTimeout: number | null;
    isStockfishBusy: boolean;
    analysisFen: string | booleanValues;
    analysisToggledOn: boolean;
    pgnPath: string | (string | number)[] | null;
    mirrorState: MirrorState | null;
    blunderNags: string[];
    puzzleComplete: string | boolean;
}

// Define the shape of the imported nags.json file.
export interface NagData {
    [nagKey: string]: string[]; // [description, symbol/sub array of symbols]
}

export interface ParentContext {
    parent: CustomPgnMove;
    parentLine: CustomPgnMove[];
    index: number;
}

// --- types ---
export type PromotionPieces = 'q' | 'r' | 'b' | 'n';

export type booleanValues = "true" | "false" | boolean | null;

export type Api = ReturnType<typeof Chessground>;

export type CustomPgnMove = Omit<PgnMove, `variations` | 'moveNumber'> & {
    moveNumber: number | null;
    pgnPath?: (string | number)[];
    variations: CustomPgnMove[][];
};
export type CustomPgnGame = Omit<PgnGame, 'moves'> & {
    moves: CustomPgnMove[];
};

export interface CustomShape extends DrawShape {
    san?: string
}
