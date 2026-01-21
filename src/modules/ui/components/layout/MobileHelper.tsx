/**
 * MobileHelper Component
 *
 * Provides mobile-specific utilities like orientation warnings.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileHelper() {
  const [showOrientationHint, setShowOrientationHint] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const landscape = window.innerWidth > window.innerHeight;

      // Show hint on small landscape screens (like phones in landscape)
      const shouldShowHint = landscape && window.innerHeight < 500;
      setShowOrientationHint(shouldShowHint);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return (
    <AnimatePresence>
      {showOrientationHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowOrientationHint(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-game-surface border-2 border-game-border rounded-2xl p-6 max-w-sm text-center"
          >
            {/* Phone rotation icon */}
            <div className="w-16 h-16 mx-auto mb-4 text-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <path d="M12 18h.01" />
                <path d="M7 2l10 0" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              Portrait Mode Recommended
            </h2>
            <p className="text-slate-400 mb-4">
              For the best experience, please rotate your device to portrait mode.
            </p>
            <button
              onClick={() => setShowOrientationHint(false)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Continue Anyway
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileHelper;
