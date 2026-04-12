'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Avatar,
    Badge,
    Button,
    InlineState,
    Input,
    Modal,
    PageHeader,
    Panel,
    StatCard,
    StatusBadge,
    Tabs,
} from '@/components/ui';
import { DataTable } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/components/providers/auth-provider';
import {
    createExamSession,
    getExam,
    getMonitoringAttempts,
    toStatusKey,
    type CreateSessionRequest,
    type ExamDto,
    type MonitoringAttemptDto,
} from '@/lib/api/exam-guard';
import { formatDateTime, formatDuration, formatTime } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    Clock,
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
            setError(loadError instanceof Error ? loadError.message : 'Khong the tai chi tiet ky thi.');
        } finally {
        }
    }, [examId, request]);

    useEffect(() => {
        if (examId) {
            void loadExamDetail();
        }
    }, [examId, loadExamDetail]);

    const flaggedAttempts = useMemo(() => attempts.filter((item) => item.attempt.isFlagged || item.attempt.tabSwitchCount > 0 || item.attempt.reloadCount > 0), [attempts]);

    const averageScore = useMemo(() => {
        const scoredAttempts = attempts.filter((item) => typeof item.attempt.score === 'number');
        if (scoredAttempts.length === 0) {
            return '—';
        }

        const total = scoredAttempts.reduce((sum, item) => sum + Number(item.attempt.score ?? 0), 0);
        return (total / scoredAttempts.length).toFixed(1);
    }, [attempts]);

    const tabs = [
        { id: 'overview', label: 'Tong quan' },
        { id: 'results', label: 'Ket qua', count: attempts.length },
        { id: 'logs', label: 'Event log', count: flaggedAttempts.length },
    ];

    const resultColumns = [
        {
            key: 'student',
            title: 'Sinh vien',
            render: (item: MonitoringAttemptDto) => (
                <div className="flex items-center gap-3">
                    <Avatar name={item.attempt.studentName} size="sm" />
                    <div>
                        <p className="text-sm font-medium text-text-primary">{item.attempt.studentName}</p>
                        <p className="text-xs text-text-muted">{item.attempt.studentCode || 'Khong co MSSV'}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'score',
            title: 'Diem',
            render: (item: MonitoringAttemptDto) => (
                <span className="text-sm font-semibold text-text-primary">
                    {item.attempt.score ?? '—'}{exam ? `/${exam.totalPoints}` : ''}
                </span>
            ),
        },
        {
            key: 'answered',
            title: 'Da lam',
            render: (item: MonitoringAttemptDto) => (
                <span className="text-sm text-text-secondary">{item.attempt.answeredQuestions}/{item.attempt.totalQuestions}</span>
            ),
        },
        {
            key: 'timeSpent',
            title: 'Thoi gian',
            render: (item: MonitoringAttemptDto) => (
                <span className="text-xs text-text-muted">
                    {item.attempt.timeSpentSeconds ? formatTime(item.attempt.timeSpentSeconds) : '—'}
                </span>
            ),
        },
        {
            key: 'status',
            title: 'Trang thai',
            render: (item: MonitoringAttemptDto) => <StatusBadge status={toStatusKey(item.attempt.status)} />,
        },
        {
            key: 'flags',
            title: 'Canh bao',
            render: (item: MonitoringAttemptDto) => (
                <span className="text-xs text-warning">
                    {item.attempt.isFlagged ? item.attempt.flagReason || 'Flagged' : `${item.attempt.tabSwitchCount} tab · ${item.attempt.reloadCount} reload`}
                </span>
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
                title: 'Tao session that bai',
                message: createError instanceof Error ? createError.message : 'Da xay ra loi khong xac dinh.',
            });
        } finally {
            setSubmitting(false);
        }
    }, [exam, loadExamDetail, request, sessionForm, toast]);

    return (
        <motion.div variants={staggerContainer} initial="initial" animate="enter" className="space-y-6">
            <motion.div variants={staggerItem}>
                <Link href="/lecturer/exams" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors mb-3">
                    <ArrowLeft className="h-3 w-3" />
                    Quay lai danh sach
                </Link>
                <PageHeader
                    title={exam?.title || 'Chi tiet ky thi'}
                    description={exam ? `${exam.subjectName} · du lieu tu /api/exams/${exam.id}` : 'Dang tai chi tiet ky thi'}
                    actions={(
                        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowSessionModal(true)} disabled={!exam}>
                            Them session
                        </Button>
                    )}
                />
            </motion.div>

            {error && !exam ? (
                <motion.div variants={staggerItem}>
                    <InlineState
                        icon={<AlertCircle className="h-10 w-10" />}
                        title="Khong the tai chi tiet ky thi"
                        description={error}
                        actions={(
                            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadExamDetail()}>
                                Thu lai
                            </Button>
                        )}
                    />
                </motion.div>
            ) : !exam ? (
                <motion.div variants={staggerItem}>
                    <InlineState title="Dang tai ky thi" description="ExamGuard dang doc chi tiet ky thi va monitoring data." />
                </motion.div>
            ) : (
                <>
                    <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        <StatCard label="Cau hoi" value={exam.questionCount} icon={<FileText className="h-4 w-4" />} />
                        <StatCard label="Thoi gian" value={formatDuration(exam.durationMinutes)} icon={<Clock className="h-4 w-4" />} />
                        <StatCard label="Luot thi" value={attempts.length} icon={<Users className="h-4 w-4" />} />
                        <StatCard label="Diem TB" value={averageScore} icon={<BarChart3 className="h-4 w-4" />} />
                        <StatCard label="Can xem xet" value={flaggedAttempts.length} icon={<AlertTriangle className="h-4 w-4" />} accentColor="var(--color-warning)" />
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                    </motion.div>

                    <motion.div variants={staggerItem}>
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Panel title="Thong tin ky thi">
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Mo ta', value: exam.description || 'Khong co mo ta' },
                                            { label: 'So cau', value: `${exam.questionCount} cau` },
                                            { label: 'Thoi gian', value: formatDuration(exam.durationMinutes) },
                                            { label: 'Tong diem', value: String(exam.totalPoints) },
                                            { label: 'Tron cau hoi', value: exam.shuffleQuestions ? 'Co' : 'Khong' },
                                            { label: 'Tron dap an', value: exam.shuffleOptions ? 'Co' : 'Khong' },
                                            { label: 'Sinh vien xem ket qua', value: exam.showResultToStudent ? 'Co' : 'Khong' },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-start justify-between py-1.5 border-b border-border last:border-b-0">
                                                <span className="text-sm text-text-muted">{item.label}</span>
                                                <span className="text-sm text-text-primary text-right max-w-[60%]">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Panel>

                                <Panel title="Sessions">
                                    {exam.sessions.length === 0 ? (
                                        <p className="text-sm text-text-muted">Ky thi nay chua co session nao. Hay them session de sinh vien co the vao thi.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {exam.sessions.map((session) => (
                                                <div key={session.id} className="flex items-center justify-between p-3 border border-border rounded-[var(--radius-md)]">
                                                    <div>
                                                        <p className="text-sm font-medium text-text-primary">{session.name}</p>
                                                        <p className="text-xs text-text-muted">{formatDateTime(session.startTime)} — {formatDateTime(session.endTime)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <StatusBadge status={toStatusKey(session.status)} />
                                                        <p className="text-xs text-text-muted mt-1">
                                                            {session.currentParticipants}/{session.maxParticipants ?? '∞'} SV
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Panel>
                            </div>
                        )}

                        {activeTab === 'results' && (
                            <DataTable columns={resultColumns} data={attempts} emptyMessage="Chua co sinh vien nao tham gia ky thi nay." />
                        )}

                        {activeTab === 'logs' && (
                            <div className="space-y-3">
                                {flaggedAttempts.length === 0 ? (
                                    <InlineState title="Khong co event can xem xet" description="Chua ghi nhan attempt bat thuong cho ky thi nay." />
                                ) : flaggedAttempts.map((item) => (
                                    <Panel key={item.attempt.id} title={item.attempt.studentName} description={`${item.attempt.examTitle} · ${item.attempt.studentCode || 'Khong co MSSV'}`}>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <StatusBadge status={toStatusKey(item.attempt.status)} />
                                                <Badge variant={item.attempt.isFlagged ? 'danger' : 'warning'}>
                                                    {item.attempt.flagReason || `${item.attempt.tabSwitchCount} tab switch`}
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                {item.recentEvents.length === 0 ? (
                                                    <p className="text-sm text-text-muted">Chua co event log chi tiet.</p>
                                                ) : item.recentEvents.map((event) => (
                                                    <div key={event.id} className="flex items-center gap-3 text-sm">
                                                        <span className="text-text-muted min-w-[120px]">{formatDateTime(event.timestamp)}</span>
                                                        <StatusBadge status={toStatusKey(event.eventType)} />
                                                        <span className="text-text-secondary">{event.details || event.eventType}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Panel>
                                ))}
                            </div>
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
                title="Them session moi"
                description="Session moi se duoc tao truc tiep tren backend."
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Ten session"
                        value={sessionForm.name}
                        onChange={(event) => setSessionForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Ca thi sang 15/04"
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
                        label="Mat khau (neu can)"
                        value={sessionForm.password ?? ''}
                        onChange={(event) => setSessionForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder="Bo trong neu khong khoa"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setShowSessionModal(false)} disabled={submitting}>
                            Huy
                        </Button>
                        <Button onClick={() => void handleCreateSession()} loading={submitting}>
                            Tao session
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
