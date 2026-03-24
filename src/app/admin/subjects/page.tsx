'use client';

import { motion } from 'framer-motion';
import { PageHeader, Panel, Button, StatusBadge, Badge, Card } from '@/components/ui';
import { DataTable } from '@/components/ui/table';
import { SearchInput } from '@/components/ui/input';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { mockSubjects } from '@/lib/mock-data';
import { useState } from 'react';
import { Plus, Edit, MoreHorizontal, BookOpen, FileText, ClipboardList } from 'lucide-react';

export default function AdminSubjectsPage() {
    const [search, setSearch] = useState('');
    const filtered = mockSubjects.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { key: 'code', title: 'Mã', render: (s: typeof mockSubjects[0]) => <span className="text-sm font-mono font-medium text-accent">{s.code}</span> },
        { key: 'name', title: 'Tên môn học', render: (s: typeof mockSubjects[0]) => <span className="text-sm font-medium text-text-primary">{s.name}</span> },
        { key: 'department', title: 'Khoa', render: (s: typeof mockSubjects[0]) => <span className="text-sm text-text-secondary">{s.department}</span> },
        { key: 'lecturer', title: 'Giảng viên', render: (s: typeof mockSubjects[0]) => <span className="text-sm text-text-secondary">{s.lecturerName}</span> },
        {
            key: 'questions', title: 'Câu hỏi', render: (s: typeof mockSubjects[0]) => (
                <span className="flex items-center gap-1 text-sm text-text-secondary"><ClipboardList className="h-3 w-3" /> {s.questionCount}</span>
            )
        },
        {
            key: 'exams', title: 'Kỳ thi', render: (s: typeof mockSubjects[0]) => (
                <span className="flex items-center gap-1 text-sm text-text-secondary"><FileText className="h-3 w-3" /> {s.examCount}</span>
            )
        },
        { key: 'status', title: 'Trạng thái', render: (s: typeof mockSubjects[0]) => <StatusBadge status={s.status} /> },
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader title="Quản lý môn học" description={`${mockSubjects.length} môn học`}
                    actions={<Button icon={<Plus className="h-4 w-4" />}>Thêm môn học</Button>} />
            </motion.div>
            <motion.div variants={staggerItem} className="max-w-sm">
                <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm môn học..." />
            </motion.div>
            <motion.div variants={staggerItem}>
                <DataTable columns={columns} data={filtered} emptyMessage="Không có môn học" />
            </motion.div>
        </motion.div>
    );
}
