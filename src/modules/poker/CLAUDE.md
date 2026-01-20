# Poker 모듈

포커 핸드 판정 및 점수 계산 담당

## 책임

- 포커 핸드 타입 판정
- 기본 점수 (chips, mult) 계산
- 보너스 적용 후 최종 점수 계산

## 절대 하지 않는 것

- 카드 데이터 관리
- 덱 조작
- 조커 효과 결정 (보너스 배열만 받아서 적용)

## 주요 파일

```
src/modules/poker/
├── handEvaluator.ts   # 핸드 판정
├── scoring.ts         # 점수 계산
├── handRanks.ts       # 핸드 순위 상수
└── index.ts
```

## 핵심 함수

```typescript
// handEvaluator.ts
export function evaluateHand(cards: Card[]): HandResult {
  // 1. 모든 가능한 핸드 타입 체크 (높은 순위부터)
  // 2. 가장 높은 핸드 타입 반환
  // 3. scoringCards = 점수에 기여한 카드들
}

// scoring.ts
export function calculateScore(
  handResult: HandResult,
  bonuses: AppliedBonus[]
): ScoreCalculation {
  // 1. 기본 chips = handType 기본값 + 카드 칩 합계
  // 2. 기본 mult = handType 기본값
  // 3. 보너스 순차 적용 (chips → mult → xmult)
  // 4. 최종 점수 = chips × mult
}
```

## 핸드 판정 우선순위 (높은 순)

```typescript
1. Royal Flush    - A,K,Q,J,10 같은 무늬
2. Straight Flush - 5장 연속 + 같은 무늬
3. Four of a Kind - 같은 숫자 4장
4. Full House     - 3장 + 2장
5. Flush          - 같은 무늬 5장
6. Straight       - 5장 연속 (A는 1 또는 14)
7. Three of a Kind- 같은 숫자 3장
8. Two Pair       - 페어 2개
9. Pair           - 같은 숫자 2장
10. High Card     - 위 모두 아님
```

## 와일드 카드 처리

```typescript
// isWild === true인 카드는 최적의 조합을 만드는 값으로 취급
// 여러 가능성 중 가장 높은 핸드를 선택
```

## 점수 계산 순서

```typescript
// 보너스 적용 순서가 중요!
1. add_chips: chipTotal += value
2. add_mult:  multTotal += value
3. xmult:     multTotal *= value

// 최종
finalScore = chipTotal * multTotal
```

## 기본 값 참조

`@/data/constants.ts`의 `BASE_HAND_VALUES` 사용

## 테스트 (필수!)

```bash
pnpm test:poker
```

- 모든 핸드 타입 정확히 판정
- 경계 케이스 (A 스트레이트: A-5, 10-A)
- 와일드 카드 최적 판정
- 점수 계산 정확성
- 보너스 적용 순서 테스트

```typescript
// 테스트 케이스 예시
describe('evaluateHand', () => {
  it('should detect royal flush', () => {
    const cards = [
      { rank: 'A', suit: 'hearts' },
      { rank: 'K', suit: 'hearts' },
      { rank: 'Q', suit: 'hearts' },
      { rank: 'J', suit: 'hearts' },
      { rank: '10', suit: 'hearts' },
    ];
    expect(evaluateHand(cards).handType).toBe('royal_flush');
  });
});
```
