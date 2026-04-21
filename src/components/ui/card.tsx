'use client';

import { motion } from 'framer-motion';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { cardHover } from '@/lib/motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  premium?: boolean;
  style?: CSSProperties;
}

export function Card({
  children,
  className,
  hover = false,
  padding = 'md',
  onClick,
  premium = false,
  style,
}: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

  const baseClassName = cn(
    premium ? 'surface-panel' : 'surface-card',
    'rounded-[var(--radius-lg)]',
    'transition-[border-color,box-shadow,transform] duration-[var(--duration-normal)] ease-[var(--ease-smooth)]',
    hover && 'cursor-pointer hover:border-border-hover hover:shadow-md',
    onClick && 'cursor-pointer',
    paddings[padding],
    className,
  );

  if (hover) {
    return (
      <motion.div className={baseClassName} whileHover={cardHover} onClick={onClick} style={style}>
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClassName} onClick={onClick} style={style}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  className?: string;
  accentColor?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  className,
  accentColor,
}: StatCardProps) {
  const accentStyle = accentColor
    ? {
        borderLeftColor: `color-mix(in srgb, ${accentColor} 24%, white)`,
      }
    : undefined;

  const iconStyle = accentColor
    ? {
        backgroundColor: `color-mix(in srgb, ${accentColor} 10%, white)`,
        borderColor: `color-mix(in srgb, ${accentColor} 18%, white)`,
        color: accentColor,
      }
    : undefined;

  return (
    <Card
      hover
      className={cn('border-l-[3px] border-l-transparent min-h-[152px]', className)}
      style={accentStyle}
    >
      <div className="flex h-full items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-medium text-text-muted">{label}</span>
          <span className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-text-primary">
            {value}
          </span>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 text-xs">
              {change > 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : change < 0 ? (
                <TrendingDown className="h-3.5 w-3.5 text-danger" />
              ) : (
                <Minus className="h-3.5 w-3.5 text-text-muted" />
              )}
              <span
                className={cn(
                  'font-medium',
                  change > 0 && 'text-success',
                  change < 0 && 'text-danger',
                  change === 0 && 'text-text-secondary',
                )}
              >
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              {changeLabel && <span className="text-text-muted">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div
            className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-border-subtle bg-bg-tertiary text-text-secondary"
            style={iconStyle}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

interface PanelProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, description, action, children, className }: PanelProps) {
  return (
    <Card padding="none" className={cn('overflow-hidden', className)}>
      {(title || action) && (
        <div className="flex flex-col gap-3 border-b border-border-subtle px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            {title && <h3 className="text-base font-semibold text-text-primary">{title}</h3>}
            {description && <p className="text-sm text-text-muted">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </Card>
  );
}
