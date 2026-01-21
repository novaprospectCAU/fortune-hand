/**
 * Card Enhancement System - Demo
 *
 * This file demonstrates how card enhancements work in Fortune's Hand.
 * Run with: npm run dev (in browser console or test environment)
 */

import type { Card, HandResult, ScoreCalculation } from '@/types/interfaces';
import { evaluateHand, calculateScore, calculateGoldFromEnhancements } from '@/modules/poker';

// ============================================================
// Example 1: Chips Enhancement
// ============================================================

console.log('═══════════════════════════════════════════════════════');
console.log('Example 1: Chips Enhancement (+30 chips)');
console.log('═══════════════════════════════════════════════════════');

const chipsEnhancedCard: Card = {
  id: 'A_hearts',
  rank: 'A',
  suit: 'hearts',
  enhancement: { type: 'chips', value: 30 },
};

const normalCard: Card = {
  id: 'A_diamonds',
  rank: 'A',
  suit: 'diamonds',
};

const pairCards = [chipsEnhancedCard, normalCard];
const handResult1 = evaluateHand(pairCards);
const scoreCalc1 = calculateScore(handResult1);

console.log('Cards:', pairCards.map(c => `${c.rank}${c.suit[0]}`).join(', '));
console.log('Hand Type:', handResult1.handType); // 'pair'
console.log('Base chips:', handResult1.baseChips); // 10
console.log('Card chips:', '11 (normal Ace) + 41 (enhanced Ace) = 52');
console.log('Total chips:', scoreCalc1.chipTotal); // 62 (10 + 11 + 41)
console.log('Mult:', scoreCalc1.multTotal); // 2
console.log('Final Score:', scoreCalc1.finalScore); // 124
console.log('Applied Bonuses:', scoreCalc1.appliedBonuses);
// [
//   { source: 'Card chips', type: 'chips', value: 52 },
//   { source: 'Enhancement: AH', type: 'chips', value: 30 }
// ]

// ============================================================
// Example 2: Mult Enhancement
// ============================================================

console.log('\n═══════════════════════════════════════════════════════');
console.log('Example 2: Mult Enhancement (+4 mult)');
console.log('═══════════════════════════════════════════════════════');

const multEnhancedCard: Card = {
  id: 'K_hearts',
  rank: 'K',
  suit: 'hearts',
  enhancement: { type: 'mult', value: 4 },
};

const highCardHand = [multEnhancedCard];
const handResult2 = evaluateHand(highCardHand);
const scoreCalc2 = calculateScore(handResult2);

console.log('Cards:', 'K♥ (with +4 mult)');
console.log('Hand Type:', handResult2.handType); // 'high_card'
console.log('Total chips:', scoreCalc2.chipTotal); // 15 (5 base + 10 card)
console.log('Base mult:', handResult2.baseMult); // 1
console.log('Enhancement mult:', '+4');
console.log('Total mult:', scoreCalc2.multTotal); // 5 (1 + 4)
console.log('Final Score:', scoreCalc2.finalScore); // 75 (15 × 5)
console.log('Applied Bonuses:', scoreCalc2.appliedBonuses);
// [
//   { source: 'Card chips', type: 'chips', value: 10 },
//   { source: 'Enhancement: KH', type: 'mult', value: 4 }
// ]

// ============================================================
// Example 3: Gold Enhancement
// ============================================================

console.log('\n═══════════════════════════════════════════════════════');
console.log('Example 3: Gold Enhancement (+3 gold)');
console.log('═══════════════════════════════════════════════════════');

const goldEnhancedCard: Card = {
  id: 'Q_hearts',
  rank: 'Q',
  suit: 'hearts',
  enhancement: { type: 'gold', value: 3 },
};

const goldHand = [goldEnhancedCard];
const handResult3 = evaluateHand(goldHand);
const scoreCalc3 = calculateScore(handResult3);
const goldFromEnhancements = calculateGoldFromEnhancements(handResult3.scoringCards);

console.log('Cards:', 'Q♥ (with +3 gold)');
console.log('Hand Type:', handResult3.handType); // 'high_card'
console.log('Final Score:', scoreCalc3.finalScore); // 15 (normal scoring)
console.log('Gold from enhancements:', goldFromEnhancements); // 3
console.log('Note: Gold is applied in REWARD_PHASE, not during scoring');

// ============================================================
// Example 4: Mixed Enhancements (Flush)
// ============================================================

console.log('\n═══════════════════════════════════════════════════════');
console.log('Example 4: Mixed Enhancements (Flush)');
console.log('═══════════════════════════════════════════════════════');

const mixedFlushCards: Card[] = [
  { id: 'A_hearts', rank: 'A', suit: 'hearts', enhancement: { type: 'chips', value: 30 } },
  { id: 'K_hearts', rank: 'K', suit: 'hearts', enhancement: { type: 'mult', value: 4 } },
  { id: 'Q_hearts', rank: 'Q', suit: 'hearts', enhancement: { type: 'gold', value: 3 } },
  { id: 'J_hearts', rank: 'J', suit: 'hearts' },
  { id: '10_hearts', rank: '10', suit: 'hearts' },
];

const handResult4 = evaluateHand(mixedFlushCards);
const scoreCalc4 = calculateScore(handResult4);
const goldFromMixed = calculateGoldFromEnhancements(handResult4.scoringCards);

console.log('Cards:', mixedFlushCards.map(c => `${c.rank}${c.suit[0]}`).join(', '));
console.log('Hand Type:', handResult4.handType); // 'flush'
console.log('\nScore Breakdown:');
console.log('  Base chips:', handResult4.baseChips); // 35
console.log('  Card chips:', '(11+30) + 10 + 10 + 10 + 10 = 81');
console.log('  Total chips:', scoreCalc4.chipTotal); // 116
console.log('');
console.log('  Base mult:', handResult4.baseMult); // 4
console.log('  Enhancement mult:', '+4');
console.log('  Total mult:', scoreCalc4.multTotal); // 8
console.log('');
console.log('  Final Score:', scoreCalc4.finalScore); // 928 (116 × 8)
console.log('  Gold bonus:', `+${goldFromMixed}`); // 3
console.log('\nApplied Bonuses:');
scoreCalc4.appliedBonuses.forEach(bonus => {
  console.log(`  - ${bonus.source}: +${bonus.value} ${bonus.type}`);
});

// ============================================================
// Example 5: Enhancements with Joker Bonuses
// ============================================================

console.log('\n═══════════════════════════════════════════════════════');
console.log('Example 5: Enhancements + Joker Bonuses');
console.log('═══════════════════════════════════════════════════════');

const enhancedPairCards: Card[] = [
  { id: 'A_hearts', rank: 'A', suit: 'hearts', enhancement: { type: 'chips', value: 30 } },
  { id: 'A_diamonds', rank: 'A', suit: 'diamonds', enhancement: { type: 'mult', value: 4 } },
];

const handResult5 = evaluateHand(enhancedPairCards);

// Simulate joker bonuses
const jokerBonuses = [
  { source: 'Lucky Joker', type: 'mult' as const, value: 5 },
  { source: 'Slot Bonus', type: 'xmult' as const, value: 2 },
];

const scoreCalc5 = calculateScore(handResult5, jokerBonuses);

console.log('Cards:', 'A♥ (+30 chips), A♦ (+4 mult)');
console.log('Hand Type:', handResult5.handType); // 'pair'
console.log('External Bonuses:', 'Lucky Joker (+5 mult), Slot Bonus (×2)');
console.log('\nCalculation:');
console.log('  Chips = 10 (base) + (11+30) + 11 =', scoreCalc5.chipTotal); // 62
console.log('  Mult = (2 (base) + 4 (card) + 5 (joker)) × 2 (slot) =', scoreCalc5.multTotal); // 22
console.log('  Score = 62 × 22 =', scoreCalc5.finalScore); // 1364
console.log('\nBonus Application Order:');
console.log('  1. Card enhancements (chips & mult)');
console.log('  2. External bonuses (chips)');
console.log('  3. External bonuses (mult)');
console.log('  4. External bonuses (xmult) - multiplicative');

// ============================================================
// Summary
// ============================================================

console.log('\n═══════════════════════════════════════════════════════');
console.log('SUMMARY: Enhancement System Features');
console.log('═══════════════════════════════════════════════════════');
console.log('✅ Chips Enhancement - Increases card chip value');
console.log('✅ Mult Enhancement - Increases score multiplier');
console.log('✅ Gold Enhancement - Grants gold in reward phase');
console.log('✅ Full AppliedBonus tracking for transparency');
console.log('✅ Works seamlessly with jokers and slot bonuses');
console.log('🚧 Retrigger Enhancement - Coming soon');
console.log('═══════════════════════════════════════════════════════\n');

export {
  chipsEnhancedCard,
  multEnhancedCard,
  goldEnhancedCard,
  mixedFlushCards,
};
