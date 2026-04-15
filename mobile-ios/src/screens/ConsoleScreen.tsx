import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import MiniBarChart from '../components/MiniBarChart';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { useEnterprise } from '../context/EnterpriseContext';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Console'>;

export default function ConsoleScreen({ navigation }: Props) {
    const { user, logout } = useAuth();
    const { organizations, currentOrganization, entities, tasks, auditEvents, complianceDeadlines } = useEnterprise();

    const suiteMix = [
        { label: 'Active', value: entities.filter((entity) => (entity.status || '').toLowerCase() === 'active').length, tone: colors.success },
        { label: 'Pending', value: entities.filter((entity) => ['pending', 'draft'].includes((entity.status || '').toLowerCase())).length, tone: colors.warning },
        { label: 'Other', value: entities.filter((entity) => !['active', 'pending', 'draft'].includes((entity.status || '').toLowerCase())).length, tone: colors.blue },
    ];

    return (
        <Screen>
            <View style={styles.hero}>
                <Text style={styles.kicker}>Ledgrionyx Console</Text>
                <Text style={styles.title}>Welcome, {user?.name || 'User'}</Text>
                <Text style={styles.subtitle}>This native iOS shell keeps the same hierarchy as the web app: console first, then organizations, then business suites and dashboards.</Text>
            </View>

            <View style={styles.stats}>
                <StatCard label="Organizations" value={organizations.length} caption="Available to this account" />
                <StatCard label="Business Suites" value={entities.length} caption="Loaded for the active organization" />
                <StatCard label="Open Tasks" value={tasks.length} caption="Assigned to your account" />
                <StatCard label="Alerts" value={complianceDeadlines.length} caption="Upcoming deadlines and notices" />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Current Organization</Text>
                <Text style={styles.cardValue}>{currentOrganization?.name || 'No organization selected'}</Text>
                <View style={styles.actions}>
                    <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('OrganizationSelector')}>
                        <Text style={styles.primaryButtonText}>Open Organizations</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('OrganizationOverview')}>
                        <Text style={styles.secondaryButtonText}>Organization Dashboard</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('BusinessSuites')}>
                        <Text style={styles.secondaryButtonText}>Business Suites</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('TaskInbox')}>
                        <Text style={styles.secondaryButtonText}>Task Inbox</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Notifications')}>
                        <Text style={styles.secondaryButtonText}>Notifications</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={logout}>
                        <Text style={styles.secondaryButtonText}>Sign Out</Text>
                    </Pressable>
                </View>
            </View>

            <MiniBarChart title="Business Suite Mix" data={suiteMix} />

            <View style={styles.panel}>
                <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>Open Tasks</Text>
                    <Text style={styles.panelLink} onPress={() => navigation.navigate('TaskInbox')}>See all</Text>
                </View>
                {tasks.slice(0, 3).map((task) => (
                    <View key={task.id} style={styles.panelRow}>
                        <Text style={styles.panelRowTitle}>{task.title}</Text>
                        <Text style={styles.panelRowMeta}>{task.priority || task.state || 'open'}</Text>
                    </View>
                ))}
                {tasks.length === 0 ? <Text style={styles.panelEmpty}>No open tasks right now.</Text> : null}
            </View>

            <View style={styles.panel}>
                <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>Audit Activity</Text>
                    <Text style={styles.panelLink} onPress={() => navigation.navigate('Notifications')}>See all</Text>
                </View>
                {auditEvents.slice(0, 3).map((event) => (
                    <View key={event.id} style={styles.panelRow}>
                        <Text style={styles.panelRowTitle}>{event.summary || event.action || 'Activity'}</Text>
                        <Text style={styles.panelRowMeta}>{event.created_at ? new Date(event.created_at).toLocaleDateString() : 'Today'}</Text>
                    </View>
                ))}
                {auditEvents.length === 0 ? <Text style={styles.panelEmpty}>No recent audit events.</Text> : null}
            </View>

            <View style={styles.panel}>
                <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>Compliance Signals</Text>
                    <Text style={styles.panelLink} onPress={() => navigation.navigate('Notifications')}>See all</Text>
                </View>
                {complianceDeadlines.slice(0, 3).map((deadline) => (
                    <View key={deadline.id} style={styles.panelRow}>
                        <Text style={styles.panelRowTitle}>{deadline.title}</Text>
                        <Text style={styles.panelRowMeta}>{deadline.deadline_date || 'No date'}</Text>
                    </View>
                ))}
                {complianceDeadlines.length === 0 ? <Text style={styles.panelEmpty}>No upcoming deadlines.</Text> : null}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    hero: { gap: 10 },
    kicker: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    title: { color: colors.ink, fontSize: 30, fontWeight: '800' },
    subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22 },
    stats: { gap: 12 },
    card: {
        backgroundColor: colors.surface,
        borderColor: colors.line,
        borderRadius: 22,
        borderWidth: 1,
        gap: 12,
        padding: 18,
    },
    cardTitle: { color: colors.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
    cardValue: { color: colors.ink, fontSize: 22, fontWeight: '800' },
    actions: { gap: 10 },
    primaryButton: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    primaryButtonText: { color: '#fff', fontWeight: '800' },
    secondaryButton: { backgroundColor: colors.surfaceAlt, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
    secondaryButtonText: { color: colors.ink, fontWeight: '700' },
    panel: {
        backgroundColor: colors.surface,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.line,
        padding: 18,
        gap: 12,
    },
    panelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    panelTitle: {
        color: colors.ink,
        fontSize: 18,
        fontWeight: '800',
    },
    panelLink: {
        color: colors.accent,
        fontSize: 13,
        fontWeight: '800',
    },
    panelRow: {
        gap: 4,
        paddingTop: 2,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    panelRowTitle: {
        color: colors.ink,
        fontSize: 15,
        fontWeight: '700',
    },
    panelRowMeta: {
        color: colors.muted,
        fontSize: 12,
    },
    panelEmpty: {
        color: colors.muted,
        fontSize: 14,
    },
});