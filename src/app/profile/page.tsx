'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Building2,
    KeyRound,
    Mail,
    Save,
    Shield,
    UserRound,
} from 'lucide-react';
import {
    Badge,
    Button,
    Card,
    Input,
    PageHeader,
    Panel,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { FullscreenState } from '@/components/ui/page-state';
import { ApiError } from '@/lib/api/client';

export default function ProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { status, session, user, changePassword } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login');
        }
    }, [router, status]);

    async function handleChangePassword() {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast({
                type: 'warning',
                title: 'Thiếu thông tin',
                message: 'Vui lòng nhập đầy đủ các trường đổi mật khẩu.',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                type: 'error',
                title: 'Xác nhận chưa khớp',
                message: 'Mật khẩu mới và xác nhận mật khẩu phải trùng nhau.',
            });
            return;
        }

        setSavingPassword(true);

        try {
            await changePassword({
                currentPassword,
                newPassword,
            });

            toast({
                type: 'success',
                title: 'Đổi mật khẩu thành công',
                message: 'Phiên đăng nhập hiện tại đã được thu hồi. Vui lòng đăng nhập lại.',
            });

            router.replace('/login');
        } catch (error) {
            const message =
                error instanceof ApiError
                    ? error.message
                    : 'Không thể đổi mật khẩu lúc này.';

            toast({
                type: 'error',
                title: 'Đổi mật khẩu thất bại',
                message,
            });
        } finally {
            setSavingPassword(false);
        }
    }

    if (status === 'loading') {
        return (
            <FullscreenState
                icon={<Shield className="h-10 w-10" />}
                title="Đang tải hồ sơ"
                description="Thông tin người dùng đang được lấy từ phiên đăng nhập thật."
            />
        );
    }

    if (!user) {
        return (
            <FullscreenState
                icon={<UserRound className="h-10 w-10" />}
                title="Không tìm thấy người dùng"
                description="Phiên đăng nhập hiện tại không còn hợp lệ."
            />
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="max-w-4xl mx-auto py-10 px-6">
                <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
                    <motion.div variants={staggerItem}>
                        <PageHeader title="Hồ sơ cá nhân" description="Thông tin đang được đồng bộ từ `GET /api/auth/me`." />
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <Card>
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/25 to-accent-cyan/15 border border-border-glass-strong flex items-center justify-center text-accent-light text-xl font-bold">
                                    {user.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-text-primary">{user.fullName}</h3>
                                    <p className="text-sm text-text-muted">{user.email}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'lecturer' ? 'info' : 'primary'}>
                                            {user.role === 'admin' ? 'Admin' : user.role === 'lecturer' ? 'Giảng viên' : 'Sinh viên'}
                                        </Badge>
                                        {session?.concurrentSessionDetected && (
                                            <Badge variant="warning">
                                                {session.activeSessionCount} phiên đang hoạt động
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <Panel title="Thông tin tài khoản">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Họ và tên" value={user.fullName} disabled icon={<UserRound className="h-4 w-4" />} />
                                <Input label="Email" value={user.email} disabled icon={<Mail className="h-4 w-4" />} />
                                <Input
                                    label="Vai trò"
                                    value={user.role === 'admin' ? 'Admin' : user.role === 'lecturer' ? 'Giảng viên' : 'Sinh viên'}
                                    disabled
                                    icon={<Shield className="h-4 w-4" />}
                                />
                                <Input
                                    label="Khoa / Bộ môn"
                                    value={user.department || 'Chưa có dữ liệu'}
                                    disabled
                                    icon={<Building2 className="h-4 w-4" />}
                                />
                                {user.studentCode && (
                                    <Input label="Mã sinh viên" value={user.studentCode} disabled icon={<UserRound className="h-4 w-4" />} />
                                )}
                                {session && (
                                    <Input
                                        label="Session ID"
                                        value={session.sessionId}
                                        disabled
                                        icon={<KeyRound className="h-4 w-4" />}
                                    />
                                )}
                            </div>
                        </Panel>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <Panel
                            title="Đổi mật khẩu"
                            action={
                                <Button
                                    size="sm"
                                    icon={<Save className="h-3 w-3" />}
                                    onClick={() => void handleChangePassword()}
                                    loading={savingPassword}
                                >
                                    Cập nhật
                                </Button>
                            }
                        >
                            <div className="space-y-4 max-w-md">
                                <Input
                                    label="Mật khẩu hiện tại"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                    placeholder="••••••••"
                                />
                                <Input
                                    label="Mật khẩu mới"
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    placeholder="••••••••"
                                />
                                <Input
                                    label="Xác nhận mật khẩu mới"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </Panel>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
