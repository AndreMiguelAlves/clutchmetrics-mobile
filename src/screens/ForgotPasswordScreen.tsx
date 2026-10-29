
import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
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

import { forgotPassword } from '../services/auth';

type ForgotPasswordScreenProps = {
    onBack: () => void;
};

export default function ForgotPasswordScreen({
                                                 onBack,
                                             }: ForgotPasswordScreenProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    async function handleSubmit() {
        if (loading) return;

        setError('');

        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
            setError('Please enter your email address.');
            return;
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            await forgotPassword(normalizedEmail);

            setSent(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Could not send recovery instructions.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top', 'bottom']}
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
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Pressable
                        style={styles.backButton}
                        onPress={onBack}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={18}
                            color="#C4B5FD"
                        />

                        <Text style={styles.backText}>
                            Back to sign in
                        </Text>
                    </Pressable>

                    <View style={styles.brandRow}>
                        <Image
                            source={require('../../assets/clutchmetrics-icon.png')}
                            style={styles.brandLogo}
                        />

                        <View>
                            <Text style={styles.brandName}>
                                ClutchMetrics
                            </Text>

                            <Text style={styles.brandSubtitle}>
                                GAMING HUB
                            </Text>
                        </View>
                    </View>

                    {sent ? (
                        <View style={styles.successCard}>
                            <Ionicons
                                name="mail-open-outline"
                                size={50}
                                color="#6EE7B7"
                            />

                            <Text style={styles.successTitle}>
                                Check your email
                            </Text>

                            <Text style={styles.successDescription}>
                                If an account exists with this
                                email address, you will receive
                                instructions to reset your password.
                            </Text>

                            <Pressable
                                style={styles.submitButton}
                                onPress={onBack}
                            >
                                <Text style={styles.submitText}>
                                    Back to Sign In
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        <>
                            <View style={styles.intro}>
                                <Text style={styles.eyebrow}>
                                    ACCOUNT RECOVERY
                                </Text>

                                <Text style={styles.title}>
                                    Forgot your password?
                                </Text>

                                <Text style={styles.description}>
                                    Enter your email address and
                                    we'll send you instructions
                                    to reset your password.
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
                                Email address
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="you@example.com"
                                placeholderTextColor="#66758F"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                            />

                            <Pressable
                                style={[
                                    styles.submitButton,
                                    loading && styles.disabledButton,
                                ]}
                                onPress={() => void handleSubmit()}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                    />
                                ) : (
                                    <Text style={styles.submitText}>
                                        Send Reset Link
                                    </Text>
                                )}
                            </Pressable>

                            <View style={styles.helpRow}>
                                <Ionicons
                                    name="shield-checkmark-outline"
                                    size={17}
                                    color="#A18BFF"
                                />

                                <Text style={styles.helpText}>
                                    Your account security matters to us.
                                </Text>
                            </View>
                        </>
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
    content: {
        flexGrow: 1,
        paddingHorizontal: 26,
        paddingTop: 25,
        paddingBottom: 35,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 32,
    },
    backText: {
        color: '#C4B5FD',
        fontSize: 13,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 52,
    },
    brandLogo: {
        width: 42,
        height: 42,
        borderRadius: 10,
    },
    brandName: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
    },
    brandSubtitle: {
        color: '#8196C4',
        fontSize: 10,
        letterSpacing: 2,
        marginTop: 3,
    },
    intro: {
        marginBottom: 30,
    },
    eyebrow: {
        color: '#A18BFF',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 14,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
    },
    description: {
        color: '#94A3C6',
        fontSize: 14,
        lineHeight: 23,
    },
    label: {
        color: '#CBD5E1',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#0D1320',
        borderWidth: 1,
        borderColor: '#303854',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 15,
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 18,
    },
    submitButton: {
        width: '100%',
        backgroundColor: '#7545F5',
        paddingVertical: 17,
        paddingHorizontal: 15,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        textAlign: 'center',
    },
    errorBox: {
        backgroundColor: '#351C2A',
        borderWidth: 1,
        borderColor: '#7F354C',
        borderRadius: 10,
        padding: 13,
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
        gap: 18,
    },
    successTitle: {
        color: '#FFFFFF',
        fontSize: 23,
        fontWeight: '800',
        textAlign: 'center',
    },
    successDescription: {
        color: '#94A3C6',
        fontSize: 14,
        lineHeight: 23,
        textAlign: 'center',
        marginBottom: 10,
    },
    helpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        marginTop: 25,
    },
    helpText: {
        color: '#8196C4',
        fontSize: 12,
    },
    footer: {
        color: '#8196C4',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.4,
        textAlign: 'center',
        marginTop: 60,
    },
});
