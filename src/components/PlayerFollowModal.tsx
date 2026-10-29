
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { API_BASE_URL } from '../services/auth';

import {
    getPlayerFollowList,
} from '../services/player';

import type {
    FollowListType,
    UserFollowPlayer,
} from '../services/player';

type PlayerFollowModalProps = {
    userId: number;
    type: FollowListType;
    onClose: () => void;
    onSelectPlayer?: (userId: number) => void;
};

function resolveAvatarUrl(
    url: string | null
): string | null {
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

function FollowPlayerAvatar({
                                player,
                            }: {
    player: UserFollowPlayer;
}) {
    const [imageFailed, setImageFailed] = useState(false);

    const avatarUrl = resolveAvatarUrl(player.avatarUrl);

    return (
        <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
                {player.username.charAt(0).toUpperCase()}
            </Text>

            {avatarUrl && !imageFailed && (
                <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatarImage}
                    onError={() => setImageFailed(true)}
                />
            )}
        </View>
    );
}

export default function PlayerFollowModal({
                                              userId,
                                              type,
                                              onClose,
                                              onSelectPlayer,
                                          }: PlayerFollowModalProps) {
    const [players, setPlayers] =
        useState<UserFollowPlayer[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError('');
        setPlayers([]);

        async function loadPlayers() {
            try {
                const data = await getPlayerFollowList(
                    userId,
                    type
                );

                if (active) {
                    setPlayers(data);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Could not load players.'
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        void loadPlayers();

        return () => {
            active = false;
        };
    }, [userId, type]);

    const title =
        type === 'followers'
            ? 'Followers'
            : 'Following';

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>

                    {/* Modal header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {title}
                        </Text>

                        <Pressable
                            onPress={onClose}
                            style={styles.closeButton}
                            accessibilityRole="button"
                            accessibilityLabel="Close player list"
                        >
                            <Ionicons
                                name="close"
                                size={22}
                                color="#CBD5E1"
                            />
                        </Pressable>
                    </View>

                    <View style={styles.divider} />

                    {/* Players list */}
                    <FlatList
                        data={loading || error ? [] : players}
                        keyExtractor={(item) =>
                            String(item.userId)
                        }
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                {loading ? (
                                    <>
                                        <ActivityIndicator
                                            size="small"
                                            color="#A18BFF"
                                        />

                                        <Text style={styles.message}>
                                            Loading players...
                                        </Text>
                                    </>
                                ) : error ? (
                                    <Text style={styles.error}>
                                        {error}
                                    </Text>
                                ) : (
                                    <Text style={styles.message}>
                                        {type === 'followers'
                                            ? 'No followers yet.'
                                            : 'Not following anyone yet.'}
                                    </Text>
                                )}
                            </View>
                        }
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.playerCard}
                                disabled={!onSelectPlayer}
                                onPress={() =>
                                    onSelectPlayer?.(item.userId)
                                }
                                accessibilityRole={
                                    onSelectPlayer
                                        ? 'button'
                                        : undefined
                                }
                            >
                                <FollowPlayerAvatar
                                    player={item}
                                />

                                <View style={styles.playerInfo}>
                                    <Text style={styles.displayName}>
                                        {item.displayName ||
                                            item.username}
                                    </Text>

                                    <Text style={styles.username}>
                                        @{item.username}
                                    </Text>
                                </View>

                                {onSelectPlayer && (
                                    <Ionicons
                                        name="chevron-forward"
                                        size={19}
                                        color="#A18BFF"
                                    />
                                )}
                            </Pressable>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.80)',
        justifyContent: 'center',
        padding: 20,
    },

    modal: {
        backgroundColor: '#111724',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#303854',
        padding: 20,
        maxHeight: '75%',
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    title: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '800',
    },

    closeButton: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#1B2233',
    },

    divider: {
        height: 1,
        backgroundColor: '#252D43',
        marginTop: 16,
        marginBottom: 18,
    },

    list: {
        flexGrow: 0,
    },

    listContent: {
        paddingBottom: 6,
    },

    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#080B13',
        borderWidth: 1,
        borderColor: '#252D43',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        gap: 12,
    },

    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#2A2148',
        borderWidth: 1,
        borderColor: '#7545F5',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    avatarLetter: {
        color: '#C4B5FD',
        fontSize: 19,
        fontWeight: '800',
    },

    avatarImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },

    playerInfo: {
        flex: 1,
        gap: 5,
    },

    displayName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },

    username: {
        color: '#94A3C6',
        fontSize: 12,
    },

    emptyContainer: {
        paddingVertical: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    message: {
        color: '#94A3C6',
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: 12,
    },

    error: {
        color: '#FB7185',
        fontSize: 13,
        textAlign: 'center',
    },
});
