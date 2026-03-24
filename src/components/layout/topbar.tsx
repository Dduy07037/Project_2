'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { SearchInput } from '@/components/ui/input';
import { Avatar } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockNotifications } from '@/lib/mock-data';
import {
    Bell, ChevronRight, Search, User, Settings, LogOut,
    Moon, HelpCircle, ChevronDown
} from 'lucide-react';

interface TopbarProps {
    userName: string;
    userRole: string;
    sidebarCollapsed: boolean;
}

export function Topbar({ userName, userRole, sidebarCollapsed }: TopbarProps) {
    const pathname = usePathname();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const unreadCount = mockNotifications.filter((n) => !n.read).length;

    const segments = pathname?.split('/').filter(Boolean) || [];
    const breadcrumbs = segments.map((seg, i) => ({
        label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
        href: '/' + segments.slice(0, i + 1).join('/'),
        isLast: i === segments.length - 1,
    }));

    const roleLabels: Record<string, string> = { admin: 'Admin', lecturer: 'Giảng viên', student: 'Sinh viên' };

    return (
        <header
            className={cn(
                'fixed top-3 right-3 h-14 rounded-[var(--radius-xl)]',
                'glass-heavy shadow-lg',
                'flex items-center px-5 gap-4 z-[var(--z-sticky)]',
                'transition-[left] duration-400 ease-[var(--ease-out-expo)]'
            )}
            style={{ left: sidebarCollapsed ? 72 + 24 : 260 + 24 }}
        >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
                {breadcrumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                        {i > 0 && <ChevronRight className="h-3 w-3 text-text-muted/40 shrink-0" />}
                        {crumb.isLast ? (
                            <span className="text-text-primary font-semibold">{crumb.label}</span>
                        ) : (
                            <Link href={crumb.href} className="text-text-muted hover:text-text-secondary transition-colors">
                                {crumb.label}
                            </Link>
                        )}
                    </span>
                ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
                {/* Search */}
                <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)}>
                    <Search className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <div className="relative">
                    <Button variant="ghost" size="icon" onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}>
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-bg-primary glow-danger" />
                        )}
                    </Button>

                    <AnimatePresence>
                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    className="absolute right-0 top-full mt-3 w-80 glass-heavy rounded-[var(--radius-xl)] shadow-xl overflow-hidden z-50 border border-border-glass-strong"
                                >
                                    <div className="px-4 py-3 border-b border-border-glass flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-text-primary">Thông báo</h4>
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-danger/15 text-danger border border-danger/20">{unreadCount} mới</span>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {mockNotifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={cn(
                                                    'px-4 py-3 border-b border-border-glass/50 last:border-b-0 hover:bg-surface-hover transition-colors cursor-pointer',
                                                    !n.read && 'bg-accent/5'
                                                )}
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    {!n.read && <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0 glow-accent" />}
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-text-primary">{n.title}</p>
                                                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-2.5 border-t border-border-glass">
                                        <button className="text-xs font-semibold text-accent hover:text-accent-light transition-colors cursor-pointer">Xem tất cả</button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative ml-1">
                    <button
                        onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                        className="flex items-center gap-2.5 hover:bg-surface-hover rounded-[var(--radius-md)] px-2.5 py-1.5 transition-all duration-200 cursor-pointer group"
                    >
                        <Avatar name={userName} size="sm" />
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-semibold text-text-primary leading-none">{userName}</p>
                            <p className="text-[10px] text-text-muted">{roleLabels[userRole]}</p>
                        </div>
                        <ChevronDown className="h-3 w-3 text-text-muted hidden sm:block group-hover:text-text-secondary transition-colors" />
                    </button>

                    <AnimatePresence>
                        {showUserMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    className="absolute right-0 top-full mt-3 w-48 glass-heavy rounded-[var(--radius-lg)] shadow-xl py-1.5 z-50 border border-border-glass-strong"
                                >
                                    <Link href="/profile" className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors rounded-[var(--radius-sm)] mx-1">
                                        <User className="h-4 w-4" /> Hồ sơ
                                    </Link>
                                    <Link href="/settings" className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors rounded-[var(--radius-sm)] mx-1">
                                        <Settings className="h-4 w-4" /> Cài đặt
                                    </Link>
                                    <div className="h-px bg-border-glass mx-3 my-1.5" />
                                    <button className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-danger hover:bg-danger/8 transition-colors w-full cursor-pointer rounded-[var(--radius-sm)] mx-1">
                                        <LogOut className="h-4 w-4" /> Đăng xuất
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Search Overlay */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 top-full mt-3 glass-heavy rounded-[var(--radius-xl)] px-5 py-3.5 shadow-xl border border-border-glass-strong"
                    >
                        <SearchInput
                            placeholder="Tìm kiếm câu hỏi, kỳ thi, sinh viên..."
                            autoFocus
                            onKeyDown={(e) => e.key === 'Escape' && setShowSearch(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

export default Topbar;
