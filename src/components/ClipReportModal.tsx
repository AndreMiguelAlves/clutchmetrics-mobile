
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { reportClip } from '../services/clips';
import type { ClipReportReason } from '../services/clips';

type ClipReportModalProps = {
    clipId: number;
    onClose: () => void;
};

const reportReasons: {
    label: string;
    value: ClipReportReason;
}[] = [
    {
        label: 'Not gaming related',
        value: 'NOT_GAMING_RELATED',
    },
    {
        label: 'Inappropriate content',
        value: 'INAPPROPRIATE_CONTENT',
    },
    {
        label: 'Spam',
        value: 'SPAM',
    },
    {
        label: 'Other',
        value: 'OTHER',
    },
];

export default function ClipReportModal({
                                            clipId,
                                            onClose,
                                        }: ClipReportModalProps) {
    const [reason, setReason] =
        useState<ClipReportReason>('NOT_GAMING_RELATED');

    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit() {
        if (submitting) {
            return;
        }

        setSubmitting(true);

        try {
            await reportClip(clipId, reason, details);

            onClose();

            Alert.alert(
                'Report submitted',
                'Your report has been submitted successfully. Our team will review it.'
            );
        } catch (err) {
            Alert.alert(
                'Report failed',
                err instanceof Error
                    ? err.message
                    : 'Could not submit your report.'
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={() => {
                if (!submitting) {
                    onClose();
                }
            }}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.modal}>
                        <Text style={styles.title}>
                            Report clip
                        </Text>

                        <Text style={styles.description}>
                            Help us keep the ClutchMetrics
                            community safe. Tell us why
                            you are reporting this clip.
                        </Text>

                        <View style={styles.divider} />

                        <Text style={styles.label}>
                            Reason
                        </Text>

                        {reportReasons.map((option) => (
                            <Pressable
                                key={option.value}
                                onPress={() =>
                                    setReason(option.value)
                                }
                                disabled={submitting}
                                style={[
                                    styles.reasonOption,
                                    reason === option.value &&
                                    styles.reasonSelected,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.radio,
                                        reason === option.value &&
                                        styles.radioSelected,
                                    ]}
                                >
                                    {reason === option.value && (
                                        <View
                                            style={styles.radioInner}
                                        />
                                    )}
                                </View>

                                <Text style={styles.reasonText}>
                                    {option.label}
                                </Text>
                            </Pressable>
                        ))}

                        <Text style={styles.detailsLabel}>
                            Additional details (optional)
                        </Text>

                        <TextInput
                            style={styles.textarea}
                            placeholder="Describe the issue..."
                            placeholderTextColor="#8292B3"
                            value={details}
                            onChangeText={setDetails}
                            maxLength={500}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            editable={!submitting}
                        />

                        <View style={styles.footer}>
                            <Pressable
                                style={styles.cancelButton}
                                onPress={onClose}
                                disabled={submitting}
                            >
                                <Text style={styles.cancelText}>
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.submitButton,
                                    submitting &&
                                    styles.disabledButton,
                                ]}
                                onPress={() => void handleSubmit()}
                                disabled={submitting}
                            >
                                <Text style={styles.submitText}>
                                    {submitting
                                        ? 'Submitting...'
                                        : 'Submit report'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.80)',
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },

    modal: {
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
        backgroundColor: '#111724',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#303854',
        padding: 22,
    },

    title: {
        color: '#FFFFFF',
        fontSize: 23,
        fontWeight: '800',
        marginBottom: 12,
    },

    description: {
        color: '#94A3C6',
        fontSize: 13,
        lineHeight: 21,
    },

    divider: {
        height: 1,
        backgroundColor: '#252D43',
        marginVertical: 20,
    },

    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 14,
    },

    reasonOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#252D43',
        borderRadius: 10,
        marginBottom: 9,
        backgroundColor: '#080B13',
    },

    reasonSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#211A3D',
    },

    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#8292B3',
        alignItems: 'center',
        justifyContent: 'center',
    },

    radioSelected: {
        borderColor: '#A18BFF',
    },

    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#A18BFF',
    },

    reasonText: {
        color: '#CBD5E1',
        fontSize: 13,
        fontWeight: '600',
    },

    detailsLabel: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        marginTop: 15,
        marginBottom: 12,
    },

    textarea: {
        backgroundColor: '#080B13',
        borderWidth: 1,
        borderColor: '#252D43',
        borderRadius: 10,
        padding: 14,
        minHeight: 100,
        color: '#FFFFFF',
        fontSize: 13,
    },

    footer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 24,
    },

    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#303854',
        alignItems: 'center',
    },

    cancelText: {
        color: '#CBD5E1',
        fontSize: 13,
        fontWeight: '700',
    },

    submitButton: {
        flex: 1.4,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: '#7545F5',
        alignItems: 'center',
    },

    submitText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
    },

    disabledButton: {
        opacity: 0.5,
    },
});
