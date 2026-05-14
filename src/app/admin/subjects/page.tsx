'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
} from '@/components/ui';
import { DataTable } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import {
    createCategory,
    createSubject,
    getSubjects,
    getUsers,
    type CreateSubjectRequest,
    type SubjectDto,
    type UserDto,
} from '@/lib/api/exam-guard';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { AlertCircle, BookOpen, ClipboardList, FileText, FolderPlus, Plus, RefreshCw } from 'lucide-react';

interface CreateCategoryForm {
    subjectId: string;
    name: string;
}

const emptySubjectForm: CreateSubjectRequest = {
    code: '',
    name: '',
    department: '',
    createdById: '',
};

const emptyCategoryForm: CreateCategoryForm = {
    subjectId: '',
    name: '',
};

export default function AdminSubjectsPage() {
    const { request } = useAuth();
    const { toast } = useToast();

    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [lecturers, setLecturers] = useState<UserDto[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [createForm, setCreateForm] = useState<CreateSubjectRequest>(emptySubjectForm);
    const [createCategoryForm, setCreateCategoryForm] = useState<CreateCategoryForm>(emptyCategoryForm);

    const loadPageData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [subjectsResponse, lecturersResponse] = await Promise.all([
                getSubjects(request),
                getUsers(request, { role: 'lecturer', page: 1, pageSize: 100 }),
            ]);

            setSubjects(subjectsResponse);
            setLecturers(lecturersResponse.items);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu môn học.');
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        void loadPageData();
    }, [loadPageData]);

    const filteredSubjects = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return subjects;
        }

        return subjects.filter((subject) =>
            subject.code.toLowerCase().includes(query)
            || subject.name.toLowerCase().includes(query)
            || (subject.department ?? '').toLowerCase().includes(query)
            || subject.createdByName.toLowerCase().includes(query),
        );
    }, [search, subjects]);

    const lecturerOptions = useMemo(
        () => [
            { value: '', label: 'Gan cho tai khoan admin hien tai' },
            ...lecturers.map((lecturer) => ({ value: lecturer.id, label: lecturer.fullName })),
        ],
        [lecturers],
    );

    const subjectOptions = useMemo(
        () => subjects.map((subject) => ({ value: subject.id, label: `${subject.code} - ${subject.name}` })),
        [subjects],
    );

    const openCreateCategoryModal = useCallback((subjectId?: string) => {
        setCreateCategoryForm({
            subjectId: subjectId ?? (subjects.length === 1 ? subjects[0].id : ''),
            name: '',
        });
        setShowCreateCategoryModal(true);
    }, [subjects]);

    const handleCreateSubject = useCallback(async () => {
        if (!createForm.code?.trim() || !createForm.name?.trim()) {
            toast({ type: 'warning', title: 'Thieu thong tin', message: 'Can it nhat ma mon va ten mon hoc.' });
            return;
        }

        setSubmitting(true);

        try {
            await createSubject(request, {
                code: createForm.code.trim().toUpperCase(),
                name: createForm.name.trim(),
                department: createForm.department?.trim() || undefined,
                createdById: createForm.createdById || undefined,
            });

            toast({ type: 'success', title: 'Da tao mon hoc moi' });
            setShowCreateModal(false);
            setCreateForm(emptySubjectForm);
            await loadPageData();
        } catch (createError) {
            toast({
                type: 'error',
                title: 'Tạo môn học thất bại',
                message: createError instanceof Error ? createError.message : 'Da xay ra loi khong xac dinh.',
            });
        } finally {
            setSubmitting(false);
        }
    }, [createForm, loadPageData, request, toast]);

    const handleCreateCategory = useCallback(async () => {
        if (!createCategoryForm.subjectId || !createCategoryForm.name.trim()) {
            toast({ type: 'warning', title: 'Thieu thong tin', message: 'Can chon mon hoc va nhap ten category.' });
            return;
        }

        setCreatingCategory(true);

        try {
            await createCategory(request, createCategoryForm.subjectId, {
                name: createCategoryForm.name.trim(),
            });

            toast({ type: 'success', title: 'Đã tạo category mới' });
            setShowCreateCategoryModal(false);
            setCreateCategoryForm(emptyCategoryForm);
        } catch (createError) {
            toast({
                type: 'error',
                title: 'Tạo category thất bại',
                message: createError instanceof Error ? createError.message : 'Da xay ra loi khong xac dinh.',
            });
        } finally {
            setCreatingCategory(false);
        }
    }, [createCategoryForm, request, toast]);

    const columns = [
        {
            key: 'code',
            title: 'Ma mon',
            render: (subject: SubjectDto) => (
                <span className="inline-flex rounded-full border border-border-subtle bg-bg-tertiary px-2 py-1 text-[11px] font-semibold tracking-[0.08em] text-text-secondary">
                    {subject.code}
                </span>
            ),
        },
        {
            key: 'name',
            title: 'Môn học',
            render: (subject: SubjectDto) => (
                <div>
                    <p className="text-sm font-medium text-text-primary">{subject.name}</p>
                    <p className="text-xs text-text-muted">{subject.department || 'Chưa gắn khoa/bộ môn'}</p>
                </div>
            ),
        },
        {
            key: 'createdByName',
            title: 'Phu trach',
            render: (subject: SubjectDto) => <span className="text-sm text-text-secondary">{subject.createdByName}</span>,
        },
        {
            key: 'questionCount',
            title: 'Ngân hàng',
            render: (subject: SubjectDto) => (
                <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                    <ClipboardList className="h-3.5 w-3.5" />
                    {subject.questionCount}
                </span>
            ),
        },
        {
            key: 'examCount',
            title: 'Kỳ thi',
            render: (subject: SubjectDto) => (
                <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                    <FileText className="h-3.5 w-3.5" />
                    {subject.examCount}
                </span>
            ),
        },
        {
            key: 'isActive',
            title: 'Trang thai',
            render: (subject: SubjectDto) => <StatusBadge status={subject.isActive ? 'active' : 'disabled'} />,
        },
        {
            key: 'actions',
            title: 'Tac vu',
            render: (subject: SubjectDto) => (
                <Button variant="ghost" size="sm" icon={<FolderPlus className="h-4 w-4" />} onClick={() => openCreateCategoryModal(subject.id)}>
                    Tạo category
                </Button>
            ),
        },
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Quản lý môn học"
                    description={`${subjects.length} mon hoc tu SubjectsController. Admin tao subject, gan lecturer va mo category ngay tai day.`}
                    actions={(
                        <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" icon={<FolderPlus className="h-4 w-4" />} onClick={() => openCreateCategoryModal()} disabled={subjects.length === 0}>
                                Thêm category
                            </Button>
                            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
                                Thêm môn học
                            </Button>
                        </div>
                    )}
                />
            </motion.div>

            <motion.div variants={staggerItem} className="max-w-sm">
                <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã môn, tên môn, giảng viên..." />
            </motion.div>

            <motion.div variants={staggerItem}>
                {error ? (
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Không thể tải môn học"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadPageData()}>
                                Thử lại
                            </Button>
                        )}
                    />
                ) : !loading && subjects.length === 0 ? (
                    <InlineState
                        icon={<BookOpen className="h-10 w-10" />}
                        title="Chưa có môn học nào"
                        description="Tạo subject mới và gán CreatedById cho lecturer để mở tiếp luồng category, question và exam."
                    />
                ) : (
                    <DataTable columns={columns} data={filteredSubjects} getRowId={(item) => item.id} loading={loading} emptyMessage="Không có môn học nào phù hợp bộ lọc hiện tại." />
                )}
            </motion.div>

            <Modal
                open={showCreateCategoryModal}
                onClose={() => {
                    if (!creatingCategory) {
                        setShowCreateCategoryModal(false);
                    }
                }}
                title="Thêm category mới"
                description="Admin tạo category để mở question bank cho lecturer trong đúng subject."
                size="md"
            >
                {subjects.length === 0 ? (
                    <InlineState
                        icon={<BookOpen className="h-8 w-8" />}
                        title="Chưa có môn học để tạo category"
                        description="Hãy tạo subject trước, sau đó quay lại modal này để gắn category cho đúng môn học."
                    />
                ) : (
                    <div className="space-y-4">
                        <Select
                            label="Môn học"
                            value={createCategoryForm.subjectId}
                            onChange={(value) => setCreateCategoryForm((current) => ({ ...current, subjectId: value }))}
                            options={subjectOptions}
                            disabled={creatingCategory}
                        />
                        <Input
                            label="Tên category"
                            value={createCategoryForm.name}
                            onChange={(event) => setCreateCategoryForm((current) => ({ ...current, name: event.target.value }))}
                            placeholder="VD: SQL can ban"
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
                title="Thêm môn học mới"
                description="Môn học sẽ được tạo trực tiếp trên backend và có thể gán ngay cho lecturer phụ trách."
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Ma mon"
                        value={createForm.code}
                        onChange={(event) => setCreateForm((current) => ({ ...current, code: event.target.value }))}
                        placeholder="CS101"
                    />
                    <Input
                        label="Tên môn học"
                        value={createForm.name}
                        onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Nhập môn Lập trình"
                    />
                    <Input
                        label="Don vi"
                        value={createForm.department ?? ''}
                        onChange={(event) => setCreateForm((current) => ({ ...current, department: event.target.value }))}
                        placeholder="Khoa CNTT"
                    />
                    <Select
                        label="Giảng viên phụ trách"
                        value={createForm.createdById ?? ''}
                        onChange={(value) => setCreateForm((current) => ({ ...current, createdById: value }))}
                        options={lecturerOptions}
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button onClick={() => void handleCreateSubject()} loading={submitting} icon={<BookOpen className="h-4 w-4" />}>
                            Tạo môn học
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
