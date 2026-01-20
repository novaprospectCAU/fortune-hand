# Fortune's Hand - 데이터 스키마

모든 게임 데이터는 `src/data/` 폴더에 JSON으로 관리됩니다.

## 파일 구조

```
src/data/
├── cards.json          # 특수 카드 정의
├── jokers.json         # 조커 정의
├── symbols.json        # 슬롯 심볼 정의
├── balance.json        # 밸런스 수치 (확률, 가격 등)
├── rounds.json         # 라운드별 설정
└── constants.ts        # 상수 (타입 안전)
```

## cards.json

표준 52장 덱은 코드로 생성. 이 파일은 **특수 카드**만 정의.

```json
{
  "specialCards": [
    {
      "id": "wild_joker",
      "name": "Wild Joker",
      "description": "Can be any rank or suit",
      "isWild": true,
      "rarity": "rare",
      "shopCost": 50
    },
    {
      "id": "gold_ace",
      "name": "Golden Ace",
      "description": "Scores as Ace but gives +10 gold instead of chips",
      "baseRank": "A",
      "baseSuit": "spades",
      "isGold": true,
      "goldValue": 10,
      "rarity": "uncommon",
      "shopCost": 30
    },
    {
      "id": "slot_seven",
      "name": "Lucky Seven",
      "description": "Triggers a mini slot spin when played",
      "baseRank": "7",
      "baseSuit": "hearts",
      "triggerSlot": true,
      "rarity": "rare",
      "shopCost": 40
    },
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
  ],
  
  "enhancements": [
    {
      "id": "bonus",
      "name": "Bonus",
      "description": "+30 Chips",
      "type": "chips",
      "value": 30
    },
    {
      "id": "mult",
      "name": "Mult",
      "description": "+4 Mult",
      "type": "mult",
      "value": 4
    },
    {
      "id": "gold_seal",
      "name": "Gold Seal",
      "description": "+3 Gold when scored",
      "type": "gold",
      "value": 3
    },
    {
      "id": "red_seal",
      "name": "Red Seal",
      "description": "Retrigger this card",
      "type": "retrigger",
      "value": 1
    }
  ]
}
```

## jokers.json

```json
{
  "jokers": [
    {
      "id": "lucky_seven",
      "name": "Lucky Seven",
      "description": "+77 Mult if hand contains a 7",
      "rarity": "common",
      "cost": 40,
      "trigger": {
        "type": "on_play",
        "cardCondition": { "rank": "7" }
      },
      "effect": {
        "type": "add_mult",
        "value": 77
      }
    },
    {
      "id": "slot_master",
      "name": "Slot Master",
      "description": "Skull symbols become Wild",
      "rarity": "uncommon",
      "cost": 60,
      "trigger": {
        "type": "on_slot"
      },
      "effect": {
        "type": "modify_slot",
        "modification": {
          "symbolWeights": { "skull": 0, "wild": 15 }
        }
      }
    },
    {
      "id": "high_roller",
      "name": "High Roller",
      "description": "Roulette max multiplier +2x",
      "rarity": "rare",
      "cost": 80,
      "trigger": {
        "type": "on_roulette"
      },
      "effect": {
        "type": "modify_roulette",
        "modification": {
          "maxMultiplier": 2
        }
      }
    },
    {
      "id": "greedy_joker",
      "name": "Greedy Joker",
      "description": "+4 Mult for each Gold card in hand",
      "rarity": "common",
      "cost": 35,
      "trigger": {
        "type": "on_score"
      },
      "effect": {
        "type": "add_mult",
        "value": 4,
        "perCard": { "isGold": true }
      }
    },
    {
      "id": "retrigger_master",
      "name": "Echo",
      "description": "All played cards trigger twice",
      "rarity": "legendary",
      "cost": 150,
      "trigger": {
        "type": "on_play"
      },
      "effect": {
        "type": "retrigger",
        "count": 1
      }
    }
  ]
}
```

## symbols.json

```json
{
  "symbols": [
    {
      "id": "card",
      "emoji": "🃏",
      "name": "Card",
      "description": "Card bonuses",
      "weight": 25
    },
    {
      "id": "target",
      "emoji": "🎯",
      "name": "Target",
      "description": "Roulette bonuses",
      "weight": 20
    },
    {
      "id": "gold",
      "emoji": "💰",
      "name": "Gold",
      "description": "Instant gold",
      "weight": 20
    },
    {
      "id": "chip",
      "emoji": "🎰",
      "name": "Chip",
      "description": "Instant chips bonus",
      "weight": 15
    },
    {
      "id": "star",
      "emoji": "⭐",
      "name": "Star",
      "description": "Jackpot!",
      "weight": 5
    },
    {
      "id": "skull",
      "emoji": "💀",
      "name": "Skull",
      "description": "Penalty",
      "weight": 10
    },
    {
      "id": "wild",
      "emoji": "🌟",
      "name": "Wild",
      "description": "Matches any symbol",
      "weight": 5
    }
  ],
  
  "combinations": {
    "🃏🃏🃏": {
      "name": "Card Bonus",
      "effects": {
        "cardBonus": { "extraDraw": 2, "handSize": 0, "scoreMultiplier": 1 }
      }
    },
    "🎯🎯🎯": {
      "name": "Target Bonus",
      "effects": {
        "rouletteBonus": { "safeZoneBonus": 20, "maxMultiplier": 1, "freeSpins": 0 }
      }
    },
    "💰💰💰": {
      "name": "Gold Rush",
      "effects": {
        "instant": { "gold": 25, "chips": 0 }
      }
    },
    "⭐⭐⭐": {
      "name": "JACKPOT",
      "isJackpot": true,
      "effects": {
        "cardBonus": { "extraDraw": 3, "handSize": 1, "scoreMultiplier": 2 },
        "rouletteBonus": { "safeZoneBonus": 30, "maxMultiplier": 2, "freeSpins": 1 },
        "instant": { "gold": 50, "chips": 100 }
      }
    },
    "💀💀💀": {
      "name": "Triple Skull",
      "effects": {
        "penalty": { "discardCards": 2, "skipRoulette": true, "loseGold": 10 }
      }
    }
  }
}
```

## balance.json

```json
{
  "game": {
    "startingGold": 100,
    "startingHands": 4,
    "startingDiscards": 3,
    "handSize": 8,
    "maxSelectCards": 5,
    "maxJokers": 5
  },
  
  "scoring": {
    "goldPerScore": 0.01,
    "minGoldPerRound": 5,
    "maxGoldPerRound": 50
  },
  
  "roulette": {
    "defaultSegments": [
      { "multiplier": 0, "probability": 20, "color": "#ff4444" },
      { "multiplier": 1, "probability": 30, "color": "#888888" },
      { "multiplier": 2, "probability": 25, "color": "#44ff44" },
      { "multiplier": 3, "probability": 15, "color": "#4444ff" },
      { "multiplier": 5, "probability": 8, "color": "#ffff44" },
      { "multiplier": 10, "probability": 2, "color": "#ff44ff" }
    ],
    "spinDuration": 3000
  },
  
  "shop": {
    "itemCount": 4,
    "rerollBaseCost": 5,
    "rerollCostIncrease": 2,
    "jokerAppearRate": 0.4,
    "cardAppearRate": 0.3,
    "packAppearRate": 0.2,
    "voucherAppearRate": 0.1
  },
  
  "rarityWeights": {
    "common": 60,
    "uncommon": 25,
    "rare": 12,
    "legendary": 3
  }
}
```

## rounds.json

```json
{
  "rounds": [
    { "round": 1, "targetScore": 300, "handsBonus": 0, "discardsBonus": 0 },
    { "round": 2, "targetScore": 800, "handsBonus": 0, "discardsBonus": 0 },
    { "round": 3, "targetScore": 2000, "handsBonus": 0, "discardsBonus": 1 },
    { "round": 4, "targetScore": 5000, "handsBonus": 1, "discardsBonus": 0 },
    { "round": 5, "targetScore": 11000, "handsBonus": 0, "discardsBonus": 0 },
    { "round": 6, "targetScore": 20000, "handsBonus": 0, "discardsBonus": 1 },
    { "round": 7, "targetScore": 35000, "handsBonus": 1, "discardsBonus": 0 },
    { "round": 8, "targetScore": 50000, "handsBonus": 0, "discardsBonus": 0 }
  ],
  "endlessScoreIncrement": 25000
}
```

## constants.ts

```typescript
// 타입 안전한 상수
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;

export const HAND_RANKINGS = {
  high_card: 0,
  pair: 1,
  two_pair: 2,
  three_of_a_kind: 3,
  straight: 4,
  flush: 5,
  full_house: 6,
  four_of_a_kind: 7,
  straight_flush: 8,
  royal_flush: 9,
} as const;

export const BASE_HAND_VALUES = {
  high_card: { chips: 5, mult: 1 },
  pair: { chips: 10, mult: 2 },
  two_pair: { chips: 20, mult: 2 },
  three_of_a_kind: { chips: 30, mult: 3 },
  straight: { chips: 30, mult: 4 },
  flush: { chips: 35, mult: 4 },
  full_house: { chips: 40, mult: 4 },
  four_of_a_kind: { chips: 60, mult: 7 },
  straight_flush: { chips: 100, mult: 8 },
  royal_flush: { chips: 100, mult: 8 },
} as const;

export const CARD_CHIP_VALUES: Record<string, number> = {
  'A': 11, '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 10, 'Q': 10, 'K': 10,
};
```
