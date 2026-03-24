'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Search } from 'lucide-react';

// ─── Input ───
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, hint, error, icon, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label className="text-xs font-semibold text-text-secondary tracking-wide uppercase">{label}</label>
                )}
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full h-10 px-4 text-sm text-text-primary placeholder:text-text-muted/60',
                            'rounded-[var(--radius-md)]',
                            'glass-input',
                            'focus:outline-none',
                            'disabled:opacity-40 disabled:cursor-not-allowed',
                            icon && 'pl-10',
                            error && 'border-danger/40 focus:border-danger focus:shadow-glow-danger',
                            className
                        )}
                        {...props}
                    />
                    {/* Focus glow effect */}
                    <div className="absolute inset-0 rounded-[var(--radius-md)] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none glow-accent" />
                </div>
                {hint && !error && <p className="text-[11px] text-text-muted">{hint}</p>}
                {error && <p className="text-[11px] text-danger font-medium">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';

// ─── Search Input ───
interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> { }

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    ({ className, ...props }, ref) => {
        return (
            <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-accent-cyan transition-colors duration-200" />
                <input
                    ref={ref}
                    className={cn(
                        'w-full h-10 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted/60',
                        'rounded-[var(--radius-full)]',
                        'glass-input',
                        'focus:outline-none',
                        className
                    )}
                    placeholder="Tìm kiếm..."
                    {...props}
                />
                <div className="absolute inset-0 rounded-[var(--radius-full)] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none glow-cyan" style={{ boxShadow: '0 0 16px rgba(34, 211, 238, 0.12)' }} />
            </div>
        );
    }
);
SearchInput.displayName = 'SearchInput';

// ─── Textarea ───
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label className="text-xs font-semibold text-text-secondary tracking-wide uppercase">{label}</label>
                )}
                <textarea
                    ref={ref}
                    className={cn(
                        'w-full min-h-[100px] px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60',
                        'rounded-[var(--radius-md)] resize-y',
                        'glass-input',
                        'focus:outline-none',
                        error && 'border-danger/40 focus:border-danger',
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-[11px] text-danger font-medium">{error}</p>}
            </div>
        );
    }
);
Textarea.displayName = 'Textarea';

export { Input, SearchInput, Textarea };
