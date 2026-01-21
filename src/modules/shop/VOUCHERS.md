# Voucher System

바우처는 영구적인 업그레이드를 제공하는 상점 아이템입니다. 한 번 구매하면 모든 라운드와 게임에 걸쳐 효과가 지속됩니다.

## 개요

- **위치**: `/src/modules/shop/vouchers.ts`
- **데이터**: `/src/data/vouchers.json`
- **타입**: `/src/types/interfaces.ts` (Voucher, VoucherEffect, VoucherModifiers)

## 바우처 타입

### 1. 플레이 자원 증가
- **Extra Hand** (common, 100골드): 라운드당 +1 Hand
- **Extra Discard** (common, 80골드): 라운드당 +1 Discard
- **Bigger Hands** (uncommon, 120골드): 핸드 크기 +1
- **Slot Master** (uncommon, 120골드): 턴당 +1 슬롯 스핀

### 2. 경제 부스트
- **Seed Money** (rare, 150골드): 라운드당 골드 이자 (10%, 최대 25)
- **Rich Start** (rare, 180골드): 라운드 시작 시 +50 골드
- **Clearance Sale** (common, 60골드): 리롤 비용 -2

### 3. 능력 확장
- **Joker's Gambit** (rare, 200골드): +1 조커 슬롯
- **Lucky Charm** (uncommon, 140골드): 상점 희귀 아이템 확률 증가 (+10 luck)

### 4. 콤보 바우처
- **Fortune's Blessing** (legendary, 300골드): +1 Hand, +1 Discard, +1 Hand size

## 작동 방식

### 구매
```typescript
// 상점에서 바우처 구매 시
buyItem(itemId: 'voucher_shop_item_id')
  → purchasedVouchers에 추가
  → 다음 라운드부터 효과 적용
```

### 효과 적용
```typescript
// 라운드 시작 시
calculateVoucherModifiers(purchasedVouchers)
  → VoucherModifiers 객체 반환
  → 각종 보너스를 게임 설정에 적용

// 예시
{
  handsBonus: 1,
  discardsBonus: 1,
  handSizeBonus: 1,
  maxJokersBonus: 0,
  slotSpinsBonus: 0,
  startingGoldBonus: 50,
  rerollDiscount: 2,
  luckBonus: 10,
  interestRate: 0.1,
  interestMax: 25
}
```

### 지속성
- `purchasedVouchers: string[]` - 게임 상태에 저장
- `startGame()` 시 보존됨
- 라운드 전환 시 보존됨
- 같은 바우처를 중복 구매하면 효과가 누적됨 (현재 구현)

## 핵심 함수

### vouchers.ts
```typescript
// 바우처 조회
getVoucherById(id: string): Voucher | undefined
getAllVouchers(): Voucher[]
getVouchersByRarity(rarity): Voucher[]

// 효과 계산
calculateVoucherModifiers(purchasedVoucherIds: string[]): VoucherModifiers
calculateInterest(currentGold: number, modifiers: VoucherModifiers): number
isVoucherPurchased(voucherId: string, purchasedVouchers: string[]): boolean
```

### 통합 (store.ts)
```typescript
// 게임 시작 시 바우처 적용
startGame() {
  const voucherMods = calculateVoucherModifiers(preservedVouchers);
  // handsRemaining, gold, maxJokers 등에 보너스 적용
}

// 라운드 시작 시 바우처 적용
leaveShop() {
  const voucherMods = calculateVoucherModifiers(state.purchasedVouchers);
  // 새 라운드에 보너스 적용 + 시작 골드 지급
}

// 라운드 종료 시 이자 계산
REWARD_PHASE {
  const interest = calculateInterest(state.gold, voucherMods);
  set({ gold: state.gold + interest });
}

// 리롤 시 할인 적용
rerollShop() {
  reroll(shopState, gold, round, luck, voucherMods.rerollDiscount);
}
```

## 테스트

### 단위 테스트 (vouchers.test.ts)
- 바우처 조회
- 효과 계산
- 이자 계산
- 스택킹
- 데이터 무결성

### 통합 테스트 (vouchers.integration.test.ts)
- 각 바우처 타입별 효과 검증
- 게임 루프와의 연동
- 여러 바우처 조합
- 라운드 간 지속성

```bash
# 테스트 실행
npm test src/modules/shop/vouchers.test.ts
npm test src/modules/core/vouchers.integration.test.ts
```

## 새 바우처 추가 방법

1. **vouchers.json에 데이터 추가**
```json
{
  "id": "new_voucher",
  "name": "New Voucher",
  "description": "Does something cool",
  "cost": 100,
  "rarity": "uncommon",
  "effect": {
    "type": "hands_bonus",  // 또는 새 타입
    "value": 1
  }
}
```

2. **새 효과 타입이 필요한 경우 interfaces.ts 업데이트**
```typescript
export type VoucherEffect =
  | ...기존 타입들
  | { type: 'new_effect_type'; value: number };

export interface VoucherModifiers {
  ...기존 필드들
  newEffectBonus: number;
}
```

3. **vouchers.ts의 applyEffectToModifiers 업데이트**
```typescript
case 'new_effect_type':
  modifiers.newEffectBonus += effect.value;
  break;
```

4. **store.ts에서 효과 적용 로직 추가**
```typescript
const voucherMods = calculateVoucherModifiers(state.purchasedVouchers);
// 적절한 위치에 modifiers.newEffectBonus 적용
```

5. **테스트 작성**

## 주의사항

⚠️ 바우처는 영구 업그레이드이므로 밸런스에 주의
⚠️ 중복 구매 방지가 필요한 경우 `isVoucherPurchased` 사용
⚠️ 콤보 바우처의 효과는 개별 효과의 합보다 저렴해야 함
⚠️ 상점 생성 시 이미 구매한 바우처는 제외하려면 추가 로직 필요 (TODO)

## 향후 개선사항

- [ ] 이미 구매한 바우처를 상점에 표시하지 않기
- [ ] 바우처 구매 이력 UI 표시
- [ ] 바우처 효과 툴팁 개선
- [ ] 세이브/로드 시스템과 연동
- [ ] 중복 구매 제한 옵션
- [ ] 바우처 해제(refund) 기능
