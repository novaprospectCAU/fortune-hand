/**
 * Event System Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createEventEmitter,
  getGameEventEmitter,
  resetGameEventEmitter,
} from './eventSystem';
import type { GameEvent, GameConfig } from '@/types/interfaces';

describe('Event System', () => {
  beforeEach(() => {
    resetGameEventEmitter();
  });

  describe('createEventEmitter', () => {
    it('should create an event emitter', () => {
      const emitter = createEventEmitter();
      expect(emitter).toBeDefined();
      expect(emitter.emit).toBeDefined();
      expect(emitter.on).toBeDefined();
      expect(emitter.off).toBeDefined();
    });

    it('should emit events to registered handlers', () => {
      const emitter = createEventEmitter();
      const handler = vi.fn();

      emitter.on('GAME_START', handler);

      const config: GameConfig = {
        startingGold: 100,
        startingHands: 4,
        startingDiscards: 3,
        handSize: 8,
        maxJokers: 5,
        roundScores: [300, 800, 2000],
      };

      const event: GameEvent = { type: 'GAME_START', config };
      emitter.emit(event);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should not call handlers for different event types', () => {
      const emitter = createEventEmitter();
      const handler = vi.fn();

      emitter.on('GAME_START', handler);
      emitter.emit({ type: 'PHASE_CHANGE', from: 'IDLE', to: 'SLOT_PHASE' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should support multiple handlers for same event type', () => {
      const emitter = createEventEmitter();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      emitter.on('PHASE_CHANGE', handler1);
      emitter.on('PHASE_CHANGE', handler2);

      const event: GameEvent = { type: 'PHASE_CHANGE', from: 'IDLE', to: 'SLOT_PHASE' };
      emitter.emit(event);

      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
    });

    it('should remove handler with off()', () => {
      const emitter = createEventEmitter();
      const handler = vi.fn();

      emitter.on('PHASE_CHANGE', handler);
      emitter.off('PHASE_CHANGE', handler);

      emitter.emit({ type: 'PHASE_CHANGE', from: 'IDLE', to: 'SLOT_PHASE' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle errors in handlers gracefully', () => {
      const emitter = createEventEmitter();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const goodHandler = vi.fn();

      emitter.on('PHASE_CHANGE', errorHandler);
      emitter.on('PHASE_CHANGE', goodHandler);

      emitter.emit({ type: 'PHASE_CHANGE', from: 'IDLE', to: 'SLOT_PHASE' });

      expect(errorHandler).toHaveBeenCalled();
      expect(goodHandler).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getGameEventEmitter', () => {
    it('should return the same instance on multiple calls', () => {
      const emitter1 = getGameEventEmitter();
      const emitter2 = getGameEventEmitter();
      expect(emitter1).toBe(emitter2);
    });

    it('should return a new instance after reset', () => {
      const emitter1 = getGameEventEmitter();
      resetGameEventEmitter();
      const emitter2 = getGameEventEmitter();
      expect(emitter1).not.toBe(emitter2);
    });
  });
});
