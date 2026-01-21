# Card Pack System Implementation

## Overview

A complete card pack system has been implemented for Fortune's Hand. Players can now purchase packs from the shop that contain random cards, including special cards with unique abilities.

## Files Created

### Data Files
- `/src/data/packs.json` - Pack definitions with 5 pack types

### Logic Files
- `/src/modules/shop/packs.ts` - Core pack opening logic
- `/src/modules/shop/packs.test.ts` - Comprehensive pack system tests (28 tests)
- `/src/modules/shop/transactions-pack.test.ts` - Pack transaction integration tests (14 tests)

### UI Files
- `/src/modules/shop/components/PackDisplay.tsx` - Pack display component with styling guide

### Documentation
- `/src/modules/shop/PACK_INTEGRATION.md` - Complete integration guide and examples

### Modified Files
- `/src/modules/shop/shopGenerator.ts` - Updated to use real pack data
- `/src/modules/shop/transactions.ts` - Added pack opening on purchase
- `/src/modules/shop/index.ts` - Export pack functions and types
- `/src/modules/shop/components/index.ts` - Export PackDisplay component
- `/src/types/interfaces.ts` - Added packCards to Transaction interface

## Pack Types

### 1. Standard Pack
- **Cost**: 30 gold
- **Cards**: 3
- **Special Chance**: 20%
- **Rarity**: Common

### 2. Jumbo Pack
- **Cost**: 50 gold
- **Cards**: 5
- **Special Chance**: 25%
- **Rarity**: Uncommon

### 3. Mega Pack
- **Cost**: 70 gold
- **Cards**: 5
- **Special Chance**: 40%
- **Rarity**: Rare

### 4. Arcana Pack
- **Cost**: 80 gold
- **Cards**: 3
- **Special Chance**: 50%
- **Guaranteed**: 1 rare special card
- **Rarity**: Rare

### 5. Celestial Pack
- **Cost**: 120 gold
- **Cards**: 4
- **Special Chance**: 75%
- **Guaranteed**: 1 legendary special card
- **Rarity**: Legendary

## Key Features

### 1. Automatic Pack Opening
When a pack is purchased from the shop, it is automatically opened and cards are included in the transaction:

```typescript
const transaction = buyItem(shopState, itemId, playerGold);
if (transaction.success && transaction.packCards) {
  // Cards ready to add to deck
  transaction.packCards.forEach(card => {
    addToDeck(deck, card);
  });
}
```

### 2. Rarity-Based Generation
- Packs are assigned rarities (common, uncommon, rare, legendary)
- Shop generation uses rarity weights to determine which packs appear
- Higher rarity packs have better special card chances

### 3. Special Card Weighting
- Each pack type has a `specialCardWeight` (0-1)
- Higher weight = more likely to contain special cards
- Special cards are selected using the same rarity system

### 4. Guaranteed Special Cards
- Some packs (Arcana, Celestial) guarantee special cards
- Guaranteed cards are selected from specific rarity tiers
- Ensures value proposition for premium packs

### 5. Unique Card IDs
- Each card from a pack gets a unique instance ID
- Prevents conflicts when adding to deck
- Format: `{card_id}_{timestamp}_{random}`

## Integration Points

### Shop Generation
Packs automatically appear in shops based on the 20% pack weight in `balance.json`:

```json
{
  "shop": {
    "itemTypeWeights": {
      "joker": 40,
      "card": 30,
      "pack": 20,
      "voucher": 10
    }
  }
}
```

### Transaction System
The transaction system was extended to support pack opening:

```typescript
export interface ExtendedTransaction extends Transaction {
  packCards?: Card[]; // Cards from opened pack
}
```

### Price Scaling
Pack prices scale with round number using the existing pricing system:
- Base prices defined in pack data
- Round scaling applied automatically
- Rarity multipliers affect final cost

## Testing

### Test Coverage
- **126 total tests** in shop module
- **28 pack-specific tests** covering:
  - Data loading
  - Structure validation
  - Pack opening mechanics
  - Card generation
  - Value calculation
  - Utility functions
  - Edge cases
- **14 integration tests** for pack transactions

### Test Results
```
✓ src/modules/shop/packs.test.ts (28 tests)
✓ src/modules/shop/transactions-pack.test.ts (14 tests)
All tests passing
```

## Usage Examples

### Basic Pack Opening
```typescript
import { openPack } from '@/modules/shop';

const result = openPack('standard_pack');
console.log(`Received ${result?.cards.length} cards`);
```

### Purchase from Shop
```typescript
import { buyItem } from '@/modules/shop';

const transaction = buyItem(shopState, 'pack_item_id', 100);
if (transaction.success && transaction.packCards) {
  // Add cards to player deck
}
```

### Display in UI
```typescript
import { PackDisplay } from '@/modules/shop';

<PackDisplay
  packId="standard_pack"
  cost={30}
  canAfford={playerGold >= 30}
  onBuy={handleBuyPack}
/>
```

## Architecture Compliance

### Module Boundaries
✅ Shop module does NOT:
- Directly modify game state
- Manage deck state
- Handle card logic

✅ Shop module DOES:
- Generate pack items
- Open packs when purchased
- Return cards in transaction
- Calculate costs and probabilities

### Data Flow
1. Shop generates pack items using pack data
2. Player purchases pack
3. Transaction includes opened pack cards
4. Core module adds cards to deck
5. UI updates to show new cards

## Balance Considerations

### Expected Value
- Standard Pack: ~17 gold value (3 cards × ~5 base + 20% special bonus)
- Jumbo Pack: ~28 gold value (5 cards × ~5 base + 25% special bonus)
- Mega Pack: ~35 gold value (5 cards × ~5 base + 40% special bonus)
- Arcana Pack: ~45 gold value (guaranteed special)
- Celestial Pack: ~75 gold value (guaranteed legendary)

### Probability Distribution
- Common packs: 60% appearance rate
- Uncommon packs: 25% appearance rate
- Rare packs: 12% appearance rate
- Legendary packs: 3% appearance rate

## Future Enhancements

Potential additions:
1. **Pack Boosters** - Temporary modifiers affecting pack contents
2. **Pack Crafting** - Combine resources to create custom packs
3. **Pack History** - Track what was received from each pack
4. **Opening Animations** - Visual card reveal sequence
5. **Pack Achievements** - Special rewards for pack-related goals
6. **Limited Edition Packs** - Time-limited special packs
7. **Thematic Packs** - Packs focused on specific card types

## Notes for Integration

When integrating the pack system with the core game loop:

1. **Add Cards to Deck**: Use `addToDeck()` from cards module
2. **Update UI**: Show pack opening animation/notification
3. **Handle Special Cards**: Special cards may trigger additional effects
4. **Save State**: Persist new cards to game state
5. **Event Emission**: Emit `ITEM_BOUGHT` event with pack details

## Documentation

Comprehensive documentation available in:
- `/src/modules/shop/PACK_INTEGRATION.md` - Full integration guide
- Component inline documentation
- Test files with usage examples

## Test Command

```bash
npm test src/modules/shop
```

All 126 tests passing, including 42 tests specific to the pack system.
