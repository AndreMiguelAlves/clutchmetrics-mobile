
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';

type MainTabParamList = {
    Feed: undefined;
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

function PremiumTab() {
    return (
        <PlaceholderScreen
            title="Subscription"
            description="Explore Free and Premium membership features."
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
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#A18BFF',
                    tabBarInactiveTintColor: '#8292B3',
                    tabBarStyle: {
                        backgroundColor: '#111724',
                        borderTopColor: '#252D43',
                        paddingTop: 8,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '700',
                    },
                }}
            >
                <Tab.Screen
                    name="Feed"
                    component={FeedTab}
                />

                <Tab.Screen
                    name="Players"
                    component={PlayersTab}
                />

                <Tab.Screen
                    name="Premium"
                    component={PremiumTab}
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
