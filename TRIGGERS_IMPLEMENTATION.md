# Special Card Triggers - Implementation Summary

## What Was Implemented

A complete system for special cards to trigger additional effects when played:

1. **Slot Triggers** (`triggerSlot: true`)
   - Cards that trigger mini slot spins when played
   - Example: Lucky Seven (7♥)
   - Effect: Executes additional slot spin, merges results with main slot

2. **Roulette Triggers** (`triggerRoulette: true`)
   - Cards that grant extra roulette spin opportunities
   - Example: Gambler's King (K♦)
   - Effect: Increments roulette spins available (tracked for future use)

## Files Created

### Core Implementation
- `/src/modules/cards/triggers.ts` - Trigger detection and merging logic
- `/src/modules/cards/triggers.test.ts` - 32 unit tests
- `/src/modules/core/triggers-integration.test.ts` - 10 integration tests

### Documentation
- `/docs/special-card-triggers.md` - Complete system documentation

### Modified Files
- `/src/types/interfaces.ts` - Added trigger state fields
- `/src/modules/cards/index.ts` - Export trigger functions
- `/src/modules/core/store.ts` - Integrated triggers into playHand()
- `/src/modules/core/moduleIntegration.ts` - Re-export trigger utilities
- `/src/modules/core/gameLoop.test.ts` - Updated mock state

## Key Features

### Trigger Detection
```typescript
detectTriggers(cards: Card[]): TriggerResult
countSlotTriggers(cards: Card[]): number
countRouletteTriggers(cards: Card[]): number
```

### Slot Result Merging
```typescript
mergeSlotResults(results: SlotResult[]): SlotResult | null
```

Merge strategy:
- **Jackpot**: Any jackpot = merged jackpot
- **Bonuses**: Sum extra draws, multiply score multipliers
- **Penalties**: Take maximum penalty

### Game State
```typescript
interface GameState {
  triggeredSlotResults: SlotResult[];  // Mini slot results
  rouletteSpinsGranted: number;        // Extra spins granted
}
```

## How It Works

### During PLAY_PHASE (when playHand() is called):

1. **Detect Triggers**
   ```typescript
   const slotTriggerCount = countSlotTriggers(selectedCards);
   const rouletteTriggerCount = countRouletteTriggers(selectedCards);
   ```

2. **Execute Slot Triggers**
   - For each slot trigger: execute `spin()`
   - Store results in `triggeredSlotResults[]`
   - Emit `SLOT_SPIN` events

3. **Merge Results**
   - Merge main slot + triggered slots using `mergeSlotResults()`
   - Update `slotResult` with cumulative effects

4. **Track Roulette Grants**
   - Set `rouletteSpinsGranted = count`
   - (Future: Allow multiple roulette spins)

### Example Flow

```
Player plays: Lucky Seven (7♥) + Gambler's King (K♦) + Five (5♣)

Detection:
  ✓ 1 slot trigger (Lucky Seven)
  ✓ 1 roulette trigger (Gambler's King)

Execution:
  → Execute mini slot spin (Lucky Seven)
  → Result: [🎯 🎯 🎯] = +20 safe zone bonus

Merging:
  Main slot:     [💰 💰 💰] = +25 gold
  Triggered:     [🎯 🎯 🎯] = +20 safe zone
  Merged effect: +25 gold, +20 safe zone bonus

State:
  ✓ triggeredSlotResults = [miniSlotResult]
  ✓ rouletteSpinsGranted = 1
  ✓ slotResult = merged effects
```

## Test Coverage

### Unit Tests (32 tests) - `triggers.test.ts`
- ✓ Trigger detection (all combinations)
- ✓ Effect generation
- ✓ Counting functions
- ✓ Type checking (slot/roulette)
- ✓ Slot result merging
  - Empty array handling
  - Single result pass-through
  - Multiple result merging
  - Jackpot propagation
  - All bonus types
  - Penalty handling

### Integration Tests (10 tests) - `triggers-integration.test.ts`
- ✓ Slot trigger in game store
- ✓ Multiple slot triggers
- ✓ Roulette trigger in game store
- ✓ Multiple roulette triggers
- ✓ Combined triggers (both types)
- ✓ Mixed card hands
- ✓ State cleanup (turn reset)
- ✓ State cleanup (round reset)

### Total: 42 tests, all passing ✓

## Running Tests

```bash
# All tests
npm test

# Trigger tests only
npm test -- triggers

# Type checking
npm run typecheck
```

## Special Cards Using Triggers

From `/src/data/cards.json`:

### Lucky Seven
```json
{
  "id": "slot_seven",
  "name": "Lucky Seven",
  "triggerSlot": true,
  "baseRank": "7",
  "baseSuit": "hearts"
}
```

### Gambler's King
```json
{
  "id": "roulette_king",
  "name": "Gambler's King",
  "triggerRoulette": true,
  "baseRank": "K",
  "baseSuit": "diamonds"
}
```

## Future Work (TODO)

### Multiple Roulette Spins
Currently tracked but not implemented:
- UI for multiple spins
- Logic to execute multiple spins
- Strategy for handling multiple results

See `store.ts` line ~595 for TODO comment.

### Potential Enhancements
- Conditional triggers (based on hand type, suit, etc.)
- Trigger chains (one trigger activates another)
- Diminishing returns for stacking
- Combo bonuses for specific trigger combinations

## Architecture Principles Followed

✓ **Module Isolation**: Trigger logic in cards module, integration in core
✓ **Type Safety**: All TypeScript, no any types
✓ **Testing**: 42 comprehensive tests
✓ **Immutability**: No direct state mutation
✓ **Event System**: Emits SLOT_SPIN events for mini slots
✓ **Documentation**: Complete inline docs + external documentation

## Performance

- Trigger detection: O(n) for n selected cards (max 5)
- Slot execution: O(m) for m triggers (typically 1-2)
- Merging: O(k) for k slot results (typically 2-3)
- **Impact**: Negligible, <1ms per hand

## Breaking Changes

None. This is a new feature that extends existing Card interface with optional properties.

Backwards compatible:
- Cards without triggers work exactly as before
- Default values: `triggerSlot: false`, `triggerRoulette: false`
- No changes to existing game flow

## Version

Implementation Version: 1.0.0
Game Version Compatibility: v0.1.0+

## Questions?

See `/docs/special-card-triggers.md` for full documentation.
