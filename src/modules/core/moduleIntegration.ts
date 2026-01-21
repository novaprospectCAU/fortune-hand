/**
 * Module Integration Layer
 *
 * This file provides the integration points for other modules.
 * When modules are implemented, replace these stubs with actual imports.
 */

import type {
  Card,
  Deck,
  SlotResult,
  SlotEffects,
  SlotModifiers,
  HandResult,
  ScoreCalculation,
  AppliedBonus,
  RouletteResult,
  RouletteConfig,
  RouletteInput,
  Joker,
  JokerContext,
  ShopState,
  Suit,
  Rank,
} from '@/types/interfaces';
import { SUITS, RANKS, CARD_CHIP_VALUES, BASE_HAND_VALUES } from '@/data/constants';

// ============================================================
// Cards Module Integration
// ============================================================

import {
  detectTriggers,
  countSlotTriggers,
  countRouletteTriggers,
  mergeSlotResults,
} from '@/modules/cards/triggers';

// Re-export trigger functions
export { detectTriggers, countSlotTriggers, countRouletteTriggers, mergeSlotResults };

/**
 * Create a standard 52-card deck
 */
export function createStandardDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `${rank}_${suit}`,
        suit: suit as Suit,
        rank: rank as Rank,
      });
    }
  }
  return cards;
}

/**
 * Shuffle cards using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

/**
 * Draw cards from deck
 */
export function draw(deck: Deck, count: number): { drawn: Card[]; deck: Deck } {
  const actualCount = Math.min(count, deck.cards.length);
  const drawn = deck.cards.slice(0, actualCount);
  const remainingCards = deck.cards.slice(actualCount);

  return {
    drawn,
    deck: {
      cards: remainingCards,
      discardPile: deck.discardPile,
    },
  };
}

/**
 * Discard cards
 */
export function discard(deck: Deck, cards: Card[]): Deck {
  return {
    cards: deck.cards,
    discardPile: [...deck.discardPile, ...cards],
  };
}

/**
 * Add cards to deck
 */
export function addToDeck(deck: Deck, cards: Card[]): Deck {
  return {
    cards: [...deck.cards, ...cards],
    discardPile: deck.discardPile,
  };
}

// ============================================================
// Slots Module Integration
// ============================================================

const DEFAULT_SLOT_EFFECTS: SlotEffects = {
  cardBonus: { extraDraw: 0, handSize: 0, scoreMultiplier: 1 },
  rouletteBonus: { safeZoneBonus: 0, maxMultiplier: 0, freeSpins: 0 },
  instant: { gold: 0, chips: 0 },
  penalty: { discardCards: 0, skipRoulette: false, loseGold: 0 },
};

/**
 * Spin the slot machine
 */
export function spin(_modifiers?: SlotModifiers): SlotResult {
  // Simple random symbol selection
  const symbols = ['card', 'target', 'gold', 'chip', 'star', 'skull', 'wild'] as const;
  const weights = [25, 20, 20, 15, 5, 10, 5];
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  function pickSymbol(): typeof symbols[number] {
    const random = Math.random() * totalWeight;
    let cumulative = 0;
    for (let i = 0; i < symbols.length; i++) {
      cumulative += weights[i]!;
      if (random < cumulative) {
        return symbols[i]!;
      }
    }
    return symbols[0]!;
  }

  const result: [typeof symbols[number], typeof symbols[number], typeof symbols[number]] = [
    pickSymbol(),
    pickSymbol(),
    pickSymbol(),
  ];

  // Check for triple match
  const isTriple = result[0] === result[1] && result[1] === result[2];
  const isJackpot = isTriple && result[0] === 'star';

  // Calculate effects based on result
  let effects: SlotEffects = { ...DEFAULT_SLOT_EFFECTS };

  if (isJackpot) {
    effects = {
      cardBonus: { extraDraw: 3, handSize: 1, scoreMultiplier: 2 },
      rouletteBonus: { safeZoneBonus: 30, maxMultiplier: 2, freeSpins: 1 },
      instant: { gold: 50, chips: 100 },
      penalty: { discardCards: 0, skipRoulette: false, loseGold: 0 },
    };
  } else if (isTriple) {
    switch (result[0]) {
      case 'card':
        effects = {
          ...DEFAULT_SLOT_EFFECTS,
          cardBonus: { extraDraw: 2, handSize: 0, scoreMultiplier: 1 },
        };
        break;
      case 'target':
        effects = {
          ...DEFAULT_SLOT_EFFECTS,
          rouletteBonus: { safeZoneBonus: 20, maxMultiplier: 1, freeSpins: 0 },
        };
        break;
      case 'gold':
        effects = { ...DEFAULT_SLOT_EFFECTS, instant: { gold: 25, chips: 0 } };
        break;
      case 'chip':
        effects = { ...DEFAULT_SLOT_EFFECTS, instant: { gold: 0, chips: 50 } };
        break;
      case 'skull':
        effects = {
          ...DEFAULT_SLOT_EFFECTS,
          penalty: { discardCards: 2, skipRoulette: true, loseGold: 10 },
        };
        break;
    }
  } else {
    // Single symbol effects (simplified)
    let goldGain = 0;
    let chipsGain = 0;
    for (const sym of result) {
      if (sym === 'gold') goldGain += 3;
      if (sym === 'chip') chipsGain += 5;
      if (sym === 'star') {
        goldGain += 5;
        chipsGain += 10;
      }
    }
    effects = {
      ...DEFAULT_SLOT_EFFECTS,
      instant: { gold: goldGain, chips: chipsGain },
    };
  }

  return {
    symbols: result,
    isJackpot,
    effects,
  };
}

// ============================================================
// Poker Module Integration
// ============================================================

// HandType is already defined in interfaces.ts but we need to use it for type assertions

const RANK_VALUES: Record<Rank, number> = {
  A: 14,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
};

function getRankCounts(cards: Card[]): Map<Rank, Card[]> {
  const counts = new Map<Rank, Card[]>();
  for (const card of cards) {
    if (!counts.has(card.rank)) {
      counts.set(card.rank, []);
    }
    counts.get(card.rank)!.push(card);
  }
  return counts;
}

function getSuitCounts(cards: Card[]): Map<Suit, Card[]> {
  const counts = new Map<Suit, Card[]>();
  for (const card of cards) {
    if (!counts.has(card.suit)) {
      counts.set(card.suit, []);
    }
    counts.get(card.suit)!.push(card);
  }
  return counts;
}

function isFlush(cards: Card[]): { isFlush: boolean; flushCards: Card[] } {
  const suitCounts = getSuitCounts(cards);
  for (const [, cardsOfSuit] of suitCounts) {
    if (cardsOfSuit.length >= 5) {
      return { isFlush: true, flushCards: cardsOfSuit.slice(0, 5) };
    }
  }
  return { isFlush: false, flushCards: [] };
}

function isStraight(cards: Card[]): { isStraight: boolean; straightCards: Card[] } {
  const uniqueRanks = new Map<number, Card>();
  for (const card of cards) {
    const value = RANK_VALUES[card.rank];
    if (!uniqueRanks.has(value)) {
      uniqueRanks.set(value, card);
    }
  }

  // Check for A-2-3-4-5 (wheel)
  if (
    uniqueRanks.has(14) &&
    uniqueRanks.has(2) &&
    uniqueRanks.has(3) &&
    uniqueRanks.has(4) &&
    uniqueRanks.has(5)
  ) {
    return {
      isStraight: true,
      straightCards: [
        uniqueRanks.get(5)!,
        uniqueRanks.get(4)!,
        uniqueRanks.get(3)!,
        uniqueRanks.get(2)!,
        uniqueRanks.get(14)!,
      ],
    };
  }

  // Check for regular straight
  const sortedValues = Array.from(uniqueRanks.keys()).sort((a, b) => b - a);
  for (let i = 0; i <= sortedValues.length - 5; i++) {
    const slice = sortedValues.slice(i, i + 5);
    if (slice[0]! - slice[4]! === 4) {
      return {
        isStraight: true,
        straightCards: slice.map(v => uniqueRanks.get(v)!),
      };
    }
  }

  return { isStraight: false, straightCards: [] };
}

/**
 * Evaluate a poker hand
 */
export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length === 0) {
    return {
      handType: 'high_card',
      rank: 0,
      scoringCards: [],
      baseChips: BASE_HAND_VALUES.high_card.chips,
      baseMult: BASE_HAND_VALUES.high_card.mult,
    };
  }

  const rankCounts = getRankCounts(cards);
  const flushCheck = isFlush(cards);
  const straightCheck = isStraight(cards);

  // Sort cards by rank value for high card comparison
  const sortedCards = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);

  // Count pairs, trips, quads
  const pairs: Card[][] = [];
  const trips: Card[][] = [];
  const quads: Card[][] = [];

  for (const [, cardsOfRank] of rankCounts) {
    if (cardsOfRank.length === 4) {
      quads.push(cardsOfRank);
    } else if (cardsOfRank.length === 3) {
      trips.push(cardsOfRank);
    } else if (cardsOfRank.length === 2) {
      pairs.push(cardsOfRank);
    }
  }

  // Royal Flush
  if (flushCheck.isFlush && straightCheck.isStraight) {
    const flushStraightCards = straightCheck.straightCards.filter(
      c => c.suit === flushCheck.flushCards[0]?.suit
    );
    if (flushStraightCards.length >= 5) {
      const highCard = flushStraightCards[0]!;
      if (RANK_VALUES[highCard.rank] === 14) {
        return {
          handType: 'royal_flush',
          rank: 14,
          scoringCards: flushStraightCards.slice(0, 5),
          baseChips: BASE_HAND_VALUES.royal_flush.chips,
          baseMult: BASE_HAND_VALUES.royal_flush.mult,
        };
      }
    }
  }

  // Straight Flush
  if (flushCheck.isFlush && straightCheck.isStraight) {
    // Check if the flush cards form a straight
    const flushSuitCards = cards.filter(c => c.suit === flushCheck.flushCards[0]?.suit);
    const straightFlushCheck = isStraight(flushSuitCards);
    if (straightFlushCheck.isStraight) {
      return {
        handType: 'straight_flush',
        rank: RANK_VALUES[straightFlushCheck.straightCards[0]!.rank],
        scoringCards: straightFlushCheck.straightCards,
        baseChips: BASE_HAND_VALUES.straight_flush.chips,
        baseMult: BASE_HAND_VALUES.straight_flush.mult,
      };
    }
  }

  // Four of a Kind
  if (quads.length > 0) {
    const quadCards = quads[0]!;
    return {
      handType: 'four_of_a_kind',
      rank: RANK_VALUES[quadCards[0]!.rank],
      scoringCards: quadCards,
      baseChips: BASE_HAND_VALUES.four_of_a_kind.chips,
      baseMult: BASE_HAND_VALUES.four_of_a_kind.mult,
    };
  }

  // Full House
  if (trips.length > 0 && pairs.length > 0) {
    const tripCards = trips[0]!;
    const pairCards = pairs[0]!;
    return {
      handType: 'full_house',
      rank: RANK_VALUES[tripCards[0]!.rank],
      scoringCards: [...tripCards, ...pairCards.slice(0, 2)],
      baseChips: BASE_HAND_VALUES.full_house.chips,
      baseMult: BASE_HAND_VALUES.full_house.mult,
    };
  }

  // Two trips counts as full house
  if (trips.length >= 2) {
    const tripCards1 = trips[0]!;
    const tripCards2 = trips[1]!;
    return {
      handType: 'full_house',
      rank: RANK_VALUES[tripCards1[0]!.rank],
      scoringCards: [...tripCards1, ...tripCards2.slice(0, 2)],
      baseChips: BASE_HAND_VALUES.full_house.chips,
      baseMult: BASE_HAND_VALUES.full_house.mult,
    };
  }

  // Flush
  if (flushCheck.isFlush) {
    return {
      handType: 'flush',
      rank: RANK_VALUES[flushCheck.flushCards[0]!.rank],
      scoringCards: flushCheck.flushCards,
      baseChips: BASE_HAND_VALUES.flush.chips,
      baseMult: BASE_HAND_VALUES.flush.mult,
    };
  }

  // Straight
  if (straightCheck.isStraight) {
    return {
      handType: 'straight',
      rank: RANK_VALUES[straightCheck.straightCards[0]!.rank],
      scoringCards: straightCheck.straightCards,
      baseChips: BASE_HAND_VALUES.straight.chips,
      baseMult: BASE_HAND_VALUES.straight.mult,
    };
  }

  // Three of a Kind
  if (trips.length > 0) {
    const tripCards = trips[0]!;
    return {
      handType: 'three_of_a_kind',
      rank: RANK_VALUES[tripCards[0]!.rank],
      scoringCards: tripCards,
      baseChips: BASE_HAND_VALUES.three_of_a_kind.chips,
      baseMult: BASE_HAND_VALUES.three_of_a_kind.mult,
    };
  }

  // Two Pair
  if (pairs.length >= 2) {
    // Sort pairs by rank value
    pairs.sort(
      (a, b) => RANK_VALUES[b[0]!.rank] - RANK_VALUES[a[0]!.rank]
    );
    const pairCards = [...pairs[0]!, ...pairs[1]!];
    return {
      handType: 'two_pair',
      rank: RANK_VALUES[pairs[0]![0]!.rank],
      scoringCards: pairCards,
      baseChips: BASE_HAND_VALUES.two_pair.chips,
      baseMult: BASE_HAND_VALUES.two_pair.mult,
    };
  }

  // Pair
  if (pairs.length === 1) {
    const pairCards = pairs[0]!;
    return {
      handType: 'pair',
      rank: RANK_VALUES[pairCards[0]!.rank],
      scoringCards: pairCards,
      baseChips: BASE_HAND_VALUES.pair.chips,
      baseMult: BASE_HAND_VALUES.pair.mult,
    };
  }

  // High Card
  return {
    handType: 'high_card',
    rank: RANK_VALUES[sortedCards[0]!.rank],
    scoringCards: [sortedCards[0]!],
    baseChips: BASE_HAND_VALUES.high_card.chips,
    baseMult: BASE_HAND_VALUES.high_card.mult,
  };
}

/**
 * Calculate score from hand result and bonuses
 */
export function calculateScore(
  handResult: HandResult,
  bonuses: AppliedBonus[]
): ScoreCalculation {
  // Start with base chips and mult
  let chipTotal = handResult.baseChips;
  let multTotal = handResult.baseMult;

  // Add chip values from scoring cards
  for (const card of handResult.scoringCards) {
    chipTotal += CARD_CHIP_VALUES[card.rank];
  }

  // Apply bonuses
  for (const bonus of bonuses) {
    switch (bonus.type) {
      case 'chips':
        chipTotal += bonus.value;
        break;
      case 'mult':
        multTotal += bonus.value;
        break;
      case 'xmult':
        multTotal *= bonus.value;
        break;
    }
  }

  const finalScore = Math.floor(chipTotal * multTotal);

  return {
    handResult,
    chipTotal,
    multTotal,
    appliedBonuses: bonuses,
    finalScore,
  };
}

// ============================================================
// Roulette Module Integration
// ============================================================

import balanceData from '@/data/balance.json';

/**
 * Get default roulette config
 */
export function getDefaultRouletteConfig(): RouletteConfig {
  return {
    segments: balanceData.roulette.segments.map(s => ({
      id: s.id,
      multiplier: s.multiplier,
      probability: s.probability,
      color: s.color,
    })),
    spinDuration: balanceData.roulette.spinDuration,
  };
}

/**
 * Spin the roulette
 */
export function rouletteSpin(input: RouletteInput): RouletteResult {
  const { baseScore, config } = input;
  const totalProbability = config.segments.reduce((sum, seg) => sum + seg.probability, 0);

  const random = Math.random() * totalProbability;
  let cumulative = 0;

  for (const segment of config.segments) {
    cumulative += segment.probability;
    if (random < cumulative) {
      return {
        segment,
        finalScore: baseScore * segment.multiplier,
        wasSkipped: false,
      };
    }
  }

  // Fallback to first segment
  const firstSegment = config.segments[0]!;
  return {
    segment: firstSegment,
    finalScore: baseScore * firstSegment.multiplier,
    wasSkipped: false,
  };
}

/**
 * Apply bonuses to roulette config
 */
export function applyRouletteBonuses(
  config: RouletteConfig,
  bonuses: SlotEffects['rouletteBonus']
): RouletteConfig {
  // Create a copy of segments
  const segments = config.segments.map(seg => {
    // Increase non-zero multipliers
    if (seg.multiplier > 0) {
      return {
        ...seg,
        multiplier: seg.multiplier + bonuses.maxMultiplier,
        probability: seg.probability + (bonuses.safeZoneBonus / config.segments.length),
      };
    }
    // Decrease zero (loss) probability
    return {
      ...seg,
      probability: Math.max(0, seg.probability - bonuses.safeZoneBonus),
    };
  });

  return {
    ...config,
    segments,
  };
}

// ============================================================
// Jokers Module Integration
// ============================================================

/**
 * Evaluate joker effects
 */
export function evaluateJokers(
  jokers: Joker[],
  context: JokerContext
): AppliedBonus[] {
  const bonuses: AppliedBonus[] = [];

  for (const joker of jokers) {
    // Check trigger condition
    let triggered = false;

    switch (joker.trigger.type) {
      case 'on_score':
        triggered = context.phase === 'SCORE_PHASE';
        break;
      case 'on_play':
        // on_play jokers also trigger during SCORE_PHASE since played cards affect scoring
        triggered = context.phase === 'PLAY_PHASE' || context.phase === 'SCORE_PHASE';
        if (triggered && joker.trigger.cardCondition && context.playedCards) {
          const condition = joker.trigger.cardCondition;
          triggered = context.playedCards.some(card => {
            if (condition.suit && card.suit !== condition.suit) return false;
            if (condition.rank && card.rank !== condition.rank) return false;
            return true;
          });
        }
        break;
      case 'on_slot':
        triggered = context.phase === 'SLOT_PHASE' && context.slotResult !== undefined;
        break;
      case 'on_roulette':
        triggered = context.phase === 'ROULETTE_PHASE';
        break;
      case 'passive':
        triggered = true;
        break;
    }

    if (!triggered) continue;

    // Apply effect
    switch (joker.effect.type) {
      case 'add_chips':
        bonuses.push({
          source: joker.name,
          type: 'chips',
          value: joker.effect.value,
        });
        break;
      case 'add_mult':
        bonuses.push({
          source: joker.name,
          type: 'mult',
          value: joker.effect.value,
        });
        break;
      case 'multiply':
        bonuses.push({
          source: joker.name,
          type: 'xmult',
          value: joker.effect.value,
        });
        break;
    }
  }

  return bonuses;
}

// ============================================================
// Shop Module Integration
// ============================================================

// Import and re-export the actual shop functions from the shop module
import { generateShop as shopGenerateShop } from '@/modules/shop/shopGenerator';
import { buyItem as shopBuyItem } from '@/modules/shop/transactions';

export const generateShop = shopGenerateShop;
export const buyItem = shopBuyItem;

/**
 * Reroll shop items
 */
export function rerollShop(
  shopState: ShopState,
  playerGold: number,
  round: number,
  luck: number = 0,
  discount: number = 0
): { shop: ShopState; cost: number; success: boolean; newGold: number } {
  const baseCost = shopState.rerollCost;
  const cost = Math.max(0, baseCost - discount);

  if (playerGold < cost) {
    return {
      shop: shopState,
      cost: 0,
      success: false,
      newGold: playerGold,
    };
  }

  const newShop = shopGenerateShop(round, luck);
  newShop.rerollsUsed = shopState.rerollsUsed + 1;
  newShop.rerollCost = Math.max(0,
    balanceData.shop.rerollBaseCost +
    newShop.rerollsUsed * balanceData.shop.rerollCostIncrease
  );

  return {
    shop: newShop,
    cost,
    success: true,
    newGold: playerGold - cost,
  };
}
