'use client';

import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './button';
import { staggerListItem } from '@/lib/motion';

// ─── Table (Glass) ───
interface Column<T> {
    key: string;
    title: string;
    className?: string;
    render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField?: string;
    onRowClick?: (item: T) => void;
    className?: string;
    emptyMessage?: string;
    loading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T = any>({
    columns, data, keyField = 'id', onRowClick, className, emptyMessage = 'Không có dữ liệu', loading,
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className={cn('glass-card rounded-[var(--radius-xl)] overflow-hidden', className)}>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border-glass">
                            {columns.map((col) => (
                                <th key={col.key} className={cn('px-5 py-3.5 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest', col.className)}>
                                    {col.title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-border-glass last:border-b-0">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-5 py-4">
                                        <div className="skeleton h-4 w-3/4 rounded" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className={cn('glass-card rounded-[var(--radius-xl)] overflow-hidden', className)}>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border-glass">
                            {columns.map((col) => (
                                <th key={col.key} className={cn('px-5 py-3.5 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest', col.className)}>
                                    {col.title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                </table>
                <div className="py-14 text-center text-text-muted text-sm">{emptyMessage}</div>
            </div>
        );
    }

    return (
        <div className={cn('glass-card rounded-[var(--radius-xl)] overflow-hidden', className)}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border-glass">
                            {columns.map((col) => (
                                <th key={col.key} className={cn('px-5 py-3.5 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest', col.className)}>
                                    {col.title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, idx) => (
                            <motion.tr
                                key={String((item as Record<string, unknown>)[keyField]) || idx}
                                variants={staggerListItem}
                                initial="initial"
                                animate="enter"
                                onClick={() => onRowClick?.(item)}
                                className={cn(
                                    'border-b border-border-glass/50 last:border-b-0 transition-colors duration-200',
                                    onRowClick && 'cursor-pointer hover:bg-surface-hover'
                                )}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className={cn('px-5 py-3.5 text-sm text-text-primary', col.className)}>
                                        {col.render ? col.render(item, idx) : String((item as Record<string, unknown>)[col.key] ?? '')}
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Pagination ───
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <Button variant="ghost" size="icon" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
                <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm text-text-secondary font-medium">
                {currentPage} / {totalPages}
            </span>
            <Button variant="ghost" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
