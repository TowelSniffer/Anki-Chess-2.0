export type Sounds =
  | 'move'
  | 'checkmate'
  | 'check'
  | 'capture'
  | 'castle'
  | 'promote'
  | 'error'

export type MoveEvent =
  | 'checkmate'
  | 'promote'
  | 'castle'
  | 'capture'
  | 'check'
  | 'move';

export interface SoundPriorityRule {
  event: MoveEvent;
  condition: (san: string, flags: string) => boolean;
}
