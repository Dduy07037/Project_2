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
import { isValidEmailAddress, normalizeEmailAddress } from '@/lib/validators';
import { AlertCircle, KeyRound, Lock, Plus, RefreshCw, Unlock } from 'lucide-react';

const emptyCreateForm: CreateUserRequest = {
    email: '',
    password: '',
    fullName: '',
    role: 'Student',
    studentCode: '',
    department: '',
};

const emptyRoleCounts = {
    all: 0,
    admin: 0,
    lecturer: 0,
    student: 0,
};

export default function UsersPage() {
    const { request } = useAuth();
    const { toast } = useToast();

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roleCounts, setRoleCounts] = useState(emptyRoleCounts);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [createForm, setCreateForm] = useState<CreateUserRequest>(emptyCreateForm);
    const [emailError, setEmailError] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const baseQuery = {
                search: search || undefined,
                page: 1,
                pageSize: 100,
            };

            const [globalResponse, filteredResponse] = await Promise.all([
                getUsers(request, baseQuery),
                getUsers(request, {
                    ...baseQuery,
                    role: roleFilter !== 'all' ? roleFilter : undefined,
                }),
            ]);

            const counts = globalResponse.items.reduce((accumulator, user) => {
                const roleKey = user.role.toLowerCase() as 'admin' | 'lecturer' | 'student';
                accumulator.all += 1;
                if (roleKey in accumulator) {
                    accumulator[roleKey] += 1;
                }
                return accumulator;
            }, { ...emptyRoleCounts });

            setUsers(filteredResponse.items);
            setRoleCounts(counts);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    }, [request, roleFilter, search]);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    const roleTabs = useMemo(() => [
        { id: 'all', label: 'Tất cả', count: roleCounts.all },
        { id: 'admin', label: 'Quản trị viên', count: roleCounts.admin },
        { id: 'lecturer', label: 'Giảng viên', count: roleCounts.lecturer },
        { id: 'student', label: 'Sinh viên', count: roleCounts.student },
    ], [roleCounts]);

    const handleCreateUser = useCallback(async () => {
        if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.password.trim()) {
            toast({ type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng nhập đủ họ tên, email và mật khẩu.' });
            return;
        }

        const normalizedEmail = normalizeEmailAddress(createForm.email);
        if (!isValidEmailAddress(normalizedEmail)) {
            setEmailError('Email không đúng định dạng.');
            return;
        }

        setEmailError(null);
        setSubmitting(true);

        try {
            await createUser(request, {
                ...createForm,
                email: normalizedEmail,
                fullName: createForm.fullName.trim(),
                studentCode: createForm.studentCode?.trim() || undefined,
                department: createForm.department?.trim() || undefined,
            });

            toast({ type: 'success', title: 'Đã tạo tài khoản mới' });
            setShowCreateModal(false);
            setCreateForm(emptyCreateForm);
            setEmailError(null);
            await loadUsers();
        } catch (createError) {
            toast({
                type: 'error',
                title: 'Tạo tài khoản thất bại',
                message: createError instanceof Error ? createError.message : 'Đã xảy ra lỗi không xác định.',
            });
        } finally {
            setSubmitting(false);
        }
    }, [createForm, loadUsers, request, toast]);

    const handleToggleStatus = useCallback(async (user: UserDto) => {
        const nextStatus = user.status.toLowerCase() === 'active' ? 'Disabled' : 'Active';

        try {
            await updateUserStatus(request, user.id, nextStatus);
            toast({ type: 'success', title: `Đã cập nhật trạng thái ${user.fullName}` });
            await loadUsers();
        } catch (statusError) {
            toast({
                type: 'error',
                title: 'Cập nhật trạng thái thất bại',
                message: statusError instanceof Error ? statusError.message : 'Đã xảy ra lỗi không xác định.',
            });
        }
    }, [loadUsers, request, toast]);

    const handleResetPassword = useCallback(async (user: UserDto) => {
        try {
            await resetUserPassword(request, user.id, 'Password123!');
            toast({
                type: 'success',
                title: `Đã đặt lại mật khẩu cho ${user.fullName}`,
                message: 'Mật khẩu tạm thời đã được đặt về Password123!.',
            });
        } catch (resetError) {
            toast({
                type: 'error',
                title: 'Đặt lại mật khẩu thất bại',
                message: resetError instanceof Error ? resetError.message : 'Đã xảy ra lỗi không xác định.',
            });
        }
    }, [request, toast]);

    const columns = [
        {
            key: 'name',
            title: 'Người dùng',
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
            title: 'Vai trò',
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
            title: 'Đơn vị',
            render: (user: UserDto) => <span className="text-sm text-text-secondary">{user.department || user.studentCode || '—'}</span>,
        },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (user: UserDto) => <StatusBadge status={toStatusKey(user.status)} />,
        },
        {
            key: 'lastLoginAt',
            title: 'Đăng nhập cuối',
            render: (user: UserDto) => (
                <span className="text-xs text-text-muted">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Chưa đăng nhập'}</span>
            ),
        },
        {
            key: 'actions',
            title: 'Tác vụ',
            render: (user: UserDto) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleResetPassword(user)}
                        title="Đặt lại mật khẩu"
                    >
                        <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleToggleStatus(user)}
                        title={user.status.toLowerCase() === 'active' ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
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
                    title="Quản lý người dùng"
                    description={`${users.length} tài khoản đang hiển thị`}
                    actions={(
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
                            Tạo tài khoản
                        </Button>
                    )}
                />
            </motion.div>

            <motion.div variants={staggerItem}>
                <Tabs tabs={roleTabs} activeTab={roleFilter} onChange={setRoleFilter} />
            </motion.div>

            <motion.div variants={staggerItem} className="max-w-sm">
                <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, email, MSSV..." />
            </motion.div>

            <motion.div variants={staggerItem}>
                {error ? (
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Không thể tải người dùng"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadUsers()}>
                                Thử lại
                            </Button>
                        )}
                    />
                ) : (
                    <DataTable columns={columns} data={users} getRowId={(item) => item.id} loading={loading} emptyMessage="Không có tài khoản nào phù hợp bộ lọc hiện tại." />
                )}
            </motion.div>

            <Modal
                open={showCreateModal}
                onClose={() => {
                    if (!submitting) {
                        setShowCreateModal(false);
                    }
                }}
                title="Tạo tài khoản mới"
                description="Thông tin này sẽ được gửi trực tiếp đến UsersController thật."
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Họ và tên"
                        value={createForm.fullName}
                        onChange={(event) => setCreateForm((current) => ({ ...current, fullName: event.target.value }))}
                        placeholder="Nguyễn Văn A"
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={createForm.email}
                        onChange={(event) => {
                            setEmailError(null);
                            setCreateForm((current) => ({ ...current, email: event.target.value }));
                        }}
                        error={emailError ?? undefined}
                        placeholder="email@example.com"
                    />
                    <Input
                        label="Mật khẩu"
                        type="password"
                        value={createForm.password}
                        onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder="Tối thiểu 6 ký tự"
                    />
                    <Select
                        label="Vai trò"
                        value={createForm.role}
                        onChange={(value) => setCreateForm((current) => ({ ...current, role: value }))}
                        options={[
                            { value: 'Student', label: 'Sinh viên' },
                            { value: 'Lecturer', label: 'Giảng viên' },
                            { value: 'Admin', label: 'Admin' },
                        ]}
                    />
                    <Input
                        label="MSSV"
                        value={createForm.studentCode ?? ''}
                        onChange={(event) => setCreateForm((current) => ({ ...current, studentCode: event.target.value }))}
                        placeholder="Bỏ trống nếu không phải sinh viên"
                    />
                    <Input
                        label="Đơn vị"
                        value={createForm.department ?? ''}
                        onChange={(event) => setCreateForm((current) => ({ ...current, department: event.target.value }))}
                        placeholder="Khoa CNTT"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button onClick={() => void handleCreateUser()} loading={submitting}>
                            Lưu tài khoản
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
