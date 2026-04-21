'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Card } from './card';

interface FullscreenStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function FullscreenState({
  icon,
  title,
  description,
  actions,
  className,
}: FullscreenStateProps) {
  return (
    <div className={cn('flex min-h-screen items-center justify-center px-6 py-12', className)}>
      <Card className="w-full max-w-lg text-center">
        <div className="flex flex-col items-center gap-4 p-2">
          {icon && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-tertiary text-text-secondary">
              {icon}
            </div>
          )}
          <div className="space-y-2">
            <h2 className="text-[28px] font-semibold tracking-[-0.04em] text-text-primary">{title}</h2>
            {description && <p className="text-sm text-text-muted">{description}</p>}
          </div>
          {actions && <div className="pt-1">{actions}</div>}
        </div>
      </Card>
    </div>
  );
}

interface InlineStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function InlineState({
  icon,
  title,
  description,
  actions,
  className,
}: InlineStateProps) {
  return (
    <Card className={cn('w-full py-10 text-center', className)}>
      <div className="flex flex-col items-center gap-4">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-tertiary text-text-secondary">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          {description && <p className="mx-auto max-w-lg text-sm text-text-muted">{description}</p>}
        </div>
        {actions && <div className="pt-1">{actions}</div>}
      </div>
    </Card>
  );
}
