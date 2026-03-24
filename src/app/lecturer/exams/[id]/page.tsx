'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader, StatCard, Panel, Button, StatusBadge, Badge, Avatar, Card } from '@/components/ui';
import { DataTable } from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { mockExams, mockAttempts } from '@/lib/mock-data';
import { formatDateTime, formatDuration, formatTime } from '@/lib/utils';
import { ArrowLeft, Users, Clock, FileText, BarChart3, AlertTriangle, Eye, ArrowRight, Flag } from 'lucide-react';
import Link from 'next/link';

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [activeTab, setActiveTab] = useState('overview');
    const exam = mockExams[0]; // Using first exam as mock
    const attempts = mockAttempts.filter(a => a.examId === exam.id);
    const flaggedAttempts = attempts.filter(a => a.flags.length > 0);

    const tabs = [
        { id: 'overview', label: 'Tổng quan' },
        { id: 'participants', label: 'Sinh viên', count: attempts.length },
        { id: 'results', label: 'Kết quả' },
        { id: 'logs', label: 'Log hành vi', count: flaggedAttempts.length },
    ];

    const resultColumns = [
        {
            key: 'student', title: 'Sinh viên',
            render: (a: typeof mockAttempts[0]) => (
                <div className="flex items-center gap-3">
                    <Avatar name={a.studentName} size="sm" />
                    <div>
                        <p className="text-sm font-medium text-text-primary">{a.studentName}</p>
                        <p className="text-xs text-text-muted">{a.studentCode}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'score', title: 'Điểm', render: (a: typeof mockAttempts[0]) => (
                <span className={`text-sm font-semibold ${(a.score || 0) >= 5 ? 'text-success' : 'text-danger'}`}>
                    {a.score ?? '—'}/{exam.totalPoints}
                </span>
            )
        },
        {
            key: 'answered', title: 'Đã làm', render: (a: typeof mockAttempts[0]) => (
                <span className="text-sm text-text-secondary">{a.answeredQuestions}/{a.totalQuestions}</span>
            )
        },
        {
            key: 'time', title: 'Thời gian', render: (a: typeof mockAttempts[0]) => (
                <span className="text-xs text-text-muted font-mono">{formatTime(a.timeSpent)}</span>
            )
        },
        { key: 'status', title: 'Trạng thái', render: (a: typeof mockAttempts[0]) => <StatusBadge status={a.status} /> },
        {
            key: 'flags', title: 'Cảnh báo', render: (a: typeof mockAttempts[0]) => (
                a.flags.length > 0 ? (
                    <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-warning" />
                        <span className="text-xs text-warning font-medium">{a.flags.length}</span>
                    </div>
                ) : <span className="text-xs text-text-muted">—</span>
            )
        },
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <Link href="/lecturer/exams" className="text-sm text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1 mb-3">
                    <ArrowLeft className="h-3 w-3" /> Quay lại danh sách
                </Link>
                <PageHeader
                    title={exam.title}
                    description={exam.subjectName}
                    actions={
                        <div className="flex items-center gap-2">
                            <StatusBadge status={exam.status} />
                            <Button variant="secondary">Sửa kỳ thi</Button>
                        </div>
                    }
                />
            </motion.div>

            {/* Stats */}
            <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <StatCard label="Câu hỏi" value={exam.questionCount} icon={<FileText className="h-4 w-4" />} />
                <StatCard label="Thời gian" value={formatDuration(exam.duration)} icon={<Clock className="h-4 w-4" />} />
                <StatCard label="Lượt thi" value={attempts.length} icon={<Users className="h-4 w-4" />} />
                <StatCard label="Điểm TB" value={attempts.filter(a => a.score).length > 0 ? (attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.filter(a => a.score).length).toFixed(1) : '—'} icon={<BarChart3 className="h-4 w-4" />} />
                <StatCard label="Cảnh báo" value={flaggedAttempts.length} icon={<AlertTriangle className="h-4 w-4" />} accentColor={flaggedAttempts.length > 0 ? 'var(--color-warning)' : undefined} />
            </motion.div>

            <motion.div variants={staggerItem}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </motion.div>

            {/* Tab Content */}
            <motion.div variants={staggerItem}>
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Panel title="Thông tin kỳ thi">
                            <div className="space-y-3">
                                {[
                                    { label: 'Mô tả', value: exam.description },
                                    { label: 'Số câu', value: `${exam.questionCount} câu` },
                                    { label: 'Thời gian', value: formatDuration(exam.duration) },
                                    { label: 'Trộn câu hỏi', value: exam.shuffleQuestions ? 'Có' : 'Không' },
                                    { label: 'Trộn đáp án', value: exam.shuffleOptions ? 'Có' : 'Không' },
                                    { label: 'Hiển thị kết quả', value: exam.showResult ? 'Có' : 'Không' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start justify-between py-1.5 border-b border-border last:border-b-0">
                                        <span className="text-sm text-text-muted">{item.label}</span>
                                        <span className="text-sm text-text-primary text-right max-w-[60%]">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                        <Panel title="Ca thi">
                            {exam.sessions.map(session => (
                                <div key={session.id} className="flex items-center justify-between p-3 border border-border rounded-[var(--radius-md)] mb-2 last:mb-0">
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{session.name}</p>
                                        <p className="text-xs text-text-muted">{formatDateTime(session.startTime)} — {formatDateTime(session.endTime)}</p>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status={session.status} />
                                        <p className="text-xs text-text-muted mt-1">{session.currentParticipants}/{session.maxParticipants} SV</p>
                                    </div>
                                </div>
                            ))}
                        </Panel>
                    </div>
                )}

                {(activeTab === 'participants' || activeTab === 'results') && (
                    <DataTable columns={resultColumns} data={attempts} emptyMessage="Chưa có sinh viên tham gia" />
                )}

                {activeTab === 'logs' && (
                    <div className="space-y-3">
                        {flaggedAttempts.length > 0 ? flaggedAttempts.map(attempt => (
                            <Card key={attempt.id} className="border-l-2 border-l-warning">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <Avatar name={attempt.studentName} size="sm" />
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">{attempt.studentName}</p>
                                            <p className="text-xs text-text-muted">{attempt.studentCode} · Thời gian: {formatTime(attempt.timeSpent)}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {attempt.flags.map(flag => (
                                                    <Badge key={flag.id} variant={flag.severity === 'high' ? 'danger' : flag.severity === 'medium' ? 'warning' : 'info'} size="sm">
                                                        {flag.description}
                                                    </Badge>
                                                ))}
                                            </div>
                                            {attempt.behaviorLogs.length > 0 && (
                                                <div className="mt-3 space-y-1">
                                                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Event Log</p>
                                                    {attempt.behaviorLogs.slice(0, 5).map(log => (
                                                        <div key={log.id} className="flex items-center gap-2 text-xs">
                                                            <span className="font-mono text-text-muted w-16 shrink-0">{new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                            <StatusBadge status={log.event.includes('leave') ? 'warning' : log.event.includes('return') ? 'success' : log.event.includes('copy') || log.event.includes('reload') ? 'danger' : 'info'} />
                                                            <span className="text-text-secondary">{log.details || log.event.replace(/_/g, ' ')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <StatusBadge status={attempt.status} />
                                </div>
                            </Card>
                        )) : (
                            <div className="text-center py-12 text-text-muted text-sm">Không có attempt bất thường</div>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
