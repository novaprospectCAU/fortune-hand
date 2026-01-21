# Card Enhancement System

카드 강화 시스템은 개별 카드에 영구적인 보너스를 추가하는 기능입니다.

## 강화 타입

### 1. Chips Enhancement (보너스)
- **설명**: 카드의 기본 칩 값에 추가 칩을 더합니다
- **데이터**: `{ type: 'chips', value: 30 }`
- **효과**: 카드 점수 계산 시 칩 값에 +30

```typescript
const enhancedCard: Card = {
  id: 'A_hearts',
  rank: 'A',
  suit: 'hearts',
  enhancement: { type: 'chips', value: 30 }
};

// 기본 Ace 칩 값: 11
// 강화 후 칩 값: 11 + 30 = 41
```

### 2. Mult Enhancement (배수)
- **설명**: 점수 계산 시 배수(mult)를 증가시킵니다
- **데이터**: `{ type: 'mult', value: 4 }`
- **효과**: 최종 배수에 +4

```typescript
const enhancedCard: Card = {
  id: 'K_hearts',
  rank: 'K',
  suit: 'hearts',
  enhancement: { type: 'mult', value: 4 }
};

// Pair 기본 mult: 2
// 강화 카드 포함 시: 2 + 4 = 6
```

### 3. Gold Enhancement (골드 실)
- **설명**: 점수 대신 골드를 획득합니다
- **데이터**: `{ type: 'gold', value: 3 }`
- **효과**: 카드 플레이 시 +3 골드 (점수 계산과는 별도)

```typescript
const enhancedCard: Card = {
  id: 'Q_hearts',
  rank: 'Q',
  suit: 'hearts',
  enhancement: { type: 'gold', value: 3 }
};

// 카드가 점수에 기여하면 REWARD_PHASE에서 골드 +3
```

### 4. Retrigger Enhancement (레드 실)
- **설명**: 카드 효과를 재발동합니다
- **데이터**: `{ type: 'retrigger', value: 1 }`
- **상태**: 🚧 TODO - 복잡한 구현 필요

## 적용 순서

### SCORE_PHASE
1. 포커 핸드 판정
2. **Chips Enhancement 적용** → 카드 칩 값 증가
3. **Mult Enhancement 적용** → 배수 증가
4. 조커 보너스 적용
5. 슬롯 배수 적용
6. 최종 점수 계산: `(chips) × (mult)`

### REWARD_PHASE
1. 점수 누적
2. **Gold Enhancement 적용** → 골드 추가
3. 슬롯 골드/페널티 적용
4. 라운드 완료 체크

## 보너스 추적

강화 효과는 `AppliedBonus[]` 배열에 추적됩니다:

```typescript
{
  source: "Enhancement: AH",  // Ace of Hearts
  type: "mult",
  value: 4
}
```

이를 통해 UI에서 어떤 카드가 어떤 보너스를 제공했는지 표시할 수 있습니다.

## 예시: 혼합 강화

```typescript
const scoringCards = [
  { rank: 'A', suit: 'hearts', enhancement: { type: 'chips', value: 30 } },
  { rank: 'K', suit: 'hearts', enhancement: { type: 'mult', value: 4 } },
  { rank: 'Q', suit: 'hearts', enhancement: { type: 'gold', value: 3 } },
  { rank: 'J', suit: 'hearts' },
  { rank: '10', suit: 'hearts' }
];

// Flush 기본 값: 35 chips, 4 mult
const handResult = evaluateHand(scoringCards);
const scoreCalc = calculateScore(handResult);

// chipTotal = 35 + (11+30) + 10 + 10 + 10 + 10 = 116
// multTotal = 4 + 4 = 8
// finalScore = 116 × 8 = 928

// REWARD_PHASE에서 추가 골드: +3
```

## 테스트

모든 강화 타입은 포괄적인 테스트로 커버됩니다:

```bash
npm test -- src/modules/poker/scoring.test.ts
npm test -- src/modules/core/phaseHandlers/phaseHandlers.test.ts
```

### 주요 테스트 케이스
- ✅ Chips enhancement가 칩 값 증가
- ✅ Mult enhancement가 배수 증가
- ✅ Gold enhancement가 골드 추가 (REWARD_PHASE)
- ✅ 여러 강화가 동시에 작동
- ✅ 강화와 조커 보너스가 함께 작동
- ✅ AppliedBonus에 강화 소스 추적

## 구현 파일

| 파일 | 역할 |
|------|------|
| `src/modules/poker/scoring.ts` | Chips/Mult 강화 적용 |
| `src/modules/core/phaseHandlers/rewardPhase.ts` | Gold 강화 적용 |
| `src/data/cards.json` | 강화 타입 정의 |
| `src/types/interfaces.ts` | `CardEnhancement` 인터페이스 |

## TODO: Retrigger 구현

Retrigger enhancement는 다음 사항을 고려하여 별도 구현 필요:

1. 카드의 모든 효과 재적용 (칩, 배수, 특수 효과)
2. 무한 루프 방지 (retrigger가 다른 retrigger를 발동하지 않도록)
3. 이벤트 시스템 통합 (카드 플레이 이벤트 재발행)
4. 조커와의 상호작용 (조커가 retrigger된 카드에 반응할지)

```typescript
// 제안된 인터페이스 (미구현)
export function applyRetriggerEnhancements(
  scoringCards: Card[],
  baseCalculation: ScoreCalculation,
  context: GameContext
): ScoreCalculation
```
