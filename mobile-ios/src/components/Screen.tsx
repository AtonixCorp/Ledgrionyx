import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export default function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
    const body = scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>{children}</ScrollView>
    ) : (
        <View style={styles.scrollContent}>{children}</View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            {body}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
        gap: 16,
    },
});