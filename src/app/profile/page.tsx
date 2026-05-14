'use client';

import { useState } from 'react';
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
  Avatar,
  Badge,
  Button,
  Input,
  PageHeader,
  Panel,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import { ApiError } from '@/lib/api/client';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { AuthenticatedShell } from '@/components/layout/authenticated-shell';

function ProfileContent() {
  const { toast } = useToast();
  const { session, user, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

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

  if (!user) {
    return null;
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
      <motion.div variants={staggerItem}>
        <PageHeader
          title="Hồ sơ cá nhân"
          description="Thông tin đang được đồng bộ trực tiếp từ phiên đăng nhập hiện tại."
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <div className="surface-card rounded-[var(--radius-xl)] p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={user.fullName} src={user.avatar ?? undefined} size="lg" />
              <div className="space-y-2">
                <div>
                  <h2 className="text-[22px] font-semibold tracking-[-0.04em] text-text-primary">
                    {user.fullName}
                  </h2>
                  <p className="text-sm text-text-muted">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      user.role === 'admin'
                        ? 'danger'
                        : user.role === 'lecturer'
                          ? 'info'
                          : 'primary'
                    }
                  >
                    {user.role === 'admin'
                      ? 'Admin'
                      : user.role === 'lecturer'
                        ? 'Giảng viên'
                        : 'Sinh viên'}
                  </Badge>
                  {session?.concurrentSessionDetected && (
                    <Badge variant="warning">
                      {session.activeSessionCount} phiên đang hoạt động
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-text-secondary sm:grid-cols-2 md:min-w-[280px]">
              <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-tertiary p-4">
                <p className="text-xs text-text-muted">Vai trò</p>
                <p className="mt-1 font-medium text-text-primary">
                  {user.role === 'admin'
                    ? 'Quản trị viên'
                    : user.role === 'lecturer'
                      ? 'Giảng viên'
                      : 'Sinh viên'}
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-tertiary p-4">
                <p className="text-xs text-text-muted">Session ID</p>
                <p className="mt-1 font-mono text-[12px] text-text-primary">
                  {session?.sessionId ?? 'Không có'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <motion.div variants={staggerItem}>
          <Panel title="Thông tin tài khoản" description="Thông tin chỉ đọc từ hệ thống">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Họ và tên" value={user.fullName} disabled icon={<UserRound className="h-4 w-4" />} />
              <Input label="Email" value={user.email} disabled icon={<Mail className="h-4 w-4" />} />
              <Input
                label="Vai trò"
                value={
                  user.role === 'admin'
                    ? 'Quản trị viên'
                    : user.role === 'lecturer'
                      ? 'Giảng viên'
                      : 'Sinh viên'
                }
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
                <Input
                  label="Mã sinh viên"
                  value={user.studentCode}
                  disabled
                  icon={<UserRound className="h-4 w-4" />}
                />
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
            description="Sau khi đổi mật khẩu, phiên hiện tại sẽ bị thu hồi"
            action={
              <Button
                size="sm"
                icon={<Save className="h-3.5 w-3.5" />}
                onClick={() => void handleChangePassword()}
                loading={savingPassword}
              >
                Cập nhật
              </Button>
            }
          >
            <div className="space-y-4">
              <Input
                label="Mật khẩu hiện tại"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <Input
                label="Mật khẩu mới"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </Panel>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  return (
    <AuthenticatedShell>
      <ProfileContent />
    </AuthenticatedShell>
  );
}
