# Pack System Integration Guide

## Overview

The pack system allows players to purchase card packs from the shop that contain random cards, including special cards. When a pack is purchased, it is automatically opened and the cards are returned in the transaction.

## Pack Types

### Standard Pack
- **Cost**: 30 gold
- **Cards**: 3 random cards
- **Special Card Weight**: 20%
- **Rarity**: Common
- **Description**: Basic pack with a small chance of special cards

### Jumbo Pack
- **Cost**: 50 gold
- **Cards**: 5 random cards
- **Special Card Weight**: 25%
- **Rarity**: Uncommon
- **Description**: More cards with slightly better odds

### Mega Pack
- **Cost**: 70 gold
- **Cards**: 5 random cards
- **Special Card Weight**: 40%
- **Rarity**: Rare
- **Description**: Higher chance of special cards

### Arcana Pack
- **Cost**: 80 gold
- **Cards**: 3 cards
- **Special Card Weight**: 50%
- **Guaranteed**: 1 rare special card
- **Rarity**: Rare
- **Description**: Guaranteed special card included

### Celestial Pack
- **Cost**: 120 gold
- **Cards**: 4 cards
- **Special Card Weight**: 75%
- **Guaranteed**: 1 legendary special card
- **Rarity**: Legendary
- **Description**: Premium pack with guaranteed legendary

## Usage

### Opening a Pack Directly

```typescript
import { openPack } from '@/modules/shop';

// Open a standard pack
const result = openPack('standard_pack');

if (result) {
  console.log(`Opened ${result.packId}`);
  console.log(`Received ${result.cards.length} cards`);
  console.log(`Has special cards: ${result.hasSpecialCards}`);

  // Add cards to player's deck
  result.cards.forEach(card => {
    // Add to deck logic here
  });
}
```

### Buying a Pack from Shop

```typescript
import { buyItem } from '@/modules/shop';

// Shop state with a pack item
const shopState = {
  items: [
    {
      id: 'shop_pack_1',
      type: 'pack',
      itemId: 'standard_pack',
      cost: 30,
      sold: false,
    }
  ],
  rerollCost: 5,
  rerollsUsed: 0,
};

// Buy the pack
const transaction = buyItem(shopState, 'shop_pack_1', 100);

if (transaction.success) {
  console.log(`Gold remaining: ${transaction.newGold}`);

  // Pack is automatically opened
  if (transaction.packCards) {
    console.log(`Received ${transaction.packCards.length} cards!`);

    // Add cards to player's deck
    transaction.packCards.forEach(card => {
      // Add to deck logic here
    });
  }
}
```

### Integration with Core Module

```typescript
import { useGameStore } from '@/modules/core/store';
import { buyItem, markItemAsSold } from '@/modules/shop';
import { addToDeck } from '@/modules/cards';

function handleBuyItem(itemId: string) {
  const state = useGameStore.getState();

  // Attempt purchase
  const transaction = buyItem(
    state.shopState,
    itemId,
    state.gold
  );

  if (!transaction.success) {
    console.error(transaction.error);
    return;
  }

  // Update gold
  useGameStore.setState({ gold: transaction.newGold });

  // Mark item as sold
  const newShopState = markItemAsSold(state.shopState, itemId);
  useGameStore.setState({ shopState: newShopState });

  // Handle different item types
  if (transaction.item?.type === 'pack' && transaction.packCards) {
    // Add pack cards to deck
    const newDeck = addToDeck(state.deck, transaction.packCards);
    useGameStore.setState({ deck: newDeck });

    // Show pack opening animation/notification
    console.log(`Opened pack and received ${transaction.packCards.length} cards!`);
  } else if (transaction.item?.type === 'joker') {
    // Add joker to collection
    // ... joker logic
  } else if (transaction.item?.type === 'card') {
    // Add special card to deck
    // ... card logic
  }
}
```

## Pack Generation in Shop

Packs are automatically included in shop generation based on the configuration in `balance.json`:

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

This means packs have a 20% chance of appearing in each shop slot.

### Rarity-Based Pack Selection

When a pack slot is generated, the pack rarity is selected using the standard rarity weights:

```json
{
  "rarityWeights": {
    "common": 60,
    "uncommon": 25,
    "rare": 12,
    "legendary": 3
  }
}
```

The system then selects a random pack of that rarity.

## Pack Pricing

Pack prices scale with round number:

```typescript
import { calculatePriceWithRoundScaling } from '@/modules/shop';

// Standard pack base cost: 30
// Round 1: 30 gold
// Round 3: ~36 gold
// Round 5: ~42 gold
```

## Utility Functions

### Get Pack Information

```typescript
import {
  getPackById,
  getPackName,
  getPackDescription,
  getPackRarity,
  calculatePackValue
} from '@/modules/shop';

const pack = getPackById('standard_pack');
console.log(pack?.name); // "Standard Pack"
console.log(pack?.cardCount); // 3

const name = getPackName('standard_pack'); // "Standard Pack"
const description = getPackDescription('standard_pack');
const rarity = getPackRarity('standard_pack'); // "common"
const value = calculatePackValue('standard_pack'); // Expected value
```

### Filter Packs

```typescript
import { getPacksByRarity, getAllPacks } from '@/modules/shop';

const commonPacks = getPacksByRarity('common');
const allPacks = getAllPacks();
```

## Special Card Distribution

When a pack generates a special card, it uses the rarity weights to determine which special card to give:

1. Select rarity using `rarityWeights`
2. Filter special cards by that rarity
3. Randomly select one from the filtered list
4. Create a unique instance with a new ID

## Testing

### Unit Tests

```typescript
import { openPack } from '@/modules/shop';

test('standard pack returns 3 cards', () => {
  const result = openPack('standard_pack');
  expect(result?.cards.length).toBe(3);
});
```

### Integration Tests

```typescript
import { buyItem } from '@/modules/shop';

test('buying pack returns cards', () => {
  const shop = {
    items: [{
      id: 'pack1',
      type: 'pack',
      itemId: 'standard_pack',
      cost: 30,
      sold: false
    }],
    rerollCost: 5,
    rerollsUsed: 0,
  };

  const result = buyItem(shop, 'pack1', 100);

  expect(result.success).toBe(true);
  expect(result.packCards).toBeDefined();
  expect(result.packCards?.length).toBe(3);
});
```

## Card Uniqueness

Each card in a pack has a unique ID to prevent conflicts:

```typescript
const result = openPack('standard_pack');

// Each card has unique ID
result?.cards.forEach(card => {
  console.log(card.id);
  // Examples:
  // "wild_joker_1737489123456_abc123"
  // "A_hearts" (standard card)
  // "gold_ace_1737489123457_def456"
});
```

## Error Handling

```typescript
// Invalid pack ID
const result = openPack('invalid_pack');
console.log(result); // null

// Shop item with invalid pack
const transaction = buyItem(shop, itemId, gold);
if (transaction.success && !transaction.packCards) {
  // Pack opening failed, but transaction succeeded
  console.log('Pack could not be opened');
}
```

## Best Practices

1. **Always check transaction success** before processing pack cards
2. **Handle null/undefined** pack results gracefully
3. **Show visual feedback** when pack is opened
4. **Animate card reveals** for better UX
5. **Update deck state** atomically after receiving all cards
6. **Log pack contents** for debugging and player history

## Future Enhancements

Potential future features:

- **Pack boosters**: Temporary modifiers that affect pack contents
- **Pack crafting**: Combine items to create custom packs
- **Pack history**: Track what was received from each pack
- **Pack animations**: Visual opening sequence
- **Pack achievements**: Special unlocks for pack-related milestones
