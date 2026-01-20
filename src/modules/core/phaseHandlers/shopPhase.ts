/**
 * Shop Phase Handler
 *
 * Handles the shop between rounds.
 */

import type {
  ShopState,
  ShopItem,
  Joker,
  GamePhase,
} from '@/types/interfaces';
import { generateShop, buyItem, rerollShop } from '../moduleIntegration';

export interface ShopPhaseInput {
  round: number;
  gold: number;
  shopState: ShopState | null;
  jokers: Joker[];
  maxJokers: number;
}

export interface ShopPhaseOutput {
  shopState: ShopState;
}

export interface BuyItemResult {
  success: boolean;
  newGold: number;
  shopState: ShopState;
  item?: ShopItem;
  error?: string;
}

export interface RerollResult {
  success: boolean;
  newGold: number;
  shopState: ShopState;
  error?: string;
}

/**
 * Initialize shop phase
 */
export function initializeShop(input: ShopPhaseInput): ShopPhaseOutput {
  if (input.shopState) {
    return { shopState: input.shopState };
  }

  const shopState = generateShop(input.round, 0);
  return { shopState };
}

/**
 * Buy an item from the shop
 */
export function executeBuyItem(
  shopState: ShopState,
  itemId: string,
  playerGold: number,
  jokers: Joker[],
  maxJokers: number
): BuyItemResult {
  const item = shopState.items.find(i => i.id === itemId);

  if (!item) {
    return {
      success: false,
      newGold: playerGold,
      shopState,
      error: 'Item not found',
    };
  }

  // Check if can buy joker (respect max jokers)
  if (item.type === 'joker' && jokers.length >= maxJokers) {
    return {
      success: false,
      newGold: playerGold,
      shopState,
      error: 'Maximum jokers reached',
    };
  }

  const transaction = buyItem(shopState, itemId, playerGold);

  if (!transaction.success) {
    return {
      success: false,
      newGold: playerGold,
      shopState,
      error: transaction.error,
    };
  }

  // Mark item as sold in shop state
  const newShopState: ShopState = {
    ...shopState,
    items: shopState.items.map(i =>
      i.id === itemId ? { ...i, sold: true } : i
    ),
  };

  return {
    success: true,
    newGold: transaction.newGold,
    shopState: newShopState,
    item,
  };
}

/**
 * Reroll shop items
 */
export function executeReroll(
  shopState: ShopState,
  playerGold: number,
  round: number
): RerollResult {
  const result = rerollShop(shopState, playerGold, round);

  if (!result.success) {
    return {
      success: false,
      newGold: playerGold,
      shopState,
      error: 'Not enough gold',
    };
  }

  return {
    success: true,
    newGold: result.newGold,
    shopState: result.shop,
  };
}

/**
 * Check if shop phase can be entered
 */
export function canEnterShopPhase(currentPhase: GamePhase): boolean {
  return currentPhase === 'REWARD_PHASE';
}
