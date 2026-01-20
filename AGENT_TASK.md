# Agent 8: UI Module 작업 지시서

## 역할
공통 UI 컴포넌트 및 레이아웃 담당

## 브랜치
- 작업 브랜치: `feature/ui-module`
- 머지 대상: `develop`

## M1 작업 목록

### 1단계: 테마 및 스타일
- [ ] `src/modules/ui/styles/theme.ts`
  ```typescript
  export const colors = {
    // 메인
    primary: '#6366f1',    // Indigo
    secondary: '#8b5cf6',  // Violet
    accent: '#f59e0b',     // Amber (Gold)

    // 상태
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',

    // 카드 색상
    hearts: '#ef4444',
    diamonds: '#ef4444',
    clubs: '#1f2937',
    spades: '#1f2937',

    // 희귀도
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    legendary: '#f59e0b',

    // 배경
    bg: {
      primary: '#0f172a',
      secondary: '#1e293b',
      card: '#334155',
    },
  };
  ```

### 2단계: 애니메이션 프리셋
- [ ] `src/modules/ui/animations/variants.ts`
  ```typescript
  export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  export const slideUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  export const scaleIn = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  };

  export const scorePopup = {
    initial: { scale: 0, y: 0 },
    animate: { scale: 1, y: -50 },
    exit: { scale: 0, opacity: 0 },
  };
  ```
- [ ] `src/modules/ui/animations/springs.ts`
- [ ] `src/modules/ui/animations/transitions.ts`

### 3단계: 공통 컴포넌트
- [ ] `src/modules/ui/components/common/Button.tsx`
  ```tsx
  interface ButtonProps {
    variant: 'primary' | 'secondary' | 'danger' | 'ghost';
    size: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }
  ```
- [ ] `src/modules/ui/components/common/Modal.tsx`
  ```tsx
  interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
  }
  ```
- [ ] `src/modules/ui/components/common/Tooltip.tsx`
- [ ] `src/modules/ui/components/common/Badge.tsx`
- [ ] `src/modules/ui/components/common/ProgressBar.tsx`

### 4단계: 레이아웃 컴포넌트
- [ ] `src/modules/ui/components/layout/GameLayout.tsx`
  ```
  ┌─────────────────────────────────────────────────────────┐
  │ Header: Round, Target Score, Current Score, Phase      │
  ├───────────────────────────┬─────────────────────────────┤
  │                           │                             │
  │   Main Area:              │   Sidebar:                  │
  │   - Slot Machine          │   - Jokers                  │
  │   - Card Hand             │   - Resources               │
  │   - Roulette              │   - Run Info                │
  │                           │                             │
  ├───────────────────────────┴─────────────────────────────┤
  │ Footer: Action Buttons (Play, Discard, Spin, Skip)     │
  └─────────────────────────────────────────────────────────┘
  ```
- [ ] `src/modules/ui/components/layout/Header.tsx`
- [ ] `src/modules/ui/components/layout/Sidebar.tsx`
- [ ] `src/modules/ui/components/layout/Footer.tsx`

### 5단계: 표시 컴포넌트
- [ ] `src/modules/ui/components/display/ScoreDisplay.tsx`
  - 현재 점수 표시
  - 목표 점수 표시
  - 진행률 바
- [ ] `src/modules/ui/components/display/GoldDisplay.tsx`
  - 현재 골드 표시
  - 변화 애니메이션
- [ ] `src/modules/ui/components/display/RoundInfo.tsx`
  - 라운드 번호
  - 남은 Hands/Discards
- [ ] `src/modules/ui/components/display/PhaseIndicator.tsx`
  - 현재 페이즈 표시
  - 페이즈 전환 애니메이션

### 6단계: 피드백 컴포넌트
- [ ] `src/modules/ui/components/feedback/ScorePopup.tsx`
  - 점수 획득 시 팝업
  - 숫자 카운트업 애니메이션
  - 보너스별 색상 구분
- [ ] `src/modules/ui/components/feedback/Toast.tsx`
- [ ] `src/modules/ui/components/feedback/EffectText.tsx`
  - 조커 효과 발동 텍스트

### 7단계: 훅
- [ ] `src/modules/ui/hooks/useAnimation.ts`
- [ ] `src/modules/ui/hooks/useTooltip.ts`

### 8단계: Export
- [ ] `src/modules/ui/index.ts`

## TailwindCSS 반응형
```typescript
// 기본: 모바일 레이아웃
// md (768px) 이상: 데스크톱 레이아웃

// 예시
<div className="flex flex-col md:flex-row">
  <main className="flex-1">Main Area</main>
  <aside className="w-full md:w-64">Sidebar</aside>
</div>
```

## 테스트 요구사항
```bash
npm test src/modules/ui
```
- 컴포넌트 렌더링 테스트
- 접근성 테스트 (aria 속성)
- 반응형 레이아웃 테스트
- 애니메이션 완료 콜백 테스트

## 작업 완료 후
```bash
git add .
git commit -m "feat(ui): implement common UI components and layout

- Add theme colors and animation presets
- Create common components (Button, Modal, Tooltip)
- Implement GameLayout with Header, Sidebar, Footer
- Add display components for score and resources

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin feature/ui-module
```

## 참조 문서
- `src/modules/ui/CLAUDE.md`
- TailwindCSS 문서
- Framer Motion 문서
