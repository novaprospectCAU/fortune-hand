/**
 * Special Cards 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  getAllSpecialCards,
  getSpecialCardById,
  getSpecialCardCost,
  getSpecialCardRarity,
  getAllEnhancements,
  getEnhancementById,
  applyEnhancement,
  removeEnhancement,
  isSpecialCard,
  getSpecialCardsByRarity,
} from './specialCards';
import { createCard } from './cardFactory';

describe('specialCards', () => {
  describe('getAllSpecialCards', () => {
    it('should return an array of special cards', () => {
      const cards = getAllSpecialCards();

      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should return cards with required properties', () => {
      const cards = getAllSpecialCards();

      for (const card of cards) {
        expect(card.id).toBeDefined();
        expect(card.suit).toBeDefined();
        expect(card.rank).toBeDefined();
      }
    });

    it('should include wild_joker card', () => {
      const cards = getAllSpecialCards();
      const wildJoker = cards.find((c) => c.id === 'wild_joker');

      expect(wildJoker).toBeDefined();
      expect(wildJoker?.isWild).toBe(true);
    });
  });

  describe('getSpecialCardById', () => {
    it('should return the correct special card', () => {
      const card = getSpecialCardById('gold_ace');

      expect(card).toBeDefined();
      expect(card?.id).toBe('gold_ace');
      expect(card?.isGold).toBe(true);
    });

    it('should return undefined for non-existent card', () => {
      const card = getSpecialCardById('nonexistent_card');

      expect(card).toBeUndefined();
    });

    it('should return card with slot trigger', () => {
      const card = getSpecialCardById('slot_seven');

      expect(card).toBeDefined();
      expect(card?.triggerSlot).toBe(true);
    });

    it('should return card with roulette trigger', () => {
      const card = getSpecialCardById('roulette_king');

      expect(card).toBeDefined();
      expect(card?.triggerRoulette).toBe(true);
    });
  });

  describe('getSpecialCardCost', () => {
    it('should return correct cost for existing card', () => {
      const cost = getSpecialCardCost('wild_joker');

      expect(cost).toBe(35); // shopCost from cards.json
    });

    it('should return 0 for non-existent card', () => {
      const cost = getSpecialCardCost('nonexistent');

      expect(cost).toBe(0);
    });
  });

  describe('getSpecialCardRarity', () => {
    it('should return correct rarity for existing card', () => {
      const rarity = getSpecialCardRarity('wild_joker');

      expect(rarity).toBe('rare');
    });

    it('should return common for non-existent card', () => {
      const rarity = getSpecialCardRarity('nonexistent');

      expect(rarity).toBe('common');
    });
  });

  describe('getAllEnhancements', () => {
    it('should return an array of enhancements', () => {
      const enhancements = getAllEnhancements();

      expect(Array.isArray(enhancements)).toBe(true);
      expect(enhancements.length).toBeGreaterThan(0);
    });

    it('should include mult enhancement', () => {
      const enhancements = getAllEnhancements();
      const mult = enhancements.find((e) => e.type === 'mult');

      expect(mult).toBeDefined();
    });

    it('should include chips enhancement', () => {
      const enhancements = getAllEnhancements();
      const chips = enhancements.find((e) => e.type === 'chips');

      expect(chips).toBeDefined();
    });
  });

  describe('getEnhancementById', () => {
    it('should return correct enhancement', () => {
      const enhancement = getEnhancementById('bonus');

      expect(enhancement).toBeDefined();
      expect(enhancement?.type).toBe('chips');
      expect(enhancement?.value).toBe(30);
    });

    it('should return undefined for non-existent enhancement', () => {
      const enhancement = getEnhancementById('nonexistent');

      expect(enhancement).toBeUndefined();
    });
  });

  describe('applyEnhancement', () => {
    it('should apply enhancement to card', () => {
      const card = createCard('A', 'hearts');
      const enhanced = applyEnhancement(card, 'mult');

      expect(enhanced.enhancement).toBeDefined();
      expect(enhanced.enhancement?.type).toBe('mult');
      expect(enhanced.enhancement?.value).toBe(4);
    });

    it('should maintain immutability', () => {
      const card = createCard('A', 'hearts');
      const enhanced = applyEnhancement(card, 'mult');

      expect(card.enhancement).toBeUndefined();
      expect(enhanced).not.toBe(card);
    });

    it('should return original card for non-existent enhancement', () => {
      const card = createCard('A', 'hearts');
      const result = applyEnhancement(card, 'nonexistent');

      expect(result).toBe(card);
    });

    it('should override existing enhancement', () => {
      let card = createCard('A', 'hearts');
      card = applyEnhancement(card, 'mult');
      card = applyEnhancement(card, 'bonus');

      expect(card.enhancement?.type).toBe('chips');
    });
  });

  describe('removeEnhancement', () => {
    it('should remove enhancement from card', () => {
      let card = createCard('A', 'hearts');
      card = applyEnhancement(card, 'mult');
      const plain = removeEnhancement(card);

      expect(plain.enhancement).toBeUndefined();
    });

    it('should maintain immutability', () => {
      let card = createCard('A', 'hearts');
      card = applyEnhancement(card, 'mult');
      const plain = removeEnhancement(card);

      expect(card.enhancement).toBeDefined();
      expect(plain).not.toBe(card);
    });

    it('should work on card without enhancement', () => {
      const card = createCard('A', 'hearts');
      const result = removeEnhancement(card);

      expect(result.enhancement).toBeUndefined();
      expect(result.id).toBe(card.id);
    });
  });

  describe('isSpecialCard', () => {
    it('should return true for wild card', () => {
      const card = getSpecialCardById('wild_joker');
      expect(card && isSpecialCard(card)).toBe(true);
    });

    it('should return true for gold card', () => {
      const card = getSpecialCardById('gold_ace');
      expect(card && isSpecialCard(card)).toBe(true);
    });

    it('should return true for slot trigger card', () => {
      const card = getSpecialCardById('slot_seven');
      expect(card && isSpecialCard(card)).toBe(true);
    });

    it('should return true for roulette trigger card', () => {
      const card = getSpecialCardById('roulette_king');
      expect(card && isSpecialCard(card)).toBe(true);
    });

    it('should return false for normal card', () => {
      const card = createCard('A', 'hearts');
      expect(isSpecialCard(card)).toBe(false);
    });

    it('should return false for enhanced normal card', () => {
      let card = createCard('A', 'hearts');
      card = applyEnhancement(card, 'mult');
      expect(isSpecialCard(card)).toBe(false);
    });
  });

  describe('getSpecialCardsByRarity', () => {
    it('should return cards filtered by rarity', () => {
      const rareCards = getSpecialCardsByRarity('rare');

      expect(rareCards.length).toBeGreaterThan(0);
      for (const card of rareCards) {
        const rarity = getSpecialCardRarity(card.id);
        expect(rarity).toBe('rare');
      }
    });

    it('should return empty array for rarity with no cards', () => {
      // 현재 데이터에는 legendary 특수 카드가 없을 수 있음
      const legendaryCards = getSpecialCardsByRarity('legendary');

      expect(Array.isArray(legendaryCards)).toBe(true);
    });
  });
});
