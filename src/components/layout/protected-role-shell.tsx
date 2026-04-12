'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { AppShell } from './app-shell';
import { useAuth } from '@/components/providers/auth-provider';
import { FullscreenState } from '@/components/ui/page-state';
import { consumeLogoutStripLoginNext } from '@/lib/auth/routing';
import type { AppRole } from '@/lib/auth/types';

interface ProtectedRoleShellProps {
    role: AppRole;
    children: React.ReactNode;
}

export function ProtectedRoleShell({ role, children }: ProtectedRoleShellProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { status, user, logout } = useAuth();

    useEffect(() => {
        if (status === 'loading') {
            return;
        }

        if (status === 'unauthenticated') {
            if (pathname?.startsWith('/login')) {
                return;
            }
            if (consumeLogoutStripLoginNext()) {
                router.replace('/login');
                return;
            }
            const nextPath = pathname && pathname !== '/' ? `?next=${encodeURIComponent(pathname)}` : '';
            router.replace(`/login${nextPath}`);
            return;
        }

        if (status === 'authenticated' && user && user.role !== role) {
            router.replace('/403');
        }
    }, [pathname, role, router, status, user]);

    if (status === 'loading') {
        return (
            <FullscreenState
                icon={<ShieldCheck className="h-10 w-10" />}
                title="Đang xác thực phiên làm việc"
                description="ExamGuard đang kiểm tra thông tin đăng nhập hiện tại."
            />
        );
    }

    if (status === 'unauthenticated') {
        return null;
    }

    if (!user) {
        return (
            <FullscreenState
                icon={<ShieldCheck className="h-10 w-10" />}
                title="Đang xác thực phiên làm việc"
                description="ExamGuard đang tải thông tin tài khoản."
            />
        );
    }

    if (user.role !== role) {
        return (
            <FullscreenState
                icon={<ShieldAlert className="h-10 w-10" />}
                title="Đang chuyển hướng"
                description="Bạn không có quyền truy cập khu vực này."
            />
        );
    }

    return (
        <AppShell
            role={user.role}
            userName={user.fullName}
            onLogout={logout}
        >
            {children}
        </AppShell>
    );
}
