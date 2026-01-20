/**
 * Toast Component
 *
 * Notification toast with auto-dismiss and different variants.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { toast as toastVariants } from '../../animations/variants';
import { zIndex } from '../../styles/theme';

export interface ToastProps {
  id: string;
  message: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  isVisible: boolean;
  onDismiss: (id: string) => void;
  className?: string;
}

const variantStyles = {
  default: {
    bg: 'bg-game-card',
    border: 'border-game-border',
    icon: null,
    iconColor: '',
  },
  success: {
    bg: 'bg-green-900/80',
    border: 'border-green-700',
    icon: 'checkmark',
    iconColor: 'text-green-400',
  },
  warning: {
    bg: 'bg-amber-900/80',
    border: 'border-amber-700',
    icon: 'warning',
    iconColor: 'text-amber-400',
  },
  error: {
    bg: 'bg-red-900/80',
    border: 'border-red-700',
    icon: 'error',
    iconColor: 'text-red-400',
  },
  info: {
    bg: 'bg-blue-900/80',
    border: 'border-blue-700',
    icon: 'info',
    iconColor: 'text-blue-400',
  },
};

const icons = {
  checkmark: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function Toast({
  id,
  message,
  variant = 'default',
  duration = 3000,
  isVisible,
  onDismiss,
  className,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, isVisible, duration, onDismiss]);

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          role="alert"
          className={clsx(
            'flex items-center gap-3',
            'px-4 py-3 rounded-lg',
            'shadow-lg backdrop-blur-sm',
            'border',
            styles.bg,
            styles.border,
            className
          )}
        >
          {/* Icon */}
          {styles.icon && (
            <span className={styles.iconColor} aria-hidden="true">
              {icons[styles.icon as keyof typeof icons]}
            </span>
          )}

          {/* Message */}
          <span className="text-white text-sm font-medium flex-1">
            {message}
          </span>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => onDismiss(id)}
            className={clsx(
              'p-1 rounded',
              'text-slate-400 hover:text-white',
              'hover:bg-white/10',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-white/20'
            )}
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast Container Component
export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    variant?: ToastProps['variant'];
    duration?: number;
  }>;
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function ToastContainer({
  toasts,
  onDismiss,
  position = 'top-right',
  className,
}: ToastContainerProps) {
  return (
    <div
      className={clsx(
        'fixed flex flex-col gap-2',
        positionStyles[position],
        className
      )}
      style={{ zIndex: zIndex.toast }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            isVisible={true}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default Toast;
