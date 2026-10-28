
import { StatusBar } from 'expo-status-bar';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type HomeScreenProps = {
    username: string;
    onLogout: () => void;
};

export default function HomeScreen({
                                       username,
                                       onLogout,
                                   }: HomeScreenProps) {
    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <Image
                    source={require('../../assets/clutchmetrics-icon.png')}
                    style={styles.logo}
                />

                <View>
                    <Text style={styles.brandName}>ClutchMetrics</Text>
                    <Text style={styles.brandSubtitle}>GAMING HUB</Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.eyebrow}>PLAYER WORKSPACE</Text>

                <Text style={styles.title}>
                    Welcome back,{'\n'}
                    <Text style={styles.username}>{username}.</Text>
                </Text>

                <Text style={styles.description}>
                    You're now signed in to ClutchMetrics Mobile.
                    Discover gaming highlights and connect with
                    the community.
                </Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Your mobile experience
                    </Text>

                    <Text style={styles.cardDescription}>
                        Your Feed, player profiles and community
                        features will be available here.
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Pressable
                    style={styles.logoutButton}
                    onPress={onLogout}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </Pressable>

                <Text style={styles.footerText}>
                    YOUR GAME. YOUR DATA. YOUR EDGE.
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
        paddingBottom: 35,
        justifyContent: 'space-between',
    },

    header: {
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
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 43,
    },

    username: {
        color: '#855CFF',
    },

    description: {
        color: '#94A3C6',
        fontSize: 15,
        lineHeight: 24,
        marginTop: 18,
    },

    card: {
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#252D43',
        borderRadius: 14,
        padding: 20,
        marginTop: 30,
    },

    cardTitle: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 10,
    },

    cardDescription: {
        color: '#94A3C6',
        fontSize: 14,
        lineHeight: 22,
    },

    footer: {
        gap: 25,
    },

    logoutButton: {
        height: 52,
        borderWidth: 1,
        borderColor: '#754CFF',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoutText: {
        color: '#A892FF',
        fontSize: 15,
        fontWeight: '700',
    },

    footerText: {
        color: '#64779F',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        textAlign: 'center',
    },
});
