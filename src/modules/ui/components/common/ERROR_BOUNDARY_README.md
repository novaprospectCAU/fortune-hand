# Error Boundary Implementation

## Overview

The Error Boundary system for Fortune's Hand game provides graceful error handling with a user-friendly fallback UI. This implementation follows React best practices and integrates seamlessly with the existing UI module.

## Components

### 1. ErrorBoundary (`ErrorBoundary.tsx`)

A React class component that catches JavaScript errors anywhere in its child component tree.

**Features:**
- Catches rendering errors, lifecycle method errors, and constructor errors
- Displays customizable fallback UI
- Provides reset functionality
- Logs errors in development mode
- Supports custom error handlers
- Fully typed with TypeScript

**Usage:**
```tsx
import { ErrorBoundary } from '@/modules/ui';

// Basic usage
<ErrorBoundary>
  <App />
</ErrorBoundary>

// With error logging
<ErrorBoundary onError={(error, errorInfo) => logToService(error, errorInfo)}>
  <App />
</ErrorBoundary>

// With reset handler
<ErrorBoundary onReset={() => resetGameState()}>
  <App />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <App />
</ErrorBoundary>
```

**Props:**
- `children`: ReactNode - The components to wrap and protect
- `fallback?`: ReactNode - Custom fallback UI (optional)
- `onError?`: (error, errorInfo) => void - Error callback (optional)
- `onReset?`: () => void - Reset callback (optional)

### 2. ErrorFallback (`ErrorFallback.tsx`)

The default fallback UI shown when an error is caught.

**Features:**
- Game-themed design matching Fortune's Hand aesthetics
- Skull emoji (💀) for visual impact
- "Try Again" button to reset error state
- "Return Home" button to reload the page
- Error details display (development mode only)
- Responsive design
- Accessible with ARIA labels
- Animated entrance using Framer Motion

**Props:**
- `error`: Error | null - The error object
- `errorInfo`: React.ErrorInfo | null - Component stack information
- `onReset`: () => void - Callback to reset error state

## Integration

### Application Level (main.tsx)

The ErrorBoundary is integrated at the top level of the application:

```tsx
import { ErrorBoundary } from '@/modules/ui';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
```

### Module Exports

Both components are exported from the UI module:

```tsx
// src/modules/ui/index.ts
export {
  ErrorBoundary,
  type ErrorBoundaryProps,
  ErrorFallback,
  type ErrorFallbackProps,
} from './components/common';
```

## Error Details Display

In development mode (`import.meta.env.DEV`), the ErrorFallback component displays:
- Error message
- Error stack trace
- React component stack

In production mode, these details are hidden for security and UX purposes.

## Testing

Comprehensive test suites are provided for both components:

### ErrorBoundary Tests (`ErrorBoundary.test.tsx`)
- ✓ Renders children when there is no error
- ✓ Renders children without throwing when component does not error
- ✓ Catches error and displays fallback UI
- ✓ Displays error message in development mode
- ✓ Calls onError callback when error occurs
- ✓ Renders custom fallback when provided
- ✓ Resets error state when reset is called
- ✓ Calls onReset callback when reset button is clicked
- ✓ Has accessible error UI
- ✓ Handles multiple errors correctly
- ✓ Does not catch errors from event handlers

### ErrorFallback Tests (`ErrorFallback.test.tsx`)
- ✓ Renders error fallback UI
- ✓ Displays action buttons
- ✓ Calls onReset when Try Again button is clicked
- ✓ Reloads page when Return Home button is clicked
- ✓ Shows error details when provided
- ✓ Always shows action buttons
- ✓ Displays error when provided
- ✓ Handles null error gracefully
- ✓ Handles null errorInfo gracefully
- ✓ Displays component information when provided
- ✓ Displays help text
- ✓ Has game-themed styling
- ✓ Is keyboard accessible
- ✓ Renders with proper ARIA labels

**Run Tests:**
```bash
npm test src/modules/ui/components/common/ErrorBoundary.test.tsx
npm test src/modules/ui/components/common/ErrorFallback.test.tsx
```

## Files Created

1. `/src/modules/ui/components/common/ErrorBoundary.tsx` - Main error boundary component
2. `/src/modules/ui/components/common/ErrorFallback.tsx` - Default fallback UI
3. `/src/modules/ui/components/common/ErrorBoundary.test.tsx` - ErrorBoundary tests
4. `/src/modules/ui/components/common/ErrorFallback.test.tsx` - ErrorFallback tests
5. `/src/modules/ui/components/common/ErrorBoundary.example.tsx` - Usage examples
6. `/src/vite-env.d.ts` - Vite environment type definitions

## Files Modified

1. `/src/main.tsx` - Wrapped App with ErrorBoundary
2. `/src/modules/ui/components/common/index.ts` - Added exports
3. `/src/modules/ui/index.ts` - Added exports

## Design Decisions

### 1. Class Component for ErrorBoundary
Error boundaries must be class components as React doesn't support error boundaries with hooks yet.

### 2. Separation of Concerns
The ErrorBoundary handles error catching logic, while ErrorFallback handles UI presentation.

### 3. Development vs Production
Error details are only shown in development to avoid exposing sensitive information in production.

### 4. Game-Themed Design
The fallback UI uses the game's visual language (skull emoji, color scheme, terminology like "Fortune Has Failed").

### 5. Two Recovery Options
- "Try Again" - Resets error state, attempts to re-render
- "Return Home" - Hard refresh to clean state

### 6. Accessibility First
All interactive elements have proper ARIA labels and keyboard support.

## Important Notes

### What Error Boundaries DON'T Catch:
- ❌ Event handlers (use try-catch)
- ❌ Asynchronous code (setTimeout, promises)
- ❌ Server-side rendering errors
- ❌ Errors in the error boundary itself

### Best Practices:
1. Place ErrorBoundary at the top level for application-wide protection
2. Add multiple boundaries for granular error isolation
3. Always provide an onReset handler to clean up state
4. Log errors to monitoring services in production
5. Test error boundaries with intentional errors in development

## Future Enhancements

Potential improvements for future iterations:
- Error reporting service integration (e.g., Sentry)
- Error analytics and tracking
- Customizable retry strategies
- Error recovery hints based on error type
- Offline error queue for network errors
- User feedback collection on errors

## Browser Support

Compatible with all modern browsers that support:
- ES6 classes
- React 18+
- Framer Motion animations

## Performance

- Minimal runtime overhead
- Only renders fallback UI when errors occur
- Lazy error logging in development
- No impact on production bundle size when error details are stripped

## Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigable
- Screen reader friendly
- Proper ARIA attributes
- Focus management

---

**Created by:** UI Domain Lead
**Date:** 2026-01-21
**Version:** 1.0.0
