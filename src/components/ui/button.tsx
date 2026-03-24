'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'accent-cyan';
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
        'bg-gradient-to-r from-accent to-accent-hover text-white shadow-md hover:shadow-glow-accent active:shadow-sm',
    secondary:
        'glass-card text-text-primary hover:border-border-hover hover:bg-surface-hover',
    ghost:
        'text-text-secondary hover:text-text-primary hover:bg-surface-hover',
    danger:
        'bg-gradient-to-r from-danger to-danger-light/90 text-white shadow-md hover:shadow-glow-danger',
    outline:
        'border border-border-glass-strong text-text-secondary hover:text-text-primary hover:border-accent/30 hover:bg-surface-hover',
    'accent-cyan':
        'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 hover:shadow-glow-cyan',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-8 px-3.5 text-xs gap-1.5 rounded-[var(--radius-sm)]',
    md: 'h-10 px-5 text-sm gap-2 rounded-[var(--radius-md)]',
    lg: 'h-12 px-7 text-sm gap-2.5 rounded-[var(--radius-lg)]',
    icon: 'h-10 w-10 rounded-[var(--radius-md)] justify-center',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, icon, iconRight, children, disabled, glow, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={!disabled && !loading ? { scale: 1.02, transition: { duration: 0.15 } } : undefined}
                whileTap={!disabled && !loading ? { scale: 0.96, transition: { duration: 0.08 } } : undefined}
                className={cn(
                    'inline-flex items-center justify-center font-semibold tracking-wide',
                    'transition-all duration-200 ease-out',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
                    'cursor-pointer select-none',
                    variantStyles[variant],
                    sizeStyles[size],
                    glow && 'glow-accent',
                    className
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
    }
);

Button.displayName = 'Button';
export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
