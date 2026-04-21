'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/motion';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

interface AppShellProps {
  children: ReactNode;
  role: 'admin' | 'lecturer' | 'student';
  userName: string;
  onLogout: () => Promise<void>;
}

export function AppShell({ children, role, userName, onLogout }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const sidebarWidth = sidebarCollapsed ? 88 : 272;

  return (
    <div
      className="min-h-screen"
      style={
        {
          '--shell-sidebar-width': `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <Sidebar
        role={role}
        userName={userName}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <main className="relative lg:pl-[calc(var(--shell-sidebar-width)+1.5rem)]">
        <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 pb-8 pt-4 sm:px-5 lg:px-8">
          <Topbar
            userName={userName}
            userRole={role}
            onLogout={onLogout}
            onOpenSidebar={() => setMobileNavOpen(true)}
          />

          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="enter"
            className="flex-1 pt-4"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default AppShell;
