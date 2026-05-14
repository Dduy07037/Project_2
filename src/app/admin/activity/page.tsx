'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Avatar,
    Button,
    InlineState,
    PageHeader,
    SearchInput,
} from '@/components/ui';
import { DataTable } from '@/components/ui/table';
import { useAuth } from '@/components/providers/auth-provider';
import { getActivity, getRoleLabel, type ActivityItemDto } from '@/lib/api/exam-guard';
import { formatDateTime } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminActivityPage() {
    const { request } = useAuth();

    const [activity, setActivity] = useState<ActivityItemDto[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadActivity = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getActivity(request, 150);
            setActivity(response);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Không thể tải activity log.');
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        void loadActivity();
    }, [loadActivity]);

    const filteredActivity = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return activity;
        }

        return activity.filter((item) =>
            item.userName.toLowerCase().includes(query)
            || item.userRole.toLowerCase().includes(query)
            || item.action.toLowerCase().includes(query)
            || item.target.toLowerCase().includes(query)
            || (item.details ?? '').toLowerCase().includes(query),
        );
    }, [activity, search]);

    const columns = [
        {
            key: 'user',
            title: 'Nguoi thuc hien',
            render: (item: ActivityItemDto) => (
                <div className="flex items-center gap-3">
                    <Avatar name={item.userName} size="sm" />
                    <div>
                        <p className="text-sm font-medium text-text-primary">{item.userName}</p>
                        <p className="text-xs text-text-muted">{getRoleLabel(item.userRole)}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'action',
            title: 'Hanh dong',
            render: (item: ActivityItemDto) => <span className="text-sm text-text-primary">{item.action}</span>,
        },
        {
            key: 'target',
            title: 'Doi tuong',
            render: (item: ActivityItemDto) => (
                <div>
                    <p className="text-sm text-text-secondary">{item.target}</p>
                    {item.details && <p className="text-xs text-text-muted">{item.details}</p>}
                </div>
            ),
        },
        {
            key: 'timestamp',
            title: 'Thoi gian',
            render: (item: ActivityItemDto) => <span className="text-xs text-text-muted">{formatDateTime(item.timestamp)}</span>,
        },
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Hoạt động hệ thống"
                    description={`${activity.length} su kien gan day dang duoc hien thi trong bang activity.`}
                />
            </motion.div>

            <motion.div variants={staggerItem} className="max-w-sm">
                <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tim user, action, target..." />
            </motion.div>

            <motion.div variants={staggerItem}>
                {error ? (
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Không thể tải activity"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadActivity()}>
                                Thử lại
                            </Button>
                        )}
                    />
                ) : (
                    <DataTable columns={columns} data={filteredActivity} getRowId={(item) => item.id} loading={loading} emptyMessage="Chưa có sự kiện nào phù hợp." />
                )}
            </motion.div>
        </motion.div>
    );
}
