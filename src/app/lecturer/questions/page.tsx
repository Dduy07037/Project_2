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
import { AlertCircle, ClipboardList, Plus, RefreshCw } from 'lucide-react';

interface CreateQuestionForm {
    subjectId: string;
    categoryId: string;
    content: string;
    difficulty: string;
    options: string[];
    correctIndex: number;
}

const emptyQuestionForm: CreateQuestionForm = {
    subjectId: '',
    categoryId: '',
    content: '',
    difficulty: 'Medium',
    options: ['', '', '', ''],
    correctIndex: 0,
};

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
    const [submitting, setSubmitting] = useState(false);
    const [createForm, setCreateForm] = useState<CreateQuestionForm>(emptyQuestionForm);

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
            setError(loadError instanceof Error ? loadError.message : 'Khong the tai ngan hang cau hoi.');
        } finally {
            setLoading(false);
        }
    }, [difficulty, request, search, subjectFilter]);

    useEffect(() => {
        void loadQuestions();
    }, [loadQuestions]);

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

    const handleCreateQuestion = useCallback(async () => {
        if (!createForm.subjectId || !createForm.content.trim() || createForm.options.some((option) => !option.trim())) {
            toast({ type: 'warning', title: 'Thieu thong tin', message: 'Can nhap du mon hoc, noi dung va 4 lua chon.' });
            return;
        }

        setSubmitting(true);

        try {
            await createQuestion(request, {
                subjectId: createForm.subjectId,
                categoryId: createForm.categoryId || undefined,
                content: createForm.content.trim(),
                difficulty: createForm.difficulty,
                options: createForm.options.map((option, index) => ({
                    label: ['A', 'B', 'C', 'D'][index] ?? `O${index + 1}`,
                    content: option.trim(),
                    isCorrect: index === createForm.correctIndex,
                })),
            });

            toast({ type: 'success', title: 'Da tao cau hoi moi' });
            setShowCreateModal(false);
            setCreateForm(emptyQuestionForm);
            await loadQuestions();
        } catch (createError) {
            toast({
                type: 'error',
                title: 'Tao cau hoi that bai',
                message: createError instanceof Error ? createError.message : 'Da xay ra loi khong xac dinh.',
            });
        } finally {
            setSubmitting(false);
        }
    }, [createForm, loadQuestions, request, toast]);

    const subjectOptions = useMemo(() => ([
        { value: 'all', label: 'Tat ca mon hoc' },
        ...subjects.map((subject) => ({ value: subject.id, label: `${subject.code} - ${subject.name}` })),
    ]), [subjects]);

    const columns = [
        {
            key: 'content',
            title: 'Noi dung cau hoi',
            render: (question: QuestionDto) => (
                <div className="max-w-2xl">
                    <p className="text-sm text-text-primary line-clamp-2">{question.content}</p>
                    <div className="flex items-center gap-2 mt-1">
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
            title: 'Do kho',
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
                    title="Ngan hang cau hoi"
                    description={`${questions.length} cau hoi dang hien thi tu QuestionsController`}
                    actions={(
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
                            Them cau hoi
                        </Button>
                    )}
                />
            </motion.div>

            <motion.div variants={staggerItem} className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[220px] max-w-sm">
                    <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tim theo noi dung..." />
                </div>
                <Select
                    value={difficulty}
                    onChange={setDifficulty}
                    options={[
                        { value: 'all', label: 'Tat ca do kho' },
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
                        title="Khong the tai cau hoi"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadQuestions()}>
                                Thu lai
                            </Button>
                        )}
                    />
                ) : (
                    <DataTable columns={columns} data={questions} loading={loading} emptyMessage="Chua co cau hoi nao phu hop bo loc hien tai." />
                )}
            </motion.div>

            <Modal
                open={showCreateModal}
                onClose={() => {
                    if (!submitting) {
                        setShowCreateModal(false);
                    }
                }}
                title="Them cau hoi moi"
                description="Form nay goi truc tiep POST /api/questions."
                size="lg"
            >
                <div className="space-y-4">
                    <Select
                        label="Mon hoc"
                        value={createForm.subjectId}
                        onChange={(value) => setCreateForm((current) => ({ ...current, subjectId: value, categoryId: '' }))}
                        options={subjects.map((subject) => ({ value: subject.id, label: `${subject.code} - ${subject.name}` }))}
                    />
                    <Select
                        label="Chu de"
                        value={createForm.categoryId}
                        onChange={(value) => setCreateForm((current) => ({ ...current, categoryId: value }))}
                        options={[{ value: '', label: 'Khong gan category' }, ...categories.map((category) => ({ value: category.id, label: category.name }))]}
                    />
                    <Input
                        label="Noi dung"
                        value={createForm.content}
                        onChange={(event) => setCreateForm((current) => ({ ...current, content: event.target.value }))}
                        placeholder="Nhap noi dung cau hoi"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Do kho"
                            value={createForm.difficulty}
                            onChange={(value) => setCreateForm((current) => ({ ...current, difficulty: value }))}
                            options={[
                                { value: 'Easy', label: 'Easy' },
                                { value: 'Medium', label: 'Medium' },
                                { value: 'Hard', label: 'Hard' },
                            ]}
                        />
                        <Select
                            label="Dap an dung"
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
                                placeholder={`Noi dung dap an ${['A', 'B', 'C', 'D'][index] ?? index + 1}`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                            Huy
                        </Button>
                        <Button onClick={() => void handleCreateQuestion()} loading={submitting} icon={<ClipboardList className="h-4 w-4" />}>
                            Luu cau hoi
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
