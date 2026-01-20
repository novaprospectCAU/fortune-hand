# Roulette 모듈

룰렛 로직 및 UI 담당

## 책임

- 룰렛 스핀 로직 (확률 기반 세그먼트 선택)
- 보너스에 따른 확률 조정
- 룰렛 UI 컴포넌트 & 애니메이션

## 절대 하지 않는 것

- 점수 계산 (baseScore는 입력으로 받음)
- 조커 효과 결정
- GameState 직접 수정

## 주요 파일

```
src/modules/roulette/
├── roulette.ts        # 핵심 로직
├── probability.ts     # 확률 계산
├── components/
│   ├── RouletteWheel.tsx
│   ├── Segment.tsx
│   └── SpinButton.tsx
└── index.ts
```

## 핵심 함수

```typescript
// roulette.ts
export function spin(input: RouletteInput): RouletteResult {
  // 1. 확률에 따라 세그먼트 선택
  // 2. finalScore = baseScore × multiplier
  // 3. RouletteResult 반환
}

export function getDefaultConfig(): RouletteConfig {
  // balance.json에서 기본 설정 로드
}

export function applyBonuses(
  config: RouletteConfig,
  bonuses: SlotEffects['rouletteBonus']
): RouletteConfig {
  // 1. safeZoneBonus: 0(꽝) 확률 감소, 다른 곳에 분배
  // 2. maxMultiplier: 최대 배수 세그먼트 추가
  // 3. 수정된 config 반환
}
```

## 기본 세그먼트 (balance.json)

```
| 배수 | 확률 | 색상 |
|-----|------|------|
| 0   | 20%  | 빨강 |
| 1   | 30%  | 회색 |
| 2   | 25%  | 초록 |
| 3   | 15%  | 파랑 |
| 5   | 8%   | 노랑 |
| 10  | 2%   | 보라 |
```

## 보너스 적용 공식

```typescript
// safeZoneBonus 적용
newZeroProbability = Math.max(0, baseProbability - safeZoneBonus);
// 줄어든 확률은 다른 세그먼트에 균등 분배

// maxMultiplier 적용
// 기존 최대 배수보다 높은 세그먼트 추가
// 확률은 기존 최대에서 일부 차감
```

## UI 컴포넌트

```tsx
// RouletteWheel.tsx
interface RouletteWheelProps {
  config: RouletteConfig;
  onSpinComplete: (result: RouletteResult) => void;
  baseScore: number;
  disabled?: boolean;
}
```

애니메이션:
- Framer Motion `rotate` transform
- 감속 이징 (easeOut)
- 결과 세그먼트에서 정지
- 스핀 시간: `config.spinDuration` (기본 3초)

## 스킵 옵션

```typescript
// 플레이어가 Skip 선택 시
const skipResult: RouletteResult = {
  segment: { multiplier: 1, ... },
  finalScore: baseScore,
  wasSkipped: true,
};
```

## 테스트

```bash
pnpm test:roulette
```

- 확률 분포 테스트 (시드 기반, 대량 샘플)
- 보너스 적용 정확성
- 0% 확률 시 해당 세그먼트 절대 선택 안됨
- 최종 점수 계산 정확성
