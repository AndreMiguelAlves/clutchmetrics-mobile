
import { API_BASE_URL, refreshTokens } from './auth';

import {
    getAccessToken,
    getRefreshToken,
    saveSession,
} from './session';

// Prevent multiple simultaneous token refresh requests
let refreshPromise: Promise<string> | null = null;

async function renewAccessToken(): Promise<string> {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const refreshToken = await getRefreshToken();

            if (!refreshToken) {
                throw new Error(
                    'Your session has expired. Please sign in again.'
                );
            }

            // Request a new pair of tokens from the backend
            const tokens = await refreshTokens(refreshToken);

            // Save both new tokens because the backend rotates them
            await saveSession(
                tokens.accessToken,
                tokens.refreshToken
            );

            return tokens.accessToken;
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

export async function authenticatedFetch(
    path: string,
    options: RequestInit = {}
): Promise<Response> {
    const accessToken = await getAccessToken();

    if (!accessToken) {
        throw new Error(
            'No active session. Please sign in.'
        );
    }

    // Send a request using the supplied access token
    const sendRequest = (token: string): Promise<Response> => {
        const headers = new Headers(options.headers);

        headers.set('Authorization', `Bearer ${token}`);

        return fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers,
        });
    };

    // First attempt
    let response = await sendRequest(accessToken);

    // A 401 response means authentication is required
    if (response.status !== 401) {
        return response;
    }

    // Check whether another request has already renewed the token
    const storedToken = await getAccessToken();

    const newAccessToken =
        storedToken && storedToken !== accessToken
            ? storedToken
            : await renewAccessToken();

    // Retry the original request only once
    response = await sendRequest(newAccessToken);

    return response;
}
