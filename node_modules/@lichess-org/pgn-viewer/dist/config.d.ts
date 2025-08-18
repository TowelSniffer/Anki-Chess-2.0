import { Opts } from './interfaces';
export default function (element: HTMLElement, cfg: Partial<Opts>): {
    pgn: string;
    fen?: string;
    chessground: import("chessground/config").Config;
    orientation?: import("chessops").Color;
    showPlayers: import("./interfaces").ShowPlayers;
    showMoves: import("./interfaces").ShowMoves;
    showClocks: boolean;
    showControls: boolean;
    initialPly: import("./interfaces").Ply | "last";
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
    lichess: import("./interfaces").Lichess;
    classes?: string;
    translate?: import("./interfaces").Translate;
};
