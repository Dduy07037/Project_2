'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Avatar,
    Badge,
    Button,
    InlineState,
    Input,
    Modal,
    PageHeader,
    SearchInput,
    Select,
    StatusBadge,
    Tabs,
} from '@/components/ui';
import { DataTable } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import {
    createUser,
    getRoleLabel,
    getUsers,
    resetUserPassword,
    toStatusKey,
    updateUserStatus,
    type CreateUserRequest,
    type UserDto,
} from '@/lib/api/exam-guard';
import { formatDateTime } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { AlertCircle, KeyRound, Lock, Plus, RefreshCw, Unlock } from 'lucide-react';

const emptyCreateForm: CreateUserRequest = {
    email: '',
    password: '',
    fullName: '',
    role: 'Student',
    studentCode: '',
    department: '',
};

export default function UsersPage() {
    const { request } = useAuth();
    const { toast } = useToast();

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [createForm, setCreateForm] = useState<CreateUserRequest>(emptyCreateForm);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getUsers(request, {
                search: search || undefined,
                role: roleFilter !== 'all' ? roleFilter : undefined,
                page: 1,
                pageSize: 100,
            });

            setUsers(response.items);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Khong the tai danh sach nguoi dung.');
        } finally {
            setLoading(false);
        }
    }, [request, roleFilter, search]);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    const roleTabs = useMemo(() => {
        const counts = users.reduce<Record<string, number>>((accumulator, user) => {
            const roleKey = user.role.toLowerCase();
            accumulator[roleKey] = (accumulator[roleKey] ?? 0) + 1;
            return accumulator;
        }, {});

        return [
            { id: 'all', label: 'Tat ca', count: users.length },
            { id: 'admin', label: 'Admin', count: counts.admin ?? 0 },
            { id: 'lecturer', label: 'Giang vien', count: counts.lecturer ?? 0 },
            { id: 'student', label: 'Sinh vien', count: counts.student ?? 0 },
        ];
    }, [users]);

    const handleCreateUser = useCallback(async () => {
        if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.password.trim()) {
            toast({ type: 'warning', title: 'Thieu thong tin', message: 'Vui long nhap du ho ten, email va mat khau.' });
            return;
        }

        setSubmitting(true);

        try {
            await createUser(request, {
                ...createForm,
                email: createForm.email.trim(),
                fullName: createForm.fullName.trim(),
                studentCode: createForm.studentCode?.trim() || undefined,
                department: createForm.department?.trim() || undefined,
            });

            toast({ type: 'success', title: 'Da tao tai khoan moi' });
            setShowCreateModal(false);
            setCreateForm(emptyCreateForm);
            await loadUsers();
        } catch (createError) {
            toast({
                type: 'error',
                title: 'Tao tai khoan that bai',
                message: createError instanceof Error ? createError.message : 'Da xay ra loi khong xac dinh.',
            });
        } finally {
            setSubmitting(false);
        }
    }, [createForm, loadUsers, request, toast]);

    const handleToggleStatus = useCallback(async (user: UserDto) => {
        const nextStatus = user.status.toLowerCase() === 'active' ? 'Disabled' : 'Active';

        try {
            await updateUserStatus(request, user.id, nextStatus);
            toast({ type: 'success', title: `Da cap nhat trang thai ${user.fullName}` });
            await loadUsers();
        } catch (statusError) {
            toast({
                type: 'error',
                title: 'Cap nhat trang thai that bai',
                message: statusError instanceof Error ? statusError.message : 'Da xay ra loi khong xac dinh.',
            });
        }
    }, [loadUsers, request, toast]);

    const handleResetPassword = useCallback(async (user: UserDto) => {
        try {
            await resetUserPassword(request, user.id, 'Password123!');
            toast({
                type: 'success',
                title: `Da reset mat khau cho ${user.fullName}`,
                message: 'Mat khau tam thoi da duoc dat ve Password123!.',
            });
        } catch (resetError) {
            toast({
                type: 'error',
                title: 'Reset mat khau that bai',
                message: resetError instanceof Error ? resetError.message : 'Da xay ra loi khong xac dinh.',
            });
        }
    }, [request, toast]);

    const columns = [
        {
            key: 'name',
            title: 'Nguoi dung',
            render: (user: UserDto) => (
                <div className="flex items-center gap-3">
                    <Avatar name={user.fullName} size="sm" />
                    <div>
                        <p className="text-sm font-medium text-text-primary">{user.fullName}</p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'role',
            title: 'Vai tro',
            render: (user: UserDto) => (
                <Badge
                    variant={user.role.toLowerCase() === 'admin' ? 'danger' : user.role.toLowerCase() === 'lecturer' ? 'info' : 'primary'}
                >
                    {getRoleLabel(user.role)}
                </Badge>
            ),
        },
        {
            key: 'department',
            title: 'Don vi',
            render: (user: UserDto) => <span className="text-sm text-text-secondary">{user.department || user.studentCode || '—'}</span>,
        },
        {
            key: 'status',
            title: 'Trang thai',
            render: (user: UserDto) => <StatusBadge status={toStatusKey(user.status)} />,
        },
        {
            key: 'lastLoginAt',
            title: 'Dang nhap cuoi',
            render: (user: UserDto) => (
                <span className="text-xs text-text-muted">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Chua dang nhap'}</span>
            ),
        },
        {
            key: 'actions',
            title: 'Tac vu',
            render: (user: UserDto) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleResetPassword(user)}
                        title="Reset password"
                    >
                        <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleToggleStatus(user)}
                        title={user.status.toLowerCase() === 'active' ? 'Disable account' : 'Enable account'}
                    >
                        {user.status.toLowerCase() === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Quan ly nguoi dung"
                    description={`${users.length} tai khoan dang hien thi tu backend`}
                    actions={(
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
                            Tao tai khoan
                        </Button>
                    )}
                />
            </motion.div>

            <motion.div variants={staggerItem}>
                <Tabs tabs={roleTabs} activeTab={roleFilter} onChange={setRoleFilter} />
            </motion.div>

            <motion.div variants={staggerItem} className="max-w-sm">
                <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tim theo ten, email, MSSV..." />
            </motion.div>

            <motion.div variants={staggerItem}>
                {error ? (
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Khong the tai nguoi dung"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadUsers()}>
                                Thu lai
                            </Button>
                        )}
                    />
                ) : (
                    <DataTable columns={columns} data={users} loading={loading} emptyMessage="Khong co tai khoan nao phu hop bo loc hien tai." />
                )}
            </motion.div>

            <Modal
                open={showCreateModal}
                onClose={() => {
                    if (!submitting) {
                        setShowCreateModal(false);
                    }
                }}
                title="Tao tai khoan moi"
                description="Thong tin nay se duoc gui truc tiep den UsersController that."
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Ho va ten"
                        value={createForm.fullName}
                        onChange={(event) => setCreateForm((current) => ({ ...current, fullName: event.target.value }))}
                        placeholder="Nguyen Van A"
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={createForm.email}
                        onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
                        placeholder="email@example.com"
                    />
                    <Input
                        label="Mat khau"
                        type="password"
                        value={createForm.password}
                        onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder="Toi thieu 6 ky tu"
                    />
                    <Select
                        label="Vai tro"
                        value={createForm.role}
                        onChange={(value) => setCreateForm((current) => ({ ...current, role: value }))}
                        options={[
                            { value: 'Student', label: 'Sinh vien' },
                            { value: 'Lecturer', label: 'Giang vien' },
                            { value: 'Admin', label: 'Admin' },
                        ]}
                    />
                    <Input
                        label="MSSV"
                        value={createForm.studentCode ?? ''}
                        onChange={(event) => setCreateForm((current) => ({ ...current, studentCode: event.target.value }))}
                        placeholder="Bo trong neu khong phai sinh vien"
                    />
                    <Input
                        label="Don vi"
                        value={createForm.department ?? ''}
                        onChange={(event) => setCreateForm((current) => ({ ...current, department: event.target.value }))}
                        placeholder="Khoa CNTT"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                            Huy
                        </Button>
                        <Button onClick={() => void handleCreateUser()} loading={submitting}>
                            Luu tai khoan
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
