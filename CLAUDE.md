# Fortune's Hand

카드 + 슬롯머신 + 룰렛을 결합한 덱빌더 로그라이트 게임

## 프로젝트 개요

매 턴: 슬롯 스핀 → 카드 플레이 → 룰렛 배수 도전
목표: 라운드별 목표 점수 달성, 상점에서 덱/조커 강화

## 기술 스택

- **Runtime**: Node.js 20+
- **Framework**: React 18 + TypeScript 5
- **State**: Zustand (전역 상태)
- **Animation**: Framer Motion
- **Styling**: TailwindCSS
- **Build**: Vite
- **Test**: Vitest + React Testing Library

## 핵심 명령어

```bash
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버 (localhost:5173)
pnpm build            # 프로덕션 빌드
pnpm test             # 전체 테스트
pnpm test:slots       # 슬롯 모듈 테스트
pnpm test:cards       # 카드 모듈 테스트
pnpm test:poker       # 포커 판정 테스트
pnpm test:roulette    # 룰렛 모듈 테스트
pnpm typecheck        # 타입 체크
pnpm lint             # ESLint
```

## 모듈 구조

```
src/
├── modules/
│   ├── core/       # 게임 루프, 턴 관리, 전역 상태
│   ├── slots/      # 슬롯머신 로직 & UI
│   ├── cards/      # 카드 데이터, 덱 관리
│   ├── poker/      # 포커 핸드 판정, 점수 계산
│   ├── roulette/   # 룰렛 로직 & UI
│   ├── jokers/     # 조커 효과 시스템
│   ├── shop/       # 상점, 경제 시스템
│   └── ui/         # 공통 UI 컴포넌트
├── data/           # JSON 데이터 (카드, 조커, 심볼)
└── types/          # 공유 타입 정의
```

## 아키텍처 규칙

### 모듈 간 통신
- 모든 모듈 간 데이터는 `src/types/interfaces.ts` 타입만 사용
- 다른 모듈 내부 함수 직접 import 금지
- 모듈 간 통신은 Zustand store 또는 이벤트를 통해서만

### 각 모듈 책임
| 모듈 | 입력 | 출력 | 절대 하지 않는 것 |
|------|------|------|------------------|
| slots | 스핀 요청 | SlotResult | 카드/룰렛 로직 |
| cards | 덱 조작 요청 | Card[] | 점수 계산 |
| poker | Card[] | HandResult | 덱 조작 |
| roulette | ScoreInput | FinalScore | 카드/슬롯 로직 |
| jokers | GameEvent | Effect[] | 직접 상태 변경 |
| shop | 구매 요청 | Transaction | 게임 로직 |

### 상태 관리
```typescript
// 전역 상태는 core 모듈의 useGameStore만 사용
import { useGameStore } from '@/modules/core/store';

// 모듈 내부 상태는 로컬 useState 또는 모듈 전용 store
```

## 게임 루프 (턴 흐름)

```
1. SLOT_PHASE    → 슬롯 스핀, SlotResult 생성
2. DRAW_PHASE    → 카드 드로우 (SlotResult.cardBonus 적용)
3. PLAY_PHASE    → 카드 선택 & 플레이
4. SCORE_PHASE   → 포커 핸드 판정, 기본 점수 계산
5. ROULETTE_PHASE → 배수 도전 (선택적)
6. REWARD_PHASE  → 최종 점수 & 보상 지급
7. SHOP_PHASE    → 라운드 종료 시 상점 (선택적)
```

## 코드 스타일

- 함수형 컴포넌트 + Hooks만 사용
- 파일당 하나의 export (index.ts로 re-export)
- 테스트 파일은 `*.test.ts` 또는 `*.test.tsx`
- 데이터는 JSON, 로직은 TypeScript 분리
- 매직 넘버 금지 → `src/data/constants.ts` 사용

## 테스트 규칙

- 각 모듈은 최소 80% 커버리지 유지
- 순수 함수 우선 → 테스트 용이성
- 확률 로직은 시드 기반 테스트 필수
- UI 테스트는 사용자 인터랙션 중심

## 중요 참조 문서

- 인터페이스 정의: @specs/interfaces.ts
- 게임 루프 상세: @specs/game-loop.md
- 데이터 스키마: @specs/data-schema.md
- 작업 현황: @specs/todo.md

## 브랜치 규칙

- `main`: 안정 버전
- `develop`: 통합 브랜치
- `feature/<module>-<description>`: 기능 개발
- 머지 전 반드시 `pnpm test && pnpm typecheck` 통과

## 경고

⚠️ `src/types/interfaces.ts` 수정 시 모든 모듈에 영향 → 신중히
⚠️ 확률 관련 상수는 `src/data/balance.json`에서만 관리
⚠️ 다른 모듈 CLAUDE.md 읽고 해당 모듈 규칙 준수
