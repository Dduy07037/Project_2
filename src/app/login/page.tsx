'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import { ApiError } from '@/lib/api/client';
import { clearLogoutStripLoginNext, getSafePostLoginPath } from '@/lib/auth/routing';

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
        <div className="min-h-screen flex relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="ambient-orb ambient-orb-purple w-[700px] h-[700px] -top-64 -left-64 opacity-25" />
                <div className="ambient-orb ambient-orb-cyan w-[500px] h-[500px] bottom-0 right-0 opacity-15" style={{ animationDelay: '3s' }} />
                <div className="ambient-orb ambient-orb-emerald w-[300px] h-[300px] top-1/2 left-1/2 opacity-8" style={{ animationDelay: '5s' }} />
            </div>

            <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="enter"
                    className="max-w-md px-12"
                >
                    <motion.div variants={staggerItem} className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br from-accent to-accent-cyan flex items-center justify-center shadow-lg glow-accent">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-gradient tracking-tighter">ExamGuard</span>
                            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-semibold">Hệ thống thi trực tuyến</p>
                        </div>
                    </motion.div>

                    <motion.h1 variants={staggerItem} className="text-4xl font-bold tracking-tighter text-text-primary leading-[1.1]">
                        Đăng nhập vào <span className="text-gradient-warm">hệ thống thật</span>
                    </motion.h1>
                    <motion.p variants={staggerItem} className="text-text-muted mt-4 text-sm leading-relaxed max-w-sm">
                        Form này gọi trực tiếp `POST /api/auth/login`, nhận JWT thật và điều hướng theo role thật từ backend.
                    </motion.p>

                    <motion.div variants={staggerItem} className="mt-10 glass-card rounded-[var(--radius-xl)] p-5 border-gradient">
                        <div className="space-y-3 text-sm text-text-secondary">
                            <div className="flex items-center justify-between gap-4">
                                <span>API backend</span>
                                <span className="text-accent-light font-mono text-xs">NEXT_PUBLIC_API_BASE_URL</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span>Auth state</span>
                                <span className="text-accent-cyan font-medium">JWT + refresh token</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span>Điều hướng</span>
                                <span className="text-accent-emerald font-medium">Theo role thật</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="enter"
                    className="w-full max-w-sm"
                >
                    <motion.div variants={staggerItem} className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
                        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-accent to-accent-cyan flex items-center justify-center glow-accent">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gradient tracking-tighter">ExamGuard</span>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Đăng nhập</h2>
                        <p className="text-sm text-text-muted mt-1">Dùng email và mật khẩu đã tồn tại trên backend.</p>
                    </motion.div>

                    <motion.form variants={staggerItem} className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                error={error ?? undefined}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 bottom-2.5 text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <span className={cn('text-xs', status === 'loading' ? 'text-accent-cyan' : 'text-text-muted')}>
                                {status === 'loading' ? 'Đang khôi phục phiên đăng nhập...' : 'Role sẽ được xác định theo token thật.'}
                            </span>
                            <Link href="/forgot-password" className="text-xs text-accent hover:text-accent-light transition-colors font-medium">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-2"
                            loading={loading}
                            iconRight={<ArrowRight className="h-4 w-4" />}
                            glow
                        >
                            Đăng nhập
                        </Button>
                    </motion.form>
                </motion.div>
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
