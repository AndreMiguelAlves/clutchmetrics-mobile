import { useEffect, useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import { StatusBar } from 'expo-status-bar';
import { login } from './src/services/auth';
import {
  clearSession,
  saveSession,
  saveUsername,
  getUsername,
  getAccessToken,
  getRefreshToken,
} from './src/services/session';
import { authenticatedFetch } from './src/services/api';
import MainTabs from './src/navigation/MainTabs';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function App() {
  const [screen, setScreen] = useState<
      'welcome' | 'login' | 'register' | 'forgot-password' | 'home'
  >('welcome');
  const [username, setUsername] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);


  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const accessToken = await getAccessToken();
        const refreshToken = await getRefreshToken();

        // No saved session
        if (!accessToken || !refreshToken) {
          return;
        }

        // Validate the session and refresh tokens if needed
        const response = await authenticatedFetch('/api/auth/me');

        if (response.ok) {
          const savedUsername = await getUsername();

          if (mounted) {
            setUsername(savedUsername || 'player');
            setScreen('home');
          }
        } else if (response.status === 401) {
          // The saved session is no longer valid
          await clearSession();
        }
      } catch (error) {
        // Keep stored tokens in case of a temporary network error
        console.warn('Could not restore session:', error);
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, []);


  async function handleSignIn(email: string, password: string) {
    setLoginLoading(true);
    setLoginError('');

    try {
      const result = await login(email, password);

      await saveSession(result.accessToken, result.refreshToken);

      const loggedInUsername = result.username || 'player';

      await saveUsername(loggedInUsername);

      setUsername(loggedInUsername);
      setScreen('home');
    } catch (error) {
      setLoginError(
          error instanceof Error
              ? error.message
              : 'Could not sign in.'
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await clearSession();

      setUsername('');
      setLoginError('');
      setScreen('login');
    } catch {
      Alert.alert(
          'Logout failed',
          'Could not clear the local session.'
      );
    }
  }

  if (checkingSession) {
    return (
        <View style={[styles.container, styles.loadingContainer]}>
          <StatusBar style="light" />

          <ActivityIndicator
              size="large"
              color="#A18BFF"
          />

          <Text style={styles.loadingText}>
            Restoring your session...
          </Text>
        </View>
    );
  }

  if (screen === 'home') {
    return (
        <MainTabs
            username={username}
            onLogout={handleLogout}
        />
    );
  }

  if (screen === 'forgot-password') {
    return (
        <ForgotPasswordScreen
            onBack={() => setScreen('login')}
        />
    );
  }

  if (screen === 'register') {
    return (
        <RegisterScreen
            onBack={() => setScreen('login')}
        />
    );
  }

  if (screen === 'login') {
    return (
        <LoginScreen
            onBack={() => setScreen('welcome')}
            onSignIn={handleSignIn}
            loading={loginLoading}
            error={loginError}
            onCreateAccount={() => {
              setLoginError('');
              setScreen('register');
            }}
            onForgotPassword={() => {
              setLoginError('');
              setScreen('forgot-password');
            }}
        />
    );
  }

  return (
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Brand */}
        <View style={styles.header}>
          <Image
              source={require('./assets/clutchmetrics-icon.png')}
              style={styles.logo}
          />

          <View>
            <Text style={styles.brandName}>ClutchMetrics</Text>
            <Text style={styles.brandSubtitle}>GAMING HUB</Text>
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.content}>
          <Text style={styles.eyebrow}>
            CLUTCHMETRICS MOBILE
          </Text>

          <Text style={styles.title}>
            Your game.{'\n'}
            Your highlights.{'\n'}
            <Text style={styles.titleAccent}>
              Your community.
            </Text>
          </Text>

          <Text style={styles.description}>
            Discover competitive gaming highlights,
            connect with players and share your best moments.
          </Text>

          <View style={styles.divider} />

          <View style={styles.featureCard}>
            <Text style={styles.featureNumber}>01</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>
                Gaming Feed
              </Text>
              <Text style={styles.featureDescription}>
                Watch highlights from the community.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureNumber}>02</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>
                Player Community
              </Text>
              <Text style={styles.featureDescription}>
                Discover players and interact with clips.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureNumber}>03</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>
                Quick Sharing
              </Text>
              <Text style={styles.featureDescription}>
                Share gaming moments from your phone.
              </Text>
            </View>
          </View>
          <Pressable
              style={styles.signInButton}
              onPress={() => setScreen('login')}
          >
            <Text style={styles.signInButtonText}>
              Get Started →
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            YOUR GAME. YOUR DATA. YOUR EDGE.
          </Text>
          <Text style={styles.version}>
            MOBILE EXPERIENCE
          </Text>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B13',
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },

  brandSubtitle: {
    color: '#8196C4',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 3,
  },

  content: {
    width: '100%',
  },

  eyebrow: {
    color: '#9A83FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 16,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 44,
  },

  titleAccent: {
    color: '#855CFF',
  },

  description: {
    color: '#94A3C6',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 18,
  },

  divider: {
    height: 1,
    backgroundColor: '#242B40',
    marginVertical: 25,
  },

  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111724',
    borderColor: '#252D43',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 16,
  },

  featureNumber: {
    color: '#8969FF',
    fontSize: 17,
    fontWeight: '800',
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },

  featureDescription: {
    color: '#8B9AB7',
    fontSize: 12,
    lineHeight: 18,
  },

  footer: {
    alignItems: 'center',
    gap: 7,
  },

  footerText: {
    color: '#91A1C5',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  version: {
    color: '#576584',
    fontSize: 10,
    letterSpacing: 2,
  },
  signInButton: {
    backgroundColor: '#754CFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#94A3C6',
    fontSize: 14,
    marginTop: 16,
  },
});
