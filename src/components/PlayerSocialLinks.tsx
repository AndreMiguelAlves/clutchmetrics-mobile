
import {
    Alert,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import type { PublicPlayerProfile } from '../services/player';

type PlayerSocialLinksProps = {
    profile: PublicPlayerProfile;
};

export default function PlayerSocialLinks({
                                              profile,
                                          }: PlayerSocialLinksProps) {

    const socialLinks = [
        {
            label: 'YouTube',
            icon: 'logo-youtube' as const,
            url: profile.youtubeUrl,
        },
        {
            label: 'Twitch',
            icon: 'logo-twitch' as const,
            url: profile.twitchUrl,
        },
        {
            label: 'TikTok',
            icon: 'logo-tiktok' as const,
            url: profile.tiktokUrl,
        },
        {
            label: 'Instagram',
            icon: 'logo-instagram' as const,
            url: profile.instagramUrl,
        },
    ].filter((social) => Boolean(social.url?.trim()));

    async function handleOpenLink(url: string | null) {
        const link = url?.trim();

        if (!link || !/^https?:\/\/[^\s/]+/i.test(link)) {
            Alert.alert(
                'Invalid link',
                'This social media link is not valid.'
            );
            return;
        }

        try {
            await Linking.openURL(link);
        } catch {
            Alert.alert(
                'Could not open link',
                'Please try again later.'
            );
        }
    }

    if (socialLinks.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                CONNECT WITH THIS PLAYER
            </Text>

            <View style={styles.links}>
                {socialLinks.map((social) => (
                    <Pressable
                        key={social.label}
                        style={styles.socialButton}
                        onPress={() =>
                            void handleOpenLink(social.url)
                        }
                        accessibilityRole="link"
                        accessibilityLabel={`Open ${social.label}`}
                    >
                        <Ionicons
                            name={social.icon}
                            size={19}
                            color="#A18BFF"
                        />

                        <Text style={styles.socialText}>
                            {social.label}
                        </Text>

                        <Ionicons
                            name="open-outline"
                            size={14}
                            color="#8292B3"
                        />
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#252D43',
    },

    title: {
        color: '#A18BFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 15,
        textAlign: 'center',
    },

    links: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
    },

    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#080B13',
        borderWidth: 1,
        borderColor: '#303854',
        borderRadius: 10,
        paddingHorizontal: 13,
        paddingVertical: 12,
    },

    socialText: {
        color: '#CBD5E1',
        fontSize: 12,
        fontWeight: '700',
    },
});
