# Fortune's Hand

카드 + 슬롯머신 + 룰렛을 결합한 덱빌더 로그라이트 게임

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

## 기술 스택

| 분류 | 기술 |
|------|------|
| Runtime | Node.js 20+ |
| Framework | React 18 + TypeScript 5 |
| State | Zustand |
| Animation | Framer Motion |
| Styling | TailwindCSS |
| Build | Vite |
| Test | Vitest + React Testing Library |

## 시작하기

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 스크립트

```bash
npm run dev        # 개발 서버 (localhost:5173)
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 미리보기
npm test           # 전체 테스트 실행
npm run typecheck  # TypeScript 타입 체크
npm run lint       # ESLint 실행
```

## 프로젝트 구조

```
src/
├── modules/
│   ├── core/       # 게임 루프, 상태 관리
│   ├── slots/      # 슬롯머신 로직 & UI
│   ├── cards/      # 카드/덱 관리
│   ├── poker/      # 포커 핸드 판정
│   ├── roulette/   # 룰렛 로직 & UI
│   ├── jokers/     # 조커 효과 시스템
│   ├── shop/       # 상점 시스템
│   └── ui/         # 공통 UI 컴포넌트
├── data/           # 게임 데이터 (JSON)
└── types/          # TypeScript 타입 정의
```

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

### 점수 계산

```
최종 점수 = (Chips + 보너스) × (Mult + 보너스) × 룰렛 배수
```

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

## 테스트

```bash
# 전체 테스트
npm test

# 특정 모듈 테스트
npm test -- --run src/modules/slots
npm test -- --run src/modules/cards
npm test -- --run src/modules/poker
npm test -- --run src/modules/roulette
npm test -- --run src/modules/jokers
npm test -- --run src/modules/shop
npm test -- --run src/modules/core
```

## 라이선스

MIT License

## 기여

이 프로젝트는 Claude Code를 활용하여 8개의 병렬 에이전트로 개발되었습니다.
