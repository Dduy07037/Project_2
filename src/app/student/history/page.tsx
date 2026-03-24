'use client';

import { motion } from 'framer-motion';
import { PageHeader, Panel, Card, StatusBadge, Badge } from '@/components/ui';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { mockAttempts, mockExams } from '@/lib/mock-data';
import { formatDateTime, formatTime } from '@/lib/utils';
import { cn } from '@/lib/cn';
import { History, CheckCircle2, Clock, FileText, AlertTriangle } from 'lucide-react';

export default function StudentHistoryPage() {
    const myAttempts = mockAttempts.filter(a => a.studentId === 'u4' || a.studentId === 'u5');

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader title="Lịch sử thi" description="Tất cả các lần thi của bạn" />
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-3">
                {myAttempts.map((attempt) => {
                    const exam = mockExams.find(e => e.id === attempt.examId);
                    return (
                        <Card key={attempt.id}>
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    'w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center shrink-0',
                                    (attempt.score || 0) >= 5 ? 'bg-success/10' : 'bg-danger/10'
                                )}>
                                    <span className={cn(
                                        'text-lg font-bold',
                                        (attempt.score || 0) >= 5 ? 'text-success' : 'text-danger'
                                    )}>
                                        {attempt.score ?? '—'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold text-text-primary">{exam?.title || 'Kỳ thi'}</h3>
                                        <StatusBadge status={attempt.status} />
                                    </div>
                                    <p className="text-xs text-text-muted mt-0.5">{exam?.subjectName}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-secondary">
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTime(attempt.timeSpent)}</span>
                                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {attempt.answeredQuestions}/{attempt.totalQuestions} câu</span>
                                        <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {attempt.correctAnswers ?? '—'} đúng</span>
                                        <span>{formatDateTime(attempt.startedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
                {myAttempts.length === 0 && (
                    <div className="text-center py-16 text-text-muted">
                        <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>Chưa có lịch sử thi</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
