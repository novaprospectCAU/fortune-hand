# Slots 모듈

슬롯머신 로직 및 UI 담당

## 책임

- 슬롯 스핀 로직 (확률 기반 심볼 선택)
- 심볼 조합 → 효과 변환
- 슬롯 UI 컴포넌트 & 애니메이션

## 절대 하지 않는 것

- 카드/포커/룰렛 로직
- GameState 직접 수정 (결과만 반환)
- 조커 효과 직접 적용

## 주요 파일

```
src/modules/slots/
├── slotMachine.ts     # 핵심 로직
├── symbols.ts         # 심볼 데이터 로더
├── effects.ts         # 조합 → 효과 변환
├── components/
│   ├── SlotMachine.tsx
│   ├── Reel.tsx
│   └── Symbol.tsx
└── index.ts
```

## 핵심 함수

```typescript
// slotMachine.ts
export function spin(modifiers?: SlotModifiers): SlotResult {
  // 1. 각 릴에서 심볼 선택 (확률 기반)
  // 2. 조커 modifier 적용
  // 3. 조합 판정 (3개 같으면 특수 효과)
  // 4. SlotEffects 생성
  // 5. SlotResult 반환
}

export function getSymbolProbabilities(
  modifiers?: SlotModifiers
): Map<SlotSymbol, number> {
  // 기본 확률 + modifier 적용
}
```

## 데이터

- 심볼 정의: `@/data/symbols.json`
- 조합 효과: `@/data/symbols.json` → `combinations`
- 기본 확률: `@/data/balance.json` → `symbols.weight`

## 확률 계산

```typescript
// 기본 가중치에서 확률 계산
const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
const probability = symbol.weight / totalWeight;
```

## 조합 판정

```typescript
// 3개 같은 심볼 = 특수 효과
// 그 외 = 기본 효과 (각 심볼 개별 효과 합산)
// wild(🌟)는 다른 심볼로 대체 가능
```

## UI 컴포넌트

```tsx
// SlotMachine.tsx
interface SlotMachineProps {
  onSpinComplete: (result: SlotResult) => void;
  modifiers?: SlotModifiers;
  disabled?: boolean;
}
```

애니메이션:
- Framer Motion 사용
- 각 릴 순차적 정지 (왼쪽 → 오른쪽)
- 잭팟 시 특수 효과

## 테스트

```bash
pnpm test:slots
```

- 확률 분포 테스트 (시드 기반)
- 모든 조합 효과 테스트
- wild 심볼 대체 테스트
- modifier 적용 테스트
