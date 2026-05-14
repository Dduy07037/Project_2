'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  FilterBar,
  InlineState,
  PageHeader,
  SearchInput,
  Select,
  StatCard,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import { AttemptReviewModal } from '@/components/attempt-review-modal';
import {
  getAttempt,
  getExams,
  getMonitoringAttempts,
  type AttemptDetailDto,
  type ExamDto,
  type MonitoringAttemptDto,
} from '@/lib/api/exam-guard';
import {
  countAttemptEvents,
  getAttemptEventDescription,
  getAttemptEventMeta,
  getAttemptFlagLabels,
  getAttemptStatusMeta,
  getSubmitTypeMeta,
} from '@/lib/exam-guard-labels';
import { cn } from '@/lib/cn';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { formatDateTime, formatTime } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Copy,
  Flag,
  Monitor,
  MousePointerClick,
  RefreshCw,
  Shield,
  Users,
} from 'lucide-react';

function isAttemptFlagged(item: MonitoringAttemptDto) {
  return item.attempt.isFlagged || item.attempt.tabSwitchCount > 0 || item.attempt.reloadCount > 0;
}

export default function MonitoringPage() {
  const { request } = useAuth();
  const { toast } = useToast();

  const [attempts, setAttempts] = useState<MonitoringAttemptDto[]>([]);
  const [exams, setExams] = useState<ExamDto[]>([]);
  const [search, setSearch] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [submitTypeFilter, setSubmitTypeFilter] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<MonitoringAttemptDto | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<AttemptDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadMonitoring = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [attemptResponse, examResponse] = await Promise.all([
        getMonitoringAttempts(request, { limit: 200 }),
        getExams(request),
      ]);

      setAttempts(attemptResponse);
      setExams(examResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu monitoring.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    void loadMonitoring();
  }, [loadMonitoring]);

  const examMap = useMemo(
    () => new Map(exams.map((exam) => [exam.id, exam])),
    [exams],
  );

  const examOptions = useMemo(
    () => exams
      .map((exam) => ({
        value: exam.id,
        label: `${exam.title} (${exam.subjectCode})`,
      }))
      .sort((left, right) => left.label.localeCompare(right.label)),
    [exams],
  );

  const sessionOptions = useMemo(() => {
    const sourceSessions = examFilter
      ? exams.find((exam) => exam.id === examFilter)?.sessions ?? []
      : exams.flatMap((exam) => exam.sessions);

    return Array.from(
      new Map(sourceSessions.map((session) => [session.id, session])).values(),
    )
      .map((session) => ({
        value: session.id,
        label: session.name,
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [examFilter, exams]);

  const statusOptions = useMemo(
    () => Array.from(new Set(attempts.map((item) => item.attempt.status)))
      .map((status) => {
        const meta = getAttemptStatusMeta(status);
        return { value: status, label: meta.label };
      })
      .sort((left, right) => left.label.localeCompare(right.label)),
    [attempts],
  );

  const submitTypeOptions = useMemo(
    () => Array.from(new Set(attempts.map((item) => item.attempt.submitType).filter(Boolean)))
      .map((submitType) => {
        const meta = getSubmitTypeMeta(submitType);
        return { value: submitType ?? '', label: meta.label };
      })
      .sort((left, right) => left.label.localeCompare(right.label)),
    [attempts],
  );

  const totals = useMemo(() => ({
    flagged: attempts.filter((item) => isAttemptFlagged(item)).length,
    autoSubmitted: attempts.filter((item) => getAttemptStatusMeta(item.attempt.status).key === 'auto_submitted').length,
    tabSwitches: attempts.reduce((sum, item) => sum + item.attempt.tabSwitchCount, 0),
    monitoredEvents: attempts.reduce(
      (sum, item) => sum + countAttemptEvents(item.recentEvents, ['CopyAttempt', 'PasteAttempt', 'RightClick']),
      0,
    ),
  }), [attempts]);

  const filteredAttempts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attempts.filter((item) => {
      if (examFilter && item.attempt.examId !== examFilter) {
        return false;
      }

      if (sessionFilter && item.attempt.sessionId !== sessionFilter) {
        return false;
      }

      if (statusFilter && item.attempt.status !== statusFilter) {
        return false;
      }

      if (submitTypeFilter && item.attempt.submitType !== submitTypeFilter) {
        return false;
      }

      if (flaggedOnly && !isAttemptFlagged(item)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        item.attempt.studentName,
        item.attempt.studentCode ?? '',
        item.attempt.examTitle,
        item.attempt.sessionName,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [attempts, examFilter, flaggedOnly, search, sessionFilter, statusFilter, submitTypeFilter]);

  const openAttemptDetail = useCallback(async (item: MonitoringAttemptDto) => {
    setSelectedAttempt(item);
    setSelectedDetail(null);
    setDetailLoading(true);

    try {
      const response = await getAttempt(request, item.attempt.id);
      setSelectedDetail(response);
    } catch (detailError) {
      toast({
        type: 'error',
        title: 'Không thể tải chi tiết attempt',
        message: detailError instanceof Error ? detailError.message : 'Da xay ra loi khong xac dinh.',
      });
    } finally {
      setDetailLoading(false);
    }
  }, [request, toast]);

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
      <motion.div variants={staggerItem}>
        <PageHeader
          title="Monitoring va hau kiem"
          description="Theo dõi trạng thái attempt, sự kiện giám sát và các bài làm cần xem xét trên cùng một màn hình."
        />
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng lượt thi" value={attempts.length} icon={<Monitor className="h-5 w-5" />} />
        <StatCard label="Cần xem xét" value={totals.flagged} icon={<Flag className="h-5 w-5" />} accentColor="var(--color-warning)" />
        <StatCard label="Tab switch" value={totals.tabSwitches} icon={<AlertTriangle className="h-5 w-5" />} accentColor="var(--color-danger)" />
        <StatCard label="Auto submit" value={totals.autoSubmitted} icon={<Clock className="h-5 w-5" />} accentColor="var(--color-accent)" />
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card className="rounded-[24px] p-5">
          <FilterBar>
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tim sinh vien, MSSV, ky thi hoac session..."
              className="sm:min-w-[260px]"
            />
            <Select
              value={examFilter}
              onChange={setExamFilter}
              options={examOptions}
              placeholder="Tất cả kỳ thi"
              className="sm:min-w-[220px]"
            />
            <Select
              value={sessionFilter}
              onChange={setSessionFilter}
              options={sessionOptions}
              placeholder="Tất cả session"
              className="sm:min-w-[220px]"
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="Tất cả trạng thái"
              className="sm:min-w-[200px]"
            />
            <Select
              value={submitTypeFilter}
              onChange={setSubmitTypeFilter}
              options={submitTypeOptions}
              placeholder="Tất cả submit type"
              className="sm:min-w-[200px]"
            />
            <Checkbox
              checked={flaggedOnly}
              onChange={setFlaggedOnly}
              label="Chỉ hiện attempt cần xem xét"
              className="sm:ml-auto"
            />
          </FilterBar>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem} className="space-y-4">
        {error ? (
          <InlineState
            icon={<AlertCircle className="h-10 w-10" />}
            title="Không thể tải monitoring"
            description={error}
            actions={(
              <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadMonitoring()}>
                Thử lại
              </Button>
            )}
          />
        ) : loading && attempts.length === 0 ? (
          <InlineState title="Đang tải monitoring" description="ExamGuard đang tổng hợp attempt log, score và event monitoring." />
        ) : filteredAttempts.length === 0 ? (
          <InlineState title="Không có attempt phù hợp" description="Thử đổi bộ lọc hoặc đợi thêm dữ liệu attempt mới." />
        ) : filteredAttempts.map((item) => {
          const statusMeta = getAttemptStatusMeta(item.attempt.status);
          const submitMeta = getSubmitTypeMeta(item.attempt.submitType);
          const totalPoints = examMap.get(item.attempt.examId)?.totalPoints;
          const copyCount = countAttemptEvents(item.recentEvents, ['CopyAttempt']);
          const pasteCount = countAttemptEvents(item.recentEvents, ['PasteAttempt']);
          const rightClickCount = countAttemptEvents(item.recentEvents, ['RightClick']);
          const flagLabels = getAttemptFlagLabels(item.attempt);

          return (
            <Card
              key={item.attempt.id}
              className={cn(
                'rounded-[28px] border-l-[3px] p-5',
                item.attempt.isFlagged ? 'border-l-warning' : 'border-l-border',
              )}
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-start gap-3">
                  <Avatar name={item.attempt.studentName} size="md" />
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{item.attempt.studentName}</span>
                      <span className="font-mono text-xs text-text-muted">{item.attempt.studentCode || 'Không có MSSV'}</span>
                      <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                      {item.attempt.submitType && <Badge variant={submitMeta.variant}>{submitMeta.label}</Badge>}
                      {item.attempt.isFlagged && <Badge variant="danger">Bị gắn cờ</Badge>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.attempt.examTitle}</p>
                      <p className="text-xs text-text-muted">{item.attempt.sessionName}</p>
                    </div>
                  </div>
                </div>

                <Button variant="secondary" onClick={() => void openAttemptDetail(item)}>
                  Xem chi tiet
                </Button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: 'Diem / tong diem',
                    value: typeof item.attempt.score === 'number'
                      ? totalPoints
                        ? `${item.attempt.score}/${totalPoints}`
                        : item.attempt.score
                      : '-',
                  },
                  {
                    label: 'Dung / tong cau',
                    value: item.attempt.correctAnswers !== null && item.attempt.correctAnswers !== undefined
                      ? `${item.attempt.correctAnswers}/${item.attempt.totalQuestions}`
                      : `-/${item.attempt.totalQuestions}`,
                  },
                  {
                    label: 'Thoi gian lam bai',
                    value: item.attempt.timeSpentSeconds ? formatTime(item.attempt.timeSpentSeconds) : '-',
                  },
                  {
                    label: 'Bat dau / nop bai',
                    value: `${formatDateTime(item.attempt.startedAt)}${item.attempt.submittedAt ? ` -> ${formatDateTime(item.attempt.submittedAt)}` : ''}`,
                  },
                  {
                    label: 'Rời tab',
                    value: item.attempt.tabSwitchCount,
                  },
                  {
                    label: 'Reload',
                    value: item.attempt.reloadCount,
                  },
                  {
                    label: 'Copy / paste',
                    value: `${copyCount} / ${pasteCount}`,
                  },
                  {
                    label: 'Right click',
                    value: rightClickCount,
                  },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-[18px] border border-border-subtle bg-bg-tertiary/60 px-4 py-3">
                    <p className="text-xs text-text-muted">{metric.label}</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {flagLabels.length > 0 ? flagLabels.map((label) => (
                  <Badge key={label} variant="warning">
                    {label}
                  </Badge>
                )) : (
                  <Badge variant="secondary">Không có cảnh báo nổi bật</Badge>
                )}
              </div>

              <div className="mt-4 rounded-[22px] border border-border-subtle bg-bg-tertiary/40 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    <p className="text-sm font-medium text-text-primary">Event log gan day</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Copy className="h-3.5 w-3.5" />
                      {copyCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {pasteCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MousePointerClick className="h-3.5 w-3.5" />
                      {rightClickCount}
                    </span>
                  </div>
                </div>

                {item.recentEvents.length === 0 ? (
                  <p className="mt-4 text-sm text-text-muted">Chưa có event log chi tiết cho attempt này.</p>
                ) : (
                  <div className="mt-4 space-y-3 border-l border-border-subtle pl-4">
                    {item.recentEvents.map((event, index) => {
                      const eventMeta = getAttemptEventMeta(event.eventType);
                      const eventKey = event.id || `${item.attempt.id}-${event.timestamp}-${index}`;

                      return (
                        <div key={eventKey} className="relative space-y-1">
                          <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={eventMeta.variant}>{eventMeta.label}</Badge>
                            <span className="text-[11px] text-text-muted">{formatDateTime(event.timestamp)}</span>
                          </div>
                          <p className="text-sm text-text-secondary">{getAttemptEventDescription(event)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </motion.div>

      <AttemptReviewModal
        open={Boolean(selectedAttempt)}
        summary={selectedAttempt?.attempt ?? null}
        detail={selectedDetail}
        fallbackEvents={selectedAttempt?.recentEvents}
        loading={detailLoading}
        totalPoints={selectedAttempt ? examMap.get(selectedAttempt.attempt.examId)?.totalPoints : null}
        onClose={() => {
          setSelectedAttempt(null);
          setSelectedDetail(null);
          setDetailLoading(false);
        }}
      />
    </motion.div>
  );
}
