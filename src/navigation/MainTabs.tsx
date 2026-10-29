
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import FeedScreen from '../screens/FeedScreen';
import PlayersScreen from '../screens/PlayersScreen';
import HomeScreen from '../screens/HomeScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';

type MainTabParamList = {
    Feed: { clipId: number } | undefined;
    Players: undefined;
    Premium: undefined;
    Profile: undefined;
};

type MainTabsProps = {
    username: string;
    onLogout: () => void;
};

type PlaceholderProps = {
    title: string;
    description: string;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const tabIcons: Record<
    keyof MainTabParamList,
    {
        active: keyof typeof Ionicons.glyphMap;
        inactive: keyof typeof Ionicons.glyphMap;
    }
> = {
    Feed: {
        active: 'play-circle',
        inactive: 'play-circle-outline',
    },
    Players: {
        active: 'people',
        inactive: 'people-outline',
    },
    Premium: {
        active: 'diamond',
        inactive: 'diamond-outline',
    },
    Profile: {
        active: 'person-circle',
        inactive: 'person-circle-outline',
    },
};

function PlaceholderScreen({
                               title,
                               description,
                           }: PlaceholderProps) {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <Text style={styles.brand}>CLUTCHMETRICS</Text>
                <Text style={styles.heading}>{title}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>
                    {description}
                </Text>
            </View>
        </SafeAreaView>
    );
}

function FeedTab() {
    return (
        <PlaceholderScreen
            title="Feed"
            description="Discover gaming highlights from the ClutchMetrics community."
        />
    );
}

function PlayersTab() {
    return (
        <PlaceholderScreen
            title="Discover Players"
            description="Find players, explore profiles and connect with the community."
        />
    );
}

export default function MainTabs({
                                     username,
                                     onLogout,
                                 }: MainTabsProps) {
    return (
        <NavigationContainer>
            <Tab.Navigator
                initialRouteName="Feed"
                screenOptions={({ route }) => ({
                    headerShown: false,

                    tabBarActiveTintColor: '#A18BFF',
                    tabBarInactiveTintColor: '#8292B3',

                    tabBarIcon: ({ focused, color, size }) => {
                        const iconName = focused
                            ? tabIcons[route.name].active
                            : tabIcons[route.name].inactive;

                        return (
                            <Ionicons
                                name={iconName}
                                size={size}
                                color={color}
                            />
                        );
                    },

                    tabBarStyle: {
                        backgroundColor: '#111724',
                        borderTopColor: '#252D43',
                        paddingTop: 8,
                    },

                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '700',
                    },
                })}
            >
                <Tab.Screen
                    name="Feed"
                    component={FeedScreen}
                />


                <Tab.Screen name="Players">
                    {({ navigation }) => (
                        <PlayersScreen
                            onOpenClip={(clipId) => {
                                navigation.navigate('Feed', {
                                    clipId,
                                });
                            }}
                        />
                    )}
                </Tab.Screen>


                <Tab.Screen
                    name="Premium"
                    component={SubscriptionScreen}
                />

                <Tab.Screen name="Profile">
                    {() => (
                        <HomeScreen
                            username={username}
                            onLogout={onLogout}
                        />
                    )}
                </Tab.Screen>
            </Tab.Navigator>
        </NavigationContainer>
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

    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },

    title: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: '800',
        marginBottom: 12,
    },

    description: {
        color: '#94A3C6',
        fontSize: 15,
        lineHeight: 24,
    },
});
