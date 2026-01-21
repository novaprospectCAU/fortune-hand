# Fortune's Hand - 도메인 Lead 운영 가이드

## 계층 구조

```
┌─────────────────────────────────────────────────────────────┐
│              Orchestrator Lead (Opus)                       │
│   - 전체 아키텍처 관리                                        │
│   - 의사결정 및 조율                                          │
│   - 도메인 Lead 위임 및 통합                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬─────────────────┐
        ▼                 ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Core Lead    │ │  Game Lead    │ │ Economy Lead  │ │   UI Lead     │
│   (Sonnet)    │ │   (Sonnet)    │ │   (Sonnet)    │ │   (Sonnet)    │
├───────────────┤ ├───────────────┤ ├───────────────┤ ├───────────────┤
│ - core 모듈   │ │ - slots 모듈  │ │ - shop 모듈   │ │ - ui 모듈     │
│ - 게임 루프   │ │ - cards 모듈  │ │ - jokers 모듈 │ │ - 컴포넌트    │
│ - 상태 관리   │ │ - poker 모듈  │ │ - 경제 시스템 │ │ - 애니메이션  │
│ - 이벤트     │ │ - roulette    │ │ - 아이템      │ │ - 스타일      │
└───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘
```

## 도메인 Lead 책임

### Core Lead
**담당 모듈**: `src/modules/core/`

**책임**:
- 게임 루프 (페이즈 전환)
- Zustand 스토어 관리
- 이벤트 시스템
- 모듈 간 통합

**절대 하지 않는 것**:
- 개별 게임 메카닉 구현
- UI 컴포넌트 작성

### Game Lead
**담당 모듈**: `src/modules/slots/`, `src/modules/cards/`, `src/modules/poker/`, `src/modules/roulette/`

**책임**:
- 슬롯머신 로직
- 카드/덱 관리
- 포커 핸드 판정
- 룰렛 로직
- 특수 카드 트리거
- 카드 강화 시스템

**절대 하지 않는 것**:
- 전역 상태 직접 수정 (store 통해서만)
- 상점/조커 로직

### Economy Lead
**담당 모듈**: `src/modules/shop/`, `src/modules/jokers/`

**책임**:
- 상점 아이템 생성
- 구매/판매/리롤 로직
- 조커 효과 시스템
- 가격 책정
- 경제 밸런싱

**절대 하지 않는 것**:
- 게임 메카닉 직접 수정
- 점수 계산

### UI Lead
**담당 모듈**: `src/modules/ui/`

**책임**:
- 공통 UI 컴포넌트
- 레이아웃
- 애니메이션
- 테마/스타일
- 반응형 디자인

**절대 하지 않는 것**:
- 게임 로직
- 상태 관리 (표시만)

## Lead 호출 방법

### Task 도구 사용

```typescript
// Orchestrator가 Game Lead에게 작업 위임
Task({
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: `당신은 Fortune's Hand 게임의 **Game Domain Lead**입니다.

## 담당 모듈
- cards, poker, slots, roulette

## 작업 목표
[구체적인 작업 설명]

## 구현 요구사항
[상세 요구사항]

## 작업 순서
1. 현재 코드 파악
2. 설계
3. 구현
4. 테스트 작성

코드를 직접 작성해주세요.`,
  description: "Game Lead: [작업 요약]"
})
```

### 병렬 실행

독립적인 작업은 여러 Lead를 동시에 실행:

```typescript
// 병렬로 3개 Lead 실행
Task({ subagent_type: "general-purpose", model: "sonnet", prompt: "Game Lead..." });
Task({ subagent_type: "general-purpose", model: "sonnet", prompt: "UI Lead..." });
Task({ subagent_type: "general-purpose", model: "sonnet", prompt: "Economy Lead..." });
```

### 백그라운드 실행

긴 작업은 백그라운드로:

```typescript
Task({
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: "...",
  run_in_background: true
})
```

## 작업 흐름

### 1. 기능 추가

```
Orchestrator
    │
    ├─> 요구사항 분석
    │
    ├─> 관련 도메인 Lead 선정
    │
    ├─> Lead에게 작업 위임 (Task 도구)
    │
    ├─> Lead가 구현 + 테스트
    │
    ├─> Orchestrator가 결과 검증
    │
    └─> 통합 테스트 실행
```

### 2. 버그 수정

```
Orchestrator
    │
    ├─> 버그 원인 분석 (Explore 에이전트)
    │
    ├─> 담당 도메인 Lead 선정
    │
    ├─> Lead에게 수정 위임
    │
    └─> 테스트 확인
```

### 3. 크로스 도메인 작업

여러 모듈에 걸친 작업:

```
Orchestrator
    │
    ├─> 작업 분해
    │
    ├─> 각 Lead에게 부분 작업 위임 (병렬)
    │
    ├─> 결과 통합 (Core Lead)
    │
    └─> 전체 테스트
```

## Lead에게 전달할 컨텍스트

모든 Lead 프롬프트에 포함해야 할 정보:

1. **역할 명시**: "당신은 Fortune's Hand 게임의 **{Domain} Lead**입니다."
2. **담당 모듈**: 구체적인 폴더 경로
3. **작업 목표**: 무엇을 해야 하는지 명확히
4. **현재 상황**: 관련 코드/데이터 위치
5. **구현 요구사항**: 상세한 스펙
6. **제약 조건**: 인터페이스, 모듈 경계 등
7. **작업 순서**: 단계별 가이드
8. **테스트 요구**: 테스트 작성 명시

## 품질 기준

모든 Lead 작업 완료 조건:

- [ ] TypeScript 타입체크 통과
- [ ] 모든 기존 테스트 통과
- [ ] 새 기능에 대한 테스트 추가
- [ ] CLAUDE.md 규칙 준수
- [ ] 모듈 경계 준수 (직접 import 금지)
- [ ] interfaces.ts 타입 사용

## 예시: 특수 카드 트리거 구현

**Orchestrator → Game Lead**:

```
당신은 Fortune's Hand 게임의 **Game Domain Lead**입니다.

## 담당 모듈
- cards, poker, slots, roulette

## 작업 목표
특수 카드 트리거 시스템을 구현해야 합니다.

### 현재 상황
- `src/data/cards.json`에 특수 카드 정의됨
- `triggerSlot: true`, `triggerRoulette: true` 속성 있음
- 실제 트리거 로직 미구현

### 구현 요구사항
1. PLAY_PHASE에서 트리거 카드 감지
2. triggerSlot → 미니 슬롯 스핀
3. triggerRoulette → 추가 룰렛 스핀

코드를 직접 작성해주세요. 테스트도 포함해주세요.
```

**결과**:
- `src/modules/cards/triggers.ts` 생성
- 42개 테스트 추가
- GameState에 필드 추가
- store.ts에 통합

## 현재 구현 현황

### 완료된 Lead 작업

| 작업 | Lead | 테스트 | 상태 |
|------|------|--------|------|
| 특수 카드 트리거 | Game | +42 | ✓ |
| 카드 강화 시스템 | Game | +19 | ✓ |

### 전체 테스트 현황

- 총 테스트: 788개
- 통과: 788개 (100%)
- 커버리지: 80%+

## 주의사항

1. **모듈 경계 준수**: Lead는 담당 모듈만 수정
2. **인터페이스 통일**: `src/types/interfaces.ts` 사용
3. **테스트 필수**: 새 기능에 반드시 테스트 추가
4. **문서화**: 복잡한 로직은 주석 또는 docs 추가
5. **백업 검증**: Lead 작업 후 반드시 `npm test && npm run typecheck`
