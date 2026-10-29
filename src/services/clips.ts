
import { API_BASE_URL } from './auth';
import { getAccessToken } from './session';
import { authenticatedFetch } from './api';

export interface ClipResponse {
    id: number;
    authorId: number;
    authorUsername: string;
    gameCode: string | null;
    gameName: string | null;
    title: string;
    description: string | null;
    videoUrl: string;
    thumbnailUrl: string | null;
    durationSeconds: number | null;
    status: string;
    visibility: string;
    createdAt: string;
    updatedAt: string;
    likeCount?: number;
    commentCount?: number;
    likedByCurrentUser: boolean;
}


export async function getFeedClips(): Promise<ClipResponse[]> {
    const response = await authenticatedFetch(
        '/api/clips/feed',
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        }
    );

    if (response.status === 401) {
        throw new Error(
            'Your session has expired. Please sign in again.'
        );
    }

    if (response.status === 403) {
        throw new Error(
            'You do not have permission to access the feed.'
        );
    }

    if (!response.ok) {
        throw new Error('Could not load the community feed.');
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Invalid feed response from the server.');
    }

    return data as ClipResponse[];
}



export async function toggleClipLike(
    clipId: number,
    alreadyLiked: boolean
): Promise<void> {
    const response = await authenticatedFetch(
        `/api/clips/${clipId}/like`,
        {
            method: alreadyLiked ? 'DELETE' : 'POST',
        }
    );

    if (response.status === 401) {
        throw new Error(
            'Your session has expired. Please sign in again.'
        );
    }

    if (response.status === 403) {
        throw new Error(
            'Could not update the like. Access was denied.'
        );
    }

    if (!response.ok) {
        throw new Error('Could not update clip like.');
    }
}


export interface ClipCommentResponse {
    id: number;
    userId: number;
    username: string;
    content: string;
    createdAt: string;
}


export async function getClipComments(
    clipId: number
): Promise<ClipCommentResponse[]> {
    const response = await authenticatedFetch(
        `/api/clips/${clipId}/comments`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        }
    );

    if (response.status === 401) {
        throw new Error(
            'Your session has expired. Please sign in again.'
        );
    }

    if (response.status === 403) {
        throw new Error(
            'You do not have permission to view these comments.'
        );
    }

    if (!response.ok) {
        throw new Error('Could not load clip comments.');
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Invalid comments response from the server.');
    }

    return data as ClipCommentResponse[];
}



export async function addClipComment(
    clipId: number,
    content: string
): Promise<ClipCommentResponse> {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
        throw new Error('Comment cannot be empty.');
    }

    const response = await authenticatedFetch(
        `/api/clips/${clipId}/comments`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: trimmedContent,
            }),
        }
    );

    const data = await response.json().catch(() => null);

    if (response.status === 401) {
        throw new Error(
            'Your session has expired. Please sign in again.'
        );
    }

    if (response.status === 403) {
        throw new Error(
            'You do not have permission to comment.'
        );
    }

    if (!response.ok) {
        throw new Error(
            data?.message ?? 'Could not publish comment.'
        );
    }

    return data as ClipCommentResponse;
}

export async function deleteClipComment(
    clipId: number,
    commentId: number
): Promise<void> {
    const response = await authenticatedFetch(
        `/api/clips/${clipId}/comments/${commentId}`,
        {
            method: 'DELETE',
        }
    );

    if (response.status === 401) {
        throw new Error(
            'Your session has expired. Please sign in again.'
        );
    }

    if (response.status === 403) {
        throw new Error(
            'You do not have permission to delete this comment.'
        );
    }

    if (!response.ok) {
        throw new Error(
            'Could not delete the comment.'
        );
    }
}

export type ClipReportReason =
    | 'NOT_GAMING_RELATED'
    | 'INAPPROPRIATE_CONTENT'
    | 'SPAM'
    | 'OTHER';

export async function reportClip(
    clipId: number,
    reason: ClipReportReason,
    details: string
): Promise<void> {
    const response = await authenticatedFetch(
        `/api/clips/${clipId}/reports`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reason,
                details: details.trim() || null,
            }),
        }
    );

    if (response.status === 401) {
        throw new Error(
            'Your session has expired. Please sign in again.'
        );
    }

    if (response.status === 403) {
        throw new Error(
            'You do not have permission to report this clip.'
        );
    }

    if (response.status === 409) {
        throw new Error(
            'You have already reported this clip.'
        );
    }

    if (response.status === 400) {
        throw new Error(
            'This clip cannot be reported. Check that it is public and not your own.'
        );
    }

    if (!response.ok) {
        throw new Error(
            'Could not submit your report. Please try again.'
        );
    }
}

