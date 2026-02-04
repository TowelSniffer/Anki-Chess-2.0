import type { CustomPgnMove } from '$stores/gameStore.svelte.ts';
import { userConfig } from '$stores/userConfig.svelte.ts';

type Sounds =
  | 'move'
  | 'checkmate'
  | 'check'
  | 'capture'
  | 'castle'
  | 'promote'
  | 'error'
  | 'computer-mouse-click';

type MoveEvent =
  | 'checkmate'
  | 'promote'
  | 'castle'
  | 'capture'
  | 'check'
  | 'move';

interface SoundPriorityRule {
  event: MoveEvent;
  condition: (san: string, flags: string) => boolean;
}

const moveSoundMap: Record<MoveEvent, MoveEvent> = {
  checkmate: 'checkmate',
  promote: 'promote',
  castle: 'castle',
  capture: 'capture',
  check: 'check',
  move: 'move',
};

const moveSoundPriority: SoundPriorityRule[] = [
  { event: 'checkmate', condition: (san: string) => san.includes('#') },
  { event: 'check', condition: (san: string) => san.includes('+') },
  {
    event: 'promote',
    condition: (_san: string, flags: string) => flags.includes('p'),
  },
  {
    event: 'castle',
    condition: (_san: string, flags: string) =>
      flags.includes('k') || flags.includes('q'),
  },
  {
    event: 'capture',
    condition: (_san: string, flags: string) =>
      flags.includes('c') || flags.includes('e'),
  },
];

// load assets using Vite's glob import (ensures correct hashed URL for production)
const audioModules = import.meta.glob('$assets/audio/_*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function initAudio(): Map<Sounds, HTMLAudioElement> {
  // prload audio to avoid firefox error
  const sounds: Sounds[] = [
    'move',
    'checkmate',
    'check',
    'capture',
    'castle',
    'promote',
    'error',
    'computer-mouse-click',
  ];
  const audioMap: Map<Sounds, HTMLAudioElement> = new Map();

  sounds.forEach((sound) => {
    const matchedPath = Object.keys(audioModules).find((path) =>
      path.endsWith(`_${sound}.mp3`),
    );

    if (matchedPath) {
      const url = audioModules[matchedPath];
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioMap.set(sound, audio);
    } else {
      console.warn(`Audio file for "${sound}" not found.`);
    }
  });
  return audioMap;
}

const audioMap: Map<Sounds, HTMLAudioElement> = initAudio();

export function playSound(soundName: Sounds): void {
  if (userConfig.muteAudio) return;

  const audio = audioMap.get(soundName);
  if (audio) {
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.play().catch((e) => {
      // This is expected before the first click
      if (e.name === 'NotAllowedError') {
        console.warn(
          `Audio "${soundName}" blocked by browser. Waiting for user interaction.`,
        );
      } else {
        console.error(`Could not play sound: ${soundName}`, e);
      }
    });
  }
}

export function moveAudio(move: CustomPgnMove): void {
  if (userConfig.muteAudio) return;

  const moveType = moveSoundPriority.find((p) =>
    p.condition(move.san, move.flags),
  );
  const soundToPlay = moveType
    ? moveSoundMap[moveType.event]
    : moveSoundMap.move;

  playSound(soundToPlay);
}
