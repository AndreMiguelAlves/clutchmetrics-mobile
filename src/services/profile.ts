
import { authenticatedFetch } from './api';
import type { ImagePickerAsset } from 'expo-image-picker';

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

const MAX_AVATAR_SIZE = 3 * 1024 * 1024;

export async function uploadMyAvatar(
    image: ImagePickerAsset
): Promise<MyProfile> {

    const supportedTypes: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
    };

    const mimeType = image.mimeType?.toLowerCase();

    if (!mimeType || !supportedTypes[mimeType]) {
        throw new Error(
            'Please choose a JPG, PNG or WebP image.'
        );
    }

    if (
        image.fileSize !== undefined &&
        image.fileSize > MAX_AVATAR_SIZE
    ) {
        throw new Error(
            'Profile picture must be smaller than 3 MB.'
        );
    }

    const extension = supportedTypes[mimeType];

    const formData = new FormData();

    formData.append(
        'file',
        {
            uri: image.uri,
            name: `avatar.${extension}`,
            type: mimeType,
        } as unknown as Blob
    );

    const response = await authenticatedFetch(
        '/api/profile/me/avatar',
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => null);

        throw new Error(
            errorData?.message ??
            'Could not upload profile picture.'
        );
    }

    return response.json() as Promise<MyProfile>;
}

export async function removeMyAvatar():
    Promise<MyProfile> {

    const response = await authenticatedFetch(
        '/api/profile/me/avatar',
        {
            method: 'DELETE',
        }
    );

    if (!response.ok) {
        const errorData = await response
            .json()
            .catch(() => null);

        throw new Error(
            errorData?.message ??
            'Could not remove profile picture.'
        );
    }

    return response.json() as Promise<MyProfile>;
}
