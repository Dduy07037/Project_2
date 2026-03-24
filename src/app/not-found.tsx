'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SearchX, ArrowLeft, Home } from 'lucide-react';
import { pageVariants } from '@/lib/motion';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
            <motion.div variants={pageVariants} initial="initial" animate="enter" className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                    <SearchX className="h-9 w-9 text-accent" />
                </div>
                <h1 className="text-6xl font-bold text-text-primary mb-2 tracking-tight">404</h1>
                <h2 className="text-lg font-semibold text-text-secondary mb-3">Không tìm thấy trang</h2>
                <p className="text-sm text-text-muted mb-8">
                    Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link href="/">
                        <Button icon={<Home className="h-4 w-4" />}>Trang chủ</Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
