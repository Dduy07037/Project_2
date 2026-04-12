export type ApiRequester = <TResponse>(path: string, init?: RequestInit, body?: unknown) => Promise<TResponse>;

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface UserDto {
    id: string;
    email: string;
    fullName: string;
    role: string;
    studentCode?: string | null;
    department?: string | null;
    status: string;
    lastLoginAt?: string | null;
    createdAt: string;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    fullName: string;
    role: string;
    studentCode?: string | null;
    department?: string | null;
}

export interface SubjectDto {
    id: string;
    code: string;
    name: string;
    department?: string | null;
    createdById: string;
    createdByName: string;
    questionCount: number;
    examCount: number;
    isActive: boolean;
    createdAt: string;
}

export interface CreateSubjectRequest {
    code: string;
    name: string;
    department?: string | null;
    createdById?: string | null;
}

export interface CategoryDto {
    id: string;
    subjectId: string;
    name: string;
    questionCount: number;
    createdAt: string;
}

export interface QuestionOptionDto {
    id: string;
    label: string;
    content: string;
    isCorrect: boolean;
    sortOrder: number;
}

export interface QuestionDto {
    id: string;
    subjectId: string;
    subjectName: string;
    categoryId?: string | null;
    categoryName?: string | null;
    content: string;
    difficulty: string;
    isActive: boolean;
    options: QuestionOptionDto[];
    createdById: string;
    createdAt: string;
    updatedAt: string;
}

export interface ExamSessionDto {
    id: string;
    examId: string;
    name: string;
    startTime: string;
    endTime: string;
    maxParticipants?: number | null;
    currentParticipants: number;
    status: string;
    hasPassword: boolean;
}

export interface ExamDto {
    id: string;
    title: string;
    description?: string | null;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    createdById: string;
    createdByName: string;
    questionCount: number;
    durationMinutes: number;
    totalPoints: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResultToStudent: boolean;
    status: string;
    sessions: ExamSessionDto[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateExamRequest {
    title: string;
    description?: string | null;
    subjectId: string;
    questionCount: number;
    durationMinutes: number;
    totalPoints: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResultToStudent: boolean;
}

export interface CreateSessionRequest {
    name: string;
    startTime: string;
    endTime: string;
    maxParticipants?: number | null;
    password?: string | null;
}

export interface AvailableSessionDto {
    sessionId: string;
    examId: string;
    examTitle: string;
    examDescription?: string | null;
    subjectName: string;
    subjectCode: string;
    sessionName: string;
    questionCount: number;
    durationMinutes: number;
    totalPoints: number;
    startTime: string;
    endTime: string;
    requiresPassword: boolean;
    status: string;
    hasExistingAttempt: boolean;
    attemptId?: string | null;
    attemptStatus?: string | null;
    showResultToStudent: boolean;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
}

export interface SystemSettingsDto {
    siteName: string;
    maintenanceMode: boolean;
    maxLoginAttempts: number;
    sessionTimeoutMinutes: number;
    tabSwitchWarning: boolean;
    maxTabSwitches: number;
    autoSubmitOnTabLimit: boolean;
    allowCopyPaste: boolean;
    showResultToStudent: boolean;
    rapidAnswerThresholdSeconds: number;
    updatedAt: string;
}

export interface UpdateSystemSettingsRequest {
    siteName: string;
    maintenanceMode: boolean;
    maxLoginAttempts: number;
    sessionTimeoutMinutes: number;
    tabSwitchWarning: boolean;
    maxTabSwitches: number;
    autoSubmitOnTabLimit: boolean;
    allowCopyPaste: boolean;
    showResultToStudent: boolean;
    rapidAnswerThresholdSeconds: number;
}

export interface ActivityItemDto {
    id: string;
    userName: string;
    userRole: string;
    action: string;
    target: string;
    details?: string | null;
    timestamp: string;
    severity: string;
}

export interface AttemptPolicyDto {
    maxTabSwitches: number;
    autoSubmitOnTabLimit: boolean;
    allowCopyPaste: boolean;
    rapidAnswerThresholdSeconds: number;
}

export interface AttemptEventDto {
    id: string;
    eventType: string;
    timestamp: string;
    clientTimestamp?: string | null;
    details?: string | null;
}

export interface AttemptSummaryDto {
    id: string;
    examId: string;
    examTitle: string;
    sessionId: string;
    sessionName: string;
    studentId: string;
    studentName: string;
    studentCode?: string | null;
    subjectName: string;
    startedAt: string;
    submittedAt?: string | null;
    expiresAt: string;
    status: string;
    submitType?: string | null;
    score?: number | null;
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers?: number | null;
    timeSpentSeconds?: number | null;
    tabSwitchCount: number;
    reloadCount: number;
    isFlagged: boolean;
    flagReason?: string | null;
    sessionStartTime: string;
    sessionEndTime: string;
    showResultToStudent: boolean;
}

export interface AttemptOptionSnapshotDto {
    id: string;
    label: string;
    content: string;
    sortOrder: number;
}

export interface AttemptQuestionSnapshotDto {
    id: string;
    originalQuestionId: string;
    sortOrder: number;
    content: string;
    pointValue: number;
    selectedOptionSnapshotId?: string | null;
    options: AttemptOptionSnapshotDto[];
}

export interface AttemptDetailDto {
    attempt: AttemptSummaryDto;
    examDescription: string;
    durationMinutes: number;
    totalPoints: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    policy: AttemptPolicyDto;
    questions: AttemptQuestionSnapshotDto[];
    recentEvents: AttemptEventDto[];
}

export interface AttemptAnswerUpdateDto {
    attemptId: string;
    questionSnapshotId: string;
    selectedOptionSnapshotId?: string | null;
    answeredAt?: string | null;
    answeredQuestions: number;
}

export interface AttemptEventResultDto {
    attempt: AttemptSummaryDto;
    autoSubmitted: boolean;
    recentEvents: AttemptEventDto[];
}

export interface MonitoringAttemptDto {
    attempt: AttemptSummaryDto;
    recentEvents: AttemptEventDto[];
}

function buildQuery(query?: Record<string, string | number | boolean | null | undefined>): string {
    if (!query) {
        return '';
    }

    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }

        params.set(key, String(value));
    });

    const serialized = params.toString();
    return serialized ? `?${serialized}` : '';
}

export function toStatusKey(value: string | null | undefined): string {
    if (!value) {
        return 'secondary';
    }

    return value
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();
}

export function getRoleLabel(role: string): string {
    switch (role.trim().toLowerCase()) {
        case 'admin':
            return 'Admin';
        case 'lecturer':
            return 'Giang vien';
        case 'student':
            return 'Sinh vien';
        default:
            return role;
    }
}

export async function getUsers(request: ApiRequester, query?: Record<string, string | number | boolean | null | undefined>) {
    return request<PagedResult<UserDto>>(`/api/users${buildQuery(query)}`);
}

export async function createUser(request: ApiRequester, payload: CreateUserRequest) {
    return request<UserDto>('/api/users', { method: 'POST' }, payload);
}

export async function updateUserStatus(request: ApiRequester, userId: string, status: string) {
    return request<{ message: string }>(`/api/users/${userId}/status`, { method: 'PATCH' }, { status });
}

export async function resetUserPassword(request: ApiRequester, userId: string, newPassword: string) {
    return request<{ message: string }>(`/api/users/${userId}/reset-password`, { method: 'PATCH' }, { newPassword });
}

export async function getSubjects(request: ApiRequester) {
    return request<SubjectDto[]>('/api/subjects');
}

export async function createSubject(request: ApiRequester, payload: CreateSubjectRequest) {
    return request<SubjectDto>('/api/subjects', { method: 'POST' }, payload);
}

export async function getCategories(request: ApiRequester, subjectId: string) {
    return request<CategoryDto[]>(`/api/subjects/${subjectId}/categories`);
}

export async function getQuestions(request: ApiRequester, query?: Record<string, string | number | boolean | null | undefined>) {
    return request<PagedResult<QuestionDto>>(`/api/questions${buildQuery(query)}`);
}

export async function createQuestion(request: ApiRequester, payload: {
    subjectId: string;
    categoryId?: string | null;
    content: string;
    difficulty: string;
    options: Array<{ label: string; content: string; isCorrect: boolean }>;
}) {
    return request<QuestionDto>('/api/questions', { method: 'POST' }, payload);
}

export async function getExams(request: ApiRequester) {
    return request<ExamDto[]>('/api/exams');
}

export async function getExam(request: ApiRequester, examId: string) {
    return request<ExamDto>(`/api/exams/${examId}`);
}

export async function createExam(request: ApiRequester, payload: CreateExamRequest) {
    return request<ExamDto>('/api/exams', { method: 'POST' }, payload);
}

export async function createExamSession(request: ApiRequester, examId: string, payload: CreateSessionRequest) {
    return request<ExamSessionDto>(`/api/exams/${examId}/sessions`, { method: 'POST' }, payload);
}

export async function getAvailableSessions(request: ApiRequester) {
    return request<AvailableSessionDto[]>('/api/exams/available');
}

export async function getSettings(request: ApiRequester) {
    return request<SystemSettingsDto>('/api/settings');
}

export async function updateSettings(request: ApiRequester, payload: UpdateSystemSettingsRequest) {
    return request<SystemSettingsDto>('/api/settings', { method: 'PUT' }, payload);
}

export async function getActivity(request: ApiRequester, limit = 100) {
    return request<ActivityItemDto[]>(`/api/activity?limit=${limit}`);
}

export async function startAttempt(request: ApiRequester, sessionId: string, password?: string) {
    return request<AttemptDetailDto>('/api/attempts/start', { method: 'POST' }, { sessionId, password });
}

export async function getAttempt(request: ApiRequester, attemptId: string) {
    return request<AttemptDetailDto>(`/api/attempts/${attemptId}`);
}

export async function saveAttemptAnswer(
    request: ApiRequester,
    attemptId: string,
    questionSnapshotId: string,
    selectedOptionSnapshotId?: string | null,
    clientTimestamp?: string,
) {
    return request<AttemptAnswerUpdateDto>(
        `/api/attempts/${attemptId}/answers/${questionSnapshotId}`,
        { method: 'PUT' },
        { selectedOptionSnapshotId, clientTimestamp },
    );
}

export async function logAttemptEvent(
    request: ApiRequester,
    attemptId: string,
    payload: { eventType: string; clientTimestamp?: string; details?: string },
) {
    return request<AttemptEventResultDto>(`/api/attempts/${attemptId}/events`, { method: 'POST' }, payload);
}

export async function submitAttempt(request: ApiRequester, attemptId: string, submitType = 'Manual', clientTimestamp?: string) {
    return request<AttemptSummaryDto>(`/api/attempts/${attemptId}/submit`, { method: 'POST' }, { submitType, clientTimestamp });
}

export async function getAttemptHistory(request: ApiRequester) {
    return request<AttemptSummaryDto[]>('/api/attempts/history');
}

export async function getMonitoringAttempts(request: ApiRequester, query?: Record<string, string | number | boolean | null | undefined>) {
    return request<MonitoringAttemptDto[]>(`/api/attempts/monitoring${buildQuery(query)}`);
}
