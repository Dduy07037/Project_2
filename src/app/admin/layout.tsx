'use client';

import { AppShell } from '@/components/layout/app-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppShell role="admin" userName="Nguyễn Văn Quản Trị">
            {children}
        </AppShell>
    );
}
