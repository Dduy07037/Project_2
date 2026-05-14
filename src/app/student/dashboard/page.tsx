'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Button,
    Card,
    InlineState,
    PageHeader,
    Panel,
    StatCard,
    StatusBadge,
} from '@/components/ui';
import { useAuth } from '@/components/providers/auth-provider';
import {
    getAttemptHistory,
    getAvailableSessions,
    toStatusKey,
    type AttemptSummaryDto,
    type AvailableSessionDto,
} from '@/lib/api/exam-guard';
import { cn } from '@/lib/cn';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { formatDateTime, formatTime } from '@/lib/utils';
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock,
    GraduationCap,
    RefreshCw,
    Trophy,
    TrendingUp,
} from 'lucide-react';

interface StudentDashboardData {
    sessions: AvailableSessionDto[];
    history: AttemptSummaryDto[];
}

export default function StudentDashboard() {
    const { request, user } = useAuth();

    const [data, setData] = useState<StudentDashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => Promise.all([
        getAvailableSessions(request),
        getAttemptHistory(request),
    ]), [request]);

    const loadDashboard = useCallback(async () => {
        setError(null);

        try {
            const [sessionsResponse, historyResponse] = await fetchDashboard();

            setData({
                sessions: sessionsResponse,
                history: historyResponse,
            });
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Không thể tải dashboard sinh viên.');
        }
    }, [fetchDashboard]);

    useEffect(() => {
        let cancelled = false;

        async function hydrateDashboard() {
            try {
                const [sessionsResponse, historyResponse] = await fetchDashboard();

                if (cancelled) {
                    return;
                }

                setError(null);
                setData({
                    sessions: sessionsResponse,
                    history: historyResponse,
                });
            } catch (loadError) {
                if (cancelled) {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : 'Không thể tải dashboard sinh viên.');
            }
        }

        void hydrateDashboard();

        return () => {
            cancelled = true;
        };
    }, [fetchDashboard]);

    const computed = useMemo(() => {
        if (!data) {
            return {
                upcomingSessions: [] as AvailableSessionDto[],
                recentHistory: [] as AttemptSummaryDto[],
                averageScore: '-',
            };
        }

        const upcomingSessions = [...data.sessions].sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime());
        const recentHistory = [...data.history].sort((left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()).slice(0, 3);
        const scored = data.history.filter((attempt) => typeof attempt.score === 'number');
        const averageScore = scored.length === 0
            ? '-'
            : (scored.reduce((sum, attempt) => sum + Number(attempt.score ?? 0), 0) / scored.length).toFixed(1);

        return {
            upcomingSessions,
            recentHistory,
            averageScore,
        };
    }, [data]);

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-8">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title={`Xin chào ${user?.fullName ?? 'bạn'}`}
                    description="Tổng hợp ca thi sắp tới, tiến độ làm bài và kết quả gần đây trên cùng một màn hình."
                    actions={(
                        <Link href="/student/exams">
                            <Button iconRight={<ChevronRight className="h-4 w-4" />}>
                                Xem ca thi
                            </Button>
                        </Link>
                    )}
                />
            </motion.div>

            {error && !data ? (
                <motion.div variants={staggerItem}>
                    <InlineState
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
                    <InlineState title="Đang tải dashboard" description="ExamGuard đang tổng hợp sessions và lịch sử làm bài." />
                </motion.div>
            ) : (
                <>
                    <motion.div variants={staggerItem} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="Ca thi khả dụng" value={computed.upcomingSessions.length} icon={<CalendarDays className="h-5 w-5" />} accentColor="var(--color-accent)" />
                        <StatCard label="Da thi" value={data.history.length} icon={<CheckCircle2 className="h-5 w-5" />} accentColor="var(--color-text-secondary)" />
                        <StatCard label="Diem trung binh" value={computed.averageScore} icon={<TrendingUp className="h-5 w-5" />} accentColor="var(--color-success)" />
                        <StatCard label="Đang làm" value={data.sessions.filter((session) => session.hasExistingAttempt && toStatusKey(session.attemptStatus) === 'in_progress').length} icon={<Clock className="h-5 w-5" />} accentColor="var(--color-warning)" />
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <motion.div variants={staggerItem} className="lg:col-span-3">
                            <Panel title="Ca thi sắp tới" description="Danh sách session sinh viên có thể tham gia trong thời gian sắp tới.">
                                <div className="space-y-3">
                                    {computed.upcomingSessions.length === 0 ? (
                                        <InlineState title="Không có ca thi sắp tới" description="Bạn chưa được mở session nào." />
                                    ) : computed.upcomingSessions.slice(0, 5).map((session) => (
                                        <Card key={session.sessionId} hover className="group !p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-border-subtle bg-bg-tertiary text-text-secondary">
                                                    <GraduationCap className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="text-sm font-semibold text-text-primary">{session.examTitle}</h4>
                                                        <StatusBadge status={toStatusKey(session.status)} />
                                                    </div>
                                                    <p className="mt-0.5 text-xs text-text-muted">{session.subjectName}</p>
                                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                                                        <span>{session.questionCount} cau</span>
                                                        <span>{session.durationMinutes} phut</span>
                                                        <span>{formatDateTime(session.startTime)}</span>
                                                    </div>
                                                </div>
                                                {toStatusKey(session.status) === 'active' ? (
                                                    <Link href={`/student/exams/${session.sessionId}/take`}>
                                                        <Button size="sm" variant="secondary">
                                                            {session.hasExistingAttempt ? 'Tiep tuc' : 'Vao thi'}
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button size="sm" variant="secondary" disabled>
                                                        Chưa đến giờ
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </Panel>
                        </motion.div>

                        <motion.div variants={staggerItem} className="lg:col-span-2">
                            <Panel title="Kết quả gần đây" description="3 attempt mới nhất của bạn">
                                <div className="space-y-3">
                                    {computed.recentHistory.length === 0 ? (
                                        <InlineState title="Chưa có kết quả" description="Sau khi nộp bài, lịch sử và điểm sẽ hiện ở đây." />
                                    ) : computed.recentHistory.map((attempt) => {
                                        const passed = typeof attempt.score === 'number' && attempt.score >= 5;

                                        return (
                                            <div key={attempt.id} className="flex items-center gap-4 rounded-[var(--radius-md)] border border-border-subtle bg-bg-tertiary p-3">
                                                <div className={cn(
                                                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] border',
                                                    passed ? 'border-success/20 bg-success/10 text-success' : 'border-border bg-bg-secondary text-text-primary',
                                                )}>
                                                    <span className="text-lg font-bold">{attempt.score ?? '-'}</span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-text-primary">{attempt.examTitle}</p>
                                                    <div className="mt-0.5 flex items-center gap-2">
                                                        <span className="text-xs text-text-muted">{attempt.correctAnswers ?? 'Ẩn'} / {attempt.totalQuestions} đúng</span>
                                                        <span className="text-xs text-text-muted">/</span>
                                                        <span className="text-xs text-text-muted">{attempt.timeSpentSeconds ? formatTime(attempt.timeSpentSeconds) : '-'}</span>
                                                    </div>
                                                </div>
                                                <Trophy className={cn('h-4 w-4 shrink-0', passed ? 'text-success' : 'text-text-muted/30')} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </Panel>
                        </motion.div>
                    </div>
                </>
            )}
        </motion.div>
    );
}
