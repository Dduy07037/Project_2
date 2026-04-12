'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    InlineState,
    PageHeader,
    StatusBadge,
} from '@/components/ui';
import { useAuth } from '@/components/providers/auth-provider';
import { getAttemptHistory, toStatusKey, type AttemptSummaryDto } from '@/lib/api/exam-guard';
import { formatDateTime, formatTime } from '@/lib/utils';
import { cn } from '@/lib/cn';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { AlertCircle, CheckCircle2, Clock, History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentHistoryPage() {
    const { request } = useAuth();

    const [history, setHistory] = useState<AttemptSummaryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadHistory = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getAttemptHistory(request);
            setHistory(response);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Khong the tai lich su thi.');
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        void loadHistory();
    }, [loadHistory]);

    const sortedHistory = useMemo(() => [...history].sort((left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()), [history]);

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader title="Lich su thi" description="Tat ca attempt cua ban tu /api/attempts/history." />
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-3">
                {error ? (
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Khong the tai lich su"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadHistory()}>
                                Thu lai
                            </Button>
                        )}
                    />
                ) : loading && history.length === 0 ? (
                    <InlineState title="Dang tai lich su" description="ExamGuard dang doc cac attempt da ghi nhan cho tai khoan hien tai." />
                ) : sortedHistory.length === 0 ? (
                    <InlineState icon={<History className="h-10 w-10" />} title="Chua co lich su thi" description="Ban chua tham gia ky thi nao." />
                ) : sortedHistory.map((attempt) => {
                    const scoreValue = typeof attempt.score === 'number' ? attempt.score : null;
                    const showScore = scoreValue !== null;
                    const passed = showScore && scoreValue >= 5;

                    return (
                        <Card key={attempt.id}>
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    'w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center shrink-0',
                                    passed ? 'bg-success/10' : 'bg-bg-tertiary'
                                )}>
                                    <span className={cn('text-lg font-bold', passed ? 'text-success' : 'text-text-primary')}>
                                        {showScore ? scoreValue : '—'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-sm font-semibold text-text-primary">{attempt.examTitle}</h3>
                                        <StatusBadge status={toStatusKey(attempt.status)} />
                                    </div>
                                    <p className="text-xs text-text-muted mt-0.5">{attempt.subjectName} · {attempt.sessionName}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-secondary">
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {attempt.timeSpentSeconds ? formatTime(attempt.timeSpentSeconds) : '—'}</span>
                                        <span>{attempt.answeredQuestions}/{attempt.totalQuestions} cau</span>
                                        <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {attempt.correctAnswers ?? 'An ket qua'}</span>
                                        <span>{formatDateTime(attempt.startedAt)}</span>
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
