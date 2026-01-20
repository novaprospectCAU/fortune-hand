# Agent 2: Slots Module 작업 지시서

## 역할
슬롯머신 로직 및 UI 담당

## 브랜치
- 작업 브랜치: `feature/slots-module`
- 머지 대상: `develop`

## M1 작업 목록

### 1단계: 데이터 및 타입
- [ ] `src/data/symbols.json` 생성 (아직 없다면)
  - 7개 심볼 정의 (card, target, gold, chip, star, skull, wild)
  - 각 심볼의 weight, emoji, description
  - combinations 정의
- [ ] `src/modules/slots/types.ts` - 모듈 내부 타입

### 2단계: 핵심 로직
- [ ] `src/modules/slots/symbols.ts`
  - 심볼 데이터 로더
  - getSymbolProbabilities() 함수
- [ ] `src/modules/slots/slotMachine.ts`
  - spin(modifiers?: SlotModifiers): SlotResult
  - 확률 기반 심볼 선택
  - wild 심볼 처리
- [ ] `src/modules/slots/effects.ts`
  - 심볼 조합 → SlotEffects 변환
  - 잭팟 판정

### 3단계: UI 컴포넌트
- [ ] `src/modules/slots/components/Symbol.tsx`
  - 단일 심볼 렌더링
- [ ] `src/modules/slots/components/Reel.tsx`
  - 릴 컴포넌트 (심볼 3개)
- [ ] `src/modules/slots/components/SlotMachine.tsx`
  - 전체 슬롯머신 UI
  - Framer Motion 애니메이션

### 4단계: Export
- [ ] `src/modules/slots/index.ts`
  - spin, getSymbolProbabilities export
  - SlotMachine 컴포넌트 export

## 핵심 구현

```typescript
// slotMachine.ts
export function spin(modifiers?: SlotModifiers): SlotResult {
  // 1. 각 릴에서 심볼 선택 (확률 기반)
  const symbols: [SlotSymbol, SlotSymbol, SlotSymbol] = [
    selectSymbol(modifiers),
    selectSymbol(modifiers),
    selectSymbol(modifiers)
  ];

  // 2. 잭팟 체크 (3개 같은 심볼)
  const isJackpot = symbols[0] === symbols[1] && symbols[1] === symbols[2];

  // 3. 효과 생성
  const effects = calculateEffects(symbols, isJackpot);

  return { symbols, isJackpot, effects };
}
```

## 테스트 요구사항
```bash
npm run test:slots
```
- 확률 분포 테스트 (시드 기반)
- 모든 조합 효과 테스트
- wild 심볼 대체 테스트
- modifier 적용 테스트

## 의존성
- `@/types/interfaces` - SlotResult, SlotEffects 등
- `@/data/symbols.json` - 심볼 데이터
- `@/data/balance.json` - 기본 가중치

## 작업 완료 후
```bash
git add .
git commit -m "feat(slots): implement slot machine logic and UI

- Add symbol data and probability calculation
- Implement spin() function with modifiers
- Create SlotMachine component with animation

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin feature/slots-module
```

## 참조 문서
- `src/modules/slots/CLAUDE.md`
- `specs/interfaces.ts`
- `specs/data-schema.md`
