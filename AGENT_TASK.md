# Agent 7: Shop Module 작업 지시서

## 역할
상점 및 경제 시스템 담당

## 브랜치
- 작업 브랜치: `feature/shop-module`
- 머지 대상: `develop`

## M1 작업 목록 (기초 구조)

M1에서는 상점 시스템의 기초 구조만 구현합니다.
본격적인 상점 기능은 M2에서 구현합니다.

### 1단계: 가격 책정
- [ ] `src/modules/shop/pricing.ts`
  ```typescript
  // 희귀도별 기본 가격
  const BASE_PRICES = {
    common: 40,
    uncommon: 60,
    rare: 100,
    legendary: 200
  };

  // 희귀도별 가격 배수
  const RARITY_MULTIPLIERS = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    legendary: 5
  };

  export function calculatePrice(basePrice: number, rarity: string): number
  ```

### 2단계: 거래 로직
- [ ] `src/modules/shop/transactions.ts`
  ```typescript
  export function buyItem(
    shopState: ShopState,
    itemId: string,
    playerGold: number
  ): Transaction {
    const item = shopState.items.find(i => i.id === itemId);

    if (!item) return { success: false, error: 'Item not found', newGold: playerGold };
    if (item.sold) return { success: false, error: 'Already sold', newGold: playerGold };
    if (playerGold < item.cost) return { success: false, error: 'Not enough gold', newGold: playerGold };

    return {
      success: true,
      item,
      newGold: playerGold - item.cost
    };
  }

  export function reroll(
    shopState: ShopState,
    playerGold: number,
    round: number,
    luck: number
  ): { shop: ShopState; cost: number } | { error: string } {
    const cost = shopState.rerollCost + (shopState.rerollsUsed * REROLL_COST_INCREASE);

    if (playerGold < cost) return { error: 'Not enough gold' };

    const newShop = generateShop(round, luck);
    return {
      shop: {
        ...newShop,
        rerollCost: shopState.rerollCost,
        rerollsUsed: shopState.rerollsUsed + 1
      },
      cost
    };
  }
  ```

### 3단계: 상점 생성
- [ ] `src/modules/shop/shopGenerator.ts`
  ```typescript
  export function generateShop(round: number, luck: number): ShopState {
    const items: ShopItem[] = [];
    const itemCount = 4; // balance.json에서

    for (let i = 0; i < itemCount; i++) {
      const type = selectItemType(); // joker/card/pack/voucher
      const item = generateItem(type, round, luck);
      items.push(item);
    }

    return {
      items,
      rerollCost: 5, // balance.json에서
      rerollsUsed: 0
    };
  }

  function selectItemType(): ShopItem['type'] {
    // balance.json의 확률에 따라 선택
    // joker: 40%, card: 30%, pack: 20%, voucher: 10%
  }

  function generateItem(type: ShopItem['type'], round: number, luck: number): ShopItem
  ```

### 4단계: 기본 UI
- [ ] `src/modules/shop/components/ShopItem.tsx`
  ```tsx
  interface ShopItemProps {
    item: ShopItem;
    canAfford: boolean;
    onBuy: () => void;
  }
  ```
- [ ] `src/modules/shop/components/RerollButton.tsx`
  ```tsx
  interface RerollButtonProps {
    cost: number;
    canAfford: boolean;
    onClick: () => void;
  }
  ```
- [ ] `src/modules/shop/components/Shop.tsx`
  ```tsx
  interface ShopProps {
    shopState: ShopState;
    playerGold: number;
    onBuy: (itemId: string) => void;
    onReroll: () => void;
    onLeave: () => void;
  }
  ```

### 5단계: Export
- [ ] `src/modules/shop/index.ts`

## 아이템 타입별 등장 확률 (balance.json)
| 타입 | 확률 |
|------|------|
| joker | 40% |
| card | 30% |
| pack | 20% |
| voucher | 10% |

## 희귀도별 가중치 (balance.json)
| 희귀도 | 가중치 |
|--------|--------|
| common | 60 |
| uncommon | 25 |
| rare | 12 |
| legendary | 3 |

## 테스트 요구사항
```bash
npm test src/modules/shop
```
- 아이템 생성 분포 테스트
- 구매 로직 (골드 부족, 이미 판매됨 등)
- 리롤 비용 증가 테스트
- 희귀도 분포 테스트

## 작업 완료 후
```bash
git add .
git commit -m "feat(shop): implement shop generation and transaction system

- Add pricing calculation
- Implement buy and reroll transactions
- Create shop generation with item type distribution
- Add basic Shop UI components

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin feature/shop-module
```

## 참조 문서
- `src/modules/shop/CLAUDE.md`
- `specs/interfaces.ts`
- `src/data/balance.json`
