
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'clutchmetrics_access_token';
const REFRESH_TOKEN_KEY = 'clutchmetrics_refresh_token';

// Save tokens after a successful login
export async function saveSession(
    accessToken: string,
    refreshToken: string
): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

// Get the access token for authenticated requests
export async function getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

// Get the refresh token for future token renewal
export async function getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

// Remove stored tokens when logging out
export async function clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
