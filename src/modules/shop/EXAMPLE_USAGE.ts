/**
 * Card Pack System - Complete Usage Examples
 *
 * This file demonstrates how to use the pack system in various scenarios.
 * These are complete, working examples that can be used as reference.
 */

import type { Card, ShopState } from '@/types/interfaces';
import type { Deck } from '@/types/interfaces';
import {
  openPack,
  getPackById,
  getAllPacks,
  getPacksByRarity,
  PackResult,
} from './packs';
import { buyItem, ExtendedTransaction } from './transactions';
import { generateShop } from './shopGenerator';
import { addToDeck } from '@/modules/cards';

// ============================================================
// Example 1: Opening a Pack Directly
// ============================================================

export function exampleOpenPack() {
  // Open a standard pack
  const result: PackResult | null = openPack('standard_pack');

  if (result) {
    console.log(`Pack opened: ${result.packId}`);
    console.log(`Received ${result.cards.length} cards`);
    console.log(`Contains special cards: ${result.hasSpecialCards}`);

    // Display cards
    result.cards.forEach((card, index) => {
      console.log(`Card ${index + 1}: ${card.rank} of ${card.suit}`);
      if (card.isWild) console.log('  -> This is a wild card!');
      if (card.isGold) console.log('  -> This is a gold card!');
      if (card.triggerSlot) console.log('  -> Triggers slot spin!');
      if (card.triggerRoulette) console.log('  -> Grants roulette spin!');
    });
  } else {
    console.log('Pack not found');
  }

  return result;
}

// ============================================================
// Example 2: Buying a Pack from Shop
// ============================================================

export function exampleBuyPack(
  shopState: ShopState,
  itemId: string,
  playerGold: number
): ExtendedTransaction {
  // Attempt to buy the pack
  const transaction = buyItem(shopState, itemId, playerGold);

  if (!transaction.success) {
    console.error(`Purchase failed: ${transaction.error}`);
    return transaction;
  }

  console.log(`Purchase successful!`);
  console.log(`Gold spent: ${playerGold - transaction.newGold}`);
  console.log(`Gold remaining: ${transaction.newGold}`);

  // Check if pack was opened
  if (transaction.packCards) {
    console.log(`Pack contained ${transaction.packCards.length} cards:`);
    transaction.packCards.forEach((card) => {
      console.log(`  - ${card.rank} of ${card.suit}`);
    });
  }

  return transaction;
}

// ============================================================
// Example 3: Complete Shop Flow with Pack Purchase
// ============================================================

export function exampleShopFlow(
  playerGold: number,
  playerDeck: Deck,
  round: number = 1
): { newGold: number; newDeck: Deck; purchasedCards: Card[] } {
  // Generate shop for current round
  const shop = generateShop(round, 0);

  console.log(`Shop has ${shop.items.length} items:`);
  shop.items.forEach((item) => {
    console.log(`  - ${item.type} (${item.itemId}) - ${item.cost} gold`);
  });

  // Find a pack item
  const packItem = shop.items.find((item) => item.type === 'pack');

  if (!packItem) {
    console.log('No packs available in this shop');
    return { newGold: playerGold, newDeck: playerDeck, purchasedCards: [] };
  }

  console.log(`\nFound pack: ${packItem.itemId} for ${packItem.cost} gold`);

  // Check if we can afford it
  if (playerGold < packItem.cost) {
    console.log(`Cannot afford pack (need ${packItem.cost}, have ${playerGold})`);
    return { newGold: playerGold, newDeck: playerDeck, purchasedCards: [] };
  }

  // Buy the pack
  const transaction = buyItem(shop, packItem.id, playerGold);

  if (!transaction.success) {
    console.log(`Purchase failed: ${transaction.error}`);
    return { newGold: playerGold, newDeck: playerDeck, purchasedCards: [] };
  }

  // Add pack cards to deck
  let newDeck = playerDeck;
  const purchasedCards: Card[] = [];

  if (transaction.packCards) {
    transaction.packCards.forEach((card) => {
      newDeck = addToDeck(newDeck, [card]);
      purchasedCards.push(card);
    });

    console.log(`\nAdded ${purchasedCards.length} cards to deck!`);
  }

  return {
    newGold: transaction.newGold,
    newDeck,
    purchasedCards,
  };
}

// ============================================================
// Example 4: Filtering and Selecting Packs
// ============================================================

export function examplePackSelection() {
  // Get all available packs
  const allPacks = getAllPacks();
  console.log(`Total packs available: ${allPacks.length}`);

  // Get packs by rarity
  const commonPacks = getPacksByRarity('common');
  const rarePacks = getPacksByRarity('rare');
  const legendaryPacks = getPacksByRarity('legendary');

  console.log(`\nCommon packs: ${commonPacks.length}`);
  commonPacks.forEach((pack) => {
    console.log(`  - ${pack.name} (${pack.cost} gold, ${pack.cardCount} cards)`);
  });

  console.log(`\nRare packs: ${rarePacks.length}`);
  rarePacks.forEach((pack) => {
    console.log(`  - ${pack.name} (${pack.cost} gold, ${pack.cardCount} cards)`);
  });

  console.log(`\nLegendary packs: ${legendaryPacks.length}`);
  legendaryPacks.forEach((pack) => {
    console.log(`  - ${pack.name} (${pack.cost} gold, ${pack.cardCount} cards)`);
  });

  return { allPacks, commonPacks, rarePacks, legendaryPacks };
}

// ============================================================
// Example 5: Pack Analysis
// ============================================================

export function examplePackAnalysis(packId: string) {
  const pack = getPackById(packId);

  if (!pack) {
    console.log('Pack not found');
    return null;
  }

  console.log(`\n=== ${pack.name} Analysis ===`);
  console.log(`Cost: ${pack.cost} gold`);
  console.log(`Rarity: ${pack.rarity}`);
  console.log(`Cards: ${pack.cardCount}`);
  console.log(`Special Card Chance: ${Math.round(pack.specialCardWeight * 100)}%`);

  if (pack.guaranteedRarity) {
    console.log(`Guaranteed: 1 ${pack.guaranteedRarity} special card`);
  }

  // Calculate expected number of special cards
  const expectedSpecial = pack.cardCount * pack.specialCardWeight;
  console.log(`Expected special cards: ${expectedSpecial.toFixed(2)}`);

  // Open a sample pack to see contents
  console.log('\nSample opening:');
  const result = openPack(packId);

  if (result) {
    result.cards.forEach((card, i) => {
      const specialType = card.isWild
        ? 'WILD'
        : card.isGold
          ? 'GOLD'
          : card.triggerSlot
            ? 'SLOT'
            : card.triggerRoulette
              ? 'ROULETTE'
              : 'STANDARD';
      console.log(`  ${i + 1}. ${card.rank} of ${card.suit} [${specialType}]`);
    });
  }

  return pack;
}

// ============================================================
// Example 6: Multiple Pack Opening
// ============================================================

export function exampleBulkPackOpening(packId: string, count: number = 5) {
  console.log(`\nOpening ${count}x ${packId}...`);

  const results: PackResult[] = [];
  let totalCards = 0;
  let totalSpecial = 0;

  for (let i = 0; i < count; i++) {
    const result = openPack(packId);
    if (result) {
      results.push(result);
      totalCards += result.cards.length;
      if (result.hasSpecialCards) totalSpecial++;
    }
  }

  console.log(`\n=== Results ===`);
  console.log(`Packs opened: ${results.length}`);
  console.log(`Total cards: ${totalCards}`);
  console.log(`Packs with specials: ${totalSpecial}`);
  console.log(`Special card rate: ${Math.round((totalSpecial / count) * 100)}%`);

  return results;
}

// ============================================================
// Example 7: Smart Pack Purchasing Strategy
// ============================================================

export function exampleSmartPurchase(
  playerGold: number,
  targetSpecialCards: number
): string[] {
  console.log(`\nGoal: Get ${targetSpecialCards} special cards with ${playerGold} gold`);

  const allPacks = getAllPacks();
  const affordablePacks = allPacks.filter((p) => p.cost <= playerGold);

  console.log(`\nAffordable packs: ${affordablePacks.length}`);

  // Calculate expected special cards per gold
  const packValues = affordablePacks.map((pack) => {
    const expectedSpecial = pack.cardCount * pack.specialCardWeight;
    const valuePerGold = expectedSpecial / pack.cost;
    return { pack, expectedSpecial, valuePerGold };
  });

  // Sort by value per gold
  packValues.sort((a, b) => b.valuePerGold - a.valuePerGold);

  console.log('\nBest value packs:');
  packValues.slice(0, 3).forEach((pv) => {
    console.log(
      `  ${pv.pack.name}: ${pv.expectedSpecial.toFixed(2)} special cards for ${pv.pack.cost} gold (${pv.valuePerGold.toFixed(4)} per gold)`
    );
  });

  // Purchase strategy
  const purchaseOrder: string[] = [];
  let remainingGold = playerGold;
  let expectedSpecialTotal = 0;

  for (const pv of packValues) {
    while (remainingGold >= pv.pack.cost && expectedSpecialTotal < targetSpecialCards) {
      purchaseOrder.push(pv.pack.id);
      remainingGold -= pv.pack.cost;
      expectedSpecialTotal += pv.expectedSpecial;
    }

    if (expectedSpecialTotal >= targetSpecialCards) break;
  }

  console.log(`\nRecommended purchases: ${purchaseOrder.length} packs`);
  console.log(`Gold spent: ${playerGold - remainingGold}`);
  console.log(`Expected special cards: ${expectedSpecialTotal.toFixed(2)}`);

  return purchaseOrder;
}

// ============================================================
// Example 8: Error Handling
// ============================================================

export function exampleErrorHandling() {
  console.log('\n=== Error Handling Examples ===');

  // Invalid pack ID
  console.log('\n1. Invalid pack ID:');
  const invalidPack = openPack('invalid_pack_id');
  console.log(`Result: ${invalidPack === null ? 'null (expected)' : 'unexpected result'}`);

  // Insufficient gold
  console.log('\n2. Insufficient gold:');
  const shop: ShopState = {
    items: [
      {
        id: 'pack1',
        type: 'pack',
        itemId: 'celestial_pack',
        cost: 120,
        sold: false,
      },
    ],
    rerollCost: 5,
    rerollsUsed: 0,
  };

  const poorTransaction = buyItem(shop, 'pack1', 50);
  console.log(`Success: ${poorTransaction.success}`);
  console.log(`Error: ${poorTransaction.error}`);

  // Already sold item
  console.log('\n3. Already sold item:');
  const soldShop: ShopState = {
    items: [
      {
        id: 'pack1',
        type: 'pack',
        itemId: 'standard_pack',
        cost: 30,
        sold: true,
      },
    ],
    rerollCost: 5,
    rerollsUsed: 0,
  };

  const soldTransaction = buyItem(soldShop, 'pack1', 100);
  console.log(`Success: ${soldTransaction.success}`);
  console.log(`Error: ${soldTransaction.error}`);
}

// ============================================================
// Run all examples
// ============================================================

export function runAllExamples() {
  console.log('='.repeat(60));
  console.log('CARD PACK SYSTEM - USAGE EXAMPLES');
  console.log('='.repeat(60));

  exampleOpenPack();
  examplePackSelection();
  examplePackAnalysis('arcana_pack');
  exampleBulkPackOpening('standard_pack', 10);
  exampleSmartPurchase(200, 5);
  exampleErrorHandling();

  console.log('\n' + '='.repeat(60));
  console.log('All examples completed!');
  console.log('='.repeat(60));
}
