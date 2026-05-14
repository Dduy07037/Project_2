'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { Avatar } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input';
import { cn } from '@/lib/cn';

interface TopbarNotification {
  id: string;
  title: string;
  message?: string;
  href?: string;
  read?: boolean;
}

interface TopbarProps {
  userName: string;
  userRole: string;
  onLogout: () => Promise<void>;
  onOpenSidebar: () => void;
  notifications?: TopbarNotification[];
}

export function Topbar({
  userName,
  userRole,
  onLogout,
  onOpenSidebar,
  notifications = [],
}: TopbarProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const segments = pathname?.split('/').filter(Boolean) || [];
  const settingsHref = userRole === 'admin' ? '/admin/settings' : '/profile';
  const roleLabels: Record<string, string> = {
    admin: 'Quản trị viên',
    lecturer: 'Giảng viên',
    student: 'Sinh viên',
  };

  return (
    <div className="sticky top-4 z-[var(--z-sticky)]">
      <header className="surface-panel relative flex min-h-16 items-center gap-3 rounded-[var(--radius-xl)] px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          className="lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <nav className="hidden min-w-0 flex-1 items-center gap-1 text-sm md:flex">
          {segments.length === 0 ? (
            <span className="font-medium text-text-primary">Overview</span>
          ) : (
            segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join('/')}`;
              const label =
                segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
              const isLast = index === segments.length - 1;

              return (
                <span key={href} className="flex items-center gap-1.5 whitespace-nowrap">
                  {index > 0 && <ChevronRight className="h-3 w-3 text-text-muted" />}
                  {isLast ? (
                    <span className="font-medium text-text-primary">{label}</span>
                  ) : (
                    <Link href={href} className="text-text-muted transition-colors hover:text-text-primary">
                      {label}
                    </Link>
                  )}
                </span>
              );
            })
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch((current) => !current)}
            aria-label="Toggle search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowNotifications((current) => !current);
                setShowUserMenu(false);
              }}
              aria-label="Toggle notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-danger" />
              )}
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="surface-panel absolute right-0 top-[calc(100%+0.75rem)] z-50 w-80 overflow-hidden rounded-[var(--radius-lg)]"
                  >
                    <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                      <h4 className="text-sm font-medium text-text-primary">Thông báo</h4>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-danger/8 px-2 py-1 text-[11px] font-medium text-danger">
                          {unreadCount} moi
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-text-muted">
                          Chưa có thông báo nào.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            href={notification.href || '#'}
                            className={cn(
                              'block border-b border-border-subtle px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-hover',
                              !notification.read && 'bg-accent/6',
                            )}
                          >
                            <p className="text-sm font-medium text-text-primary">
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="mt-1 text-xs text-text-muted">
                                {notification.message}
                              </p>
                            )}
                          </Link>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu((current) => !current);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 transition-colors hover:bg-surface-hover"
            >
              <Avatar name={userName} size="sm" />
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium text-text-primary">{userName}</p>
                <p className="text-[11px] text-text-muted">{roleLabels[userRole] || userRole}</p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-text-muted sm:block" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="surface-panel absolute right-0 top-[calc(100%+0.75rem)] z-50 w-52 rounded-[var(--radius-lg)] p-1"
                  >
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                    >
                      <User className="h-4 w-4" />
                      Hồ sơ
                    </Link>
                    <Link
                      href={settingsHref}
                      className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                    >
                      <Settings className="h-4 w-4" />
                      Cài đặt
                    </Link>
                    <button
                      onClick={() => void onLogout()}
                      className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/8"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="surface-panel mt-3 rounded-[var(--radius-xl)] p-3"
          >
            <SearchInput
              autoFocus
              placeholder="Tìm kiếm..."
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setShowSearch(false);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Topbar;
