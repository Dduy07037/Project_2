'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Button,
    InlineState,
    Input,
    Modal,
    PageHeader,
    SearchInput,
    Select,
    StatusBadge,
    Switch,
} from '@/components/ui';
import { DataTable } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import {
    createExam,
    getExams,
    getSubjects,
    toStatusKey,
    type CreateExamRequest,
    type ExamDto,
    type SubjectDto,
} from '@/lib/api/exam-guard';
import { formatDuration } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { AlertCircle, ArrowRight, FileText, Plus, RefreshCw } from 'lucide-react';

const emptyExamForm: CreateExamRequest = {
    title: '',
    description: '',
    subjectId: '',
    questionCount: 10,
    durationMinutes: 30,
    totalPoints: 10,
    shuffleQuestions: true,
    shuffleOptions: true,
    showResultToStudent: true,
};

export default function LecturerExamsPage() {
    const { request } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [exams, setExams] = useState<ExamDto[]>([]);
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [createForm, setCreateForm] = useState<CreateExamRequest>(emptyExamForm);

    const loadExams = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [examsResponse, subjectsResponse] = await Promise.all([
                getExams(request),
                getSubjects(request),
            ]);

            setExams(examsResponse);
            setSubjects(subjectsResponse);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Khong the tai danh sach ky thi.');
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        void loadExams();
    }, [loadExams]);

    const filteredExams = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return exams;
        }

        return exams.filter((exam) =>
            exam.title.toLowerCase().includes(query)
            || exam.subjectName.toLowerCase().includes(query)
            || exam.status.toLowerCase().includes(query),
        );
    }, [exams, search]);

    const handleCreateExam = useCallback(async () => {
        if (!createForm.subjectId || !createForm.title.trim()) {
            toast({ type: 'warning', title: 'Thieu thong tin', message: 'Can chon mon hoc va nhap ten ky thi.' });
            return;
        }

        setSubmitting(true);

        try {
            const created = await createExam(request, {
                ...createForm,
                title: createForm.title.trim(),
                description: createForm.description?.trim() || undefined,
                questionCount: Number(createForm.questionCount),
                durationMinutes: Number(createForm.durationMinutes),
                totalPoints: Number(createForm.totalPoints),
            });

            toast({
                type: 'success',
                title: 'Da tao ky thi moi',
                message: 'Ban co the them session o trang chi tiet ky thi.',
            });
            setShowCreateModal(false);
            setCreateForm(emptyExamForm);
            await loadExams();
            router.push(`/lecturer/exams/${created.id}`);
        } catch (createError) {
            toast({
                type: 'error',
                title: 'Tao ky thi that bai',
                message: createError instanceof Error ? createError.message : 'Da xay ra loi khong xac dinh.',
            });
        } finally {
            setSubmitting(false);
        }
    }, [createForm, loadExams, request, router, toast]);

    const columns = [
        {
            key: 'title',
            title: 'Ky thi',
            render: (exam: ExamDto) => (
                <div>
                    <p className="text-sm font-medium text-text-primary">{exam.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{exam.subjectName}</p>
                </div>
            ),
        },
        {
            key: 'config',
            title: 'Cau hinh',
            render: (exam: ExamDto) => (
                <div className="text-xs text-text-secondary space-y-0.5">
                    <div>{exam.questionCount} cau hoi</div>
                    <div>{formatDuration(exam.durationMinutes)}</div>
                    <div>{exam.sessions.length} session</div>
                </div>
            ),
        },
        {
            key: 'status',
            title: 'Trang thai',
            render: (exam: ExamDto) => <StatusBadge status={toStatusKey(exam.status)} />,
        },
        {
            key: 'actions',
            title: 'Tac vu',
            render: (exam: ExamDto) => (
                <Link href={`/lecturer/exams/${exam.id}`}>
                    <Button variant="ghost" size="sm" iconRight={<ArrowRight className="h-3 w-3" />}>
                        Chi tiet
                    </Button>
                </Link>
            ),
        },
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Quan ly ky thi"
                    description={`${exams.length} ky thi dang duoc doc tu ExamsController`}
                    actions={(
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
                            Tao ky thi moi
                        </Button>
                    )}
                />
            </motion.div>

            <motion.div variants={staggerItem} className="max-w-sm">
                <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tim ten ky thi..." />
            </motion.div>

            <motion.div variants={staggerItem}>
                {error ? (
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Khong the tai ky thi"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadExams()}>
                                Thu lai
                            </Button>
                        )}
                    />
                ) : (
                    <DataTable columns={columns} data={filteredExams} loading={loading} emptyMessage="Chua co ky thi nao phu hop." />
                )}
            </motion.div>

            <Modal
                open={showCreateModal}
                onClose={() => {
                    if (!submitting) {
                        setShowCreateModal(false);
                    }
                }}
                title="Tao ky thi moi"
                description="Ban nhap thong tin draft exam. Session se duoc them o trang chi tiet."
                size="lg"
            >
                <div className="space-y-4">
                    <Select
                        label="Mon hoc"
                        value={createForm.subjectId}
                        onChange={(value) => setCreateForm((current) => ({ ...current, subjectId: value }))}
                        options={subjects.map((subject) => ({ value: subject.id, label: `${subject.code} - ${subject.name}` }))}
                    />
                    <Input
                        label="Ten ky thi"
                        value={createForm.title}
                        onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Midterm - Co so du lieu"
                    />
                    <Input
                        label="Mo ta"
                        value={createForm.description ?? ''}
                        onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                        placeholder="Mo ta ngan cho ky thi"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="So cau hoi"
                            type="number"
                            value={String(createForm.questionCount)}
                            onChange={(event) => setCreateForm((current) => ({ ...current, questionCount: Number(event.target.value) || 0 }))}
                        />
                        <Input
                            label="Thoi gian (phut)"
                            type="number"
                            value={String(createForm.durationMinutes)}
                            onChange={(event) => setCreateForm((current) => ({ ...current, durationMinutes: Number(event.target.value) || 0 }))}
                        />
                        <Input
                            label="Tong diem"
                            type="number"
                            value={String(createForm.totalPoints)}
                            onChange={(event) => setCreateForm((current) => ({ ...current, totalPoints: Number(event.target.value) || 0 }))}
                        />
                    </div>
                    <div className="space-y-3">
                        <Switch
                            label="Tron cau hoi"
                            checked={createForm.shuffleQuestions}
                            onChange={(value) => setCreateForm((current) => ({ ...current, shuffleQuestions: value }))}
                        />
                        <Switch
                            label="Tron dap an"
                            checked={createForm.shuffleOptions}
                            onChange={(value) => setCreateForm((current) => ({ ...current, shuffleOptions: value }))}
                        />
                        <Switch
                            label="Cho sinh vien xem ket qua"
                            checked={createForm.showResultToStudent}
                            onChange={(value) => setCreateForm((current) => ({ ...current, showResultToStudent: value }))}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                            Huy
                        </Button>
                        <Button onClick={() => void handleCreateExam()} loading={submitting} icon={<FileText className="h-4 w-4" />}>
                            Tao draft exam
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
