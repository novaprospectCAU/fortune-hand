/**
 * Shop Module - Transaction System
 *
 * Handles buy and reroll operations.
 * IMPORTANT: This module does NOT directly modify gold.
 * It returns Transaction objects that the core module uses to update state.
 */

import type { ShopState, ShopItem, Transaction, Card } from '@/types/interfaces';
import { generateShop } from './shopGenerator';
import { openPack } from './packs';
import balanceData from '@/data/balance.json';

/**
 * Reroll cost increase per use
 * Loaded from balance.json
 */
const REROLL_COST_INCREASE = balanceData.shop.rerollCostIncrease;

/**
 * Extended transaction result that includes pack contents
 */
export interface ExtendedTransaction extends Transaction {
  packCards?: Card[]; // Cards from opened pack (if item was a pack)
}

/**
 * Attempt to buy an item from the shop
 *
 * @param shopState - Current shop state
 * @param itemId - The ID of the item to buy
 * @param playerGold - The player's current gold
 * @returns Transaction result with success/failure and updated gold
 */
export function buyItem(
  shopState: ShopState,
  itemId: string,
  playerGold: number
): ExtendedTransaction {
  const item = shopState.items.find((i) => i.id === itemId);

  if (!item) {
    return {
      success: false,
      error: 'Item not found',
      newGold: playerGold,
    };
  }

  if (item.sold) {
    return {
      success: false,
      error: 'Already sold',
      newGold: playerGold,
    };
  }

  if (playerGold < item.cost) {
    return {
      success: false,
      error: 'Not enough gold',
      newGold: playerGold,
    };
  }

  // If item is a pack, open it and include the cards
  let packCards: Card[] | undefined;
  if (item.type === 'pack') {
    const packResult = openPack(item.itemId);
    if (packResult) {
      packCards = packResult.cards;
    }
  }

  return {
    success: true,
    item,
    newGold: playerGold - item.cost,
    packCards,
  };
}

/**
 * Mark an item as sold in the shop state
 * Returns a new shop state with the item marked as sold
 *
 * @param shopState - Current shop state
 * @param itemId - The ID of the item to mark as sold
 * @returns New shop state with the item marked as sold
 */
export function markItemAsSold(shopState: ShopState, itemId: string): ShopState {
  return {
    ...shopState,
    items: shopState.items.map((item) =>
      item.id === itemId ? { ...item, sold: true } : item
    ),
  };
}

/**
 * Result of a reroll operation
 */
export interface RerollResult {
  success: true;
  shop: ShopState;
  cost: number;
}

/**
 * Error result of a reroll operation
 */
export interface RerollError {
  success: false;
  error: string;
}

/**
 * Calculate the current reroll cost based on shop state
 *
 * @param shopState - Current shop state
 * @param discount - Optional discount from vouchers
 * @returns The cost of the next reroll
 */
export function calculateRerollCost(shopState: ShopState, discount: number = 0): number {
  const baseCost = shopState.rerollCost + shopState.rerollsUsed * REROLL_COST_INCREASE;
  return Math.max(0, baseCost - discount);
}

/**
 * Attempt to reroll the shop
 *
 * @param shopState - Current shop state
 * @param playerGold - The player's current gold
 * @param round - Current game round
 * @param luck - Player's luck stat (affects item quality)
 * @param discount - Discount from vouchers
 * @returns New shop state and cost, or error if cannot afford
 */
export function reroll(
  shopState: ShopState,
  playerGold: number,
  round: number = 1,
  luck: number = 0,
  discount: number = 0
): RerollResult | RerollError {
  const cost = calculateRerollCost(shopState, discount);

  if (playerGold < cost) {
    return {
      success: false,
      error: 'Not enough gold',
    };
  }

  // Generate new shop, preserving sold items
  const newShop = generateShop(round, luck);

  return {
    success: true,
    shop: {
      ...newShop,
      rerollCost: shopState.rerollCost,
      rerollsUsed: shopState.rerollsUsed + 1,
    },
    cost,
  };
}

/**
 * Check if player can afford an item
 *
 * @param item - The shop item to check
 * @param playerGold - The player's current gold
 * @returns True if player can afford the item
 */
export function canAffordItem(item: ShopItem, playerGold: number): boolean {
  return !item.sold && playerGold >= item.cost;
}

/**
 * Check if player can afford to reroll
 *
 * @param shopState - Current shop state
 * @param playerGold - The player's current gold
 * @param discount - Optional discount from vouchers
 * @returns True if player can afford to reroll
 */
export function canAffordReroll(
  shopState: ShopState,
  playerGold: number,
  discount: number = 0
): boolean {
  return playerGold >= calculateRerollCost(shopState, discount);
}
