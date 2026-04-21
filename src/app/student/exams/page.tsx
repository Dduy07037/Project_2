'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Button,
    Card,
    InlineState,
    PageHeader,
    StatusBadge,
} from '@/components/ui';
import { useAuth } from '@/components/providers/auth-provider';
import { getAvailableSessions, toStatusKey, type AvailableSessionDto } from '@/lib/api/exam-guard';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { formatDateTime, formatDuration } from '@/lib/utils';
import { AlertCircle, ArrowRight, Calendar, Clock, Eye, EyeOff, GraduationCap, Lock, RefreshCw, Shuffle } from 'lucide-react';

export default function StudentExamsPage() {
    const { request } = useAuth();

    const [sessions, setSessions] = useState<AvailableSessionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSessions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getAvailableSessions(request);
            setSessions(response);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Khong the tai ca thi kha dung.');
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        void loadSessions();
    }, [loadSessions]);

    const groupedSessions = useMemo(
        () => [...sessions].sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime()),
        [sessions],
    );

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader title="Ca thi kha dung" description="Danh sach session duoc mo cho sinh vien, bao gom ca thi sap dien ra va ca thi dang mo." />
            </motion.div>

            <motion.div variants={staggerItem} className="grid gap-4">
                {error ? (
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Khong the tai ca thi"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadSessions()}>
                                Thu lai
                            </Button>
                        )}
                    />
                ) : loading && sessions.length === 0 ? (
                    <InlineState title="Dang tai ca thi" description="ExamGuard dang doc sessions duoc mo cho sinh vien." />
                ) : groupedSessions.length === 0 ? (
                    <InlineState title="Khong co ca thi kha dung" description="Hien tai khong co session nao dang mo hoac sap dien ra." />
                ) : groupedSessions.map((session) => {
                    const statusKey = toStatusKey(session.status);
                    const canStart = statusKey === 'active' && (!session.attemptStatus || toStatusKey(session.attemptStatus) === 'in_progress');
                    const hasCompletedAttempt = session.attemptStatus ? toStatusKey(session.attemptStatus) !== 'in_progress' : false;

                    return (
                        <Card key={session.sessionId} hover>
                            <div className="flex items-start gap-5">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-border-subtle bg-bg-tertiary text-text-secondary">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <h3 className="text-base font-semibold text-text-primary">{session.examTitle}</h3>
                                        <StatusBadge status={statusKey} />
                                        {session.hasExistingAttempt && session.attemptStatus && (
                                            <StatusBadge status={toStatusKey(session.attemptStatus)} />
                                        )}
                                    </div>
                                    <p className="mb-3 text-sm text-text-muted">{session.examDescription || session.subjectName}</p>
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-secondary">
                                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDuration(session.durationMinutes)}</span>
                                        <span className="flex items-center gap-1"><Shuffle className="h-3.5 w-3.5" /> {session.shuffleQuestions ? 'Tron cau hoi' : 'Thu tu co dinh'}</span>
                                        <span className="flex items-center gap-1">
                                            {session.showResultToStudent ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                            {session.showResultToStudent ? 'Co xem ket qua' : 'An ket qua'}
                                        </span>
                                        {session.requiresPassword && (
                                            <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Co mat khau</span>
                                        )}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-border-subtle bg-bg-tertiary p-3">
                                        <div>
                                            <p className="text-xs font-medium text-text-secondary">{session.sessionName}</p>
                                            <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                                                <Calendar className="h-3 w-3" />
                                                {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}
                                            </p>
                                        </div>
                                        {canStart ? (
                                            <Link href={`/student/exams/${session.sessionId}/take`}>
                                                <Button size="sm" iconRight={<ArrowRight className="h-3 w-3" />}>
                                                    {session.hasExistingAttempt ? 'Tiep tuc lam bai' : 'Vao thi'}
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button size="sm" variant="secondary" disabled>
                                                {hasCompletedAttempt ? 'Da hoan thanh' : 'Chua den gio'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
