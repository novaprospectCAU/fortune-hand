/**
 * symbols.ts 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  getAllSymbols,
  getSymbol,
  getSymbolEmoji,
  getSymbolProbabilities,
  selectSymbolByProbability,
  findCombinationForSymbols,
  isJackpotCombination,
  getCombination,
} from './symbols';
import type { SlotSymbol } from '@/types/interfaces';

describe('symbols', () => {
  describe('getAllSymbols', () => {
    it('should return all 7 symbols', () => {
      const symbols = getAllSymbols();
      expect(symbols).toHaveLength(7);
    });

    it('should include all required symbols', () => {
      const symbols = getAllSymbols();
      const ids = symbols.map((s) => s.id);

      expect(ids).toContain('card');
      expect(ids).toContain('target');
      expect(ids).toContain('gold');
      expect(ids).toContain('chip');
      expect(ids).toContain('star');
      expect(ids).toContain('skull');
      expect(ids).toContain('wild');
    });
  });

  describe('getSymbol', () => {
    it('should return symbol data by id', () => {
      const symbol = getSymbol('star');

      expect(symbol).toBeDefined();
      expect(symbol?.id).toBe('star');
      expect(symbol?.emoji).toBe('⭐');
      expect(symbol?.name).toBe('Star');
    });

    it('should return undefined for invalid id', () => {
      const symbol = getSymbol('invalid' as SlotSymbol);
      expect(symbol).toBeUndefined();
    });
  });

  describe('getSymbolEmoji', () => {
    it('should return emoji for valid symbol', () => {
      expect(getSymbolEmoji('card')).toBe('🃏');
      expect(getSymbolEmoji('gold')).toBe('💰');
      expect(getSymbolEmoji('skull')).toBe('💀');
    });

    it('should return ? for invalid symbol', () => {
      expect(getSymbolEmoji('invalid' as SlotSymbol)).toBe('?');
    });
  });

  describe('getSymbolProbabilities', () => {
    it('should return probabilities summing to 1', () => {
      const probabilities = getSymbolProbabilities();
      let total = 0;

      for (const prob of probabilities.values()) {
        total += prob;
      }

      expect(total).toBeCloseTo(1, 5);
    });

    it('should have probabilities for all symbols', () => {
      const probabilities = getSymbolProbabilities();

      expect(probabilities.get('card')).toBeDefined();
      expect(probabilities.get('target')).toBeDefined();
      expect(probabilities.get('gold')).toBeDefined();
      expect(probabilities.get('chip')).toBeDefined();
      expect(probabilities.get('star')).toBeDefined();
      expect(probabilities.get('skull')).toBeDefined();
      expect(probabilities.get('wild')).toBeDefined();
    });

    it('should apply symbol weight modifiers', () => {
      const modified = getSymbolProbabilities({
        symbolWeights: { star: 100, skull: 0 },
      });

      // star should have highest probability
      expect(modified.get('star')).toBeGreaterThan(0.5);
      // skull should have 0 probability
      expect(modified.get('skull')).toBe(0);
    });
  });

  describe('selectSymbolByProbability', () => {
    it('should return guaranteed symbol when set', () => {
      const symbol = selectSymbolByProbability(0.5, {
        guaranteedSymbol: 'star',
      });

      expect(symbol).toBe('star');
    });

    it('should return a valid symbol for any random value', () => {
      const validSymbols: SlotSymbol[] = [
        'card',
        'target',
        'gold',
        'chip',
        'star',
        'skull',
        'wild',
      ];

      // Test at different random values
      for (let i = 0; i <= 10; i++) {
        const random = i / 10;
        const symbol = selectSymbolByProbability(random);
        expect(validSymbols).toContain(symbol);
      }
    });

    it('should return card at random 0 (first in list)', () => {
      const symbol = selectSymbolByProbability(0);
      expect(symbol).toBe('card');
    });
  });

  describe('findCombinationForSymbols', () => {
    it('should find triple combination for matching symbols', () => {
      const combo = findCombinationForSymbols(['gold', 'gold', 'gold']);

      expect(combo).toBeDefined();
      expect(combo?.name).toBe('Gold Rush');
    });

    it('should return null for non-matching symbols', () => {
      const combo = findCombinationForSymbols(['card', 'gold', 'skull']);
      expect(combo).toBeNull();
    });

    it('should handle wild as any symbol (2 same + 1 wild)', () => {
      const combo = findCombinationForSymbols(['gold', 'gold', 'wild']);

      expect(combo).toBeDefined();
      expect(combo?.name).toBe('Gold Rush');
    });

    it('should handle wild as any symbol (1 same + 2 wild)', () => {
      const combo = findCombinationForSymbols(['star', 'wild', 'wild']);

      expect(combo).toBeDefined();
      expect(combo?.name).toBe('JACKPOT');
    });

    it('should return star_triple for all wilds', () => {
      const combo = findCombinationForSymbols(['wild', 'wild', 'wild']);

      expect(combo).toBeDefined();
      expect(combo?.name).toBe('JACKPOT');
      expect(combo?.isJackpot).toBe(true);
    });

    it('should return null when wild cannot form triple', () => {
      const combo = findCombinationForSymbols(['card', 'gold', 'wild']);
      expect(combo).toBeNull();
    });
  });

  describe('isJackpotCombination', () => {
    it('should return true for star triple', () => {
      expect(isJackpotCombination(['star', 'star', 'star'])).toBe(true);
    });

    it('should return true for star with wilds', () => {
      expect(isJackpotCombination(['star', 'star', 'wild'])).toBe(true);
      expect(isJackpotCombination(['star', 'wild', 'wild'])).toBe(true);
    });

    it('should return true for all wilds', () => {
      expect(isJackpotCombination(['wild', 'wild', 'wild'])).toBe(true);
    });

    it('should return false for non-jackpot triples', () => {
      expect(isJackpotCombination(['gold', 'gold', 'gold'])).toBe(false);
      expect(isJackpotCombination(['card', 'card', 'card'])).toBe(false);
    });

    it('should return false for non-triples', () => {
      expect(isJackpotCombination(['card', 'gold', 'skull'])).toBe(false);
    });
  });

  describe('getCombination', () => {
    it('should return combination by key', () => {
      const combo = getCombination('star_triple');

      expect(combo).toBeDefined();
      expect(combo?.name).toBe('JACKPOT');
      expect(combo?.isJackpot).toBe(true);
    });

    it('should return undefined for invalid key', () => {
      const combo = getCombination('invalid_key');
      expect(combo).toBeUndefined();
    });
  });
});
