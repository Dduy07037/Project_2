'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, ShieldOff, ArrowLeft, Home } from 'lucide-react';
import { pageVariants } from '@/lib/motion';

export default function Page403() {
    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
            <motion.div variants={pageVariants} initial="initial" animate="enter" className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
                    <ShieldOff className="h-9 w-9 text-danger" />
                </div>
                <h1 className="text-6xl font-bold text-text-primary mb-2 tracking-tight">403</h1>
                <h2 className="text-lg font-semibold text-text-secondary mb-3">Truy cập bị từ chối</h2>
                <p className="text-sm text-text-muted mb-8">
                    Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link href="/login">
                        <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Đăng nhập lại</Button>
                    </Link>
                    <Link href="/">
                        <Button icon={<Home className="h-4 w-4" />}>Trang chủ</Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
