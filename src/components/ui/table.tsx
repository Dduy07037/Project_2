'use client';

import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { staggerListItem } from '@/lib/motion';
import { Button } from './button';

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
  getRowId?: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

function resolveRowId<T>(
  item: T,
  index: number,
  keyField: string,
  getRowId?: (item: T, index: number) => string,
) {
  const explicitId = getRowId?.(item, index);
  if (explicitId && explicitId.trim().length > 0) {
    return explicitId;
  }

  const keyValue = (item as Record<string, unknown>)[keyField];
  if (keyValue === null || keyValue === undefined || keyValue === '') {
    return `row-${index}`;
  }

  if (typeof keyValue === 'string') {
    return keyValue.trim().length > 0 ? keyValue : `row-${index}`;
  }

  if (
    typeof keyValue === 'number'
    || typeof keyValue === 'bigint'
    || typeof keyValue === 'boolean'
  ) {
    return String(keyValue);
  }

  return `row-${index}`;
}

export function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  getRowId,
  onRowClick,
  className,
  emptyMessage = 'Không có dữ liệu',
  loading,
}: DataTableProps<T>) {
  const columnCount = columns.length;

  return (
    <div
      className={cn(
        'surface-card overflow-hidden rounded-[var(--radius-lg)]',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-bg-tertiary">
            <tr className="border-b border-border-subtle">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-5 py-3 text-left text-[11px] font-medium text-text-muted',
                    column.className,
                  )}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr
                    key={`loading-${rowIndex}`}
                    className="border-b border-border-subtle last:border-b-0"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-5 py-4">
                        <div className="skeleton h-4 w-3/4 rounded-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
                ? (
                    <tr>
                      <td
                        colSpan={columnCount}
                        className="px-5 py-14 text-center text-sm text-text-muted"
                      >
                        {emptyMessage}
                      </td>
                    </tr>
                  )
                : data.map((item, index) => (
                    <motion.tr
                      key={resolveRowId(item, index, keyField, getRowId)}
                      variants={staggerListItem}
                      initial="initial"
                      animate="enter"
                      onClick={() => onRowClick?.(item)}
                      className={cn(
                        'border-b border-border-subtle last:border-b-0',
                        'transition-colors duration-[var(--duration-normal)]',
                        onRowClick && 'cursor-pointer hover:bg-surface-hover',
                      )}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn('px-5 py-4 text-sm text-text-primary', column.className)}
                        >
                          {column.render
                            ? column.render(item, index)
                            : String((item as Record<string, unknown>)[column.key] ?? '')}
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

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="px-2 text-sm text-text-secondary">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
