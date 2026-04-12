import type { AppRole } from './types';
import { getDashboardRoute } from './types';

const LOGOUT_STRIP_NEXT_KEY = 'examguard.auth.logoutStripNext';

/**
 * Gọi trước khi xóa session khi đăng xuất để route guard không gắn `?next=` từ URL admin cũ.
 */
export function markLogoutStripLoginNext(): void {
    if (typeof window === 'undefined') {
        return;
    }
    sessionStorage.setItem(LOGOUT_STRIP_NEXT_KEY, '1');
}

/** Trả về true một lần nếu vừa logout; xóa cờ để không ảnh hưởng lần sau. */
export function consumeLogoutStripLoginNext(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }
    if (sessionStorage.getItem(LOGOUT_STRIP_NEXT_KEY) !== '1') {
        return false;
    }
    sessionStorage.removeItem(LOGOUT_STRIP_NEXT_KEY);
    return true;
}

/** Dọn cờ còn sót khi đã vào /login mà shell không kịp consume (unmount). */
export function clearLogoutStripLoginNext(): void {
    if (typeof window === 'undefined') {
        return;
    }
    sessionStorage.removeItem(LOGOUT_STRIP_NEXT_KEY);
}

const ROLE_PATH_PREFIX: Record<AppRole, string> = {
    admin: '/admin',
    lecturer: '/lecturer',
    student: '/student',
};

const SHARED_PREFIXES = ['/profile'] as const;

/**
 * Uses `next` only when it matches the user's role (or a shared path).
 * Prevents e.g. lecturer being sent to /admin/... after login because of a stale ?next from a prior admin session.
 */
export function getSafePostLoginPath(next: string | null | undefined, role: AppRole): string {
    const fallback = getDashboardRoute(role);
    if (next == null || next === '') {
        return fallback;
    }

    let decoded = next.trim();
    try {
        decoded = decodeURIComponent(decoded);
    } catch {
        return fallback;
    }

    if (!decoded.startsWith('/') || decoded.startsWith('//')) {
        return fallback;
    }

    if (decoded.startsWith('/login')) {
        return fallback;
    }

    for (const prefix of SHARED_PREFIXES) {
        if (decoded === prefix || decoded.startsWith(`${prefix}/`)) {
            return decoded;
        }
    }

    const rolePrefix = ROLE_PATH_PREFIX[role];
    if (decoded === rolePrefix || decoded.startsWith(`${rolePrefix}/`)) {
        return decoded;
    }

    return fallback;
}
