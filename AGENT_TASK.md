# Agent 5: Roulette Module 작업 지시서

## 역할
룰렛 로직 및 UI 담당

## 브랜치
- 작업 브랜치: `feature/roulette-module`
- 머지 대상: `develop`

## M1 작업 목록

### 1단계: 확률 계산
- [ ] `src/modules/roulette/probability.ts`
  ```typescript
  // 세그먼트 확률에 따라 선택
  export function selectSegment(segments: RouletteSegment[]): RouletteSegment

  // 확률 정규화 (합이 100이 되도록)
  export function normalizeSegments(segments: RouletteSegment[]): RouletteSegment[]
  ```

### 2단계: 핵심 로직
- [ ] `src/modules/roulette/roulette.ts`
  ```typescript
  export function spin(input: RouletteInput): RouletteResult {
    const segment = selectSegment(input.config.segments);
    return {
      segment,
      finalScore: input.baseScore * segment.multiplier,
      wasSkipped: false
    };
  }

  export function getDefaultConfig(): RouletteConfig {
    // balance.json에서 기본 설정 로드
  }

  export function applyBonuses(
    config: RouletteConfig,
    bonuses: SlotEffects['rouletteBonus']
  ): RouletteConfig {
    // safeZoneBonus: 0(꽝) 확률 감소
    // maxMultiplier: 최대 배수 세그먼트 추가
  }
  ```

### 기본 세그먼트 (balance.json)
| 배수 | 확률 | 색상 |
|-----|------|------|
| 0 | 20% | #ff4444 (빨강) |
| 1 | 30% | #888888 (회색) |
| 2 | 25% | #44ff44 (초록) |
| 3 | 15% | #4444ff (파랑) |
| 5 | 8% | #ffff44 (노랑) |
| 10 | 2% | #ff44ff (보라) |

### 3단계: 보너스 적용 로직
```typescript
export function applyBonuses(
  config: RouletteConfig,
  bonuses: SlotEffects['rouletteBonus']
): RouletteConfig {
  const segments = [...config.segments];

  // safeZoneBonus: 꽝(0) 확률 감소
  if (bonuses.safeZoneBonus > 0) {
    const zeroSegment = segments.find(s => s.multiplier === 0);
    if (zeroSegment) {
      const reduction = Math.min(bonuses.safeZoneBonus, zeroSegment.probability);
      zeroSegment.probability -= reduction;
      // 줄어든 확률을 다른 세그먼트에 분배
      distributeExtraProbability(segments, reduction);
    }
  }

  // maxMultiplier: 새 고배율 세그먼트 추가
  if (bonuses.maxMultiplier > 0) {
    const maxExisting = Math.max(...segments.map(s => s.multiplier));
    const newMax = maxExisting + bonuses.maxMultiplier;
    // 기존 최대 배수에서 확률 차감하여 새 세그먼트 추가
  }

  return { ...config, segments: normalizeSegments(segments) };
}
```

### 4단계: UI 컴포넌트
- [ ] `src/modules/roulette/components/Segment.tsx`
  - 개별 세그먼트 렌더링
- [ ] `src/modules/roulette/components/RouletteWheel.tsx`
  ```tsx
  interface RouletteWheelProps {
    config: RouletteConfig;
    onSpinComplete: (result: RouletteResult) => void;
    baseScore: number;
    disabled?: boolean;
  }
  ```
  - Framer Motion rotate transform
  - 감속 이징 (easeOut)
  - 스핀 시간: config.spinDuration (기본 3초)
- [ ] `src/modules/roulette/components/SpinButton.tsx`

### 5단계: Skip 처리
```typescript
export function skip(baseScore: number): RouletteResult {
  return {
    segment: { id: 'skip', multiplier: 1, probability: 0, color: '#888' },
    finalScore: baseScore,
    wasSkipped: true
  };
}
```

### 6단계: Export
- [ ] `src/modules/roulette/index.ts`

## 테스트 요구사항
```bash
npm run test:roulette
```
- 확률 분포 테스트 (시드 기반, 대량 샘플)
- 보너스 적용 정확성
- 0% 확률 시 해당 세그먼트 절대 선택 안됨
- 최종 점수 계산 정확성

## 애니메이션 상세
```tsx
// Framer Motion 예시
<motion.div
  animate={{ rotate: targetAngle }}
  transition={{
    duration: config.spinDuration / 1000,
    ease: [0.2, 0.8, 0.2, 1], // custom easeOut
  }}
  onAnimationComplete={() => onSpinComplete(result)}
>
  {/* 휠 세그먼트들 */}
</motion.div>
```

## 작업 완료 후
```bash
git add .
git commit -m "feat(roulette): implement roulette logic and wheel UI

- Add probability-based segment selection
- Implement bonus application for safe zone and max multiplier
- Create animated RouletteWheel component

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin feature/roulette-module
```

## 참조 문서
- `src/modules/roulette/CLAUDE.md`
- `specs/interfaces.ts`
- `src/data/balance.json`
