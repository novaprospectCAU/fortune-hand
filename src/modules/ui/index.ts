/**
 * UI Module - Public API
 *
 * Common UI components and utilities for Fortune's Hand game.
 */

// Styles & Theme
export { theme, colors, spacing, borderRadius, fontSize, fontWeight, zIndex, shadows } from './styles/theme';
export { getRarityColor, getSuitColor, isRedSuit } from './styles/theme';

// Animations
export * from './animations';

// Common Components
export {
  Button,
  type ButtonProps,
  Modal,
  type ModalProps,
  Tooltip,
  type TooltipProps,
  Badge,
  type BadgeProps,
  ProgressBar,
  type ProgressBarProps,
  ErrorBoundary,
  type ErrorBoundaryProps,
  ErrorFallback,
  type ErrorFallbackProps,
} from './components/common';

// Layout Components
export {
  GameLayout,
  type GameLayoutProps,
  Header,
  type HeaderProps,
  Sidebar,
  type SidebarProps,
  Footer,
  type FooterProps,
} from './components/layout';

// Display Components
export {
  ScoreDisplay,
  type ScoreDisplayProps,
  GoldDisplay,
  type GoldDisplayProps,
  RoundInfo,
  type RoundInfoProps,
  PhaseIndicator,
  type PhaseIndicatorProps,
  DeckViewer,
  type DeckViewerProps,
} from './components/display';

// Feedback Components
export {
  ScorePopup,
  type ScorePopupProps,
  Toast,
  ToastContainer,
  type ToastProps,
  type ToastContainerProps,
  EffectText,
  MultiEffectText,
  type EffectTextProps,
  type MultiEffectTextProps,
  CardEffectTooltip,
  type CardEffectTooltipProps,
} from './components/feedback';

// Tutorial Components
export {
  TutorialOverlay,
  type TutorialOverlayProps,
  TutorialStep,
  type TutorialStepProps,
  TutorialHighlight,
  type TutorialHighlightProps,
} from './components/tutorial';

// Hooks
export {
  useAnimation,
  useSequentialAnimation,
  useAnimatedValue,
  type UseAnimationOptions,
  type UseAnimationReturn,
  type UseSequentialAnimationOptions,
  type UseSequentialAnimationReturn,
  type UseAnimatedValueOptions,
  type UseAnimatedValueReturn,
  useTooltip,
  useTooltipGroup,
  type TooltipPosition,
  type TooltipCoordinates,
  type UseTooltipOptions,
  type UseTooltipReturn,
  type UseTooltipGroupOptions,
  type UseTooltipGroupReturn,
  useTutorial,
  type TutorialStep as TutorialStepData,
  type TutorialState,
  type TutorialActions,
  type UseTutorialReturn,
} from './hooks';
