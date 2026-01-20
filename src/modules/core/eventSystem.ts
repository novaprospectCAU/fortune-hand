/**
 * Event System for Fortune's Hand
 *
 * Provides loose coupling between modules through event emission and subscription.
 */

import type { GameEvent, EventEmitter } from '@/types/interfaces';

type EventHandler = (event: GameEvent) => void;

/**
 * Create a new event emitter instance
 */
export function createEventEmitter(): EventEmitter {
  const handlers = new Map<GameEvent['type'], Set<EventHandler>>();

  return {
    emit(event: GameEvent): void {
      const eventHandlers = handlers.get(event.type);
      if (eventHandlers) {
        eventHandlers.forEach(handler => {
          try {
            handler(event);
          } catch (error) {
            console.error(`Error in event handler for ${event.type}:`, error);
          }
        });
      }
    },

    on(eventType: GameEvent['type'], handler: EventHandler): void {
      if (!handlers.has(eventType)) {
        handlers.set(eventType, new Set());
      }
      handlers.get(eventType)!.add(handler);
    },

    off(eventType: GameEvent['type'], handler: EventHandler): void {
      const eventHandlers = handlers.get(eventType);
      if (eventHandlers) {
        eventHandlers.delete(handler);
        if (eventHandlers.size === 0) {
          handlers.delete(eventType);
        }
      }
    },
  };
}

// Singleton event emitter for the game
let gameEventEmitter: EventEmitter | null = null;

/**
 * Get the global game event emitter
 */
export function getGameEventEmitter(): EventEmitter {
  if (!gameEventEmitter) {
    gameEventEmitter = createEventEmitter();
  }
  return gameEventEmitter;
}

/**
 * Reset the global event emitter (useful for testing)
 */
export function resetGameEventEmitter(): void {
  gameEventEmitter = null;
}

export { createEventEmitter as default };
