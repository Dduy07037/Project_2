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
import { formatDateTime } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
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
}

export default function AdminDashboard() {
    const { request } = useAuth();

    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = useCallback(async () => {
        setError(null);

        try {
            const [usersResponse, subjectsResponse, examsResponse, activityResponse, flaggedResponse] = await Promise.all([
                getUsers(request, { page: 1, pageSize: 200 }),
                getSubjects(request),
                getExams(request),
                getActivity(request, 8),
                getMonitoringAttempts(request, { flaggedOnly: true, limit: 8 }),
            ]);

            setData({
                users: usersResponse.items,
                subjects: subjectsResponse,
                exams: examsResponse,
                activity: activityResponse,
                flaggedAttempts: flaggedResponse,
            });
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Khong the tai dashboard admin.');
        } finally {
        }
    }, [request]);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

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

        const now = Date.now();
        const activeSessions = data.exams.flatMap((exam) => exam.sessions)
            .filter((session) => new Date(session.startTime).getTime() <= now && new Date(session.endTime).getTime() > now)
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
                    description="Tong hop du lieu thuc tu users, subjects, exams, attempts va activity."
                />
            </motion.div>

            <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tong nguoi dung" value={stats.totalUsers} icon={<Users className="h-5 w-5" />} accentColor="var(--color-accent)" />
                <StatCard label="Giang vien" value={stats.totalLecturers} icon={<GraduationCap className="h-5 w-5" />} accentColor="var(--color-accent-cyan)" />
                <StatCard label="Ca thi dang mo" value={stats.activeSessions} icon={<FileText className="h-5 w-5" />} accentColor="var(--color-success)" />
                <StatCard label="Can xem xet" value={stats.warnings} icon={<AlertTriangle className="h-5 w-5" />} accentColor="var(--color-warning)" />
            </motion.div>

            {error && !data ? (
                <motion.div variants={staggerItem}>
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Khong the tai dashboard"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadDashboard()}>
                                Thu lai
                            </Button>
                        )}
                    />
                </motion.div>
            ) : !data ? (
                <motion.div variants={staggerItem}>
                    <InlineState title="Dang tai dashboard" description="ExamGuard dang tong hop du lieu he thong." />
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div variants={staggerItem} className="lg:col-span-2">
                        <Panel
                            title="Activity gan day"
                            description="Du lieu tu endpoint /api/activity"
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
                                    <div key={item.id} className="flex items-start gap-3 py-2 border-b border-border last:border-b-0">
                                        <Avatar name={item.userName} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-text-primary">
                                                <span className="font-medium">{item.userName}</span>
                                                <span className="text-text-muted"> · {item.action}</span>
                                            </p>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                {item.target}
                                                {item.details ? ` · ${item.details}` : ''}
                                            </p>
                                        </div>
                                        <span className="text-[11px] text-text-muted whitespace-nowrap">{formatDateTime(item.timestamp)}</span>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </motion.div>

                    <motion.div variants={staggerItem} className="space-y-4">
                        <Panel title="Phan bo vai tro">
                            <div className="space-y-3">
                                {[
                                    { label: 'Admin', count: data.users.filter((user) => user.role.toLowerCase() === 'admin').length, total: data.users.length, color: 'bg-danger' },
                                    { label: 'Giang vien', count: stats.totalLecturers, total: data.users.length, color: 'bg-accent-cyan' },
                                    { label: 'Sinh vien', count: stats.totalStudents, total: data.users.length, color: 'bg-accent' },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <span className="text-text-secondary font-medium">{item.label}</span>
                                            <span className="text-text-muted">{item.count}/{item.total}</span>
                                        </div>
                                        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${item.color}`}
                                                style={{ width: `${item.total === 0 ? 0 : (item.count / item.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>

                        <Panel title="Mon hoc noi bat">
                            <div className="space-y-2">
                                {data.subjects.slice(0, 4).map((subject) => (
                                    <div key={subject.id} className="flex items-center justify-between py-1.5">
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">{subject.code}</p>
                                            <p className="text-xs text-text-muted">{subject.name}</p>
                                        </div>
                                        <StatusBadge status={subject.isActive ? 'active' : 'disabled'} />
                                    </div>
                                ))}
                            </div>
                        </Panel>

                        <Panel title="Attempt can xem xet">
                            <div className="space-y-3">
                                {data.flaggedAttempts.length === 0 ? (
                                    <p className="text-sm text-text-muted">Chua co attempt bat thuong nao.</p>
                                ) : data.flaggedAttempts.slice(0, 4).map((item) => (
                                    <div key={item.attempt.id} className="flex items-start gap-3 py-2 border-b border-border last:border-b-0">
                                        <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="h-4 w-4 text-warning" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-text-primary">{item.attempt.studentName}</p>
                                            <p className="text-xs text-text-muted">{item.attempt.examTitle}</p>
                                            <p className="text-xs text-warning mt-1">{item.attempt.flagReason || 'Flagged by event logs'}</p>
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
