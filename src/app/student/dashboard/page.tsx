'use client';

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { PageHeader, StatCard, Panel, Card, Badge, StatusBadge, Button } from '@/components/ui';
import { mockExams, mockAttempts } from '@/lib/mock-data';
import { formatDate, formatTime } from '@/lib/utils';
import { cn } from '@/lib/cn';
import {
    GraduationCap, Clock, Trophy, CheckCircle2, FileText,
    ChevronRight, CalendarDays, Flame, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
    const upcomingExams = mockExams.filter(e => e.status === 'scheduled');
    const completedAttempts = mockAttempts.filter(a => a.status === 'submitted' || a.status === 'auto_submitted').slice(0, 3);
    const avgScore = completedAttempts.length
        ? (completedAttempts.reduce((s, a) => s + (a.score || 0), 0) / completedAttempts.length).toFixed(1)
        : '—';

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-8">
            {/* Hero Greeting */}
            <motion.div variants={staggerItem} className="relative overflow-hidden rounded-[var(--radius-2xl)] p-8 glass-card border-gradient-strong">
                {/* Ambient orbs */}
                <div className="absolute -top-20 -right-20 w-64 h-64 ambient-orb ambient-orb-purple opacity-30" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 ambient-orb ambient-orb-cyan opacity-20" style={{ animationDelay: '2s' }} />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tighter text-text-primary">
                        Xin chào, <span className="text-gradient">Nguyễn Văn A</span> 👋
                    </h1>
                    <p className="text-text-muted mt-2 text-sm max-w-lg">
                        Bạn có <span className="text-accent-cyan font-semibold">{upcomingExams.length}</span> kỳ thi sắp tới.
                        Hãy sẵn sàng và kiểm tra thiết bị trước khi bắt đầu.
                    </p>
                    <Link href="/student/exams">
                        <Button className="mt-5" iconRight={<ChevronRight className="h-4 w-4" />} glow>
                            Xem ca thi
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    label="Ca thi sắp tới"
                    value={upcomingExams.length}
                    icon={<CalendarDays className="h-5 w-5" />}
                    accentColor="#8b5cf6"
                />
                <StatCard
                    label="Đã thi"
                    value={completedAttempts.length}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    accentColor="#22d3ee"
                />
                <StatCard
                    label="Điểm TB"
                    value={avgScore}
                    icon={<TrendingUp className="h-5 w-5" />}
                    accentColor="#34d399"
                />
                <StatCard
                    label="Streak"
                    value="5 ngày"
                    icon={<Flame className="h-5 w-5" />}
                    accentColor="#fbbf24"
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Upcoming Exams */}
                <motion.div variants={staggerItem} className="lg:col-span-3">
                    <Panel title="Kỳ thi sắp tới" description="Các ca thi cần tham gia">
                        <div className="space-y-3">
                            {upcomingExams.map((exam) => (
                                <Link href={`/student/exams/${exam.id}/take`} key={exam.id}>
                                    <Card hover className="group !p-4">
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-gradient-to-br from-accent/20 to-accent-cyan/10 border border-accent/15 flex items-center justify-center shrink-0 group-hover:glow-accent transition-shadow duration-300">
                                                <GraduationCap className="h-5 w-5 text-accent-light" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-light transition-colors">{exam.title}</h4>
                                                    <StatusBadge status={exam.status} />
                                                </div>
                                                <p className="text-xs text-text-muted mt-0.5">{exam.subjectName}</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-muted">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-accent-cyan" /> {exam.duration} phút</span>
                                                    <span className="flex items-center gap-1"><FileText className="h-3 w-3 text-accent-light" /> {exam.questionCount} câu</span>
                                                    <span>{exam.sessions?.[0]?.startTime ? formatDate(exam.sessions[0].startTime) : ''}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-accent-light group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                            {upcomingExams.length === 0 && (
                                <div className="text-center py-12 text-text-muted text-sm">
                                    <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    Không có kỳ thi sắp tới
                                </div>
                            )}
                        </div>
                    </Panel>
                </motion.div>

                {/* Recent Results */}
                <motion.div variants={staggerItem} className="lg:col-span-2">
                    <Panel title="Kết quả gần đây" description="Các bài thi đã hoàn thành">
                        <div className="space-y-3">
                            {completedAttempts.map((attempt) => {
                                const exam = mockExams.find(e => e.id === attempt.examId);
                                const passed = (attempt.score || 0) >= 5;
                                return (
                                    <div key={attempt.id} className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] bg-surface-glass hover:bg-surface-hover transition-colors group">
                                        <div className={cn(
                                            'w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 border',
                                            passed
                                                ? 'bg-success/10 border-success/20 text-success glow-success'
                                                : 'bg-danger/10 border-danger/20 text-danger'
                                        )}>
                                            <span className="text-lg font-bold">{attempt.score ?? '—'}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-text-primary truncate">{exam?.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-text-muted">{attempt.correctAnswers ?? 0}/{attempt.totalQuestions} đúng</span>
                                                <span className="text-xs text-text-muted">•</span>
                                                <span className="text-xs text-text-muted">{formatTime(attempt.timeSpent)}</span>
                                            </div>
                                        </div>
                                        <Trophy className={cn('h-4 w-4 shrink-0', passed ? 'text-success' : 'text-text-muted/30')} />
                                    </div>
                                );
                            })}
                            {completedAttempts.length === 0 && (
                                <div className="text-center py-8 text-text-muted text-sm">
                                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    Chưa có kết quả
                                </div>
                            )}
                        </div>
                    </Panel>
                </motion.div>
            </div>
        </motion.div>
    );
}
