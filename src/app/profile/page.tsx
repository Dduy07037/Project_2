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
        title: 'Thieu thong tin',
        message: 'Vui long nhap day du cac truong doi mat khau.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        type: 'error',
        title: 'Xac nhan chua khop',
        message: 'Mat khau moi va xac nhan mat khau phai trung nhau.',
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
          : 'Khong the doi mat khau luc nay.';

      toast({
        type: 'error',
        title: 'Doi mat khau that bai',
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
          title="Ho so ca nhan"
          description="Thong tin dang duoc dong bo truc tiep tu phien dang nhap hien tai."
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
                        ? 'Giang vien'
                        : 'Sinh vien'}
                  </Badge>
                  {session?.concurrentSessionDetected && (
                    <Badge variant="warning">
                      {session.activeSessionCount} phien dang hoat dong
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-text-secondary sm:grid-cols-2 md:min-w-[280px]">
              <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-tertiary p-4">
                <p className="text-xs text-text-muted">Vai tro</p>
                <p className="mt-1 font-medium text-text-primary">
                  {user.role === 'admin'
                    ? 'Quan tri vien'
                    : user.role === 'lecturer'
                      ? 'Giang vien'
                      : 'Sinh vien'}
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-bg-tertiary p-4">
                <p className="text-xs text-text-muted">Session ID</p>
                <p className="mt-1 font-mono text-[12px] text-text-primary">
                  {session?.sessionId ?? 'Khong co'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <motion.div variants={staggerItem}>
          <Panel title="Thong tin tai khoan" description="Thong tin chi doc tu he thong">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Ho va ten" value={user.fullName} disabled icon={<UserRound className="h-4 w-4" />} />
              <Input label="Email" value={user.email} disabled icon={<Mail className="h-4 w-4" />} />
              <Input
                label="Vai tro"
                value={
                  user.role === 'admin'
                    ? 'Quan tri vien'
                    : user.role === 'lecturer'
                      ? 'Giang vien'
                      : 'Sinh vien'
                }
                disabled
                icon={<Shield className="h-4 w-4" />}
              />
              <Input
                label="Khoa / Bo mon"
                value={user.department || 'Chua co du lieu'}
                disabled
                icon={<Building2 className="h-4 w-4" />}
              />
              {user.studentCode && (
                <Input
                  label="Ma sinh vien"
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
            title="Doi mat khau"
            description="Sau khi doi mat khau, phien hien tai se bi thu hoi"
            action={
              <Button
                size="sm"
                icon={<Save className="h-3.5 w-3.5" />}
                onClick={() => void handleChangePassword()}
                loading={savingPassword}
              >
                Cap nhat
              </Button>
            }
          >
            <div className="space-y-4">
              <Input
                label="Mat khau hien tai"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Nhap mat khau hien tai"
              />
              <Input
                label="Mat khau moi"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Nhap mat khau moi"
              />
              <Input
                label="Xac nhan mat khau moi"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Nhap lai mat khau moi"
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
