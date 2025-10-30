import type { CustomPgnMove } from "../../core/types";
import { config } from "../../core/config";

type Sounds =
  | "move"
  | "checkmate"
  | "check"
  | "capture"
  | "castle"
  | "promote"
  | "Error"
  | "computer-mouse-click";
type MoveEvent =
  | "checkmate"
  | "promote"
  | "castle"
  | "capture"
  | "check"
  | "move";

interface SoundPriorityRule {
  event: MoveEvent;
  condition: (san: string, flags: string) => boolean;
}

const moveSoundMap: Record<MoveEvent, MoveEvent> = {
  checkmate: "checkmate",
  promote: "promote",
  castle: "castle",
  capture: "capture",
  check: "check",
  move: "move",
};

const moveSoundPriority: SoundPriorityRule[] = [
  { event: "checkmate", condition: (san: string) => san.includes("#") },
  { event: "check", condition: (san: string) => san.includes("+") },
  {
    event: "promote",
    condition: (_san: string, flags: string) => flags.includes("p"),
  },
  {
    event: "castle",
    condition: (_san: string, flags: string) =>
      flags.includes("k") || flags.includes("q"),
  },
  {
    event: "capture",
    condition: (_san: string, flags: string) =>
      flags.includes("c") || flags.includes("e"),
  },
];

function initAudio(): Map<Sounds, HTMLAudioElement> {
  // prload audio to avoid firefox error
  const sounds: Sounds[] = [
    "move",
    "checkmate",
    "check",
    "capture",
    "castle",
    "promote",
    "Error",
    "computer-mouse-click",
  ];
  const audioMap: Map<Sounds, HTMLAudioElement> = new Map();

  sounds.forEach((sound) => {
    const audio = new Audio(`_${sound}.mp3`);
    audio.preload = "auto";
    audioMap.set(sound, audio);
  });
  return audioMap;
}

const audioMap: Map<Sounds, HTMLAudioElement> = initAudio();

export function playSound(soundName: Sounds): void {
  if (config.muteAudio) return;

  const audio = audioMap.get(soundName);
  if (audio) {
    const clone = audio.cloneNode();
    if (clone instanceof HTMLAudioElement) {
      clone
        .play()
        .catch((e) => console.error(`Could not play sound: ${soundName}`, e));
    }
  }
}

export function moveAudio(move: CustomPgnMove): void {
  if (config.muteAudio) return;

  const moveType = moveSoundPriority.find((p) =>
    p.condition(move.san, move.flags),
  );
  const soundToPlay = moveType
    ? moveSoundMap[moveType.event]
    : moveSoundMap.move;

  playSound(soundToPlay);
}
