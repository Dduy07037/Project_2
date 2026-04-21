'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { pageVariants } from '@/lib/motion';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[640px] items-center justify-center">
        <motion.div variants={pageVariants} initial="initial" animate="enter" className="w-full">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-accent text-white shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">ExamGuard</p>
              <p className="text-sm text-text-muted">Examination operations</p>
            </div>
          </div>

          <Card className="space-y-6 rounded-[28px] p-6 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-info/8 text-info">
              <Mail className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-text-primary">
                Quen mat khau
              </h1>
              <p className="text-sm leading-6 text-text-muted">
                Backend hien tai chua co endpoint reset password qua email. Trang nay
                duoc giu lai de thong bao ro rang thay vi gia lap mot quy trinh khong co
                that.
              </p>
            </div>

            <div className="rounded-[20px] border border-border-subtle bg-bg-tertiary p-5 text-sm text-text-secondary">
              <p className="font-medium text-text-primary">Huong xu ly hien tai</p>
              <div className="mt-3 space-y-2 leading-6">
                <p>1. Lien he admin de duoc reset mat khau bang UsersController.</p>
                <p>2. Sau khi dang nhap lai, ban co the doi mat khau that trong trang Profile.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
                  Quay lai dang nhap
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
