# Core 모듈

게임 상태 관리 및 턴 흐름 제어 담당

## 책임

- 전역 GameState 관리 (Zustand store)
- 페이즈 전환 로직
- 이벤트 발행/구독 시스템
- 게임 시작/종료 처리

## 절대 하지 않는 것

- 슬롯/카드/포커/룰렛 로직 직접 구현
- UI 컴포넌트 생성
- 데이터 파일 직접 수정

## 주요 파일

```
src/modules/core/
├── store.ts           # Zustand store 정의
├── gameLoop.ts        # 페이즈 전환 로직
├── events.ts          # 이벤트 시스템
├── types.ts           # 모듈 내부 타입 (공유 타입은 @/types)
└── index.ts           # public API export
```

## store.ts 구조

```typescript
import { create } from 'zustand';
import type { GameState, GameActions } from '@/types/interfaces';

interface GameStore extends GameState, GameActions {}

export const useGameStore = create<GameStore>((set, get) => ({
  // 초기 상태
  phase: 'IDLE',
  round: 0,
  // ... GameState 전체
  
  // 액션
  startGame: (config) => { /* ... */ },
  nextPhase: () => { /* ... */ },
  // ... GameActions 전체
}));
```

## 페이즈 전환 규칙

@specs/game-loop.md 참조

```typescript
const PHASE_TRANSITIONS: Record<GamePhase, GamePhase> = {
  IDLE: 'SLOT_PHASE',
  SLOT_PHASE: 'DRAW_PHASE',
  DRAW_PHASE: 'PLAY_PHASE',
  PLAY_PHASE: 'SCORE_PHASE',
  SCORE_PHASE: 'ROULETTE_PHASE',
  ROULETTE_PHASE: 'REWARD_PHASE',
  REWARD_PHASE: 'SLOT_PHASE', // 또는 SHOP_PHASE (라운드 종료 시)
  SHOP_PHASE: 'SLOT_PHASE',
  GAME_OVER: 'IDLE',
};
```

## 다른 모듈과의 연동

- slots 모듈: `spinSlot()` 호출 → `SlotResult` 받아서 state 업데이트
- cards 모듈: `draw()`, `discard()` 호출
- poker 모듈: `evaluateHand()` 호출 → `HandResult` 저장
- roulette 모듈: `spin()` 호출 → `RouletteResult` 저장
- jokers 모듈: 각 페이즈에서 `evaluateJokers()` 호출

## 테스트

```bash
pnpm test src/modules/core
```

- 모든 페이즈 전환 테스트
- 상태 불변성 테스트
- 이벤트 발행 테스트
