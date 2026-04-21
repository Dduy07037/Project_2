'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { scaleFadeVariants } from '@/lib/motion';

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

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'default',
}: TabsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1',
        variant === 'default' && 'border-b border-border-subtle pb-1',
        variant === 'pills' && 'surface-card rounded-[var(--radius-lg)] p-1',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm',
              'transition-[background-color,color,border-color] duration-[var(--duration-normal)] ease-[var(--ease-smooth)]',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/12 cursor-pointer',
              isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-primary',
              variant === 'default' && isActive && 'bg-bg-secondary',
              variant === 'pills' &&
                cn(
                  'border border-transparent',
                  isActive
                    ? 'border-border bg-bg-secondary shadow-sm'
                    : 'hover:bg-surface-hover',
                ),
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'bg-bg-tertiary text-text-muted',
                )}
              >
                {tab.count}
              </span>
            )}
            {variant === 'default' && isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-x-2 -bottom-1.5 h-0.5 rounded-full bg-accent"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

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

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  className,
  disabled,
}: SelectProps) {
  const reactId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const normalizedOptions = useMemo(() => {
    if (placeholder && !options.some((option) => option.value === '')) {
      return [{ value: '', label: placeholder }, ...options];
    }

    return options;
  }, [options, placeholder]);

  const selectedIndex = Math.max(
    normalizedOptions.findIndex((option) => option.value === value),
    0,
  );
  const selectedOption = normalizedOptions[selectedIndex];

  useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    const frame = requestAnimationFrame(() => {
      listRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function selectIndex(index: number) {
    const option = normalizedOptions[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => {
        if (event.key === 'ArrowDown') {
          return Math.min(current + 1, normalizedOptions.length - 1);
        }
        return Math.max(current - 1, 0);
      });
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((current) => !current);
    }
  }

  function handleListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, normalizedOptions.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(normalizedOptions.length - 1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectIndex(activeIndex);
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)} ref={rootRef}>
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <div className="relative">
        <button
          type="button"
          id={reactId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${reactId}-listbox`}
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            'field-shell flex h-11 w-full items-center justify-between rounded-[var(--radius-md)] px-3.5 text-left text-sm',
            'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/12',
            disabled && 'cursor-not-allowed bg-bg-tertiary text-text-muted',
            error && 'border-danger/50',
          )}
        >
          <span className={cn(selectedOption ? 'text-text-primary' : 'text-text-muted')}>
            {selectedOption?.label ?? placeholder ?? 'Chon'}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-text-muted transition-transform duration-[var(--duration-normal)]',
              open && 'rotate-180',
            )}
          />
        </button>
        <AnimatePresence>
          {open && !disabled && (
            <motion.div
              variants={scaleFadeVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="surface-panel absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[var(--z-dropdown)] overflow-hidden rounded-[var(--radius-lg)]"
            >
              <div
                id={`${reactId}-listbox`}
                ref={listRef}
                role="listbox"
                tabIndex={-1}
                aria-labelledby={reactId}
                onKeyDown={handleListKeyDown}
                className="max-h-64 overflow-auto p-1 focus:outline-none"
              >
                {normalizedOptions.map((option, index) => {
                  const isSelected = option.value === value;
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={`${option.value}-${option.label}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectIndex(index)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-[var(--radius-md)] px-3 py-2 text-sm',
                        'transition-colors duration-[var(--duration-normal)] cursor-pointer',
                        isActive || isSelected
                          ? 'bg-surface-hover text-text-primary'
                          : 'text-text-secondary hover:bg-surface-hover',
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-accent" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  label,
  checked,
  onChange,
  disabled,
  className,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 text-sm text-text-secondary',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      <span
        className={cn(
          'relative flex h-4 w-4 items-center justify-center rounded-[4px] border',
          checked ? 'border-accent bg-accent text-white' : 'border-border bg-bg-secondary',
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        {checked && (
          <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 8L7 11L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}

interface SwitchProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  label,
  checked,
  onChange,
  disabled,
  className,
}: SwitchProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-3 text-sm text-text-secondary',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full border transition-colors duration-[var(--duration-normal)]',
          checked
            ? 'border-accent bg-accent'
            : 'border-border bg-bg-tertiary',
        )}
      >
        <motion.span
          className="absolute top-0.5 left-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        />
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-tertiary text-text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-border-subtle pb-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="space-y-1.5">
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-text-primary">{title}</h1>
        {description && <p className="max-w-3xl text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className }: FilterBarProps) {
  return <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center', className)}>{children}</div>;
}
