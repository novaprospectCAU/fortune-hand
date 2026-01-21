# Special Card Triggers System

## Overview

The special card trigger system allows certain cards to activate special effects when played. This document describes the implementation of two trigger types:

1. **triggerSlot**: Cards that trigger mini slot spins when played
2. **triggerRoulette**: Cards that grant additional roulette spin opportunities

## Architecture

### Module Organization

```
src/modules/cards/
├── triggers.ts           # Trigger detection and effects
└── triggers.test.ts      # Unit tests (32 tests)

src/modules/core/
├── store.ts              # Integration with game store
└── triggers-integration.test.ts  # Integration tests (10 tests)

src/types/
└── interfaces.ts         # Type definitions
```

### Key Files

#### `/src/modules/cards/triggers.ts`

Core trigger logic module that provides:

- `detectTriggers(cards)`: Detects which cards have trigger properties
- `getTriggerEffects(cards)`: Returns array of effects to apply
- `countSlotTriggers(cards)`: Counts number of slot triggers
- `countRouletteTriggers(cards)`: Counts number of roulette triggers
- `hasTriggerType(cards, type)`: Checks if any card has specific trigger
- `mergeSlotResults(results[])`: Merges multiple slot results into one

#### `/src/types/interfaces.ts`

Extended GameState with:
```typescript
interface GameState {
  // ... existing fields
  triggeredSlotResults: SlotResult[];  // Results from card-triggered slots
  rouletteSpinsGranted: number;        // Extra roulette spins granted
}
```

#### `/src/modules/core/store.ts`

Modified `playHand()` action to:
1. Detect triggers in selected cards
2. Execute mini slot spins for each slot trigger
3. Merge triggered slot results with main slot result
4. Track roulette spins granted

## How It Works

### Slot Triggers (triggerSlot: true)

When a card with `triggerSlot: true` is played:

1. **Detection**: `playHand()` calls `countSlotTriggers(selectedCards)`
2. **Execution**: For each trigger, execute `spin()` to get a `SlotResult`
3. **Storage**: Store all triggered results in `state.triggeredSlotResults[]`
4. **Merging**: Merge triggered results with main slot result using `mergeSlotResults()`
5. **Application**: Merged effects are applied during score calculation

#### Merge Strategy

When merging multiple slot results:
- **Jackpot**: If ANY result is jackpot, merged result is jackpot
- **Card Bonuses**:
  - `extraDraw` and `handSize`: Summed
  - `scoreMultiplier`: Multiplied
- **Roulette Bonuses**: All values summed
- **Instant Rewards**: Gold and chips summed
- **Penalties**: Maximum penalty taken (worst case)

### Roulette Triggers (triggerRoulette: true)

When a card with `triggerRoulette: true` is played:

1. **Detection**: `playHand()` calls `countRouletteTriggers(selectedCards)`
2. **Granting**: Increment `state.rouletteSpinsGranted` by count
3. **Storage**: Value persists until roulette phase
4. **Usage**: (Future) Allow multiple roulette spins based on granted count

**Note**: Currently, roulette phase only performs one spin regardless of `rouletteSpinsGranted`. The system tracks granted spins but UI/logic for multiple spins is a future enhancement.

## Special Cards in cards.json

### Lucky Seven (slot_seven)

```json
{
  "id": "slot_seven",
  "name": "Lucky Seven",
  "description": "Triggers a mini slot spin when played",
  "baseRank": "7",
  "baseSuit": "hearts",
  "triggerSlot": true,
  "rarity": "rare",
  "shopCost": 40
}
```

### Gambler's King (roulette_king)

```json
{
  "id": "roulette_king",
  "name": "Gambler's King",
  "description": "Grants an extra roulette spin",
  "baseRank": "K",
  "baseSuit": "diamonds",
  "triggerRoulette": true,
  "rarity": "rare",
  "shopCost": 45
}
```

## Game Flow Integration

### Normal Turn Flow

```
SLOT_PHASE → DRAW_PHASE → PLAY_PHASE → SCORE_PHASE → ROULETTE_PHASE → REWARD_PHASE
     ↓                          ↓
  Main Slot              Cards Played
  (slotResult)           (triggers detected)
                               ↓
                         Mini Slots Executed
                         (triggeredSlotResults[])
                               ↓
                         Results Merged
                         (slotResult updated)
```

### With Trigger Cards

```
1. SLOT_PHASE: Player spins main slot → slotResult set

2. PLAY_PHASE:
   - Player plays: Lucky Seven (7♥) + King (K♦)
   - System detects: 1 slot trigger, 0 roulette triggers
   - System executes: 1 mini slot spin
   - System stores: triggeredSlotResults = [miniSlotResult]
   - System merges: slotResult += miniSlotResult effects

3. SCORE_PHASE:
   - Hand evaluated with MERGED slot bonuses
   - Extra draw/multipliers from mini slot applied

4. ROULETTE_PHASE:
   - Normal single spin (granted spins tracked but not yet used)

5. REWARD_PHASE:
   - Final score calculated with all bonuses
```

## State Lifecycle

### Trigger State Creation
- Created in `playHand()` when cards are played
- Populated during PLAY_PHASE

### Trigger State Usage
- Slot results merged and used in SCORE_PHASE
- Roulette grants available in ROULETTE_PHASE

### Trigger State Cleanup
- Cleared by `_resetTurnState()` after each turn
- Cleared by `leaveShop()` when starting new round

## Testing

### Unit Tests (32 tests)

Located in `/src/modules/cards/triggers.test.ts`:

- Trigger detection for all card combinations
- Effect generation
- Counting functions
- Type checking
- Result merging (multiple strategies)

### Integration Tests (10 tests)

Located in `/src/modules/core/triggers-integration.test.ts`:

- Slot trigger integration with game store
- Roulette trigger integration with game store
- Combined triggers
- State cleanup

### Running Tests

```bash
# All trigger tests
npm test -- triggers

# Just unit tests
npm test -- src/modules/cards/triggers.test.ts

# Just integration tests
npm test -- src/modules/core/triggers-integration.test.ts

# Type checking
npm run typecheck
```

## Future Enhancements

### Multiple Roulette Spins (TODO)

Currently, `rouletteSpinsGranted` is tracked but only one spin is performed. To implement multiple spins:

1. **Store Modification**: Track roulette results as array (like slot results)
2. **UI Enhancement**: Show multiple roulette wheels or sequential spins
3. **Logic Update**: In `spinRoulette()`, loop based on `rouletteSpinsGranted`
4. **Result Handling**: Decide strategy:
   - Best result wins?
   - Sum all results?
   - Player chooses which to keep?

### Advanced Trigger Conditions

Potential future trigger types:
- `triggerOnSuit`: Trigger only when played with specific suit
- `triggerOnHandType`: Trigger on specific poker hands
- `triggerMultiple`: Stronger effect for multiple copies
- `triggerChain`: Trigger other cards

### Trigger Stacking

Currently triggers stack linearly (2 cards = 2 triggers). Future options:
- Diminishing returns
- Combo bonuses
- Anti-synergy penalties

## API Reference

### detectTriggers(cards: Card[]): TriggerResult

Detects all triggers in a card array.

**Returns:**
```typescript
{
  hasSlotTrigger: boolean;
  hasRouletteTrigger: boolean;
  slotTriggerCards: Card[];
  rouletteTriggerCards: Card[];
}
```

### getTriggerEffects(cards: Card[]): TriggerEffect[]

Gets all effects that should be applied from triggers.

**Returns:**
```typescript
Array<{
  type: 'slot_spin' | 'roulette_spin';
  source: Card;
  description: string;
}>
```

### mergeSlotResults(results: SlotResult[]): SlotResult | null

Merges multiple slot results into a single cumulative result.

**Strategy:**
- Sums: extraDraw, handSize, bonuses, instant rewards
- Multiplies: scoreMultiplier
- Maximum: penalties
- Any jackpot makes merged result jackpot

**Returns:** Merged result or null if empty array

## Examples

### Example 1: Single Slot Trigger

```typescript
const luckySevenCard = {
  id: 'slot_seven',
  rank: '7',
  suit: 'hearts',
  triggerSlot: true
};

// Player plays card
store.selectCard(luckySevenCard.id);
store.playHand();

// Result:
// - triggeredSlotResults.length === 1
// - slotResult contains merged effects
```

### Example 2: Multiple Triggers

```typescript
const luckySevenCard1 = { /* ... triggerSlot: true */ };
const luckySevenCard2 = { /* ... triggerSlot: true */ };
const gamblerKingCard = { /* ... triggerRoulette: true */ };

store.selectCard(luckySevenCard1.id);
store.selectCard(luckySevenCard2.id);
store.selectCard(gamblerKingCard.id);
store.playHand();

// Result:
// - triggeredSlotResults.length === 2
// - rouletteSpinsGranted === 1
// - slotResult has 3x merged effects (main + 2 triggered)
```

### Example 3: Dual Trigger Card

```typescript
const dualTriggerCard = {
  id: 'dual_trigger',
  rank: 'A',
  suit: 'spades',
  triggerSlot: true,
  triggerRoulette: true
};

store.selectCard(dualTriggerCard.id);
store.playHand();

// Result:
// - triggeredSlotResults.length === 1 (slot triggered)
// - rouletteSpinsGranted === 1 (roulette triggered)
```

## Performance Considerations

- **Trigger Detection**: O(n) where n = number of selected cards (max 5)
- **Slot Execution**: Each trigger causes one `spin()` call
- **Merging**: O(m) where m = number of slot results (typically 1-3)
- **Memory**: Triggered results stored until turn reset

Impact: Minimal - trigger system adds negligible overhead to game loop.

## Error Handling

All trigger operations are safe:
- Invalid cards ignored
- Empty arrays handled gracefully
- Null checks on all optional fields
- Type guards prevent invalid states

## Debugging

Enable debug logging:
```typescript
// In playHand()
console.log('Triggers detected:', {
  slotCount: countSlotTriggers(state.selectedCards),
  rouletteCount: countRouletteTriggers(state.selectedCards),
  triggeredResults: triggeredSlotResults
});
```

## Changelog

### v1.0.0 - Initial Implementation
- Added `triggerSlot` and `triggerRoulette` card properties
- Implemented trigger detection system
- Integrated with game store
- Added slot result merging
- Created comprehensive test suite (42 tests)
- Documented roulette grant tracking (implementation pending)
