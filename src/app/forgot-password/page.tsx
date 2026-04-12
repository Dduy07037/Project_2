'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Card } from '@/components/ui';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import { pageVariants } from '@/lib/motion';

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
            <motion.div variants={pageVariants} initial="initial" animate="enter" className="w-full max-w-md">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-accent flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-text-primary">ExamGuard</span>
                </div>

                <Card className="space-y-5">
                    <div className="w-16 h-16 rounded-full bg-info/10 flex items-center justify-center mx-auto">
                        <Mail className="h-7 w-7 text-info" />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-xl font-bold text-text-primary">Forgot password</h1>
                        <p className="text-sm text-text-muted">
                            Backend hien chua co endpoint reset password qua email. Trang nay duoc giu lai de thong bao ro rang thay vi gia lap gui email thanh cong.
                        </p>
                    </div>
                    <div className="text-sm text-text-secondary space-y-2">
                        <p>Huong xu ly hien tai:</p>
                        <p>1. Lien he admin de duoc reset mat khau bang UsersController.</p>
                        <p>2. Sau khi dang nhap lai, ban co the doi mat khau that trong trang Profile.</p>
                    </div>
                    <div className="flex justify-center">
                        <Link href="/login">
                            <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
                                Quay lai dang nhap
                            </Button>
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
