
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { getFeedClips } from '../services/clips';
import type { ClipResponse } from '../services/clips';
import ClipVideoPlayer from '../components/ClipVideoPlayer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { toggleClipLike } from '../services/clips';
import { getClipComments, addClipComment } from '../services/clips';
import type { ClipCommentResponse } from '../services/clips';
import { deleteClipComment } from '../services/clips';
import { getUsername } from '../services/session';
import ClipReportModal from '../components/ClipReportModal';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
    NavigationProp,
    RouteProp,
} from '@react-navigation/native';

type FeedRouteParams = {
    Feed: { clipId: number } | undefined;
};

export default function FeedScreen() {
    const [clips, setClips] = useState<ClipResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [likingClipId, setLikingClipId] = useState<number | null>(null);
    const [openCommentsClipId, setOpenCommentsClipId] =
        useState<number | null>(null);
    const [currentUsername, setCurrentUsername] = useState('');

    const [deletingCommentId, setDeletingCommentId] =
        useState<number | null>(null);
    const [commentsByClip, setCommentsByClip] =
        useState<Record<number, ClipCommentResponse[]>>({});

    const [loadingCommentsClipId, setLoadingCommentsClipId] =
        useState<number | null>(null);
    const [commentText, setCommentText] = useState('');
    const [postingComment, setPostingComment] = useState(false);
    const [selectedGame, setSelectedGame] = useState('ALL');
    const [reportClipId, setReportClipId] = useState<number | null>(null);

    const [openMoreMenuClipId, setOpenMoreMenuClipId] =
        useState<number | null>(null);
    const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
    const route = useRoute<
        RouteProp<FeedRouteParams, 'Feed'>
    >();

    const navigation = useNavigation<
        NavigationProp<FeedRouteParams, 'Feed'>
    >();

    const selectedClipId = route.params?.clipId;

    useEffect(() => {
        let mounted = true;

        async function loadFeed() {
            try {
                const data = await getFeedClips();

                if (mounted) {
                    setClips(data);
                }
            } catch (err) {
                if (mounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Could not load the feed.'
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        void loadFeed();

        return () => {
            mounted = false;
        };
    }, []);

    // Filter clips by title, game or description
    const search = searchTerm.trim().toLowerCase();

    const filteredClips = clips.filter((clip) => {
        const matchesSearch =
            clip.title.toLowerCase().includes(search) ||
            (clip.gameName ?? '').toLowerCase().includes(search) ||
            (clip.description ?? '').toLowerCase().includes(search);

        const matchesGame =
            selectedGame === 'ALL' ||
            clip.gameName === selectedGame;

        return matchesSearch && matchesGame;
    });

    const displayedClips =
        selectedClipId != null
            ? clips.filter(
                (clip) => clip.id === selectedClipId
            )
            : filteredClips;


    async function handleLike(clip: ClipResponse) {
        if (likingClipId !== null) {
            return;
        }

        setLikingClipId(clip.id);

        const alreadyLiked = clip.likedByCurrentUser;

        try {
            await toggleClipLike(clip.id, alreadyLiked);

            setClips((current) =>
                current.map((item) =>
                    item.id === clip.id
                        ? {
                            ...item,
                            likedByCurrentUser: !alreadyLiked,
                            likeCount: Math.max(
                                0,
                                (item.likeCount ?? 0) +
                                (alreadyLiked ? -1 : 1)
                            ),
                        }
                        : item
                )
            );
        } catch (err) {
            Alert.alert(
                'Like failed',
                err instanceof Error
                    ? err.message
                    : 'Could not update clip like.'
            );
        } finally {
            setLikingClipId(null);
        }
    }


    async function handleToggleComments(clipId: number) {
        // Close comments if they are already open
        if (openCommentsClipId === clipId) {
            setOpenCommentsClipId(null);
            return;
        }

        // Open comments for the selected clip
        setOpenCommentsClipId(clipId);

        // Reuse comments already loaded
        if (commentsByClip[clipId] !== undefined) {
            return;
        }

        setLoadingCommentsClipId(clipId);

        try {
            const data = await getClipComments(clipId);

            setCommentsByClip((current) => ({
                ...current,
                [clipId]: data,
            }));
        } catch (err) {
            Alert.alert(
                'Comments error',
                err instanceof Error
                    ? err.message
                    : 'Could not load comments.'
            );

            setOpenCommentsClipId(null);
        } finally {
            setLoadingCommentsClipId(null);
        }
    }


    async function handleAddComment(clipId: number) {
        const content = commentText.trim();

        if (!content || postingComment) {
            return;
        }

        setPostingComment(true);

        try {
            const newComment = await addClipComment(
                clipId,
                content
            );

            // Add the new comment to the current list
            setCommentsByClip((current) => ({
                ...current,
                [clipId]: [
                    ...(current[clipId] ?? []),
                    newComment,
                ],
            }));

            // Update the clip's comment counter
            setClips((current) =>
                current.map((clip) =>
                    clip.id === clipId
                        ? {
                            ...clip,
                            commentCount:
                                (clip.commentCount ?? 0) + 1,
                        }
                        : clip
                )
            );

            // Clear the text field
            setCommentText('');

        } catch (err) {
            Alert.alert(
                'Comment failed',
                err instanceof Error
                    ? err.message
                    : 'Could not publish comment.'
            );
        } finally {
            setPostingComment(false);
        }
    }

    useEffect(() => {
        let mounted = true;

        async function loadUsername() {
            const savedUsername = await getUsername();

            if (mounted) {
                setCurrentUsername(savedUsername ?? '');
            }
        }

        void loadUsername();

        return () => {
            mounted = false;
        };
    }, []);


    async function handleDeleteComment(
        clipId: number,
        commentId: number
    ) {
        if (deletingCommentId !== null) {
            return;
        }

        setDeletingCommentId(commentId);

        try {
            await deleteClipComment(clipId, commentId);

            // Remove the deleted comment from the list
            setCommentsByClip((current) => ({
                ...current,
                [clipId]: (current[clipId] ?? []).filter(
                    (comment) => comment.id !== commentId
                ),
            }));

            // Update the comment counter
            setClips((current) =>
                current.map((clip) =>
                    clip.id === clipId
                        ? {
                            ...clip,
                            commentCount: Math.max(
                                0,
                                (clip.commentCount ?? 0) - 1
                            ),
                        }
                        : clip
                )
            );

        } catch (err) {
            Alert.alert(
                'Delete failed',
                err instanceof Error
                    ? err.message
                    : 'Could not delete comment.'
            );
        } finally {
            setDeletingCommentId(null);
        }
    }

    function confirmDeleteComment(
        clipId: number,
        commentId: number
    ) {
        Alert.alert(
            'Delete comment',
            'Are you sure you want to delete this comment?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () =>
                        void handleDeleteComment(clipId, commentId),
                },
            ]
        );
    }


    async function handleShareClip(clip: ClipResponse) {
        try {
            await Share.share(
                {
                    title: clip.title,
                    message:
                        `Check out this gaming highlight on ClutchMetrics!\n\n` +
                        `${clip.title}\n` +
                        `Game: ${clip.gameName ?? 'Gaming'}\n` +
                        `Player: ${clip.authorUsername}`,
                },
                {
                    dialogTitle: 'Share ClutchMetrics highlight',
                }
            );
        } catch (err) {
            Alert.alert(
                'Sharing failed',
                err instanceof Error
                    ? err.message
                    : 'Could not share this clip.'
            );
        }
    }


    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            <StatusBar style="light" />

            {/* Feed header */}
            <View style={styles.header}>
                <Text style={styles.brand}>
                    CLUTCHMETRICS
                </Text>

                <Text style={styles.heading}>
                    Feed
                </Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator
                        size="large"
                        color="#8B5CF6"
                    />

                    <Text style={styles.message}>
                        Loading community clips...
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.error}>
                        {error}
                    </Text>
                </View>
            ) : (
                <FlatList
                    key={
                        selectedClipId != null
                            ? `clip-${selectedClipId}`
                            : 'all-clips'
                    }
                    data={displayedClips}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.list}

                    ListHeaderComponent={
                        <View style={styles.intro}>

                            {selectedClipId != null && (
                                <Pressable
                                    onPress={() =>
                                        navigation.setParams({
                                            clipId: undefined,
                                        })
                                    }
                                    style={{
                                        marginBottom: 18,
                                        paddingVertical: 10,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#A18BFF',
                                            fontSize: 14,
                                            fontWeight: '700',
                                        }}
                                    >
                                        ← Back to all clips
                                    </Text>
                                </Pressable>
                            )}

                            <Text style={styles.eyebrow}>
                                COMMUNITY HIGHLIGHTS
                            </Text>

                            <Text style={styles.title}>
                                Discover the best plays.
                            </Text>

                            <Text style={styles.description}>
                                Explore gaming highlights shared
                                by the ClutchMetrics community.
                            </Text>

                            {/* Search field */}
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search clips or games..."
                                placeholderTextColor="#8292B3"
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.filters}
                                contentContainerStyle={styles.filtersContent}
                            >
                                {[
                                    { label: 'All clips', value: 'ALL' },
                                    { label: 'League of Legends', value: 'League of Legends' },
                                    { label: 'Valorant', value: 'Valorant' },
                                    { label: 'CS2', value: 'Counter-Strike 2' },
                                ].map((game) => (
                                    <Pressable
                                        key={game.value}
                                        onPress={() => setSelectedGame(game.value)}
                                        style={[
                                            styles.filterChip,
                                            selectedGame === game.value && styles.filterChipActive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.filterText,
                                                selectedGame === game.value && styles.filterTextActive,
                                            ]}
                                        >
                                            {game.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    }

                    ListEmptyComponent={
                        <Text style={styles.message}>
                            {clips.length === 0
                                ? 'No public clips available yet.'
                                : 'No clips match your search.'}
                        </Text>
                    }

                    renderItem={({ item }) => (
                        <View style={styles.card}>


                            {/* Game and more options */}
                            <View style={styles.clipHeader}>
                                <Text style={[styles.game, { marginBottom: 0 }]}>
                                    {item.gameName ?? 'ClutchMetrics'}
                                </Text>

                                <Pressable
                                    onPress={() =>
                                        setOpenMoreMenuClipId((current) =>
                                            current === item.id ? null : item.id
                                        )
                                    }
                                    style={styles.moreButton}
                                    accessibilityRole="button"
                                    accessibilityLabel="More clip options"
                                >
                                    <Ionicons
                                        name="ellipsis-horizontal"
                                        size={20}
                                        color="#CBD5E1"
                                    />
                                </Pressable>
                            </View>

                            {/* Report option */}
                            {openMoreMenuClipId === item.id && (
                                <Pressable
                                    style={styles.reportOption}
                                    onPress={() => {
                                        setOpenMoreMenuClipId(null);
                                        setReportClipId(item.id);
                                    }}
                                >
                                    <Ionicons
                                        name="flag-outline"
                                        size={17}
                                        color="#FB7185"
                                    />

                                    <Text style={styles.reportOptionText}>
                                        Report clip
                                    </Text>
                                </Pressable>
                            )}


                            {/* Clip title */}
                            <Text style={styles.clipTitle}>
                                {item.title}
                            </Text>

                            {/* Clip video or demo image */}
                            {item.title === 'Jinx Pentakill Highlights' &&
                            item.videoUrl?.includes('example.com') ? (
                                <View style={styles.videoContainer}>
                                    <Image
                                        source={require('../../assets/games/lol.png')}
                                        style={styles.demoImage}
                                        resizeMode="contain"
                                    />
                                </View>
                            ) : item.videoUrl?.trim() ? (
                                <View style={styles.videoContainer}>

                                    {activeVideoId === item.id ? (
                                        <View>
                                            <ClipVideoPlayer videoUrl={item.videoUrl} />

                                            <Pressable
                                                style={styles.closePlayerButton}
                                                onPress={() => setActiveVideoId(null)}
                                            >
                                                <Ionicons
                                                    name="close-circle-outline"
                                                    size={18}
                                                    color="#A18BFF"
                                                />

                                                <Text style={styles.closePlayerText}>
                                                    Close player
                                                </Text>
                                            </Pressable>
                                        </View>
                                    ) : (
                                        <Pressable
                                            style={styles.videoPlaceholder}
                                            onPress={() => setActiveVideoId(item.id)}
                                            accessibilityRole="button"
                                            accessibilityLabel="Load clip video"
                                        >
                                            <Ionicons
                                                name="play-circle"
                                                size={48}
                                                color="#A18BFF"
                                            />

                                            <Text style={styles.placeholderText}>
                                                Tap to load video
                                            </Text>
                                        </Pressable>
                                    )}

                                </View>
                            ) : null}

                            {/* Clip description */}
                            {item.description ? (
                                <Text style={styles.clipDescription}>
                                    {item.description}
                                </Text>
                            ) : null}

                            {/* Author and date */}
                            <View style={styles.meta}>
                                <Text style={styles.author}>
                                    By {item.authorUsername}
                                </Text>

                                <Text style={styles.date}>
                                    {new Date(
                                        item.createdAt
                                    ).toLocaleDateString('en-GB')}
                                </Text>
                            </View>

                            {/* Social statistics */}
                            <View style={styles.stats}>
                                <Pressable
                                    onPress={() => void handleLike(item)}
                                    disabled={likingClipId !== null}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        item.likedByCurrentUser
                                            ? 'Remove like'
                                            : 'Like clip'
                                    }
                                    style={styles.likeButton}
                                >
                                    <Ionicons
                                        name={
                                            item.likedByCurrentUser
                                                ? 'heart'
                                                : 'heart-outline'
                                        }
                                        size={19}
                                        color={
                                            item.likedByCurrentUser
                                                ? '#A18BFF'
                                                : '#8292B3'
                                        }
                                    />

                                    <Text
                                        style={[
                                            styles.stat,
                                            item.likedByCurrentUser && styles.likedStat,
                                        ]}
                                    >
                                        {item.likeCount ?? 0} Likes
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => void handleToggleComments(item.id)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Show clip comments"
                                    style={styles.commentButton}
                                >
                                    <Ionicons
                                        name={
                                            openCommentsClipId === item.id
                                                ? 'chatbubble'
                                                : 'chatbubble-outline'
                                        }
                                        size={18}
                                        color="#A18BFF"
                                    />

                                    <Text style={styles.stat}>
                                        {item.commentCount ?? 0} Comments
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => void handleShareClip(item)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Share clip"
                                    style={styles.commentButton}
                                >
                                    <Ionicons
                                        name="share-social-outline"
                                        size={18}
                                        color="#A18BFF"
                                    />

                                    <Text style={styles.stat}>
                                        Share
                                    </Text>
                                </Pressable>

                            </View>

                            {/* Clip comments */}
                            {openCommentsClipId === item.id && (
                                <View style={styles.commentsPanel}>
                                    <Text style={styles.commentsTitle}>
                                        Comments
                                    </Text>

                                    {loadingCommentsClipId === item.id ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#A18BFF"
                                        />
                                    ) : (commentsByClip[item.id] ?? []).length === 0 ? (
                                        <Text style={styles.commentsEmpty}>
                                            No comments yet. Be the first to comment!
                                        </Text>
                                    ) : (
                                        (commentsByClip[item.id] ?? []).map((comment) => (

                                            <View
                                                key={comment.id}
                                                style={styles.commentCard}
                                            >
                                                <View style={styles.commentHeader}>
                                                    <Text style={styles.commentAuthor}>
                                                        {comment.username}
                                                    </Text>

                                                    {currentUsername.trim().toLowerCase() ===
                                                        comment.username.trim().toLowerCase() &&
                                                        currentUsername.trim() !== '' && (
                                                            <Pressable
                                                                onPress={() =>
                                                                    confirmDeleteComment(
                                                                        item.id,
                                                                        comment.id
                                                                    )
                                                                }
                                                                disabled={deletingCommentId !== null}
                                                                style={styles.deleteCommentButton}
                                                            >
                                                                <Ionicons
                                                                    name="trash-outline"
                                                                    size={15}
                                                                    color="#FB7185"
                                                                />

                                                                <Text style={styles.deleteCommentText}>
                                                                    {deletingCommentId === comment.id
                                                                        ? 'Deleting...'
                                                                        : 'Delete'}
                                                                </Text>
                                                            </Pressable>
                                                        )}
                                                </View>

                                                <Text style={styles.commentBody}>
                                                    {comment.content}
                                                </Text>


                                                <Text style={styles.commentDate}>
                                                    {new Date(
                                                        comment.createdAt
                                                    ).toLocaleDateString('en-GB')}
                                                </Text>
                                            </View>
                                        ))
                                    )}

                                    {/* New comment form */}
                                    <View style={styles.commentForm}>
                                        <TextInput
                                            style={styles.commentInput}
                                            placeholder="Write a comment..."
                                            placeholderTextColor="#8292B3"
                                            value={commentText}
                                            onChangeText={setCommentText}
                                            maxLength={500}
                                            multiline
                                            textAlignVertical="top"
                                        />

                                        <Pressable
                                            onPress={() => void handleAddComment(item.id)}
                                            disabled={
                                                postingComment || !commentText.trim()
                                            }
                                            style={[
                                                styles.postCommentButton,
                                                (postingComment || !commentText.trim()) &&
                                                styles.postCommentButtonDisabled,
                                            ]}
                                        >
                                            <Text style={styles.postCommentText}>
                                                {postingComment ? 'Posting...' : 'Post Comment'}
                                            </Text>
                                        </Pressable>
                                    </View>

                                </View>
                            )}

                        </View>
                    )}
                />
            )}

            {reportClipId !== null && (
                <ClipReportModal
                    clipId={reportClipId}
                    onClose={() => setReportClipId(null)}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    filters: {
        marginTop: 16,
        flexGrow: 0,
    },

    filtersContent: {
        gap: 8,
        paddingRight: 12,
    },

    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#252D43',
    },

    filterChipActive: {
        backgroundColor: '#2A2148',
        borderColor: '#8B5CF6',
    },

    filterText: {
        color: '#94A3C6',
        fontSize: 12,
        fontWeight: '700',
    },

    filterTextActive: {
        color: '#C4B5FD',
    },
    container: {
        flex: 1,
        backgroundColor: '#080B13',
    },

    header: {
        paddingHorizontal: 24,
        paddingTop: 18,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#252D43',
    },

    brand: {
        color: '#8196C4',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 8,
    },

    heading: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },

    list: {
        padding: 20,
        paddingBottom: 40,
        flexGrow: 1,
    },

    intro: {
        marginBottom: 28,
    },

    eyebrow: {
        color: '#A18BFF',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 12,
    },

    title: {
        color: '#FFFFFF',
        fontSize: 27,
        fontWeight: '800',
        marginBottom: 10,
    },

    description: {
        color: '#94A3C6',
        fontSize: 14,
        lineHeight: 22,
    },

    searchInput: {
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#252D43',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginTop: 20,
        color: '#FFFFFF',
        fontSize: 14,
    },

    card: {
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#252D43',
        borderRadius: 14,
        padding: 18,
        marginBottom: 16,
    },

    game: {
        color: '#A18BFF',
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 10,
    },

    clipTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
    },

    videoContainer: {
        marginBottom: 14,
    },

    demoImage: {
        width: '100%',
        height: 210,
        backgroundColor: '#000000',
        borderRadius: 12,
    },

    clipDescription: {
        color: '#94A3C6',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 14,
    },

    meta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },

    author: {
        color: '#CBD5E1',
        fontSize: 12,
        flexShrink: 1,
    },

    date: {
        color: '#8292B3',
        fontSize: 11,
    },

    stats: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#252D43',
    },

    stat: {
        color: '#A18BFF',
        fontSize: 12,
        fontWeight: '700',
    },

    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },

    likedStat: {
        color: '#A18BFF',
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },

    message: {
        color: '#94A3C6',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 14,
    },

    error: {
        color: '#FB7185',
        fontSize: 14,
        textAlign: 'center',
    },

    commentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },

    commentsPanel: {
        marginTop: 18,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#252D43',
    },

    commentsTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 14,
    },

    commentsEmpty: {
        color: '#94A3C6',
        fontSize: 13,
        lineHeight: 20,
    },

    commentCard: {
        backgroundColor: '#080B13',
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#252D43',
    },

    commentAuthor: {
        color: '#A18BFF',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 7,
    },

    commentBody: {
        color: '#CBD5E1',
        fontSize: 13,
        lineHeight: 20,
    },

    commentDate: {
        color: '#8292B3',
        fontSize: 11,
        marginTop: 9,
    },

    commentForm: {
        marginTop: 18,
        gap: 12,
    },

    commentInput: {
        backgroundColor: '#080B13',
        borderWidth: 1,
        borderColor: '#252D43',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        minHeight: 85,
        color: '#FFFFFF',
        fontSize: 14,
    },

    postCommentButton: {
        backgroundColor: '#7545F5',
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },

    postCommentButtonDisabled: {
        opacity: 0.45,
    },

    postCommentText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },

    deleteCommentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(251, 113, 133, 0.35)',
        backgroundColor: 'rgba(251, 113, 133, 0.10)',
    },

    deleteCommentText: {
        color: '#FB7185',
        fontSize: 12,
        fontWeight: '700',
    },

    clipHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    moreButton: {
        width: 34,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1B2233',
        borderRadius: 8,
    },

    reportOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
        backgroundColor: '#201822',
        borderWidth: 1,
        borderColor: '#55303E',
        borderRadius: 10,
    },

    reportOptionText: {
        color: '#FB7185',
        fontSize: 13,
        fontWeight: '700',
    },
    videoPlaceholder: {
        height: 210,
        backgroundColor: '#080B13',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#252D43',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },

    placeholderText: {
        color: '#94A3C6',
        fontSize: 13,
        fontWeight: '600',
    },

    closePlayerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        paddingVertical: 12,
    },

    closePlayerText: {
        color: '#A18BFF',
        fontSize: 12,
        fontWeight: '700',
    },
});
