'use client';

import { motion } from 'framer-motion';
import { PageHeader, Panel, StatusBadge, Avatar } from '@/components/ui';
import { DataTable } from '@/components/ui/table';
import { SearchInput } from '@/components/ui/input';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { mockActivityLogs } from '@/lib/mock-data';
import { formatDateTime } from '@/lib/utils';
import { useState } from 'react';
import { Activity } from 'lucide-react';

export default function AdminActivityPage() {
    const [search, setSearch] = useState('');
    const filtered = mockActivityLogs.filter(l =>
        l.userName.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.target.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            key: 'user', title: 'Người dùng', render: (l: typeof mockActivityLogs[0]) => (
                <div className="flex items-center gap-2">
                    <Avatar name={l.userName} size="sm" />
                    <div>
                        <p className="text-sm font-medium text-text-primary">{l.userName}</p>
                        <p className="text-xs text-text-muted">{l.userRole}</p>
                    </div>
                </div>
            )
        },
        { key: 'action', title: 'Hành động', render: (l: typeof mockActivityLogs[0]) => <span className="text-sm text-text-primary">{l.action}</span> },
        {
            key: 'target', title: 'Đối tượng', render: (l: typeof mockActivityLogs[0]) => (
                <div>
                    <span className="text-sm text-text-secondary">{l.target}</span>
                    {l.details && <p className="text-xs text-text-muted">{l.details}</p>}
                </div>
            )
        },
        { key: 'timestamp', title: 'Thời gian', render: (l: typeof mockActivityLogs[0]) => <span className="text-xs text-text-muted font-mono">{formatDateTime(l.timestamp)}</span> },
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader title="Hoạt động hệ thống" description="Lịch sử các thao tác trên hệ thống" />
            </motion.div>
            <motion.div variants={staggerItem} className="max-w-sm">
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm hoạt động..." />
            </motion.div>
            <motion.div variants={staggerItem}>
                <DataTable columns={columns} data={filtered} emptyMessage="Không có hoạt động" />
            </motion.div>
        </motion.div>
    );
}
