'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader, Button, StatusBadge, Badge } from '@/components/ui';
import { SearchInput } from '@/components/ui/input';
import { DataTable } from '@/components/ui/table';
import { Tabs, Select } from '@/components/ui/tabs';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { mockQuestions, mockTopics } from '@/lib/mock-data';
import { Plus, Filter, Eye, Edit, Trash2, Copy } from 'lucide-react';
import Link from 'next/link';

export default function QuestionsPage() {
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('all');
    const [topicFilter, setTopicFilter] = useState('all');

    const filteredQuestions = mockQuestions.filter((q) => {
        const matchSearch = q.content.toLowerCase().includes(search.toLowerCase());
        const matchDiff = difficulty === 'all' || q.difficulty === difficulty;
        const matchTopic = topicFilter === 'all' || q.topicId === topicFilter;
        return matchSearch && matchDiff && matchTopic;
    });

    const columns = [
        {
            key: 'content',
            title: 'Nội dung câu hỏi',
            render: (q: typeof mockQuestions[0]) => (
                <div className="max-w-md">
                    <p className="text-sm text-text-primary line-clamp-2">{q.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-muted">{q.subjectName}</span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs text-text-muted">{q.topicName}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'difficulty',
            title: 'Độ khó',
            render: (q: typeof mockQuestions[0]) => <StatusBadge status={q.difficulty} />,
        },
        {
            key: 'options',
            title: 'Đáp án',
            render: (q: typeof mockQuestions[0]) => (
                <span className="text-sm text-text-secondary">{q.options.length} lựa chọn</span>
            ),
        },
        {
            key: 'usageCount',
            title: 'Đã dùng',
            render: (q: typeof mockQuestions[0]) => (
                <span className="text-sm text-text-muted">{q.usageCount} lần</span>
            ),
        },
        {
            key: 'actions',
            title: '',
            className: 'w-24',
            render: (q: typeof mockQuestions[0]) => (
                <div className="flex items-center gap-1">
                    <Link href={`/lecturer/questions/${q.id}`}>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    </Link>
                    <Link href={`/lecturer/questions/${q.id}/edit`}>
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Ngân hàng câu hỏi"
                    description={`${mockQuestions.length} câu hỏi`}
                    actions={
                        <Link href="/lecturer/questions/create">
                            <Button icon={<Plus className="h-4 w-4" />}>Thêm câu hỏi</Button>
                        </Link>
                    }
                />
            </motion.div>

            <motion.div variants={staggerItem} className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px] max-w-sm">
                    <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm câu hỏi..." />
                </div>
                <Select
                    options={[{ value: 'all', label: 'Tất cả độ khó' }, { value: 'easy', label: 'Dễ' }, { value: 'medium', label: 'Trung bình' }, { value: 'hard', label: 'Khó' }]}
                    value={difficulty}
                    onChange={setDifficulty}
                />
                <Select
                    options={[{ value: 'all', label: 'Tất cả chủ đề' }, ...mockTopics.map(t => ({ value: t.id, label: t.name }))]}
                    value={topicFilter}
                    onChange={setTopicFilter}
                />
            </motion.div>

            <motion.div variants={staggerItem}>
                <DataTable columns={columns} data={filteredQuestions} emptyMessage="Không có câu hỏi nào" />
            </motion.div>
        </motion.div>
    );
}
