import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MobileUser, Organization } from '../types/api';

const KEYS = {
    accessToken: 'mobile.accessToken',
    refreshToken: 'mobile.refreshToken',
    user: 'mobile.user',
    organization: 'mobile.organization',
};

export async function getAccessToken() {
    return AsyncStorage.getItem(KEYS.accessToken);
}

export async function getRefreshToken() {
    return AsyncStorage.getItem(KEYS.refreshToken);
}

export async function setTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.multiSet([
        [KEYS.accessToken, accessToken],
        [KEYS.refreshToken, refreshToken],
    ]);
}

export async function clearTokens() {
    await AsyncStorage.multiRemove([KEYS.accessToken, KEYS.refreshToken]);
}

export async function setStoredUser(user: MobileUser) {
    await AsyncStorage.setItem(KEYS.user, JSON.stringify(user));
}

export async function getStoredUser(): Promise<MobileUser | null> {
    const raw = await AsyncStorage.getItem(KEYS.user);
    return raw ? JSON.parse(raw) : null;
}

export async function clearStoredUser() {
    await AsyncStorage.removeItem(KEYS.user);
}

export async function setStoredOrganization(org: Organization) {
    await AsyncStorage.setItem(KEYS.organization, JSON.stringify(org));
}

export async function getStoredOrganization(): Promise<Organization | null> {
    const raw = await AsyncStorage.getItem(KEYS.organization);
    return raw ? JSON.parse(raw) : null;
}

export async function clearStoredOrganization() {
    await AsyncStorage.removeItem(KEYS.organization);
}