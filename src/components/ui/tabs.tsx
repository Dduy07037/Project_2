'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

// ─── Tabs ───
interface Tab {
    id: string;
    label: string;
    icon?: ReactNode;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
    className?: string;
    variant?: 'default' | 'pills';
}

export function Tabs({ tabs, activeTab, onChange, className, variant = 'default' }: TabsProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-0.5',
                variant === 'default' && 'border-b border-border',
                variant === 'pills' && 'bg-bg-tertiary p-1 rounded-[var(--radius-md)]',
                className
            )}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        'relative flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap',
                        variant === 'default' && 'px-3 pb-2.5 pt-1',
                        variant === 'pills' && 'px-3 py-1.5 rounded-[var(--radius-sm)]',
                        activeTab === tab.id
                            ? 'text-text-primary'
                            : 'text-text-muted hover:text-text-secondary'
                    )}
                >
                    {tab.icon}
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className={cn(
                            'text-[11px] font-semibold min-w-[18px] h-[18px] inline-flex items-center justify-center rounded-full px-1',
                            activeTab === tab.id ? 'bg-accent/15 text-accent' : 'bg-bg-tertiary text-text-muted'
                        )}>
                            {tab.count}
                        </span>
                    )}
                    {variant === 'default' && activeTab === tab.id && (
                        <motion.div
                            layoutId="tab-indicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                    )}
                    {variant === 'pills' && activeTab === tab.id && (
                        <motion.div
                            layoutId="pill-indicator"
                            className="absolute inset-0 bg-bg-secondary border border-border rounded-[var(--radius-sm)] -z-10"
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
}

// ─── Select ───
interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label?: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    className?: string;
    disabled?: boolean;
}

export function Select({ label, options, value, onChange, placeholder, error, className, disabled }: SelectProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={cn(
                    'h-9 px-3 text-sm bg-bg-secondary border border-border rounded-[var(--radius-md)]',
                    'text-text-primary appearance-none cursor-pointer',
                    'transition-colors duration-[var(--duration-normal)]',
                    'hover:border-border-hover',
                    'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    error && 'border-danger',
                    className
                )}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
}

// ─── Checkbox ───
interface CheckboxProps {
    label?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export function Checkbox({ label, checked, onChange, disabled, className }: CheckboxProps) {
    return (
        <label className={cn('flex items-center gap-2 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed', className)}>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                    className="sr-only peer"
                />
                <div className={cn(
                    'w-4 h-4 border border-border rounded-[3px] transition-all duration-150',
                    'peer-checked:bg-accent peer-checked:border-accent',
                    'peer-focus-visible:ring-2 peer-focus-visible:ring-accent/30',
                    !disabled && 'hover:border-border-hover'
                )}>
                    {checked && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                            <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
            </div>
            {label && <span className="text-sm text-text-secondary">{label}</span>}
        </label>
    );
}

// ─── Switch ───
interface SwitchProps {
    label?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export function Switch({ label, checked, onChange, disabled, className }: SwitchProps) {
    return (
        <label className={cn('flex items-center gap-2 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed', className)}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    'relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer',
                    checked ? 'bg-accent' : 'bg-bg-elevated'
                )}
            >
                <motion.span
                    className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ x: checked ? 16 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
            </button>
            {label && <span className="text-sm text-text-secondary">{label}</span>}
        </label>
    );
}

// ─── EmptyState ───
interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
            {icon && <div className="mb-4 text-text-muted opacity-50">{icon}</div>}
            <h3 className="text-base font-semibold text-text-secondary mb-1">{title}</h3>
            {description && <p className="text-sm text-text-muted max-w-sm">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

// ─── Page Header ───
interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    breadcrumbs?: { label: string; href?: string }[];
    className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div className={cn('flex items-start justify-between gap-4', className)}>
            <div>
                <h1 className="text-xl font-bold text-text-primary tracking-tight">{title}</h1>
                {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
    );
}

// ─── Filter Bar ───
interface FilterBarProps {
    children: ReactNode;
    className?: string;
}

export function FilterBar({ children, className }: FilterBarProps) {
    return (
        <div className={cn('flex items-center gap-3 flex-wrap', className)}>
            {children}
        </div>
    );
}
