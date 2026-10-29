
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

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    id: number;
    username: string;
    email: string;
    enabled: boolean;
}

export async function register(
    data: RegisterRequest
): Promise<RegisterResponse> {

    let response: Response;

    try {
        response = await fetch(
            `${API_BASE_URL}/api/auth/register`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }
        );
    } catch {
        throw new Error(
            'Could not connect to the server. Check your connection.'
        );
    }

    const responseData = await response
        .json()
        .catch(() => null);

    if (!response.ok) {
        throw new Error(
            responseData?.message ||
            'Could not create account.'
        );
    }

    return responseData as RegisterResponse;
}

export async function forgotPassword(
    email: string
): Promise<string> {

    let response: Response;

    try {
        response = await fetch(
            `${API_BASE_URL}/api/auth/forgot-password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                }),
            }
        );
    } catch {
        throw new Error(
            'Could not connect to the server. Check your connection.'
        );
    }

    const message = await response.text();

    if (!response.ok) {
        let errorMessage = 'Could not send recovery instructions.';

        try {
            const errorData = JSON.parse(message);
            errorMessage = errorData.message || errorMessage;
        } catch {
            // Keep the default error message
        }

        throw new Error(errorMessage);
    }

    return message;
}
