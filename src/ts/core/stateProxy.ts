import type { ErrorTrack } from "./Config";
import type { State } from "./State";
import type { PgnPath } from "../features/pgn/Pgn";
import type { EventPayloads, Listener } from "./proxyEvents/ProxyEvents";

import { state } from "./state";

// --- Event emitter for state proxy ---

class EventEmitter {
  // Stores listeners, typed by event name
  private events: {
    [K in keyof EventPayloads]?: Listener<K>[];
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
  emit<K extends keyof EventPayloads>(
    eventName: K,
    ...args: EventPayloads[K]
  ): void {
    const listeners = this.events[eventName];
    if (listeners) {
      listeners.forEach((listener) => listener(...args));
    }
  }
}

export const eventEmitter = new EventEmitter();

// --- State proxy ---

const nestedHandler = {
  set(
    target: State["pgnTrack"] | State["ankiPersist"] | State["board"],
    property: keyof (State["pgnTrack"] | State["ankiPersist"] | State["board"]),
    value: number | PgnPath | ErrorTrack,
    receiver: State["pgnTrack"] | State["ankiPersist"] | State["board"],
  ) {
    if (property === "pgnPath" && target[property] === value) {
      return true; // Return true to indicate the set operation succeeded, but do nothing.
    }
    if ("pgnPath" in target && property === "pgnPath") {
      // Logic for pgnTrack.pgnPath
      const pgnPath = value as PgnPath;
      const pathKey = pgnPath.join(",");
      const pathMove = state.pgnTrack.pgnPathMap.get(pathKey) ?? null;
      const lastMove = state.pgnTrack.lastMove;
      eventEmitter.emit("pgnPathChanged", pgnPath, lastMove, pathMove);
    } else if ("errorTrack" in target && property === "errorTrack") {
      const errorTrack = value as ErrorTrack;
      eventEmitter.emit("puzzleScored", errorTrack);
    } else if ("borderPercent" in target && property === "borderPercent") {
      const percent = value as number;
      eventEmitter.emit("boardBorderUpdated", percent);
    }

    return Reflect.set(target, property, value, receiver);
  },
};

const stateHandler = {
  get(target: State, property: keyof State, receiver: State) {
    // Return a proxy for the nested objects we want to track
    if (property === "pgnTrack") {
      return new Proxy(target.pgnTrack, nestedHandler);
    }
    if (property === "ankiPersist") {
      return new Proxy(target.ankiPersist, nestedHandler);
    }
    if (property === "board") {
      return new Proxy(target.board, nestedHandler);
    }
    return Reflect.get(target, property, receiver);
  },
  set(
    target: State,
    property: keyof State,
    value: number | PgnPath | ErrorTrack,
    receiver: State,
  ) {
    return Reflect.set(target, property, value, receiver);
  },
};

export const stateProxy = new Proxy(state, stateHandler);
