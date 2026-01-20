# UI 모듈

공통 UI 컴포넌트 및 레이아웃 담당

## 책임

- 공통 UI 컴포넌트 (버튼, 모달, 툴팁 등)
- 게임 레이아웃
- 점수/자원 표시
- 애니메이션 유틸리티
- 테마/스타일 시스템

## 절대 하지 않는 것

- 게임 로직
- 상태 관리 (표시만)
- 모듈별 전용 컴포넌트 (각 모듈에서 관리)

## 주요 파일

```
src/modules/ui/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Badge.tsx
│   │   └── ProgressBar.tsx
│   ├── layout/
│   │   ├── GameLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── display/
│   │   ├── ScoreDisplay.tsx
│   │   ├── GoldDisplay.tsx
│   │   ├── RoundInfo.tsx
│   │   └── PhaseIndicator.tsx
│   └── feedback/
│       ├── ScorePopup.tsx
│       ├── Toast.tsx
│       └── EffectText.tsx
├── animations/
│   ├── variants.ts      # Framer Motion variants
│   ├── springs.ts       # 스프링 설정
│   └── transitions.ts   # 트랜지션 프리셋
├── hooks/
│   ├── useAnimation.ts
│   └── useTooltip.ts
├── styles/
│   └── theme.ts         # 색상, 폰트 등
└── index.ts
```

## 레이아웃 구조

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

## 공통 컴포넌트 Props

```tsx
// Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Tooltip.tsx
interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}
```

## 애니메이션 Variants

```typescript
// animations/variants.ts
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

## 테마 컬러

```typescript
// styles/theme.ts
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

## 반응형 브레이크포인트

```typescript
// TailwindCSS 기본 사용
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px

// 모바일 우선 접근
// 기본: 모바일 레이아웃
// md 이상: 데스크톱 레이아웃
```

## 점수 표시 애니메이션

```tsx
// ScorePopup.tsx - 점수 획득 시 팝업
// - 숫자 카운트업 애니메이션
// - 보너스별 색상 구분
// - 최종 점수 강조

// 예: +150 Chips (초록) × 4 Mult (빨강) = 600 (금색, 크게)
```

## 테스트

```bash
pnpm test src/modules/ui
```

- 컴포넌트 렌더링 테스트
- 접근성 테스트 (aria 속성)
- 반응형 레이아웃 테스트
- 애니메이션 완료 콜백 테스트
