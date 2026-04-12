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
import { formatDateTime, formatTime } from '@/lib/utils';
import { cn } from '@/lib/cn';
import { staggerContainer, staggerItem } from '@/lib/motion';
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

    const loadDashboard = useCallback(async () => {
        setError(null);

        try {
            const [sessionsResponse, historyResponse] = await Promise.all([
                getAvailableSessions(request),
                getAttemptHistory(request),
            ]);

            setData({
                sessions: sessionsResponse,
                history: historyResponse,
            });
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Khong the tai dashboard sinh vien.');
        } finally {
        }
    }, [request]);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    const computed = useMemo(() => {
        if (!data) {
            return {
                upcomingSessions: [] as AvailableSessionDto[],
                recentHistory: [] as AttemptSummaryDto[],
                averageScore: '—',
            };
        }

        const upcomingSessions = [...data.sessions].sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime());
        const recentHistory = [...data.history].sort((left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()).slice(0, 3);
        const scored = data.history.filter((attempt) => typeof attempt.score === 'number');
        const averageScore = scored.length === 0
            ? '—'
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
                    title={`Xin chao ${user?.fullName ?? 'ban'}`}
                    description="Dashboard nay dang dung du lieu that tu available sessions va attempt history."
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
                    <InlineState title="Dang tai dashboard" description="ExamGuard dang tong hop sessions va lich su lam bai." />
                </motion.div>
            ) : (
                <>
                    <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard label="Ca thi kha dung" value={computed.upcomingSessions.length} icon={<CalendarDays className="h-5 w-5" />} accentColor="#8b5cf6" />
                        <StatCard label="Da thi" value={data.history.length} icon={<CheckCircle2 className="h-5 w-5" />} accentColor="#22d3ee" />
                        <StatCard label="Diem trung binh" value={computed.averageScore} icon={<TrendingUp className="h-5 w-5" />} accentColor="#34d399" />
                        <StatCard label="Dang lam" value={data.sessions.filter((session) => session.hasExistingAttempt && toStatusKey(session.attemptStatus) === 'in_progress').length} icon={<Clock className="h-5 w-5" />} accentColor="#fbbf24" />
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <motion.div variants={staggerItem} className="lg:col-span-3">
                            <Panel title="Ca thi sap toi" description="Lay tu GET /api/exams/available">
                                <div className="space-y-3">
                                    {computed.upcomingSessions.length === 0 ? (
                                        <InlineState title="Khong co ca thi sap toi" description="Ban chua duoc mo session nao." />
                                    ) : computed.upcomingSessions.slice(0, 5).map((session) => (
                                        <Card key={session.sessionId} hover className="group !p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-gradient-to-br from-accent/20 to-accent-cyan/10 border border-accent/15 flex items-center justify-center shrink-0">
                                                    <GraduationCap className="h-5 w-5 text-accent-light" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-sm font-bold text-text-primary">{session.examTitle}</h4>
                                                        <StatusBadge status={toStatusKey(session.status)} />
                                                    </div>
                                                    <p className="text-xs text-text-muted mt-0.5">{session.subjectName}</p>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-muted">
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
                                                        Chua den gio
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </Panel>
                        </motion.div>

                        <motion.div variants={staggerItem} className="lg:col-span-2">
                            <Panel title="Ket qua gan day" description="3 attempt moi nhat cua ban">
                                <div className="space-y-3">
                                    {computed.recentHistory.length === 0 ? (
                                        <InlineState title="Chua co ket qua" description="Sau khi nop bai, lich su va diem se hien o day." />
                                    ) : computed.recentHistory.map((attempt) => {
                                        const passed = typeof attempt.score === 'number' && attempt.score >= 5;
                                        return (
                                            <div key={attempt.id} className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] bg-surface-glass">
                                                <div className={cn(
                                                    'w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 border',
                                                    passed ? 'bg-success/10 border-success/20 text-success' : 'bg-bg-tertiary border-border text-text-primary',
                                                )}>
                                                    <span className="text-lg font-bold">{attempt.score ?? '—'}</span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-text-primary truncate">{attempt.examTitle}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-text-muted">{attempt.correctAnswers ?? 'An'} / {attempt.totalQuestions} dung</span>
                                                        <span className="text-xs text-text-muted">•</span>
                                                        <span className="text-xs text-text-muted">{attempt.timeSpentSeconds ? formatTime(attempt.timeSpentSeconds) : '—'}</span>
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
