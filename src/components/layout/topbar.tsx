'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { SearchInput } from '@/components/ui/input';
import { Avatar } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, ChevronDown, ChevronRight, LogOut, Search, Settings, User } from 'lucide-react';

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
    sidebarCollapsed: boolean;
    onLogout: () => Promise<void>;
    notifications?: TopbarNotification[];
}

export function Topbar({ userName, userRole, sidebarCollapsed, onLogout, notifications = [] }: TopbarProps) {
    const pathname = usePathname();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const unreadCount = notifications.filter((notification) => !notification.read).length;
    const segments = pathname?.split('/').filter(Boolean) || [];
    const settingsHref = userRole === 'admin' ? '/admin/settings' : '/profile';
    const roleLabels: Record<string, string> = { admin: 'Admin', lecturer: 'Giang vien', student: 'Sinh vien' };

    return (
        <header
            className={cn(
                'fixed top-3 right-3 h-14 rounded-[var(--radius-xl)] glass-heavy shadow-lg flex items-center px-5 gap-4 z-[var(--z-sticky)]',
                'transition-[left] duration-400 ease-[var(--ease-out-expo)]',
            )}
            style={{ left: sidebarCollapsed ? 96 : 284 }}
        >
            <nav className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join('/')}`;
                    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
                    const isLast = index === segments.length - 1;

                    return (
                        <span key={href} className="flex items-center gap-1.5 whitespace-nowrap">
                            {index > 0 && <ChevronRight className="h-3 w-3 text-text-muted/40 shrink-0" />}
                            {isLast ? (
                                <span className="text-text-primary font-semibold">{label}</span>
                            ) : (
                                <Link href={href} className="text-text-muted hover:text-text-secondary transition-colors">
                                    {label}
                                </Link>
                            )}
                        </span>
                    );
                })}
            </nav>

            <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" onClick={() => setShowSearch((current) => !current)}>
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
                    >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-bg-primary" />}
                    </Button>

                    <AnimatePresence>
                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 top-full mt-3 w-80 glass-heavy rounded-[var(--radius-xl)] shadow-xl overflow-hidden z-50 border border-border-glass-strong"
                                >
                                    <div className="px-4 py-3 border-b border-border-glass flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-text-primary">Thong bao</h4>
                                        {unreadCount > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-danger/15 text-danger">{unreadCount} moi</span>}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-sm text-text-muted">Chua co thong bao nao tu du lieu that.</div>
                                        ) : notifications.map((notification) => (
                                            <Link
                                                key={notification.id}
                                                href={notification.href || '#'}
                                                className={cn('block px-4 py-3 border-b border-border-glass/50 last:border-b-0 hover:bg-surface-hover', !notification.read && 'bg-accent/5')}
                                            >
                                                <p className="text-sm font-semibold text-text-primary">{notification.title}</p>
                                                {notification.message && <p className="text-xs text-text-muted mt-0.5">{notification.message}</p>}
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative ml-1">
                    <button
                        onClick={() => {
                            setShowUserMenu((current) => !current);
                            setShowNotifications(false);
                        }}
                        className="flex items-center gap-2.5 hover:bg-surface-hover rounded-[var(--radius-md)] px-2.5 py-1.5 transition-all duration-200 cursor-pointer group"
                    >
                        <Avatar name={userName} size="sm" />
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-semibold text-text-primary leading-none">{userName}</p>
                            <p className="text-[10px] text-text-muted">{roleLabels[userRole] || userRole}</p>
                        </div>
                        <ChevronDown className="h-3 w-3 text-text-muted hidden sm:block group-hover:text-text-secondary transition-colors" />
                    </button>

                    <AnimatePresence>
                        {showUserMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 top-full mt-3 w-48 glass-heavy rounded-[var(--radius-lg)] shadow-xl py-1.5 z-50 border border-border-glass-strong"
                                >
                                    <Link href="/profile" className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-[var(--radius-sm)] mx-1">
                                        <User className="h-4 w-4" /> Ho so
                                    </Link>
                                    <Link href={settingsHref} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-[var(--radius-sm)] mx-1">
                                        <Settings className="h-4 w-4" /> Cai dat
                                    </Link>
                                    <div className="h-px bg-border-glass mx-3 my-1.5" />
                                    <button
                                        onClick={() => void onLogout()}
                                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-danger hover:bg-danger/8 w-full cursor-pointer rounded-[var(--radius-sm)] mx-1"
                                    >
                                        <LogOut className="h-4 w-4" /> Dang xuat
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 top-full mt-3 glass-heavy rounded-[var(--radius-xl)] px-5 py-3.5 shadow-xl border border-border-glass-strong"
                    >
                        <SearchInput placeholder="Tim kiem..." autoFocus onKeyDown={(event) => event.key === 'Escape' && setShowSearch(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

export default Topbar;
