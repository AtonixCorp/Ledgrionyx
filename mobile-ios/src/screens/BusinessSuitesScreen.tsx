import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { useEnterprise } from '../context/EnterpriseContext';
import { colors } from '../theme/colors';
import type { Entity } from '../types/api';

function BusinessSuiteRow({ item }: { item: Entity }) {
    return (
        <View style={styles.row}>
            <View style={styles.rowTop}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <View style={styles.statusBadge}><Text style={styles.statusText}>{item.status || 'active'}</Text></View>
            </View>
            <Text style={styles.rowMeta}>{[item.country, item.entity_type, item.local_currency].filter(Boolean).join(' · ') || 'No metadata'}</Text>
            {item.next_filing_date ? <Text style={styles.rowMeta}>Next filing: {item.next_filing_date}</Text> : null}
        </View>
    );
}

export default function BusinessSuitesScreen() {
    const { entities, currentOrganization } = useEnterprise();

    return (
        <Screen>
            <Text style={styles.header}>Business Suites</Text>
            <Text style={styles.subheader}>{currentOrganization?.name || 'Organization'} · entity and workspace layer</Text>
            <FlatList
                data={entities}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => <BusinessSuiteRow item={item} />}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                scrollEnabled={false}
                ListEmptyComponent={<Text style={styles.empty}>No business suites loaded yet.</Text>}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: { color: colors.ink, fontSize: 28, fontWeight: '800' },
    subheader: { color: colors.muted, fontSize: 14, marginBottom: 12 },
    row: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 18, gap: 8 },
    rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    rowTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', flex: 1 },
    rowMeta: { color: colors.muted, fontSize: 13 },
    statusBadge: { backgroundColor: 'rgba(15, 157, 88, 0.12)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
    statusText: { color: colors.success, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    empty: { color: colors.muted, fontSize: 14, marginTop: 16 },
});