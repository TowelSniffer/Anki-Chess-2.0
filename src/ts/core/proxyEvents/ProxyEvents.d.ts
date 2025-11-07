import type { ErrorTrack } from "../Config";
import type { PgnPath, CustomPgnMove } from "../../features/pgn/Pgn";

export interface EventPayloads {
  pgnPathChanged: [
    pgnPath: PgnPath,
    lastMove: CustomPgnMove | null,
    pathMove: CustomPgnMove,
  ];

  puzzleScored: [ErrorTrack];
}

// A generic Listener type
export type Listener<K extends keyof EventPayloads> = (
  ...args: EventPayloads[K]
) => void;
