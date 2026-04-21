'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  primary: 'border border-accent/15 bg-accent/8 text-accent',
  secondary: 'border border-border-subtle bg-bg-tertiary text-text-secondary',
  success: 'border border-success/15 bg-success/8 text-success',
  danger: 'border border-danger/15 bg-danger/8 text-danger',
  warning: 'border border-warning/15 bg-warning/8 text-warning',
  info: 'border border-info/15 bg-info/8 text-info',
  outline: 'border border-border bg-transparent text-text-secondary',
};

export function Badge({
  children,
  variant = 'secondary',
  size = 'md',
  dot,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-full)] font-medium tracking-[-0.01em]',
        size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1 text-xs',
        badgeVariants[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-accent': variant === 'primary',
            'bg-success': variant === 'success',
            'bg-danger': variant === 'danger',
            'bg-warning': variant === 'warning',
            'bg-info': variant === 'info',
            'bg-text-muted': variant === 'secondary' || variant === 'outline',
          })}
        />
      )}
      {children}
    </span>
  );
}

const statusMap: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Active', variant: 'success' },
  disabled: { label: 'Disabled', variant: 'secondary' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  locked: { label: 'Locked', variant: 'danger' },
  scheduled: { label: 'Scheduled', variant: 'info' },
  completed: { label: 'Completed', variant: 'outline' },
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Published', variant: 'info' },
  submitted: { label: 'Submitted', variant: 'success' },
  auto_submitted: { label: 'Auto submitted', variant: 'warning' },
  in_progress: { label: 'In progress', variant: 'info' },
  flagged: { label: 'Needs review', variant: 'danger' },
  easy: { label: 'Easy', variant: 'success' },
  medium: { label: 'Medium', variant: 'warning' },
  hard: { label: 'Hard', variant: 'danger' },
  high: { label: 'High', variant: 'danger' },
  low: { label: 'Low', variant: 'info' },
  success: { label: 'Success', variant: 'success' },
  warning: { label: 'Warning', variant: 'warning' },
  danger: { label: 'Danger', variant: 'danger' },
  info: { label: 'Info', variant: 'info' },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusMap[status] || { label: status, variant: 'secondary' as BadgeVariant };
  return (
    <Badge variant={config.variant} size="sm" dot className={className}>
      {config.label}
    </Badge>
  );
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: { className: 'h-7 w-7 text-[10px]', pixels: 28 },
    md: { className: 'h-9 w-9 text-xs', pixels: 36 },
    lg: { className: 'h-14 w-14 text-base', pixels: 56 },
  };
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full border border-border-subtle bg-accent/8 text-accent',
        'flex items-center justify-center font-semibold',
        sizes[size].className,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          unoptimized
          sizes={`${sizes[size].pixels}px`}
          className="object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-border-subtle', className)} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}
