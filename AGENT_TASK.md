# Agent 1: Core Module 작업 지시서

## 역할
게임 상태 관리 및 턴 흐름 제어 담당

## 브랜치
- 작업 브랜치: `feature/core-module`
- 머지 대상: `develop`

## M1 작업 목록

### 1단계: 기본 구조 설정
- [ ] `src/modules/core/types.ts` - 모듈 내부 타입 정의
- [ ] `src/modules/core/store.ts` - Zustand store 생성
  - GameState 초기값 설정
  - 기본 액션 구현 (startGame, nextPhase)
- [ ] `src/modules/core/index.ts` - public API export

### 2단계: 페이즈 전환 로직
- [ ] `src/modules/core/gameLoop.ts`
  - PHASE_TRANSITIONS 상수 정의
  - nextPhase() 로직 구현
  - 조건부 전환 (REWARD_PHASE → SLOT_PHASE or SHOP_PHASE)

### 3단계: 이벤트 시스템
- [ ] `src/modules/core/events.ts`
  - EventEmitter 구현
  - emit, on, off 메서드

### 4단계: 액션 구현
```typescript
// 구현해야 할 액션들
startGame(config?: Partial<GameConfig>): void
nextPhase(): void
spinSlot(): void  // slots 모듈 호출
selectCard(cardId: string): void
deselectCard(cardId: string): void
playHand(): void  // poker 모듈 호출
discardSelected(): void
spinRoulette(): void  // roulette 모듈 호출
skipRoulette(): void
```

## 의존성
- `@/types/interfaces` - 공유 타입
- `@/data/constants` - 상수
- 다른 모듈 호출 시 인터페이스만 사용

## 테스트 요구사항
```bash
npm test src/modules/core
```
- 모든 페이즈 전환 테스트
- 상태 불변성 테스트
- 이벤트 발행 테스트

## 주의사항
- 다른 모듈 로직 직접 구현 금지
- UI 컴포넌트 생성 금지
- 데이터 파일 직접 수정 금지

## 작업 완료 후
```bash
git add .
git commit -m "feat(core): implement game state and phase transitions

- Add Zustand store with GameState
- Implement phase transition logic
- Add event system foundation

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin feature/core-module
```

## 참조 문서
- `src/modules/core/CLAUDE.md`
- `specs/interfaces.ts`
- `specs/game-loop.md`
