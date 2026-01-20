# Shop 모듈

상점 및 경제 시스템 담당

## 책임

- 상점 아이템 생성 (라운드/운 기반)
- 구매/리롤 로직
- 가격 책정
- 상점 UI

## 절대 하지 않는 것

- 골드 직접 수정 (Transaction 반환)
- 덱/조커 직접 수정 (아이템 정보만 반환)
- 게임 로직

## 주요 파일

```
src/modules/shop/
├── shopGenerator.ts   # 상점 아이템 생성
├── transactions.ts    # 구매/리롤 처리
├── pricing.ts         # 가격 계산
├── components/
│   ├── Shop.tsx
│   ├── ShopItem.tsx
│   └── RerollButton.tsx
└── index.ts
```

## 핵심 함수

```typescript
// shopGenerator.ts
export function generateShop(round: number, luck: number): ShopState {
  // 1. 아이템 개수 결정 (기본 4개)
  // 2. 각 슬롯에 타입 결정 (joker/card/pack/voucher)
  // 3. 타입별 아이템 선택 (희귀도 가중치)
  // 4. 가격 책정
  // 5. ShopState 반환
}

// transactions.ts
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
    newGold: playerGold - item.cost,
  };
}

export function reroll(
  shopState: ShopState,
  playerGold: number
): { shop: ShopState; cost: number } | { error: string } {
  const cost = shopState.rerollCost + (shopState.rerollsUsed * REROLL_COST_INCREASE);
  
  if (playerGold < cost) return { error: 'Not enough gold' };
  
  // 새 아이템 생성 (sold 아이템 제외)
  // rerollsUsed 증가
}
```

## 아이템 타입별 등장 확률

`balance.json`에서 로드:

```
| 타입 | 확률 |
|------|------|
| joker | 40% |
| card | 30% |
| pack | 20% |
| voucher | 10% |
```

## 희귀도별 가중치

```
| 희귀도 | 가중치 | 가격 배수 |
|--------|--------|----------|
| common | 60 | 1x |
| uncommon | 25 | 1.5x |
| rare | 12 | 2.5x |
| legendary | 3 | 5x |
```

## 라운드 스케일링

```typescript
// 라운드가 올라갈수록:
// - 희귀 아이템 등장 확률 증가
// - 기본 가격 약간 증가
// - 강력한 아이템 풀 해금
```

## UI 컴포넌트

```tsx
// Shop.tsx
interface ShopProps {
  shopState: ShopState;
  playerGold: number;
  onBuy: (itemId: string) => void;
  onReroll: () => void;
  onLeave: () => void;
}

// ShopItem.tsx
interface ShopItemProps {
  item: ShopItem;
  canAfford: boolean;
  onBuy: () => void;
}
```

## 아이템 미리보기

- 조커: 효과 설명, 트리거 조건
- 카드: 카드 이미지, 특수 효과
- 팩: 포함 가능 아이템 종류
- 바우처: 영구 버프 설명

## 테스트

```bash
pnpm test src/modules/shop
```

- 아이템 생성 분포 테스트
- 구매 로직 (골드 부족, 이미 판매됨 등)
- 리롤 비용 증가 테스트
- 희귀도 분포 테스트
