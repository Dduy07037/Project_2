'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
import { Avatar, Badge } from '@/components/ui/badge';
import { Drawer } from '@/components/ui/modal';
import { cn } from '@/lib/cn';
import { sidebarVariants } from '@/lib/motion';

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
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Quản lý',
    items: [
      {
        id: 'users',
        label: 'Người dùng',
        href: '/admin/users',
        icon: <Users className="h-4 w-4" />,
      },
      {
        id: 'subjects',
        label: 'Môn học',
        href: '/admin/subjects',
        icon: <BookOpen className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      {
        id: 'activity',
        label: 'Hoạt động',
        href: '/admin/activity',
        icon: <Activity className="h-4 w-4" />,
      },
      {
        id: 'settings',
        label: 'Cấu hình',
        href: '/admin/settings',
        icon: <Settings className="h-4 w-4" />,
      },
    ],
  },
];

const lecturerNav: SidebarGroup[] = [
  {
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/lecturer/dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Nội dung',
    items: [
      {
        id: 'questions',
        label: 'Ngân hàng câu hỏi',
        href: '/lecturer/questions',
        icon: <ClipboardList className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Kỳ thi',
    items: [
      {
        id: 'exams',
        label: 'Quản lý kỳ thi',
        href: '/lecturer/exams',
        icon: <BookOpen className="h-4 w-4" />,
      },
      {
        id: 'monitoring',
        label: 'Monitoring',
        href: '/lecturer/monitoring',
        icon: <Eye className="h-4 w-4" />,
      },
    ],
  },
];

const studentNav: SidebarGroup[] = [
  {
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/student/dashboard',
        icon: <Home className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Thi cử',
    items: [
      {
        id: 'exams',
        label: 'Ca thi khả dụng',
        href: '/student/exams',
        icon: <GraduationCap className="h-4 w-4" />,
      },
      {
        id: 'history',
        label: 'Lịch sử thi',
        href: '/student/history',
        icon: <History className="h-4 w-4" />,
      },
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
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  role,
  userName,
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const navGroups = getNavForRole(role);

  const roleLabels = {
    admin: 'Quản trị viên',
    lecturer: 'Giảng viên',
    student: 'Sinh viên',
  };

  function renderSidebarBody(isMobile = false) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-border-subtle px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-accent text-white shadow-sm">
            <Shield className="h-4.5 w-4.5" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">ExamGuard</p>
              <p className="text-xs text-text-muted">Điều hành thi cử</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-5">
              {group.title && (!collapsed || isMobile) && (
                <div className="px-2 pb-2 text-[11px] font-medium text-text-muted">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname?.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      title={collapsed && !isMobile ? item.label : undefined}
                      onClick={isMobile ? onCloseMobile : undefined}
                      className={cn(
                        'relative flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 text-sm',
                        'transition-[background-color,border-color,color] duration-[var(--duration-normal)]',
                        collapsed && !isMobile ? 'justify-center px-2' : 'justify-start',
                        isActive
                          ? 'border-accent/12 bg-accent/8 text-text-primary'
                          : 'border-transparent text-text-secondary hover:border-border-subtle hover:bg-surface-hover hover:text-text-primary',
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent" />
                      )}
                      <span className={cn('shrink-0', isActive && 'text-accent')}>{item.icon}</span>
                      {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
                      {item.badge && (!collapsed || isMobile) && (
                        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger/8 px-1.5 text-[11px] font-medium text-danger">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border-subtle p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-[var(--radius-lg)] border border-border-subtle bg-bg-primary/80 p-3',
              collapsed && !isMobile && 'justify-center px-2',
            )}
          >
            <Avatar name={userName} size="sm" />
            {(!collapsed || isMobile) && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{userName}</p>
                <Badge variant="secondary" size="sm" className="mt-1">
                  {roleLabels[role]}
                </Badge>
              </div>
            )}
          </div>
          {!isMobile && (
            <button
              onClick={onToggle}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              {!collapsed && <span>Thu gọn</span>}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.aside
        variants={sidebarVariants}
        animate={collapsed ? 'collapsed' : 'expanded'}
        className="surface-panel fixed top-4 bottom-4 left-4 z-[var(--z-sticky)] hidden overflow-hidden rounded-[var(--radius-xl)] lg:flex"
      >
        {renderSidebarBody()}
      </motion.aside>

      <Drawer open={mobileOpen} onClose={onCloseMobile} side="left" title="Điều hướng">
        {renderSidebarBody(true)}
      </Drawer>
    </>
  );
}

export default Sidebar;
