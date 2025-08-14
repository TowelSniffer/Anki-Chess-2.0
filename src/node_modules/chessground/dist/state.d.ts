import { AnimCurrent } from './anim.js';
import { DragCurrent } from './drag.js';
import { Drawable } from './draw.js';
import * as cg from './types.js';
export interface HeadlessState {
    pieces: cg.Pieces;
    orientation: cg.Color;
    turnColor: cg.Color;
    check?: cg.Key;
    lastMove?: cg.Key[];
    selected?: cg.Key;
    coordinates: boolean;
    coordinatesOnSquares: boolean;
    ranksPosition: cg.RanksPosition;
    autoCastle: boolean;
    viewOnly: boolean;
    disableContextMenu: boolean;
    addPieceZIndex: boolean;
    addDimensionsCssVarsTo?: HTMLElement;
    blockTouchScroll: boolean;
    pieceKey: boolean;
    trustAllEvents?: boolean;
    highlight: {
        lastMove: boolean;
        check: boolean;
        custom?: cg.SquareClasses;
    };
    animation: {
        enabled: boolean;
        duration: number;
        current?: AnimCurrent;
    };
    movable: {
        free: boolean;
        color?: cg.Color | 'both';
        dests?: cg.Dests;
        showDests: boolean;
        events: {
            after?: (orig: cg.Key, dest: cg.Key, metadata: cg.MoveMetadata) => void;
            afterNewPiece?: (role: cg.Role, key: cg.Key, metadata: cg.MoveMetadata) => void;
        };
        rookCastle: boolean;
    };
    premovable: {
        enabled: boolean;
        showDests: boolean;
        castle: boolean;
        dests?: cg.Key[];
        customDests?: cg.Dests;
        current?: cg.KeyPair;
        events: {
            set?: (orig: cg.Key, dest: cg.Key, metadata?: cg.SetPremoveMetadata) => void;
            unset?: () => void;
        };
    };
    predroppable: {
        enabled: boolean;
        current?: {
            role: cg.Role;
            key: cg.Key;
        };
        events: {
            set?: (role: cg.Role, key: cg.Key) => void;
            unset?: () => void;
        };
    };
    draggable: {
        enabled: boolean;
        distance: number;
        autoDistance: boolean;
        showGhost: boolean;
        deleteOnDropOff: boolean;
        current?: DragCurrent;
    };
    dropmode: {
        active: boolean;
        piece?: cg.Piece;
    };
    selectable: {
        enabled: boolean;
    };
    stats: {
        dragged: boolean;
        ctrlKey?: boolean;
    };
    events: {
        change?: () => void;
        move?: (orig: cg.Key, dest: cg.Key, capturedPiece?: cg.Piece) => void;
        dropNewPiece?: (piece: cg.Piece, key: cg.Key) => void;
        select?: (key: cg.Key) => void;
        insert?: (elements: cg.Elements) => void;
    };
    drawable: Drawable;
    exploding?: cg.Exploding;
    hold: cg.Timer;
}
export interface State extends HeadlessState {
    dom: cg.Dom;
}
export declare function defaults(): HeadlessState;
