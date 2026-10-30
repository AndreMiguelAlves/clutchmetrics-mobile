
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

type LoginScreenProps = {
    onSignIn: (email: string, password: string) => void;
    onBack: () => void;
    onCreateAccount: () => void;
    onForgotPassword: () => void;
    loading?: boolean;
    error?: string;
};

export default function LoginScreen({
                                        onSignIn,
                                        onBack,
                                        onCreateAccount,
                                        onForgotPassword,
                                        loading = false,
                                        error = '',
                                    }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    function handleSignIn() {
        if (!email.trim() || !password) {
            return;
        }

        onSignIn(email.trim(), password);
    }

    const canSubmit = !!email.trim() && !!password && !loading;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <Pressable onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>‹ Back</Text>
                </Pressable>

                <View style={styles.brand}>
                    <Image
                        source={require('../../assets/clutchmetrics-icon.png')}
                        style={styles.logo}
                    />

                    <View>
                        <Text style={styles.brandName}>ClutchMetrics</Text>
                        <Text style={styles.brandSubtitle}>GAMING HUB</Text>
                    </View>
                </View>

                <View style={styles.intro}>
                    <Text style={styles.eyebrow}>WELCOME BACK</Text>

                    <Text style={styles.title}>
                        Sign in to{'\n'}ClutchMetrics
                    </Text>

                    <Text style={styles.description}>
                        Discover highlights, connect with players and explore the ClutchMetrics community.
                    </Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Email</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="player@example.com"
                        placeholderTextColor="#657494"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        autoComplete="email"
                    />

                    <View style={styles.passwordHeader}>
                        <Text style={styles.label}>Password</Text>

                        <Pressable onPress={onForgotPassword}>
                            <Text style={styles.linkText}>
                                Forgot password?
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Enter your password"
                            placeholderTextColor="#657494"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password"
                        />

                        <Pressable
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.showButton}
                        >
                            <Text style={styles.showText}>
                                {showPassword ? 'Hide' : 'Show'}
                            </Text>
                        </Pressable>
                    </View>

                    {!!error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}

                    <Pressable
                        onPress={handleSignIn}
                        disabled={!canSubmit}
                        style={[
                            styles.signInButton,
                            !canSubmit && styles.disabledButton,
                        ]}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.signInText}>Sign in →</Text>
                        )}
                    </Pressable>

                    <View style={styles.separator}>
                        <View style={styles.line} />
                        <Text style={styles.separatorText}>
                            NEW TO CLUTCHMETRICS?
                        </Text>
                        <View style={styles.line} />
                    </View>

                    <Pressable
                        onPress={onCreateAccount}
                        style={styles.registerButton}
                    >
                        <Text style={styles.registerText}>
                            Create an account
                        </Text>
                    </Pressable>
                </View>

                <Text style={styles.footer}>
                    YOUR GAME. YOUR DATA. YOUR EDGE.
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#080B13',
    },

    content: {
        flexGrow: 1,
        paddingHorizontal: 26,
        paddingTop: 50,
        paddingBottom: 35,
    },

    backButton: {
        marginBottom: 35,
    },

    backText: {
        color: '#A892FF',
        fontSize: 15,
        fontWeight: '600',
    },

    brand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    logo: {
        width: 46,
        height: 46,
        borderRadius: 12,
    },

    brandName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },

    brandSubtitle: {
        color: '#8196C4',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        marginTop: 3,
    },

    intro: {
        marginTop: 65,
        marginBottom: 38,
    },

    eyebrow: {
        color: '#9A83FF',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 17,
    },

    title: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 41,
    },

    description: {
        color: '#94A3C6',
        fontSize: 14,
        lineHeight: 23,
        marginTop: 16,
    },

    form: {
        width: '100%',
    },

    label: {
        color: '#C2D0EE',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 10,
    },

    input: {
        height: 53,
        borderWidth: 1,
        borderColor: '#283249',
        borderRadius: 10,
        backgroundColor: '#101622',
        color: '#FFFFFF',
        paddingHorizontal: 15,
        fontSize: 15,
        marginBottom: 22,
    },

    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    linkText: {
        color: '#9B7BFF',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 10,
    },

    passwordContainer: {
        height: 53,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#283249',
        borderRadius: 10,
        backgroundColor: '#101622',
    },

    passwordInput: {
        flex: 1,
        color: '#FFFFFF',
        paddingHorizontal: 15,
        fontSize: 15,
    },

    showButton: {
        paddingHorizontal: 15,
        paddingVertical: 12,
    },

    showText: {
        color: '#9A83FF',
        fontSize: 12,
        fontWeight: '700',
    },

    errorText: {
        color: '#FF737F',
        fontSize: 13,
        marginTop: 14,
    },

    signInButton: {
        height: 53,
        backgroundColor: '#754CFF',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 26,
    },

    disabledButton: {
        opacity: 0.55,
    },

    signInText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },

    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 32,
        marginBottom: 23,
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#283249',
    },

    separatorText: {
        color: '#8CA2CE',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },

    registerButton: {
        height: 53,
        borderWidth: 1,
        borderColor: '#303A52',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    registerText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    footer: {
        color: '#64779F',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        textAlign: 'center',
        marginTop: 55,
    },
});
