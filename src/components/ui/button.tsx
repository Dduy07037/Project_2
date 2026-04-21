'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { buttonTap } from '@/lib/motion';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'destructive'
  | 'outline'
  | 'accent-cyan';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size' | 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  glow?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border border-accent bg-accent text-white shadow-sm hover:border-accent-hover hover:bg-accent-hover',
  secondary:
    'border border-border-glass-strong bg-bg-secondary text-text-primary shadow-sm hover:border-border-hover hover:bg-bg-primary',
  ghost:
    'border border-transparent bg-transparent text-text-secondary shadow-none hover:bg-surface-hover hover:text-text-primary',
  danger:
    'border border-danger bg-danger text-white shadow-sm hover:border-danger-light hover:bg-danger-light',
  destructive:
    'border border-danger bg-danger text-white shadow-sm hover:border-danger-light hover:bg-danger-light',
  outline:
    'border border-border bg-transparent text-text-primary shadow-none hover:border-border-hover hover:bg-bg-secondary',
  'accent-cyan':
    'border border-accent/20 bg-accent/8 text-accent shadow-none hover:border-accent/30 hover:bg-accent/12',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-[var(--radius-sm)] px-3.5 text-xs',
  md: 'h-11 rounded-[var(--radius-md)] px-4 text-sm',
  lg: 'h-12 rounded-[var(--radius-lg)] px-6 text-sm',
  icon: 'h-10 w-10 rounded-[var(--radius-md)]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      icon,
      iconRight,
      children,
      disabled,
      glow,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !loading ? { y: -1 } : undefined}
        whileTap={!disabled && !loading ? buttonTap : undefined}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap',
          'font-medium tracking-[-0.01em]',
          'transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--duration-normal)] ease-[var(--ease-smooth)]',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/12',
          'disabled:pointer-events-none disabled:opacity-50',
          'cursor-pointer select-none',
          variantStyles[variant],
          sizeStyles[size],
          glow && 'shadow-sm',
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {size !== 'icon' && children}
        {iconRight && <span className="shrink-0">{iconRight}</span>}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonSize, ButtonVariant };
