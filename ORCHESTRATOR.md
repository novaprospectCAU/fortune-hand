# Fortune's Hand - 오케스트레이터 관리 문서

## 현재 상태

**마일스톤**: M1 - Core Loop (MVP)
**상태**: 🟡 진행중

## 브랜치 전략

```
main (안정 버전)
  └── develop (통합 브랜치)
        ├── feature/core-module     → Agent 1
        ├── feature/slots-module    → Agent 2
        ├── feature/cards-module    → Agent 3
        ├── feature/poker-module    → Agent 4
        ├── feature/roulette-module → Agent 5
        ├── feature/jokers-module   → Agent 6
        ├── feature/shop-module     → Agent 7
        └── feature/ui-module       → Agent 8
```

## Worktree 구조

| 경로 | 브랜치 | 에이전트 |
|------|--------|----------|
| `/Users/waynelee/fortune-hand` | develop | 오케스트레이터 |
| `/Users/waynelee/fortune-hand-worktrees/agent1-core` | feature/core-module | Agent 1 |
| `/Users/waynelee/fortune-hand-worktrees/agent2-slots` | feature/slots-module | Agent 2 |
| `/Users/waynelee/fortune-hand-worktrees/agent3-cards` | feature/cards-module | Agent 3 |
| `/Users/waynelee/fortune-hand-worktrees/agent4-poker` | feature/poker-module | Agent 4 |
| `/Users/waynelee/fortune-hand-worktrees/agent5-roulette` | feature/roulette-module | Agent 5 |
| `/Users/waynelee/fortune-hand-worktrees/agent6-jokers` | feature/jokers-module | Agent 6 |
| `/Users/waynelee/fortune-hand-worktrees/agent7-shop` | feature/shop-module | Agent 7 |
| `/Users/waynelee/fortune-hand-worktrees/agent8-ui` | feature/ui-module | Agent 8 |

## M1 작업 현황

### 에이전트별 진행 상태

| 에이전트 | 모듈 | 상태 | 우선순위 | 의존성 |
|----------|------|------|----------|--------|
| Agent 3 | Cards | 🔴 대기 | **높음** | 없음 |
| Agent 2 | Slots | 🔴 대기 | 높음 | 없음 |
| Agent 5 | Roulette | 🔴 대기 | 높음 | 없음 |
| Agent 8 | UI | 🔴 대기 | 높음 | 없음 |
| Agent 4 | Poker | 🔴 대기 | 중간 | Cards |
| Agent 6 | Jokers | 🔴 대기 | 낮음 | Cards, Slots |
| Agent 7 | Shop | 🔴 대기 | 낮음 | Jokers |
| Agent 1 | Core | 🔴 대기 | **마지막** | 모든 모듈 |

### 권장 머지 순서

1. **1차 머지** (병렬 가능)
   - `feature/cards-module` → develop
   - `feature/slots-module` → develop
   - `feature/roulette-module` → develop
   - `feature/ui-module` → develop

2. **2차 머지** (1차 완료 후)
   - `feature/poker-module` → develop

3. **3차 머지** (2차 완료 후)
   - `feature/jokers-module` → develop
   - `feature/shop-module` → develop

4. **최종 머지** (모든 모듈 완료 후)
   - `feature/core-module` → develop

5. **릴리스**
   - develop → main (M1 완료 시)

## 오케스트레이터 명령어

### 에이전트 작업 시작
```bash
# 특정 에이전트 worktree로 이동하여 Claude 실행
cd /Users/waynelee/fortune-hand-worktrees/agent3-cards
claude  # AGENT_TASK.md 읽고 작업 시작하도록 지시
```

### PR 생성 (에이전트가 push 후)
```bash
gh pr create --base develop --head feature/cards-module --title "feat(cards): ..." --body "..."
```

### 머지 전 검증
```bash
# develop으로 체크아웃
git checkout develop

# feature 브랜치 머지 (로컬 테스트)
git merge --no-ff feature/cards-module

# 테스트 실행
npm test
npm run typecheck

# 문제 없으면 푸시
git push origin develop
```

### 충돌 해결
```bash
# 충돌 발생 시
git checkout develop
git pull origin develop

# 해당 feature 브랜치로 이동
git checkout feature/cards-module
git rebase develop

# 충돌 해결 후
git add .
git rebase --continue
git push --force-with-lease origin feature/cards-module
```

### Worktree 정리 (모듈 완료 후)
```bash
# worktree 제거
git worktree remove /Users/waynelee/fortune-hand-worktrees/agent3-cards

# 브랜치 삭제 (머지 후)
git branch -d feature/cards-module
git push origin --delete feature/cards-module
```

## 버전 관리

### M1 완료 시
```bash
git checkout main
git merge develop
git tag -a v0.1.0-alpha -m "M1: Core Loop MVP"
git push origin main --tags
```

### 버전 규칙
- `v0.1.x`: M1 (Core Loop)
- `v0.2.x`: M2 (Full Mechanics)
- `v0.3.x`: M3 (Polish)
- `v1.0.0`: M4 (Launch)

## 에이전트 커뮤니케이션

### 에이전트 실행 방법
```bash
# 새 터미널에서 각 에이전트 실행
cd /Users/waynelee/fortune-hand-worktrees/agent3-cards
claude "AGENT_TASK.md를 읽고 작업을 시작해줘. 완료되면 커밋하고 푸시해."
```

### 작업 완료 확인
```bash
# 모든 브랜치 상태 확인
git branch -vv

# 특정 브랜치 로그 확인
git log --oneline feature/cards-module

# PR 상태 확인
gh pr list
```

## 긴급 상황 대응

### 빌드 실패 시
1. 해당 에이전트에게 수정 요청
2. 또는 직접 hotfix 브랜치 생성하여 수정

### 충돌 다수 발생 시
1. develop 기준으로 rebase 강제
2. 필요시 해당 feature 브랜치 재생성

### 에이전트 무응답 시
1. worktree 상태 확인
2. 필요시 다른 에이전트에게 작업 위임

## 다음 단계 (M2)

M1 완료 후:
1. 모든 feature 브랜치 정리
2. develop → main 머지
3. M2 작업용 새 feature 브랜치 생성
4. 각 에이전트 AGENT_TASK.md 업데이트
