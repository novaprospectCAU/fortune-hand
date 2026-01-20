/**
 * Button Component
 *
 * A versatile button component with multiple variants, sizes, and states.
 */

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { buttonPress } from '../../animations/variants';
import { buttonSpring } from '../../animations/springs';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  primary: clsx(
    'bg-primary hover:bg-primary-dark active:bg-primary-dark',
    'text-white',
    'border-transparent',
    'shadow-md hover:shadow-lg'
  ),
  secondary: clsx(
    'bg-secondary hover:bg-secondary-dark active:bg-secondary-dark',
    'text-white',
    'border-transparent',
    'shadow-md hover:shadow-lg'
  ),
  danger: clsx(
    'bg-red-500 hover:bg-red-600 active:bg-red-700',
    'text-white',
    'border-transparent',
    'shadow-md hover:shadow-lg'
  ),
  success: clsx(
    'bg-green-500 hover:bg-green-600 active:bg-green-700',
    'text-white',
    'border-transparent',
    'shadow-md hover:shadow-lg'
  ),
  ghost: clsx(
    'bg-transparent hover:bg-game-surface active:bg-game-card',
    'text-slate-300 hover:text-white',
    'border-game-border hover:border-slate-500'
  ),
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-4 py-2 text-base rounded-lg gap-2',
  lg: 'px-6 py-3 text-lg rounded-xl gap-2.5',
};

const disabledStyles = clsx(
  'opacity-50 cursor-not-allowed',
  'hover:bg-inherit active:bg-inherit',
  'hover:shadow-none'
);

const loadingStyles = 'cursor-wait';

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  className,
  onClick,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled && onClick) {
      onClick(event);
    }
  };

  return (
    <motion.button
      variants={buttonPress}
      initial="initial"
      whileHover={isDisabled ? undefined : 'hover'}
      whileTap={isDisabled ? undefined : 'tap'}
      animate={isDisabled ? 'disabled' : 'initial'}
      transition={{
        type: 'spring',
        ...buttonSpring,
      }}
      className={clsx(
        'inline-flex items-center justify-center',
        'font-medium transition-colors duration-150',
        'border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-game-bg',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && disabledStyles,
        loading && loadingStyles,
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      onClick={handleClick}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  );
}

export default Button;
