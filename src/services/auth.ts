
const API_BASE_URL = 'http://10.0.2.2:8080';

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
