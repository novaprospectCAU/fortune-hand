/**
 * Shop Integration Test
 * Tests that buying items from shop actually adds them to player's collection
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './store';
import { generateShop } from '@/modules/shop';
import { getJokerById } from '@/modules/jokers';
import { getSpecialCardById } from '@/modules/cards';

describe('Shop Integration', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
      phase: 'SHOP_PHASE',
      gold: 500,
      jokers: [],
      maxJokers: 5,
      deck: { cards: [], discardPile: [] },
      purchasedVouchers: [],
      shopState: null,
    });
  });

  it('should add joker to collection when buying joker', () => {
    // Generate a real shop
    const shop = generateShop(1, 0);

    // Find a joker item in the shop
    const jokerItem = shop.items.find(item => item.type === 'joker');

    if (!jokerItem) {
      console.log('No joker in shop, skipping test');
      return;
    }

    // Verify the joker exists in the joker data
    const jokerData = getJokerById(jokerItem.itemId);
    expect(jokerData).toBeDefined();
    expect(jokerData?.id).toBe(jokerItem.itemId);

    // Set shop state
    useGameStore.setState({ shopState: shop });

    // Buy the joker
    const { buyItem } = useGameStore.getState();
    buyItem(jokerItem.id);

    // Verify the joker was added
    const state = useGameStore.getState();
    expect(state.jokers.length).toBe(1);
    expect(state.jokers[0]?.id).toBe(jokerItem.itemId);
    expect(state.gold).toBe(500 - jokerItem.cost);
  });

  it('should add special card to deck when buying card', () => {
    // Generate a real shop
    const shop = generateShop(1, 0);

    // Find a card item in the shop
    const cardItem = shop.items.find(item => item.type === 'card');

    if (!cardItem) {
      console.log('No card in shop, skipping test');
      return;
    }

    // Verify the special card exists in the card data
    const cardData = getSpecialCardById(cardItem.itemId);
    expect(cardData).toBeDefined();
    expect(cardData?.id).toBe(cardItem.itemId);

    // Set shop state
    useGameStore.setState({
      shopState: shop,
      deck: { cards: [], discardPile: [] }
    });

    // Buy the card
    const { buyItem } = useGameStore.getState();
    buyItem(cardItem.id);

    // Verify the card was added to deck
    const state = useGameStore.getState();
    const hasSpecialCard = state.deck.cards.some(c => c.id === cardItem.itemId);
    expect(hasSpecialCard).toBe(true);
    expect(state.gold).toBe(500 - cardItem.cost);
  });

  it('shop generator should use valid joker IDs', () => {
    // Generate multiple shops and verify all joker items have valid IDs
    for (let i = 0; i < 10; i++) {
      const shop = generateShop(1, 0);

      for (const item of shop.items) {
        if (item.type === 'joker') {
          const joker = getJokerById(item.itemId);
          expect(joker).toBeDefined();
          expect(joker?.id).toBe(item.itemId);
        }
      }
    }
  });

  it('shop generator should use valid special card IDs', () => {
    // Generate multiple shops and verify all card items have valid IDs
    for (let i = 0; i < 10; i++) {
      const shop = generateShop(1, 0);

      for (const item of shop.items) {
        if (item.type === 'card') {
          const card = getSpecialCardById(item.itemId);
          expect(card).toBeDefined();
          expect(card?.id).toBe(item.itemId);
        }
      }
    }
  });
});
