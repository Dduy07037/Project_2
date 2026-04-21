'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { toastVariants } from '@/lib/motion';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  error: <AlertCircle className="h-4 w-4 text-danger" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  info: <Info className="h-4 w-4 text-info" />,
};

const accentStyles: Record<ToastType, string> = {
  success: 'border-success/20 bg-success/8',
  error: 'border-danger/20 bg-danger/8',
  warning: 'border-warning/20 bg-warning/8',
  info: 'border-info/20 bg-info/8',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((current) => [...current, { ...toast, id }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, toast.duration ?? 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed right-4 bottom-4 z-[var(--z-toast)] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              variants={toastVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="surface-panel flex items-start gap-3 rounded-[var(--radius-lg)] border border-border p-3"
            >
              <div
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                  accentStyles[toast.type],
                )}
              >
                {icons[toast.type]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{toast.title}</p>
                {toast.message && <p className="mt-1 text-xs text-text-muted">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-full p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
