# Agent 6: Jokers Module 작업 지시서

## 역할
조커 효과 시스템 담당

## 브랜치
- 작업 브랜치: `feature/jokers-module`
- 머지 대상: `develop`

## M1 작업 목록 (기초 구조)

M1에서는 조커 시스템의 기초 구조만 구현합니다.
본격적인 조커 효과는 M2에서 구현합니다.

### 1단계: 데이터 로더
- [ ] `src/modules/jokers/jokerData.ts`
  ```typescript
  import jokersJson from '@/data/jokers.json';

  export function getJokerById(id: string): Joker | undefined
  export function getAllJokers(): Joker[]
  export function getJokersByRarity(rarity: Joker['rarity']): Joker[]
  ```

### 2단계: 트리거 시스템
- [ ] `src/modules/jokers/triggers.ts`
  ```typescript
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

  function matchesCardCondition(cards: Card[] | undefined, condition: CardCondition | undefined): boolean
  function matchesSymbolCondition(result: SlotResult | undefined, symbol: SlotSymbol | undefined): boolean
  ```

### 3단계: 효과 시스템
- [ ] `src/modules/jokers/effects.ts`
  ```typescript
  export function applyEffect(joker: Joker, context: JokerContext): AppliedBonus[] {
    switch (joker.effect.type) {
      case 'add_chips':
        return [{ source: joker.name, type: 'chips', value: joker.effect.value }];
      case 'add_mult':
        return [{ source: joker.name, type: 'mult', value: joker.effect.value }];
      case 'multiply':
        return [{ source: joker.name, type: 'xmult', value: joker.effect.value }];
      case 'add_gold':
        // 즉시 적용, 별도 처리
        return [];
      case 'modify_slot':
      case 'modify_roulette':
        // modifier로 변환, 별도 처리
        return [];
      case 'retrigger':
      case 'custom':
        // M2에서 구현
        return [];
    }
  }
  ```

### 4단계: 조커 매니저
- [ ] `src/modules/jokers/jokerManager.ts`
  ```typescript
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
  ```

### 5단계: 기본 UI (간단히)
- [ ] `src/modules/jokers/components/JokerCard.tsx`
  ```tsx
  interface JokerCardProps {
    joker: Joker;
    isTriggered?: boolean;
    onClick?: () => void;
  }
  ```
- [ ] `src/modules/jokers/components/JokerList.tsx`
  ```tsx
  interface JokerListProps {
    jokers: Joker[];
    maxSlots: number;
    triggeredIds?: string[];
  }
  ```

### 6단계: Export
- [ ] `src/modules/jokers/index.ts`

## 트리거 타입 정리
| 타입 | 발동 시점 | context 필요 데이터 |
|------|----------|-------------------|
| on_score | SCORE_PHASE | handResult |
| on_play | PLAY_PHASE | playedCards |
| on_slot | SLOT_PHASE | slotResult |
| on_roulette | ROULETTE_PHASE | - |
| passive | 항상 | - |

## 효과 타입 정리
| 타입 | 설명 | AppliedBonus.type |
|------|------|------------------|
| add_chips | 칩 추가 | chips |
| add_mult | 배수 추가 | mult |
| multiply | 배수에 곱하기 | xmult |
| add_gold | 골드 추가 | (즉시 적용) |

## 테스트 요구사항
```bash
npm test src/modules/jokers
```
- 모든 트리거 조건 테스트
- 효과 값 정확성
- 조커 순서에 따른 결과 (xmult 순서 중요)
- cardCondition 매칭 테스트

## 작업 완료 후
```bash
git add .
git commit -m "feat(jokers): implement joker trigger and effect system

- Add joker data loader
- Implement trigger condition checking
- Create effect application logic
- Add basic JokerCard component

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin feature/jokers-module
```

## 참조 문서
- `src/modules/jokers/CLAUDE.md`
- `specs/interfaces.ts`
- `src/data/jokers.json`
