'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader, Badge, StatusBadge, Avatar, Button, SearchInput, Select, Modal, Input } from '@/components/ui';
import { DataTable } from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { mockUsers } from '@/lib/mock-data';
import { formatDateTime } from '@/lib/utils';
import { Plus, MoreHorizontal, Edit, Lock, Unlock, Trash2, Filter } from 'lucide-react';

export default function UsersPage() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const filteredUsers = mockUsers.filter((u) => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const columns = [
        {
            key: 'name',
            title: 'Người dùng',
            render: (user: typeof mockUsers[0]) => (
                <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="sm" />
                    <div>
                        <p className="text-sm font-medium text-text-primary">{user.name}</p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'role',
            title: 'Vai trò',
            render: (user: typeof mockUsers[0]) => {
                const roleMap: Record<string, string> = { admin: 'Admin', lecturer: 'Giảng viên', student: 'Sinh viên' };
                const colorMap: Record<string, 'danger' | 'info' | 'primary'> = { admin: 'danger', lecturer: 'info', student: 'primary' };
                return <Badge variant={colorMap[user.role]}>{roleMap[user.role]}</Badge>;
            },
        },
        {
            key: 'department',
            title: 'Khoa/Bộ môn',
            render: (user: typeof mockUsers[0]) => (
                <span className="text-sm text-text-secondary">{user.department || '—'}</span>
            ),
        },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (user: typeof mockUsers[0]) => <StatusBadge status={user.status} />,
        },
        {
            key: 'lastLogin',
            title: 'Đăng nhập cuối',
            render: (user: typeof mockUsers[0]) => (
                <span className="text-xs text-text-muted">{user.lastLogin ? formatDateTime(user.lastLogin) : '—'}</span>
            ),
        },
        {
            key: 'actions',
            title: '',
            className: 'w-10',
            render: () => (
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    const tabs = [
        { id: 'all', label: 'Tất cả', count: mockUsers.length },
        { id: 'admin', label: 'Admin', count: mockUsers.filter(u => u.role === 'admin').length },
        { id: 'lecturer', label: 'Giảng viên', count: mockUsers.filter(u => u.role === 'lecturer').length },
        { id: 'student', label: 'Sinh viên', count: mockUsers.filter(u => u.role === 'student').length },
    ];

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <PageHeader
                    title="Quản lý người dùng"
                    description={`${mockUsers.length} tài khoản trong hệ thống`}
                    actions={
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
                            Tạo tài khoản
                        </Button>
                    }
                />
            </motion.div>

            <motion.div variants={staggerItem}>
                <Tabs tabs={tabs} activeTab={roleFilter} onChange={setRoleFilter} />
            </motion.div>

            <motion.div variants={staggerItem} className="flex items-center gap-3">
                <div className="flex-1 max-w-sm">
                    <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc email..." />
                </div>
            </motion.div>

            <motion.div variants={staggerItem}>
                <DataTable columns={columns} data={filteredUsers} emptyMessage="Không tìm thấy người dùng" />
            </motion.div>

            {/* Create Modal */}
            <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tạo tài khoản mới" size="md">
                <div className="space-y-4">
                    <Input label="Họ và tên" placeholder="Nguyễn Văn A" />
                    <Input label="Email" type="email" placeholder="email@hcmut.edu.vn" />
                    <Input label="Mật khẩu" type="password" placeholder="••••••••" />
                    <Select
                        label="Vai trò"
                        options={[
                            { value: 'student', label: 'Sinh viên' },
                            { value: 'lecturer', label: 'Giảng viên' },
                            { value: 'admin', label: 'Admin' },
                        ]}
                        value="student"
                        onChange={() => { }}
                    />
                    <Input label="Khoa / Bộ môn" placeholder="Khoa CNTT" />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Hủy</Button>
                        <Button>Tạo tài khoản</Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
