
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { API_BASE_URL } from '../services/auth';

type ClipVideoPlayerProps = {
    videoUrl: string;
};

function resolveVideoUrl(url: string): string {
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

export default function ClipVideoPlayer({
                                            videoUrl,
                                        }: ClipVideoPlayerProps) {
    const player = useVideoPlayer({
        uri: resolveVideoUrl(videoUrl),
        contentType: 'progressive',
    });

    return (
        <View style={styles.container}>
            <VideoView
                style={styles.video}
                player={player}
                nativeControls
                contentFit="contain"
                fullscreenOptions={{ enable: true }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#000000',
        borderRadius: 12,
        overflow: 'hidden',
    },

    video: {
        width: '100%',
        height: 210,
    },
});
