'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useRouter } from 'next/navigation';
import { Shield, GraduationCap, BookOpen, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const quickLogin = (role: string) => {
        setLoading(true);
        setTimeout(() => {
            router.push(`/${role}/dashboard`);
        }, 600);
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="ambient-orb ambient-orb-purple w-[700px] h-[700px] -top-64 -left-64 opacity-25" />
                <div className="ambient-orb ambient-orb-cyan w-[500px] h-[500px] bottom-0 right-0 opacity-15" style={{ animationDelay: '3s' }} />
                <div className="ambient-orb ambient-orb-emerald w-[300px] h-[300px] top-1/2 left-1/2 opacity-8" style={{ animationDelay: '5s' }} />
            </div>

            {/* Left Panel — Branding */}
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
                        Nền tảng thi trắc nghiệm <span className="text-gradient-warm">thông minh</span>
                    </motion.h1>
                    <motion.p variants={staggerItem} className="text-text-muted mt-4 text-sm leading-relaxed max-w-sm">
                        Tổ chức kỳ thi an toàn, minh bạch với công cụ giám sát hành vi thời gian thực và hệ thống hậu kiểm toàn diện.
                    </motion.p>

                    <motion.div variants={staggerItem} className="mt-10 glass-card rounded-[var(--radius-xl)] p-5 border-gradient">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-accent-light tracking-tighter">5K+</p>
                                <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">Sinh viên</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-accent-cyan tracking-tighter">200+</p>
                                <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">Kỳ thi</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-accent-emerald tracking-tighter">99%</p>
                                <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">Uptime</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Right Panel — Login Form */}
            <div className="flex-1 flex items-center justify-center px-6 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="enter"
                    className="w-full max-w-sm"
                >
                    {/* Mobile logo */}
                    <motion.div variants={staggerItem} className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
                        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-accent to-accent-cyan flex items-center justify-center glow-accent">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gradient tracking-tighter">ExamGuard</span>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Đăng nhập</h2>
                        <p className="text-sm text-text-muted mt-1">Nhập thông tin tài khoản để tiếp tục</p>
                    </motion.div>

                    <motion.div variants={staggerItem} className="mt-8 space-y-5">
                        <Input
                            label="Email / Mã số"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@hcmut.edu.vn"
                        />
                        <div className="relative">
                            <Input
                                label="Mật khẩu"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 bottom-2.5 text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="flex items-center justify-between mt-4">
                        <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                            <input type="checkbox" className="accent-accent" /> Ghi nhớ
                        </label>
                        <a href="/forgot-password" className="text-xs text-accent hover:text-accent-light transition-colors font-medium">
                            Quên mật khẩu?
                        </a>
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <Button
                            className="w-full mt-6"
                            loading={loading}
                            onClick={() => quickLogin('student')}
                            iconRight={<ArrowRight className="h-4 w-4" />}
                            glow
                        >
                            Đăng nhập
                        </Button>
                    </motion.div>

                    {/* Quick Demo */}
                    <motion.div variants={staggerItem} className="mt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border-glass" />
                            <span className="text-[10px] text-text-muted uppercase tracking-widest font-semibold flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-accent-light" /> Demo nhanh
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border-glass" />
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                { role: 'admin', label: 'Admin', color: 'from-danger/15 to-danger/5 border-danger/20 hover:border-danger/40 text-danger' },
                                { role: 'lecturer', label: 'Giảng viên', color: 'from-accent-cyan/15 to-accent-cyan/5 border-accent-cyan/20 hover:border-accent-cyan/40 text-accent-cyan' },
                                { role: 'student', label: 'Sinh viên', color: 'from-accent/15 to-accent/5 border-accent/20 hover:border-accent/40 text-accent-light' },
                            ].map(({ role, label, color }) => (
                                <motion.button
                                    key={role}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => quickLogin(role)}
                                    className={cn(
                                        'py-3 rounded-[var(--radius-md)] text-xs font-bold border transition-all duration-200 cursor-pointer',
                                        'bg-gradient-to-b',
                                        color
                                    )}
                                >
                                    {label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
