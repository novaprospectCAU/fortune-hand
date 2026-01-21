/**
 * ErrorBoundary Usage Examples
 *
 * This file demonstrates how to use the ErrorBoundary component.
 * It's not imported anywhere - it's just for reference.
 */

import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from './Button';

/**
 * Example 1: Basic Usage
 * Wrap any component that might throw errors
 */
export function BasicExample() {
  return (
    <ErrorBoundary>
      <YourGameComponent />
    </ErrorBoundary>
  );
}

/**
 * Example 2: With Custom Error Handler
 * Log errors to an external service
 */
export function WithErrorLoggingExample() {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to error tracking service (e.g., Sentry)
    console.error('Error logged:', error, errorInfo);
    // logErrorToService(error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <YourGameComponent />
    </ErrorBoundary>
  );
}

/**
 * Example 3: With Custom Reset Handler
 * Reset game state when user tries again
 */
export function WithResetHandlerExample() {
  const handleReset = () => {
    // Reset game state
    console.log('Resetting game state...');
    // gameStore.reset();
  };

  return (
    <ErrorBoundary onReset={handleReset}>
      <YourGameComponent />
    </ErrorBoundary>
  );
}

/**
 * Example 4: With Custom Fallback UI
 * Show your own error UI instead of the default
 */
export function WithCustomFallbackExample() {
  const customFallback = (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Oops!</h1>
      <p className="text-gray-400">Something went wrong.</p>
      <Button onClick={() => window.location.reload()}>Reload Game</Button>
    </div>
  );

  return (
    <ErrorBoundary fallback={customFallback}>
      <YourGameComponent />
    </ErrorBoundary>
  );
}

/**
 * Example 5: Multiple Error Boundaries
 * Isolate errors to specific sections of your app
 */
export function MultipleErrorBoundariesExample() {
  return (
    <div>
      {/* Main app error boundary */}
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>

      {/* Game content error boundary */}
      <ErrorBoundary>
        <GameContent />
      </ErrorBoundary>

      {/* Sidebar error boundary */}
      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>
    </div>
  );
}

/**
 * Example 6: Testing Error Boundary
 * Component that throws an error for testing
 */
export function ErrorBoundaryTestDemo() {
  const [shouldError, setShouldError] = useState(false);

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Error Boundary Test</h2>

      <Button onClick={() => setShouldError(true)} variant="danger">
        Trigger Error
      </Button>

      <div className="mt-4">
        <ErrorBoundary onReset={() => setShouldError(false)}>
          {shouldError ? <ComponentThatThrows /> : <SafeComponent />}
        </ErrorBoundary>
      </div>
    </div>
  );
}

// Mock components for examples
function YourGameComponent() {
  return <div>Game Component</div>;
}

function Header() {
  return <header>Header</header>;
}

function GameContent() {
  return <main>Game Content</main>;
}

function Sidebar() {
  return <aside>Sidebar</aside>;
}

function SafeComponent() {
  return <div className="text-green-500">Everything is working fine!</div>;
}

function ComponentThatThrows() {
  throw new Error('This is a test error!');
}

/**
 * Example 7: Error Boundary with State Reset
 * Properly reset component state when recovering from error
 */
export function WithStateResetExample() {
  const [key, setKey] = useState(0);

  const handleReset = () => {
    // Reset component by changing its key
    setKey((prev) => prev + 1);
  };

  return (
    <ErrorBoundary onReset={handleReset}>
      <GameWithState key={key} />
    </ErrorBoundary>
  );
}

function GameWithState() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount((c) => c + 1)}>Increment</Button>
    </div>
  );
}

/**
 * Best Practices:
 *
 * 1. Place ErrorBoundary at the top level (in main.tsx)
 * 2. Add error boundaries around major sections for granular error handling
 * 3. Always provide onReset handler to properly clean up state
 * 4. Log errors to monitoring service in production
 * 5. Show helpful error messages to users
 * 6. Test error boundaries with intentional errors in development
 *
 * What Error Boundaries DON'T Catch:
 * - Event handlers (use try-catch)
 * - Asynchronous code (setTimeout, promises)
 * - Server-side rendering
 * - Errors in the error boundary itself
 */
