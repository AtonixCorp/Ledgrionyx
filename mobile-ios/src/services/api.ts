import axios from 'axios';
import type { AxiosError } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './storage';

export const API_ROOT = 'http://127.0.0.1:8000';

export const api = axios.create({
    baseURL: `${API_ROOT}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authApi = axios.create({
    baseURL: API_ROOT,
    headers: {
        'Content-Type': 'application/json',
    },
});

function flattenError(data: unknown, fallback: string) {
    if (!data || typeof data !== 'object') {
        return fallback;
    }

    const record = data as Record<string, unknown>;
    if (typeof record.detail === 'string' && record.detail) {
        return record.detail;
    }

    const parts = Object.entries(record).map(([key, value]) => {
        if (Array.isArray(value)) {
            return `${key}: ${value.join(', ')}`;
        }
        return `${key}: ${String(value)}`;
    });

    return parts.join(' | ') || fallback;
}

export function getErrorMessage(error: unknown, fallback = 'Request failed') {
    const err = error as AxiosError;
    return flattenError(err.response?.data, err.message || fallback);
}

api.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const original = error.config as (typeof error.config & { _retried?: boolean }) | undefined;

        if (status === 401 && !original?._retried) {
            original._retried = true;
            const refresh = await getRefreshToken();
            if (refresh) {
                try {
                    const response = await authApi.post('/api/auth/token/refresh/', { refresh });
                    await setTokens(response.data.access, refresh);
                    if (original?.headers) {
                        original.headers.Authorization = `Bearer ${response.data.access}`;
                    }
                    return original ? api(original) : Promise.reject(error);
                } catch {
                    await clearTokens();
                }
            }
        }

        return Promise.reject(error);
    },
);