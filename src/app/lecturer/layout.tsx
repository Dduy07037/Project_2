'use client';

import { AppShell } from '@/components/layout/app-shell';

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppShell role="lecturer" userName="Trần Thị Minh Anh">
            {children}
        </AppShell>
    );
}
