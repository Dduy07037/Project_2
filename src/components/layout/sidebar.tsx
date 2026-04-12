'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/ui/badge';
import {
    Activity,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Eye,
    GraduationCap,
    History,
    Home,
    LayoutDashboard,
    Settings,
    Shield,
    Users,
} from 'lucide-react';

interface SidebarItem {
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
}

interface SidebarGroup {
    title?: string;
    items: SidebarItem[];
}

const adminNav: SidebarGroup[] = [
    {
        items: [
            { id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        ],
    },
    {
        title: 'Quản lý',
        items: [
            { id: 'users', label: 'Người dùng', href: '/admin/users', icon: <Users className="h-4 w-4" /> },
            { id: 'subjects', label: 'Môn học', href: '/admin/subjects', icon: <BookOpen className="h-4 w-4" /> },
        ],
    },
    {
        title: 'Hệ thống',
        items: [
            { id: 'activity', label: 'Hoạt động', href: '/admin/activity', icon: <Activity className="h-4 w-4" /> },
            { id: 'settings', label: 'Cấu hình', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
        ],
    },
];

const lecturerNav: SidebarGroup[] = [
    {
        items: [
            { id: 'dashboard', label: 'Dashboard', href: '/lecturer/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        ],
    },
    {
        title: 'Câu hỏi',
        items: [
            { id: 'questions', label: 'Ngân hàng câu hỏi', href: '/lecturer/questions', icon: <ClipboardList className="h-4 w-4" /> },
        ],
    },
    {
        title: 'Kỳ thi',
        items: [
            { id: 'exams', label: 'Quản lý kỳ thi', href: '/lecturer/exams', icon: <BookOpen className="h-4 w-4" /> },
            { id: 'monitoring', label: 'Giám sát', href: '/lecturer/monitoring', icon: <Eye className="h-4 w-4" /> },
        ],
    },
];

const studentNav: SidebarGroup[] = [
    {
        items: [
            { id: 'dashboard', label: 'Dashboard', href: '/student/dashboard', icon: <Home className="h-4 w-4" /> },
        ],
    },
    {
        title: 'Thi cử',
        items: [
            { id: 'exams', label: 'Ca thi khả dụng', href: '/student/exams', icon: <GraduationCap className="h-4 w-4" /> },
            { id: 'history', label: 'Lịch sử thi', href: '/student/history', icon: <History className="h-4 w-4" /> },
        ],
    },
];

function getNavForRole(role: string): SidebarGroup[] {
    switch (role) {
        case 'admin':
            return adminNav;
        case 'lecturer':
            return lecturerNav;
        case 'student':
            return studentNav;
        default:
            return [];
    }
}

interface SidebarProps {
    role: 'admin' | 'lecturer' | 'student';
    userName: string;
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ role, userName, collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const navGroups = getNavForRole(role);

    const roleLabels = { admin: 'Quản trị viên', lecturer: 'Giảng viên', student: 'Sinh viên' };
    const roleColors = { admin: 'text-danger', lecturer: 'text-accent-cyan', student: 'text-accent-light' };

    return (
        <motion.aside
            className={cn(
                'fixed top-3 left-3 bottom-3 rounded-[var(--radius-xl)]',
                'glass-heavy shadow-xl',
                'flex flex-col z-[var(--z-sticky)]',
                'transition-[width] duration-400 ease-[var(--ease-out-expo)]',
                'overflow-hidden'
            )}
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="absolute -top-20 -left-20 w-48 h-48 ambient-orb ambient-orb-purple opacity-20 pointer-events-none" />

            <div className="flex items-center h-16 px-4 border-b border-border-glass gap-3 shrink-0 relative z-10">
                <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-accent to-accent-cyan flex items-center justify-center shrink-0 shadow-md glow-accent">
                    <Shield className="h-4 w-4 text-white" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            <span className="text-sm font-bold text-gradient tracking-tight">ExamGuard</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-2.5 relative z-10">
                {navGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-4">
                        <AnimatePresence>
                            {group.title && !collapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="px-3 py-1.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.15em]"
                                >
                                    {group.title}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {group.items.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={cn(
                                        'relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-200',
                                        'group mb-0.5',
                                        collapsed ? 'justify-center px-0 mx-1' : 'mx-0',
                                        isActive
                                            ? 'text-text-primary bg-accent/12 border border-accent/15'
                                            : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover border border-transparent'
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-accent to-accent-cyan rounded-r-full"
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        />
                                    )}
                                    <span className={cn('shrink-0 transition-colors', isActive && 'text-accent-light')}>{item.icon}</span>
                                    <AnimatePresence>
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className="overflow-hidden whitespace-nowrap flex-1"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    {item.badge && !collapsed && (
                                        <span className="text-[10px] font-bold min-w-[18px] h-[18px] inline-flex items-center justify-center rounded-full bg-danger/20 text-danger border border-danger/20 glow-danger">
                                            {item.badge}
                                        </span>
                                    )}
                                    {collapsed && (
                                        <div className="absolute left-full ml-3 px-3 py-1.5 glass-heavy text-text-primary text-xs font-medium rounded-[var(--radius-sm)] shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-border-glass">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="border-t border-border-glass p-3 shrink-0 relative z-10">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 px-2 mb-3"
                        >
                            <Avatar name={userName} size="sm" />
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-text-primary truncate">{userName}</p>
                                <p className={cn('text-[10px] font-bold uppercase tracking-wider', roleColors[role])}>
                                    {roleLabels[role]}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center gap-2 py-2 text-text-muted hover:text-text-secondary transition-colors rounded-[var(--radius-sm)] hover:bg-surface-hover cursor-pointer"
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    {!collapsed && <span className="text-xs font-medium">Thu gọn</span>}
                </button>
            </div>
        </motion.aside>
    );
}

export default Sidebar;
