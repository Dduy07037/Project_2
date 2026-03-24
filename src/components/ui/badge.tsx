'use client';

import { cn } from '@/lib/cn';

// ─── Badge (pill with glass effect) ───
type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    dot?: boolean;
    className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
    primary: 'bg-accent/15 text-accent-light border border-accent/20',
    secondary: 'bg-surface-glass text-text-secondary border border-border-glass',
    success: 'bg-success/12 text-success border border-success/20',
    danger: 'bg-danger/12 text-danger border border-danger/20',
    warning: 'bg-warning/12 text-warning border border-warning/20',
    info: 'bg-info/12 text-info border border-info/20',
    outline: 'bg-transparent text-text-secondary border border-border-glass-strong',
};

export function Badge({ children, variant = 'secondary', size = 'md', dot, className }: BadgeProps) {
    return (
        <span className={cn(
            'inline-flex items-center font-semibold rounded-[var(--radius-full)]',
            size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5',
            badgeVariants[variant],
            className
        )}>
            {dot && <span className={cn('w-1.5 h-1.5 rounded-full', {
                'bg-accent-light': variant === 'primary',
                'bg-success': variant === 'success',
                'bg-danger': variant === 'danger',
                'bg-warning': variant === 'warning',
                'bg-info': variant === 'info',
                'bg-text-muted': variant === 'secondary' || variant === 'outline',
            })} />}
            {children}
        </span>
    );
}

// ─── Status Badge (semantic map) ───
const statusMap: Record<string, { label: string; variant: BadgeVariant }> = {
    active: { label: 'Đang hoạt động', variant: 'success' },
    inactive: { label: 'Ngừng HĐ', variant: 'secondary' },
    locked: { label: 'Đã khóa', variant: 'danger' },
    scheduled: { label: 'Sắp diễn ra', variant: 'info' },
    completed: { label: 'Đã kết thúc', variant: 'outline' },
    draft: { label: 'Bản nháp', variant: 'secondary' },
    submitted: { label: 'Đã nộp', variant: 'success' },
    auto_submitted: { label: 'Tự động nộp', variant: 'warning' },
    in_progress: { label: 'Đang làm', variant: 'info' },
    flagged: { label: 'Cần xem xét', variant: 'danger' },
    easy: { label: 'Dễ', variant: 'success' },
    medium: { label: 'Trung bình', variant: 'warning' },
    hard: { label: 'Khó', variant: 'danger' },
    high: { label: 'Cao', variant: 'danger' },
    low: { label: 'Thấp', variant: 'info' },
    success: { label: 'Thành công', variant: 'success' },
    warning: { label: 'Cảnh báo', variant: 'warning' },
    danger: { label: 'Nguy hiểm', variant: 'danger' },
    info: { label: 'Thông tin', variant: 'info' },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
    const config = statusMap[status] || { label: status, variant: 'secondary' as BadgeVariant };
    return <Badge variant={config.variant} size="sm" dot className={className}>{config.label}</Badge>;
}

// ─── Avatar (glass ring) ───
interface AvatarProps {
    name: string;
    src?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
    const sizes = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-14 h-14 text-base' };
    const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className={cn(
            'rounded-full flex items-center justify-center font-bold shrink-0',
            'bg-gradient-to-br from-accent/25 to-accent-cyan/15 text-accent-light',
            'border border-border-glass-strong',
            'shadow-sm',
            sizes[size],
            className
        )}>
            {src ? (
                <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
                initials
            )}
        </div>
    );
}

// ─── Separator ───
export function Separator({ className }: { className?: string }) {
    return <div className={cn('h-px bg-gradient-to-r from-transparent via-border-glass-strong to-transparent', className)} />;
}

// ─── Skeleton (enhanced shimmer) ───
export function Skeleton({ className }: { className?: string }) {
    return <div className={cn('skeleton', className)} />;
}
