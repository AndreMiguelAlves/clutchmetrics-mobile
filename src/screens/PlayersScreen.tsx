
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import PlayerProfileScreen from './PlayerProfileScreen';
import { API_BASE_URL } from '../services/auth';
import {
    getDiscoverPlayers,
} from '../services/player';
import type {
    DiscoverPlayer,
} from '../services/player';

// Convert avatar URLs for the Android emulator
function resolveAvatarUrl(
    url: string | null
): string | null {
    if (!url) {
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

// Player avatar with fallback initial
function PlayerAvatar({
                          player,
                      }: {
    player: DiscoverPlayer;
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

type PlayersScreenProps = {
    onOpenClip: (clipId: number) => void;
};

export default function PlayersScreen({
                                          onOpenClip,
                                      }: PlayersScreenProps) {
    const [players, setPlayers] =
        useState<DiscoverPlayer[]>([]);

    const [search, setSearch] = useState('');
    const [selectedPlayerId, setSelectedPlayerId] =
        useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        // Avoid sending a request for every keystroke
        const timeout = setTimeout(async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getDiscoverPlayers(search);

                if (active) {
                    setPlayers(data);
                }
            } catch (err) {
                if (active) {
                    setPlayers([]);
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
        }, 350);

        return () => {
            active = false;
            clearTimeout(timeout);
        };
    }, [search]);

    if (selectedPlayerId !== null) {
        return (
            <PlayerProfileScreen
                userId={selectedPlayerId}
                onBack={() => setSelectedPlayerId(null)}
                onSelectPlayer={setSelectedPlayerId}
                onOpenClip={onOpenClip}
            />
        );
    }

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.brand}>
                    CLUTCHMETRICS
                </Text>

                <Text style={styles.heading}>
                    Discover Players
                </Text>
            </View>

            {/* Introduction */}
            <View style={styles.intro}>
                <Text style={styles.eyebrow}>
                    COMMUNITY
                </Text>

                <Text style={styles.title}>
                    Find your community.
                </Text>

                <Text style={styles.description}>
                    Find gamers, explore their profiles
                    and connect with the ClutchMetrics community.
                </Text>
            </View>

            {/* Search */}
            <View style={styles.searchSection}>
                <Text style={styles.searchLabel}>
                    Search Players
                </Text>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search username or name..."
                        placeholderTextColor="#8292B3"
                        value={search}
                        onChangeText={setSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={100}
                    />

                    {search.length > 0 && (
                        <Pressable
                            onPress={() => setSearch('')}
                            accessibilityRole="button"
                            accessibilityLabel="Clear search"
                        >
                            <Text style={styles.clearText}>
                                Clear
                            </Text>
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Results header */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                    Players
                </Text>

                {!loading && !error && (
                    <Text style={styles.resultsCount}>
                        {players.length}{' '}
                        {players.length === 1
                            ? 'player found'
                            : 'players found'}
                    </Text>
                )}
            </View>

            {/* Player list */}
            <FlatList
                data={loading || error ? [] : players}
                keyExtractor={(item) => String(item.userId)}
                contentContainerStyle={styles.list}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {loading ? (
                            <>
                                <ActivityIndicator
                                    size="large"
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
                                No players found.
                                Try a different search.
                            </Text>
                        )}
                    </View>
                }

                renderItem={({ item }) => (
                    <Pressable
                        style={styles.playerCard}
                        onPress={() => setSelectedPlayerId(item.userId)}
                        accessibilityRole="button"
                        accessibilityLabel={`View ${item.username}'s profile`}
                    >
                        <PlayerAvatar player={item} />

                        <View style={styles.playerInfo}>
                            <Text style={styles.displayName}>
                                {item.displayName || item.username}
                            </Text>

                            <Text style={styles.username}>
                                @{item.username}
                            </Text>
                        </View>
                    </Pressable>
                )}

            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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

    intro: {
        paddingHorizontal: 20,
        paddingTop: 26,
        paddingBottom: 20,
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
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 10,
    },

    description: {
        color: '#94A3C6',
        fontSize: 14,
        lineHeight: 22,
    },

    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },

    searchLabel: {
        color: '#CBD5E1',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 10,
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#252D43',
        borderRadius: 12,
        paddingRight: 14,
    },

    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        paddingHorizontal: 15,
        paddingVertical: 14,
    },

    clearText: {
        color: '#A18BFF',
        fontSize: 12,
        fontWeight: '700',
    },

    resultsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 14,
    },

    resultsTitle: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '800',
    },

    resultsCount: {
        color: '#94A3C6',
        fontSize: 12,
    },

    list: {
        paddingHorizontal: 20,
        paddingBottom: 35,
        flexGrow: 1,
    },

    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#252D43',
        borderRadius: 14,
        marginBottom: 12,
        gap: 14,
    },

    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#2A2148',
        borderWidth: 1,
        borderColor: '#7545F5',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    avatarLetter: {
        color: '#C4B5FD',
        fontSize: 23,
        fontWeight: '800',
    },

    avatarImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },

    playerInfo: {
        flex: 1,
        gap: 5,
    },

    displayName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },

    username: {
        color: '#94A3C6',
        fontSize: 13,
    },

    emptyContainer: {
        paddingVertical: 45,
        alignItems: 'center',
    },

    message: {
        color: '#94A3C6',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 22,
    },

    error: {
        color: '#FB7185',
        fontSize: 14,
        textAlign: 'center',
    },
});
