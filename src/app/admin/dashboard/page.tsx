'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Avatar,
    Button,
    InlineState,
    PageHeader,
    Panel,
    StatCard,
    StatusBadge,
} from '@/components/ui';
import { useAuth } from '@/components/providers/auth-provider';
import {
    getActivity,
    getExams,
    getMonitoringAttempts,
    getSubjects,
    getUsers,
    type ActivityItemDto,
    type ExamDto,
    type MonitoringAttemptDto,
    type SubjectDto,
    type UserDto,
} from '@/lib/api/exam-guard';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { formatDateTime } from '@/lib/utils';
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    FileText,
    GraduationCap,
    RefreshCw,
    Users,
} from 'lucide-react';

interface DashboardData {
    users: UserDto[];
    subjects: SubjectDto[];
    exams: ExamDto[];
    activity: ActivityItemDto[];
    flaggedAttempts: MonitoringAttemptDto[];
    snapshotAt: number;
}

export default function AdminDashboard() {
    const { request } = useAuth();

    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => Promise.all([
        getUsers(request, { page: 1, pageSize: 200 }),
        getSubjects(request),
        getExams(request),
        getActivity(request, 8),
        getMonitoringAttempts(request, { flaggedOnly: true, limit: 8 }),
    ]), [request]);

    const loadDashboard = useCallback(async () => {
        setError(null);

        try {
            const [usersResponse, subjectsResponse, examsResponse, activityResponse, flaggedResponse] = await fetchDashboard();

            setData({
                users: usersResponse.items,
                subjects: subjectsResponse,
                exams: examsResponse,
                activity: activityResponse,
                flaggedAttempts: flaggedResponse,
                snapshotAt: Date.now(),
            });
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Không thể tải dashboard admin.');
        }
    }, [fetchDashboard]);

    useEffect(() => {
        let cancelled = false;

        async function hydrateDashboard() {
            try {
                const [usersResponse, subjectsResponse, examsResponse, activityResponse, flaggedResponse] = await fetchDashboard();

                if (cancelled) {
                    return;
                }

                setError(null);
                setData({
                    users: usersResponse.items,
                    subjects: subjectsResponse,
                    exams: examsResponse,
                    activity: activityResponse,
                    flaggedAttempts: flaggedResponse,
                    snapshotAt: Date.now(),
                });
            } catch (loadError) {
                if (cancelled) {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : 'Không thể tải dashboard admin.');
            }
        }

        void hydrateDashboard();

        return () => {
            cancelled = true;
        };
    }, [fetchDashboard]);

    const stats = useMemo(() => {
        if (!data) {
            return {
                totalUsers: 0,
                totalLecturers: 0,
                totalStudents: 0,
                activeSessions: 0,
                warnings: 0,
            };
        }

        const activeSessions = data.exams
            .flatMap((exam) => exam.sessions)
            .filter((session) => new Date(session.startTime).getTime() <= data.snapshotAt && new Date(session.endTime).getTime() > data.snapshotAt)
            .length;

        return {
            totalUsers: data.users.length,
            totalLecturers: data.users.filter((user) => user.role.toLowerCase() === 'lecturer').length,
            totalStudents: data.users.filter((user) => user.role.toLowerCase() === 'student').length,
            activeSessions,
            warnings: data.flaggedAttempts.length,
        };
    }, [data]);

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Dashboard"
                    description="Tổng hợp người dùng, môn học, kỳ thi và các tín hiệu cần theo dõi trong hệ thống."
                />
            </motion.div>

            <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Tổng người dùng" value={stats.totalUsers} icon={<Users className="h-5 w-5" />} accentColor="var(--color-accent)" />
                <StatCard label="Giảng viên" value={stats.totalLecturers} icon={<GraduationCap className="h-5 w-5" />} accentColor="var(--color-text-secondary)" />
                <StatCard label="Ca thi đang mở" value={stats.activeSessions} icon={<FileText className="h-5 w-5" />} accentColor="var(--color-success)" />
                <StatCard label="Cần xem xét" value={stats.warnings} icon={<AlertTriangle className="h-5 w-5" />} accentColor="var(--color-warning)" />
            </motion.div>

            {error && !data ? (
                <motion.div variants={staggerItem}>
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Không thể tải dashboard"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadDashboard()}>
                                Thử lại
                            </Button>
                        )}
                    />
                </motion.div>
            ) : !data ? (
                <motion.div variants={staggerItem}>
                    <InlineState title="Đang tải dashboard" description="ExamGuard đang tổng hợp dữ liệu hệ thống." />
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <motion.div variants={staggerItem} className="lg:col-span-2">
                        <Panel
                            title="Activity gan day"
                            description="Dau vet cap nhat gan nhat tu he thong van hanh."
                            action={(
                                <Link href="/admin/activity">
                                    <Button variant="ghost" size="sm" iconRight={<ArrowRight className="h-3 w-3" />}>
                                        Xem tat ca
                                    </Button>
                                </Link>
                            )}
                        >
                            <div className="space-y-3">
                                {data.activity.map((item) => (
                                    <div key={item.id} className="flex items-start gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                                        <Avatar name={item.userName} size="sm" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-text-primary">
                                                <span className="font-medium">{item.userName}</span>
                                                <span className="text-text-muted"> - {item.action}</span>
                                            </p>
                                            <p className="mt-0.5 text-xs text-text-muted">
                                                {item.target}
                                                {item.details ? ` - ${item.details}` : ''}
                                            </p>
                                        </div>
                                        <span className="whitespace-nowrap text-[11px] text-text-muted">{formatDateTime(item.timestamp)}</span>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </motion.div>

                    <motion.div variants={staggerItem} className="space-y-4">
                        <Panel title="Phân bố vai trò" description="Tỷ trọng người dùng theo từng nhóm quyền.">
                            <div className="space-y-3">
                                {[
                                    { label: 'Admin', count: data.users.filter((user) => user.role.toLowerCase() === 'admin').length, total: data.users.length, color: 'bg-text-primary' },
                                    { label: 'Giảng viên', count: stats.totalLecturers, total: data.users.length, color: 'bg-text-secondary' },
                                    { label: 'Sinh viên', count: stats.totalStudents, total: data.users.length, color: 'bg-accent' },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="mb-1.5 flex items-center justify-between text-xs">
                                            <span className="font-medium text-text-secondary">{item.label}</span>
                                            <span className="text-text-muted">{item.count}/{item.total}</span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
                                            <div
                                                className={`h-full rounded-full ${item.color}`}
                                                style={{ width: `${item.total === 0 ? 0 : (item.count / item.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>

                        <Panel title="Môn học nổi bật" description="Danh sách môn học đang hoạt động gần đây.">
                            <div className="space-y-2">
                                {data.subjects.slice(0, 4).map((subject) => (
                                    <div key={subject.id} className="flex items-center justify-between py-1.5">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-text-primary">{subject.code}</p>
                                            <p className="truncate text-xs text-text-muted">{subject.name}</p>
                                        </div>
                                        <StatusBadge status={subject.isActive ? 'active' : 'disabled'} />
                                    </div>
                                ))}
                            </div>
                        </Panel>

                        <Panel title="Attempt can xem xet" description="Cac bai lam co dau hieu can hau kiem.">
                            <div className="space-y-3">
                                {data.flaggedAttempts.length === 0 ? (
                                    <p className="text-sm text-text-muted">Chưa có attempt bất thường nào.</p>
                                ) : data.flaggedAttempts.slice(0, 4).map((item) => (
                                    <div key={item.attempt.id} className="flex items-start gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/10">
                                            <AlertTriangle className="h-4 w-4 text-warning" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-text-primary">{item.attempt.studentName}</p>
                                            <p className="text-xs text-text-muted">{item.attempt.examTitle}</p>
                                            <p className="mt-1 text-xs text-warning">{item.attempt.flagReason || 'Bị gắn cờ từ event log'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
