import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Datum = {
    label: string;
    value: number;
    tone?: string;
};

export default function MiniBarChart({ title, data }: { title: string; data: Datum[] }) {
    const maxValue = Math.max(...data.map((item) => item.value), 1);

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.rows}>
                {data.map((item) => (
                    <View key={item.label} style={styles.row}>
                        <View style={styles.rowHeader}>
                            <Text style={styles.label}>{item.label}</Text>
                            <Text style={styles.value}>{item.value}</Text>
                        </View>
                        <View style={styles.track}>
                            <View
                                style={[
                                    styles.fill,
                                    {
                                        width: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 14 : 0)}%`,
                                        backgroundColor: item.tone || colors.accent,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.line,
        padding: 18,
        gap: 14,
    },
    title: {
        color: colors.ink,
        fontSize: 18,
        fontWeight: '800',
    },
    rows: {
        gap: 12,
    },
    row: {
        gap: 6,
    },
    rowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        color: colors.muted,
        fontSize: 13,
        fontWeight: '700',
    },
    value: {
        color: colors.ink,
        fontSize: 13,
        fontWeight: '800',
    },
    track: {
        height: 10,
        backgroundColor: colors.surfaceAlt,
        borderRadius: 999,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 999,
    },
});