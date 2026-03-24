'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader, Button, StatusBadge, Badge, Panel, Card } from '@/components/ui';
import { SearchInput } from '@/components/ui/input';
import { DataTable } from '@/components/ui/table';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { mockExams } from '@/lib/mock-data';
import { formatDateTime, formatDuration } from '@/lib/utils';
import { Plus, ArrowRight, Calendar, Clock, Users, FileText, Eye } from 'lucide-react';
import Link from 'next/link';

export default function LecturerExamsPage() {
    const [search, setSearch] = useState('');
    const myExams = mockExams.filter(e => e.lecturerId === 'u2');

    const filteredExams = myExams.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            key: 'title',
            title: 'Kỳ thi',
            render: (exam: typeof mockExams[0]) => (
                <div>
                    <p className="text-sm font-medium text-text-primary">{exam.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{exam.subjectName}</p>
                </div>
            ),
        },
        {
            key: 'config',
            title: 'Cấu hình',
            render: (exam: typeof mockExams[0]) => (
                <div className="text-xs text-text-secondary space-y-0.5">
                    <div className="flex items-center gap-1"><FileText className="h-3 w-3" /> {exam.questionCount} câu</div>
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(exam.duration)}</div>
                </div>
            ),
        },
        {
            key: 'sessions',
            title: 'Ca thi',
            render: (exam: typeof mockExams[0]) => (
                <span className="text-sm text-text-secondary">{exam.sessions.length} ca</span>
            ),
        },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (exam: typeof mockExams[0]) => <StatusBadge status={exam.status} />,
        },
        {
            key: 'actions',
            title: '',
            className: 'w-20',
            render: (exam: typeof mockExams[0]) => (
                <Link href={`/lecturer/exams/${exam.id}`}>
                    <Button variant="ghost" size="sm" iconRight={<ArrowRight className="h-3 w-3" />}>Chi tiết</Button>
                </Link>
            ),
        },
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Quản lý kỳ thi"
                    description={`${myExams.length} kỳ thi`}
                    actions={
                        <Link href="/lecturer/exams/create">
                            <Button icon={<Plus className="h-4 w-4" />}>Tạo kỳ thi mới</Button>
                        </Link>
                    }
                />
            </motion.div>

            <motion.div variants={staggerItem} className="max-w-sm">
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kỳ thi..." />
            </motion.div>

            <motion.div variants={staggerItem}>
                <DataTable columns={columns} data={filteredExams} emptyMessage="Chưa có kỳ thi nào" />
            </motion.div>
        </motion.div>
    );
}
