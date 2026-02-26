import type { CustomPgnMove } from '$Types/ChessStructs';
import type { Sounds, MoveEvent, SoundPriorityRule } from '$Types/Audio';
import { userConfig } from '$stores/userConfig.svelte';
import { soundAssets } from '$utils/toolkit/importAssets';

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

function initAudio(): Map<Sounds, HTMLAudioElement> {
  const audioMap: Map<Sounds, HTMLAudioElement> = new Map();

  // 3. Iterate over the explicit object instead of glob keys
  (Object.keys(soundAssets) as Sounds[]).forEach((key) => {
    const src = soundAssets[key];
    if (src) {
      // src is now a "data:audio/mp3;base64..." string
      const audio = new Audio(src);
      // Preload isn't strictly necessary with Data URIs (it's already in memory),
      // but keeping 'auto' is fine.
      audio.preload = 'auto';
      audioMap.set(key, audio);
    }
  });

  return audioMap;
}

const audioMap: Map<Sounds, HTMLAudioElement> = initAudio();

export function playSound(soundName: Sounds | 'click'): void {
  if (userConfig.opts.muteAudio) return;

  if (soundName === 'click') {
    playSyntheticClick();
    return;
  }

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
  if (userConfig.opts.muteAudio) return;

  const moveType = moveSoundPriority.find((p) =>
    p.condition(move.san, move.flags),
  );
  const soundToPlay = moveType
    ? moveSoundMap[moveType.event]
    : moveSoundMap.move;

  playSound(soundToPlay);
}


// Reuse the context to avoid creating too many (browser limit is usually 6)
let audioCtx: AudioContext | null = null;

// Generate a reusable noise buffer (0.05s is plenty for a click)
let clickBuffer: AudioBuffer | null = null;

function playSyntheticClick() {
  // Initialize Context lazily (browsers block audio ctx until user interaction)
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Generate the noise buffer once
  if (!clickBuffer) {
    const bufferSize = audioCtx.sampleRate * 0.05; // 50ms duration
    clickBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = clickBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // White noise: random values between -1 and 1
      data[i] = Math.random() * 2 - 1;
    }
  }

  // Create the sound graph
  const source = audioCtx.createBufferSource();
  source.buffer = clickBuffer;

  // Filter: Bandpass around 1200Hz gives a "plastic" mechanical feel
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 1; // Width of the band

  // Envelope: Short fade out to avoid "popping"
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

  // Connect: Source -> Filter -> Gain -> Out
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Play!
  source.start();
}
