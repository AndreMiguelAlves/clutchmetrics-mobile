
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import {
    getMySubscription,
    changeSubscriptionPlan,
} from '../services/subscription';

import type {
    SubscriptionResponse,
    SubscriptionPlanCode,
} from '../services/subscription';

export default function SubscriptionScreen() {
    const [subscription, setSubscription] =
        useState<SubscriptionResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [changingPlan, setChangingPlan] = useState(false);
    const [error, setError] = useState('');

    // Refresh subscription when opening this tab
    useFocusEffect(
        useCallback(() => {
            let active = true;

            setLoading(true);
            setError('');

            async function loadSubscription() {
                try {
                    const data = await getMySubscription();

                    if (active) {
                        setSubscription(data);
                    }
                } catch (err) {
                    if (active) {
                        setError(
                            err instanceof Error
                                ? err.message
                                : 'Could not load your subscription.'
                        );
                    }
                } finally {
                    if (active) {
                        setLoading(false);
                    }
                }
            }

            void loadSubscription();

            return () => {
                active = false;
            };
        }, [])
    );

    async function applyPlan(
        planCode: SubscriptionPlanCode
    ) {
        if (
            changingPlan ||
            subscription?.planCode === planCode
        ) {
            return;
        }

        setChangingPlan(true);

        try {
            const data = await changeSubscriptionPlan(
                planCode
            );

            setSubscription(data);

            Alert.alert(
                'Subscription updated',
                `Your plan has been changed to ${data.planName}.`
            );
        } catch (err) {
            Alert.alert(
                'Something went wrong',
                err instanceof Error
                    ? err.message
                    : 'Could not change subscription plan.'
            );
        } finally {
            setChangingPlan(false);
        }
    }

    function confirmPlanChange(
        planCode: SubscriptionPlanCode
    ) {
        Alert.alert(
            'Change subscription',
            planCode === 'PREMIUM'
                ? 'Switch to the Premium plan?'
                : 'Switch to the Free plan?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Confirm',
                    onPress: () => {
                        void applyPlan(planCode);
                    },
                },
            ]
        );
    }

    const isPremium =
        subscription?.planCode === 'PREMIUM' &&
        subscription.active;

    const premiumEndDate =
        isPremium && subscription?.endsAt
            ? new Date(subscription.endsAt)
            : null;

    const validEndDate =
        premiumEndDate &&
        !Number.isNaN(premiumEndDate.getTime())
            ? premiumEndDate
            : null;

    const premiumDaysRemaining = validEndDate
        ? Math.max(
            0,
            Math.round(
                (
                    Date.UTC(
                        validEndDate.getFullYear(),
                        validEndDate.getMonth(),
                        validEndDate.getDate()
                    ) -
                    Date.UTC(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        new Date().getDate()
                    )
                ) / 86400000
            )
        )
        : null;

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.brand}>
                    CLUTCHMETRICS
                </Text>

                <Text style={styles.heading}>
                    Subscription
                </Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator
                        size="large"
                        color="#A18BFF"
                    />

                    <Text style={styles.message}>
                        Loading subscription...
                    </Text>
                </View>
            ) : error && !subscription ? (
                <View style={styles.center}>
                    <Text style={styles.error}>
                        {error}
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Introduction */}
                    <View style={styles.intro}>
                        <Text style={styles.eyebrow}>
                            MEMBERSHIP
                        </Text>

                        <Text style={styles.title}>
                            Choose your edge.
                        </Text>

                        <Text style={styles.description}>
                            Choose the plan that fits your
                            competitive gaming goals.
                        </Text>
                    </View>

                    {/* Current plan */}
                    {subscription && (
                        <View style={styles.currentPlan}>
                            <View style={styles.currentInfo}>
                                <Text style={styles.currentLabel}>
                                    CURRENT PLAN
                                </Text>

                                <Text style={styles.currentName}>
                                    {subscription.planName}
                                </Text>

                                {premiumDaysRemaining !== null &&
                                    validEndDate && (
                                        <Text style={styles.remaining}>
                                            {premiumDaysRemaining > 0
                                                ? `${premiumDaysRemaining} days remaining`
                                                : 'Current period has ended'}
                                            {' · '}
                                            {validEndDate.toLocaleDateString(
                                                'en-GB',
                                                {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                }
                                            )}
                                        </Text>
                                    )}
                            </View>

                            <View
                                style={[
                                    styles.statusBadge,
                                    !subscription.active &&
                                    styles.inactiveBadge,
                                ]}
                            >
                                <Text style={styles.statusText}>
                                    {subscription.active
                                        ? 'ACTIVE'
                                        : 'INACTIVE'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Free plan */}
                    <View
                        style={[
                            styles.planCard,
                            subscription?.planCode === 'FREE' &&
                            styles.selectedPlan,
                        ]}
                    >
                        <Text style={styles.planEyebrow}>
                            FREE
                        </Text>

                        <Text style={styles.planTitle}>
                            Free
                        </Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.price}>
                                €0
                            </Text>

                            <Text style={styles.pricePeriod}>
                                / month
                            </Text>
                        </View>

                        <Text style={styles.planDescription}>
                            Essential performance tracking
                            for competitive players.
                        </Text>

                        {[
                            'Core match analytics',
                            'Game account tracking',
                            'Match history',
                            'HD video exports (720p)',
                        ].map((feature) => (
                            <View
                                key={feature}
                                style={styles.featureRow}
                            >
                                <Ionicons
                                    name="checkmark-circle"
                                    size={17}
                                    color="#A18BFF"
                                />

                                <Text style={styles.featureText}>
                                    {feature}
                                </Text>
                            </View>
                        ))}

                        <Pressable
                            style={[
                                styles.planButton,
                                subscription?.planCode === 'FREE' &&
                                styles.currentButton,
                            ]}
                            disabled={
                                changingPlan ||
                                subscription?.planCode === 'FREE'
                            }
                            onPress={() =>
                                confirmPlanChange('FREE')
                            }
                        >
                            <Text style={styles.planButtonText}>
                                {subscription?.planCode === 'FREE'
                                    ? 'Current plan'
                                    : 'Switch to Free'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Premium plan */}
                    <View
                        style={[
                            styles.planCard,
                            styles.premiumCard,
                            subscription?.planCode === 'PREMIUM' &&
                            styles.selectedPlan,
                        ]}
                    >
                        <View style={styles.premiumHeader}>
                            <Text style={styles.planEyebrow}>
                                PREMIUM
                            </Text>

                            <View style={styles.recommended}>
                                <Text style={styles.recommendedText}>
                                    RECOMMENDED
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.planTitle}>
                            Premium
                        </Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.price}>
                                €9.99
                            </Text>

                            <Text style={styles.pricePeriod}>
                                / month
                            </Text>
                        </View>

                        <Text style={styles.planDescription}>
                            Advanced analytics and creator
                            features without limits.
                        </Text>

                        {[
                            'Unlimited analytics',
                            'Advanced performance insights',
                            'Full HD video exports (1080p)',
                        ].map((feature) => (
                            <View
                                key={feature}
                                style={styles.featureRow}
                            >
                                <Ionicons
                                    name="checkmark-circle"
                                    size={17}
                                    color="#A18BFF"
                                />

                                <Text style={styles.featureText}>
                                    {feature}
                                </Text>
                            </View>
                        ))}

                        <Pressable
                            style={[
                                styles.planButton,
                                styles.premiumButton,
                                subscription?.planCode === 'PREMIUM' &&
                                styles.currentButton,
                            ]}
                            disabled={
                                changingPlan ||
                                subscription?.planCode === 'PREMIUM'
                            }
                            onPress={() =>
                                confirmPlanChange('PREMIUM')
                            }
                        >
                            {changingPlan ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />
                            ) : (
                                <Text style={styles.planButtonText}>
                                    {subscription?.planCode === 'PREMIUM'
                                        ? 'Current plan'
                                        : 'Upgrade to Premium'}
                                </Text>
                            )}
                        </Pressable>
                    </View>

                    {/* Subscription details */}
                    {subscription && (
                        <View style={styles.detailsCard}>
                            <Text style={styles.detailsTitle}>
                                Plan details
                            </Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    Unlimited analytics
                                </Text>

                                <Text style={styles.detailValue}>
                                    {subscription.unlimitedAnalytics
                                        ? 'Yes'
                                        : 'No'}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    Video export quality
                                </Text>

                                <Text style={styles.detailValue}>
                                    {isPremium
                                        ? 'Full HD (1080p)'
                                        : 'HD (720p)'}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    Performance insights
                                </Text>

                                <Text style={styles.detailValue}>
                                    {isPremium
                                        ? 'Unlocked'
                                        : 'Locked'}
                                </Text>
                            </View>
                        </View>
                    )}

                    <Text style={styles.footer}>
                        YOUR GAME. YOUR DATA. YOUR EDGE.
                    </Text>
                </ScrollView>
            )}
        </SafeAreaView>
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
        padding: 20,
        paddingBottom: 45,
    },
    intro: {
        marginBottom: 24,
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
        fontSize: 27,
        fontWeight: '800',
        marginBottom: 10,
    },
    description: {
        color: '#94A3C6',
        fontSize: 14,
        lineHeight: 22,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 25,
    },
    message: {
        color: '#94A3C6',
        fontSize: 13,
        marginTop: 15,
    },
    error: {
        color: '#FB7185',
        fontSize: 14,
        textAlign: 'center',
    },
    currentPlan: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#303854',
        borderRadius: 14,
        padding: 18,
        marginBottom: 20,
        gap: 12,
    },
    currentInfo: {
        flex: 1,
    },
    currentLabel: {
        color: '#94A3C6',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    currentName: {
        color: '#FFFFFF',
        fontSize: 23,
        fontWeight: '800',
    },
    remaining: {
        color: '#C4B5FD',
        fontSize: 12,
        marginTop: 9,
        lineHeight: 19,
    },
    statusBadge: {
        backgroundColor: '#14382F',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 8,
    },
    inactiveBadge: {
        backgroundColor: '#44212C',
    },
    statusText: {
        color: '#6EE7B7',
        fontSize: 10,
        fontWeight: '800',
    },
    planCard: {
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#303854',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    premiumCard: {
        borderColor: '#7545F5',
    },
    selectedPlan: {
        borderWidth: 2,
    },
    planEyebrow: {
        color: '#A18BFF',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 12,
    },
    planTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 7,
        marginTop: 14,
        marginBottom: 18,
    },
    price: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '800',
    },
    pricePeriod: {
        color: '#94A3C6',
        fontSize: 13,
    },
    planDescription: {
        color: '#94A3C6',
        fontSize: 13,
        lineHeight: 21,
        marginBottom: 18,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    featureText: {
        color: '#CBD5E1',
        fontSize: 13,
        flex: 1,
    },
    planButton: {
        backgroundColor: '#303854',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
    },
    premiumButton: {
        backgroundColor: '#7545F5',
    },
    currentButton: {
        backgroundColor: '#292047',
        borderWidth: 1,
        borderColor: '#7545F5',
    },
    planButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    premiumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    recommended: {
        backgroundColor: '#2A2148',
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 7,
    },
    recommendedText: {
        color: '#C4B5FD',
        fontSize: 9,
        fontWeight: '800',
    },
    detailsCard: {
        backgroundColor: '#111724',
        borderWidth: 1,
        borderColor: '#303854',
        borderRadius: 14,
        padding: 18,
        marginTop: 12,
    },
    detailsTitle: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '800',
        marginBottom: 18,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#252D43',
        gap: 15,
    },
    detailLabel: {
        color: '#94A3C6',
        fontSize: 12,
        flex: 1,
    },
    detailValue: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'right',
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
