'use client';

import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { X } from 'lucide-react';
import { Button } from './button';

// ─── Modal (Glass Overlay) ───
interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [open]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (open) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(4px)' }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className={cn(
                            'relative w-full rounded-[var(--radius-xl)]',
                            'glass-heavy shadow-xl',
                            'border border-border-glass-strong',
                            sizes[size],
                        )}
                    >
                        {/* Gradient border shimmer */}
                        <div className="absolute inset-0 rounded-[var(--radius-xl)] pointer-events-none">
                            <div className="absolute -inset-[1px] rounded-[var(--radius-xl)] bg-gradient-to-br from-accent/20 via-transparent to-accent-cyan/10 opacity-40" />
                        </div>
                        <div className="relative z-10">
                            {(title || description) && (
                                <div className="flex items-start justify-between p-6 pb-0">
                                    <div>
                                        {title && <h3 className="text-lg font-bold text-text-primary tracking-tight">{title}</h3>}
                                        {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mr-2 -mt-2">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <div className="p-6">{children}</div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// ─── Confirm Dialog ───
interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Xác nhận', cancelText = 'Hủy' }: ConfirmDialogProps) {
    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
            <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
            <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={onClose}>{cancelText}</Button>
                <Button variant="danger" onClick={onConfirm}>{confirmText}</Button>
            </div>
        </Modal>
    );
}

// ─── Drawer ───
interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    side?: 'right' | 'left';
}

export function Drawer({ open, onClose, title, children, side = 'right' }: DrawerProps) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[var(--z-modal)]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: side === 'right' ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: side === 'right' ? '100%' : '-100%' }}
                        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                        className={cn(
                            'absolute top-0 bottom-0 w-full max-w-md',
                            'glass-heavy border-border-glass-strong',
                            side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
                        )}
                    >
                        <div className="flex items-center justify-between p-5 border-b border-border-glass">
                            <h3 className="text-base font-bold text-text-primary">{title}</h3>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-5 overflow-y-auto h-[calc(100%-60px)]">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
