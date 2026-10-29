
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

import { changePassword } from '../services/account';

type ChangePasswordScreenProps = {
    onBack: () => void;
};

export default function ChangePasswordScreen({
                                                 onBack,
                                             }: ChangePasswordScreenProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleChangePassword() {
        if (loading) return;

        setError('');
        setSuccess('');

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            setError('Please fill in all fields.');
            return;
        }

        if (
            newPassword.length < 8 ||
            newPassword.length > 72
        ) {
            setError(
                'New password must contain between 8 and 72 characters.'
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (currentPassword === newPassword) {
            setError(
                'The new password must be different from the current password.'
            );
            return;
        }

        setLoading(true);

        try {
            const message = await changePassword({
                currentPassword,
                newPassword,
            });

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setSuccess(
                message ||
                'Check your email to confirm the password change.'
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Could not change password.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            <StatusBar style="light" />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <View style={styles.header}>
                    <Pressable
                        onPress={onBack}
                        style={styles.backButton}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={20}
                            color="#C4B5FD"
                        />

                        <Text style={styles.backText}>
                            Back to Profile
                        </Text>
                    </Pressable>

                    <Text style={styles.brand}>
                        CLUTCHMETRICS
                    </Text>

                    <Text style={styles.headerTitle}>
                        Change Password
                    </Text>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.intro}>
                        <Text style={styles.eyebrow}>
                            ACCOUNT SECURITY
                        </Text>

                        <Text style={styles.title}>
                            Secure your account.
                        </Text>

                        <Text style={styles.description}>
                            Update the password used to access
                            your ClutchMetrics account.
                        </Text>
                    </View>

                    {success ? (
                        <View style={styles.successCard}>
                            <Ionicons
                                name="mail-outline"
                                size={48}
                                color="#6EE7B7"
                            />

                            <Text style={styles.successTitle}>
                                Check your email
                            </Text>

                            <Text style={styles.successDescription}>
                                {success}
                            </Text>

                            <Text style={styles.successHint}>
                                Your password will only change
                                after email confirmation.
                            </Text>

                            <Pressable
                                style={styles.submitButton}
                                onPress={onBack}
                            >
                                <Text style={styles.buttonText}>
                                    Back to Profile
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.formCard}>
                            <View style={styles.formHeader}>
                                <Ionicons
                                    name="shield-checkmark-outline"
                                    size={22}
                                    color="#A18BFF"
                                />

                                <Text style={styles.formTitle}>
                                    Update password
                                </Text>
                            </View>

                            {error ? (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>
                                        {error}
                                    </Text>
                                </View>
                            ) : null}

                            <Text style={styles.label}>
                                Current Password
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Enter your current password"
                                placeholderTextColor="#66758F"
                                secureTextEntry={!showPasswords}
                                autoCapitalize="none"
                                autoComplete="current-password"
                            />

                            <Text style={styles.label}>
                                New Password
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Minimum 8 characters"
                                placeholderTextColor="#66758F"
                                secureTextEntry={!showPasswords}
                                autoCapitalize="none"
                                autoComplete="new-password"
                            />

                            <Text style={styles.label}>
                                Confirm New Password
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Repeat your new password"
                                placeholderTextColor="#66758F"
                                secureTextEntry={!showPasswords}
                                autoCapitalize="none"
                                autoComplete="new-password"
                            />

                            <Pressable
                                style={styles.showRow}
                                onPress={() =>
                                    setShowPasswords(!showPasswords)
                                }
                            >
                                <Ionicons
                                    name={
                                        showPasswords
                                            ? 'eye-off-outline'
                                            : 'eye-outline'
                                    }
                                    size={18}
                                    color="#A18BFF"
                                />

                                <Text style={styles.showText}>
                                    {showPasswords
                                        ? 'Hide passwords'
                                        : 'Show passwords'}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.submitButton,
                                    loading && styles.disabledButton,
                                ]}
                                onPress={() =>
                                    void handleChangePassword()
                                }
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                    />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        Change Password
                                    </Text>
                                )}
                            </Pressable>

                            <Text style={styles.helperText}>
                                For your security, you must
                                confirm this change by email.
                            </Text>
                        </View>
                    )}

                    <Text style={styles.footer}>
                        YOUR GAME. YOUR DATA. YOUR EDGE.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#080B13',
    },
    flex: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 18,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#252D43',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 22,
    },
    backText: {
        color: '#C4B5FD',
        fontSize: 13,
    },
    brand: {
        color: '#8196C4',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 8,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
    },
    content: {
        padding: 20,
        paddingBottom: 45,
    },
    intro: {
        marginBottom: 25,
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
        fontSize: 25,
        fontWeight: '800',
        marginBottom: 10,
    },
    description: {
        color: '#94A3C6',
        fontSize: 14,
        lineHeight: 22,
    },
    formCard: {
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#303854',
        borderRadius: 15,
        padding: 20,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 24,
    },
    formTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    label: {
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
        paddingVertical: 14,
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 21,
    },
    showRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        marginBottom: 25,
    },
    showText: {
        color: '#A18BFF',
        fontSize: 12,
        fontWeight: '700',
    },
    submitButton: {
        width: '100%',
        backgroundColor: '#7545F5',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    helperText: {
        color: '#8196C4',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 18,
    },
    errorBox: {
        backgroundColor: '#351C2A',
        borderWidth: 1,
        borderColor: '#7F354C',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
    },
    errorText: {
        color: '#FB7185',
        fontSize: 13,
        lineHeight: 19,
    },
    successCard: {
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#303854',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 17,
    },
    successTitle: {
        color: '#FFFFFF',
        fontSize: 23,
        fontWeight: '800',
    },
    successDescription: {
        color: '#CBD5E1',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    successHint: {
        color: '#94A3C6',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 19,
    },
    footer: {
        color: '#8196C4',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        textAlign: 'center',
        marginTop: 35,
    },
});
