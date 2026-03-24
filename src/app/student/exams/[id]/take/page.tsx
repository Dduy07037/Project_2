'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Button, Badge, Card } from '@/components/ui';
import { staggerContainer, staggerItem, scaleFadeVariants } from '@/lib/motion';
import { mockQuestions } from '@/lib/mock-data';
import {
    Clock, Flag, ChevronLeft, ChevronRight, Send, Save,
    AlertTriangle, CheckCircle2, BookOpen, Eye, EyeOff,
    LayoutGrid, X, Shield, Zap
} from 'lucide-react';

export default function ExamTakePage() {
    const questions = mockQuestions.slice(0, 10);
    const totalTime = 30 * 60;

    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    const [timeLeft, setTimeLeft] = useState(totalTime);
    const [showNav, setShowNav] = useState(true);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [autoSaved, setAutoSaved] = useState(false);

    // Timer
    useEffect(() => {
        if (submitted) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) { setSubmitted(true); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [submitted]);

    // Tab switch detection
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) {
                setTabSwitchCount(prev => prev + 1);
                setShowTabWarning(true);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    // Prevent copy/paste
    useEffect(() => {
        const prevent = (e: Event) => e.preventDefault();
        document.addEventListener('copy', prevent);
        document.addEventListener('paste', prevent);
        document.addEventListener('contextmenu', prevent);
        return () => {
            document.removeEventListener('copy', prevent);
            document.removeEventListener('paste', prevent);
            document.removeEventListener('contextmenu', prevent);
        };
    }, []);

    // Auto-save indicator
    useEffect(() => {
        if (Object.keys(answers).length === 0) return;
        setAutoSaved(true);
        const t = setTimeout(() => setAutoSaved(false), 2000);
        return () => clearTimeout(t);
    }, [answers]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timePercent = timeLeft / totalTime;
    const isWarning = timePercent <= 0.25 && timePercent > 0.08;
    const isCritical = timePercent <= 0.08;

    const answeredCount = Object.keys(answers).length;
    const progressPercent = (answeredCount / questions.length) * 100;

    const selectAnswer = useCallback((qIdx: number, optId: string) => {
        setAnswers(prev => ({ ...prev, [qIdx]: optId }));
    }, []);

    const toggleFlag = useCallback((qIdx: number) => {
        setFlagged(prev => {
            const next = new Set(prev);
            next.has(qIdx) ? next.delete(qIdx) : next.add(qIdx);
            return next;
        });
    }, []);

    if (submitted) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-bg-primary z-50">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="ambient-orb ambient-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-20" />
                    <div className="ambient-orb ambient-orb-cyan w-[400px] h-[400px] bottom-1/4 right-1/4 opacity-15" style={{ animationDelay: '2s' }} />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                    className="relative glassmorphism glass-heavy rounded-[var(--radius-2xl)] p-10 max-w-md w-full mx-4 text-center border border-border-glass-strong shadow-xl"
                >
                    <div className="absolute -inset-[1px] rounded-[var(--radius-2xl)] bg-gradient-to-br from-accent/20 via-transparent to-accent-cyan/15 opacity-50 pointer-events-none" />
                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
                            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-success/20 to-accent-emerald-glow flex items-center justify-center mb-6 glow-success"
                        >
                            <CheckCircle2 className="h-10 w-10 text-success" />
                        </motion.div>
                        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Đã nộp bài!</h2>
                        <p className="text-sm text-text-muted mt-2">Kết quả sẽ được công bố sau khi kỳ thi kết thúc.</p>
                        <div className="grid grid-cols-3 gap-3 mt-8">
                            <div className="glass-card rounded-[var(--radius-lg)] p-3">
                                <p className="text-2xl font-bold text-accent-light">{answeredCount}</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Đã trả lời</p>
                            </div>
                            <div className="glass-card rounded-[var(--radius-lg)] p-3">
                                <p className="text-2xl font-bold text-accent-cyan">{questions.length - answeredCount}</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Bỏ trống</p>
                            </div>
                            <div className="glass-card rounded-[var(--radius-lg)] p-3">
                                <p className="text-2xl font-bold text-warning">{flagged.size}</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">Đã đánh dấu</p>
                            </div>
                        </div>
                        <Button className="w-full mt-8" onClick={() => window.location.href = '/student/dashboard'} glow>
                            Về trang chính
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const question = questions[currentQ];

    return (
        <div className="fixed inset-0 flex bg-bg-primary overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="ambient-orb ambient-orb-purple w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
                <div className="ambient-orb ambient-orb-cyan w-[300px] h-[300px] bottom-0 right-0 opacity-10" style={{ animationDelay: '3s' }} />
            </div>

            {/* Tab Warning Overlay */}
            <AnimatePresence>
                {showTabWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, filter: 'blur(8px)' }}
                            animate={{ scale: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ scale: 0.95, y: 10, filter: 'blur(4px)' }}
                            className="glass-heavy rounded-[var(--radius-2xl)] p-8 max-w-sm w-full mx-4 text-center border border-danger/30 glow-danger"
                        >
                            <AlertTriangle className="h-14 w-14 text-danger mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-text-primary">Cảnh báo rời trang!</h3>
                            <p className="text-sm text-text-muted mt-2">
                                Bạn đã rời khỏi trang thi <span className="text-danger font-bold">{tabSwitchCount}</span> lần.
                                Hành vi này sẽ được ghi nhận.
                            </p>
                            {tabSwitchCount >= 3 && (
                                <p className="text-xs text-danger mt-3 font-semibold">
                                    Vượt quá 5 lần rời tab sẽ tự động nộp bài!
                                </p>
                            )}
                            <Button className="w-full mt-6" onClick={() => setShowTabWarning(false)}>
                                Tiếp tục làm bài
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit Confirmation */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, filter: 'blur(8px)' }}
                            animate={{ scale: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ scale: 0.95, y: 10, filter: 'blur(4px)' }}
                            className="glass-heavy rounded-[var(--radius-2xl)] p-8 max-w-sm mx-4 border border-border-glass-strong"
                        >
                            <h3 className="text-lg font-bold text-text-primary">Xác nhận nộp bài?</h3>
                            <div className="mt-4 space-y-2 text-sm text-text-secondary">
                                <p>Đã trả lời: <span className="text-accent-light font-bold">{answeredCount}/{questions.length}</span></p>
                                <p>Bỏ trống: <span className="text-warning font-bold">{questions.length - answeredCount}</span></p>
                                <p>Đánh dấu: <span className="text-accent-cyan font-bold">{flagged.size}</span></p>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Quay lại</Button>
                                <Button variant="primary" className="flex-1" onClick={() => { setSubmitted(true); setShowConfirm(false); }} glow>Nộp bài</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Question Navigator Sidebar */}
            <AnimatePresence>
                {showNav && (
                    <motion.aside
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                        className="w-[260px] shrink-0 glass-heavy border-r border-border-glass flex flex-col relative z-20"
                    >
                        <div className="p-4 border-b border-border-glass">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Câu hỏi</h3>
                                <button onClick={() => setShowNav(false)} className="text-text-muted hover:text-text-primary cursor-pointer p-1"><X className="h-3.5 w-3.5" /></button>
                            </div>
                            {/* Progress bar */}
                            <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-cyan"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    style={{ boxShadow: '0 0 8px rgba(139, 92, 246, 0.3)' }}
                                />
                            </div>
                            <p className="text-[10px] text-text-muted mt-1.5">{answeredCount}/{questions.length} đã trả lời</p>
                        </div>

                        <div className="p-3 flex-1 overflow-y-auto">
                            <div className="grid grid-cols-5 gap-1.5">
                                {questions.map((_, idx) => {
                                    const isAnswered = answers[idx] !== undefined;
                                    const isFlagged = flagged.has(idx);
                                    const isCurrent = idx === currentQ;
                                    return (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setCurrentQ(idx)}
                                            className={cn(
                                                'w-full aspect-square rounded-[var(--radius-sm)] text-xs font-bold transition-all duration-200 cursor-pointer border',
                                                isCurrent
                                                    ? 'bg-accent/20 text-accent-light border-accent/40 glow-accent'
                                                    : isAnswered
                                                        ? 'bg-success/12 text-success border-success/20'
                                                        : 'bg-surface-glass text-text-muted border-border-glass hover:border-border-hover hover:bg-surface-hover',
                                                isFlagged && 'ring-2 ring-warning/40 ring-offset-1 ring-offset-transparent'
                                            )}
                                        >
                                            {idx + 1}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="p-3 border-t border-border-glass space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] text-text-muted">
                                <div className="w-3 h-3 rounded-[3px] bg-accent/20 border border-accent/40" /> Đang xem
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-text-muted">
                                <div className="w-3 h-3 rounded-[3px] bg-success/12 border border-success/20" /> Đã trả lời
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-text-muted">
                                <div className="w-3 h-3 rounded-[3px] bg-surface-glass border border-border-glass ring-2 ring-warning/40" /> Đánh dấu
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                {/* Header */}
                <header className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-border-glass/50 glass-heavy">
                    <div className="flex items-center gap-3">
                        {!showNav && (
                            <Button variant="ghost" size="icon" onClick={() => setShowNav(true)}>
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        )}
                        <div>
                            <h1 className="text-sm font-bold text-text-primary">Kiểm tra giữa kỳ — Cơ sở dữ liệu</h1>
                            <p className="text-[10px] text-text-muted">Câu {currentQ + 1} / {questions.length}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Auto-save indicator */}
                        <AnimatePresence>
                            {autoSaved && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center gap-1.5 text-[10px] text-success font-medium"
                                >
                                    <CheckCircle2 className="h-3 w-3" /> Đã lưu
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Tab switch counter */}
                        {tabSwitchCount > 0 && (
                            <Badge variant="danger" size="sm">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Rời tab: {tabSwitchCount}
                            </Badge>
                        )}

                        {/* ★ TIMER — Visual Centerpiece ★ */}
                        <motion.div
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-[var(--radius-full)] glass-card border font-mono text-base font-bold tracking-wider',
                                isCritical
                                    ? 'timer-urgent border-danger/40'
                                    : isWarning
                                        ? 'timer-warning border-warning/30'
                                        : 'border-accent/20 text-accent-light'
                            )}
                            animate={isCritical ? {
                                boxShadow: [
                                    '0 0 20px rgba(248, 113, 113, 0.2)',
                                    '0 0 40px rgba(248, 113, 113, 0.5)',
                                    '0 0 20px rgba(248, 113, 113, 0.2)',
                                ],
                            } : isWarning ? {
                                boxShadow: [
                                    '0 0 16px rgba(251, 191, 36, 0.15)',
                                    '0 0 28px rgba(251, 191, 36, 0.3)',
                                    '0 0 16px rgba(251, 191, 36, 0.15)',
                                ],
                            } : {}}
                            transition={isCritical || isWarning ? { duration: isCritical ? 0.8 : 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
                        >
                            <Clock className={cn('h-4 w-4', isCritical ? 'text-danger' : isWarning ? 'text-warning' : 'text-accent-light')} />
                            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                        </motion.div>

                        <Button variant="primary" size="sm" onClick={() => setShowConfirm(true)} icon={<Send className="h-3.5 w-3.5" />} glow>
                            Nộp bài
                        </Button>
                    </div>
                </header>

                {/* Question Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQ}
                                initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="space-y-6"
                            >
                                {/* Question Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[11px] font-bold text-accent-light uppercase tracking-widest">
                                                Câu {currentQ + 1}
                                            </span>
                                            <Badge variant={
                                                question.difficulty === 'hard' ? 'danger' :
                                                    question.difficulty === 'medium' ? 'warning' : 'success'
                                            } size="sm">{question.difficulty === 'hard' ? 'Khó' : question.difficulty === 'medium' ? 'TB' : 'Dễ'}</Badge>
                                        </div>
                                        <h2 className="text-lg font-bold text-text-primary leading-relaxed tracking-tight">
                                            {question.content}
                                        </h2>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleFlag(currentQ)}
                                        className={cn(flagged.has(currentQ) && 'text-warning bg-warning/10 border border-warning/20')}
                                    >
                                        <Flag className={cn('h-4 w-4', flagged.has(currentQ) && 'fill-warning')} />
                                    </Button>
                                </div>

                                {/* Answer Options */}
                                <div className="space-y-3">
                                    {question.options.map((opt, i) => {
                                        const isSelected = answers[currentQ] === opt.id;
                                        const labels = ['A', 'B', 'C', 'D'];
                                        return (
                                            <motion.button
                                                key={opt.id}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.06, duration: 0.3 }}
                                                whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => selectAnswer(currentQ, opt.id)}
                                                className={cn(
                                                    'w-full flex items-start gap-4 p-4 rounded-[var(--radius-lg)] text-left transition-all duration-200 cursor-pointer',
                                                    'border',
                                                    isSelected
                                                        ? 'glass-card border-accent/30 bg-accent/8 glow-accent'
                                                        : 'bg-surface-glass border-border-glass hover:border-border-hover hover:bg-surface-hover'
                                                )}
                                            >
                                                <div className={cn(
                                                    'w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-xs font-bold shrink-0 border transition-all',
                                                    isSelected
                                                        ? 'bg-accent/20 text-accent-light border-accent/30'
                                                        : 'bg-bg-tertiary text-text-muted border-border-glass'
                                                )}>
                                                    {labels[i]}
                                                </div>
                                                <span className={cn(
                                                    'text-sm leading-relaxed pt-1',
                                                    isSelected ? 'text-text-primary font-medium' : 'text-text-secondary'
                                                )}>
                                                    {opt.content}
                                                </span>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                                        className="ml-auto shrink-0 mt-1"
                                                    >
                                                        <CheckCircle2 className="h-5 w-5 text-accent-light" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer Nav */}
                <footer className="h-16 shrink-0 flex items-center justify-between px-5 border-t border-border-glass/50 glass-heavy">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentQ === 0}
                        onClick={() => setCurrentQ(prev => prev - 1)}
                        icon={<ChevronLeft className="h-4 w-4" />}
                    >
                        Câu trước
                    </Button>
                    <div className="text-xs text-text-muted">
                        <Shield className="h-3 w-3 inline-block mr-1 text-accent-light" />
                        ExamGuard đang bảo vệ phiên thi
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentQ === questions.length - 1}
                        onClick={() => setCurrentQ(prev => prev + 1)}
                        iconRight={<ChevronRight className="h-4 w-4" />}
                    >
                        Câu sau
                    </Button>
                </footer>
            </div>
        </div>
    );
}
