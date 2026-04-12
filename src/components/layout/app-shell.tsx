'use client';

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { pageVariants } from '@/lib/motion';

interface AppShellProps {
    children: ReactNode;
    role: 'admin' | 'lecturer' | 'student';
    userName: string;
    onLogout: () => Promise<void>;
}

export function AppShell({ children, role, userName, onLogout }: AppShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen relative">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="ambient-orb ambient-orb-purple w-[500px] h-[500px] -top-48 -left-32 opacity-25" />
                <div className="ambient-orb ambient-orb-cyan w-[400px] h-[400px] top-1/2 -right-48 opacity-15" style={{ animationDelay: '3s' }} />
                <div className="ambient-orb ambient-orb-emerald w-[300px] h-[300px] bottom-0 left-1/3 opacity-10" style={{ animationDelay: '5s' }} />
            </div>

            <Sidebar
                role={role}
                userName={userName}
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <Topbar
                userName={userName}
                userRole={role}
                sidebarCollapsed={sidebarCollapsed}
                onLogout={onLogout}
            />

            <main
                className={cn(
                    'pt-[80px] min-h-screen relative z-10',
                    'transition-[margin-left] duration-400 ease-[var(--ease-out-expo)]'
                )}
                style={{ marginLeft: sidebarCollapsed ? 72 + 12 : 260 + 12 }}
            >
                <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="enter"
                    className="p-6"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}

export default AppShell;
