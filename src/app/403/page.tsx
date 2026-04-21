'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageVariants } from '@/lib/motion';

export default function Page403() {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[640px] items-center justify-center">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="enter"
          className="surface-card w-full rounded-[28px] p-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger/8 text-danger">
            <ShieldOff className="h-8 w-8" />
          </div>
          <h1 className="text-[56px] font-semibold tracking-[-0.06em] text-text-primary">403</h1>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Truy cap bi tu choi</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-muted">
            Ban khong co quyen truy cap trang nay. Neu day la nham lan, vui long lien he
            quan tri vien de kiem tra phan quyen.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login">
              <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
                Dang nhap lai
              </Button>
            </Link>
            <Link href="/">
              <Button icon={<Home className="h-4 w-4" />}>Trang chu</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
