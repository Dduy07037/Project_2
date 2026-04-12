'use client';

import { ProtectedRoleShell } from '@/components/layout/protected-role-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoleShell role="admin">{children}</ProtectedRoleShell>;
}
