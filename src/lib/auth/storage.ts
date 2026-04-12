import type { AuthSession } from './types';

const AUTH_STORAGE_KEY = 'examguard.auth.session';

function canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readStoredSession(): AuthSession | null {
    if (!canUseStorage()) {
        return null;
    }

    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as AuthSession;
    } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

export function writeStoredSession(session: AuthSession): void {
    if (!canUseStorage()) {
        return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
    if (!canUseStorage()) {
        return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isExpired(isoDate: string): boolean {
    return new Date(isoDate).getTime() <= Date.now();
}
