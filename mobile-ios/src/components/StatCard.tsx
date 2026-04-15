import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function StatCard({ label, value, caption }: { label: string; value: string | number; caption?: string }) {
    return (
        <View style={styles.card}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
            {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.line,
        padding: 16,
        gap: 8,
    },
    label: {
        color: colors.muted,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    value: {
        color: colors.ink,
        fontSize: 26,
        fontWeight: '800',
    },
    caption: {
        color: colors.muted,
        fontSize: 13,
    },
});