/**
 * Error Fallback Component
 *
 * UI displayed when an error is caught by the Error Boundary.
 * Provides options to retry or return to the home screen.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Button } from './Button';
import { scaleIn, slideUp } from '../../animations/variants';

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
}

/**
 * Fallback UI component shown when an error occurs.
 * Features a game-themed design with retry and home options.
 */
export function ErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {
  const isDev = import.meta.env.DEV;

  const handleHome = () => {
    // Reload the page to return to initial state
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        className="w-full max-w-2xl"
      >
        <div className="bg-game-surface rounded-xl border-2 border-red-500/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-center">
            <motion.div
              variants={slideUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.1 }}
            >
              {/* Skull emoji */}
              <div className="text-6xl mb-4" aria-hidden="true">
                💀
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Fortune Has Failed
              </h1>
              <p className="text-red-100 text-lg">
                Something went wrong with the game
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <motion.div
              variants={slideUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
            >
              <p className="text-gray-300 text-center mb-6">
                Don't worry! Your luck hasn't run out yet. Try one of the options below:
              </p>

              {/* Error details (dev mode only) */}
              {isDev && error && (
                <div className="mb-6 bg-game-card rounded-lg p-4 border border-game-border">
                  <h2 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Error Details (Development)
                  </h2>
                  <div className="text-xs font-mono text-gray-400 space-y-2">
                    <div>
                      <span className="text-gray-500">Message:</span>
                      <pre className="mt-1 text-red-300 whitespace-pre-wrap break-words">
                        {error.message}
                      </pre>
                    </div>
                    {error.stack && (
                      <div>
                        <span className="text-gray-500">Stack:</span>
                        <pre className="mt-1 text-gray-400 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div>
                        <span className="text-gray-500">Component Stack:</span>
                        <pre className="mt-1 text-gray-400 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onReset}
                  fullWidth
                  className="flex-1"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try Again
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleHome}
                  fullWidth
                  className="flex-1"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Return Home
                </Button>
              </div>

              {/* Help text */}
              <div
                className={clsx(
                  'mt-6 p-4 rounded-lg',
                  'bg-blue-500/10 border border-blue-500/20'
                )}
              >
                <p className="text-sm text-blue-300 text-center">
                  If this error persists, try refreshing the page or clearing your browser cache.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ErrorFallback;
