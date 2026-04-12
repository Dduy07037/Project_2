'use client';

import { ProtectedRoleShell } from '@/components/layout/protected-role-shell';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoleShell role="student">{children}</ProtectedRoleShell>;
}
