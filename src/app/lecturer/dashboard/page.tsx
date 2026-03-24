'use client';

import { motion } from 'framer-motion';
import { PageHeader, StatCard, Panel, Card, Button, StatusBadge, Avatar } from '@/components/ui';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { mockExams, mockQuestions, mockAttempts, mockSubjects } from '@/lib/mock-data';
import { formatDateTime, formatDuration } from '@/lib/utils';
import {
    ClipboardList, FileText, Users, AlertTriangle, Plus, ArrowRight,
    Eye, Clock, TrendingUp, BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function LecturerDashboard() {
    const myQuestions = mockQuestions.length;
    const myExams = mockExams.filter(e => e.lecturerId === 'u2');
    const activeExams = myExams.filter(e => e.status === 'active');
    const flaggedAttempts = mockAttempts.filter(a => a.status === 'flagged' || a.flags.length > 0);

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Dashboard"
                    description="Xin chào, Trần Thị Minh Anh — Tổng quan quản lý thi"
                    actions={
                        <div className="flex gap-2">
                            <Link href="/lecturer/questions/create">
                                <Button variant="secondary" icon={<Plus className="h-4 w-4" />}>Thêm câu hỏi</Button>
                            </Link>
                            <Link href="/lecturer/exams/create">
                                <Button icon={<Plus className="h-4 w-4" />}>Tạo kỳ thi</Button>
                            </Link>
                        </div>
                    }
                />
            </motion.div>

            {/* Stats */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Câu hỏi" value={myQuestions} change={15} changeLabel="tháng này" icon={<ClipboardList className="h-5 w-5" />} accentColor="var(--color-accent)" />
                <StatCard label="Kỳ thi" value={myExams.length} icon={<FileText className="h-5 w-5" />} accentColor="var(--color-accent-cyan)" />
                <StatCard label="Đang diễn ra" value={activeExams.length} icon={<Clock className="h-5 w-5" />} accentColor="var(--color-success)" />
                <StatCard label="Cần xem xét" value={flaggedAttempts.length} icon={<AlertTriangle className="h-5 w-5" />} accentColor="var(--color-warning)" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Exams Overview */}
                <motion.div variants={staggerItem} className="lg:col-span-2">
                    <Panel
                        title="Kỳ thi của tôi"
                        action={<Link href="/lecturer/exams"><Button variant="ghost" size="sm" iconRight={<ArrowRight className="h-3 w-3" />}>Xem tất cả</Button></Link>}
                    >
                        <div className="space-y-3">
                            {myExams.map((exam) => (
                                <Link key={exam.id} href={`/lecturer/exams/${exam.id}`} className="block">
                                    <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-border hover:border-border-hover hover:bg-surface-hover transition-all duration-150 group">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{exam.title}</p>
                                                <StatusBadge status={exam.status} />
                                            </div>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs text-text-muted">{exam.subjectName}</span>
                                                <span className="text-xs text-text-muted">{exam.questionCount} câu · {formatDuration(exam.duration)}</span>
                                                <span className="text-xs text-text-muted">{exam.sessions.length} ca thi</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Panel>
                </motion.div>

                {/* Right Column */}
                <motion.div variants={staggerItem} className="space-y-4">
                    {/* Flagged Attempts */}
                    <Panel title="Attempt cần xem xét" action={<Link href="/lecturer/monitoring"><Button variant="ghost" size="sm">Giám sát</Button></Link>}>
                        {flaggedAttempts.length > 0 ? (
                            <div className="space-y-3">
                                {flaggedAttempts.slice(0, 4).map((attempt) => (
                                    <div key={attempt.id} className="flex items-start gap-3 py-2 border-b border-border last:border-b-0">
                                        <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <AlertTriangle className="h-3 w-3 text-warning" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-text-primary">{attempt.studentName}</p>
                                            <p className="text-xs text-text-muted">{attempt.studentCode}</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {attempt.flags.map((flag) => (
                                                    <StatusBadge key={flag.id} status={flag.severity} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted py-4 text-center">Không có attempt bất thường</p>
                        )}
                    </Panel>

                    {/* Quick Stats */}
                    <Panel title="Thống kê nhanh">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary">Tổng lượt thi</span>
                                <span className="text-sm font-semibold text-text-primary">{mockAttempts.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary">Điểm TB</span>
                                <span className="text-sm font-semibold text-text-primary">
                                    {(mockAttempts.filter(a => a.score).reduce((acc, a) => acc + (a.score || 0), 0) / mockAttempts.filter(a => a.score).length).toFixed(1)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary">Tỷ lệ nộp bài</span>
                                <span className="text-sm font-semibold text-success">
                                    {Math.round((mockAttempts.filter(a => a.status === 'submitted').length / mockAttempts.length) * 100)}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary">Tự động nộp</span>
                                <span className="text-sm font-semibold text-warning">
                                    {mockAttempts.filter(a => a.status === 'auto_submitted').length}
                                </span>
                            </div>
                        </div>
                    </Panel>
                </motion.div>
            </div>
        </motion.div>
    );
}
