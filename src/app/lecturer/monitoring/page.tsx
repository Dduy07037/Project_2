'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Badge,
    Button,
    InlineState,
    PageHeader,
    SearchInput,
    StatCard,
    StatusBadge,
    Tabs,
} from '@/components/ui';
import { useAuth } from '@/components/providers/auth-provider';
import { getMonitoringAttempts, toStatusKey, type MonitoringAttemptDto } from '@/lib/api/exam-guard';
import { formatDateTime, formatTime } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { AlertCircle, AlertTriangle, Clock, Flag, Monitor, RefreshCw, Shield } from 'lucide-react';

export default function MonitoringPage() {
    const { request } = useAuth();

    const [attempts, setAttempts] = useState<MonitoringAttemptDto[]>([]);
    const [activeTab, setActiveTab] = useState('flagged');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMonitoring = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getMonitoringAttempts(request, { limit: 200 });
            setAttempts(response);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Khong the tai du lieu monitoring.');
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        void loadMonitoring();
    }, [loadMonitoring]);

    const flaggedAttempts = useMemo(
        () => attempts.filter((item) => item.attempt.isFlagged || item.attempt.tabSwitchCount > 0 || item.attempt.reloadCount > 0),
        [attempts],
    );

    const displayedAttempts = activeTab === 'flagged' ? flaggedAttempts : attempts;
    const filteredAttempts = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return displayedAttempts;
        }

        return displayedAttempts.filter((item) =>
            item.attempt.studentName.toLowerCase().includes(query)
            || (item.attempt.studentCode ?? '').toLowerCase().includes(query)
            || item.attempt.examTitle.toLowerCase().includes(query),
        );
    }, [displayedAttempts, search]);

    const tabs = [
        { id: 'flagged', label: 'Can xem xet', count: flaggedAttempts.length },
        { id: 'all', label: 'Tat ca attempt', count: attempts.length },
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Monitoring va hau kiem"
                    description="Du lieu nay den truc tiep tu /api/attempts/monitoring."
                />
            </motion.div>

            <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tong luot thi" value={attempts.length} icon={<Monitor className="h-5 w-5" />} />
                <StatCard label="Can xem xet" value={flaggedAttempts.length} icon={<Flag className="h-5 w-5" />} accentColor="var(--color-warning)" />
                <StatCard
                    label="Tab switch"
                    value={attempts.reduce((sum, item) => sum + item.attempt.tabSwitchCount, 0)}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    accentColor="var(--color-danger)"
                />
                <StatCard
                    label="Auto submit"
                    value={attempts.filter((item) => toStatusKey(item.attempt.status) === 'auto_submitted').length}
                    icon={<Clock className="h-5 w-5" />}
                    accentColor="var(--color-info)"
                />
            </motion.div>

            <motion.div variants={staggerItem}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </motion.div>

            <motion.div variants={staggerItem} className="max-w-sm">
                <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tim sinh vien, MSSV, ky thi..." />
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-3">
                {error ? (
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Khong the tai monitoring"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadMonitoring()}>
                                Thu lai
                            </Button>
                        )}
                    />
                ) : loading && attempts.length === 0 ? (
                    <InlineState title="Dang tai monitoring" description="ExamGuard dang tong hop attempt logs tu backend." />
                ) : filteredAttempts.length === 0 ? (
                    <InlineState title="Khong co attempt phu hop" description="Thu doi bo loc hoac quay lai sau khi co them du lieu." />
                ) : filteredAttempts.map((item) => (
                    <div
                        key={item.attempt.id}
                        className={`glass-card rounded-[var(--radius-xl)] p-5 border-l-2 ${item.attempt.isFlagged ? 'border-l-warning' : 'border-l-border'}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-accent/10 flex items-center justify-center shrink-0">
                                <Shield className="h-5 w-5 text-accent-light" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-text-primary">{item.attempt.studentName}</span>
                                    <span className="text-xs text-text-muted font-mono">{item.attempt.studentCode || 'Khong co MSSV'}</span>
                                    <StatusBadge status={toStatusKey(item.attempt.status)} />
                                </div>
                                <p className="text-xs text-text-muted mt-0.5">{item.attempt.examTitle}</p>
                                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs">
                                    <span className="text-text-secondary">
                                        Thoi gian: <span className="text-text-primary">{item.attempt.timeSpentSeconds ? formatTime(item.attempt.timeSpentSeconds) : '—'}</span>
                                    </span>
                                    <span className="text-text-secondary">
                                        Tab: <span className={item.attempt.tabSwitchCount > 0 ? 'text-warning' : 'text-text-primary'}>{item.attempt.tabSwitchCount}</span>
                                    </span>
                                    <span className="text-text-secondary">
                                        Reload: <span className={item.attempt.reloadCount > 0 ? 'text-warning' : 'text-text-primary'}>{item.attempt.reloadCount}</span>
                                    </span>
                                    <span className="text-text-secondary">
                                        Diem: <span className="text-text-primary">{item.attempt.score ?? '—'}</span>
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {item.attempt.flagReason && <Badge variant="warning">{item.attempt.flagReason}</Badge>}
                                    {!item.attempt.flagReason && item.attempt.tabSwitchCount > 0 && (
                                        <Badge variant="warning">{item.attempt.tabSwitchCount} tab switch</Badge>
                                    )}
                                </div>
                                <div className="mt-3 pl-3 border-l border-border space-y-1.5">
                                    {item.recentEvents.length === 0 ? (
                                        <span className="text-[11px] text-text-muted">Chua co event log chi tiet.</span>
                                    ) : item.recentEvents.map((event) => (
                                        <div key={event.id} className="flex items-center gap-3 text-[11px]">
                                            <span className="text-text-muted min-w-[120px]">{formatDateTime(event.timestamp)}</span>
                                            <StatusBadge status={toStatusKey(event.eventType)} />
                                            <span className="text-text-secondary">{event.details || event.eventType}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}
