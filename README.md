# Fortune's Hand 🎰🃏🎯

> 카드 + 슬롯 + 룰렛이 만나는 덱빌더 로그라이트

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-61dafb.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

🎮 **[Play Now](https://novaprospectcau.github.io/fortune-hand/)**

## 게임 소개

**Fortune's Hand**는 포커, 슬롯머신, 룰렛의 요소를 결합한 독특한 덱빌딩 로그라이트 게임입니다.

### 게임 플로우

```
🎰 슬롯 스핀 → 🃏 카드 플레이 → 🎯 룰렛 배수 도전
```

매 턴마다:
1. **슬롯 스핀** - 보너스 효과 획득
2. **카드 드로우 & 플레이** - 포커 핸드 구성
3. **점수 계산** - 핸드 타입 + 조커 효과
4. **룰렛 도전** (선택) - 점수 배수 도전

라운드별 목표 점수를 달성하고, 상점에서 덱과 조커를 강화하세요!

## 주요 기능

### 포커 시스템
- ✅ **10가지 포커 핸드 타입** (하이카드 ~ 로열 플러시)
- 핸드별 고유한 기본 칩과 배수
- 카드 강화를 통한 점수 증폭

### 슬롯 시스템
- ✅ **7가지 슬롯 심볼** (🃏 카드, 🎯 타겟, 💰 골드, 🎰 칩, ⭐ 스타, 💀 스컬, 🌟 와일드)
- 심볼 조합에 따른 다양한 보너스 효과
- 슬롯 보너스가 카드/룰렛 단계에 영향

### 조커 시스템
- ✅ **10개 이상의 조커** (일반 ~ 전설 레어리티)
- 트리거 조건별 효과 발동 (카드 플레이, 슬롯, 룰렛, 점수 계산)
- 최대 5개까지 보유 가능
- 전략적 시너지 구축

### 상점 시스템
- ✅ **조커, 특수 카드, 카드 팩 구매**
- 리롤을 통한 상점 갱신
- 라운드마다 전략적인 구매 선택

### 튜토리얼 시스템
- ✅ **인터랙티브 튜토리얼**
- 게임 메카닉 단계별 학습
- 첫 플레이어를 위한 가이드

## 기술 스택

| 카테고리 | 기술 |
|---------|------|
| **Runtime** | Node.js 20+ |
| **Framework** | React 18 |
| **Language** | TypeScript 5 |
| **State** | Zustand |
| **Animation** | Framer Motion |
| **Styling** | TailwindCSS |
| **Build** | Vite |
| **Test** | Vitest + React Testing Library |

## 빠른 시작

### 요구사항

- Node.js 20 이상
- pnpm (권장) 또는 npm

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/yourusername/fortune-hand.git
cd fortune-hand

# 의존성 설치
pnpm install
# 또는
npm install

# 개발 서버 실행
pnpm dev
# 또는
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 주요 명령어

```bash
# 개발
pnpm dev              # 개발 서버 (localhost:5173)
pnpm build            # 프로덕션 빌드
pnpm preview          # 빌드 미리보기

# 테스트
pnpm test             # 전체 테스트
pnpm test:slots       # 슬롯 모듈 테스트
pnpm test:cards       # 카드 모듈 테스트
pnpm test:poker       # 포커 판정 테스트
pnpm test:roulette    # 룰렛 모듈 테스트

# 코드 품질
pnpm typecheck        # 타입 체크
pnpm lint             # ESLint
```

## 프로젝트 구조

```
fortune-hand/
├── src/
│   ├── modules/          # 모듈별 로직 및 UI
│   │   ├── core/        # 게임 루프, 턴 관리, 전역 상태
│   │   ├── slots/       # 슬롯머신 로직 & UI
│   │   ├── cards/       # 카드 데이터, 덱 관리
│   │   ├── poker/       # 포커 핸드 판정, 점수 계산
│   │   ├── roulette/    # 룰렛 로직 & UI
│   │   ├── jokers/      # 조커 효과 시스템
│   │   ├── shop/        # 상점, 경제 시스템
│   │   └── ui/          # 공통 UI 컴포넌트
│   ├── data/            # JSON 데이터 (카드, 조커, 심볼, 밸런스)
│   └── types/           # 공유 타입 정의
├── specs/               # 설계 문서
│   ├── interfaces.ts    # 모듈 간 인터페이스 정의
│   ├── game-loop.md     # 게임 루프 상세 명세
│   ├── data-schema.md   # 데이터 스키마 문서
│   └── todo.md          # 작업 현황
└── CLAUDE.md            # 프로젝트 개요 및 AI 개발 가이드
```

### 아키텍처 원칙

#### 모듈 간 통신 규칙
- 모든 모듈 간 데이터는 `src/types/interfaces.ts` 타입만 사용
- 다른 모듈 내부 함수 직접 import 금지
- 모듈 간 통신은 Zustand store 또는 이벤트 시스템을 통해서만

#### 각 모듈의 책임

| 모듈 | 입력 | 출력 | 절대 하지 않는 것 |
|------|------|------|------------------|
| slots | 스핀 요청 | SlotResult | 카드/룰렛 로직 |
| cards | 덱 조작 요청 | Card[] | 점수 계산 |
| poker | Card[] | HandResult | 덱 조작 |
| roulette | ScoreInput | FinalScore | 카드/슬롯 로직 |
| jokers | GameEvent | Effect[] | 직접 상태 변경 |
| shop | 구매 요청 | Transaction | 게임 로직 |

## 게임 시스템

### 포커 핸드

| 핸드 | 기본 Chips | 기본 Mult |
|------|-----------|----------|
| High Card | 5 | 1 |
| Pair | 10 | 2 |
| Two Pair | 20 | 2 |
| Three of a Kind | 30 | 3 |
| Straight | 30 | 4 |
| Flush | 35 | 4 |
| Full House | 40 | 4 |
| Four of a Kind | 60 | 7 |
| Straight Flush | 100 | 8 |
| Royal Flush | 100 | 8 |

### 슬롯 심볼

| 심볼 | 효과 |
|------|------|
| 🃏 Card | 카드 보너스 (추가 드로우) |
| 🎯 Target | 룰렛 보너스 |
| 💰 Gold | 즉시 골드 획득 |
| 🎰 Chip | 즉시 칩 보너스 |
| ⭐ Star | 잭팟! (모든 보너스) |
| 💀 Skull | 페널티 |
| 🌟 Wild | 와일드 (아무 심볼) |

### 라운드별 목표 점수

| 라운드 | 목표 점수 | 난이도 |
|--------|----------|--------|
| 1 | 300 | Tutorial |
| 2 | 800 | Easy |
| 3 | 2,000 | Easy |
| 4 | 5,000 | Medium |
| 5 | 11,000 | Medium |
| 6 | 20,000 | Hard |
| 7 | 35,000 | Hard |
| 8 | 50,000 | Expert |
| 9+ | +25,000/라운드 | Endless |

### 점수 계산 공식

```
최종 점수 = (기본 Chips + 보너스 Chips) × (기본 Mult + 보너스 Mult) × 슬롯 배수 × 룰렛 배수
```

#### 카드 칩 값

| 랭크 | Chips |
|------|-------|
| 2-10 | 숫자값 |
| J, Q, K | 10 |
| A | 11 |

## 개발 현황

### M1: Core Loop ✅

- [x] 프로젝트 셋업
- [x] Core 모듈 (게임 상태, 페이즈 전환)
- [x] Slots 모듈 (스핀, 효과 계산)
- [x] Cards 모듈 (덱 관리, UI)
- [x] Poker 모듈 (핸드 판정, 점수 계산)
- [x] Roulette 모듈 (스핀, 배수)
- [x] Jokers 모듈 (트리거, 효과)
- [x] Shop 모듈 (상점, 거래)
- [x] UI 모듈 (공통 컴포넌트)

### M2: Full Mechanics ✅

- [x] 메인 게임 화면 통합 (App.tsx)
- [x] 전체 게임 플로우 연결
  - IDLE → SLOT → DRAW → PLAY → SCORE → ROULETTE → REWARD → SHOP
- [x] 라운드 진행 시스템 (8라운드 + 엔드리스 모드)
- [x] 슬롯 스핀 횟수 제한 (라운드당 4회)
- [x] 게임 오버/승리 처리
- [x] 상점 시스템 연동
- [x] 조커 효과 실시간 적용
- [x] GitHub Pages 자동 배포

### M3: Polish (예정)

- [ ] 애니메이션 강화
- [ ] 사운드 효과
- [ ] 튜토리얼
- [ ] 모바일 최적화

## 개발 가이드

### 코드 스타일

- 함수형 컴포넌트 + Hooks만 사용
- 파일당 하나의 export (index.ts로 re-export)
- 테스트 파일은 `*.test.ts` 또는 `*.test.tsx`
- 데이터는 JSON, 로직은 TypeScript로 분리
- 매직 넘버 금지 → `src/data/constants.ts` 사용

### 테스트 규칙

- 각 모듈은 최소 80% 커버리지 유지
- 순수 함수 우선 → 테스트 용이성
- 확률 로직은 시드 기반 테스트 필수
- UI 테스트는 사용자 인터랙션 중심

```bash
# 전체 테스트
pnpm test

# 모듈별 테스트
pnpm test -- --run src/modules/slots
pnpm test -- --run src/modules/cards
pnpm test -- --run src/modules/poker
pnpm test -- --run src/modules/roulette
pnpm test -- --run src/modules/jokers
pnpm test -- --run src/modules/shop
pnpm test -- --run src/modules/core
```

### 브랜치 전략

- `main`: 안정 버전
- `develop`: 통합 브랜치
- `feature/<module>-<description>`: 기능 개발

**머지 전 반드시 `pnpm test && pnpm typecheck` 통과 필수**

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여하기

기여를 환영합니다! 다음 절차를 따라주세요:

1. 이 저장소를 Fork 합니다
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 Push 합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 기여 시 주의사항

- `src/types/interfaces.ts` 수정 시 모든 모듈에 영향을 미칩니다 - 신중히 검토 필요
- 확률 관련 상수는 `src/data/balance.json`에서만 관리
- 각 모듈의 `CLAUDE.md`를 읽고 해당 모듈의 규칙을 준수해주세요

## 개발 과정

이 프로젝트는 Claude Code를 활용하여 8개의 병렬 에이전트로 개발되었습니다:
- Agent 1: Core 모듈 (게임 루프, 상태 관리)
- Agent 2: Slots 모듈 (슬롯 시스템)
- Agent 3: Cards 모듈 (덱 관리)
- Agent 4: Poker 모듈 (핸드 판정)
- Agent 5: Roulette 모듈 (룰렛 시스템)
- Agent 6: Jokers 모듈 (조커 효과)
- Agent 7: Shop 모듈 (상점 시스템)
- Agent 8: UI 모듈 (통합 UI)

각 모듈은 독립적으로 개발되었으며, `specs/interfaces.ts`를 통해 명확한 계약을 유지합니다.

## 문의 및 지원

- Issues: [GitHub Issues](https://github.com/yourusername/fortune-hand/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/fortune-hand/discussions)

---

**Fortune's Hand**로 행운을 시험해보세요! 🎰✨
