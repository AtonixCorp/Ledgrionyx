import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { useEnterprise } from '../context/EnterpriseContext';
import { colors } from '../theme/colors';

function relativeTime(value?: string) {
    if (!value) {
        return 'Just now';
    }
    const delta = Math.round((Date.now() - new Date(value).getTime()) / 86400000);
    if (delta <= 0) {
        return 'Today';
    }
    return `${delta}d ago`;
}

function deadlineStatus(value?: string) {
    if (!value) {
        return { label: 'No date', tone: colors.muted };
    }
    const delta = Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
    if (delta <= 0) {
        return { label: 'Overdue', tone: colors.danger };
    }
    if (delta <= 7) {
        return { label: `${delta}d left`, tone: colors.warning };
    }
    return { label: `${delta}d left`, tone: colors.success };
}

export default function NotificationsScreen() {
    const { auditEvents, complianceDeadlines } = useEnterprise();

    return (
        <Screen>
            <Text style={styles.header}>Notifications</Text>
            <Text style={styles.subheader}>Activity and compliance signals from the global console.</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Audit Events</Text>
                {auditEvents.slice(0, 8).map((event) => (
                    <View key={event.id} style={styles.card}>
                        <Text style={styles.title}>{event.summary || event.action || 'Activity event'}</Text>
                        <Text style={styles.meta}>{relativeTime(event.created_at)}</Text>
                    </View>
                ))}
                {auditEvents.length === 0 ? <Text style={styles.empty}>No recent audit events.</Text> : null}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Compliance Deadlines</Text>
                {complianceDeadlines.slice(0, 8).map((deadline) => {
                    const status = deadlineStatus(deadline.deadline_date);
                    return (
                        <View key={deadline.id} style={styles.card}>
                            <View style={styles.deadlineTopRow}>
                                <Text style={styles.title}>{deadline.title}</Text>
                                <Text style={[styles.deadlineTag, { color: status.tone }]}>{status.label}</Text>
                            </View>
                            <Text style={styles.meta}>{[deadline.entity_name, deadline.deadline_date].filter(Boolean).join(' · ') || 'No deadline metadata'}</Text>
                        </View>
                    );
                })}
                {complianceDeadlines.length === 0 ? <Text style={styles.empty}>No upcoming compliance deadlines.</Text> : null}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: { color: colors.ink, fontSize: 28, fontWeight: '800' },
    subheader: { color: colors.muted, fontSize: 14, marginBottom: 12 },
    section: { gap: 10 },
    sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
    card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 6 },
    title: { color: colors.ink, fontSize: 15, fontWeight: '800' },
    meta: { color: colors.muted, fontSize: 12 },
    empty: { color: colors.muted, fontSize: 14 },
    deadlineTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    deadlineTag: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
});