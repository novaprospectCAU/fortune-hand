# Jokers 모듈

조커 효과 시스템 담당

## 책임

- 조커 데이터 관리
- 트리거 조건 평가
- 효과 → AppliedBonus 변환
- 조커 UI 컴포넌트

## 절대 하지 않는 것

- GameState 직접 수정 (보너스 배열만 반환)
- 점수 직접 계산 (poker 모듈 담당)
- 슬롯/룰렛 로직

## 주요 파일

```
src/modules/jokers/
├── jokerManager.ts    # 조커 평가 로직
├── triggers.ts        # 트리거 조건 체크
├── effects.ts         # 효과 처리
├── jokerData.ts       # 데이터 로더
├── components/
│   ├── JokerCard.tsx
│   ├── JokerSlot.tsx
│   └── JokerList.tsx
└── index.ts
```

## 핵심 함수

```typescript
// jokerManager.ts
export function evaluateJokers(
  jokers: Joker[],
  context: JokerContext
): AppliedBonus[] {
  const bonuses: AppliedBonus[] = [];
  
  for (const joker of jokers) {
    if (shouldTrigger(joker, context)) {
      bonuses.push(...applyEffect(joker, context));
    }
  }
  
  return bonuses;
}

// triggers.ts
export function shouldTrigger(joker: Joker, context: JokerContext): boolean {
  switch (joker.trigger.type) {
    case 'on_score':
      return context.phase === 'SCORE_PHASE';
    case 'on_play':
      return context.phase === 'PLAY_PHASE' && 
             matchesCardCondition(context.playedCards, joker.trigger.cardCondition);
    case 'on_slot':
      return context.phase === 'SLOT_PHASE' &&
             matchesSymbolCondition(context.slotResult, joker.trigger.symbolCondition);
    case 'on_roulette':
      return context.phase === 'ROULETTE_PHASE';
    case 'passive':
      return true;
  }
}

// effects.ts
export function applyEffect(joker: Joker, context: JokerContext): AppliedBonus[] {
  switch (joker.effect.type) {
    case 'add_chips':
      return [{ source: joker.name, type: 'chips', value: joker.effect.value }];
    case 'add_mult':
      return [{ source: joker.name, type: 'mult', value: joker.effect.value }];
    case 'multiply':
      return [{ source: joker.name, type: 'xmult', value: joker.effect.value }];
    // ... 기타 효과
  }
}
```

## 트리거 타입

| 타입 | 발동 시점 | context 필요 데이터 |
|------|----------|-------------------|
| on_score | SCORE_PHASE | handResult |
| on_play | PLAY_PHASE | playedCards |
| on_slot | SLOT_PHASE | slotResult |
| on_roulette | ROULETTE_PHASE | - |
| passive | 항상 | - |

## 효과 타입

| 타입 | 설명 | AppliedBonus.type |
|------|------|------------------|
| add_chips | 칩 추가 | chips |
| add_mult | 배수 추가 | mult |
| multiply | 배수에 곱하기 | xmult |
| add_gold | 골드 추가 | (즉시 적용) |
| modify_slot | 슬롯 modifier | (SlotModifiers로 변환) |
| modify_roulette | 룰렛 modifier | (RouletteBonus로 변환) |
| retrigger | 카드 재발동 | (poker에서 처리) |
| custom | 커스텀 핸들러 | (핸들러 함수 호출) |

## UI 컴포넌트

```tsx
// JokerCard.tsx
interface JokerCardProps {
  joker: Joker;
  isTriggered?: boolean;  // 발동 시 하이라이트
  onClick?: () => void;
}

// JokerList.tsx
interface JokerListProps {
  jokers: Joker[];
  maxSlots: number;
  triggeredIds?: string[];
}
```

## 조커 발동 시각화

발동된 조커는 UI에서 하이라이트:
- 테두리 발광 효과
- 효과 텍스트 팝업
- 점수에 기여한 값 표시

## 테스트

```bash
pnpm test src/modules/jokers
```

- 모든 트리거 조건 테스트
- 효과 값 정확성
- 조커 순서에 따른 결과 (xmult 순서 중요)
- cardCondition 매칭 테스트
