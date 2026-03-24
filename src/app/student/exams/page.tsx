'use client';

import { motion } from 'framer-motion';
import { PageHeader, Button, StatusBadge, Card, Panel } from '@/components/ui';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { mockExams } from '@/lib/mock-data';
import { formatDateTime, formatDuration } from '@/lib/utils';
import { ArrowRight, Clock, FileText, GraduationCap, Calendar, Shuffle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function StudentExamsPage() {
    const availableExams = mockExams.filter(e => e.status === 'active' || e.status === 'scheduled');

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader title="Ca thi khả dụng" description="Danh sách các kỳ thi bạn có thể tham gia" />
            </motion.div>

            <motion.div variants={staggerItem} className="grid gap-4">
                {availableExams.map((exam) => {
                    const activeSession = exam.sessions.find(s => s.status === 'active' || s.status === 'scheduled');
                    return (
                        <Card key={exam.id} hover>
                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-accent/10 flex items-center justify-center shrink-0">
                                    <GraduationCap className="h-6 w-6 text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-base font-semibold text-text-primary">{exam.title}</h3>
                                        <StatusBadge status={exam.status} />
                                    </div>
                                    <p className="text-sm text-text-muted mb-3">{exam.description}</p>
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-secondary">
                                        <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {exam.questionCount} câu hỏi</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDuration(exam.duration)}</span>
                                        <span className="flex items-center gap-1"><Shuffle className="h-3.5 w-3.5" /> {exam.shuffleQuestions ? 'Trộn câu hỏi' : 'Thứ tự cố định'}</span>
                                        <span className="flex items-center gap-1">
                                            {exam.showResult ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                            {exam.showResult ? 'Xem kết quả sau thi' : 'Không xem kết quả'}
                                        </span>
                                    </div>
                                    {activeSession && (
                                        <div className="mt-3 p-3 bg-bg-tertiary rounded-[var(--radius-md)] flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-text-secondary">{activeSession.name}</p>
                                                <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDateTime(activeSession.startTime)} — {formatDateTime(activeSession.endTime)}
                                                </p>
                                            </div>
                                            <Link href={`/student/exams/${exam.id}`}>
                                                <Button size="sm" iconRight={<ArrowRight className="h-3 w-3" />}>
                                                    {exam.status === 'active' ? 'Vào thi' : 'Xem chi tiết'}
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
                {availableExams.length === 0 && (
                    <div className="text-center py-16 text-text-muted text-sm">
                        <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-base font-medium text-text-secondary mb-1">Không có ca thi khả dụng</p>
                        <p>Hiện tại không có kỳ thi nào đang mở hoặc sắp diễn ra</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
