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
    createSubject,
    getSubjects,
    getUsers,
    type CreateSubjectRequest,
    type SubjectDto,
    type UserDto,
} from '@/lib/api/exam-guard';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { AlertCircle, BookOpen, ClipboardList, FileText, Plus, RefreshCw } from 'lucide-react';

const emptySubjectForm: CreateSubjectRequest = {
    code: '',
    name: '',
    department: '',
    createdById: '',
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
    const [submitting, setSubmitting] = useState(false);
    const [createForm, setCreateForm] = useState<CreateSubjectRequest>(emptySubjectForm);

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
            setError(loadError instanceof Error ? loadError.message : 'Khong the tai du lieu mon hoc.');
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
                title: 'Tao mon hoc that bai',
                message: createError instanceof Error ? createError.message : 'Da xay ra loi khong xac dinh.',
            });
        } finally {
            setSubmitting(false);
        }
    }, [createForm, loadPageData, request, toast]);

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
            title: 'Mon hoc',
            render: (subject: SubjectDto) => (
                <div>
                    <p className="text-sm font-medium text-text-primary">{subject.name}</p>
                    <p className="text-xs text-text-muted">{subject.department || 'Chua gan khoa/bo mon'}</p>
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
            title: 'Ngan hang',
            render: (subject: SubjectDto) => (
                <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                    <ClipboardList className="h-3.5 w-3.5" />
                    {subject.questionCount}
                </span>
            ),
        },
        {
            key: 'examCount',
            title: 'Ky thi',
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
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Quan ly mon hoc"
                    description={`${subjects.length} mon hoc dang duoc doc tu SubjectsController`}
                    actions={(
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
                            Them mon hoc
                        </Button>
                    )}
                />
            </motion.div>

            <motion.div variants={staggerItem} className="max-w-sm">
                <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tim ma mon, ten mon, giang vien..." />
            </motion.div>

            <motion.div variants={staggerItem}>
                {error ? (
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Khong the tai mon hoc"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadPageData()}>
                                Thu lai
                            </Button>
                        )}
                    />
                ) : (
                    <DataTable columns={columns} data={filteredSubjects} loading={loading} emptyMessage="Khong co mon hoc nao phu hop bo loc hien tai." />
                )}
            </motion.div>

            <Modal
                open={showCreateModal}
                onClose={() => {
                    if (!submitting) {
                        setShowCreateModal(false);
                    }
                }}
                title="Them mon hoc moi"
                description="Mon hoc se duoc tao truc tiep tren backend that."
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
                        label="Ten mon hoc"
                        value={createForm.name}
                        onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Nhap mon Lap trinh"
                    />
                    <Input
                        label="Don vi"
                        value={createForm.department ?? ''}
                        onChange={(event) => setCreateForm((current) => ({ ...current, department: event.target.value }))}
                        placeholder="Khoa CNTT"
                    />
                    <Select
                        label="Giang vien phu trach"
                        value={createForm.createdById ?? ''}
                        onChange={(value) => setCreateForm((current) => ({ ...current, createdById: value }))}
                        options={lecturerOptions}
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                            Huy
                        </Button>
                        <Button onClick={() => void handleCreateSubject()} loading={submitting} icon={<BookOpen className="h-4 w-4" />}>
                            Tao mon hoc
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
