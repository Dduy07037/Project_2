'use client';

import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { scaleFadeVariants, slideRightVariants } from '@/lib/motion';
import { Button } from './button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return undefined;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
  };

  const hasHeader = Boolean(title || description);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            variants={scaleFadeVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className={cn(
              'surface-panel relative z-10 my-auto flex w-full max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] sm:max-h-[calc(100vh-3rem)]',
              sizes[size],
            )}
          >
            {hasHeader && (
              <div className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 border-b border-border-subtle bg-bg-primary px-6 py-5">
                <div className="space-y-1">
                  {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
                  {description && <p className="text-sm text-text-muted">{description}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="-mr-2 -mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className={cn('min-h-0 overflow-y-auto p-6', !hasHeader && 'pt-5')}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xac nhan',
  cancelText = 'Hủy',
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm leading-relaxed text-text-secondary">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'right' | 'left';
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
}: DrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-modal)]">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            variants={slideRightVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className={cn(
              'surface-panel absolute top-0 bottom-0 w-full max-w-md',
              side === 'right' ? 'right-0' : 'left-0',
            )}
            style={side === 'left' ? { transformOrigin: 'left center' } : undefined}
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
              <h3 className="text-base font-semibold text-text-primary">{title}</h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[calc(100%-65px)] overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
