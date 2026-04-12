export class ApiError extends Error {
    status: number;
    details?: unknown;

    constructor(status: number, message: string, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

function normalizeBaseUrl(baseUrl: string | undefined): string {
    if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured.');
    }

    return baseUrl.replace(/\/+$/, '');
}

function buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    return text || null;
}

export async function apiRequest<TResponse>(
    path: string,
    init: RequestInit = {},
    options?: {
        token?: string | null;
        body?: unknown;
    },
): Promise<TResponse> {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');

    let body = init.body;
    if (options && 'body' in options && options.body !== undefined) {
        headers.set('Content-Type', 'application/json');
        body = JSON.stringify(options.body);
    }

    if (options?.token) {
        headers.set('Authorization', `Bearer ${options.token}`);
    }

    const response = await fetch(buildUrl(path), {
        ...init,
        headers,
        body,
    });

    if (response.status === 204) {
        return undefined as TResponse;
    }

    const payload = await parseResponseBody(response);

    if (!response.ok) {
        const message =
            typeof payload === 'object' &&
            payload !== null &&
            'message' in payload &&
            typeof payload.message === 'string'
                ? payload.message
                : `Request failed with status ${response.status}.`;

        throw new ApiError(response.status, message, payload);
    }

    return payload as TResponse;
}
