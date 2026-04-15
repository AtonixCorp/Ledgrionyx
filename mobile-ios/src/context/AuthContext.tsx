import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { MobileUser } from '../types/api';
import * as authService from '../services/auth';
import { clearTokens } from '../services/storage';

type AuthContextValue = {
    user: MobileUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<MobileUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        authService.bootstrapUser()
            .then((stored) => {
                if (mounted && stored) {
                    setUser(stored);
                }
            })
            .finally(() => {
                if (mounted) {
                    setLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        isAuthenticated: Boolean(user),
        loading,
        login: async (email, password) => {
            const result = await authService.login(email, password);
            if (result.success && result.user) {
                setUser(result.user);
                return { success: true };
            }
            return { success: false, error: result.error };
        },
        logout: async () => {
            await authService.logout();
            await clearTokens();
            setUser(null);
        },
    }), [loading, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}