'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageVariants } from '@/lib/motion';

export default function NotFound() {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[640px] items-center justify-center">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="enter"
          className="surface-card w-full rounded-[28px] p-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-info/8 text-info">
            <SearchX className="h-8 w-8" />
          </div>
          <h1 className="text-[56px] font-semibold tracking-[-0.06em] text-text-primary">404</h1>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Khong tim thay trang</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-muted">
            Trang ban tim kiem khong ton tai hoac da duoc di chuyen. Hay quay lai dashboard
            de tiep tuc thao tac.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/">
              <Button icon={<Home className="h-4 w-4" />}>Trang chu</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
