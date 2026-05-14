'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Badge,
    Button,
    InlineState,
    Input,
    Modal,
    PageHeader,
    SearchInput,
    Select,
    StatusBadge,
} from '@/components/ui';
import { DataTable } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import {
    createCategory,
    createQuestion,
    getCategories,
    getQuestions,
    getSubjects,
    toStatusKey,
    type CategoryDto,
    type QuestionDto,
    type SubjectDto,
} from '@/lib/api/exam-guard';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { AlertCircle, BookOpen, ClipboardList, FolderPlus, Plus, RefreshCw } from 'lucide-react';

interface CreateQuestionForm {
    subjectId: string;
    categoryId: string;
    content: string;
    difficulty: string;
    options: string[];
    correctIndex: number;
}

interface CreateCategoryForm {
    subjectId: string;
    name: string;
}

const emptyQuestionForm: CreateQuestionForm = {
    subjectId: '',
    categoryId: '',
    content: '',
    difficulty: 'Medium',
    options: ['', '', '', ''],
    correctIndex: 0,
};

const emptyCategoryForm: CreateCategoryForm = {
    subjectId: '',
    name: '',
};

const noSubjectMessage = 'Bạn chưa được gán môn học. Vui lòng liên hệ admin hoặc tạo subject bằng tài khoản admin.';

export default function QuestionsPage() {
    const { request } = useAuth();
    const { toast } = useToast();

    const [questions, setQuestions] = useState<QuestionDto[]>([]);
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [createForm, setCreateForm] = useState<CreateQuestionForm>(emptyQuestionForm);
    const [createCategoryForm, setCreateCategoryForm] = useState<CreateCategoryForm>(emptyCategoryForm);

    const loadQuestions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [questionsResponse, subjectsResponse] = await Promise.all([
                getQuestions(request, {
                    page: 1,
                    pageSize: 100,
                    search: search || undefined,
                    difficulty: difficulty !== 'all' ? difficulty : undefined,
                    subjectId: subjectFilter !== 'all' ? subjectFilter : undefined,
                    isActive: true,
                }),
                getSubjects(request),
            ]);

            setQuestions(questionsResponse.items);
            setSubjects(subjectsResponse);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Không thể tải ngân hàng câu hỏi.');
        } finally {
            setLoading(false);
        }
    }, [difficulty, request, search, subjectFilter]);

    useEffect(() => {
        void loadQuestions();
    }, [loadQuestions]);

    useEffect(() => {
        if (subjectFilter === 'all' || subjects.some((subject) => subject.id === subjectFilter)) {
            return;
        }

        setSubjectFilter('all');
    }, [subjectFilter, subjects]);

    useEffect(() => {
        async function loadCategoriesForSubject() {
            if (!createForm.subjectId) {
                setCategories([]);
                return;
            }

            try {
                const response = await getCategories(request, createForm.subjectId);
                setCategories(response);
            } catch {
                setCategories([]);
            }
        }

        void loadCategoriesForSubject();
    }, [createForm.subjectId, request]);

    const creatableSubjects = useMemo(
        () => subjects.filter((subject) => subject.isActive),
        [subjects],
    );

    const selectedCreateSubject = useMemo(
        () => subjects.find((subject) => subject.id === createForm.subjectId) ?? null,
        [createForm.subjectId, subjects],
    );

    const subjectOptions = useMemo(() => ([
        { value: 'all', label: 'Tất cả môn học' },
        ...subjects.map((subject) => ({ value: subject.id, label: `${subject.code} - ${subject.name}` })),
    ]), [subjects]);

    const creatableSubjectOptions = useMemo(
        () => creatableSubjects.map((subject) => ({ value: subject.id, label: `${subject.code} - ${subject.name}` })),
        [creatableSubjects],
    );

    const openCreateQuestionModal = useCallback(() => {
        const defaultSubjectId = creatableSubjects.length === 1 ? creatableSubjects[0].id : '';
        setCategories([]);
        setCreateForm({ ...emptyQuestionForm, subjectId: defaultSubjectId });
        setShowCreateModal(true);
    }, [creatableSubjects]);

    const openCreateCategoryModal = useCallback(() => {
        const defaultSubjectId = creatableSubjects.length === 1
            ? creatableSubjects[0].id
            : createForm.subjectId;

        setCreateCategoryForm({
            subjectId: defaultSubjectId,
            name: '',
        });
        setShowCreateCategoryModal(true);
    }, [createForm.subjectId, creatableSubjects]);

    const handleCreateCategory = useCallback(async () => {
        if (!createCategoryForm.subjectId || !createCategoryForm.name.trim()) {
            toast({ type: 'warning', title: 'Thieu thong tin', message: 'Can chon mon hoc va nhap ten category.' });
            return;
        }

        setCreatingCategory(true);

        try {
            const created = await createCategory(request, createCategoryForm.subjectId, {
                name: createCategoryForm.name.trim(),
            });

            toast({ type: 'success', title: 'Đã tạo category mới' });
            setShowCreateCategoryModal(false);
            setCreateCategoryForm(emptyCategoryForm);

            if (createForm.subjectId === created.subjectId) {
                setCategories((current) => [...current.filter((category) => category.id !== created.id), created]
                    .sort((left, right) => left.name.localeCompare(right.name)));
                setCreateForm((current) => current.categoryId
                    ? current
                    : { ...current, categoryId: created.id });
            }
        } catch (createError) {
            toast({
                type: 'error',
                title: 'Tạo category thất bại',
                message: createError instanceof Error ? createError.message : 'Da xay ra loi khong xac dinh.',
            });
        } finally {
            setCreatingCategory(false);
        }
    }, [createCategoryForm, createForm.subjectId, request, toast]);

    const handleCreateQuestion = useCallback(async () => {
        if (!createForm.subjectId || !createForm.content.trim() || createForm.options.some((option) => !option.trim())) {
            toast({ type: 'warning', title: 'Thiếu thông tin', message: 'Cần nhập đủ môn học, nội dung và 4 lựa chọn.' });
            return;
        }

        setSubmitting(true);

        try {
            await createQuestion(request, {
                subjectId: createForm.subjectId,
                categoryId: createForm.categoryId || null,
                content: createForm.content.trim(),
                difficulty: createForm.difficulty,
                options: createForm.options.map((option, index) => ({
                    label: ['A', 'B', 'C', 'D'][index] ?? `O${index + 1}`,
                    content: option.trim(),
                    isCorrect: index === createForm.correctIndex,
                })),
            });

            toast({ type: 'success', title: 'Đã tạo câu hỏi mới' });
            setShowCreateModal(false);
            setCreateForm(emptyQuestionForm);
            await loadQuestions();
        } catch (createError) {
            toast({
                type: 'error',
                title: 'Tạo câu hỏi thất bại',
                message: createError instanceof Error ? createError.message : 'Da xay ra loi khong xac dinh.',
            });
        } finally {
            setSubmitting(false);
        }
    }, [createForm, loadQuestions, request, toast]);

    const columns = [
        {
            key: 'content',
            title: 'Nội dung câu hỏi',
            render: (question: QuestionDto) => (
                <div className="max-w-2xl">
                    <p className="text-sm text-text-primary line-clamp-2">{question.content}</p>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-text-muted">{question.subjectName}</span>
                        {question.categoryName && (
                            <>
                                <span className="text-xs text-text-muted">·</span>
                                <span className="text-xs text-text-muted">{question.categoryName}</span>
                            </>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'difficulty',
            title: 'Độ khó',
            render: (question: QuestionDto) => <StatusBadge status={toStatusKey(question.difficulty)} />,
        },
        {
            key: 'options',
            title: 'Lua chon',
            render: (question: QuestionDto) => <span className="text-sm text-text-secondary">{question.options.length} dap an</span>,
        },
        {
            key: 'status',
            title: 'Trang thai',
            render: (question: QuestionDto) => (
                <Badge variant={question.isActive ? 'success' : 'secondary'}>
                    {question.isActive ? 'Active' : 'Hidden'}
                </Badge>
            ),
        },
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Ngân hàng câu hỏi"
                    description={`${questions.length} cau hoi dang hien co va ${subjects.length} mon hoc lecturer duoc quyen quan ly.`}
                    actions={(
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="secondary"
                                icon={<FolderPlus className="h-4 w-4" />}
                                onClick={openCreateCategoryModal}
                                disabled={creatableSubjects.length === 0}
                            >
                                Thêm category
                            </Button>
                            <Button
                                icon={<Plus className="h-4 w-4" />}
                                onClick={openCreateQuestionModal}
                                disabled={creatableSubjects.length === 0}
                            >
                                Thêm câu hỏi
                            </Button>
                        </div>
                    )}
                />
            </motion.div>

            {!loading && !error && subjects.length === 0 ? (
                <motion.div variants={staggerItem}>
                    <InlineState
                        icon={<BookOpen className="h-10 w-10" />}
                        title="Ban chua duoc gan mon hoc"
                        description={noSubjectMessage}
                    />
                </motion.div>
            ) : (
                <>
                    {subjects.length > 0 && (
                        <motion.div variants={staggerItem}>
                            <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary">Môn học bạn có quyền truy cập</p>
                                        <p className="mt-1 text-sm text-text-muted">
                                            Lecturer chỉ nhìn thấy subject của mình. Chọn subject active để tạo category, question và exam.
                                        </p>
                                    </div>
                                    <Badge variant="secondary">{subjects.length} subject</Badge>
                                </div>
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    {subjects.map((subject) => (
                                        <div key={subject.id} className="rounded-[var(--radius-md)] border border-border-subtle bg-bg-secondary p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">{subject.code}</p>
                                                    <p className="mt-1 text-sm font-medium text-text-primary">{subject.name}</p>
                                                    <p className="mt-1 text-xs text-text-muted">{subject.department || 'Chưa gắn khoa/bộ môn'}</p>
                                                </div>
                                                <StatusBadge status={subject.isActive ? 'active' : 'disabled'} />
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
                                                <span>{subject.questionCount} cau hoi</span>
                                                <span>·</span>
                                                <span>{subject.examCount} ky thi</span>
                                                <span>·</span>
                                                <span>{subject.createdByName}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <motion.div variants={staggerItem} className="flex items-center gap-3 flex-wrap">
                        <div className="flex-1 min-w-[220px] max-w-sm">
                            <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo nội dung..." />
                        </div>
                        <Select
                            value={difficulty}
                            onChange={setDifficulty}
                            options={[
                                { value: 'all', label: 'Tất cả độ khó' },
                                { value: 'Easy', label: 'Easy' },
                                { value: 'Medium', label: 'Medium' },
                                { value: 'Hard', label: 'Hard' },
                            ]}
                        />
                        <Select value={subjectFilter} onChange={setSubjectFilter} options={subjectOptions} />
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        {error ? (
                            <InlineState
                                icon={<AlertCircle className="h-10 w-10" />}
                                title="Không thể tải câu hỏi"
                                description={error}
                                actions={(
                                    <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadQuestions()}>
                                        Thử lại
                                    </Button>
                                )}
                            />
                        ) : (
                            <DataTable columns={columns} data={questions} getRowId={(item) => item.id} loading={loading} emptyMessage="Chưa có câu hỏi nào phù hợp bộ lọc hiện tại." />
                        )}
                    </motion.div>
                </>
            )}

            <Modal
                open={showCreateCategoryModal}
                onClose={() => {
                    if (!creatingCategory) {
                        setShowCreateCategoryModal(false);
                    }
                }}
                title="Thêm category mới"
                description="Tạo category mới cho subject đang được chọn để mở rộng question bank."
                size="md"
            >
                {creatableSubjects.length === 0 ? (
                    <InlineState
                        icon={<BookOpen className="h-8 w-8" />}
                        title="Không có môn học để tạo category"
                        description={noSubjectMessage}
                    />
                ) : (
                    <div className="space-y-4">
                        <Select
                            label="Môn học"
                            value={createCategoryForm.subjectId}
                            onChange={(value) => setCreateCategoryForm((current) => ({ ...current, subjectId: value }))}
                            options={creatableSubjectOptions}
                            disabled={creatingCategory}
                        />
                        <Input
                            label="Tên category"
                            value={createCategoryForm.name}
                            onChange={(event) => setCreateCategoryForm((current) => ({ ...current, name: event.target.value }))}
                            placeholder="VD: Lap trinh co ban"
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={() => setShowCreateCategoryModal(false)} disabled={creatingCategory}>
                                Hủy
                            </Button>
                            <Button onClick={() => void handleCreateCategory()} loading={creatingCategory} icon={<FolderPlus className="h-4 w-4" />}>
                                Tạo category
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                open={showCreateModal}
                onClose={() => {
                    if (!submitting) {
                        setShowCreateModal(false);
                    }
                }}
                title="Thêm câu hỏi mới"
                description="Tạo câu hỏi mới trong subject lecturer đang được quyền thao tác."
                size="lg"
            >
                {creatableSubjects.length === 0 ? (
                    <InlineState
                        icon={<BookOpen className="h-8 w-8" />}
                        title="Không có môn học để tạo câu hỏi"
                        description={noSubjectMessage}
                    />
                ) : (
                    <div className="space-y-4">
                        <Select
                            label="Môn học"
                            value={createForm.subjectId}
                            onChange={(value) => setCreateForm((current) => ({ ...current, subjectId: value, categoryId: '' }))}
                            options={creatableSubjectOptions}
                        />
                        <div className="rounded-[var(--radius-md)] border border-border-subtle bg-bg-secondary p-4">
                            <p className="text-sm font-medium text-text-primary">
                                {selectedCreateSubject ? `${selectedCreateSubject.code} - ${selectedCreateSubject.name}` : 'Chọn môn học để tải category'}
                            </p>
                            <p className="mt-1 text-xs text-text-muted">
                                {!createForm.subjectId
                                    ? 'Category se hien ra sau khi ban chon subject.'
                                    : categories.length === 0
                                        ? 'Môn này chưa có category. Bạn vẫn có thể lưu câu hỏi với lựa chọn "Không gắn category" nếu backend cho phép CategoryId nullable.'
                                        : `Da tai ${categories.length} category cho subject nay.`}
                            </p>
                        </div>
                        <Select
                            label="Chu de"
                            value={createForm.categoryId}
                            onChange={(value) => setCreateForm((current) => ({ ...current, categoryId: value }))}
                            options={[{ value: '', label: 'Không gắn category' }, ...categories.map((category) => ({ value: category.id, label: category.name }))]}
                        />
                        <Input
                            label="Nội dung"
                            value={createForm.content}
                            onChange={(event) => setCreateForm((current) => ({ ...current, content: event.target.value }))}
                            placeholder="Nhập nội dung câu hỏi"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Độ khó"
                                value={createForm.difficulty}
                                onChange={(value) => setCreateForm((current) => ({ ...current, difficulty: value }))}
                                options={[
                                    { value: 'Easy', label: 'Easy' },
                                    { value: 'Medium', label: 'Medium' },
                                    { value: 'Hard', label: 'Hard' },
                                ]}
                            />
                            <Select
                                label="Đáp án đúng"
                                value={String(createForm.correctIndex)}
                                onChange={(value) => setCreateForm((current) => ({ ...current, correctIndex: Number(value) }))}
                                options={[
                                    { value: '0', label: 'A' },
                                    { value: '1', label: 'B' },
                                    { value: '2', label: 'C' },
                                    { value: '3', label: 'D' },
                                ]}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {createForm.options.map((option, index) => (
                                <Input
                                    key={index}
                                    label={`Lua chon ${['A', 'B', 'C', 'D'][index] ?? index + 1}`}
                                    value={option}
                                    onChange={(event) => setCreateForm((current) => ({
                                        ...current,
                                        options: current.options.map((item, optionIndex) => optionIndex === index ? event.target.value : item),
                                    }))}
                                    placeholder={`Nội dung đáp án ${['A', 'B', 'C', 'D'][index] ?? index + 1}`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                                Hủy
                            </Button>
                            <Button onClick={() => void handleCreateQuestion()} loading={submitting} icon={<ClipboardList className="h-4 w-4" />}>
                                Lưu câu hỏi
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </motion.div>
    );
}
