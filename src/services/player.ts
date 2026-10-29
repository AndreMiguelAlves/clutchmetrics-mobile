
import { authenticatedFetch } from './api';

export interface DiscoverPlayer {
    userId: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
}

export async function getDiscoverPlayers(
    search: string = ''
): Promise<DiscoverPlayer[]> {

    const searchTerm = search.trim();

    const response = await authenticatedFetch(
        `/api/players/discover?search=${encodeURIComponent(searchTerm)}`,
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
            'You do not have permission to discover players.'
        );
    }

    if (!response.ok) {
        throw new Error('Could not load players.');
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        throw new Error(
            'Invalid players response from the server.'
        );
    }

    return data as DiscoverPlayer[];
}

export interface PublicPlayerProfile {
    userId: number;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    youtubeUrl: string | null;
    twitchUrl: string | null;
    tiktokUrl: string | null;
    instagramUrl: string | null;
}

export interface PublicPlayerClip {
    id: number;
    authorId: number;
    title: string;
    gameCode: string | null;
    gameName: string | null;
    thumbnailUrl: string | null;
    durationSeconds: number | null;
    videoUrl: string | null;
}

export async function getPublicPlayerProfile(
    userId: number
): Promise<PublicPlayerProfile> {
    const response = await authenticatedFetch(
        `/api/players/${userId}`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        }
    );

    if (response.status === 404) {
        throw new Error('Player profile not found.');
    }

    if (!response.ok) {
        throw new Error('Unable to load player profile.');
    }

    return response.json() as Promise<PublicPlayerProfile>;
}

export async function getPublicPlayerClips(
    userId: number
): Promise<PublicPlayerClip[]> {
    const response = await authenticatedFetch(
        `/api/clips/players/${userId}`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        }
    );

    if (!response.ok) {
        throw new Error('Unable to load player highlights.');
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Invalid player highlights response.');
    }

    return data as PublicPlayerClip[];
}

export interface UserFollowStats {
    followersCount: number;
    followingCount: number;
    following: boolean;
    ownProfile: boolean;
}

export async function getPlayerFollowStats(
    userId: number
): Promise<UserFollowStats> {
    const response = await authenticatedFetch(
        `/api/follows/${userId}/stats`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        }
    );

    if (!response.ok) {
        throw new Error('Could not load follow stats.');
    }

    return response.json() as Promise<UserFollowStats>;
}

export async function togglePlayerFollow(
    userId: number,
    alreadyFollowing: boolean
): Promise<void> {
    const response = await authenticatedFetch(
        `/api/follows/${userId}`,
        {
            method: alreadyFollowing ? 'DELETE' : 'POST',
        }
    );

    if (response.status === 403) {
        throw new Error(
            'You do not have permission to follow this player.'
        );
    }

    if (!response.ok) {
        throw new Error(
            alreadyFollowing
                ? 'Could not unfollow this player.'
                : 'Could not follow this player.'
        );
    }
}

export interface UserFollowPlayer {
    userId: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
}

export type FollowListType = 'followers' | 'following';

export async function getPlayerFollowList(
    userId: number,
    type: FollowListType
): Promise<UserFollowPlayer[]> {
    const response = await authenticatedFetch(
        `/api/follows/${userId}/${type}`,
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
            'You do not have permission to view this list.'
        );
    }

    if (!response.ok) {
        throw new Error(
            'Could not load the player list.'
        );
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        throw new Error(
            'Invalid player list response from the server.'
        );
    }

    return data as UserFollowPlayer[];
}
