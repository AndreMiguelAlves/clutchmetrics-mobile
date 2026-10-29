
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

import { register } from '../services/auth';

type RegisterScreenProps = {
    onBack: () => void;
};

export default function RegisterScreen({
                                           onBack,
                                       }: RegisterScreenProps) {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [registered, setRegistered] = useState(false);

    async function handleRegister() {
        if (loading) return;

        setError('');

        if (
            !username.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {
            setError('Please fill in all fields.');
            return;
        }

        if (username.trim().length < 3) {
            setError(
                'Username must contain at least 3 characters.'
            );
            return;
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            setError('Please enter a valid email address.');
            return;
        }

        if (password.length < 8 || password.length > 72) {
            setError(
                'Password must contain between 8 and 72 characters.'
            );
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await register({
                username: username.trim(),
                email: email.trim(),
                password,
            });

            setRegistered(true);
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Could not create account.'
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

                    {registered ? (
                        <View style={styles.successCard}>
                            <Ionicons
                                name="checkmark-circle"
                                size={52}
                                color="#6EE7B7"
                            />

                            <Text style={styles.successTitle}>
                                Account created!
                            </Text>

                            <Text style={styles.successDescription}>
                                Check your email to activate your
                                ClutchMetrics account before signing in.
                            </Text>

                            <Pressable
                                style={[
                                    styles.submitButton,
                                    styles.successButton,
                                ]}
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
                                    CREATE ACCOUNT
                                </Text>

                                <Text style={styles.title}>
                                    Join ClutchMetrics
                                </Text>

                                <Text style={styles.description}>
                                    Create your competitive profile
                                    and start tracking your performance.
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
                                Username
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Choose a username"
                                placeholderTextColor="#66758F"
                                autoCapitalize="none"
                                autoCorrect={false}
                                maxLength={100}
                                autoComplete="username-new"
                            />

                            <Text style={styles.label}>
                                Email
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

                            <Text style={styles.label}>
                                Password
                            </Text>

                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Minimum 8 characters"
                                    placeholderTextColor="#66758F"
                                    secureTextEntry={!showPassword}
                                    autoComplete="new-password"
                                />

                                <Pressable
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    <Text style={styles.showText}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Text>
                                </Pressable>
                            </View>

                            <Text style={styles.label}>
                                Confirm Password
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Repeat your password"
                                placeholderTextColor="#66758F"
                                secureTextEntry={!showPassword}
                                autoComplete="new-password"
                            />

                            <Pressable
                                style={[
                                    styles.submitButton,
                                    loading && styles.disabledButton,
                                ]}
                                onPress={() => void handleRegister()}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator
                                        color="#FFFFFF"
                                    />
                                ) : (
                                    <Text style={styles.submitText}>
                                        Create Account
                                    </Text>
                                )}
                            </Pressable>

                            <View style={styles.signInRow}>
                                <Text style={styles.signInText}>
                                    Already have an account?
                                </Text>

                                <Pressable onPress={onBack}>
                                    <Text style={styles.signInLink}>
                                        Sign in
                                    </Text>
                                </Pressable>
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
        marginBottom: 48,
    },
    brandIcon: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#292047',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#7545F5',
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
        marginBottom: 28,
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
        fontSize: 27,
        fontWeight: '800',
        marginBottom: 12,
    },
    description: {
        color: '#94A3C6',
        fontSize: 14,
        lineHeight: 22,
    },
    label: {
        color: '#CBD5E1',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 9,
    },
    input: {
        backgroundColor: '#0D1320',
        borderWidth: 1,
        borderColor: '#303854',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 14,
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 22,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0D1320',
        borderWidth: 1,
        borderColor: '#303854',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 22,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 14,
        color: '#FFFFFF',
        fontSize: 14,
    },
    showText: {
        color: '#A18BFF',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 10,
    },
    submitButton: {
        backgroundColor: '#7545F5',
        paddingVertical: 17,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.6,
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
    errorBox: {
        padding: 13,
        borderRadius: 10,
        backgroundColor: '#351C2A',
        borderWidth: 1,
        borderColor: '#7F354C',
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
        gap: 15,
    },
    successTitle: {
        color: '#FFFFFF',
        fontSize: 23,
        fontWeight: '800',
    },
    successDescription: {
        color: '#94A3C6',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    signInRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        marginTop: 26,
    },
    signInText: {
        color: '#94A3C6',
        fontSize: 13,
    },
    signInLink: {
        color: '#A18BFF',
        fontSize: 13,
        fontWeight: '800',
    },
    footer: {
        color: '#8196C4',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.4,
        textAlign: 'center',
        marginTop: 55,
    },
    brandLogo: {
        width: 42,
        height: 42,
        borderRadius: 10,
    },
    successButton: {
        width: '100%',
        marginTop: 15,
    },
});
