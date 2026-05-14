'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Shield, ShieldCheck } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import { ApiError } from '@/lib/api/client';
import { staggerContainer, staggerItem } from '@/lib/motion';
import {
  clearLogoutStripLoginNext,
  getSafePostLoginPath,
} from '@/lib/auth/routing';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { status, login, user } = useAuth();

  useEffect(() => {
    clearLogoutStripLoginNext();
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && user) {
      const destination = getSafePostLoginPath(searchParams.get('next'), user.role);
      router.replace(destination);
      router.refresh();
    }
  }, [router, searchParams, status, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const nextSession = await login({
        email: email.trim(),
        password,
      });

      const destination = getSafePostLoginPath(searchParams.get('next'), nextSession.user.role);
      router.replace(destination);
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof ApiError
          ? caughtError.message
          : 'Không thể đăng nhập vào hệ thống lúc này.';

      setError(message);
      toast({
        type: 'error',
        title: 'Đăng nhập thất bại',
        message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1280px] gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <motion.section
          variants={staggerContainer}
          initial="initial"
          animate="enter"
          className="surface-panel hidden rounded-[28px] p-8 lg:flex lg:flex-col lg:justify-between"
        >
          <div className="space-y-8">
            <motion.div variants={staggerItem} className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-accent text-white shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary">ExamGuard</p>
                <p className="text-sm text-text-muted">Exam operations and monitoring</p>
              </div>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                variants={staggerItem}
                className="max-w-xl text-[32px] font-semibold tracking-[-0.05em] text-text-primary"
              >
                Giao dien thi truc tuyen nghiem tuc, ro rang, va san sang cho demo that.
              </motion.h1>
              <motion.p
                variants={staggerItem}
                className="max-w-lg text-sm leading-6 text-text-muted"
              >
                Form dang nhap nay goi truc tiep den backend, nhan JWT that, va dieu
                huong theo role that. Refactor moi uu tien contrast, hierarchy, va
                tinh on dinh thay vi hieu ung khoe ky thuat.
              </motion.p>
            </div>

            <motion.div variants={staggerItem} className="grid gap-4 md:grid-cols-3">
              {[
                {
                  label: 'Authentication',
                  value: 'JWT + refresh token',
                },
                {
                  label: 'Authorization',
                  value: 'Role-based routing',
                },
                {
                  label: 'Session safety',
                  value: 'Session-aware flows',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[20px] border border-border-subtle bg-bg-primary/80 p-5"
                >
                  <p className="text-xs text-text-muted">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-text-primary">{item.value}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            variants={staggerItem}
            className="rounded-[24px] border border-border-subtle bg-bg-primary/80 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/8 text-accent">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary">Operational note</p>
                <p className="text-sm leading-6 text-text-muted">
                  Hệ thống sử dụng dữ liệu thật từ backend hiện tại. UI layer mới không
                  thay doi auth contract, role contract, hay data flow dang chay.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="initial"
          animate="enter"
          className="flex items-center justify-center"
        >
          <div className="surface-card w-full rounded-[28px] p-6 shadow-md sm:p-8">
            <motion.div variants={staggerItem} className="mb-8 space-y-4">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-accent text-white shadow-sm">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-text-primary">ExamGuard</p>
                  <p className="text-sm text-text-muted">Examination operations</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">He thong san sang</Badge>
                  {status === 'loading' && <Badge variant="info">Đang phục hồi session</Badge>}
                </div>
                <h2 className="text-[28px] font-semibold tracking-[-0.05em] text-text-primary">
                  Đăng nhập
                </h2>
                <p className="text-sm leading-6 text-text-muted">
                  Dung email va mat khau da ton tai tren backend. He thong se tu dong
                  đưa bạn đến đúng workspace theo role hiện có.
                </p>
              </div>
            </motion.div>

            <motion.form variants={staggerItem} className="space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@hcmut.edu.vn"
                autoComplete="username"
                required
              />

              <div className="relative">
                <Input
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  required
                  error={error ?? undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3.5 bottom-3 text-text-muted transition-colors hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-text-muted">
                  {status === 'loading'
                    ? 'Đang kiểm tra phiên đăng nhập hiện tại.'
                    : 'Role se duoc xac dinh tu token that sau khi dang nhap.'}
                </p>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  Quen mat khau?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                iconRight={<ArrowRight className="h-4 w-4" />}
              >
                Đăng nhập
              </Button>
            </motion.form>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary" />}>
      <LoginPageContent />
    </Suspense>
  );
}
