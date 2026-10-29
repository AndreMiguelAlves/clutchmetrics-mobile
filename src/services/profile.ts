
import { authenticatedFetch } from './api';

export interface MyProfile {
    id: number;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
}

export interface UpdateMyProfileRequest {
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
}

export async function getMyProfile():
    Promise<MyProfile> {

    const response = await authenticatedFetch(
        '/api/profile/me'
    );

    if (!response.ok) {
        throw new Error(
            'Could not load your profile.'
        );
    }

    return response.json() as Promise<MyProfile>;
}

export async function updateMyProfile(
    data: UpdateMyProfileRequest
): Promise<MyProfile> {

    const response = await authenticatedFetch(
        '/api/profile/me',
        {
            method: 'PUT',
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
            'Could not update profile.'
        );
    }

    return response.json() as Promise<MyProfile>;
}
