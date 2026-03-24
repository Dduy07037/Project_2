// ─── Format Helpers ───

export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(d);
}

export function formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

export function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} phút`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`;
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat('vi-VN').format(num);
}

export function formatPercent(value: number, total: number): string {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
}

// ─── Status Helpers ───

export type ExamStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'archived';
export type AttemptStatus = 'in_progress' | 'submitted' | 'auto_submitted' | 'flagged';
export type UserRole = 'admin' | 'lecturer' | 'student';

export function getStatusColor(status: string): string {
    const map: Record<string, string> = {
        draft: 'text-text-muted',
        scheduled: 'text-info',
        active: 'text-success',
        completed: 'text-text-secondary',
        archived: 'text-text-disabled',
        in_progress: 'text-accent',
        submitted: 'text-success',
        auto_submitted: 'text-warning',
        flagged: 'text-danger',
        enabled: 'text-success',
        disabled: 'text-danger',
        locked: 'text-danger',
    };
    return map[status] || 'text-text-secondary';
}

export function getStatusLabel(status: string): string {
    const map: Record<string, string> = {
        draft: 'Nháp',
        scheduled: 'Đã lên lịch',
        active: 'Đang diễn ra',
        completed: 'Đã kết thúc',
        archived: 'Lưu trữ',
        in_progress: 'Đang làm',
        submitted: 'Đã nộp',
        auto_submitted: 'Tự động nộp',
        flagged: 'Cần xem xét',
        enabled: 'Hoạt động',
        disabled: 'Vô hiệu',
        locked: 'Đã khóa',
    };
    return map[status] || status;
}

// ─── Misc ───

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 11);
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
