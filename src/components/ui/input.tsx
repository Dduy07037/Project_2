'use client';

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, icon, id, disabled, ...props }, ref) => {
    const reactId = useId();
    const inputId = id ?? reactId;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div
          className={cn(
            'field-shell relative flex h-11 items-center rounded-[var(--radius-md)]',
            disabled && 'bg-bg-tertiary',
            error && 'border-danger/50',
          )}
        >
          {icon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            disabled={disabled}
            className={cn(
              'h-full w-full rounded-[inherit] bg-transparent px-3.5 text-sm text-text-primary',
              'placeholder:text-text-muted/75 focus:outline-none',
              'disabled:cursor-not-allowed disabled:text-text-muted',
              icon && 'pl-10',
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs font-medium text-danger">{error}</p>
        ) : hint ? (
          <p className="text-xs text-text-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <div
        className={cn(
          'field-shell relative flex h-11 items-center rounded-[var(--radius-full)]',
          disabled && 'bg-bg-tertiary',
        )}
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'h-full w-full rounded-[inherit] bg-transparent pl-10 pr-4 text-sm text-text-primary',
            'placeholder:text-text-muted/75 focus:outline-none disabled:cursor-not-allowed',
            className,
          )}
          placeholder="Tim kiem..."
          {...props}
        />
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, disabled, ...props }, ref) => {
    const reactId = useId();
    const textareaId = id ?? reactId;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div
          className={cn(
            'field-shell rounded-[var(--radius-md)]',
            disabled && 'bg-bg-tertiary',
            error && 'border-danger/50',
          )}
        >
          <textarea
            ref={ref}
            id={textareaId}
            aria-invalid={Boolean(error)}
            disabled={disabled}
            className={cn(
              'min-h-[120px] w-full resize-y rounded-[inherit] bg-transparent px-3.5 py-3 text-sm text-text-primary',
              'placeholder:text-text-muted/75 focus:outline-none disabled:cursor-not-allowed disabled:text-text-muted',
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs font-medium text-danger">{error}</p>
        ) : hint ? (
          <p className="text-xs text-text-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Input, SearchInput, Textarea };
