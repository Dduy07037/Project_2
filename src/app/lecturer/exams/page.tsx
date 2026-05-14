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
import { AlertCircle, ArrowRight, BookOpen, FileText, Plus, RefreshCw } from 'lucide-react';

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
    const [loadingExams, setLoadingExams] = useState(true);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [examsError, setExamsError] = useState<string | null>(null);
    const [subjectsError, setSubjectsError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [createForm, setCreateForm] = useState<CreateExamRequest>(emptyExamForm);

    const loadExams = useCallback(async () => {
        setLoadingExams(true);
        setExamsError(null);

        try {
            setExams(await getExams(request));
        } catch (loadError) {
            setExamsError(loadError instanceof Error ? loadError.message : 'Không thể tải danh sách kỳ thi.');
        } finally {
            setLoadingExams(false);
        }
    }, [request]);

    const loadSubjects = useCallback(async () => {
        setLoadingSubjects(true);
        setSubjectsError(null);

        try {
            setSubjects(await getSubjects(request));
        } catch (loadError) {
            setSubjectsError(loadError instanceof Error ? loadError.message : 'Không thể tải danh sách môn học.');
        } finally {
            setLoadingSubjects(false);
        }
    }, [request]);

    const loadPage = useCallback(async () => {
        await Promise.all([loadExams(), loadSubjects()]);
    }, [loadExams, loadSubjects]);

    useEffect(() => {
        void loadPage();
    }, [loadPage]);

    useEffect(() => {
        if (showCreateModal) {
            void loadSubjects();
        }
    }, [showCreateModal, loadSubjects]);

    const selectableSubjects = useMemo(
        () => subjects.filter((subject) => subject.isActive),
        [subjects],
    );

    const createFormLocked =
        !!subjectsError || loadingSubjects || selectableSubjects.length === 0;

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
            await loadPage();
            router.push(`/lecturer/exams/${created.id}`);
        } catch (createError) {
            toast({
                type: 'error',
                title: 'Tạo kỳ thi thất bại',
                message: createError instanceof Error ? createError.message : 'Da xay ra loi khong xac dinh.',
            });
        } finally {
            setSubmitting(false);
        }
    }, [createForm, loadPage, request, router, toast]);

    const columns = [
        {
            key: 'title',
            title: 'Kỳ thi',
            render: (exam: ExamDto) => (
                <div>
                    <p className="text-sm font-medium text-text-primary">{exam.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{exam.subjectName}</p>
                </div>
            ),
        },
        {
            key: 'config',
            title: 'Cấu hình',
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
                    title="Quản lý kỳ thi"
                    description={`${exams.length} ky thi dang duoc doc tu ExamsController`}
                    actions={(
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
                            Tạo kỳ thi mới
                        </Button>
                    )}
                />
            </motion.div>

            <motion.div variants={staggerItem} className="max-w-sm">
                <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tim ten ky thi..." />
            </motion.div>

            <motion.div variants={staggerItem}>
                {examsError ? (
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Không thể tải kỳ thi"
                        description={examsError}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadExams()}>
                                Thử lại
                            </Button>
                        )}
                    />
                ) : (
                    <DataTable columns={columns} data={filteredExams} getRowId={(item) => item.id} loading={loadingExams} emptyMessage="Chưa có kỳ thi nào phù hợp." />
                )}
            </motion.div>

            <Modal
                open={showCreateModal}
                onClose={() => {
                    if (!submitting) {
                        setShowCreateModal(false);
                    }
                }}
                title="Tạo kỳ thi mới"
                description="Ban nhap thong tin draft exam. Session se duoc them o trang chi tiet."
                size="lg"
            >
                <div className="space-y-4">
                    {subjectsError ? (
                        <InlineState
                            icon={<AlertCircle className="h-8 w-8" />}
                            title="Không tải được môn học"
                            description={subjectsError}
                            actions={(
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={<RefreshCw className="h-4 w-4" />}
                                    onClick={() => void loadSubjects()}
                                >
                                    Thử lại
                                </Button>
                            )}
                        />
                    ) : loadingSubjects ? (
                        <p className="text-sm text-text-muted">Đang tải danh sách môn học...</p>
                    ) : selectableSubjects.length === 0 ? (
                        <InlineState
                            icon={<BookOpen className="h-8 w-8" />}
                            title="Chưa có môn học để chọn"
                            description="Hệ thống chưa có môn học đang hoạt động. Vui lòng nhờ quản trị viên tạo môn học tại trang Quản lý môn học trước khi tạo kỳ thi."
                        />
                    ) : (
                        <Select
                            label="Môn học"
                            placeholder="-- Chọn môn học --"
                            value={createForm.subjectId}
                            onChange={(value) => setCreateForm((current) => ({ ...current, subjectId: value }))}
                            options={selectableSubjects.map((subject) => ({
                                value: subject.id,
                                label: `${subject.code} — ${subject.name}`,
                            }))}
                            disabled={submitting}
                        />
                    )}
                    <Input
                        label="Tên kỳ thi"
                        value={createForm.title}
                        onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Midterm - Cơ sở dữ liệu"
                        disabled={createFormLocked || submitting}
                    />
                    <Input
                        label="Mô tả"
                        value={createForm.description ?? ''}
                        onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                        placeholder="Mô tả ngắn cho kỳ thi"
                        disabled={createFormLocked || submitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Số câu hỏi"
                            type="number"
                            value={String(createForm.questionCount)}
                            onChange={(event) => setCreateForm((current) => ({ ...current, questionCount: Number(event.target.value) || 0 }))}
                            disabled={createFormLocked || submitting}
                        />
                        <Input
                            label="Thời gian (phút)"
                            type="number"
                            value={String(createForm.durationMinutes)}
                            onChange={(event) => setCreateForm((current) => ({ ...current, durationMinutes: Number(event.target.value) || 0 }))}
                            disabled={createFormLocked || submitting}
                        />
                        <Input
                            label="Tổng điểm"
                            type="number"
                            value={String(createForm.totalPoints)}
                            onChange={(event) => setCreateForm((current) => ({ ...current, totalPoints: Number(event.target.value) || 0 }))}
                            disabled={createFormLocked || submitting}
                        />
                    </div>
                    <div className="space-y-3">
                        <Switch
                            label="Trộn câu hỏi"
                            checked={createForm.shuffleQuestions}
                            onChange={(value) => setCreateForm((current) => ({ ...current, shuffleQuestions: value }))}
                            disabled={createFormLocked || submitting}
                        />
                        <Switch
                            label="Trộn đáp án"
                            checked={createForm.shuffleOptions}
                            onChange={(value) => setCreateForm((current) => ({ ...current, shuffleOptions: value }))}
                            disabled={createFormLocked || submitting}
                        />
                        <Switch
                            label="Cho sinh viên xem kết quả"
                            checked={createForm.showResultToStudent}
                            onChange={(value) => setCreateForm((current) => ({ ...current, showResultToStudent: value }))}
                            disabled={createFormLocked || submitting}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button
                            onClick={() => void handleCreateExam()}
                            loading={submitting}
                            disabled={createFormLocked || submitting}
                            icon={<FileText className="h-4 w-4" />}
                        >
                            Tạo draft exam
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
