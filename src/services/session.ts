

import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'clutchmetrics_access_token';
const REFRESH_TOKEN_KEY = 'clutchmetrics_refresh_token';
const USERNAME_KEY = 'clutchmetrics_username';

// Save tokens after a successful login
export async function saveSession(
    accessToken: string,
    refreshToken: string
): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

// Save username for session restoration
export async function saveUsername(
    username: string
): Promise<void> {
    await SecureStore.setItemAsync(USERNAME_KEY, username);
}

// Get stored username
export async function getUsername(): Promise<string | null> {
    return SecureStore.getItemAsync(USERNAME_KEY);
}

// Get the access token for authenticated requests
export async function getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

// Get the refresh token for token renewal
export async function getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

// Remove stored session data when logging out
export async function clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USERNAME_KEY);
}
