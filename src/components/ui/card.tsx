'use client';

import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─── Card (Glassmorphism) ───
interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
    premium?: boolean;
}

export function Card({ children, className, hover = false, padding = 'md', onClick, premium = false }: CardProps) {
    const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-7' };

    const baseClassName = cn(
        'rounded-[var(--radius-xl)] transition-all duration-300 ease-out',
        premium
            ? 'card-premium'
            : 'glass-card',
        hover && 'cursor-pointer hover:border-border-hover',
        onClick && 'cursor-pointer',
        paddings[padding],
        className
    );

    if (hover) {
        return (
            <motion.div
                className={baseClassName}
                whileHover={{
                    y: -4,
                    scale: 1.01,
                    transition: { duration: 0.25, ease: 'easeOut' },
                }}
                onClick={onClick}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className={baseClassName} onClick={onClick}>
            {children}
        </div>
    );
}

// ─── Stat Card (with glow accent bar) ───
interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: ReactNode;
    className?: string;
    accentColor?: string;
}

export function StatCard({ label, value, change, changeLabel, icon, className, accentColor }: StatCardProps) {
    return (
        <Card className={cn('relative overflow-hidden group', className)} hover>
            {/* Ambient glow on top */}
            {accentColor && (
                <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                    style={{ background: accentColor }}
                />
            )}
            {/* Accent bar */}
            {accentColor && (
                <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
            )}
            <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">{label}</span>
                    <span className="text-3xl font-bold text-text-primary tracking-tighter">{value}</span>
                    {change !== undefined && (
                        <div className="flex items-center gap-1 mt-0.5">
                            {change > 0 ? (
                                <TrendingUp className="h-3 w-3 text-success" />
                            ) : change < 0 ? (
                                <TrendingDown className="h-3 w-3 text-danger" />
                            ) : (
                                <Minus className="h-3 w-3 text-text-muted" />
                            )}
                            <span className={cn(
                                'text-xs font-semibold',
                                change > 0 ? 'text-success' : change < 0 ? 'text-danger' : 'text-text-muted'
                            )}>
                                {change > 0 ? '+' : ''}{change}%
                                {changeLabel && <span className="text-text-muted ml-1 font-normal">{changeLabel}</span>}
                            </span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="w-11 h-11 rounded-[var(--radius-md)] bg-surface-glass flex items-center justify-center text-text-muted group-hover:text-accent-light transition-colors duration-300 border border-border-glass">
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}

// ─── Panel (Glass Section) ───
interface PanelProps {
    title?: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function Panel({ title, description, action, children, className }: PanelProps) {
    return (
        <Card padding="none" className={cn('flex flex-col', className)}>
            {(title || action) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-glass">
                    <div>
                        {title && <h3 className="text-sm font-bold text-text-primary tracking-tight">{title}</h3>}
                        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
                    </div>
                    {action}
                </div>
            )}
            <div className="p-6">{children}</div>
        </Card>
    );
}
