export type AppRole = 'admin' | 'lecturer' | 'student';

export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    role: AppRole;
    studentCode?: string | null;
    department?: string | null;
    avatar?: string | null;
}

export interface AuthSession {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: string;
    refreshTokenExpires: string;
    sessionId: string;
    activeSessionCount: number;
    concurrentSessionDetected: boolean;
    user: AuthUser;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface BackendLoginResponse {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: string;
    refreshTokenExpires: string;
    sessionId: string;
    activeSessionCount: number;
    concurrentSessionDetected: boolean;
    user: {
        id: string;
        email: string;
        fullName: string;
        role: string;
        studentCode?: string | null;
        department?: string | null;
        avatar?: string | null;
    };
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export function normalizeRole(role: string): AppRole {
    const normalized = role.trim().toLowerCase();

    if (normalized === 'admin' || normalized === 'lecturer' || normalized === 'student') {
        return normalized;
    }

    throw new Error(`Unsupported role '${role}'.`);
}

export function mapAuthSession(response: BackendLoginResponse): AuthSession {
    return {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpires: response.accessTokenExpires,
        refreshTokenExpires: response.refreshTokenExpires,
        sessionId: response.sessionId,
        activeSessionCount: response.activeSessionCount,
        concurrentSessionDetected: response.concurrentSessionDetected,
        user: {
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.fullName,
            role: normalizeRole(response.user.role),
            studentCode: response.user.studentCode ?? null,
            department: response.user.department ?? null,
            avatar: response.user.avatar ?? null,
        },
    };
}

export function getDashboardRoute(role: AppRole): string {
    switch (role) {
        case 'admin':
            return '/admin/dashboard';
        case 'lecturer':
            return '/lecturer/dashboard';
        case 'student':
            return '/student/dashboard';
        default:
            return '/login';
    }
}
