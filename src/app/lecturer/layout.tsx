'use client';

import { ProtectedRoleShell } from '@/components/layout/protected-role-shell';

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoleShell role="lecturer">{children}</ProtectedRoleShell>;
}
