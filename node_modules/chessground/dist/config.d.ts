import { HeadlessState } from './state.js';
import { DrawShape, DrawBrushes } from './draw.js';
import * as cg from './types.js';
export interface Config {
    fen?: cg.FEN;
    orientation?: cg.Color;
    turnColor?: cg.Color;
    check?: cg.Color | boolean;
    lastMove?: cg.Key[];
    selected?: cg.Key;
    coordinates?: boolean;
    coordinatesOnSquares?: boolean;
    autoCastle?: boolean;
    viewOnly?: boolean;
    disableContextMenu?: boolean;
    addPieceZIndex?: boolean;
    addDimensionsCssVarsTo?: HTMLElement;
    blockTouchScroll?: boolean;
    trustAllEvents?: boolean;
    highlight?: {
        lastMove?: boolean;
        check?: boolean;
        custom?: cg.SquareClasses;
    };
    animation?: {
        enabled?: boolean;
        duration?: number;
    };
    movable?: {
        free?: boolean;
        color?: cg.Color | 'both';
        dests?: cg.Dests;
        showDests?: boolean;
        events?: {
            after?: (orig: cg.Key, dest: cg.Key, metadata: cg.MoveMetadata) => void;
            afterNewPiece?: (role: cg.Role, key: cg.Key, metadata: cg.MoveMetadata) => void;
        };
        rookCastle?: boolean;
    };
    premovable?: {
        enabled?: boolean;
        showDests?: boolean;
        castle?: boolean;
        dests?: cg.Key[];
        customDests?: cg.Dests;
        events?: {
            set?: (orig: cg.Key, dest: cg.Key, metadata?: cg.SetPremoveMetadata) => void;
            unset?: () => void;
        };
    };
    predroppable?: {
        enabled?: boolean;
        events?: {
            set?: (role: cg.Role, key: cg.Key) => void;
            unset?: () => void;
        };
    };
    draggable?: {
        enabled?: boolean;
        distance?: number;
        autoDistance?: boolean;
        showGhost?: boolean;
        deleteOnDropOff?: boolean;
    };
    selectable?: {
        enabled?: boolean;
    };
    events?: {
        change?: () => void;
        move?: (orig: cg.Key, dest: cg.Key, capturedPiece?: cg.Piece) => void;
        dropNewPiece?: (piece: cg.Piece, key: cg.Key) => void;
        select?: (key: cg.Key) => void;
        insert?: (elements: cg.Elements) => void;
    };
    drawable?: {
        enabled?: boolean;
        visible?: boolean;
        defaultSnapToValidMove?: boolean;
        eraseOnClick?: boolean;
        shapes?: DrawShape[];
        autoShapes?: DrawShape[];
        brushes?: DrawBrushes;
        onChange?: (shapes: DrawShape[]) => void;
    };
}
export declare function applyAnimation(state: HeadlessState, config: Config): void;
export declare function configure(state: HeadlessState, config: Config): void;
