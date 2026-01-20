/**
 * Modal Component
 *
 * A modal dialog with overlay, animations, and accessibility features.
 */

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { modal, overlay } from '../../animations/variants';
import { zIndex } from '../../styles/theme';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
}: ModalProps) {
  // Handle escape key press
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleEscape]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0"
          style={{ zIndex: zIndex.modal }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Overlay */}
          <motion.div
            variants={overlay}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
          >
            {/* Modal Content */}
            <motion.div
              variants={modal}
              initial="initial"
              animate="animate"
              exit="exit"
              className={clsx(
                'relative w-full',
                'bg-game-surface rounded-xl shadow-2xl',
                'border border-game-border',
                sizeStyles[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-game-border">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-xl font-semibold text-white"
                    >
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className={clsx(
                        'p-1 rounded-lg',
                        'text-slate-400 hover:text-white',
                        'hover:bg-game-card',
                        'transition-colors duration-150',
                        'focus:outline-none focus:ring-2 focus:ring-primary'
                      )}
                      aria-label="Close modal"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="px-6 py-4">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
