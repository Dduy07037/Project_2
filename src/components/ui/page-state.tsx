'use client';

import type { ReactNode } from 'react';
import { Card } from './card';
import { cn } from '@/lib/cn';

interface FullscreenStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

export function FullscreenState({ icon, title, description, actions, className }: FullscreenStateProps) {
    return (
        <div className={cn('min-h-screen flex items-center justify-center px-6 py-12', className)}>
            <Card className="w-full max-w-md text-center">
                <div className="flex flex-col items-center gap-4">
                    {icon && <div className="text-accent-light">{icon}</div>}
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                        {description && <p className="text-sm text-text-muted">{description}</p>}
                    </div>
                    {actions && <div className="pt-2">{actions}</div>}
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

export function InlineState({ icon, title, description, actions, className }: InlineStateProps) {
    return (
        <Card className={cn('w-full text-center py-10', className)}>
            <div className="flex flex-col items-center gap-4">
                {icon && <div className="text-accent-light">{icon}</div>}
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-text-primary">{title}</h3>
                    {description && <p className="text-sm text-text-muted">{description}</p>}
                </div>
                {actions && <div className="pt-2">{actions}</div>}
            </div>
        </Card>
    );
}
