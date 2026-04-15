import type { LoginResult, MobileUser } from '../types/api';
import { authApi, getErrorMessage } from './api';
import { clearStoredOrganization, clearStoredUser, getStoredUser, setStoredUser, setTokens } from './storage';

function mapUser(me: any): MobileUser {
    return {
        id: me.id,
        name: me.username || me.email?.split('@')[0] || 'User',
        email: me.email,
        avatar: (me.username || me.email || 'U').charAt(0).toUpperCase(),
        account_type: me.account_type || 'enterprise',
        country: me.country || '',
        phone: me.phone || '',
    };
}

export async function bootstrapUser() {
    return getStoredUser();
}

export async function fetchMe() {
    const response = await authApi.get('/api/auth/me/');
    const user = mapUser(response.data);
    await setStoredUser(user);
    return user;
}

export async function login(email: string, password: string): Promise<LoginResult> {
    try {
        const tokenRes = await authApi.post('/api/auth/token/', {
            username: email,
            password,
        });

        await setTokens(tokenRes.data.access, tokenRes.data.refresh);
        const meRes = await authApi.get('/api/auth/me/', {
            headers: {
                Authorization: `Bearer ${tokenRes.data.access}`,
            },
        });

        const user = mapUser(meRes.data);
        await setStoredUser(user);
        return { success: true, user };
    } catch (error) {
        return { success: false, error: getErrorMessage(error, 'Login failed') };
    }
}

export async function logout() {
    await clearStoredUser();
    await clearStoredOrganization();
}