# Retrigger Enhancement Implementation

## Overview

The retrigger enhancement has been successfully implemented in the poker scoring module. This enhancement allows cards to trigger their effects multiple times, multiplying their contribution to the final score.

## Implementation Details

### Core Function

The implementation centers around a new helper function `getCardTriggerCount()` that determines how many times a card's effect should be applied:

```typescript
function getCardTriggerCount(card: Card): number {
  if (card.enhancement?.type === 'retrigger') {
    // Safety: max 10 retriggers, min 0
    const retriggerCount = Math.max(0, Math.min(card.enhancement.value, MAX_RETRIGGER_COUNT));
    return 1 + retriggerCount; // Original trigger + retriggers
  }
  return 1; // Default: trigger once
}
```

### What Gets Retriggered

The retrigger enhancement affects:

1. **Card Chip Values**: Base chip value multiplied by trigger count
2. **Chips Enhancement**: Chips bonus multiplied by trigger count
3. **Mult Enhancement**: Mult bonus multiplied by trigger count
4. **Gold Enhancement**: Gold value multiplied by trigger count

### Safety Features

- **Maximum Limit**: Capped at 10 retriggers (11 total triggers) to prevent infinite loops
- **Minimum Guarantee**: Negative values are clamped to 0, ensuring at least 1 trigger
- **Type Safety**: Uses TypeScript interfaces for type checking

## Usage Examples

### Example 1: Basic Retrigger

```typescript
// Ace of Hearts with retrigger (value: 1)
const card = {
  rank: 'A',
  suit: 'hearts',
  enhancement: { type: 'retrigger', value: 1 }
};

// Calculation:
// - Ace chip value: 11
// - Trigger count: 1 + 1 = 2
// - Total chips from this card: 11 × 2 = 22
```

### Example 2: Multiple Retriggers

```typescript
// 10 of Hearts with retrigger (value: 3)
const card = {
  rank: '10',
  suit: 'hearts',
  enhancement: { type: 'retrigger', value: 3 }
};

// Calculation:
// - Card chip value: 10
// - Trigger count: 1 + 3 = 4
// - Total chips from this card: 10 × 4 = 40
```

### Example 3: Retrigger with Pair

```typescript
// Pair of 7s with one retriggered
const scoringCards = [
  { rank: '7', suit: 'hearts', enhancement: { type: 'retrigger', value: 1 } },
  { rank: '7', suit: 'diamonds', enhancement: { type: 'retrigger', value: 1 } }
];

// Hand: Pair (base: 10 chips × 2 mult)
// Card contributions:
// - 7H: 7 × 2 = 14 chips
// - 7D: 7 × 2 = 14 chips
// Total: 10 + 14 + 14 = 38 chips × 2 mult = 76 score
```

## Test Coverage

Comprehensive tests cover:

- Basic retrigger functionality (1-3 retriggers)
- Multiple cards with different retrigger values
- Interaction with other enhancement types
- Gold enhancement retriggering
- Edge cases (zero, negative, excessive values)
- Complex poker hands with mixed enhancements
- Integration with external bonuses (jokers, slots)

All 114 tests pass, including 30+ new tests specifically for retrigger.

## Data Schema

The retrigger enhancement is defined in `src/data/cards.json`:

```json
{
  "id": "red_seal",
  "name": "Red Seal",
  "description": "Retrigger this card",
  "type": "retrigger",
  "value": 1
}
```

## Future Enhancements

Potential extensions (not yet implemented):

1. **Event System Integration**: Emit card play events multiple times
2. **Joker Interactions**: Allow jokers to respond to retriggered cards
3. **Special Card Effects**: Retrigger `triggerSlot` and `triggerRoulette` effects
4. **Stacking Rules**: Define behavior when multiple retriggers interact

## Files Modified

- `/Users/waynelee/fortune-hand/src/modules/poker/scoring.ts`: Core implementation
- `/Users/waynelee/fortune-hand/src/modules/poker/scoring.test.ts`: Comprehensive tests

## Performance

The implementation is efficient:
- O(n) complexity where n is the number of scoring cards
- No recursive calls or complex iterations
- Safety checks prevent runaway calculations
