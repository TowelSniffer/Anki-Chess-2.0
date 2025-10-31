export type Sounds =
  | "move"
  | "checkmate"
  | "check"
  | "capture"
  | "castle"
  | "promote"
  | "Error"
  | "computer-mouse-click";

export type MoveEvent =
  | "checkmate"
  | "promote"
  | "castle"
  | "capture"
  | "check"
  | "move";

export interface SoundPriorityRule {
  event: MoveEvent;
  condition: (san: string, flags: string) => boolean;
}
