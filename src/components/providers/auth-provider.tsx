'use client';

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, apiRequest } from '@/lib/api/client';
import { markLogoutStripLoginNext } from '@/lib/auth/routing';
import { clearStoredSession, isExpired, readStoredSession, writeStoredSession } from '@/lib/auth/storage';
import {
    getDashboardRoute,
    mapAuthSession,
    normalizeRole,
    type AppRole,
    type AuthSession,
    type AuthUser,
    type BackendLoginResponse,
    type ChangePasswordPayload,
    type LoginCredentials,
} from '@/lib/auth/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
    status: AuthStatus;
    user: AuthUser | null;
    session: AuthSession | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthSession>;
    logout: () => Promise<void>;
    refreshCurrentUser: () => Promise<AuthUser | null>;
    request: <TResponse>(path: string, init?: RequestInit, body?: unknown) => Promise<TResponse>;
    changePassword: (payload: ChangePasswordPayload) => Promise<void>;
    getDashboardRouteForCurrentUser: () => string;
    hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function createUnauthorizedError(): ApiError {
    return new ApiError(401, 'Authentication is required.');
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [status, setStatus] = useState<AuthStatus>('loading');
    const [session, setSession] = useState<AuthSession | null>(null);
    const sessionRef = useRef<AuthSession | null>(null);

    useEffect(() => {
        sessionRef.current = session;
    }, [session]);

    function applySession(nextSession: AuthSession | null) {
        sessionRef.current = nextSession;
        setSession(nextSession);

        if (nextSession) {
            writeStoredSession(nextSession);
            setStatus('authenticated');
            return;
        }

        clearStoredSession();
        setStatus('unauthenticated');
    }

    async function refreshSession(currentSession?: AuthSession | null): Promise<AuthSession> {
        const activeSession = currentSession ?? sessionRef.current;
        if (!activeSession?.refreshToken) {
            applySession(null);
            throw createUnauthorizedError();
        }

        const response = await apiRequest<BackendLoginResponse>(
            '/api/auth/refresh',
            { method: 'POST' },
            { body: { refreshToken: activeSession.refreshToken } },
        );

        const nextSession = mapAuthSession(response);
        applySession(nextSession);
        return nextSession;
    }

    async function request<TResponse>(path: string, init: RequestInit = {}, body?: unknown): Promise<TResponse> {
        const activeSession = sessionRef.current;
        if (!activeSession) {
            throw createUnauthorizedError();
        }

        let token = activeSession.accessToken;

        if (isExpired(activeSession.accessTokenExpires)) {
            token = (await refreshSession(activeSession)).accessToken;
        }

        try {
            return await apiRequest<TResponse>(path, init, { token, body });
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                token = (await refreshSession(sessionRef.current)).accessToken;
                return apiRequest<TResponse>(path, init, { token, body });
            }

            throw error;
        }
    }

    async function refreshCurrentUser(): Promise<AuthUser | null> {
        if (!sessionRef.current) {
            applySession(null);
            return null;
        }

        try {
            const currentUser = await request<{
                id: string;
                email: string;
                fullName: string;
                role: string;
                studentCode?: string | null;
                department?: string | null;
                avatar?: string | null;
            }>('/api/auth/me');

            const nextSession: AuthSession = {
                ...(sessionRef.current as AuthSession),
                user: {
                    id: currentUser.id,
                    email: currentUser.email,
                    fullName: currentUser.fullName,
                    role: normalizeRole(currentUser.role),
                    studentCode: currentUser.studentCode ?? null,
                    department: currentUser.department ?? null,
                    avatar: currentUser.avatar ?? null,
                },
            };

            applySession(nextSession);
            return nextSession.user;
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                applySession(null);
                return null;
            }

            throw error;
        }
    }

    async function login(credentials: LoginCredentials): Promise<AuthSession> {
        const response = await apiRequest<BackendLoginResponse>(
            '/api/auth/login',
            { method: 'POST' },
            { body: credentials },
        );

        const nextSession = mapAuthSession(response);
        applySession(nextSession);
        return nextSession;
    }

    async function logout(): Promise<void> {
        const activeSession = sessionRef.current;

        if (activeSession?.refreshToken) {
            try {
                let token = activeSession.accessToken;
                if (isExpired(activeSession.accessTokenExpires)) {
                    token = (await refreshSession(activeSession)).accessToken;
                }

                await apiRequest(
                    '/api/auth/logout',
                    { method: 'POST' },
                    {
                        token,
                        body: { refreshToken: activeSession.refreshToken },
                    },
                );
            } catch {
                // Logout should still clear local session when backend revoke fails.
            }
        }

        markLogoutStripLoginNext();
        applySession(null);
        router.replace('/login');
        router.refresh();
    }

    async function changePassword(payload: ChangePasswordPayload): Promise<void> {
        await request('/api/auth/change-password', { method: 'POST' }, payload);
        await logout();
    }

    function getDashboardRouteForCurrentUser(): string {
        if (!sessionRef.current?.user) {
            return '/login';
        }

        return getDashboardRoute(sessionRef.current.user.role);
    }

    function hasRole(role: AppRole): boolean {
        return sessionRef.current?.user.role === role;
    }

    useEffect(() => {
        let cancelled = false;

        async function hydrateAuthState() {
            const storedSession = readStoredSession();
            if (!storedSession) {
                if (!cancelled) {
                    applySession(null);
                }
                return;
            }

            if (!cancelled) {
                setSession(storedSession);
                sessionRef.current = storedSession;
                setStatus('authenticated');
            }

            try {
                if (isExpired(storedSession.refreshTokenExpires)) {
                    throw createUnauthorizedError();
                }

                if (isExpired(storedSession.accessTokenExpires)) {
                    await refreshSession(storedSession);
                } else {
                    await refreshCurrentUser();
                }
            } catch {
                if (!cancelled) {
                    applySession(null);
                }
            }
        }

        hydrateAuthState();

        return () => {
            cancelled = true;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        function handleStorage() {
            const storedSession = readStoredSession();
            sessionRef.current = storedSession;
            setSession(storedSession);
            setStatus(storedSession ? 'authenticated' : 'unauthenticated');
        }

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const value: AuthContextValue = {
        status,
        user: session?.user ?? null,
        session,
        isAuthenticated: status === 'authenticated' && !!session,
        login,
        logout,
        refreshCurrentUser,
        request,
        changePassword,
        getDashboardRouteForCurrentUser,
        hasRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider.');
    }

    return context;
}
