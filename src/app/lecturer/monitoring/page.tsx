'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader, StatCard, Panel, Card, Button, StatusBadge, Badge, Avatar } from '@/components/ui';
import { SearchInput } from '@/components/ui/input';
import { DataTable } from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { mockAttempts, mockExams } from '@/lib/mock-data';
import { formatDateTime, formatTime } from '@/lib/utils';
import { cn } from '@/lib/cn';
import { AlertTriangle, Eye, Shield, Monitor, Clock, ArrowRight, Flag, Search } from 'lucide-react';
import Link from 'next/link';

export default function MonitoringPage() {
    const [activeTab, setActiveTab] = useState('flagged');
    const [search, setSearch] = useState('');
    const allAttempts = mockAttempts;
    const flaggedAttempts = allAttempts.filter(a => a.flags.length > 0);

    const tabs = [
        { id: 'flagged', label: 'Cần xem xét', count: flaggedAttempts.length },
        { id: 'all', label: 'Tất cả attempt', count: allAttempts.length },
    ];

    const displayAttempts = activeTab === 'flagged' ? flaggedAttempts : allAttempts;
    const filtered = displayAttempts.filter(a =>
        a.studentName.toLowerCase().includes(search.toLowerCase()) ||
        a.studentCode.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Giám sát & Hậu kiểm"
                    description="Xem lại hành vi thi của sinh viên — hỗ trợ hậu kiểm, không kết luận gian lận"
                />
            </motion.div>

            <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tổng lượt thi" value={allAttempts.length} icon={<Monitor className="h-5 w-5" />} />
                <StatCard label="Cần xem xét" value={flaggedAttempts.length} icon={<Flag className="h-5 w-5" />} accentColor="var(--color-warning)" />
                <StatCard label="Rời tab" value={allAttempts.reduce((s, a) => s + a.behaviorLogs.filter(l => l.event === 'tab_leave').length, 0)} icon={<AlertTriangle className="h-5 w-5" />} accentColor="var(--color-danger)" />
                <StatCard label="Tự động nộp" value={allAttempts.filter(a => a.status === 'auto_submitted').length} icon={<Clock className="h-5 w-5" />} accentColor="var(--color-info)" />
            </motion.div>

            <motion.div variants={staggerItem}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </motion.div>

            <motion.div variants={staggerItem} className="max-w-sm">
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm sinh viên..." />
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-3">
                {filtered.map((attempt) => {
                    const exam = mockExams.find(e => e.id === attempt.examId);
                    const tabLeaves = attempt.behaviorLogs.filter(l => l.event === 'tab_leave').length;
                    const reloads = attempt.behaviorLogs.filter(l => l.event === 'page_reload').length;

                    return (
                        <Card key={attempt.id} className={cn(
                            'border-l-2',
                            attempt.flags.some(f => f.severity === 'high') ? 'border-l-danger' :
                                attempt.flags.length > 0 ? 'border-l-warning' : 'border-l-border'
                        )}>
                            <div className="flex items-start gap-4">
                                <Avatar name={attempt.studentName} size="md" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-text-primary">{attempt.studentName}</span>
                                        <span className="text-xs text-text-muted font-mono">{attempt.studentCode}</span>
                                        <StatusBadge status={attempt.status} />
                                    </div>
                                    <p className="text-xs text-text-muted mt-0.5">{exam?.title || 'Kỳ thi'}</p>

                                    {/* Summary Stats */}
                                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3 text-text-muted" />
                                            <span className="text-text-secondary">Thời gian:</span>
                                            <span className="font-mono font-medium text-text-primary">{formatTime(attempt.timeSpent)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Monitor className="h-3 w-3 text-text-muted" />
                                            <span className="text-text-secondary">Rời tab:</span>
                                            <span className={cn('font-medium', tabLeaves > 2 ? 'text-danger' : tabLeaves > 0 ? 'text-warning' : 'text-text-primary')}>{tabLeaves}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-text-secondary">Reload:</span>
                                            <span className={cn('font-medium', reloads > 0 ? 'text-warning' : 'text-text-primary')}>{reloads}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-text-secondary">Điểm:</span>
                                            <span className={cn('font-semibold', (attempt.score || 0) >= 5 ? 'text-success' : 'text-danger')}>{attempt.score ?? '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-text-secondary">Nộp:</span>
                                            <span className="text-text-primary">{attempt.submitType === 'auto' ? 'Tự động' : 'Thủ công'}</span>
                                        </div>
                                    </div>

                                    {/* Flags */}
                                    {attempt.flags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {attempt.flags.map(flag => (
                                                <Badge key={flag.id} variant={flag.severity === 'high' ? 'danger' : flag.severity === 'medium' ? 'warning' : 'info'} size="sm">
                                                    {flag.description}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Event Log Timeline */}
                                    {attempt.behaviorLogs.length > 0 && (
                                        <div className="mt-3 pl-3 border-l border-border space-y-1.5">
                                            {attempt.behaviorLogs.slice(0, 6).map(log => {
                                                const eventColors: Record<string, string> = {
                                                    tab_leave: 'text-warning', tab_return: 'text-success', page_reload: 'text-danger',
                                                    copy_attempt: 'text-danger', right_click: 'text-warning', idle_detected: 'text-info',
                                                };
                                                return (
                                                    <div key={log.id} className="flex items-center gap-2 text-[11px]">
                                                        <span className="font-mono text-text-muted w-12 shrink-0">
                                                            {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className={cn('font-medium capitalize', eventColors[log.event] || 'text-text-secondary')}>
                                                            {log.event.replace(/_/g, ' ')}
                                                        </span>
                                                        {log.details && <span className="text-text-muted">— {log.details}</span>}
                                                    </div>
                                                );
                                            })}
                                            {attempt.behaviorLogs.length > 6 && (
                                                <span className="text-[11px] text-text-muted">+{attempt.behaviorLogs.length - 6} sự kiện khác</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-text-muted text-sm">
                        <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        Không có attempt nào phù hợp
                    </div>
                )}
            </motion.div>

            {/* Disclaimer */}
            <motion.div variants={staggerItem} className="bg-info/5 border border-info/20 rounded-[var(--radius-md)] p-4">
                <div className="flex items-start gap-3">
                    <Shield className="h-4 w-4 text-info mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-medium text-info">Lưu ý về hậu kiểm</p>
                        <p className="text-xs text-text-muted mt-0.5">Dữ liệu hành vi chỉ mang tính tham khảo, hỗ trợ giảng viên đánh giá. Hệ thống không tự động kết luận gian lận.</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
