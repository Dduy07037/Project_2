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
import { formatDuration } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
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
}

export default function LecturerDashboard() {
    const { request, user } = useAuth();

    const [data, setData] = useState<LecturerDashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = useCallback(async () => {
        setError(null);

        try {
            const [questionsResponse, examsResponse, attemptsResponse] = await Promise.all([
                getQuestions(request, { page: 1, pageSize: 100, isActive: true }),
                getExams(request),
                getMonitoringAttempts(request, { limit: 100 }),
            ]);

            setData({
                questions: questionsResponse.items,
                exams: examsResponse,
                attempts: attemptsResponse,
            });
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Khong the tai dashboard giang vien.');
        } finally {
        }
    }, [request]);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    const stats = useMemo(() => {
        if (!data) {
            return {
                questionCount: 0,
                examCount: 0,
                activeSessions: 0,
                flaggedCount: 0,
                averageScore: '—',
            };
        }

        const now = Date.now();
        const activeSessions = data.exams.flatMap((exam) => exam.sessions)
            .filter((session) => new Date(session.startTime).getTime() <= now && new Date(session.endTime).getTime() > now)
            .length;

        const flaggedAttempts = data.attempts.filter((item) => item.attempt.isFlagged || item.attempt.tabSwitchCount > 0 || item.attempt.reloadCount > 0);
        const scoredAttempts = data.attempts.filter((item) => typeof item.attempt.score === 'number');
        const averageScore = scoredAttempts.length === 0
            ? '—'
            : (scoredAttempts.reduce((sum, item) => sum + Number(item.attempt.score ?? 0), 0) / scoredAttempts.length).toFixed(1);

        return {
            questionCount: data.questions.length,
            examCount: data.exams.length,
            activeSessions,
            flaggedCount: flaggedAttempts.length,
            averageScore,
        };
    }, [data]);

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Dashboard"
                    description={`Xin chao ${user?.fullName ?? 'giang vien'} — tong hop tu questions, exams va attempts that.`}
                    actions={(
                        <div className="flex gap-2">
                            <Link href="/lecturer/questions">
                                <Button variant="secondary">Mo ngan hang cau hoi</Button>
                            </Link>
                            <Link href="/lecturer/exams">
                                <Button>Quan ly ky thi</Button>
                            </Link>
                        </div>
                    )}
                />
            </motion.div>

            <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Cau hoi" value={stats.questionCount} icon={<ClipboardList className="h-5 w-5" />} accentColor="var(--color-accent)" />
                <StatCard label="Ky thi" value={stats.examCount} icon={<FileText className="h-5 w-5" />} accentColor="var(--color-accent-cyan)" />
                <StatCard label="Ca dang mo" value={stats.activeSessions} icon={<Clock className="h-5 w-5" />} accentColor="var(--color-success)" />
                <StatCard label="Can xem xet" value={stats.flaggedCount} icon={<AlertTriangle className="h-5 w-5" />} accentColor="var(--color-warning)" />
            </motion.div>

            {error && !data ? (
                <motion.div variants={staggerItem}>
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Khong the tai dashboard"
                        description={error}
                        actions={<Button variant="secondary" onClick={() => void loadDashboard()}>Thu lai</Button>}
                    />
                </motion.div>
            ) : !data ? (
                <motion.div variants={staggerItem}>
                    <InlineState title="Dang tai dashboard" description="ExamGuard dang tong hop du lieu giang vien." />
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div variants={staggerItem} className="lg:col-span-2">
                        <Panel
                            title="Ky thi cua toi"
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
                                    <p className="text-sm text-text-muted">Chua co ky thi nao. Ban co the tao draft exam ngay trong trang danh sach.</p>
                                ) : data.exams.slice(0, 6).map((exam) => (
                                    <Link key={exam.id} href={`/lecturer/exams/${exam.id}`} className="block">
                                        <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-border hover:border-border-hover hover:bg-surface-hover transition-all duration-150">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-text-primary">{exam.title}</p>
                                                    <StatusBadge status={exam.status.toLowerCase()} />
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
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
                        <Panel title="Attempt can xem xet">
                            <div className="space-y-3">
                                {data.attempts.filter((item) => item.attempt.isFlagged || item.attempt.tabSwitchCount > 0 || item.attempt.reloadCount > 0).slice(0, 4).map((item) => (
                                    <div key={item.attempt.id} className="flex items-start gap-3 py-2 border-b border-border last:border-b-0">
                                        <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="h-4 w-4 text-warning" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-text-primary">{item.attempt.studentName}</p>
                                            <p className="text-xs text-text-muted">{item.attempt.examTitle}</p>
                                            <p className="text-xs text-warning mt-1">{item.attempt.flagReason || `${item.attempt.tabSwitchCount} tab / ${item.attempt.reloadCount} reload`}</p>
                                        </div>
                                    </div>
                                ))}
                                {stats.flaggedCount === 0 && (
                                    <p className="text-sm text-text-muted">Chua co attempt bat thuong nao.</p>
                                )}
                            </div>
                        </Panel>

                        <Panel title="Thong ke nhanh">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">Tong attempts</span>
                                    <span className="text-sm font-semibold text-text-primary">{data.attempts.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">Diem trung binh</span>
                                    <span className="text-sm font-semibold text-text-primary">{stats.averageScore}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">Da nop bai</span>
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

                        <Panel title="Monitoring">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-accent/10 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-accent-light" />
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
