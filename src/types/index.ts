// ─── User & Auth ───
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'lecturer' | 'student';
    avatar?: string;
    studentId?: string;
    department?: string;
    status: 'enabled' | 'disabled' | 'locked';
    createdAt: string;
    lastLogin?: string;
}

// ─── Subject ───
export interface Subject {
    id: string;
    code: string;
    name: string;
    department: string;
    lecturerId: string;
    lecturerName: string;
    questionCount: number;
    examCount: number;
    status: 'enabled' | 'disabled';
    createdAt: string;
}

// ─── Question ───
export interface Question {
    id: string;
    subjectId: string;
    subjectName: string;
    topicId: string;
    topicName: string;
    content: string;
    options: QuestionOption[];
    correctOptionId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    usageCount: number;
}

export interface QuestionOption {
    id: string;
    label: string;
    content: string;
}

// ─── Topic ───
export interface Topic {
    id: string;
    subjectId: string;
    name: string;
    questionCount: number;
}

// ─── Exam ───
export interface Exam {
    id: string;
    title: string;
    subjectId: string;
    subjectName: string;
    lecturerId: string;
    lecturerName: string;
    description: string;
    questionCount: number;
    duration: number; // minutes
    totalPoints: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResult: boolean;
    status: 'draft' | 'scheduled' | 'active' | 'completed' | 'archived';
    sessions: ExamSession[];
    createdAt: string;
    updatedAt: string;
}

export interface ExamSession {
    id: string;
    examId: string;
    name: string;
    startTime: string;
    endTime: string;
    maxParticipants: number;
    currentParticipants: number;
    status: 'scheduled' | 'active' | 'completed';
    password?: string;
}

// ─── Attempt ───
export interface ExamAttempt {
    id: string;
    examId: string;
    sessionId: string;
    studentId: string;
    studentName: string;
    studentCode: string;
    startedAt: string;
    submittedAt?: string;
    score?: number;
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers?: number;
    status: 'in_progress' | 'submitted' | 'auto_submitted' | 'flagged';
    submitType?: 'manual' | 'auto' | 'forced';
    flags: AttemptFlag[];
    behaviorLogs: BehaviorLog[];
    timeSpent: number; // seconds
}

export interface AttemptFlag {
    id: string;
    type: 'tab_switch' | 'excessive_idle' | 'fast_completion' | 'pattern_detected';
    description: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
}

// ─── Behavior Log ───
export interface BehaviorLog {
    id: string;
    attemptId: string;
    event: 'tab_leave' | 'tab_return' | 'page_reload' | 'copy_attempt' | 'paste_attempt' | 'right_click' | 'idle_detected' | 'exam_start' | 'exam_submit' | 'answer_change';
    timestamp: string;
    details?: string;
    questionId?: string;
}

// ─── Exam Taking (Student View) ───
export interface ExamQuestion {
    id: string;
    index: number;
    content: string;
    options: QuestionOption[];
    selectedOptionId?: string;
    flagged?: boolean;
}

export interface ExamState {
    examId: string;
    sessionId: string;
    attemptId: string;
    title: string;
    totalQuestions: number;
    duration: number;
    timeRemaining: number;
    questions: ExamQuestion[];
    currentQuestionIndex: number;
    status: 'in_progress' | 'submitting' | 'submitted';
    autoSaving: boolean;
}

// ─── Stats ───
export interface DashboardStat {
    label: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: string;
}

// ─── Activity Log ───
export interface ActivityLog {
    id: string;
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    target: string;
    details?: string;
    timestamp: string;
    ip?: string;
}

// ─── Notification ───
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
    link?: string;
}

// ─── System Settings ───
export interface SystemSettings {
    siteName: string;
    maxLoginAttempts: number;
    sessionTimeout: number;
    tabSwitchWarning: boolean;
    maxTabSwitches: number;
    autoSubmitOnTabLimit: boolean;
    allowCopyPaste: boolean;
    showResultToStudent: boolean;
    maintenanceMode: boolean;
}
