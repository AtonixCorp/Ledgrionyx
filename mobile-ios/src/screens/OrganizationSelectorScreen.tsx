import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import { useEnterprise } from '../context/EnterpriseContext';
import { colors } from '../theme/colors';
import type { Organization } from '../types/api';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'OrganizationSelector'>;

function OrganizationCard({ item, onOpen }: { item: Organization; onOpen: () => void }) {
    return (
        <Pressable style={styles.card} onPress={onOpen}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.industry || 'Organization'}</Text>
            <View style={styles.grid}>
                <View style={styles.field}><Text style={styles.fieldLabel}>Country</Text><Text style={styles.fieldValue}>{item.primary_country || 'Not set'}</Text></View>
                <View style={styles.field}><Text style={styles.fieldLabel}>Currency</Text><Text style={styles.fieldValue}>{item.primary_currency || 'USD'}</Text></View>
                <View style={styles.field}><Text style={styles.fieldLabel}>Email</Text><Text style={styles.fieldValue}>{item.email || item.owner_email || 'Not set'}</Text></View>
                <View style={styles.field}><Text style={styles.fieldLabel}>Employees</Text><Text style={styles.fieldValue}>{item.employee_count ?? 'Not set'}</Text></View>
            </View>
        </Pressable>
    );
}

export default function OrganizationSelectorScreen({ navigation }: Props) {
    const { organizations, selectOrganization } = useEnterprise();

    return (
        <Screen>
            <Text style={styles.header}>Choose an organization</Text>
            <FlatList<Organization>
                data={organizations}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <OrganizationCard
                        item={item}
                        onOpen={async () => {
                            await selectOrganization(item);
                            navigation.navigate('OrganizationOverview');
                        }}
                    />
                )}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                scrollEnabled={false}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: { color: colors.ink, fontSize: 28, fontWeight: '800', marginBottom: 8 },
    card: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.line, padding: 18, gap: 12 },
    cardTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
    cardSubtitle: { color: colors.muted, fontSize: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    field: { backgroundColor: colors.surfaceAlt, borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 12, width: '48%' },
    fieldLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    fieldValue: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 4 },
});