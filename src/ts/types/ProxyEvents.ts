import type { ErrorTrack } from "./Main";
import type { PgnPath, CustomPgnMove } from "./Pgn";

export interface EventPayloads {
  pgnPathChanged: [
    pgnPath: PgnPath,
    lastMove: CustomPgnMove | null,
    pathMove: CustomPgnMove | null,
  ];

  puzzleScored: [ErrorTrack];
}

// A generic Listener type
export type Listener<K extends keyof EventPayloads> = (
  ...args: EventPayloads[K]
) => void;
