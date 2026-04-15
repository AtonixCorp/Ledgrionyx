import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import StatCard from '../components/StatCard';
import { useEnterprise } from '../context/EnterpriseContext';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'OrganizationOverview'>;

export default function OrganizationOverviewScreen({ navigation }: Props) {
    const { currentOrganization, orgOverview } = useEnterprise();

    return (
        <Screen>
            <View style={styles.hero}>
                <Text style={styles.kicker}>Organization Dashboard</Text>
                <Text style={styles.title}>{currentOrganization?.name || 'Organization'}</Text>
                <Text style={styles.subtitle}>{currentOrganization?.industry || 'Operational summary'}</Text>
            </View>

            <View style={styles.stats}>
                <StatCard label="Active Entities" value={orgOverview?.active_entities ?? 0} />
                <StatCard label="Jurisdictions" value={orgOverview?.active_jurisdictions ?? 0} />
                <StatCard label="Pending Tax Returns" value={orgOverview?.pending_tax_returns ?? 0} />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Quick Actions</Text>
                <Pressable style={styles.action} onPress={() => navigation.navigate('BusinessSuites')}>
                    <Text style={styles.actionTitle}>Manage Business Suites</Text>
                    <Text style={styles.actionCopy}>See every entity and workspace-linked business suite in one place.</Text>
                </Pressable>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    hero: { gap: 8 },
    kicker: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    title: { color: colors.ink, fontSize: 30, fontWeight: '800' },
    subtitle: { color: colors.muted, fontSize: 15 },
    stats: { gap: 12 },
    card: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.line, padding: 18 },
    cardTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', marginBottom: 12 },
    action: { backgroundColor: colors.surfaceAlt, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 6 },
    actionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
    actionCopy: { color: colors.muted, fontSize: 13, lineHeight: 20 },
});