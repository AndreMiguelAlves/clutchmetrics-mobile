
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import PlayerFollowModal from '../components/PlayerFollowModal';
import type { FollowListType } from '../services/player';
import { API_BASE_URL } from '../services/auth';
import PlayerSocialLinks from '../components/PlayerSocialLinks';

import {
    getPublicPlayerProfile,
    getPublicPlayerClips,
    getPlayerFollowStats,
    togglePlayerFollow,
} from '../services/player';

import type {
    PublicPlayerProfile,
    PublicPlayerClip,
    UserFollowStats,
} from '../services/player';

type PlayerProfileScreenProps = {
    userId: number;
    onBack: () => void;
    onSelectPlayer: (userId: number) => void;
    onOpenClip?: (clipId: number) => void;
};

function resolveAvatarUrl(url: string | null): string | null {
    if (!url || url.includes('example.com')) {
        return null;
    }

    if (url.startsWith('/')) {
        return `${API_BASE_URL}${url}`;
    }

    return url
        .replace(
            /^http:\/\/(localhost|127\.0\.0\.1):8080(?=\/|$)/i,
            API_BASE_URL
        )
        .replace(
            /^http:\/\/(localhost|127\.0\.0\.1):3000(?=\/|$)/i,
            'http://10.0.2.2:3000'
        );
}

export default function PlayerProfileScreen({
                                                userId,
                                                onBack,
                                                onSelectPlayer,
                                                onOpenClip,
                                            }: PlayerProfileScreenProps) {


    const [profile, setProfile] =
        useState<PublicPlayerProfile | null>(null);

    const [clips, setClips] =
        useState<PublicPlayerClip[]>([]);

    const [loading, setLoading] = useState(true);
    const [clipsLoading, setClipsLoading] = useState(true);

    const [error, setError] = useState('');
    const [clipsError, setClipsError] = useState('');
    const [avatarFailed, setAvatarFailed] = useState(false);
    const [followStats, setFollowStats] =
        useState<UserFollowStats | null>(null);

    const [followLoading, setFollowLoading] = useState(false);

    const [followError, setFollowError] = useState('');
    const [followListType, setFollowListType] =
        useState<FollowListType | null>(null);

    useEffect(() => {
        let active = true;

        setLoading(true);
        setClipsLoading(true);
        setError('');
        setClipsError('');
        setProfile(null);
        setClips([]);
        setAvatarFailed(false);

        async function loadProfile() {
            try {
                const data = await getPublicPlayerProfile(userId);

                if (active) {
                    setProfile(data);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Unable to load player profile.'
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        async function loadClips() {
            try {
                const data = await getPublicPlayerClips(userId);

                if (active) {
                    setClips(data);
                }
            } catch (err) {
                if (active) {
                    setClipsError(
                        err instanceof Error
                            ? err.message
                            : 'Unable to load player highlights.'
                    );
                }
            } finally {
                if (active) {
                    setClipsLoading(false);
                }
            }
        }

        void loadProfile();
        void loadClips();

        return () => {
            active = false;
        };
    }, [userId]);


    useEffect(() => {
        let active = true;

        setFollowStats(null);
        setFollowError('');

        async function loadFollowStats() {
            try {
                const data = await getPlayerFollowStats(userId);

                if (active) {
                    setFollowStats(data);
                }
            } catch (err) {
                if (active) {
                    setFollowError(
                        err instanceof Error
                            ? err.message
                            : 'Could not load follow statistics.'
                    );
                }
            }
        }

        void loadFollowStats();

        return () => {
            active = false;
        };
    }, [userId]);


    const avatarUrl = profile
        ? resolveAvatarUrl(profile.avatarUrl)
        : null;

    const gamesCount = new Set(
        clips
            .map((clip) => clip.gameCode ?? clip.gameName)
            .filter(Boolean)
    ).size;


    async function handleToggleFollow() {
        if (
            !followStats ||
            followStats.ownProfile ||
            followLoading
        ) {
            return;
        }

        const alreadyFollowing = followStats.following;

        setFollowLoading(true);
        setFollowError('');

        try {
            await togglePlayerFollow(userId, alreadyFollowing);

            setFollowStats((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    following: !alreadyFollowing,
                    followersCount: Math.max(
                        0,
                        current.followersCount +
                        (alreadyFollowing ? -1 : 1)
                    ),
                };
            });
        } catch (err) {
            setFollowError(
                err instanceof Error
                    ? err.message
                    : 'Could not update follow status.'
            );
        } finally {
            setFollowLoading(false);
        }
    }


    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={onBack}
                    style={styles.backButton}
                    accessibilityRole="button"
                    accessibilityLabel="Back to players"
                >
                    <Ionicons
                        name="arrow-back"
                        size={22}
                        color="#A18BFF"
                    />
                </Pressable>

                <View>
                    <Text style={styles.brand}>
                        CLUTCHMETRICS
                    </Text>

                    <Text style={styles.heading}>
                        Player Profile
                    </Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator
                        size="large"
                        color="#A18BFF"
                    />
                    <Text style={styles.message}>
                        Loading player profile...
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.error}>
                        {error}
                    </Text>
                </View>
            ) : profile ? (
                <ScrollView
                    contentContainerStyle={styles.content}
                >
                    {/* Player profile */}
                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarLetter}>
                                {profile.username
                                    .charAt(0)
                                    .toUpperCase()}
                            </Text>

                            {avatarUrl && !avatarFailed && (
                                <Image
                                    source={{ uri: avatarUrl }}
                                    style={styles.avatarImage}
                                    onError={() =>
                                        setAvatarFailed(true)
                                    }
                                />
                            )}
                        </View>

                        <Text style={styles.eyebrow}>
                            CLUTCHMETRICS PLAYER
                        </Text>

                        <Text style={styles.displayName}>
                            {profile.displayName ||
                                profile.username}
                        </Text>

                        <Text style={styles.username}>
                            @{profile.username}
                        </Text>

                        <View style={styles.divider} />

                        <Text style={styles.bio}>
                            {profile.bio ||
                                'No biography available yet.'}
                        </Text>
                    </View>

                    <PlayerSocialLinks profile={profile} />

                    {/* Follow statistics */}
                    {followStats && (
                        <View style={styles.followSection}>

                            <View style={styles.followStatsRow}>
                            {/* Followers */}
                            <Pressable
                                style={styles.followStatCard}
                                onPress={() => setFollowListType('followers')}
                                accessibilityRole="button"
                                accessibilityLabel="View followers"
                            >
                                <Text style={styles.followNumber}>
                                    {followStats.followersCount}
                                </Text>

                                <Text style={styles.followLabel}>
                                    Followers
                                </Text>

                                <Ionicons
                                    name="chevron-forward"
                                    size={15}
                                    color="#A18BFF"
                                />
                            </Pressable>

                            {/* Following */}
                            <Pressable
                                style={styles.followStatCard}
                                onPress={() => setFollowListType('following')}
                                accessibilityRole="button"
                                accessibilityLabel="View following"
                            >
                                <Text style={styles.followNumber}>
                                    {followStats.followingCount}
                                </Text>

                                <Text style={styles.followLabel}>
                                    Following
                                </Text>

                                <Ionicons
                                    name="chevron-forward"
                                    size={15}
                                    color="#A18BFF"
                                />
                            </Pressable>
                        </View>



                    {!followStats.ownProfile && (
                                <Pressable
                                    onPress={() => void handleToggleFollow()}
                                    disabled={followLoading}
                                    style={[
                                        styles.followButton,
                                        followStats.following &&
                                        styles.followingButton,
                                    ]}
                                >
                                    <Ionicons
                                        name={
                                            followStats.following
                                                ? 'checkmark'
                                                : 'person-add-outline'
                                        }
                                        size={18}
                                        color="#FFFFFF"
                                    />

                                    <Text style={styles.followButtonText}>
                                        {followLoading
                                            ? 'Updating...'
                                            : followStats.following
                                                ? 'Following'
                                                : 'Follow Player'}
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    )}

                    {followError ? (
                        <Text style={styles.error}>
                            {followError}
                        </Text>
                    ) : null}


                    {/* Published highlights */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Published Highlights
                        </Text>

                        <Text style={styles.sectionDescription}>
                            Explore this player's competitive moments.
                        </Text>
                    </View>

                    {clipsLoading ? (
                        <ActivityIndicator
                            color="#A18BFF"
                            size="small"
                        />
                    ) : clipsError ? (
                        <Text style={styles.error}>
                            {clipsError}
                        </Text>
                    ) : (
                        <>
                            <View style={styles.statsRow}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statNumber}>
                                        {clips.length}
                                    </Text>

                                    <Text style={styles.statLabel}>
                                        Public Clips
                                    </Text>
                                </View>

                                <View style={styles.statCard}>
                                    <Text style={styles.statNumber}>
                                        {gamesCount}
                                    </Text>

                                    <Text style={styles.statLabel}>
                                        Games Featured
                                    </Text>
                                </View>
                            </View>

                            {clips.length === 0 ? (
                                <Text style={styles.message}>
                                    This player hasn't published
                                    any clips yet.
                                </Text>
                            ) : (
                                clips.map((clip) => (
                                    <Pressable
                                        key={clip.id}
                                        style={styles.clipCard}
                                        onPress={() => onOpenClip?.(clip.id)}
                                        disabled={!onOpenClip}
                                        accessibilityRole="button"
                                        accessibilityLabel={`View ${clip.title} in Feed`}
                                    >
                                        <View style={styles.clipIcon}>
                                            <Ionicons
                                                name="play-circle-outline"
                                                size={24}
                                                color="#A18BFF"
                                            />
                                        </View>

                                        <View style={styles.clipInfo}>
                                            <Text style={styles.clipTitle}>
                                                {clip.title}
                                            </Text>

                                            <Text style={styles.clipGame}>
                                                {clip.gameName ||
                                                    'Gaming'}
                                            </Text>

                                            {clip.durationSeconds != null && (
                                                <Text
                                                    style={styles.clipDuration}
                                                >
                                                    {clip.durationSeconds}s
                                                </Text>
                                            )}
                                        </View>
                                    </Pressable>
                                ))
                            )}
                        </>
                    )}
        </ScrollView>
    ) : null}


            {followListType !== null && (
                <PlayerFollowModal
                    userId={userId}
                    type={followListType}
                    onClose={() => setFollowListType(null)}
                    onSelectPlayer={(selectedUserId) => {
                        setFollowListType(null);
                        onSelectPlayer(selectedUserId);
                    }}
                />
            )}

</SafeAreaView>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#080B13',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#252D43',
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#111724',
        alignItems: 'center',
        justifyContent: 'center',
    },

    brand: {
        color: '#8196C4',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 5,
    },

    heading: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '800',
    },

    content: {
        padding: 20,
        paddingBottom: 45,
    },

    profileCard: {
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#252D43',
        borderRadius: 16,
        padding: 22,
        alignItems: 'center',
    },

    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#2A2148',
        borderWidth: 2,
        borderColor: '#7545F5',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: 20,
    },

    avatarLetter: {
        color: '#C4B5FD',
        fontSize: 36,
        fontWeight: '800',
    },

    avatarImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },

    eyebrow: {
        color: '#A18BFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 10,
    },

    displayName: {
        color: '#FFFFFF',
        fontSize: 25,
        fontWeight: '800',
        textAlign: 'center',
    },

    username: {
        color: '#94A3C6',
        fontSize: 14,
        marginTop: 6,
    },

    divider: {
        height: 1,
        backgroundColor: '#252D43',
        width: '100%',
        marginVertical: 20,
    },

    bio: {
        color: '#CBD5E1',
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
    },

    sectionHeader: {
        marginTop: 30,
        marginBottom: 18,
    },

    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 21,
        fontWeight: '800',
        marginBottom: 7,
    },

    sectionDescription: {
        color: '#94A3C6',
        fontSize: 13,
        lineHeight: 20,
    },

    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },

    statCard: {
        flex: 1,
        backgroundColor: '#111724',
        padding: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#252D43',
        alignItems: 'center',
    },

    statNumber: {
        color: '#A18BFF',
        fontSize: 24,
        fontWeight: '800',
    },

    statLabel: {
        color: '#94A3C6',
        fontSize: 12,
        marginTop: 5,
    },

    clipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#252D43',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        gap: 14,
    },

    clipIcon: {
        width: 46,
        height: 46,
        borderRadius: 10,
        backgroundColor: '#211A3D',
        alignItems: 'center',
        justifyContent: 'center',
    },

    clipInfo: {
        flex: 1,
        gap: 5,
    },

    clipTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },

    clipGame: {
        color: '#A18BFF',
        fontSize: 12,
        fontWeight: '600',
    },

    clipDuration: {
        color: '#8292B3',
        fontSize: 11,
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },

    message: {
        color: '#94A3C6',
        fontSize: 13,
        lineHeight: 21,
        textAlign: 'center',
        marginTop: 15,
    },

    error: {
        color: '#FB7185',
        fontSize: 14,
        textAlign: 'center',
        padding: 15,
    },

    followSection: {
        marginTop: 18,
        marginBottom: 8,
        gap: 14,
    },

    followStatsRow: {
        flexDirection: 'row',
        gap: 12,
    },

    followStatCard: {
        flex: 1,
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#252D43',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
    },

    followNumber: {
        color: '#A18BFF',
        fontSize: 24,
        fontWeight: '800',
    },

    followLabel: {
        color: '#94A3C6',
        fontSize: 12,
        marginTop: 5,
    },

    followButton: {
        backgroundColor: '#7545F5',
        borderRadius: 11,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 9,
    },

    followingButton: {
        backgroundColor: '#292047',
        borderWidth: 1,
        borderColor: '#7545F5',
    },

    followButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },

});
