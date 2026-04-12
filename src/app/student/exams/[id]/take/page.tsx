'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Copy, Loader2, Lock, Send, Shield } from 'lucide-react';
import { Button, Card, InlineState, Input, PageHeader, StatusBadge } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/cn';
import {
    getAttempt,
    getAvailableSessions,
    logAttemptEvent,
    saveAttemptAnswer,
    startAttempt,
    submitAttempt,
    toStatusKey,
    type AttemptDetailDto,
    type AttemptSummaryDto,
    type AvailableSessionDto,
} from '@/lib/api/exam-guard';
import { formatDateTime } from '@/lib/utils';

type EventName = 'TabLeave' | 'TabReturn' | 'PageReload' | 'CopyAttempt' | 'PasteAttempt' | 'RightClick';

export default function ExamTakePage() {
    const { request } = useAuth();
    const { toast } = useToast();
    const params = useParams<{ id: string }>();
    const sessionId = params.id;

    const [session, setSession] = useState<AvailableSessionDto | null>(null);
    const [detail, setDetail] = useState<AttemptDetailDto | null>(null);
    const [submitted, setSubmitted] = useState<AttemptSummaryDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [autoSaved, setAutoSaved] = useState(false);
    const [nowMs, setNowMs] = useState(Date.now());

    const saveBadgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reloadLoggedRef = useRef(false);

    const attemptId = detail?.attempt.id;
    const questions = detail?.questions ?? [];
    const currentQuestion = questions[questionIndex];
    const answeredCount = questions.filter((item) => !!item.selectedOptionSnapshotId).length;
    const expiresAt = detail?.attempt.expiresAt ?? submitted?.expiresAt;
    const timeLeftSeconds = expiresAt ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - nowMs) / 1000)) : 0;

    const syncSummary = useCallback((summary: AttemptSummaryDto) => {
        setDetail((current) => current ? { ...current, attempt: summary } : current);
        if (toStatusKey(summary.status) !== 'in_progress') {
            setSubmitted(summary);
        }
    }, []);

    const showSaved = useCallback(() => {
        setAutoSaved(true);
        if (saveBadgeTimeoutRef.current) {
            clearTimeout(saveBadgeTimeoutRef.current);
        }
        saveBadgeTimeoutRef.current = setTimeout(() => setAutoSaved(false), 1500);
    }, []);

    const logEvent = useCallback(async (eventType: EventName, details?: string) => {
        if (!attemptId || submitted) {
            return;
        }

        try {
            const result = await logAttemptEvent(request, attemptId, {
                eventType,
                details,
                clientTimestamp: new Date().toISOString(),
            });
            syncSummary(result.attempt);
            setDetail((current) => current ? { ...current, recentEvents: result.recentEvents } : current);
            if (result.autoSubmitted) {
                toast({ type: 'warning', title: 'Attempt da bi auto-submit', message: result.attempt.flagReason || undefined });
            }
        } catch {
            // event logging should not block the exam screen
        }
    }, [attemptId, request, submitted, syncSummary, toast]);

    const boot = useCallback(async (providedPassword?: string) => {
        setLoading(true);
        setError(null);
        setPasswordError(null);

        try {
            const sessions = await getAvailableSessions(request);
            const matched = sessions.find((item) => item.sessionId === sessionId);
            if (!matched) {
                throw new Error('Session khong ton tai hoac khong con kha dung.');
            }

            setSession(matched);

            if (matched.attemptId && toStatusKey(matched.attemptStatus) === 'in_progress') {
                const existing = await getAttempt(request, matched.attemptId);
                setDetail(existing);
                if (toStatusKey(existing.attempt.status) !== 'in_progress') {
                    setSubmitted(existing.attempt);
                }
                return;
            }

            if (toStatusKey(matched.status) !== 'active') {
                return;
            }

            if (matched.requiresPassword && !providedPassword) {
                return;
            }

            const started = await startAttempt(request, sessionId, providedPassword);
            setDetail(started);
            if (toStatusKey(started.attempt.status) !== 'in_progress') {
                setSubmitted(started.attempt);
            }
        } catch (bootError) {
            const message = bootError instanceof Error ? bootError.message : 'Khong the khoi tao phien thi.';
            if ((session?.requiresPassword || message.toLowerCase().includes('password')) && !detail) {
                setPasswordError(message);
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    }, [detail, request, session?.requiresPassword, sessionId]);

    useEffect(() => {
        if (sessionId) {
            void boot();
        }
    }, [boot, sessionId]);

    useEffect(() => {
        if (submitted) {
            return;
        }

        const timer = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [submitted]);

    useEffect(() => {
        if (!detail || submitted || timeLeftSeconds > 0) {
            return;
        }

        setSubmitting(true);
        void submitAttempt(request, detail.attempt.id, 'Auto', new Date().toISOString())
            .then((result) => {
                setSubmitted(result);
                syncSummary(result);
            })
            .catch((submitError) => {
                toast({ type: 'error', title: 'Auto-submit that bai', message: submitError instanceof Error ? submitError.message : undefined });
            })
            .finally(() => setSubmitting(false));
    }, [detail, request, submitted, syncSummary, timeLeftSeconds, toast]);

    useEffect(() => {
        if (!attemptId || submitted || reloadLoggedRef.current) {
            return;
        }

        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        if (navEntry?.type === 'reload') {
            reloadLoggedRef.current = true;
            void logEvent('PageReload', 'Browser reload detected');
        }
    }, [attemptId, logEvent, submitted]);

    useEffect(() => {
        if (!attemptId || submitted) {
            return;
        }

        const handleVisibility = () => {
            void logEvent(document.hidden ? 'TabLeave' : 'TabReturn', document.hidden ? 'Document hidden' : 'Returned to exam tab');
        };
        const handleCopy = (event: Event) => { event.preventDefault(); void logEvent('CopyAttempt', 'Copy blocked'); };
        const handlePaste = (event: Event) => { event.preventDefault(); void logEvent('PasteAttempt', 'Paste blocked'); };
        const handleContextMenu = (event: Event) => { event.preventDefault(); void logEvent('RightClick', 'Context menu blocked'); };

        document.addEventListener('visibilitychange', handleVisibility);
        if (!detail?.policy.allowCopyPaste) {
            document.addEventListener('copy', handleCopy);
            document.addEventListener('paste', handlePaste);
            document.addEventListener('contextmenu', handleContextMenu);
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [attemptId, detail?.policy.allowCopyPaste, logEvent, submitted]);

    const selectAnswer = useCallback(async (questionId: string, optionId: string) => {
        if (!detail) {
            return;
        }

        setSaving(true);
        setDetail((current) => current ? {
            ...current,
            questions: current.questions.map((question) => question.id === questionId ? { ...question, selectedOptionSnapshotId: optionId } : question),
        } : current);

        try {
            const result = await saveAttemptAnswer(request, detail.attempt.id, questionId, optionId, new Date().toISOString());
            setDetail((current) => current ? {
                ...current,
                attempt: { ...current.attempt, answeredQuestions: result.answeredQuestions },
            } : current);
            showSaved();
        } catch (saveError) {
            toast({ type: 'error', title: 'Luu dap an that bai', message: saveError instanceof Error ? saveError.message : undefined });
        } finally {
            setSaving(false);
        }
    }, [detail, request, showSaved, toast]);

    const handleSubmit = useCallback(async () => {
        if (!detail) {
            return;
        }

        setSubmitting(true);
        try {
            const result = await submitAttempt(request, detail.attempt.id, 'Manual', new Date().toISOString());
            setSubmitted(result);
            syncSummary(result);
            toast({ type: 'success', title: 'Da nop bai thanh cong' });
        } catch (submitError) {
            toast({ type: 'error', title: 'Nop bai that bai', message: submitError instanceof Error ? submitError.message : undefined });
        } finally {
            setSubmitting(false);
        }
    }, [detail, request, syncSummary, toast]);

    if (error && !detail && !submitted) {
        return (
            <InlineState
                icon={<AlertCircle className="h-10 w-10" />}
                title="Khong the mo phien thi"
                description={error}
                actions={<Link href="/student/exams"><Button variant="secondary">Quay lai</Button></Link>}
            />
        );
    }

    if (loading && !detail && !submitted) {
        return <InlineState title="Dang khoi tao phien thi" description="ExamGuard dang tai session va snapshot de thi that." />;
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
                <Card className="w-full max-w-xl text-center">
                    <div className="flex flex-col items-center gap-4">
                        <CheckCircle2 className="h-12 w-12 text-success" />
                        <h1 className="text-2xl font-bold text-text-primary">Da nop bai</h1>
                        <p className="text-sm text-text-muted">
                            {submitted.examTitle} · {submitted.submittedAt ? formatDateTime(submitted.submittedAt) : 'vua xong'}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                            <div className="glass-card rounded-[var(--radius-lg)] p-3"><p className="text-xl font-bold">{submitted.answeredQuestions}</p><p className="text-xs text-text-muted">Da tra loi</p></div>
                            <div className="glass-card rounded-[var(--radius-lg)] p-3"><p className="text-xl font-bold">{submitted.totalQuestions - submitted.answeredQuestions}</p><p className="text-xs text-text-muted">Bo trong</p></div>
                            <div className="glass-card rounded-[var(--radius-lg)] p-3"><p className="text-xl font-bold">{submitted.correctAnswers ?? '—'}</p><p className="text-xs text-text-muted">Dung</p></div>
                            <div className="glass-card rounded-[var(--radius-lg)] p-3"><p className="text-xl font-bold">{submitted.score ?? '—'}</p><p className="text-xs text-text-muted">Diem</p></div>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/student/history"><Button variant="secondary">Lich su</Button></Link>
                            <Link href="/student/dashboard"><Button>Dashboard</Button></Link>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (session?.requiresPassword && !detail) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
                <Card className="w-full max-w-md">
                    <div className="space-y-4">
                        <PageHeader title={session.examTitle} description={session.sessionName} />
                        <Input
                            label="Mat khau session"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            error={passwordError ?? undefined}
                            placeholder="Nhap mat khau de vao thi"
                        />
                        <div className="flex justify-end gap-2">
                            <Link href="/student/exams"><Button variant="ghost">Huy</Button></Link>
                            <Button onClick={() => void boot(password)}><Lock className="h-4 w-4" />Bat dau</Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (session && toStatusKey(session.status) !== 'active' && !detail) {
        return (
            <InlineState
                icon={<Clock className="h-10 w-10" />}
                title="Session chua den gio"
                description={`${session.sessionName} mo luc ${formatDateTime(session.startTime)}.`}
                actions={<Link href="/student/exams"><Button variant="secondary">Quay lai</Button></Link>}
            />
        );
    }

    if (!detail || !currentQuestion) {
        return <InlineState title="Khong co cau hoi" description="Backend khong tra ve snapshot cau hoi cho attempt nay." />;
    }

    const questionButtons = questions.map((question, index) => (
        <button
            key={question.id}
            onClick={() => setQuestionIndex(index)}
            className={cn(
                'w-10 h-10 rounded-[var(--radius-sm)] text-xs font-semibold border cursor-pointer',
                index === questionIndex
                    ? 'bg-accent/20 text-accent-light border-accent/30'
                    : question.selectedOptionSnapshotId
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-surface-glass text-text-muted border-border-glass',
            )}
        >
            {index + 1}
        </button>
    ));

    return (
        <div className="min-h-screen bg-bg-primary p-4 md:p-6">
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="glass-heavy rounded-[var(--radius-xl)] p-4 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-bold text-text-primary">{session?.examTitle || detail.attempt.examTitle}</h1>
                        <p className="text-xs text-text-muted">Bat dau {formatDateTime(detail.attempt.startedAt)} · Het han {formatDateTime(detail.attempt.expiresAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {autoSaved && <span className="text-xs text-success">Da luu</span>}
                        {saving && <Loader2 className="h-4 w-4 animate-spin text-text-muted" />}
                        <StatusBadge status={toStatusKey(detail.attempt.status)} />
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-accent/20 font-mono font-bold">
                            <Clock className="h-4 w-4 text-accent-light" />
                            {String(Math.floor(timeLeftSeconds / 60)).padStart(2, '0')}:{String(timeLeftSeconds % 60).padStart(2, '0')}
                        </div>
                        <Button onClick={() => {
                            if (window.confirm(`Nop bai voi ${answeredCount}/${questions.length} cau da tra loi?`)) {
                                void handleSubmit();
                            }
                        }} disabled={submitting}>
                            <Send className="h-4 w-4" />Nop bai
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4">
                    <Card>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Tien do</p>
                                <p className="text-sm text-text-primary mt-1">{answeredCount}/{questions.length} cau da tra loi</p>
                            </div>
                            <div className="grid grid-cols-5 gap-2">{questionButtons}</div>
                        </div>
                    </Card>

                    <Card>
                        <div className="space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-accent-light uppercase tracking-wider">Cau {questionIndex + 1}</p>
                                    <h2 className="text-lg font-bold text-text-primary mt-2">{currentQuestion.content}</h2>
                                </div>
                                <div className="text-xs text-text-muted text-right">
                                    <div>{detail.attempt.answeredQuestions}/{detail.attempt.totalQuestions}</div>
                                    <div>{progressPercent(detail.attempt.answeredQuestions, detail.attempt.totalQuestions)}%</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {currentQuestion.options.map((option) => {
                                    const selected = currentQuestion.selectedOptionSnapshotId === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => void selectAnswer(currentQuestion.id, option.id)}
                                            className={cn(
                                                'w-full flex items-start gap-4 p-4 rounded-[var(--radius-lg)] text-left transition-all border cursor-pointer',
                                                selected ? 'glass-card border-accent/30 bg-accent/8' : 'bg-surface-glass border-border-glass hover:bg-surface-hover',
                                            )}
                                        >
                                            <div className={cn('w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center text-xs font-bold shrink-0 border', selected ? 'bg-accent/20 text-accent-light border-accent/30' : 'bg-bg-tertiary text-text-muted border-border-glass')}>
                                                {option.label}
                                            </div>
                                            <span className={cn('text-sm leading-relaxed pt-1', selected ? 'text-text-primary font-medium' : 'text-text-secondary')}>
                                                {option.content}
                                            </span>
                                            {selected && <CheckCircle2 className="h-5 w-5 text-accent-light ml-auto shrink-0 mt-1" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border-glass">
                                <Button variant="outline" disabled={questionIndex === 0} onClick={() => setQuestionIndex((value) => value - 1)}>
                                    <ChevronLeft className="h-4 w-4" />Cau truoc
                                </Button>
                                <div className="text-xs text-text-muted">
                                    <Shield className="h-3 w-3 inline-block mr-1 text-accent-light" />
                                    Tab switch: {detail.attempt.tabSwitchCount} · Reload: {detail.attempt.reloadCount}
                                </div>
                                <Button variant="outline" disabled={questionIndex === questions.length - 1} onClick={() => setQuestionIndex((value) => value + 1)}>
                                    Cau sau<ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-text-primary">Anti-cheat policy</p>
                            <p className="text-xs text-text-muted">
                                Max tab switch: {detail.policy.maxTabSwitches} · Auto submit: {detail.policy.autoSubmitOnTabLimit ? 'Co' : 'Khong'} · Copy/paste: {detail.policy.allowCopyPaste ? 'Cho phep' : 'Chan'}
                            </p>
                        </div>
                        <div className="text-xs text-text-muted flex items-center gap-2">
                            <Copy className="h-3 w-3" />
                            Recent event: {detail.recentEvents.at(-1)?.eventType || 'ExamStart'}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function progressPercent(answeredQuestions: number, totalQuestions: number) {
    if (totalQuestions === 0) {
        return 0;
    }
    return Math.round((answeredQuestions / totalQuestions) * 100);
}
