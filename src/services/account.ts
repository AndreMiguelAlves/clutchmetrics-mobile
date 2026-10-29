
import { authenticatedFetch } from './api';

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export async function changePassword(
    data: ChangePasswordRequest
): Promise<string> {

    const response = await authenticatedFetch(
        '/api/auth/change-password',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => null);

        throw new Error(
            errorData?.message ??
            'Could not change password.'
        );
    }

    return response.text();
}
