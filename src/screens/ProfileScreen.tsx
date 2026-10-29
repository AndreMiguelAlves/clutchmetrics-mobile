
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import ChangePasswordScreen from './ChangePasswordScreen';

import {
    uploadMyAvatar,
    removeMyAvatar,
} from '../services/profile';
import {
    getMyProfile,
    updateMyProfile,
} from '../services/profile';

import type { MyProfile } from '../services/profile';

type ProfileScreenProps = {
    onLogout: () => void;
};

function getAvatarImageUrl(value: string): string {
    const url = value.trim();

    if (!url) {
        return '';
    }

    // Convert localhost URLs for Android Emulator
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/i.test(url)) {
        return url.replace(
            /^https?:\/\/(localhost|127\.0\.0\.1)/i,
            'http://10.0.2.2'
        );
    }

    // Handle relative image paths
    if (!/^https?:\/\//i.test(url)) {
        return `http://10.0.2.2:8080/${url.replace(/^\/+/, '')}`;
    }

    return url;
}

export default function ProfileScreen({
                                          onLogout,
                                      }: ProfileScreenProps) {
    const [profile, setProfile] = useState<MyProfile | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [showChangePassword, setShowChangePassword] =
        useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [avatarFailed, setAvatarFailed] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [avatarBusy, setAvatarBusy] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            setLoading(true);
            setError('');
            setSuccess('');

            async function loadProfile() {
                try {
                    const data = await getMyProfile();

                    if (!active) return;

                    setProfile(data);
                    setDisplayName(data.displayName ?? '');
                    setBio(data.bio ?? '');
                    setAvatarUrl(data.avatarUrl ?? '');
                    setAvatarFailed(false);
                } catch (err) {
                    if (!active) return;

                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Could not load your profile.'
                    );
                } finally {
                    if (active) {
                        setLoading(false);
                    }
                }
            }

            void loadProfile();

            return () => {
                active = false;
            };
        }, [reloadKey])
    );

    async function handleSave() {
        const name = displayName.trim();

        if (!name) {
            setError('Display name is required.');
            setSuccess('');
            return;
        }

        if (saving) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const data = await updateMyProfile({
                displayName: name,
                bio: bio.trim() || null,
                avatarUrl: avatarUrl.trim() || null,
            });

            setProfile(data);
            setDisplayName(data.displayName ?? '');
            setBio(data.bio ?? '');
            setAvatarUrl(data.avatarUrl ?? '');
            setAvatarFailed(false);

            setSuccess('Profile updated successfully.');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Could not update profile.'
            );
        } finally {
            setSaving(false);
        }
    }


    async function handleChangeAvatar() {
        if (avatarBusy || saving) return;

        try {
            const result =
                await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.9,
                });

            if (result.canceled || !result.assets?.length) {
                return;
            }

            setAvatarBusy(true);
            setError('');
            setSuccess('');

            await uploadMyAvatar(result.assets[0]);

            const updatedProfile = await getMyProfile();

            setProfile(updatedProfile);
            setAvatarUrl(updatedProfile.avatarUrl ?? '');
            setAvatarFailed(false);

            setSuccess('Profile picture updated successfully.');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Could not update profile picture.'
            );
        } finally {
            setAvatarBusy(false);
        }
    }

    async function handleRemoveAvatar() {
        if (avatarBusy || saving) return;

        setAvatarBusy(true);
        setError('');
        setSuccess('');

        try {
            await removeMyAvatar();

            const updatedProfile = await getMyProfile();

            setProfile(updatedProfile);
            setAvatarUrl(updatedProfile.avatarUrl ?? '');
            setAvatarFailed(false);

            setSuccess('Profile picture removed successfully.');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Could not remove profile picture.'
            );
        } finally {
            setAvatarBusy(false);
        }
    }

    function confirmRemoveAvatar() {
        if (!avatarUrl.trim() || avatarBusy || saving) return;

        Alert.alert(
            'Remove profile picture',
            'Are you sure you want to remove your avatar?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        void handleRemoveAvatar();
                    },
                },
            ]
        );
    }


    function confirmLogout() {
        Alert.alert(
            'Log out',
            'Are you sure you want to log out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Log out',
                    style: 'destructive',
                    onPress: onLogout,
                },
            ]
        );
    }

    const avatarInitial =
        displayName.trim().charAt(0).toUpperCase() || 'P';

    const showAvatar =
        Boolean(avatarUrl.trim()) && !avatarFailed;

    if (showChangePassword) {
        return (
            <ChangePasswordScreen
                onBack={() => setShowChangePassword(false)}
            />
        );
    }

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            <StatusBar style="light" />

            <View style={styles.header}>
                <Text style={styles.brand}>
                    CLUTCHMETRICS
                </Text>

                <Text style={styles.headerTitle}>
                    Profile
                </Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator
                        size="large"
                        color="#A18BFF"
                    />

                    <Text style={styles.loadingText}>
                        Loading profile...
                    </Text>
                </View>
            ) : error && !profile ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>
                        {error}
                    </Text>

                    <Pressable
                        style={styles.retryButton}
                        onPress={() =>
                            setReloadKey((value) => value + 1)
                        }
                    >
                        <Text style={styles.buttonText}>
                            Try again
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.intro}>
                        <Text style={styles.eyebrow}>
                            ACCOUNT
                        </Text>

                        <Text style={styles.title}>
                            Your player identity.
                        </Text>

                        <Text style={styles.description}>
                            Manage your public ClutchMetrics
                            profile and how other players see you.
                        </Text>
                    </View>

                    {/* Profile preview */}
                    <View style={styles.previewCard}>
                        <View style={styles.avatar}>
                            {showAvatar ? (
                                <Image
                                    source={{
                                        uri: getAvatarImageUrl(avatarUrl),
                                    }}
                                    style={styles.avatarImage}
                                    onError={(event) => {
                                        console.log(
                                            'Avatar load error:',
                                            event.nativeEvent.error
                                        );
                                        setAvatarFailed(true);
                                    }}
                                />
                            ) : (
                                <Text style={styles.avatarInitial}>
                                    {avatarInitial}
                                </Text>
                            )}
                        </View>

                        <Text style={styles.playerLabel}>
                            CLUTCHMETRICS PLAYER
                        </Text>

                        <Text style={styles.previewName}>
                            {displayName.trim() || 'Player'}
                        </Text>

                        {bio.trim() ? (
                            <Text style={styles.previewBio}>
                                {bio}
                            </Text>
                        ) : (
                            <Text style={styles.previewBio}>
                                No biography available yet.
                            </Text>
                        )}
                    </View>

                    {/* Edit form */}
                    <View style={styles.formCard}>
                        <View style={styles.formHeader}>
                            <Ionicons
                                name="create-outline"
                                size={20}
                                color="#A18BFF"
                            />

                            <Text style={styles.formTitle}>
                                Edit profile
                            </Text>
                        </View>

                        <Text style={styles.fieldLabel}>
                            Display Name
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Your display name"
                            placeholderTextColor="#66758F"
                            autoCapitalize="words"
                            maxLength={100}
                        />

                        <Text style={styles.fieldLabel}>
                            Bio
                        </Text>

                        <TextInput
                            style={[
                                styles.input,
                                styles.bioInput,
                            ]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell other players about yourself..."
                            placeholderTextColor="#66758F"
                            multiline
                            textAlignVertical="top"
                            maxLength={500}
                        />


                        <Text style={styles.fieldLabel}>
                            Profile picture
                        </Text>

                        <Pressable
                            style={styles.changeAvatarButton}
                            onPress={() => void handleChangeAvatar()}
                            disabled={avatarBusy || saving}
                        >
                            {avatarBusy ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#C4B5FD"
                                />
                            ) : (
                                <>
                                    <Ionicons
                                        name="image-outline"
                                        size={18}
                                        color="#C4B5FD"
                                    />

                                    <Text style={styles.changeAvatarText}>
                                        Change Avatar
                                    </Text>
                                </>
                            )}
                        </Pressable>

                        {Boolean(avatarUrl.trim()) && (
                            <Pressable
                                style={styles.removeAvatarButton}
                                onPress={confirmRemoveAvatar}
                                disabled={avatarBusy || saving}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={17}
                                    color="#FB7185"
                                />

                                <Text style={styles.removeAvatarText}>
                                    Remove Avatar
                                </Text>
                            </Pressable>
                        )}

                        <Text style={styles.helperText}>
                            JPG, PNG or WebP · Max 3 MB
                        </Text>


                        {error ? (
                            <Text style={styles.errorText}>
                                {error}
                            </Text>
                        ) : null}

                        {success ? (
                            <View style={styles.successBox}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={18}
                                    color="#6EE7B7"
                                />

                                <Text style={styles.successText}>
                                    {success}
                                </Text>
                            </View>
                        ) : null}

                        <Pressable
                            style={[
                                styles.saveButton,
                                saving && styles.disabledButton,
                            ]}
                            onPress={() => void handleSave()}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator
                                    color="#FFFFFF"
                                    size="small"
                                />
                            ) : (
                                <>
                                    <Ionicons
                                        name="save-outline"
                                        size={18}
                                        color="#FFFFFF"
                                    />

                                    <Text style={styles.buttonText}>
                                        Save Changes
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </View>


                    {/* Account security */}
                    <Pressable
                        style={styles.changePasswordButton}
                        onPress={() => setShowChangePassword(true)}
                    >
                        <Ionicons
                            name="shield-checkmark-outline"
                            size={19}
                            color="#C4B5FD"
                        />

                        <Text style={styles.changePasswordText}>
                            Change Password
                        </Text>

                        <Ionicons
                            name="chevron-forward"
                            size={17}
                            color="#C4B5FD"
                        />
                    </Pressable>


                    {/* Logout */}
                    <Pressable
                        style={styles.logoutButton}
                        onPress={confirmLogout}
                    >
                        <Ionicons
                            name="log-out-outline"
                            size={19}
                            color="#FB7185"
                        />

                        <Text style={styles.logoutText}>
                            Log Out
                        </Text>
                    </Pressable>

                    <Text style={styles.footer}>
                        YOUR GAME. YOUR DATA. YOUR EDGE.
                    </Text>
                </ScrollView>
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
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        color: '#94A3C6',
        fontSize: 13,
        marginTop: 14,
    },
    content: {
        padding: 20,
        paddingBottom: 45,
    },
    intro: {
        marginBottom: 22,
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
    previewCard: {
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#303854',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 18,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#292047',
        borderWidth: 2,
        borderColor: '#7545F5',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 20,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarInitial: {
        color: '#C4B5FD',
        fontSize: 36,
        fontWeight: '800',
    },
    playerLabel: {
        color: '#A18BFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.7,
        marginBottom: 10,
    },
    previewName: {
        color: '#FFFFFF',
        fontSize: 23,
        fontWeight: '800',
        textAlign: 'center',
    },
    previewBio: {
        color: '#94A3C6',
        fontSize: 13,
        lineHeight: 21,
        textAlign: 'center',
        marginTop: 12,
    },
    formCard: {
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#303854',
        borderRadius: 16,
        padding: 20,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 22,
    },
    formTitle: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '800',
    },
    fieldLabel: {
        color: '#CBD5E1',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 9,
    },
    input: {
        backgroundColor: '#080B13',
        borderWidth: 1,
        borderColor: '#303854',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 13,
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 20,
    },
    bioInput: {
        minHeight: 115,
    },
    helperText: {
        color: '#8196C4',
        fontSize: 11,
        lineHeight: 17,
        marginTop: -10,
        marginBottom: 20,
    },
    errorText: {
        color: '#FB7185',
        fontSize: 13,
        marginBottom: 14,
        textAlign: 'center',
    },
    successBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        backgroundColor: '#14382F',
        borderRadius: 9,
        padding: 12,
        marginBottom: 15,
    },
    successText: {
        color: '#6EE7B7',
        fontSize: 12,
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#7545F5',
        borderRadius: 10,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    logoutButton: {
        marginTop: 22,
        borderWidth: 1,
        borderColor: '#643044',
        backgroundColor: '#25151F',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    logoutText: {
        color: '#FB7185',
        fontSize: 14,
        fontWeight: '800',
    },
    retryButton: {
        backgroundColor: '#7545F5',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 16,
    },
    footer: {
        color: '#8196C4',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        textAlign: 'center',
        marginTop: 32,
    },

    changeAvatarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        backgroundColor: '#292047',
        borderWidth: 1,
        borderColor: '#7545F5',
        borderRadius: 10,
        paddingVertical: 15,
        marginBottom: 12,
    },
    changeAvatarText: {
        color: '#C4B5FD',
        fontSize: 14,
        fontWeight: '800',
    },
    removeAvatarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        backgroundColor: '#25151F',
        borderWidth: 1,
        borderColor: '#643044',
        borderRadius: 10,
        paddingVertical: 15,
        marginBottom: 18,
    },
    removeAvatarText: {
        color: '#FB7185',
        fontSize: 14,
        fontWeight: '800',
    },

    changePasswordButton: {
        marginTop: 22,
        borderWidth: 1,
        borderColor: '#7545F5',
        backgroundColor: '#211B3B',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    changePasswordText: {
        color: '#C4B5FD',
        fontSize: 14,
        fontWeight: '800',
        flex: 1,
        textAlign: 'center',
    },

});
