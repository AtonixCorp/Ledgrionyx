import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing fields', 'Enter both email and password.');
            return;
        }

        setSubmitting(true);
        const result = await login(email, password);
        setSubmitting(false);

        if (!result.success) {
            Alert.alert('Login failed', result.error || 'Unable to sign in.');
        }
    };

    return (
        <Screen scroll={false}>
            <View style={styles.hero}>
                <Text style={styles.kicker}>Ledgrionyx Mobile</Text>
                <Text style={styles.title}>iOS native control layer</Text>
                <Text style={styles.subtitle}>Sign in with the same credentials you use for the web console.</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Sign In</Text>
                <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Email"
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    secureTextEntry
                    placeholder="Password"
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />
                <Pressable style={styles.button} onPress={handleLogin} disabled={submitting}>
                    <Text style={styles.buttonText}>{submitting ? 'Signing in…' : 'Sign In'}</Text>
                </Pressable>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    hero: {
        marginTop: 40,
        gap: 10,
    },
    kicker: {
        color: colors.accent,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        color: colors.ink,
        fontSize: 34,
        fontWeight: '800',
    },
    subtitle: {
        color: colors.muted,
        fontSize: 15,
        lineHeight: 22,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.line,
        marginTop: 28,
        padding: 20,
        gap: 12,
    },
    cardTitle: {
        color: colors.ink,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.surfaceAlt,
        borderColor: colors.line,
        borderRadius: 14,
        borderWidth: 1,
        color: colors.ink,
        fontSize: 16,
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    button: {
        alignItems: 'center',
        backgroundColor: colors.accent,
        borderRadius: 14,
        marginTop: 8,
        paddingVertical: 14,
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
    },
});