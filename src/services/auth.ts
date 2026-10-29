
export const API_BASE_URL = 'http://10.0.2.2:8080';

export type LoginResponse = {
    username: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
};

export async function login(
    email: string,
    password: string
): Promise<LoginResponse> {
    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });
    } catch {
        throw new Error(
            'Could not connect to the server. Check your connection.'
        );
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.message || 'Invalid email or password.'
        );
    }

    if (!data?.accessToken) {
        throw new Error('The server did not return an access token.');
    }

    return data as LoginResponse;
}

export type RefreshTokenResponse = {
    accessToken: string;
    refreshToken: string;
};

export async function refreshTokens(
    refreshToken: string
): Promise<RefreshTokenResponse> {
    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refreshToken,
            }),
        });
    } catch {
        throw new Error(
            'Could not connect to the server.'
        );
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.message ?? 'Could not renew your session.'
        );
    }

    if (
        typeof data?.accessToken !== 'string' ||
        typeof data?.refreshToken !== 'string'
    ) {
        throw new Error(
            'The server returned invalid session tokens.'
        );
    }

    return data as RefreshTokenResponse;
}
