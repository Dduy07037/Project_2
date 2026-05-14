'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Send,
  Shield,
} from 'lucide-react';
import { Badge, Button, Card, InlineState, Input, Modal } from '@/components/ui';
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
  type AttemptEventResultDto,
  type AttemptSummaryDto,
  type AvailableSessionDto,
} from '@/lib/api/exam-guard';
import {
  getAttemptEventDescription,
  getAttemptEventMeta,
  getAttemptStatusMeta,
  getFlagReasonLabels,
} from '@/lib/exam-guard-labels';
import { formatDateTime } from '@/lib/utils';

type EventName =
  | 'TabLeave'
  | 'TabReturn'
  | 'PageReload'
  | 'CopyAttempt'
  | 'PasteAttempt'
  | 'RightClick'
  | 'ResumeAttempt';

export default function ExamTakePage() {
  const { request } = useAuth();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const router = useRouter();
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
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [autoSubmitNotice, setAutoSubmitNotice] = useState<{ title: string; message: string } | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());

  const saveBadgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reloadLoggedRef = useRef(false);
  const resumeLoggedRef = useRef(false);
  const resumedAttemptRef = useRef(false);
  const navigationMarkerRef = useRef('');

  const attemptId = detail?.attempt.id;
  const questions = detail?.questions ?? [];
  const currentQuestion = questions[questionIndex];
  const answeredCount = questions.filter((item) => !!item.selectedOptionSnapshotId).length;
  const unansweredCount = Math.max(questions.length - answeredCount, 0);
  const expiresAt = detail?.attempt.expiresAt ?? submitted?.expiresAt;
  const timeLeftSeconds = expiresAt
    ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - nowMs) / 1000))
    : 0;
  const timerClassName =
    timeLeftSeconds <= 300 ? 'timer-urgent' : timeLeftSeconds <= 600 ? 'timer-warning' : '';
  const activeSummary = submitted ?? detail?.attempt ?? null;
  const attemptStatusMeta = getAttemptStatusMeta(activeSummary?.status);
  const flagLabels = getFlagReasonLabels(activeSummary?.flagReason);
  const recentEvents = detail?.recentEvents.slice(-5) ?? [];

  useEffect(() => {
    if (!navigationMarkerRef.current && typeof window !== 'undefined') {
      navigationMarkerRef.current = `${window.location.pathname}:${window.performance.timeOrigin}`;
    }
  }, []);

  useEffect(() => () => {
    if (saveBadgeTimeoutRef.current) {
      clearTimeout(saveBadgeTimeoutRef.current);
    }
  }, []);

  const syncSummary = useCallback((summary: AttemptSummaryDto) => {
    setDetail((current) => (current ? { ...current, attempt: summary } : current));
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

  const logEvent = useCallback(
    async (eventType: EventName, eventDetails?: string): Promise<AttemptEventResultDto | null> => {
      if (!attemptId || submitted) {
        return null;
      }

      try {
        const result = await logAttemptEvent(request, attemptId, {
          eventType,
          details: eventDetails,
          clientTimestamp: new Date().toISOString(),
        });

        syncSummary(result.attempt);
        setDetail((current) => (current ? { ...current, recentEvents: result.recentEvents } : current));

        if (result.autoSubmitted || toStatusKey(result.attempt.status) === 'auto_submitted') {
          const message = getFlagReasonLabels(result.attempt.flagReason)[0]
            || 'Bai thi da duoc tu dong nop do vuot qua gioi han roi tab.';

          setAutoSubmitNotice({
            title: 'Bai thi da duoc tu dong nop',
            message,
          });
          toast({
            type: 'warning',
            title: 'Attempt da bi tu dong nop',
            message,
          });
        }

        return result;
      } catch {
        return null;
      }
    },
    [attemptId, request, submitted, syncSummary, toast],
  );

  const boot = useCallback(
    async (providedPassword?: string) => {
      setLoading(true);
      setError(null);
      setPasswordError(null);
      resumedAttemptRef.current = false;

      try {
        const sessions = await getAvailableSessions(request);
        const matched = sessions.find((item) => item.sessionId === sessionId);
        if (!matched) {
          throw new Error('Session không tồn tại hoặc không còn khả dụng.');
        }

        setSession(matched);

        if (matched.attemptId && toStatusKey(matched.attemptStatus) === 'in_progress') {
          resumedAttemptRef.current = true;
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
        const message =
          bootError instanceof Error ? bootError.message : 'Không thể khởi tạo phiên thi.';
        if ((session?.requiresPassword || message.toLowerCase().includes('password')) && !detail) {
          setPasswordError(message);
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    },
    [detail, request, session?.requiresPassword, sessionId],
  );

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
        toast({
          type: 'warning',
          title: 'Het gio lam bai',
          message: 'He thong da tu dong nop bai thi cua ban.',
        });
      })
      .catch((submitError) => {
        toast({
          type: 'error',
          title: 'Auto-submit that bai',
          message: submitError instanceof Error ? submitError.message : undefined,
        });
      })
      .finally(() => setSubmitting(false));
  }, [detail, request, submitted, syncSummary, timeLeftSeconds, toast]);

  useEffect(() => {
    if (!attemptId || submitted) {
      return;
    }

    const navEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;

    if (navEntry?.type !== 'reload') {
      return;
    }

    const marker = navigationMarkerRef.current || `${window.location.pathname}:${window.performance.timeOrigin}`;
    navigationMarkerRef.current = marker;

    const reloadKey = `examguard:reload:${attemptId}:${marker}`;
    if (reloadLoggedRef.current || sessionStorage.getItem(reloadKey) === '1') {
      return;
    }

    sessionStorage.setItem(reloadKey, '1');
    reloadLoggedRef.current = true;

    void (async () => {
      const reloadResult = await logEvent('PageReload', 'Browser reload detected');

      if (!reloadResult || reloadResult.autoSubmitted || !resumedAttemptRef.current) {
        return;
      }

      const resumeKey = `examguard:resume:${attemptId}:${marker}`;
      if (resumeLoggedRef.current || sessionStorage.getItem(resumeKey) === '1') {
        return;
      }

      sessionStorage.setItem(resumeKey, '1');
      resumeLoggedRef.current = true;
      await logEvent('ResumeAttempt', 'Resumed after browser reload');
    })();
  }, [attemptId, logEvent, submitted]);

  useEffect(() => {
    if (!attemptId || submitted) {
      return;
    }

    const handleVisibility = () => {
      void logEvent(
        document.hidden ? 'TabLeave' : 'TabReturn',
        document.hidden ? 'Document hidden' : 'Returned to exam tab',
      );
    };
    const handleCopy = (event: Event) => {
      event.preventDefault();
      void logEvent('CopyAttempt', 'Copy blocked');
    };
    const handlePaste = (event: Event) => {
      event.preventDefault();
      void logEvent('PasteAttempt', 'Paste blocked');
    };
    const handleContextMenu = (event: Event) => {
      event.preventDefault();
      void logEvent('RightClick', 'Context menu blocked');
    };

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

  const selectAnswer = useCallback(
    async (questionId: string, optionId: string) => {
      if (!detail) {
        return;
      }

      setSaving(true);
      setDetail((current) =>
        current
          ? {
              ...current,
              questions: current.questions.map((question) =>
                question.id === questionId
                  ? { ...question, selectedOptionSnapshotId: optionId }
                  : question,
              ),
            }
          : current,
      );

      try {
        const result = await saveAttemptAnswer(
          request,
          detail.attempt.id,
          questionId,
          optionId,
          new Date().toISOString(),
        );
        setDetail((current) =>
          current
            ? {
                ...current,
                attempt: { ...current.attempt, answeredQuestions: result.answeredQuestions },
              }
            : current,
        );
        showSaved();
      } catch (saveError) {
        toast({
          type: 'error',
          title: 'Lưu đáp án thất bại',
          message: saveError instanceof Error ? saveError.message : undefined,
        });
      } finally {
        setSaving(false);
      }
    },
    [detail, request, showSaved, toast],
  );

  const handleSubmit = useCallback(async () => {
    if (!detail) {
      return;
    }

    setSubmitting(true);
    setShowSubmitModal(false);

    try {
      const result = await submitAttempt(request, detail.attempt.id, 'Manual', new Date().toISOString());
      setSubmitted(result);
      syncSummary(result);
      toast({
        type: 'success',
        title: 'Đã nộp bài thành công',
        message: 'ExamGuard da ghi nhan bai lam va khoa chinh sua dap an.',
      });
    } catch (submitError) {
      toast({
        type: 'error',
        title: 'Nop bai that bai',
        message: submitError instanceof Error ? submitError.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }, [detail, request, syncSummary, toast]);

  const policyItems = useMemo(() => {
    if (!detail) {
      return [];
    }

    return [
      {
        title: '1. Rời tab tối đa',
        value: `${detail.policy.maxTabSwitches} lan`,
        note: 'Moi lan roi khoi tab bai thi deu duoc ghi nhan.',
      },
      {
        title: '2. Tự động nộp khi vượt giới hạn',
        value: detail.policy.autoSubmitOnTabLimit ? 'Có bật' : 'Không bật',
        note: detail.policy.autoSubmitOnTabLimit
          ? 'Vuot nguong roi tab co the bi tu dong nop ngay.'
          : 'Chi danh dau vi pham, khong tu dong nop.',
      },
      {
        title: '3. Copy/Paste',
        value: detail.policy.allowCopyPaste ? 'Cho phep' : 'Bi chan',
        note: detail.policy.allowCopyPaste
          ? 'Hệ thống không chặn copy và paste trong attempt này.'
          : 'Copy va paste se bi chan va ghi log.',
      },
      {
        title: '4. Reload trang',
        value: 'Ghi nhan khi tai lai that su',
        note: 'Chi log PageReload khi trinh duyet xac dinh day la thao tac reload.',
      },
      {
        title: '5. Trả lời quá nhanh',
        value: detail.policy.rapidAnswerThresholdSeconds > 0
          ? `${detail.policy.rapidAnswerThresholdSeconds} giay`
          : 'Không bật',
        note: detail.policy.rapidAnswerThresholdSeconds > 0
          ? 'Backend se danh dau neu co chuoi tra loi qua nhanh.'
          : 'Không có ngưỡng rapid answer cho attempt này.',
      },
    ];
  }, [detail]);

  const handleAutoSubmitAcknowledge = useCallback(() => {
    setAutoSubmitNotice(null);
    router.push('/student/history');
  }, [router]);

  if (error && !detail && !submitted) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[720px] items-center justify-center">
          <InlineState
            icon={<AlertCircle className="h-10 w-10" />}
            title="Không thể mở phiên thi"
            description={error}
            actions={
              <Link href="/student/exams">
                <Button variant="secondary">Quay lại</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (loading && !detail && !submitted) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[720px] items-center justify-center">
          <InlineState
            title="Đang khởi tạo phiên thi"
            description="ExamGuard dang tai session va snapshot de thi that."
          />
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[900px] items-center justify-center">
          <Card className="w-full rounded-[28px] p-8 text-center">
            <div className="flex flex-col items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/8 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge variant={attemptStatusMeta.variant}>{attemptStatusMeta.label}</Badge>
                  {submitted.submitType && (
                    <Badge variant={submitted.submitType.toLowerCase() === 'auto' ? 'warning' : 'success'}>
                      {submitted.submitType.toLowerCase() === 'auto' ? 'Tự động nộp' : 'Nộp thủ công'}
                    </Badge>
                  )}
                </div>
                <h1 className="text-[32px] font-semibold tracking-[-0.05em] text-text-primary">
                  Đã nộp bài
                </h1>
                <p className="text-sm text-text-muted">
                  {submitted.examTitle} ·{' '}
                  {submitted.submittedAt ? formatDateTime(submitted.submittedAt) : 'vua xong'}
                </p>
              </div>
              {flagLabels.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {flagLabels.map((label) => (
                    <Badge key={label} variant="warning">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="grid w-full gap-3 md:grid-cols-4">
                {[
                  ['Da tra loi', submitted.answeredQuestions],
                  ['Bỏ trống', submitted.totalQuestions - submitted.answeredQuestions],
                  ['Dung', submitted.correctAnswers ?? '-'],
                  ['Diem', submitted.score ?? '-'],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-[20px] border border-border-subtle bg-bg-tertiary p-4"
                  >
                    <p className="text-[24px] font-semibold tracking-[-0.04em] text-text-primary">
                      {value}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/student/history">
                  <Button variant="secondary">Lich su</Button>
                </Link>
                <Link href="/student/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <Modal
          open={Boolean(autoSubmitNotice)}
          onClose={handleAutoSubmitAcknowledge}
          title={autoSubmitNotice?.title}
          description="Trang thai bai thi da duoc dong bo voi backend."
          size="sm"
        >
          <div className="space-y-4">
            <div className="rounded-[18px] border border-warning/20 bg-warning/8 px-4 py-3 text-sm text-text-secondary">
              {autoSubmitNotice?.message}
            </div>
            <p className="text-sm text-text-muted">
              Sau khi bai thi bi tu dong nop, ban se khong the tiep tuc chinh sua dap an.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => router.push('/student/dashboard')}>
                Dashboard
              </Button>
              <Button onClick={handleAutoSubmitAcknowledge}>Xem lich su</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  if (session?.requiresPassword && !detail) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[560px] items-center justify-center">
          <Card className="w-full rounded-[28px] p-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-text-primary">
                  {session.examTitle}
                </h1>
                <p className="text-sm text-text-muted">{session.sessionName}</p>
              </div>
              <Input
                label="Mật khẩu session"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={passwordError ?? undefined}
                placeholder="Nhập mật khẩu để vào thi"
              />
              <div className="flex justify-end gap-2">
                <Link href="/student/exams">
                  <Button variant="ghost">Hủy</Button>
                </Link>
                <Button onClick={() => void boot(password)} icon={<Lock className="h-4 w-4" />}>
                  Bat dau
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (session && toStatusKey(session.status) !== 'active' && !detail) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[720px] items-center justify-center">
          <InlineState
            icon={<Clock className="h-10 w-10" />}
            title="Session chua den gio"
            description={`${session.sessionName} mo luc ${formatDateTime(session.startTime)}.`}
            actions={
              <Link href="/student/exams">
                <Button variant="secondary">Quay lại</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (!detail || !currentQuestion) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[720px] items-center justify-center">
          <InlineState
            title="Không có câu hỏi"
            description="Backend không trả về snapshot câu hỏi cho attempt này."
          />
        </div>
      </div>
    );
  }

  const questionButtons = questions.map((question, index) => (
    <button
      key={question.id}
      onClick={() => setQuestionIndex(index)}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border text-xs font-medium',
        'transition-[background-color,border-color,color] duration-[var(--duration-normal)]',
        index === questionIndex
          ? 'border-accent bg-accent text-white'
          : question.selectedOptionSnapshotId
            ? 'border-success/20 bg-success/8 text-success'
            : 'border-border bg-bg-secondary text-text-secondary hover:bg-surface-hover',
      )}
    >
      {index + 1}
    </button>
  ));

  return (
    <div className="min-h-screen bg-bg-primary px-4 py-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px] space-y-4">
        <div className="surface-panel sticky top-4 z-30 rounded-[28px] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={attemptStatusMeta.variant}>{attemptStatusMeta.label}</Badge>
                {autoSaved && <Badge variant="success">Da luu</Badge>}
                {saving && <Badge variant="secondary">Đang đồng bộ</Badge>}
                {flagLabels.map((label) => (
                  <Badge key={label} variant="warning">
                    {label}
                  </Badge>
                ))}
              </div>
              <div>
                <h1 className="text-[22px] font-semibold tracking-[-0.04em] text-text-primary">
                  {session?.examTitle || detail.attempt.examTitle}
                </h1>
                <p className="text-sm text-text-muted">
                  {detail.attempt.subjectName} · Bắt đầu {formatDateTime(detail.attempt.startedAt)} · Hết hạn{' '}
                  {formatDateTime(detail.attempt.expiresAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <div className="rounded-[var(--radius-full)] border border-border bg-bg-secondary px-4 py-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-text-secondary" />
                  <span
                    className={cn(
                      'font-mono text-sm font-semibold text-text-primary',
                      timerClassName,
                    )}
                  >
                    {String(Math.floor(timeLeftSeconds / 60)).padStart(2, '0')}:
                    {String(timeLeftSeconds % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <div className="rounded-[var(--radius-full)] border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary">
                {answeredCount}/{questions.length} cau da tra loi
              </div>
              <Button
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                icon={<Send className="h-4 w-4" />}
              >
                {submitting ? 'Đang nộp bài' : 'Nộp bài'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <Card className="rounded-[28px] p-5">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-text-muted">Tien do</p>
                  <p className="text-base font-medium text-text-primary">
                    {answeredCount}/{questions.length} cau da tra loi
                  </p>
                  <p className="text-xs text-text-muted">
                    Con {unansweredCount} cau chua duoc chon dap an.
                  </p>
                </div>
                <div className="grid grid-cols-5 gap-2">{questionButtons}</div>
              </div>
            </Card>

            <Card className="rounded-[28px] p-5">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Chinh sach giam sat</p>
                  <p className="mt-1 text-xs leading-5 text-text-muted">
                    He thong ghi nhan hanh vi trong luc thi de ho tro monitoring va hau kiem.
                  </p>
                </div>

                <div className="space-y-3">
                  {policyItems.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[20px] border border-border-subtle bg-bg-tertiary px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-text-muted">{item.note}</p>
                        </div>
                        <Badge variant="secondary">{item.value}</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[22px] border border-border-subtle bg-bg-tertiary px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    <p className="text-sm font-medium text-text-primary">Su kien gan day</p>
                  </div>
                  <div className="mt-4 space-y-3 border-l border-border-subtle pl-4">
                    {recentEvents.length === 0 ? (
                      <p className="text-xs text-text-muted">Chưa có event log mới cho attempt này.</p>
                    ) : recentEvents.map((event) => {
                      const eventMeta = getAttemptEventMeta(event.eventType);

                      return (
                        <div key={event.id} className="relative space-y-1">
                          <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={eventMeta.variant}>{eventMeta.label}</Badge>
                            <span className="text-[11px] text-text-muted">{formatDateTime(event.timestamp)}</span>
                          </div>
                          <p className="text-xs leading-5 text-text-secondary">
                            {getAttemptEventDescription(event)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          <section className="space-y-4">
            <Card className="rounded-[28px] p-6">
              <div className="space-y-6">
                <div className="flex flex-col gap-3 border-b border-border-subtle pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-accent">
                      Câu {questionIndex + 1} / {questions.length}
                    </p>
                    <h2 className="text-[28px] font-semibold tracking-[-0.04em] text-text-primary">
                      {currentQuestion.content}
                    </h2>
                  </div>
                  <div className="rounded-[20px] border border-border-subtle bg-bg-tertiary px-4 py-3 text-right text-xs text-text-muted">
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
                          'flex w-full items-start gap-4 rounded-[22px] border px-4 py-4 text-left',
                          'transition-[background-color,border-color,transform] duration-[var(--duration-normal)]',
                          selected
                            ? 'border-accent/25 bg-accent/6'
                            : 'border-border bg-bg-secondary hover:border-border-hover hover:bg-surface-hover',
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border text-sm font-medium',
                            selected
                              ? 'border-accent bg-accent text-white'
                              : 'border-border-subtle bg-bg-tertiary text-text-secondary',
                          )}
                        >
                          {option.label}
                        </div>
                        <div className="flex-1 pt-1 text-sm leading-6 text-text-primary">
                          {option.content}
                        </div>
                        {selected && (
                          <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-accent" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    variant="outline"
                    disabled={questionIndex === 0}
                    onClick={() => setQuestionIndex((value) => value - 1)}
                    icon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Câu trước
                  </Button>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Shield className="h-3.5 w-3.5" />
                    Tab switch: {detail.attempt.tabSwitchCount} · Reload: {detail.attempt.reloadCount}
                  </div>
                  <Button
                    variant="outline"
                    disabled={questionIndex === questions.length - 1}
                    onClick={() => setQuestionIndex((value) => value + 1)}
                    iconRight={<ChevronRight className="h-4 w-4" />}
                  >
                    Câu sau
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>

      <Modal
        open={showSubmitModal}
        onClose={() => {
          if (!submitting) {
            setShowSubmitModal(false);
          }
        }}
        title="Xac nhan nop bai"
        description="Kiem tra nhanh tien do truoc khi khoa bai lam."
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-[18px] border border-border-subtle bg-bg-tertiary px-4 py-4">
            <p className="text-xs text-text-muted">Tien do hien tai</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-text-primary">
              {answeredCount}/{questions.length}
            </p>
            <p className="mt-1 text-sm text-text-secondary">cau da tra loi</p>
          </div>

          {unansweredCount > 0 && (
            <div className="rounded-[18px] border border-warning/20 bg-warning/8 px-4 py-3 text-sm text-text-secondary">
              Con {unansweredCount} cau chua tra loi. Neu nop bai bay gio, cac cau nay se duoc tinh la bo trong.
            </div>
          )}

          <div className="rounded-[18px] border border-danger/15 bg-danger/6 px-4 py-3 text-sm text-text-secondary">
            Sau khi nop bai, ban se khong the sua dap an hoac quay lai trang thi.
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowSubmitModal(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button onClick={() => void handleSubmit()} loading={submitting} icon={<Send className="h-4 w-4" />}>
              Nop bai
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(autoSubmitNotice) && !submitted}
        onClose={handleAutoSubmitAcknowledge}
        title={autoSubmitNotice?.title}
        description="Attempt nay da bi dong tren backend."
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-[18px] border border-warning/20 bg-warning/8 px-4 py-3 text-sm text-text-secondary">
            {autoSubmitNotice?.message}
          </div>
          <div className="flex items-start gap-2 rounded-[18px] border border-border-subtle bg-bg-tertiary px-4 py-3 text-sm text-text-secondary">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <span>Bai thi khong con o trang thai dang lam. Ban se duoc chuyen sang lich su thi.</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => router.push('/student/dashboard')}>
              Dashboard
            </Button>
            <Button onClick={handleAutoSubmitAcknowledge}>Xem lich su</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function progressPercent(answeredQuestions: number, totalQuestions: number) {
  if (totalQuestions === 0) {
    return 0;
  }

  return Math.round((answeredQuestions / totalQuestions) * 100);
}
