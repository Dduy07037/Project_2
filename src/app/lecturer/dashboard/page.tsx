'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Button,
    InlineState,
    PageHeader,
    Panel,
    StatCard,
    StatusBadge,
} from '@/components/ui';
import { useAuth } from '@/components/providers/auth-provider';
import {
    getExams,
    getMonitoringAttempts,
    getQuestions,
    type ExamDto,
    type MonitoringAttemptDto,
    type QuestionDto,
} from '@/lib/api/exam-guard';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { formatDuration } from '@/lib/utils';
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    ClipboardList,
    Clock,
    FileText,
    Shield,
} from 'lucide-react';

interface LecturerDashboardData {
    questions: QuestionDto[];
    exams: ExamDto[];
    attempts: MonitoringAttemptDto[];
    snapshotAt: number;
}

export default function LecturerDashboard() {
    const { request, user } = useAuth();

    const [data, setData] = useState<LecturerDashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => Promise.all([
        getQuestions(request, { page: 1, pageSize: 100, isActive: true }),
        getExams(request),
        getMonitoringAttempts(request, { limit: 100 }),
    ]), [request]);

    const loadDashboard = useCallback(async () => {
        setError(null);

        try {
            const [questionsResponse, examsResponse, attemptsResponse] = await fetchDashboard();

            setData({
                questions: questionsResponse.items,
                exams: examsResponse,
                attempts: attemptsResponse,
                snapshotAt: Date.now(),
            });
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Không thể tải dashboard giảng viên.');
        }
    }, [fetchDashboard]);

    useEffect(() => {
        let cancelled = false;

        async function hydrateDashboard() {
            try {
                const [questionsResponse, examsResponse, attemptsResponse] = await fetchDashboard();

                if (cancelled) {
                    return;
                }

                setError(null);
                setData({
                    questions: questionsResponse.items,
                    exams: examsResponse,
                    attempts: attemptsResponse,
                    snapshotAt: Date.now(),
                });
            } catch (loadError) {
                if (cancelled) {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : 'Không thể tải dashboard giảng viên.');
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
                questionCount: 0,
                examCount: 0,
                activeSessions: 0,
                flaggedCount: 0,
                averageScore: '-',
            };
        }

        const activeSessions = data.exams
            .flatMap((exam) => exam.sessions)
            .filter((session) => new Date(session.startTime).getTime() <= data.snapshotAt && new Date(session.endTime).getTime() > data.snapshotAt)
            .length;

        const flaggedAttempts = data.attempts.filter((item) => item.attempt.isFlagged || item.attempt.tabSwitchCount > 0 || item.attempt.reloadCount > 0);
        const scoredAttempts = data.attempts.filter((item) => typeof item.attempt.score === 'number');
        const averageScore = scoredAttempts.length === 0
            ? '-'
            : (scoredAttempts.reduce((sum, item) => sum + Number(item.attempt.score ?? 0), 0) / scoredAttempts.length).toFixed(1);

        return {
            questionCount: data.questions.length,
            examCount: data.exams.length,
            activeSessions,
            flaggedCount: flaggedAttempts.length,
            averageScore,
        };
    }, [data]);

    const flaggedAttempts = data?.attempts.filter((item) => item.attempt.isFlagged || item.attempt.tabSwitchCount > 0 || item.attempt.reloadCount > 0) ?? [];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Dashboard"
                    description={`Xin chào ${user?.fullName ?? 'giảng viên'}, đây là tổng hợp câu hỏi, kỳ thi và attempt cần theo dõi.`}
                    actions={(
                        <div className="flex gap-2">
                            <Link href="/lecturer/questions">
                                <Button variant="secondary">Mo ngan hang cau hoi</Button>
                            </Link>
                            <Link href="/lecturer/exams">
                                <Button>Quản lý kỳ thi</Button>
                            </Link>
                        </div>
                    )}
                />
            </motion.div>

            <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Câu hỏi" value={stats.questionCount} icon={<ClipboardList className="h-5 w-5" />} accentColor="var(--color-accent)" />
                <StatCard label="Kỳ thi" value={stats.examCount} icon={<FileText className="h-5 w-5" />} accentColor="var(--color-text-secondary)" />
                <StatCard label="Ca đang mở" value={stats.activeSessions} icon={<Clock className="h-5 w-5" />} accentColor="var(--color-success)" />
                <StatCard label="Cần xem xét" value={stats.flaggedCount} icon={<AlertTriangle className="h-5 w-5" />} accentColor="var(--color-warning)" />
            </motion.div>

            {error && !data ? (
                <motion.div variants={staggerItem}>
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Không thể tải dashboard"
                        description={error}
                        actions={<Button variant="secondary" onClick={() => void loadDashboard()}>Thử lại</Button>}
                    />
                </motion.div>
            ) : !data ? (
                <motion.div variants={staggerItem}>
                    <InlineState title="Đang tải dashboard" description="ExamGuard đang tổng hợp dữ liệu giảng viên." />
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <motion.div variants={staggerItem} className="lg:col-span-2">
                        <Panel
                            title="Kỳ thi của tôi"
                            description="Danh sach draft, published va session dang dien ra."
                            action={(
                                <Link href="/lecturer/exams">
                                    <Button variant="ghost" size="sm" iconRight={<ArrowRight className="h-3 w-3" />}>
                                        Xem tat ca
                                    </Button>
                                </Link>
                            )}
                        >
                            <div className="space-y-3">
                                {data.exams.length === 0 ? (
                                    <p className="text-sm text-text-muted">Chưa có kỳ thi nào. Bạn có thể tạo draft exam ngay trong trang danh sách.</p>
                                ) : data.exams.slice(0, 6).map((exam) => (
                                    <Link key={exam.id} href={`/lecturer/exams/${exam.id}`} className="block">
                                        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border p-3 transition-all duration-150 hover:border-border-hover hover:bg-surface-hover">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-text-primary">{exam.title}</p>
                                                    <StatusBadge status={exam.status.toLowerCase()} />
                                                </div>
                                                <div className="mt-1 flex items-center gap-4 text-xs text-text-muted">
                                                    <span>{exam.subjectName}</span>
                                                    <span>{exam.questionCount} cau</span>
                                                    <span>{formatDuration(exam.durationMinutes)}</span>
                                                    <span>{exam.sessions.length} session</span>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-text-muted" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </Panel>
                    </motion.div>

                    <motion.div variants={staggerItem} className="space-y-4">
                        <Panel title="Attempt can xem xet" description="Tin hieu tab switch, reload va bai lam bi danh dau.">
                            <div className="space-y-3">
                                {flaggedAttempts.slice(0, 4).map((item) => (
                                    <div key={item.attempt.id} className="flex items-start gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/10">
                                            <AlertTriangle className="h-4 w-4 text-warning" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-text-primary">{item.attempt.studentName}</p>
                                            <p className="text-xs text-text-muted">{item.attempt.examTitle}</p>
                                            <p className="mt-1 text-xs text-warning">{item.attempt.flagReason || `${item.attempt.tabSwitchCount} tab / ${item.attempt.reloadCount} reload`}</p>
                                        </div>
                                    </div>
                                ))}
                                {stats.flaggedCount === 0 && (
                                    <p className="text-sm text-text-muted">Chưa có attempt bất thường nào.</p>
                                )}
                            </div>
                        </Panel>

                        <Panel title="Thong ke nhanh" description="Snapshot nhanh de ra quyet dinh trong ngay.">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">Tổng attempts</span>
                                    <span className="text-sm font-semibold text-text-primary">{data.attempts.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">Diem trung binh</span>
                                    <span className="text-sm font-semibold text-text-primary">{stats.averageScore}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">Đã nộp bài</span>
                                    <span className="text-sm font-semibold text-success">
                                        {data.attempts.filter((item) => item.attempt.status.toLowerCase() === 'submitted').length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">Auto submit</span>
                                    <span className="text-sm font-semibold text-warning">
                                        {data.attempts.filter((item) => item.attempt.status.toLowerCase() === 'autosubmitted').length}
                                    </span>
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Monitoring" description="Truy cap nhanh vao trang hau kiem bai lam.">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-border-subtle bg-bg-tertiary text-text-secondary">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-text-primary">Mo trang hau kiem</p>
                                    <p className="text-xs text-text-muted">Xem log tab switch, reload va submit type.</p>
                                </div>
                                <Link href="/lecturer/monitoring">
                                    <Button variant="ghost" size="sm">Mo</Button>
                                </Link>
                            </div>
                        </Panel>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
