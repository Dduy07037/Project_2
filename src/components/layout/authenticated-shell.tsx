'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { consumeLogoutStripLoginNext } from '@/lib/auth/routing';
import { FullscreenState } from '@/components/ui/page-state';
import { AppShell } from './app-shell';

interface AuthenticatedShellProps {
  children: React.ReactNode;
}

export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user, logout } = useAuth();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      if (consumeLogoutStripLoginNext()) {
        router.replace('/login');
        return;
      }

      const nextPath = pathname && pathname !== '/' ? `?next=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${nextPath}`);
    }
  }, [pathname, router, status]);

  if (status === 'loading') {
    return (
      <FullscreenState
        icon={<ShieldCheck className="h-10 w-10" />}
        title="Đang xác thực phiên làm việc"
        description="ExamGuard dang kiem tra thong tin dang nhap hien tai."
      />
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (!user) {
    return (
      <FullscreenState
        icon={<ShieldAlert className="h-10 w-10" />}
        title="Không tìm thấy tài khoản"
        description="Phien lam viec hien tai khong con hop le."
      />
    );
  }

  return (
    <AppShell role={user.role} userName={user.fullName} onLogout={logout}>
      {children}
    </AppShell>
  );
}
