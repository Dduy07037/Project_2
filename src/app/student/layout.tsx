'use client';

import { AppShell } from '@/components/layout/app-shell';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppShell role="student" userName="Phạm Đức Duy">
            {children}
        </AppShell>
    );
}
