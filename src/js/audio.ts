import { config } from './config';

interface GameMove {
    san: string;
    flags?: string;    // optional string
}

// --- Audio Handling ---

function initAudio(): Map<string, HTMLAudioElement> {
    const sounds = ["Move", "checkmate", "move-check", "Capture", "castle", "promote", "Error", "computer-mouse-click"];
    const audioMap: Map<string, HTMLAudioElement> = new Map();

    sounds.forEach(sound => {
        const audio = new Audio(`_${sound}.mp3`);
        audio.preload = 'auto';
        audioMap.set(sound, audio);
    });
    return audioMap;
}

// Explicitly type the map returned by the function.
const audioMap: Map<string, HTMLAudioElement> = initAudio();

export function playSound(soundName: string): void {
    if (config.muteAudio) return;

    const audio = audioMap.get(soundName);
    if (audio) {
        audio.cloneNode().play().catch(e => console.error(`Could not play sound: ${soundName}`, e));
    }
}

export function changeAudio(gameState: GameMove): void {
    const soundMap: Record<string, string> = {
        "#": "checkmate",
        "+": "move-check",
        "x": "Capture",
        "k": "castle",
        "q": "castle",
        "p": "promote"
    };
    let sound = "Move";

    for (const flag in soundMap) {
        if (gameState.san.includes(flag) || (gameState.flags && gameState.flags.includes(flag))) {
            sound = soundMap[flag];
            break;
        }
    }
    playSound(sound);
}
