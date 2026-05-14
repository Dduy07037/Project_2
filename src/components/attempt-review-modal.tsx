'use client';

import {
  Avatar,
  Badge,
  Card,
  InlineState,
  Modal,
} from '@/components/ui';
import type {
  AttemptDetailDto,
  AttemptEventDto,
  AttemptSummaryDto,
} from '@/lib/api/exam-guard';
import {
  countAttemptEvents,
  getAttemptEventDescription,
  getAttemptEventMeta,
  getAttemptFlagLabels,
  getAttemptStatusMeta,
  getSubmitTypeMeta,
} from '@/lib/exam-guard-labels';
import { formatDateTime, formatTime } from '@/lib/utils';
import { AlertTriangle, Clock, Copy, MousePointerClick, RefreshCw, Shield } from 'lucide-react';

interface AttemptReviewModalProps {
  open: boolean;
  summary: AttemptSummaryDto | null;
  detail: AttemptDetailDto | null;
  fallbackEvents?: AttemptEventDto[];
  loading: boolean;
  totalPoints?: number | null;
  onClose: () => void;
}

function getSupplementarySubmitBadge(summary: AttemptSummaryDto | null) {
  if (!summary?.submitType) {
    return null;
  }

  const statusMeta = getAttemptStatusMeta(summary.status);
  const submitMeta = getSubmitTypeMeta(summary.submitType);

  if (statusMeta.key === 'in_progress') {
    return null;
  }

  if (statusMeta.key === 'auto_submitted' && submitMeta.key === 'auto') {
    return null;
  }

  if (statusMeta.key === 'submitted' && submitMeta.key === 'manual') {
    return null;
  }

  if (submitMeta.key === 'forced') {
    return { ...submitMeta, label: 'Nộp bắt buộc' };
  }

  return submitMeta;
}

function metricValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return value;
}

export function AttemptReviewModal({
  open,
  summary,
  detail,
  fallbackEvents,
  loading,
  totalPoints,
  onClose,
}: AttemptReviewModalProps) {
  const events = detail?.recentEvents?.length ? detail.recentEvents : fallbackEvents ?? [];
  const summaryId = summary?.id ?? 'attempt';
  const statusMeta = getAttemptStatusMeta(summary?.status);
  const supplementarySubmitMeta = getSupplementarySubmitBadge(summary);
  const flagLabels = summary ? getAttemptFlagLabels(summary) : [];
  const copyCount = countAttemptEvents(events, ['CopyAttempt']);
  const pasteCount = countAttemptEvents(events, ['PasteAttempt']);
  const rightClickCount = countAttemptEvents(events, ['RightClick']);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={summary?.examTitle || 'Chi tiết attempt'}
      description={
        summary
          ? `${summary.studentName} · ${summary.studentCode || 'Không có MSSV'} · ${summary.sessionName}`
          : 'Dữ liệu attempt sẽ hiển thị tại đây.'
      }
      size="lg"
    >
      {!summary ? (
        <InlineState title="Chưa chọn attempt" description="Hãy mở một attempt để xem chi tiết kết quả và event log." />
      ) : (
        <div className="space-y-6">
          <Card className="rounded-[24px] border border-border-subtle bg-bg-tertiary/60 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <Avatar name={summary.studentName} size="md" />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                    {supplementarySubmitMeta && (
                      <Badge variant={supplementarySubmitMeta.variant}>{supplementarySubmitMeta.label}</Badge>
                    )}
                    {summary.isFlagged && <Badge variant="danger">Cần xem xét</Badge>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{summary.studentName}</p>
                    <p className="text-xs text-text-muted">
                      {summary.examTitle} · {summary.sessionName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {flagLabels.map((label) => (
                  <Badge key={label} variant="warning">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Điểm',
                  value: typeof summary.score === 'number'
                    ? totalPoints
                      ? `${summary.score}/${totalPoints}`
                      : summary.score
                    : '-',
                },
                {
                  label: 'Đúng / tổng',
                  value: summary.correctAnswers !== null && summary.correctAnswers !== undefined
                    ? `${summary.correctAnswers}/${summary.totalQuestions}`
                    : `-/${summary.totalQuestions}`,
                },
                {
                  label: 'Thời gian làm bài',
                  value: summary.timeSpentSeconds ? formatTime(summary.timeSpentSeconds) : '-',
                },
                {
                  label: 'Đã trả lời',
                  value: `${summary.answeredQuestions}/${summary.totalQuestions}`,
                },
                {
                  label: 'Bắt đầu lúc',
                  value: formatDateTime(summary.startedAt),
                },
                {
                  label: 'Nộp lúc',
                  value: summary.submittedAt ? formatDateTime(summary.submittedAt) : '-',
                },
                {
                  label: 'Rời tab / tải lại',
                  value: `${summary.tabSwitchCount} / ${summary.reloadCount}`,
                },
                {
                  label: 'Copy / paste / chuột phải',
                  value: `${copyCount} / ${pasteCount} / ${rightClickCount}`,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-[18px] border border-border-subtle bg-bg-primary px-4 py-3">
                  <p className="text-xs text-text-muted">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{metricValue(item.value)}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="min-h-0 rounded-[24px] p-5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-text-primary">Timeline sự kiện gần đây</h3>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Đang hiển thị event log gần nhất hiện có cho attempt này.
              </p>

              {loading && !detail ? (
                <div className="mt-5">
                  <InlineState title="Đang tải event log" description="ExamGuard đang tải thêm chi tiết attempt." />
                </div>
              ) : events.length === 0 ? (
                <div className="mt-5 rounded-[18px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
                  Chưa có event log chi tiết cho attempt này.
                </div>
              ) : (
                <div className="mt-5 max-h-[24rem] space-y-3 overflow-y-auto border-l border-border-subtle pl-4 pr-2">
                  {events.map((event, index) => {
                    const meta = getAttemptEventMeta(event.eventType);
                    const eventKey = event.id || `${summaryId}-${event.timestamp}-${index}`;

                    return (
                      <div key={eventKey} className="relative space-y-1">
                        <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                          <span className="text-[11px] text-text-muted">{formatDateTime(event.timestamp)}</span>
                        </div>
                        <p className="break-words text-sm text-text-secondary">{getAttemptEventDescription(event)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="min-h-0 rounded-[24px] p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <h3 className="text-sm font-semibold text-text-primary">Câu trả lời</h3>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Hiển thị lựa chọn sinh viên đã đánh dấu nếu API chi tiết đã trả về.
              </p>

              {loading && !detail ? (
                <div className="mt-5">
                  <InlineState title="Đang tải câu trả lời" description="ExamGuard đang đồng bộ snapshot attempt." />
                </div>
              ) : !detail?.questions.length ? (
                <div className="mt-5 rounded-[18px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
                  API hiện tại chưa trả về danh sách câu trả lời cho attempt này.
                </div>
              ) : (
                <div className="mt-5 max-h-[24rem] space-y-4 overflow-y-auto pr-2">
                  {detail.questions.map((question, index) => {
                    const selectedOption = question.options.find(
                      (option) => option.id === question.selectedOptionSnapshotId,
                    );
                    const questionKey = question.id || `${summaryId}-question-${index}`;
                    const answerState = selectedOption
                      ? { label: 'Đã trả lời', variant: 'info' as const }
                      : { label: 'Chưa trả lời', variant: 'secondary' as const };

                    return (
                      <div key={questionKey} className="rounded-[20px] border border-border-subtle bg-bg-tertiary/50 px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
                            Câu {index + 1}
                          </span>
                          <Badge variant={answerState.variant}>{answerState.label}</Badge>
                        </div>

                        <div className="mt-3 min-w-0">
                          <p className="whitespace-normal break-words text-sm leading-6 text-text-primary">
                            {question.content}
                          </p>
                        </div>

                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-medium text-text-muted">Đáp án đã chọn</p>
                          <div className="max-w-full rounded-[16px] border border-border-subtle bg-bg-primary px-4 py-3">
                            <p className="whitespace-normal break-words text-sm leading-6 text-text-secondary">
                              {selectedOption
                                ? `${selectedOption.label}. ${selectedOption.content}`
                                : 'Chưa chọn đáp án cho câu này.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge variant="secondary">
              <Clock className="h-3 w-3" />
              {summary.timeSpentSeconds ? formatTime(summary.timeSpentSeconds) : 'Chưa có tổng thời gian'}
            </Badge>
            <Badge variant="secondary">
              <RefreshCw className="h-3 w-3" />
              Tải lại {summary.reloadCount}
            </Badge>
            <Badge variant="secondary">
              <Copy className="h-3 w-3" />
              Copy {copyCount}
            </Badge>
            <Badge variant="secondary">
              <MousePointerClick className="h-3 w-3" />
              Chuột phải {rightClickCount}
            </Badge>
          </div>
        </div>
      )}
    </Modal>
  );
}
