/**
 * Badge Component
 *
 * A small badge for displaying status, counts, or labels.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { scaleIn } from '../../animations/variants';

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  rounded?: boolean;
  animated?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-slate-600 text-slate-100',
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-amber-500 text-white',
  danger: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
};

const rarityStyles = {
  common: 'bg-rarity-common text-slate-900',
  uncommon: 'bg-rarity-uncommon text-white',
  rare: 'bg-rarity-rare text-white',
  legendary: 'bg-rarity-legendary text-slate-900 animate-pulse-glow',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({
  variant = 'default',
  size = 'md',
  rarity,
  rounded = false,
  animated = false,
  children,
  className,
}: BadgeProps) {
  const Component = animated ? motion.span : 'span';
  const motionProps = animated
    ? {
        variants: scaleIn,
        initial: 'initial',
        animate: 'animate',
        exit: 'exit',
      }
    : {};

  return (
    <Component
      {...motionProps}
      className={clsx(
        'inline-flex items-center justify-center font-medium',
        rounded ? 'rounded-full' : 'rounded',
        sizeStyles[size],
        rarity ? rarityStyles[rarity] : variantStyles[variant],
        className
      )}
    >
      {children}
    </Component>
  );
}

export default Badge;
