'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Shield, ArrowLeft, Mail } from 'lucide-react';
import { pageVariants } from '@/lib/motion';

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1500));
        setSent(true);
        setLoading(false);
        toast({ type: 'success', title: 'Email đã được gửi', message: 'Vui lòng kiểm tra hộp thư' });
    };

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
            <motion.div variants={pageVariants} initial="initial" animate="enter" className="w-full max-w-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-accent flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-text-primary">ExamGuard</span>
                </div>

                {!sent ? (
                    <>
                        <h3 className="text-xl font-bold text-text-primary mb-1">Quên mật khẩu</h3>
                        <p className="text-sm text-text-muted mb-6">
                            Nhập email đã đăng ký để nhận link đặt lại mật khẩu
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="email@hcmut.edu.vn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={<Mail className="h-4 w-4" />}
                                required
                            />
                            <Button type="submit" loading={loading} className="w-full">
                                Gửi link khôi phục
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                            <Mail className="h-7 w-7 text-success" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">Kiểm tra email</h3>
                        <p className="text-sm text-text-muted mb-6">
                            Chúng tôi đã gửi link đặt lại mật khẩu đến <strong className="text-text-primary">{email}</strong>. Vui lòng kiểm tra hộp thư (bao gồm thư rác).
                        </p>
                        <Button variant="secondary" onClick={() => setSent(false)} className="w-full">
                            Gửi lại email
                        </Button>
                    </div>
                )}

                <Link href="/login" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors mt-6 justify-center">
                    <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
                </Link>
            </motion.div>
        </div>
    );
}
