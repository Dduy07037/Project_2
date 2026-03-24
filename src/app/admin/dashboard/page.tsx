'use client';

import { motion } from 'framer-motion';
import { PageHeader, StatCard, Panel, Card } from '@/components/ui';
import { DataTable } from '@/components/ui/table';
import { Badge, StatusBadge, Avatar } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { mockUsers, mockExams, mockActivityLogs, mockSubjects } from '@/lib/mock-data';
import { formatDateTime } from '@/lib/utils';
import {
    Users, GraduationCap, FileText, Activity, Shield, AlertTriangle,
    TrendingUp, Plus, ArrowRight, BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const totalUsers = mockUsers.length;
    const totalLecturers = mockUsers.filter((u) => u.role === 'lecturer').length;
    const totalStudents = mockUsers.filter((u) => u.role === 'student').length;
    const activeExams = mockExams.filter((e) => e.status === 'active').length;

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Dashboard"
                    description="Tổng quan hệ thống thi trắc nghiệm ExamGuard"
                />
            </motion.div>

            {/* Stats */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Tổng người dùng"
                    value={totalUsers}
                    change={12}
                    changeLabel="tháng này"
                    icon={<Users className="h-5 w-5" />}
                    accentColor="var(--color-accent)"
                />
                <StatCard
                    label="Giảng viên"
                    value={totalLecturers}
                    icon={<GraduationCap className="h-5 w-5" />}
                    accentColor="var(--color-accent-cyan)"
                />
                <StatCard
                    label="Kỳ thi đang chạy"
                    value={activeExams}
                    change={activeExams > 0 ? 100 : 0}
                    icon={<FileText className="h-5 w-5" />}
                    accentColor="var(--color-success)"
                />
                <StatCard
                    label="Cảnh báo"
                    value={3}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    accentColor="var(--color-warning)"
                />
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <motion.div variants={staggerItem} className="lg:col-span-2">
                    <Panel
                        title="Hoạt động gần đây"
                        description="Các thao tác mới nhất trên hệ thống"
                        action={
                            <Link href="/admin/activity">
                                <Button variant="ghost" size="sm" iconRight={<ArrowRight className="h-3 w-3" />}>
                                    Xem tất cả
                                </Button>
                            </Link>
                        }
                    >
                        <div className="space-y-3">
                            {mockActivityLogs.slice(0, 6).map((log) => (
                                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-b-0 last:pb-0">
                                    <Avatar name={log.userName} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-text-primary">
                                            <span className="font-medium">{log.userName}</span>
                                            <span className="text-text-muted"> — {log.action}</span>
                                        </p>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            {log.target}
                                            {log.details && <span className="text-text-muted"> · {log.details}</span>}
                                        </p>
                                    </div>
                                    <span className="text-[11px] text-text-muted whitespace-nowrap shrink-0">
                                        {formatDateTime(log.timestamp)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </motion.div>

                {/* Quick Actions & Stats */}
                <motion.div variants={staggerItem} className="space-y-4">
                    <Panel title="Hành động nhanh">
                        <div className="space-y-2">
                            <Link href="/admin/users/create" className="block">
                                <Button variant="secondary" className="w-full justify-start" icon={<Plus className="h-4 w-4" />}>
                                    Tạo tài khoản mới
                                </Button>
                            </Link>
                            <Link href="/admin/subjects" className="block">
                                <Button variant="secondary" className="w-full justify-start" icon={<BookOpen className="h-4 w-4" />}>
                                    Quản lý môn học
                                </Button>
                            </Link>
                            <Link href="/admin/exams" className="block">
                                <Button variant="secondary" className="w-full justify-start" icon={<FileText className="h-4 w-4" />}>
                                    Tổng quan kỳ thi
                                </Button>
                            </Link>
                        </div>
                    </Panel>

                    <Panel title="Phân bổ vai trò">
                        <div className="space-y-3">
                            {[
                                { label: 'Admin', count: 1, total: totalUsers, color: 'bg-danger' },
                                { label: 'Giảng viên', count: totalLecturers, total: totalUsers, color: 'bg-accent-cyan' },
                                { label: 'Sinh viên', count: totalStudents, total: totalUsers, color: 'bg-accent' },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="text-text-secondary font-medium">{item.label}</span>
                                        <span className="text-text-muted">{item.count}/{item.total}</span>
                                    </div>
                                    <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.color} transition-all duration-500`}
                                            style={{ width: `${(item.count / item.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title="Môn học">
                        <div className="space-y-2">
                            {mockSubjects.slice(0, 3).map((subject) => (
                                <div key={subject.id} className="flex items-center justify-between py-1.5">
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{subject.code}</p>
                                        <p className="text-xs text-text-muted">{subject.name}</p>
                                    </div>
                                    <StatusBadge status={subject.status} />
                                </div>
                            ))}
                        </div>
                    </Panel>
                </motion.div>
            </div>
        </motion.div>
    );
}
