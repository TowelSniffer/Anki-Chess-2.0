import type { PgnPath, State, ErrorTrack, CustomPgnMove } from './types';

import { state } from './config';

// --- Event emitter for state proxy ---

interface EventPayloads {
    'pgnPathChanged': [
        pgnPath: PgnPath,
        lastMove: CustomPgnMove | null,
        pathMove: CustomPgnMove | null
    ];

    'puzzleScored': [ErrorTrack];
}


// A generic Listener type
type Listener<K extends keyof EventPayloads> =
(...args: EventPayloads[K]) => void;

class EventEmitter {
    // Stores listeners, typed by event name
    private events: {
        [K in keyof EventPayloads]?: Listener<K>[]
    } = {};

    // Subscribes to an event.
    on<K extends keyof EventPayloads>(eventName: K, listener: Listener<K>): void {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        // We can assert the type here as the logic ensures it's correct
        (this.events[eventName] as Listener<K>[]).push(listener);
    }

    // Publishes an event.
    emit<K extends keyof EventPayloads>(eventName: K, ...args: EventPayloads[K]): void {
        const listeners = this.events[eventName];
        if (listeners) {
            listeners.forEach(listener => listener(...args));
        }
    }
}

export const eventEmitter = new EventEmitter();

// --- State proxy ---

const stateHandler = {
    set(target: State, property: keyof State, value: PgnPath | ErrorTrack, receiver: State) {
        if (property === 'pgnPath') {

            const pgnPath = value as PgnPath;
            const pathKey = pgnPath.join(',');
            const pathMove = state.pgnPathMap.get(pathKey) ?? null;
            const lastMove = state.lastMove;

            if ((pathMove || !pgnPath.length) &&
                !(!state.pgnPath.join(',').length && !pgnPath.length) // why is this needed?
            ) {
                eventEmitter.emit('pgnPathChanged', pgnPath, lastMove, pathMove);
            }
        } else if (property === 'errorTrack') {

            const errorTrack = value as ErrorTrack;
            eventEmitter.emit('puzzleScored', errorTrack)

        }
        return Reflect.set(target, property, value, receiver);
    }
};

export const stateProxy = new Proxy(state, stateHandler);
