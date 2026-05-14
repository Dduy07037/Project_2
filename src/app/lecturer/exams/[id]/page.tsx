'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Avatar,
  Badge,
  Button,
  Card,
  InlineState,
  Input,
  Modal,
  PageHeader,
  Panel,
  StatCard,
  Tabs,
} from '@/components/ui';
import { DataTable } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import { AttemptReviewModal } from '@/components/attempt-review-modal';
import {
  createExamSession,
  getAttempt,
  getExam,
  getMonitoringAttempts,
  publishExam,
  type AttemptDetailDto,
  type CreateSessionRequest,
  type ExamDto,
  type MonitoringAttemptDto,
} from '@/lib/api/exam-guard';
import {
  getAttemptEventDescription,
  getAttemptEventMeta,
  getAttemptFlagLabels,
  getAttemptStatusMeta,
  getExamStatusMeta,
  getSessionStatusMeta,
  getSubmitTypeMeta,
} from '@/lib/exam-guard-labels';
import { formatDateTime, formatDuration, formatTime } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Clock,
  Copy,
  FileText,
  Plus,
  RefreshCw,
  Users,
} from 'lucide-react';

const emptySessionForm: CreateSessionRequest = {
  name: '',
  startTime: '',
  endTime: '',
  maxParticipants: 0,
  password: '',
};

function isAttemptFlagged(item: MonitoringAttemptDto) {
  return item.attempt.isFlagged || item.attempt.tabSwitchCount > 0 || item.attempt.reloadCount > 0;
}

export default function ExamDetailPage() {
  const { request } = useAuth();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const examId = params.id;

  const [exam, setExam] = useState<ExamDto | null>(null);
  const [attempts, setAttempts] = useState<MonitoringAttemptDto[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState<CreateSessionRequest>(emptySessionForm);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<MonitoringAttemptDto | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<AttemptDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadExamDetail = useCallback(async () => {
    setError(null);

    try {
      const [examResponse, monitoringResponse] = await Promise.all([
        getExam(request, examId),
        getMonitoringAttempts(request, { examId, limit: 100 }),
      ]);

      setExam(examResponse);
      setAttempts(monitoringResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải chi tiết kỳ thi.');
    }
  }, [examId, request]);

  useEffect(() => {
    if (examId) {
      void loadExamDetail();
    }
  }, [examId, loadExamDetail]);

  const flaggedAttempts = useMemo(
    () => attempts.filter((item) => isAttemptFlagged(item)),
    [attempts],
  );

  const eventGroups = useMemo(
    () => attempts.filter((item) => item.recentEvents.length > 0),
    [attempts],
  );

  const averageScore = useMemo(() => {
    const scoredAttempts = attempts.filter((item) => typeof item.attempt.score === 'number');
    if (scoredAttempts.length === 0) {
      return '-';
    }

    const total = scoredAttempts.reduce((sum, item) => sum + Number(item.attempt.score ?? 0), 0);
    return (total / scoredAttempts.length).toFixed(1);
  }, [attempts]);

  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'sessions', label: 'Sessions', count: exam?.sessions.length ?? 0 },
    { id: 'results', label: 'Kết quả', count: attempts.length },
    { id: 'review', label: 'Cần xem xét', count: flaggedAttempts.length },
    { id: 'logs', label: 'Event log', count: eventGroups.length },
  ];

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

  const resultColumns = [
    {
      key: 'student',
      title: 'Sinh viên',
      render: (item: MonitoringAttemptDto) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.attempt.studentName} size="sm" />
          <div>
            <p className="text-sm font-medium text-text-primary">{item.attempt.studentName}</p>
            <p className="text-xs text-text-muted">{item.attempt.studentCode || 'Không có MSSV'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'session',
      title: 'Session',
      render: (item: MonitoringAttemptDto) => (
        <span className="text-sm text-text-secondary">{item.attempt.sessionName}</span>
      ),
    },
    {
      key: 'status',
      title: 'Trang thai',
      render: (item: MonitoringAttemptDto) => {
        const meta = getAttemptStatusMeta(item.attempt.status);
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    {
      key: 'submitType',
      title: 'Submit type',
      render: (item: MonitoringAttemptDto) => {
        if (!item.attempt.submitType) {
          return <span className="text-xs text-text-muted">-</span>;
        }

        const meta = getSubmitTypeMeta(item.attempt.submitType);
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    {
      key: 'score',
      title: 'Diem',
      render: (item: MonitoringAttemptDto) => (
        <span className="text-sm font-semibold text-text-primary">
          {item.attempt.score ?? '-'}{exam ? `/${exam.totalPoints}` : ''}
        </span>
      ),
    },
    {
      key: 'correct',
      title: 'Dung / tong',
      render: (item: MonitoringAttemptDto) => (
        <span className="text-sm text-text-secondary">
          {item.attempt.correctAnswers ?? '-'} / {item.attempt.totalQuestions}
        </span>
      ),
    },
    {
      key: 'timeSpent',
      title: 'Thoi gian',
      render: (item: MonitoringAttemptDto) => (
        <span className="text-xs text-text-muted">
          {item.attempt.timeSpentSeconds ? formatTime(item.attempt.timeSpentSeconds) : '-'}
        </span>
      ),
    },
    {
      key: 'submittedAt',
      title: 'SubmittedAt',
      render: (item: MonitoringAttemptDto) => (
        <span className="text-xs text-text-muted">
          {item.attempt.submittedAt ? formatDateTime(item.attempt.submittedAt) : '-'}
        </span>
      ),
    },
    {
      key: 'flagged',
      title: 'Danh dau',
      render: (item: MonitoringAttemptDto) => (
        isAttemptFlagged(item)
          ? <Badge variant="warning">Cần xem xét</Badge>
          : <Badge variant="secondary">Binh thuong</Badge>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (item: MonitoringAttemptDto) => (
        <Button size="sm" variant="secondary" onClick={() => void openAttemptDetail(item)}>
          Xem chi tiet
        </Button>
      ),
    },
  ];

  const handleCreateSession = useCallback(async () => {
    if (!exam || !sessionForm.name.trim() || !sessionForm.startTime || !sessionForm.endTime) {
      toast({ type: 'warning', title: 'Thieu thong tin session' });
      return;
    }

    setSubmitting(true);

    try {
      await createExamSession(request, exam.id, {
        name: sessionForm.name.trim(),
        startTime: new Date(sessionForm.startTime).toISOString(),
        endTime: new Date(sessionForm.endTime).toISOString(),
        maxParticipants: sessionForm.maxParticipants ? Number(sessionForm.maxParticipants) : undefined,
        password: sessionForm.password?.trim() || undefined,
      });

      toast({ type: 'success', title: 'Da tao session moi' });
      setShowSessionModal(false);
      setSessionForm(emptySessionForm);
      await loadExamDetail();
    } catch (createError) {
      toast({
        type: 'error',
        title: 'Tạo session thất bại',
        message: createError instanceof Error ? createError.message : 'Da xay ra loi khong xac dinh.',
      });
    } finally {
      setSubmitting(false);
    }
  }, [exam, loadExamDetail, request, sessionForm, toast]);

  const handlePublishExam = useCallback(async () => {
    if (!exam) {
      return;
    }

    setPublishing(true);

    try {
      await publishExam(request, exam.id);
      toast({
        type: 'success',
        title: 'Da publish ky thi',
        message: 'Sinh viên có thể thấy session khi đến khung giờ hợp lệ.',
      });
      await loadExamDetail();
    } catch (publishError) {
      toast({
        type: 'error',
        title: 'Publish ky thi that bai',
        message: publishError instanceof Error ? publishError.message : 'Da xay ra loi khong xac dinh.',
      });
    } finally {
      setPublishing(false);
    }
  }, [exam, loadExamDetail, request, toast]);

  const copyExamId = useCallback(async () => {
    if (!exam) {
      return;
    }

    try {
      await navigator.clipboard.writeText(exam.id);
      toast({ type: 'success', title: 'Da copy exam ID' });
    } catch {
      toast({ type: 'error', title: 'Không thể copy exam ID' });
    }
  }, [exam, toast]);

  const examStatusMeta = getExamStatusMeta(exam?.status);
  const publishButtonLabel = examStatusMeta.key === 'published' ? 'Da publish' : 'Publish exam';

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
      <motion.div variants={staggerItem}>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-text-muted">
          <Link href="/lecturer" className="hover:text-text-secondary transition-colors">
            Lecturer
          </Link>
          <span>/</span>
          <Link href="/lecturer/exams" className="hover:text-text-secondary transition-colors">
            Exams
          </Link>
          <span>/</span>
          <span className="text-text-primary">{exam?.title || 'Chi tiet ky thi'}</span>
        </div>
        <Link href="/lecturer/exams" className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Quay lại danh sách
        </Link>
        <PageHeader
          title={exam?.title || 'Chi tiet ky thi'}
          description={exam ? `${exam.subjectCode} · ${exam.subjectName} · ${examStatusMeta.label} · ${exam.questionCount} câu · ${formatDuration(exam.durationMinutes)}` : 'Đang tải chi tiết kỳ thi'}
          actions={(
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => void copyExamId()} disabled={!exam}>
                Copy ID
              </Button>
              <Button
                variant="secondary"
                onClick={() => void handlePublishExam()}
                disabled={!exam || publishing || examStatusMeta.key !== 'draft'}
                loading={publishing}
              >
                {publishButtonLabel}
              </Button>
              <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowSessionModal(true)} disabled={!exam}>
                Thêm ca thi
              </Button>
            </div>
          )}
        />
      </motion.div>

      {error && !exam ? (
        <motion.div variants={staggerItem}>
          <InlineState
            icon={<AlertCircle className="h-10 w-10" />}
            title="Không thể tải chi tiết kỳ thi"
            description={error}
            actions={(
              <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadExamDetail()}>
                Thử lại
              </Button>
            )}
          />
        </motion.div>
      ) : !exam ? (
        <motion.div variants={staggerItem}>
          <InlineState title="Đang tải kỳ thi" description="ExamGuard đang đọc chi tiết kỳ thi và dữ liệu kết quả." />
        </motion.div>
      ) : (
        <>
          <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label="Câu hỏi" value={exam.questionCount} icon={<FileText className="h-4 w-4" />} />
            <StatCard label="Thoi gian" value={formatDuration(exam.durationMinutes)} icon={<Clock className="h-4 w-4" />} />
            <StatCard label="Sessions" value={exam.sessions.length} icon={<Users className="h-4 w-4" />} />
            <StatCard label="Diem TB" value={averageScore} icon={<BarChart3 className="h-4 w-4" />} />
            <StatCard label="Cần xem xét" value={flaggedAttempts.length} icon={<AlertTriangle className="h-4 w-4" />} accentColor="var(--color-warning)" />
          </motion.div>

          <motion.div variants={staggerItem}>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </motion.div>

          <motion.div variants={staggerItem}>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Panel title="Thông tin kỳ thi">
                  <div className="space-y-3">
                    {[
                      { label: 'Mô tả', value: exam.description || 'Không có mô tả' },
                      { label: 'Trang thai', value: examStatusMeta.label },
                      { label: 'So cau', value: `${exam.questionCount} cau` },
                      { label: 'Thoi gian', value: formatDuration(exam.durationMinutes) },
                      { label: 'Tổng điểm', value: String(exam.totalPoints) },
                      { label: 'Subject', value: `${exam.subjectCode} · ${exam.subjectName}` },
                      { label: 'Trộn câu hỏi', value: exam.shuffleQuestions ? 'Có' : 'Không' },
                      { label: 'Trộn đáp án', value: exam.shuffleOptions ? 'Có' : 'Không' },
                      { label: 'Sinh viên xem kết quả', value: exam.showResultToStudent ? 'Có' : 'Không' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start justify-between border-b border-border last:border-b-0 py-1.5">
                        <span className="text-sm text-text-muted">{item.label}</span>
                        <span className="max-w-[60%] text-right text-sm text-text-primary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Panel>

                <div className="space-y-6">
                  <Panel title="Tổng hợp kết quả">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { label: 'Tổng attempt', value: attempts.length },
                        { label: 'Auto submit', value: attempts.filter((item) => getAttemptStatusMeta(item.attempt.status).key === 'auto_submitted').length },
                        { label: 'Cần xem xét', value: flaggedAttempts.length },
                        { label: 'Diem trung binh', value: averageScore },
                      ].map((item) => (
                        <div key={item.label} className="rounded-[18px] border border-border-subtle bg-bg-tertiary/60 px-4 py-3">
                          <p className="text-xs text-text-muted">{item.label}</p>
                          <p className="mt-1 text-sm font-semibold text-text-primary">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </Panel>

                  <Panel title="Khu vuc ky thuat" description="ID chi duoc lo ra khi can debug va qua thao tac copy.">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => void copyExamId()} icon={<Copy className="h-4 w-4" />}>
                        Copy exam ID
                      </Button>
                      <Button variant="ghost" onClick={() => setActiveTab('sessions')}>
                        Xem sessions
                      </Button>
                      <Button variant="ghost" onClick={() => setActiveTab('results')}>
                        Xem ket qua
                      </Button>
                    </div>
                  </Panel>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              exam.sessions.length === 0 ? (
                <InlineState title="Chưa có session nào" description="Thêm ca thi để sinh viên có thể vào thi khi exam đã xuất bản." />
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {exam.sessions.map((session) => {
                    const sessionMeta = getSessionStatusMeta(session.status);

                    return (
                      <Card key={session.id} className="rounded-[24px] p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-text-primary">{session.name}</p>
                              <Badge variant={sessionMeta.variant}>{sessionMeta.label}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-text-muted">
                              {formatDateTime(session.startTime)} to {formatDateTime(session.endTime)}
                            </p>
                          </div>
                          <Badge variant={session.hasPassword ? 'warning' : 'secondary'}>
                            {session.hasPassword ? 'Có mật khẩu' : 'Không khóa'}
                          </Badge>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {[
                            { label: 'Current participants', value: session.currentParticipants },
                            { label: 'Max participants', value: session.maxParticipants ?? '-' },
                            { label: 'Trang thai', value: sessionMeta.label },
                          ].map((metric) => (
                            <div key={metric.label} className="rounded-[18px] border border-border-subtle bg-bg-tertiary/60 px-4 py-3">
                              <p className="text-xs text-text-muted">{metric.label}</p>
                              <p className="mt-1 text-sm font-semibold text-text-primary">{metric.value}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )
            )}

            {activeTab === 'results' && (
              <DataTable
                columns={resultColumns}
                data={attempts}
                getRowId={(item) => item.attempt.id}
                emptyMessage="Chưa có sinh viên nào tham gia kỳ thi này."
                onRowClick={(item) => void openAttemptDetail(item)}
              />
            )}

            {activeTab === 'review' && (
              flaggedAttempts.length === 0 ? (
                <InlineState title="Không có attempt cần xem xét" description="Chưa ghi nhận bài làm bất thường cho kỳ thi này." />
              ) : (
                <div className="space-y-4">
                  {flaggedAttempts.map((item) => {
                    const statusMeta = getAttemptStatusMeta(item.attempt.status);
                    const submitMeta = getSubmitTypeMeta(item.attempt.submitType);
                    const flagLabels = getAttemptFlagLabels(item.attempt);

                    return (
                      <Card key={item.attempt.id} className="rounded-[24px] p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar name={item.attempt.studentName} size="sm" />
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-text-primary">{item.attempt.studentName}</span>
                                <span className="font-mono text-xs text-text-muted">{item.attempt.studentCode || 'Không có MSSV'}</span>
                                <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                                {item.attempt.submitType && <Badge variant={submitMeta.variant}>{submitMeta.label}</Badge>}
                              </div>
                              <p className="text-sm text-text-secondary">
                                {item.attempt.sessionName} · {item.attempt.submittedAt ? formatDateTime(item.attempt.submittedAt) : 'Chưa nộp'}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {flagLabels.map((label) => (
                                  <Badge key={label} variant="warning">
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <Button variant="secondary" onClick={() => void openAttemptDetail(item)}>
                            Xem chi tiet
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )
            )}

            {activeTab === 'logs' && (
              eventGroups.length === 0 ? (
                <InlineState title="Chưa có event log" description="Kỳ thi này chưa phát sinh event monitoring đang hiển thị." />
              ) : (
                <div className="space-y-4">
                  {eventGroups.map((item) => (
                    <Panel
                      key={item.attempt.id}
                      title={item.attempt.studentName}
                      description={`${item.attempt.studentCode || 'Không có MSSV'} · ${item.attempt.sessionName}`}
                      action={(
                        <Button size="sm" variant="secondary" onClick={() => void openAttemptDetail(item)}>
                          Xem chi tiet
                        </Button>
                      )}
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {getAttemptFlagLabels(item.attempt).map((label) => (
                            <Badge key={label} variant="warning">
                              {label}
                            </Badge>
                          ))}
                        </div>

                        <div className="space-y-3 border-l border-border-subtle pl-4">
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
                      </div>
                    </Panel>
                  ))}
                </div>
              )
            )}
          </motion.div>
        </>
      )}

      <Modal
        open={showSessionModal}
        onClose={() => {
          if (!submitting) {
            setShowSessionModal(false);
          }
        }}
        title="Thêm ca thi mới"
        description="Ca thi mới sẽ được tạo trong exam hiện tại."
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Tên session"
            value={sessionForm.name}
            onChange={(event) => setSessionForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Ca thi sáng 15/04"
          />
          <Input
            label="Bat dau"
            type="datetime-local"
            value={sessionForm.startTime}
            onChange={(event) => setSessionForm((current) => ({ ...current, startTime: event.target.value }))}
          />
          <Input
            label="Ket thuc"
            type="datetime-local"
            value={sessionForm.endTime}
            onChange={(event) => setSessionForm((current) => ({ ...current, endTime: event.target.value }))}
          />
          <Input
            label="So luong toi da"
            type="number"
            value={String(sessionForm.maxParticipants ?? 0)}
            onChange={(event) => setSessionForm((current) => ({ ...current, maxParticipants: Number(event.target.value) || 0 }))}
          />
          <Input
            label="Mật khẩu (nếu cần)"
            value={sessionForm.password ?? ''}
            onChange={(event) => setSessionForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Bỏ trống nếu không khóa"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowSessionModal(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button onClick={() => void handleCreateSession()} loading={submitting}>
              Tạo session
            </Button>
          </div>
        </div>
      </Modal>

      <AttemptReviewModal
        open={Boolean(selectedAttempt)}
        summary={selectedAttempt?.attempt ?? null}
        detail={selectedDetail}
        fallbackEvents={selectedAttempt?.recentEvents}
        loading={detailLoading}
        totalPoints={exam?.totalPoints}
        onClose={() => {
          setSelectedAttempt(null);
          setSelectedDetail(null);
          setDetailLoading(false);
        }}
      />
    </motion.div>
  );
}
